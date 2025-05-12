import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import jsPDF from 'jspdf';
import { submitDriverReview } from '../customer/customerAPI';
import '../styles/RideInProgress.css';
import { clearSelectedRide } from '../slices/rideSlice';

const RideInProgress = () => {
  const user = useSelector((state) => state.user.user);
  const selectedRide = useSelector((state) => state.ride.selectedRide);
  const navigate = useNavigate();
  const dispatch = useDispatch();
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
  const [description, setDescription] = useState('');

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

    // Header
    doc.setFontSize(24);
    doc.setTextColor(80, 80, 200);
    doc.setFont('helvetica', 'bold');
    doc.text('Thanks for riding Uber!', 15, 25);

    // Draw driver image on the right
    let imageY = 20;
    if (driverImageUrl) {
      try {
        const base64Image = await getBase64ImageFromUrl(driverImageUrl);
        doc.setDrawColor(180);
        doc.setLineWidth(0.2);
        doc.rect(150, imageY - 5, 45, 45, 'S');
        doc.addImage(base64Image, 'JPEG', 153, imageY - 2, 39, 39);
      } catch (e) {}
    }

    // Customer and trip info section (left column)
    let y = 40;
    doc.setFontSize(13);
    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'normal');
    doc.text('Billed To:', 15, y);
    doc.setFont('helvetica', 'bold');
    doc.text(`${customerName} ${customerLastName}`, 50, y);
    y += 8;
    doc.setFont('helvetica', 'normal');
    doc.text('Trip Date:', 15, y);
    doc.text(`${new Date(rideForBill.dateTime).toLocaleString()}`, 50, y);
    y += 8;
    doc.text('Pickup Location:', 15, y);
    doc.text(`${rideForBill.pickupLocation?.address || ''}`, 50, y);
    y += 8;
    doc.text('Dropoff Location:', 15, y);
    doc.text(`${rideForBill.dropoffLocation?.address || ''}`, 50, y);
    y += 8;
    doc.text('Credit Card:', 15, y);
    doc.text(`**** **** **** ${last4}`, 50, y);
    y += 8;
    doc.text('Driver:', 15, y);
    doc.text(`${driverName || rideForBill.driverId || 'N/A'}`, 50, y);

    // Billed to Card section
    y += 20;
    doc.setFillColor(230, 230, 255);
    doc.roundedRect(15, y, 90, 32, 10, 10, 'F');
    doc.setFontSize(18);
    doc.setTextColor(40, 40, 120);
    doc.setFont('helvetica', 'bold');
    doc.text('Billed to Card', 25, y + 12);
    doc.setFontSize(24);
    doc.setTextColor(60, 60, 200);
    const billedToCard = rideForBill.price || subtotal;
    doc.text(billedToCard.toFixed(2), 25, y + 26);

    // Proportional fare breakdown to match billed to card
    const baseFare = 3.00;
    const distanceFare = (rideForBill.distanceCovered || 0) * 1.5;
    const serviceFee = 2.00;
    const subtotal = baseFare + distanceFare + serviceFee;
    const scale = subtotal > 0 ? billedToCard / subtotal : 1;
    const baseFareScaled = baseFare * scale;
    const distanceFareScaled = distanceFare * scale;
    const serviceFeeScaled = serviceFee * scale;

    y += 45;
    doc.setFontSize(15);
    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'bold');
    doc.text('Fare Breakdown', 15, y);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(12);
    let fareY = y + 8;
    doc.text('Base Fare:', 18, fareY); doc.text(`$${baseFareScaled.toFixed(2)}`, 70, fareY, { align: 'right' });
    fareY += 7;
    doc.text('Distance:', 18, fareY); doc.text(`$${distanceFareScaled.toFixed(2)}`, 70, fareY, { align: 'right' });
    fareY += 7;
    doc.text('Service Fee:', 18, fareY); doc.text(`$${serviceFeeScaled.toFixed(2)}`, 70, fareY, { align: 'right' });
    fareY += 3;
    doc.setFont('helvetica', 'bold');
    doc.text('Total Fare:', 18, fareY); doc.text(`$${billedToCard.toFixed(2)}`, 70, fareY, { align: 'right' });

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
    formData.append('description', description);
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
      setDescription('');
    } catch (err) {
      setUploadError('Failed to upload images.');
    }
    setUploading(false);
  };

  const handleNavigateHome = () => {
    dispatch(clearSelectedRide());
    navigate('/dashboard');
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
          onClick={handleNavigateHome}
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
                <textarea
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Describe the issue..."
                  rows={3}
                  style={{ width: '100%', marginBottom: 8, borderRadius: 4, border: '1px solid #ccc', padding: 8 }}
                />
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