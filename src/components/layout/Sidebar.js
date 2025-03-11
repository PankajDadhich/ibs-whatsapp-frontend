import React, { useState, useEffect } from 'react';
import { useLocation } from "react-router-dom";
import * as constants from '../../constants/CONSTANT';
import jwt_decode from "jwt-decode";
import { isMobile, MobileView, BrowserView } from 'react-device-detect';
import { useNavigate } from "react-router-dom";
import WhatsAppAPI from '../../api/WhatsAppAPI';

const Sidebar = () => {
  const [menu, setMenu] = useState([]);
  const [isSpinner, setIsSpinner] = useState(false);
  const [permissions, setPermissions] = useState();
  const [userInfo, setUserInfo] = useState({});
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    try {
      if (sessionStorage.getItem('token')) {
        let user = jwt_decode(sessionStorage.getItem('token'));
        setUserInfo(user);
        // var perm = user.permissions.map(function (obj) {
        //   return obj.name;
        // }).join(';')
        // setPermissions(perm);
      if(user.userrole !== 'SYS_ADMIN'){
        const subscriptionEndDate = new Date(user.subscription.end_date);
        const currentDate = new Date();
    //    console.log("subscriptionEndDate",subscriptionEndDate,currentDate)
        if (subscriptionEndDate <= currentDate) {
      //    console.log("subscriptionEndDate",subscriptionEndDate <= currentDate  )
          navigate('/402');
        }
      }
      
        setMenu(user.modules);

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
  
  const renderMenuItems = () => {
    if (userInfo.userrole !== 'SYS_ADMIN') {
      const sortedMenu = menu.sort((a, b) => a.order_no - b.order_no);
      
      return sortedMenu.map(menuItem => (
        <li
          key={menuItem.id}
          className={location.pathname.includes(menuItem.url) ? 'active' : ''}
        >
          <span
            className="custom-link-sidebar"
            onClick={() => navigatePage(`/${menuItem.url}`, false)}
          >
            <i className={`${menuItem.icon} mx-2`}></i> {menuItem.name}
          </span>
        </li>
      ));
    }
    return null;
  };
  


  return (
       <>
      <nav
        id="sidebar"
        className={isMobile ? 'hide' : 'show'}
        style={{ fontSize: "small", backgroundImage: `url(${userInfo.sidebarbgurl})` }}
      >
        <div>
          <div className="sidebar-header">
          <img src={userInfo.logourl} style={{ width: "150px" }} /> 
            {/* <img src='logo.png' alt='' style={{ width: "150px" }} /> */}
          </div>

          <ul className="list-unstyled components">
              <li className={`${location.pathname === '/' ? 'active' : ''}`}>
                <span className="custom-link-sidebar" onClick={(e) => navigatePage("/", false)} style={{ borderTop: "1px solid #fff" }}><i className="fa-solid fa-house mx-2" ></i> Home</span>
              </li>
              {userInfo.userrole === 'SYS_ADMIN' && (
            <>
              <li className={location.pathname.includes('/web_leads') ? 'active' : ''}>
                <span className="custom-link-sidebar" onClick={() => navigatePage("/web_leads", false)}>
                  <i className="fa-solid fa-bolt mx-2"></i>Leads
                </span>
              </li>
              <li className={location.pathname.includes('/module') ? 'active' : ''}>
                <span className="custom-link-sidebar" onClick={() => navigatePage("/module", false)}>
                  <i className="fa fa-bars mx-2"></i>Module
                </span>
              </li>
              <li className={location.pathname.includes('/plan') ? 'active' : ''}>
                <span className="custom-link-sidebar" onClick={() => navigatePage("/plan", false)}>
                  <i className="fa-solid fa-money-check mx-2"></i>Plan 
                </span>
              </li>
              <li className={location.pathname.includes('/company') ? 'active' : ''}>
                <span className="custom-link-sidebar" onClick={() => navigatePage("/company", false)}>
                  <i className="fa-solid fa-building mx-2"></i>Company
                </span>
              </li>
              <li className={location.pathname.includes('/invoice') ? 'active' : ''}>
                <span className="custom-link-sidebar" onClick={() => navigatePage("/invoice", false)}>
                  <i className="fa-solid fa-file-invoice  mx-2"></i>Invoices
                </span>
              </li>
            </>
          )}
          {renderMenuItems()}
          {userInfo.userrole?.includes('ADMIN') && (
            <li className={location.pathname.includes('/users') ? 'active' : ''}>
              <span className="custom-link-sidebar" onClick={() => navigatePage("/users", false)}>
                <i className="fa-solid fa-user mx-2"></i>User
              </span>
            </li>
          )}
           {/* {userInfo.userrole?.includes('USER') && (
            <li className={location.pathname.includes('/usertracking') ? 'active' : ''}>
              <span className="custom-link-sidebar" onClick={() => navigatePage("/usertracking", false)}>
                <i className="fa-solid fa-user mx-2"></i>Check In / Out
              </span>
            </li>
          )} */}
          <li className={location.pathname.includes('/myprofile') ? 'active' : ''}>
            <span className="custom-link-sidebar" onClick={() => navigatePage("/myprofile", false)}>
              <i className="fa fa-user-circle mx-2"></i>My Profile
            </span>
          </li>
          <li className={location.pathname.includes('/interactive_message') ? 'active' : ''}>
            <span className="custom-link-sidebar" onClick={() => navigatePage("/interactive_message", false)}>
              <i className="fa-solid fa-wand-magic-sparkles mx-2"></i>Quick/Canned Replies
            </span>
          </li>
          <li className={location.pathname.includes('/chatbot') ? 'active' : ''}>
            <span className="custom-link-sidebar" onClick={() => navigatePage("/chatbot", false)}>
              <i className="fa fa-robot mx-2"></i>Chatbot
            </span>
          </li>
          </ul>

          <div className="sidebar-header" style={{ padding: "2rem 2rem 2rem 1rem", borderTop: "1px solid #fff", textAlign: "center" }}>
          </div>
        </div>
      </nav>
    </>
  )
}
export default Sidebar
