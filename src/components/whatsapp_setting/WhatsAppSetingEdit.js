/**
 * @author      Abdul Pathan
 * @date        Sep, 2024
 * @copyright   www.ibirdsservices.com
 */

import React, { useState } from 'react'
import { Col, Form, Modal, Row } from 'react-bootstrap';
import { ToastContainer, toast } from 'react-toastify'; // npm i react-toastify --force
import 'react-toastify/dist/ReactToastify.css';
import WhatsAppAPI from '../../api/WhatsAppAPI';

const WhatsAppSetingEdit = (props) => {
    const [isSpinner, setIsSpinner] = useState(false);
    const [settingData, setSettingData] = useState(props?.rowData ? props?.rowData : { id: '', name: '', app_id: '', access_token: '', business_number_id: '', whatsapp_business_account_id: '', end_point_url: '', phone: '' });


    const handleChange = (e) => {
        const { name, value } = e.target;
        setSettingData({ ...settingData, [name]: value });
    }

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validate required fields
        const isValid = settingData.name.trim() && settingData.app_id.trim() && settingData.business_number_id.trim() &&
            settingData.whatsapp_business_account_id.trim() && settingData.phone.trim() &&
            settingData.end_point_url.trim() && settingData.access_token.trim();

        if (!isValid) {
            toast.error('Required fields are missing.');
            return;
        }

        setIsSpinner(true)

        if (settingData.phone.length === 10) {
            settingData.phone = '91' + settingData.phone;
        }

        try {
            const result = settingData.id
                ? await WhatsAppAPI.updateWhatsAppSettingRecord(settingData)
                : await WhatsAppAPI.insertWhatsAppSettingRecords(settingData);

            if (result.success) {
                toast.success(settingData.id ? 'Record updated successfully.' : 'Record created successfully.');
                setTimeout(() => {
                    props.onRefreshData();
                    setIsSpinner(false)
                }, 1000)

            } else {
                setIsSpinner(false);
                toast.error(result.message || 'Failed to save record.'); // Default error message if API doesn't provide one
            }
        } catch (error) {
            setIsSpinner(false)
            console.error('Error during save operation', error); // Log detailed error
            toast.error('An unexpected error occurred while saving the record.'); // User-friendly error message
        }
    };


    return (
        <>
            <Modal show={props.show} animation={false} size='lg' centered >
                <Modal.Header closeButton onClick={props.onHide}>
                    <Modal.Title id="contained-modal-title-vcenter">
                        {settingData?.id ? 'Edit Whatsapp Setting' : 'Add Whatsapp Setting'}
                    </Modal.Title>
                </Modal.Header>

                {!isSpinner ?
                    <>
                        <Modal.Body>
                            <Form noValidate >
                                <Row className='p-2 mb-3'>
                                    <Col lg={6} sm={12} xs={12}>
                                        <Form.Group className="mb-3" controlId="formCampaignName">
                                            <Form.Label>Name</Form.Label>
                                            <Form.Control
                                                type="text"
                                                required
                                                name="name"
                                                value={settingData?.name}
                                                onChange={handleChange}
                                                placeholder='Enter name'
                                                style={{ height: "36px" }}
                                            />
                                        </Form.Group>
                                    </Col>

                                    <Col lg={6} sm={12} xs={12}>
                                        <Form.Group className="mb-3" controlId="formCampaignName">
                                            <Form.Label>App Id</Form.Label>
                                            <Form.Control
                                                type="text"
                                                required
                                                name="app_id"
                                                value={settingData?.app_id}
                                                onChange={handleChange}
                                                placeholder='Enter app id'
                                                style={{ height: "36px" }}
                                            />
                                        </Form.Group>
                                    </Col>

                                    <Col lg={6} sm={12} xs={12}>
                                        <Form.Group className="mb-3" controlId="formCampaignName">
                                            <Form.Label>WhatsApp Business Account Id</Form.Label>
                                            <Form.Control
                                                type="text"
                                                required
                                                name="whatsapp_business_account_id"
                                                value={settingData?.whatsapp_business_account_id}
                                                onChange={handleChange}
                                                placeholder='Enter whatsapp business account id'
                                                style={{ height: "36px" }}
                                            />
                                        </Form.Group>
                                    </Col>

                                    <Col lg={6} sm={12} xs={12}>
                                        <Form.Group className="mb-3" controlId="formCampaignName">
                                            <Form.Label>Business Number Id</Form.Label>
                                            <Form.Control
                                                type="text"
                                                required
                                                name="business_number_id"
                                                value={settingData?.business_number_id}
                                                onChange={handleChange}
                                                placeholder='Enter business number id'
                                                style={{ height: "36px" }}
                                            />
                                        </Form.Group>
                                    </Col>

                                    <Col lg={6} sm={12} xs={12}>
                                        <Form.Group className="mb-3" controlId="formCampaignName">
                                            <Form.Label>End Point URL</Form.Label>
                                            <Form.Control
                                                type="text"
                                                required
                                                name="end_point_url"
                                                value={settingData?.end_point_url}
                                                onChange={handleChange}
                                                placeholder='Enter end point url'
                                                style={{ height: "36px" }}
                                            />
                                        </Form.Group>
                                    </Col>

                                    <Col lg={6} sm={12} xs={12}>
                                        <Form.Group className="mb-3" controlId="formCampaignName">
                                            <Form.Label>Phone</Form.Label>
                                            <Form.Control
                                                type="text"
                                                required
                                                name="phone"
                                                value={settingData?.phone}
                                                onChange={handleChange}
                                                placeholder='Enter phone number'
                                                style={{ height: "36px" }}
                                            />
                                        </Form.Group>
                                    </Col>


                                    <Col lg={12} sm={12} xs={12}>
                                        <Form.Group className="" controlId="formCampaignName">
                                            <Form.Label>Access Token</Form.Label>
                                            <Form.Control
                                                as="textarea"
                                                required
                                                name="access_token"
                                                value={settingData?.access_token}
                                                onChange={handleChange}
                                                placeholder='Enter access token'
                                                row={3}
                                            />
                                        </Form.Group>
                                    </Col>
                                </Row>
                            </Form>
                        </Modal.Body>

                        <Modal.Footer>
                            <button className='btn btn-light' onClick={props.onHide}>Close</button>
                            <button className='btn btn-outline-primary' onClick={handleSubmit}>Save</button>
                        </Modal.Footer>
                    </>
                    :
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
                }


            </Modal>

            <ToastContainer />
        </>
    )
}

export default WhatsAppSetingEdit
