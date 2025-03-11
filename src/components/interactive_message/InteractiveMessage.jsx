/**
 * @author      shivani mehra
 * @date        Aug, 2024
 * @copyright   www.ibirdsservices.com
 */
    
import React, { useEffect, useState } from 'react'
import {Card, Button, Col, Container, Row, Table , ListGroup} from 'react-bootstrap'
import WhatsAppAPI from '../../api/WhatsAppAPI';
import { DatatableWrapper, Filter, Pagination, PaginationOptions, TableBody, TableHeader } from 'react-bs-datatable';
import moment from 'moment-timezone';
import { Link } from 'react-router-dom';
import AddInteractiveMessage from './AddInteractiveMessage';
import { ToastContainer, toast } from 'react-toastify'; // npm i react-toastify --force
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from "react-router-dom";
import helper from "../common/helper";
import * as constants from '../../constants/CONSTANT';

const InteractiveMessage = ({selectedWhatsAppSetting}) => {
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
            const result = await WhatsAppAPI.fetchInteractiveMessage(selectedWhatsAppSetting);

            if (result.success) {
               console.log("result",result)

                setBody(result.records);
            } else {
                setBody([]);
            }
        } catch (error) {
            setBody([]);
            console.error('Error fetching data:', error);
        } finally {
            setIsSpinner(true);
        }
    }

    // Create table headers consisting of 4 columns.
    const labels = { beforeSelect: " " };
    const header = [
        { title: "Name", prop: "name", isFilterable: true,  cell: (row) => row.name || 'N/A' },
        { title: "Header Content", prop: "header_content", cell: (row) => row.header_content || 'N/A' },
        { title: "Body Text", prop: "body_text", cell: (row) => row.body_text || 'N/A' },
        { title: "Footer Text", prop: "footer_text", cell: (row) => row.footer_text || 'N/A' },
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

    const createRecord = () => {
        navigate("/interactive_message/add");
    }

 
    const editRecord = (data) => {
        console.log("data",data)
        navigate(`/interactive_message/${data.id}/e`, { state: data });
      };

    return (
        <>
            <Container className='mt-5'>
                <Row className='mx-5 text-center g-0'>
                    <Col lg={12} xs={12} sm={12}>
                        <div className=' text-center p-2' style={{ height: '40px', backgroundColor: '#ffffff', borderRadius: '5px' }}>
                            <span className='fw-semibold p-1' style={{ color: '#605C68', fontSize: 'large' }}>
                                Quick Reply Records
                            </span>
                        </div>
                    </Col>
                </Row>
            </Container>
            <Container className='mb-5'>
                    <Row className='mx-5 g-0'>
                        <Col lg={12} sm={12} xs={12} className="mb-3">
                          
                        <div className="container mt-4 d-flex  flex-wrap gap-3">
      <Row className="g-4 justify-content-center">
        {body.map((msg) => (
          <Col
            key={msg.id}
            lg={4}
            md={6}
            sm={12}
            className="d-flex justify-content-center"
          >
            <Card
              className="p-3 shadow rounded-3 border-0"
              style={{
                backgroundColor: "#fff",
                width: "100%",
                maxWidth: "320px",
                borderRadius: "12px",
              }}
            >
              {/* Header */}
              {msg.header_type === "text" && (
                <h5 className="fw-bold text-dark">{msg.header_content}</h5>
              )}
              {msg.header_type === "image" && msg.file_id && (
                <div className="d-flex  mb-2">
                  <img
                    src="https://sandbox.watconnect.com/public/demo/attachment/9341624595953688.jpeg"
                    alt="Header"
                    className="img-fluid rounded"
                    style={{
                        width: "100%",
                        maxWidth: "120px", 
                        height: "auto",
                        objectFit: "cover",
                        borderRadius: "8px",
                      }}
                  />
                </div>
              )}

              {/* Body */}
              <p className="text-dark" style={{ fontSize: "1rem" }}>
                {msg.body_text}
              </p>

              {/* Footer */}
              <small className="text-muted d-block">{msg.footer_text}</small>

              {/* List Sections */}
              {msg.sections.length > 0 && (
                <ListGroup variant="flush" className="mt-2">
                  {msg.sections.map((section, index) => (
                    <div key={index}>
                      <h6 className="text-secondary fw-semibold mb-2">
                        {section.title}
                      </h6>
                      {section.rows.map((row) => (
                        <ListGroup.Item
                          key={row.id}
                          className="border-0 px-3 py-2 bg-light rounded mb-2"
                          style={{
                            cursor: "pointer",
                            transition: "0.3s",
                          }}
                        >
                          <strong className="text-dark">{row.title}</strong>
                          {row.description && (
                            <p className="text-muted mb-0">{row.description}</p>
                          )}
                        </ListGroup.Item>
                      ))}
                    </div>
                  ))}
                </ListGroup>
              )}

              {/* Buttons */}
              {msg.buttons.length > 0 && (
                <div className="mt-3 d-flex flex-column gap-2">
                  {msg.buttons.map((button) => (
                    <Button
                      key={button.id}
                      variant="light"
                      className="fw-semibold border px-4 py-2 rounded-pill"
                      style={{
                        fontSize: "0.95rem",
                        backgroundColor: "#f5f5f5",
                        color: "#007bff",
                        borderColor: "#dcdcdc",
                      }}
                    >
                      {button.text}
                    </Button>
                  ))}
                </div>
              )}

              {/* Edit Button */}
              <div className="mt-3 text-end">
                <Button
                  variant="outline-secondary"
                  className="px-3 py-1 rounded-pill"
                  style={{ fontSize: "0.9rem" }}
                  onClick={() => editRecord(msg)}
                >
                  ✏️ Edit
                </Button>
              </div>
            </Card>
          </Col>
        ))}
      </Row>
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
                                           
                                                    <Button className="btn btn-sm" variant="outline-secondary" onClick={() => createRecord()}>
                                                        Add New Message
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
    )
}

export default InteractiveMessage