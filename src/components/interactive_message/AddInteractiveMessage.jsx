import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button, Card, Col, Container, Form, Row,Table } from "react-bootstrap";
import WhatsAppAPI from "../../api/WhatsAppAPI";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const AddInteractiveMessage = ({selectedWhatsAppSetting}) => {
    const navigate = useNavigate();
    const location = useLocation();
    const [isSpinner, setIsSpinner] = useState(true);
    const existingData = location.state || null;
    const [file, setFile] = useState(null);
    const [fileError, setFileError] = useState("");
    
    const [formData, setFormData] = useState({
        name: "",
        header_type: "text",
        header_content: "",
        file_id: null,
        body_text: "",
        footer_text: "",
        type: "button",
        buttons: [],
        sections: [],
    });

    useEffect(() => {
        if (existingData) {
            setFormData(existingData);
        } else {
            setFormData((prev) => ({
                ...prev,
                buttons: prev.type === "button" ? [{ id: Date.now().toString(), text: "" }] : [],
            }));
        }
    }, [existingData]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
            sections: name === "type" && value === "list" 
            ? [{ title: "", rows: [{ id: Date.now().toString(), title: "", description: "" }] }] 
            : value === "button" 
            ? [] 
            : prev.sections,
            buttons: name === "type" && value === "button" 
            ? [{ id: Date.now().toString(), text: "" }] 
            : value === "list" 
            ? [] 
            : prev.buttons,
        }));
    };
    const fileTypes = {
        documents: ["txt", "xls", "xlsx", "doc", "docx", "ppt", "pptx", "pdf"],
        images: ["jpeg", "jpg", "png"],
        videos: ["mp4", "3gpp"],
      };


      const handleFileChange = (event) => {
          const selectedFile = event.target.files[0];
          if (!selectedFile) return;
      
          const fileExt = selectedFile.name.split('.').pop().toLowerCase();
          const fileSizeMB = selectedFile.size / (1024 * 1024);
          let isValid = false;
      
          if (formData.header_type === "document" && fileTypes.documents.includes(fileExt) && fileSizeMB <= 100) {
              isValid = true;
          }
          if (formData.header_type === "image" && fileTypes.images.includes(fileExt) && fileSizeMB <= 5) {
              isValid = true;
          }
          if (formData.header_type === "video" && fileTypes.videos.includes(fileExt) && fileSizeMB <= 16) {
              isValid = true;
          }
      
          if (!isValid) {
              setFileError(`Invalid file type or size for ${formData.header_type}`);
              event.target.value = "";
              setFile(null);
          } else {
              setFileError("");
              setFile(selectedFile);
          }
      };
      

    const handleSectionChange = (sectionIndex, value) => { 
        setFormData((prevFormData) => {
        const updatedSections = [...prevFormData.sections];
        updatedSections[sectionIndex].title = value;
        return { ...prevFormData, sections: updatedSections };
        });
    };

    const handleAddRow = (sectionIndex) => {
        setFormData((prevFormData) => {
        const updatedSections = [...prevFormData.sections];
        const lastRow = updatedSections[sectionIndex].rows[updatedSections[sectionIndex].rows.length - 1];
        if (!lastRow || lastRow.title.trim() !== "") {
        if (updatedSections[sectionIndex].rows.length < 10) {
            updatedSections[sectionIndex].rows.push({ id: Date.now().toString(), title: "", description: "" });
            return { ...prevFormData, sections: updatedSections };
        } else {
            toast.error("Maximum 10 rows are allowed.");
            return prevFormData;
        }
        } else {
            toast.error("Please fill the title before adding a new one.");
            return prevFormData;
        }
        });
    };

    const handleRemoveRow = (sectionIndex, rowIndex) => {
        setFormData((prevFormData) => {
        const updatedSections = [...prevFormData.sections];
            updatedSections[sectionIndex].rows.splice(rowIndex, 1);
            return { ...prevFormData, sections: updatedSections };
        });
    };

    const handleRowChange = (sectionIndex, rowIndex, field, value) => {
        setFormData((prevFormData) => {
        const updatedSections = [...prevFormData.sections];
            updatedSections[sectionIndex].rows[rowIndex][field] = value;
            return { ...prevFormData, sections: updatedSections };
        });
    };

    const handleAddButton = () => {
        setFormData((prev) => {
        const lastButton = prev.buttons[prev.buttons.length - 1];
        if (lastButton.text.trim() !== "") {
            return { ...prev, buttons: [...prev.buttons, { id: Date.now().toString(), text: "" }] };
        } else {
            toast.error("Please fill the title before adding a new one.");
            return prev;
        }
        });
    };

    const handleRemoveButton = (index) => {
        setFormData((prev) => {
        const buttons = [...prev.buttons];
            buttons.splice(index, 1);
            return { ...prev, buttons };
        });
    };

    const handleButtonChange = (index, value) => {
        setFormData((prev) => {
        const buttons = [...prev.buttons];
            buttons[index].text = value;
            return { ...prev, buttons };
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log(formData);
        console.log("file",file);
        debugger;
        try {
            let fileId = formData.file_id; 
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
            const updatedFormData = { ...formData, file_id: fileId };

            const response = existingData
                ? await WhatsAppAPI.updateInteractiveMessage(updatedFormData, selectedWhatsAppSetting)
                : await WhatsAppAPI.createInteractiveMessage(updatedFormData, selectedWhatsAppSetting);
            if (response.success) {
                toast.success("Quick Reply saved successfully!");
                navigate("/interactive_message");
            } else {
                toast.error("Failed to save interactive quick reply.");
            }
        } catch (error) {
            toast.error("An error occurred.");
        }
    };

    const isFormValid =
    Boolean(formData.name) &&
    Boolean(formData.body_text) &&
    (formData.type === "button"
        ? formData.buttons.length > 0 && formData.buttons.every(button => button.text.trim() !== "")
        : formData.sections.length > 0 &&
          formData.sections.every(section =>
              section.title.trim() !== "" &&
              section.rows.length > 0 &&
              section.rows.every(row => row.title.trim() !== "")
          ));

    const handleBack = () => {
        navigate("/interactive_message");
    };
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
        {existingData ? "Edit" : "Add"} Quick Reply
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
            <Row className="mb-3">
                <Col lg={6} sm={12} xs={12}>
                <Form.Group
                className=" mx-2"
                controlId="formName"
                >
                <Form.Label>Name</Form.Label>
                <Form.Control
                style={{ height: "36px" }} type="text" name="name" value={formData.name} onChange={handleInputChange} required />
                </Form.Group>
                </Col>
            </Row>
            <Row className="mb-3">
                <Col lg={6} sm={12} xs={12}>
                <Form.Group
                className="mx-2">
                <Form.Label>Header Type</Form.Label>
                <Form.Select style={{ height: "36px" }}  name="header_type" value={formData.header_type} onChange={handleInputChange}>
                <option value="text">Text</option>
                <option value="image">Image</option>
                <option value="video">Video</option>
                <option value="document">Document</option>
                </Form.Select>
                </Form.Group>
                </Col>
                <Col lg={6} sm={12} xs={12}>
                {formData.header_type === "text" ? (
                <Form.Group className="mx-2">
                <Form.Label>Header Content</Form.Label>
                <Form.Control style={{ height: "36px" }}  type="text" name="header_content" value={formData.header_content} onChange={handleInputChange} />
                </Form.Group>
                ) : (
                <Form.Group className="mx-2">
                <Form.Label>Upload File   {fileError && <span style={{ color: "red", fontSize: "12px" }}>{fileError}</span>}</Form.Label>
                <Form.Control type="file" onChange={handleFileChange} />
                </Form.Group>
                )}
                </Col>
            </Row>
            <Row className="mb-3">
                <Col lg={12} sm={12} xs={12}>
                <Form.Group className="mx-2">
                <Form.Label>Body Text</Form.Label>
                <Form.Control  rows={5} as="textarea" name="body_text" value={formData.body_text} onChange={handleInputChange} required />
                </Form.Group>
                </Col>
            </Row>
            <Row className="mb-3">
                <Col lg={6} sm={12} xs={12}>
                <Form.Group className="mx-2">
                <Form.Label>Type</Form.Label>
                <Form.Select style={{ height: "36px" }}  name="type" value={formData.type} onChange={handleInputChange}>
                <option value="list">List</option>
                <option value="button">Button</option>
                </Form.Select>
                </Form.Group>
                </Col>
                <Col lg={6} sm={12} xs={12}>
                <Form.Group className=" mb-3 mx-2">
                <Form.Label>Footer Text</Form.Label>
                <Form.Control style={{ height: "36px" }}  type="text" name="footer_text" value={formData.footer_text} onChange={handleInputChange} />
                </Form.Group>
                </Col>
            </Row>
            <Row className="mb-3 mx-2">
                <Col lg={12} sm={12} xs={12}>
                {formData.type === "button" && (
                <Table bordered hover>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Button Text</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
                    {formData.buttons.map((button, index) => (
                    <tr key={button.id}>
                        <td>
                            {button.id}
                        </td>
                        <td>
                            <Form.Control required type="text" value={button.text} onChange={(e) =>
                            handleButtonChange(index, e.target.value)} />
                        </td>
                        <td>
                            {index === 0 && (
                            <Button variant="success" onClick={handleAddButton}>Add Button</Button>
                            )}
                            {index > 0 && (
                            <Button variant="danger" onClick={() => handleRemoveButton(index)}>Remove</Button>
                            )}
                        </td>
                    </tr>
                    ))}
                </tbody>
                </Table>
                )}
                {formData.type === "list" && (
                <>
                <Table bordered hover className="mt-3">
                <thead>
                    <tr>
                        <th>Section Title</th>
                        <th>Row Title</th>
                        <th>Row Description</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
                    {formData.sections.map((section, sectionIndex) => (
                    section.rows.length > 0 ? section.rows.map((row, rowIndex) => (
                    <tr key={row.id}>
                        {rowIndex === 0 && (
                        <td rowSpan={section.rows.length} className="align-middle">
                            <Form.Control 
                            required
                            type="text" 
                            value={section.title} 
                            placeholder="Section Title" 
                            onChange={(e) =>
                            handleSectionChange(sectionIndex, e.target.value)} 
                            />
                        </td>
                        )}
                        <td>
                            <Form.Control 
                            required
                            type="text" 
                            value={row.title} 
                            placeholder="Row Title" 
                            onChange={(e) =>
                            handleRowChange(sectionIndex, rowIndex, "title", e.target.value)} 
                            />
                        </td>
                        <td>
                            <Form.Control 
                            type="text" 
                            value={row.description} 
                            placeholder="Row Description" 
                            onChange={(e) =>
                            handleRowChange(sectionIndex, rowIndex, "description", e.target.value)} 
                            />
                        </td>
                        <td className="text-center">
                            {rowIndex === 0 && (
                            <Button variant="success" size="sm" className="ms-2" onClick={() => handleAddRow(sectionIndex)}>Add Row</Button>
                            )}
                            {rowIndex > 0 && (
                            <Button variant="danger" size="sm" onClick={() => handleRemoveRow(sectionIndex, rowIndex)}>Remove</Button>
                            )}
                        </td>
                    </tr>
                    )) : (
                    <tr>
                        <td>
                            <Form.Control 
                            type="text" 
                            value={section.title} 
                            onChange={(e) =>
                            handleSectionChange(sectionIndex, e.target.value)} 
                            />
                        </td>
                        <td colSpan={2} className="text-center">No rows added</td>
                        <td className="text-center">
                            <Button variant="success" onClick={() => handleAddRow(sectionIndex)} disabled={formData.sections[0].rows.length >= 10}>
                            Add Row
                            </Button>
                        </td>
                    </tr>
                    )
                    ))}
                </tbody>
                </Table>
                </>
                )}
                </Col>
            </Row>
       
                    <Row className="g-0 mb-2 mx-3">
                      <Col lg={12} sm={12} xs={12} className="text-end">
                        <Button
                          className="mx-2"
                          variant="light"
                          onClick={handleBack}
                        >
                          Back
                        </Button>
                        <Button
                          variant="outline-secondary"
                          disabled={!isFormValid}
                          onClick={handleSubmit}
                          type="button"
                        >
                          Submit
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
export default AddInteractiveMessage;