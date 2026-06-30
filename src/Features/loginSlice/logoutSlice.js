import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { imsAxios } from "../../axiosInterceptor";

export const logoutUser = createAsyncThunk(
  "auth/logoutUser",
  async (_, { getState }) => {
    const state = getState();
    const currentLink = state?.login?.user?.currentLink ?? "/";
    let existingBranchData = {};

      existingBranchData = JSON.parse(
        localStorage.getItem("branchData") || "{}",
      );
      await imsAxios.post("/auth/logout");
      const branchData = { ...existingBranchData, currentLink };
      localStorage.removeItem("loggedInUser");
      localStorage.removeItem("newToken");
      localStorage.removeItem("imsSettings");
      localStorage.removeItem("switchInProgress");
      localStorage.setItem("branchData", JSON.stringify(branchData));
      window.location.replace("/login");

    return true;
  },
);

const initialState = {
  user: JSON.parse(localStorage.getItem("loggedInUser")) || null,
  loading: false,
  message: "",
  error: null,
};

const logoutSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    // (keep other sync reducers here if needed)
  },
  extraReducers: (builder) => {
    builder

      .addCase(logoutUser.pending, (state) => {
        state.loading = true;
        state.message = "";
        state.error = null;
      })

      .addCase(logoutUser.fulfilled, (state) => {
        state.loading = false;
        state.user = null;
        state.message = "User Logged Out!";
      })

      .addCase(logoutUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default logoutSlice.reducer;
