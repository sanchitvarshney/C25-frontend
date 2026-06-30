import React, { useState, useEffect } from "react";
import NavFooter from "../../../../Components/NavFooter";
import { useToast } from "../../../../hooks/useToast.js";
import {
  Button,
  Card,
  Col,
  Drawer,
  Form,
  Input,
  Modal,
  Row,
  Tabs,
  Typography,
  Upload,
} from "antd";
import {
  QuantityCell,
  taxableCell,
  foreignCell,
  invoiceIdCell,
  invoiceDateCell,
  HSNCell,
  gstTypeCell,
  CGSTCell,
  SGSTCell,
  IGSTCell,
  locationCell,
  remarkCell,
  rateCell,
  autoConsumptionCell,
  componentCell,
} from "./TableCollumns";
import UploadDocs from "../MaterialInWithPO/UploadDocs";
import Loading from "../../../../Components/Loading";
import { v4 } from "uuid";
import { CommonIcons } from "../../../../Components/TableActions.jsx/TableActions";
import CurrenceModal from "../../../../Components/CurrenceModal";
import AddVendorSideBar from "../../../PurchaseOrder/CreatePO/AddVendorSideBar";
import AddBranch from "../../../Master/Vendor/model/AddBranch";
import SuccessPage from "../SuccessPage";
import ToolTipEllipses from "../../../../Components/ToolTipEllipses";
import { useNavigate } from "react-router-dom";
import { imsAxios } from "../../../../axiosInterceptor";
import axiosResponseFunction from "../../../../Components/axiosResponseFun";
import {
  getVendorOptions,
  savefginward,
  uplaodFGFileInMINInward,
  getCostCentresOptions,
  getProjectOptions,
} from "../../../../api/general.ts";
import { convertSelectOptions, getInt } from "../../../../utils/general.ts";
import useApi from "../../../../hooks/useApi.ts";
import FormTable from "../../../../Components/FormTable.jsx";
import MyButton from "../../../../Components/MyButton/index.jsx";
import { InboxOutlined } from "@ant-design/icons";
import { downloadCSVCustomColumns } from "../../../../Components/exportToCSV.jsx";
import MyDataTable from "../../../../Components/MyDataTable.jsx";
import MySelect from "../../../../Components/MySelect.jsx";
import MyAsyncSelect from "../../../../Components/MyAsyncSelect.jsx";
import SingleDatePicker from "../../../../Components/SingleDatePicker.jsx";
import { Add, Delete } from "@mui/icons-material";

const sampleData = [
  {
    P_SKU: "106101",
    QTY: 12,
    RATE: "100",
    HSN: "123456",
    GST_TYPE: "LOCAL",
    GST_RATE: "18",
    LOCATION: "AL_FG038",
    REMARK: "Sample remark",
  },
];

const vendorDetailsOptions = [
  { text: "Vendor", value: "v01" },
  { text: "Sales Return", value: "s01" },
];

const getGstTypeValue = (v) => {
  if (v == null || v === "") return "L";
  return typeof v === "object" ? (v?.value ?? v?.text ?? "L") : v;
};

export default function ProductMIN() {
  const { showToast } = useToast();
  const [open, setOpen] = useState(false);
  const [uploadForm] = Form.useForm();
  const [showCurrency, setShowCurrenncy] = useState(null);
  const [invoices, setInvoices] = useState([]);
  const [showAddVendorModal, setShowAddVendorModal] = useState(false);
  const [showBranchModal, setShowBranchModal] = useState(null);
  const [autoConsumptionOptions, setAutoConsumptionOption] = useState([]);
  const [totalValues, setTotalValues] = useState([
    { label: "cgst", sign: "+", values: [] },
    { label: "sgst", sign: "+", values: [] },
    { label: "cigst", sign: "+", values: [] },
    { label: "Sub-Total value before Taxes", sign: "", values: [] },
  ]);
  const [currencies, setCurrencies] = useState([]);
  const [locationOptions, setLocationOptions] = useState([]);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [asyncOptions, setAsyncOptions] = useState([]);
  const [activeTab, setActiveTab] = useState("1");
  const [vendorDetails, setVendorDetails] = useState({
    vendorType: "v01",
    vendorName: "",
    vendorBranch: "",
    gstin: "",
    vendorAddress: "",
    ewaybill: "",
    companybranch: "BRALWR36",
    projectID: "",
    costCenter: "",
  });
  const { executeFun, loading: loading1 } = useApi();
  const [vendorBranchOptions, setVendorBranchOptions] = useState([]);
  const [preview, setPreview] = useState(false);
  const [previewRows, setPreviewRows] = useState([]);
  const [materialInward, setMaterialInward] = useState([
    {
      id: v4(),
      component: "",
      orderqty: 0,
      orderrate: 0, //will come from backend on co mponent selection
      currency: "364907247", //will be default at fiest, check
      gstrate: 0,
      unitsname: "--",
      gsttype: "L",
      hsncode: "",
      inrValue: 0,
      cgst: 0,
      sgst: 0,
      igst: 0,
      invoiceDate: "",
      invoiceId: "",
      location: "",
      exchange_rate: 0,
      orderremark: "",
      locationName: "",
      autoConsumption: 0,
    },
  ]);
  const [selectLoading, setSelectLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(false);
  const [vendorSectionLoading, setVendorSectionLoading] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showSuccessPage, setShowSuccessPage] = useState(false);
  const [form] = Form.useForm();

  const addRow = () => {
    let arr = materialInward;
    let newRow = {
      id: v4(),
      component: "",
      orderqty: 0,
      orderrate: 0, //will come from backend on co mponent selection
      currency: materialInward[0].currency, //will be default at fiest, check
      gstrate: 0,
      unitsname: "--",
      gsttype: "L",
      hsncode: "",
      inrValue: 0,
      cgst: 0,
      sgst: 0,
      igst: 0,
      invoiceDate: "",
      invoiceId: "",
      location: "",
      exchange_rate: 0,
      orderremark: "",
      locationName: "",
      autoConsumption: 0,
    };
    arr = [newRow, ...arr];
    setMaterialInward(arr);
  };
  const removeRow = (id) => {
    let arr = materialInward;
    arr = arr.filter((row) => row.id != id);
    setMaterialInward(arr);
  };
  const validataData = async () => {
    let validation = false;
    materialInward?.map((row) => {
      if (row.component && row.location && row.orderqty) {
        validation = true;
      } else {
        validation = false;
      }
    });
    let componentData = {
      qty: [],
      rate: [],
      currency: [],
      exchange: [],
      hsn_code: [],
      gst_type: [],
      gstrate: [],
      cgst: [],
      sgst: [],
      igst: [],
      remark: [],
      location: [],
      out_location: [],
      product: [],
    };
    if (validation == true) {
      let formData = new FormData();
      if (invoices?.length > 0) {
        invoices?.map((file) => {
          formData.append("files", file);
        });
      } else if (
        !invoices.length &&
        form.getFieldValue("vendorType") == "v01"
      ) {
        return showToast("Please add at least one file", "error");
      }
      materialInward.map((row) => {
        componentData = {
          product: [
            ...componentData.product,
            row.component?.value ?? row.component ?? "",
          ],
          qty: [...componentData.qty, row.orderqty],
          rate: [...componentData.rate, row.orderrate],
          currency: [...componentData.currency, row.currency],
          exchange: [...componentData.exchange, row.exchange_rate],
          hsn_code: [...componentData.hsn_code, row.hsncode ?? ""],
          gst_type: [...componentData.gst_type, getGstTypeValue(row.gsttype)],
          gstrate: [...componentData.gstrate, row.gstrate],
          cgst: [...componentData.cgst, row.cgst],
          sgst: [...componentData.sgst, row.sgst],
          igst: [...componentData.igst, row.igst],
          remark: [...componentData.remark, row.orderremark],
          location: [
            ...componentData.location,
            row.location?.value ?? row.location,
          ],
        };
      });
      if (
        (componentData.currency.filter((v, i, a) => v === a[0]).length ===
          componentData.currency.length) !=
        true
      ) {
        validation = false;
        return showToast(
          "Currency of all components should be the same",
          "error",
        );
      } else if (
        (componentData.gst_type.filter((v, i, a) => v === a[0]).length ===
          componentData.gst_type.length) !=
        true
      ) {
        validation = false;
        return showToast(
          "gst type of all components should be the same",
          "error",
        );
      }
      // here submit
      const vendorValues = await form.validateFields();

      Modal.confirm({
        title: "Are you sure you want to submt this MIN",
        // icon: <ExclamationCircleFilled />,
        content: "",
        onOk() {
          validateInvoices({
            formData: formData,
            componentData: componentData,
            vendorValues,
          });
        },
      });
    } else {
      showToast("Please Provide all the values", "error");
    }
  };
  const submitMIN = async (values) => {
    let fileData;

    axiosResponseFunction(async () => {
      if (invoices?.length > 0) {
        setSubmitLoading(true);
        const response = await imsAxios.post(
          "/transaction/upload-invoice",
          values.formData,
        );

        fileData = response?.data;
        // form.getFieldValue("vendorType")
        if (!response?.success) {
          return showToast(
            "Some error occured while uploading invoices, Please try again",
            "error",
          );
        } else {
          let final = {
            companybranch: "BRALWR36",
            attachment: fileData ? fileData : "",
          };
          let venDetails = {
            vendortype: values.vendorValues.vendorType ?? "",
            vendor:
              values.vendorValues.vendorName?.value ??
              values.vendorValues.vendorName ??
              "",
            vendorbranch: values.vendorValues.vendorBranch ?? "",
            invoice: values.vendorValues.invoiceId ?? "",
            invoice_date: values.vendorValues.invoiceDate ?? "",
            cost_center:
              values.vendorValues.costCenter?.value ??
              values.vendorValues.costCenter ??
              "",
            project_id:
              values.vendorValues.projectID?.value ??
              values.vendorValues.projectID ??
              "",
            address: values.vendorValues.vendorAddress ?? "",
          };
          final = {
            ...final,
            ...values.componentData,
            ...venDetails,
          };

          setSubmitLoading(true);
          let response = await executeFun(() => savefginward(final), "select");

          const data = response?.data;
          setSubmitLoading(false);
          if (response?.success || data?.success) {
            setActiveTab("1");
            setShowSuccessPage({
              materialInId: data?.data?.txn ?? data?.txn,
              vendor: {
                vendorname:
                  values.vendorValues?.vendorName?.label ??
                  values.vendorValues?.vendorName ??
                  vendorDetails.vendor ??
                  vendorDetails.vendorName ??
                  "",
              },
              components: materialInward.map((row, index) => {
                return {
                  id: index,
                  componentName: row.component?.label ?? "",
                  inQuantity: row.orderqty,
                };
              }),
            });
            vendorResetFunction();
            materialResetFunction();
          } else {
            showToast(response.message?.msg || data.message, "error");
          }
        }
      } else {
        return showToast("Please add at least one file!!", "error");
      }
    });
  };

  const callFileUpload = async () => {
    setPreview(true);
    const values = uploadForm.getFieldsValue();
    if (!values.files?.length || !values.files[0]?.originFileObj) {
      showToast("Please select a file", "error");
      setPreview(false);
      return;
    }
    const file = values.files[0].originFileObj;
    const formData = new FormData();
    formData.append("file", file);
    const response = await executeFun(
      () => uplaodFGFileInMINInward(formData),
      "fetch",
    );
    if (response?.data?.status === "success") {
      const data = response.data;
      const formattedHeaders = data.data.headers.map((header) =>
        header
          .replace(/(?:^\w|[A-Z]|\b\w|\s+)/g, (match, index) =>
            index === 0 ? match.toUpperCase() : match.toLowerCase(),
          )
          .replace(/\s+/g, ""),
      );
      const formattedRows = data.data.rows.map((row) => {
        const rowObject = {};
        formattedHeaders.forEach((header, index) => {
          rowObject[header] = row[index];
        });
        return rowObject;
      });

      const arr = formattedRows.map((r, index) => ({
        id: index + 1,
        partCode: r.Partcode?.partNo ?? r.Partcode ?? r.Psku?.pSku ?? "",
        partName: r.Partcode?.name ?? r.Partcode ?? "",
        location: r.Location,
        component: r.Psku ? { label: r.Psku?.name, value: r.Psku?.pSku } : null,
        qty: r.Qty,
        rate: r.Rate,
        hsn: r.Hsn,
        autoConsName: r.Autoconsump === "Y" ? "Yes" : "No",
        Remark: r.Remark,
        gstRate: r.Gstrate,
        gstType: r.Gsttype?.text ?? r.Gsttype,
        Gsttype: r.Gsttype?.text ?? r.Gsttype,
        ...r,
      }));
      setPreviewRows(arr);
    } else {
      showToast(response.message?.msg || response.message, "error");
      setPreview(false);
    }
  };

  const normFile = (e) => {
    if (Array.isArray(e)) {
      return e;
    }
    return e?.fileList;
  };

  const uploadProps = {
    name: "file",
    multiple: false,
    maxCount: 1,
    beforeUpload() {
      return false;
    },
  };

  const previewedcolumns = [
    {
      headerName: "#",
      field: "id",
      renderCell: ({ row }) => <ToolTipEllipses text={row.id} />,
      width: 50,
    },
    {
      headerName: "Part Code",
      field: "part_Code",
      renderCell: ({ row }) => <ToolTipEllipses text={row.partCode} />,
      minWidth: 110,
    },
    // { headerName: "Part Name", field: "partName", renderCell: ({ row }) => <ToolTipEllipses text={row.partName} copy={true} />, minWidth: 250, flex: 1 },
    {
      headerName: "Location",
      field: "locationName",
      renderCell: ({ row }) => (
        <ToolTipEllipses
          text={
            row.location?.text ??
            row.location?.label ??
            row.location?.name ??
            ""
          }
        />
      ),
      width: 100,
    },
    {
      headerName: "Hsn",
      field: "hsn",
      renderCell: ({ row }) => <ToolTipEllipses text={row.Hsn ?? row.hsn} />,
      width: 110,
    },
    { headerName: "Rate", field: "rate", flex: 1, minWidth: 100 },
    {
      headerName: "Qty",
      field: "qty",
      flex: 1,
      minWidth: 100,
      renderCell: ({ row }) => (
        <ToolTipEllipses text={row.Qty ?? row.qty} copy={true} />
      ),
    },
    // { headerName: "Auto Consumption", field: "autoConsName", minWidth: 150, flex: 1 },
    { headerName: "Remark", field: "Remark", minWidth: 150, flex: 1 },
    { headerName: "GST RATE", field: "Gstrate", flex: 1, minWidth: 100 },
    {
      headerName: "GST TYPE",
      field: "Gsttype",
      flex: 1,
      minWidth: 100,
      renderCell: ({ row }) => (
        <ToolTipEllipses text={row.gstType} copy={true} />
      ),
    },
  ];

  const validateInvoices = async (values) => {
    submitMIN(values);
  };
  const getProductOptions = async (e) => {
    if (e?.length > 2) {
      const response = await imsAxios.post("/backend/getProductByNameAndNo", {
        search: e,
      });
      let arr = [];
      arr = response?.data.map((d) => {
        return { text: d.text, value: d.id };
      });
      // return arr;
      setAsyncOptions(arr);
    }
  };
  const getCurrencies = async () => {
    const response = await imsAxios.get("/backend/fetchAllCurrecy");
    const raw = response?.data?.data ?? response?.data ?? [];
    let arr = Array.isArray(raw) ? raw : [];
    arr = arr.map((d) => ({
      text: d.currency_symbol,
      value: d.currency_id,
      notes: d.currency_notes,
    }));
    setCurrencies(arr);
  };
  const getLocation = async () => {
    setSelectLoading(true);
    const response = await imsAxios.post("/fgMIN/fgin_locations", {
      search: "",
    });
    setSelectLoading(false);
    if (response.success) {
      let arr = response.data.map((d) => {
        return { text: d.text, value: d.id };
      });
      setLocationOptions(arr);
    } else {
      showToast(response.message?.msg || response.message, "error");
    }
  };
  const getAutoComnsumptionOptions = async () => {
    setPageLoading(true);
    let response = await imsAxios.get("/transaction/fetchAutoConsumpLocation");
    setPageLoading(false);
    if (response.success) {
      let arr = response.data.map((row) => {
        return {
          value: row.id,
          text: row.text,
        };
      });
      arr = [{ text: "NO", value: 0 }, ...arr];
      setAutoConsumptionOption(arr);
    }
  };

  const inputHandler = async (name, value, id) => {
    let arr = materialInward;
    if (name == "component") {
      if (value) {
        setPageLoading(true);
        const response = await imsAxios.get(
          `jobwork/fetchProductData4Table?key=${value?.key}`,
        );
        setPageLoading(false);

        if (response.success) {
          arr = arr.map((row) => {
            if (row.id == id) {
              let obj = row;
              obj = {
                ...obj,
                [name]: value,
                gstrate: response?.data.gstrate,
                orderrate: response?.data.rate,
                unitsname: response?.data.unit,
                hsncode: response?.data.hsn ?? response?.data.hsncode ?? "",
                hsn: response?.data.hsn,
              };
              return obj;
            } else {
              return row;
            }
          });
        } else {
          showToast(response.message, "error");
        }
      } else {
        arr = arr.map((row) => ({
          ...row,
          [name]: value,
        }));
      }
    } else {
      arr = arr.map((row) => {
        let obj = row;
        if (id == row.id) {
          if (name == "orderqty") {
            obj = {
              ...obj,
              [name]: value,
              inrValue: value * row.orderrate,
              usdValue: value * row.orderrate * row.exchange_rate,
              igst:
                getGstTypeValue(row.gsttype) === "L"
                  ? 0
                  : (value * row.orderrate * row.gstrate) / 100,
              sgst:
                getGstTypeValue(row.gsttype) === "I"
                  ? 0
                  : (value * row.orderrate * row.gstrate) / 200,
              cgst:
                getGstTypeValue(row.gsttype) === "I"
                  ? 0
                  : (value * row.orderrate * row.gstrate) / 200,
            };
            return obj;
          } else if (name == "orderrate") {
            obj = {
              ...obj,
              [name]: value,
              inrValue: value * row.orderqty,
              usdValue: value * row.orderqty * row.exchange_rate,
              igst:
                getGstTypeValue(row.gsttype) === "L"
                  ? 0
                  : (value * row.orderqty * row.gstrate) / 100,
              sgst:
                getGstTypeValue(row.gsttype) === "I"
                  ? 0
                  : (value * row.orderqty * row.gstrate) / 200,
              cgst:
                getGstTypeValue(row.gsttype) === "I"
                  ? 0
                  : (value * row.orderqty * row.gstrate) / 200,
            };
            return obj;
          } else if (name == "gsttype") {
            const gstVal = getGstTypeValue(value);
            if (gstVal === "I") {
              obj = {
                ...obj,
                [name]: gstVal,
                igst: (row.inrValue * row.gstrate) / 100,
                sgst: 0,
                cgst: 0,
              };
            } else {
              obj = {
                ...obj,
                [name]: gstVal,
                igst: 0,
                sgst: (row.inrValue * row.gstrate) / 200,
                cgst: (row.inrValue * row.gstrate) / 200,
              };
            }
            return obj;
          } else if (name == "gstrate") {
            obj = {
              ...obj,
              [name]: value,
              igst:
                getGstTypeValue(row.gsttype) === "L"
                  ? 0
                  : (value * row.inrValue) / 100,
              sgst:
                getGstTypeValue(row.gsttype) === "I"
                  ? 0
                  : (value * row.inrValue) / 200,
              cgst:
                getGstTypeValue(row.gsttype) === "I"
                  ? 0
                  : (value * row.inrValue) / 200,
            };
            return obj;
          } else if (name == "currency") {
            if (value == "364907247") {
              obj = {
                ...obj,
                currency: value,
                usdValue: 0,
                exchange_rate: 1,
              };
            } else {
              obj = {
                ...obj,
                [name]: value,
              };
              setShowCurrenncy({
                currency: value,
                price: row.inrValue,
                exchange_rate: row.exchange_rate,
                symbol: currencies.filter((cur) => cur.value == value)[0].text,
                rowId: row.id,
                inputHandler: inputHandler,
              });
            }

            return obj;
          } else if (name == "exchange_rate") {
            obj = {
              ...obj,
              exchange_rate: value.rate,
              currency: value.currency,
              usdValue: row.inrValue * value.rate,
            };
            return obj;
          } else if (name == "location") {
            obj = {
              ...obj,
              [name]: value,
              locationName: value?.label ?? value?.text ?? "",
            };

            return obj;
          } else {
            obj = { ...obj, [name]: value };
            return obj;
          }
        } else {
          return row;
        }
      });
    }
    setMaterialInward(arr);
  };
  const vendorInputHandler = async (name, value) => {
    if (value) {
      let obj = vendorDetails;
      if (name == "vendorName") {
        setVendorSectionLoading(true);
        const response = await imsAxios.post("/backend/vendorBranchList", {
          vendorcode: value.value,
        });

        setVendorSectionLoading(false);
        if (response.success) {
          const arr = response.data.map((row) => {
            return {
              value: row.id,
              text: row.text,
            };
          });
          setVendorSectionLoading(true);
          const { data: data1 } = await imsAxios.post(
            "/backend/vendorAddress",
            {
              vendorcode: value.value,
              branchcode: arr[0].value,
            },
          );
          setVendorSectionLoading(false);
          setVendorBranchOptions(arr);

          const addr1 = data1?.data ?? data1;
          obj = {
            ...obj,
            [name]: value,
            vendorBranch: arr[0].value,
            gstin: addr1?.gstid ?? "",
            vendorAddress: (addr1?.address ?? "").replaceAll("<br>", "\n"),
            vendor: value.label,
          };
        } else {
          showToast(response.message?.msg || response.message, "error");
        }
      } else if (name == "vendorBranch") {
        setVendorSectionLoading(true);
        const response = await imsAxios.post("/backend/vendorAddress", {
          vendorcode:
            vendorDetails.vendorName?.value ?? vendorDetails.vendorName,
          branchcode: value,
        });
        setVendorSectionLoading(false);
        if (response.success) {
          const resData = response.data;
          const addr = resData?.data ?? resData;
          obj = {
            ...obj,
            [name]: value,
            gstin: addr?.gstid ?? "",
            vendorAddress: (addr?.address ?? "").replaceAll("<br>", "\n"),
          };
        } else {
          showToast(response.message?.msg || response.message, "error");
        }
      } else {
        obj = { ...obj, [name]: value };
      }
      form.setFieldsValue(obj);
      setVendorDetails(obj);
    }
  };
  const getVendorBracnch = async (vendorCode) => {
    const response = await imsAxios.post("/backend/vendorBranchList", {
      vendorcode: vendorCode,
    });

    const arr = response.data.map((d) => {
      return { value: d.id, text: d.text };
    });
    setVendorBranchOptions(arr);
    return arr;
  };
  // const getCostCenteres = async (searchInput) => {
  //   if (searchInput.length > 2) {
  //     setSelectLoading(true);
  //     const response = await imsAxios.post("/backend/costCenter", {
  //       search: searchInput,
  //     });
  //     setSelectLoading(false);
  //     let arr = [];
  //     if (!data.msg) {
  //       arr = data.map((d) => {
  //         return { text: d.text, value: d.id };
  //       });
  //       setAsyncOptions(arr);
  //     } else {
  //       setAsyncOptions([]);
  //     }
  //   }
  // };

  const closeDrawer = () => {
    setPreview(false);
    setOpen(false);
    const invoiceDate = form.getFieldValue("invoiceDate");
    const invoiceId = form.getFieldValue("invoiceId");
    const currency = form.getFieldValue("currency") || "";

    const arr = previewRows.map((r) => {
      const loc = r.location;
      const locationForRow =
        loc && typeof loc === "object"
          ? {
              text: loc.text ?? loc.label ?? loc.name ?? "",
              value: loc.value ?? loc.id,
            }
          : (loc ?? "");
      const inrValue = (Number(r.qty) || 0) * (Number(r.rate) || 0);
      const gstRateNum = Number(r.gstRate) || 0;
      const rawGstType = r.gstType ?? "L";
      const gstTypeNormalized =
        typeof rawGstType === "object"
          ? (rawGstType.value ?? rawGstType.text ?? "L")
          : rawGstType;
      const isLocal =
        gstTypeNormalized === "L" ||
        String(gstTypeNormalized).toUpperCase().startsWith("LOCAL");
      const finalGstRate = isLocal
        ? getInt(gstRateNum) / 2
        : getInt(gstRateNum);
      const gst = getInt((inrValue * finalGstRate) / 100);
      const cgst = isLocal ? gst : 0;
      const sgst = isLocal ? gst : 0;
      const igst = isLocal ? 0 : gst;
      const gsttypeNormalized = isLocal ? "L" : "I";
      return {
        id: v4(),
        component: r.component ?? { label: r.partName, value: r.partCode },
        orderqty: Number(r.qty) || 0,
        orderrate: Number(r.rate) || 0,
        currency: currency,
        gstrate: gstRateNum,
        unitsname: "--",
        gsttype: gsttypeNormalized,
        hsncode: r.Hsn ?? r.hsn ?? "",
        inrValue,
        cgst,
        sgst,
        igst,
        invoiceDate: invoiceDate ?? "",
        invoiceId: invoiceId ?? "",
        location: locationForRow,
        locationName:
          typeof locationForRow === "object" ? locationForRow.text : "",
        exchange_rate: 0,
        orderremark: r.Remark ?? r.remark ?? "",
        autoConsumption:
          r.Autoconsump === "Y" || r.autoConsName === "Yes" ? 1 : 0,
      };
    });
    setMaterialInward(arr);
  };

  const saveTheData = async () => {
    Modal.confirm({
      title: "Are you sure you want to submit?",
      content: "Please make sure that the values are correct",
      onOk() {
        closeDrawer();
      },
      onCancel() {},
    });
  };

  const getVendors = async (search) => {
    if (search?.length > 2) {
      const response = await executeFun(
        () => getVendorOptions(search),
        "select",
      );
      let arr = [];
      if (response.success) {
        arr = convertSelectOptions(response.data);
      }
      setAsyncOptions(arr);
    }
  };

  const vendorResetFunction = () => {
    let obj = {
      vendorType: "v01",
      vendorName: "",
      vendorBranch: "",
      gstin: "",
      vendorAddress: "",
    };
    setVendorDetails(obj);
    setShowResetConfirm(false);
    form.setFieldsValue(obj);
  };

  const handleFetchCostCenterOptions = async (search) => {
    const response = await executeFun(
      () => getCostCentresOptions(search),
      "select",
    );
    let arr = [];
    if (response.success) arr = convertSelectOptions(response.data);
    setAsyncOptions(arr);
  };

  const handleFetchProjectOptions = async (search) => {
    const response = await executeFun(
      () => getProjectOptions(search),
      "select",
    );
    setAsyncOptions(response.data);
  };

  const handleProjectChange = async (value) => {
    setPageLoading(true);
    const response = await imsAxios.post("/backend/projectDescription", {
      project_name: value,
    });

    setPageLoading(false);

    if (response?.success) {
      form.setFieldValue("projectName", response?.data?.description);
    } else {
      showToast(response?.data?.message ?? response?.message, "error");
    }
  };
  const materialResetFunction = () => {
    setMaterialInward([
      {
        id: v4(),

        component: "",
        orderqty: 0,
        orderrate: 0, //will come from backend on co mponent selection
        currency: "364907247", //will be default at fiest, check
        gstrate: 0,
        unitsname: "--",
        gsttype: "L",
        hsncode: "",
        inrValue: 0,
        cgst: 0,
        sgst: 0,
        igst: 0,
        invoiceDate: "",
        invoiceId: "",
        location: "",
        exchange_rate: 0,
        autoConsumption: 0,
      },
    ]);
    setShowResetConfirm(false);
  };
  const columns = [
    {
      headerName: (
        <span onClick={addRow} style={{ cursor: "pointer" }}>
          <Add color="success" />
        </span>
      ),
      width: 80,
      field: "add",
      sortable: false,
      renderCell: ({ row }) => (
        <>
          {materialInward.indexOf(row) >= 1 ? (
            <div style={{ display: "flex", justifyContent: "center" }}>
              <span
                onClick={() => removeRow(row?.id)}
                style={{ cursor: "pointer" }}
              >
                <Delete color="error" />
              </span>
            </div>
          ) : null}
        </>
      ),
    },
    {
      headerName: "Product",
      field: "c_partno",
      sortable: false,
      renderCell: (params) =>
        componentCell(
          params,
          inputHandler,
          setAsyncOptions,
          getProductOptions,
          asyncOptions,
          selectLoading,
        ),
      width: 400,
    },
    {
      headerName: "Qty",
      field: "gstqty",
      sortable: false,
      renderCell: (params) => QuantityCell(params, inputHandler),
      width: 120,
    },
    {
      headerName: "Rate",
      field: "orderrate",
      sortable: false,
      renderCell: (params) => rateCell(params, inputHandler, currencies),
      width: 180,
    },
    // {
    //   headerName: "Currency",
    //   field: "currency",
    //   sortable: false,
    //   renderCell: (params) => currencyCell(params, inputHandler, currencies),
    //   width: 80,
    // },
    {
      headerName: "Taxable Value",
      field: "inrValue",
      sortable: false,
      renderCell: taxableCell,
      width: 120,
    },
    {
      headerName: "Foreign Value",
      field: "usdValue",
      sortable: false,
      renderCell: foreignCell,
      width: 120,
    },

    {
      headerName: "HSN Code",
      field: "hsncode",
      sortable: false,
      renderCell: (params) => HSNCell(params, inputHandler),
      width: 150,
    },
    {
      headerName: "GST Type",
      field: "gsttype",
      sortable: false,
      renderCell: (params) => gstTypeCell(params, inputHandler),
      // flex: 1,
      width: 200,
    },
    {
      headerName: "GST Rate",
      width: 120,
      field: "gstrate",
      sortable: false,
      renderCell: (params) => {
        const options = [
          { label: "0%", value: 0 },
          { label: "5%", value: 5 },
          { label: "18%", value: 18 },
        ];

        return (
          <select
            style={{
              width: "100%",
              padding: "6px 8px",
              border: "1px solid #d9d9d9",
              borderRadius: 6,
              backgroundColor: "white",
              fontSize: 13,
            }}
            value={params.row.gstrate ?? ""}
            onChange={(e) => {
              const newRate = Number(e.target.value);
              inputHandler("gstrate", newRate, params.row.id);
            }}
          >
            <option value="">Select</option>
            {options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        );
      },
    },
    {
      headerName: "CGST",
      renderCell: (params) => CGSTCell(params, inputHandler),
      // flex: 1,
      field: "cgst",
      sortable: false,
      width: 120,
    },
    {
      headerName: "SGST",
      renderCell: (params) => SGSTCell(params, inputHandler),
      // flex: 1,
      field: "sgst",
      sortable: false,
      width: 120,
    },
    {
      headerName: "IGST",
      renderCell: (params) => IGSTCell(params, inputHandler),
      // flex: 1,
      field: "igst",
      sortable: false,
      width: 120,
    },
    {
      headerName: "Location",
      field: "location",
      sortable: false,
      renderCell: (params) =>
        locationCell(params, inputHandler, locationOptions),
      width: 150,
    },
    // {
    //   headerName: "Auto Consump",
    //   field: "autoConsumption",
    //   sortable: false,
    //   renderCell: (params) =>
    //     autoConsumptionCell(params, inputHandler, autoConsumptionOptions),
    //   width: 150,
    // },
    {
      headerName: "Remarks",
      field: "orderremark",
      sortable: false,
      renderCell: (params) => remarkCell(params, inputHandler),
      width: 250,
    },
  ];
  const successColumns = [
    {
      headerName: "Component",
      renderCell: ({ row }) => <ToolTipEllipses text={row.componentName} />,
      field: "componentName",
      flex: 1,
    },
    // { headerName: "Part No.", field: "partNo", flex: 1 },
    // { headerName: "PO Quantity", field: "poQuantity", flex: 1 },
    { headerName: "In Quantity", field: "inQuantity", flex: 1 },

    // { headerName: "Location", field: "location", flex: 1 },
  ];
  useEffect(() => {
    getAutoComnsumptionOptions();
    getCurrencies();
    getLocation();
  }, []);
  useEffect(() => {
    let grandTotal = materialInward?.map((row) =>
      Number(row?.cgst + row?.sgst + row?.igst + row.inrValue),
    );
    let cgsttotal = materialInward?.map((row) => Number(row?.cgst));
    let sgsttotal = materialInward?.map((row) => Number(row?.sgst));
    let igsttotal = materialInward?.map((row) => Number(row?.igst));
    let inrValue = materialInward?.map((row) => Number(row?.inrValue));
    let obj = [
      { label: "Sub-Total value before Taxes", sign: "", values: inrValue },
      { label: "CGST", sign: "+", values: cgsttotal },
      { label: "SGST", sign: "+", values: sgsttotal },
      { label: "IGST", sign: "+", values: igsttotal },
      { label: "Sub-Total values after Taxes", sign: "", values: grandTotal },
    ];
    setTotalValues(obj);
  }, [materialInward]);
  useEffect(() => {
    if (vendorDetails.vendorType === "p01") {
      let obj = form.getFieldsValue();
      obj = {
        ...obj,
        vendorName: "",
        vendorBranch: "",
        gstin: "",
        vendorAddress: "",
      };
      setVendorDetails(obj);
      form.setFieldsValue(obj);
    }
  }, [vendorDetails.vendorType]);
  return (
    <div style={{ height: "calc(100%  - 0px)", overflow: "hidden" }}>
      {/* <TaxModal bottom={-80} visibleBottom={110} totalValues={totalValues} /> */}
      {showCurrency != null && (
        <CurrenceModal
          showCurrency={showCurrency}
          setShowCurrencyModal={setShowCurrenncy}
        />
      )}
      {/* submit confirm modal */}

      {/* reset confirm modal */}
      <Modal
        title="Reset!"
        open={showResetConfirm}
        onCancel={() => setShowResetConfirm(false)}
        footer={[
          <Button key="back" onClick={() => setShowResetConfirm(false)}>
            No
          </Button>,
          <Button
            key="submit"
            type="primary"
            onClick={
              activeTab == "1" ? vendorResetFunction : materialResetFunction
            }
          >
            Yes
          </Button>,
        ]}
      >
        <p>
          Are you sure you want to reset the entered{" "}
          {activeTab == "1" ? "Vendor" : "Components"} data?
        </p>
      </Modal>
      <AddVendorSideBar
        open={showAddVendorModal}
        setOpen={setShowAddVendorModal}
      />
      <AddBranch
        getVendorBracnch={getVendorBracnch}
        setOpenBranch={setShowBranchModal}
        openBranch={showBranchModal}
      />

      <div
        style={{
          display: showSuccessPage ? "none" : "block",
          height: "92%",
        }}
      >
        <Row
          gutter={8}
          style={{
            height: "100%",
            padding: "0px 10px",
          }}
        >
          <Col
            span={6}
            style={{ height: "98%", overflowY: "auto", overflowX: "hidden" }}
          >
            <Card size="small">
              <Form
                initialValues={vendorDetails}
                form={form}
                layout="vertical"
                onFieldsChange={(value, allFields) => {
                  if (value.length == 1) {
                    vendorInputHandler(value[0].name[0], value[0].value);
                  }
                }}
              >
                {vendorSectionLoading && <Loading />}
                <Row gutter={4}>
                  <Col span={24}>
                    <Form.Item name="vendorType" label="Vendor Type">
                      <MySelect options={vendorDetailsOptions} />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      style={{ marginBottom: -10 }}
                      name="vendorName"
                      extra={
                        <p
                          onClick={() => setShowAddVendorModal(true)}
                          style={{
                            textAlign: "end",
                            color: "#1890FF",
                            cursor: "pointer",
                            marginTop: 5,
                            fontSize: 12,
                          }}
                        >
                          Add Vendor
                        </p>
                      }
                      label="Vendor"
                    >
                      <MyAsyncSelect
                        selectLoading={loading1("select")}
                        disabled={form.getFieldValue("vendorType") === "p01"}
                        labelInValue
                        onBlur={() => setAsyncOptions([])}
                        optionsState={asyncOptions}
                        loadOptions={getVendors}
                      />
                    </Form.Item>
                  </Col>
                  <Col span={12} style={{ marginBottom: -10 }}>
                    <Form.Item
                      name="vendorBranch"
                      extra={
                        <p
                          onClick={() => {
                            vendorDetails.vendorName
                              ? setShowBranchModal({
                                  vendor_code:
                                    vendorDetails.vendorName?.value ??
                                    vendorDetails.vendorName,
                                })
                              : showToast(
                                  "Please Select a vendor first",
                                  "error",
                                );
                          }}
                          style={{
                            color: "#1890FF",
                            cursor: "pointer",
                            fontSize: 12,
                            textAlign: "end",
                            marginTop: 5,
                          }}
                        >
                          Add Branch
                        </p>
                      }
                      label="Vendor Branch"
                    >
                      <MySelect
                        disabled={form.getFieldValue("vendorType") === "p01"}
                        options={vendorBranchOptions}
                      />
                    </Form.Item>
                  </Col>
                  <Col span={12} style={{ marginBottom: -10 }}>
                    <Form.Item name="gstin" label="GSTIN">
                      <Input size="default" disabled />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item label="Cost Center" name="costCenter">
                      <MyAsyncSelect
                        selectLoading={loading1("select")}
                        onBlur={() => setAsyncOptions([])}
                        optionsState={asyncOptions}
                        loadOptions={handleFetchCostCenterOptions}
                      />
                    </Form.Item>
                  </Col>
                  {form.getFieldValue("vendorType") === "j01" && (
                    <Col span={24}>
                      <Form.Item name="ewaybill" label="E-Way Bill Number">
                        <Input size="default" />
                      </Form.Item>
                    </Col>
                  )}
                  <Col span={12}>
                    <Form.Item label="Project ID" name="projectID">
                      <MyAsyncSelect
                        selectLoading={loading1("select")}
                        onBlur={() => setAsyncOptions([])}
                        optionsState={asyncOptions}
                        loadOptions={handleFetchProjectOptions}
                        onChange={handleProjectChange}
                      />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item label="Project Name" name="projectName">
                      <Input size="default" disabled />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item label="Currency" name="currency">
                      <MySelect
                        options={currencies}
                        onChange={(value) => {
                          const currentRows = [...materialInward];
                          if (value === "364907247") {
                            const updatedRows = currentRows.map((row) => ({
                              ...row,
                              currency: value,
                              exchange_rate: 0,
                            }));
                            setMaterialInward(updatedRows);
                          } else {
                            const updatedRows = currentRows.map((row) => ({
                              ...row,
                              currency: value,
                            }));
                            setMaterialInward(updatedRows);
                          }
                        }}
                      />
                    </Form.Item>
                  </Col>
                  <Col span={24}>
                    <Form.Item name="vendorAddress" label="Bill From Address">
                      <Input.TextArea
                        rows={3}
                        disabled={form.getFieldValue("vendorType") === "p01"}
                        style={{ resize: "none" }}
                      />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item label="Invoice Date" name="invoiceDate">
                      <SingleDatePicker
                        setDate={(value) => {
                          form.setFieldValue("invoiceDate", value);
                        }}
                      />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item label="Invoice Id" name="invoiceId">
                      <Input />
                    </Form.Item>
                  </Col>
                </Row>
              </Form>
            </Card>

            <Card size="small" style={{ marginTop: 6 }} title="Attachments">
              <Row
                span={24}
                style={{
                  width: "100%",
                }}
              >
                <Col
                  span={12}
                  style={{
                    height: "10%",
                    display: "flex",
                    flexDirection: "column",
                    gap: 10,
                  }}
                >
                  <UploadDocs
                    // disable={poData?.materials?.length == 0}
                    setFiles={setInvoices}
                    files={invoices}
                  />
                </Col>
                <Col span={12}>
                  <MyButton
                    variant="upload"
                    text="Excel"
                    onClick={() => setOpen(true)}
                  >
                    Excel
                  </MyButton>
                </Col>
              </Row>
            </Card>

            <Card
              className="small-text"
              size="small"
              style={{ marginTop: 5 }}
              title="Tax Detail"
            >
              <Row gutter={[0, 4]}>
                {totalValues?.map((row) => (
                  <Col span={24} key={row.label}>
                    <Row>
                      <Col
                        span={18}
                        style={{
                          fontWeight:
                            totalValues?.indexOf(row) ==
                              totalValues.length - 1 && 600,
                        }}
                      >
                        <Typography.Text>{row.label}</Typography.Text>
                      </Col>
                      <Col span={6} className="right">
                        {row.sign.toString() == "" ? (
                          ""
                        ) : (
                          <span
                            style={{
                              fontWeight:
                                totalValues?.indexOf(row) ==
                                  totalValues.length - 1 && 600,
                            }}
                          >
                            <Typography.Text>
                              ({row.sign.toString()}){" "}
                            </Typography.Text>
                          </span>
                        )}
                        <span
                          style={{
                            fontWeight:
                              totalValues?.indexOf(row) ==
                                totalValues.length - 1 && 600,
                          }}
                        >
                          <Typography.Text>
                            {Number(
                              row.values?.reduce((partialSum, a) => {
                                return partialSum + Number(a);
                              }, 0),
                            ).toFixed(2)}
                          </Typography.Text>
                        </span>
                      </Col>
                    </Row>
                  </Col>
                ))}
              </Row>
            </Card>
          </Col>
          <Col style={{ height: "100%" }} span={18}>
            <FormTable
              columns={columns}
              data={materialInward}
              loading={pageLoading || loading1("select")}
            />
          </Col>
        </Row>
      </div>
      <NavFooter
        // uploadFun={() => {
        //   setShowUploadDoc(materialInward);
        // }}
        resetFunction={() => setShowResetConfirm(true)}
        submitFunction={validataData}
        nextLabel="Submit"
        loading={submitLoading}
      />
      {showSuccessPage && (
        <SuccessPage
          newMinFunction={() => setShowSuccessPage(false)}
          successColumns={successColumns}
          po={showSuccessPage}
          isFGMIN={true}
        />
      )}

      <Modal
        title="Upload File Here"
        open={open}
        width={500}
        onCancel={() => setOpen(false)}
        footer={[
          <Button key="back" onClick={() => setOpen(false)}>
            Cancel
          </Button>,
          <Button key="submit" type="primary" onClick={callFileUpload}>
            Preview
          </Button>,
        ]}
      >
        {loading1("fetch") && <Loading />}
        <Card>
          <Form form={uploadForm} layout="vertical">
            <Form.Item>
              <Form.Item
                name="files"
                valuePropName="fileList"
                getValueFromEvent={normFile}
                noStyle
              >
                <Upload.Dragger name="files" {...uploadProps}>
                  <p className="ant-upload-drag-icon">
                    <InboxOutlined />
                  </p>
                  <p className="ant-upload-text">
                    Click or drag file to this area to upload
                  </p>
                </Upload.Dragger>
              </Form.Item>
            </Form.Item>
            <Row justify="end" style={{ marginTop: 5 }}>
              <MyButton
                variant="downloadSample"
                onClick={() =>
                  downloadCSVCustomColumns(sampleData, "FG MIN Inward")
                }
              />
            </Row>
          </Form>
        </Card>
      </Modal>

      <Drawer
        width="100%"
        title="Preview Data From Excel"
        placement="right"
        onClose={() => setPreview(false)}
        destroyOnClose={false}
        open={preview}
        bodyStyle={{ padding: 5 }}
      >
        {loading1("fetch") && <Loading />}
        <Row
          style={{
            height: "95%",
            display: "flex",
            justifyContent: "center",
          }}
        >
          <Col
            style={{
              height: "90%",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
            }}
            span={23}
          >
            <MyDataTable
              columns={previewedcolumns}
              data={previewRows}
              loading={loading1("fetch")}
              headText="center"
            />
          </Col>
          <Row
            span={24}
            style={{
              width: "100%",
              height: "10%",
              display: "flex",
              justifyContent: "end",
            }}
          >
            <NavFooter
              submitFunction={saveTheData}
              nextLabel="Submit"
              resetFunction={() => setPreview(false)}
            />
          </Row>
        </Row>
      </Drawer>
    </div>
  );
}
