import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { imsAxios } from "../../axiosInterceptor";

const initialState = {
  summaryDate: "",
  masterSummary: [
    { title: "Components", value: "", date: "", link: "/material" },
    { title: "Products", value: "", date: "", link: "/masters/products/fg" },
    {
      title: "Projects",
      value: "",
      date: "",
      link: "/master/reports/projects",
    },
    { title: "Vendors", value: "", date: "", link: "/vendor" },
  ],
  transactionSummary: [
    { title: "Rejection", date: "", value: "" },
    { title: "MFG", date: "", value: "" },
    { title: "Consumption", date: "", value: "" },
    { title: "Purchase Orders", value: "", link: "/procurement/manage" },
  ],
  gatePassSummary: [
    { title: "Gatepass", value: "", date: "" },
    { title: "RGP", value: "", date: "" },
    { title: "NRGP", value: "", date: "" },
    { title: "Challan", value: "" },
  ],
  minSummary: [
    { title: "PO MIN", value: "", date: "", key: "poMin" },
    { title: "Without PO MIN", value: "", date: "", key: "withoutPoMin" },
    { title: "JW MIN", value: "", date: "", key: "jwMin" },
  ],
  pendingTransactionSummary: [
    { title: "Pending PO", value: "" },
    { title: "Pending JW PO", value: "" },
    { title: "Pending PPR", value: "" },
    { title: "Pending FG", value: "" },
    { title: "Pending MR Approval", value: "" },
  ],
  mfgProducts: [],
  loading: {
    master: false,
    transactions: false,
    gatePass: false,
    min: false,
    pendingSummary: false,
  },
  error: null,
};

export const fetchMasterSummary = createAsyncThunk(
  "dashboard/fetchMasterSummary",
  async (_, { rejectWithValue }) => {
    try {
      const response = await imsAxios.post("/tranCount/master_counts");
      const { data } = response;
      if (response?.success) {
        return [
          {
            title: "Components",
            value: data.totalComponents,
            date: data.lastComponent,
            link: "/material",
          },
          {
            title: "Products",
            value: data.totalProducts,
            date: data.lastProduct,
            link: "/masters/products/fg",
          },
          {
            title: "Projects",
            date: data.lastProject,
            value: data.totalProjects,
            link: "/master/reports/projects",
          },
          {
            title: "Vendors",
            date: data.lastVendor,
            value: data.totalVendors,
            link: "/vendor",
          },
        ];
      }
      return rejectWithValue(
        data?.message || "Failed to load master summary"
      );
    } catch (e) {
      return rejectWithValue("Failed to load master summary");
    }
  }
);

export const fetchTransactionsSummary = createAsyncThunk(
  "dashboard/fetchTransactionsSummary",
  async (date, { rejectWithValue }) => {
    try {
      const response = await imsAxios.post(
        `/tranCount/transaction_counts/transaction`,
        { data: date }
      );
      const { data } = response;
      if (response?.success) {
        return [
          {
            title: "Rejection",
            value: data.totalRejection,
            date: data.lastRejection,
          },
          { title: "MFG", value: data.totalMFG, date: data.lastMFG },
          {
            title: "Consumption",
            value: data.totalConsumption,
            date: data.lastConsumption,
          },
          {
            title: "Purchase Orders",
            value: data.totalPO,
            date: data.lastPO,
            link: "/procurement/manage",
          },
        ];
      }
      return rejectWithValue(
        data?.message || "Failed to load transactions"
      );
    } catch (e) {
      return rejectWithValue("Failed to load transactions");
    }
  }
);

export const fetchGatePassSummary = createAsyncThunk(
  "dashboard/fetchGatePassSummary",
  async (date, { rejectWithValue }) => {
    try {
      const response = await imsAxios.post(`/tranCount/transaction_counts/GP`, {
        data: date,
      });
      const { data } = response;
      if (response?.success) {
        return [
          { title: "Gatepass", value: data.totalGatePass },
          { title: "RGP", date: data.lastRGP, value: data.totalRGP },
          {
            title: "NRGP",
            date: data.lastNRGP,
            value: data.totalNRGP,
          },
          {
            title: "Challan",
            date: data.lastDCchallan,
            value: data.totalRGP_DCchallan,
          },
        ];
      }
      return rejectWithValue(data?.message || "Failed to load gate pass");
    } catch (e) {
      return rejectWithValue("Failed to load gate pass");
    }
  }
);

export const fetchMinSummary = createAsyncThunk(
  "dashboard/fetchMinSummary",
  async (date, { rejectWithValue }) => {
    try {
      const response = await imsAxios.post(
        `/tranCount/transaction_counts/MIN`,
        { data: date }
      );
      const { data } = response;
      if (response?.success) {
        return [
          {
            title: "PO MIN",
            date: data.lastMin,
            value: data.totalPOMin,
          },
          {
            title: "Without PO MIN",
            date: data.lastNormalMin,
            value: data.totalNormalMIN,
          },
          {
            title: "JW MIN",
            date: data.lastJWMin,
            value: data.totalJWMin,
            key: "jwMin",
          },
        ];
      }
      return rejectWithValue(data?.message || "Failed to load MIN");
    } catch (e) {
      return rejectWithValue("Failed to load MIN");
    }
  }
);

export const fetchPendingSummary = createAsyncThunk(
  "dashboard/fetchPendingSummary",
  async (date, { rejectWithValue }) => {
    try {
      const response = await imsAxios.post(`/tranCount/pending_counts`, {
        data: date,
      });
      const { data } = response;
      if (response?.success) {
        return [
          { title: "Pending PO", value: data.pendingPO },
          { title: "Pending JW PO", value: data.pendingJW_PO },
          { title: "Pending PPR", value: data.pendingPPR },
          { title: "Pending FG", value: data.pendingFG },
          { title: "Pending MR Approval", value: data.pendingMRapproval },
        ];
      }
      return rejectWithValue(
        data?.message || "Failed to load pending summary"
      );
    } catch (e) {
      return rejectWithValue("Failed to load pending summary");
    }
  }
);

export const fetchMfgProducts = createAsyncThunk(
  "dashboard/fetchMfgProducts",
  async (date, { rejectWithValue }) => {
    try {
      const response = await imsAxios.post(`/tranCount/top_mfg_products`, {
        data: date,
      });
      const { data } = response;
      if (response?.success) {
        return (data.topProducts || []).map((item) => ({
          sku: item.productSku,
          qty: item.totalmfgQuantity,
          product: item.productName,
        }));
      }
      return rejectWithValue(
        data?.message || "Failed to load mfg products"
      );
    } catch (e) {
      return rejectWithValue("Failed to load mfg products");
    }
  }
);

const dashboardSlice = createSlice({
  name: "dashboard",
  initialState,
  reducers: {
    setSummaryDate(state, action) {
      state.summaryDate = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMasterSummary.pending, (state) => {
        state.loading.master = true;
      })
      .addCase(fetchMasterSummary.fulfilled, (state, action) => {
        state.loading.master = false;
        state.masterSummary = action.payload;
      })
      .addCase(fetchMasterSummary.rejected, (state, action) => {
        state.loading.master = false;
        state.error = action.payload;
      })

      .addCase(fetchTransactionsSummary.pending, (state) => {
        state.loading.transactions = true;
      })
      .addCase(fetchTransactionsSummary.fulfilled, (state, action) => {
        state.loading.transactions = false;
        state.transactionSummary = action.payload;
      })
      .addCase(fetchTransactionsSummary.rejected, (state, action) => {
        state.loading.transactions = false;
        state.error = action.payload;
      })

      .addCase(fetchGatePassSummary.pending, (state) => {
        state.loading.gatePass = true;
      })
      .addCase(fetchGatePassSummary.fulfilled, (state, action) => {
        state.loading.gatePass = false;
        state.gatePassSummary = action.payload;
      })
      .addCase(fetchGatePassSummary.rejected, (state, action) => {
        state.loading.gatePass = false;
        state.error = action.payload;
      })

      .addCase(fetchMinSummary.pending, (state) => {
        state.loading.min = true;
      })
      .addCase(fetchMinSummary.fulfilled, (state, action) => {
        state.loading.min = false;
        state.minSummary = action.payload;
      })
      .addCase(fetchMinSummary.rejected, (state, action) => {
        state.loading.min = false;
        state.error = action.payload;
      })

      .addCase(fetchPendingSummary.pending, (state) => {
        state.loading.pendingSummary = true;
      })
      .addCase(fetchPendingSummary.fulfilled, (state, action) => {
        state.loading.pendingSummary = false;
        state.pendingTransactionSummary = action.payload;
      })
      .addCase(fetchPendingSummary.rejected, (state, action) => {
        state.loading.pendingSummary = false;
        state.error = action.payload;
      })

      .addCase(fetchMfgProducts.fulfilled, (state, action) => {
        state.mfgProducts = action.payload || [];
      });
  },
});

export const { setSummaryDate } = dashboardSlice.actions;
export default dashboardSlice.reducer;