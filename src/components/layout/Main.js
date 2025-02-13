/** @format */
import React, { useState, useEffect } from 'react';
import Sidebar from "./Sidebar";
import Header from "./Header";
import { Outlet } from "react-router-dom";
import Footer from "../Footer";

const Main = ({ socket, onWhatsAppSettingChange }) => {
  const [selectedWhatsAppSetting, setSelectedWhatsAppSetting] = useState(localStorage.getItem('selectedWhatsAppSetting') || '');

  const handleWhatsAppSettingChange = (newSettingId) => {
    setSelectedWhatsAppSetting(newSettingId);
    localStorage.setItem('selectedWhatsAppSetting', newSettingId);
  };

  useEffect(() => {
    if (onWhatsAppSettingChange) {
      onWhatsAppSettingChange(selectedWhatsAppSetting);
    }
  }, [selectedWhatsAppSetting, onWhatsAppSettingChange]);

  return (
    <div className="wrapper">
      <Sidebar />
      <div id="content">
        <Header socket={socket} onWhatsAppSettingChange={handleWhatsAppSettingChange} />
        <Outlet />
        <Footer />
      </div>
    </div>
  );
};

export default Main;
