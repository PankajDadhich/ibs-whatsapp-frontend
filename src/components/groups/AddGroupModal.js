import React, { useEffect, useState } from "react";
import { Modal, Button, Form, Row, Col } from "react-bootstrap";
import WhatsAppAPI from "../../api/WhatsAppAPI";
import { ToastContainer, toast } from 'react-toastify';
import { MultiSelect } from 'react-multi-select-component';//npm i react-multi-select-component
import jwt_decode from "jwt-decode";
import helper from '../common/helper';
import * as constants from '../../constants/CONSTANT';

const AddGroupModal = ({ show, onHide, fetchGroupRecords, selectedGroup }) => {
    const [userInfo, setUserInfo] = useState(jwt_decode(sessionStorage.getItem('token')));
    const [groupName, setGroupName] = useState("");
    const [selectedUsers, setSelectedUsers] = useState([]);
    const [selectedLeads, setSelectedLeads] = useState([]);
    const [userOptions, setUserOptions] = useState([]);
    const [leadOptions, setLeadOptions] = useState([]);

    useEffect(() => {
        fetchAllData();
    }, []);

    useEffect(() => {
        if (selectedGroup.length !== 0) {
            setGroupName(selectedGroup.name);
        } else {
            resetForm();
        }
    }, [selectedGroup]);

    const fetchAllData = async () => {
        try {
            const usersResult = await WhatsAppAPI.getFilterData('', '', 'user');
            if (usersResult.success) {
                const userOptions = usersResult.records.map(user => ({
                    label: `${user.contactname} ${user.whatsapp_number}`,
                    value: {
                        member_id: user.id,
                        name: user.contactname,
                        whatsapp_number: user.whatsapp_number,
                        recordtypename: "user"
                    }
                }));

                setUserOptions(userOptions);
            }

          
            const leadsResult = await WhatsAppAPI.getFilterData('', '', 'lead');
            if (leadsResult.success) {
                const leadOptions = leadsResult.records.map(lead => ({
                    label: `${lead.contactname} ${lead.whatsapp_number}`,
                    value: {
                        member_id: lead.id,
                        name: lead.contactname,
                        whatsapp_number: lead.whatsapp_number,
                        recordtypename: "lead"
                    }
                }));
                setLeadOptions(leadOptions);
            }
        } catch (error) {
            toast.error("Error fetching data.");
        }
    };
    const resetForm = () => {
        setGroupName("");
        setSelectedUsers([]);
        setSelectedLeads([]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!groupName || (!selectedUsers.length && !selectedLeads.length)) {
            if (selectedGroup.id) {
                toast.error("Please add atleast one member.");
            } else {
                toast.error("Please fill in all fields.");
            }
            return;
        }
        const members = [
            ...selectedUsers.map(user => ({
                member_id: user.value.member_id,
                createdById: userInfo.id
            })),
            ...selectedLeads.map(lead => ({
                member_id: lead.value.member_id,
                createdById: userInfo.id
            }))
        ];

        const formData = new FormData();
        formData.append("name", groupName);
        formData.append("members", JSON.stringify(members));
        try {
            let result;
            if (selectedGroup.id) {
                result = await WhatsAppAPI.addMoreMembers(selectedGroup.id, formData);
            } else {
                result = await WhatsAppAPI.createGroup(formData);
            }
            if (result.success) {
                toast.success(selectedGroup ? "Group updated successfully!" : "Group added successfully!");
                fetchGroupRecords();
                onHide();
            } else {
                toast.error(result.error);
            }
        } catch (error) {
            toast.error("Error saving group.");
        }
    };
    const isFormValid = () => {
        const totalMembers = selectedUsers.length +  selectedLeads.length;
        return groupName && totalMembers >= 2;
    };

    return (
        <Modal show={show} onHide={onHide} animation={false} size="lg" centered>
            <Modal.Header closeButton>
                <Modal.Title>{selectedGroup.length !== 0 ? "Add More Members" : "Add Group"}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form onSubmit={handleSubmit} noValidate>

                    <Row className="mt-2 mx-2">
                        <Col lg={6} sm={12}>
                            <Form.Group className="mb-3" controlId="formGroupName">
                                <Form.Label>Group Name</Form.Label>
                                <Form.Control
                                    style={{ height: "40px" }}
                                    type="text"
                                    value={groupName}
                                    placeholder="Enter group name"
                                    onChange={(e) => setGroupName(e.target.value)}
                                    required
                                    disabled={selectedGroup.length !== 0}
                                />
                            </Form.Group>
                        </Col>

                         {/* MultiSelect for Leads */}
                         <Col lg={6} sm={12}>
                            <Form.Group className="mb-3" controlId="formSelectLeads">
                                <Form.Label>Select Leads</Form.Label>
                                <MultiSelect
                                    options={leadOptions}
                                    value={selectedLeads}
                                    onChange={setSelectedLeads}
                                    labelledBy="Select Leads"
                                />
                            </Form.Group>
                        </Col>
                     
                    </Row>

                    <Row className="mt-2 mx-2 mb-3">
                   
                        <Col lg={6} sm={12}>
                            <Form.Group className="mb-3" controlId="formSelectUsers">
                                <Form.Label>Select Users</Form.Label>
                                <MultiSelect
                                    options={userOptions}
                                    value={selectedUsers}
                                    onChange={setSelectedUsers}
                                    labelledBy="Select Users"
                                />
                            </Form.Group>
                        </Col>

                      
                    </Row>
                </Form>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="light" onClick={onHide}>Close</Button>
                <Button variant="outline-primary" onClick={handleSubmit} disabled={selectedGroup.length === 0 && !isFormValid()}>Save</Button>
            </Modal.Footer>
        </Modal>
    );
};

export default AddGroupModal;