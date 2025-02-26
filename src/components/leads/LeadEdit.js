import React, { useState, useEffect } from "react";
import { Col, Container, Row, Card } from "react-bootstrap";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import { useNavigate } from "react-router-dom";
import "react-bootstrap-typeahead/css/Typeahead.css";
import { useLocation } from "react-router-dom";
import Select from 'react-select';
import CityState from "../../constants/CityState.json";
import jwt_decode from "jwt-decode";
import WhatsAppAPI from '../../api/WhatsAppAPI';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const LeadEdit = () => {

    const location = useLocation();
    const navigate = useNavigate();
    const [lostReason, setLostReason] = useState(false);
    const [selectUser, setSelectUser] = useState({});
    const [state, setState] = useState([]);
    const [cities, setCities] = useState([]);
    const [selectedCity, setSelectedCity] = useState('');
    const [option, setoption] = useState();
    const [leadStatusArray, setleadStatusArray] = useState(JSON.parse(sessionStorage.getItem('lead_status')));
    const [emailError, setEmailError] = useState("");
    const [phoneError, setPhoneError] = useState("");
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    const phoneRegex = /^[0-9]{10}$/;
    const [whatsappError, setWhatsappError] = useState('');
    const industryValue = [
        { value: "", label: "--None--" },
        { value: "Agriculture", label: "Agriculture" },
        { value: "Apparel", label: "Apparel" },
        { value: "Banking", label: "Banking" },
        { value: "Chemicals", label: "Chemicals" },
        { value: "Communications", label: "Communications" },
    ];
    const salutationValue = [
        { value: "", label: "--None--" },
        { value: "Mr.", label: "Mr." },
        { value: "Ms.", label: "Ms." },
        { value: "Dr.", label: "Dr." },
        { value: "Mrs..", label: "Mrs.." },
        { value: "Prof.", label: "Prof.." },
    ];
    const leadSource = [
        { value: "Web", label: "Web" },
        { value: "Phone Enquiry", label: "Phone Enquiry" },
        { value: "Partner Referral", label: "Partner Referral" },
        { value: "Purchased List", label: "Purchased List" },
        { value: "Other", label: "Other" }
    ];
    const leadStatus = leadStatusArray;

    const [selectedState, setSelectedState] = useState("");
    const [lead, setLead] = useState(location.state ? location.state : {});
    let userInfo;
    useEffect(() => {
        let userInfo = jwt_decode(sessionStorage.getItem('token'));

        if (location?.state) {
            setLostReason(location.state.iswon === false);
            let whatsappNumber = location.state.whatsapp_number;
            if (whatsappNumber && whatsappNumber.length === 12) {
                whatsappNumber = whatsappNumber.substring(2);
            }

            setLead(prev => ({ ...prev, whatsapp_number: whatsappNumber }));

            if (lead.id) {
                let temp = {}
                temp.value = location.state.ownerid;
                temp.label = location.state.ownername;
                setoption(temp);
            } else {
                let temp = {};
                temp.value = userInfo.id;
                temp.label = userInfo.username;
                setoption(temp);
                lead.ownername = userInfo.username;
                lead.ownerid = userInfo.id;
            }

        } else {

            let temp = {};
            temp.value = userInfo.id;
            temp.label = userInfo.username;
            setoption(temp);
            lead.ownername = userInfo.username;
            lead.ownerid = userInfo.id;

        }

        async function init() {
            const fetchUser = await WhatsAppAPI.fetchUsers();
            let usr = []
            fetchUser.map((item) => {
                var obj = {};
                obj.value = item.id;
                obj.label = item.username;
                usr.push(obj);
            })
            setSelectUser(usr);
            let st = [];

            CityState.map((item) => {
                var obj = {};
                obj.value = item.state;
                obj.label = item.state;
                st.push(obj);

            });
            let finalStates = {};
            st = st.filter(function (currentObject) {
                if (currentObject.value in finalStates) {
                    return false;
                } else {
                    finalStates[currentObject.value] = true;
                    return true;
                }
            });
            if (lead.state) {
                setSelectedState(lead.state);
            }
            setState(st);
        }

        init();


    }, []);

    useEffect(() => {
        if (selectedState) {
            const cities = CityState.filter(item => item.state === selectedState)
                .map(item => ({ value: item.name, label: item.name }));
            setCities(cities);
        }
    }, [selectedState]);

    const handleState = (e) => {
        let filteredCities = [];
        CityState.forEach(function (obj) {
            if (obj.state === e.value) {
                filteredCities.push({
                    label: obj.name,
                    value: obj.name
                })
            }
        });
        setCities(filteredCities);
        setLead({ ...lead, 'state': e.value });
    }

    const handleSelectListChange = (value, name) => {
        setLead({ ...lead, [name]: value.value });
        setSelectedCity(value.value);

    }
    const handleTextOnlyChange = (e) => {
        const value = e.target.value.replace(/[^A-Za-z ]/g, '');
        setLead({ ...lead, [e.target.name]: value });

    };
    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name === "email") {
            if (value) {
                if (!emailRegex.test(value)) {
                    setEmailError("Please enter a valid email address");
                } else {
                    setEmailError("");
                }
            } else {
                setEmailError("");
            }
        }

        if (name === "whatsapp_number") {
            if (value) {
                if (!phoneRegex.test(value)) {
                    setPhoneError("Phone number must be exactly 10 digits");
                } else {
                    setPhoneError("");
                }
            } else {
                setPhoneError("");
            }
        }

        setLead({ ...lead, [e.target.name]: e.target.value });

        if (e.target.name === 'leadstatus') {
            leadStatus.map((status) => {
                if (status.label === e.target.value) {
                    if (status.is_lost === true) {
                        setLostReason(true);
                        return;
                    } else {
                        setLostReason(false);
                        return;
                    }
                }
            });

        }

    };

    const handleRoleChange = (e) => {
        setoption(e)
        setLead({ ...lead, 'ownerid': e.value, ownername: e.label });
    }


    const handleSubmit = async (e) => {
        e.preventDefault();
        let result = {};
        let iswon = null;
        leadStatus.map((status) => {
            if (status.label === lead.leadstatus) {
                if (status.is_converted === true) {
                    iswon = true;
                } else if (status.is_lost === true) {
                    iswon = false;
                }
            }
        });

        lead.iswon = iswon;
        lead.blocked = false;

        if (lead.id) {
            if (lead.whatsapp_number && lead.whatsapp_number.length === 10) {
                lead.whatsapp_number = '91' + lead.whatsapp_number;
            }
            result = await WhatsAppAPI.updateLead(lead);

            if (result.errors) {
                toast.error(`${result.errors}`);
            } else {
                toast.success('Record updated successfully');
                navigate(`/leads/${lead.id}`, { state: lead });
            }

        } else {
            if (lead.whatsapp_number && lead.whatsapp_number.length === 10) {
                lead.whatsapp_number = '91' + lead.whatsapp_number;
            }
            result = await WhatsAppAPI.createLead(lead);
            if (result.errors) {
                toast.error(`${result.errors}`);
            } else {
                toast.success('Record saved successfully');
                navigate(`/leads/${result.id}`, { state: result });
            }
        }
    };

    const isFormValid = Boolean(lead.firstname?.trim())
        && Boolean(lead.lastname?.trim())
        && Boolean(lead.whatsapp_number?.trim())
        && Boolean(lead.leadstatus?.trim())
        && phoneError === "" && phoneRegex.test(lead.whatsapp_number);

    const handleCancel = () => {
        navigate("/leads/", { state: lead });
    };

    return (
        <>
            <Container className='mt-5'>
                <Row className='g-0 mx-5 text-center '>
                    <Col lg={12} xs={12} sm={12}>
                        <div className=' text-center p-2' style={{ height: '40px', backgroundColor: '#ffffff', borderRadius: '5px' }}>
                            <span className='fw-semibold p-1' style={{ color: '#605C68', fontSize: 'large' }}>
                                {lead.id ? (
                                    <>Edit Lead</>
                                ) : (
                                    <>Add Lead</>
                                )}
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
                                        <Form.Group className="ms-3" controlId="formBasicsalutation">
                                            <Form.Label className="form-view-label">
                                                Salutation
                                            </Form.Label>
                                            <Form.Select
                                                style={{ height: "36px" }}
                                                aria-label="Select Salutation"
                                                name="salutation"
                                                value={lead.salutation}
                                                onChange={handleChange}
                                            >
                                                <option value="">--Select--</option>
                                                <option value="Mr">Mr.</option>
                                                <option value="Mrs">Mrs.</option>
                                                <option value="Ms">Ms.</option>
                                                <option value="Dr">Dr.</option>
                                                <option value="Prof">Prof.</option>
                                            </Form.Select>
                                        </Form.Group>
                                    </Col>

                                    <Col lg={6} sm={12} xs={12}>
                                        <Form.Group className='ms-3'>
                                            <Form.Label
                                                className="form-view-label"
                                            >   First Name
                                            </Form.Label>
                                            <Form.Control
                                                style={{ height: "36px" }}
                                                type="text"
                                                name="firstname"
                                                required={true}
                                                placeholder="Enter First Name"
                                                value={lead.firstname}
                                                onChange={(e) => handleTextOnlyChange(e)}
                                            />
                                            <Form.Control.Feedback type="invalid">
                                                Please provide First Name.
                                            </Form.Control.Feedback>
                                        </Form.Group>
                                    </Col>
                                </Row>
                                <Row className='mb-3'>
                                    <Col lg={6} sm={12} xs={12}>
                                        <Form.Group className="ms-3">
                                            <Form.Label
                                                className="form-view-label"
                                            >
                                                Last Name
                                            </Form.Label>
                                            <Form.Control
                                                style={{ height: "36px" }}
                                                required={true}
                                                type="text"
                                                name="lastname"
                                                placeholder="Enter LastName"
                                                value={lead.lastname}
                                                onChange={(e) => handleTextOnlyChange(e)}
                                            />
                                        </Form.Group>
                                    </Col>

                                    <Col lg={6} sm={12} xs={12}>
                                        <Form.Group className='ms-3'>
                                            <Form.Label className="form-view-label">
                                            Whatsapp Number
                                            </Form.Label>
                                            <Form.Control
                                                style={{ height: "36px" }}
                                                type="text"
                                                name="whatsapp_number"
                                                required
                                                placeholder="Enter whatsapp number"
                                                value={lead.whatsapp_number}
                                                onChange={(e) => handleChange(e)}
                                                isInvalid={!!phoneError}
                                            />
                                            <Form.Control.Feedback type="invalid">
                                                {phoneError}
                                            </Form.Control.Feedback>
                                        </Form.Group>
                                    </Col>

                                </Row>

                                <Row className='mb-3'>
                                    <Col lg={6} sm={12} xs={12}>
                                        <Form.Group className="ms-3" controlId="formCampaignName">
                                            <Form.Label
                                                className="form-view-label"
                                            >
                                                Company
                                            </Form.Label>
                                            <Form.Control
                                                style={{ height: "36px" }}
                                                type="text"
                                                name="company"
                                                placeholder="Enter Company"
                                                value={lead.company}
                                                onChange={(e) => handleChange(e)}
                                            />
                                            <Form.Control.Feedback type="invalid">
                                                Enter Company.
                                            </Form.Control.Feedback>
                                        </Form.Group>
                                    </Col>
                                    <Col lg={6} sm={12} xs={12}>
                                        <Form.Group className="ms-3">
                                            <Form.Label
                                                className="form-view-label"
                                            >
                                                Email
                                            </Form.Label>
                                            <Form.Control
                                                style={{ height: '36px' }}
                                                type="email"
                                                name="email"
                                                placeholder="Enter Email"
                                                value={lead.email}
                                                onChange={(e) => handleChange(e)}
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
                                            <Form.Label
                                                className="form-view-label"
                                            >
                                                Title
                                            </Form.Label>

                                            <Form.Select style={{ height: '36px' }} value={lead.title} name="title" onChange={handleChange}>
                                                <option value="">--Select--</option>
                                                <option value="CEO">CEO</option>
                                                <option value="Director">Director</option>
                                                <option value="Manager">Manager</option>
                                                <option value="Owner">Owner</option>
                                                <option value="Partner">Partner</option>
                                                <option value="Executive">Executive</option>
                                            </Form.Select>
                                            <Form.Control.Feedback type="invalid">
                                                Enter Title.
                                            </Form.Control.Feedback>
                                        </Form.Group>
                                    </Col>
                                    <Col lg={6} sm={12} xs={12}>
                                        <Form.Group className="ms-3">
                                            <Form.Label
                                                className="form-view-label"
                                            >
                                                Fax
                                            </Form.Label>
                                            <Form.Control style={{ height: '36px' }}
                                                type="text"
                                                name="fax"
                                                placeholder="Enter fax"
                                                value={lead.fax}
                                                onChange={(e) => handleChange(e)}
                                            />
                                            <Form.Control.Feedback type="invalid">
                                                Enter Fax.
                                            </Form.Control.Feedback>
                                        </Form.Group>
                                    </Col>
                                </Row>
                                <Row className='mb-3'>


                                    <Col lg={6} sm={12} xs={12}>
                                        <Form.Group className="ms-3">
                                            <Form.Label
                                                className="form-view-label"
                                            >
                                                Source
                                            </Form.Label>

                                            <Form.Select style={{ height: '36px' }} aria-label="Enter status" value={lead.leadsource} name="leadsource" onChange={handleChange}>
                                                <option value="">--Select-Source--</option>
                                                <option value="Phone">Phone</option>
                                                <option value="Partner Referral">Partner Referral</option>
                                                <option value="BNI">BNI</option>
                                                <option value="Purchased List">Purchased List</option>
                                                <option value="Web">Web</option>
                                                <option value="Email">Email</option>
                                                <option value="Whatsapp">Whatsapp</option>
                                                <option value="Facebook">Facebook</option>
                                                <option value="Instagram">Instagram</option>
                                                <option value="Salesforce">Salesforce</option>
                                                <option value="Other">Other</option>

                                            </Form.Select>
                                            <Form.Control.Feedback type="invalid">
                                                Enter  Lead Source.
                                            </Form.Control.Feedback>
                                        </Form.Group>
                                    </Col>
                                    <Col lg={6} sm={12} xs={12}>
                                        <Form.Group className="ms-3">
                                            <Form.Label
                                                className="form-view-label"
                                            >
                                                Assigned User
                                            </Form.Label>
                                            <Select
                                                required
                                                value={option}
                                                className="username"
                                                onChange={(e) => handleRoleChange(e)}
                                                options={selectUser}
                                            >
                                            </Select>
                                            <Form.Control.Feedback type="invalid">
                                                Please provide Select-Role.
                                            </Form.Control.Feedback>
                                        </Form.Group>
                                    </Col>
                                </Row>

                                <Row className='mb-3'>



                                    <Col lg={6} sm={12} xs={12}>
                                        <Form.Group className="ms-3">
                                            <Form.Label
                                                className="form-view-label"
                                            >
                                                Industry
                                            </Form.Label>
                                            <Form.Select aria-label="Enter Industry" style={{ height: "36px" }} value={lead.industry} name="industry" onChange={handleChange}>
                                                <option value="">--Select-Industry--</option>
                                                <option value="Agriculture">Agriculture</option>
                                                <option value="Apparel">Apparel</option>
                                                <option value="Banking">Banking</option>
                                                <option value="Biotechnology">Biotechnology</option>
                                                <option value="Chemicals">Chemicals</option>
                                                <option value="Communications">Communications</option>
                                                <option value="Construction">Construction</option>
                                                <option value="Consulting">Consulting</option>
                                                <option value="Education">Education</option>
                                                <option value="Electronics">Electronics</option>
                                                <option value="Energy">Energy</option>
                                                <option value="Engineering">Engineering</option>
                                                <option value="Entertainment">Entertainment</option>
                                                <option value="Environmental">Environmental</option>
                                                <option value="Finance">Finance</option>
                                                <option value="Food and Beverage">Food and Beverage</option>
                                                <option value="Government">Government</option>
                                                <option value="Healthcare">Healthcare</option>
                                                <option value="Hospitality">Hospitality</option>
                                                <option value="Insurance">Insurance</option>
                                                <option value="Legal">Legal</option>
                                                <option value="Machinery">Machinery</option>
                                                <option value="Manufacturing">Manufacturing</option>
                                                <option value="Media">Media</option>
                                                <option value="Non Profit">Non Profit (NGO)</option>
                                                <option value="Recreation">Recreation</option>
                                                <option value="Retail">Retail</option>
                                                <option value="Shipping">Shipping</option>
                                                <option value="Technology">Technology</option>
                                                <option value="Telecommunications">Telecommunications</option>
                                                <option value="Transportation">Transportation</option>
                                                <option value="Utilities">Utilities</option>
                                                <option value="Other">Other</option>
                                            </Form.Select>

                                            <Form.Control.Feedback type="invalid">
                                                Enter Industry.
                                            </Form.Control.Feedback>
                                        </Form.Group>
                                    </Col>
                                    <Col lg={6} sm={12} xs={12}>
                                        <Form.Group className="ms-3">
                                            <Form.Label
                                                className="form-view-label"
                                            >
                                                Payment Model
                                            </Form.Label>
                                            <Form.Select style={{ height: '36px' }} aria-label="Enter Status" name="paymentmodel" onChange={handleChange} value={lead.paymentmodel}>
                                                <option value="">--Select Payment Model--</option>

                                                <option value="Subscription">
                                                    Subscription
                                                </option>
                                                <option value="One Time">
                                                    One Time
                                                </option>
                                            </Form.Select>
                                        </Form.Group>
                                    </Col>

                                </Row>
                                <Row className='mb-3'>

                                    <Col lg={6} sm={12} xs={12}>
                                        <Form.Group className="ms-3">
                                            <Form.Label
                                                className="form-view-label"
                                            >
                                                Payment Terms
                                            </Form.Label>
                                            <Form.Select style={{ height: '36px' }} aria-label="Enter Status" name="paymentterms" onChange={handleChange} value={lead.paymentterms}>
                                                <option value="">--Select Terms--</option>
                                                <option value="12">
                                                    12 Months
                                                </option>
                                                <option value="24">
                                                    24 Months
                                                </option>
                                                <option value="One Time">
                                                    One Time
                                                </option>
                                                <option value="One Time with Yearly Renewal">
                                                    One Time with Yearly Renewal
                                                </option>


                                            </Form.Select>
                                        </Form.Group>
                                    </Col>
                                    <Col lg={6} sm={12} xs={12}>
                                        <Form.Group className="ms-3">
                                            <Form.Label
                                                className="form-view-label"

                                            >
                                                Expected Amount (₹)
                                            </Form.Label>
                                            <Form.Control
                                                style={{ height: '36px' }}
                                                type="number"
                                                name="amount"
                                                placeholder="Enter Expected Amount"
                                                value={lead.amount}
                                                onChange={(e) => handleChange(e)}
                                            />


                                            <Form.Control.Feedback type="invalid">
                                                Enter LeadStatus.
                                            </Form.Control.Feedback>
                                        </Form.Group>
                                    </Col>
                                </Row>
                                <Row className='mb-3'>
                                    <Col lg={6} sm={12} xs={12}>
                                        <Form.Group className="ms-3">
                                            <Form.Label
                                                className="form-view-label"
                                            >
                                                Status
                                            </Form.Label>
                                            <Form.Select required aria-label="Enter Status" name="leadstatus" style={{ height: '36px' }} onChange={handleChange} value={lead.leadstatus}>
                                                <option value="">--Select-Status--</option>
                                                {leadStatusArray.map((item, index) => (
                                                    <option value={item.label} key={index}>
                                                        {item.label}
                                                    </option>
                                                ))}
                                            </Form.Select>
                                            <Form.Control.Feedback type="invalid">
                                                Enter LeadStatus.
                                            </Form.Control.Feedback>
                                        </Form.Group>
                                    </Col>
                                    <Col lg={6} sm={12} xs={12}>
                                        <Form.Group className="ms-3">
                                            <Form.Label
                                                className="form-view-label"

                                            >
                                                Industry
                                            </Form.Label>
                                            <Form.Select aria-label="Enter Industry" style={{ height: "36px" }} value={lead.industry} name="industry" onChange={handleChange}>
                                                <option value="">--Select-Industry--</option>
                                                <option value="Agriculture">Agriculture</option>
                                                <option value="Apparel">Apparel</option>
                                                <option value="Banking">Banking</option>
                                                <option value="Biotechnology">Biotechnology</option>
                                                <option value="Chemicals">Chemicals</option>
                                                <option value="Communications">Communications</option>
                                                <option value="Construction">Construction</option>
                                                <option value="Consulting">Consulting</option>
                                                <option value="Education">Education</option>
                                                <option value="Electronics">Electronics</option>
                                                <option value="Energy">Energy</option>
                                                <option value="Engineering">Engineering</option>
                                                <option value="Entertainment">Entertainment</option>
                                                <option value="Environmental">Environmental</option>
                                                <option value="Finance">Finance</option>
                                                <option value="Food and Beverage">Food and Beverage</option>
                                                <option value="Government">Government</option>
                                                <option value="Healthcare">Healthcare</option>
                                                <option value="Hospitality">Hospitality</option>
                                                <option value="Insurance">Insurance</option>
                                                <option value="Legal">Legal</option>
                                                <option value="Machinery">Machinery</option>
                                                <option value="Manufacturing">Manufacturing</option>
                                                <option value="Media">Media</option>
                                                <option value="Non Profit">Non Profit (NGO)</option>
                                                <option value="Recreation">Recreation</option>
                                                <option value="Retail">Retail</option>
                                                <option value="Shipping">Shipping</option>
                                                <option value="Technology">Technology</option>
                                                <option value="Telecommunications">Telecommunications</option>
                                                <option value="Transportation">Transportation</option>
                                                <option value="Utilities">Utilities</option>
                                                <option value="Other">Other</option>
                                            </Form.Select>

                                            <Form.Control.Feedback type="invalid">
                                                Enter Industry.
                                            </Form.Control.Feedback>
                                        </Form.Group>
                                    </Col>


                                </Row>

                                <Row className='mb-3'>
                                    {lostReason &&
                                        <Col lg={6} sm={12} xs={12}>
                                            <Form.Group className="ms-3">
                                                <Form.Label
                                                    className="form-view-label"

                                                >
                                                    Lost Reason
                                                </Form.Label>
                                                <Form.Control
                                                    as="textarea"
                                                    name="lostreason"
                                                    required
                                                    placeholder="Enter lost reason"
                                                    value={lead.lostreason}
                                                    onChange={handleChange}
                                                />



                                            </Form.Group>
                                        </Col>
                                    }
                                    <Col lg={6} sm={12} xs={12}>
                                        <Form.Group className="ms-3">
                                            <Form.Label
                                                className="form-view-label"

                                            >
                                                Description
                                            </Form.Label>
                                            <Form.Control
                                                as="textarea"
                                                name="description"
                                                placeholder="Enter Description"
                                                value={lead.description}
                                                onChange={handleChange}
                                            />



                                        </Form.Group>
                                    </Col>


                                </Row>

                                <Row lg={12} sm={12} xs={12} className="py-3 my-4 section-header">
                                    ADDRESS INFORMATION
                                </Row>
                                <Row className='mb-3'>
                                    <Col lg={6} sm={12} xs={12}>
                                        <Form.Group className="ms-3">
                                            <Form.Label
                                                className="form-view-label"
                                            >
                                                State
                                            </Form.Label>
                                            <Select
                                                placeholder="Enter State"
                                                defaultValue={{ label: lead.state, value: lead.state }}
                                                value={state.find(option => option.value === lead.state) || null}
                                                onChange={handleState}
                                                options={state}

                                            >
                                            </Select>
                                            <Form.Control.Feedback type="invalid">
                                                Enter State.
                                            </Form.Control.Feedback>
                                        </Form.Group>
                                    </Col>
                                    <Col lg={6} sm={12} xs={12} >
                                        <Form.Group className="ms-3">
                                            <Form.Label
                                                className="form-view-label"

                                            >
                                                City
                                            </Form.Label>
                                            <Select options={cities}
                                                placeholder="Enter City"
                                                onChange={(e) => { handleSelectListChange(e, 'city') }}
                                                name="city"
                                                value={cities.find(option => option.value === lead.city) || null}
                                            />
                                            <Form.Control.Feedback type="invalid">
                                                Enter City.
                                            </Form.Control.Feedback>
                                        </Form.Group>
                                    </Col>
                                </Row>
                                <Row className='mb-3'>
                                    <Col lg={6} sm={12} xs={12}>
                                        <Form.Group className="ms-3">
                                            <Form.Label
                                                className="form-view-label"

                                            >
                                                Street
                                            </Form.Label>
                                            <Form.Control
                                                style={{ height: '36px' }}
                                                type="text"
                                                name="street"
                                                placeholder="Enter Street"
                                                value={lead.street}
                                                onChange={(e) => handleChange(e)}
                                            />
                                            <Form.Control.Feedback type="invalid">
                                                Enter Street.
                                            </Form.Control.Feedback>
                                        </Form.Group>
                                    </Col>
                                    <Col lg={6} sm={12} xs={12}>
                                        <Form.Group className="ms-3">
                                            <Form.Label
                                                className="form-view-label"

                                            >
                                                Country
                                            </Form.Label>
                                            <Form.Control
                                                style={{ height: '36px' }}
                                                type="text"
                                                name="country"
                                                placeholder="Enter Country"
                                                value={lead.country}

                                                onChange={(e) => handleChange(e)}
                                            />
                                            <Form.Control.Feedback type="invalid">
                                                Enter Country.
                                            </Form.Control.Feedback>
                                        </Form.Group>
                                    </Col>
                                </Row>
                                <Row className='mb-3'>
                                    <Col lg={6} sm={12} xs={12}>
                                        <Form.Group className="ms-3">
                                            <Form.Label
                                                className="form-view-label"

                                            >
                                                Zip / PostalCode
                                            </Form.Label>
                                            <Form.Control
                                                style={{ height: '36px' }}
                                                type="text"
                                                name="zipcode"
                                                placeholder="Enter PostalCode"
                                                value={lead.zipcode}
                                                onChange={(e) => handleChange(e)}
                                            />
                                            <Form.Control.Feedback type="invalid">
                                                Enter PostalCode.
                                            </Form.Control.Feedback>
                                        </Form.Group>
                                    </Col>
                                </Row>
                                <Row className='mt-2'>
                                    <Col lg={12} sm={12} xs={12} className=" mt-4">
                                        <hr></hr>
                                    </Col>
                                </Row>

                                <Row className='g-0 mb-2'>
                                    <Col lg={12} sm={12} xs={12} className="text-end mt-2">
                                        <Button className='mx-2' variant="light" onClick={handleCancel}>
                                            Back
                                        </Button>
                                        <Button variant="outline-secondary" disabled={!isFormValid} onClick={handleSubmit} type="button">
                                            Save
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
    )
}
export default LeadEdit