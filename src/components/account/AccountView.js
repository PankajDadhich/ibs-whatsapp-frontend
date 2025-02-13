/**
 * @author      Abdul Pathan
 * @date        Aug, 2024
 * @copyright   www.ibirdsservices.com
 */
import React, { useState, useEffect } from "react";
import { Button, Col, Container, Row } from "react-bootstrap";
import { useLocation } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import WhatsAppAPI from "../../api/WhatsAppAPI";
import RelatedContacts from "./RelatedContacts";
import Confirm from "../Confirm";
import helper from "../common/helper";
import * as constants from "../../constants/CONSTANT";

const AccountView = (props) => {
  const location = useLocation();
  const navigate = useNavigate();
  //const account = location.state;
  const [account, setAccount] = useState(location.state ? location.state : {});
  const [modalShow, setModalShow] = useState(false);
  const [activeTab, setActiveTab] = useState("contacts");

  useEffect(() => {
    fetchAccount();
    setActiveTab("contacts");
  }, []);

  const fetchAccount = () => {
    if (
      !account.id &&
      location.hasOwnProperty("pathname") &&
      location?.pathname?.split("/").length >= 3
    ) {
      account.id = location?.pathname?.split("/")[2];
    }

    async function initAccount() {
      let result = await WhatsAppAPI.fetchAccountById(account.id);
      if (result) {
        setAccount(result);
      } else {
        setAccount({});
      }
    }
    initAccount();
  };

  const editAccount = () => {
    navigate(`/accounts/e`, { state: account });
    // navigate(`/contacts/e/${contact.id}`, { state: contact });
  };

  const deleteAccount = async () => {
    const result = await WhatsAppAPI.deleteAccount(account.id);
    if (result.success) navigate(`/accounts`);
  };

  const handleBack = () => {
    navigate("/accounts");
  };

  return (
    <>
      <Container className="mt-5">
        <Row className="mx-5 section-header">
          <Col lg={12} sm={12} xs={12}>
            <Row className="view-form-header align-items-center">
              <Col lg={8} sm={8} xs={8} className="">
                Account
                <h5> {account?.name ? account.name + " " : <>&nbsp;</>}</h5>
              </Col>
              <Col lg={4} sm={4} xs={4} className="text-end">
                <Button
                  className="btn-sm mx-2"
                  variant="light"
                  onClick={handleBack}
                >
                  Back
                </Button>

                <Button
                  className="btn-sm mx-2"
                  variant="light"
                  onClick={editAccount}
                >
                  <i className="fa-regular fa-pen-to-square"></i>
                </Button>
                {helper.checkPermission(constants.MODIFY_ALL) && (
                  <Button
                    className="btn-sm"
                    variant="danger"
                    onClick={() => setModalShow(true)}
                  >
                    <i className="fa-regular fa-trash-can" title="Delete"></i>
                  </Button>
                )}
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
                <label>Account Name</label>
                <span className="text-capitalize">
                  {account.name || <>&nbsp;</>}
                </span>
              </Col>

              <Col lg={6} sm={6} xs={6} className="mb-2">
                <label>Phone</label>
                <span>{account.phone || <>&nbsp;</>}</span>
              </Col>

              <Col lg={6} sm={6} xs={6} className="mb-2">
                <label>Email</label>
                <span>{account.email || <>&nbsp;</>}</span>
              </Col>

              <Col lg={6} sm={6} xs={6} className="mb-2">
                <label>Website</label>
                <span>{account.website || <>&nbsp;</>}</span>
              </Col>

              <Col lg={6} sm={6} xs={6} className="mb-2">
                <label>Street</label>
                <span>{account.street || <>&nbsp;</>}</span>
              </Col>

              <Col lg={6} sm={6} xs={6} className="mb-2">
                <label>City</label>
                <span>{account.city || <>&nbsp;</>}</span>
              </Col>

              <Col lg={6} sm={6} xs={6} className="mb-2">
                <label>State</label>
                <span>{account.state || <>&nbsp;</>}</span>
              </Col>

              <Col lg={6} sm={6} xs={6} className="mb-2">
                <label>Pincode</label>
                <span>{account.pincode || <>&nbsp;</>}</span>
              </Col>

              <Col lg={6} sm={6} xs={6} className="mb-4">
                <label>Country</label>
                <span>{account.country || <>&nbsp;</>}</span>
              </Col>
            </Row>
          </Col>
        </Row>
      </Container>

      <Container className="mt-2">
        <Row className="g-0 mx-5">
          <Col lg={12} className="section-header">
            <span className="mx-2">Contact Details</span>
          </Col>
        </Row>
      </Container>

      <Container className="mb-5 mt-2">
        <Row className="g-0 mx-5">
          <Col lg={12} sm={12} xs={12} className="mb-3">
            <RelatedContacts parent={account} />
          </Col>
        </Row>
      </Container>

      {modalShow && (
        <Confirm
          show={modalShow}
          onHide={() => setModalShow(false)}
          deleteAccount={deleteAccount}
          title="Confirm Delete"
          message={`You are going to delete the record. Are you sure?`}
          table="account"
        />
      )}
    </>
  );
};
export default AccountView;
