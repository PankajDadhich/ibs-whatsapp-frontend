/**
 * @author      Abdul Pathan
 * @date        Aug, 2024
 * @copyright   www.ibirdsservices.com
 */
import React, { useState, useEffect } from "react";
import { Col, Container, Row, Card } from "react-bootstrap";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import { useLocation } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import "react-bootstrap-typeahead/css/Typeahead.css";
import WhatsAppAPI from "../../api/WhatsAppAPI";
import { ToastContainer, toast } from 'react-toastify'; // npm i react-toastify --force
import 'react-toastify/dist/ReactToastify.css';
import CityState from "../../constants/CityState.json";
import Select from "react-select";

const AccountAdd = (props) => {
  const initialFormData = {
    id: '',
    name: "",
    email: "",
    phone: "",
    website: "",
    state: "",
    city: "",
    street: "",
    pincode: "",
    country: ""
  };
  const [state, setState] = useState([]);
  const [cities, setCities] = useState([]);
  const [isSending, setIsSending] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const [account, setAccount] = useState(initialFormData);
  const [emailError, setEmailError] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  const phoneRegex = /^[0-9]{10}$/;

  useEffect(() => {
    if (location.state) {
      setAccount(location.state);
    } else {
      setAccount(initialFormData);
    }
  }, [location.state]);

  useEffect(() => {
    const uniqueStates = Array.from(new Set(CityState.map(item => item.state))).map(state => ({
      value: state,
      label: state
    }));
    setState(uniqueStates);
  }, []);


  useEffect(() => {
    if (account.state) {
      const filteredCities = CityState.filter((obj) => obj.state === account.state).map((city) => ({
        label: city.name,
        value: city.name,
      }));
      setCities(filteredCities);
    }
  }, [account.state]);


  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "email") {
      if (!emailRegex.test(value)) {
        setEmailError("Please enter a valid email address");
      } else {
        setEmailError("");
      }
    }

    if (name === "phone") {
      if (!phoneRegex.test(value)) {
        setPhoneError("Phone number must be exactly 10 digits");
      } else {
        setPhoneError("");
      }
    }
    setAccount({ ...account, [e.target.name]: e.target.value });
  };

  const handleState = (e) => {
    const filteredCities = CityState.filter((obj) => obj.state === e.value).map((city) => ({
      label: city.name,
      value: city.name,
    }));
    setCities(filteredCities);
    setAccount({ ...account, state: e.value, city: "" });
  };

  const handleSelectListChange = (value, name) => {
    setAccount({ ...account, [name]: value.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    let result = {};
    try {
      if (account.id) {
        result = await WhatsAppAPI.saveAccount(account);
        if (result.success) {
          toast.success('Record saved successfully.');
          navigate(`/accounts/${account.id}`, { state: account });
        }
      } else {
        result = await WhatsAppAPI.createAccount(account);
        if (result) {
          toast.success('Record saved successfully.');
          navigate(`/accounts/${result.id}`, { state: result });
        }
      }
    } catch (error) {
      toast.error('An unexpected error occurred.', error);
      setIsSending(false);
    } finally {
      setIsSending(false);
    }
  };

  const handleCancel = () => {
    navigate("/accounts/");
  };
  const isFormValid = Boolean(account.name?.trim()) &&
    Boolean(account.phone?.trim()) &&
    phoneRegex.test(account.phone) &&
    Boolean(account.website?.trim()) &&
    Boolean(account.email?.trim()) &&
    emailRegex.test(account.email) &&
    emailError === "" &&
    phoneError === "";

  return (
    <>
      <Container className='mt-5'>
        <Row className='mx-5 text-center g-0'>
          <Col lg={12} xs={12} sm={12}>
            <div className='text-center p-2' style={{ height: '40px', backgroundColor: '#ffffff', borderRadius: '5px' }}>
              <span className='fw-semibold' style={{ color: '#605C68', fontSize: 'large' }}>
                {!account.id ? 'Add Account' : 'Edit Account'}
              </span>
            </div>
          </Col>
        </Row>
      </Container>

      <Container className='mt-1 mb-5'>
        <Row className='mx-5 g-0'>
          <Col lg={12} sm={12} xs={12} className="mb-2">
            <Card className='h-100' style={{ border: "none" }}>
              <Card.Body>
                <Form
                  className="mt-3"
                  onSubmit={handleSubmit}
                >
                  <Row className='mb-3'>
                    <Col lg={6} sm={12} xs={12}>
                      <Form.Group className="ms-3" controlId="formBasicName">
                        <Form.Label htmlFor="formBasicName">Account Name</Form.Label>
                        <Form.Control
                          required
                          type="text"
                          name="name"
                          placeholder="Enter Name"
                          value={account.name}
                          onChange={handleChange}
                          style={{ height: "36px" }}
                        />
                      </Form.Group>
                    </Col>

                    <Col lg={6} sm={12} xs={12}>
                      <Form.Group className="ms-3" controlId="formBasicEmail">
                        <Form.Label htmlFor="formBasicEmail">Email</Form.Label>
                        <Form.Control
                          required
                          type="email"
                          name="email"
                          placeholder="Enter Email"
                          value={account.email}
                          onChange={handleChange}
                          pattern="^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$"
                          style={{ height: "36px" }}
                          isInvalid={emailError !== ""} // Add validation check
                        />
                        <Form.Control.Feedback type="invalid">
                          {emailError}
                        </Form.Control.Feedback>
                      </Form.Group>
                    </Col>
                  </Row>
                  <Row className='mb-3'>
                    <Col lg={6} sm={12} xs={12}>
                      <Form.Group className="ms-3" controlId="formBasicPhone">
                        <Form.Label htmlFor="formBasicPhone">Phone</Form.Label>
                        <Form.Control
                          required
                          type="text"
                          name="phone"
                          placeholder="Enter Phone"
                          value={account.phone}
                          onChange={handleChange}
                          style={{ height: "36px" }}
                          isInvalid={!!phoneError}
                        />
                        <Form.Control.Feedback type="invalid">
                          {phoneError}
                        </Form.Control.Feedback>
                      </Form.Group>
                    </Col>
                    <Col lg={6} sm={12} xs={12}>
                      <Form.Group className="ms-3" controlId="formBasicWebsite">
                        <Form.Label htmlFor="formBasicWebsite">Website</Form.Label>
                        <Form.Control
                          required
                          type="text"
                          name="website"
                          placeholder="Enter Website"
                          value={account.website}
                          onChange={handleChange}
                          style={{ height: "36px" }}
                        />
                      </Form.Group>
                    </Col>
                  </Row>


                  <Row className='mb-3'>
                    <Col lg={6} sm={12} xs={12}>
                      <Form.Group className="ms-3" controlId="formBasicState">
                        <Form.Label htmlFor="formBasicState">State</Form.Label>
                        <Select
                          placeholder="Select State"
                          value={state.find(option => option.value === account.state) || null} // Ensure value matches with state list
                          onChange={handleState}
                          options={state}
                        />
                      </Form.Group>
                    </Col>
                    <Col lg={6} sm={12} xs={12}>
                      <Form.Group className="ms-3" controlId="formBasicCity">
                        <Form.Label htmlFor="formBasicCity">City</Form.Label>
                        <Select
                          options={cities}
                          onChange={(e) => handleSelectListChange(e, "city")}
                          value={cities.find(option => option.value === account.city) || null} // Ensure value matches with city list
                          placeholder="Select City"
                        />
                      </Form.Group>
                    </Col>
                  </Row>

                  <Row className='mb-3'>
                    <Col lg={6} sm={12} xs={12}>
                      <Form.Group className="ms-3" controlId="formBasicStreet">
                        <Form.Label htmlFor="formBasicStreet">Street</Form.Label>
                        <Form.Control
                          type="text"
                          name="street"
                          placeholder="Enter Street"
                          value={account.street}
                          onChange={handleChange}
                          style={{ height: "36px" }}
                        />
                      </Form.Group>
                    </Col>
                    <Col lg={6} sm={12} xs={12}>
                      <Form.Group className="ms-3" controlId="formBasicPin">
                        <Form.Label htmlFor="formBasicPin">Pincode</Form.Label>
                        <Form.Control
                          type="text"
                          name="pincode"
                          placeholder="Enter Pincode"
                          value={account.pincode}
                          onChange={handleChange}
                          style={{ height: "36px" }}
                        />
                      </Form.Group>
                    </Col>
                  </Row>

                  <Row className='mb-3'>

                    <Col lg={6} sm={12} xs={12}>
                      <Form.Group className="ms-3" controlId="formBasicCountry">
                        <Form.Label htmlFor="formBasicCountry">Country</Form.Label>
                        <Form.Control
                          type="text"
                          name="country"
                          placeholder="Enter Country"
                          value={account.country}
                          onChange={handleChange}
                          style={{ height: "36px" }}
                        />
                      </Form.Group>
                    </Col>
                  </Row>
                  <Row className='mt-2'>
                    <Col lg={12} sm={12} xs={12}>
                      <hr></hr>
                    </Col>
                  </Row>
                  <Row className='g-0 mb-2'>
                    <Col lg={12} sm={12} xs={12} className="text-end mt-1">
                      <Button className='mx-2' variant="light" disabled={isSending} onClick={handleCancel} >
                        Back
                      </Button>
                      <Button variant="outline-secondary" disabled={!isFormValid || isSending} onClick={handleSubmit}>
                        {isSending ? 'Saving...' : 'Save'}
                      </Button>
                    </Col>
                  </Row>
                </Form>
              </Card.Body>
            </Card>
          </Col>
        </Row>
        <ToastContainer />
      </Container>
    </>
  );

};
export default AccountAdd;
