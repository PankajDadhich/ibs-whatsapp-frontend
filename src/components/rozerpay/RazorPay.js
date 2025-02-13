import React from 'react';
import { Button, Col, Container, Row } from 'react-bootstrap'
import WhatsAppAPI from '../../api/WhatsAppAPI';

const RazorPay = () => {


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


    async function onlinePayment() {
        const res = await loadScript("https://checkout.razorpay.com/v1/checkout.js");

        if (!res) {
            alert("Razropay failed to load!!");
            return;
        }

        const obj = { amount: 2 }
        const data = await WhatsAppAPI.getRazorPayData(obj);

        const options = {
            key: "rzp_test_dgYSDQuilJnxen",
            amount: data.amount,
            currency: "INR",
            name: "Acme Corp",
            description: "Test Transaction",
            image: "https://example.com/your_logo",
            order_id: data.id,
            //callback_url: "http://localhost:1769/verify",
            notes: {
                address: "Razorpay Corporate Office",
            },
            theme: {
                color: "#3399cc",
            },
        };

        const paymentObject = new window.Razorpay(options);
        paymentObject.open();
    }


    return (
        <>
            <Container className='mt-5'>
                <Row className='mx-5 text-center g-0'>
                    <Col lg={12} xs={12} sm={12}>
                        <div className=' text-center p-2' style={{ height: '40px', backgroundColor: '#ffffff', borderRadius: '5px' }}>
                            <span className='fw-semibold p-1' style={{ color: '#605C68', fontSize: 'large' }}>
                                Razor Pay
                            </span>
                        </div>
                    </Col>
                </Row>
            </Container>


            <Container className='mt-3'>
                <Row className='mx-5 text-center g-0'>
                    <Col lg={12} xs={12} sm={12}>
                        <Button className="btn" variant="outline-primary mx-2" onClick={() => onlinePayment()} >
                            Online Payment
                        </Button>
                    </Col>
                </Row>
            </Container>
        </>
    )
}

export default RazorPay
