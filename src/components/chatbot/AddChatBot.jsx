import React, { useState, useEffect } from "react";
import { Col, Container, Row, Card, Button, Form } from "react-bootstrap";
import { useLocation, useNavigate } from "react-router-dom";
import Select from "react-select";
import WhatsAppAPI from "../../api/WhatsAppAPI";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const AddChatBot = ({ selectedWhatsAppSetting }) => {
    const location = useLocation();
    const navigate = useNavigate();

    const [chatBot, setChatBot] = useState(
      location.state || {
          keyword: "",
          action_type: "text",
          response: "",
          file_id: "",
          interactive_message_id: "",
          template_id: "",
          status: "active",
          business_number: selectedWhatsAppSetting
      }
  );
  
    const [interactiveMsg, setInteractiveMsg] = useState([]);
    const [templates, setTemplates] = useState([]);
    const [file, setFile] = useState(null);
    const [fileError, setFileError] = useState("");
    const [isSending, setIsSending] = useState(false);

    useEffect(() => {
      fetchInteractiveMessage(selectedWhatsAppSetting);
      fetchTemplates(selectedWhatsAppSetting);
  
      if (location.state) {
          setChatBot(location.state);
      }
  }, [selectedWhatsAppSetting, location.state]);
  
    const fetchInteractiveMessage = async (whatsappNumber) => {
        try {
            const result = await WhatsAppAPI.fetchInteractiveMessage(whatsappNumber);
            setInteractiveMsg(result.success ? result.records : []);
        } catch (error) {
            console.error("Error fetching interactive messages:", error);
            setInteractiveMsg([]);
        }
    };

    const fetchTemplates = async (whatsappNumber) => {
        try {
            const result = await WhatsAppAPI.fetchTemplates(whatsappNumber);
            setTemplates(result.success ? result.records : []);
        } catch (error) {
            console.error("Error fetching templates:", error);
            setTemplates([]);
        }
    };

    const validFileTypes = {
        document: { extensions: ["txt", "xls", "xlsx", "doc", "docx", "ppt", "pptx", "pdf"], maxSize: 100 },
        image: { extensions: ["jpeg", "jpg", "png"], maxSize: 5 },
        video: { extensions: ["mp4", "3gpp"], maxSize: 16 }
    };

    const validateFile = (file, type) => {
        if (!file) return false;

        const fileExtension = file.name.split(".").pop().toLowerCase();
        const fileSizeMB = file.size / (1024 * 1024);
        const { extensions, maxSize } = validFileTypes[type] || {};

        if (!extensions.includes(fileExtension)) {
            setFileError(`Invalid file type. Allowed: ${extensions.join(", ")}`);
            return false;
        }
        if (fileSizeMB > maxSize) {
            setFileError(`File too large. Max size: ${maxSize}MB`);
            return false;
        }

        setFileError("");
        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSending(true);

        if (["document", "image", "video"].includes(chatBot.action_type) && !validateFile(file, chatBot.action_type)) {
            setIsSending(false);
            return;
        }

        try {
            let result;
            console.log("chatBot",chatBot);
            let fileId = chatBot.file_id; 

            if (file) {

              const fileData = new FormData();
              fileData.append("messaging_product", "whatsapp");
              fileData.append("file", file);
              fileData.append("description", "");
  
              const fileResponse = await WhatsAppAPI.createFile(null, fileData);
  
              if (fileResponse.success) {
                  fileId = fileResponse?.records[0]?.id; 
              } else {
                  toast.error("File upload failed");
                  return;
              }
          }
          const updatedFormData = { ...chatBot, file_id: fileId };

            if (chatBot.id) {
                result = await WhatsAppAPI.updateChatbotRecord(chatBot.id, updatedFormData);
            } else {
                result = await WhatsAppAPI.insertChatbotRecord(updatedFormData, selectedWhatsAppSetting);
            }

            if (result.success) {
                toast.success("Chatbot saved successfully.");
                navigate(`/chatbot`);
            } else {
                toast.error(result.error || "An unexpected error occurred.");
            }
        } catch (error) {
            toast.error("An error occurred while saving the record.");
            console.error("API error:", error);
        } finally {
            setIsSending(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;

        setChatBot((prev) => {
            let newState = { ...prev, [name]: value };

            // Reset fields based on selected action type
            if (name === "action_type") {
                newState = {
                    ...newState,
                    response: "",
                    file_id: "",
                    interactive_message_id: "",
                    template_id: "",
                };
                setFile(null);
                setFileError("");
            }

            return newState;
        });
    };

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (validateFile(selectedFile, chatBot.action_type)) {
            setFile(selectedFile);
        } else {
            setFile(null);
        }
    };

    return (
        <>
            <Container className="mt-5">
                <Row className="mx-5 text-center">
                    <Col lg={12}>
                        <div className="text-center p-2" style={{ backgroundColor: "#ffffff", borderRadius: "5px" }}>
                            <span className="fw-semibold" style={{ color: "#605C68", fontSize: "large" }}>
                                {chatBot.id ? "Edit Chatbot" : "Add Chatbot"}
                            </span>
                        </div>
                    </Col>
                </Row>
            </Container>

            <Container className="mt-1 mb-5">
                <Row className="mx-5">
                    <Col lg={12} className="mb-2">
                        <Card style={{ border: "none" }}>
                            <Card.Body>
                                <Form onSubmit={handleSubmit}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Keyword</Form.Label>
                                        <Form.Control
                                            type="text"
                                            name="keyword"
                                            placeholder="Enter keyword"
                                            value={chatBot.keyword}
                                            onChange={handleChange}
                                            required
                                        />
                                    </Form.Group>

                                    <Form.Group className="mb-3">
                                        <Form.Label>Action Type</Form.Label>
                                        <Form.Select name="action_type" value={chatBot.action_type} onChange={handleChange}>
                                            <option value="text">Text</option>
                                            <option value="document">Document</option>
                                            <option value="image">Image</option>
                                            <option value="video">Video</option>
                                            <option value="interactive">Interactive</option>
                                            <option value="template">Template</option>
                                        </Form.Select>
                                    </Form.Group>
                                    {["document", "image", "video"].includes(chatBot.action_type) && (
                                        <Form.Group className="mb-3">
                                            <Form.Label>Upload {chatBot.action_type}</Form.Label>
                                            <Form.Control type="file" onChange={handleFileChange} />
                                            {fileError && <div className="text-danger mt-1">{fileError}</div>}
                                        </Form.Group>
                                    )}
                                    {(chatBot.action_type === "text" || 
                                        chatBot.action_type === "image" || 
                                        chatBot.action_type === "video" ) && (
                                          <Form.Group className="mb-3">
                                              <Form.Label> {["image", "video"].includes(chatBot.action_type) ? 'Caption' : 'Body'}</Form.Label>
                                              <Form.Control 
                                                  as="textarea"  
                                                  rows={3}      
                                                  name="response" 
                                                  value={chatBot.response} 
                                                  onChange={handleChange} 
                                                  required 
                                              />
                                          </Form.Group>
                                      )}


                                  

                                    {chatBot.action_type === "interactive" && (
                                      <Form.Group className="mb-3">
                                      <Form.Label>Quick Reply</Form.Label>
                                      <Select
                                          name="interactive_message_id"
                                          options={interactiveMsg.map((msg) => ({ value: msg.id, label: msg.name }))}
                                          value={interactiveMsg.find((msg) => msg.id === chatBot.interactive_message_id) 
                                              ? { value: chatBot.interactive_message_id, label: interactiveMsg.find((msg) => msg.id === chatBot.interactive_message_id)?.name } 
                                              : null
                                          } 
                                          onChange={(option) => setChatBot((prev) => ({ ...prev, interactive_message_id: option.value }))}
                                      />
                                  </Form.Group>
                                  
                                   
                                    )}

                                    {chatBot.action_type === "template" && (
                                        <Form.Group className="mb-3">
                                            <Form.Label>Template</Form.Label>
                                            <Select
                                                name="template_id"
                                                options={templates.map((temp) => ({ value: temp.id, label: temp.name }))}
                                                onChange={(option) => setChatBot((prev) => ({ ...prev, template_id: option.value }))}
                                            />
                                        </Form.Group>
                                    )}

                                    <Button variant="outline-secondary" className="ms-2" disabled={isSending} type="submit">
                                        {isSending ? "Saving..." : "Save"}
                                    </Button>
                                </Form>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
                <ToastContainer />
            </Container>
        </>
    );
};

export default AddChatBot;
