/**
 * @author      Abdul Pathan
 * @date        Aug, 2024
 * @copyright   www.ibirdsservices.com
 */

import React, { useEffect, useState } from "react";
import { Col, Form, Modal, Row } from "react-bootstrap";
import WhatsAppAPI from "../../api/WhatsAppAPI";
import { toast } from "react-toastify"; //npm i react-toastify --force
import "react-toastify/dist/ReactToastify.css";
import TemplatePreview from "../whatsapp_template/TemplatePreview";
import jwt_decode from "jwt-decode";
// import moment from 'moment-timezone';

const MessageTemplateModal = ({
  show,
  onHide,
  contactData,
  refreshData,
  filterData,
  selectedWhatsAppSetting,
}) => {
  const [userInfo, setUserInfo] = useState(
    jwt_decode(localStorage.getItem("token"))
  );
  const [category, setCategory] = useState("");
  const [filteredTemplates, setFilteredTemplates] = useState([]);
  const [allTemplateData, setAllTemplateData] = useState([]);
  const [selectedTemplateName, setSelectedTemplateName] = useState("");
  const [textMessage, setTextMessage] = useState("");
  const [isSpinner, setIsSpinner] = useState(false);
  const [body, setBody] = useState();
  const [groupId, setGroupId] = useState("");
  const categories = ["AUTHENTICATION", "UTILITY", "MARKETING"];
  const [parameters, setParameters] = useState({});
  useEffect(() => {
    fetchAllTemplate(selectedWhatsAppSetting);
    fetchAllGroupRecord();
  }, [selectedWhatsAppSetting]);

  const fetchAllGroupRecord = async () => {
    if (contactData.length > 0) {
      if (!contactData[0].whatsapp_number) {
        const recordId = contactData[0].id;
        setGroupId(recordId);
        const result = await WhatsAppAPI.fetchGroupsById(recordId);
        if (result.success && result.records?.members.length > 0) {
          setBody(result.records?.members);
        } else {
          setBody([]);
        }
      } else {
        setBody(contactData);
      }
    }
  };

  const fetchAllTemplate = async (selectedWhatsAppSetting) => {
    const result = await WhatsAppAPI.getApprovedTemplates(
      selectedWhatsAppSetting
    );
    if (result.error) {
      setAllTemplateData([]);
      setIsSpinner(true);
    } else {
      if (result?.data && result) {
        const transformedData = result?.data.map((row) => {
          const header =
            row.components.find((component) => component.type === "HEADER") ||
            {};
          const body =
            row.components.find((component) => component.type === "BODY") || {};
          const footer =
            row.components.find((component) => component.type === "FOOTER") ||
            {};
          const buttons =
            row.components.find((component) => component.type === "BUTTONS")
              ?.buttons || [];

          return {
            id: row.id,
            name: row.name,
            templatename: row.name.replace(/_/g, " "),
            language: row.language,
            status: row.status,
            category: row.category,
            header: header.format || "",

            // Handling header types
            header_text: header.format === "TEXT" ? header.text : "",
            header_image_url:
              header.format === "IMAGE"
                ? header.example?.header_handle?.[0] || ""
                : "",
            header_document_url:
              header.format === "DOCUMENT"
                ? header.example?.header_handle?.[0] || ""
                : "",
            header_video_url:
              header.format === "VIDEO"
                ? header.example?.header_handle?.[0] || ""
                : "",

            // Body and example text
            message_body: body.text || "",
            example_body_text: body.example?.body_text || [], // Extracting example body text
            footer: footer.text || "",

            add_security_recommendation:
              body.add_security_recommendation || false,
            code_expiration_minutes: footer.code_expiration_minutes || null,

            buttons: buttons
              .map((element) => {
                if (element.type === "OTP") {
                  return {
                    type: element.type,
                    otp_type: element.otp_type,
                    supported_apps:
                      element.supported_apps?.map((app) => ({
                        package_name: app.package_name,
                        signature_hash: app.signature_hash,
                      })) || [],
                  };
                } else {
                  return {
                    type: element.type,
                    text: element.text,
                    ...(element.type === "PHONE_NUMBER" && {
                      phone_number: element.phone_number,
                    }),
                    ...(element.type === "URL" && { url: element.url }),
                  };
                }
              })
              .filter((item) => item.text && item.type),
          };
        });

        setAllTemplateData(transformedData);
        setIsSpinner(true);
      }
      setIsSpinner(true);
    }
  };
  const handleCategoryChange = (e) => {
    const selectedCategory = e.target.value;
    setCategory(selectedCategory);
    // Filter templates based on selected category
    const filtered = allTemplateData.filter(
      (template) => template.category === selectedCategory
    );
    setFilteredTemplates(filtered);
  };

  function generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  const handleChange = async (event) => {
    const selectedName = event.target.value;
    const template = allTemplateData.find((t) => t.name === selectedName);

    if (template) {
      const {
        id,
        name,
        language,
        category,
        header,
        header_text,
        header_image_url,
        header_document_url,
        header_video_url,
        message_body,
        example_body_text,
        footer,
        buttons,
      } = template;
      // const exampleValue = example_body_text.length > 0 && example_body_text[0].length > 0 ? generateOTP() : '';
      const examplebodytext =
        category === "AUTHENTICATION" ? generateOTP() : "";

      const header_body =
        header_text ||
        header_image_url ||
        header_document_url ||
        header_video_url;
      const formattedTemplate = {
        id,
        name,
        language,
        category,
        header,
        header_body,
        message_body,
        example_body_text: examplebodytext,
        footer,
        buttons,
        business_number: selectedWhatsAppSetting,
      };

      setSelectedTemplateName(formattedTemplate);
    } else {
      setSelectedTemplateName();
    }
  };

  async function fetchFile(url) {
    const response = await fetch(url);
    if (!response.ok) throw new Error("Network response was not ok");
    return await response.blob(); // Return the Blob
  }

  const handleParametersChange = (newParams) => {
    setParameters(newParams);
    console.log("newParams", newParams);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSpinner(false);
    let successCount = 0;
    let documentId = null;
    let newMessage = null;
    let fileResult = null;
    if (selectedTemplateName.category === "AUTHENTICATION") {
      selectedTemplateName.example_body_text = parameters["1"];
    } else {
      const { file, ...filteredParams } = parameters;
      selectedTemplateName.example_body_text = filteredParams;
    }

    if (parameters.sendToAdmin && userInfo?.phone) {
      const formattedPhone = userInfo.phone.match(/^\d{10}$/)
        ? `91${userInfo.phone}`
        : userInfo.phone;

      body.push({
        id: userInfo.id,
        contactname: userInfo.username,
        whatsapp_number: formattedPhone,
      });
    }

    try {
      if (parameters.file) {
        const formData = new FormData();
        formData.append("messaging_product", "whatsapp");
        formData.append("file", parameters.file);
        formData.append("description", "Attachment");
        fileResult = await WhatsAppAPI.createFile(body[0].id, formData);

        console.log("fileResult", fileResult);
        const uploadResponse = await WhatsAppAPI.uploadDocumentWithApi(
          formData,
          selectedWhatsAppSetting
        );

        if (uploadResponse?.id) {
          documentId = uploadResponse.id; // Bind the received ID
        }
      } else if (
        selectedTemplateName.header !== "TEXT" &&
        selectedTemplateName.header &&
        selectedTemplateName.header_body
      ) {
        const fileUrl = selectedTemplateName.header_body;
        let fileBlob = "";
        if (selectedTemplateName.header === "DOCUMENT") {
          const obj = { url: fileUrl };
          fileBlob = await WhatsAppAPI.pdfData(obj, selectedWhatsAppSetting);
          documentId = fileBlob;
        } else {
          fileBlob = await fetchFile(fileUrl);
          const fileName =
            fileUrl.split("/").pop().split("?")[0] ||
            (selectedTemplateName.header === "DOCUMENT"
              ? "application.pdf"
              : "file");
          const file = new File([fileBlob], fileName, { type: fileBlob.type });

          const formData = new FormData();
          formData.append("messaging_product", "whatsapp");
          formData.append("file", file);
          formData.append(
            "description",
            `Header ${selectedTemplateName.header} Template`
          );

          const documentResult = await WhatsAppAPI.uploadDocumentWithApi(
            formData,
            selectedWhatsAppSetting
          );
          documentId = documentResult.id;
        }
      }

      for (const contact of body) {
        const contactId = contact.id || groupId;
        const contactName =
          contact.contactname ||
          `${contact.member_firstname} ${contact.member_lastname}`;

        const textMsgBody = textMessage || "Default text message";
        const isTextMessage = Boolean(textMessage);
        const singleText = {
          messaging_product: "whatsapp",
          recipient_type: "individual",
          to: contact.whatsapp_number,
          type: isTextMessage ? "text" : "template",
          text: isTextMessage
            ? {
                preview_url: false,
                body: textMsgBody,
              }
            : undefined,
          template: isTextMessage
            ? undefined
            : {
                name: selectedTemplateName.name,
                language: {
                  code: selectedTemplateName.language,
                },
                components: [
                  {
                    type: "header",
                    parameters: [],
                  },
                  {
                    type: "body",
                    parameters:
                      selectedTemplateName.category !== "AUTHENTICATION"
                        ? Object.keys(parameters)
                            .filter((key) =>
                              selectedTemplateName.message_body.includes(
                                `{{${key}}}`
                              )
                            )
                            .map((key) => ({
                              type: "text",
                              text: parameters[key],
                            }))
                        : [],
                  },
                ],
              },
        };

        if (!isTextMessage && documentId) {
          const componentType = selectedTemplateName.header.toLowerCase();
          singleText.template.components[0].parameters.push({
            type: componentType,
            [componentType]: { id: documentId },
          });
        }
        if (
          selectedTemplateName.example_body_text &&
          selectedTemplateName.category === "AUTHENTICATION"
        ) {
          // if (selectedTemplateName.example_body_text) {
          singleText.template.components[1].parameters.push({
            type: "text",
            text: selectedTemplateName.example_body_text,
          });
        }

        if (
          selectedTemplateName.example_body_text &&
          selectedTemplateName.category === "AUTHENTICATION"
        ) {
          singleText.template.components.push({
            type: "BUTTON",
            sub_type: "url",
            index: 0,
            parameters: [
              {
                type: "text",
                text: selectedTemplateName.example_body_text, //"J$FpnYnP" // Button text
              },
            ],
          });
        }

        const result = isTextMessage
          ? await WhatsAppAPI.sendSingleWhatsAppTextMessage(
              singleText,
              selectedWhatsAppSetting
            )
          : await WhatsAppAPI.sendWhatsAppTemplateMessage(
              singleText,
              selectedWhatsAppSetting
            );
        if (result.error) {
          const msgError = result.error.error_data;
          toast.error(
            `Error sending to ${contactName}: ${
              msgError.details || result.error
            }`
          );
          setIsSpinner(true);
        } else {
          successCount++;
          const messageId = result.messages[0].id;

          newMessage = {
            parent_id: contactId || null,
            name: contactName || "",
            message_template_id: isTextMessage
              ? null
              : (
                  await WhatsAppAPI.createMessageTemplateData(
                    selectedTemplateName
                  )
                ).id || null,
            whatsapp_number: contact.whatsapp_number,
            message: isTextMessage ? textMsgBody : "",
            status: "Outgoing",
            recordtypename: filterData.recordType || "",
            file_id: fileResult?.records[0]?.id || null,
            is_read: true,
            business_number: selectedWhatsAppSetting,
            message_id: messageId,
          };
          if (filterData.recordType !== "groups") {
            const response = await WhatsAppAPI.insertMsgHistoryRecords(
              newMessage
            );
          }
        }
      }

      if (filterData.recordType === "groups") {
        const response = await WhatsAppAPI.insertMsgHistoryRecords(newMessage);
      }

      if (successCount > 0) {
        refreshData();
        toast.success(`${successCount} messages sent successfully!`);
      }
    } catch (error) {
      console.error("Error in sending messages:", error);
      toast.error("Failed to send messages.");
      setIsSpinner(true);
    } finally {
      refreshData();
    }
  };

  const { file, sendToAdmin, ...filteredParams } = parameters;
  const filteredKeys = Object.keys(filteredParams);
  const messageMatches =
    selectedTemplateName?.message_body
      ?.match(/\{\{(\d+)\}\}/g)
      ?.map((match) => match.replace(/\{\{|\}\}/g, "")) || [];
  const hasExactMatch =
    JSON.stringify(filteredKeys) === JSON.stringify(messageMatches);
  const allValuesFilled = filteredKeys.every(
    (key) =>
      filteredParams[key] !== undefined &&
      filteredParams[key] !== null &&
      filteredParams[key] !== ""
  );
  const finalCheck = hasExactMatch && allValuesFilled;
  const isFormValid =
    Boolean(selectedTemplateName || textMessage) && finalCheck;
  // const isFormValid = Boolean(selectedTemplateName || textMessage) && Boolean(selectedWhatsAppSetting);

  return (
    <>
      <Modal show={show} animation={false} size="lg" centered>
        <Modal.Header closeButton onClick={onHide}>
          <Modal.Title id="contained-modal-title-vcenter">
            Send WhatsApp Message
          </Modal.Title>
        </Modal.Header>

        {isSpinner ? (
          <>
            {body?.length > 0 ? (
              <>
                <Modal.Body>
                  <Form noValidate>
                    <Row className="p-2 mb-3">
                      <Col lg={12} sm={12} xs={12}>
                        {/* Category Dropdown */}
                        <Form.Group className="mb-4">
                          <Form.Label
                            className="form-view-label"
                            htmlFor="formBasicCategory"
                          >
                            Select Template Category
                          </Form.Label>
                          <Form.Select
                            style={{ height: "36px" }}
                            aria-label="Select Template Category"
                            name="category"
                            onChange={handleCategoryChange}
                            value={category}
                          >
                            <option value="">Select Category</option>
                            {categories.map((cat, index) => (
                              <option key={index} value={cat}>
                                {cat}
                              </option>
                            ))}
                          </Form.Select>
                        </Form.Group>

                        {/* Template Name Dropdown */}
                        <Form.Group className="mb-4">
                          <Form.Label
                            className="form-view-label"
                            htmlFor="formBasicFirstName"
                          >
                            Template Name
                          </Form.Label>
                          <Form.Select
                            style={{ height: "36px" }}
                            aria-label="select name"
                            name="templateName"
                            onChange={(e) => {
                              handleChange(e);
                              if (textMessage) {
                                setTextMessage("");
                              }
                            }}
                            placeholder="Select Template Name"
                          >
                            <option value="">Select Template Name</option>
                            {(category
                              ? filteredTemplates
                              : allTemplateData
                            )?.map((template) => (
                              <option key={template.id} value={template.name}>
                                {template.templatename}
                              </option>
                            ))}
                          </Form.Select>
                        </Form.Group>
                      </Col>
                      <Col lg={12} sm={12} xs={12}>
                        <TemplatePreview
                          template={selectedTemplateName}
                          onParametersChange={handleParametersChange}
                        />
                      </Col>

                      {!selectedTemplateName && (
                        <Col lg={12} sm={12} xs={12} className="mt-2">
                          <Form.Group controlId="formTextMessage">
                            <Form.Label>Text Message</Form.Label>
                            <Form.Control
                              as="textarea"
                              rows={3}
                              value={textMessage}
                              onChange={(e) => {
                                setTextMessage(e.target.value);
                              }}
                            />
                          </Form.Group>
                        </Col>
                      )}
                    </Row>
                  </Form>
                </Modal.Body>

                <Modal.Footer>
                  <button className="btn btn-light" onClick={onHide}>
                    Close
                  </button>
                  <button
                    className="btn btn-outline-secondary"
                    onClick={handleSubmit}
                    disabled={!isFormValid}
                  >
                    Send Message
                  </button>
                </Modal.Footer>
              </>
            ) : (
              <Modal.Body>
                <Row>
                  <Col lg={12} xs={12} sm={12}>
                    <p>There is no members in group</p>
                  </Col>
                </Row>
              </Modal.Body>
            )}
          </>
        ) : (
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
        )}
      </Modal>
    </>
  );
};

export default MessageTemplateModal;
