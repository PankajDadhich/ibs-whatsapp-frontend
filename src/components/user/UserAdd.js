import React, { useState, useEffect } from "react";
import { Col, Container, Row, Card } from "react-bootstrap";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import { useLocation } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import "react-bootstrap-typeahead/css/Typeahead.css";
import WhatsAppAPI from "../../api/WhatsAppAPI";
import Select from "react-select";
import jwt_decode from "jwt-decode";
import { ToastContainer, toast } from 'react-toastify'; // npm i react-toastify --force
import 'react-toastify/dist/ReactToastify.css';

const UserAdd = () => {
    const location = useLocation();
    const navigate = useNavigate();
    //const [user, setuser] = useState(location.state);
    const [user, setUser] = useState(location.state ? location.state : {});
    let name = user.firstname
    const [optionUsers, setOptionUsers] = useState([]);
    const [option, setoption] = useState();
    // const [selectedUser, setSelectedUser] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [phoneError, setPhoneError] = useState('');
    const [whatsappError, setWhatsappError] = useState('');
    const [isSending, setIsSending] = useState(false);
    const [emailError, setEmailError] = useState('');
    const phoneRegex = /^[0-9]{10}$/;
    const [showPassword, setShowPassword] = useState(false);
    const [loginUserRole, setLoginUserRole] = useState('');
    const [whatsappSetting, setWhatsappSetting] = useState([]);

    useEffect(() => {
        fetchWhatsAppSetting()
        if (user.whatsapp_number && user.whatsapp_number.length === 12) {
            let updatedWhatsAppNumber = user.whatsapp_number.substring(2);
            setUser({ ...user, whatsapp_number: updatedWhatsAppNumber });
        }

        if (user.id) {
            let temp = {}
            temp.value = user.managerid;
            temp.label = user.managername;
            setoption(temp);

        } else {
            let userInfo = jwt_decode(sessionStorage.getItem('token'));
            let temp = {}
            temp.value = userInfo.id;
            temp.label = userInfo.username;
            setoption(temp);
            // setUser({ ...user, managerid: userInfo.id, managername: userInfo.username });
            setUser({ ...user, managerid: userInfo.id, userrole: 'USER', managername: userInfo.username });
            setLoginUserRole(userInfo.userrole);
        }
        async function init() {
            const result = await WhatsAppAPI.fetchUsers();

            if (result) {
                let ar = [];
                var obj = {};
                obj.value = null;
                obj.label = '--Select--';
                ar.push(obj);
                result.map((item) => {
                    if (item.userrole !== 'USER') {
                        var obj = {};
                        obj.value = item.id;
                        obj.label = item.username;
                        ar.push(obj);
                    }

                });
                setOptionUsers(ar);
            } else {
                setOptionUsers([]);
            }
        }
        init();
    }, [user.id]);


    const fetchWhatsAppSetting = async () => {
        try {
            const response = await WhatsAppAPI.getWhatsAppSettingRecord();
            if (response.success) {
                setWhatsappSetting(response.record);
            } else {
                setWhatsappSetting([]);
            }
        } catch (error) {
            console.error('Error fetching WhatsApp settings:', error);
            setWhatsappSetting([]);
        }
    };
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const isFormValid = () => {
        const isWhatsAppSettingsValid =
            user.userrole === "USER"
                ? Array.isArray(user.whatsapp_settings) && user.whatsapp_settings.length > 0
                : true;

        return Boolean(user.firstname?.trim()) &&
            Boolean(user.lastname?.trim()) &&
            Boolean(user.email?.trim()) &&
            Boolean(user.whatsapp_number?.trim()) &&
            Boolean(user.whatsapp_number?.length === 10) &&
            phoneRegex.test(user.whatsapp_number) &&
            Boolean(user.userrole?.trim()) &&
            Boolean(option?.value) &&
            !emailError &&
            phoneError === "" &&
            passwordError === "" &&
            isWhatsAppSettingsValid;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const finalUser = {
            ...user,
            isactive: user.isactive !== undefined ? user.isactive : false,
            whatsapp_settings: user.whatsapp_settings || [],
        };

        try {
            if (!finalUser.managerid && option) {
                finalUser.managerid = option.value;
                finalUser.managername = option.label;
            }

            setIsSending(true);

            let result = {};
            if (finalUser.id) {
                if (finalUser.whatsapp_number && finalUser.whatsapp_number.length === 10) {
                    finalUser.whatsapp_number = '91' + finalUser.whatsapp_number;
                }
                result = await WhatsAppAPI.saveUser(finalUser);
            } else {
                if (finalUser.whatsapp_number) {
                    finalUser.whatsapp_number = '91' + finalUser.whatsapp_number;
                }
                result = await WhatsAppAPI.createUser(finalUser);
            }

            if (result.success) {
                toast.success('Record saved successfully.');
                const userId = finalUser.id ? finalUser.id : result.id;
                navigate(`/users/${userId}`, { state: finalUser });
            } else {
                if (typeof result.errors === 'string') {
                    toast.error(`${result.errors}`);
                } else if (Array.isArray(result.errors)) {
                    const errorMessage = result.errors.map(error => error.msg).join(', ');
                    toast.error(`${errorMessage}`);
                } else {
                    toast.error('An unexpected error occurred while saving the record.');
                }
            }
        } catch (error) {
            toast.error('An error occurred while saving the record.');
            //    console.log("Unexpected error during API call:", error);
        } finally {
            setIsSending(false);
        }
    };

    const handleCancel = () => {
        navigate(`/users/`);
    }

    const handleChange = (e) => {
        const { name, value } = e.target;
        setUser({ ...user, [name]: value });

        if (name === 'password') {
            if (value.length < 8) {
                setPasswordError('Password must be at least 8 characters.');
            } else if (value.length > 16) {
                setPasswordError('Password cannot exceed 16 characters.');
            } else {
                setPasswordError('');
            }
        }


        //if (name === "phone") {
        //    if (!phoneRegex.test(value)) {
        //        setPhoneError("Phone number must be exactly 10 digits");
        //    } else {
        //        setPhoneError("");
        //    }
        //}
        if (name === "whatsapp_number" && value.length === 0) {
            setWhatsappError();
        }

        if (name === "whatsapp_number") {
            if (value) {
                if (!phoneRegex.test(value)) {
                    setWhatsappError("Phone number must be exactly 10 digits");
                } else {
                    setWhatsappError();
                }
            } else {
                setWhatsappError();
            }

        }




        if (name === 'email') {
            setEmailError(!emailRegex.test(value) ? 'Invalid email format.' : '');
        }
    };

    const handleActive = (e) => {
        setUser({ ...user, isactive: e.target.checked });
    };

    const handleUsers = (event) => {
        setoption(event);
        // setSelectedUser(event)
        setUser({ ...user, managerid: event.value, managername: event.label });
    }

    const handleTextOnlyChange = (e) => {
        const { name } = e.target;
const value = e.target.value.replace(/[^A-Za-z ]/g, '');

setUser({ ...user, [name]: value });

};

    const togglePasswordVisibility = () => setShowPassword(!showPassword);

    const handleSettingChange = (e) => {
        const selectedId = e.target.value;
    };
    return (
        <>
            <Container className='mt-5'>
                <Row className='mx-5 text-center'>
                    <Col lg={12} xs={12} sm={12}>
                        <div className=' text-center p-2' style={{ height: '40px', backgroundColor: '#ffffff', borderRadius: '5px' }}>
                            <span className='fw-semibold' style={{ color: '#605C68', fontSize: 'large' }}>
                                {user.id ? 'Edit User' : 'Add User'}
                            </span>
                        </div>
                    </Col>
                </Row>
            </Container>

            <Container className='mt-1 mb-5'>
                <Row className='mx-5'>
                    <Col lg={12} sm={12} xs={12} className="mb-2">
                        <Card className='h-100' style={{ border: "none" }}>
                            <Card.Body>

                                <Row className='mb-3'>

                                    <Col lg={6} sm={12} xs={12}>
                                        <Form.Group className="ms-3">
                                            <Form.Label htmlFor="firstname">First Name</Form.Label>
                                            <Form.Control
                                                required
                                                type="text"
                                                name="firstname"
                                                placeholder="Enter first name"
                                                value={user.firstname}
                                               onChange={handleTextOnlyChange}
                                                style={{ height: "36px" }}

                                            />
                                        </Form.Group>
                                    </Col>
                                    <Col lg={6} sm={12} xs={12}>
                                        <Form.Group className="ms-3">
                                            <Form.Label htmlFor="lastname">Last Name</Form.Label>
                                            <Form.Control
                                                required
                                                type="text"
                                                name="lastname"
                                                placeholder="Enter lastname"
                                                value={user.lastname}
                                               onChange={handleTextOnlyChange}
                                                style={{ height: "36px" }}

                                            />
                                        </Form.Group>
                                    </Col>

                                </Row>


                                <Row className='mb-3'>
                                    {/*<Col lg={6} sm={12} xs={12}>
                                        <Form.Group className="ms-3">
                                            <Form.Label htmlFor="phone">Phone</Form.Label>
                                            <Form.Control
                                                style={{ height: "36px" }}
                                                required
                                                type="text"
                                                name="phone"
                                                placeholder="Enter phone"
                                                value={user.phone}
                                                onChange={handleChange}
                                            />
                                            {phoneError && (
                                                <small className="text-danger"> {phoneError}</small>
                                            )}
                                        </Form.Group>
                                    </Col>*/}
                                        <Col lg={6} sm={12} xs={12}>
                                        <Form.Group className="ms-3">
                                            <Form.Label htmlFor="phone">Whatsapp Number
                                            </Form.Label>
                                            <Form.Control
                                                style={{ height: "36px" }}
                                                type="text"
                                                name="whatsapp_number"
                                                placeholder="Enter Whatsapp Number"
                                                value={user.whatsapp_number}
                                                onChange={handleChange}
                                            />
                                            {whatsappError ? (
                                                <small className="text-danger"> {whatsappError}</small>
                                            ) : ''}
                                        </Form.Group>
                                    </Col>
                                    <Col lg={6} sm={12} xs={12}>
                                        <Form.Group className="ms-3">
                                            <Form.Label htmlFor="email">Email</Form.Label>
                                            <Form.Control
                                                style={{ height: "36px" }}
                                                type="email"
                                                required
                                                name="email"
                                                placeholder="Enter email"
                                                value={user.email}
                                                onChange={handleChange}
                                            />
                                            {emailError && (
                                                <small className="text-danger">{emailError}</small>
                                            )}
                                        </Form.Group>
                                    </Col>

                                </Row>

                                {!user.id ?
                                    <Row className='mb-3'>
                                        <Col lg={6} sm={12} xs={12}>
                                            <Form.Group className="ms-3">
                                                <Form.Label htmlFor="password">Password</Form.Label>
                                                <div className="d-flex align-items-center position-relative">
                                                    <Form.Control
                                                        type={showPassword ? "text" : "password"}
                                                        name="password"
                                                        placeholder="Enter Password"
                                                        value={user.password}
                                                        onChange={handleChange}
                                                        required
                                                        style={{ height: "36px" }}
                                                    />
                                                    <span className="position-absolute end-0 me-3" onClick={togglePasswordVisibility}>
                                                        <i className={!showPassword ? "fa fa-eye-slash" : "fa fa-eye"} aria-hidden="true" style={{ cursor: "pointer" }}></i>
                                                    </span>
                                                </div>

                                                {passwordError && (
                                                    <small className="text-danger"> {passwordError}</small>
                                                )}
                                            </Form.Group>
                                        </Col>
                                        <Col lg={6} sm={12} xs={12}>
                                            <Form.Group className="ms-3">
                                                <Form.Label htmlFor="userrole">Role</Form.Label>
                                                <Form.Control
                                                    style={{ height: "36px" }}
                                                    type="text"
                                                    name="userrole"
                                                    placeholder="Enter Role"
                                                    value={user.userrole}
                                                    onChange={handleChange}
                                                    disabled
                                                />

                                            </Form.Group>
                                        </Col>
                                    </Row>
                                    : ''}
                                <Row className='mb-3'>
                                    <Col lg={6} sm={12} xs={12}>
                                        <Form.Group className="ms-3">
                                            <Form.Label htmlFor="ownerid">Manager</Form.Label>
                                            <Select
                                                name="ownerid"
                                                value={option}
                                                className="custom-select username"
                                                onChange={handleUsers}
                                                options={optionUsers}
                                                getOptionValue={(option) => option.value}
                                            />
                                        </Form.Group>
                                    </Col>
                                    <Col lg={6} sm={12} xs={12}>

                                        <Form.Group className="ms-3">
                                            <Form.Label htmlFor="isactive">Active</Form.Label>
                                            <Form.Check

                                                name="isactive"
                                                type="checkbox"
                                                value="true"
                                                checked={user.isactive === true}
                                                id="inline-checkbox-9"
                                                onChange={handleActive}
                                            />
                                        </Form.Group>
                                    </Col>
                                </Row>
                                <Row >

                                    {user.userrole !== 'ADMIN' && (
                                        <Col lg={6} sm={12} xs={12}>
                                            <Form.Group className="ms-3 mb-2">
                                                <Form.Label htmlFor="userrole">Assign WhatsApp Setting</Form.Label>
                                                <Select
                                                    isMulti
                                                    className="custom-select username"
                                                    options={whatsappSetting.map(setting => ({
                                                        value: setting.phone,
                                                        label: `${setting.name} (${setting.phone})`
                                                    }))}
                                                    value={user.whatsapp_settings?.map(phone => ({
                                                        value: phone,
                                                        label: whatsappSetting.find(setting => setting.phone === phone)?.name || phone
                                                    }))}
                                                    onChange={(selected) => {
                                                        const selectedPhones = selected.map(option => option.value);
                                                        setUser({ ...user, whatsapp_settings: selectedPhones });
                                                    }}
                                                />
                                            </Form.Group>
                                        </Col>
                                    )}
                                
                                </Row>

                                <Row>
                                    <Col lg={12} sm={12} xs={12}>
                                        <hr></hr>
                                    </Col>
                                </Row>

                                <Row className='g-0 mb-2'>
                                    <Col lg={12} sm={12} xs={12} className="text-end mt-1">
                                        <Button className='mx-2' variant="light" disabled={isSending} onClick={handleCancel} >
                                            Back
                                        </Button>
                                        <Button variant="outline-secondary" disabled={!isFormValid()} onClick={handleSubmit}>
                                            {isSending ? 'Saving...' : 'Save'}
                                        </Button>


                                    </Col>
                                </Row>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>

                <ToastContainer />
            </Container>
        </>
    )
}

export default UserAdd;