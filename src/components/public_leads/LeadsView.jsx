import React, { useState } from "react";
import { Badge, Button, Col, Container, Row } from "react-bootstrap";
import Confirm from "../Confirm";
import { Link, useLocation } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import WhatsAppAPI from "../../api/WhatsAppAPI";
import moment from "moment";

const LeadView = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [lead, setLead] = useState(location.state ? location.state : {});
  const [modalShow, setModalShow] = useState(false);

  
  const deletePublicLead = async () => {
    const result = await WhatsAppAPI.deletePublicLead(lead.id);
    if (result.success) {
      navigate(`/web_leads`);
    }
  };

  const handleBack = () => {
    navigate("/web_leads");
  }

 

  return (

    <>
      <Container className='mt-5'>
        <Row className='mx-5 section-header'>
          <Col lg={12} sm={12} xs={12} >
            <Row className='view-form-header align-items-center'>
              <Col lg={8} sm={8} xs={8} className="text-capitalize">
                Lead
                <h5>
                  {lead.first_name ? lead.first_name + " " : <>&nbsp;</>}
                  {lead.last_name ? lead.last_name : <>&nbsp;</>}</h5>
              </Col>
              <Col lg={4} sm={4} xs={4} className="text-end"  >
                <Button className='mx-2 btn-sm' variant="outline-light" onClick={handleBack} >
                  Back
                </Button>
                <Button className="btn-sm mx-2" variant="danger" onClick={() => setModalShow(true)}>
                  Delete
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
                <label>Lead Name</label>
                <span className="text-capitalize">
                {lead.first_name ? lead.first_name + " " : <>&nbsp;</>}
                {lead.last_name ? lead.last_name : <>&nbsp;</>}
                </span>
              </Col>
              <Col lg={6} sm={6} xs={6} className="mb-2">
                <label>Phone</label>
                <span>{lead.mobile_no ? lead.mobile_no : <>&nbsp;</>}</span>
              </Col>
              <Col lg={6} sm={6} xs={6} className="mb-2">
                <label>Email</label>
                <span>{lead.email ? lead.email : <>&nbsp;</>}</span>
              </Col>
              <Col lg={6} sm={6} xs={6} className="mb-2">
                <label>Company</label>
                {
                    lead.convertedcompanyid && lead.status === 'Closed - Converted' ? (
                      <Link to={`/company/${lead.convertedcompanyid}`}>
                        <span>{lead.company ? lead.company : <>&nbsp;</>}</span>
                      </Link>
                    ) : (
                        <span>{lead.company ? lead.company : <>&nbsp;</>}</span>
                    )
                  }
              </Col>
              <Col lg={6} sm={6} xs={6} className="mb-2">
                <label>Status</label>
                <span>{lead.status ? lead.status : <>&nbsp;</>}</span>
              </Col>
           
              
              {lead.status === 'Closed - Not Converted' && (
                <Col lg={6} sm={6} xs={6} className="mb-2">
                  <label>Lost Reason</label>
                  <span>{lead.lostreason ? lead.lostreason : <>&nbsp;</>}</span>
                </Col>
              )}
              <Col lg={6} sm={6} xs={6} className="mb-2">
                <label>Description</label>
                <span>{lead.description ? lead.description : <>&nbsp;</>}</span>
              </Col>
              <Col lg={6} sm={6} xs={6} className="mb-2">
                <label>Address</label>
                <span>{lead.street ? lead.street : <>&nbsp;</>}  {lead.city ? lead.city : <>&nbsp;</>} {lead.state ? lead.state : <>&nbsp;</>} &nbsp;{lead.country ? lead.country : <>&nbsp;</>}&nbsp;{lead.zipcode}</span>
              </Col>
              <Col lg={6} sm={6} xs={6} className="mb-2">
                <label>Created Date</label>
                <span>{lead.createddate ? moment(lead.createddate).format("DD MMM, yyyy") : <>&nbsp;</>}</span>
              </Col>
            </Row>
          </Col>
        </Row>
      </Container>

    
      {modalShow && (
        <Confirm
          show={modalShow}
          onHide={() => setModalShow(false)}
          deletePublicLead={deletePublicLead}
          title="Confirm delete?"
          message="You are going to delete the record. Are you sure?"
          table="web_lead"
        />
      )}
    </>

  );
};
export default LeadView;