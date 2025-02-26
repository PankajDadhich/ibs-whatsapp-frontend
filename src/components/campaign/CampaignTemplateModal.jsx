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

const CampaignTemplateModal = ({
  show,
  onHide,
  setshow,
  selectedWhatsAppSetting,
  setSelectedTemplateName,
  selectedTemplateName,
  tamplateparms,
  setTemplateParms,
}) => {
  const [userInfo, setUserInfo] = useState(
    jwt_decode(sessionStorage.getItem("token"))
  );
  const [selectedCategory, setSelectedCategory] = useState("");
  const [filteredTemplates, setFilteredTemplates] = useState([]);
  const [allTemplateData, setAllTemplateData] = useState([]);
//  const [selectedTemplateName, setSelectedTemplateName] = useState();
  const [isSpinner, setIsSpinner] = useState(false);
  const categories = ["AUTHENTICATION", "UTILITY", "MARKETING"];
  const [parameters, setParameters] = useState({});
console.log("selectedTemplateName ->",selectedTemplateName);

  useEffect(() => {
    // console.log("userInfo",userInfo)
    fetchAllTemplate(selectedWhatsAppSetting);
  }, [selectedWhatsAppSetting]);

  const handleCategoryChange = (e) => {
    const category = e.target.value;
    setSelectedCategory(category);

    // Filter templates based on the selected category
    const filtered = allTemplateData.filter(
      (template) => template.category === category || category === ""
    );
    setFilteredTemplates(filtered);
  };
console.log("userInfo0>",userInfo);

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
            // Footer and security recommendations
            add_security_recommendation:
              body.add_security_recommendation || false,
            code_expiration_minutes: footer.code_expiration_minutes || null,
            footer: footer.text || "",

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

            // Extracting button details
            // buttons: buttons.map(button => {
            //     if (button.type === 'OTP') {
            //         return {
            //             type: button.type,
            //             otp_type: button.otp_type,
            //             supported_apps: button.supported_apps?.map(app => ({
            //                 package_name: app.package_name,
            //                 signature_hash: app.signature_hash,
            //             })) || [],
            //         };
            //     } else {
            //         return {
            //             type: button.type,
            //             text: button.text,
            //             ...(button.type === 'PHONE_NUMBER' && { phone_number: button.phone_number }),
            //             ...(button.type === 'URL' && { url: button.url }),
            //         };
            //     }
            // }).filter(button => button.text && button.type),
            // Extracting button details
            // buttons: buttons.map(button => {
            //     return {
            //         type: button.type,
            //         text: button.text,
            //         ...(button.type === 'PHONE_NUMBER' && { phone_number: button.phone_number }),
            //         ...(button.type === 'URL' && { url: button.url }),
            //     };
            // }).filter(button => button.text && button.type),  // Only include valid buttons
          };
        });

        setAllTemplateData(transformedData);
        setFilteredTemplates(transformedData);
        setIsSpinner(true);
      }
      setIsSpinner(true);
    }
  };
  function generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  const handleChange = async (event) => {
    const selectedName = event.target.value;
setParameters({})
setTemplateParms({});
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
      console.log("result", formattedTemplate);
    } else {
      setSelectedTemplateName();
    }
  };

  async function fetchFile(url) {
    const response = await fetch(url);
    if (!response.ok) throw new Error("Network response was not ok");
    return await response.blob(); 
  }

  const handleParametersChange = (newParams) => {
    setParameters(newParams);
    console.log("newParams", newParams);
  };

  const handleSubmit = async (event) => {
    try{

   
    event.preventDefault();
    console.log(parameters);

    let documentId = null;
let adminPhone = null;
setIsSpinner(false);
if (parameters.file) {
  const formData = new FormData();
  formData.append("messaging_product", "whatsapp");
  formData.append("file", parameters.file);
  formData.append("description", "Attachment");
      const  fileResult = await WhatsAppAPI.createFile(null, formData);

if(fileResult.success){
    documentId = fileResult.records[0].id; 
}

}


parameters.file_id = documentId || parameters.file;
if (parameters.sendToAdmin && userInfo?.whatsapp_number) {
  adminPhone = userInfo?.whatsapp_number.match(/^\d{10}$/)
    ? `91${userInfo?.whatsapp_number}`
    : userInfo?.whatsapp_number;
}

console.log("adminPhone->",adminPhone);

parameters.whatsapp_number_admin = adminPhone || null;

setTemplateParms(parameters);
setshow(false)
setIsSpinner(true)
}catch(error){
      
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
  const isFormValid = Boolean(selectedTemplateName) && finalCheck;
  return (
    <>
      <Modal show={show} animation={false} size="lg" centered>
        <Modal.Header closeButton onClick={onHide}>
          <Modal.Title id="contained-modal-title-vcenter">
            Select Template
          </Modal.Title>
        </Modal.Header>
        {isSpinner ? (
          <>
            <Modal.Body style={{ maxHeight: "70vh", overflow: "auto" }}>
              <Form noValidate>
                <Row className="p-2 mb-3">
                  <Col lg={12} sm={12} xs={12}>
                    {/* Category Filter Dropdown */}
                    <Form.Group className="mb-3">
                      <Form.Label
                        className="form-view-label"
                        htmlFor="categoryFilter"
                      >
                        Select Template Category
                      </Form.Label>
                      <Form.Select
                        style={{ height: "36px" }}
                        aria-label="Select Template Category"
                        name="categoryFilter"
                        onChange={handleCategoryChange}
                      >
                        <option value="">All Categories</option>
                        {categories.map((category) => (
                          <option key={category} value={category}>
                            {category}
                          </option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col lg={12} sm={12} xs={12}>
                    <Form.Group className="mb-3">
                      <Form.Label
                        className="form-view-label"
                        htmlFor="formBasicFirstName"
                      >
                        Template Name
                      </Form.Label>
                      <Form.Select
                        required
                        style={{ height: "36px" }}
                        aria-label="select name"
                        name="templateName"
                        onChange={handleChange}
                        placeholder="Select Template Name"
                         value={selectedTemplateName?.name}
                      >
                        <option value="">Select Template Name</option>
                        {filteredTemplates?.map((template) => (
                          <option key={template.id} value={template.name}>
{  template?.message_body
?.match(/\{\{(\d+)\}\}/g)?.length>0 ? `${template.templatename} {{-}} `:  template.templatename}
                            
                          </option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col lg={12} sm={12} xs={12}>
                    <TemplatePreview
                      template={selectedTemplateName}
                      onParametersChange={handleParametersChange}
                      tamplateparms={tamplateparms}
                      setParameters={setParameters}                    
                      parameters={parameters}
                    />
                  </Col>
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
                Done
              </button>
            </Modal.Footer>
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

export default CampaignTemplateModal;
