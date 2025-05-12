import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import jsPDF from 'jspdf';
import { submitDriverReview } from '../customer/customerAPI';

const RideInProgress = () => {
  const user = useSelector((state) => state.user.user);
  const selectedRide = useSelector((state) => state.ride.selectedRide);
  const navigate = useNavigate();
  const [distanceCovered, setDistanceCovered] = useState(0);
  const [totalDistance, setTotalDistance] = useState(1); // Avoid division by zero
  const [status, setStatus] = useState('in_progress');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [completeMsg, setCompleteMsg] = useState('');
  const [latestRide, setLatestRide] = useState(null);
  const [showReview, setShowReview] = useState(true);
  const [reviewText, setReviewText] = useState('');
  const [rating, setRating] = useState(5);
  const [reviewSuccess, setReviewSuccess] = useState('');
  const [reviewError, setReviewError] = useState('');
  const [images, setImages] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState('');
  const [uploadError, setUploadError] = useState('');

  console.log('DRIVER SERVICE URL:', process.env.REACT_APP_DRIVER_SERVICE_URL);

  useEffect(() => {
    if (!user || !selectedRide || !selectedRide._id) {
      navigate('/dashboard');
      return;
    }
    setTotalDistance(selectedRide.distanceCovered || 1);
    let interval;
    const pollRide = async () => {
      try {
        const res = await axios.get(`${process.env.REACT_APP_RIDE_SERVICE_URL}/api/rides/${selectedRide._id}`);
        setDistanceCovered(res.data.distanceCovered || 0);
        setStatus(res.data.status);
        setLoading(false);
        if (res.data.status === 'completed') {
          clearInterval(interval);
          setLatestRide(res.data);
        }
      } catch (err) {
        setError('Failed to fetch ride progress');
        setLoading(false);
        clearInterval(interval);
      }
    };
    pollRide();
    interval = setInterval(pollRide, 2000);
    return () => clearInterval(interval);
  }, [user, selectedRide, navigate]);

  const handleCompleteRide = async () => {
    setCompleteMsg('');
    try {
      await axios.post(`${process.env.REACT_APP_RIDE_SERVICE_URL}/api/rides/rideCompleted`, selectedRide);
      setCompleteMsg('Ride completion event sent!');
    } catch (err) {
      setCompleteMsg('Failed to complete ride');
    }
  };

  const getBase64ImageFromUrl = async (imageUrl) => {
    const response = await fetch(imageUrl);
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  const handleDownloadBill = async () => {
    const rideForBill = latestRide || selectedRide;
    // Fetch the latest user profile for card details
    let userProfile = user;
    try {
      const response = await axios.get('http://localhost:3000/api/customers');
      const customer = response.data.find(c => c._id === user.id);
      if (customer) {
        userProfile = customer;
      }
    } catch (err) {}

    // Fetch driver name and image if possible
    let driverName = '';
    let driverImageUrl = '';
    if (rideForBill.driverId) {
      try {
        const res = await axios.get(`${process.env.REACT_APP_DRIVER_SERVICE_URL}/api/drivers/${rideForBill.driverId}`);
        driverName = `${res.data.firstName || res.data.firstname || ''} ${res.data.lastName || res.data.lastname || ''}`.trim();
        if (res.data.profilePicture) {
          driverImageUrl = res.data.profilePicture.startsWith('http')
            ? res.data.profilePicture
            : `${process.env.REACT_APP_DRIVER_SERVICE_URL}${res.data.profilePicture}`;
        }
      } catch (e) {
        driverName = rideForBill.driverId;
        driverImageUrl = '';
      }
    }
    const customerName = userProfile.firstName || userProfile.firstname || userProfile.name || 'N/A';
    const customerLastName = userProfile.lastName || userProfile.lastname || '';
    const cardNumber = userProfile.creditCardDetails?.cardNumber || userProfile.cardNumber || '';
    const last4 = cardNumber ? cardNumber.slice(-4) : 'N/A';
    const doc = new jsPDF();

    // Header and driver image
    doc.setFontSize(20);
    doc.setTextColor(80, 80, 200);
    doc.setFont('helvetica', 'bold');
    doc.text('Thanks for riding Uber!', 15, 20);

    // Add driver image in a box if available
    if (driverImageUrl) {
      try {
        const base64Image = await getBase64ImageFromUrl(driverImageUrl);
        // Draw a subtle border box for the image
        doc.setDrawColor(180);
        doc.setLineWidth(0.2);
        doc.rect(155, 10, 40, 40, 'S');
        doc.addImage(base64Image, 'JPEG', 157, 12, 36, 36); // Centered in the box
      } catch (e) {
        // Ignore image errors
      }
    }

    // Customer and trip info section
    let y = 30;
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'normal');
    doc.text(`Billed To:`, 15, y);
    doc.setFont('helvetica', 'bold');
    doc.text(`${customerName} ${customerLastName}`, 45, y);
    y += 8;
    doc.setFont('helvetica', 'normal');
    doc.text(`Trip Date:`, 15, y); doc.text(`${new Date(rideForBill.dateTime).toLocaleString()}`, 45, y);
    y += 8;
    doc.text(`Pickup Location:`, 15, y); doc.text(`${rideForBill.pickupLocation?.address || ''}`, 45, y);
    y += 8;
    doc.text(`Dropoff Location:`, 15, y); doc.text(`${rideForBill.dropoffLocation?.address || ''}`, 45, y);
    y += 8;
    doc.text(`Credit Card:`, 15, y); doc.text(`**** **** **** ${last4}`, 45, y);
    y += 8;
    doc.text(`Driver:`, 15, y); doc.text(`${driverName || rideForBill.driverId || 'N/A'}`, 45, y);

    // Section background for total
    y += 12;
    doc.setFillColor(240, 240, 255);
    doc.roundedRect(12, y, 70, 22, 4, 4, 'F');
    doc.setFontSize(16);
    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'normal');
    doc.text(`Billed to Card`, 18, y + 10);
    doc.setFontSize(22);
    doc.setTextColor(0, 0, 180);
    doc.setFont('helvetica', 'bold');
    doc.text(`$${rideForBill.price?.toFixed(2) || 'N/A'}`, 18, y + 20);

    // Line separator
    y += 28;
    doc.setDrawColor(150);
    doc.line(15, y, 195, y);

    // Fare Breakdown
    y += 10;
    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'bold');
    doc.text('Fare Breakdown', 15, y);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(12);
    let fareY = y + 8;
    doc.text('Base Fare:', 18, fareY); doc.text('$7.00', 70, fareY, { align: 'right' });
    fareY += 7;
    doc.text('Distance:', 18, fareY); doc.text('$8.84', 70, fareY, { align: 'right' });
    fareY += 7;
    doc.text('Time:', 18, fareY); doc.text('$9.00', 70, fareY, { align: 'right' });
    fareY += 7;
    doc.text('Rounding Down:', 18, fareY); doc.text('($0.90)', 70, fareY, { align: 'right' });
    fareY += 7;
    doc.text('Discount subtotal:', 18, fareY); doc.text('($0.90)', 70, fareY, { align: 'right' });
    fareY += 10;
    doc.setFont('helvetica', 'bold');
    doc.text('Total Fare:', 18, fareY); doc.text(`$${rideForBill.price?.toFixed(2) || 'N/A'}`, 70, fareY, { align: 'right' });

    // Trip Statistics
    let statsY = y;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text('Trip Statistics', 120, statsY);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(12);
    statsY += 8;
    doc.text('Distance:', 122, statsY); doc.text(`${rideForBill.distanceCovered?.toFixed(2) || 'N/A'} miles`, 170, statsY, { align: 'right' });

    doc.save('Uber_Ride_Receipt.pdf');
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    setReviewError('');
    setReviewSuccess('');
    try {
      const ride = latestRide || selectedRide;
      await submitDriverReview(ride.driverId, rating, reviewText);
      setReviewSuccess('Thank you for your feedback!');
      setShowReview(false);
    } catch (err) {
      setReviewError('Failed to submit review. Please try again.');
    }
  };

  const handleImageChange = (e) => {
    setImages([...e.target.files]);
  };

  const handleUpload = async () => {
    if (!images.length) return;
    const formData = new FormData();
    images.forEach((img) => formData.append('images', img));
    setUploading(true);
    setUploadSuccess('');
    setUploadError('');
    try {
      const rideId = (latestRide || selectedRide)._id;
      await axios.post(`${process.env.REACT_APP_RIDE_SERVICE_URL}/api/rides/${rideId}/upload-images`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setUploadSuccess('Images uploaded successfully!');
      setImages([]);
    } catch (err) {
      setUploadError('Failed to upload images.');
    }
    setUploading(false);
  };

  if (!user || !selectedRide) {
    return <div className="dashboard-card">No ride in progress.</div>;
  }

  const percent = Math.min(100, Math.round((distanceCovered / totalDistance) * 100));

  return (
    <div className="trips-container">
      <div style={{ marginBottom: 16 }}>
        <button
          style={{
            background: '#333',
            color: '#fff',
            border: 'none',
            borderRadius: '5px',
            padding: '8px 20px',
            cursor: 'pointer',
            fontSize: '16px',
            fontWeight: 'bold',
            boxShadow: '0 1px 2px rgba(0,0,0,0.1)'
          }}
          onClick={() => navigate('/dashboard')}
        >
          Home
        </button>
      </div>
      <div className="trips-card">
        <div className="trips-header">
          <h2>Ride In Progress</h2>
        </div>
        <div className="trips-content">
          {loading ? (
            <div className="loading-section">
              <p>Loading ride progress...</p>
            </div>
          ) : status === 'completed' ? (
            <>
              <div className="confirmation-section">
                <h3>Ride Completed!</h3>
                <p>Thank you for riding with us.</p>
                <button onClick={handleDownloadBill} style={{marginTop: 16}}>
                  Download Bill (PDF)
                </button>
              </div>
              <div className="image-upload-section" style={{ marginTop: 24, padding: 16, background: '#f0f0f0', borderRadius: 8 }}>
                <h3>Report an Issue (Upload Images)</h3>
                <input type="file" multiple onChange={handleImageChange} />
                <button onClick={handleUpload} disabled={uploading || !images.length} style={{ marginLeft: 8 }}>
                  {uploading ? 'Uploading...' : 'Upload Images'}
                </button>
                {uploadSuccess && <div style={{ color: 'green', marginTop: 8 }}>{uploadSuccess}</div>}
                {uploadError && <div style={{ color: 'red', marginTop: 8 }}>{uploadError}</div>}
              </div>
              {showReview && (
                <div className="review-section" style={{ marginTop: 24, padding: 16, background: '#f8f9fa', borderRadius: 8 }}>
                  <h3>Rate Your Driver</h3>
                  <form onSubmit={handleSubmitReview}>
                    <div style={{ marginBottom: 12 }}>
                      <label>Rating: </label>
                      <select value={rating} onChange={e => setRating(Number(e.target.value))} style={{ marginLeft: 8 }}>
                        {[5,4,3,2,1].map(val => (
                          <option key={val} value={val}>{val}</option>
                        ))}
                      </select>
                    </div>
                    <div style={{ marginBottom: 12 }}>
                      <label>Review: </label>
                      <textarea
                        value={reviewText}
                        onChange={e => setReviewText(e.target.value)}
                        rows={3}
                        style={{ width: '100%', borderRadius: 4, border: '1px solid #ccc', padding: 8 }}
                        placeholder="Share your experience..."
                      />
                    </div>
                    <button type="submit" style={{ background: '#000', color: '#fff', border: 'none', borderRadius: 4, padding: '8px 20px', cursor: 'pointer', fontWeight: 'bold' }}>
                      Submit Review
                    </button>
                    {reviewSuccess && <div style={{ color: 'green', marginTop: 8 }}>{reviewSuccess}</div>}
                    {reviewError && <div style={{ color: 'red', marginTop: 8 }}>{reviewError}</div>}
                  </form>
                </div>
              )}
            </>
          ) : (
            <>
              <div style={{ margin: '30px 0' }}>
                <div style={{
                  height: '30px',
                  width: '100%',
                  backgroundColor: '#e0e0de',
                  borderRadius: '10px',
                  overflow: 'hidden',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.1)'
                }}>
                  <div style={{
                    height: '100%',
                    width: `${Math.min(100, Math.round((distanceCovered / totalDistance) * 100))}%`,
                    backgroundColor: '#007bff',
                    transition: 'width 0.5s',
                    borderRadius: '10px 0 0 10px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontWeight: 'bold'
                  }}>
                    {`${Math.min(100, Math.round((distanceCovered / totalDistance) * 100))}%`}
                  </div>
                </div>
              </div>
              <div className="ride-details">
                <div className="detail-item">
                  <span className="label">Pickup:</span>
                  <span className="value">{selectedRide.pickupLocation?.address}</span>
                </div>
                <div className="detail-item">
                  <span className="label">Dropoff:</span>
                  <span className="value">{selectedRide.dropoffLocation?.address}</span>
                </div>
                <div className="detail-item">
                  <span className="label">Distance Covered:</span>
                  <span className="value">{distanceCovered.toFixed(2)} / {totalDistance.toFixed(2)} miles</span>
                </div>
              </div>
              <button
                style={{
                  marginTop: 24,
                  background: '#007bff',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '5px',
                  padding: '10px 24px',
                  cursor: 'pointer',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.1)'
                }}
                onClick={handleCompleteRide}
              >
                Complete Ride
              </button>
              {completeMsg && <div style={{ marginTop: 12, color: completeMsg.includes('Failed') ? 'red' : 'green' }}>{completeMsg}</div>}
            </>
          )}
          {error && <div className="alert alert-danger">{error}</div>}
        </div>
      </div>
    </div>
  );
};

export default RideInProgress; 