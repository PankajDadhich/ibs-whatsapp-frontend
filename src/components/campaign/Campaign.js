/**
 * @author      Abdul Pathan
 * @date        Aug, 2024
 * @copyright   www.ibirdsservices.com
 */

import React, { useEffect, useState } from 'react'
import { Button, Col, Container, Row, Table } from 'react-bootstrap'
import WhatsAppAPI from '../../api/WhatsAppAPI';
import { DatatableWrapper, Filter, Pagination, PaginationOptions, TableBody, TableHeader } from 'react-bs-datatable';
import moment from 'moment-timezone';
import { Link } from 'react-router-dom';
import CampaignEdit from './CampaignEdit';
import { ToastContainer, toast } from 'react-toastify'; // npm i react-toastify --force
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from "react-router-dom";
import fileDownload from 'js-file-download';
import helper from "../common/helper";
import * as constants from '../../constants/CONSTANT';

const Campaign = ({selectedWhatsAppSetting}) => {
    const navigate = useNavigate();
    const [body, setBody] = useState([]);
    const [isSpinner, setIsSpinner] = useState(false);
    const [modalShowHide, setModalShowHide] = useState(false);
    const [rowData, setRowData] = useState();

    useEffect(() => {
        fetchData(selectedWhatsAppSetting);
   }, [selectedWhatsAppSetting])

    const fetchData = async (selectedWhatsAppSetting) => {
        try {
            const result = await WhatsAppAPI.getCampaignData(selectedWhatsAppSetting);

            if (result.success) {
                const formattedResult = result.records.map(record => {
                    const formattedStartDate = moment(record.start_date).format('M/D/YYYY, h:mm:ss A');
                    const groupNames = record.groups ? record.groups.map(group => group.name).join(', ') : '';
                    return { ...record, start_date: formattedStartDate, group_name: groupNames };
                });

                setBody(formattedResult);
            } else {
                setBody([]);
            }
        } catch (error) {
            setBody([]);
            console.error('Error fetching campaign data:', error);
        } finally {
            setIsSpinner(true);
        }
    }

    // Create table headers consisting of 4 columns.
    const labels = { beforeSelect: " " };
    const header = [
        { title: "Name", prop: "campaign_name", isFilterable: true, cell: (row) => (<Link to={"/campaign/view/" + row.campaign_id} state={row}>{row.campaign_name}</Link>) },
        { title: "Type", prop: "campaign_type", isFilterable: true },
        { title: "Template Name", prop: "template_name", isFilterable: true, cell: (row) => row.template_name.replace(/_/g, ' ') },
        { 
            title: "Start Date", 
            prop: "start_date",
            cell: (row) => row.start_date ? moment(new Date(row.start_date)).format("DD-MM-YYYY h:mm:ss A") :''
          },          
          {
            title: 'Status',
            prop: 'campaign_status',
            isFilterable: true,
            cell: (row) => {
                const status = row.campaign_status ? row.campaign_status.toLowerCase() : '';
        
                return (
                    <>
                        {status === 'completed' ? (
                            <Button className="btn-sm text-capitalize" variant='' style={{ borderRadius: "15px", backgroundColor: 'rgb(199, 216, 241)', cursor: "default" }} >
                                {row.campaign_status}
                            </Button>
                        ) : status === 'pending' ? (
                            <Button className="btn-sm text-capitalize" variant='' style={{ borderRadius: "15px", backgroundColor: 'rgb(241 218 177)', cursor: "default" }} >
                                {row.campaign_status}
                            </Button>
                        ) : status === 'aborted' ? (
                            <Button className="btn-sm text-capitalize" variant='' style={{ borderRadius: "15px", backgroundColor: 'rgb(248 195 200)', cursor: "default" }} >
                                {row.campaign_status}
                            </Button>
                        ) : status === 'in progress' ? (
                            <Button className="btn-sm text-capitalize" variant='' style={{ borderRadius: "15px", backgroundColor: 'rgb(208 187 244)', cursor: "default" }} >
                                {row.campaign_status}
                            </Button>
                        ) : (
                            <Button className="btn-sm text-capitalize" variant='' style={{ borderRadius: "15px", backgroundColor: 'rgb(199, 216, 241)', cursor: "default" }} >
                          pending
                        </Button>
                        )}
                    </>
                );
            },
        },    
        {
            title: "Actions",
            prop: "id",
            cell: (row) => (
                <>
                    {
                        (row.campaign_status !== 'Completed' && row.campaign_status !== 'Aborted' && row.campaign_status !== 'In Progress') &&
                        <Button className="btn-sm mx-2 " onClick={() => editRecord({ row })}>
                            <i className="fa-solid fa-pen-to-square" title='Edit'></i>
                        </Button>
                    }
                    <Button className='btn-sm' variant='' onClick={() => downloadFile(row)}>
                        <i className="fa-solid fa-cloud-arrow-down" title='download file'
                            style={{ fontSize: "20px", color: "rgb(64 119 237)" }}
                        ></i>
                    </Button>
                </>
            ),
        },
    ];

    const createCampaignRecord = () => {
        navigate("/campaign/add");
    }

    const editRecord = (data) => {
        setModalShowHide(true);
        setRowData(data?.row)
    }

    const onRefreshData = () => {
        toast.success('Record updated successfully.');
        fetchData(selectedWhatsAppSetting)
        setModalShowHide(false);
    }

    const downloadFile = async (row) => {
        try {
            if (!row?.file_title) {
                toast.error("File name required.");
                return;
            }

            const result = await WhatsAppAPI.downloadCampaignFile(row?.file_title);

            if (result) {
                fileDownload(result, row?.file_title);
                toast.success("File download successfully.");
            } else {
                toast.warning("File not found.");
            }
        } catch (error) {
            console.error('Error downloading file:', error);
            if (error.message === "Unauthorized access. Please login.") {
                toast.error("Unauthorized access. Please login.");
            } else {
                toast.error("Failed to download file. Please try again.");
            }
        }
    }


    return (
        <>
            <Container className='mt-5'>
                <Row className='mx-5 text-center g-0'>
                    <Col lg={12} xs={12} sm={12}>
                        <div className=' text-center p-2' style={{ height: '40px', backgroundColor: '#ffffff', borderRadius: '5px' }}>
                            <span className='fw-semibold p-1' style={{ color: '#605C68', fontSize: 'large' }}>
                                Campaign Records
                            </span>
                        </div>
                    </Col>
                </Row>
            </Container>


            {isSpinner ?

                <Container className='mb-5'>
                    <Row className='mx-5 g-0'>
                        <Col lg={12} sm={12} xs={12} className="mb-3">
                            <Row className="g-0">
                                <Col lg={12} sm={12} xs={12} >
                                    <DatatableWrapper
                                        body={body}
                                        headers={header}
                                        paginationOptionsProps={{ initialState: { rowsPerPage: 10, options: [5, 10, 15, 20], } }}
                                    >
                                        <Row className="mb-2">
                                            <Col lg={4} sm={10} xs={10} className="d-flex flex-col justify-content-end align-items-end" >
                                                <Filter />
                                            </Col>
                                            <Col lg={4} sm={2} xs={2} className="d-flex flex-col justify-content-start align-items-start" >
                                                <PaginationOptions labels={labels} />
                                            </Col>

                                            <Col lg={4} sm={12} xs={12} className="mt-2 d-flex flex-col justify-content-end align-items-end"  >
                                           
                                                    <Button className="btn btn-sm" variant="outline-secondary" onClick={() => createCampaignRecord()}>
                                                        Add New Campaign
                                                    </Button>
                                          
                                            </Col>

                                        </Row>
                                        <Table striped className="data-table" responsive="sm">
                                            <TableHeader />
                                            <TableBody />
                                        </Table>
                                        <Pagination />
                                    </DatatableWrapper>
                                </Col>
                            </Row>
                        </Col>
                    </Row>
                </Container>

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

            {modalShowHide &&
                <CampaignEdit
                    show={modalShowHide}
                    onHide={() => { setModalShowHide(false) }}
                    onRefreshData={onRefreshData}
                    rowData={rowData}
                    table="campaign"
                    selectedWhatsAppSetting={selectedWhatsAppSetting}
                />
            }

            <ToastContainer />
        </>
    )
}

export default Campaign