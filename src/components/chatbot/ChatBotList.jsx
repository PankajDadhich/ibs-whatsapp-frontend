import React, { useEffect, useState } from 'react'
import {Button, Col, Container, Row, Table} from 'react-bootstrap'
import WhatsAppAPI from '../../api/WhatsAppAPI';
import { DatatableWrapper, Filter, Pagination, PaginationOptions, TableBody, TableHeader } from 'react-bs-datatable';
import moment from 'moment-timezone';
import { Link } from 'react-router-dom';
import AddChatBot from './AddChatBot';
import { ToastContainer, toast } from 'react-toastify'; // npm i react-toastify --force
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from "react-router-dom";
import Confirm from "../Confirm";

import helper from "../common/helper";
import * as constants from '../../constants/CONSTANT';

const ChatBotList  = ({selectedWhatsAppSetting}) => {
    const navigate = useNavigate();
    const [chatbots, setChatbots] = useState([]);
    const [isSpinner, setIsSpinner] = useState(false);
    const [showHideModel, setShowHideModel] = useState(false);
    const [selectedChatbot, setSelectedChatbot] = useState(null);
    const [selectedStatus, setSelectedStatus] = useState(false);

    useEffect(() => {
        fetchChatbotRecords(selectedWhatsAppSetting);
    }, [selectedWhatsAppSetting]);

    const fetchChatbotRecords = async (selectedWhatsAppSetting) => {
        const result = await WhatsAppAPI.fetchChatbots(selectedWhatsAppSetting);
        if (result.success) {
            setChatbots(result.data);
        } else {
            setChatbots([]);
        }
        setIsSpinner(true);
    };

    const createRecord = () => {
        navigate("/chatbot/add");
    }

    const editRecord = (data) => {
        navigate(`/chatbot/${data.id}/e`, { state: data });
      };

    const labels = { beforeSelect: " " };
    const header = [
        {
            title: "Keyword",
            prop: "keyword",
            isFilterable: true
        },
        {
            title: "Action Type",
            prop: "action_type",
            isFilterable: true
        },
        {
            title: "Status",
            prop: "status",
            cell: (row) => (
                <Button
                    className="btn-sm mx-2" title="Update status"
                    variant={row.status ? "success" : "danger"}
                    onClick={() => toggleStatusChangeModal(row.id, row.status)}
                >
                    {row.status ? 'Active' : 'Inactive'}
                </Button>
            )
        },
        {
            title: "Actions",
            prop: "id",
            cell: (row) => (
                <>
                    {
                        <Button className="btn-sm mx-2 " onClick={() => editRecord(row)}>
                            <i className="fa-solid fa-pen-to-square" title='Edit'></i>
                        </Button>
                    }
                  
                </>
            ),
        },
    ];

    const toggleStatusChangeModal = (id, status) => {
        setSelectedChatbot(id);
        setSelectedStatus(status);
        setShowHideModel(true);
    };

    const changeChatbotStatus = async () => {
        try {
            const newStatus = !selectedStatus;
            const response = await WhatsAppAPI.changeChatbotStatus(selectedChatbot, newStatus);
            if (response.success) {
                setShowHideModel(false);
                toast.success('Chatbot status updated successfully.');
                fetchChatbotRecords();
            } else {
                toast.error(response.message);
            }
        } catch (error) {
            console.error("Error changing status:", error);
        }
    };

    return (
        <>
            <Container className='mt-5'>
                <Row className='mx-5 text-center g-0'>
                    <Col lg={12} xs={12} sm={12}>
                        <div className='text-center p-2' style={{ height: '40px', backgroundColor: '#ffffff', borderRadius: '5px' }}>
                            <span className='fw-semibold p-1' style={{ color: '#605C68', fontSize: 'large' }}>
                                Chatbot Records
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
                                        body={chatbots}
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
                                        
                                                    <Button className="btn btn-sm" variant="outline-secondary" onClick={() => createRecord()}>
                                                        Add New Bot
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



                <ToastContainer />
        </>
    );
};

export default ChatBotList;
