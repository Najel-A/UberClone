import React from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Navbar as BootstrapNavbar,
  Nav,
  Container,
  Button,
} from "react-bootstrap";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../redux/slices/authSlice";

const Navbar = () => {
  const dispatch = useDispatch();
  const { currentDriver, isAuthenticated } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await dispatch(logout());
    navigate("/login");
  };

  return (
    <BootstrapNavbar variant="dark" expand="lg" className="mb-4">
      <Container>
        <BootstrapNavbar.Brand as={Link} to="/">
          <svg
            width="80"
            height="24"
            viewBox="0 0 81 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M58.5357 0H55.9V11.9062C55.9 13.6139 57.0899 15 58.5357 15C59.9815 15 61.1714 13.6139 61.1714 11.9062V3.09377C61.1714 1.38609 59.9815 0 58.5357 0Z"
              fill="white"
            />
            <path
              d="M42.7083 0H40.0726C40.0726 0 40.0726 8.83307 40.0726 10.3125C40.0726 13.6139 42.7083 15 42.7083 15C44.1541 15 45.344 13.6139 45.344 11.9062V3.09377C45.344 1.38609 44.1541 0 42.7083 0Z"
              fill="white"
            />
            <path
              d="M9.94562 5.625H7.30798V18.75H9.94562V5.625Z"
              fill="white"
            />
            <path
              d="M45.3441 20.9062C45.3441 22.6139 44.1542 24 42.7084 24H34.4727C32.3059 24 30.5488 22.0612 30.5488 19.6875C30.5488 17.3138 32.3059 15.375 34.4727 15.375H39.1941C40.6399 15.375 41.8298 16.7611 41.8298 18.4688V20.9062H45.3441Z"
              fill="white"
            />
            <path
              d="M27.9113 5.625H25.2736V18.75H27.9113V15.0938V5.625Z"
              fill="white"
            />
            <path
              d="M23.0041 18.75H25.2736V15.0938H22.5256C21.0798 15.0938 19.6341 13.6639 19.6341 11.9062V5.625H16.9964V13.4251C16.9964 16.3512 19.5676 18.75 23.0041 18.75Z"
              fill="white"
            />
            <path
              d="M81 5.625H78.3623V17.1562C78.3623 18.864 77.1724 20.25 75.7266 20.25C74.2808 20.25 73.0909 18.864 73.0909 17.1562V5.625H70.4533V18.0188C70.4533 21.3202 73.0909 22.7063 75.7266 22.7063C78.3623 22.7063 81 21.3202 81 18.0188V5.625Z"
              fill="white"
            />
            <path
              d="M13.4797 0C11.313 0 9.55588 1.9388 9.55588 4.3125C9.55588 6.6862 11.313 8.625 13.4797 8.625C15.6464 8.625 17.4035 6.6862 17.4035 4.3125C17.4035 1.9388 15.6464 0 13.4797 0Z"
              fill="white"
            />
            <path
              d="M67.0285 5.625C64.8618 5.625 63.1047 7.5638 63.1047 9.9375C63.1047 12.3112 64.8618 14.25 67.0285 14.25C69.1952 14.25 70.9523 12.3112 70.9523 9.9375C70.9523 7.5638 69.1952 5.625 67.0285 5.625Z"
              fill="white"
            />
            <path
              d="M1.2636 0C0.565577 0 0 0.621936 0 1.38609C0 2.15024 0.565577 2.77217 1.2636 2.77217H3.53807C4.23609 2.77217 4.80167 2.15024 4.80167 1.38609C4.80167 0.621936 4.23609 0 3.53807 0H1.2636Z"
              fill="white"
            />
            <path
              d="M6.77427 0C6.07625 0 5.51068 0.621936 5.51068 1.38609C5.51068 2.15024 6.07625 2.77217 6.77427 2.77217H9.04875C9.74677 2.77217 10.3123 2.15024 10.3123 1.38609C10.3123 0.621936 9.74677 0 9.04875 0H6.77427Z"
              fill="white"
            />
            <path
              d="M27.2797 0C26.5817 0 26.0161 0.621936 26.0161 1.38609C26.0161 2.15024 26.5817 2.77217 27.2797 2.77217H29.5542C30.2522 2.77217 30.8178 2.15024 30.8178 1.38609C30.8178 0.621936 30.2522 0 29.5542 0H27.2797Z"
              fill="white"
            />
            <path
              d="M34.5631 0C33.8651 0 33.2995 0.621936 33.2995 1.38609C33.2995 2.15024 33.8651 2.77217 34.5631 2.77217H36.8376C37.5356 2.77217 38.1012 2.15024 38.1012 1.38609C38.1012 0.621936 37.5356 0 36.8376 0H34.5631Z"
              fill="white"
            />
          </svg>
        </BootstrapNavbar.Brand>
        <BootstrapNavbar.Toggle aria-controls="basic-navbar-nav" />
        <BootstrapNavbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            {isAuthenticated ? (
              // Links for authenticated users
              <>
                <Nav.Link as={Link} to="/dashboard">
                  Dashboard
                </Nav.Link>
                <Nav.Link as={Link} to="/profile">
                  My Profile
                </Nav.Link>
                <Nav.Link as={Link} to="/update-profile">
                  Update Profile
                </Nav.Link>
                <Nav.Link as={Link} to="/intro-video">
                  Intro Video
                </Nav.Link>
                <Nav.Link as={Link} to="/ride-history">
                  Ride History
                </Nav.Link>
              </>
            ) : (
              // Links for guests
              <>
                <Nav.Link as={Link} to="/login">
                  Login
                </Nav.Link>
                <Nav.Link as={Link} to="/signup">
                  Sign Up
                </Nav.Link>
              </>
            )}
          </Nav>

          {isAuthenticated && (
            <Nav>
              <div className="d-flex align-items-center">
                {currentDriver && (
                  <span className="text-light me-3">
                    {currentDriver.firstName || "Driver"}
                  </span>
                )}
                <Button
                  variant="outline-light"
                  size="sm"
                  onClick={handleLogout}
                >
                  Logout
                </Button>
              </div>
            </Nav>
          )}
        </BootstrapNavbar.Collapse>
      </Container>
    </BootstrapNavbar>
  );
};

export default Navbar;
