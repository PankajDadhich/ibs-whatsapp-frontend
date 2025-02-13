/**
 * @author      Abdul Pathan
 * @date        Aug, 2024
 * @copyright   www.ibirdsservices.com
 */
import React, { useEffect, useRef, useState } from "react";
import {
  Button,
  Card,
  Col,
  Container,
  Form,
  Image,
  Row,
  Table,
} from "react-bootstrap";
import WhatsAppAPI from "../../api/WhatsAppAPI";
import { ToastContainer, toast } from "react-toastify"; // npm i react-toastify --force
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";
// import moment from 'moment-timezone';
// const moment = require('moment-timezone');

const UtilityTemplate = ({ previewData, selectedWhatsAppSetting }) => {
  const initialFormData = {
    id: "",
    name: "",
    templatename: "",
    language: "",
    status: "",
    category: "",
    header: "",
    header_text: "",
    header_image_url: "",
    header_document_url: "",
    header_video_url: "",
    message_body: "",
    footer: "",
    buttons: [],
  };

  const navigate = useNavigate();
  const [isSending, setIsSending] = useState(false);
  const [isSpinner, setIsSpinner] = useState(false);
  const [rowData, setRowData] = useState(initialFormData);
  const [buttons, setButtons] = useState([]);
  // file
  const [selectedFiles, setSelectedFiles] = useState();
  const [errorMessage, setErrorMessage] = useState("");
  const [selectedImage2, setSelectedImage2] = useState();
  const [selectedDocument2, setSelectedDocument2] = useState();
  const [selectedVideo2, setSelectedVideo2] = useState();

  const bodyRef = useRef(null);
  const [variables, setVariables] = useState([]);

  useEffect(() => {
    if (previewData && previewData?.category === "UTILITY") {
      const buttons =
        previewData?.buttons && previewData.buttons.length > 0
          ? previewData.buttons.map((button) => ({
              type: button.type,
              text: button.text,
              ...(button.type === "PHONE_NUMBER" && {
                phone_number: button.phone_number,
              }),
              ...(button.type === "URL" && { url: button.url }),
            }))
          : [];

      setRowData({
        id: previewData?.id || "",
        name: previewData?.templatename || "",
        language: previewData?.language || "",
        status: previewData?.status || "",
        category: previewData?.category || "",
        header: previewData?.header || "",
        header_text: previewData?.header_text || "",
        header_image_url: previewData?.header_image_url || "",
        header_document_url: previewData?.header_document_url || "",
        header_video_url: previewData?.header_video_url || "",
        message_body: previewData?.message_body || "",
        footer: previewData?.footer || "",
        buttons,
      });

      setButtons(buttons);
      setSelectedImage2(previewData?.header_image_url || null);
      setSelectedDocument2(previewData?.header_document_url || null);
      setSelectedVideo2(previewData?.header_video_url || null);

      const bodyText = previewData?.example_body_text[0] || [];
      let varData = bodyText.map((item, idx) => ({ id: idx + 1, value: item }));
      setVariables(varData);
    } else {
      setRowData(initialFormData);
      setButtons([]);
      setSelectedFiles(null);
      setVariables([]);
    }
  }, [previewData]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    const textarea = bodyRef.current;
    const cursorPos = textarea.selectionStart;

    let updatedValue = value;

    if (name === "message_body") {
      updatedValue = renumberVariables(value);
    }

    setRowData((prevData) => ({ ...prevData, [name]: updatedValue }));

    if (name === "header") {
      setSelectedFiles(null);
      setSelectedImage2(null);
      setSelectedDocument2(null);
      setSelectedVideo2(null);
      setErrorMessage("");
    }

    setTimeout(() => {
      textarea.selectionStart = textarea.selectionEnd = cursorPos;
    }, 0);
  };

  const handleFileChange = (event) => {
    const { name, files } = event.target;
    const file = files[0];

    if (!file) return;

    const fileTypeMappings = {
      header_image_url: ["jpg", "jpeg", "png"],
      header_document_url: ["pdf"],
      header_video_url: ["mp4"],
    };

    const fileSize = {
      header_image_url: 5,
      header_document_url: 100,
      header_video_url: 16,
    };

    const validExtensions = fileTypeMappings[name];
    if (!validExtensions.includes(file.name.split(".").pop().toLowerCase())) {
      setErrorMessage(`Only ${validExtensions.join(", ")} files are allowed.`);
      event.target.value = "";
      return;
    }

    const validSize = fileSize[name];
    if (file.size > validSize * 1024 * 1024) {
      setErrorMessage(`Exceed maximum allowed upload size of ${validSize}MB.`);
      event.target.value = "";
      return;
    }

    setErrorMessage("");
    switch (name) {
      case "header_image_url":
        setSelectedImage2(null);
        setSelectedFiles(file);
        break;
      case "header_document_url":
        setSelectedDocument2(null);
        setSelectedFiles(file);
        break;
      case "header_video_url":
        setSelectedVideo2(null);
        setSelectedFiles(file);
        break;
      default:
        break;
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (rowData.header === "TEXT" && !rowData.header_text.trim()) {
      toast.error("Template header text is required.");
      return;
    }

    if (rowData.header === "IMAGE" && !selectedFiles && !selectedImage2) {
      toast.error("Upload image is required.");
      return;
    }
    if (rowData.header === "DOCUMENT" && !selectedFiles && !selectedDocument2) {
      toast.error("Upload document is required.");
      return;
    }
    if (rowData.header === "VIDEO" && !selectedFiles && !selectedVideo2) {
      toast.error("Upload video mp4 is required.");
      return;
    }

    if (buttons.length > 0) {
      for (const button of buttons) {
        if (
          button.type === "URL" &&
          (!button.text.trim() || !button.url.trim())
        ) {
          toast.error("Please fill in all fields for the URL button.");
          return;
        }
        if (
          button.type === "PHONE_NUMBER" &&
          (!button.text.trim() || !button.phone_number.trim())
        ) {
          toast.error("Please fill in all fields for the Phone Number button.");
          return;
        }
      }
    }

    let imageId = "";

    if (selectedFiles) {
      const sessionId = await WhatsAppAPI.generateSessionId(
        selectedFiles,
        selectedWhatsAppSetting
      );

      if (sessionId.id) {
        const document = await WhatsAppAPI.uploadDocumentSessionId(
          selectedFiles,
          sessionId.id,
          selectedWhatsAppSetting
        );
        imageId = document.h;
      }
    }

    const formattedName = rowData.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "_")
      .replace(/^_+|_+$/g, "");

    const reqBody = {
      name: formattedName,
      language: rowData.language,
      category: "UTILITY",
      components: [
        {
          type: "HEADER",
          format: rowData.header,
          ...(rowData.header === "TEXT" && { text: rowData.header_text }),
          ...(rowData.header === "IMAGE" && {
            example: { header_handle: [imageId || rowData?.header_image_url] },
          }),
          ...(rowData.header === "DOCUMENT" && {
            example: {
              header_handle: [imageId || rowData?.header_document_url],
            },
          }),
          ...(rowData.header === "VIDEO" && {
            example: { header_handle: [imageId || rowData?.header_video_url] },
          }),
        },
        {
          type: "BODY",
          text: rowData?.message_body,
          ...(rowData.message_body.match(/\{\{(\d+)\}\}/g) && {
            example: {
              body_text: [Object.values(variables).map((data) => data.value)],
            },
          }),
        },
        {
          type: "FOOTER",
          text: rowData?.footer || "",
        },
        ...(buttons.filter((button) => button.text && button.type).length > 0
          ? [
              {
                type: "BUTTONS",
                buttons: buttons
                  .filter((button) => button.text && button.type)
                  .map((button) => ({
                    type: button.type,
                    text: button.text,
                    ...(button.type === "PHONE_NUMBER" && {
                      phone_number: button.phone_number,
                    }),
                    ...(button.type === "URL" && { url: button.url }),
                  })),
              },
            ]
          : []),
      ],
    };

    try {
      setIsSpinner(true);
      let result;
      if (rowData?.id) {
        result = await WhatsAppAPI.updateMarketingTemplate(
          rowData.id,
          reqBody,
          selectedWhatsAppSetting
        );
      } else {
        result = await WhatsAppAPI.createMarketingTemplate(
          reqBody,
          selectedWhatsAppSetting
        );
      }

      if (result.error) {
        const errorJson = result.error.split(" - ")[1];
        const parsedError = JSON.parse(errorJson);
        const errorMessage =
          parsedError.error.error_user_msg || parsedError.error.message;
        toast.error(errorMessage);
      } else {
        toast.success(
          rowData?.id
            ? "Template updated successfully."
            : "Template created successfully."
        );
        setIsSpinner(false);
        navigate("/whatsapp_template");
      }
    } catch (error) {
      toast.error("An unexpected error occurred.");
    } finally {
      setIsSending(false);
      setIsSpinner(false);
    }
  };

  const handleBack = () => {
    navigate("/whatsapp_template");
  };

  const isFormValid =
    Boolean(rowData.name.trim()) &&
    Boolean(rowData.language) &&
    Boolean(rowData.message_body.trim()) &&
    Boolean(rowData.footer.trim()) &&
    Boolean(variables.every((item) => item.id && item.value));

  const handleAddButton = () => {
    if (buttons.length < 2) {
      const newButton = { type: "", text: "", PHONE_NUMBER: "", url: "" };
      setButtons([...buttons, newButton]);
    } else {
      toast.error("Maximum of 2 buttons can be added.");
    }
  };

  const handleRemoveButton = (index) => {
    const updatedButtons = buttons.filter((_, i) => i !== index);
    setButtons(updatedButtons);
  };

  const handleButtonChange = (index, field, value) => {
    const updatedButtons = buttons.map((button, i) => {
      if (i === index) {
        return { ...button, [field]: value };
      }
      return button;
    });
    setButtons(updatedButtons);
  };

  const getDisabledOptions = (currentType) => {
    return buttons.some((button) => button.type === currentType);
  };

  const handleVariableChange = (id, newValue) => {
    setVariables((prevValue) =>
      prevValue.map((v) => (v.id === id ? { ...v, value: newValue } : v))
    );
  };

  // generate the next available variable number
  const getNextVariableNumber = () => {
    const numbers = variables.map((v) => v.id);

    const maxNumber = numbers.length > 0 ? Math.max(...numbers) : 0;
    return maxNumber + 1;
  };

  const formatTextArea = (character) => {
    if (!bodyRef.current) return;
    let text = rowData?.message_body || "";
    const textarea = bodyRef.current;
    const startPosition = textarea.selectionStart;
    const endPosition = textarea.selectionEnd;
    if (character !== null) {
      const selectedText = text.substring(startPosition, endPosition);
      const newText =
        text.substring(0, startPosition) +
        character +
        selectedText +
        character +
        text.substring(endPosition);
      // console.log('newText: ', newText);
      setRowData((prevData) => ({ ...prevData, message_body: newText }));

      // Set cursor after inserted text
      setTimeout(() => {
        textarea.selectionStart = startPosition + character.length;
        textarea.selectionEnd = endPosition + character.length;
        textarea.focus();
      }, 0);
    } else {
      let variableNumber = getNextVariableNumber();
      character = ` {{${variableNumber}}}`;
      const newText = text + character;
      // console.log('newText: ', newText);
      setRowData((prevData) => ({ ...prevData, message_body: newText }));

      if (!variables.some((v) => v.id === variableNumber)) {
        setVariables([...variables, { id: variableNumber, value: "" }]);
      }
      // Set cursor after inserted variable
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = newText.length;
        textarea.focus();
      }, 0);
    }
  };

  // renumber variables sequentially
  const renumberVariables = (updatedText) => {
    const matches = updatedText.match(/\{\{(\d+)\}\}/g) || [];

    const extractedNumbers = matches.map((match) =>
      parseInt(match.replace(/[{}]/g, ""), 10)
    );

    // Filter existing variables & remove those missing in the textarea
    const updatedVars = variables.filter((v) =>
      extractedNumbers.includes(v.id)
    );
    // Renumber variables sequentially
    updatedVars
      .sort((a, b) => a.id - b.id)
      .forEach((v, index) => (v.id = index + 1));

    setVariables(updatedVars);

    // Update textarea with renumbered variables
    matches.forEach((match, index) => {
      updatedText = updatedText.replace(match, `{{${index + 1}}}`);
    });
    console.log("updatedText: ", updatedText);
    return updatedText;
  };

  return (
    <>
      {!isSpinner ? (
        <>
          <Container className="mt-1">
            <Row className="mx-5 g-0">
              <Col lg={12} sm={12} xs={12}>
                <Card className="h-100" style={{ border: "none" }}>
                  <Card.Body>
                    <Row>
                      <Col lg={12} sm={12} xs={12}>
                        <Form.Group
                          className="mx-2 mb-3"
                          controlId="formBasicName"
                        >
                          <Form.Label
                            className="form-view-label"
                            htmlFor="formBasicName"
                          >
                            <b>Template name and language</b>
                          </Form.Label>
                        </Form.Group>
                      </Col>
                    </Row>

                    <Row className="mb-3">
                      <Col lg={6} sm={12} xs={12}>
                        <Form.Group
                          className="mx-2 mb-3"
                          controlId="formBasicTemplateName"
                        >
                          <Form.Label
                            className="form-view-label"
                            htmlFor="formBasicTemplateName"
                          >
                            Template Name
                          </Form.Label>
                          <Form.Control
                            disabled={rowData?.id}
                            type="text"
                            name="name"
                            value={rowData?.name}
                            onChange={handleChange}
                            placeholder="Enter template name"
                            required
                            style={{ height: "36px" }}
                          />
                        </Form.Group>
                      </Col>

                      <Col lg={6} sm={12} xs={12}>
                        <Form.Group className="mb-2 mx-3">
                          <Form.Label
                            className="form-view-label"
                            htmlFor="formBasicLanguage"
                          >
                            Language
                          </Form.Label>
                          <Form.Select
                            // disabled={rowData?.id}
                            aria-label="select language"
                            name="language"
                            value={rowData?.language}
                            onChange={handleChange}
                            required
                            style={{ height: "36px" }}
                          >
                            <option value="">Select Language</option>
                            <option value="en">English</option>
                            <option value="en_US">English (US)</option>
                            <option value="en_GB">English (UK)</option>
                            <option value="hi">Hindi</option>
                            <option value="ur">Urdu</option>
                          </Form.Select>
                        </Form.Group>
                      </Col>
                    </Row>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          </Container>

          <Container className="mt-1">
            <Row className="mx-5 mb-5 g-0">
              <Col lg={12} sm={12} xs={12} className="mb-2">
                <Card className="h-100" style={{ border: "none" }}>
                  <Card.Body>
                    <Row>
                      <Col lg={12} sm={12} xs={12}>
                        <Form.Group className="mx-2 mb-3">
                          <Form.Label
                            className="form-view-label"
                            htmlFor="formBasicContent"
                          >
                            <b>Content </b> ( Fill in the header, body and
                            footer sections of your template. )
                          </Form.Label>
                        </Form.Group>
                      </Col>
                    </Row>

                    <Row className="mb-3">
                      <Col lg={6} sm={12} xs={12}>
                        <Form.Group className="mb-3 mx-3">
                          <Form.Label
                            className="form-view-label"
                            htmlFor="formBasicHeader"
                          >
                            Header
                          </Form.Label>
                          <Form.Select
                            aria-label="select language"
                            name="header"
                            value={rowData?.header}
                            onChange={handleChange}
                            style={{ height: "36px" }}
                          >
                            <option value="">Select Header</option>
                            <option value="TEXT">Text</option>
                            <option value="IMAGE">Image</option>
                            <option value="DOCUMENT">Document</option>
                            <option value="VIDEO">Video</option>
                          </Form.Select>
                        </Form.Group>
                      </Col>

                      {rowData.header === "TEXT" && (
                        <Col lg={6} sm={12} xs={12}>
                          <Form.Group
                            className="mx-2 mb-3"
                            controlId="formBasicHeaderText"
                          >
                            <Form.Label
                              className="form-view-label"
                              htmlFor="formBasicHeaderText"
                            >
                              Header Text
                            </Form.Label>
                            <Form.Control
                              type="text"
                              name="header_text"
                              value={rowData?.header_text}
                              onChange={handleChange}
                              placeholder="Enter text here..."
                              required
                              style={{ height: "36px" }}
                            />
                          </Form.Group>
                        </Col>
                      )}
                    </Row>

                    <Row className="mb-3">
                      <Col lg={6} sm={12} xs={12}>
                        {rowData.header === "IMAGE" && (
                          <>
                            <Form.Group
                              className="mb-3 mx-3"
                              controlId="formFileImage"
                            >
                              <Form.Label>Upload Image</Form.Label>{" "}
                              <Form.Text muted>
                                (Image Supported: .jpg, .jpeg, .png)
                              </Form.Text>
                              <Form.Control
                                required
                                type="file"
                                name="header_image_url"
                                accept="image/jpeg, image/png, image/jpg" // Allow only image files
                                onChange={handleFileChange}
                              />
                              <Form.Text>Maximum Size: 5MB</Form.Text>
                              {errorMessage && (
                                <>
                                  <br />
                                  <Form.Text className="text-danger">
                                    {errorMessage}
                                  </Form.Text>
                                </>
                              )}
                            </Form.Group>
                            {selectedImage2 ? (
                              <Image
                                className="mx-3"
                                variant="top"
                                src={selectedImage2}
                                thumbnail
                                style={{ width: "15%" }}
                              ></Image>
                            ) : (
                              selectedFiles && (
                                <Image
                                  className="mx-3"
                                  variant="top"
                                  src={URL.createObjectURL(selectedFiles)}
                                  thumbnail
                                  style={{ width: "15%" }}
                                ></Image>
                              )
                            )}
                          </>
                        )}

                        {rowData.header === "DOCUMENT" && (
                          <>
                            <Form.Group
                              className="mb-3 mx-3"
                              controlId="formFileDocument"
                            >
                              <Form.Label>Upload Document</Form.Label>{" "}
                              <Form.Text muted>
                                (Document Supported: .pdf)
                              </Form.Text>
                              <Form.Control
                                required
                                type="file"
                                name="header_document_url"
                                accept=".pdf" // Allow only PDF files
                                onChange={handleFileChange}
                              />
                              <Form.Text>Maximum Size: 100MB</Form.Text>
                              {errorMessage && (
                                <>
                                  <br />
                                  <Form.Text className="text-danger">
                                    {errorMessage}
                                  </Form.Text>
                                </>
                              )}
                            </Form.Group>
                            {selectedDocument2 ? (
                              <Form.Text className="text-muted mx-2">
                                <a
                                  href={selectedDocument2}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  <i
                                    className="fa-solid fa-file-pdf mx-2"
                                    style={{ fontSize: "15px" }}
                                  ></i>
                                  View PDF
                                </a>
                              </Form.Text>
                            ) : (
                              selectedFiles && (
                                <Form.Text className="text-muted mx-2">
                                  <a
                                    href={URL.createObjectURL(selectedFiles)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                  >
                                    <i
                                      className="fa-solid fa-file-pdf mx-2"
                                      style={{ fontSize: "15px" }}
                                    ></i>
                                    {selectedFiles.name}
                                  </a>
                                </Form.Text>
                              )
                            )}
                          </>
                        )}

                        {rowData.header === "VIDEO" && (
                          <>
                            <Form.Group
                              className="mb-3 mx-3"
                              controlId="formFileVideo"
                            >
                              <Form.Label>Upload Video</Form.Label>{" "}
                              <Form.Text muted>
                                (Video Supported: .mp4)
                              </Form.Text>
                              <Form.Control
                                required
                                type="file"
                                name="header_video_url"
                                accept="video/mp4" // Allow only MP4 videos
                                onChange={handleFileChange}
                              />
                              <Form.Text>Maximum Size: 16MB</Form.Text>
                              {errorMessage && (
                                <>
                                  <br />
                                  <Form.Text className="text-danger">
                                    {errorMessage}
                                  </Form.Text>
                                </>
                              )}
                            </Form.Group>

                            {selectedVideo2 ? (
                              <video
                                controls
                                className="mx-3"
                                style={{ width: "100%" }}
                              >
                                <source src={selectedVideo2} type="video/mp4" />
                                Your browser does not support the video tag.
                              </video>
                            ) : (
                              selectedFiles && (
                                <video
                                  controls
                                  className="mx-3"
                                  style={{ width: "100%" }}
                                >
                                  <source
                                    src={URL.createObjectURL(selectedFiles)}
                                    type="video/mp4"
                                  />
                                  Your browser does not support the video tag.
                                </video>
                              )
                            )}
                          </>
                        )}
                      </Col>
                    </Row>

                    <Row className="mb-3">
                      <Col lg={12} sm={12} xs={12}>
                        <Form.Group
                          className="mx-3 mb-1"
                          controlId="formBasicBody"
                        >
                          <Form.Label
                            className="form-view-label"
                            htmlFor="formBasicBody"
                          >
                            Body
                          </Form.Label>
                          <Form.Control
                            as="textarea"
                            name="message_body"
                            ref={bodyRef}
                            value={rowData?.message_body}
                            onChange={handleChange}
                            placeholder="type text here..."
                            required
                            rows={10}
                          />
                        </Form.Group>
                        <div className="mb-3 mx-3">
                          <Col
                            lg={12}
                            sm={12}
                            xs={12}
                            className="text-end mb-2"
                          >
                            <button
                              className="format-text-btn"
                              onClick={() => formatTextArea("*")}
                              data-bs-toggle="tooltip"
                              title="Bold"
                            >
                              <i className="fa-solid fa-bold"></i>
                            </button>
                            <button
                              className="format-text-btn"
                              onClick={() => formatTextArea("_")}
                              data-bs-toggle="tooltip"
                              title="Italic"
                            >
                              <i className="fa-solid fa-italic"></i>
                            </button>
                            <button
                              className="format-text-btn"
                              onClick={() => formatTextArea("~")}
                              data-bs-toggle="tooltip"
                              title="Strike-through"
                            >
                              <i className="fa-solid fa-strikethrough"></i>
                            </button>
                            <button
                              className="format-text-btn"
                              onClick={() => formatTextArea("```")}
                              data-bs-toggle="tooltip"
                              title="Monospace"
                            >
                              <i className="fa-solid fa-code"></i>
                            </button>
                            <button
                              className="format-text-btn"
                              onClick={() => formatTextArea(null)}
                            >
                              <i className="fa-solid fa-plus"></i>{" "}
                              <span className="fw-bold ps-2">Add variable</span>
                            </button>
                          </Col>

                          <Col xs={12}>
                            {variables.length ? (
                              <Table>
                                <thead>
                                  <tr>
                                    <th className="w-25">Variable</th>
                                    <th className="w-25">Value</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {variables?.map(({ id, value }) => {
                                    return (
                                      <tr key={id}>
                                        <td>{`{{${id}}}`}</td>
                                        <td>
                                          <Form.Control
                                            type="text"
                                            name={`value_${id}`}
                                            value={value}
                                            onChange={(e) =>
                                              handleVariableChange(
                                                id,
                                                e.target.value
                                              )
                                            }
                                            placeholder={`Enter content for {{${id}}}`}
                                            required
                                            style={{ height: "36px" }}
                                          />
                                        </td>
                                      </tr>
                                    );
                                  })}
                                </tbody>
                              </Table>
                            ) : (
                              ""
                            )}
                          </Col>
                        </div>
                      </Col>

                      <Col lg={6} sm={12} xs={12}>
                        <Form.Group
                          className="mx-3 mb-3"
                          controlId="formBasicFooter"
                        >
                          <Form.Label
                            className="form-view-label"
                            htmlFor="formBasicFooter"
                          >
                            Footer
                          </Form.Label>
                          <Form.Control
                            required
                            type="text"
                            name="footer"
                            value={rowData?.footer}
                            onChange={handleChange}
                            placeholder="type text here..."
                            style={{ height: "36px" }}
                          />
                        </Form.Group>
                      </Col>
                    </Row>

                    <Row className="mb-1">
                      <Col lg={12} sm={12} xs={12}>
                        <Button
                          className="mb-3 mx-3"
                          variant="outline-secondary"
                          onClick={handleAddButton}
                        >
                          <i className="fa-solid fa-plus mx-1"></i>Add Button
                        </Button>
                      </Col>
                    </Row>

                    <Row className="mb-1 mx-2">
                      <Col lg={12} sm={12} xs={12} className="mb-2">
                        {buttons.map((button, index) => (
                          <Row key={index} className="mb-3">
                            <Col lg={3} sm={12} xs={12}>
                              <Form.Group className="mb-0">
                                <Form.Label className="form-view-label">
                                  Type of action
                                </Form.Label>
                                <Form.Select
                                  value={button.type}
                                  onChange={(e) =>
                                    handleButtonChange(
                                      index,
                                      "type",
                                      e.target.value
                                    )
                                  }
                                  style={{ height: "36px" }}
                                >
                                  <option value="">Select Type</option>
                                  <option
                                    value="URL"
                                    disabled={
                                      getDisabledOptions("URL") &&
                                      button.type !== "URL"
                                    }
                                  >
                                    Visit Website
                                  </option>
                                  <option
                                    value="PHONE_NUMBER"
                                    disabled={
                                      getDisabledOptions("PHONE_NUMBER") &&
                                      button.type !== "PHONE_NUMBER"
                                    }
                                  >
                                    Call Phone Number
                                  </option>
                                </Form.Select>
                              </Form.Group>
                            </Col>

                            <Col lg={3} sm={12} xs={12}>
                              <Form.Group className="mb-0">
                                <Form.Label className="form-view-label">
                                  Button Text
                                </Form.Label>
                                <Form.Control
                                  type="text"
                                  value={button.text}
                                  onChange={(e) =>
                                    handleButtonChange(
                                      index,
                                      "text",
                                      e.target.value
                                    )
                                  }
                                  placeholder="Enter button text..."
                                  style={{ height: "36px" }}
                                />
                              </Form.Group>
                            </Col>

                            {button.type === "URL" && (
                              <Col lg={3} sm={12} xs={12}>
                                <Form.Group className="mb-0">
                                  <Form.Label className="form-view-label">
                                    URL
                                  </Form.Label>
                                  <Form.Control
                                    required
                                    type="text"
                                    value={button.url}
                                    onChange={(e) =>
                                      handleButtonChange(
                                        index,
                                        "url",
                                        e.target.value
                                      )
                                    }
                                    placeholder="https://www.example.com"
                                    style={{ height: "36px" }}
                                  />
                                </Form.Group>
                              </Col>
                            )}

                            {button.type === "PHONE_NUMBER" && (
                              <Col lg={3} sm={12} xs={12}>
                                <Form.Group className="mb-0">
                                  <Form.Label className="form-view-label">
                                    Phone Number
                                  </Form.Label>
                                  <Form.Control
                                    required
                                    type="text"
                                    value={button.phone_number}
                                    onChange={(e) =>
                                      handleButtonChange(
                                        index,
                                        "phone_number",
                                        e.target.value
                                      )
                                    }
                                    placeholder="16467043595"
                                    style={{ height: "36px" }}
                                  />
                                </Form.Group>
                              </Col>
                            )}

                            <Col
                              lg={3}
                              sm={12}
                              xs={12}
                              className="d-flex align-items-center mt-4 pt-2"
                            >
                              <Button
                                variant="danger"
                                onClick={() => handleRemoveButton(index)}
                              >
                                <i
                                  className="fa-solid fa-xmark"
                                  title="Remove"
                                ></i>
                              </Button>
                            </Col>
                          </Row>
                        ))}
                      </Col>
                    </Row>

                    <Row>
                      <Col lg={12} sm={12} xs={12}>
                        <hr></hr>
                      </Col>
                    </Row>

                    <Row className="g-0 mb-2">
                      <Col lg={12} sm={12} xs={12} className="text-end mt-2">
                        <Button
                          className="mx-2"
                          variant="light"
                          onClick={handleBack}
                          disabled={isSending}
                        >
                          Back
                        </Button>
                        <Button
                          variant="outline-secondary"
                          disabled={!isFormValid || isSending}
                          onClick={handleSubmit}
                        >
                          {isSending ? "Submitting..." : "Submit for Review"}
                        </Button>
                      </Col>
                    </Row>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          </Container>
        </>
      ) : (
        <Container className="mt-1">
          <Row className="mx-5 g-0">
            <Col lg={12} sm={12} xs={12}>
              <Card className="h-100" style={{ border: "none" }}>
                <Card.Body>
                  <Row className="mb-3">
                    <Col lg={12} sm={12} xs={12}>
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
                    </Col>
                  </Row>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      )}

      <ToastContainer />
    </>
  );
};

export default UtilityTemplate;
