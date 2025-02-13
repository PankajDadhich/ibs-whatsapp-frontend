import { useState } from 'react';
import * as constants from '../constants/CONSTANT';
const authApi = {
  async login(credentials) {
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
      localStorage.setItem("token", result.authToken);
      localStorage.setItem("r-t", result.refreshToken);
    }
    return result;
  },

  async fetchMyImage() {
    const token = localStorage.getItem("token");
    let response = await fetch(
      constants.API_BASE_URL + "/api/auth/myimage",
      {
        method: "GET",
        //mode: "cors",

        headers: {
          "Authorization": token
        }
      }
    );
    if (response.status === 200) {
      const fileBody = await response.blob();
      return fileBody;
    } else {
      return null;
    }

  },

  async fetchUserImage(userid) {
    const token = localStorage.getItem("token");
    let response = await fetch(
      constants.API_BASE_URL + "/api/auth/userimage/" + userid,
      {
        method: "GET",
        //mode: "cors",

        headers: {
          "Authorization": token
        }
      }
    );
    const fileBody = await response.blob();
    return fileBody;
  },


  async refreshToken() {
    const refreshToken = localStorage.getItem("r-t");
    if (!refreshToken) {
      console.error("No refresh token found in localStorage.");
      return { success: false, error: "No refresh token available." };
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
        localStorage.setItem("token", result.authToken);
        localStorage.setItem("r-t", result.refreshToken);
      } else {
        console.error("Failed to refresh token:", result.error);
      }
      return result;
    } catch (error) {
      console.error("Error refreshing token:", error);
      return { success: false, error: "Failed to refresh token." };
    }
  },
  


  logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("r-t");
    window.location.href = '/login';
  },

  async bs() {
    return "yes";
  },

}

export default authApi
