import React, { useEffect, useState } from "react";
import { Modal, Button, Col, Row, Table, Container, Form, Toast } from "react-bootstrap";
import WhatsAppAPI from "../../api/WhatsAppAPI";
import { ToastContainer, toast } from 'react-toastify';//npm i react-toastify --force
import 'react-toastify/dist/ReactToastify.css';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

const ImportContacts = (props) => {
    const [file, setFile] = useState(null);
    const [isSpinner, setIsSpinner] = useState(false);
    const csvData = [
        ["salutation", "firstname", "lastname", "phone", "email", "title", "street", "city", "state", "country", "pincode"],
        ["Mr.", "John", "Doe", "9876543210", "john.doe@example.com", "Manager", "123 Main St", "Ajmer", "Rajasthan", "India", "305001"],
    ];

    const convertToCSV = (array) => {
        return array.map(row => row.join(',')).join('\n');
    };


    const downloadCSV = () => {
        const csvString = convertToCSV(csvData);
        const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
        saveAs(blob, 'contact_records.csv');
    };

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            setFile(selectedFile);
        }
    };

    const readExcelFile = async (file) => {
        const reader = new FileReader();
        reader.onload = async (event) => {
            const data = new Uint8Array(event.target.result);
            const workbook = XLSX.read(data, { type: 'array' });
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

            const headerMapping = ["salutation", "firstname", "lastname", "title", "phone", "email", "street", "city", "state", "country", "pincode"];

            const headers = jsonData[0];
            const headerIndexMap = {};

            headers.forEach((header, index) => {
                const formattedHeader = header ? header.trim().toLowerCase() : "";
                if (formattedHeader && headerMapping.includes(formattedHeader)) {
                    headerIndexMap[formattedHeader] = index;
                }
            });

            let phoneSet = new Set();
            const phoneRegex = /^[0-9]{10}$/;

            const finalJson = jsonData.slice(1).map((row) => {
                let rowData = {};

                headerMapping.forEach((key) => {
                    const index = headerIndexMap[key];
                    const value = index !== undefined ? row[index] : "";
                    rowData[key] = value !== null && value !== undefined ? value : "";
                });

                rowData.whatsapp_number = rowData.phone;
                if (rowData.phone && phoneRegex.test(rowData.phone)) {
                    rowData.whatsapp_number = `91${rowData.phone}`;
                }

                return rowData;
            })

                .filter(rowData => {
                    const isValid = rowData.firstname && rowData.lastname && phoneRegex.test(rowData.phone);

                    if (isValid && !phoneSet.has(rowData.whatsapp_number)) {
                        phoneSet.add(rowData.whatsapp_number);
                        return true;
                    }
                    return false;
                });

            if (finalJson.length > 0) {
                let successCount = 0;

                for (const record of finalJson) {
                    try {
                        const result = await WhatsAppAPI.createContactRecord(record);

                        if (result && result.success) {
                            successCount++;
                        }
                    } catch (error) {
                        console.log("Error calling WhatsAppAPI for record:", record, error);
                    }
                }
                if (successCount === finalJson.length) {
                    toast.success(`All ${successCount} records submitted successfully!`);
                } else if (successCount > 0) {
                    toast.success(`Only ${successCount} out of ${finalJson.length} records were submitted successfully.`);
                } else {
                    toast.warn("No valid records are submitted.");
                }

                setTimeout(() => {
                    props.refreshData();
                }, 1000);

            } else {
                toast.warn("No valid records to send to WhatsAppAPI.");
            }
        };

        reader.readAsArrayBuffer(file);
    };

    const handleFileSubmit = () => {
        if (file) {
            setIsSpinner(true);
            readExcelFile(file);
        }
    };


    return (
        <div>
            <Modal show={props.show} onHide={props.onHide} centered size="md" backdrop="static">
                <Modal.Header closeButton onClick={props.onHide}>
                    <Modal.Title id="contained-modal-title-vcenter">
                        Import Contacts
                    </Modal.Title>
                </Modal.Header>
                {!isSpinner ? <>
                    <Modal.Body>
                        <Row className='p-2'>
                            <Col lg={12} sm={12} xs={12}>
                                <Form noValidate className="mb-0">
                                    <Form.Group className="mb-3" controlId="formFile">
                                        <Form.Label>Select File</Form.Label>
                                        <Form.Control
                                            type="file"
                                            accept=".csv,.xlsx,.xls"
                                            onChange={handleFileChange}
                                            required
                                        />
                                    </Form.Group>
                                </Form>
                            </Col>
                        </Row>
                    </Modal.Body>
                    <Modal.Footer>
                        <div className="d-flex justify-content-between w-100">
                            <Button variant="outline-primary" onClick={downloadCSV}>
                                <i className="fa fa-download me-2"></i>Dummy File
                            </Button>
                            <div className="d-flex justify-content-end">
                                <Button variant="light" onClick={props.onHide}>
                                    Cancel
                                </Button>
                                <Button className="ms-2" variant="outline-primary" onClick={handleFileSubmit} disabled={!file}>
                                    Submit
                                </Button>
                            </div>
                        </div>
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
            <ToastContainer />
        </div>
    )
}

export default ImportContacts