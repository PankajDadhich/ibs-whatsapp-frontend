import React, { useEffect, useRef, useState } from "react";
import { Button, Col, Row, Table, Badge,Container } from "react-bootstrap";
import { Link } from "react-router-dom";
import WhatsAppAPI from "../../api/WhatsAppAPI";
import { DatatableWrapper, Filter, Pagination, PaginationOptions, TableBody, TableHeader } from 'react-bs-datatable';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Confirm from "../Confirm";
import InvoiceView from "./InvoiceView";

// import jsPDF from 'jspdf'; //npm install jspdf
import html2canvas from 'html2canvas';
import "jspdf-autotable"; //npm install jspdf jspdf-autotable

const Invoices = () => {
    const [body, setBody] = useState([]);
    const [modalShow, setModalShow] = useState(false);
    const [rowRecords, setRowRecords] = useState();
    const [statusRow, setStatusRow] = useState(undefined);
    const [isSpinner, setIsSpinner] = useState(false);
    const [invoiceData, setInvoiceData] = useState(null);
    const [toggleInvoiceView, setToggleInvoiceView] = useState(false);
    const [showLoader, setShowLoader] = useState(false);

    const contentRef = useRef(null);

    //fetch  record
    const fetchInvoiceRecords = async (status) => {
        const result = await WhatsAppAPI.getInvoicesRecord(status);
        if (result) {
            setIsSpinner(true);
            setBody(result);
        //    console.log('subscriptions List', result)
        }else{
            setIsSpinner(true);
            setBody([]);
        }
    }

    useEffect(() => {
        fetchInvoiceRecords('none');
    }, [statusRow]);

    const sendInvoiceMailToPay = async (data) => {
        setShowLoader(true);
        setToggleInvoiceView(true);
        setInvoiceData(()=>{
            setTimeout(() => {
                const div = document.getElementById("pdf-div");
                // console.log('Div: ', div);
                html2canvas(div, {scale : 2}).then(async (canvas) => {
                    // console.log('Div2: ', div);
                    const imgData = canvas.toDataURL("image/png")
                    // console.log('Image Data:', imgData);
                    const res = await WhatsAppAPI.sendInvoiceMail(imgData, data);
                    setTimeout(() => {
                        toast.success(res.result);
                    }, 1000); 
                    setToggleInvoiceView(false);
                    setShowLoader(false);
                    // console.log(res);
                });
            }, 1000)
            return data;
        });
        // console.log('Ref: ', contentRef.current.innerHTML);
    }

    // const statusHandler = (val) => {
    //     setStatusRow(val);
    // };

    //Randomize data of the table columns.Note that the fields are all using the `prop` field of the headers.
    const labels = {
        beforeSelect: " "
    }

    //table headers
    const header = [
        {
            title: 'Invoice No.', prop: 'id', isFilterable: true, cell: (row) => (
                <Link
                    to={'/invoice/' + row.id}
                >
                    ID-{row.invoice_no}
                </Link>
            )
        },
        {
            title: 'Company', prop: 'company_name', isFilterable: true,
            cell: (row) => (
                <Link to={'/company/' + row.company_id}>
                    {row.company_name}
                </Link>
            )
        },
        { title: 'Plan', prop: 'plan_name', isFilterable: true, },
        { title: 'amount', prop: 'total_amount', isFilterable: true, },
        {
            title: 'Status',
            prop: 'status',
            cell: (row) => {
                var badgeColor;
                var value;
                if (row.status === 'Complete') {
                    badgeColor = 'success';
                    value = row.status;
                } else if (row.status === 'Pending') {
                    badgeColor = 'danger';
                    value = (new Date() < new Date(row.payment_due_date) ? 'Due' : 'Over Due');
                } else if (row.status === 'Cancel') {
                    badgeColor = 'warning';
                    value = row.status;
                }
                return (
                    <>
                        {/* <Button className="btn-sm mx-2" style={{ width: '80px' }} variant={myBoolean === 'Complete' ? "success" : 'danger'}>{value}</Button> */}
                        <h5><Badge bg={badgeColor} style={{ width: '80px', padding: '6px' }}>{value}</Badge></h5>
                    </>
                );
            },
        },
        {
            title: 'Actions',
            prop: 'id',
            cell: (row) => {
                return (
                    <>
                        {row.status === 'Pending' ?
                            <>
                                <Link to={'/invoice/pay/' + row.id}><button className={"btn btn-sm  mx-2 btn-success"}><span>Pay</span></button></Link>
                                <Button className="btn-sm mx-2" variant="danger" onClick={() => handleCancelInvoice(row)}><i className="fa-regular fa-pen-to-square"></i> Cancel Invoice</Button>
                                {/* <Button className="btn-sm" variant="info" onClick={()=> sendInvoiceMailToPay(row)}>Send Invoice Mail</Button> */}
                            </>
                            : ''}
                    </>
                );
            },
        }
    ];


    // Cancel Invoice
    const handleCancelInvoice = (row) => {
        setStatusRow(row);
        setModalShow(true);
    }

    const handleCancelPay = async () => {
        const editRecord = {
            id: statusRow?.id,
            status: 'Cancel',
        };
        let response = {};
        response = await WhatsAppAPI.updateInvoiceRecord(editRecord);
        if (response.success) {
            toast.success(response.message);
            setStatusRow(undefined)
        } else {
            toast.error(response.message);
        }
    }

    const handleStatus = (e) =>{
    //    console.log(e.target.name, e.target.value);
        fetchInvoiceRecords(e.target.value);
    }

    return (
        <>
            {showLoader && <div className="loader-container"><div className="loader"></div></div>}
            <Container className='mt-5'>
                <Row className='mx-5 text-center g-0'>
                    <Col lg={12} xs={12} sm={12}>
                        <div className=' text-center p-2' style={{ height: '40px', backgroundColor: '#ffffff', borderRadius: '5px' }}>
                            <span className='fw-semibold p-1' style={{ color: '#605C68', fontSize: 'large' }}>
                                Invoice Records
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
         

            {statusRow && (
                <Confirm
                    show={modalShow}
                    onHide={() => setStatusRow(undefined)}
                    handleCancelPay={handleCancelPay}
                    title="Cancel Invoice?"
                    message="You are going to update the status to cancel. Are you sure?"
                    table="cancel_invoice"
                />
            )}

            {(invoiceData && toggleInvoiceView) && (  
                <div style={{ position: 'absolute', top: '-9999px' }}>
                    <InvoiceView data={invoiceData} innerRef={contentRef}/>
                </div>              
            )}            

            <ToastContainer />
        </>
    )
}

export default Invoices;
