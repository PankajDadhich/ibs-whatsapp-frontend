/**
 * @author      Shivani Mehra
 * @date        Dec, 2024
 * @copyright   www.ibirdsservices.com
 */

import React, { useEffect, useState } from "react";
import { Button, Col, Row, Table,Container } from "react-bootstrap";
import { useNavigate } from 'react-router-dom'
import WhatsAppAPI from '../../api/WhatsAppAPI';
import { DatatableWrapper, Filter, Pagination, PaginationOptions, TableBody, TableHeader } from 'react-bs-datatable';
import { Link } from "react-router-dom";
import Confirm from "../Confirm";
import { ToastContainer, toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';

const CompanyList = () => {
  const [isSpinner, setIsSpinner] = useState(false);
  const navigate = useNavigate();
  const [body, setBody] = useState();
  const [statusRow, setStatusRow] = useState(undefined);

  useEffect(() => {
    init();
  }, []);

  async function init() {
    const result = await WhatsAppAPI.fetchCompany();
    setIsSpinner(true);
    if (result) {
      setBody(result);
    } else {
      setBody([]);
    }
  }

  const handleEditButton = (row) => {
    navigate(`/company/edit/${row.id}`, { state: row });
  };

  const statusHandler = (val) => {
    setStatusRow(val);
  };

  const companyListHandler = async () => {

    let editRecord;

    setStatusRow((prevData) => {
      editRecord = {...prevData, company_active: !prevData.company_active};
      return editRecord;
    });

    let response = {};
//    console.log(editRecord)
    response = await WhatsAppAPI.updateCompany(editRecord);
//    console.log(response)
    if (response.success) {
        toast.success(response.message);
        setStatusRow(undefined);
        init();
    } else {
        toast.error(response.message);
    }
  };

    const labels = { beforeSelect: " " };
    const header = [
      {
        title: 'Company Name', prop: 'name', isFilterable: true,
        cell: (row) => (
          <Link
            to={"/company/" + row.id}
            state={row}
          >
            {row.name}
          </Link>
        )
      },
  
      { title: "Tenant Code", prop: "tenantcode", isFilterable: true },
      { title: "Email", prop: "email", isFilterable: true },
      { 
        title: "Status", 
        prop: "company_active", 
        isFilterable: true, 
        cell: (row) => {
          return(
            <Button className={"btn-sm"} variant={row?.company_active ? "success" : "danger"} onClick={() => statusHandler(row)}>{row.company_active ? 'Active' : 'Inactive'}</Button>
          )        
        }
      },
      {
        title: "Action",
        prop: "company_active",
        isFilterable: true,
        cell: (row) => {
          return (
              <Button
                className="btn-sm mx-2"
                variant="primary"
                onClick={() => handleEditButton(row)}
              >
                <i className="fa-regular fa-pen-to-square"></i>
              </Button>
          );
        },
      },
    ];
  
    const createCompany = () => {
      navigate(`/company/add`);
    }

   
    return (
        <>
            <Container className='mt-5'>
                <Row className='mx-5 text-center g-0'>
                    <Col lg={12} xs={12} sm={12}>
                        <div className=' text-center p-2' style={{ height: '40px', backgroundColor: '#ffffff', borderRadius: '5px' }}>
                            <span className='fw-semibold p-1' style={{ color: '#605C68', fontSize: 'large' }}>
                                Company Records
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
                                                <Button className="btn btn-sm" variant="outline-secondary" onClick={() => createCompany()}>
                                                    Add New Company
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
            
          {statusRow && (
            <Confirm
                show={statusRow}
                onHide={() => setStatusRow(undefined)}
                changeCompanyStatus={companyListHandler}
                title={`Confirm ${statusRow?.company_active ? "Inactive ?" : "Active ?"}`}
                message="You are going to update the status. Are you sure?"
                table="company"
            />
          )}
        </>
    )
}

export default CompanyList
