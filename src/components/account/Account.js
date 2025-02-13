/**
 * @author      Abdul Pathan
 * @date        Aug, 2024
 * @copyright   www.ibirdsservices.com
 */

import React, { useEffect, useState } from "react";
import { Button, Col, Row, Table, Container } from "react-bootstrap";
import { useNavigate, Link } from "react-router-dom";
import WhatsAppAPI from "../../api/WhatsAppAPI";
import { ShimmerTable } from "react-shimmer-effects";
import { isMobile, MobileView, BrowserView } from 'react-device-detect';
import { ToastContainer, toast } from 'react-toastify';//npm i react-toastify --force
import 'react-toastify/dist/ReactToastify.css';
import { DatatableWrapper, Filter, Pagination, PaginationOptions, TableBody, TableHeader, } from "react-bs-datatable";
import helper from "../common/helper";
import * as constants from '../../constants/CONSTANT';

const Account = () => {
  const navigate = useNavigate();
  const [body, setBody] = useState([]);

  useEffect(() => {
    fetchAccounts();
  }, []);

  const fetchAccounts = async () => {
    const accounts = await WhatsAppAPI.fetchAccounts();
    if (accounts) {
      setBody(accounts);
    } else {
      setBody([]);
    }
  }

  const header = [];
  if (!isMobile) {
    header.push(
      {
        title: "Account Name",
        prop: "name",
        isFilterable: true,
        cell: (row) => (
          <Link to={"/accounts/" + row.id} state={row}>
            {row.name}
          </Link>
        ),
      },
      { title: "Street", prop: "street", isFilterable: true },
      { title: "City", prop: "city", isFilterable: true },
      { title: "Phone", prop: "phone", isFilterable: true },
      { title: "Email", prop: "email", isFilterable: true },
      { title: "Website", prop: "website", isFilterable: true })
  } else {
    //for mobile device

    header.push(
      {
        title: "Info",
        prop: "name",
        isFilterable: true, isSortable: true,
        cell: (row) => (
          <div className="mobilecard" >
            <Link to={"/accounts/" + row.id} state={row} style={{ width: "100%" }}>
              {row.name}
            </Link>

            <span><i className="fa-solid fa-phone"></i> {row.phone}</span>
            <span style={{ width: "80%" }}><i className="fa-solid fa-globe"></i>{row.website}</span>

          </div>
        ),
      },
    )
  }

  const labels = { beforeSelect: " ", };

  const createAccount = () => {
    navigate(`/accounts/e`);
  };


  return (
    <>
      <Container className='mt-5'>
        <Row className='mx-5 text-center g-0'>
          <Col lg={12} xs={12} sm={12}>
            <div className='text-center p-2' style={{ height: '40px', backgroundColor: '#ffffff', borderRadius: '5px' }}>
              <span className='fw-semibold p-1' style={{ color: '#605C68', fontSize: 'large' }}>
                Account Records
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
                      <Col xs={12} lg={4} className="d-flex flex-col justify-content-end align-items-end">
                        <Filter />
                      </Col>
                      <Col xs={12} sm={6} lg={4} className="d-flex flex-col justify-content-start align-items-start">
                        <PaginationOptions labels={labels} />
                      </Col>
                      <Col xs={12} sm={6} lg={4} className="d-flex flex-col justify-content-end align-items-end">
                        {helper.checkPermission(constants.MODIFY_ALL) &&
                          <Button className="btn-sm" variant="outline-primary" onClick={() => createAccount(true)}>
                            Add New Account
                          </Button>
                        }
                      </Col>
                    </Row>
                    <Table striped className="data-table" responsive="sm">
                      <TableHeader />
                      <TableBody />
                    </Table>
                    <Pagination />
                  </DatatableWrapper>
                ) : (
                  <ShimmerTable row={10} col={8} />
                )}
              </Col>
            </Row>
          </Col>
        </Row>
      </Container>

      <ToastContainer />
    </>
  );

};
export default Account;
