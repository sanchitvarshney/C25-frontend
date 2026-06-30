import axios from "axios";
import { getGlobalToast } from "./context/ToastContext";
import { v4 as uuidv4 } from 'uuid';
import { getCurrentIndianFinancialYearSession } from "./utils/indianFinancialYear";

function normalizeSocketUrl(url) {
  if (url == null || typeof url !== "string") return "";
  const t = url.trim();
  if (!t) return "";
  if (/^https?:\/\//i.test(t)) return t;
  return `https://${t.replace(/^\/+/, "")}`;
}

const generateUniqueId = () => {
  return uuidv4();
};
const generateTriggerUidHeader = () => {
  const uid = generateUniqueId().replaceAll("-", "");
  const timestamp = formatTimestamp();
  return `${uid}:${timestamp}`;
};

/** Same as Oakter: localStorage currentSocketUrl, then env (socket.io needs a URL with protocol). */
export function getSocketLink() {
  const raw =
    localStorage.getItem("currentSocketUrl") ||
    import.meta.env.VITE_REACT_APP_SOCKET_BASE_URL ||
    "";
  return normalizeSocketUrl(raw);
}

const isSwitchInProgress = () => localStorage.getItem("switchInProgress") === "1";

// Function to get the current API base URL dynamically
const getImsLink = () => {
  return localStorage.getItem("currentUrl") || import.meta.env.VITE_REACT_APP_API_BASE_URL;
};

const imsLink = getImsLink(); // Initial value



const formatTimestamp = () => {
  const now = new Date();
  const day = String(now.getDate()).padStart(2, "0");
  const month = String(now.getMonth() + 1).padStart(2, "0"); // Months are 0-based
  const year = String(now.getFullYear()).slice(-4); // Last 2 digits of the year
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  const seconds = String(now.getSeconds()).padStart(2, "0");

  return `${day}${month}${year}${hours}${minutes}${seconds}`;
};
const getToken = () => {
  const newToken = localStorage.getItem("newToken");
  if (newToken) {
    return newToken;
  }
  return JSON.parse(localStorage.getItem("loggedInUser"))?.token;
};
const getBranchFromStorage = () => {
  const branchData = JSON.parse(localStorage.getItem("branchData") || "{}");
  const user = JSON.parse(localStorage.getItem("loggedInUser") || "{}");
  return branchData?.company_branch || user?.company_branch || "BRALWR36";
};
const getSessionFromStorage = () => {
  const branchData = JSON.parse(localStorage.getItem("branchData") || "{}");
  const user = JSON.parse(localStorage.getItem("loggedInUser") || "{}");
  return branchData?.session || user?.session || getCurrentIndianFinancialYearSession();
};
const imsAxios = axios.create({
  baseURL: imsLink,
  headers: {

 "Authorization": `${getToken()||""}`,
  
  },
});
imsAxios.interceptors.request.use(
  (config) => {
    // During module-switch auth, block all non-switch requests to avoid 401/logout loops
    const url = String(config?.url || "");
    if (isSwitchInProgress() && !url.includes("/auth/switch")) {
      return Promise.reject(new axios.Cancel("Switch in progress"));
    }

    // Update baseURL dynamically from localStorage on each request
    const currentUrl = getImsLink();
    if (currentUrl) {
      config.baseURL = currentUrl;
    }

    // Generate a new UUID and timestamp for each request
    const newId = generateUniqueId();
    const timestamp = formatTimestamp();
    const triggerUid = generateTriggerUidHeader();

    // Add headers
    config.headers["timeStamp"] = timestamp;
    config.headers["newId"] = newId;
    config.headers["x-trigger-uid"] = triggerUid;

    // Use newToken if available, otherwise use loggedInUser token
    const token =  getToken();
    if (token) {
      config.headers["Authorization"] = `${token}`;
    } 

    const branch = getBranchFromStorage();
    const session = getSessionFromStorage();
    config.headers["Company-Branch"] = branch;
    config.headers["Session"] = session;
    config.headers["x-window-url"] = window.location.href;

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

imsAxios.interceptors.response.use(
  (response) => {
    if (response.data?.success !== undefined) {
      return response.data;
    }
    return response;
  },
  (error) => {
    if (axios.isCancel?.(error)) {
      return Promise.reject(error);
    }
    const showToast = getGlobalToast();
    
    if (error?.code === "ERR_BAD_REQUEST" && error?.response?.status === 404) {
       if (showToast) showToast(error?.message || "Something went wrong, Please contact administrator", "error");
       return error;
    }
    if (typeof error.response?.data === "object") {
      if (error.response.data?.data?.logout) {
        if (showToast) showToast(error.response.data.message, "error");
        localStorage.clear();
        window.location.reload();
        return error;
      }
      if (error?.response.data.success !== undefined) {
      
        if (showToast) showToast(error.response.data.message, "error");
      }
  
      return error.response.data;
    }

  
    if (!error.response.data?.message) {
      if (showToast) showToast(error.response?.data, "error");
    }
    // }
    return error.response;
  }
);

const branch = getBranchFromStorage();
const session = getSessionFromStorage();

imsAxios.defaults.headers["Company-Branch"] = branch;
imsAxios.defaults.headers["Session"] = session;

export { imsAxios };
