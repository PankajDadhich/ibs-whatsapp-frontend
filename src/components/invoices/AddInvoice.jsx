/**
 * @author: Shivani mehra
 */
import React, { useState, useEffect, useCallback } from 'react'
import { Col, Container, Row, Button, Form, Card } from "react-bootstrap";
import { useLocation, Link, useNavigate } from "react-router-dom";
import WhatsAppAPI from "../../api/WhatsAppAPI";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import moment from 'moment';

const AddInvoice = (props) => {
    const navigate = useNavigate();
    const location = useLocation();
    const [isFormValid, setIsFormValid] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [plans, setPlans] = useState([]);
    const [planById, setPlanById] = useState({});
    const [company, setCompany] = useState({});
    const [selectOption, setSelectOption] = useState({
        user: '',
        amount: '',
    });

    const [radioError, setRadioError] = useState({
        user: '',
        amount: ''
    });

    const [invoice, setInvoice] = useState({
        company_id: '',
        tenantcode: '',
        user_id: '',
        plan_id: '',
        plan_name: '',
        subscription_id: '',
        amount: '',
        validity: '',
        date: '',
        payment_method: '',
        new_name: '',
        transaction_cheque_no: '',
        order_id: ''
    });

    const [isPaymentProcessing, setIsPaymentProcessing] = useState(false);

    // var previousMonthStudentAddmissionCount = 0;
    useEffect(() => {
        var id;
        if (location.hasOwnProperty("pathname")) {
            id = location.pathname.split("/")[3];
        }
        init(id, props?.action);
    }, []);

    useEffect(() => {
    //    console.log('Updated invoice:', invoice);
    }, [invoice]);
    

    const init = async (id, action) => {
    //    console.log("id, action",id, action)
        if (action === 'pay') {
            const response = await WhatsAppAPI.fetchCompanyAndUserByInvoice(id);
            setCompany(response[0].company);
            setInvoice(response[0].invoice);
        //    console.log('response[0].invoice',response);
        //    console.log('invoice',invoice);
            if (response[0].invoice.amount) {
                setSelectOption((prev) => ({ ...prev, amount: true }));
            }
            setSelectOption((prev) => ({ ...prev, user: true })); 
            setRadioError((prev) => ({ ...prev, user: '' }));
            document.getElementById('user').checked = true; 
            
            setInvoice((prev) => ({ ...prev, user_id: response[0].company.user_id }));
    
    
    
            if (response[0].invoice.plan_id) {
            //    console.log('invoice.plan_id',response[0].invoice.plan_id)
                const plan = await WhatsAppAPI.getPlansById(response[0].invoice.plan_id);
                if (plan) {

                    setPlanById(plan);
                }
            }
        } else {
            const response = await WhatsAppAPI.findCompanyWithUser(id);
        //    console.log('response',response)
            if (response) {
                setCompany(response.companyResult[0]);
                setSelectOption((prev) => ({ ...prev, user: true })); 
                setRadioError((prev) => ({ ...prev, user: '' }));
                document.getElementById('user').checked = true; 
                
                setInvoice((prev) => ({ ...prev, user_id: response.companyResult[0].user_id }));
        
        
            } else {
                setCompany({})
            }
        }
        const plansResult = await WhatsAppAPI.getPlanData('active');
    //    console.log('plansResult',plansResult)
        if (plansResult.success) {
            setPlans(plansResult.records);
        } else {
            setPlans([]);
        }
    }

    const fetchPlanById = async (id) => {
    //    console.log("id",id)
        if (id) {
            const record = await WhatsAppAPI.getPlansById(id);
        //    console.log('recordrecord',record);
        //    console.log('recordrecord invoiceinvoice',invoice);
            if (record) {
                setPlanById(record);
            //    console.log("invoice", invoice)
                setInvoice({ ...invoice, plan_id: id });
                let amt = document.querySelectorAll('#amount');
                amt[0].checked = false;
                amt[1].checked = false;
            }
        }
    }

    // useEffect(() => {
    // //    console.log("invoice.plan_id",invoice)
    //     fetchPlanById(invoice.plan_id);
    // }, [invoice.plan_id]);

   

    // console.log('Invoice', invoice);
    // console.log('Company', company);

    //handle change
    const handleChange = async (e) => {
        if (e.target.name === 'user') {
        //    console.log('User', e.target.value);
            let anotherName = document.getElementById('another-name');
            if (e.target.value === 'new_user_name') {
                anotherName.removeAttribute('disabled');
                setInvoice({ ...invoice, [e.target.name]: e.target.value });
            } else {
                anotherName.setAttribute('disabled', true);
                setInvoice({ ...invoice, user_id: company.user_id });
            }
            setRadioError({ ...radioError, user: '' });
            setInvoice({ ...invoice, user_id: company.user_id });
            setSelectOption({ ...selectOption, user: true });
        }
        else if (e.target.name === 'amount') {
            setSelectOption({ ...selectOption, amount: true });
            setRadioError({ ...radioError, amount: '' });
            setInvoice({ ...invoice, [e.target.name]: e.target.value, validity: e.target.getAttribute('data-validity') });
        } else if (e.target.name === 'plan') {
            const planid = e.target.value;
            let planname= e.target[e.target.selectedIndex].getAttribute('data-planname');
            if (planid) {
            //    console.log("invoiceinvoice",invoice)
                setInvoice({ ...invoice, plan_name: planname});
                fetchPlanById(planid);
                if (planname.toLowerCase() === 'free') {
                    // console.log(e.target.value);
                    document.getElementById('payment_method').removeAttribute('required');
                    setSelectOption({ ...selectOption, amount: true });
                } else {
                    document.getElementById('payment_method').setAttribute('required', true);
                }
            } else {
                setPlanById({});
            }
        }
        else {
            setInvoice({ ...invoice, [e.target.name]: e.target.value });
            if (e.target.name === 'payment_method') {

                if ( e.target.value === 'cheque') {
                    document.getElementById('tr_cq_div').style.display = 'block';
                    document.getElementById('transaction_cheque_no').setAttribute('required', true);
                } else {
                    document.getElementById('tr_cq_div').style.display = 'none';
                    document.getElementById('transaction_cheque_no').removeAttribute('required');
                    setInvoice({ ...invoice, transaction_cheque_no: '', payment_method: e.target.value});
                }
            }
            
        }
        validateForm();
    };
    

    // console.log(invoice);

    const handleSubmit = async (updatedInvoice) => {
        // e.preventDefault();
        if (!validateForm()) {
            return false;
        }
        setIsLoading(true);
    //    console.log("company",company)

        updatedInvoice.company_id = company.company_id;
        updatedInvoice.tenantcode = company.tenantcode;
    //    console.log('Invoice: updatedInvoice', updatedInvoice);
        updatedInvoice.company = company;
        if (updatedInvoice?.id) {
            const response = await WhatsAppAPI.updateInvoiceAddTransaction(updatedInvoice);
            if (response.success) {
                setIsLoading(false);
                toast.success("Invoice Updated Successfully!");
                toast.success("Transaction Created Successfully!");
                navigate('/company/' + company.company_id);
            } else {
                setIsLoading(false);
                toast.error(response.message);
            }
        } else {
            const response = await WhatsAppAPI.addInvoiceWithTransaction(updatedInvoice);
            if (response.success) {
                setIsLoading(false);
                toast.success("Invoice Created Successfully!");
                navigate('/company/' + company.company_id);
            } else {
                setIsLoading(false);
                toast.error(response.message);
            }
        }
    }

    const validateForm = () => {
        let isValid = true;
        const validateInputs = document.querySelectorAll('input, select');
        validateInputs.forEach((validateInput) => {
            validateInput.classList.remove('warning');
            validateInput.classList.remove('error');
            if (validateInput.hasAttribute('required')) {
                if (validateInput.value.trim().length === 0) {
                    isValid = false;
                    validateInput.classList.add('warning');
                    validateInput.classList.add('error');
                }
            }
        });

        if (!selectOption.user) {
            // console.log('User');
            isValid = false;
            setRadioError(prev => ({ ...prev, user: 'Please select an option.' }));
        }

        if (!selectOption.amount) {
            // console.log('Amount');
            isValid = false;
            setRadioError(prev => ({ ...prev, amount: 'Please select an option.' }));
        }

        setIsFormValid(isValid);

        return isValid;
    };

    function loadScript(src) {
        return new Promise((resolve) => {
            const script = document.createElement("script");
            script.src = src;
            script.onload = () => {
                resolve(true);
            };
            script.onerror = () => {
                resolve(false);
            };
            document.body.appendChild(script);
        });
    }

    const onlinePayment = useCallback( async () => {
        
        if (!validateForm()) {
            return false;
        }

        const res = await loadScript("https://checkout.razorpay.com/v1/checkout.js");

        if (!res) {
            alert("Razropay failed to load!!");
            return;
        }

        const obj = { amount: invoice.amount }
        const data = await WhatsAppAPI.getRazorPayData(obj);
    //    console.log('OP Result: ', data);
        const options = {
            key: "rzp_test_dgYSDQuilJnxen",
            amount: invoice.amount * 100,
            currency: "INR",
            name: "Acme Corp",
            description: "Test Transaction",
            image: "https://example.com/your_logo",
            order_id: data.records.id,
            //callback_url: "http://localhost:1769/verify",
            notes: {
                address: "Razorpay Corporate Office",
            },
            theme: {
                color: "#3399cc",
            },
            handler: async (response) => {
            //    console.log('OP Response: ', response, data);
                try {
                    // const paymentData = {
                    //   order_id: response.order_id,
                    //   payment_id: response.razorpay_payment_id,
                    //   signature: response.razorpay_signature,
                    //   student_addmission_id: studentRecord?.student_addmission_id,
                    //   amount: data.amount,
                    //   payment_date: new Date(),
                    //   payment_method: "Online (Razorpay)",
                    //   transaction_no: response.razorpay_payment_id,
                    //   status: "Success",
                    // };

                    if (response.razorpay_payment_id) {
                        //   feeDeposit.payment_method = "razorpay";
                        //   feeDeposit.transaction_no = response.razorpay_payment_id;
                        const updatedInvoice = {
                            ...invoice,
                            payment_method: "Online (Razorpay)",
                            transaction_cheque_no: response.razorpay_payment_id,
                            order_id: response.razorpay_order_id,
                            signature: response.razorpay_signature,
                        };

                        setInvoice(updatedInvoice);
                        await handleSubmit(updatedInvoice);
                    } else {
                        toast.error("payment not acctepable");
                    }
                } catch (error) {
                    toast.error("Something went wrong while saving payment.");
                }
            },
            prefill: {
              name: company?.firstname+" "+company?.lastname,
              email: company?.email,
              contact: company?.whatsapp_number,
            },
            modal: {
                ondismiss: function () {},
            },
        };

        const paymentObject = new window.Razorpay(options);
        paymentObject.open();
    }, [isPaymentProcessing, invoice]);

    // async function onlinePayment() {
    //     const res = await loadScript("https://checkout.razorpay.com/v1/checkout.js");

    //     if (!res) {
    //         alert("Razropay failed to load!!");
    //         return;
    //     }

    //     const obj = { amount: 2 }
    //     const data = await WhatsAppAPI.getRazorPayData(obj);
    // //    console.log('OP Result: ', data);
    //     const options = {
    //         key: "rzp_test_dgYSDQuilJnxen",
    //         amount: data.amount,
    //         currency: "INR",
    //         name: "Acme Corp",
    //         description: "Test Transaction",
    //         image: "https://example.com/your_logo",
    //         order_id: data.id,
    //         //callback_url: "http://localhost:1769/verify",
    //         notes: {
    //             address: "Razorpay Corporate Office",
    //         },
    //         theme: {
    //             color: "#3399cc",
    //         },
    //         handler: async function (response) {
    //         //    console.log('OP Response: ', response);
    //           try {
    //             const paymentData = {
    //               order_id: response.order_id,
    //               payment_id: response.razorpay_payment_id,
    //               signature: response.razorpay_signature,
    //             //   student_addmission_id: studentRecord?.student_addmission_id,
    //               amount: data.amount,
    //               payment_date: new Date(),
    //               payment_method: "Online (Razorpay)",
    //               transaction_no: response.razorpay_payment_id,
    //               status: "Success",
    //             };
    //             if (response.razorpay_payment_id) {
    //             //   feeDeposit.payment_method = "razorpay";
    //             //   feeDeposit.transaction_no = response.razorpay_payment_id;
    //                 // handleSubmit();
    //             } else {
    //               toast.error("payment not acctepable");
    //             }
    //           } catch (error) {
    //             toast.error("Something went wrong while saving payment.");
    //           }
    //         },
    //         prefill: {
    //           name: "Abhishek Sharma",
    //           email: "abhishek.sharma@ibirdsservices.com",
    //           contact: "9876543210",
    //         },
    //         modal: {
    //           ondismiss: function () {
  
    //           },
    //         },
    //     };

    //     const paymentObject = new window.Razorpay(options);
    //     paymentObject.on('payment.failed', function (response){
    //         alert(response.error.code);
    //         alert(response.error.description);
    //         alert(response.error.source);
    //         alert(response.error.step);
    //         alert(response.error.reason);
    //         alert(response.error.metadata.order_id);
    //         alert(response.error.metadata.payment_id);
    //     });
    //     paymentObject.open();
    // }

    return (
        <>
          

            <Container className='mt-5'>
                <Row className='mx-5 text-center g-0'>
                    <Col lg={12} xs={12} sm={12}>
                        <div className=' text-center p-2' style={{ height: '40px', backgroundColor: '#ffffff', borderRadius: '5px' }}>
                            <span className='fw-semibold p-1' style={{ color: '#605C68', fontSize: 'large' }}>
                            Generate Invoice
                            </span>
                        </div>
                    </Col>
                </Row>
            </Container>
        { isLoading ?   
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
          </div> : 
          <>
            <Container className='mt-1 mb-5'>
            <Row className="view-form mb-4 g-0 mx-5">
                <Card>
                    <Col lg={12}>
                        <Form noValidate >
                            <Row className="pb-4 mx-5 mt-5 border-bottom">
                                <Col lg={6} className="">
                                    <p className='fs-5 fw-bold'>Company Information:</p>
                                    <p className='fs-4 fw-bold'>{company?.company_name}</p>
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
                                    <p className='fs-5 fw-bold'>User Information:</p>
                                    <div className='d-flex flex-direction-column'>
                                        <div className='d-flex align-items-baseline'>
                                            <input type='radio' id="user" name='user' value="old_user" style={{ marginRight: '15px' }} onChange={handleChange} />
                                            <div>
                                                <p className='fs-5 fw-bold'>{company?.firstname} {company?.lastname}</p>
                                                <p className='fs-5 mb-0 fw-bold'>Email:</p>
                                                <p className='fs-6'>
                                                    {company?.email}
                                                </p>
                                                <p className='fs-5 mb-0 fw-bold'>Contact:</p>
                                                <p className='fs-6'>
                                                    {company?.whatsapp_number}
                                                </p>
                                            </div>
                                        </div>
                                        <div className='d-flex align-items-baseline mt-2'>
                                            <input type='radio' id="user" name='user' value="new_user_name" style={{ marginRight: '15px' }} onChange={handleChange} />
                                            <Form.Control type='text' id={'another-name'} placeholder='Another Users Name' name={'new_name'} style={{ width: '250px' }} onChange={handleChange} disabled />
                                        </div>
                                    </div>
                                    {radioError.user && <p className='fw-bold fs-6 mt-3' style={{ color: 'red' }}>{radioError.user}</p>}
                                </Col>
                            </Row>
                            <Row className="pb-4 mx-5 mt-5">
                                <Col lg={12}>
                                    {invoice?.id ? <p className='fw-bold fs-5'>Invoice Number: {invoice.invoice_no}</p> : ''}
                                </Col>
                                <Col lg={4}>
                                    <Form.Group>
                                        <Form.Label className="form-view-label fw-bold fs-6" htmlFor="plans">Plans</Form.Label>
                                        <Form.Select required id="plans" name='plan' value={invoice?.plan_id} style={{ width: '75%' }} onChange={handleChange}>
                                            <option value='' data-planname=''  data-nos='' data-pps=''>Select Plan</option>
                                            {
                                                plans?.map((val, index) => (
                                                    <option value={val.plan_info.id} key={index} data-planname={val.plan_info.name}>{val.plan_info.name}</option>
                                                ))
                                            }
                                        </Form.Select>
                                       
                                    </Form.Group>
                                </Col>
                                <Col lg={4}>
                                <p className='fs-6 fw-bold border-0 mt-3'>Number of Users: {planById?.number_of_users ?? '0'}</p>       
                                <p className='fs-6 fw-bold border-0 mt-2'>Number of Whatsapp Setting: {planById?.number_of_whatsapp_setting ?? '0'}</p>  
                                </Col>
                                <Col lg={4}>
                                    <Form.Group className="my-3">
                                        <Form.Label className="form-view-label fw-bold fs-6" htmlFor="formBasicFirstName">Invoice Date</Form.Label>
                                        <Form.Control required type="date" name="date" onChange={handleChange} style={{ width: '75%' }} value={invoice?.date ? moment(invoice?.date).format('YYYY-MM-DD') : ""} disabled={invoice?.id ? true : false} />
                                    </Form.Group>
                                </Col>
                                <Col lg={12}>
                                {planById?.modules?.length > 0 && (
                                            <div className="my-3">
                                                <strong className="mt-4 mb-2">Modules</strong>
                                                <Row className="mt-2">
                                                {planById.modules.map((module, index) => (
                                                    <Col md={4} key={module.id}>
                                                    <i className="fa fa-tasks mx-2"></i>{module.name}
                                                    </Col>
                                                ))}
                                                </Row>
                                            </div>
                                            )}

                                </Col>
                               
                               
                                <Col lg={4}>
                                <strong className="mt-5 mb-2">Price</strong>
                                    <div className='mt-1 d-flex flex-direction-column'>
                                        <div className='d-flex flex-direction-row mb-3'><input type='radio' id="amount" name='amount' data-validity='1' style={{ marginRight: '10px' }} value={planById?.pricepermonth} onChange={handleChange} checked={invoice?.amount && Math.floor(invoice?.amount) === planById?.pricepermonth ? true : false} /> <span className='border-0'>{planById?.pricepermonth ?? '--'} per Month</span></div>
                                        <div className='d-flex flex-direction-row '><input type='radio' id="amount" name='amount' data-validity='12' style={{ marginRight: '10px' }} value={planById?.priceperyear} onChange={handleChange} checked={invoice?.amount && Math.floor(invoice?.amount) === planById?.priceperyear ? true : false} /> <span className='border-0'>{planById?.priceperyear ?? '--'} per Year</span></div>
                                    </div>
                                    {radioError.amount && <p className='fw-bold fs-6 mt-3' style={{ color: 'red' }}>{radioError.amount}</p>}
                                </Col>
                               
                                <Col lg={4}>
                                    <Form.Group>
                                        <Form.Label className="form-view-label fw-bold fs-6" htmlFor="payment_method">Payment Mode</Form.Label>
                                        <Form.Select required id="payment_method" name='payment_method' style={{ width: '75%' }} value={invoice?.payment_method} onChange={handleChange}>
                                            <option value=''>None</option>
                                            <option value='cash'>Cash</option>
                                            <option value='upi'>UPI</option>
                                            <option value='cheque'>Cheque</option>
                                        </Form.Select>
                                    </Form.Group>
                                </Col>
                                <Col lg={4} id="tr_cq_div" style={{ display: 'none' }}>
                                    <Form.Group>
                                        <Form.Label className="form-view-label fw-bold fs-6" htmlFor="transaction_cheque_no">Transaction No./Cheque No.</Form.Label>
                                        <Form.Control id="transaction_cheque_no" type="text" name="transaction_cheque_no" onChange={handleChange} value={invoice?.transaction_cheque_no !== '' ? invoice?.transaction_cheque_no : ''} style={{ width: '75%' }} />
                                    </Form.Group>
                                </Col>
                            </Row>
                            <Row className="pb-4 mx-5 mt-3 justify-content-end">
                                <Col lg={3} className='text-end'>
                                <Button variant='light' className='me-3' onClick={() => navigate('/company/' + company.company_id)}>Cancel</Button>
                                    {/* <Button variant='primary' onClick={onlinePayment} disabled={!isFormValid}>Procced</Button> */}
                                    <Button variant='primary' 
                                        onClick={() => {
                                            if (invoice?.payment_method === 'upi' ) {
                                                onlinePayment();
                                            } else if (invoice?.payment_method === 'cash'|| invoice?.payment_method === 'cheque') {
                                                handleSubmit(invoice);
                                
                                            } else {
                                                console.error('Invalid payment method selected');
                                            }
                                        }} 
                                        disabled={!isFormValid || isLoading}
                                    > Proceed </Button>
                                </Col>
                            </Row>
                        </Form>
                    </Col>
                </Card>
            </Row>
            </Container>
            </>
            } 
          
            
            <ToastContainer />
        </>
    )
}

export default AddInvoice;
