/**
 * @author      Abdul Pathan
 * @date        Sep, 2024
 * @copyright   www.ibirdsservices.com
 */

import React, { useEffect, useState } from 'react'
import { Button, Col, Container, Row, Table } from 'react-bootstrap'
import { DatatableWrapper, Filter, Pagination, PaginationOptions, TableBody, TableHeader } from 'react-bs-datatable';
import WhatsAppAPI from '../../api/WhatsAppAPI';
import { ToastContainer, toast } from 'react-toastify'; // npm i react-toastify --force
import 'react-toastify/dist/ReactToastify.css';
import WhatsAppSetingEdit from './WhatsAppSetingEdit';
import jwt_decode from "jwt-decode";


const WhatsAppSetting = () => {
    const [body, setBody] = useState([]);
    const [isSpinner, setIsSpinner] = useState(false);
    const [modalShowHide, setModalShowHide] = useState(false);
    const [rowData, setRowData] = useState();
    const [userInfo, setUserInfo] = useState(jwt_decode(sessionStorage.getItem('token')));

    useEffect(() => {
        fetchData();
    }, [])

    const fetchData = async () => {
        try {
            const response = await WhatsAppAPI.getWhatsAppSettingRecord();
            if (response.success) {
                setBody(response.record)
            } else {
                setBody([]);
            }
        } catch (error) {
            console.error('Error fetching campaign data:', error);
            setBody([]);
        } finally {
            setIsSpinner(true);
        }
    }


    // Create table headers consisting of 4 columns.
    const labels = { beforeSelect: " " };
    const header = [
        { title: "Name", prop: "name", isFilterable: true, },
        { title: "App ID", prop: "app_id" },
        { title: "Phone number ID", prop: "business_number_id" },
        { title: "WhatsApp Business Account ID", prop: "whatsapp_business_account_id" },
        { title: "End Point Url", prop: "end_point_url" },
        { title: "Phone", prop: "phone" },
        {
            title: "Actions",
            prop: "id",
            cell: (row) => (
                <>
                    <Button className="btn-sm mx-2 " onClick={() => editRecord({ row })}>
                        <i className="fa-solid fa-pen-to-square" title='Edit'></i>
                    </Button>
                </>
            ),
        },
    ];

    const editRecord = (data) => {
        setModalShowHide(true);
        setRowData(data?.row)
    }

    const createRecord = () => {
        setModalShowHide(true);
        setRowData()
    }

    const onRefreshData = () => {
        // toast.success('Record updated successfully.');
        setModalShowHide(false);
        fetchData()
    }


    return (
        <>
            <Container className='mt-5'>
                <Row className='mx-5 text-center g-0'>
                    <Col lg={12} xs={12} sm={12}>
                        <div className=' text-center p-2' style={{ height: '40px', backgroundColor: '#ffffff', borderRadius: '5px' }}>
                            <span className='fw-semibold p-1' style={{ color: '#605C68', fontSize: 'large' }}>
                                WhatsApp Setting
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
                                           <Col lg={4} sm={12} xs={12} className="mt-2 d-flex flex-col justify-content-end align-items-end">
                                                    <Button className="btn btn-sm" variant="outline-secondary" onClick={() => createRecord()}>
                                                        Add New Setting
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
                <WhatsAppSetingEdit
                    show={modalShowHide}
                    onHide={() => { setModalShowHide(false) }}
                    onRefreshData={onRefreshData}
                    rowData={rowData}
                    table="whatsAppSetting"
                />
            }

            <ToastContainer />
        </>
    )
}

export default WhatsAppSetting
