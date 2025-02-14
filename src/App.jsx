import "./App.css";
import "./Sidebar.css"
import "bootstrap/dist/css/bootstrap.min.css";
import 'react-date-range/dist/styles.css'; 
import 'react-date-range/dist/theme/default.css';
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Login from "./components/Login";
import Home from "./components/Home";
import React, { useEffect, useState } from "react";
// import Alert from 'react-bootstrap/Alert';
// import MiniSidebar from "./components/MiniSidebar";
import * as constants from './constants/CONSTANT';

// import PubSub from 'pubsub-js';
import { Alert, Toast, ToastContainer } from "react-bootstrap";
// import UserList from "./components/UserList";
// import UserView from "./components/UserView";
import { UserAdd, UserList, UserTracking, UserView } from "./components/user";
import jwt_decode from "jwt-decode";
import io from "socket.io-client";
import Main from "./components/layout/Main";

import WhatsAppMessenger from "./components/whatsapp_messenger/WhatsAppMessenger";
import WhatsAppSetting from "./components/whatsapp_setting/WhatsAppSetting";
import { Campaign, CampaignAdd, CampaignView } from "./components/campaign";
import { Templates, TemplateAdd } from "./components/whatsapp_template";
import { Groups, GroupView } from "./components/groups";


// Added by shivani start
import LeadList from "./components/leads/LeadList";
import LeadView from "./components/leads/LeadView";
import LeadEdit from "./components/leads/LeadEdit";
// Added by shivani end
import EditProfile from "./components/EditProfile";
import ResponseMessage from "./components/response_message/ResponseMessage";
import Module from "./components/module/Module";
import Plan from "./components/plan/Plan";
import CreatePlan from "./components/plan/CreatePlan";
import CompanyList from "./components/company/CompanyList";
import CreateCompany from "./components/company/CreateCompany";
import CompanyView from "./components/company/CompanyView";
import AddInvoice from "./components/invoices/AddInvoice";
import InvoiceView from "./components/invoices/InvoiceView";
import Invoices from "./components/invoices/Invoices";
import ProtectedRoute from "./components/common/ProtectedRoute";
import AccessDenied from "./components/common/AccessDenied";
import Leads from "./components/public_leads/Leads";
import LeadsAdd from "./components/public_leads/LeadsAdd";
import LeadsView from './components/public_leads/LeadsView';
import PlanExpire from "./components/common/PlanExpire";
import Payment from "./components/Payment";
import Billing from "./components/Billing";

// import RazorPay from "./components/rozerpay/RazorPay";


const ENDPOINT = 'https://api.indicrm.io/' || 'http://localhost:4004';
// const ENDPOINT = 'https://api.indicrm.io/';

function App() {

  const [modalShow, setModalShow] = useState(false);
  const [title, setTitle] = useState('Confirmation');
  const [message, setMessage] = useState('');
  const [variant, setVariant] = useState('');
  const [userInfo, setUserInfo] = useState({});
  const [permissions, setPermissions] = useState();
  const [connectedSocket, setConnectedSocket] = useState();
  const [selectedWhatsAppSetting, setSelectedWhatsAppSetting] = useState(sessionStorage.getItem('selectedWhatsAppSetting') || '');

  const handleWhatsAppSettingChange = (newSettingId) => {
    setSelectedWhatsAppSetting(newSettingId);
  };

  const mySubscriber = (msg, data) => {
    switch (msg) {
      case 'RECORD_SAVED_TOAST':
        setTitle(data.title);
        setMessage(data.message);
        setModalShow(true);
        setVariant('success')
        break;
      case 'RECORD_ERROR_TOAST':
        setTitle(data.title);
        setMessage(data.message);
        setModalShow(true);
        setVariant('danger')
        break;
      default:
        break;
    }
  };


  useEffect(() => {
    try {
      const token = sessionStorage.getItem('token');
      if (token) {
        let user = jwt_decode(token);
        setUserInfo(user);
        // console.log(user)
        // console.log('userInfouserInfouserInfouserInfouserInfo',userInfo)
        const perm = user?.permissions?.map((obj) => obj.name).join(';');
        setPermissions(perm);
        let socket = io(ENDPOINT, {
          path: '/ibs/socket.io',
          transports: ['websocket'],
          reconnection: true,
          // reconnectionAttempts: 5,
          // reconnectionDelay: 1000,
        });

        socket.on("connect", () => {
          console.log('Socket connected:', socket.id);
          socket.emit("setup", user);
          setConnectedSocket(socket);
        });

        socket.on("connected", () => {
          console.log('Socket setup complete');
        });

        socket.on("receivedwhatsappmessage", (item) => {
          console.log('#Received WhatsApp item:', item);
          console.log('##socket', socket)
        });

        socket.on("disconnect", (reason) => {
          console.log('Socket disconnected:', reason);
        });

        socket.on("connect_error", (err) => {
          console.error('Connection error:', err);
        });

        setConnectedSocket(socket);

        return () => {
          if (connectedSocket) {
            connectedSocket.disconnect();
            //    console.log('Socket disconnected on cleanup');
          }
        }
      } else {
        console.log('No token found');
      }
    } catch (error) {
      console.error('Error in useEffect:', error);
    }
  }, [sessionStorage.getItem('token')]);



  return (
    <>
      <ToastContainer className="p-3" position='top-center'>
        <Toast show={modalShow} onClose={() => setModalShow(false)} delay={3000} bg={variant} className="text-white" autohide>

          {variant === 'success' ?
            <div className="p-1 m-1" style={{ backgroundColor: '#198754', color: 'white' }}  >
              <i className="fa-regular fa-circle-check text-white mx-2"></i>
              <strong className="me-auto">{title}</strong>
              <i className="fa-solid fa-xmark text-white float-right" style={{ float: 'right' }} role='button' onClick={() => setModalShow(false)}></i>
            </div>
            :
            <div className="p-1 m-1" style={{ backgroundColor: '#DC3545', color: 'white' }}  >
              <i className="fa-regular fa-circle-check text-white mx-2"></i>
              <strong className="me-auto">{title}</strong>
              <i className="fa-solid fa-xmark text-white float-right" style={{ float: 'right' }} role='button' onClick={() => setModalShow(false)}></i>
            </div>
          }

          <Toast.Body>{message instanceof Array ? message.map((item) => {
            return <span>{item.msg}</span>
          }) : message instanceof Object ? <span>{message.detail}</span> : <span>{message}</span>}</Toast.Body>
        </Toast>
      </ToastContainer>
      <Router>
        <Routes>

          <Route path="/login" element={<Login />} />


          <Route path="/" element={<Main socket={connectedSocket} onWhatsAppSettingChange={handleWhatsAppSettingChange} />}>
            <Route index element={<Home selectedWhatsAppSetting={selectedWhatsAppSetting} userInfo={userInfo} />} />
            <Route path="/403" element={<AccessDenied />} />
            <Route path="/402" element={<PlanExpire userInfo={userInfo} />} />
            <Route path="/payment/:id" element={<Payment />} />

            {/******** Show an User By Id *******/}

            <Route path="/users" element={<UserList />} />
            <Route path="users/e" element={<UserAdd />} />
            <Route path="users/:id/e" element={<UserAdd />} />
            <Route path="users/:id" element={<UserView selectedWhatsAppSetting={selectedWhatsAppSetting} />} />
            <Route path="/usertracking" element={<UserTracking />} />
            <Route path="/myprofile" element={<EditProfile />} />


            <Route path="/web_leads" element={
              <ProtectedRoute
                userInfo={userInfo}
                userModules={userInfo.modules}
                routeModule="web_leads"
              />
            }>
              <Route index element={<Leads />} />
              <Route path="add" element={<LeadsAdd />} />
              <Route path=":id" element={<LeadsAdd />} />
              <Route path="view/:id" element={<LeadsView />} />
            </Route>
            {/******** campaign *******/}
            <Route path="/campaign" element={
              <ProtectedRoute
                userInfo={userInfo}
                userModules={userInfo.modules}
                routeModule="campaign"
              />
            }>
              <Route index element={<Campaign selectedWhatsAppSetting={selectedWhatsAppSetting} />} />
              <Route path="add" element={<CampaignAdd selectedWhatsAppSetting={selectedWhatsAppSetting} userInfo={userInfo} />} />
              <Route path="view/:id" element={<CampaignView />} />
            </Route>


            {/******** Template *******/}
            <Route path="/whatsapp_template" element={
              <ProtectedRoute
                userInfo={userInfo}
                userModules={userInfo.modules}
                routeModule="whatsapp_template"
              />
            }>
              <Route index element={<Templates selectedWhatsAppSetting={selectedWhatsAppSetting} />} />
              <Route path="add" element={<TemplateAdd selectedWhatsAppSetting={selectedWhatsAppSetting} />} />
            </Route>

            <Route path="/whatsapp_messenger" element={
              <ProtectedRoute
                userInfo={userInfo}
                userModules={userInfo.modules}
                routeModule="whatsapp_messenger"
              />
            }>
              <Route index element={<WhatsAppMessenger socket={connectedSocket} selectedWhatsAppSetting={selectedWhatsAppSetting} />} />
            </Route>
            <Route path="/whatsapp_setting" element={
              <ProtectedRoute
                userInfo={userInfo}
                userModules={userInfo.modules}
                routeModule="whatsapp_setting"
              />
            }>
              <Route index element={<WhatsAppSetting />} />
            </Route>
            <Route path="/response_message" element={
              <ProtectedRoute
                userInfo={userInfo}
                userModules={userInfo.modules}
                routeModule="response_message"
              />
            }>
              <Route index element={<ResponseMessage />} />
            </Route>
            <Route path="/plan" element={
              <ProtectedRoute
                userInfo={userInfo}
                userModules={userInfo.modules}
                routeModule="plan"
              />
            }>
              <Route index element={<Plan />} />
              <Route path="add" element={<CreatePlan />} />
              <Route path=":id/e" element={<CreatePlan />} />
            </Route>

            <Route path="/module" element={
              <ProtectedRoute
                userInfo={userInfo}
                userModules={userInfo.modules}
                routeModule="module"
              />
            }>
              <Route index element={<Module />} />
            </Route>

            <Route path="/leads" element={
              <ProtectedRoute
                userInfo={userInfo}
                userModules={userInfo.modules}
                routeModule="leads"
              />
            }>
              <Route index element={<LeadList />} />
              <Route path=":id" element={<LeadView socket={connectedSocket} selectedWhatsAppSetting={selectedWhatsAppSetting} />} />
              <Route path="e" element={<LeadEdit />} />
              <Route path=":id/e" element={<LeadEdit />} />
            </Route>

            <Route path="/groups" element={
              <ProtectedRoute
                userInfo={userInfo}
                userModules={userInfo.modules}
                routeModule="groups"
              />
            }>
              <Route index element={<Groups />} />
              <Route path=":groupId" element={<GroupView />} />
            </Route>

            <Route path="/company" element={
              <ProtectedRoute
                userInfo={userInfo}
                userModules={userInfo.modules}
                routeModule="company"
              />
            }>
              <Route index element={<CompanyList tabName="Company" />} />
              <Route path=":id" element={<CompanyView tabName="Company Details" />} />
              <Route path="add" element={<CreateCompany tabName="Create Company" />} />
              <Route path="edit/:id?" element={<CreateCompany tabName="Create Company" />} />
            </Route>

            <Route path="/invoice" element={
              <ProtectedRoute
                userInfo={userInfo}
                userModules={userInfo.modules}
                routeModule="invoice"
              />
            }>
              <Route index element={<Invoices tabName="Invoices" />} />
              <Route path="generate/:id" element={<AddInvoice tabName="Invoice" />} />
              <Route path=":id" element={<InvoiceView tabName="Invoice" />} />
              <Route path="pay/:id" element={<AddInvoice tabName="Invoice" action='pay' />} />
            </Route>
            <Route path="/billing" element={
              <ProtectedRoute
                userInfo={userInfo}
                userModules={userInfo.modules}
                routeModule="billing"
              />
            }>
              <Route index element={<Billing selectedWhatsAppSetting={selectedWhatsAppSetting} />} />
            </Route>
            {/* <Route path="/razorpay" element={
                <ProtectedRoute
                  userInfo={userInfo}
                  userModules={userInfo.modules}
                  routeModule="razorpay"
                />
              }>
            <Route index element={<RazorPay tabName="RazorPay" />} />
          </Route> */}

          </Route>
        </Routes>
      </Router>
    </>
  );
}

export default App;
