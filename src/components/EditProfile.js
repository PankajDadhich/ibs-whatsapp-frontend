import React, { useState, useRef, useEffect } from "react";
import { Button, Col, Container, Row } from "react-bootstrap";
import Card from "react-bootstrap/Card";
import Form from "react-bootstrap/Form";
import Image from 'react-bootstrap/Image'
import Modal from 'react-bootstrap/Modal';
import WhatsAppAPI from "../api/WhatsAppAPI";
import { ToastContainer, toast } from 'react-toastify'; // npm i react-toastify --force
import 'react-toastify/dist/ReactToastify.css';
import { NameInitialsAvatar } from 'react-name-initials-avatar'; // npm install react-name-initials-avatar --force
import jwt_decode from "jwt-decode";

const EditProfile = ({ userId }) => {
  const fileInputRef = useRef();
  const [profile, setProfile] = useState({
    firstname: "",
    lastname: "",
    email: "",
    phone: "",
  });
    const [body, setBody] = useState();
  const [user, setUser] = useState({ password: '', confirmpassword: '' });
  const [selectedFiles, setSelectedFiles] = useState(null);
  const { tenantcode } = jwt_decode(localStorage.getItem('token'));

  const profileImg = `/public/${tenantcode}/users`;
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const phoneRegex = /^[0-9]{10}$/;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const [emailError, setEmailError] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [brokenImages, setBrokenImages] = useState([]);

  useEffect(() => {
    async function init() {
      let result = await WhatsAppAPI.getLoginUserData();
      setProfile(result);
      setBody(profileImg + '/' + result.id);
    }
    init();
  }, []);


  const handlePasswordOnchange = (e) => {
    const { name, value } = e.target;
    if (name === 'password') {
      setPassword(value);
    } else {
      setConfirmPassword(value);
    }

    setUser({ ...user, [e.target.name]: e.target.value });
  };

  const isSubmitDisabled = () => {
    return !password || !confirmPassword || password !== confirmPassword || password.length < 8 || password.length > 16;
  };


  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'email') {
      setEmailError(!emailRegex.test(value) ? 'Invalid email format.' : '');
    }
    if (name === "phone") {
      if (!phoneRegex.test(value)) {
        setPhoneError("Phone number must be exactly 10 digits");
      } else {
        setPhoneError("");
      }
    }
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      let result = {};
      if (selectedFiles === null) {
        result = await WhatsAppAPI.saveUser(profile);

        toast.success('Record saved successfully.');
      } else {
        result = await WhatsAppAPI.saveStaffMemberEditProfile(profile.id, selectedFiles, JSON.stringify(JSON.stringify(profile)));
        localStorage.setItem('myimage', body);
        toast.success('Record saved successfully.');
      }

    } catch (error) {
      toast.error('Record Save Error.', error);
    }
  };

  const handlePhotoUpload = (event) => {
    setBody(URL.createObjectURL(event.target.files[0]));
    setSelectedFiles(event.target.files[0]);
    setBrokenImages(URL.createObjectURL(event.target.files[0]))
  };

  const handleChangeSubmit = async (e) => {
    e.preventDefault();

    let newUser = { id: user.id, password: password };

    try {
      const result = await WhatsAppAPI.updateUser(newUser);

      if (result.success) {
        toast.success('Password updated successfully.');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    } catch (error) {
      toast.error('Failed to update password.', error);
    }
  };


  const handleClose = () => {
    setShowPasswordModal(false);
    setPassword('');
    setConfirmPassword('');
  };

  const handleShowPasswordModal = () => {
    setShowPasswordModal(true);
    setPassword('');
    setConfirmPassword('');
  };

  const isFormValid = () => {
    return Boolean(profile.firstname?.trim()) &&
      Boolean(profile.lastname?.trim()) &&
      Boolean(profile.email?.trim()) &&
      Boolean(profile.phone?.trim()) &&
      Boolean(profile.phone?.length == 10) &&
      phoneRegex.test(profile.phone) &&
      !emailError &&
      phoneError === "";
  };


  const togglePasswordVisibility = () => setShowPassword(!showPassword);
  const toggleConfirmPasswordVisibility = () => setShowConfirmPassword(!showConfirmPassword);

  return (
    <>
      <Container className='mt-5'>
        <Row className='mx-5 text-center g-0'>
          <Col lg={12} xs={12} sm={12}>
            <div className=' text-center p-2' style={{ height: '40px', backgroundColor: '#ffffff', borderRadius: '5px' }}>
              <span className='fw-semibold p-1' style={{ color: '#605C68', fontSize: 'large' }}>
                Update Profile
              </span>
            </div>
          </Col>
        </Row>
      </Container>

      <Container className='mt-2'>
        <Row className="mx-5">
          <Col lg={4} xs={12} sm={12} className="g-0">
            <Card>
              <Card.Body className="text-center">
                <Card.Title style={{ textAlign: "center" }}>
                  {profile.firstname || ""} {profile.lastname || ""}
                </Card.Title>
                {/* <Image variant="top"
                  src={body}
                  className="rounded-circle"
                  thumbnail
                  style={{ width: "207px", height: "207px", objectFit: "contain" }}></Image> */}



                {brokenImages.includes(`img-${profile.id}`) ? (
                  <div className="text-uppercase" style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
                    <NameInitialsAvatar
                      size="207px"
                      textSize="30px"
                      bgColor='#49C858'
                      borderWidth="0px"
                      textColor="#fff"
                      name={`${profile.firstname} ${profile.lastname}`}
                    /></div>
                ) : (
                  <Image variant="top"
                    src={body}
                    className="rounded-circle"
                    thumbnail
                    style={{ width: "207px", height: "207px", objectFit: "contain" }}
                    onError={() => setBrokenImages((prev) => [...prev, `img-${profile.id}`])}
                    id={`img-${profile.id}`}
                  />
                )}

                <Button className="btn mt-3 p-2 " variant="secondary" style={{ width: "100%", display: "block" }} onClick={() => fileInputRef.current.click()}>
                  Image Upload
                </Button>
                <input
                  onChange={handlePhotoUpload}
                  name="profilephotourl"
                  ref={fileInputRef}
                  type="file"
                  hidden
                  accept="image/*"
                />
              </Card.Body>
            </Card>
          </Col>

          <Col lg={8} sm={12} xs={12} className="ps-4">
            <Row className="view-form-header align-items-center p-3" >
              <Col lg={12} sm={12} xs={12}>
                Edit Profile
                <Button className="btn-sm text-end float-end" variant="outline-light" onClick={handleShowPasswordModal}>
                  Change Password
                </Button>
              </Col>

            </Row>

            <Row className="pb-4 py-4 ibs-edit-form" >
              <Col lg={6} sm={12} xs={12}>
                <Form.Group className="mx-3 mb-3" controlId="formBasicPhone">
                  <Form.Label
                    className="form-view-label"
                  >
                    First Name
                  </Form.Label>
                  <Form.Control
                    style={{ height: "36px" }}
                    required
                    type="text"
                    name="firstname"
                    value={profile.firstname}
                    onChange={handleChange}
                    placeholder="Enter First Name"
                  />
                </Form.Group>
              </Col>
              <Col lg={6} sm={12} xs={12}>
                <Form.Group
                  className="mx-3 mb-3"
                  controlId="formBasicLastName"
                >
                  <Form.Label
                    className="form-view-label"
                   
                  >
                    Last Name
                  </Form.Label>
                  <Form.Control
                    style={{ height: "36px" }}
                    required
                    type="text"
                    name="lastname"
                    placeholder="Enter Last Name"
                    value={profile.lastname}
                    onChange={handleChange}
                  />
                </Form.Group>
              </Col>

              <Col lg={6} sm={12} xs={12}>
                <Form.Group
                  className="mx-3 mb-3"
                  controlId="formBasicEmail"
                >
                  <Form.Label
                    className="form-view-label"
                  >
                    Email
                  </Form.Label>
                  <Form.Control
                    style={{ height: "36px" }}
                    required
                    type="email"
                    name="email"
                    placeholder="Enter Email"
                    value={profile.email}
                    onChange={handleChange}
                  />
                  {emailError && (
                    <small className="text-danger">{emailError}</small>
                  )}
                </Form.Group>
              </Col>
              <Col lg={6} sm={12} xs={12} className="mb-4">
                <Form.Group
                  className="mx-3 mb-3"
                  controlId="formBasicPhone"
                >
                  <Form.Label
                    className="form-view-label"
                  >
                    Phone
                  </Form.Label>
                  <Form.Control
                    style={{ height: "36px" }}
                    required
                    type="phone"
                    name="phone"
                    placeholder="Enter Phone"
                    value={profile.phone}
                    onChange={handleChange}
                  />
                  {phoneError && (
                    <small className="text-danger"> {phoneError}</small>
                  )}
                </Form.Group>
              </Col>


              <Col lg={12} sm={12} xs={12}>
                <hr></hr>
              </Col>

              <Col lg={12} sm={12} xs={12} className="text-end ">
                <Button className="me-3" variant="outline-secondary" disabled={!isFormValid()} onClick={handleSubmit}>
                  Save
                </Button>

              </Col>

            </Row>
          </Col>
        </Row>

        <Modal show={showPasswordModal} aria-labelledby="contained-modal-title-vcenter" centered size="md">
          <Modal.Header closeButton onClick={handleClose}>
            <Modal.Title id="contained-modal-title-vcenter">
              Change Password
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>

            <Row>
              <Col lg={12} sm={12} xs={12}>
                <Form noValidate className="mb-0">
                  <Form.Group className="mb-3" controlId="formBasicPassword">
                    <Form.Label>New Password</Form.Label>
                    <div className="d-flex align-items-center position-relative">
                      <Form.Control
                        type={showPassword ? "text" : "password"}
                        name="password"
                        placeholder="Enter your new password"
                        value={password}
                        onChange={handlePasswordOnchange}
                        required
                        style={{ height: "36px" }}
                      />
                      <span
                        className="position-absolute end-0 me-3"
                        onClick={togglePasswordVisibility}
                        style={{ cursor: "pointer" }}
                      >
                        <i className={`fa ${!showPassword ? 'fa-eye-slash' : 'fa-eye'}`} aria-hidden="true"></i>
                      </span>
                    </div>
                  </Form.Group>
                  <Form.Group className="mb-3" controlId="formBasicConfirmPassword">
                    <Form.Label>Confirm Password</Form.Label>
                    <div className="d-flex align-items-center position-relative">
                      <Form.Control
                        type={showConfirmPassword ? "text" : "password"}
                        name="confirmpassword"
                        placeholder="Enter your confirm password"
                        value={confirmPassword}
                        onChange={handlePasswordOnchange}
                        required
                        style={{ height: "36px" }}
                      />
                      <span
                        className="position-absolute end-0 me-3"
                        onClick={toggleConfirmPasswordVisibility}
                        style={{ cursor: "pointer" }}
                      >
                        <i className={`fa ${!showConfirmPassword ? 'fa-eye-slash' : 'fa-eye'}`} aria-hidden="true"></i>
                      </span>
                    </div>

                  </Form.Group>
                </Form>
              </Col>
            </Row>
          </Modal.Body>
          <Modal.Footer>
            <div className="d-flex justify-content-end">
              <Button variant="outline-primary" onClick={handleClose}>
                Cancel
              </Button>
              <Button className="ms-2" variant="outline-secondary" disabled={isSubmitDisabled()} onClick={handleChangeSubmit}>
                Save
              </Button>
            </div>
          </Modal.Footer>
        </Modal>
      </Container>
      <ToastContainer />
    </>
  );
};

export default EditProfile;