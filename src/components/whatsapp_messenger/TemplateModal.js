/**
 * @author      Abdul Pathan
 * @date        Aug, 2024
 * @copyright   www.ibirdsservices.com
 */

import React, { useEffect, useState } from 'react'
import { Col, Form, Modal, Row } from 'react-bootstrap'
import WhatsAppAPI from '../../api/WhatsAppAPI';
import { toast } from 'react-toastify';//npm i react-toastify --force
import 'react-toastify/dist/ReactToastify.css';
import TemplatePreview from '../whatsapp_template/TemplatePreview';
import jwt_decode from "jwt-decode";

// import moment from 'moment-timezone';

const TemplateModal = ({ show, onHide, contactData, refreshData, filterData,selectedWhatsAppSetting }) => {
    const [userInfo, setUserInfo] = useState(jwt_decode(localStorage.getItem('token')));
    const [selectedCategory, setSelectedCategory] = useState('');
    const [filteredTemplates, setFilteredTemplates] = useState([]);
    const [allTemplateData, setAllTemplateData] = useState([]);
    const [selectedTemplateName, setSelectedTemplateName] = useState();
    const [isSpinner, setIsSpinner] = useState(false)
    const categories = ['AUTHENTICATION', 'UTILITY', 'MARKETING'];
    const [parameters, setParameters] = useState({});

    useEffect(() => {
        // console.log("userInfo",userInfo)
        fetchAllTemplate(selectedWhatsAppSetting);
    }, [selectedWhatsAppSetting]);

    const handleCategoryChange = (e) => {
        const category = e.target.value;
        setSelectedCategory(category);

        // Filter templates based on the selected category
        const filtered = allTemplateData.filter(template => template.category === category || category === '');
        setFilteredTemplates(filtered);
    };

    const fetchAllTemplate = async (selectedWhatsAppSetting) => {
        const result = await WhatsAppAPI.getApprovedTemplates(selectedWhatsAppSetting);

        if (result.error) {
            setAllTemplateData([])
            setIsSpinner(true);
        } else {
            if(result?.data && result){
                const transformedData = result?.data.map(row => {
                    const header = row.components.find(component => component.type === 'HEADER') || {};
                    const body = row.components.find(component => component.type === 'BODY') || {};
                    const footer = row.components.find(component => component.type === 'FOOTER') || {};
                    const buttons = row.components.find(component => component.type === 'BUTTONS')?.buttons || [];
    
                    return {
                        id: row.id,
                        name: row.name,
                        templatename: row.name.replace(/_/g, ' '),
                        language: row.language,
                        status: row.status,
                        category: row.category,
                        header: header.format || '',
    
                        // Handling header types
                        header_text: header.format === 'TEXT' ? header.text : '',
                        header_image_url: header.format === 'IMAGE' ? (header.example?.header_handle?.[0] || '') : '',
                        header_document_url: header.format === 'DOCUMENT' ? (header.example?.header_handle?.[0] || '') : '',
                        header_video_url: header.format === 'VIDEO' ? (header.example?.header_handle?.[0] || '') : '',
    
                        // Body and example text
                        message_body: body.text || '',
                        example_body_text: body.example?.body_text || [], // Extracting example body text
                        // Footer and security recommendations
                        add_security_recommendation: body.add_security_recommendation || false,
                        code_expiration_minutes: footer.code_expiration_minutes || null,
                        footer: footer.text || '',
    
    
                        buttons: buttons.map(element => {
                            if (element.type === 'OTP') {
                                return {
                                    type: element.type,
                                    otp_type: element.otp_type,
                                    supported_apps: element.supported_apps?.map(app => ({
                                        package_name: app.package_name,
                                        signature_hash: app.signature_hash,
                                    })) || [],
                                };
                            } else {
                                return {
                                    type: element.type,
                                    text: element.text,
                                    ...(element.type === 'PHONE_NUMBER' && { phone_number: element.phone_number }),
                                    ...(element.type === 'URL' && { url: element.url }),
                                };
                            }
                        }).filter(item => item.text && item.type),
    
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
    }
    function generateOTP() {
        return Math.floor(100000 + Math.random() * 900000).toString();
    }

    
    const handleChange = async (event) => {
        const selectedName = event.target.value;

        const template = allTemplateData.find(t => t.name === selectedName);

        if (template) {
            const { id, name, language, category, header, header_text, header_image_url, header_document_url, header_video_url, message_body, example_body_text, footer, buttons } = template;
            // const exampleValue = example_body_text.length > 0 && example_body_text[0].length > 0 ? generateOTP() : '';
            const examplebodytext = category === 'AUTHENTICATION' ? generateOTP() : '';

            const header_body = header_text || header_image_url || header_document_url || header_video_url;
            const formattedTemplate = { id, name, language, category, header, header_body, message_body, example_body_text: examplebodytext, footer, buttons, business_number : selectedWhatsAppSetting };
            setSelectedTemplateName(formattedTemplate)
            console.log("result",formattedTemplate);
        } else {
            setSelectedTemplateName();
        }
    }


    // Function to fetch the file and convert it to a Blob
    async function fetchFile(url) {
        const response = await fetch(url);
        if (!response.ok) throw new Error('Network response was not ok');
        return await response.blob(); // Return the Blob
    }

    const handleParametersChange = (newParams) => {
        setParameters(newParams);
        console.log("newParams",newParams);
      };
    

      const handleSubmit = async (event) => {
        event.preventDefault();
        console.log(parameters);
        
        let documentId = null;
        let fileResult = null;
        setIsSpinner(false);
        
        if (selectedTemplateName.category === 'AUTHENTICATION') {
            selectedTemplateName.example_body_text = parameters["1"];
        }else{
            const { file, ...filteredParams } = parameters; 
            selectedTemplateName.example_body_text = filteredParams; 
        }
    
        try {
            // Step 1: Create Message Template Data
            const msgResult = await WhatsAppAPI.createMessageTemplateData(selectedTemplateName);
            if (msgResult?.errors) {
                toast.error(msgResult?.errors);
                setIsSpinner(true);
                return;
            }
    
            // Step 2: Handle File Upload (if exists)
            if (parameters.file) {
                const formData = new FormData();
                formData.append("messaging_product", "whatsapp");
                formData.append("file", parameters.file);
                formData.append("description", "Attachment");
                 fileResult = await WhatsAppAPI.createFile(contactData.id, formData);
                  
                console.log("fileResult",fileResult);
                const uploadResponse = await WhatsAppAPI.uploadDocumentWithApi(formData, selectedWhatsAppSetting);
    
                if (uploadResponse?.id) {
                    documentId = uploadResponse.id;  // Bind the received ID
                }
            } else  if (selectedTemplateName.header !== 'TEXT' && selectedTemplateName.header && selectedTemplateName.header_body) {
                const fileUrl = selectedTemplateName.header_body;
                let fileBlob = '';
                if (selectedTemplateName.header === 'DOCUMENT') {
                    const obj = { url: fileUrl }
                    fileBlob = await WhatsAppAPI.pdfData(obj,selectedWhatsAppSetting);
                    documentId = fileBlob;
                }
                else {
                    fileBlob = await fetchFile(fileUrl);
                    const fileName = fileUrl.split('/').pop().split('?')[0] || (selectedTemplateName.header === 'DOCUMENT' ? 'application.pdf' : 'file');
                    const file = new File([fileBlob], fileName, { type: fileBlob.type });

                    const formData = new FormData();
                    formData.append("messaging_product", "whatsapp");
                    formData.append("file", file);
                    formData.append("description", `Header ${selectedTemplateName.header} Template`);

                    const documentResult = await WhatsAppAPI.uploadDocumentWithApi(formData,selectedWhatsAppSetting);
                    documentId = documentResult.id;
                }
            }

            

               
            
            // Step 3: Construct Message Payload
            const reqBody = {
                messaging_product: 'whatsapp',
                to: contactData.whatsapp_number,
                type: 'template',
                category: selectedTemplateName.category,
                template: {
                    name: selectedTemplateName.name,
                    language: { code: selectedTemplateName.language },
                    components: [
                        { type: "header", parameters: documentId ? [{ type: selectedTemplateName.header.toLowerCase(), [selectedTemplateName.header.toLowerCase()]: { id: documentId } }] : [] },
                        { type: "body", parameters: selectedTemplateName.category !== 'AUTHENTICATION' ? Object.keys(parameters).filter(key => selectedTemplateName.message_body.includes(`{{${key}}}`)).map(key => ({ type: "text", text: parameters[key] })) : [] }
                    ]
                }
            };

            if (selectedTemplateName.example_body_text && selectedTemplateName.category === 'AUTHENTICATION') {
                // if (selectedTemplateName.example_body_text) {
                    reqBody.template.components[1].parameters.push({
                        type: "text",
                        text: selectedTemplateName.example_body_text
                    });
                }

            
            if (selectedTemplateName.example_body_text && selectedTemplateName.category === 'AUTHENTICATION') {
                reqBody.template.components.push({
                    type: "button",
                    sub_type: "url",
                    index: 0,
                    parameters: [{ type: "text", text: selectedTemplateName.example_body_text }]
                });
            }
    
            // Step 4: Send Message
            const result = await WhatsAppAPI.sendWhatsAppTemplateMessage(reqBody, selectedWhatsAppSetting);
            console.log("result",result);
            // debugger;
            if (result.error) {
                toast.error(`Error: ${result.error.error_data.details}`);
            } else {
                const messageId = result.messages[0].id;
                console.log("messageId",messageId);
                 await WhatsAppAPI.insertMsgHistoryRecords({
                    parent_id: contactData.id || null,
                    name: contactData?.contactname || '',
                    message_template_id: msgResult.id || null,
                    whatsapp_number: contactData.whatsapp_number,
                    message: '',
                    status: 'Outgoing',
                    recordtypename: filterData?.recordType || '',
                    file_id: fileResult?.records[0]?.id || null,
                    is_read: true,
                    business_number: selectedWhatsAppSetting,
                    message_id: messageId
                });
                
            }
    
            // Step 5: Send to Admin (if enabled)
            if (parameters.sendToAdmin && userInfo?.phone) {
                let adminPhone = userInfo.phone.match(/^\d{10}$/) ? `91${userInfo.phone}` : userInfo.phone;
                const adminReqBody = { ...reqBody, to: adminPhone };
                const adminResult = await WhatsAppAPI.sendWhatsAppTemplateMessage(adminReqBody, selectedWhatsAppSetting);
                
                if (!adminResult.error) {
                    const adminMessageId = adminResult.messages[0].id;
                    await WhatsAppAPI.insertMsgHistoryRecords({
                        parent_id: userInfo.id, 
                        name: userInfo.username,
                        message_template_id: msgResult.id || null,
                        whatsapp_number: adminPhone,
                        message: '',
                        status: 'Outgoing',
                        recordtypename: filterData?.recordType || '',
                        file_id: fileResult?.records[0]?.id || null,
                        is_read: true,
                        business_number: selectedWhatsAppSetting,
                        message_id: adminMessageId
                    });
                }
            }
        } catch (error) {
            toast.error("Failed to send message.");
            setIsSpinner(true);
        } finally {
            setIsSpinner(true);
            refreshData();
        }
    };
    

    const isFormValid = Boolean(selectedTemplateName);

    return (
        <>
            <Modal show={show} animation={false} size='lg' centered>
                <Modal.Header closeButton onClick={onHide}>
                    <Modal.Title id="contained-modal-title-vcenter">
                        Send WhatsApp Message
                    </Modal.Title>
                </Modal.Header>
                {isSpinner ?
                    <>
                        <Modal.Body style={{maxHeight:'70vh', overflow:'auto'}}>
                            <Form noValidate >
                                <Row className='p-2 mb-3'>
                                <Col lg={12} sm={12} xs={12}>
                                    {/* Category Filter Dropdown */}
                                    <Form.Group className='mb-3'>
                                        <Form.Label className="form-view-label" htmlFor="categoryFilter">
                                        Select Template Category
                                        </Form.Label>
                                        <Form.Select
                                            style={{ height: '36px' }}
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
                                        <Form.Group className='mb-3'>
                                            <Form.Label className="form-view-label" htmlFor="formBasicFirstName">
                                                Template Name
                                            </Form.Label>
                                            <Form.Select
                                                required
                                                style={{ height: '36px' }}
                                                aria-label="select name"
                                                name="templateName"
                                                onChange={handleChange}
                                                placeholder='Select Template Name'
                                            // value={templateName}
                                            >
                                                <option value="">Select Template Name</option>
                                                {filteredTemplates?.map((template) => (
                                                    <option key={template.id} value={template.name}>
                                                        {template.templatename}
                                                    </option>
                                                ))}
                                            </Form.Select>
                                        </Form.Group>
                                    </Col>
                                    <Col lg={12} sm={12} xs={12}>
                                 <TemplatePreview template={selectedTemplateName} onParametersChange={handleParametersChange} />
                                    </Col>
                                   
                                </Row>
                            </Form>
                        </Modal.Body>

                        <Modal.Footer>
                            <button className='btn btn-light' onClick={onHide}>Close</button>
                            <button className='btn btn-outline-secondary' onClick={handleSubmit} disabled={!isFormValid}>Send Message</button>
                        </Modal.Footer>
                    </>
                    :
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
                }
            </Modal>
        </>
    )
}

export default TemplateModal