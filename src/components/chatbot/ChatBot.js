import React, { useState } from 'react';
import { Button, Card, Form, InputGroup } from 'react-bootstrap';
import Draggable from 'react-draggable';
import WhatsAppAPI from '../../api/WhatsAppAPI';

const ChatBot = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { sender: "chatgpt", text: 'Please provide your details to get started.' },
    ]);
    const [inputMessage, setInputMessage] = useState('');
    // const [loading, setLoading] = useState(false);
    const [userDetails, setUserDetails] = useState({ firstname: '', lastname: '', phone: '' });
    // const [formSubmitted, setFormSubmitted] = useState(false);
    const [formErrors, setFormErrors] = useState({ firstname: '', lastname: '', phone: '' });
    const [showDetailsForm, setShowDetailsForm] = useState(true);
    const toggleChat = () => setIsOpen(!isOpen);
    const phoneRegex = /^[0-9]{10}$/;

    const handleChange = (e) => {
        const { name, value } = e.target;
        setUserDetails((prevDetails) => ({ ...prevDetails, [name]: value }));
        if (name === 'firstname') {
            setFormErrors((prevErrors) => ({ ...prevErrors, firstname: '' }));
        } else if (name === 'lastname') {
            setFormErrors((prevErrors) => ({ ...prevErrors, lastname: '' }));
        } else if (name === 'phone') {
            setFormErrors((prevErrors) => ({ ...prevErrors, phone: '' }));
        }
    };

    const handleSendMessage = async () => {
        if (!inputMessage.trim()) return;

        const newMessages = [...messages, { sender: "user", text: inputMessage }];
        setMessages(newMessages);
        setInputMessage('');
        // setLoading(true);

        try {

            const response = await WhatsAppAPI.fetchChatGptResponse(inputMessage);
            if (response.success) {
                if (response?.choices?.length > 0) {

                    setMessages((prevMessages) => [
                        ...prevMessages,
                        { sender: "chatgpt", text: response.choices[0].message.content },
                    ]);
                } else {

                    setMessages((prevMessages) => [
                        ...prevMessages,
                        { sender: "chatgpt", text: "Sorry, I couldn't process your request." },
                    ]);
                }
            } else {

                let errorDetails = JSON.parse(response.message.trim());
                const errorMessage = errorDetails.error?.message || "An unknown error occurred.";

                setMessages((prevMessages) => [
                    ...prevMessages,
                    { sender: "chatgpt", text: errorMessage },
                ]);
            }
        } catch (error) {

            setMessages((prevMessages) => [
                ...prevMessages,
                { sender: "chatgpt", text: "An error occurred while fetching the response." },
            ]);
        } finally {
            // setLoading(false);
        }
    };

    const handleFormSubmit = async () => {
        const { firstname, lastname, phone } = userDetails;
        let errors = { firstname: '', lastname: '', phone: '' };

        if (!firstname) {
            errors.firstname = 'First name is required.';
        }
        if (!lastname) {
            errors.lastname = 'Last name is required.';
        }
        if (!phoneRegex.test(phone)) {
            errors.phone = 'Please enter a valid phone number (10 digits).';
        }

        setFormErrors(errors);

        if (!errors.firstname && !errors.lastname && !errors.phone) {
            const response = await WhatsAppAPI.submitLead(userDetails);

            if (response.success) {
                // setFormSubmitted(true);
                setFormErrors({ firstname: '', lastname: '', phone: '' });
                setMessages((prevMessages) => [
                    ...prevMessages,
                    { sender: 'user', text: `Name: ${userDetails.firstname}  ${userDetails.lastname}, Phone: ${userDetails.phone}` },
                    { sender: 'chatgpt', text: 'Thank you! How can I help you further?' },
                ]);
                setUserDetails({ firstname: '', lastname: '', phone: '' });
                setShowDetailsForm(false);
            } else {
                setMessages((prevMessages) => [
                    ...prevMessages,
                    { sender: 'chatgpt', text: response.errors || "An error occurred while submitting your details." },
                ]);
            }

        }
    };


    return (
        <div>
            <Draggable bounds={{ left: -1300, top: -600, right: 10, bottom: 20 }}>
                <Button
                    variant="link"
                    style={{
                        position: 'fixed',
                        bottom: '20px',
                        right: '20px',
                        zIndex: 1000,
                        borderRadius: '50%',
                        width: '45px',
                        height: '45px',
                        fontSize: '18px',
                        backgroundColor: 'rgb(50,89,224)',
                        color: 'white',
                        textDecoration: 'none'
                    }}
                    onClick={toggleChat}
                >
                    {isOpen ? 'X' : <i className="fa-solid fa-comment-dots" style={{ fontSize: '18px' }} aria-hidden="true"></i>}
                </Button>
            </Draggable>

            {isOpen && (
                <Card
                    className="shadow-lg"
                    style={{
                        width: '350px',
                        position: 'fixed',
                        bottom: '100px',
                        right: '20px',
                        zIndex: 1000,
                        maxHeight: '400px',
                        borderRadius: '15px',
                        overflow: 'hidden',
                        padding: '10px',
                        backgroundColor: '#ffffff',
                    }}
                >
                    <Card.Header
                        className="d-flex card-header-blue justify-content-between align-items-center"
                        style={{
                            color: 'white',
                            borderRadius: '5px',
                            padding: '15px 15px',
                        }}
                    >
                        <span style={{ fontSize: '15px' }}>Chat support</span>
                        <div className='d-flex'>
                            <i className="fa fa-times mt-2" style={{ fontSize: '16px', cursor: 'pointer' }} aria-hidden="true" onClick={toggleChat} ></i>

                        </div>
                    </Card.Header>

                    <Card.Body style={{ overflowY: 'auto', height: '350px', padding: '10px', }}>
                        {messages.map((msg, index) => (
                            <div
                                key={index}
                                className={`d-flex ${msg.sender === 'user' ? 'justify-content-end' : 'justify-content-start'}`}
                            >
                                <div
                                    className={`p-3 my-2 w-70 rounded-lg ${msg.sender === 'user' ? ' text-white' : ' border'}`}
                                    style={{
                                        borderRadius: msg.sender === 'user' ? '10px 0 10px 10px' : '0 10px 10px 10px',
                                        backgroundColor: msg.sender === 'user' ? 'rgb(50,89,224)' : '#ffff',
                                    }}
                                >
                                    {msg.text}
                                </div>
                            </div>
                        ))}

                        {showDetailsForm && (
                            <div className='p-3 w-70' style={{ borderRadius: '0 10px 10px 10px', border: '1px solid #ddd' }}>
                                <h6>Enter Your Details</h6>
                                <Form.Group className="mb-2 mt-3">
                                    <Form.Control
                                        type="text"
                                        name="firstname"
                                        placeholder="Enter first name"
                                        value={userDetails.firstname}
                                        onChange={handleChange}
                                        isInvalid={!!formErrors.firstname}

                                    />
                                    <Form.Control.Feedback type="invalid">
                                        {formErrors.firstname}
                                    </Form.Control.Feedback>
                                </Form.Group>
                                <Form.Group className="mb-2">
                                    <Form.Control
                                        type="text"
                                        name="lastname"
                                        placeholder="Enter last name"
                                        value={userDetails.lastname}
                                        onChange={handleChange}
                                        isInvalid={!!formErrors.lastname}

                                    />
                                    <Form.Control.Feedback type="invalid">
                                        {formErrors.lastname}
                                    </Form.Control.Feedback>
                                </Form.Group>
                                <Form.Group className="mb-2">
                                    <Form.Control
                                        type="text"
                                        name="phone"
                                        placeholder="Enter phone number"
                                        value={userDetails.phone}
                                        onChange={handleChange}
                                        isInvalid={!!formErrors.phone}
                                    />
                                    <Form.Control.Feedback type="invalid">
                                        {formErrors.phone}
                                    </Form.Control.Feedback>
                                </Form.Group>
                                <Button
                                    variant="secondary"
                                    onClick={handleFormSubmit}
                                    className='w-100 mt-2'
                                >
                                    Submit
                                </Button>
                            </div>
                        )}
                    </Card.Body>


                    <div
                        style={{
                            padding: '10px',
                            backgroundColor: '#ffffff',
                            display: 'flex',
                            alignItems: 'center',
                        }}
                    >

                        <InputGroup>
                            <Form.Control
                                type="text"
                                placeholder="Type a message..."
                                value={inputMessage}
                                onChange={(e) => setInputMessage(e.target.value)}
                                onKeyPress={(e) => {
                                    if (e.key === 'Enter') handleSendMessage();
                                }}
                                style={{
                                    borderRadius: '5px',
                                    boxShadow: 'none',
                                    borderColor: '#ccc',
                                }}
                                disabled={showDetailsForm}
                            />
                            <Button
                                variant="Link"
                                onClick={handleSendMessage}
                                style={{
                                    width: '35px',
                                    height: '35px',
                                    display: 'flex',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    cursor: 'pointer',
                                    padding: '10px',
                                    border: 'none',
                                    outline: 'none',
                                    backgroundColor: 'transparent',
                                }}
                                disabled={!inputMessage}
                            >
                                <i className="fa-solid fa-location-arrow" style={{ color: 'rgb(50,89,224)', fontSize: '30px', transform: 'rotate(45deg)' }}></i>
                            </Button>
                        </InputGroup>
                    </div>
                </Card>
            )}
        </div>
    );
};

export default ChatBot;