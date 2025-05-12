import React, { useState, useEffect } from "react";
import { Container, Row, Col, Card, Button, Alert, ProgressBar } from "react-bootstrap";
import { Link } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import driverService from "../services/api";

const DriverIntroVideo = () => {
  const { currentDriver } = useAuth();
  const [videoUrl, setVideoUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchDriverVideo();
  }, [currentDriver]);

  const fetchDriverVideo = async () => {
    if (!currentDriver || !currentDriver._id) {
      setLoading(false);
      return;
    }

    try {
      const response = await driverService.getDriverVideo(currentDriver._id);
      setVideoUrl(response.data.videoUrl || "");
      setError(null);
    } catch (err) {
      console.error("Error fetching driver video:", err);
      setError("Could not load driver introduction video");
    } finally {
      setLoading(false);
    }
  };

  const handleVideoUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('video/')) {
      setError('Please upload a valid video file (e.g., .mp4, .mov). Image files are not allowed.');
      event.target.value = null; // Clear the input
      return;
    }

    // Clear error if a valid video is selected
    setError(null);

    // Validate file size (50MB limit)
    if (file.size > 50 * 1024 * 1024) {
      setError('Video file size should be less than 50MB');
      event.target.value = null; // Clear the input
      return;
    }

    const formData = new FormData();
    formData.append('video', file);

    try {
      setUploading(true);
      setUploadProgress(0);

      const response = await driverService.uploadDriverVideo(currentDriver._id, formData, {
        onUploadProgress: (progressEvent) => {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(progress);
        }
      });

      setVideoUrl(response.data.videoUrl);
      setError(null);
    } catch (err) {
      console.error("Error uploading video:", err);
      setError("Failed to upload video. Please try again.");
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  if (loading) {
    return (
      <Container className="text-center py-5">
        <p>Loading video...</p>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      <Row className="justify-content-center">
        <Col md={10} lg={8}>
          <Card className="shadow">
            <Card.Body>
              <Card.Title className="mb-4">
                Driver Introduction Video
              </Card.Title>

              {error && <Alert variant="danger">{error}</Alert>}

              {!error && !videoUrl && (
                <Alert variant="info">
                  No introduction video has been uploaded yet.
                </Alert>
              )}

              {videoUrl && (
                <div className="ratio ratio-16x9 mb-4">
                  <video
                    src={videoUrl}
                    controls
                    className="w-100"
                    title="Driver Introduction Video"
                  />
                </div>
              )}

              <div className="mb-4">
                <input
                  type="file"
                  accept="video/*"
                  onChange={handleVideoUpload}
                  disabled={uploading}
                  className="form-control"
                />
                {uploading && (
                  <ProgressBar 
                    now={uploadProgress} 
                    label={`${uploadProgress}%`} 
                    className="mt-2" 
                  />
                )}
              </div>

              <Card.Text className="mt-3">
                <div>
                  <p>
                    Your introduction video helps customers get to know you before
                    they book a ride. A good introduction video should:
                  </p>
                  <ul>
                    <li>Be 30-60 seconds long</li>
                    <li>Show your face clearly</li>
                    <li>Introduce yourself and your experience</li>
                    <li>
                      Highlight your driving philosophy and customer service
                      approach
                    </li>
                    <li>Be filmed in a well-lit, quiet environment</li>
                  </ul>
                </div>
              </Card.Text>

              <div className="d-flex justify-content-between mt-4">
                <Button as={Link} to="/dashboard" variant="secondary">
                  Back to Dashboard
                </Button>
                <Button as={Link} to="/profile" variant="primary">
                  View Profile
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default DriverIntroVideo;
