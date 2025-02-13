/**
 * @author      Abdul Pathan
 * @date        Aug, 2024
 * @copyright   www.ibirdsservices.com
 */

import React, { useEffect, useState } from 'react';
import { Form, Container, Row, Col, Card } from 'react-bootstrap';
import WhatsAppChat from './WhatsAppChat';
import WhatsAppAPI from '../../api/WhatsAppAPI';
import { ToastContainer, toast } from 'react-toastify';//npm i react-toastify --force
import 'react-toastify/dist/ReactToastify.css';
// import TemplateModal from './TemplateModal';
import { NameInitialsAvatar } from 'react-name-initials-avatar'; // npm install react-name-initials-avatar --force
// import jwt_decode from "jwt-decode";
// import moment from 'moment-timezone';
import CityState from "../../constants/CityState.json";
import Select from 'react-select';
import MessageTemplateModal from './MessageTemplateModal';
import jwt_decode from "jwt-decode";


const WhatsAppMessenger = ({ socket, selectedWhatsAppSetting }) => {
    const [body, setBody] = useState([]);
    const [showHide, setShowHide] = useState(false);
    const [userData, setUserData] = useState();
    const [filters, setFilters] = useState({ textName: '', cityName: '', date: '', recordType: 'lead' });
    const [receivedMessage, setReceivedMessage] = useState();
    const [showHideModal, setShowHideModal] = useState(false);
    const [userInfo, setUserInfo] = useState(jwt_decode(localStorage.getItem('token')));
    const [bgColors, setBgColors] = useState(['#d3761f', '#00ad5b', '#debf31', '#239dd1', '#b67eb1', '#d3761f', '#de242f']);
    const [brokenImages, setBrokenImages] = useState([]);
    let colIndex = 0;
    const [cities, setCities] = useState([]);
    const [selectAll, setSelectAll] = useState(false);
    const [selectedItems, setSelectedItems] = useState([]);
    const profileImage = '/public/'+userInfo.tenantcode+'/users';
    const [unreadMsgCount, setUnreadMsgCount] = useState([]);


    useEffect(() => {
        socket?.on("receivedwhatsappmessage", (data) => {
            setReceivedMessage(data);
        })
    }, [socket]);


    useEffect(() => {
        fetchData();
        getUnreadMsgCounts(selectedWhatsAppSetting)
    }, [filters, receivedMessage, selectedWhatsAppSetting]);

    useEffect(() => {
        if (!filters.recordType) {
            setFilters((prevFilters) => ({
                ...prevFilters,
                recordType: userInfo.modules.some((module) => module.url === "leads") ? 'lead' : 'user',
            }));
        }
    }, [filters, userInfo.modules]);


    const fetchData = async () => {
        const { textName, cityName, recordType } = filters;
        let result = await WhatsAppAPI.getFilterData(textName, cityName, recordType);
        if (result.success) {
            setBody(result.records);
        } else {
            setBody([]);
        }
    };

    const getUnreadMsgCounts = async (selectedWhatsAppSetting) => {
        let result = await WhatsAppAPI.fetchUnreadMsgCount(selectedWhatsAppSetting);
        if (result.success) {
            setUnreadMsgCount(result.records);
        } else {
            setUnreadMsgCount([]);
        }
    };


    useEffect(() => {
        const rajasthanCities = CityState.filter(item => item.state === "Rajasthan").map(city => city.name);
        if (rajasthanCities.length > 0) {
            const cityOptions = [
                { value: "", label: "Select city" },
                ...rajasthanCities.map(city => ({
                    value: city,
                    label: city
                })),
            ];
            setCities(cityOptions);
        } else {
            setCities([{ value: "", label: "Select city" }]);
        }
    }, []);

    const handleCityChange = (selectedOption) => {
        setFilters((prevFilters) => ({
            ...prevFilters,
            cityName: selectedOption ? selectedOption.value : "",
        }));
    };


    const handleChange = async (event) => {
        setShowHide(false);
        const { name, value } = event.target;
        setFilters((prevFilters) => ({
            ...prevFilters,
            [name]: value.trim()
        }));

        setSelectedItems([]);
        setSelectAll(false);
    };

    const handleUserClick = (item, unreadCount) => {
        setShowHide(true)
        setUserData(item);

        if (item.whatsapp_number && unreadCount > 0) {
            markMessagesAsRead(item.whatsapp_number);
        }
    };

    const markMessagesAsRead = async (whatsapp_number) => {
        let result = await WhatsAppAPI.markMessagesAsRead(whatsapp_number, selectedWhatsAppSetting);
        if (result.success) {
            getUnreadMsgCounts(selectedWhatsAppSetting);
        }
    };


    const handleSelectAll = () => {
        if (!selectAll) {
            setSelectedItems([...body]);
        } else {
            setSelectedItems([]);
        }
        setSelectAll(!selectAll);
    };

    const handleCheckboxChange = (event, item) => {
        if (event.target.checked) {
            setSelectedItems((prevSelected) => [...prevSelected, item]);
        } else {
            setSelectedItems((prevSelected) =>
                prevSelected.filter((selectedItem) => selectedItem.id !== item.id)
            );
        }
    };

    const isAllSelected = selectedItems.length === body.length;


    const sendMessagesBulk = (e) => {
        setShowHide(false);
        if (selectedItems.length > 0) {
            if (selectedItems[0].whatsapp_number) {
                setShowHideModal(true);
            } else {
                if (selectedItems.length === 1) {
                    setShowHideModal(true);
                } else {
                    toast.error("Please select only one group at a time.");
                }
            }
        } else {
            toast.error("Please select at least one item.");
        }
    }

    const refreshData = () => {
        fetchData();
        setShowHideModal();
        setSelectedItems([]);
        setSelectAll(false);
    }


    const fillBgBolor = () => {
        colIndex += 1;
        if (colIndex >= bgColors.length)
            colIndex = 0;
        return bgColors[colIndex];
    }


    return (
        <>
            <Container className='mt-5'>
                <Row className='g-0 mx-5 text-center'>
                    <Col lg={12} xs={12} sm={12}>
                        <div className=' text-center p-2' style={{ height: '40px', backgroundColor: '#ffffff', borderRadius: '5px' }}>
                            <span className='fw-semibold p-1' style={{ color: '#605C68', fontSize: 'large' }}>
                                WhatsApp for Windows
                            </span>
                        </div>
                    </Col>
                </Row>
            </Container>

            <Container className='mt-2 mb-5'>
                <Row className='g-0 mx-5'>
                    <Col lg={5} sm={12} xs={12} className="mb-3">
                        <Card className='h-100' >
                            <Card.Header className='p-3'>
                                <Row className='g-0 ' >
                                    <Col lg={8} xs={6} sm={6} style={{ display: "flex", alignItems: "stretch", }}>
                                        <i className="fa-brands fa-whatsapp" style={{ fontSize: "30px", color: "white" }}></i>
                                        <span className='mx-3 mt-1 fw-bold' style={{ fontSize: "15px", color: "white" }}>
                                            {userInfo.username}
                                        </span>
                                    </Col>
                                    <Col lg={4} xs={6} sm={6} className='text-end'>
                                        <button type="button" className="btn btn-sm btn-light" onClick={sendMessagesBulk}>
                                            Send Bulk Messages
                                        </button>
                                    </Col>
                                </Row>
                            </Card.Header>

                            <Card.Body className='mb-5'>
                                <div style={{ height: '30rem' }}>
                                    <Row className='g-0'>
                                        <Col lg={12} sm={12} xs={12} className='mb-2'>
                                            <Row className='mt-2'>
                                                <Col lg={4} xs={12} sm={12}>
                                                    <Form.Group className='mb-3'>
                                                        <Form.Control
                                                            style={{ height: "38px" }}
                                                            type="text"
                                                            name="textName"
                                                            placeholder='Search by name...'
                                                            onChange={handleChange}
                                                        />
                                                    </Form.Group>
                                                </Col>
                                                <Col lg={4} xs={12} sm={12}>
                                                    <Form.Group className='mb-3'>
                                                        <Form.Select
                                                            style={{ height: "38px" }}
                                                            aria-label="select name"
                                                            name="recordType"
                                                            onChange={handleChange}
                                                        >
                                                            {userInfo.modules.some((module) => module.url === "leads") && (
                                                                <option value="lead">Lead</option>
                                                            )}
                                                            <option value="user">User</option>
                                                            {userInfo.modules.some((module) => module.url === "groups") && (
                                                                <option value="groups">Groups</option>
                                                            )}
                                                            <option value="recentlyMessage">Recently Message</option>
                                                        </Form.Select>
                                                    </Form.Group>
                                                </Col>
                                                <Col lg={4} xs={12} sm={12}>
                                                    <Form.Group className='mb-3'>
                                                        <Select
                                                            isDisabled={filters.recordType === 'user' || filters.recordType === 'recentlyMessage' || filters.recordType === 'groups'}
                                                            options={cities}
                                                            placeholder="Select City"
                                                            onChange={handleCityChange}
                                                            value={cities.find(option => option.value === filters.cityName) || null}
                                                        />
                                                    </Form.Group>
                                                </Col>
                                            </Row>
                                        </Col>

                                        <hr></hr>

                                        <div className="table-container mt-3" style={{ maxHeight: "25rem", overflowY: "auto" }}>
                                            <Col lg={12} sm={12} xs={12}>
                                                {body.length > 0 ?
                                                    <table className="table" >
                                                        <thead>
                                                            <tr>
                                                                <th>
                                                                    <input
                                                                        className='mx-1'
                                                                        name='selectName'
                                                                        type="checkbox"
                                                                        checked={isAllSelected}
                                                                        onChange={handleSelectAll}
                                                                        style={{ cursor: "pointer" }}
                                                                    />
                                                                </th>
                                                                <th className='px-5'>Name</th>
                                                                <th className='px-5'></th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {body?.map(item => {
                                                                const unreadCount = unreadMsgCount.find(unread => unread.whatsapp_number === item.whatsapp_number)?.unread_msg_count;
                                                                return (
                                                                    <tr key={item.id}>
                                                                        <td className='pt-3'>
                                                                            <input
                                                                                className='mx-1'
                                                                                name={`select-${item.id}`}
                                                                                type="checkbox"
                                                                                checked={selectedItems.some((selectedItem) => selectedItem.id === item.id)}
                                                                                onChange={(event) => handleCheckboxChange(event, item)}
                                                                                style={{ cursor: "pointer" }}
                                                                            />
                                                                        </td>
                                                                        <td onClick={() => handleUserClick(item, unreadCount)} style={{ cursor: "pointer" }} className='d-flex align-items-center text-uppercase'>
                                                                            {brokenImages.includes(`img-${item?.id}`) ? (
                                                                                <NameInitialsAvatar size='30px' textSize='13px'
                                                                                    bgColor={fillBgBolor()}
                                                                                    borderWidth="0px"
                                                                                    textColor="#fff"
                                                                                    name={item?.contactname}
                                                                                />
                                                                            ) : (
                                                                                <img alt=''
                                                                                    style={{ height: "30px", width: "30px", objectFit: "cover" }}
                                                                                    src={profileImage + '/' + item.id}
                                                                                    className="rounded-circle"
                                                                                    onError={() => setBrokenImages((prev) => [...prev, `img-${item?.id}`])}
                                                                                    id={`img-${item?.id}`}
                                                                                />
                                                                            )}
                                                                            <span className='mx-3 mt-1 text-capitalize' style={{ fontSize: "15px" }}>
                                                                                {item.contactname}
                                                                                {item?.whatsapp_number && (
                                                                                    <i className='mx-2' style={{ fontSize: "10px" }}>
                                                                                        ( {item?.whatsapp_number} )
                                                                                    </i>
                                                                                )}
                                                                            </span>
                                                                        </td>
                                                                        <td className='pt-3'>
                                                                            {unreadCount && (
                                                                                <span className="badge bg-success rounded-circle float-end mx-2" style={{ fontSize: "10px" }}>
                                                                                    {unreadCount}
                                                                                </span>
                                                                            )}
                                                                        </td>
                                                                    </tr>
                                                                );
                                                            })}
                                                        </tbody>
                                                    </table>
                                                    :
                                                    'No record exists.'
                                                }
                                            </Col>
                                        </div>
                                    </Row>
                                </div>
                            </Card.Body>

                            <Card.Footer>
                                <Row className='g-0 mt-3'>
                                    <Col lg={6} sm={12} xs={12} className="mt-1">
                                        <p><b>Total Records: {body?.length}</b></p>
                                    </Col>
                                </Row>
                            </Card.Footer>
                        </Card>
                    </Col>

                    {showHide &&
                        <Col lg={7} sm={12} xs={12} className="mb-3">
                            <WhatsAppChat
                                show={showHide}
                                onHide={() => setShowHide(false)}
                                userDetail={userData}
                                filterData={filters}
                                socket={socket}
                                selectedWhatsAppSetting={selectedWhatsAppSetting}
                            />
                        </Col>
                    }
                </Row>
            </Container>
            <ToastContainer />

            {showHideModal &&
                <MessageTemplateModal
                    show={showHideModal}
                    onHide={() => setShowHideModal(false)}
                    contactData={selectedItems}
                    refreshData={refreshData}
                    filterData={filters}
                    selectedWhatsAppSetting={selectedWhatsAppSetting}
                />
            }
        </>
    )
}

export default WhatsAppMessenger