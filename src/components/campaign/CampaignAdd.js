/**
 * @author      Abdul Pathan
 * @date        Aug, 2024
 * @copyright   www.ibirdsservices.com
 */

import React, { useEffect, useRef, useState } from "react";
import { Button, Card, Col, Container, Form, Row } from "react-bootstrap";
import WhatsAppAPI from "../../api/WhatsAppAPI";
import { ToastContainer, toast } from "react-toastify"; // npm i react-toastify --force
import "react-toastify/dist/ReactToastify.css";
import moment from "moment-timezone";
import { useNavigate } from "react-router-dom";
// const moment = require('moment-timezone');
// import Select from 'react-select'; // Import react-select
import { MultiSelect } from "react-multi-select-component"; // Import the MultiSelect component
import { saveAs } from "file-saver";
import CampaignTemplateModal from "./CampaignTemplateModal";

const CampaignAdd = ({ selectedWhatsAppSetting, userInfo }) => {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState("");
  const [filteredTemplates, setFilteredTemplates] = useState([]);
  const [allTemplateData, setAllTemplateData] = useState([]);
  const [show, setshow] = useState(false);
  const [selectedTemplateName, setSelectedTemplateName] = useState("");
  const [campaignRecord, setCampaignRecord] = useState({
    name: "",
    description: "",
    start_date: "",
    type: "",
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isSpinner, setIsSpinner] = useState(false);
  const [tamplateparms, setTamplateParms] = useState({});
  const fileInputRef = useRef(null);
  // const [selectedGroup, setSelectedGroup] = useState({ value: null, label: 'Select Group' }); // Changed to null
  const [optionGroups, setOptionGroups] = useState([]);
  const [selectedGroups, setSelectedGroups] = useState([]);
  const hasGroupsModule = userInfo?.modules?.some(module => module.url === "groups") || false;
  const categories = ["UTILITY", "MARKETING"];
  useEffect(() => {
    fetchAllTemplate(selectedWhatsAppSetting);
    fetchGroupRecords();
  }, [selectedWhatsAppSetting]);
  const handleclose = () => {
    setshow(false)
    setSelectedTemplateName("")
    setTamplateParms({})
  }
  const handleCategoryChange = (e) => {
    const category = e.target.value;
    setSelectedCategory(category);

    // Filter templates based on the selected category
    const filtered = allTemplateData.filter(
      (template) => template.category === category || category === ""
    );
    setFilteredTemplates(filtered);
  };

  // Fetch All template
  const fetchAllTemplate = async (selectedWhatsAppSetting) => {
    try {
      const result = await WhatsAppAPI.getApprovedTemplates(
        selectedWhatsAppSetting
      );

      if (result.error) {
        // console.error(result)
        setAllTemplateData([]);
        setIsSpinner(true);
      } else {
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
          };
        });

        const filteredTemplates = transformedData.filter(
          (template) => template.category !== "AUTHENTICATION"
        );
        setAllTemplateData(filteredTemplates);
        setFilteredTemplates(filteredTemplates);
        setIsSpinner(true);
      }
    } catch (error) {
      toast.error("Failed to fetch templates.");
    }
  };
console.log("tamplateparms ->",tamplateparms);

  const fetchGroupRecords = async () => {
    const result = await WhatsAppAPI.fetchGroups(true);
    if (result.success) {
      const filteredGroups = result.records?.filter(
        (item) => item.members && item.members.length > 0
      );
      const groupResult =
        filteredGroups?.map((item) => ({ value: item.id, label: item.name })) ||
        [];
      // const defaultOption = { value: null, label: 'Select Group' };
      setOptionGroups(groupResult);
    } else {
      setOptionGroups([]);
    }
    setIsSpinner(true);
  };
  function generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  // handle template change
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

  const handleGroupChange = (selectedOption) => {
    setSelectedGroups(selectedOption);
  };

  const handleChangeName = (event) => {
    const { name, value } = event.target;
    if (name === "start_date") {
      setCampaignRecord({
        ...campaignRecord,
        [name]: value ? moment(value).tz("Asia/Kolkata").toDate() : "",
      });
    }
    setCampaignRecord({ ...campaignRecord, [name]: value });
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];

    if (file) {
      const validExtensions = ["xls", "xlsx", "csv"];
      const fileExtension = file.name.split(".").pop().toLowerCase();

      if (!validExtensions.includes(fileExtension)) {
        setErrorMessage("Only .csv, .xls and .xlsx files are allowed.");
        setSelectedFile(null); // Clear the file input
        event.target.value = ""; // Reset file input value
        return;
      }

      setSelectedFile([file]);
      setErrorMessage("");
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!campaignRecord.name) {
      toast.error("Campaign name required.");
      return;
    }

    if (!selectedTemplateName) {
      toast.error("Template name required.");
      return;
    }

    // if (!selectedFile) {
    //     toast.error("Please select a file.");
    //     return;
    // }

    const desc = campaignRecord?.description ? campaignRecord.description : "";
    if (selectedFile) {
      var formData = new FormData();
      for (let i = 0; i < selectedFile.length; i++) {
        formData.append(`selectedFile${i}`, selectedFile[i]);
        formData.append(`description`, desc);
      }
    }

    const groupIds = selectedGroups.map((group) => group.value);

    const campiagnData = {
      name: campaignRecord.name,
      type: campaignRecord.type || "Web",
      status: "Pending",
      template_name: selectedTemplateName.name,
      template_id: selectedTemplateName.id, 
      group_ids: groupIds,
      business_number: selectedWhatsAppSetting,
      startDate: campaignRecord.start_date
        ? moment(campaignRecord.start_date)
            .tz("Asia/Kolkata")
            .format("YYYY-MM-DDTHH:mm:ss.SSSZ")
        : moment.tz(new Date(), "Asia/Kolkata").toDate(),
    };
    try {
      const msgResult = await WhatsAppAPI.createMessageTemplateData(
        selectedTemplateName
      );

      if (msgResult?.errors) {
        toast.error(msgResult?.errors);
        setIsSpinner(true);
        return;
      }

      const campaignResult = await WhatsAppAPI.insertCampaignRecords(
        campiagnData
      );

      if (campaignResult.success) {
        const cpId = campaignResult.record.id;
//TemplateParms

if (tamplateparms && typeof tamplateparms === "object") {
  const { sendToAdmin, file, file_id, whatsapp_number_admin, ...restParameters } = tamplateparms;
  const campaign_template_params ={
    "campaign_id":cpId,
    "body_text_params":restParameters,
    "msg_history_id":null,  
    "file_id":file_id,
    "whatsapp_number_admin":whatsapp_number_admin
  }
  const campaignparamsResult = await WhatsAppAPI.insertCampaignParamsRecords(
    campaign_template_params
  );
  console.log("campaignparamsResult->",campaignparamsResult);
  
}

        //hear for updation sumit
        let result = "";
        if (selectedFile) {
          result = await WhatsAppAPI.createCampaignFile(cpId, formData);
        }
        if (campaignResult.success || result.success) {
          toast.success("Record Inserted Successfully!");
          navigate("/campaign");
        }
        setIsSpinner(false);
      }
    } catch (error) {
      toast.error("Failed to send message.");
    } finally {
      setIsSending(false);
      setIsSpinner(false);
    }
  };

  // clear
  const handleClear = () => {
    setSelectedTemplateName("");
    setCampaignRecord({ name: "", description: "", start_date: "", type: "" });
    setSelectedFile(null);
    setIsSending(false);
    setSelectedGroups([])
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const formatDateForInput = (date) => {
    return date ? moment(date).format("YYYY-MM-DDTHH:mm") : "";
  };

  // const isFormValid = Boolean(selectedTemplateName?.name) && Boolean(campaignRecord.name) && Boolean(selectedFile);
  const isFormValid =
    Boolean(selectedTemplateName?.name) &&
    Boolean(campaignRecord.name) &&
    (Boolean(selectedFile) || selectedGroups.length > 0);

  const handleBack = () => {
    navigate("/campaign");
  };

  const csvData = [
    ["Name", "Number"],
    ["John", "9876543210"],
  ];

  const convertToCSV = (array) => {
    return array.map((row) => row.join(",")).join("\n");
  };

  const downloadCSV = () => {
    const csvString = convertToCSV(csvData);
    const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
    saveAs(blob, "contacts.csv");
  };
  console.log("setSelectedTemplateName",selectedTemplateName);
  
  return (
    <>
      <Container className="mt-5">
        <Row className="mx-5 text-center g-0">
          <Col lg={12} xs={12} sm={12}>
            <div
              className=" text-center p-2"
              style={{
                height: "40px",
                backgroundColor: "#ffffff",
                borderRadius: "5px",
              }}
            >
              <span
                className="fw-semibold p-1"
                style={{ color: "#605C68", fontSize: "large" }}
              >
                Add Campaign
              </span>
            </div>
          </Col>
        </Row>
      </Container>

      {isSpinner ? (
        <>
          <Container className="mt-1 mb-5">
            <Row className="mx-5 g-0">
              <Col lg={12} sm={12} xs={12} className="mb-2">
                <Card className="h-100" style={{ border: "none" }}>
                  <Card.Body>
                    {/* <Form onSubmit={Submit} > */}
                    <Row className="mb-3">
                      <Col lg={6} sm={12} xs={12}>
                        <Form.Group
                          className="mb-3 mx-2"
                          controlId="formCampaignName"
                        >
                          <Form.Label>Campaign Name</Form.Label>
                          <Form.Control
                            style={{ height: "36px" }}
                            required
                            type="text"
                            name="name"
                            placeholder="Enter campain name"
                            value={campaignRecord?.name}
                            onChange={handleChangeName}
                          />
                        </Form.Group>
                      </Col>

                      <Col lg={6} sm={12} xs={12}>
                        <Form.Group
                          className="mb-3 mx-2"
                          controlId="formStartDate"
                        >
                          <Form.Label>Start Date & Time</Form.Label>
                          <Form.Control
                            style={{ height: "36px" }}
                            required
                            type="datetime-local"
                            name="start_date"
                            value={formatDateForInput(
                              campaignRecord?.start_date
                            )}
                            onChange={handleChangeName}
                          />
                        </Form.Group>
                      </Col>
                    </Row>
                    {/*<Row className="mb-3">
                      <Col lg={6} sm={12} xs={12}>
                        <Form.Group className="mb-3 mx-2">
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
                      <Col lg={6} sm={12} xs={12}>
                        <Form.Group className="mb-3 mx-2">
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
                            // value={templateName}
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
                    </Row>*/}

<Row className="align-items-center">
{hasGroupsModule && (
                        <Col lg={6} sm={12} xs={12}>
                          <Form.Group
                            className="mb-3 mx-2"
                            controlId="groupSelect"
                          >
                            <Form.Label>Group Name</Form.Label>
                            <MultiSelect
                              options={optionGroups}
                              value={selectedGroups}
                              onChange={handleGroupChange}
                              labelledBy="Select Groups"
                            />
                          </Form.Group>
                        </Col>
                      )}
 

  <Col lg={6} sm={12} xs={12}>
    <Form.Group className="mb-3 mx-2" controlId="formFile">
      <Form.Label>File Upload</Form.Label>
      <Form.Control
        type="file"
        ref={fileInputRef}
        accept=".csv"
        onChange={handleFileChange}
      />
      {errorMessage && (
        <Form.Text className="text-danger">{errorMessage}</Form.Text>
      )}
    </Form.Group>
  </Col>

  <Col lg={6} sm={12} xs={12}>
    <Form.Group className="mb-3 mx-2">
      <Form.Label htmlFor="formType">Type</Form.Label>
      <Form.Select
        className="w-100"
        style={{ height: "36px" }}
        aria-label="select type"
        name="type"
        value={campaignRecord?.type}
        onChange={handleChangeName}
      >
        <option value="">Select type</option>
        <option value="Advertisement">Advertisement</option>
        <option value="Banner Ads">Banner Ads</option>
        <option value="Conference">Conference</option>
        <option value="Direct Mail">Direct Mail</option>
        <option value="Email">Email</option>
        <option value="Partners">Partners</option>
        <option value="Public Relations">Public Relations</option>
        <option value="Web">Web</option>
        <option value="Other">Other</option>
      </Form.Select>
    </Form.Group>
  </Col>
  <Col lg={6} sm={12} xs={12}>
    <Form.Group className="mb-3 mx-2">
      <Form.Label htmlFor="formType">Template</Form.Label><br/>
      <Button className="w-50" onClick={() => setshow(true)} 
                          variant="outline-secondary">Select Template</Button>  <span>{selectedTemplateName?.name}</span>
    </Form.Group>
  </Col>
</Row>


                    <Row className="mb-3">
                     
                      <Col lg={6} sm={12} xs={12}>
                        <Form.Group
                          className="mb-3 mx-2"
                          controlId="formCampaignName mb-5"
                        >
                          <Form.Label>Description</Form.Label>
                          <Form.Control
                            style={{ height: "38px" }}
                            // as="textarea"
                            type="text"
                            name="description"
                            placeholder="type description here..."
                            value={campaignRecord?.description}
                            onChange={handleChangeName}
                          />
                        </Form.Group>
                      </Col>
                    </Row>

                    <Row className="mt-1">
                      <Col lg={12} sm={12} xs={12}>
                        <hr></hr>
                      </Col>
                    </Row>

                    <Row className="g-0 mb-2">
                      <Col lg={3} sm={3} xs={3} className="text-start mt-2">
                        <Button
                          className="ms-2"
                          variant="outline-secondary"
                          onClick={downloadCSV}
                        >
                          <i className="fa fa-download me-2"></i>Download Sample
                          CSV
                        </Button>
                      </Col>
                      <Col lg={9} sm={9} xs={9} className="text-end mt-2">
                        <Button
                          className="mx-2"
                          variant="light"
                          onClick={handleBack}
                          disabled={isSending}
                        >
                          Back
                        </Button>
                        <Button
                          className="mx-2"
                          variant="light"
                          onClick={handleClear}
                          disabled={isSending}
                        >
                          Clear
                        </Button>
                        <Button
                          variant="outline-secondary"
                          disabled={!isFormValid || isSending}
                          onClick={handleSubmit}
                          type="button"
                        >
                          {isSending ? "Submitting..." : "Submit"}
                        </Button>
                      </Col>
                    </Row>
                    {/* </Form> */}
                  </Card.Body>
                </Card>
              </Col>
            </Row>
            {show &&
             <CampaignTemplateModal  show={show}
             onHide={handleclose}   
             setshow={setshow}   
             setSelectedTemplateName={setSelectedTemplateName}  
             selectedTemplateName={selectedTemplateName}       
             setTemplateParms={setTamplateParms}
             tamplateparms={tamplateparms}
             selectedWhatsAppSetting={selectedWhatsAppSetting}/>
            }
          </Container>
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

      <ToastContainer />
    </>
  );
};

export default CampaignAdd;