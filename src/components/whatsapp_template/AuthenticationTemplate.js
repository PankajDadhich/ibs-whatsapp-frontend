/**
 * @author      Abdul Pathan
 * @date        Aug, 2024
 * @copyright   www.ibirdsservices.com
 */

import React, { useState, useEffect } from 'react';
import { Button, Card, Col, Container, Form, Row } from 'react-bootstrap';
import { ToastContainer, toast } from 'react-toastify';//npm i react-toastify --force
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from "react-router-dom";
import WhatsAppAPI from '../../api/WhatsAppAPI';

const AuthenticationTemplate = ({ previewData, selectedWhatsAppSetting }) => {
    const navigate = useNavigate();
    const initialFormData = {
        id: '',
        name: '',
        templatename: '',
        language: '',
        status: '',
        category: '',
        add_security_recommendation: false,
        code_expiration_minutes: '',
        footer: '',
        buttons: []
    };

    const [rowData, setRowData] = useState(initialFormData);
    const [isSending, setIsSending] = useState(false);
    const [isSpinner, setIsSpinner] = useState(false);



    useEffect(() => {
        if (previewData && previewData?.category === 'AUTHENTICATION') {
            const buttons = (previewData.buttons || []).map(button => {
                const { otp_type, package_name, signature_hash } = getParams(button?.url) || {};
                return {
                    type: 'OTP',
                    otp_type,
                    ...(otp_type === 'ONE_TAP' && {
                        supported_apps: [{ package_name, signature_hash }]
                    })
                };
            });

            setRowData({
                id: previewData?.id || '',
                name: previewData?.templatename || '',
                language: previewData?.language || '',
                status: previewData?.status || '',
                category: previewData?.category || '',
                footer: previewData?.footer || '',
                add_security_recommendation: previewData?.add_security_recommendation || false,
                code_expiration_minutes: previewData?.code_expiration_minutes || null,
                buttons
            });
        } else {
            setRowData(initialFormData);
        }
    }, [previewData]);


    const getParams = (url) => {
        const urlParams = new URLSearchParams(new URL(url)?.search);
        return {
            otp_type: urlParams.get('otp_type'),
            ...(urlParams.get('otp_type') === 'ONE_TAP' && {
                package_name: urlParams.get('package_name'),
                signature_hash: urlParams.get('signature_hash')
            })
        };
    };

    const handleChange = (event) => {
        const { name, value, type, checked } = event.target;
        if (name === 'otp_type') {
            setRowData(prevState => ({
                ...prevState,
                buttons: [{ ...prevState.buttons[0], otp_type: value, supported_apps: value === 'ONE_TAP' ? [{}] : [] }]
            }));
        } else {
            setRowData(prevState => ({
                ...prevState,
                [name]: type === 'checkbox' ? checked : value
            }));
        }
    };

    const handleInputChange = (index, event) => {
        const { name, value } = event.target;
        const newButtons = [...rowData.buttons];
        newButtons[index].supported_apps[0][name] = value; // Update the specific supported_apps field
        setRowData(prevState => ({
            ...prevState,
            buttons: newButtons
        }));
    };


    const handleSubmit = async (event) => {
        event.preventDefault();


        const codeExpiration = parseInt(rowData.code_expiration_minutes, 10);

        if (!codeExpiration || codeExpiration < 1 || codeExpiration > 90) {
            toast.error('Code expiration must be between 1 and 90 minutes');
            return;
        }

        if (!rowData.name.trim() || !rowData.language || !rowData.code_expiration_minutes || !rowData.add_security_recommendation || rowData.buttons.length < 1) {
            toast.error('Please fill all required fields');
            return;
        }

        if (rowData.buttons[0]?.otp_type === 'ONE_TAP') {
            const { package_name, signature_hash } = rowData.buttons[0].supported_apps[0];
            if (!package_name || !signature_hash) {
                toast.error('Please fill required ONE TAP fields for package name & Signature hash.');
                return;
            }
        }

        setIsSending(true); // Set isSending to true when starting the submission

        const formattedName = rowData.name.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');

        const reqBody = {
            name: formattedName,
            languages: rowData.language,
            category: 'AUTHENTICATION',
            components: [
                {
                    type: 'BODY',
                    add_security_recommendation: rowData.add_security_recommendation
                },
                {
                    type: 'FOOTER',
                    code_expiration_minutes: rowData?.code_expiration_minutes
                },
                {
                    type: 'BUTTONS',
                    buttons: rowData.buttons.map(button => {
                        const baseButton = { otp_type: button.otp_type, type: 'OTP' };
                        if (button.otp_type === 'ONE_TAP') {
                            return {
                                ...baseButton,
                                supported_apps: button.supported_apps.filter(app => app.package_name && app.signature_hash) // Ensure both fields are present
                            };
                        }
                        return baseButton; // Exclude supported_apps for COPY_CODE
                    })
                }
            ]
        };



        try {
            setIsSpinner(true)
            const result = await WhatsAppAPI.upsertAuthTemplate(reqBody,selectedWhatsAppSetting);

            if (result.error) {
                const errorJson = result.error.split(' - ')[1];
                const parsedError = JSON.parse(errorJson);
                const errorMessage = parsedError.error.error_user_msg || parsedError.error.message;
                toast.error(errorMessage);
                setIsSpinner(false)
            } else {
                toast.success('Template save successfully.');
                navigate('/whatsapp_template');
                setIsSpinner(false)
                setRowData(initialFormData); // Reset form data to initial values after successful creation
            }
        } catch (error) {
            toast.error('An unexpected error occurred.');
        } finally {
            setIsSending(false); // Set isSending to false when the submission is complete
            setIsSpinner(false)
        }
    };

    const isFormValid = rowData.name.trim() && rowData.language && rowData.code_expiration_minutes && rowData.add_security_recommendation;

    const handleBack = () => {
        navigate(`/whatsapp_template`);
    }

    return (
        <>
            {!isSpinner ? <>

                <Container className='mt-1'>
                    <Row className='mx-5 g-0'>
                        <Col lg={12} sm={12} xs={12}>
                            <Card className='h-100' style={{ border: "none" }}>
                                <Card.Body>
                                    <Row>
                                        <Col lg={12} sm={12} xs={12}>
                                            <Form.Group className='mx-2 mb-3' controlId="formBasicDescription">
                                                <Form.Label className="form-view-label" htmlFor="formBasicDescription">
                                                    <b>Template name and language</b>
                                                </Form.Label>
                                            </Form.Group>
                                        </Col>
                                    </Row>

                                    <Row className='mb-3'>
                                        <Col lg={6} sm={12} xs={12}>
                                            <Form.Group className='mx-3 mb-3' controlId="formBasicName">
                                                <Form.Label className="form-view-label" htmlFor="formBasicName">
                                                    Template Name
                                                </Form.Label>
                                                <Form.Control
                                                    type="text"
                                                    name="name"
                                                    value={rowData?.name}
                                                    onChange={handleChange}
                                                    placeholder="Enter template name"
                                                    required
                                                    style={{ height: "36px" }}
                                                />
                                            </Form.Group>
                                        </Col>

                                        <Col lg={6} sm={12} xs={12}>
                                            <Form.Group className='mb-2 mx-3'>
                                                <Form.Label className="form-view-label" htmlFor="formBasicLanguage">
                                                    Language
                                                </Form.Label>
                                                <Form.Select
                                                    aria-label="select language"
                                                    name="language"
                                                    value={rowData?.language}
                                                    onChange={handleChange}
                                                    required
                                                    style={{ height: "36px" }}
                                                >
                                                    <option value="">Select Language</option>
                                                    <option value="en">English</option>
                                                    <option value="en_US">English (US)</option>
                                                    <option value="en_GB">English (UK)</option>
                                                    <option value="hi">Hindi</option>
                                                    <option value="ur">Urdu</option>
                                                </Form.Select>
                                            </Form.Group>
                                        </Col>
                                    </Row>

                                    <Row className='g-0 mb-3'>
                                        <Col lg={6} sm={12} xs={12}>
                                            <Form.Group className='mx-3 mb-3' controlId="formBasicCodeExpiration">
                                                <Form.Label className="form-view-label" htmlFor="formBasicCodeExpiration">
                                                    Code Expiration Minutes <i className="fa-solid fa-circle-info" title='Enter a value between 1 and 90.'></i>
                                                </Form.Label>
                                                <Form.Control
                                                    type="number"
                                                    name="code_expiration_minutes"
                                                    value={rowData?.code_expiration_minutes}
                                                    onChange={handleChange}
                                                    placeholder="Enter code expiration in minutes"
                                                    required
                                                    style={{ height: "36px" }}
                                                />
                                            </Form.Group>
                                        </Col>
                                        <Col lg={6} sm={12} xs={12} className='mt-4 pt-3'>
                                            <Form.Group className='mx-3 mb-3' controlId="formBasicSecurityRecommendation">
                                                <Form.Check
                                                    className='mx-3'
                                                    name='add_security_recommendation'
                                                    type="checkbox"
                                                    checked={rowData?.add_security_recommendation}
                                                    onChange={handleChange}
                                                    label="Add Security Recommendation"
                                                    style={{ height: "36px" }}
                                                />
                                            </Form.Group>
                                        </Col>
                                    </Row>

                                    <Row className='g-0 mb-3'>
                                        <Col lg={6} sm={12} xs={12}>
                                            <Form.Group className='mb-2 mx-3'>
                                                <Form.Label className="form-view-label" htmlFor="formBasicLanguage">
                                                    OTP Type
                                                </Form.Label>
                                                <Form.Select
                                                    aria-label="select OTP"
                                                    name="otp_type"
                                                    value={rowData?.buttons[0]?.otp_type || ''}
                                                    onChange={handleChange}
                                                    required
                                                    style={{ height: "36px" }}
                                                >
                                                    <option value="">Select OTP Type</option>
                                                    <option value="COPY_CODE">Copy Code</option>
                                                    <option value="ONE_TAP">One Tap</option>
                                                </Form.Select>
                                            </Form.Group>
                                        </Col>
                                    </Row>

                                    {rowData?.buttons[0]?.otp_type === 'ONE_TAP' &&
                                        <Row className='g-0 mb-3'>
                                            <Col lg={6} sm={12} xs={12}>
                                                <Form.Group className='mx-3 mb-3' controlId="formBasicCodeExpiration">
                                                    <Form.Label className="form-view-label" htmlFor="formBasicCodeExpiration">
                                                        Package Name
                                                    </Form.Label>
                                                    <Form.Control
                                                        type="text"
                                                        name="package_name"
                                                        value={rowData?.buttons[0]?.supported_apps[0]?.package_name}
                                                        onChange={e => handleInputChange(0, e)}
                                                        placeholder="com.example.luckyshrub"
                                                        required
                                                        style={{ height: "36px" }}
                                                    />
                                                </Form.Group>

                                            </Col>
                                            <Col lg={6} sm={12} xs={12}>
                                                <Form.Group className='mx-3 mb-3' controlId="formBasicCodeExpiration">
                                                    <Form.Label className="form-view-label" htmlFor="formBasicCodeExpiration">
                                                        Signature Hash
                                                    </Form.Label>
                                                    <Form.Control
                                                        type="text"
                                                        name="signature_hash"
                                                        value={rowData?.buttons[0]?.supported_apps[0]?.signature_hash}
                                                        onChange={e => handleInputChange(0, e)}
                                                        placeholder="K8a/AINcGX7"
                                                        required
                                                        style={{ height: "36px" }}
                                                    />
                                                </Form.Group>
                                            </Col>
                                        </Row>
                                    }

                                    <Row className='mt-2'>
                                        <Col lg={12} sm={12} xs={12}>
                                            <hr></hr>
                                        </Col>
                                    </Row>

                                    <Row className='g-0 mb-2'>
                                        <Col lg={12} sm={12} xs={12} className="text-end mt-2">
                                            <Button className='mx-2' variant="light" onClick={handleBack} disabled={isSending}>
                                                Back
                                            </Button>
                                            <Button variant="outline-secondary" disabled={!isFormValid || isSending} onClick={handleSubmit}>
                                                {isSending ? 'Submitting...' : 'Submit for Review'}
                                            </Button>
                                        </Col>
                                    </Row>
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row >
                </Container >

            </>
                :
                <Container className='mt-1'>
                    <Row className='mx-5'>
                        <Col lg={12} sm={12} xs={12}>
                            <Card className='h-100' style={{ border: "none" }}>
                                <Card.Body>
                                    <Row className='mb-3'>
                                        <Col lg={12} sm={12} xs={12}>
                                            <div className="sk-cube-grid">
                                                <div className="sk-cube sk-cube1"></div>
                                                <div className="sk-cube sk-cube2"></div>
                                                <div className="sk-cube sk-cube3"></div>
                                                <div className="sk-cube sk-cube4"></div>
                                                <div className="sk-cube sk-cube5"></div>
                                                <div className="sk-cube sk-cube6"></div>
                                                <div className="sk-cube sk-cube7"></div>
                                                <div className="sk-cube sk-cube8"></div>
                                                <div className="sk-cube sk-cube9"></div>
                                            </div>
                                        </Col>
                                    </Row>
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row >
                </Container >
            }


            <ToastContainer />
        </>
    );
}

export default AuthenticationTemplate;
