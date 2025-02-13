// export const API_BASE_URL = `${window.location.protocol}//${window.location.hostname}/swp`;
export const API_BASE_URL = "http://localhost:4004";
//export const API_BASE_URL= "https://spark.indicrm.io/ibs";
// export const API_BASE_URL= "http://192.168.6.50:3056";

export const VIEW_LEAD = "VIEW_LEAD";
export const VIEW_PROPERTY = "VIEW_PROPERTY";
export const EDIT_LEAD = "EDIT_LEAD";
export const DELETE_LEAD = "DELETE_LEAD";
export const VIEW_PRODUCT = "VIEW_PRODUCT";
export const EDIT_PRODUCT = "EDIT_PRODUCT";
export const DELETE_PRODUCT = "DELETE_PRODUCT";
export const MODIFY_ALL = "MODIFY_ALL";
export const VIEW_ALL = "VIEW_ALL";
export const VIEW_ORDER = "VIEW_ORDER";
export const VIEW_USER = "VIEW_USER";
export const VIEW_CONTACT = "VIEW_CONTACT";
export const EDIT_CONTACT = "EDIT_CONTACT";
export const DELETE_CONTACT = "DELETE_CONTACT";
export const VIEW_ACCOUNT = "VIEW_ACCOUNT";
export const EDIT_ACCOUNT = "EDIT_ACCOUNT";
export const DELETE_ACCOUNT = "DELETE_ACCOUNT";
export const VIEW_BUSINESS = "VIEW_BUSINESS";
export const EDIT_BUSINESS = "EDIT_BUSINESS";
export const DELETE_BUSINESS = "DELETE_BUSINESS";
//FILE TYPES
export const PDF = "pdf";
export const DOC = "doc";
export const DOCX = "docx";
export const XLS = "xls";
export const XLSX = "xlsx";
export const CSV = "csv";
export const PNG = "png";
export const JPG = "jpg";
export const JPEG = "jpeg";

// export const LEAD_STATUS_VALUES = [{label : 'Open - Not Contacted', islast : false}, {label : 'Working Contacted', islast : false} , {label : 'Closed - Converted', islast : true}, {label : 'Closed - Not Converted', islast : true}];
export const LEAD_STATUS_VALUES = [
  {
    label: "Open - Not Contacted",
    sortorder: 1,
    is_converted: false,
    is_lost: false,
  },
  {
    label: "Working - Contacted",
    sortorder: 2,
    is_converted: false,
    is_lost: false,
  },
  {
    label: "Closed - Converted",
    sortorder: 3,
    is_converted: true,
    is_lost: false,
  },
  {
    label: "Closed - Not Converted",
    sortorder: 4,
    is_converted: false,
    is_lost: true,
  },
];
