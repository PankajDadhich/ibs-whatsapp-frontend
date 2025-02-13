import React from "react";
import { Navigate, Outlet } from "react-router-dom";

const ProtectedRoute = ({ userInfo, userModules = [], routeModule }) => {

  if (userInfo.userrole && userInfo.userrole === "SYS_ADMIN") {
      const isSuperAdmin = userInfo.userrole === "SYS_ADMIN";
      if (isSuperAdmin) {
        return <Outlet />;
      }
    }

  if (userInfo.userrole && userModules.length) {
    const hasAccess = userModules.some((module) => module.url.includes(routeModule));
        const subscriptionEndDate = new Date(userInfo.subscription.end_date);
        const currentDate = new Date();
    //    console.log("subscriptionEndDate",subscriptionEndDate,currentDate)
        if (subscriptionEndDate <= currentDate) {
      //    console.log("subscriptionEndDate",subscriptionEndDate <= currentDate  )
          return <Navigate to="/402" />;
        }
      if (!hasAccess) {
        return <Navigate to="/403" />;
      }
  }
 

  return <Outlet />;
};

export default ProtectedRoute;
