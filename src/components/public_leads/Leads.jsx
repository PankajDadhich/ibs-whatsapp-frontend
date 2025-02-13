import React, { useEffect, useState } from "react";
import { Button, Col, Form, Row, Table, Container } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import WhatsAppAPI from "../../api/WhatsAppAPI";
import Badge from 'react-bootstrap/Badge';
// import jwt_decode from "jwt-decode";
import { DatatableWrapper, Filter, Pagination, PaginationOptions, TableBody, TableHeader, } from "react-bs-datatable";
import { Link } from "react-router-dom";

const Leads = () => {
  const navigate = useNavigate();
  const [body, setBody] = useState([]);
  const [name, setName] = useState();
  const [lead, setLead] = useState();
  const [leadStatusArray, setleadStatusArray] = useState(JSON.parse(localStorage.getItem('lead_status')));
  const [isSpinner, setIsSpinner] = useState(false);

  useEffect(() => {

    async function init() {
      const leads = await WhatsAppAPI.getAllLeads();
      if (leads.success) {
        setBody(leads.records);
        setLead(leads.records);
      } else {
        setBody([]);
        setLead([]);
      }
      setIsSpinner(true);
    }
    init();
    setName(body.firstname + " " + body.lastname);
  }, [name]);

  const onFilterType = (event) => {
//    console.log('data.status', event.target.value)
//    console.log('lead',lead)
    if (event.target.value === "") {
      setBody(lead);
    } else {
      setBody(
        lead.filter((data) => {
          if (
            (data.status || "").toLowerCase() ===
            (event.target.value || "").toLowerCase()
          ) {
        //    console.log(data,'data')
            return data;
          }
        })
      );
    }
  };

  const editLead = (lead) => {
    navigate(`/web_leads/${lead.id}`, { state: lead });
  };

  const header = [];
  
    header.push(
      {
        title: "Name",
        prop: "name",
        isFilterable: true, isSortable: true,
        cell: (row) => (
          <Link className="text-capitalize" to={"/web_leads/view/" + row.id} state={row}>
            {row.name}
          </Link>
        ),
      },
      {
        title: "Phone",
        prop: "mobile_no",
        cell: (row) => (
       
           <span>{row.mobile_no !== "0" ? row.mobile_no : '' }</span> 
        ),
      },
      { title: "Email", prop: "email" },
      {
        title: "Status",
        prop: "status",
        cell: (row) => (
          <span
            className="badge text-capitalize"
            style={{
              borderRadius: "15px",
              padding: "0.6em 0.75em",
              backgroundColor:
                row.status.toLowerCase() === "working - contacted"
                  ? "rgba(245, 194, 106, 1)"
                  : row.status.toLowerCase() === "open - not contacted"
                  ? "rgb(254, 134, 134)"
                  : row.status.toLowerCase() === "closed - converted"
                  ? "rgb(170, 240, 129)"
                  : "rgb(211, 211, 211)",
              color: "#555555",
              cursor: "default",
            }}
          >
            {row.status}
          </span>
        ),
      },        
      {
        title: "Actions",
        prop: "actions",
        cell: (row) => (
         ( (row.status !== "Closed - Converted") &&
          <Button className="btn-sm mx-2" onClick={() => editLead(row)}>
            <i className="fa-regular fa-pen-to-square"></i>
          </Button>)
        ),
      }
    )
  


  const labels = {
    beforeSelect: " ",
  };

  const createLead = () => {
    navigate(`/web_leads/add`);
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
      {body ?
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
                            name="status"
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
    </>
  );
};
export default Leads;