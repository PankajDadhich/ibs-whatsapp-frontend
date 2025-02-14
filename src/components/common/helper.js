import jwt_decode from "jwt-decode";
import * as constants from "../../constants/CONSTANT";

const helper = {
  checkPermission(perm) {
    let userInfo = jwt_decode(sessionStorage.getItem("token"));
    if (!userInfo.permissions) return false;
    return userInfo.permissions.some(function (el) {
      return el.name === perm;
    });
  },

  //added by moin : 13-07-2023
  generateDescriptionHTML(tasks) {
    tasks.forEach((item, index) => {
      const str = item.description;
      const parts = str.split(") ");
      if (item.description.includes("@")) {
        const nameRegex = /@\[(.*?)\]/;
        if (parts.length >= 2) {
          let msgarry = [];
          for (let st of parts) {
            let fullmsg = st;
            const lastmsg = st.charAt(st.length - 1);
            if (lastmsg !== ")") {
              fullmsg = st + ")";
            }
            const regex = /\((.*?)\)/;
            const match1 = fullmsg.match(regex);
            const userId = match1 ? match1[1] : "";
            const match = fullmsg.match(nameRegex);
            const name = match ? match[1] : "";
            const modifiedSentence = fullmsg.replace(
              nameRegex,
              `<a href="/users/${userId}" style="color:#0d6efd">${name}</a>`
            );
            const cleanedSentence = modifiedSentence.replace(
              /\(.*?\)|@\[|\]|\[|\]/g,
              ""
            );
            msgarry.push(cleanedSentence);
          }
          let finalMsg = msgarry.join(" ").replace(")", "");
          item.description = finalMsg;
        } else {
          const regex = /\((.*?)\)/;
          const match1 = item.description.match(regex);
          const userId = match1 ? match1[1] : "";
          const match = item.description.match(nameRegex);
          const name = match ? match[1] : "";
          const modifiedSentence = item.description.replace(
            nameRegex,
            `<a href="/users/${userId}" style="color:#0d6efd">${name}</a>`
          );
          const cleanedSentence = modifiedSentence.replace(
            /\(.*?\)|@\[|\]|\[|\]/g,
            ""
          );
          item.description = cleanedSentence;
        }
      }
    });
  },

  async fetchWithAuth(url, method, body = {}, bodyType = undefined) {
    let accessToken = sessionStorage.getItem("token");
    const refreshToken = sessionStorage.getItem("r-t");

    if (!accessToken || !refreshToken) throw new Error("No tokens available");

    const { exp } = jwt_decode(accessToken);
    const { exp: refreshExp } = jwt_decode(refreshToken);
    if (Date.now() < refreshExp * 1000) {
      if (Date.now() >= exp * 1000) {
        const response = await fetch(
          constants.API_BASE_URL + "/api/auth/refresh",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ refreshToken }),
          }
        );

        console.log("Ref Response: ", response);

        if (!response.ok) throw new Error("Failed to refresh token");

        const data = await response.json();
        if (data.success) {
          accessToken = data.authToken;
          sessionStorage.setItem("token", accessToken);
        }
      }

      if (method === "GET" || method === "DELETE") {
        return await fetch(url, {
          method,
          mode: "cors",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
        });
      } else if (method === "POST" || method === "PUT") {
        return await fetch(url, {
          method,
          mode: "cors",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            ...(bodyType !== "form" && { "Content-Type": "application/json" }),
          },
          body,
        });
      }
    } else {
      sessionStorage.removeItem("token");
      sessionStorage.removeItem("r-t");
      window.location.href = "/login";
    }
  },
};

export default helper;
