import * as constants from '../constants/CONSTANT';
import authApi from "./authApi";
import helper from "../components/common/helper";

const WhatsAppAPI = {

  async fetchUsers() {
    let response = await helper.fetchWithAuth(constants.API_BASE_URL + "/api/auth/users", 'GET');
    const result = await response.json();
    if (result.length > 0) {
      return result;
    }
    return null;
  },

  //.............. Fetch Lead By Id .............................
  async fetchUserById(id, tenant) {
    id = id.trim();
    // const token = sessionStorage.getItem("token");
    // let response = await fetch(constants.API_BASE_URL + "/api/auth/users/" + id, {
    //   method: 'GET',
    //   mode: 'cors',
    //   headers: {
    //     'Content-Type': 'application/json',
    //     'Authorization': token
    //     // 'Content-Type': 'application/x-www-form-urlencoded',
    //   }
    // });
    let response = await helper.fetchWithAuth(constants.API_BASE_URL + "/api/auth/users/" + id + "/" + tenant, 'GET');

    // let response = await helper.fetchWithAuth(constants.API_BASE_URL + "/api/auth/users/" + id, 'GET');
    const result = await response.json();
    return result;
  },


  async fetchTasksWithoutParent() {
    // const token = sessionStorage.getItem("token");
    // let response = await fetch(constants.API_BASE_URL + "/api/tasks/opentasks", {
    //   method: 'GET',
    //   mode: 'cors',
    //   headers: {
    //     'Content-Type': 'application/json',
    //     'Authorization': token
    //     // 'Content-Type': 'application/x-www-form-urlencoded',
    //   }
    // });

    let response = await helper.fetchWithAuth(constants.API_BASE_URL + "/api/tasks/opentasks", 'GET');
    const result = await response.json();
    if (result.length > 0) {
      return result;
    }
    return null;
  },

  async sendEmailTask(task) {
    // const token = sessionStorage.getItem("token");
    // let response = await fetch(constants.API_BASE_URL + "/api/tasks/sendemail", {
    //   method: 'POST',
    //   mode: 'cors',
    //   headers: {
    //     'Content-Type': 'application/json',
    //     'Authorization': token,
    //   },
    //   body: JSON.stringify(task),
    // });

    let response = await helper.fetchWithAuth(constants.API_BASE_URL + "/api/tasks/sendemail", 'POST', JSON.stringify(task));
    return await response.json();
  },

  async fetchLeadReports(reportname) {
    // const token = sessionStorage.getItem("token");
    // let response = await fetch(constants.API_BASE_URL + "/api/reports/byname/" + reportname, {
    //   method: 'GET',
    //   mode: 'cors',
    //   headers: {
    //     'Content-Type': 'application/json',
    //     'Authorization': token
    //   }
    // });

    // if (response.status === 401) {
    //   authApi.refreshToken();
    // }

    let response = await helper.fetchWithAuth(constants.API_BASE_URL + "/api/reports/byname/" + reportname, 'GET');
    const result = await response.json();
    return result;
  },

  async getCurrentUserTrackingRec() {
    // const token = sessionStorage.getItem("token");
    // let response = await fetch(
    //   constants.API_BASE_URL + "/api/usertrackings/track/currentrecord",
    //   {
    //     method: "GET",
    //     mode: "cors",
    //     headers: {
    //       "Content-Type": "application/json",
    //       Authorization: token,
    //     },
    //   }
    // );

    // if (response.status === 401) {
    //   authApi.refreshToken();
    // }

    let response = await helper.fetchWithAuth(constants.API_BASE_URL + "/api/usertrackings/track/currentrecord", 'GET');
    const result = await response.json();
    if (result) {
      return result;
    }
    return null;
  },

  async saveStaffMemberEditProfile(userid, selectedFiles, staffMember) {
    const formData = new FormData();
    formData.append('file', selectedFiles);
    formData.append('staffRecord', staffMember);
    // const token = sessionStorage.getItem("token");
    // let response = await fetch(constants.API_BASE_URL + "/api/auth/" + userid + "/profile", {
    //   method: "PUT",
    //   mode: "cors",
    //   headers: {
    //   Authorization: token,
    // },
    //   body: formData,
    // }
    // );

    let response = await helper.fetchWithAuth(constants.API_BASE_URL + "/api/auth/" + userid + "/profile", 'PUT', formData, "form");
    return await response.json();
  },


  async createCheckInRecord(locationRecord) {
    // const token = sessionStorage.getItem("token");

    // let response = await fetch(constants.API_BASE_URL + "/api/usertrackings", {
    //   method: "POST",
    //   mode: "cors",
    //   headers: {
    //     "Content-Type": "application/json",
    //     Authorization: token,
    //   },
    //   body: JSON.stringify(locationRecord),
    // });

    // if (response.status === 401) {
    //   authApi.refreshToken();
    // }

    let response = await helper.fetchWithAuth(constants.API_BASE_URL + "/api/usertrackings", 'POST', JSON.stringify(locationRecord));
    const result = await response.json();
    if (result) {
      return result;
    }
    return null;
  },

  async fetchUsertrackingsWithstaffId(staffId) {
    // const token = sessionStorage.getItem("token");
    // let response = await fetch(constants.API_BASE_URL + "/api/usertrackings/staff/" + staffId, {
    //   method: 'GET',
    //   mode: 'cors',
    //   headers: {
    //     'Content-Type': 'application/json',
    //     'Authorization': token
    //   }
    // });

    let response = await helper.fetchWithAuth(constants.API_BASE_URL + "/api/usertrackings/staff/" + staffId, 'GET');
    const result = await response.json();
    if (result.length > 0) {
      return result;
    }
    return null;
  },

  async handlCheckOut(locationRecord) {
    // const token = sessionStorage.getItem("token");
    // let response = await fetch(
    //   constants.API_BASE_URL + "/api/usertrackings/" + locationRecord.id,
    //   {
    //     method: "PUT",
    //     mode: "cors",
    //     headers: {
    //       "Content-Type": "application/json",
    //       Authorization: token,
    //     },
    //     body: JSON.stringify(locationRecord),
    //   }
    // );

    // if (response.status === 401) {
    //   authApi.refreshToken();
    // }

    let response = await helper.fetchWithAuth(constants.API_BASE_URL + "/api/usertrackings/" + locationRecord.id, 'PUT', JSON.stringify(locationRecord));
    const result = await response.json();
    if (result) {
      return result;
    }
    return null;
  },


  async getLoginUserData() {
    // const token = sessionStorage.getItem("token");
    // let response = await fetch(constants.API_BASE_URL + "/api/auth/getuser", {
    //   method: 'GET',
    //   mode: 'cors',
    //   headers: {
    //     'Content-Type': 'application/json',
    //     'Authorization': token
    //   }
    // });

    let response = await helper.fetchWithAuth(constants.API_BASE_URL + "/api/auth/getuser", 'GET');
    const result = await response.json();
    return result;
  },

  // working
  async fetchCompanySetting(settingName) {
    // const token = sessionStorage.getItem("token");
    // let response = await fetch(constants.API_BASE_URL + "/api/whatsapp/common/settings/" + settingName, {
    //   method: 'GET',
    //   mode: 'cors',
    //   headers: {
    //     'Content-Type': 'application/json',
    //     'Authorization': token
    //   }
    // });

    let response = await helper.fetchWithAuth(constants.API_BASE_URL + "/api/whatsapp/common/settings/" + settingName, 'GET');
    const result = await response.json();
    return result;
  },


  async updateUser(user) {
    // const token = sessionStorage.getItem("token");
    // let response = await fetch(
    //   constants.API_BASE_URL + "/api/auth/updatepassword",
    //   {
    //     method: "PUT",
    //     mode: "cors",
    //     headers: {
    //       "Content-Type": "application/json",
    //       "Authorization": token,
    //     },
    //     body: JSON.stringify(user),
    //   }
    // );

    let response = await helper.fetchWithAuth(constants.API_BASE_URL + "/api/auth/updatepassword", 'PUT', JSON.stringify(user));
    return await response.json();
  },

  //************************ Accounts ***********************************//
  //.................... Crate Account ...................................
  async createAccount(account) {
    // const token = sessionStorage.getItem("token");
    // let response = await fetch(constants.API_BASE_URL + "/api/accounts", {
    //   method: 'POST',
    //   mode: 'cors',
    //   headers: {
    //     'Content-Type': 'application/json',
    //     'Authorization': token,
    //   },
    //   body: JSON.stringify(account),
    // });

    let response = await helper.fetchWithAuth(constants.API_BASE_URL + "/api/accounts", 'POST', JSON.stringify(account));
    return await response.json();
  },

  async saveAccount(account) {
    // const token = sessionStorage.getItem("token");
    // let response = await fetch(
    //   constants.API_BASE_URL + "/api/accounts/" + account.id, {
    //   method: "PUT",
    //   mode: "cors",
    //   headers: {
    //     "Content-Type": "application/json",
    //     "Authorization": token,
    //   },
    //   body: JSON.stringify(account),
    // }
    // );

    let response = await helper.fetchWithAuth(constants.API_BASE_URL + "/api/accounts/" + account.id, 'PUT', JSON.stringify(account));
    return await response.json();
  },

  //.......... Fetch All Accounts ..........................................
  async fetchAccounts() {
    // const token = sessionStorage.getItem("token");
    // let response = await fetch(constants.API_BASE_URL + "/api/accounts", {
    //   method: 'GET',
    //   mode: 'cors',
    //   headers: {
    //     'Content-Type': 'application/json',
    //     'Authorization': token
    //     // 'Content-Type': 'application/x-www-form-urlencoded',
    //   }
    // });

    // if (response.status === 401) {
    //   authApi.refreshToken();
    // }

    let response = await helper.fetchWithAuth(constants.API_BASE_URL + "/api/accounts", 'GET');
    const result = await response.json();
    if (result.length > 0) {
      return result;
    }
    return null;
  },

  //.............. Fetch Account By Id .............................
  async fetchAccountById(id) {
    // const token = sessionStorage.getItem("token");
    // let response = await fetch(constants.API_BASE_URL + "/api/accounts/" + id, {
    //   method: 'GET',
    //   mode: 'cors',
    //   headers: {
    //     'Content-Type': 'application/json',
    //     'Authorization': token
    //     // 'Content-Type': 'application/x-www-form-urlencoded',
    //   }
    // });

    let response = await helper.fetchWithAuth(constants.API_BASE_URL + "/api/accounts/" + id, 'GET');
    const result = await response.json();
    return result;
  },

  //............. Delete Account ............................
  async deleteAccount(id) {
    // const token = sessionStorage.getItem("token");
    // let response = await fetch(
    //   constants.API_BASE_URL + "/api/accounts/" + id,
    //   {
    //     method: "DELETE",
    //     mode: "cors",
    //     headers: {
    //       "Content-Type": "application/json",
    //       "Authorization": token,
    //     }
    //   }
    // );

    let response = await helper.fetchWithAuth(constants.API_BASE_URL + "/api/accounts/" + id, 'DELETE');
    return await response.json();
  },


  async createUser(user) {
    // const token = sessionStorage.getItem("token");
    // let response = await fetch(constants.API_BASE_URL + "/api/auth/createuser", {
    //   method: 'POST',
    //   mode: 'cors',
    //   headers: {
    //     'Content-Type': 'application/json',
    //     'Authorization': token,
    //   },
    //   body: JSON.stringify(user),
    // });

    let response = await helper.fetchWithAuth(constants.API_BASE_URL + "/api/auth/createuser", 'POST', JSON.stringify(user));
    return await response.json();
  },

  async saveUser(user) {
    // const token = sessionStorage.getItem("token");
    // let response = await fetch(
    //   constants.API_BASE_URL + "/api/auth/" + user.id, {
    //   method: "PUT",
    //   mode: "cors",
    //   headers: {
    //     "Content-Type": "application/json",
    //     "Authorization": token,
    //   },
    //   body: JSON.stringify(user),
    // }
    // );

    let response = await helper.fetchWithAuth(constants.API_BASE_URL + "/api/auth/" + user.id, 'PUT', JSON.stringify(user));
    return await response.json();
  },

  //****************** File  *******************
  async createFile(id, formData) {
    // const token = sessionStorage.getItem("token");
    // let response = await fetch(constants.API_BASE_URL + "/api/whatsapp/files/" + id, {//whatsNum
    //   method: "POST",
    //   mode: "cors",
    //   headers: {
    //     // "Content-Type": "application/json",
    //     "Authorization": token,
    //   },
    //   body: formData,
    // });

    let response = await helper.fetchWithAuth(constants.API_BASE_URL + "/api/whatsapp/files/" + id, 'POST', formData, "form");
    return await response.json();
  },

  //************************ files ***********************************//
  async saveFiles(file) {
    // const token = sessionStorage.getItem("token");
    // let response = await fetch(
    //   constants.API_BASE_URL + "/api/files/" + file.id, {
    //   method: "PUT",
    //   mode: "cors",
    //   headers: {
    //     "Content-Type": "application/json",
    //     "Authorization": token,
    //   },
    //   body: JSON.stringify(file),
    // }
    // );

    let response = await helper.fetchWithAuth(constants.API_BASE_URL + "/api/files/" + file.id, 'PUT', JSON.stringify(file));
    return await response.json();
  },

  async deleteFile(id) {
    // const token = sessionStorage.getItem("token");
    // let response = await fetch(
    //   constants.API_BASE_URL + "/api/files/" + id,
    //   {
    //     method: "DELETE",
    //     mode: "cors",
    //     headers: {
    //       "Content-Type": "application/json",
    //       "Authorization": token,
    //     }
    //   }
    // );

    let response = await helper.fetchWithAuth(constants.API_BASE_URL + "/api/files/" + id, 'DELETE');
    return await response.json();
  },

  async getFilterData(textName, cityName, recordType) {
    const params = new URLSearchParams({ textName: textName || '', cityName: cityName || '', recordType: recordType || '' }).toString();
    // const token = sessionStorage.getItem("token");
    // let response = await fetch(`${constants.API_BASE_URL}/api/whatsapp/chat/filter?${params}`, {
    //   method: 'GET',
    //   mode: 'cors',
    //   headers: {
    //     'Content-Type': 'application/json',
    //     'Authorization': token
    //   }
    // });

    // if (response.status === 401) {
    //   authApi.refreshToken();
    // }

    let response = await helper.fetchWithAuth(`${constants.API_BASE_URL}/api/whatsapp/chat/filter?${params}`, 'GET');
    const result = await response.json();
    return result;
  },

  async fetchUnreadMsgCount(number) {
    if (!number || number.trim() === "") {
      return [];
    }
    // const token = sessionStorage.getItem("token");
    // let response = await fetch(`${constants.API_BASE_URL}/api/whatsapp/chat/unread_count?whatsapp_setting_number=${number}`, {
    //   method: 'GET',
    //   mode: 'cors',
    //   headers: {
    //     'Content-Type': 'application/json',
    //     'Authorization': token
    //   }
    // });

    // if (response.status === 401) {
    //   authApi.refreshToken();
    // }

    let response = await helper.fetchWithAuth(`${constants.API_BASE_URL}/api/whatsapp/chat/unread_count?whatsapp_setting_number=${number}`, 'GET');
    const result = await response.json();
    return result;

  },

  async markMessagesAsRead(whatsappNumber, number) {
    if (!number || number.trim() === "") {
      return [];
    }
    // const token = sessionStorage.getItem("token");
    // let response = await fetch(`${constants.API_BASE_URL}/api/whatsapp/chat/mark_as_read?whatsapp_setting_number=${number}`, {
    //   method: 'POST',
    //   mode: 'cors',
    //   headers: {
    //     'Content-Type': 'application/json',
    //     'Authorization': token
    //   },
    //   body: JSON.stringify({ whatsapp_number: whatsappNumber })
    // });

    // if (response.status === 401) {
    //   authApi.refreshToken();
    // }

    let response = await helper.fetchWithAuth(`${constants.API_BASE_URL}/api/whatsapp/chat/mark_as_read?whatsapp_setting_number=${number}`, 'POST', JSON.stringify({ whatsapp_number: whatsappNumber }));
    const result = await response.json();
    return result;
  },


  //************************* WHATSAPP SETTING || START *******************************************************************//
  async getWhatsAppSettingRecord() {
    // const token = sessionStorage.getItem("token");
    // let response = await fetch(constants.API_BASE_URL + "/api/whatsapp_setting", {///api/whatsapp_setting?name=" + name,
    //   method: 'GET',
    //   mode: 'cors',
    //   headers: {
    //     'Content-Type': 'application/json',
    //     'Authorization': token
    //   }
    // });

    // if (response.status === 401) {
    //   authApi.refreshToken();
    // }

    let response = await helper.fetchWithAuth(constants.API_BASE_URL + "/api/whatsapp_setting", 'GET');
    const result = await response.json();
    return result;
  },

  async insertWhatsAppSettingRecords(reqbody) {
    // const token = sessionStorage.getItem("token");
    // let response = await fetch(constants.API_BASE_URL + "/api/whatsapp_setting", {
    //   method: 'POST',
    //   mode: 'cors',
    //   headers: {
    //     'Content-Type': 'application/json',
    //     'Authorization': token,
    //   },
    //   body: JSON.stringify(reqbody),
    // });

    let response = await helper.fetchWithAuth(constants.API_BASE_URL + "/api/whatsapp_setting", 'POST', JSON.stringify(reqbody));
    return await response.json();
  },

  async updateWhatsAppSettingRecord(data) {
    // const token = sessionStorage.getItem("token");
    // let response = await fetch(constants.API_BASE_URL + "/api/whatsapp_setting/" + data.id, {
    //   method: "PUT",
    //   mode: "cors",
    //   headers: {
    //     "Content-Type": "application/json",
    //     "Authorization": token,
    //   },
    //   body: JSON.stringify(data),
    // }
    // );

    let response = await helper.fetchWithAuth(constants.API_BASE_URL + "/api/whatsapp_setting/" + data.id, 'PUT', JSON.stringify(data));
    return await response.json();
  },

  //************* WHATSAPP SETTING || END *****//

  /******Template || START ************************ */
  async getAllTemplates(number) {
    if (!number || number.trim() === "") {
      return [];
    }
    // const token = sessionStorage.getItem("token");
    // let response = await fetch(`${constants.API_BASE_URL}/api/webhook_template/alltemplate?whatsapp_setting_number=${number}`, {
    //   method: 'GET',
    //   mode: 'cors',
    //   headers: {
    //     'Content-Type': 'application/json',
    //     'Authorization': token,
    //   },
    // });

    let response = await helper.fetchWithAuth(`${constants.API_BASE_URL}/api/webhook_template/alltemplate?whatsapp_setting_number=${number}`, 'GET');
    return await response.json();
  },

  async getApprovedTemplates(number) {
    if (!number || number.trim() === "") {
      return [];
    }
    // const token = sessionStorage.getItem("token");
    // let response = await fetch(`${constants.API_BASE_URL}/api/webhook_template/approved/template?whatsapp_setting_number=${number}`, {
    //   method: 'GET',
    //   mode: 'cors',
    //   headers: {
    //     'Content-Type': 'application/json',
    //     'Authorization': token,
    //   },
    // });

    let response = await helper.fetchWithAuth(`${constants.API_BASE_URL}/api/webhook_template/approved/template?whatsapp_setting_number=${number}`, 'GET');
    return await response.json();
  },

  async generateSessionId(file, number) {
    if (!number || number.trim() === "") {
      return [];
    }
    // const token = sessionStorage.getItem("token");
    const formData = new FormData();
    formData.append("files", file);
    // let response = await fetch(`${constants.API_BASE_URL}/api/webhook_template?whatsapp_setting_number=${number}`, {
    //   method: 'POST',
    //   mode: 'cors',
    //   headers: {
    //     'Authorization': token,
    //   },
    //   body: formData,
    // });

    let response = await helper.fetchWithAuth(`${constants.API_BASE_URL}/api/webhook_template?whatsapp_setting_number=${number}`, 'POST', formData, "form");
    return await response.json();
  },

  async uploadDocumentSessionId(file, sessionId, number) {
    if (!number || number.trim() === "") {
      return [];
    }
    // const token = sessionStorage.getItem("token");
    const formData = new FormData();
    formData.append("files", file);
    formData.append("uploadSessionId", sessionId)
    // let response = await fetch(`${constants.API_BASE_URL}/api/webhook_template/uploadsessionid?whatsapp_setting_number=${number}`, {
    //   method: 'POST',
    //   mode: 'cors',
    //   headers: {
    //     'Authorization': token,
    //   },
    //   body: formData,
    // });

    let response = await helper.fetchWithAuth(`${constants.API_BASE_URL}/api/webhook_template/uploadsessionid?whatsapp_setting_number=${number}`, 'POST', formData, "form");
    return await response.json();
  },

  async createMarketingTemplate(reqbody, number) {
    if (!number || number.trim() === "") {
      return [];
    }
    // const token = sessionStorage.getItem("token");
    // let response = await fetch(`${constants.API_BASE_URL}/api/webhook_template/template?whatsapp_setting_number=${number}`, {
    //   method: 'POST',
    //   mode: 'cors',
    //   headers: {
    //     'Content-Type': 'application/json',
    //     'Authorization': token,
    //   },
    //   body: JSON.stringify(reqbody),
    // });

    let response = await helper.fetchWithAuth(`${constants.API_BASE_URL}/api/webhook_template/template?whatsapp_setting_number=${number}`, 'POST', JSON.stringify(reqbody));
    return await response.json();
  },

  async updateMarketingTemplate(id, reqbody, number) {
    if (!number || number.trim() === "") {
      return [];
    }
    // const token = sessionStorage.getItem("token");
    // let response = await fetch(`${constants.API_BASE_URL}/api/webhook_template/template/${id}?whatsapp_setting_number=${number}`, {
    //   method: 'POST',
    //   mode: 'cors',
    //   headers: {
    //     'Content-Type': 'application/json',
    //     'Authorization': token,
    //   },
    //   body: JSON.stringify(reqbody),
    // });

    let response = await helper.fetchWithAuth(`${constants.API_BASE_URL}/api/webhook_template/template/${id}?whatsapp_setting_number=${number}`, 'POST', JSON.stringify(reqbody));
    return await response.json();
  },

  async upsertAuthTemplate(reqbody, number) {
    if (!number || number.trim() === "") {
      return [];
    }
    // const token = sessionStorage.getItem("token");
    // const response = await fetch(`${constants.API_BASE_URL}/api/webhook_template/temp/auth?whatsapp_setting_number=${number}`, {
    //   method: 'POST',
    //   mode: 'cors',
    //   headers: {
    //     'Content-Type': 'application/json',
    //     'Authorization': token,
    //   },
    //   body: JSON.stringify(reqbody),
    // });

    let response = await helper.fetchWithAuth(`${constants.API_BASE_URL}/api/webhook_template/temp/auth?whatsapp_setting_number=${number}`, 'POST', JSON.stringify(reqbody));
    return await response.json();
  },
  // Delete Template
  async deleteTemplateRecord(id, name, number) {
    if (!number || number.trim() === "") {
      return [];
    }
    // const token = sessionStorage.getItem("token");
    // let response = await fetch(constants.API_BASE_URL + '/api/webhook_template/template?hsm_id=' + id + '&name=' + name + '&whatsapp_setting_number=' + number, {
    //   method: "DELETE",
    //   mode: "cors",
    //   headers: {
    //     "Content-Type": "application/json",
    //     "Authorization": token,
    //   }
    // });

    let response = await helper.fetchWithAuth(constants.API_BASE_URL + '/api/webhook_template/template?hsm_id=' + id + '&name=' + name + '&whatsapp_setting_number=' + number, 'DELETE');
    const result = await response.json();
    return result;
  },

  /****************************Template || END ************************************************* */

  //************************* CREATE TEMPLATE IN DATABASE || START *********************************//
  async createMessageTemplateData(reqbody) {
    // const token = sessionStorage.getItem("token");
    // let response = await fetch(constants.API_BASE_URL + "/api/whatsapp/message/template", {
    //   method: 'POST',
    //   mode: 'cors',
    //   headers: {
    //     'Content-Type': 'application/json',
    //     'Authorization': token,
    //   },
    //   body: JSON.stringify(reqbody),
    // });

    let response = await helper.fetchWithAuth(constants.API_BASE_URL + "/api/whatsapp/message/template", 'POST', JSON.stringify(reqbody));
    return await response.json();
  },

  // delete template database record
  async deleteTemplateDatabase(id) {
    // const token = sessionStorage.getItem("token");
    // let response = await fetch(constants.API_BASE_URL + "/api/whatsapp/message/template/" + id, {
    //   method: "DELETE",
    //   mode: "cors",
    //   headers: {
    //     "Content-Type": "application/json",
    //     "Authorization": token,
    //   }
    // }
    // );

    let response = await helper.fetchWithAuth(constants.API_BASE_URL + "/api/whatsapp/message/template/" + id, 'DELETE');
    return await response.json();
  },

  //************************* CREATE TEMPLATE IN DATABASE || END **********************************************//

  //************************* CREATE Campaign Records || START **********************************************//
  async getCampaignData(number) {
    const token = sessionStorage.getItem("token");
    if (!number || number.trim() === "") {
      return [];
    }
    // let response = await fetch(`${constants.API_BASE_URL}/api/whatsapp/campaign?whatsapp_setting_number=${number}`, {
    //   method: 'GET',
    //   mode: 'cors',
    //   headers: {
    //     'Content-Type': 'application/json',
    //     'Authorization': token
    //   }
    // });

    // if (response.status === 401) {
    //   authApi.refreshToken();
    // }

    let response = await helper.fetchWithAuth(`${constants.API_BASE_URL}/api/whatsapp/campaign?whatsapp_setting_number=${number}`, 'GET');
    const result = await response.json();
    return result;
  },

  async insertCampaignRecords(reqbody) {
    // const token = sessionStorage.getItem("token");
    // let response = await fetch(constants.API_BASE_URL + "/api/whatsapp/campaign", {
    //   method: 'POST',
    //   mode: 'cors',
    //   headers: {
    //     'Content-Type': 'application/json',
    //     'Authorization': token,
    //   },
    //   body: JSON.stringify(reqbody),
    // });

    let response = await helper.fetchWithAuth(constants.API_BASE_URL + "/api/whatsapp/campaign", 'POST', JSON.stringify(reqbody));
    return await response.json();
  },

  async updateCampaignRecord(data) {
    // const token = sessionStorage.getItem("token");
    // let response = await fetch(constants.API_BASE_URL + "/api/whatsapp/campaign/" + data.id, {
    //   method: "PUT",
    //   mode: "cors",
    //   headers: {
    //     "Content-Type": "application/json",
    //     "Authorization": token,
    //   },
    //   body: JSON.stringify(data),
    // }
    // );

    let response = await helper.fetchWithAuth(constants.API_BASE_URL + "/api/whatsapp/campaign/" + data.id, 'PUT', JSON.stringify(data));
    return await response.json();
  },

  async downloadCampaignFile(filename) {
    // const token = sessionStorage.getItem("token");
    try {
      // let response = await fetch(
      //   constants.API_BASE_URL + "/api/whatsapp/campaign/download/" + filename, {
      //   method: "GET",
      //   headers: {
      //     "Authorization": token
      //   }
      // }
      // );

      let response = await helper.fetchWithAuth(constants.API_BASE_URL + "/api/whatsapp/campaign/download/" + filename, 'GET');

      if (!response.ok) {
        if (response.status === 404) {
          return null;
        } else if (response.status === 401) {
          throw new Error("Unauthorized access. Please login.");
        } else {
          throw new Error("Failed to download file. Status: " + response.status);
        }
      }

      const fileBody = await response.blob();
      return fileBody;

    } catch (error) {
      console.error('Error downloading file:', error);
      throw error; // Re-throw error for further handling if needed
    }
  },

  async getMsgHistoryDownload(id) {// 
    // const token = sessionStorage.getItem("token");

    // let response = await fetch(constants.API_BASE_URL + "/api/whatsapp/message/history/download/" + id, {
    //   method: 'GET',
    //   mode: 'cors',
    //   headers: {
    //     'Content-Type': 'application/json',
    //     'Authorization': token
    //   }
    // });

    // if (response.status === 401) {
    //   authApi.refreshToken();
    // }

    let response = await helper.fetchWithAuth(constants.API_BASE_URL + "/api/whatsapp/message/history/download/" + id, 'GET');
    const result = await response.json();
    return result;

  },

  async deleteCampaignRecord(id) {//not use
    // const token = sessionStorage.getItem("token");
    // let response = await fetch(constants.API_BASE_URL + "/api/whatsapp/campaign/" + id, {
    //   method: "DELETE",
    //   mode: "cors",
    //   headers: {
    //     "Content-Type": "application/json",
    //     "Authorization": token,
    //   }
    // }
    // );

    let response = await helper.fetchWithAuth(constants.API_BASE_URL + "/api/whatsapp/campaign/" + id, 'DELETE');
    return await response.json();
  },

  async createCampaignFile(id, formData) {
    // const token = sessionStorage.getItem("token");
    // let response = await fetch(constants.API_BASE_URL + "/api/whatsapp/campaign/file/" + id, {
    //   method: "POST",
    //   mode: "cors",
    //   headers: {
    //     "Authorization": token,
    //   },
    //   body: formData,
    // }
    // );

    let response = await helper.fetchWithAuth(constants.API_BASE_URL + "/api/whatsapp/campaign/file/" + id, 'POST', formData, "form");
    return await response.json();
  },

  //************************* CREATE Campaign Records || END **********************************************//



  //************************* SEND WHATSAPP MESSAGE || START **********************************************//
  async sendWhatsAppTemplateMessage(reqbody, number) {
    const token = sessionStorage.getItem("token");
    if (!number || number.trim() === "") {
      return [];
    }
    // let response = await fetch(`${constants.API_BASE_URL}/api/webhook_template/message?whatsapp_setting_number=${number}`, {
    //   method: 'POST',
    //   mode: 'cors',
    //   headers: {
    //     'Content-Type': 'application/json',
    //     'Authorization': token,
    //   },
    //   body: JSON.stringify(reqbody),
    // });

    let response = await helper.fetchWithAuth(`${constants.API_BASE_URL}/api/webhook_template/message?whatsapp_setting_number=${number}`, 'POST', JSON.stringify(reqbody));
    return await response.json();
  },

  async sendSingleWhatsAppTextMessage(reqbody, number) {
    const token = sessionStorage.getItem("token");
    if (!number || number.trim() === "") {
      return [];
    }
    // let response = await fetch(`${constants.API_BASE_URL}/api/webhook_template/single/message?whatsapp_setting_number=${number}`, {
    //   method: 'POST',
    //   mode: 'cors',
    //   headers: {
    //     'Content-Type': 'application/json',
    //     'Authorization': token,
    //   },
    //   body: JSON.stringify(reqbody),
    // });

    let response = await helper.fetchWithAuth(`${constants.API_BASE_URL}/api/webhook_template/single/message?whatsapp_setting_number=${number}`, 'POST', JSON.stringify(reqbody));
    return await response.json();
  },
  // upload Documents get id
  async uploadDocumentWithApi(file, number) {
    if (!number || number.trim() === "") {
      return [];
    }
    // const token = sessionStorage.getItem("token");
    // let response = await fetch(`${constants.API_BASE_URL}/api/webhook_template/documentId?whatsapp_setting_number=${number}`, {
    //   method: 'POST',
    //   mode: 'cors',
    //   headers: {
    //     'Authorization': token,
    //   },
    //   body: file,
    // });

    let response = await helper.fetchWithAuth(`${constants.API_BASE_URL}/api/webhook_template/documentId?whatsapp_setting_number=${number}`, 'POST', file, "form");
    return await response.json();
  },

  //************************* SEND WHATSAPP MESSAGE || END **********************************************//

  //************************* CREATE MESSAGE HISTORY || START **********************************************//
  async getMsgHistoryRecords(number, business_number) {// 
    if (!business_number || business_number.trim() === "") {
      return [];
    }
    // const token = sessionStorage.getItem("token");
    // let response = await fetch(`${constants.API_BASE_URL}/api/whatsapp/message/history/${number}?whatsapp_setting_number=${business_number}`, {
    //   method: 'GET',
    //   mode: 'cors',
    //   headers: {
    //     'Content-Type': 'application/json',
    //     'Authorization': token
    //   }
    // });

    // if (response.status === 401) {
    //   authApi.refreshToken();
    // }

    let response = await helper.fetchWithAuth(`${constants.API_BASE_URL}/api/whatsapp/message/history/${number}?whatsapp_setting_number=${business_number}`, 'GET');
    const result = await response.json();
    return result;

  },

  async insertMsgHistoryRecords(reqbody) {
    // const token = sessionStorage.getItem("token");
    // let response = await fetch(constants.API_BASE_URL + "/api/whatsapp/message/history", {
    //   method: 'POST',
    //   mode: 'cors',
    //   headers: {
    //     'Content-Type': 'application/json',
    //     'Authorization': token,
    //   },
    //   body: JSON.stringify(reqbody),
    // });

    let response = await helper.fetchWithAuth(constants.API_BASE_URL + "/api/whatsapp/message/history", 'POST', JSON.stringify(reqbody));
    return await response.json();
  },

  async getGroupHistoryRecords(id, number) {// 
    if (!number || number.trim() === "") {
      return [];
    }
    // const token = sessionStorage.getItem("token");
    // let response = await fetch(`${constants.API_BASE_URL}/api/whatsapp/group/message/history/${id}?whatsapp_setting_number=${number}`, {
    //   method: 'GET',
    //   mode: 'cors',
    //   headers: {
    //     'Content-Type': 'application/json',
    //     'Authorization': token
    //   }
    // });

    // if (response.status === 401) {
    //   authApi.refreshToken();
    // }

    let response = await helper.fetchWithAuth(`${constants.API_BASE_URL}/api/whatsapp/group/message/history/${id}?whatsapp_setting_number=${number}`, 'GET');
    const result = await response.json();
    return result;

  },

  //************************* CREATE MESSAGE HISTORY || END **********************************************//

  // *******response Message || START ***********************************
  async getResponseMessageData() {
    // const token = sessionStorage.getItem("token");
    // let response = await fetch(constants.API_BASE_URL + "/api/response_message", {
    //   method: 'GET',
    //   mode: 'cors',
    //   headers: {
    //     'Content-Type': 'application/json',
    //     'Authorization': token
    //   }
    // });

    // if (response.status === 401) {
    //   authApi.refreshToken();
    // }

    let response = await helper.fetchWithAuth(constants.API_BASE_URL + "/api/response_message", 'GET');
    const result = await response.json();
    return result;
  },

  async inserResponseMessageRecord(reqbody) {
    // const token = sessionStorage.getItem("token");
    // let response = await fetch(constants.API_BASE_URL + "/api/response_message", {
    //   method: 'POST',
    //   mode: 'cors',
    //   headers: {
    //     'Content-Type': 'application/json',
    //     'Authorization': token,
    //   },
    //   body: JSON.stringify(reqbody),
    // });

    let response = await helper.fetchWithAuth(constants.API_BASE_URL + "/api/response_message", 'POST', JSON.stringify(reqbody));
    return await response.json();
  },

  async updateResponseMessageRecord(data) {
    // const token = sessionStorage.getItem("token");
    // let response = await fetch(constants.API_BASE_URL + "/api/response_message/" + data.id, {
    //   method: "PUT",
    //   mode: "cors",
    //   headers: {
    //     "Content-Type": "application/json",
    //     "Authorization": token,
    //   },
    //   body: JSON.stringify(data),
    // }
    // );

    let response = await helper.fetchWithAuth(constants.API_BASE_URL + "/api/response_message/" + data.id, 'PUT', JSON.stringify(data));
    return await response.json();
  },

  async deleteResponseMessageRecord(id) {
    // const token = sessionStorage.getItem("token");
    // let response = await fetch(constants.API_BASE_URL + "/api/response_message/" + id, {
    //   method: "DELETE",
    //   mode: "cors",
    //   headers: {
    //     "Content-Type": "application/json",
    //     "Authorization": token,
    //   }
    // });

    let response = await helper.fetchWithAuth(constants.API_BASE_URL + "/api/response_message/" + id, 'DELETE');
    return await response.json();
  },
  // *******response Message || END ***********************************



  //************START || GROUP  **************************************************/
  async fetchGroupsById(id) {
    // const token = sessionStorage.getItem("token");
    // let response = await fetch(constants.API_BASE_URL + "/api/whatsapp/groups/" + id, {
    //   method: 'GET',
    //   mode: 'cors',
    //   headers: {
    //     'Content-Type': 'application/json',
    //     'Authorization': token
    //   }
    // });

    let response = await helper.fetchWithAuth(constants.API_BASE_URL + "/api/whatsapp/groups/" + id, 'GET');
    return await response.json();
  },


  async fetchGroups(status) {
    // const token = sessionStorage.getItem("token");
    const params = new URLSearchParams({ status: status || '' }).toString();

    // let response = await fetch(constants.API_BASE_URL + "/api/whatsapp/groups?" + params, {
    //   method: 'GET',
    //   mode: 'cors',
    //   headers: {
    //     'Content-Type': 'application/json',
    //     'Authorization': token
    //   }
    // });

    // if (response.status === 401) {
    //   authApi.refreshToken();
    // }

    let response = await helper.fetchWithAuth(constants.API_BASE_URL + "/api/whatsapp/groups?" + params, 'GET');
    const result = await response.json();
    return result;

  },
  async createGroup(formData) {
    const token = sessionStorage.getItem("token");

    try {
      // let response = await fetch(constants.API_BASE_URL + "/api/whatsapp/groups", {
      //   method: 'POST',
      //   mode: 'cors',
      //   headers: {
      //     'Authorization': token,
      //   },
      //   body: formData,
      // });

      let response = await helper.fetchWithAuth(constants.API_BASE_URL + "/api/whatsapp/groups", 'POST', formData, "form");
      const jsonResponse = await response.json();

      if (!response.ok) {
        throw new Error(`Error: ${jsonResponse.message || "Unknown error"}`);
      }

      return jsonResponse;
    } catch (error) {
      //    console.log("Failed to create group:", error);
      throw error;
    }
  },
  async addMoreMembers(groupId, formData) {
    const token = sessionStorage.getItem("token");

    try {
      // let response = await fetch(constants.API_BASE_URL + "/api/whatsapp/groups/add_members/" + groupId, {
      //   method: 'POST',
      //   mode: 'cors',
      //   headers: {
      //     'Authorization': token,
      //   },
      //   body: formData,
      // });

      let response = await helper.fetchWithAuth(constants.API_BASE_URL + "/api/whatsapp/groups/add_members/" + groupId, 'POST', formData, "form");
      const jsonResponse = await response.json();

      if (!response.ok) {
        throw new Error(`Error: ${jsonResponse.message || "Unknown error"}`);
      }

      return jsonResponse;
    } catch (error) {
      //    console.log("Failed to create group:", error);
      throw error;
    }
  },

  async deleteGroupMember(member_id) {
    // const token = sessionStorage.getItem("token");
    // let response = await fetch(
    //   constants.API_BASE_URL + "/api/whatsapp/groups/member/" + member_id,
    //   {
    //     method: "DELETE",
    //     mode: "cors",
    //     headers: {
    //       "Content-Type": "application/json",
    //       "Authorization": token,
    //     }
    //   }
    // );

    let response = await helper.fetchWithAuth(constants.API_BASE_URL + "/api/whatsapp/groups/member/" + member_id, 'DELETE');
    return await response.json();
  },

  async changeGroupStatus(group_id, status) {
    // const token = sessionStorage.getItem("token");
    // const response = await fetch(
    //   `${constants.API_BASE_URL}/api/whatsapp/groups/${group_id}/status`,
    //   {
    //     method: "PUT",
    //     mode: "cors",
    //     headers: {
    //       "Content-Type": "application/json",
    //       "Authorization": token,
    //     },
    //     body: JSON.stringify({ status })
    //   }
    // );

    let response = await helper.fetchWithAuth(`${constants.API_BASE_URL}/api/whatsapp/groups/${group_id}/status`, 'PUT', JSON.stringify({ status }));
    return await response.json();
  },


  //************END || GROUP  **************************************************/

  // **************Lead || START ************************************
  // async fetchLead() {
  //   const token = sessionStorage.getItem("token");
  //   let response = await fetch(constants.API_BASE_URL + "/api/leads", {
  //     method: 'GET',
  //     mode: 'cors',
  //     headers: {
  //       'Content-Type': 'application/json',
  //       'Authorization': token
  //     }
  //   });

  //   if (response.status === 401) {
  //     authApi.refreshToken('fetchLead');
  //   }
  //   const result = await response.json();
  //   if (result.length > 0) {
  //     return result;
  //   }
  //   return null;
  // },

  async fetchLead() {
    let response = await helper.fetchWithAuth(constants.API_BASE_URL + "/api/leads", 'GET');

    // If the response is successful, return the result
    if (response.ok) {
      const result = await response.json();
      return result.length > 0 ? result : null;
    }

    console.log("Failed to fetch leads.");
    return null;
  },

  async fetchLeadById(id) {
    // const token = sessionStorage.getItem("token");
    // let response = await fetch(constants.API_BASE_URL + "/api/leads/" + id, {
    //   method: 'GET',
    //   mode: 'cors',
    //   headers: {
    //     'Content-Type': 'application/json',
    //     'Authorization': token
    //     // 'Content-Type': 'application/x-www-form-urlencoded',
    //   }
    // });

    let response = await helper.fetchWithAuth(constants.API_BASE_URL + "/api/leads/" + id, 'GET');

    const result = await response.json();

    return result;
  },

  async createLead(lead) {
    // const token = sessionStorage.getItem("token");
    // let response = await fetch(constants.API_BASE_URL + "/api/leads",
    //   {
    //     method: 'POST',
    //     mode: 'cors',
    //     headers: {
    //       'Content-Type': 'application/json',
    //       'Authorization': token,
    //     },
    //     body: JSON.stringify(lead),
    //   });

    let response = await helper.fetchWithAuth(constants.API_BASE_URL + "/api/leads", 'POST', JSON.stringify(lead));
    return await response.json();
  },
  
  async importLeads(lead) {
    let response = await helper.fetchWithAuth(constants.API_BASE_URL + "/api/leads/import", 'POST', JSON.stringify(lead));
    return await response.json();
  },

  async updateLead(lead) {
    // const token = sessionStorage.getItem("token");
    // let response = await fetch(
    //   constants.API_BASE_URL + "/api/leads/" + lead.id,
    //   {
    //     method: "PUT",
    //     mode: "cors",
    //     headers: {
    //       "Content-Type": "application/json",
    //       "Authorization": token,
    //     },
    //     body: JSON.stringify(lead),
    //   }
    // );

    let response = await helper.fetchWithAuth(constants.API_BASE_URL + "/api/leads/" + lead.id, 'PUT', JSON.stringify(lead));
    return await response.json();
  },

  async deleteLead(id) {
    // const token = sessionStorage.getItem("token");
    // let response = await fetch(
    //   constants.API_BASE_URL + "/api/leads/" + id,
    //   {
    //     method: "DELETE",
    //     mode: "cors",
    //     headers: {
    //       "Content-Type": "application/json",
    //       "Authorization": token,
    //     }
    //   }
    // );

    let response = await helper.fetchWithAuth(constants.API_BASE_URL + "/api/leads/" + id, 'DELETE');
    return await response.json();
  },

  // **************Lead || END ************************************



  async fetchLeadCount() {
    // const token = sessionStorage.getItem("token");
    // let response = await fetch(constants.API_BASE_URL + "/api/whatsapp/common/leadcount", {
    //   method: 'GET',
    //   mode: 'cors',
    //   headers: {
    //     'Content-Type': 'application/json',
    //     'Authorization': token
    //   }
    // });

    // if (response.status === 401) {
    //   authApi.refreshToken();
    // }

    let response = await helper.fetchWithAuth(constants.API_BASE_URL + "/api/whatsapp/common/leadcount", 'GET');
    const result = await response.json();
    return result;

  },

  async fetchallActiveGroups() {
    // const token = sessionStorage.getItem("token");
    // let response = await fetch(constants.API_BASE_URL + "/api/whatsapp/common/activegroups", {
    //   method: 'GET',
    //   mode: 'cors',
    //   headers: {
    //     'Content-Type': 'application/json',
    //     'Authorization': token
    //   }
    // });

    // if (response.status === 401) {
    //   authApi.refreshToken();
    // }

    let response = await helper.fetchWithAuth(constants.API_BASE_URL + "/api/whatsapp/common/activegroups", 'GET');
    const result = await response.json();
    return result;

  },

  async fetchCampaignStatusCounts(business_number) {
    if (!business_number || business_number.trim() === "") {
      return [];
    }
    // const token = sessionStorage.getItem("token");
    // let response = await fetch(constants.API_BASE_URL + "/api/whatsapp/common/campaignstatus/" + business_number, {
    //   method: 'GET',
    //   mode: 'cors',
    //   headers: {
    //     'Content-Type': 'application/json',
    //     'Authorization': token
    //   }
    // });

    // if (response.status === 401) {
    //   authApi.refreshToken();
    // }

    let response = await helper.fetchWithAuth(constants.API_BASE_URL + "/api/whatsapp/common/campaignstatus/" + business_number, 'GET');
    const result = await response.json();
    return result;
  },

  async fetchAutoResponseCount() {
    // const token = sessionStorage.getItem("token");
    // let response = await fetch(constants.API_BASE_URL + "/api/whatsapp/common/autoresponse", {
    //   method: 'GET',
    //   mode: 'cors',
    //   headers: {
    //     'Content-Type': 'application/json',
    //     'Authorization': token
    //   }
    // });

    // if (response.status === 401) {
    //   authApi.refreshToken();
    // }

    let response = await helper.fetchWithAuth(constants.API_BASE_URL + "/api/whatsapp/common/autoresponse", 'GET');
    const result = await response.json();
    return result;
  },

  async fetchChatGptResponse(prompt) {
    const token = sessionStorage.getItem("token");

    // let response = await fetch(constants.API_BASE_URL + "/api/whatsapp/common/chatgpt", {
    //   method: 'POST',
    //   headers: {
    //     'Content-Type': 'application/json',
    //     'Authorization': token // Use the token variable directly
    //   },
    //   body: JSON.stringify({ prompt })
    // });

    let response = await helper.fetchWithAuth(constants.API_BASE_URL + "/api/whatsapp/common/chatgpt", 'POST', JSON.stringify({ prompt }));

    if (!response.ok) {
      const errorText = await response.text(); // Get error message from response
      return { success: false, message: errorText || 'Failed to get ChatGPT response' };
    }

    const data = await response.json();
    return data;
  },



  async getRazorPayData(obj) {
    const token = sessionStorage.getItem("token");
    // let response = await fetch(constants.API_BASE_URL + "/api/whatsapp/online_payment", {
    //   method: 'POST',
    //   headers: {
    //     'Content-Type': 'application/json',
    //     'Authorization': token // Use the token variable directly
    //   },
    //   body: JSON.stringify(obj)
    // });

    let response = await helper.fetchWithAuth(constants.API_BASE_URL + "/api/whatsapp/online_payment", 'POST', JSON.stringify(obj));
    if (!response.ok) {
      throw new Error(`Error fetching Razorpay data: ${response.statusText}`);
    }
    const data = await response.json();
    return data;
  },

  async pdfData(obj, number) {
    const token = sessionStorage.getItem("token");
    if (!number || number.trim() === "") {
      return [];
    }
    // let response = await fetch(`${constants.API_BASE_URL}/api/webhook_template/proxy?whatsapp_setting_number=${number}`, {
    //   method: 'POST',
    //   mode: 'cors',
    //   headers: {
    //     'Authorization': token,
    //     'Content-Type': 'application/json',
    //   },
    //   body: JSON.stringify(obj),
    // });

    let response = await helper.fetchWithAuth(`${constants.API_BASE_URL}/api/webhook_template/proxy?whatsapp_setting_number=${number}`, 'POST', JSON.stringify(obj));
    return await response.json();
  },

  async activateWhatsAppSetting(setting_id) {
    // const token = sessionStorage.getItem("token");

    // let response = await fetch(
    //   `${constants.API_BASE_URL}/api/whatsapp_setting/activate/${setting_id}`,
    //   {
    //     method: "PUT",
    //     mode: "cors",
    //     headers: {
    //       "Authorization": token,
    //     }

    //   }
    // );

    let response = await helper.fetchWithAuth(`${constants.API_BASE_URL}/api/whatsapp_setting/activate/${setting_id}`, 'PUT');
    return await response.json();
  },

  async getModuleData(status = null) {
    // const token = sessionStorage.getItem("token");
    const queryParam = status ? `?status=${status}` : '';
    // let response = await fetch(constants.API_BASE_URL + `/api/whatsapp/module${queryParam}`, {
    //   method: 'GET',
    //   mode: 'cors',
    //   headers: {
    //     'Content-Type': 'application/json',
    //     'Authorization': token
    //   }
    // });

    // if (response.status === 401) {
    //   authApi.refreshToken();
    // }

    let response = await helper.fetchWithAuth(constants.API_BASE_URL + `/api/whatsapp/module${queryParam}`, 'GET');
    const result = await response.json();
    return result;
  },


  async insertModuleRecord(reqbody) {
    // const token = sessionStorage.getItem("token");
    // let response = await fetch(constants.API_BASE_URL + "/api/whatsapp/module", {
    //   method: 'POST',
    //   mode: 'cors',
    //   headers: {
    //     'Content-Type': 'application/json',
    //     'Authorization': token,
    //   },
    //   body: JSON.stringify(reqbody),
    // });

    let response = await helper.fetchWithAuth(constants.API_BASE_URL + "/api/whatsapp/module", 'POST', JSON.stringify(reqbody));
    return await response.json();
  },

  async updateModuleRecord(data) {
    // const token = sessionStorage.getItem("token");
    // let response = await fetch(constants.API_BASE_URL + "/api/whatsapp/module/" + data.id, {
    //   method: "PUT",
    //   mode: "cors",
    //   headers: {
    //     "Content-Type": "application/json",
    //     "Authorization": token,
    //   },
    //   body: JSON.stringify(data),
    // }
    // );

    let response = await helper.fetchWithAuth(constants.API_BASE_URL + "/api/whatsapp/module/" + data.id, 'PUT', JSON.stringify(data));
    return await response.json();
  },

  async deleteModuleRecord(id) {
    // const token = sessionStorage.getItem("token");
    // let response = await fetch(
    //   constants.API_BASE_URL + "/api/whatsapp/module/" + id,
    //   {
    //     method: "DELETE",
    //     mode: "cors",
    //     headers: {
    //       "Content-Type": "application/json",
    //       "Authorization": token,
    //     }
    //   }
    // );

    let response = await helper.fetchWithAuth(constants.API_BASE_URL + "/api/whatsapp/module/" + id, 'DELETE');
    return await response.json();
  },


  async getPlanData(status = null) {
    // const token = sessionStorage.getItem("token");
    const queryParam = status ? `?status=${status}` : '';
    // let response = await fetch(constants.API_BASE_URL + `/api/whatsapp/plan${queryParam}`, {
    //   method: 'GET',
    //   mode: 'cors',
    //   headers: {
    //     'Content-Type': 'application/json',
    //     'Authorization': token
    //   }
    // });

    // if (response.status === 401) {
    //   authApi.refreshToken();
    // }

    let response = await helper.fetchWithAuth(constants.API_BASE_URL + `/api/whatsapp/plan${queryParam}`, 'GET');
    const result = await response.json();
    return result;
  },


  async getPlansById(id) {
    // const token = sessionStorage.getItem("token");
    // let response = await fetch(constants.API_BASE_URL + "/api/whatsapp/plan/" + id, {
    //   method: 'GET',
    //   mode: 'cors',
    //   headers: {
    //     'Content-Type': 'application/json',
    //     'Authorization': token
    //   }
    // });

    // if (response.status === 401) {
    //   authApi.refreshToken();
    // }

    let response = await helper.fetchWithAuth(constants.API_BASE_URL + "/api/whatsapp/plan/" + id, 'GET');
    const result = await response.json();
    return result;
  },



  async insertPlanRecord(reqbody) {
    // const token = sessionStorage.getItem("token");
    // let response = await fetch(constants.API_BASE_URL + "/api/whatsapp/plan", {
    //   method: 'POST',
    //   mode: 'cors',
    //   headers: {
    //     'Content-Type': 'application/json',
    //     'Authorization': token,
    //   },
    //   body: JSON.stringify(reqbody),
    // });

    let response = await helper.fetchWithAuth(constants.API_BASE_URL + "/api/whatsapp/plan", 'POST', JSON.stringify(reqbody));
    return await response.json();
  },

  async updatePlanRecord(data) {
    // const token = sessionStorage.getItem("token");
    // let response = await fetch(constants.API_BASE_URL + "/api/whatsapp/plan/" + data.plan_info.id, {
    //   method: "PUT",
    //   mode: "cors",
    //   headers: {
    //     "Content-Type": "application/json",
    //     "Authorization": token,
    //   },
    //   body: JSON.stringify(data),
    // }
    // );

    let response = await helper.fetchWithAuth(constants.API_BASE_URL + "/api/whatsapp/plan/" + data.plan_info.id, 'PUT', JSON.stringify(data));
    return await response.json();
  },

  async deletePlanRecord(id) {
    // const token = sessionStorage.getItem("token");
    // let response = await fetch(
    //   constants.API_BASE_URL + "/api/whatsapp/plan/" + id,
    //   {
    //     method: "DELETE",
    //     mode: "cors",
    //     headers: {
    //       "Content-Type": "application/json",
    //       "Authorization": token,
    //     }
    //   }
    // );

    let response = await helper.fetchWithAuth(constants.API_BASE_URL + "/api/whatsapp/plan/" + id, 'DELETE');
    return await response.json();
  },


  async fetchCompany(is_active = null) {
    // const token = sessionStorage.getItem("token");
    const queryParam = is_active ? `?is_active=${is_active}` : '';
    // let response = await fetch(constants.API_BASE_URL + `/api/company${queryParam}`, {
    //   method: 'GET',
    //   mode: 'cors',
    //   headers: {
    //     'Content-Type': 'application/json',
    //     'Authorization': token
    //   }
    // });

    // if (response.status === 401) {
    //   authApi.refreshToken();
    // }

    let response = await helper.fetchWithAuth(constants.API_BASE_URL + `/api/company${queryParam}`, 'GET');
    const result = await response.json();
    return result;
  },



  async fetchSourceSchemas() {
    // const token = sessionStorage.getItem("token");
    // let response = await fetch(constants.API_BASE_URL + "/api/company/all/getschema", {
    //   method: 'GET',
    //   mode: 'cors',
    //   headers: {
    //     'Content-Type': 'application/json',
    //     'Authorization': token
    //   }
    // });

    // if (response.status === 401) {
    //   authApi.refreshToken();
    // }

    let response = await helper.fetchWithAuth(constants.API_BASE_URL + "/api/company/all/getschema", 'GET');
    const result = await response.json();
    return result;
  },

  async createCompany(companyData) {
    const formData = new FormData();

    formData.append('logo', companyData.company_info.logourl);
    formData.append('request', JSON.stringify(companyData));

    let files = [companyData.company_info.logourl];
    formData.append('files', files);

    // const token = sessionStorage.getItem("token");
    // let response = await fetch(constants.API_BASE_URL + "/api/company", {
    //   method: 'POST',
    //   mode: 'cors',
    //   headers: {
    //     'Authorization': token,
    //   },
    //   body: formData,
    // });

    let response = await helper.fetchWithAuth(constants.API_BASE_URL + "/api/company", 'POST', formData, "form");
    return await response.json();
  },



  async findCompanyWithUser(id) {
    // const token = sessionStorage.getItem("token");
    // let response = await fetch(constants.API_BASE_URL + "/api/company/detail/" + id, {
    //   method: 'GET',
    //   mode: 'cors',
    //   headers: {
    //     'Content-Type': 'application/json',
    //     'Authorization': token
    //   }
    // });

    // if (response.status === 401) {
    //   authApi.refreshToken();
    // }

    let response = await helper.fetchWithAuth(constants.API_BASE_URL + "/api/company/detail/" + id, 'GET');
    const result = await response.json();
    return result;
  },

  async updateCompanyWithUser(companyData) {
    const formData = new FormData();

    formData.append('logo', companyData.company_info.logourl);
    formData.append('request', JSON.stringify(companyData));
    // const token = sessionStorage.getItem("token");
    // let response = await fetch(constants.API_BASE_URL + "/api/company/updateCompanyWithUser", {
    //   method: "PUT",
    //   mode: "cors",
    //   headers: {
    //     "Authorization": token,
    //   },
    //   body: formData,
    // }
    // );

    let response = await helper.fetchWithAuth(constants.API_BASE_URL + "/api/company/updateCompanyWithUser", 'PUT', formData, "form");
    return await response.json();
  },



  async getCompanyRecordsById(id) {
    // const token = sessionStorage.getItem("token");
    // let response = await fetch(constants.API_BASE_URL + "/api/company/" + id, {
    //   method: 'GET',
    //   mode: 'cors',
    //   headers: {
    //     'Content-Type': 'application/json',
    //     'Authorization': token
    //   }
    // });

    // if (response.status === 401) {
    //   authApi.refreshToken();
    // }

    let response = await helper.fetchWithAuth(constants.API_BASE_URL + "/api/company/" + id, 'GET');
    const result = await response.json();
    return result;
  },


  async updateCompany(records) {
    // const token = sessionStorage.getItem("token");
    // let response = await fetch(constants.API_BASE_URL + "/api/company/" + records.id, {
    //   method: "PUT",
    //   mode: "cors",
    //   headers: {
    //     "Content-Type": "application/json",
    //     "Authorization": token,
    //   },
    //   body: JSON.stringify(records),
    // }
    // );

    let response = await helper.fetchWithAuth(constants.API_BASE_URL + "/api/company/" + records.id, 'PUT', JSON.stringify(records));
    return await response.json();
  },


  async getInvoicesRecord(status) {
    // const token = sessionStorage.getItem("token");
    const queryParam = status ? `?status=${status}` : '';
    // let response = await fetch(constants.API_BASE_URL + `/api/invoice${queryParam}`, {
    //   method: 'GET',
    //   mode: 'cors',
    //   headers: {
    //     'Content-Type': 'application/json',
    //     'Authorization': token
    //   }
    // });

    // if (response.status === 401) {
    //   authApi.refreshToken();
    // }

    let response = await helper.fetchWithAuth(constants.API_BASE_URL + `/api/invoice${queryParam}`, 'GET');
    const result = await response.json();
    return result;
  },


  async fetchCompanyAndUserByInvoice(id) {
    // const token = sessionStorage.getItem("token");
    // let response = await fetch(constants.API_BASE_URL + "/api/invoice/i/" + id, {
    //   method: 'GET',
    //   mode: 'cors',
    //   headers: {
    //     'Content-Type': 'application/json',
    //     'Authorization': token
    //   }
    // });

    // if (response.status === 401) {
    //   authApi.refreshToken();
    // }

    let response = await helper.fetchWithAuth(constants.API_BASE_URL + "/api/invoice/i/" + id, 'GET');
    const result = await response.json();
    return result;
  },

  async getInvoicesByCompanyId(companyId) {
    // const token = sessionStorage.getItem("token");
    // let response = await fetch(constants.API_BASE_URL + "/api/invoice/company/" + companyId, {
    //   method: 'GET',
    //   mode: 'cors',
    //   headers: {
    //     'Content-Type': 'application/json',
    //     'Authorization': token
    //   }
    // });

    // if (response.status === 401) {
    //   authApi.refreshToken();
    // }

    let response = await helper.fetchWithAuth(constants.API_BASE_URL + "/api/invoice/company/" + companyId, 'GET');
    const result = await response.json();
    return result;
  },


  async getInvoiceById(id) {
    // const token = sessionStorage.getItem("token");
    // let response = await fetch(constants.API_BASE_URL + "/api/invoice/" + id, {
    //   method: 'GET',
    //   mode: 'cors',
    //   headers: {
    //     'Content-Type': 'application/json',
    //     'Authorization': token
    //   }
    // });

    // if (response.status === 401) {
    //   authApi.refreshToken();
    // }

    let response = await helper.fetchWithAuth(constants.API_BASE_URL + "/api/invoice/" + id, 'GET');
    const result = await response.json();
    return result;
  },



  async updateInvoiceRecord(records) {
    // const token = sessionStorage.getItem("token");
    // let response = await fetch(constants.API_BASE_URL + "/api/invoice/" + records.id, {
    //   method: "PUT",
    //   mode: "cors",
    //   headers: {
    //     "Content-Type": "application/json",
    //     "Authorization": token,
    //   },
    //   body: JSON.stringify(records),
    // }
    // );

    let response = await helper.fetchWithAuth(constants.API_BASE_URL + "/api/invoice/" + records.id, 'PUT', JSON.stringify(records));
    return await response.json();
  },



  async addInvoiceWithTransaction(records) {
    // const token = sessionStorage.getItem("token");
    // let response = await fetch(constants.API_BASE_URL + "/api/invoice/invoiceWithTransaction", {
    //   method: 'POST',
    //   mode: 'cors',
    //   headers: {
    //     "Content-Type": "application/json",
    //     'Authorization': token,
    //   },
    //   body: JSON.stringify(records),
    // });

    let response = await helper.fetchWithAuth(constants.API_BASE_URL + "/api/invoice/invoiceWithTransaction", 'POST', JSON.stringify(records));
    return await response.json();
  },



  async updateInvoiceAddTransaction(records) {
    // const token = sessionStorage.getItem("token");
    // let response = await fetch(constants.API_BASE_URL + "/api/invoice/updateInvoiceAddTrans/" + records.id, {
    //   method: "PUT",
    //   mode: "cors",
    //   headers: {
    //     "Content-Type": "application/json",
    //     "Authorization": token,
    //   },
    //   body: JSON.stringify(records),
    // }
    // );

    let response = await helper.fetchWithAuth(constants.API_BASE_URL + "/api/invoice/updateInvoiceAddTrans/" + records.id, 'PUT', JSON.stringify(records));
    return await response.json();
  },

  async duplicateEmailCheck(email, id) {
    // const token = sessionStorage.getItem("token");
    // let response = await fetch(constants.API_BASE_URL + "/api/company/emailcheck", {
    //   method: 'POST',
    //   mode: 'cors',
    //   headers: {
    //     'Content-Type': 'application/json',
    //     'Authorization': token,
    //   },
    //   body: JSON.stringify({ email, id }),
    // });

    let response = await helper.fetchWithAuth(constants.API_BASE_URL + "/api/company/emailcheck", 'POST', JSON.stringify({ email, id }));
    return await response.json();
  },


  async getAllLeads() {
    // const token = sessionStorage.getItem("token");
    // let response = await fetch(constants.API_BASE_URL + `/api/publicleads`, {
    //   method: 'GET',
    //   mode: 'cors',
    //   headers: {
    //     'Content-Type': 'application/json',
    //     'Authorization': token
    //   }
    // });

    // if (response.status === 401) {
    //   authApi.refreshToken();
    // }

    let response = await helper.fetchWithAuth(constants.API_BASE_URL + `/api/publicleads`, 'GET');
    const result = await response.json();
    return result;
  },


  async createPublicLead(lead) {
    // const token = sessionStorage.getItem("token");
    // let response = await fetch(constants.API_BASE_URL + "/api/publicleads",
    //   {
    //     method: 'POST',
    //     mode: 'cors',
    //     headers: {
    //       'Content-Type': 'application/json',
    //       'Authorization': token,
    //     },
    //     body: JSON.stringify(lead),

    //   });

    let response = await helper.fetchWithAuth(constants.API_BASE_URL + "/api/publicleads", 'POST', JSON.stringify(lead));
    return await response.json();
  },

  async updatePublicLead(lead) {
    // const token = sessionStorage.getItem("token");
    // let response = await fetch(
    //   constants.API_BASE_URL + "/api/publicleads/" + lead.id,
    //   {
    //     method: "PUT",
    //     mode: "cors",
    //     headers: {
    //       "Content-Type": "application/json",
    //       "Authorization": token,
    //     },
    //     body: JSON.stringify(lead),
    //   }
    // );

    let response = await helper.fetchWithAuth(constants.API_BASE_URL + "/api/publicleads/" + lead.id, 'PUT', JSON.stringify(lead));
    return await response.json();
  },

  async deletePublicLead(id) {
    // const token = sessionStorage.getItem("token");
    // let response = await fetch(
    //   constants.API_BASE_URL + "/api/publicleads/" + id,
    //   {
    //     method: "DELETE",
    //     mode: "cors",
    //     headers: {
    //       "Content-Type": "application/json",
    //       "Authorization": token,
    //     }
    //   }
    // );

    let response = await helper.fetchWithAuth(constants.API_BASE_URL + "/api/publicleads/" + id, 'DELETE');
    return await response.json();
  },

  async sendInvoiceMail(imgData, invoiceData) {
    // const token = sessionStorage.getItem("token");
    // let response = await fetch(constants.API_BASE_URL + "/api/mail/invoice/", {
    //   method: 'POST',
    //   mode: 'cors',
    //   headers: {
    //     'Content-Type': 'application/json',
    //     'Authorization': token,
    //   },
    //   body: JSON.stringify({ imgData, invoiceData }),
    // });

    let response = await helper.fetchWithAuth(constants.API_BASE_URL + "/api/mail/invoice/", 'POST', JSON.stringify({ imgData, invoiceData }));
    // console.log('resp: ', await response.json())
    return await response.json();
  },

  async getSetting(name) {
    let response = await helper.fetchWithAuth(constants.API_BASE_URL + `/api/whatsapp/common/setting/` + name, 'GET');
    const result = await response.json();
    return result;
  },

  async getBillingCostsBySetting(selectedWhatsAppSetting, start, end) {
    let response = await helper.fetchWithAuth(`${constants.API_BASE_URL}/api/whatsapp_setting/billing-cost/${selectedWhatsAppSetting}/${start}/${end}`, 'GET');
    // console.log('resp: ', await response.json())
    return await response.json();
  },

  async insertCampaignParamsRecords(reqbody) {
    let response = await helper.fetchWithAuth(constants.API_BASE_URL + "/api/whatsapp/campaign/params", 'POST', JSON.stringify(reqbody));
    return await response.json();
  },


}






// **************************





export default WhatsAppAPI