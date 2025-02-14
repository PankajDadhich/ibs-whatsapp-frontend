import React, { useEffect, useState } from "react";
import { Button, Col, Row, Table, Container } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { ShimmerTable } from "react-shimmer-effects";
import WhatsAppAPI from "../../api/WhatsAppAPI";
import { DatatableWrapper, Filter, Pagination, PaginationOptions, TableBody, TableHeader, } from "react-bs-datatable";
import { Link } from "react-router-dom";
import jwt_decode from "jwt-decode";

import { NameInitialsAvatar } from 'react-name-initials-avatar'; // npm install react-name-initials-avatar --force

const UserList = () => {
  const navigate = useNavigate();
  const [body, setBody] = useState([]);
  const [userInfo, setUserInfo] = useState(jwt_decode(sessionStorage.getItem('token')));
  const [lead, setLead] = useState();
  // const profileImage = '/user_images/users';
  const profileImage = `/public/${userInfo.tenantcode}/users`;

  const [bgColors, setBgColors] = useState(['#d3761f', '#00ad5b', '#debf31', '#239dd1', '#b67eb1', '#d3761f', '#de242f']);
  const [brokenImages, setBrokenImages] = useState([]);
  let colIndex = 0;

  useEffect(() => {

    async function init() {
      const users = await WhatsAppAPI.fetchUsers();
      let resultWithoutSuperAdmin = [];
  //    console.log("userInfo users",users)
      if (userInfo.userrole === 'ADMIN' || userInfo.userrole === 'USER') {
        resultWithoutSuperAdmin = users.filter((value, index, array) => value.userrole !== 'SYS_ADMIN');
    //    console.log("resultWithoutSuperAdmin")
        setBody(resultWithoutSuperAdmin);
      } else {
        setBody(users);
      }
      if (users) {
        setLead(users);
      } else {
        setBody([]);
        setLead([]);
      }
    }
    init();
  }, []);


  const fillBgBolor = () => {
    colIndex += 1;
    if (colIndex >= bgColors.length)
      colIndex = 0;
    return bgColors[colIndex];
  }

  const editUser = (row) => {
    navigate(`/users/${row.row.id}/e`, { state: row.row });
  }
  const header = [

    {
      title: "Name",
      prop: "username",
      isFilterable: true,
      cell: (row) => (
        <Link to={`/users/${row.id}`} state={row} className="d-flex align-items-center">
          {brokenImages.includes(`img-${row.id}`) ? (
            <NameInitialsAvatar
              size="30px"
              textSize="12px"
              bgColor={fillBgBolor()}
              borderWidth="0px"
              textColor="#fff"
              name={row.username}
            />
          ) : (
            <img alt=""
              style={{ height: "30px", width: "30px", objectFit: "cover" }}
              src={profileImage + '/' + row.id}
              className="rounded-circle"
              onError={() => setBrokenImages((prev) => [...prev, `img-${row.id}`])}
              id={`img-${row.id}`}
            />
          )}
          <span className="mx-2">{row.username}</span>
        </Link>
      ),
    },
    ...(userInfo.userrole === "SYS_ADMIN"
      ? [
          {
            title: "Company Name",
            prop: "companyname",
          },
        ]
      : []),
    { title: "Role", prop: "userrole", isFilterable: true },
    // { title: "Phone", prop: "phone", isFilterable: true },
    { title: "Email", prop: "email", isFilterable: true },
    { title: "Phone", prop: "whatsapp_number", isFilterable: true },
    {
      title: "Active", prop: "isactive", isFilterable: true,
      cell: (row) => (

        row.isactive === true ? <i className="fa-regular fa-square-check" style={{ fontSize: "1.3rem", marginLeft: "19px" }}></i> : <i className="fa-regular fa-square" style={{ fontSize: "1.3rem", marginLeft: "19px" }}></i>

      )
    },
    ...(userInfo.userrole === "ADMIN"
      ? [
          {
            title: "Actions",
            prop: "id",
            cell: (row) => (
              <Button className="btn-sm mx-2" onClick={() => editUser({ row })}>
                <i className="fa-regular fa-pen-to-square"></i>
              </Button>
            ),
          },
        ]
      : []),

  ];

  const labels = {
    beforeSelect: " ",
  };

  const createUser = () => {
    navigate(`/users/e`);
  };

  return (
    <>
      <Container className='mt-5'>
        <Row className='mx-5 text-center g-0'>
          <Col lg={12} xs={12} sm={12}>
            <div className=' text-center p-2' style={{ height: '40px', backgroundColor: '#ffffff', borderRadius: '5px' }}>
              <span className='fw-semibold p-1' style={{ color: '#605C68', fontSize: 'large' }}>
                User Records
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
                        <Button className="btn-sm" variant="outline-primary" onClick={() => createUser(true)}>
                          Add New User
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
                  <ShimmerTable row={10} col={8} />
                )}
              </Col>
            </Row>
          </Col>
        </Row>
      </Container>
    </>
  );
};
export default UserList;
