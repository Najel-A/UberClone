import React, { useState, useEffect } from "react";
import { Container, Row, Col, Card, Button, Alert } from "react-bootstrap";
import { Link } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import driverService from "../services/api";

const DriverIntroVideo = () => {
  const { currentDriver } = useAuth();
  const [videoUrl, setVideoUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
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

    fetchDriverVideo();
  }, [currentDriver]);

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
                  <iframe
                    src={videoUrl}
                    title="Driver Introduction Video"
                    allowFullScreen
                  ></iframe>
                </div>
              )}

              <Card.Text className="mt-3">
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
