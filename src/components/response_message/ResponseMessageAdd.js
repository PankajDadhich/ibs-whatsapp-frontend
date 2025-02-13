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

const ResponseMessageAdd = (props) => {
    const [rowRecord, setRowRecord] = useState(props?.rowData ? props?.rowData : { id: '', type: '', message: '' });


    const handleChange = (e) => {
        const { name, value } = e.target;
        setRowRecord({ ...rowRecord, [name]: value });
    }

    const handleSubmit = async (e) => {
        e.preventDefault();

        const isValid = rowRecord.type && rowRecord.message.trim(); // Validate required fields

        if (!isValid) {
            toast.error('Required fields are missing.');
            return;
        }

        try {
            const result = rowRecord.id ? await WhatsAppAPI.updateResponseMessageRecord(rowRecord) : await WhatsAppAPI.inserResponseMessageRecord(rowRecord);

            if (result.success) {
                toast.success(rowRecord.id ? 'Record updated successfully.' : 'Record created successfully.');
                props.onRefreshData(); // Refresh data on success
            } else {
                toast.error(result.message || 'Failed to save record.'); // Default error message if API doesn't provide one
            }
        } catch (error) {
            console.error('Error during save operation', error); // Log detailed error
            toast.error('An unexpected error occurred while saving the record.'); // User-friendly error message
        }
    };

    const isFormValid = rowRecord.type && rowRecord.message.trim();

    return (
        <>
            <Modal show={props.show} animation={false} size='lg' centered >
                <Modal.Header closeButton onClick={props.onHide}>
                    <Modal.Title id="contained-modal-title-vcenter">
                        {rowRecord?.id ? 'Edit Message' : 'Add Message'}
                    </Modal.Title>
                </Modal.Header>

                <Modal.Body>
                    <Form noValidate >
                        <Row className='p-2 mb-3'>
                            <Col lg={6} sm={12} xs={12}>
                                <Form.Group className='mb-3'>
                                    <Form.Label htmlFor="formType">Type</Form.Label>
                                    <Form.Select
                                        aria-label="select type"
                                        name="type"
                                        value={rowRecord?.type}
                                        onChange={handleChange}
                                        required
                                        placeholder='Enter type here...'
                                        style={{ height: "36px" }}
                                    >
                                        <option value="">Select type</option>
                                        <option value="campaign">Campaign</option>
                                        <option value="lead">Lead</option>
                                        <option value="user">User</option>
                                        <option value="common_message">Common Message</option>
                                    </Form.Select>
                                </Form.Group>
                            </Col>

                            <Col lg={12} sm={12} xs={12}>
                                <Form.Group className="mb-3" controlId="formCampaignName">
                                    <Form.Label>Message</Form.Label>
                                    <Form.Control
                                        as="textarea"
                                        required
                                        name="message"
                                        value={rowRecord?.message}
                                        onChange={handleChange}
                                        rows={3}
                                        placeholder='Enter message here...'
                                    />
                                </Form.Group>
                            </Col>

                        </Row>
                    </Form>
                </Modal.Body>

                <Modal.Footer>
                    <button className='btn btn-light' onClick={props.onHide}>Close</button>
                    <button className='btn btn-outline-primary' onClick={handleSubmit} disabled={!isFormValid}>Save</button>
                </Modal.Footer>
            </Modal>

            <ToastContainer />
        </>
    )
}

export default ResponseMessageAdd
