/**
 * @author: Abhishek Sharma
 */
import React, { useState, useEffect, useRef } from 'react'
import { Col, Container, Row, Button, Form, Card, Table } from "react-bootstrap";
import { useLocation, Link, useNavigate } from "react-router-dom";
import WhatsAppAPI from "../../api/WhatsAppAPI";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import moment from 'moment';
import htmlToPdfmake from 'html-to-pdfmake';
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';

import jsPDF from 'jspdf'; //npm install jspdf
import html2canvas from 'html2canvas';
import "jspdf-autotable"; //npm install jspdf jspdf-autotable
// import { content } from 'html2canvas/dist/types/css/property-descriptors/content';

pdfMake.vfs = pdfFonts.pdfMake.vfs;

const InvoiceView = (props) => {
    const navigate = useNavigate();
    const location = useLocation();
    // const contentRef = useRef();
    const [settings, setSettings] = useState(null);
    const [invoice, setInvoice] = useState({});
    const [company, setCompany] = useState({});
    const [showLoader, setShowLoader] = useState(false);

    const fetchCompany = async (id) => {
    //    console.log(id)
        const companyResponse = await WhatsAppAPI.findCompanyWithUser(id);
    //    console.log('companyResponse', companyResponse);
        if (companyResponse.companyResult) {
            setCompany(companyResponse.companyResult[0]);
        } else {
            setCompany({})
        }
    }

    const fetchSetting = async (name) => {
        const settingResponse = await WhatsAppAPI.getSetting(name);
        if (settingResponse) {
            setSettings(settingResponse?.setting);
        } else {
            setSettings({});
        }
    }

    const fetchInvoice = async (id) => {
        const invoiceResponse = await WhatsAppAPI.getInvoiceById(id);
    //    console.log('invoiceResponse', invoiceResponse);
        if (invoiceResponse) {
        //    console.log(invoiceResponse.company_id);
            setInvoice(invoiceResponse[0]);
            fetchCompany(invoiceResponse[0].company_id);
        } else {
            setInvoice({});
        }
    }

    useEffect(() => {
        if (location.hasOwnProperty("pathname")) {
            invoice.id = location.pathname.split("/")[2];
        }

        if(props && props?.data && props.data.id) {
            invoice.id = props.data.id;
            // contentRef = props.contentRef;
        }

        fetchInvoice(invoice.id);
        fetchSetting('GST');
    }, []);

    const handleCancel = () => {
        navigate('/company/' + invoice.company_id);
    }

    function capitalizeFirstLetter(string) {
        if (!string) return '';
        return string.charAt(0).toUpperCase() + string.slice(1);
    }

    const handleDownloadPdf = () => {
        // const element = contentRef.current;
        // const html = element.innerHTML;
        // const pdfContent = htmlToPdfmake(html, { window: window });

        // const documentDefinition = { content: pdfContent };
        // pdfMake.createPdf(documentDefinition).download('document.pdf');

        setShowLoader(true);

        const div = document.getElementById("pdf-div");

        html2canvas(div).then((canvas) => {
            const imgData = canvas.toDataURL("image/png");
            const pdf = new jsPDF({
                orientation: "portrait",
                unit: "mm",
                format: "a4",
            });

            pdf.setFontSize(14);
            // pdf.text("Student", 10, 10);

            const imgProps = pdf.getImageProperties(imgData);
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

            pdf.addImage(imgData, 'jpg', 0, 5, pdfWidth + 0, pdfHeight);
            pdf.autoPrint({ variant: 'non-conform' });
            pdf.save(company.company_name+".pdf");
        });

        setShowLoader(false);
    };

    return (
        <>
             <Container className='mt-5'>
        <Row className='mx-5 section-header'>
          <Col lg={12} sm={12} xs={12}>
            <Row className='view-form-header align-items-center'>
              <Col lg={8} sm={8} xs={8} className=''>
              Invoice Details
              </Col>
              <Col lg={4} sm={4} xs={4} className="text-end"  >
                <Button className='mx-2 btn-sm' variant="light" onClick={handleCancel} >
                  Back
                </Button>
                <Button className="btn btn-outline-light btn-sm" onClick={handleDownloadPdf}>
                Download Invoice
                </Button>
              </Col>
            </Row>
          </Col>
        </Row>
      </Container>
           
            {invoice && (
                <>
                
                <Container className='mt-1 mb-5'>
                <Row className='mx-5 view-form'>
                <Col lg={12} sm={12} xs={12}>
                <Row className="ibs-edit-form">
                            <Col lg={12} ref={props.innerRef} id="pdf-div">
                                <Row className="pb-4 mx-5 mt-5 border-bottom">
                                    <Col lg={12} className='mb-4'>
                                        <p className='mb-0'>Invoice No.: <b>{invoice.invoice_no}</b></p>
                                        <p>Invoice Date: <b>{moment(invoice.invoice_date).format('DD-MM-YYYY')}</b></p>
                                    </Col>

                                    <Col lg={6}>
                                        <p className='fw-bold mb-0' style={{ fontSize: '1.1rem' }}>Company Information:</p>
                                        <p className='fs-6 fw-bold'>{company?.company_name}</p>
                                        <p className='fs-5 mb-0 fw-bold'>Address:</p>
                                        <p className='fs-6'>
                                            {company?.street && `${company.street},`}<br />
                                            {company?.city && `${company.city}, `} 
                                            {company?.state && `${company.state}, `}
                                            {company?.country && company.country}
                                            {company?.pincode && ` (${company.pincode})`}
                                        </p>
                                    </Col>
                                    <Col lg={6}>
                                        <p className='fw-bold mb-0' style={{ fontSize: '1.1rem' }}>User Information:</p>
                                        <div className='d-flex flex-direction-column'>
                                            <p className='fs-6 fw-bold'>{invoice?.other_name ?? company?.firstname + ' ' + company?.lastname}</p>
                                            <p className='fs-5 mb-0 fw-bold'>Email:</p>
                                            <p className='fs-6'>
                                                {company?.email}
                                            </p>
                                            <p className='fs-5 mb-0 fw-bold'>Contact:</p>
                                            <p className='fs-6'>
                                                {company?.whatsapp_number}
                                            </p>
                                        </div>
                                    </Col>
                                </Row>
                                <Row className="ms-5 mt-5">
                                    <Col lg={12}>
                                        <p className='fw-bold fs-4'>Transaction Details</p>
                                    </Col>
                                </Row>
                                <Row className="mx-5 mb-3">
                                    <Col lg={4}>
                                        <label className="fw-bold">Plans</label>
                                        <span>{invoice?.plan_name}</span>
                                    </Col>
                                    <Col lg={4}>
                                        <label className="fw-bold">Validity({invoice?.planname === 'Free Trail' ? 'in Days' : 'in Months'})</label>
                                        <span>{invoice?.validity}</span>
                                    </Col>
                                    <Col lg={4}>
                                        <label className="fw-bold">Transaction Date</label>
                                        <span>{invoice?.transaction_date ? moment(invoice?.transaction_date).format('DD-MM-YYYY'): '--'}</span>
                                    </Col>
                                </Row>
                                <Row className="mx-5 mb-3">
                                    <Col lg={4}>
                                        <label className="fw-bold">Valid From</label>
                                        <span>{moment(invoice?.start_date).format('DD-MM-YYYY')}</span>
                                    </Col>
                                    <Col lg={4}>
                                        <label className="fw-bold">Valid Till</label>
                                        <span>{moment(invoice?.end_date).format('DD-MM-YYYY')}</span>
                                    </Col>
                                    <Col lg={4}>
                                        <label className="fw-bold">Transaction Status</label>
                                        <span>{capitalizeFirstLetter(invoice?.status)}</span>
                                    </Col>
                                </Row>
                                <Row className="mx-5 mb-3">
                                    <Col lg={4}>
                                        <label className="fw-bold">Payment Method</label>
                                        <span>{invoice?.payment_method ? capitalizeFirstLetter(invoice?.payment_method) : '--'}</span>
                                    </Col>
                                    <Col lg={4}>
                                        <label className="fw-bold">Transaction/Cheque No.</label>
                                        <span>{(invoice?.transaction_cheque_no) ? invoice?.transaction_cheque_no : '--'}</span>
                                    </Col>
                                    <span className="mt-5" style={{ fontSize: '1.1rem' }}><font color={'red'}>*</font> Can maintain the data of <b>{invoice.number_of_whatsapp_setting}</b> Active Whatsapp Settings.</span>
                                </Row>
                                <Row className="mx-5 my-3 px-2 mb-5">
                                <Table hover className='invoiceTable'>
                                    <thead>
                                    <tr>
                                        <th style={{ width: '80%' }}>Product</th>
                                        <th>Amount</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    <tr>
                                        <td>{invoice.plan_name}</td>
                                        <td>{invoice.total_amount}</td>
                                    </tr>
                                    <tr>
                                        <td>{settings?.name || 'GST'}</td>
                                        <td>{settings?.value || '0'} %</td>
                                    </tr>
                                    <tr>
                                        <td className="text-end fw-bold">Total Amount:</td>
                                        {/* <td>{invoice.total_amount + ((parseInt(invoice?.total_amount) * parseInt(settings?.value)) / 100)}</td> */}
                                        <td>{invoice.total_amount}</td>
                                    </tr>
                                    </tbody>
                                </Table>
                                </Row>
                            </Col>
                       </Row>
                       </Col>
                    </Row>
                </Container>
                    <ToastContainer />
                </>)}

        </>
    )
}

export default InvoiceView;