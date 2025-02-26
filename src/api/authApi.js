import { useState } from 'react';
import * as constants from '../constants/CONSTANT';
import helper from "../components/common/helper";
const authApi = {
  async login(credentials) {
    try {
          
        let response = await fetch(constants.API_BASE_URL + "/api/auth/login", {
          method: "POST",
          mode: "cors",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(credentials),
        });

        const result = await response.json();
        if (result.success) {
          sessionStorage.setItem("token", result.authToken);
          sessionStorage.setItem("r-t", result.refreshToken);
        }
        return result;
      } catch (error) {
      console.log("error", error);
  }
  },

  async fetchMyImage() {
    const token = sessionStorage.getItem("token");
    // let response = await fetch(
    //   constants.API_BASE_URL + "/api/auth/myimage",
    //   {
    //     method: "GET",
    //     //mode: "cors",

    //     headers: {
    //       "Authorization": token
    //     }
    //   }
    // );
    let response = await helper.fetchWithAuth(constants.API_BASE_URL + "/api/auth/myimage", 'GET');
    
    if (response.status === 200) {
      const fileBody = await response.blob();
      return fileBody;
    } else {
      return null;
    }

  },

  async fetchUserImage(userid) {
    const token = sessionStorage.getItem("token");
    // let response = await fetch(
    //   constants.API_BASE_URL + "/api/auth/userimage/" + userid,
    //   {
    //     method: "GET",
    //     //mode: "cors",

    //     headers: {
    //       "Authorization": token
    //     }
    //   }
    // );
    let response = await helper.fetchWithAuth(constants.API_BASE_URL + "/api/auth/userimage/" + userid, 'GET');
   
    const fileBody = await response.blob();
    return fileBody;
  },


  async refreshToken() {
    const refreshToken = sessionStorage.getItem("r-t");
    if (!refreshToken) {
      console.error("No refresh token found in sessionStorage.");
      this.logout(); 
      return;
      }
    try {
      const response = await fetch(`${constants.API_BASE_URL}/api/auth/refresh`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ refreshToken }),
      });
  
      const result = await response.json();
  
      if (result.success) {
        sessionStorage.setItem("token", result.authToken);
        sessionStorage.setItem("r-t", result.refreshToken);
      } else {
        console.error("Failed to refresh token:", result.error);
      }
      return result;
    } catch (error) {
      console.error("Error refreshing token:", error);
      this.logout();
      return;
      }
  },
  


  logout() {
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("r-t");
    window.location.href = '/login';
  },

  async bs() {
    return "yes";
  },

}

export default authApi
