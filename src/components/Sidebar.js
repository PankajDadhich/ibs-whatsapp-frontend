import React, { useState, useEffect } from 'react';
import Button from 'react-bootstrap/Button';
import Offcanvas from 'react-bootstrap/Offcanvas';
import { Link } from 'react-router-dom';
import { useLocation } from "react-router-dom";
import * as constants from '../constants/CONSTANT';
import jwt_decode from "jwt-decode";
import { isMobile, MobileView, BrowserView } from 'react-device-detect';

import { useNavigate } from "react-router-dom";

const Sidebar = () => {
  const [sidebar, setSidebar] = useState(true);
  const [permissions, setPermissions] = useState();
  const [userInfo, setUserInfo] = useState({});
  const location = useLocation();
  const navigate = useNavigate();
  useEffect(() => {
    try {
      if (localStorage.getItem('token')) {
        let user = jwt_decode(localStorage.getItem('token'));
        setUserInfo(user);

        // var perm = user.permissions.map(function (obj) {
        //   return obj.name;
        // }).join(';')
        // setPermissions(perm);
      }
    } catch (error) {
  //    console.log(error)
    }

  }, []);

  const navigatePage = (destination, defaultHide) => {
    if (isMobile || defaultHide)
      hideSideBar();
    setTimeout(() => {
      navigate(destination);
    }, 100)


  }
  const hideSideBar = () => {
    document.querySelector("#sidebar").classList.toggle("hide");
    document.querySelector("#sidebar").classList.toggle("show");
  }

  return (
    <>
      <nav id="sidebar" className={isMobile ? 'hide' : 'show'} style={{ fontSize: "small", backgroundImage: `url(${userInfo.sidebarbgurl})` }}>
        <div>
          <div className="sidebar-header">
          <img src='logo.png' alt='' style={{ width: "150px" }} />
            {/* <img src={userInfo.logourl} style={{ width: "150px" }} />  */}
          </div>

          <ul className="list-unstyled components">
            <li className={`${location.pathname === '/' ? 'active' : ''}`}>

              <span className="custom-link-sidebar" onClick={(e) => navigatePage("/", false)} style={{ borderTop: "1px solid #fff" }}><i className="fa-solid fa-house mx-2" ></i> Home</span>
            </li>
            <li >
              {/* <Link to="/"> <i className="fa-solid fa-chart-simple mx-2"></i> Accounts</Link> */}
            </li>
            {permissions && (permissions.indexOf(constants.VIEW_ACCOUNT) >= 0 || permissions.indexOf(constants.MODIFY_ALL) >= 0) ?
              <li className={`${location.pathname.includes('/accounts') ? 'active' : ''}`}>
                <span className="custom-link-sidebar" onClick={(e) => navigatePage("/accounts", false)}><i className="fa-solid fa-building mx-2"></i> Accounts</span>
              </li>
              : ''}

         

            {permissions && (permissions.indexOf(constants.VIEW_LEAD) >= 0
              || permissions.indexOf(constants.MODIFY_ALL) >= 0) ?
              <li className={`${location.pathname.includes('/leads') ? 'active' : ''}`}>
                <span className="custom-link-sidebar" onClick={(e) => navigatePage("/leads", true)}> <i className="fa-solid fa-bolt mx-2"></i> Leads</span>
              </li> : ''}


            {!isMobile && permissions && (permissions.indexOf(constants.MODIFY_ALL) >= 0) ?
              <li className={`${location.pathname.includes('/users') ? 'active' : ''}`}>
                <span className="custom-link-sidebar" onClick={(e) => navigatePage("/users", false)}> <i className="fa-solid fa-user mx-2"></i>  Users</span>
              </li> : ''}


            {userInfo.userrole && (userInfo.userrole.indexOf('USER') >= 0) ?
              <li className={`${location.pathname.includes('/usertracking') ? 'active' : ''}`}>
                <span className="custom-link-sidebar" onClick={(e) => navigatePage("/usertracking", false)}><i className="fa-solid fa-user mx-2"></i>  Check In / Out</span>
              </li> : ''}

        
            <li className={`${location.pathname.includes('/myprofile') ? 'active' : ''}`}>
              <span className="custom-link-sidebar" onClick={(e) => navigatePage("/myprofile", false)}> <i className="fa fa-user-circle mx-2"></i>My Profile</span>
            </li>
          

          </ul>
          <div className="sidebar-header" style={{ padding: "2rem 2rem 2rem 1rem", borderTop: "1px solid #fff", textAlign: "center" }}>
            <img src="/sidebar_logo.png" style={{ width: "80%" }} />
            <p style={{ paddingTop: ".5rem" }}>Powered by <a href="https://indicrm.io" style={{ color: "#fff" }}>indiCRM.io</a></p>

          </div>
        </div>
      </nav>
    </>
  )
}

export default Sidebar
