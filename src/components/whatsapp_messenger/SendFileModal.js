/**
 * @author      Abdul Pathan
 * @date        September, 2024
 * @copyright   www.ibirdsservices.com
 */

import React, { useState } from 'react'
import { Button, Modal } from 'react-bootstrap'
import { Form, } from "react-bootstrap";
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import WhatsAppAPI from '../../api/WhatsAppAPI';

const SendFileModal = (props) => {
    const [files, setFiles] = useState([]);
    const [isSending, setIsSending] = useState(false);
    const [isFileSelected, setIsFileSelected] = useState(false);
    const [parentRecord, setParentRecord] = useState(props.parentData || {});
    const [fileDescription, setFileDescription] = useState('');

    const MIMETypeMap = new Map([
        ["audio/aac", "aac"],
        ["audio/mp4", "mp4"],
        ["audio/mpeg", "mpeg"],
        ["audio/amr", "amr"],
        ["audio/ogg", "ogg"],
        ["audio/opus", "opus"],
        ["application/vnd.ms-powerpoint", "ppt"],
        ["application/msword", "doc"],
        ["application/vnd.openxmlformats-officedocument.wordprocessingml.document", "docx"],
        ["application/vnd.openxmlformats-officedocument.presentationml.presentation", "pptx"],
        ["application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "xlsx"],
        ["application/pdf", "pdf"],
        ["text/plain", "txt"],
        ["application/vnd.ms-excel", "xls"],
        ["image/jpeg", "jpeg"],
        ["image/png", "png"],
        ["image/webp", "webp"],
        ["video/mp4", "mp4"],
        ["video/3gpp", "3gpp"],
    ]);

    const fileSizeLimits = {
        image: 5 * 1024 * 1024, // 5 MB
        video: 16 * 1024 * 1024, // 16 MB
        audio: 16 * 1024 * 1024, // 16 MB
        document: 100 * 1024 * 1024, // 100 MB
        webp: 500 * 1024, // 500 KB
    };

    const handleChange = (event) => {
        const selectedFiles = event.target.files;
        let isValid = true;
    
        Array.from(selectedFiles).forEach((file) => {
            const fileType = file.type;
            const fileSize = file.size;
    
            if (!MIMETypeMap.has(fileType)) {
                isValid = false;
                toast.error(`Unsupported file type: ${fileType}`);
            } else {
                let maxSize;
                if (fileType === "image/webp") {
                    maxSize = fileSizeLimits.webp;
                } else if (fileType.startsWith("image")) {
                    maxSize = fileSizeLimits.image;
                } else if (fileType.startsWith("video")) {
                    maxSize = fileSizeLimits.video;
                } else if (fileType.startsWith("audio")) {
                    maxSize = fileSizeLimits.audio;
                } else {
                    maxSize = fileSizeLimits.document;
                }
    
                if (fileSize > maxSize) {
                    isValid = false;
                    toast.error(`${file.name} file (${fileType}) exceeds the size limit. Max allowed: ${(maxSize / 1024 / 1024).toFixed(2)} MB.`);
                }
            }
        });
    
        if (isValid) {
            setFiles(selectedFiles);
            setIsFileSelected(selectedFiles.length > 0);
        } else {
            event.target.value = null; // Reset file input
        }
    };

  const getWhatsAppType = (mimeType) => {
    if (mimeType.startsWith('image/webp')) return 'sticker'; // .webp files are stickers
    if (mimeType.startsWith('image/')) return 'image';
    if (mimeType.startsWith('video/')) return 'video';
    if (mimeType.startsWith('audio/')) return 'audio';
    if (
        mimeType === 'application/pdf' ||
        mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
        mimeType === 'application/msword' ||
        mimeType === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
        mimeType === 'application/vnd.ms-excel'
    ) return 'document';
    return 'document'; // Default to DOCUMENT for unsupported types
};


    const handleSubmit = async (e) => {
        e.preventDefault();
        if (parentRecord.id) {
            if (files.length > 0) {

                setIsSending(true); // Set submitting state to true

                // let current = new Date();
                const formData = new FormData();
                formData.append("messaging_product", "whatsapp");
                formData.append("file", files[0]);
                formData.append(`description`, fileDescription);

                try {
                    const documentId = await WhatsAppAPI.uploadDocumentWithApi(formData,props.selectedWhatsAppSetting);
                    if (documentId.id) {
                        const fileType = getWhatsAppType(files[0].type);

                        const reqBody = {
                            messaging_product: 'whatsapp',
                            recipient_type: 'individual',
                            to: parentRecord.whatsapp_number,
                            // type: fileType, [fileType.toLowerCase()]: {
                            //     id: documentId.id,
                            //     caption: fileDescription
                            // }
                            type: fileType,
                            [fileType]: {
                                id: documentId.id,
                                ...(fileType !== 'audio' && fileType !== 'sticker' && { caption: fileDescription }), 
                                ...(fileType === 'document' && { filename: files[0].name }) 
                            },
                        };
                        const response = await WhatsAppAPI.sendSingleWhatsAppTextMessage(reqBody,props.selectedWhatsAppSetting);
                        if (response.messaging_product === 'whatsapp') {
                            const result = await WhatsAppAPI.createFile(parentRecord.id, formData);

                            if (result.errors) {
                                toast.error('Bad Request.');
                            }

                            if (result.success) {
                                const messageId = response?.messages[0]?.id;
                                const newMessage = {
                                    parent_id: parentRecord?.id || null,
                                    name: parentRecord?.contactname || '',
                                    message_template_id: null,
                                    whatsapp_number: parentRecord?.whatsapp_number,
                                    message: '',
                                    status: 'Outgoing',
                                    recordtypename: props?.filterData?.recordType || '',
                                    file_id: result?.records[0]?.id || null,
                                    business_number: props.selectedWhatsAppSetting,
                                    // website: '',
                                    // call: '',
                                    // copy_code: '',
                                    is_read: true,
                                    message_id:messageId
                                }

                                const responseHistory = await WhatsAppAPI.insertMsgHistoryRecords(newMessage);

                                toast.success('File sent successfully!');
                                props.refreshImageData();
                            }
                            else {
                                toast.error('Failed to send file.');
                            }
                        }
                    } else {
                        toast.error('An error occurred while sending the file.');
                    }
                } catch (error) {
                    console.error('Error during file upload:', error);
                    toast.error('An error occurred while sending the file.');
                } finally {
                    setIsSending(false); // Reset submitting state
                }
            } else {
                toast.error('Please select a file.');
            }
        }
    };


    return (

        <Modal {...props} aria-labelledby="contained-modal-title-vcenter" centered>
            <Modal.Header closeButton>
                <Modal.Title id="contained-modal-title-vcenter">
                    Upload Files
                </Modal.Title>
            </Modal.Header>

            <Modal.Body>
                <Form.Group controlId="formFile" className="mb-3">
                    <Form.Label></Form.Label>
                    <Form.Control type="file" onChange={handleChange} accept={[...MIMETypeMap.keys()].join(',')} />
                </Form.Group>

                <Form.Group controlId="formBasicDescription">
                    <Form.Label
                        className="form-view-label"
                        htmlFor="formBasicDescription"
                    >
                        Caption
                    </Form.Label>
                    <Form.Control
                        as="textarea"
                        name="description"
                        placeholder="Enter Caption"
                        onChange={(e) => setFileDescription(e.target.value)}
                    />
                </Form.Group>

            </Modal.Body>
            <Modal.Footer>
                <Button variant="light" onClick={props.onHide}>
                    Close
                </Button>
                <div className="submit">
                    <Button variant="outline-primary" type="button" onClick={handleSubmit} disabled={!isFileSelected || isSending}>
                        {isSending ? 'Sending...' : 'Send'}
                    </Button>
                </div>
            </Modal.Footer>
        </Modal >
    )
}

export default SendFileModal
