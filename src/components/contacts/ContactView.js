import React, { useEffect, useState } from "react";
import { Button, Col, Container, Row } from "react-bootstrap";
import { useLocation } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import WhatsAppChat from '../whatsapp_messenger/WhatsAppChat';
import helper from "../common/helper";
import * as constants from '../../constants/CONSTANT';

const ContactView = ({ socket }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [contactRecord, setContactRecord] = useState(location.state ? location.state : {});
  const [receivedMessage, setReceivedMessage] = useState();



  useEffect(() => {
    socket?.on("receivedwhatsappmessage", (data) => {
      setReceivedMessage(data);
    })
  }, [socket]);


  const handleBack = () => {
    navigate('/contacts');
  }


  return (
    <>
      <Container className='mt-5'>
        <Row className='mx-5 section-header'>
          <Col lg={12} sm={12} xs={12}>
            <Row className='view-form-header align-items-center'>
              <Col lg={8} sm={8} xs={8} className=''>
                Contact
                <h5 className="text-capitalize"> {contactRecord?.contactname ? contactRecord.contactname + " " : <>&nbsp;</>}</h5>
              </Col>
              <Col lg={4} sm={4} xs={4} className="text-end"  >
                <Button className='mx-2 btn-sm' variant="outline-light" onClick={handleBack} >
                  Back
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
                <label>Account Name</label>
                <span className="text-capitalize">
                  {contactRecord?.accountname ? contactRecord?.accountname : <>&nbsp;</>}
                </span>
              </Col>

              <Col lg={6} sm={6} xs={6} className="mb-2">
                <label>Name</label>
                <span className="text-capitalize">
                  {contactRecord.salutation ? contactRecord.salutation + " " : <>&nbsp;</>}
                  {contactRecord.firstname ? contactRecord.firstname + " " : <>&nbsp;</>}
                  {contactRecord.lastname ? contactRecord.lastname : <>&nbsp;</>}
                </span>
              </Col>

              <Col lg={6} sm={6} xs={6} className="mb-2">
                <label>Title</label>
                <span className="text-capitalize">
                  {contactRecord?.title ? contactRecord?.title : <>&nbsp;</>}
                </span>
              </Col>

              <Col lg={6} sm={6} xs={6} className="mb-2">
                <label>Email</label>
                <span>{contactRecord.email ? contactRecord.email : <>&nbsp;</>}</span>
              </Col>

              <Col lg={6} sm={6} xs={6} className="mb-2">
                <label>Phone</label>
                <span>{contactRecord.phone ? contactRecord.phone : <>&nbsp;</>}</span>
              </Col>

              <Col lg={6} sm={6} xs={6} className="mb-2">
                <label>Whatsapp Number</label>
                <span>{contactRecord.whatsapp_number ? contactRecord.whatsapp_number : <>&nbsp;</>}</span>
              </Col>

              <Col lg={6} sm={6} xs={6} className="mb-2">
                <label>City</label>
                <span>{contactRecord.city ? contactRecord.city : <>&nbsp;</>}</span>
              </Col>

              <Col lg={6} sm={6} xs={6} className="mb-2">
                <label>State</label>
                <span>{contactRecord.state ? contactRecord.state : <>&nbsp;</>}</span>
              </Col>

              <Col lg={6} sm={6} xs={6} className="mb-2">
                <label>Country</label>
                <span>{contactRecord.country ? contactRecord.country : <>&nbsp;</>}</span>
              </Col>

              <Col lg={6} sm={6} xs={6} className="mb-2">
                <label>Street</label>
                <span>{contactRecord.street ? contactRecord.street : <>&nbsp;</>}</span>
              </Col>

              <Col lg={6} sm={6} xs={6} className="mb-4">
                <label>Pincode</label>
                <span>{contactRecord.pincode ? contactRecord.pincode : <>&nbsp;</>}</span>
              </Col>

            </Row>
          </Col>
        </Row >
      </Container >


      {helper.checkPermission(constants.MODIFY_ALL) &&
        <Container className='mb-5'>
          <Row className='g-0 mx-5'>
            <Col lg={12} sm={12} xs={12} className="mb-3">
              <WhatsAppChat
                userDetail={contactRecord}
                socket={socket}
              />
            </Col>
          </Row>
        </Container>
      }

    </>
  );
};
export default ContactView;
