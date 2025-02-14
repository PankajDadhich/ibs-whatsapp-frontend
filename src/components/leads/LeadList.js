import React, { useEffect, useState } from "react";
import { Button, Col, Form, Row, Table, Container } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { ShimmerTable } from "react-shimmer-effects";
import WhatsAppAPI from "../../api/WhatsAppAPI";
import Badge from 'react-bootstrap/Badge';
import { isMobile, MobileView, BrowserView } from 'react-device-detect';
// import jwt_decode from "jwt-decode";
import { DatatableWrapper, Filter, Pagination, PaginationOptions, TableBody, TableHeader, } from "react-bs-datatable";
import { Link } from "react-router-dom";

const LeadList = () => {
  const navigate = useNavigate();
  const [body, setBody] = useState([]);
  const [leadname, setLeadName] = useState();
  const [lead, setLead] = useState();
  const [leadStatusArray, setleadStatusArray] = useState(JSON.parse(sessionStorage.getItem('lead_status')));
  const [isSpinner, setIsSpinner] = useState(false);

  useEffect(() => {

    async function init() {
      const leads = await WhatsAppAPI.fetchLead();
      if (leads) {
        setBody(leads);
        setLead(leads);
      } else {
        setBody([]);
        setLead([]);
      }
      setIsSpinner(true);
    }
    init();
    setLeadName(body.firstname + " " + body.lastname);
  }, [leadname]);

  const onFilterType = (event) => {
    if (event.target.value === "") {
      setBody(lead);
    } else {
      setBody(
        lead.filter((data) => {
          if (
            (data.leadstatus || "").toLowerCase() ===
            (event.target.value || "").toLowerCase()
          ) {
            return data;
          }
        })
      );
    }
  };

  const getStatusClass = (status) => {
    let accessStatusRec = leadStatusArray.filter((value, index, array) => {
      if (value.label === status) {
        return true
      }
    });

    if (accessStatusRec && accessStatusRec.length > 0) {
      if (accessStatusRec[0].is_converted === true) {
        return 'success';
      } else if (accessStatusRec[0].is_lost === true) {
        return 'secondary';
      } else {
        return 'primary';
      }
    } else {
      return 'secondary';
    }
  }

  const editLead = (lead) => {
    navigate(`/leads/${lead.id}/e`, { state: lead });
  };

  const header = [];
  if (!isMobile) {
    header.push(
      {
        title: "Name",
        prop: "leadname",
        isFilterable: true, isSortable: true,
        cell: (row) => (
          <Link className="text-capitalize" to={"/leads/" + row.id} state={row}>
            {row.leadname}
          </Link>
        ),
      },
      { title: "whatsapp number", prop: "whatsapp_number" },
      { title: "Lead Source", prop: "leadsource" },
      { title: "Lead Status", prop: "leadstatus", },
      {
        title: "Actions",
        prop: "actions",
        cell: (row) => (
          <Button className="btn-sm mx-2" onClick={() => editLead(row)}>
            <i className="fa-regular fa-pen-to-square"></i>
          </Button>
        ),
      }
    )
  } else {
    //for mobile device

    header.push(
      {
        title: "Info",
        prop: "leadname",
        isFilterable: true, isSortable: true,
        cell: (row) => (
          <div className="mobilecard">
            <Link to={"/leads/" + row.id} state={row} style={{ fontSize: "1.2rem" }}>
              {row.leadname}
            </Link>
            <Link to={"/users/" + row.ownerid} state={row}>
              <i className="fa-solid fa-user"></i> {row.ownername}
            </Link>
            <span><i className="fa-solid fa-phone"></i> {row.phone}</span>
            <span style={{ width: "80%" }}><i className="fa-solid fa-envelope"></i> {row.email}</span>
            <Badge bg={getStatusClass(row.leadstatus)} style={{ paddingBottom: "5px", width: "80%" }}>
              {row.leadstatus}
            </Badge>
            <Button className="btn-sm mx-2" onClick={() => editLead(row)}>
              <i className="fa-regular fa-pen-to-square"></i> Edit
            </Button>
          </div>
        ),
      },
    )
  }


  const labels = {
    beforeSelect: " ",
  };

  const createLead = () => {
    navigate(`/leads/e`);
  };

  return (
    <>
      <Container className='mt-5'>
        <Row className='g-0 mx-5 text-center '>
          <Col lg={12} xs={12} sm={12}>
            <div className=' text-center p-2' style={{ height: '40px', backgroundColor: '#ffffff', borderRadius: '5px' }}>
              <span className='fw-semibold p-1' style={{ color: '#605C68', fontSize: 'large' }}>
                Lead Records
              </span>
            </div>
          </Col>
        </Row>
      </Container>
      {isSpinner ?
        <Container className='mt-1 mb-5'>
          <Row className='mx-5 g-0'>
            <Col lg={12} sm={12} xs={12} className="mb-2">
              <Row className="g-0">
                <Col lg={12} sm={12} xs={12}>
                  <DatatableWrapper body={body} headers={header} paginationOptionsProps={{ initialState: { rowsPerPage: 15, options: [5, 10, 15, 20], }, }} sortProps={{ initialState: { prop: "createddate", order: "desc" } }}>
                    <Row className="mb-2">
                      <Col
                        xs={12}
                        lg={4}
                        className="d-flex flex-col justify-content-end align-items-end"
                      >

                        <Filter />
                      </Col>
                      <Col
                        xs={12}
                        sm={6}
                        lg={5}
                        className="d-flex flex-col justify-content-start align-items-center"
                      >
                        <PaginationOptions labels={labels} />
                        <Form.Group className="mx-3 mt-4" controlId="formBasicStatus">
                          <Form.Select
                            aria-label="Enter status"
                            name="leadstatus"
                            onChange={onFilterType}
                          >
                            <option value="">--Select Type--</option>
                            {leadStatusArray.map((item, index) => (
                              <option value={item.label} key={index}>
                                {item.label}
                              </option>
                            ))}
                          </Form.Select>
                        </Form.Group>
                      </Col>
                      <Col
                        xs={12}
                        sm={6}
                        lg={3}
                        className="d-flex flex-col justify-content-end align-items-end"
                      >
                        <Button
                          className="btn-sm"
                          variant="outline-primary mx-2"
                          onClick={() => createLead(true)}
                        >
                          Add New Lead
                        </Button>
                      </Col>
                    </Row>
                    {body ? (
                      <Table striped className="data-table" responsive="sm">
                        <TableHeader />

                        <TableBody />
                      </Table>
                    ) : (
                      <ShimmerTable row={10} col={8} />
                    )}
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
    </>
  );
};
export default LeadList;