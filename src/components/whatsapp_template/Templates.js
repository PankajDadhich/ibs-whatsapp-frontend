/**
 * @author      Abdul Pathan
 * @date        Aug, 2024
 * @copyright   www.ibirdsservices.com
 */

import React, { useEffect, useState } from 'react'
import { Button, Col, Container, Row, Table, Form } from 'react-bootstrap'
import { ToastContainer, toast } from 'react-toastify';//npm i react-toastify --force
import 'react-toastify/dist/ReactToastify.css';
import WhatsAppAPI from '../../api/WhatsAppAPI';
import { DatatableWrapper, Filter, Pagination, PaginationOptions, TableBody, TableHeader } from 'react-bs-datatable';
import { useNavigate } from "react-router-dom";
import Confirm from '../Confirm';
import jwt_decode from "jwt-decode";
import helper from '../common/helper';
import * as constants from '../../constants/CONSTANT';

const Templates = ({selectedWhatsAppSetting}) => {
    const navigate = useNavigate();
    const [category, setCategory] = useState('');
    const [filteredData, setFilteredData] = useState([]);
    const [body, setBody] = useState([]);
    const [templateDelete, setTemplateDelete] = useState(false);
    const [rowData, setRowData] = useState();
    const [isSpinner, setIsSpinner] = useState(false);
    const [userInfo, setUserInfo] = useState({});
    const categories = ['AUTHENTICATION', 'UTILITY', 'MARKETING'];

    useEffect(() => {
        if (selectedWhatsAppSetting) {
          fetchAllTemplates(selectedWhatsAppSetting);
        }else{
            setIsSpinner(true)
        }

      }, [selectedWhatsAppSetting]); 
    
      const onFilterType = (event) => {
        const selectedCategory = event.target.value;
        setCategory(selectedCategory);

        // Apply filter based on category
        if (selectedCategory === "") {
            setFilteredData(body);  // If no category selected, show all data
        } else {
            setFilteredData(
                body.filter((data) => data.category.toLowerCase() === selectedCategory.toLowerCase())
            );
        }
    };

    
    const fetchAllTemplates = async (selectedWhatsAppSetting) => {
        let user = jwt_decode(sessionStorage.getItem('token'));
        setUserInfo(user);

        const result = await WhatsAppAPI.getAllTemplates(selectedWhatsAppSetting);

        if (result.error) {
            toast.error(result?.error?.message);
            setBody([]);
            setFilteredData([]);
            setIsSpinner(true)
        } else {
             if( result?.data && result){    
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

                    header_text: header.format === 'TEXT' ? header.text : '',
                    header_image_url: header.format === 'IMAGE' ? (header.example?.header_handle?.[0] || '') : '',
                    header_document_url: header.format === 'DOCUMENT' ? (header.example?.header_handle?.[0] || '') : '',
                    header_video_url: header.format === 'VIDEO' ? (header.example?.header_handle?.[0] || '') : '',

                    message_body: body.text || '',
                    example_body_text: body.example?.body_text || [],
                    footer: footer.text || '',

                    add_security_recommendation: body.add_security_recommendation || false,
                    code_expiration_minutes: footer.code_expiration_minutes || null,

                    // Button details extraction
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
                };
            });

            setBody(transformedData);
            setFilteredData(transformedData);
            setIsSpinner(true);
        }else{
            setBody([]);
            setFilteredData([]);
            setIsSpinner(true);
        }
        }
    }

    // Create table headers consisting of 4 columns.
    const labels = { beforeSelect: " " };
    const header = [
        { title: "name", prop: "templatename", isFilterable: true, },
        { title: "category", prop: "category", isFilterable: true },
        { title: "language", prop: "language", isFilterable: true },
        {
            title: 'Status',
            prop: 'status',
            isFilterable: true,
            cell: (row) => {
                return (
                    <>
                        {row.status === 'APPROVED' ?
                            (
                                <Button className="btn-sm" variant='' style={{ borderRadius: "15px", backgroundColor: 'rgb(154 235 233)', cursor: "default" }} >
                                    {row.status}
                                </Button>
                            ) :
                            row.status === 'PENDING' ?
                                (
                                    <Button className="btn-sm" variant='' style={{ borderRadius: "15px", backgroundColor: 'rgb(241 218 177)', cursor: "default" }} >
                                        {row.status}
                                    </Button>
                                ) :
                                row.status === 'REJECTED' ? (
                                    <Button className="btn-sm" variant='' style={{ borderRadius: "15px", backgroundColor: 'rgb(248 195 200)', cursor: "default" }} >
                                        {row.status}
                                    </Button>
                                ) :
                                    null
                        }
                    </>
                );
            },
        },
        {
            title: "Actions",
            prop: "id",
            cell: (row) => (
                <>
                    {row.status === 'APPROVED' && (
                        <Button
                            className="btn-sm mx-2"
                            onClick={() => editTemplate({ row })}
                            title="Edit"
                        >
                            <i className="fa-solid fa-pen-to-square"></i>
                        </Button>
                    )}
                    <Button
                        className="btn-sm mx-2"
                        variant="danger"
                        onClick={() => removeSelectedRow({ row })}
                        title="Delete"
                    >
                        <i className="fa-regular fa-trash-can"></i>
                    </Button>
                </>
            ),
        },

    ].filter(Boolean);;


    // add new tempate
    const addNewTemplate = () => {
        navigate(`/whatsapp_template/add`);
    }

    const editTemplate = (data) => {
        navigate(`/whatsapp_template/add`, { state: data.row });
    }

    // delete template 
    const removeSelectedRow = (data) => {
        setTemplateDelete(true);

        setRowData(data.row);
    }
    const deleteTemplate = async () => {
        if (rowData.id && rowData.name) {
            const result = await WhatsAppAPI.deleteTemplateRecord(rowData.id, rowData.name,selectedWhatsAppSetting);
            if (result.success) {
                setTemplateDelete(false);
                toast.success('Template deleted successfully.');
                fetchAllTemplates(selectedWhatsAppSetting);
            } else {
                setTemplateDelete(false);
                toast.error(result.error.message);
            }
        }
    }

    return (
        <>
            <Container className='mt-5'>
                <Row className='mx-5 text-center g-0'>
                    <Col lg={12} xs={12} sm={12}>
                        <div className=' text-center p-2' style={{ height: '40px', backgroundColor: '#ffffff', borderRadius: '5px' }}>
                            <span className='fw-semibold' style={{ color: '#605C68', fontSize: 'large' }}>
                                Webhook Templates
                            </span>
                        </div>
                    </Col>
                </Row>
            </Container>

            {isSpinner ?

                <>
                    <Container className='mb-5'>
                        <Row className='mx-5 g-0'>
                            <Col lg={12} sm={12} xs={12} className="mb-3">
                                <Row className="g-0">
                                    <Col lg={12} sm={12} xs={12} >
                                        <DatatableWrapper
                                            body={filteredData}
                                            headers={header}
                                            paginationOptionsProps={{ initialState: { rowsPerPage: 10, options: [5, 10, 15, 20], } }}
                                        >
                                            <Row className="mb-2">
                                                <Col lg={4} sm={10} xs={10} className="d-flex flex-col justify-content-end align-items-end" >
                                                    <Filter />
                                                </Col>
                                                <Col lg={4} sm={2} xs={2} className="d-flex flex-col justify-content-start align-items-start" >
                                                    <PaginationOptions labels={labels} />
                                                    <Form.Group className="mx-3 mt-4" controlId="formBasicCategory">
                                                        <Form.Select
                                                            aria-label="Select Category"
                                                            name="category"
                                                            onChange={onFilterType}
                                                            value={category}
                                                        >
                                                            <option value="">--Select Category--</option>
                                                            {categories.map((cat, index) => (
                                                                <option key={index} value={cat}>
                                                                    {cat}
                                                                </option>
                                                            ))}
                                                        </Form.Select>
                                                    </Form.Group>
                                                </Col>
                                                { selectedWhatsAppSetting &&
                                                    <Col lg={4} sm={12} xs={12} className="mt-2 d-flex flex-col justify-content-end align-items-end"  >
                                                        <Button className="btn btn-sm" variant="outline-secondary" onClick={() => addNewTemplate()}>
                                                            Add New Template
                                                        </Button>
                                                    </Col>
                                                }
                                            </Row>
                                            <Table striped className="data-table" responsive="sm">
                                                <TableHeader />
                                                <TableBody />
                                            </Table>
                                            <Pagination />
                                            

                                        </DatatableWrapper>
                                    </Col>
                                </Row>
                            </Col>
                        </Row>
                    </Container>

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

            {templateDelete && (
                <Confirm
                    show={templateDelete}
                    onHide={() => setTemplateDelete(false)}
                    deleteTemplate={deleteTemplate}
                    title="Confirm Delete"
                    message="You are going to delete the record. Are you sure?"
                    table="template"
                />
            )}

            <ToastContainer />
        </>
    )
}

export default Templates
