import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import jsPDF from 'jspdf';

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

    // Fetch driver name if possible
    let driverName = '';
    if (rideForBill.driverId) {
      try {
        const res = await axios.get(`${process.env.REACT_APP_DRIVER_SERVICE_URL}/api/drivers/${rideForBill.driverId}`);
        driverName = `${res.data.firstName || res.data.firstname || ''} ${res.data.lastName || res.data.lastname || ''}`.trim();
      } catch (e) {
        driverName = rideForBill.driverId;
      }
    }
    const customerName = userProfile.firstName || userProfile.firstname || userProfile.name || 'N/A';
    const customerLastName = userProfile.lastName || userProfile.lastname || '';
    const cardNumber = userProfile.creditCardDetails?.cardNumber || userProfile.cardNumber || '';
    const last4 = cardNumber ? cardNumber.slice(-4) : 'N/A';
    const doc = new jsPDF();

    // Header
    doc.setFontSize(18);
    doc.setTextColor(80, 80, 200);
    doc.setFont('helvetica', 'bold');
    doc.text('Thanks for riding Uber!', 10, 15);

    // Customer and trip info
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'normal');
    doc.text(`Billed To:`, 10, 25, { maxWidth: 40 });
    doc.setFont('helvetica', 'bold');
    doc.text(`${customerName} ${customerLastName}`, 40, 25);
    doc.setFont('helvetica', 'normal');
    doc.text(`Trip Date:`, 10, 32); doc.text(`${new Date(rideForBill.dateTime).toLocaleString()}`, 40, 32);
    doc.text(`Pickup Location:`, 10, 39); doc.text(`${rideForBill.pickupLocation?.address || ''}`, 40, 39);
    doc.text(`Dropoff Location:`, 10, 46); doc.text(`${rideForBill.dropoffLocation?.address || ''}`, 40, 46);
    doc.text(`Credit Card:`, 10, 53); doc.text(`**** **** **** ${last4}`, 40, 53);
    doc.text(`Driver:`, 10, 60); doc.text(`${driverName || rideForBill.driverId || 'N/A'}`, 40, 60);

    // Section background for total
    doc.setFillColor(240, 240, 255);
    doc.rect(8, 65, 60, 20, 'F');
    doc.setFontSize(16);
    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'normal');
    doc.text(`Billed to Card`, 10, 75);
    doc.setFontSize(22);
    doc.setTextColor(0, 0, 180);
    doc.setFont('helvetica', 'bold');
    doc.text(`$${rideForBill.price?.toFixed(2) || 'N/A'}`, 10, 85);

    // Line separator
    doc.setDrawColor(150);
    doc.line(10, 90, 200, 90);

    // Fare Breakdown
    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'bold');
    doc.text('Fare Breakdown', 10, 100);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(12);
    let y = 108;
    doc.text('Base Fare:', 12, y); doc.text('$7.00', 60, y, { align: 'right' });
    y += 7;
    doc.text('Distance:', 12, y); doc.text('$8.84', 60, y, { align: 'right' });
    y += 7;
    doc.text('Time:', 12, y); doc.text('$9.00', 60, y, { align: 'right' });
    y += 7;
    doc.text('Rounding Down:', 12, y); doc.text('($0.90)', 60, y, { align: 'right' });
    y += 7;
    doc.text('Discount subtotal:', 12, y); doc.text('($0.90)', 60, y, { align: 'right' });
    y += 10;
    doc.setFont('helvetica', 'bold');
    doc.text('Total Fare:', 12, y); doc.text(`$${rideForBill.price?.toFixed(2) || 'N/A'}`, 60, y, { align: 'right' });

    // Trip Statistics
    y = 100;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text('Trip Statistics', 120, y);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(12);
    y += 8;
    doc.text('Distance:', 122, y); doc.text(`${rideForBill.distanceCovered?.toFixed(2) || 'N/A'} miles`, 170, y, { align: 'right' });

    doc.save('Uber_Ride_Receipt.pdf');
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
            <div className="confirmation-section">
              <h3>Ride Completed!</h3>
              <p>Thank you for riding with us.</p>
              <button onClick={handleDownloadBill} style={{marginTop: 16}}>
                Download Bill (PDF)
              </button>
            </div>
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