import React, { useState, useEffect, useRef } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { Form, FormControl } from "react-bootstrap";

const TemplatePreview = ({ template, onParametersChange,tamplateparms,setParameters,parameters }) => {
  //const [parameters, setParameters] = useState({});
  const [sendToAdmin, setSendToAdmin] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedFileURL, setSelectedFileURL] = useState(null);
  const [selectedFileType, setSelectedFileType] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const docxIcon = "/user_images/doc-icon.png";
  const fileInputRef = useRef(null);

  useEffect(() => {
    setParameters({});
    setSendToAdmin(false);
    setSelectedFile(null);
    setSelectedFileType(null);
    setErrorMessage("");

    setSelectedFileURL(null);
    if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    // Ensure default fileType is sent when template changes
    onParametersChange({
        ...parameters,
        sendToAdmin: false,
        file: null
    });
}, [template]);
//useEffect(() => {
//  setParameters({});
//
//  if (tamplateparms && typeof tamplateparms === "object") {
//    const { sendToAdmin, file, file_id, whatsapp_number_admin, ...restParameters } = tamplateparms;
//
//    setSendToAdmin(sendToAdmin);
//    setSelectedFile(file);
//    setParameters(restParameters);
//  }
//
//}, [tamplateparms]);
useEffect(() => {
  //setParameters({});
  
  if (tamplateparms && typeof tamplateparms === "object") {
    const { sendToAdmin, file, file_id, whatsapp_number_admin, ...restParameters } = tamplateparms;

    setSendToAdmin(sendToAdmin);
    setParameters(restParameters);
    
    if (file) {
      setSelectedFile(file);
      setSelectedFileType(file.type);
      setSelectedFileURL(URL.createObjectURL(file));
    }

  }

}, [tamplateparms]);


  if (!template) {
    return <div className="whatsapp-background">Please select a template to preview.</div>;
  }

  const handleInputChange = (index, value) => {
    const newParams = { ...parameters, [index]: value };
    setParameters(newParams);
    onParametersChange({ ...newParams, sendToAdmin, file: selectedFile });
  };

  const handleCheckboxChange = (event) => {
    const checked = event.target.checked;
    setSendToAdmin(checked);
    onParametersChange({ ...parameters, sendToAdmin: checked, file: selectedFile });
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const fileType = file.type;
    const fileSize = file.size;

    // Determine allowed extensions based on template.header
    let allowedExtensions = [];
    let maxSize = 0;

    if (template.header === "IMAGE") {
        allowedExtensions = ["image/jpeg", "image/png"];
        maxSize = 5 * 1024 * 1024; // 5MB
    } else if (template.header === "VIDEO") {
        allowedExtensions = ["video/mp4", "video/3gpp"];
        maxSize = 16 * 1024 * 1024; // 16MB
    } else if (template.header === "DOCUMENT") {
        allowedExtensions = [
            "image/jpeg", "image/png",
            "video/mp4", "video/3gpp",
            "application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            "application/vnd.ms-excel", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            "application/vnd.ms-powerpoint", "application/vnd.openxmlformats-officedocument.presentationml.presentation",
            "text/plain"
        ];
        maxSize = 100 * 1024 * 1024; // 100MB
    }

    // Validate file type
    if (!allowedExtensions.includes(fileType)) {
        setErrorMessage(`Invalid file type. Please upload a valid ${template.header.toLowerCase()}.`);
        return;
    }

    // Validate file size
    if (fileSize > maxSize) {
        setErrorMessage(`File size exceeds the limit (${maxSize / (1024 * 1024)}MB).`);
        return;
    }

    setErrorMessage("");

    // Determine file type category
    let fileCategory = fileType.includes("image") ? "image" :
                       fileType.includes("video") ? "video" : "document";

    setSelectedFile(file);
    setSelectedFileType(fileCategory);
    setSelectedFileURL(URL.createObjectURL(file));
    // Pass the file and its type to parent
    onParametersChange({ ...parameters, sendToAdmin, file });
};



  const renderFormattedMessage = () => {
    let formattedText = template?.message_body || "";
    Object.keys(parameters).forEach((key) => {
      const placeholder = `{{${key}}}`;
      const replacement = parameters[key] || placeholder;
      formattedText = formattedText.replace(new RegExp(placeholder, "g"), replacement);
    });
    formattedText = formattedText.replace(/(\n)+/g, "<br />");
    formattedText = formattedText.replace(/\*(.*?)\*/g, "<strong>$1</strong>");
    return <span dangerouslySetInnerHTML={{ __html: formattedText }} />;
  };

  const getHeader = () => {
    if (selectedFileURL) {
        if (selectedFileType && selectedFileType.includes("image")) {
            return <img src={selectedFileURL} alt="Uploaded Preview" className="img-fluid rounded w-100 mb-2" style={{ height: "200px", objectFit: "cover" }} />;
        } else if (selectedFileType && selectedFileType.includes("video")) {
            return <video src={selectedFileURL} controls className="img-fluid rounded w-100 mb-2" style={{ height: "200px", objectFit: "cover" }} />;
        } else if (selectedFileType) {  
            return <a href={selectedFileURL} target="_blank" rel="noopener noreferrer">
                <img src={docxIcon} alt="Document Thumbnail" className="img-fluid rounded w-100 mb-2" style={{ height: "200px", objectFit: "cover" }} />
            </a>;
        }
    }

    if (template?.header && template?.header_body) {
        switch (template.header) {
            case "IMAGE":
                return <img src={template.header_body} alt="Template Header" className="img-fluid rounded w-100 mb-2" style={{ height: "200px", objectFit: "cover" }} />;
            case "VIDEO":
                return <video src={template.header_body} controls className="img-fluid rounded w-100 mb-2" style={{ height: "200px", objectFit: "cover" }} />;
            case "DOCUMENT":
                return <a href={template.header_body} target="_blank" rel="noopener noreferrer">
                    <img src={docxIcon} alt="Document Thumbnail" className="img-fluid rounded w-100 mb-2" style={{ height: "200px", objectFit: "cover" }} />
                </a>;
            default:
                return <strong>{template.header_body}</strong>;
        }
    }

    return null;
};

  const getFooter = () => (template.footer ? <div className="template-footer text-muted">{template.footer}</div> : null);

  const getButtons = () => {
    if (template.buttons && template.buttons.length > 0) {
      const quickReplyButtons = template.buttons.filter((button) => button.type === "QUICK_REPLY");
      const otherButtons = template.buttons.filter((button) => button.type !== "QUICK_REPLY");

      return (
        <div className="template-buttons mt-3">
          {otherButtons.map((button, index) => (
            <div key={index} className="btn btn-outline-secondary btn-sm mb-2">
              {button.text}
            </div>
          ))}
          {quickReplyButtons.length > 1 && (
            <div className="btn btn-outline-secondary btn-sm mb-2">See More Options</div>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="container-fluid p-4">
      <div className="row">
        <div className="col-md-6">
          {/* File Upload Input */}
          {/*{template.header && template.header_body && template.header !== 'TEXT'  &&
            <div className="mb-3">
            <label className="form-label fw-bold">Upload File:</label>
            <input type="file" className="form-control border rounded" onChange={handleFileChange}  ref={fileInputRef} />
            {errorMessage && <div className="text-danger mt-2">{errorMessage}</div>}
          </div>
          }*/}
        {template.header && template.header_body && template.header !== 'TEXT'  &&
  <div className="mb-3">
    <label className="form-label fw-bold">Upload File:</label>
    <input type="file" className="form-control border rounded" onChange={handleFileChange} ref={fileInputRef} />
    
    {selectedFile && (
      <div className="mt-2">        
          <p className="text-muted">{selectedFile.name}</p>       
      </div>
    )}

    {errorMessage && <div className="text-danger mt-2">{errorMessage}</div>}
  </div>
}

          
          {/* Parameters */}
          {template?.message_body?.match(/\{\{(\d+)\}\}/g)?.map((match, idx) => {
            const paramIndex = match.replace(/\{\{|\}\}/g, "");
            return (
              <div key={idx} className="mb-3">
                <label className="form-label fw-bold">Enter value for {match}:</label>
                <Form.Group controlId={`formInput${paramIndex}`}>
  <FormControl
    type="text"
    value={parameters[paramIndex] || ""}
    required
    onChange={(e) => handleInputChange(paramIndex, e.target.value)}
    placeholder={`Value for ${match}`}
    className="p-3"
    aria-required="true"
  />
</Form.Group>
                {/*<input type="text" value={parameters[paramIndex] || ""} onChange={(e) => handleInputChange(paramIndex, e.target.value)} className="form-control p-3 border rounded" placeholder={`Value for ${match}`} />*/}
              </div>
            );
          })}
          
          {/* Send to Admin Checkbox */}
          <div className="form-check mt-3">
            <input type="checkbox" id="sendToAdmin" className="form-check-input" checked={sendToAdmin} onChange={handleCheckboxChange} />
            <label htmlFor="sendToAdmin" className="form-check-label">Send on login user WhatsApp number also</label>
          </div>
        </div>
        
        <div className="col-md-6 d-flex justify-content-center align-items-center">
          <div className="whatsapp-background w-100">
            <div className="template-box">
              {getHeader()}
              <div className="template-content mt-3">
                {renderFormattedMessage()}
                {getFooter()}
                {getButtons()}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TemplatePreview;