/**
 * @author      Abdul Pathan
 * @date        Aug, 2024
 * @copyright   www.ibirdsservices.com
 */

import React, { useEffect, useState } from 'react'
import { Col, Form, Modal, Row } from 'react-bootstrap';
import { toast } from 'react-toastify'; // npm i react-toastify --force
import 'react-toastify/dist/ReactToastify.css';
import moment from 'moment-timezone';
import WhatsAppAPI from '../../api/WhatsAppAPI';
import { MultiSelect } from 'react-multi-select-component';
import jwt_decode from "jwt-decode";

const CampaignEdit = (props) => {
    const [campaignData, setCampaignData] = useState(props?.rowData || {
        campaign_id: '',
        campaign_name: '',
        campaign_type: '',
        template_id: '',
        template_name: '',
        start_date: '',
        group_ids: []
    });
    const [allTemplateData, setAllTemplateData] = useState([]);
    const [optionGroups, setOptionGroups] = useState([]);
    const [selectedGroups, setSelectedGroups] = useState(
        (props?.rowData?.groups || []).map(group => ({ value: group.id, label: group.name }))
    );
    const [userInfo, setUserInfo] = useState(
        jwt_decode(sessionStorage.getItem("token"))
      );

    const hasGroupsModule = userInfo?.modules?.some(module => module.url === "groups") || false;

    useEffect(() => {
        fetchAllTemplate();
        fetchGroupRecords();
    }, []);

    // Fetch All template
    const fetchAllTemplate = async () => {
        try {
            const result = await WhatsAppAPI.getApprovedTemplates(props?.selectedWhatsAppSetting);

            const transformedData = result?.data.map(row => {
                return {
                    template_id: row.id,
                    template_name: row.name,
                    templatename: row.name.replace(/_/g, ' '),
                    category: row.category,
                    status: row.status,
                };
            });

            setAllTemplateData(transformedData);

        } catch (error) {
            console.error('Failed to fetch templates:', error);
        }
    };

    const fetchGroupRecords = async () => {
        try {
            const result = await WhatsAppAPI.fetchGroups(true);
            if (result.success) {
                const filteredGroups = result.records?.filter(item => item.members && item.members.length > 0);
                const groupResult = filteredGroups?.map(item => ({ value: item.id, label: item.name })) || [];
                setOptionGroups(groupResult);
            } else {
                setOptionGroups([]);
            }
        } catch (error) {
            console.error('Failed to fetch groups:', error);
        }
    };

    const formatDateForInput = (date) => {
        return date ? moment(date).format('YYYY-MM-DDTHH:mm') : '';
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setCampaignData(prevData => ({
            ...prevData,
            [name]: name === 'start_date' ? (value ? moment(value).tz('Asia/Kolkata').toDate() : '') : value
        }));

    }

    const handleSubmit = async (e) => {
        e.preventDefault();

        const formattedCampaignData = {
            ...campaignData,
            start_date: campaignData.start_date ? moment(campaignData.start_date).tz('Asia/Kolkata').format('YYYY-MM-DDTHH:mm:ss.SSSZ') : '',
            group_ids: selectedGroups.map(group => group.value)
        };


        if (formattedCampaignData?.campaign_id && formattedCampaignData.campaign_name.trim() && formattedCampaignData.start_date && formattedCampaignData.template_name) {
            try {
                const obj = {
                    id: formattedCampaignData.campaign_id,
                    name: formattedCampaignData.campaign_name.trim(),
                    type: formattedCampaignData?.campaign_type ? formattedCampaignData.campaign_type : '',
                    template_name: formattedCampaignData.template_name,
                    start_date: formattedCampaignData.start_date,
                    // group_id: formattedCampaignData.group_id
                    group_ids: formattedCampaignData.group_ids
                }

                const result = await WhatsAppAPI.updateCampaignRecord(obj);
                if (result.success) {
                    props.onRefreshData();
                } else {
                    toast.error(result.message)
                }
            } catch (error) {
                console.error('Error updating campaign records', error);
            }
        } else {
            toast.error('Requires field missing.')
        }
    }

    const isFormValid = Boolean(campaignData.campaign_name.trim()) && Boolean(campaignData.start_date) && Boolean(campaignData.template_name);

    return (
        <>
            <Modal show={props.show} animation={false} size='lg' centered >
                <Modal.Header closeButton onClick={props.onHide}>
                    <Modal.Title id="contained-modal-title-vcenter">
                        Edit Campaign
                    </Modal.Title>
                </Modal.Header>

                <Modal.Body>
                    <Form noValidate >
                        <Row className='p-2 mb-3'>
                            <Col lg={6} sm={12} xs={12}>
                                <Form.Group className="mb-3" controlId="formCampaignName">
                                    <Form.Label>Campaign Name</Form.Label>
                                    <Form.Control
                                        type="text"
                                        required
                                        name="campaign_name"
                                        value={campaignData.campaign_name}
                                        onChange={handleChange}
                                        style={{ height: "36px" }}
                                    />
                                </Form.Group>
                            </Col>

                            <Col lg={6} sm={12} xs={12}>
                                <Form.Group className='mb-3'>
                                    <Form.Label htmlFor="formType">Type</Form.Label>
                                    <Form.Select
                                        aria-label="select type"
                                        name="campaign_type"
                                        value={campaignData?.campaign_type}
                                        onChange={handleChange}
                                        style={{ height: "36px" }}
                                    >
                                        <option value="">Select type</option>
                                        <option value="Advertisement">Advertisement</option>
                                        <option value="Banner Ads">Banner Ads</option>
                                        <option value="Conference">Conference</option>
                                        <option value="Direct Mail">Direct Mail</option>
                                        <option value="Email">Email</option>
                                        <option value="Partners">Partners</option>
                                        <option value="Public Relations">Public Relations</option>
                                        <option value="Referral Program">Referral Program</option>
                                        <option value="Telemarketing">Telemarketing</option>
                                        <option value="Trade Show">Trade Show</option>
                                        <option value="Web">Web</option>
                                        <option value="Webinar">Webinar</option>
                                        <option value="Other">Other</option>
                                    </Form.Select>
                                </Form.Group>
                            </Col>

                            {/* <Col lg={6} sm={12} xs={12}>
                                <Form.Group className='mb-3'>
                                    <Form.Label htmlFor="formType">Template Name</Form.Label>
                                    <Form.Select
                                        aria-label="select name"
                                        name="template_name"
                                        required
                                        onChange={handleChange}
                                        value={campaignData?.template_name}
                                        style={{ height: "36px" }}
                                    >
                                        <option value="">Select Template Name</option>
                                        {allTemplateData?.map((template) => (
                                            <option key={template.template_id} value={template.template_name}>
                                                {template.templatename}
                                            </option>
                                        ))}
                                    </Form.Select>
                                </Form.Group>
                            </Col> */}
                            {/* <Col lg={6} sm={12} xs={12}>
                                <Form.Group className='mb-3'>
                                    <Form.Label>Group Name</Form.Label>
                                    <Form.Select
                                        aria-label="Select Group"
                                        name="group_id"
                                        value={campaignData.group_id}
                                        onChange={handleChange}
                                        style={{ height: "36px" }}
                                    >
                                        <option value="">Select Group Name</option>
                                        {optionGroups.map(group => (
                                            <option key={group.value} value={group.value}>
                                                {group.label}
                                            </option>
                                        ))}
                                    </Form.Select>
                                </Form.Group>
                            </Col> */}
                            {hasGroupsModule && (
                            <Col lg={6} sm={12} xs={12}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Groups</Form.Label>
                                    <MultiSelect
                                        options={optionGroups}
                                        value={selectedGroups}
                                        onChange={setSelectedGroups}
                                        labelledBy="Select Groups"
                                    />
                                </Form.Group>
                            </Col>)}
                            <Col lg={6} sm={12} xs={12}>
                                <Form.Group className="mb-3" controlId="formStartDate">
                                    <Form.Label>Start Date & Time</Form.Label>
                                    <Form.Control
                                        required
                                        type="datetime-local"
                                        name="start_date"
                                        value={formatDateForInput(campaignData?.start_date)}
                                        onChange={handleChange}
                                        style={{ height: "36px" }}
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
        </>
    )
}

export default CampaignEdit