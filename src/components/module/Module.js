/**
 * @author      Shivani Mehra
 * @date        Nov, 2024
 * @copyright   www.ibirdsservices.com
 */

import React, { useEffect, useState } from 'react'
import { Button, Col, Container, Row, Table } from 'react-bootstrap'
import WhatsAppAPI from '../../api/WhatsAppAPI';
import { DatatableWrapper, Filter, Pagination, PaginationOptions, TableBody, TableHeader } from 'react-bs-datatable';
import { ToastContainer, toast } from 'react-toastify'; // npm i react-toastify --force
import 'react-toastify/dist/ReactToastify.css';
import AddModuleModal from './AddModuleModal';
import Confirm from '../Confirm';

const Module = () => {
    const [body, setBody] = useState([]);
    const [isSpinner, setIsSpinner] = useState(false);
    const [modalShowHide, setModalShowHide] = useState(false);
    const [rowData, setRowData] = useState();
    const [showHideModel, setShowHideModel] = useState(false);
    const [showHideStatusModel, setShowHideStatusModel] = useState(false);

    useEffect(() => {
        fetchData();
    }, [])

    const fetchData = async () => {
        const result = await WhatsAppAPI.getModuleData();
        if (result.success) {
            setBody(result.records);
        } else {
            setBody([]);
        }
        setIsSpinner(true);
    }

    // Create table headers consisting of 4 columns.
    const labels = { beforeSelect: " " };
    const header = [
        { title:"OrderNo", prop:"order_no"},
        { title: "Name", prop: "name",isFilterable: true, cell: (row) => (
            <>
                <i className={`${row.icon} mx-1`}></i> {row.name}
            </>
        ), },
    
        { title:"Navigate URL", prop:"url"},
        {
            title: 'Status',
            prop: 'status',
            cell: (row) => {
                if (!row) return null;
                let myBoolean = row.status === 'active' ? "Active" : "Inactive";
                return (
                    <Button className="btn-sm mx-2 text-capitalize" onClick={() => toggleStatusChangeModal(row)} style={{ width: '80px' }} variant={myBoolean === 'Active' ? "success" : 'danger'}>{myBoolean}</Button>
                );
            },
        },
        {
            title: "Actions",
            prop: "id",
            cell: (row) => (
                <>
                    <Button className="btn-sm mx-2 " onClick={() => editRecord({ row })}>
                        <i className="fa-solid fa-pen-to-square" title='Edit'></i>
                    </Button>
                    <Button className="btn-sm mx-2" variant='danger' onClick={() => deleteRecord({ row })}>
                        <i className="fa-regular fa-trash-can" title='Delete'></i>
                    </Button>
                </>
            ),
        },
    ];

    const addRecord = () => {
        setModalShowHide(true);
        setRowData()
    }

    const editRecord = (data) => {
        setModalShowHide(true);
        setRowData(data?.row)
    }

    const onRefreshData = () => {
        fetchData()
        setModalShowHide(false);
    }
    
    const toggleStatusChangeModal = (row) => {
        setRowData(row);
        setShowHideStatusModel(true);
    };



    const changeModuleStatus = async () => {
        try {
             rowData.status = rowData.status === "active" ? "inactive" :"active";
            const response = await WhatsAppAPI.updateModuleRecord(rowData);
            if (response.success) {
                setShowHideStatusModel(false);
                toast.success('Module status updated successfully.');
                 fetchData();
            } else {
                setShowHideStatusModel(false);
                toast.error(response);
            }
        } catch (error) {
        //    console.log("Error changing status:", error);
        }
    };

    const deleteRecord = (data) => {
        setShowHideModel(true);
        setRowData(data.row);
    }

    const deleteModuleRecord = async () => {//removeSelectedRow'
        if (rowData.id) {
            const result = await WhatsAppAPI.deleteModuleRecord(rowData.id);
            if (result.success) {
                // toast.success('Record deleted successfully.');
                fetchData()
                setShowHideModel(false);

            } else {
                setShowHideModel(false);
                toast.error(result.error.message);
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
                                Module Records
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
                                            <Col lg={3} sm={10} xs={10} className="d-flex flex-col justify-content-end align-items-end" >
                                                <Filter />
                                            </Col>
                                            <Col lg={4} sm={2} xs={2} className="d-flex flex-col justify-content-start align-items-start" >
                                                <PaginationOptions labels={labels} />
                                            </Col>

                                            <Col lg={5} sm={12} xs={12} className="mt-2 d-flex flex-col justify-content-end align-items-end"  >
                                                <Button className="btn btn-sm" variant="outline-secondary" onClick={() => addRecord()}>
                                                    Add New Module
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

            {modalShowHide &&
                <AddModuleModal
                    show={modalShowHide}
                    onHide={() => { setModalShowHide(false) }}
                    onRefreshData={onRefreshData}
                    rowData={rowData}
                    table="module"
                    orderNumber={body?.length+1}
                />
            }

            {showHideModel && (
                <Confirm
                    show={showHideModel}
                    onHide={() => setShowHideModel(false)}
                    deleteModuleRecord={deleteModuleRecord}
                    title="Confirm delete?"
                    message="You are going to delete the record. Are you sure?"
                    table="module"
                />
            )}

            
        {showHideStatusModel && (
                <Confirm
                    show={showHideStatusModel}
                    onHide={() => setShowHideStatusModel(false)}
                    changeModuleStatus={changeModuleStatus}
                    title="Confirm status change?"
                    message="Are you sure you want to change the module's status?"
                    table="module_status"
                />
            )}


        </>
    )
}

export default Module
