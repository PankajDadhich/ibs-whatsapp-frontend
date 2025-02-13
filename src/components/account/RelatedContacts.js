import React, { useState, useEffect, } from "react";
import { Button, Col, Row, Table } from "react-bootstrap";
import { Link } from "react-router-dom";
import { DatatableWrapper, Filter, Pagination, PaginationOptions, TableBody, TableHeader, } from "react-bs-datatable";
import WhatsAppAPI from "../../api/WhatsAppAPI";
import { useNavigate } from "react-router-dom";
import { ShimmerTable } from "react-shimmer-effects";
import Confirm from "../Confirm";
import helper from "../common/helper";
import * as constants from '../../constants/CONSTANT';

const RealetedContacts = ({ parent, refreshPatientTestsList }) => {
  const navigate = useNavigate();
  const [modalShow, setModalShow] = React.useState(false);
  const [reletedContact, setReletedContact] = React.useState("");
  const [body, setBody] = useState([]);

  useEffect(() => {
    realetedContactList();
  }, []);

  useEffect(() => {
    realetedContactList();
  }, [refreshPatientTestsList]);

  const realetedContactList = () => {
    async function init() {
      let parentLeadList = await WhatsAppAPI.findContactByAccountId(
        parent.id
      );
      if (parentLeadList && parentLeadList?.length > 0) {
        setBody(parentLeadList);
      } else {
        setBody([]);
      }
    }
    init();
  };
  const handleDelete = (row) => {
    setModalShow(true);
    setReletedContact(row);
  };
  const editLead = (row) => {
    setReletedContact(row.row);
    navigate(`/contacts/e`, { state: row.row });
  };


  const deleteContact = async () => {
    const result = await WhatsAppAPI.deleteContactRecord(reletedContact.id);
    if (result.success) {
      setReletedContact("");
      setModalShow(false);
      realetedContactList();
    }
  };

  const labels = { beforeSelect: " ", };
  const header = [
    {
      title: "Name",
      prop: "firstname",
      cell: (row) => (
        <Link to={`/contacts/view/${row.id}`} state={row} className="text-capitalize">
          {row.firstname || "No First Name"} {row.lastname || ""}
        </Link>
      ),
    },
    { title: "Phone", prop: "phone" },
    { title: "Email", prop: "email" },
    { title: "City", prop: "city" },
    { title: "State", prop: "state" },
    { title: "Country", prop: "country" }, // cell: (row) => (row.totalamount - row.discount) },

    {
      title: "Actions",
      prop: "id",
      cell: (row) => (
        <>
          <Button className="btn-sm mx-2" onClick={() => editLead({ row })}>
            <i className="fa-regular fa-pen-to-square"></i>
          </Button>
          {helper.checkPermission(constants.MODIFY_ALL) &&
            <Button
              className="btn-sm mx-2"
              variant="danger"
              onClick={() => handleDelete(row)}
            >
              <i className="fa-regular fa-trash-can"></i>
            </Button>
          }
        </>
      ),
    },
  ];

  return (
    <>
      <Row className="g-0">
        <Col lg={12} sm={12} xs={12} >
          {body ? (
            <DatatableWrapper
              body={body}
              headers={header}
              paginationOptionsProps={{ initialState: { rowsPerPage: 10, options: [5, 10, 15, 20], } }}
            >
              {/* <Row className="mb-2">
                <Col lg={4} sm={6} xs={6} className="d-flex flex-col justify-content-end align-items-end" >
                  <Filter />
                </Col>
                <Col lg={4} sm={3} xs={3} className="d-flex flex-col justify-content-start align-items-start" >
                  <PaginationOptions labels={labels} />
                </Col>
              </Row> */}

              <Table striped className="related-list-table" responsive="sm">
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

      {modalShow && (
        <Confirm
          show={modalShow}
          onHide={() => setModalShow(false)}
          deleteContact={deleteContact}
          title="Confirm Delete"
          message={`You are going to delete the record. Are you sure?`}
          table="contact"
        />
      )}
    </>
  );
};

export default RealetedContacts;
