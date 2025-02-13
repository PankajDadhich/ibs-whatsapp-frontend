/**
 * @author      Abdul Pathan
 * @date        Aug, 2024
 * @copyright   www.ibirdsservices.com
 */

import React, { useState } from 'react'
import { Card, Col, Container, Row, Tab, Tabs } from 'react-bootstrap'
import { ToastContainer, toast } from 'react-toastify';//npm i react-toastify --force
import 'react-toastify/dist/ReactToastify.css';
import AuthenticationTemplate from './AuthenticationTemplate';
import MarketingTemplate from './MarketingTemplate2';
import UtilityTemplate from './UtilityTemplate';
import { useLocation } from "react-router-dom";

const CreateTemplate = () => {
    // const navigate = useNavigate();
    // const [activeTab, setActiveTab] = useState('Marketing');
    const location = useLocation();
    const [rowData, setRowData] = useState(location.state ? location.state : {});
    const [activeTab, setActiveTab] = useState(location?.state ? location?.state?.category : 'MARKETING');

    const handleSelect = (key) => {

        setActiveTab(key);
    }

    return (
        <>
            <Container className='mt-5'>
                <Row className='g-0 mx-5 text-center'>
                    <Col lg={12} xs={12} sm={12}>
                        <div className=' text-center p-2' style={{ height: '40px', backgroundColor: '#ffffff', borderRadius: '5px' }}>
                            <span className='fw-semibold' style={{ color: '#605C68', fontSize: 'large' }}>
                                Create Webhook Templates
                            </span>
                        </div>
                    </Col>
                </Row>
            </Container>

            <Container className='mt-2 mb-5'>
                <Row className='g-0 mx-5'>
                    <Col lg={12} sm={12} xs={12} className="mb-3">
                        <Card className='h-100' style={{ border: "none" }}>
                            <Card.Body>
                                <Tabs
                                    // defaultActiveKey="Marketing"
                                    activeKey={activeTab}
                                    id="fill-tab-example"
                                    className="mb-3"
                                    fill
                                    // onSelect={handleSelect}
                                    onSelect={(key) => handleSelect(key)}
                                >
                                    <Tab eventKey="MARKETING" title={<><i className="fa-solid fa-bullhorn me-2"></i>Marketing</>} className='mt-5' >
                                        <MarketingTemplate activeTab={activeTab} rowData={rowData} />
                                    </Tab>
                                    <Tab eventKey="UTILITY" title={<><i className="fa-regular fa-bell me-2"></i>Utility</>} className='mt-5'>
                                        <UtilityTemplate activeTab={activeTab} rowData={rowData} />
                                    </Tab>
                                    <Tab eventKey="AUTHENTICATION" title={<><i className="fa-solid fa-key me-2"></i>Authentication</>} className='mt-5'>
                                        <AuthenticationTemplate activeTab={activeTab} rowData={rowData} />
                                    </Tab>
                                </Tabs>
                            </Card.Body>

                        </Card>
                    </Col>
                </Row>
            </Container>
            <ToastContainer />
        </>
    )
}

export default CreateTemplate
