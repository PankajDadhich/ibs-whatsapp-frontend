import React, { useState, useEffect } from 'react'
import { Card, Col, Container, Row } from 'react-bootstrap';
import PieChart from './charts/PieChart';
import DoughnutChart from './charts/DoughnutChart';
import WhatsAppAPI from '../api/WhatsAppAPI';
import { Link } from 'react-router-dom';
import moments from "moment-timezone";

const Home = ({selectedWhatsAppSetting, userInfo}) => {
  const [companyCount, setCompanyCount] = useState(0);
  const [moduleCount, setModuleCount] = useState(0);
  const [planCount, setPlanCount] = useState(0);
  const [invoiceCount, setInvoiceCount] = useState(0);
  const [leadCount, setLeadCount] = useState(0);
  const [campaignCount, setCampaignCount] = useState(0);
  // const [templateCount, setTemplateCount] = useState(0);
  const [billingCost, setBillingCost] = useState(0);
  const [autoResponseCount, setAutoResponseCount] = useState(0);
  useEffect(() => {
    async function init() {
      let companyCount = 0;
      let moduleCount = 0;
      let planCount = 0;
      let invoiceCount = 0;
      let leadCount = 0;
      let campaignCount = 0;
      // let templateCount = 0;
      let billingCost = 0;
      let autoResponseCount = 0;

      let firstdate = moments().tz("Asia/Kolkata").startOf('month').unix();
      let lastdate = moments().tz("Asia/Kolkata").endOf('month').unix();
  
      try {
        if (userInfo.userrole === "SYS_ADMIN") {
          const [companies, modules, plans, invoices] = await Promise.all([
            WhatsAppAPI.fetchCompany(true),
            WhatsAppAPI.getModuleData("active"),
            WhatsAppAPI.getPlanData("active"),
            WhatsAppAPI.getInvoicesRecord("Pending"),
          ]);
  
          companyCount = companies.length || 0;
          moduleCount = modules.records?.length || 0;
          planCount = plans.records?.length || 0;
          invoiceCount = invoices.length || 0;
        } else {
          // const [leads, campaigns, templates, autoResponses] = await Promise.all([
          //   WhatsAppAPI.fetchLeadCount(),
          //   WhatsAppAPI.fetchCampaignStatusCounts(selectedWhatsAppSetting),
          //   WhatsAppAPI.getApprovedTemplates(selectedWhatsAppSetting),
          //   WhatsAppAPI.fetchAutoResponseCount(),
          // ]);
          // const [leads, campaigns, autoResponses, billingCosts] = await Promise.all([
          //   WhatsAppAPI.fetchLeadCount(),
          //   WhatsAppAPI.fetchCampaignStatusCounts(selectedWhatsAppSetting),
          //   WhatsAppAPI.fetchAutoResponseCount(),
          //   WhatsAppAPI.getBillingCostsBySetting(selectedWhatsAppSetting, firstdate, lastdate),
          // ]);

          const requests = [
            WhatsAppAPI.fetchLeadCount(),
            WhatsAppAPI.fetchCampaignStatusCounts(selectedWhatsAppSetting),
            WhatsAppAPI.fetchAutoResponseCount(),
        ];

        if (selectedWhatsAppSetting) {
            requests.push(
                WhatsAppAPI.getBillingCostsBySetting(selectedWhatsAppSetting, firstdate, lastdate)
            );
        }

        const [leads, campaigns, autoResponses, billingCosts] = await Promise.all(requests);

  
          leadCount = leads.total || 0;
          campaignCount = campaigns.result?.Pending || 0;
          // templateCount = templates?.data?.length || 0;
          autoResponseCount = autoResponses.total || 0;
          if (billingCosts) {
            billingCosts?.result?.forEach((data) => (billingCost += data.cost || 0));
        }


          // billingCosts?.result?.map((data)=> billingCost += data.cost || 0);
          console.log("billingCosts",billingCosts);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
  
      // Update state in a single batch to optimize re-renders
      setCompanyCount(companyCount);
      setModuleCount(moduleCount);
      setPlanCount(planCount);
      setInvoiceCount(invoiceCount);
      setLeadCount(leadCount);
      setCampaignCount(campaignCount);
      // setTemplateCount(templateCount);
      setBillingCost(billingCost);
      setAutoResponseCount(autoResponseCount);
    }
  
    init();
  }, [selectedWhatsAppSetting, userInfo.userrole]);
  
  return (
    <>
      <Container className='mt-5'>
        <Row className='mx-5 text-center g-0'>
          <Col lg={12} xs={12} sm={12}>
            <div className=' text-center p-2' style={{ height: '40px', backgroundColor: '#ffffff', borderRadius: '5px' }}>
              <span className='fw-semibold p-1' style={{ color: '#605C68', fontSize: 'large' }}>
                Dashboard
              </span>
            </div>
          </Col>
        </Row>
      </Container>


{userInfo.userrole === 'SYS_ADMIN' ?  
 <Container>
        <Row className='mx-5 text-center g-0'>
          <Col lg={12} xs={12} sm={12}>
            <Row>
            <Col lg={3} sm={6} xs={12}>
                <Link to="/company" className='text-decoration-none text-reset'>
                  <div className="p-3 d-flex align-items-center my-3 rounded-1" style={{ backgroundColor: 'white', borderLeft: '4px solid #00ad5b' }}>
                    <span className="fa-stack fa-2x">
                      <i className="fa-solid fa-circle fa-stack-2x" style={{ color: '#00ad5b' }}></i>
                      <i className="fa-solid fa-building fa-stack-1x" style={{ color: 'white', fontSize: '2rem' }}></i>
                    </span>
                    <div className="flex-grow-1 text-start ms-2">
                      <h6 className="text-muted mb-1">Company</h6>
                      <h1 className='mb-0 d-inline '>{companyCount}</h1>
                    </div>
                  </div>
                </Link>
              </Col>
              <Col lg={3} sm={6} xs={12}>
                <Link to="/plan" className='text-decoration-none text-reset'>
                  <div className="p-3 d-flex align-items-center my-3 rounded-1" style={{ backgroundColor: 'white', borderLeft: '4px solid #d3761f' }}>
                    <span className="fa-stack fa-2x">
                      <i className="fa-solid fa-circle fa-stack-2x" style={{ color: '#d3761f' }}></i>
                      <i className="fa-solid fa-money-check fa-stack-1x" style={{ color: 'white', fontSize: '2rem' }}></i>
                    </span>
                    <div className="flex-grow-1 text-start ms-2">
                      <h6 className="text-muted mb-1">Plans</h6>
                      <h1 className='mb-0 d-inline text-center'>{planCount}</h1>
                    </div>
                  </div>
                </Link>
              </Col>
              <Col lg={3} sm={6} xs={12}>
                <Link to="/module" className='text-decoration-none text-reset'>
                  <div className="p-3 d-flex align-items-center my-3 rounded-1" style={{ backgroundColor: 'white', borderLeft: '4px solid #239dd1' }}>
                    <span className="fa-stack fa-2x">
                      <i className="fa-solid fa-circle fa-stack-2x" style={{ color: '#239dd1' }}></i>
                      <i className="fa-solid fa-bars fa-stack-1x" style={{ color: 'white', fontSize: '2rem' }}></i>
                    </span>
                    <div className="flex-grow-1 text-start ms-2">
                      <h6 className="text-muted mb-1">Module</h6>
                      <h1 className='mb-0 d-inline'>{moduleCount}</h1>
                    </div>
                  </div>
                </Link>
              </Col>
              <Col lg={3} sm={6} xs={12}>
                <Link to="/invoice" className='text-decoration-none text-reset'>
                  <div className="p-3 d-flex align-items-center my-3 rounded-1" style={{ backgroundColor: 'white', borderLeft: '4px solid #debf31' }}>
                    <span className="fa-stack fa-2x">
                      <i className="fa-solid fa-circle fa-stack-2x" style={{ color: '#debf31' }}></i>
                      <i className="fa-solid fa-file-invoice fa-stack-1x" style={{ color: 'white', fontSize: '2rem' }}></i>
                    </span>
                    <div className="flex-grow-1 text-start ms-2">
                      <h6 className="text-muted mb-1">Pending Invoices</h6>
                      <h1 className='mb-0 d-inline '>{invoiceCount}</h1>
                    </div>
                  </div>
                </Link>
              </Col>
             
            </Row>
          </Col>
        </Row>
      </Container>
 :  
 <>
  <Container>
 <Row className='mx-5 text-center g-0'>
   <Col lg={12} xs={12} sm={12}>
     <Row>
     <Col lg={3} sm={6} xs={12}>
         <Link to="/leads" className='text-decoration-none text-reset'>
           <div className="p-3 d-flex align-items-center my-3 rounded-1" style={{ backgroundColor: 'white', borderLeft: '4px solid #00ad5b' }}>
             <span className="fa-stack fa-2x">
               <i className="fa-solid fa-circle fa-stack-2x" style={{ color: '#00ad5b' }}></i>
               <i className="fa-solid fa-bolt fa-stack-1x" style={{ color: 'white', fontSize: '2rem' }}></i>
             </span>
             <div className="flex-grow-1 text-start ms-2">
               <h6 className="text-muted mb-1">Leads</h6>
               <h1 className='mb-0 d-inline '>{leadCount}</h1>
             </div>
           </div>
         </Link>
       </Col>
       <Col lg={3} sm={6} xs={12}>
         <Link to="/campaign" className='text-decoration-none text-reset'>
           <div className="p-3 d-flex align-items-center my-3 rounded-1" style={{ backgroundColor: 'white', borderLeft: '4px solid #239dd1' }}>
             <span className="fa-stack fa-2x">
               <i className="fa-solid fa-circle fa-stack-2x" style={{ color: '#239dd1' }}></i>
               <i className="fa-solid fa-user-group fa-stack-1x" style={{ color: 'white', fontSize: '2rem' }}></i>
             </span>
             <div className="flex-grow-1 text-start ms-2">
               <h6 className="text-muted mb-1">Pending Campaign</h6>
               <h1 className='mb-0 d-inline '>{campaignCount}</h1>
             </div>
           </div>
         </Link>
       </Col>
       {/* <Col lg={3} sm={6} xs={12}>
         <Link to="/whatsapp_template" className='text-decoration-none text-reset'>
           <div className="p-3 d-flex align-items-center my-3 rounded-1" style={{ backgroundColor: 'white', borderLeft: '4px solid #d3761f' }}>
             <span className="fa-stack fa-2x">
               <i className="fa-solid fa-circle fa-stack-2x" style={{ color: '#d3761f' }}></i>
               <i className="fa-solid fa-building fa-stack-1x" style={{ color: 'white', fontSize: '2rem' }}></i>
             </span>
             <div className="flex-grow-1 text-start ms-2">
               <h6 className="text-muted mb-1">Total Templates</h6>
               <h1 className='mb-0 d-inline text-center'>{templateCount}</h1>
             </div>
           </div>
         </Link>
       </Col> */}
       <Col lg={3} sm={6} xs={12}>
         <Link to="/response_message" className='text-decoration-none text-reset'>
           <div className="p-3 d-flex align-items-center my-3 rounded-1" style={{ backgroundColor: 'white', borderLeft: '4px solid #debf31' }}>
             <span className="fa-stack fa-2x">
               <i className="fa-solid fa-circle fa-stack-2x" style={{ color: '#debf31' }}></i>
               <i className="fa-solid fa-address-book fa-stack-1x" style={{ color: 'white', fontSize: '2rem' }}></i>
             </span>
             <div className="flex-grow-1 text-start ms-2">
               <h6 className="text-muted mb-1">Auto Response Message</h6>
               <h1 className='mb-0 d-inline '>{autoResponseCount}</h1>
             </div>
           </div>
         </Link>
       </Col>
       <Col lg={3} sm={6} xs={12}>
         <Link to="/billing" className='text-decoration-none text-reset'>
           <div className="p-3 d-flex align-items-center my-3 rounded-1" style={{ backgroundColor: 'white', borderLeft: '4px solid #d3761f' }}>
             <span className="fa-stack fa-2x">
               <i className="fa-solid fa-circle fa-stack-2x" style={{ color: '#d3761f' }}></i>
               <i className="fa-solid fa-indian-rupee-sign fa-stack-1x" style={{ color: 'white', fontSize: '2rem' }}></i>
             </span>
             <div className="flex-grow-1 text-start ms-2">
               <h6 className="text-muted mb-1">Total Billing Cost</h6>
               <h1 className='mb-0 d-inline text-center'>{billingCost.toFixed(2)}</h1>
             </div>
           </div>
         </Link>
       </Col>
      
     </Row>
   </Col>
 </Row>
</Container>
<Container>
        <Row className='mx-5 text-center g-0'>
          <Col lg={12} xs={12} sm={12}>
            <Row>
              <Col lg={6} xs={12} sm={12}>
                <Card className='h-100 mb-3' style={{ border: "none" }}>
                  <Card.Title className="text-center mt-2">Campaign</Card.Title>
                  <div style={{ height: "300px" }}>
                    <PieChart  selectedWhatsAppSetting={selectedWhatsAppSetting}/>
                  </div>
                </Card>
              </Col>

              <Col lg={6} xs={12} sm={12}>
                <Card className='h-100 mb-3' style={{ border: "none" }}>
                  <Card.Title className="text-center mt-2">WhatsApp Templates</Card.Title>
                  <div style={{ height: "300px" }}>
                    <DoughnutChart selectedWhatsAppSetting={selectedWhatsAppSetting}/>
                  </div>
                </Card>
              </Col>
            </Row>
          </Col>

        </Row>
      </Container>

</>
}
    


    
    </>
  )
}

export default Home
