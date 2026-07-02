import { io } from "socket.io-client";
import { getSocketLink } from "../axiosInterceptor";
const userToken = JSON.parse(localStorage.getItem("loggedInUser"))?.token;
const companyBranch = JSON.parse(
  localStorage.getItem("branchData")
)?.company_branch;

export default io(getSocketLink(), {
  extraHeaders: {
    token: userToken,
  },
  auth: {
    token: userToken,
    companyBranch: companyBranch,
  },
  transports: ["websocket"],
});
