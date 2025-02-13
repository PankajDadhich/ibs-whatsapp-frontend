/**
 * @author      Abdul Pathan
 * @date        Sep, 2024
 * @copyright   www.ibirdsservices.com
 */

import React, { useEffect, useState } from "react";
import { Button, Col, Row, Table, Container } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import WhatsAppAPI from "../../api/WhatsAppAPI";
// import { ShimmerTable } from "react-shimmer-effects";
import { isMobile, MobileView, BrowserView } from 'react-device-detect';
import { DatatableWrapper, Filter, Pagination, PaginationOptions, TableBody, TableHeader, } from "react-bs-datatable";
import { Link } from "react-router-dom";
import { ToastContainer, toast } from 'react-toastify';//npm i react-toastify --force
import 'react-toastify/dist/ReactToastify.css';
import Confirm from "../Confirm";
import ImportContacts from "./ImportContacts";
import helper from "../common/helper";
import * as constants from '../../constants/CONSTANT';

const Contacts = () => {
    const navigate = useNavigate();
    const [body, setBody] = useState();
    const [showModal, setShowModal] = useState(false);
    const [showHideModel, setShowHideModel] = useState(false);
    const [rowData, setRowData] = useState();

    useEffect(() => {
        fetchRecords();
    }, []);

    const fetchRecords = async () => {
        const result = await WhatsAppAPI.getAllContactRecords();
        if (result.success) {
            setBody(result.records);
        } else {
            setBody([]);
        }
    }


    // Randomize data of the table columns.
    // Note that the fields are all using the `prop` field of the headers.
    const labels = { beforeSelect: " ", };
    // Create table headers consisting of 4 columns.
    const header = [];
    if (!isMobile) {
        header.push({
            title: "Name",
            prop: "firstname",
            isFilterable: true,
            cell: (row) => (
                <Link to={"/contacts/view/" + row.id} state={row} className="text-capitalize">
                    {row.firstname} {row.lastname}
                </Link>
            ),
        },
            { title: "Email", prop: "email", isFilterable: true },
            { title: "whatsapp number", prop: "whatsapp_number", isFilterable: true },
            { title: "City", prop: "city", isFilterable: true },
            { title: "state", prop: "state" },
            { title: "Country", prop: "country" },
            {
                title: "Actions",
                prop: "actions",
                cell: (row) => (
                    <>
                        <Button className="btn-sm mx-2" onClick={() => editContact(row)} >
                            <i className="fa-regular fa-pen-to-square"></i>
                        </Button>
                        <Button className="btn-sm mx-2" variant='danger' onClick={() => deleteRecord({ row })}>
                            <i className="fa-regular fa-trash-can" title='Delete'></i>
                        </Button>
                    </>
                ),
            }
        )
    } else {
        //for mobile device
        header.push({
            title: "Info",
            prop: "name",
            isFilterable: true, isSortable: true,
            cell: (row) => (
                <div className="mobilecard" >
                    <Link to={"/contacts/view/" + row.id} state={row} style={{ width: "100%" }}>
                        {row.firstname} {row.lastname}
                    </Link>
                    <span><i className="fa-solid fa-phone"></i> {row.phone}</span>
                    <span style={{ width: "80%" }}><i className="fa-solid fa-envelope"></i> {row.email}</span>
                </div>
            ),
        },
            {
                title: "Actions",
                prop: "actions",
                cell: (row) => (
                    <div className="mobilecard-actions">
                        <Button className="btn-sm mx-2" onClick={() => editContact(row)} >
                            <i className="fa-regular fa-pen-to-square"></i>
                        </Button>
                        {helper.checkPermission(constants.MODIFY_ALL) &&
                            <Button className="btn-sm mx-2" variant='danger' onClick={() => deleteRecord({ row })}>
                                <i className="fa-regular fa-trash-can" title='Delete'></i>
                            </Button>
                        }
                    </div>
                ),
            }
        )
    }


    const createContact = () => {
        navigate(`/contacts/e`);
    };

    const editContact = (contact) => {
        navigate(`/contacts/e`, { state: contact });
        // navigate(`/contacts/e/${contact.id}`, { state: contact });
    };


    const deleteRecord = (data) => {
        setShowHideModel(true);
        setRowData(data.row);
    }

    const deleteContact = async () => {//removeSelectedRow'
        if (rowData.id) {
            const result = await WhatsAppAPI.deleteContactRecord(rowData.id);
            if (result.success) {
                setShowHideModel(false);
                toast.success('Record deleted successfully.');
                fetchRecords()
            } else {
                setShowHideModel(false);
                toast.error(result.error.message);
            }
        }
    }

    const handleImportContact = () => {
        setShowModal(true)
    }

    const refreshData = () => {
        fetchRecords();
        setShowModal(false);
        // setIsSpinner(false); 
    }

    return (
        <>
            <Container className='mt-5'>
                <Row className='mx-5 text-center g-0'>
                    <Col lg={12} xs={12} sm={12}>
                        <div className=' text-center p-2' style={{ height: '40px', backgroundColor: '#ffffff', borderRadius: '5px' }}>
                            <span className='fw-semibold p-1' style={{ color: '#605C68', fontSize: 'large' }}>
                                Contact Records
                            </span>
                        </div>
                    </Col>
                </Row>
            </Container>

            <Container className='mb-5'>
                <Row className='mx-5 g-0'>
                    <Col lg={12} sm={12} xs={12} className="mb-3">
                        <Row className="g-0">
                            <Col lg={12} sm={12} xs={12}>
                                {body ? (
                                    <DatatableWrapper
                                        body={body}
                                        headers={header}
                                        paginationOptionsProps={{
                                            initialState: {
                                                rowsPerPage: 10,
                                                options: [5, 10, 15, 20],
                                            },
                                        }}
                                    >
                                        <Row className="mb-2">
                                            <Col xs={12} lg={4} className="d-flex flex-col justify-content-end align-items-end"                      >
                                                <Filter />
                                            </Col>
                                            <Col xs={12} sm={6} lg={4} className="d-flex flex-col justify-content-start align-items-start"                      >
                                                <PaginationOptions labels={labels} />
                                            </Col>
                                            <Col xs={12} sm={6} lg={4} className="d-flex flex-col justify-content-end align-items-end" >
                                                <Button className="btn-sm mx-1" variant="outline-primary" onClick={handleImportContact}>
                                                    Import Contacts
                                                </Button>
                                                <Button className="btn-sm" variant="outline-primary" onClick={() => createContact(true)}   >
                                                    Add New Contact
                                                </Button>
                                            </Col>
                                        </Row>
                                        <Table striped className="data-table" responsive="sm">
                                            <TableHeader />
                                            <TableBody />
                                        </Table>
                                        <Pagination />
                                    </DatatableWrapper>

                                ) : (
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
                                )}
                            </Col>
                        </Row>
                    </Col>
                </Row>
            </Container>

            {showHideModel && (
                <Confirm
                    show={showHideModel}
                    onHide={() => setShowHideModel(false)}
                    deleteContact={deleteContact}
                    title="Confirm delete?"
                    message="You are going to delete the record. Are you sure?"
                    table="contact"
                />
            )}


            {showModal && (
                <ImportContacts
                    show={showModal}
                    onHide={() => setShowModal(false)}
                    refreshData={refreshData}
                />
            )}


            <ToastContainer />
        </>
    );
};

export default Contacts;
