import React, { useState } from "react";
import { Modal, Button, Col, Row, Form } from "react-bootstrap";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import WhatsAppAPI from '../../api/WhatsAppAPI';
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

const ImportLeads = (props) => {
    const [file, setFile] = useState(null);
    const [isSpinner, setIsSpinner] = useState(false);

    // Dummy data for CSV download
    const csvData = [
        [
            "firstname",
            "lastname",
            "whatsapp_number",
            "email",
            "description",
            "state",
            "city",
            "street",
            "country",
            "zipcode",
        ],
        [
            "Shivani",
            "Mehra",
            "7697446798",
            "shivani.m+1@ibirdsservices.com",
            "Sample description",
            "Rajasthan",
            "Ajmer",
            "Foysagar",
            "India",
            "305005"
        ],
    ];

    const convertToCSV = (array) => array.map((row) => row.join(",")).join("\n");

    const downloadCSV = () => {
        const csvString = convertToCSV(csvData);
        const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
        saveAs(blob, "lead_records.csv");
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
            const workbook = XLSX.read(data, { type: "array" });
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

            const headerMapping = [
                "firstname",
                "lastname",
                "whatsapp_number",
                "email",
                "description",
                "state",
                "city",
                "street",
                "country",
                "zipcode"
            ];

            const headers = jsonData[0];
            const headerIndexMap = {};

            headers.forEach((header, index) => {
                const formattedHeader = header ? header.trim().toLowerCase() : "";
                if (formattedHeader && headerMapping.includes(formattedHeader)) {
                    headerIndexMap[formattedHeader] = index;
                }
            });

            const finalJson = jsonData.slice(1).map((row) => {
                const rowData = {};
                headerMapping.forEach((key) => {
                    const index = headerIndexMap[key];
                    const value = index !== undefined ? row[index] : "";
                    rowData[key] = value || "";
                });
                return rowData;
            });
// console.log("finalJson",finalJson);
            // Submit final JSON data to API
            if (finalJson.length > 0) {
                try {
                    const response = await WhatsAppAPI.importLeads({ leads: finalJson });
                    if (response.success) {
                        toast.success(
                            `Imported ${response.createdLeads.length} leads successfully. Skipped ${response.skippedLeads.length} duplicates.`
                        );
                    } else {
                        toast.error("Failed to import leads. Please check the data and try again.");
                    }
                } catch (error) {
                    console.error("Error importing leads:", error);
                    toast.error("An error occurred while importing leads.");
                } finally {
                    setTimeout(() => {
                        props.refreshData();
                    }, 1000);
                }
            } else {
                toast.warn("No valid leads found in the file.");
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
                <Modal.Header closeButton>
                    <Modal.Title>Import Leads</Modal.Title>
                </Modal.Header>
                {!isSpinner ? (
                    <>
                        <Modal.Body>
                            <Row>
                                <Col className="mb-3">
                                    <Form.Group controlId="formFile">
                                        <Form.Label>Select File</Form.Label>
                                        <Form.Control
                                            type="file"
                                            accept=".csv,.xlsx,.xls"
                                            onChange={handleFileChange}
                                        />
                                    </Form.Group>
                                </Col>
                            </Row>
                        </Modal.Body>
                        <Modal.Footer className="d-flex justify-content-between">
                        
                        <Button variant="outline-primary" onClick={downloadCSV}>
                            Download Dummy File
                        </Button>

                       
                        <div>
                            <Button variant="light" onClick={props.onHide} className="me-3">
                                Cancel
                            </Button>
                            <Button variant="primary" onClick={handleFileSubmit} disabled={!file}>
                                Submit
                            </Button>
                        </div>
                    </Modal.Footer>

                    </>
                ) : (
                    <div><div className="sk-cube-grid">
                    <div className="sk-cube sk-cube1"></div>
                    <div className="sk-cube sk-cube2"></div>
                    <div className="sk-cube sk-cube3"></div>
                    <div className="sk-cube sk-cube4"></div>
                    <div className="sk-cube sk-cube5"></div>
                    <div className="sk-cube sk-cube6"></div>
                    <div className="sk-cube sk-cube7"></div>
                    <div className="sk-cube sk-cube8"></div>
                    <div className="sk-cube sk-cube9"></div>
                  </div></div>
                )}
            </Modal>
            <ToastContainer />
        </div>
    );
};

export default ImportLeads;