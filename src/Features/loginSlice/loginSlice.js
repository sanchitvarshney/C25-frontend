import { createSlice } from "@reduxjs/toolkit";

import { imsAxios } from "../../axiosInterceptor";
import {
  getCurrentIndianFinancialYearSession,
  resolveSessionToCurrentFinancialYearIfStale,
} from "../../utils/indianFinancialYear";
const rawLoggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));
const branchDataForInit = JSON.parse(
  localStorage.getItem("branchData") || "{}",
);
const effectiveStoredSession =
  branchDataForInit?.session ?? rawLoggedInUser?.session;
const resolvedSessionForInit = resolveSessionToCurrentFinancialYearIfStale(
  effectiveStoredSession,
);
if (resolvedSessionForInit !== effectiveStoredSession) {
  localStorage.setItem(
    "branchData",
    JSON.stringify({
      ...branchDataForInit,
      session: resolvedSessionForInit,
    }),
  );
  if (rawLoggedInUser) {
    localStorage.setItem(
      "loggedInUser",
      JSON.stringify({ ...rawLoggedInUser, session: resolvedSessionForInit }),
    );
  }
  imsAxios.defaults.headers["Session"] = resolvedSessionForInit;
}

let fav =
  typeof rawLoggedInUser?.favPages == "string"
    ? JSON.parse(rawLoggedInUser?.favPages)
    : rawLoggedInUser?.favPages;

const initialState = {
  user: rawLoggedInUser
    ? {
        ...JSON.parse(localStorage.getItem("loggedInUser")),
        favPages: fav,
        company_branch: JSON.parse(localStorage.getItem("branchData"))
          ?.company_branch,
        session: resolvedSessionForInit,
        passwordChanged: "C",
        showlegal:
          JSON.parse(localStorage.getItem("loggedInUser"))?.department ===
          "legal"
            ? true
            : false,
      }
    : null,
  testPages: JSON.parse(localStorage.getItem("branchData"))?.testPages,
  editVBT: JSON.parse(localStorage.getItem("editVBT")),

  notifications: JSON.parse(localStorage.getItem("userNotifications")) ?? [],
  editINV: JSON.parse(localStorage.getItem("editINV")),
  currentLinks: JSON.parse(localStorage.getItem("currentLinks")),
  mobileConfirmed: JSON.parse(localStorage.getItem("loggedInUser"))
    ?.mobileConfirmed,
  emailConfirmed: JSON.parse(localStorage.getItem("loggedInUser"))
    ?.emailConfirmed,
  loading: false,
  token: null,
  message: "",
  userDepartment: "",
  settings: JSON.parse(localStorage.getItem("imsSettings")) ?? null,
};
// export const loginAuth = createAsyncThunk(
//   "auth/login",
//   async (user, thunkAPI) => {
//     try {
//       const response = await imsAxios.post("/auth/signin", {
//         username: user.username,
//         password: user.password,
//       });
//       if (response.success) {
//         localStorage.setItem(
//           "loggedInUser",
//           JSON.stringify({
//             userName: data.data.username,
//             token: data.data.token,
//             phone: data.data.crn_mobile,
//             email: data.data.crn_email,
//             department: data.data.department,
//             id: data.data.crn_id,
//             favPages: data.data.fav_pages,
//             type: data.data.crn_type,
//             mobileConfirmed: data.data.other.m_v,
//             emailConfirmed: data.data.other.e_v,
//             passwordChanged: data.data.other.c_p ?? "C",
//             showlegal: data.data.department === "legal" ? true : false,
//             settings: data.data.settings,
//           })
//         );
//         localStorage.setItem(
//           "otherData",
//           JSON.stringify({
//             company_branch: "B-36 Alwar",
//             session: "23-24",
//             setting: data.data.settings,
//           })
//         );

//         imsAxios.defaults.headers["Company-Branch"] = "B-36 Alwar";
//         return await {
//           ...data.data,
//           session: "23-24",
//           company_branch: "B-36 Alwar",
//         };
//       } else {
//         return thunkAPI.rejectWithValue(data.message);
//       }
//     } catch (err) {
//       const { message } = err.response.data;
//       return thunkAPI.rejectWithValue(message);
//     }
//   }
// );

const loginSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
 
    addNotification: (state, action) => {
      state.notifications = [
        ...state.notifications,
        action.payload.newNotification,
      ];
    },
    removeNotification: (state, action) => {
      state.notifications = state.notifications.filter(
        (not) => not.conversationId != action.payload.conversationId
      );
    },
    setNotifications: (state, action) => {
      state.notifications = action.payload;
    },
    setUserDepartment: (state, action) => {
      state.userDepartment = action.payload;
    },
    setFavourites: (state, action) => {
      if (state.user != null) {
        state.user = { ...state.user, favPages: action.payload };
        localStorage.setItem(
          "loggedInUser",
          JSON.stringify({
            ...state.user,
            favPages: action.payload,
          })
        );
      }
    },
    setTestPages: (state, action) => {
      let obj = JSON.parse(localStorage.getItem("branchData"));
      // let testPages = obj.testPages;
      state.testPages = action.payload;

      localStorage.setItem(
        "branchData",
        JSON.stringify({
          ...obj,
          testPages: action.payload,
        })
      );
    },
    setCurrentLinks: (state, action) => {
      state.currentLinks = action.payload;

      localStorage.setItem("currentLinks", JSON.stringify(action.payload));
    },
    setCompanyBranch: (state, action) => {
     
      imsAxios.defaults.headers["Company-Branch"] = action.payload;

      let user = state.user;
      user = { ...user, company_branch: action.payload };
      state.user = user;
      const existingBranchData = JSON.parse(
        localStorage.getItem("branchData") || "{}"
      );
      localStorage.setItem(
        "branchData",
        JSON.stringify({
          ...existingBranchData,
          company_branch: user.company_branch,
        })
      );
    },
    setSession: (state, action) => {
 
      imsAxios.defaults.headers["Session"] = action.payload;
      //  Axios.defaults.headers["Session"] = action.payload;
      let user = state.user;
      user = { ...user, session: action.payload };
      state.user = user;
      const existingBranchData = JSON.parse(
        localStorage.getItem("branchData") || "{}"
      );
      localStorage.setItem(
        "branchData",
        JSON.stringify({ ...existingBranchData, session: user.session })
      );
      const persistedUser = JSON.parse(
        localStorage.getItem("loggedInUser") || "null",
      );
      if (persistedUser) {
        localStorage.setItem(
          "loggedInUser",
          JSON.stringify({ ...persistedUser, session: user.session }),
        );
      }
    },
    setCurrentLink: (state, action) => {
      state.user = { ...state.user, currentLink: action.payload };
    },
    setUser: (state, action) => {
      let obj = { ...state.user, ...action.payload };
      const pc = obj.passwordChanged;
      obj = {
        ...obj,
        passwordChanged:
          pc === "P" || String(pc).toUpperCase() === "P" ? "P" : "C",
      };
      state.user = obj;
      localStorage.setItem("loggedInUser", JSON.stringify(obj));

      // Update axios headers with selected branch and session
      const company_branch =
        action.payload?.company_branch ?? obj.company_branch ?? "BRALWR36";
      const session =
        action.payload?.session ??
        obj.session ??
        getCurrentIndianFinancialYearSession();

      localStorage.setItem(
        "branchData",
        JSON.stringify({
          company_branch,
          session,
        })
      );

      // Update axios headers immediately
      imsAxios.defaults.headers["Company-Branch"] = company_branch;
      imsAxios.defaults.headers["Session"] = session;
    },
    setSettings: (state, action) => {
      let obj = { ...state.settings, ...action.payload };
      state.settings = obj;
      localStorage.setItem("imsSettings", JSON.stringify(obj));
    },
  },
});

export const selectUserDepartment = (state) => state;

export const {

  addNotification,
  removeNotification,
  setNotifications,
  setFavourites,
  setTestPages,
  setCurrentLinks,
  setCompanyBranch,
  setCurrentLink,
  setUser,
  setSession,
  setUserDepartment,
  setSettings,
} = loginSlice.actions;
export default loginSlice.reducer;
