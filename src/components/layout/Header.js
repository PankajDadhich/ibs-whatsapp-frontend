import React, { useEffect, useState } from "react";
import { Badge, Button, Form} from "react-bootstrap";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import { useNavigate } from "react-router-dom";
import authApi from "../../api/authApi";
import jwt_decode from "jwt-decode";
import { isMobile, } from 'react-device-detect';
import helper from "../common/helper";
import { NameInitialsAvatar } from 'react-name-initials-avatar';
import WhatsAppAPI from '../../api/WhatsAppAPI';

const Header = ({ socket, onWhatsAppSettingChange }) => {
  const navigate = useNavigate();
  const [userInfo, setUserInfo] = useState({});
  const { tenantcode } = jwt_decode(localStorage.getItem('token'));
  const profileImage = `/public/${tenantcode}/users`;

  // const profileImage = '/user_images/users';
  const [brokenImages, setBrokenImages] = useState([]);
  const [whatsappSetting, setWhatsappSetting] = useState([]);
  const [selectedSetting, setSelectedSetting] = useState(localStorage.getItem('selectedWhatsAppSetting') || '');

  useEffect(() => {
    fetchData();
    if (!localStorage.getItem("token")) navigate("/login");
    try {
      setUserInfo(jwt_decode(localStorage.getItem('token')));
    } catch (error) {
  //    console.log(error)
    }
    socket?.on("greetings", (data) => {
      // messageList();
    })
  }, [socket]);
  
 
  const fetchData = async () => {
    try {
      const response = await WhatsAppAPI.getWhatsAppSettingRecord();
      if (response.success) {
    //    console.log("response",response);
        const selectedWhatsAppSetting = localStorage.getItem('selectedWhatsAppSetting');
        const initialSetting = response.record.find(record => 
            record.phone === selectedWhatsAppSetting
        ) 
            ? selectedWhatsAppSetting 
            : (() => {
                const newPhone = response.record[0]?.phone;
                localStorage.setItem('selectedWhatsAppSetting', newPhone);
                return newPhone;
            })();

        onWhatsAppSettingChange(initialSetting);  
        setSelectedSetting(initialSetting);
        setWhatsappSetting(response.record);
        
      } else {
        setWhatsappSetting([]);
      }
    } catch (error) {
  //    console.log('Error fetching WhatsApp settings:', error);
      setWhatsappSetting([]);
    }
  };

  const handleSettingChange = (e) => {
    const selectedId = e.target.value;
    setSelectedSetting(selectedId);
    localStorage.setItem('selectedWhatsAppSetting', selectedId); 
    if (onWhatsAppSettingChange) {
      onWhatsAppSettingChange(selectedId);  
    }
  };


  // const messageList = async () => {
  //   let tasks = '';
  //   if (tasks && tasks?.length > 0) {
  //     helper.generateDescriptionHTML(tasks);
  //   }
  // };

  const logout = () => {
    authApi.logout();
    navigate("/login");
  };

  const toggleSidebar = () => {
    document.querySelector("#sidebar").classList.toggle("hide");
    document.querySelector("#sidebar").classList.toggle("show");
  };


  return (
    <>
      <Navbar className="header px-2" bg="" expand="lg" variant="" style={{ marginBottom: isMobile ? "1rem" : "0" }}>
        <button
          type="button"
          id="sidebarCollapse"
          className="btn btn-info"
          onClick={toggleSidebar}
        >
          <i className="fas fa-align-left"></i>
        </button>
        <Navbar.Brand href="#home"></Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link href="#" className="p-0 d-flex align-items-center" style={{ fontSize: ".9rem" }}>
              {brokenImages.includes(`img-${userInfo.id}`) ? (
                <NameInitialsAvatar
                  size="30px"
                  textSize="12px"
                  bgColor='#49C858'
                  borderWidth="0px"
                  textColor="#fff"
                  name={userInfo.username}
                />
              ) : (
                <img alt=""
                  style={{ height: "30px", width: "30px" }}
                  src={profileImage + '/' + userInfo.id}
                  className="rounded-circle"
                  onError={() => setBrokenImages((prev) => [...prev, `img-${userInfo.id}`])}
                  id={`img-${userInfo.id}`}
                />
              )}
              <Badge style={{ fontSize: ".9rem" }} bg="light" text="dark" className="mx-2">{userInfo.username} </Badge>
              <Badge bg="success" style={{ fontSize: ".9rem" }}>{userInfo.userrole} </Badge> </Nav.Link>
            <Nav.Link href="#" className="d-flex p-0" style={{ alignItems: "center" }}><span className="mx-2" style={{ fontSize: ".9rem" }}>Company</span> <Badge style={{ fontSize: ".9rem" }} bg="secondary">{userInfo.companyname} </Badge> </Nav.Link>
          </Nav>
          <Nav className="ml-auto d-flex align-items-center">
          {whatsappSetting.length > 0 && userInfo.userrole != 'SYS_ADMIN' && (
            <Form.Select 
              value={selectedSetting}
              onChange={handleSettingChange}
              aria-label="Select WhatsApp Setting"
              className="me-4"
            >
              {whatsappSetting.map((setting) => (
                <option key={setting.phone} value={setting.phone}>
                  {setting.name} {setting.phone}
                </option>
              ))}
            </Form.Select>

          )}

            {localStorage.getItem("token") ? (
              <Button variant="btn btn-primary" onClick={logout} title="Logout">
                <i className="fa-solid fa-right-from-bracket"></i>
              </Button>
            ) : (
              <></>
            )}

          </Nav>
        </Navbar.Collapse>
      </Navbar>
    </>
  );
};
export default Header;
