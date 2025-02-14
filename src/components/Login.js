import React, { useState } from "react";
import { Alert, Col, Container, Row } from "react-bootstrap";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
// import { useNavigate } from "react-router-dom";
import authApi from "../api/authApi";
import WhatsAppAPI from "../api/WhatsAppAPI";
import * as constants from '../constants/CONSTANT';

const Login = () => {
  // const navigate = useNavigate();
  const [credentials, setCredentials] = useState({ email: "", password: "", tcode: "" });
  const [show, setShow] = React.useState(false);
  const [errorMessage, setErrorMessage] = useState();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const [showPassword, setShowPassword] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (credentials.email && credentials.password && credentials.tcode) {
      const result = await authApi.login(credentials);

      if (result.success) {
       sessionStorage.setItem("token", result.authToken);
       sessionStorage.setItem("r-t", result.refreshToken);

        let data = '';
        if (data)
          sessionStorage.setItem("myimage", window.URL.createObjectURL(data));
        else
          sessionStorage.setItem("myimage", "/abdul-pathan.png");

        let settingResult = await WhatsAppAPI.fetchCompanySetting('lead_status_setting');
        if (settingResult && settingResult.setting) {
          sessionStorage.setItem('lead_status', settingResult.setting.configuration);
        } else {
          sessionStorage.setItem('lead_status', JSON.stringify(constants.LEAD_STATUS_VALUES));
        }
        sessionStorage.setItem('selectedWhatsAppSetting', '');

        // navigate("/");
        window.location.assign('/')
        // navigate("/", { state: { result: 'refresh_EmployeeName' } });


      } else {
        setShow(true);
        setErrorMessage(result.errors);
      }
    }
  };

  const handleChange = (e) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
  };

  const isFormValid = Boolean(credentials.password?.trim()) && Boolean(credentials.tcode?.trim()) && Boolean(credentials.email?.trim()) && emailRegex.test(credentials.email);


  return (
    <Container>
      <Row className="login-form p-3 mt-5">
        <Col lg={6} className="pt-5">
          <img src="login.jpg" style={{ width: "100%" }} alt="" />

        </Col>
        <Col lg={6} className="login-section">
          <center></center>
          <div className="p-5 pt-4">
            <Form onSubmit={handleSubmit}>
              <div className="mt-2 text-center mb-3">
                <img
                  src="logo.png"
                  style={{ width: "120px" }}
                  className="" alt="/"
                />
                <h3 className="mb-2">Login</h3>
              </div>
              <Alert variant="danger" show={show} className="error-alert mb-3">
                {errorMessage}
              </Alert>
              <Form.Group className="mb-3">
                <Form.Label>Company Name</Form.Label>
                <Form.Control
                  required
                  style={{ height: '36px' }}
                  type="text"
                  name="tcode"
                  onChange={handleChange}
                  placeholder="Enter your company name"
                  value={credentials.tcode}
                  autoComplete="code"
                />
              </Form.Group>
              <Form.Group className="mb-3" controlId="formBasicEmail">
                <Form.Label>Email address</Form.Label>
                <Form.Control
                  required
                  style={{ height: '36px' }}
                  type="email"
                  name="email"
                  onChange={handleChange}
                  placeholder="Enter your email address"
                  value={credentials.email}
                  autoComplete="username"
                />
              </Form.Group>

              <Form.Group className="mb-3" controlId="formBasicPassword">
                <Form.Label>Password</Form.Label>
                <div className="d-flex align-items-center position-relative">
                  <Form.Control
                    required
                    style={{ height: '36px' }}
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    onChange={handleChange}
                    placeholder="Enter your password"
                    value={credentials.password}
                    autoComplete="current-password"
                  />
                  <span
                    className="position-absolute end-0 me-3"
                    onClick={togglePasswordVisibility}
                    style={{ cursor: "pointer" }}
                  >
                    <i className={`fa ${!showPassword ? 'fa-eye-slash' : 'fa-eye'} text-secondary`} aria-hidden="true"></i>
                  </span>
                </div>
              </Form.Group>
              <Button variant="primary" disabled={!isFormValid} type="submit">
                Login
              </Button>
            </Form>
            <div className="pt-4 text-center">
              {/* or Login with */}
              <div className="pt-4">
                <a href="/#">
                  <span className="fa-stack fa-2x">
                    <i
                      className="fa-solid fa-circle fa-stack-2x"
                      style={{ color: "#3b5998", fontSize: "4rem" }}
                    ></i>
                    <i className="fa-brands fa-facebook-f fa-stack-1x" style={{ color: "#fff", fontSize: "2rem" }}></i>
                  </span>
                </a>
                <a href="/#">
                  <span className="fa-stack fa-2x">
                    <i
                      className="fa-solid fa-circle fa-stack-2x"
                      style={{ color: "tomato", fontSize: "4rem" }}
                    ></i>
                    <i className="fa-brands fa-google fa-stack-1x" style={{ color: "#fff", fontSize: "2rem" }}></i>
                  </span>
                </a>
                <a href="/#">
                  <span className="fa-stack fa-2x">
                    <i
                      className="fa-solid fa-circle fa-stack-2x"
                      style={{ color: "#0d95e8", fontSize: "4rem" }}
                    ></i>
                    <i className="fa-brands fa-twitter fa-stack-1x" style={{ color: "#fff", fontSize: "2rem" }}></i>
                  </span>
                </a>
              </div>
            </div>
          </div>
        </Col>
      </Row>
      <div className="text-center">
        <h6 className="text-center mt-5"> Powered by</h6>
        <img src="logo-footer.png" width="150px" alt="" />
      </div>
    </Container>
  );
};

export default Login;