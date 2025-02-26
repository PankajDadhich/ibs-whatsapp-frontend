/**
 * @author      Abdul Pathan
 * @date        Aug, 2024
 * @copyright   www.ibirdsservices.com
 */

import React, { useEffect, useRef, useState } from 'react';
import { Row, Col, Card, Dropdown, Image, Badge } from 'react-bootstrap';
import WhatsAppAPI from '../../api/WhatsAppAPI';
import { toast } from 'react-toastify';//npm i react-toastify --force
import 'react-toastify/dist/ReactToastify.css';
import TemplateModal from './TemplateModal';
import moment from 'moment';
import SendFileModal from './SendFileModal';
import { NameInitialsAvatar } from 'react-name-initials-avatar'; // npm install react-name-initials-avatar --force
import jwt_decode from "jwt-decode";
import MessageTemplateModal from './MessageTemplateModal';

const WhatsAppChat = ({ show, onHide, userDetail, socket, filterData, selectedWhatsAppSetting }) => {
    const [userInfo, setUserInfo] = useState(jwt_decode(sessionStorage.getItem('token')));
    const [input, setInput] = useState('');
    const [messages, setMessages] = useState([]);
    const [receivedMessage, setReceivedMessage] = useState();
    const [showHideModal, setShowHideModal] = useState(false);
    const [showHideBulkModal, setShowHideBulkModal] = useState(false);
    const [contactData, setContactData] = useState();
    const [groupData, setGroupData] = useState();
    const chatWindowRef = useRef(null);
    const [fileModalShowHide, setFileModalShowHide] = useState(false);
    const pdfIcon = '/user_images/pdf-icon-png.jpg';
    const docxIcon = '/user_images/doc-icon.png';
    const xlsIcon = '/user_images/xls-icon.png';
    const mapIcon = '/user_images/google-maps.jpg';
    const textIcon = '/user_images/text-file.jpg';
    const [bgColors, setBgColors] = useState(['#d3761f', '#00ad5b', '#debf31', '#239dd1', '#b67eb1', '#d3761f', '#de242f']);
    const [brokenImages, setBrokenImages] = useState([]);
    let colIndex = 0;

    useEffect(() => {
       socket?.on("receivedwhatsappmessage", (data) => {
        // console.log("daata",data);
            setReceivedMessage(data);
        })
        return () => {
            socket?.off("receivedwhatsappmessage");
        };
    }, [socket]);

    useEffect(() => {
        if (chatWindowRef.current) {
            chatWindowRef.current.scrollTop = chatWindowRef.current.scrollHeight;
        }
    }, [messages]);


    useEffect(() => {
        getMessageHistotyRecords(selectedWhatsAppSetting);
    }, [userDetail.id, receivedMessage, selectedWhatsAppSetting]);


    const getMessageHistotyRecords = async (selectedWhatsAppSetting) => {
        if (userDetail.id && userDetail.whatsapp_number) {
            const result = await WhatsAppAPI.getMsgHistoryRecords(userDetail.whatsapp_number,selectedWhatsAppSetting);
            if (result.success) {
                setMessages(result?.records);
            } else {
                setMessages([]);
            }
        }
        else if (userDetail.id && !userDetail.whatsapp_number) {
            const result = await WhatsAppAPI.getGroupHistoryRecords(userDetail.id, selectedWhatsAppSetting);
            if (result.success) {
                setMessages(result?.records);
            } else {
                setMessages([]);
            }

        } else {
            setMessages([]);
        }
    }

    // send whatsapp template message
    const sendTemplateMessage = async () => {
        if (userDetail.id && userDetail.whatsapp_number) {
            setShowHideModal(true);
            setContactData(userDetail)
        } else {
            toast.error('Error: WhatsApp number is required.');
        }
    }


    const sendBulkTemplateMessage = () => {
        if (userDetail.id && !userDetail.whatsapp_number) {
            setShowHideBulkModal(true);
            setGroupData([userDetail])
        } else {
            toast.error('Error: WhatsApp number is required.');
        }
    }

    const handleKeyDown = (event) => {
        if (event.key === 'Enter') {
            // event.preventDefault();
            handleSubmit();
        }
    }

    const handleSubmit = async (event) => {
        // event.preventDefault();
        if (userDetail.whatsapp_number) {
            if (input.trim()) {
                const singleText = {
                    messaging_product: "whatsapp",
                    recipient_type: "individual",
                    to: userDetail?.whatsapp_number,
                    type: "text",
                    text: {
                        preview_url: false,
                        body: input
                    }
                }
                const result = await WhatsAppAPI.sendSingleWhatsAppTextMessage(singleText, selectedWhatsAppSetting);
                if (result.error) {
                    toast.error(`Error: ${result.error}`);
                } else {
                    const messageId = result?.messages[0]?.id;

                    const newMessage = {
                        parent_id: userDetail.id || null,
                        name: userDetail.contactname || '',
                        message_template_id: null,
                        whatsapp_number: userDetail.whatsapp_number,
                        message: input,
                        status: 'Outgoing',
                        recordtypename: filterData?.recordType || '',
                        file_id: null,
                        is_read: true,
                        business_number : selectedWhatsAppSetting,
                        message_id:messageId
                    }

                    const responce = await WhatsAppAPI.insertMsgHistoryRecords(newMessage);

                    getMessageHistotyRecords(selectedWhatsAppSetting);
                    toast.success("Message sent successfully.");
                    setInput('');
                }
            } else {
                toast.error("Error: Input field required, please enter text here.",);
            }
        } else {
            toast.error('WhatsApp number is required.');
        }
    };

    const refreshData = () => {
        getMessageHistotyRecords(selectedWhatsAppSetting);
        setShowHideModal();
        setShowHideBulkModal();
    }
    const refreshImageData = () => {
        getMessageHistotyRecords(selectedWhatsAppSetting);
        setFileModalShowHide();
    }

    //close
    const onCancelButton = () => {
        onHide(false)
    }

    const onUploadFile = () => {
        if (userDetail.id) {
            setFileModalShowHide(true);
        }
    }

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text).then(() => {
            toast.success("Code copied to clipboard!");
        }).catch(err => {
        //    console.log("Error copying text: ", err);
        });
    };


    const renderFilePreview = (msg) => {
        // console.log("msg",msg);
        const isLink = msg.chatmsg && msg.chatmsg.match(/(https?:\/\/[^\s]+)/g);
        const googleMapsUrlRegex = /https?:\/\/(www\.)?google\.com\/maps\/.+|https?:\/\/maps\.app\.goo\.gl\/[a-zA-Z0-9]+/g;
        const googleMapsUrlMatch = msg.chatmsg && msg.chatmsg.match(googleMapsUrlRegex);
        const fileUrl = msg.file_id ? `/public/${userInfo.tenantcode}/attachment/${msg.title}` : msg.header_body;
        // const formatMessage = (message) => {
        //     return message.split('\n').map((line, index) => (
        //         <span key={index}>
        //             {line}
        //             <br />
        //         </span>
        //     ));
        // };

        const formatMessage = (message, exampleBodyText) => {
            let formattedMessage = message
                .replace(/\*(.*?)\*/g, "<b>$1</b>")   // Bold
                .replace(/_(.*?)_/g, "<i>$1</i>")    // Italics
                .replace(/~(.*?)~/g, "<s>$1</s>")    // Strikethrough
                .replace(/```(.*?)```/gs, "<pre>$1</pre>") // Code Block
                .replace(/\n+/g, "<br />");  // Line Breaks
            try {
                if (exampleBodyText && exampleBodyText.trim().startsWith("{")) {
                    const replacements = JSON.parse(exampleBodyText);
        
                    formattedMessage = formattedMessage.replace(/{{(\d+)}}/g, (_, index) => {
                        return replacements[index] || `{{${index}}}`; // Replace with value or keep placeholder
                    });
                }
            } catch (error) {
                console.error("Error parsing example_body_text", error);
            }
        
            return <span dangerouslySetInnerHTML={{ __html: formattedMessage }} />;
        };
        
        

        if (googleMapsUrlMatch) {
            const mapUrl = googleMapsUrlMatch[0];
            return (
                <div style={{ position: 'relative' }}>
                    <a href={mapUrl} target="_blank" rel="noopener noreferrer">
                        <img
                            src={mapIcon}
                            alt="Location Map Preview"
                            style={{ width: '100%', height: '200px', objectFit: 'contain', borderRadius: '8px' }}
                        />
                    </a>
                </div>
            );
        } else if (isLink) {
            return (
                <div className='text-break'>
                    <a href={msg.chatmsg} target="_blank" rel="noopener noreferrer">
                        {msg.chatmsg}
                    </a>
                </div>
            );
        } else if (msg.chatmsg) {
            return (
                <div>
                    {formatMessage(msg.chatmsg)}
                </div>
            );
        } else if (msg.header) {
            return (
                <div>
                    {msg.header === 'IMAGE' && (
                        <a href={fileUrl} target="_blank" rel="noopener noreferrer">
                            <Image
                                variant="top"
                                src={fileUrl}
                                thumbnail
                                alt="image"
                                style={{ width: '100%', objectFit: 'contain', maxHeight: '20rem' }}
                            />
                        </a>
                    )}
                    {msg.header === 'DOCUMENT' && (
                        <a href={fileUrl} target="_blank" rel="noopener noreferrer">
                            <img
                                src={pdfIcon}
                                alt="Pdf Preview"
                                style={{ width: '100%', height: '200px', objectFit: 'contain', borderRadius: '8px', backgroundColor: 'white' }}
                            />
                        </a>
                    )}
                    {msg.header === "VIDEO" && (
                        <video width="293" height="170" controls>
                            <source src={fileUrl} type="video/mp4" />
                            Your browser does not support the video tag.
                        </video>
                    )}
                    {msg.message_body && (
                        <div className='mt-2 ms-1'>
                            <p className='fw-bold mb-1 text-capitalize'>{(msg?.header_body && msg.header === "TEXT") && msg?.header_body}</p>
                            <p className='mb-1'> {formatMessage(msg.message_body, msg.example_body_text)}</p>
                            <p className='mb-1 text-secondary'> {msg?.footer}</p>
                        </div>
                    )}
                </div>
            );
        }

        if (msg.message_body) {
            return (
                <div>
                  {formatMessage(msg.message_body, msg.example_body_text)}
                    {/* {formatMessage(msg.message_body)} */}
                    {msg?.footer}
                </div>
            );
        }


        // const fileUrl = `/public/${userInfo.tenantcode}/attachment/${msg.title}`;
        switch (msg.filetype) {
            case 'jpeg':
            case 'jpg':
            case 'png':
            case 'webp':
                return (
                    <div>
                        <a href={fileUrl} target="_blank" rel="noopener noreferrer">
                            <img
                                src={fileUrl}
                                alt={msg.title}
                                style={{ width: '100%', height: '200px', objectFit: 'contain', maxWidth: '100%', maxHeight: '200px' }}
                            />
                        </a>
                       <br/>  {msg?.description}
                    </div>
                );
            case 'pdf':
                return (
                    <div style={{ position: 'relative' }}>
                        <a href={fileUrl} target="_blank" rel="noopener noreferrer">
                            <img
                                src={pdfIcon}
                                alt="Pdf Preview"
                                style={{ width: '100%', height: '200px', objectFit: 'contain', borderRadius: '8px', backgroundColor: 'white' }}
                            />
                        </a>
                        <div className="mt-2">
                            <a className='text-break' href={fileUrl} target="_blank" rel="noopener noreferrer">
                                {msg.title}
                            </a>
                        </div>
                    </div>
                );
            case 'aac':
            case 'mpeg':
            case 'mp3':
            case 'amr':
            case 'ogg':
            case 'opus':
                return (
                    <div>
                        <audio controls>
                            <source src={fileUrl} type={`audio/${msg.filetype}`} />
                        </audio>
                    </div>
                );
            case 'ppt':
            case 'pptx':
            case 'doc':
            case 'docx':
                return (
                    <div style={{ position: 'relative' }}>
                        <a href={fileUrl} target="_blank" rel="noopener noreferrer">
                            <img
                                src={docxIcon}
                                alt={`${msg.filetype.toUpperCase()} Preview`}
                                style={{ width: '100%', height: '200px', objectFit: 'contain', borderRadius: '8px', backgroundColor: 'white' }}
                            />
                        </a>
                        <div className="mt-2">
                            <a className='text-break' href={fileUrl} target="_blank" rel="noopener noreferrer">
                                {msg.title}
                            </a>
                        </div>
                    </div>
                );
            case 'xlsx':
            case 'xls':
                return (
                    <div style={{ position: 'relative' }}>
                        <a href={fileUrl} target="_blank" rel="noopener noreferrer">
                            <img
                                src={xlsIcon}
                                alt={`${msg.filetype.toUpperCase()} Preview`}
                                style={{ width: '100%', height: '200px', borderRadius: '8px', objectFit: 'contain', backgroundColor: 'white' }}
                            />
                        </a>
                        <div className="mt-2">
                            <a className='text-break' href={fileUrl} target="_blank" rel="noopener noreferrer">
                                {msg.title}
                            </a>
                        </div>
                    </div>
                );
            case 'txt':
                return (
                    <div style={{ position: 'relative' }}>
                        <a href={fileUrl} target="_blank" rel="noopener noreferrer">
                            <img
                                src={textIcon}
                                alt={`${msg.filetype.toUpperCase()} Preview`}
                                style={{ width: '100%', height: '200px', borderRadius: '8px', objectFit: 'contain', backgroundColor: 'white' }}
                            />
                        </a>
                        <div className="mt-2">
                            <a className='text-break' href={fileUrl} target="_blank" rel="noopener noreferrer">
                                {msg.title}
                            </a>
                        </div>
                    </div>
                );
            case 'mp4':
            case '3gpp':
                return (
                    <div>
                        <video controls style={{ maxWidth: '100%', maxHeight: '200px' }}>
                            <source src={fileUrl} type={`video/${msg.filetype}`} />
                            Your browser does not support the video element.
                        </video>
                    </div>
                );
            default:
                return (
                    <div style={{ marginTop: '10px', display: 'flex', alignItems: 'center' }}>
                        <a className='text-break' href={fileUrl} target="_blank" rel="noopener noreferrer">
                            {msg.title}
                        </a>
                    </div>
                );
        }
    };


    const renderWebsiteAndCall = (msg) => {
        return (
            <div className='d-flex flex-column align-items-center'>
                <div className='text-center'>
                    {msg.buttons && msg.buttons.length > 0 && (
                        msg.buttons.map((item, index) => {
                            // if (item.text === "website") {
                            if (item.type === "URL" && item.text !== "Copy code" && item.text !== "कोड कॉपी करें") {
                                return (
                                    <a
                                        key={index}
                                        href={item.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        style={{ textDecoration: 'none' }}
                                    >
                                        <Badge
                                            bg="light"
                                            text="primary"
                                            className="mb-2"
                                            style={{
                                                padding: '10px 40px',
                                                fontSize: '0.9rem',
                                                borderRadius: '0.5rem',
                                                display: 'block',
                                                textAlign: 'center'
                                            }}
                                        >
                                            <i className="fa fa-external-link me-2"></i>
                                            {item.text}
                                        </Badge>
                                    </a>
                                );
                            } else if (item.type === "PHONE_NUMBER") {
                                return (
                                    <a
                                        key={index}
                                        href={`tel:${item.phone_number}`}
                                        style={{ textDecoration: 'none' }}
                                    >
                                        <Badge
                                            bg="light"
                                            text="primary"
                                            className="mb-2"
                                            style={{
                                                padding: '10px 40px',
                                                fontSize: '0.9rem',
                                                borderRadius: '0.5rem',
                                                display: 'block',
                                                textAlign: 'center'
                                            }}
                                        >
                                            <i className="fa fa-phone me-2"></i>
                                            {item.text}
                                        </Badge>
                                    </a>
                                );
                            } else if (item.text === "Copy code" || item.text === "कोड कॉपी करें") {
                                return (
                                    <div
                                        key={index}
                                        onClick={() => copyToClipboard(msg.example_body_text)}
                                        style={{ cursor: 'pointer', textAlign: 'center' }}
                                    >
                                        <Badge
                                            bg="light"
                                            text="primary"
                                            className="mb-2"
                                            style={{
                                                padding: '10px 40px',
                                                fontSize: '0.9rem',
                                                borderRadius: '0.5rem',
                                                display: 'block'
                                            }}
                                        >
                                            <i className="fa fa-copy me-2"></i>
                                            {item.text}
                                        </Badge>
                                    </div>
                                );
                            } else if (item.type === "QUICK_REPLY") {
                                return (

                                    <Badge
                                        bg="light"
                                        text="primary"
                                        className="mb-2"
                                        style={{
                                            padding: '10px 40px',
                                            fontSize: '0.9rem',
                                            borderRadius: '0.5rem',
                                            display: 'block'
                                        }}
                                    >
                                        {item.text}
                                    </Badge>
                                );
                            }

                            return null; // Return null if button type is unrecognized
                        })
                    )}
                </div>

            </div>
        );
    };

    const hasOutgoingMessage = messages?.some(message => message.status === 'Incoming');


    const fillBgBolor = () => {
        colIndex += 1;
        if (colIndex >= bgColors.length)
            colIndex = 0;
        return bgColors[colIndex];
    }

    const groupedMessages = messages?.reduce((groups, msg) => {
        const date = moment(msg.createddate).format('YYYY-MM-DD');
        groups[date] = groups[date] || [];
        groups[date].push(msg);
        return groups;
    }, {});

    const getDateLabel = (dateStr) => {
        const messageDate = moment(dateStr);
        if (messageDate.isSame(moment(), 'day')) return 'Today';
        if (messageDate.isSame(moment().subtract(1, 'days'), 'day')) return 'Yesterday';
        return messageDate.format('MMMM D, YYYY');
    };

    return (
        <>
            <Card className='h-100' >

                <Card.Header className='p-3'>
                    <Row className='g-0' >
                        <Col className='text-uppercase' lg={7} xs={6} sm={6} style={{ display: "flex", alignItems: "stretch", }}>
                            {brokenImages.includes(`img-${userDetail?.id}`) ? (
                                <NameInitialsAvatar size='30px' textSize='12px'
                                    bgColor={fillBgBolor()}
                                    borderWidth="0px"
                                    textColor="#fff"
                                    name={userDetail.contactname || "Unknown"}
                                />
                            ) : (
                                <img alt=''
                                    style={{ height: "30px", width: "30px", objectFit: "cover" }}
                                    src={`/${userInfo.tenantcode}/users/${userDetail?.id}`}
                                    // src={`https://api.indicrm.io/images/${userInfo.tenantcode}/users/${userDetail?.id}.thumbnail`}
                                    className="rounded-circle"
                                    onError={() => setBrokenImages((prev) => [...prev, `img-${userDetail?.id}`])}
                                    id={`img-${userDetail?.id}`}
                                />
                            )}

                            <span className='fw-bold mx-3 mt-1 text-capitalize' style={{ fontSize: "15px", color: "white" }}>
                                {userDetail?.contactname || "Unknown"} <span className='fw-light'>{userDetail?.whatsapp_number}</span>
                            </span>
                        </Col>
                        <Col lg={5} xs={3} sm={3} className='text-end'>
                            <Dropdown>
                                <Dropdown.Toggle style={{ border: "none" }} title='Action'>
                                    <i className="fa-solid fa-ellipsis-vertical"></i>
                                </Dropdown.Toggle>
                                <Dropdown.Menu >
                                    <Dropdown.Item onClick={filterData?.recordType === 'groups' ? sendBulkTemplateMessage : sendTemplateMessage}>Send Message</Dropdown.Item>
                                    <Dropdown.Item onClick={onCancelButton}>Close</Dropdown.Item>
                                </Dropdown.Menu>
                            </Dropdown>
                        </Col>
                    </Row>
                </Card.Header>

                {messages?.length > 0 ? (
                    <div ref={chatWindowRef} className='chat-window' style={{ height: '35rem', overflowY: 'scroll', overflowX: 'hidden', background: '#efe7dd' }}>
                        <Card.Body className=''>
                            <Row className='g-0'>
                                <Col lg={12} sm={12} xs={12} className='mb-2'>
                                    {/* {messages?.map((msg, index) => (
                                        <div className='conversation' key={index}>
                                            <div className='conversation-container'>
                                                <div className={`message ${msg.status === 'Incoming' ? 'received' : 'sent'}`}>
                                                    <div>
                                                        {renderFilePreview(msg)}
                                                    </div>
                                                    {(msg.buttons && msg.buttons.length > 0) &&
                                                        <div className='mb-1 mt-3'>
                                                            {renderWebsiteAndCall(msg)}
                                                        </div>
                                                    }

                                                    <span className='metadata'>
                                                        <span className='time'>
                                                            {moment(msg.createddate).format('M/D/YYYY, h:mm A')}
                                                        </span>
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    ))} */}
                                    {Object.entries(groupedMessages)
                                        .sort(([dateA], [dateB]) => moment(dateA).diff(moment(dateB)))
                                        .map(([date, dateMessages]) => (
                                            <div key={date}>

                                                <div className="text-center my-1">
                                                    <span className="px-3 py-1 rounded-pill bg-body-secondary">
                                                        {getDateLabel(date)}
                                                    </span>
                                                </div>
                                                {dateMessages.map((msg, index) => (
                                                    <div className="conversation" key={index}>
                                                        <div className='conversation-container'>
                                                            <div className={`message ${msg.status === 'Incoming' ? 'received' : 'sent'}`}>
                                                                <div>
                                                                    {renderFilePreview(msg)}
                                                                </div>
                                                                {(msg.buttons && msg.buttons.length > 0) &&
                                                                    <div className='mb-1 mt-3'>
                                                                        {renderWebsiteAndCall(msg)}
                                                                    </div>
                                                                }

                                                                <span className='metadata'>
                                                                    <span className='time'>
                                                                        {moment(msg.createddate).format('h:mm A')}
                                                                        {msg.status !== 'Incoming' && (
                                                                            <span className="ps-1">
                                                                                {(msg.delivery_status === 'sent' || msg.delivery_status === 'delivered' || msg.delivery_status === 'read') && (
                                                                                <svg
                                                                                    xmlns="http://www.w3.org/2000/svg"
                                                                                    width="16"
                                                                                    height="15"
                                                                                    id="msg-dblcheck-ack"
                                                                                    x="2063"
                                                                                    y="2076"
                                                                                >
                                                                                    <path
                                                                                    d="M15.01 3.316l-.478-.372a.365.365 0 0 0-.51.063L8.666 9.88a.32.32 0 0 1-.484.032l-.358-.325a.32.32 0 0 0-.484.032l-.378.48a.418.418 0 0 0 .036.54l1.32 1.267a.32.32 0 0 0 .484-.034l6.272-8.048a.366.366 0 0 0-.064-.512zm-4.1 0l-.478-.372a.365.365 0 0 0-.51.063L4.566 9.88a.32.32 0 0 1-.484.032L1.892 7.77a.366.366 0 0 0-.516.005l-.423.433a.364.364 0 0 0 .006.514l3.255 3.185a.32.32 0 0 0 .484-.033l6.272-8.048a.365.365 0 0 0-.063-.51z"
                                                                                    fill={msg.delivery_status === 'read' ? '#4fc3f7' : '#848b8e'}
                                                                                    />
                                                                                </svg>
                                                                                )}
                                                                            </span>
                                                                            )}

                                                                           
                                                                    </span>
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ))}
                                </Col>
                            </Row>
                        </Card.Body>
                    </div>
                ) :
                    <div style={{ height: "100%", background: '#efe7dd' }}>
                        <Row className='g-0'>
                            <Col lg={12} sm={12} xs={12} className='p-4'>
                                <span style={{ fontSize: "15px" }}>
                                    There are no chats available here. Sending your first message is necessary because you haven't chatted before.
                                    Send your initial message using the Send button below.
                                </span>
                            </Col>
                            <Col lg={12} sm={12} xs={12} className='text-center p-2'>
                                {filterData?.recordType !== 'groups' ?
                                    <button type="button" className="btn btn-sm btn-light mx-1" onClick={sendTemplateMessage}>
                                        Send Message
                                    </button> :
                                    <button type="button" className="btn btn-sm btn-light mx-1" onClick={sendBulkTemplateMessage}>
                                        Send Bulk Message
                                    </button>
                                }
                            </Col>

                            <Col lg={12} sm={12} xs={12} className='p-4 mt-5 text-center'>
                                <p>
                                    <i className="fa-brands fa-whatsapp" style={{ fontSize: "30px", color: "rgb(119 110 102)" }}></i>
                                </p>
                                <p>WhatsApp for Windows</p>
                                <p>Send and recieve messages</p>
                            </Col>

                        </Row>
                    </div>
                }


                {hasOutgoingMessage ? (
                    <Card.Footer>
                        <Row className='g-0 mt-2'>
                            <Col lg={11} sm={8} xs={8}>
                                <div className="input-focus-class" style={{ position: 'relative', display: 'inline-block', width: '100%' }} >
                                    <input
                                        type="text"
                                        placeholder="Type message here..."
                                        value={input}
                                        onChange={(e) => setInput(e.target.value)}
                                        onKeyDown={handleKeyDown}
                                        disabled={messages?.length <= 0}
                                        style={{
                                            width: '100%',
                                            padding: '10px 40px 10px 10px',
                                            borderRadius: '20px',
                                            border: 'none',
                                        }}
                                    />
                                    <i className="fa-solid fa-paperclip"
                                        style={{
                                            position: 'absolute',
                                            right: '15px',
                                            top: '50%',
                                            transform: 'translateY(-50%)',
                                            fontSize: "18px",
                                            color: "#999fab",
                                            cursor: "pointer"
                                        }}
                                        onClick={onUploadFile}
                                    ></i>
                                </div>
                            </Col>
                            <Col lg={1} xs={4} sm={4} className='text-center'>
                                <button type="button" className="btn btn-outline-secondary mx-1 mt-1" onClick={handleSubmit}>
                                    <i className="fa fa-paper-plane"></i>
                                </button>
                            </Col>
                        </Row>
                    </Card.Footer >

                ) :
                    <Card.Footer>
                        <Row className='g-0 mt-3'>
                            <Col lg={6} sm={12} xs={12} className="mt-1">
                                <p><b>There are no incoming chats available here.</b></p>
                            </Col>
                        </Row>
                    </Card.Footer>
                }

            </Card>



            {showHideModal &&
                <TemplateModal
                    show={showHideModal}
                    onHide={() => setShowHideModal(false)}
                    contactData={contactData}
                    refreshData={refreshData}
                    filterData={filterData}
                    selectedWhatsAppSetting={selectedWhatsAppSetting}
                />
            }

            {fileModalShowHide &&
                <SendFileModal
                    show={fileModalShowHide}
                    onHide={() => setFileModalShowHide(false)}
                    refreshImageData={refreshImageData}
                    parentData={userDetail}
                    filterData={filterData}
                    selectedWhatsAppSetting={selectedWhatsAppSetting}
                />
            }

            {showHideBulkModal &&
                <MessageTemplateModal
                    show={showHideBulkModal}
                    onHide={() => setShowHideBulkModal(false)}
                    contactData={groupData}
                    refreshData={refreshData}
                    filterData={filterData}
                    selectedWhatsAppSetting={selectedWhatsAppSetting}
                />
            }
        </>
    )
}

export default WhatsAppChat