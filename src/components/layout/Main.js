/** @format */
import React, { useState, useEffect } from 'react';
import Sidebar from "./Sidebar";
import Header from "./Header";
import { Outlet } from "react-router-dom";
import Footer from "../Footer";
import Login from "../Login";

const Main = ({ socket, onWhatsAppSettingChange }) => {
  const [selectedWhatsAppSetting, setSelectedWhatsAppSetting] = useState(sessionStorage.getItem('selectedWhatsAppSetting') || '');
  const [token, setToken] = useState(sessionStorage.getItem('token'));

  const handleWhatsAppSettingChange = (newSettingId) => {
    setSelectedWhatsAppSetting(newSettingId);
    sessionStorage.setItem('selectedWhatsAppSetting', newSettingId);
  };

  useEffect(() => {
    const handleStorageChange = () => {
      setToken(sessionStorage.getItem('token'));
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  useEffect(() => {
    if (onWhatsAppSettingChange) {
      onWhatsAppSettingChange(selectedWhatsAppSetting);
    }
  }, [selectedWhatsAppSetting, onWhatsAppSettingChange]);

  return (
    <>
      {token ? (
        <div className="wrapper">
          <Sidebar />
          <div id="content">
            <Header socket={socket} onWhatsAppSettingChange={handleWhatsAppSettingChange} />
            <Outlet />
            <Footer />
          </div>
        </div>
      ) : (
        <Login />
      )}
    </>
  );
};

export default Main;