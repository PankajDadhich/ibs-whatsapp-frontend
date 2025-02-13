import React, { useState, useEffect } from "react";
import { Badge, Button, Col, Container, Row } from "react-bootstrap";
import Confirm from "../Confirm";
import { Link, useLocation } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import WhatsAppAPI from "../../api/WhatsAppAPI";
import moment from "moment";
import WhatsAppChat from "../whatsapp_messenger/WhatsAppChat";

const LeadView = ({ socket, selectedWhatsAppSetting }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [lead, setLead] = useState(location.state ? location.state : {});
  const [modalShow, setModalShow] = useState(false);

  useEffect(() => {
    fetchLead();
  }, [selectedWhatsAppSetting]);

  const fetchLead = () => {
    if (
      !lead.id &&
      location.hasOwnProperty("pathname") &&
      location.pathname.split("/").length >= 3
    ) {
      lead.id = location.pathname.split("/")[2];
    }

    async function initStudent() {
      let result = await WhatsAppAPI.fetchLeadById(lead.id);
      if (result) {
        setLead(result);
      } else {
        setLead({});
      }
    }
    initStudent();
  };
  const deleteLead = async () => {
    const result = await WhatsAppAPI.deleteLead(lead.id);
    if (result.success) {
      navigate(`/leads`);
    }
  };

  const handleBack = () => {
    navigate("/leads");
  };

  return (
    <>
      <Container className="mt-5">
        <Row className="mx-5 section-header">
          <Col lg={12} sm={12} xs={12}>
            <Row className="view-form-header align-items-center">
              <Col lg={8} sm={8} xs={8} className="text-capitalize">
                Lead
                <h5>
                  {lead.salutation ? lead.salutation + " " : ""}
                  {lead.firstname ? lead.firstname + " " : <>&nbsp;</>}
                  {lead.lastname ? lead.lastname : <>&nbsp;</>}
                </h5>
              </Col>
              <Col lg={4} sm={4} xs={4} className="text-end">
                <Button
                  className="mx-2 btn-sm"
                  variant="outline-light"
                  onClick={handleBack}
                >
                  Back
                </Button>
                <Button
                  className="btn-sm mx-2"
                  variant="danger"
                  onClick={() => setModalShow(true)}
                >
                  Delete
                </Button>
              </Col>
            </Row>
          </Col>
        </Row>
      </Container>
      <Container className="mt-1">
        <Row className="mx-5 view-form">
          <Col lg={12} sm={12} xs={12}>
            <Row className="py-2 ibs-edit-form">
              <Col lg={6} sm={6} xs={6} className="mb-2">
                <label>Lead Name</label>
                <span className="text-capitalize">
                  {lead.salutation ? lead.salutation + " " : ""}
                  {lead.firstname ? lead.firstname + " " : <>&nbsp;</>}
                  {lead.lastname ? lead.lastname : <>&nbsp;</>}
                </span>
              </Col>
              {/* <Col lg={6} sm={6} xs={6} className="mb-2">
                <label>Phone</label>
                <span>{lead.phone ? lead.phone : <>&nbsp;</>}</span>
              </Col> */}
              <Col lg={6} sm={6} xs={6} className="mb-2">
                <label>Phone</label>
                <span>
                  {" "}
                  {lead.whatsapp_number ? lead?.whatsapp_number : <>&nbsp;</>}
                </span>
              </Col>
              <Col lg={6} sm={6} xs={6} className="mb-2">
                <label>Email</label>
                <span>{lead.email ? lead.email : <>&nbsp;</>}</span>
              </Col>
              <Col lg={6} sm={6} xs={6} className="mb-2">
                <label>Company</label>
                <span>{lead.company ? lead.company : <>&nbsp;</>}</span>
              </Col>
              <Col lg={6} sm={6} xs={6} className="mb-2">
                <label>Lead Source</label>
                <span>{lead.leadsource ? lead.leadsource : <>&nbsp;</>}</span>
              </Col>

              <Col lg={6} sm={6} xs={6} className="mb-2">
                <label>Expected Amount</label>
                <span> {lead.amount ? "₹" + lead.amount : <>&nbsp;</>}</span>
              </Col>
              <Col lg={6} sm={6} xs={6} className="mb-2">
                <label>Payment Model</label>
                <span>
                  {lead.paymentmodel ? lead.paymentmodel : <>&nbsp;</>}
                </span>
              </Col>
              <Col lg={6} sm={6} xs={6} className="mb-2">
                <label>Payment Terms</label>
                <span>
                  {lead.paymentterms ? lead.paymentterms : <>&nbsp;</>}
                </span>
              </Col>
              <Col lg={6} sm={6} xs={6} className="mb-2">
                <label>Status</label>
                <span>{lead.leadstatus ? lead.leadstatus : <>&nbsp;</>}</span>
              </Col>
              {lead.iswon === false && (
                <Col lg={6} sm={6} xs={6} className="mb-2">
                  <label>Lost Reason</label>
                  <span>{lead.lostreason ? lead.lostreason : <>&nbsp;</>}</span>
                </Col>
              )}
              <Col lg={6} sm={6} xs={6} className="mb-2">
                <label>Assigned User</label>
                <span>
                  {lead.ownername ? (
                    <Badge
                      bg="warning"
                      className="mx-2 px-2"
                      style={{ display: "inline", color: "#000" }}
                    >
                      {lead.ownername}
                    </Badge>
                  ) : (
                    <>&nbsp;</>
                  )}
                </span>
              </Col>
              <Col lg={6} sm={6} xs={6} className="mb-2">
                <label>Description</label>
                <span>{lead.description ? lead.description : <>&nbsp;</>}</span>
              </Col>
              <Col lg={6} sm={6} xs={6} className="mb-2">
                <label>Address</label>
                <span>
                  {lead.street ? lead.street : <>&nbsp;</>}{" "}
                  {lead.city ? lead.city : <>&nbsp;</>}{" "}
                  {lead.state ? lead.state : <>&nbsp;</>} &nbsp;
                  {lead.country ? lead.country : <>&nbsp;</>}&nbsp;
                  {lead.zipcode}
                </span>
              </Col>
              <Col lg={6} sm={6} xs={6} className="mb-2">
                <label>Created Date</label>
                <span>
                  {lead.createddate ? (
                    moment(lead.createddate).format("DD MMM, yyyy")
                  ) : (
                    <>&nbsp;</>
                  )}
                </span>
              </Col>
            </Row>
          </Col>
        </Row>
      </Container>

      {lead && lead.id && lead.whatsapp_number && (
        <Container className="mb-5 mt-2">
          <Row className="g-0 mx-5">
            <Col lg={12} sm={12} xs={12} className="mb-4">
              <WhatsAppChat
                userDetail={lead}
                socket={socket}
                selectedWhatsAppSetting={selectedWhatsAppSetting}
              />
            </Col>
          </Row>
        </Container>
      )}
      {modalShow && (
        <Confirm
          show={modalShow}
          onHide={() => setModalShow(false)}
          deleteLead={deleteLead}
          title="Confirm delete?"
          message="You are going to delete the record. Are you sure?"
          table="lead"
        />
      )}
    </>
  );
};
export default LeadView;
