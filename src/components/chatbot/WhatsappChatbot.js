import React, { useState, useRef, useEffect } from 'react';
import { Button, Card, Col, Form, InputGroup, Row } from 'react-bootstrap';
import Draggable from 'react-draggable';
import WhatsAppAPI from '../../api/WhatsAppAPI';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const WhatsappChatbot = ({ socket }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        // { sender: "Incoming", text: 'Please provide your details to get started.' },
    ]);
    const [inputMessage, setInputMessage] = useState('');
    const [userDetails, setUserDetails] = useState({ parent_id: null, name: '', phone: '', recordtypename: '' });
    const [formErrors, setFormErrors] = useState({ phone: '' });
    const [showDetailsForm, setShowDetailsForm] = useState(true);
    const toggleChat = () => setIsOpen(!isOpen);
    const phoneRegex = /^[0-9]{10}$/;
    const chatContainerRef = useRef(null);
    // const [showHide, setShowHide] = useState();
    const [noChatMessage, setNoChatMessage] = useState(false);
    const [receivedMessage, setReceivedMessage] = useState();

    useEffect(() => {
        socket?.on("receivedwhatsappmessage", (data) => {
            setReceivedMessage(data);
        })
    }, [socket]);

    useEffect(() => {
        if (userDetails?.phone) {
            getMessageHistotyRecords(userDetails?.phone)
        }
    }, [receivedMessage]);



    useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, [messages]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        // setPhonenumber(e.target.value)
        setUserDetails((prevDetails) => ({ ...prevDetails, [name]: value }));
        if (name === 'phone') {
            setFormErrors((prevErrors) => ({ ...prevErrors, phone: '' }));
        }
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();

        const { phone } = userDetails;
        let errors = { phone: '' };

        if (!phoneRegex.test(phone.trim())) {
            errors.phone = 'Please enter a valid phone number (10 digits).';
        }

        setFormErrors(errors);

        if (!errors.phone.trim()) {
            getMessageHistotyRecords(userDetails.phone.trim());
            setShowDetailsForm(false);
        }
    }

    const getMessageHistotyRecords = async (number) => {
        if (number) {
            let whatsapp_number = number;
            if (number.length === 10) {
                whatsapp_number = '91' + number
            }
            const msgHistory = await WhatsAppAPI.getMsgHistoryRecords(whatsapp_number);

            if (msgHistory.success) {
                const validRecord = msgHistory.records.find(record =>
                    record.name && record.whatsapp_number && record.recordtypename
                );

                if (validRecord) {
                    const { parent_id, name, whatsapp_number, recordtypename } = validRecord;
                    setUserDetails({ parent_id: parent_id, name: name, phone: whatsapp_number, recordtypename: recordtypename });
                }
                const historyMessages = msgHistory.records.filter((msg) => msg.chatmsg !== '').map((msg) => ({
                    sender: msg.status === 'Outgoing' ? 'Outgoing' : 'Incoming',
                    text: msg.chatmsg,
                }));
                setMessages(historyMessages);
            } else {
                setMessages([]);
                setNoChatMessage(true);
            }
        }

    }

    const handleSendMessage = async () => {
        if (!inputMessage.trim()) return;
        if (userDetails.phone) {
            if (inputMessage.trim()) {
                const singleText = {
                    messaging_product: "whatsapp",
                    recipient_type: "individual",
                    to: userDetails?.phone,
                    type: "text",
                    text: {
                        preview_url: false,
                        body: inputMessage
                    }
                }
                const result = await WhatsAppAPI.sendSingleWhatsAppTextMessage(singleText);
                if (result.error) {
                    toast.error(`Error: ${result.error}`);
                } else {
                    const newMessage = {
                        parent_id: userDetails.parent_id || null,
                        name: userDetails.name || '',
                        message_template_id: null,
                        whatsapp_number: userDetails.phone,
                        message: inputMessage,
                        status: 'Outgoing',
                        recordtypename: userDetails.recordtypename || '',
                        file_id: null,
                        is_read: true,
                        // business_number: phoneNumber,
                        message_id: result?.messages[0]?.id,
                        interactive_id: null
                    }

                    const responce = await WhatsAppAPI.insertMsgHistoryRecords(newMessage);
                    getMessageHistotyRecords(userDetails.phone);
                    toast.success("Message sent successfully.");
                    setInputMessage('');
                }
            } else {
                toast.error("Error: Input field required, please enter text here.",);
            }
        } else {
            toast.error('WhatsApp number is required.');
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
                    {isOpen ? 'X' : <i className="fa-brands fa-whatsapp" style={{ fontSize: '18px' }} aria-hidden="true"></i>}
                </Button>
            </Draggable>

            {isOpen && (
                <Card
                    className="shadow-lg"
                    style={{
                        width: '400px',
                        position: 'fixed',
                        bottom: '100px',
                        right: '20px',
                        zIndex: 1000,
                        maxHeight: '500px',
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
                            padding: '10px 10px',
                        }}
                    >

                        <span style={{ fontSize: '13px' }} className='mt-1'>
                            {userDetails.name && userDetails.phone ? `${userDetails.name} ${userDetails.phone}` : 'Chat support'}
                        </span>

                        <div className='d-flex'>
                            <Button
                                variant="link"
                                className="text-white"
                                onClick={() => {
                                    setShowDetailsForm(true);
                                    setMessages([]);
                                    setUserDetails({ parent_id: null, name: '', phone: '', recordtypename: '' });
                                    setNoChatMessage(false);
                                }}
                                style={{ textDecoration: 'none' }}
                            >
                                <i className="fa-solid fa-arrow-left" title='Back'></i>
                            </Button>
                            <i className="fa fa-times mt-2" style={{ fontSize: '16px', cursor: 'pointer' }} aria-hidden="true" onClick={toggleChat} title='Close' ></i>
                        </div>
                    </Card.Header>

                    <Card.Body ref={chatContainerRef} style={{ overflowY: 'auto', height: '350px', padding: '10px', }}>
                        {messages.map((msg, index) => (
                            <div
                                key={index}
                                className={`d-flex ${msg.sender === 'Outgoing' ? 'justify-content-end' : 'justify-content-start'}`}
                            >
                                <div
                                    className={`p-3 my-2 w-70 rounded-lg ${msg.sender === 'Outgoing' ? ' text-white' : ' border'}`}
                                    style={{
                                        borderRadius: msg.sender === 'Outgoing' ? '10px 0 10px 10px' : '0 10px 10px 10px',
                                        backgroundColor: msg.sender === 'Outgoing' ? 'rgb(50,89,224)' : '#ffff',
                                    }}
                                >
                                    {msg.text}
                                </div>
                            </div>
                        ))}

                        {noChatMessage && (
                            <div className='p-3 w-100' style={{ borderRadius: '0 10px 10px 10px', border: '1px solid #ddd' }}>
                                There are no chats available here. Sending your first message is necessary because you haven't chatted before. Send your initial message using the Send button below.
                            </div>
                        )}

                        {showDetailsForm && (
                            <Row>
                                <Col lg={12} xs={12} sm={12}>
                                    <Form.Group className="mb-2">
                                        <Form.Label htmlFor="title">Enter whatsapp number to start chat with</Form.Label>
                                        <Form.Control
                                            style={{ height: "36px" }}
                                            type="text"
                                            name="phone"
                                            placeholder="Please enter whatsapp number"
                                            value={userDetails.phone}
                                            onChange={handleChange}
                                            isInvalid={!!formErrors.phone}
                                        />
                                        <Form.Control.Feedback type="invalid">
                                            {formErrors.phone}
                                        </Form.Control.Feedback>
                                    </Form.Group>
                                </Col>
                                <Col lg={12} xs={12} sm={12} className='text-center'>
                                    <Button variant="outline-secondary" onClick={handleFormSubmit} className='mt-2 mx-2' >
                                        Start chat
                                    </Button>
                                </Col>
                            </Row>
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
                                disabled={showDetailsForm || noChatMessage}
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

export default WhatsappChatbot;