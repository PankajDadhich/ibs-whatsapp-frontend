/**
 * @author      Abdul Pathan
 * @date        Aug, 2024
 * @copyright   www.ibirdsservices.com
 */

import React, { useState } from 'react'
import { Card, Col, Container, Form, Row } from 'react-bootstrap'
import AuthenticationTemplate from './AuthenticationTemplate';
import MarketingTemplate from './MarketingTemplate';
import UtilityTemplate from './UtilityTemplate';
import { useLocation } from "react-router-dom";

const TemplateAdd = ({selectedWhatsAppSetting}) => {
    const location = useLocation();
    const [rowData, setRowData] = useState(location.state ? location.state : {});
    const [selectedCategory, setSelectedCategory] = useState(rowData?.category);
    const handleCategoryChange = (event) => {
        setSelectedCategory(event.target.value)
    }

    return (
        <>
            <Container className='mt-5'>
                <Row className='mx-5 text-center g-0'>
                    <Col lg={12} xs={12} sm={12}>
                        <div className=' text-center p-2' style={{ height: '40px', backgroundColor: '#ffffff', borderRadius: '5px' }}>
                            <span className='fw-semibold p-1' style={{ color: '#605C68', fontSize: 'large' }}>
                                {rowData?.id ? 'Edit Template' : 'Add Template'}
                            </span>
                        </div>
                    </Col>
                </Row>
            </Container>

            <Container className='mt-1'>
                <Row className='mx-5 g-0'>
                    <Col lg={12} sm={12} xs={12}>
                        <Card className='h-100' style={{ border: "none" }}>
                            <Card.Body>
                                <Row className='mb-3'>
                                    <Col lg={4} sm={12} xs={12}>
                                        <Form.Group className='mb-2 mx-3'>
                                            <Form.Label className="form-view-label" htmlFor="formBasicLanguage">
                                                Template Category
                                            </Form.Label>
                                            <Form.Select
                                                disabled={rowData.id}
                                                aria-label="select Category"
                                                name="category"
                                                value={selectedCategory || ''}
                                                onChange={handleCategoryChange}
                                                required
                                                style={{ height: "36px" }}
                                            >
                                                <option value="">Select Category</option>
                                                <option value="AUTHENTICATION">Authentication</option>
                                                <option value="MARKETING">Marketing</option>
                                                <option value="UTILITY">Utility</option>
                                            </Form.Select>
                                        </Form.Group>
                                    </Col>
                                </Row>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row >
            </Container >

            {selectedCategory === 'AUTHENTICATION' && <AuthenticationTemplate previewData={rowData} selectedWhatsAppSetting={selectedWhatsAppSetting} />}
            {selectedCategory === 'MARKETING' && <MarketingTemplate previewData={rowData} selectedWhatsAppSetting={selectedWhatsAppSetting} />}
            {selectedCategory === 'UTILITY' && <UtilityTemplate previewData={rowData} selectedWhatsAppSetting={selectedWhatsAppSetting}/>}

        </>
    )
}

export default TemplateAdd;
