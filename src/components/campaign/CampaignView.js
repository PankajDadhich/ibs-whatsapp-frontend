/**
 * @author      Abdul Pathan
 * @date        Aug, 2024
 * @copyright   www.ibirdsservices.com
 */

import React, { useEffect, useState } from 'react'
import { Button, Col, Container, Row, Table, } from 'react-bootstrap';
import { useLocation, useNavigate } from "react-router-dom";
import { ToastContainer, toast } from 'react-toastify'; // npm i react-toastify --force
import 'react-toastify/dist/ReactToastify.css';
import moment from 'moment-timezone';
import { DatatableWrapper, Filter, Pagination, TableBody, TableHeader } from 'react-bs-datatable';
import WhatsAppAPI from '../../api/WhatsAppAPI';

const CampaignView = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [campaignData, setCampaignData] = useState(location.state ? location.state : {});
    const [body, setBody] = useState([]);


    useEffect(() => {
        if (campaignData?.campaign_id) {
            getMHRecords(campaignData?.campaign_id)
        }
    }, [campaignData]);

    const getMHRecords = async (id) => {
        const result = await WhatsAppAPI.getMsgHistoryDownload(id);
        if (result.success) {
            setBody(result.records);
        } else {
            setBody([])
        }
    }

    // const labels = { beforeSelect: " " };
    const header = [
        { title: "Name", prop: "name", isFilterable: true, },
        { title: "Phone", prop: "number", isFilterable: true },
        { title: "Status", prop: "status", isFilterable: true },
        { title: "Message", prop: "message", isFilterable: true },
    ];

    const handleDownload = () => {
        if (body.length > 0) {
            downloadCSV(body);
            toast.success("File download successfully.");
        } else {
            toast.error("No data available to download");
        }
    }
    const downloadCSV = (data) => {
        const csv = convertToCSV(data);
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);

        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'campaign_data.csv');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    const convertToCSV = (data) => {
        const header = ['Name', 'Phone', 'Status', 'Message'];
        const rows = data.map(item => [item.name, item.number, item.status, item.message]);
        return [
            header.join(','), // header row
            ...rows.map(row => row.join(',')) // data rows
        ].join('\n');
    }

    const handleBack = () => {
        navigate("/campaign");
    }

    return (
        <>
            <Container className='mt-5'>
                <Row className='mx-5 section-header'>
                    <Col lg={12} sm={12} xs={12} >
                        <Row className='view-form-header align-items-center'>
                            <Col lg={8} sm={8} xs={8} className=''>
                                Campaign
                                <h5>{campaignData?.campaign_name}</h5>
                            </Col>
                            <Col lg={4} sm={4} xs={4} className="text-end"  >
                                <Button className='mx-2 btn-sm' variant="outline-light" onClick={handleBack} >
                                    Back
                                </Button>
                                {/* <Button className="btn btn-sm" variant="outline-light" onClick={handleDownload}>
                                    Download
                                </Button> */}
                            </Col>
                        </Row>
                    </Col>
                </Row>
            </Container>

            <Container className='mt-1'>
                <Row className='mx-5 view-form'>
                    <Col lg={12} sm={12} xs={12} >
                        <Row className="py-2 ibs-edit-form">

                            <Col lg={6} sm={6} xs={6} className='mb-2'>
                                <label>Campaign Name</label>
                                <span>{campaignData?.campaign_name || <>&nbsp;</>}</span>
                            </Col>
                            <Col lg={6} sm={6} xs={6} className='mb-2'>
                                <label>Status</label>
                                <span>{campaignData?.campaign_status || <>&nbsp;</>}</span>
                            </Col>

                            <Col lg={6} sm={6} xs={6} className='mb-2'>
                                <label>Type</label>
                                <span>{campaignData?.campaign_type || <>&nbsp;</>}</span>
                            </Col>

                            <Col lg={6} sm={6} xs={6} className='mb-2'>
                                <label>	Template Name</label>
                                <span>{campaignData?.template_name.replace(/_/g, ' ')  || <>&nbsp;</>}</span>
                            </Col>
                            <Col lg={6} sm={6} xs={6} className='mb-2'>
                                <label>Group Name</label>
                                <span>{campaignData?.group_name || <>&nbsp;</>}</span>
                            </Col>

                            <Col lg={6} sm={6} xs={6} className='mb-2'>
                                <label>Start Date</label>
                                <span>{moment(new Date(campaignData?.start_date)).format("DD-MM-YYYY h:mm:ss A")  || <>&nbsp;</>}</span>
                            </Col>

                            <Col lg={12} sm={12} xs={12} className='mb-4'>
                                <label>Description</label>
                                <span>{campaignData?.file_description || <>&nbsp;</>}</span>
                            </Col>
                        </Row>
                    </Col>
                </Row >
            </Container >
            {body?.length>0 &&
            <>
              <Container className='mt-2'>
                <Row className='g-0 mx-5'>
                    <Col lg={12} className="section-header">
                        <span className='mx-2'>Message History</span>
                    </Col>
                </Row>
            </Container>

            <Container className='mb-5 mt-3'>
                <Row className='g-0 mx-5'>
                    <Col lg={12} sm={12} xs={12} className="mb-3">
                        <Row className="g-0">
                            <Col lg={12} sm={12} xs={12} >
                                <DatatableWrapper
                                    body={body}
                                    headers={header}
                                    paginationOptionsProps={{ initialState: { rowsPerPage: 10, options: [5, 10, 15, 20], } }}
                                >
                                    <Row className="mb-2 d-flex justify-content-start">
                                        <Col lg={3} sm={6} xs={6} className="d-flex flex-col justify-content-start align-items-start" >
                                            <Filter />
                                        </Col>
                                        <Col lg={5} sm={6} xs={6} className="d-flex flex-col justify-content-start align-items-start" >

                                        </Col>
                                        <Col lg={4} sm={6} xs={6} className="d-flex flex-col justify-content-end align-items-end" >
                                            <Button className="btn btn-sm" variant="outline-secondary" onClick={handleDownload}>
                                                Download
                                            </Button>
                                        </Col>
                                    </Row>
                                    <Table striped className="related-list-table" responsive="sm">
                                        <TableHeader />
                                        <TableBody />
                                    </Table>

                                    <Row className="mb-2">
                                        <Col lg={6} sm={12} xs={12}  >
                                            <Pagination />
                                        </Col>
                                        <Col lg={6} sm={12} xs={12} className='text-end'>
                                            <span className='mx-2'><b>Total Records:</b> {body[0]?.total_records ? body[0]?.total_records : 0}</span>
                                            <span className='mx-2'><b>Success:</b> {body[0]?.success_count ? body[0]?.success_count : 0}</span>
                                            <span className='mx-2'><b>Failled:</b> {body[0]?.failed_count ? body[0]?.failed_count : 0}</span>
                                        </Col>
                                    </Row>
                                </DatatableWrapper>
                            </Col>
                        </Row>
                    </Col>
                </Row>
            </Container>
            </>

}
          
            <ToastContainer />
        </>
    )
}

export default CampaignView