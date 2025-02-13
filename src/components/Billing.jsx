import React, { useEffect, useRef, useState } from "react";
import { Button, Col, Form, Row, Table, Container, ListGroup, Card, OverlayTrigger, Popover } from "react-bootstrap";
import { ToastContainer, toast } from 'react-toastify';
import { useNavigate } from "react-router-dom";
import WhatsAppAPI from "../api/WhatsAppAPI";
import Badge from 'react-bootstrap/Badge';
import moment from "moment";
import moments from "moment-timezone"

import { DateRangePicker } from 'react-date-range';

const Billing = ({ selectedWhatsAppSetting }) => {
  const navigate = useNavigate();
  const [body, setBody] = useState([]);
  const [isSpinner, setIsSpinner] = useState(false);
  const [billBody, setBillBody] = useState([]);
  const predefinedPaidLabels = ["MARKETING", "UTILITY", "AUTHENTICATION", "AUTHENTICATION_INTERNATIONAL", "SERVICE"];
  const predefinedFreeLabels = ["FREE_TIER", "FREE_ENTRY_POINT"];

  const [dateRange, setDateRange] = useState([]);
  const [showCalendar, setShowCalendar] = useState(false);
  const calendarRef = useRef(null);

  useEffect(() => {
    setDateRange([
      {
        startDate: moment().startOf('month').format(),
        endDate: moment().endOf('month').format(),
        key: 'selection'
      }
    ]);
    let firstdate = moments().tz("Asia/Kolkata").startOf('month').unix();
    let lastdate = moments().tz("Asia/Kolkata").endOf('month').unix();
    init(firstdate, lastdate);
    setIsSpinner(false);
  }, [selectedWhatsAppSetting]);
  
  async function init(start='', end='') {
    const billData = await WhatsAppAPI.getBillingCostsBySetting(selectedWhatsAppSetting, start, end);
    // console.log(billData);
    if (billData.success) {
      setBody(billData);
      let body = fetchTableData(billData.result);
      setBillBody(body);
    } else {
      setBody([]);
      setBillBody(null);
      toast.error(billData.error);  
    }
    setIsSpinner(true);
  }

  const fetchTableData = (data) => {
    let categoryData = {
      all: Object.fromEntries(predefinedPaidLabels.map(label => [label, 0])),
      free: Object.fromEntries(predefinedFreeLabels.map(label => [label, 0])),
      paid: Object.fromEntries(predefinedPaidLabels.map(label => [label, 0])),
      charges: Object.fromEntries(predefinedPaidLabels.map(label => [label, 0]))
    };

    data.map(({ conversation, conversation_category, conversation_type, cost }) => {
      let typeKey = conversation_type === "FREE_TIER" ? "free" : "paid";

      // Count conversations in All Conversations
      categoryData.all[conversation_category] = (categoryData.all[conversation_category] || 0) + conversation;

      // Count conversations per category (free or paid)
      if(typeKey === 'free' && conversation_category === 'SERVICE'){
        categoryData[typeKey][conversation_type] = (categoryData[typeKey][conversation_type] || 0) + conversation;
      }else{
        categoryData[typeKey][conversation_category] = (categoryData[typeKey][conversation_category] || 0) + conversation;
      }

      // Sum costs in Approximate Charges
      categoryData.charges[conversation_category] = (categoryData.charges[conversation_category] || 0) + cost;
    });

    // console.log(categoryData);
    const totalConv = Object.values(categoryData.all).reduce((a, b) => a + b, 0);
    const totalFree = Object.values(categoryData.free).reduce((a, b) => a + b, 0);
    const totalPaid = Object.values(categoryData.paid).reduce((a, b) => a + b, 0);
    const totalCharges = Object.values(categoryData.charges).reduce((a, b) => a + b, 0);

    return [
      {
        title: "All conversations",
        value: totalConv,
        badgeBg: 'primary',
        helpText: "The number of conversations between your business and accounts on WhatsApp. A conversation includes all messages delivered within a 24-hour period. A conversation starts when the first business message is delivered and ends 24 hours later. The first message can be initiated by the business (marketing, utility or authentication) or a business reply within 24 hours of receiving a message from an account (service).",
        // items: Object.entries(categoryData.all).sort().map(([label, value]) => ({ label, value })),
        items: predefinedPaidLabels.map(label => ({ label: label.replaceAll("_", " - "), value: categoryData.all[label] })),
      },
      {
        title: "Free conversations",
        value: totalFree,
        badgeBg: 'danger',
        // items: Object.entries(categoryData.free).sort().map(([label, value]) => ({ label: label === 'SERVICE' ? "FREE TIER" : label, value })),
        items: predefinedFreeLabels.map(label => ({ label: label.replaceAll("_", " - "), value: categoryData.free[label] })),
      },
      {
        title: "Paid conversations",
        value: totalPaid,
        badgeBg: 'info',
        // items: Object.entries(categoryData.paid).sort().map(([label, value]) => ({ label, value })),
        items: predefinedPaidLabels.map(label => ({ label: label.replaceAll("_", " - "), value: categoryData.paid[label] })),
      },
      {
        title: "Approximate charges",
        value: `₹ ${totalCharges.toFixed(2)}`,
        badgeBg: 'success',
        // items: Object.entries(categoryData.charges).sort().map(([label, value]) => ({ label, value: `₹ ${value.toFixed(2)}` })),
        items: predefinedPaidLabels.map(label => ({ label: label.replaceAll("_", " - "), value: `₹ ${categoryData.charges[label].toFixed(2)}` })),
      },
    ]
  }

  const HelpTooltip = ({ helpText }) => (
    <OverlayTrigger
      placement="auto"
      overlay={
        <Popover id={`popover-positioned-auto`}>
        <Popover.Body>
        {helpText}
        </Popover.Body>
      </Popover>
      }
    >
      <i className="fa-solid fa-circle-info text-secondary" style={{ cursor: "pointer" }}></i>
    </OverlayTrigger>
  );
  // const data = [
  //   {
  //     title: "All conversations",
  //     value: 13,
  //     badgeBg: 'primary',
  //     items: [
  //       { label: "Marketing", value: 7 },
  //       { label: "Utility", value: 1 },
  //       { label: "Authentication", value: 1 },
  //       { label: "Authentication – international", value: 0 },
  //       { label: "Service", value: 4 },
  //     ],
  //   },
  //   {
  //     title: "Free conversations",
  //     value: 4,
  //     badgeBg: 'danger',
  //     items: [
  //       { label: "Free tier", value: 4 },
  //       { label: "Free entry point", value: 0 },
  //     ],
  //   },
  //   {
  //     title: "Paid conversations",
  //     value: 9,
  //     badgeBg: 'info',
  //     items: [
  //       { label: "Marketing", value: 7 },
  //       { label: "Utility", value: 1 },
  //       { label: "Authentication", value: 1 },
  //       { label: "Authentication – international", value: 0 },
  //       { label: "Service", value: 0 },
  //     ],
  //   },
  //   {
  //     title: "Approximate charges",
  //     value: "₹ 5.72",
  //     badgeBg: 'success',
  //     items: [
  //       { label: "Marketing", value: "₹ 5.49" },
  //       { label: "Utility", value: "₹ 0.12" },
  //       { label: "Authentication", value: "₹ 0.12" },
  //       { label: "Authentication – international", value: "₹ 0.00" },
  //       { label: "Service", value: "₹ 0.00" },
  //     ],
  //   },
  // ];

  const handleSelect = (ranges) => {
    setDateRange([ranges.selection]);
  };

  const selectDate = () => {
    setShowCalendar(false);
    let firstdate = moments(dateRange[0].startDate).tz("Asia/Kolkata").startOf('day').unix();
    let lastdate = moments(dateRange[0].endDate).tz("Asia/Kolkata").endOf('day').unix();
    init(firstdate, lastdate);
  }

  const closeCalendar = () =>{
    setShowCalendar(false);
  }

  return (
    <>
      <Container className='mt-5'>
        <Row className='g-0 mx-5 text-center '>
          <Col lg={12} xs={12} sm={12}>
            <div className=' text-center p-2' style={{ height: '40px', backgroundColor: '#ffffff', borderRadius: '5px' }}>
              <span className='fw-semibold p-1' style={{ color: '#605C68', fontSize: 'large' }}>
                Billing
              </span>
            </div>
          </Col>
        </Row>
      </Container>
      { isSpinner ? 
        <>
          {/* <Container className='mt-5'>
            <Row className='g-0 mx-5'>
              <Col lg={3} xs={12} sm={12}>
                <div className="relative">
                  <Form.Group className="d-flex align-items-center">
                    <Form.Label className="text-start text-nowrap me-3">Select Date:</Form.Label>
                    <Form.Control
                      type="text"
                      readOnly
                      className="border p-2 cursor-pointer form-control"
                      value={`${moment(dateRange[0].startDate).format("DD/MM/YYYY")} - ${moment(dateRange[0].endDate).format("DD/MM/YYYY")}`}
                      onClick={() => setShowCalendar(!showCalendar)}
                    />
                  </Form.Group>

                  {showCalendar && (
                    <div ref={calendarRef} className="mt-2 d-flex" style={{ position:'absolute', zIndex: '999' }}>
                      <Card bg="light">
                        <Card.Body>
                          <DateRangePicker
                            showSelectionPreview={true}
                            ranges={dateRange}
                            onChange={handleSelect}
                            direction="horizontal"
                            months={2}
                            moveRangeOnFirstSelection={false}
                          />
                        </Card.Body>
                        <Card.Footer className="text-end">
                          <Button className="me-2" onClick={closeCalendar} >Close</Button>
                          <Button onClick={selectDate}>Select Date</Button>
                        </Card.Footer>
                      </Card>
                    </div>
                  )}
                </div>
              </Col>
            </Row>
          </Container>
     */}
          <Container className="mt-5 mb-5">
            <Row className="g-4 mx-5" style={{ backgroundColor: '#eeeff0', padding: '5px 20px 20px', borderRadius: '8px' }}>
            <Col lg={8} xs={12} sm={12}>
                <div className="relative">
                  <Form.Group className="d-flex align-items-center">
                    <Form.Control
                      type="text"
                      readOnly
                      className="border p-2 cursor-pointer form-control"
                      value={`${moment(dateRange[0].startDate).format("DD/MM/YYYY")} - ${moment(dateRange[0].endDate).format("DD/MM/YYYY")}`}
                      onClick={() => setShowCalendar(!showCalendar)}
                    />
                  </Form.Group>

                  {showCalendar && (
                    <div ref={calendarRef} className="mt-2 d-flex" style={{ position:'absolute', zIndex: '1000' }}>
                      <Card bg="light">
                        <Card.Body>
                          <DateRangePicker
                            showSelectionPreview={true}
                            ranges={dateRange}
                            onChange={handleSelect}
                            direction="horizontal"
                            months={2}
                            moveRangeOnFirstSelection={false}
                          />
                        </Card.Body>
                        <Card.Footer className="text-end">
                          <Button className="me-2" onClick={closeCalendar} >Close</Button>
                          <Button onClick={selectDate}>Select Date</Button>
                        </Card.Footer>
                      </Card>
                    </div>
                  )}
                </div>
              </Col>
              {
                billBody ? 
                  billBody.map((card, index) => (
                    <Col key={index} md={6}>
                      <Card className="h-100 border-0 shadow-sm" style={{ borderRadius: '8px !important', border: '1px solid #dee2e6 !important' }}>
                        <Card.Header className="d-flex justify-content-between align-items-center bg-light" style={{ fontSize: "1.24rem" }}>
                          <span className="fw-bold text-secondary">{card.title} <HelpTooltip helpText={card.helpText} /></span>
                          <Badge bg={card.badgeBg} pill>
                            {card.value}
                          </Badge>
                        </Card.Header>
                        <ListGroup variant="flush">
                          {card.items.map((item, idx) => (
                            <ListGroup.Item
                              key={idx}
                              className="d-flex justify-content-between align-items-center"
                              style={{ fontSize: '0.9rem' }}
                            >
                              <span>{item.label}</span>
                              <span className="fw-bold">{item.value}</span>
                            </ListGroup.Item>
                          ))}
                        </ListGroup>
                      </Card>
                    </Col>
                  ))
                :
                <div className="text-center fs-5">No Billing Data Found</div>
              }
            </Row>
          </Container>
          <ToastContainer />
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
    </>
  );
};
export default Billing;