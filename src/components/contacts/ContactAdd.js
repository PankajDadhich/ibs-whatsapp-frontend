/**
 * @author      Abdul Pathan
 * @date        Aug, 2024
 * @copyright   www.ibirdsservices.com
 */

import React, { useState, useEffect } from "react";
import { Card, Col, Container, Row } from "react-bootstrap";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import { useLocation } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import "react-bootstrap-typeahead/css/Typeahead.css";
import WhatsAppAPI from "../../api/WhatsAppAPI";
import Select from "react-select";
import CityState from "../../constants/CityState.json";
import { ToastContainer, toast } from 'react-toastify'; // npm i react-toastify --force
import 'react-toastify/dist/ReactToastify.css';

const ContactAdd = (props) => {
    const initialFormData = {
        id: '',
        accountName: '',
        title: '',
        salutation: '',
        firstname: '',
        lastname: '',
        email: '',
        phone: '',
        whatsapp_number: '',
        street: '',
        pincode: '',
        state: '',
        city: '',
        country: ''
    };
    const [optionAccount, setOptionAccount] = useState([]);
    const [stateOptions, setStateOptions] = useState([]);
    const [selectedState, setSelectedState] = useState("");
    const [cityOptions, setCityOptions] = useState([]);
    const [contactRecord, setContactRecord] = useState(initialFormData);

    const location = useLocation();
    const navigate = useNavigate();
    const [isSending, setIsSending] = useState(false);

    const [emailError, setEmailError] = useState("");
    const [phoneError, setPhoneError] = useState("");
    const [whatsappError, setWhatsappError] = useState("");
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    const phoneRegex = /^[0-9]{10}$/;

    useEffect(() => {
        if (location.state) {
            let updatedRecord = { ...location.state };
            if (updatedRecord.whatsapp_number && updatedRecord.whatsapp_number.length === 12) {
                updatedRecord.whatsapp_number = updatedRecord.whatsapp_number.substring(2);
            }
            setContactRecord(updatedRecord);

        } else {
            setContactRecord(initialFormData);
        }
    }, [location.state]);


    useEffect(() => {
        const fetchData = async () => {
            try {
                const accountData = await WhatsAppAPI.fetchAccounts();
                const accounts = accountData.map(item => ({ value: item.id, label: item.name }));
                setOptionAccount(accounts);
            } catch (error) {
                console.error("Error fetching accounts:", error);
            }
        };

        fetchData();

        // const states = CityState.map(item => ({ value: item.state, label: item.state }));
        // setStateOptions(states);

        let uniqueStates = [];
        CityState.forEach((item) => {
            if (!uniqueStates.includes(item.state)) {
                uniqueStates.push(item.state);
            }
        });

        let st = uniqueStates.map((state) => ({
            value: state,
            label: state,
        }));

        setStateOptions(st);

        if (contactRecord.state) {
            setSelectedState(contactRecord.state);
        }

    }, [contactRecord.state]);


    useEffect(() => {
        if (selectedState) {
            const cities = CityState.filter(item => item.state === selectedState)
                .map(item => ({ value: item.name, label: item.name }));
            setCityOptions(cities);
        }
    }, [selectedState]);


    const handleAccountChange = (selectedOption) => {
        setContactRecord(prev => ({
            ...prev,
            accountid: selectedOption ? selectedOption.value : null,
            accountname: selectedOption ? selectedOption.label : ''
        }));
    };


    const handleStateChange = (selectedOption) => {
        setSelectedState(selectedOption.value);
        setContactRecord(prev => ({
            ...prev,
            state: selectedOption.value,
            city: ""
        }));
    };

    const handleCityChange = (selectedOption) => {
        setContactRecord(prev => ({
            ...prev,
            city: selectedOption.value
        }));
    };

    const handleChange = (e) => {
        const { name, value } = e.target;

        if (name === "email") {
            if (!emailRegex.test(value)) {
                setEmailError("Please enter a valid email address");
            } else {
                setEmailError("");
            }
        }
        if (name === "whatsapp_number") {
            if (value) {
                if (!phoneRegex.test(value)) {
                    setWhatsappError("WhatsApp number must be exactly 10 digits");
                } else {
                    setWhatsappError("");
                }
            } else {
                setWhatsappError("");
            }
        }

        if (name === "phone") {
            if (!phoneRegex.test(value)) {
                setPhoneError("Phone number must be exactly 10 digits");
            } else {
                setPhoneError("");
            }
        }

        setContactRecord(prev => ({
            ...prev,
            [e.target.name]: e.target.value
        }));
    };


    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!contactRecord.firstname.trim() && !contactRecord.lastname.trim() && !contactRecord.phone.trim() && !contactRecord.email.trim()) {
            toast.error('Required field missing.')
            return;
        }

        try {
            let result;
            if (contactRecord?.id) {
                if (contactRecord.whatsapp_number && contactRecord.whatsapp_number.length === 10) {
                    contactRecord.whatsapp_number = '91' + contactRecord.whatsapp_number;
                }
                result = await WhatsAppAPI.updateContactRecord(contactRecord);
            } else {
                if (contactRecord.whatsapp_number) {
                    contactRecord.whatsapp_number = '91' + contactRecord.whatsapp_number;
                }
                result = await WhatsAppAPI.createContactRecord(contactRecord);
            }

            if (result.errors) {
                toast.error(`${result.errors}`);
            } else {
                toast.success(contactRecord?.id ? 'Contact updated successfully.' : 'Contact created successfully.');
                navigate("/contacts");
            }
        } catch (error) {
            toast.error('An unexpected error occurred.');
            setIsSending(false);
        } finally {
            setIsSending(false);
        }
    };

    const handleBack = () => {
        navigate("/contacts");
    }

    const isFormValid = Boolean(contactRecord.firstname.trim()) && Boolean(contactRecord.lastname.trim()) && Boolean(contactRecord.email.trim()) && emailRegex.test(contactRecord.email) && emailError === "" && phoneError === "" && phoneRegex.test(contactRecord.phone);


    return (
        <>
            <Container className='mt-5'>
                <Row className='mx-5 text-center g-0'>
                    <Col lg={12} xs={12} sm={12}>
                        <div className='text-center p-2' style={{ height: '40px', backgroundColor: '#ffffff', borderRadius: '5px' }}>
                            <span className='fw-semibold' style={{ color: '#605C68', fontSize: 'large' }}>
                                {contactRecord.id ? 'Edit Contact' : 'Add Contact'}
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
                                <Row className='mb-3'>
                                    <Col lg={6} sm={12} xs={12}>
                                        <Form.Group className="ms-3">
                                            <Form.Label htmlFor="accountName">Account Name</Form.Label>
                                            <Select
                                                placeholder="Account Name..."
                                                value={optionAccount?.find(option => option.value === contactRecord.accountid) || null}
                                                onChange={handleAccountChange}
                                                options={optionAccount || []}
                                            />
                                            <Form.Control.Feedback type="invalid">
                                                Please provide Account Name.
                                            </Form.Control.Feedback>
                                        </Form.Group>
                                    </Col>

                                    <Col lg={6} sm={12} xs={12}>
                                        <Form.Group className="ms-3">
                                            <Form.Label htmlFor="title">Title</Form.Label>
                                            <Form.Control
                                                style={{ height: "36px" }}
                                                type="text"
                                                name="title"
                                                placeholder="Enter title"
                                                value={contactRecord.title}
                                                onChange={handleChange}
                                            />
                                        </Form.Group>
                                    </Col>
                                </Row>


                                <Row className='mb-3'>
                                    <Col lg={6} sm={12} xs={12}>
                                        <Form.Group className="ms-3">
                                            <Form.Label htmlFor="salutation">Salutation</Form.Label>
                                            <Form.Control
                                                style={{ height: "36px" }}
                                                as="select"
                                                name="salutation"
                                                value={contactRecord.salutation}
                                                onChange={handleChange}
                                            >
                                                <option value="">---Select---</option>
                                                <option value="Mr.">Mr.</option>
                                                <option value="Mrs.">Mrs.</option>
                                                <option value="Ms.">Ms.</option>
                                                <option value="Dr.">Dr.</option>
                                                <option value="Prof.">Prof.</option>
                                            </Form.Control>
                                        </Form.Group>
                                    </Col>
                                    <Col lg={6} sm={12} xs={12}>
                                        <Form.Group className="ms-3">
                                            <Form.Label htmlFor="firstname">First Name</Form.Label>
                                            <Form.Control
                                                style={{ height: "36px" }}
                                                required
                                                type="text"
                                                name="firstname"
                                                placeholder="Enter first name"
                                                value={contactRecord.firstname}
                                                onChange={handleChange}
                                            />
                                        </Form.Group>
                                    </Col>
                                </Row>

                                <Row className='mb-3'>
                                    <Col lg={6} sm={12} xs={12}>
                                        <Form.Group className="ms-3">
                                            <Form.Label htmlFor="lastname">Last Name</Form.Label>
                                            <Form.Control
                                                required
                                                style={{ height: "36px" }}
                                                type="text"
                                                name="lastname"
                                                placeholder="Enter last name"
                                                value={contactRecord.lastname}
                                                onChange={handleChange}
                                            />
                                        </Form.Group>
                                    </Col>
                                    <Col lg={6} sm={12} xs={12}>
                                        <Form.Group className="ms-3">
                                            <Form.Label htmlFor="email">Email</Form.Label>
                                            <Form.Control
                                                required
                                                style={{ height: "36px" }}
                                                type="email"
                                                name="email"
                                                placeholder="Enter email"
                                                value={contactRecord.email}
                                                onChange={handleChange}
                                                isInvalid={emailError !== ""}
                                            />
                                            <Form.Control.Feedback type="invalid">
                                                {emailError}
                                            </Form.Control.Feedback>
                                        </Form.Group>
                                    </Col>
                                </Row>

                                <Row className='mb-3'>
                                    <Col lg={6} sm={12} xs={12}>
                                        <Form.Group className="ms-3">
                                            <Form.Label htmlFor="phone">Phone</Form.Label>
                                            <Form.Control
                                                style={{ height: "36px" }}
                                                required
                                                type="phone"
                                                name="phone"
                                                placeholder="Enter phone"
                                                value={contactRecord.phone}
                                                onChange={handleChange}
                                                isInvalid={!!phoneError}
                                            />
                                            <Form.Control.Feedback type="invalid">
                                                {phoneError}
                                            </Form.Control.Feedback>
                                        </Form.Group>
                                    </Col>
                                    <Col lg={6} sm={12} xs={12}>
                                        <Form.Group className="ms-3">
                                            <Form.Label htmlFor="whatsapp_number">WhatsApp Number</Form.Label>
                                            <Form.Control
                                                style={{ height: "36px" }}
                                                type="phone"
                                                name="whatsapp_number"
                                                placeholder="Enter WhatsApp number"
                                                value={contactRecord.whatsapp_number}
                                                onChange={handleChange}
                                                isInvalid={!!whatsappError}
                                            />
                                            <Form.Control.Feedback type="invalid">
                                                {whatsappError}
                                            </Form.Control.Feedback>
                                        </Form.Group>
                                    </Col>
                                </Row>

                                <Row className='mb-3'>
                                    <Col lg={6} sm={12} xs={12}>
                                        <Form.Group className="ms-3">
                                            <Form.Label htmlFor="street">Street</Form.Label>
                                            <Form.Control
                                                style={{ height: "36px" }}
                                                type="text"
                                                name="street"
                                                placeholder="Enter street"
                                                value={contactRecord.street}
                                                onChange={handleChange}
                                            />
                                        </Form.Group>
                                    </Col>
                                    <Col lg={6} sm={12} xs={12}>
                                        <Form.Group className="ms-3">
                                            <Form.Label htmlFor="pincode">Pincode</Form.Label>
                                            <Form.Control
                                                style={{ height: "36px" }}
                                                type="text"
                                                name="pincode"
                                                placeholder="Enter pincode"
                                                value={contactRecord?.pincode}
                                                onChange={handleChange}
                                            />
                                        </Form.Group>
                                    </Col>
                                </Row>

                                <Row className='mb-3'>
                                    <Col lg={6} sm={12} xs={12}>
                                        <Form.Group className="ms-3">
                                            <Form.Label htmlFor="state">State</Form.Label>
                                            <Select
                                                placeholder="State"
                                                value={stateOptions.find(option => option.value === contactRecord.state)}
                                                onChange={handleStateChange}
                                                options={stateOptions}
                                            />
                                        </Form.Group>
                                    </Col>
                                    <Col lg={6} sm={12} xs={12}>
                                        <Form.Group className="ms-3">
                                            <Form.Label htmlFor="city">City</Form.Label>
                                            <Select
                                                options={cityOptions}
                                                // value={cityOptions.find(option => option.value === contactRecord.city)}
                                                value={cityOptions.find(option => option.value === contactRecord.city) || null}
                                                onChange={handleCityChange}
                                                placeholder="Enter City"
                                            />
                                        </Form.Group>
                                    </Col>
                                </Row>

                                <Row className='mb-3'>
                                    <Col lg={6} sm={12} xs={12}>
                                        <Form.Group className="ms-3">
                                            <Form.Label htmlFor="country">Country</Form.Label>
                                            <Form.Control
                                                style={{ height: "36px" }}
                                                type="text"
                                                name="country"
                                                placeholder="Enter country"
                                                value={contactRecord.country}
                                                onChange={handleChange}
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
                                        <Button className='mx-2' variant="light" disabled={isSending} onClick={handleBack} >
                                            Back
                                        </Button>
                                        <Button variant="outline-secondary" disabled={!isFormValid || isSending} onClick={handleSubmit}>
                                            {isSending ? 'Saving...' : 'Save'}
                                        </Button>
                                    </Col>
                                </Row>
                            </Card.Body>

                        </Card>
                    </Col>
                </Row>
            </Container>

            <ToastContainer />

        </>
    );
};

export default ContactAdd;
