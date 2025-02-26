import React, { useState, useEffect } from "react";
import { Card, Button, Col, Container, Row, Table, Modal, Alert, Tabs, Tab, Badge } from "react-bootstrap";
import { useLocation } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import WhatsAppAPI from "../../api/WhatsAppAPI";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { DatatableWrapper, Filter, Pagination, PaginationOptions, TableBody, TableHeader } from 'react-bs-datatable';
import { Link } from "react-router-dom";
import { ShimmerTable } from "react-shimmer-effects";
import Confirm from "../Confirm";

const CompanyView = (props) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [company, setCompany] = useState(location.state ? location.state : {});
  // const [modalShow, setModalShow] = useState(false);
  const [rowRecords, setRowRecords] = useState();
  const [selectedTab, setSelectedTab] = useState("Invoices");
  const [invoice, setInvoices] = useState([]);
  const [invoiceCheck, setInvoiceCheck] = useState(true);
  
  const [modalShow, setModalShow] = useState(false);
  const [statusRow, setStatusRow] = useState(undefined);

  const tabs = ["Invoices"];

  const handleMainTab = async (tabname) => {
    try {
      if (tabname === "Invoices") {
        setInvoiceCheck(true);
        setSelectedTab(tabname);
      }
    } catch (error) {
  //    console.log("error=>", error);
    }
  };

  useEffect(() => {
    fetchcompany();
    fetchInvoices();
  }, [statusRow]);

  const fetchcompany = () => {
    if (location.hasOwnProperty("pathname")) {
      company.id = location.pathname.split("/")[2];
    }
    async function init() {
      let result = await WhatsAppAPI.getCompanyRecordsById(company.id);
      if (result) {
        setCompany(result);
      } else {
        setCompany({});
      }
    }
    init();
  };


  const editCompany = () => {
    // setModalShow(true);
    setRowRecords(company);
    navigate(`/company/edit/${company.id}`, { state: company });
  };

  // const recordSaveSuccesfully = () => {
  //   setModalShow(false);
  //   fetchcompany();
  // };
  const handleBack = () => {
    navigate(`/company`);
  };

  async function fetchInvoices() {
    let result = await WhatsAppAPI.getInvoicesByCompanyId(company.id);
    if (result) {
      setInvoices(result);
    } else {
      setInvoices([]);
    }
  }

  const header = [
    {
      title: 'Invoice ID', prop: 'invoice_no',
      cell: (row) => (
        <Link
          to={'/invoice/' + row.id}
        >
          ID-{row.invoice_no}
        </Link>
      )
    },
    { title: "Plan", prop: "plan_name", isFilterable: true },
    { title: "Validity (in Months)", prop: "validity", isFilterable: true },
    {
      title: 'Status',
      prop: 'status',
      isFilterable: true,
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

    // { title: "Invoice Status", prop: "status", isFilterable: true, cell: (row) => (<>{(new Date() > new Date(row.due_date) && (row.status === 'Pending')) ? 'Over Due' : row.status}</>) },
    {
      title: "Action", prop: "status", isFilterable: false,
      cell: (row) => {
        return (
          <>{
            row.status === 'Pending' ?
              <>
                <Link to={'/invoice/pay/' + row.id}><button className={"btn btn-sm  mx-2 btn-success"}><span>Pay</span></button></Link>
                <Button className="btn-sm mx-2" variant="danger" onClick={() => handleCancelInvoice(row)}><i className="fa-regular fa-pen-to-square"></i> Cancel Invoice</Button>
              </>
              : ''
          }
          </>
        );
      },
    },
  ];
  const labels = {
    beforeSelect: " "
  }

  const handleCancelInvoice = (row) => {
    setStatusRow(row);
    setModalShow(true);
  }

  //edit record
  const handleCancelPay = async () => {
    const editRecord = {
      id: statusRow?.id,
      status: 'Cancel',
    };
    let response = {};
    response = await WhatsAppAPI.updateInvoiceRecord(editRecord);
    if (response.success) {
      toast.success(response.message);
      setStatusRow(undefined);
      setModalShow(false);

    } else {
      toast.error(response.message);
    }
  }

  return (
    <>
      <Container className='mt-5'>
        <Row className='mx-5 section-header'>
          <Col lg={12} sm={12} xs={12}>
            <Row className='view-form-header align-items-center'>
              <Col lg={8} sm={8} xs={8} className=''>
              Company Details
              </Col>
              <Col lg={4} sm={4} xs={4} className="text-end"  >
                <Button className='mx-2 btn-sm' variant="light" onClick={handleBack} >
                  Back
                </Button>
                <Button className="btn btn-sm" variant="danger"  onClick={() => editCompany(true)}>
                  Edit
                </Button>
              </Col>
            </Row>
          </Col>
        </Row>
      </Container>

      <Container className='mt-1'>
      <Row className='mx-5 view-form'>
          <Col lg={12} sm={12} xs={12} >
              <Row className="py-2 ibs-edit-form">

              <Col lg={6} sm={6} xs={6} className="mb-2">
                <label>Company Name</label>
                <span className="text-capitalize">{company.name ? company.name : <>&nbsp;</>}</span>
              </Col>
              <Col lg={6} sm={6} xs={6} className="mb-2">
                <label>Tenant Code</label>
                <span className="text-capitalize">{company.tenantcode ? company.tenantcode : <>&nbsp;</>}</span>
              </Col>
              <Col lg={6} sm={6} xs={6} className="mb-2">
                <label>Admin Email</label>
                <span>{company.adminemail ? company.adminemail : <>&nbsp;</>}</span>
              </Col>
              <Col lg={6} sm={6} xs={6} className="mb-2">
                <label>System Email</label>
                <span>{company.systememail ? company.systememail : <>&nbsp;</>}</span>
              </Col>
              <Col lg={6} sm={6} xs={6} className="mb-2">
                <label>City</label>
                <span>{company.city ? company.city : <>&nbsp;</>}</span>
              </Col>
              <Col lg={6} sm={6} xs={6} className="mb-2">
                <label>Street</label>
                <span className="text-capitalize">{company.street ? company.street : <>&nbsp;</>}</span>
              </Col>
              <Col lg={6} sm={6} xs={6} className="mb-2">
                <label>State</label>
                <span className="text-capitalize">{company.state ? company.state : <>&nbsp;</>}</span>
              </Col>
              <Col lg={6} sm={6} xs={6} className="mb-2">
                <label>Pincode</label>
                <span className="text-capitalize">{company.pincode ? company.pincode : <>&nbsp;</>}</span>
              </Col>
              {/* <Col lg={6} sm={6} xs={6} className="mb-2">
              <label className="fw-bold">Logo Url</label>
              <img src={company.logourl} alt="logo url" style={{ width: "75px", height: "75px" }} />
            </Col> */}
            </Row>
          </Col>
        </Row>
        <Card bg="light" text="light" className="mx-5 mt-4">
          <Card.Header className="d-flex card-header-grey justify-content-between">
            <Tabs defaultActiveKey="Invoices" id="uncontrolled-tab-example" onSelect={(key) => handleMainTab(key)}>
              <Tab eventKey="Invoices" title="Invoices"></Tab>

            </Tabs>

          </Card.Header>
          <Card.Body>
          {selectedTab === "Invoices" && (
                          <Col lg={12} className="px-4 pb-4">
                            {invoice ?
                             <DatatableWrapper
                             body={invoice}
                             headers={header}
                             paginationOptionsProps={{ initialState: { rowsPerPage: 10, options: [5, 10, 15, 20], } }}
                         >
                             <Row className="mb-2 d-flex justify-content-start">
                                 <Col lg={3} sm={6} xs={6} className="d-flex flex-col justify-content-start align-items-start" >
                                     <Filter />
                                 </Col>
                                 <Col lg={5} sm={6} xs={6} className="d-flex flex-col justify-content-start align-items-start" >

                                 </Col>
                                 {/* <Col lg={4} sm={6} xs={6} className="d-flex flex-col justify-content-end align-items-end" >
                                 <Link to={'/invoice/generate/' + company.id}><Button className="btn-sm" variant="outline-primary">Generate Invoice</Button></Link>
                                 </Col> */}
                             </Row>
                             <Table striped className="related-list-table" responsive="sm">
                                 <TableHeader />
                                 <TableBody />
                             </Table>

                             <Row className="mb-2">
                                 <Col lg={6} sm={12} xs={12}  >
                                     <Pagination />
                                 </Col>
                                
                             </Row>
                         </DatatableWrapper>
                     : <ShimmerTable row={10} col={8} />}
                          </Col>
                        )}
          </Card.Body>
        </Card>
        <ToastContainer />
      </Container>
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
    </>
  );
};
export default CompanyView;