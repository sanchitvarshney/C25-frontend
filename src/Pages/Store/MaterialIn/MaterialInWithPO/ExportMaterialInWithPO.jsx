import { useState, useEffect, useRef } from "react";
import NavFooter from "../../../../Components/NavFooter.jsx";
import { useToast } from "../../../../hooks/useToast.js";
import {
  Button,
  Card,
  Col,
  Input,
  Modal,
  Row,
  Skeleton,
  Space,
  Typography,
  Form,
  Upload,
  Drawer,
} from "antd";
import { remarkCell, manualMFGCode, HSNCell } from "./TableCollumns.jsx";
import SingleDatePicker from "../../../../Components/SingleDatePicker.jsx";
import SingleProduct from "../../../Master/Vendor/SingleProduct.jsx";
import CurrenceModal from "../CurrenceModal.jsx";
import MyAsyncSelect from "../../../../Components/MyAsyncSelect.jsx";
import ToolTipEllipses from "../../../../Components/ToolTipEllipses.jsx";
import { InboxOutlined } from "@ant-design/icons";
import { CommonIcons } from "../../../../Components/TableActions.jsx/TableActions.jsx";
import SuccessPage from "../SuccessPage.jsx";
import { imsAxios } from "../../../../axiosInterceptor.js";
import Loading from "../../../../Components/Loading.jsx";
import MyDataTable from "../../../../Components/MyDataTable.jsx";
import {
  checkInvoiceforMIN,
  getVendorOptions,
  poMINforImport,
  uploadPOExportFile,
} from "../../../../api/general.ts";
import { convertSelectOptions } from "../../../../utils/general.ts";
import useApi from "../../../../hooks/useApi.ts";
import MyButton from "../../../../Components/MyButton/index.jsx";
import MySelect from "../../../../Components/MySelect.jsx";
import { v4 } from "uuid";
import FileUpload from "../../../../Components/FileUpload/FileUpload.tsx";
import FormTable from "../../../../Components/FormTable.jsx";
import Field from "../../../../Components/Field.jsx";

export default function ExportMaterialInWithPO() {
  const { showToast } = useToast();
  const FIXED_CURRENCY_LABEL = "$";
  const [poData, setPoData] = useState({ materials: [] });
  const [resetPoData, setResetPoData] = useState({ materials: [] });
  const [asyncOptions, setAsyncOptions] = useState([]);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [fileName, setFileName] = useState("");
  const [preview, setPreview] = useState(false);
  const [irnNum, setIrnNum] = useState("");
  const [searchData, setSearchData] = useState({
    vendor: "",
    poNumber: "",
  });
  const [ setCurrency] = useState(null);
  const [invoice, setInvoice] = useState("");
  const [invoiceDate, setInvoiceDate] = useState(null);
  const [showCurrency, setShowCurrenncy] = useState(null);
  const [totalValues, setTotalValues] = useState([
    { label: "Sub-Total value before Taxes", sign: "", values: [] },
  ]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(false);
  const [previewRows, setPreviewRows] = useState([]);
  const [showVendorInfo, setShowVendorInfo] = useState(false);
  const [open, setOpen] = useState(false);
  const [materialInSuccess, setMaterialInSuccess] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [locationOptions, setLocationOptions] = useState([]);
  const [selectLocation, setSelectLocation] = useState(null);
  const [codeCostCenter, setCodeCostCenter] = useState("");
  const [uplaoaClicked, setUploadClicked] = useState(false);
  const [uploadedComponents, setUploadedComponents] = useState([]);
  const [form] = Form.useForm();
  const [form2] = Form.useForm();
  const tableContainerRef = useRef(null);
  const [filesData, setFilesData] = useState([]);
  const [uplaodForm] = Form.useForm();
  let costCode;
  const { executeFun, loading: loading1 } = useApi();
  const { loading } = useApi();
 const [isValid, setIsValid] = useState(false);
  const [searchValid, setSearchValid] = useState(false);
  const hasIncompleteMaterialRow = (rows) =>
    (rows || []).some(
      (row) =>
        !row?.component ||
        !row?.orderQty ||
        Number(row?.orderQty) <= 0 ||
        !row?.rate ||
        Number(row?.rate) <= 0 ||
        row?.customDuty === "" ||
        row?.customDuty === undefined ||
        row?.customDuty === null ||
        row?.freightValue === "" ||
        row?.freightValue === undefined ||
        row?.freightValue === null ||
        !(row?.hsncode ?? row?.hsn),
    );
  const validateData = async () => {
    if (
      !selectLocation ||
      !invoice.trim() ||
      !invoiceDate ||
      !poData.materials.length
    ) {
      setIsValid(true);
      return;
    }
    if (hasIncompleteMaterialRow(poData.materials)) {
      setIsValid(true);
      return;
    }
    setIsValid(false);
  
    let componentData = {
      qty: [],
      rate: [],
      currency: [],
      exchange: [],
      invoice: [],
      invoiceDate: [],
      hsncode: [],
      gsttype: [],
      gstrate: [],
      cgst: [],
      sgst: [],
      igst: [],
      remark: [],
      location: [],
      out_location: [],
      component: [],
      finalRate: [],
      customDuty: [],
      freight: [],
    };

      let a = uploadedComponents;
      if (a?.length) {
        if (!fileName) {
          showToast("Please upload Document", "error");
          return;
        }

        poData?.materials?.map((row) => {
          componentData = {
            component: [...componentData.component, row.componentKey],
            customDuty: [...componentData.customDuty, row.customDuty],
            freight: [...componentData.freight, row.freightValue],
            qty: [...componentData.qty, row.orderQty],
            rate: [...componentData.rate, row.rate],
            exchange: [...componentData.exchange, row.exchangeRate],
            invoice: [invoice],
            // invoiceDate: [...componentData.invoiceDate, row.invoiceDate],
            hsncode: [...componentData.hsncode, row.hsn],
            remark: [...componentData.remark, row.orderremark],
            // location: [...componentData.location, row.location.value],
            finalRate: [...componentData.finalRate, row.finalRate],
            // out_location: [...componentData.out_location, row.autoConsumption],
            documentName: uploadedComponents?.map((r) => r.documentName),
            irn: irnNum,
            qrScan: "N",
            currency: "28567096",
          };
        });
        //uploading invoices
        Modal.confirm({
          title: "Are you sure you want to submt this MIN",
          // icon: <ExclamationCircleFilled />,
          content: "",
          onOk() {
            validateInvoices({
              componentData: componentData,
            });
          },
        });
      } else {
        showToast("Please add at least one document", "error");
      }
 
  };

  const closeDrawer = () => {
    setPreview(false);
    setOpen(false);
    let arr = previewRows.map((r) => {
      return {
        ...r,
        mfgCode: r.Manualmfgcode,
        hsnCode: r.hsn,
        autoConsumption: r.Autoconsump == "Y" ? "Yes" : "No",
      };
    });

    form.setFieldValue("components", arr);
  };

  useEffect(() => {
    if (previewRows.length) {
      setPoData((prev) => ({ ...prev, materials: previewRows }));
    }
  }, [previewRows]);

  const normFile = (e) => {
    if (Array.isArray(e)) {
      return e;
    }
    return e?.fileList;
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
  const validateInvoices = async (values) => {
    try {
      const invoices = values.componentData.invoice;
      setSubmitLoading(true);
      let payload = {
        invoice: invoices,
        vendor: searchData.vendor,
      };
      const response = await executeFun(
        () => checkInvoiceforMIN(payload),
        "select",
      );

      let data = response?.data;
      if (response?.success) {
        setSubmitLoading(false);
        if (data?.invoicesFound) {
          return Modal.confirm({
            title:
              "Following invoices are already found in our records, Do you still wish to continue?",
            // icon: <ExclamationCircleFilled />,
            content: <Row>{data.invoicesFound.map((inv) => `${inv}, `)}</Row>,
            onOk() {
              submitMIN(values);
            },
          });
        } else {
          submitMIN(values);
        }
      } else {
        showToast(response?.message || "Invoice check failed", "error");
      }
    } catch (error) {
      showToast(error?.message || "Invoice check failed", "error");
    } finally {
      setSubmitLoading(false);
    }
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
      field: "partCode",
      renderCell: ({ row }) => <ToolTipEllipses text={row.partCode} />,
      minWidth: 110,
    },
    {
      headerName: "Part Name",
      field: "partName",
      renderCell: ({ row }) => (
        <ToolTipEllipses text={row.partName} copy={true} />
      ),
      minWidth: 250,
      flex: 1,
    },

    {
      headerName: "Hsn",
      field: "hsn",
      renderCell: ({ row }) => <ToolTipEllipses text={row.hsn} />,
      width: 110,

      // width: "12vw",
    },
    {
      headerName: "UOM",
      field: "uom",
      renderCell: ({ row }) => <ToolTipEllipses text={row.uom} />,
      width: 110,

      // width: "12vw",
    },
    {
      headerName: "Order Qty ",
      field: "qty",
      flex: 1,
      minWidth: 100,
      renderCell: ({ row }) => (
        <ToolTipEllipses text={row.orderQty} copy={false} />
      ),
      // flex: 1,
    },
    {
      headerName: "Import Rate",
      field: "rate",
      flex: 1,
      minWidth: 100,
    },
    {
      headerName: "Exchange Rate",
      field: "exchangeRate",
      flex: 1,
      minWidth: 100,
    },
    {
      headerName: "Taxable Value",
      field: "taxableValue",
      flex: 1,
      minWidth: 100,
      renderCell: ({ row }) => (
        <ToolTipEllipses text={row.taxableValue} copy={false} />
      ),
    },
    {
      headerName: "Foreign Value",
      field: "foreignValue",
      flex: 1,
      minWidth: 100,
    },
    {
      headerName: "Freight Value",
      field: "freightValue",
      minWidth: 150,
      flex: 1,
    },
    {
      headerName: "Custom Duty",
      field: "customDuty",
      flex: 1,
      minWidth: 100,
    },
    {
      headerName: "Total",
      field: "total",
      flex: 1,
      minWidth: 100,
    },
    {
      headerName: "Final Rate",
      field: "finalRate",
      flex: 1,
      minWidth: 100,
    },
  ];

  const submitMIN = async (values) => {
    setSubmitLoading(true);

    if (fileName) {
      let final = {
        companybranch: "BROAKTRC25",
        invoices: fileName,
        poid: searchData.poNumber,
        manual_mfg_code: poData.materials.map((row) => row.manualMfgCode),
        invoice: invoice,
        invoiceDate: invoiceDate,
        location: selectLocation,
      };
      final = { ...final, ...values.componentData };
      const res = await executeFun(() => poMINforImport(final), "select");
      // const response = await imsAxios.post("/purchaseOrder/poMIN", final);
      let data = res?.data;
      // setSubmitLoading(false);
      if (res.success) {
        setSearchData({
          vendor: "",
          poNumber: "",
        });
        setFileName("");
        setSubmitLoading(false);
        setMaterialInSuccess({
          materialInId: data.transaction_id,
          poId: searchData.poNumber,
          vendor: searchData.vendor,
          components: poData?.materials?.map((row) => {
            return {
              id: row.id,
              componentName: row.component?.label,
              partNo: row.partCode,
              inQuantity: row.orderQty,
              location: selectLocation,
              poQuantity: row.poOrderQty,
            };
          }),
        });
        setIrnNum("");
      } else {
        setSubmitLoading(false);
        showToast(res.message, "error");
      }
    } else {
      setSubmitLoading(false);
      showToast(
        "Some error occured while uploading invoices, Please try again",
        "error",
      );
    }
  };
  const getCurrencies = async () => {
    const response = await imsAxios.get("/backend/fetchAllCurrecy");

    let arr = [];
    arr = response?.data.map((d) => {
      return {
        text: d.currency_symbol,
        value: d.currency_id,
        notes: d.currency_notes,
      };
    });
    // Currency is fixed for this flow. Pick the Dollar option from master data.
    const dollarOption = arr.find((option) => {
      const text = String(option?.text || "").toLowerCase();
      return text.includes("$") || text.includes("usd");
    });
    if (dollarOption?.value) {
      setCurrency(dollarOption.value);
    }
  };

  const getLocation = async (costCode) => {
    setPageLoading(true);
    const response = await imsAxios.post("/transaction/getLocationInMin", {
      search: "",
      cost_center: costCode,
    });
    setPageLoading(false);
    let arr = [];
    if (response.success) {
      arr = response.data.map((d) => {
        return { text: d.text, value: d.id };
      });
      setLocationOptions(arr);
    } else {
      setAsyncOptions([]);
    }
    return arr;
  };
  const props = {
    name: "file",
    multiple: false,

    maxCount: 1,

    beforeUpload() {
      return false;
    },
  };
  // const getAutoComnsumptionOptions = async () => {
  //   setPageLoading(true);

  //   const response = await imsAxios.get(
  //     "/transaction/fetchAutoConsumpLocation",
  //   );
  //   setPageLoading(false);
  //   if (response.success) {
  //     let arr = response?.data.map((row) => {
  //       return {
  //         value: row.id,
  //         text: row.text,
  //       };
  //     });
  //     arr = [{ value: 0, text: "NO" }, ...arr];
  //     setAutoConsumptionOption(arr);
  //   }
  // };

  const inputHandler = (name, value, id) => {
    let arr = poData?.materials;
    arr = arr.map((row) => {
      let obj = row;
      if (id == row.id) {
        if (name == "orderQty" || name == "orderqty") {
          const qty = Number(value) || 0;
          const rate = Number(row.rate) || 0;
          const exchangeRate = Number(row.exchangeRate) || 0;
          const customDuty = Number(row.customDuty) || 0;
          const freightValue = Number(row.freightValue) || 0;

          const taxableValue = qty * rate;
          const foreignValue = taxableValue * exchangeRate;
          const total = taxableValue + customDuty + freightValue;
          const finalRate =
            qty > 0 ? rate + customDuty / qty + freightValue / qty : rate;

          obj = {
            ...obj,
            orderQty: qty,
            taxableValue: taxableValue,
            foreignValue: foreignValue,
            total: total,
            finalRate: finalRate,
          };
          return obj;
        } else if (name == "rate") {
          const qty = Number(row.orderQty) || 0;
          const rate = Number(value) || 0;
          const exchangeRate = Number(row.exchangeRate) || 0;
          const customDuty = Number(row.customDuty) || 0;
          const freightValue = Number(row.freightValue) || 0;

          const taxableValue = qty * rate;
          const foreignValue = taxableValue * exchangeRate;
          const total = taxableValue + customDuty + freightValue;
          const finalRate =
            qty > 0 ? rate + customDuty / qty + freightValue / qty : rate;

          obj = {
            ...obj,
            rate: rate,
            taxableValue: taxableValue,
            foreignValue: foreignValue,
            total: total,
            finalRate: finalRate,
          };
          return obj;
        } else if (name == "exchangeRate") {
          const qty = Number(row.orderQty) || 0;
          const rate = Number(row.rate) || 0;
          const exchangeRate = Number(value) || 0;
          const customDuty = Number(row.customDuty) || 0;
          const freightValue = Number(row.freightValue) || 0;

          const taxableValue = qty * rate;
          const foreignValue = taxableValue * exchangeRate;
          const total = taxableValue + customDuty + freightValue;
          const finalRate =
            qty > 0 ? rate + customDuty / qty + freightValue / qty : rate;

          obj = {
            ...obj,
            exchangeRate: exchangeRate,
            foreignValue: foreignValue,
            total: total,
            finalRate: finalRate,
          };
          return obj;
        } else if (name == "customDuty") {
          const qty = Number(row.orderQty) || 0;
          const rate = Number(row.rate) || 0;
          // const exchangeRate = Number(row.exchangeRate) || 0;
          const customDuty = Number(value) || 0;
          const freightValue = Number(row.freightValue) || 0;

          const taxableValue = qty * rate;
          // const foreignValue = taxableValue * exchangeRate;
          const total = taxableValue + customDuty + freightValue;
          const finalRate =
            qty > 0 ? rate + customDuty / qty + freightValue / qty : rate;

          obj = {
            ...obj,
            customDuty: customDuty,
            total: total,
            finalRate: finalRate,
          };
          return obj;
        } else if (name == "freightValue") {
          const qty = Number(row.orderQty) || 0;
          const rate = Number(row.rate) || 0;
          // const exchangeRate = Number(row.exchangeRate) || 0;
          const customDuty = Number(row.customDuty) || 0;
          const freightValue = Number(value) || 0;

          const taxableValue = qty * rate;
          // const foreignValue = taxableValue * exchangeRate;
          const total = taxableValue + customDuty + freightValue;
          const finalRate =
            qty > 0 ? rate + customDuty / qty + freightValue / qty : rate;

          obj = {
            ...obj,
            freightValue: freightValue,
            total: total,
            finalRate: finalRate,
          };
          return obj;
        } else if (name == "mfgCode") {
          obj = {
            ...obj,
            mfgCode: value,
            manualMfgCode: value, // Keep both in sync
          };
          return obj;
        } else if (name == "hsncode" || name == "hsn") {
          obj = {
            ...obj,
            hsncode: value,
            hsn: value, // Keep both in sync
          };
          return obj;
        } else if (name == "location") {
          obj = {
            ...obj,
            [name]: value,
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
    setPoData((poData) => {
      return {
        ...poData,
        materials: arr,
      };
    });
  };

  const getVendors = async (search) => {
    // if (search?.length > 2) {
    const response = await executeFun(() => getVendorOptions(search), "select");
    let arr = [];
    if (response.success) {
      arr = convertSelectOptions(response.data);
    }
    setAsyncOptions(arr);
    // }
  };
  const resetFunction = () => {
    setPoData(resetPoData);
    setFileName("");
    setShowResetConfirm(false);
    setIsValid(false);
  };
  const getDetail = async () => {
    setSearchLoading(true);
    setPoData({ materials: [] });
    let search = {
      po: searchData.poNumber.trim(),
      vendor: searchData.vendor?.value,
    };
    const response = await imsAxios.post(
      "/purchaseOrder/fetchVendorPO",
      search,
    );
    setSearchLoading(false);

    if (response?.success) {
      let obj = response?.data;
      obj = {
        ...obj,
        poId: searchData.poNumber,
        materials: obj.materials.map((mat) => {
          // Calculate values
          const orderQty = mat.orderqty || 0;
          const orderRate = mat.orderrate || 0;
          const exchangeRate = mat.exchange_rate || 0;
          const taxableValue = mat.totalValue || orderQty * orderRate;
          const foreignValue = mat.usdValue || taxableValue * exchangeRate;
          const customDuty = mat.custom_duty || 0;
          const freightValue = mat.freight_value || 0;
          const total = taxableValue + customDuty + freightValue;
          // Calculate finalRate, handle division by zero
          const finalRate =
            orderQty > 0
              ? orderRate + customDuty / orderQty + freightValue / orderQty
              : orderRate;

          return {
            ...mat,
            id: v4(),
            // Map field names to match column expectations
            partCode: mat.partcode || mat.c_partno || "",
            manualMfgCode: mat.mfgCode || "--",
            mfgCode: mat.mfgCode || "--", // Also add for manualMFGCode cell component
            orderQty: orderQty,
            poOrderQty: mat.po_order_qty || 0,
            pendingQty: Math.max(0, (mat.po_order_qty || 0) - orderQty),
            rate: orderRate,
            exchangeRate: exchangeRate,
            hsn: mat.hsncode || "--",
            hsncode: mat.hsncode || "--", // Also add for HSNCell component
            // Add component object for rendering
            component: {
              label: mat.component_fullname || "",
              value: mat.componentKey || "",
            },
            componentKey: mat.componentKey || "",
            // Add calculated values
            taxableValue: taxableValue,
            foreignValue: foreignValue,
            customDuty: customDuty,
            freightValue: freightValue,
            finalRate: finalRate,
            total: total,
            // Keep original fields for reference
            orderremark: mat.orderremark || "",
            gsttype: mat.gsttype || "I",
            gstrate: mat.gstrate || "0",
          };
        }),
      };
      costCode = obj.headers.cost_center_key;
      setCodeCostCenter(costCode);

      setPoData(obj);
      setResetPoData(obj);
    } else {
      showToast(response.message, "error");
      setPoData({ materials: [] });
      //   toast.error("Some error Occurred");
    }
  };
  useEffect(() => {
    if (codeCostCenter) {
      getLocation(codeCostCenter);
    }
  }, [codeCostCenter]);

  const removeRow = (id) => {
    let arr = poData?.materials;
    arr = arr.filter((row) => row.id != id);
    setPoData((data) => ({ ...data, materials: arr }));
  };
  const columns = [
    {
      headerName: <></>,
      width: 40,
      field: "add",
      sortable: false,
      renderCell: ({ row }) => (
        // row.index >= 2 && (
        <CommonIcons action="removeRow" onClick={() => removeRow(row?.id)} />
      ),
      // ),
      // sortable: false,
    },
    {
      headerName: "Component",
      field: "component_fullname",
      // sortable: false,
      width: 200,
      renderCell: ({ row }) => <ToolTipEllipses text={row.component?.label} />,
      // width: 150,
    },
    {
      headerName: "Part No.",
      field: "partCode",
      renderCell: ({ row }) => <ToolTipEllipses text={row.partCode} />,
      sortable: false,
      width: 80,
    },
    {
      headerName: "MFG Code ",
      field: "manualMfgCode",
      renderCell: (params) => manualMFGCode(params, inputHandler),
      sortable: false,
      width: 100,
    },

    {
      headerName: "QTY",
      field: "orderQty",
      sortable: false,
      renderCell: (params) => (
        <Field
          attr="required | Qty is required"
          value={params.row.orderQty}
          treatZeroAsEmpty
          showValidation={isValid}
        >
          <Input
            value={params.row.orderQty}
            onChange={(e) =>
              inputHandler("orderQty", e.target.value, params.row.id)
            }
          />
        </Field>
      ),
      width: 120,
    },
    {
      headerName: "Pending Qty",
      field: "pendingQty",
      sortable: false,
      renderCell: ({ row }) => <ToolTipEllipses text={row.pendingQty} />,
      width: 120,
    },
    {
      headerName: "PO Order Qty",
      field: "poOrderQty",
      sortable: false,
      renderCell: ({ row }) => <ToolTipEllipses text={row.poOrderQty} />,
      width: 120,
    },
    {
      headerName: "Rate",
      field: "rate",
      sortable: false,
       renderCell: (params) => (
        <Field
          attr="required | Rate is required"
          value={params.row.rate}
          treatZeroAsEmpty
          showValidation={isValid}
        >
          <Input
            value={params.row.rate}
            onChange={(e) => inputHandler("rate", e.target.value, params.row.id)}
          />
        </Field>
      ),
      width: 100,
    },
    {
      headerName: "Custom Duty",
      field: "customDuty",
      sortable: false,
      renderCell: (params) => (
        <Field
          attr="required | Custom Duty is required"
          value={params.row.customDuty}
          showValidation={isValid}
        >
          <Input
            value={params.row.customDuty}
            onChange={(e) =>
              inputHandler("customDuty", e.target.value, params.row.id)
            }
          />
        </Field>
      ),
      width: 100,
    },
    {
      headerName: "Freight Charge",
      field: "freightValue",
      sortable: false,
     renderCell: (params) => (
        <Field
          attr="required | Freight Charge is required"
          value={params.row.freightValue}
          showValidation={isValid}
        >
          <Input
            value={params.row.freightValue}
            onChange={(e) =>
              inputHandler("freightValue", e.target.value, params.row.id)
            }
          />
        </Field>
      ),
      width: 100,
    },
    {
      headerName: "Exchange Rate",
      field: "exchangeRate",
      sortable: false,
      renderCell: (params) => (
        <Input
          value={params.row.exchangeRate}
          onChange={(e) =>
            inputHandler("exchangeRate", e.target.value, params.row.id)
          }
        />
      ),
      width: 100,
    },
    {
      headerName: "Taxable Value",
      field: "taxableValue",
      sortable: false,
      renderCell: ({ row }) => (
        <Input disabled={true} value={row.taxableValue} />
      ),
      width: 120,
    },
    {
      headerName: "Foreign Value",
      field: "foreignValue",
      sortable: false,
      renderCell: ({ row }) => (
        <Input disabled={true} value={row.foreignValue} />
      ),
      width: 120,
    },
    {
      headerName: "Final Rate",
      field: "finalRate",
      flex: 1,
      minWidth: 120,
      renderCell: ({ row }) => <Input disabled={true} value={row.finalRate} />,
    },
    {
      headerName: "Total",
      field: "total",
      flex: 1,
      minWidth: 120,
      renderCell: ({ row }) => <Input disabled={true} value={row.total} />,
    },
    {
      headerName: "HSN Code",
      field: "hsn",
      sortable: false,
      renderCell: (params) => HSNCell(params, inputHandler, isValid),
      width: 150,
    },
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
    { headerName: "Part No.", field: "partNo", flex: 1 },
    { headerName: "PO Quantity", field: "poQuantity", flex: 1 },
    { headerName: "In Quantity", field: "inQuantity", flex: 1 },
    { headerName: "Location", field: "location", flex: 1 },
  ];
  const newMinFunction = () => {
    setMaterialInSuccess(false);
    setPoData({ materials: [] });
    setResetPoData({ materials: [] });
    window.location.reload();
  };

  useEffect(() => {
    // getDetail();
    // getLocation();
    getCurrencies();
  }, []);
  useEffect(() => {
    let grandTotal = poData?.materials.map((row) =>
      Number(row?.total).toFixed(2),
    );
    let totalTaxableValue = poData?.materials.map((row) =>
      Number(row?.taxableValue),
    );
    let customTotal = poData?.materials.map((row) => Number(row?.customDuty));
    let freightTotal = poData?.materials.map((row) =>
      Number(row?.freightValue),
    );
    // let inrValue = poData?.materials.map((row) => Number(row?.inrValue));
    let obj = [
      { label: "Total Taxable Value", sign: "+", values: totalTaxableValue },
      { label: "Total Custom Duty", sign: "+", values: customTotal },
      { label: "Total Freight Charges", sign: "+", values: freightTotal },
      { label: "Total Sum", sign: "", values: grandTotal },
    ];
    setTotalValues(obj);
  }, [poData]);
  // log
  const { Text } = Typography;

  const callFileUpalod = async () => {
    setPreview(true);
    const values = uplaodForm.getFieldsValue();

    const file = values.files[0].originFileObj;
    const formData = new FormData();
    formData.append("file", file);
    formData.append("po_id", searchData.poNumber);
    const response = await executeFun(
      () => uploadPOExportFile(formData),
      "fetch",
    );

    if (response?.success) {
      let { data } = response;

      // Flatten the new data structure to extract part details and other fields
      const formattedRows = data?.map((item) => {
        const part = item.part;
        return {
          partCode: part.part_code,
          partName: part.part_name,
          componentKey: part.component_key,
          manualMfgCode: part.manual_mfg_code,
          hsn: item.hsn,
          uom: item.uom,
          orderQty: item.order_qty,
          importRate: item.import_rate,
          exchangeRate: item.exchange_rate,
          taxableValue: item.taxable_value,
          foreignValue: item.foreign_value,
          freightValue: item.freight_value,
          customDuty: item.custom_duty,
          total: item.total,
          finalRate: item.final_rate,
          pendingQty: item.pending_qty,
          poOrderQty: item.po_order_qty,
          value: (item.order_qty * item.import_rate).toFixed(3),
        };
      });
      // Optional: map formatted rows to final structure
      let arr = formattedRows.map((r, index) => ({
        id: index + 1,
        partCode: r.partCode,
        partName: r.partName,
        component: { label: r.partName, value: r.componentKey },
        qty: r.orderQty,
        rate: r.importRate,
        hsn: r.hsn,
        hsncode: r.hsn,
        value: r.value,
        gstRate: r.exchangeRate, // Example, adjust as needed
        gstType: r.uom, // Example, adjust as needed
        ...r,
      }));
      setPreviewRows(arr);
    } else {
      showToast(response?.message, "error");
      setPreview(false);
    }
  };
  const handleUploadDocument = async () => {
    setUploadLoading(true);

    try {
      const formData = new FormData();
      const values = await form2.validateFields();
      if (!values?.components[0]?.file) {
        showToast("Please upload Files", "error");
        return;
      }
      values.components.map((comp) => {
        formData.append("files", comp.file[0]?.originFileObj);
      });

      const response = await imsAxios.post(
        "/transaction/upload-invoice",
        formData,
      );

      if (response?.success) {
        setFileName(response?.data);
        setUploadedComponents(values.components);
        setUploadClicked(false);
        showToast(response?.message || "Upload Document success", "success");
        setUploadLoading(false);
      } else {
        showToast(response?.message || "Upload Document failed", "error");
        setUploadLoading(false);
      }
    } catch (error) {
      showToast(error?.message || "Upload Document failed", "error");
      setUploadLoading(false);
    } finally {
      setUploadLoading(false);
    }
  };

  const handleUploadDocumentsBatch = async (files) => {
    setUploadLoading(true);

    try {
      if (!files?.length) {
        showToast("Please upload Files", "error");
        return;
      }

      const formData = new FormData();

      files.forEach((file) => formData.append("files", file));
      const fileResponse = await imsAxios.post(
        "/transaction/upload-invoice",
        formData,
      );
      if (!fileResponse?.success) {
        throw new Error(fileResponse?.message || "Upload Document failed");
      }
      setFileName(fileResponse?.data);
      setUploadedComponents(filesData ?? []);
      showToast(fileResponse?.message || "Upload Document success", "success");
      return fileResponse;
    } finally {
      setUploadLoading(false);
    }
  };

  const handleFileUploadDelete = (id) => {
    setFilesData(filesData.filter((item) => item.id !== id));
  };

  const handleFileUploadChange = (items) => {
    setFilesData(items);
  };

  return (
    <div
      style={{
        height: "calc(100vh - 215px)",
        width: "100%",
        position: "relative",
        margin: 8,
      }}
    >
       {!materialInSuccess && (
      <Row>
        {(pageLoading || submitLoading == true) && <Loading />}
        <Col>
          <Space>
            <div style={{ width: 250 }}>
              <MyAsyncSelect
                allowClear
                size="default"
                selectLoading={loading1("select")}
                onBlur={() => setAsyncOptions([])}
                value={searchData.vendor}
                onChange={(value) =>
                  setSearchData((searchData) => ({
                    ...searchData,
                    vendor: value,
                  }))
                }
                labelInValue
                loadOptions={getVendors}
                optionsState={asyncOptions}
                placeholder="Select Vendor..."
                   showError={searchValid}
                message="Please select a vendor"
              />
            </div>
            <div style={{ width: 180 }}>
           <Field
                attr="required | Please enter a PO number"
                value={searchData.poNumber}
                showValidation={searchValid}
              >
                <Input
                  placeholder="PO Number"
                  value={searchData.poNumber}
                  onChange={(e) =>
                    setSearchData((searchData) => ({
                      ...searchData,
                      poNumber: e.target.value,
                    }))
                  }
                />
              </Field>
            </div>
            <MyButton
              disabled={searchData.vendor == "" || searchData.poNumber == ""}
              type="primary"
              loading={searchLoading}
                onClick={() => {
                if (!searchData.vendor || !searchData.poNumber) {
                  setSearchValid(true);
                  return;
                }
                setSearchValid(false);
                getDetail();
              }}
              id="submit"
              variant="search"
            >
              Search
            </MyButton>
          </Space>
        </Col>
        <Col
          span={14}
          style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}
        >
          <MyButton
            variant="upload"
            text="Import"
            onClick={() => {
              if (searchData?.poNumber) {
                setOpen(true);
              } else {
                showToast("Please enter PO Number", "error");
              }
            }}
          >
            Excel
          </MyButton>

          <FileUpload
            accept="image/*,.pdf"
            multiple
            maxFiles={3}
            maxFileSize={5 * 1024 * 1024}
            title="Documents"
            getContainer={() => tableContainerRef.current}
            // onUpload={handleUploadDocument}
            onUploadBatch={handleUploadDocumentsBatch}
            onDelete={handleFileUploadDelete}
            onChange={handleFileUploadChange}
          >
            <MyButton
              variant="upload"
              text={`Upload Documents ${filesData?.length > 0 ? `(${filesData?.length})` : ""}`}
            />
          </FileUpload>
        </Col>
      </Row>)}
      {/* vendor info modal */}
      <Modal
        style={{
          top: 10,
        }}
        width={600}
        title={`Vendor Info : ${poData?.vendor_type?.vendorcode}`}
        open={showVendorInfo}
        onCancel={() => setShowVendorInfo(false)}
        footer={[]}
      >
        <Row gutter={[0, 16]}>
          <Col span={24}>
            <Row>
              <Col span={6}>
                <Text style={{ fontWeight: 500, whiteSpace: "nowrap" }}>
                  Vendor Name :
                </Text>
              </Col>
              <Col style={{ whiteSpace: "nowrap" }} span={18}>
                {poData?.vendor_type?.vendorname}
              </Col>
            </Row>
          </Col>
          <Col span={24}>
            <Row>
              <Col span={6}>
                <Text style={{ fontWeight: 500, whiteSpace: "nowrap" }}>
                  Vendor Address :
                </Text>
              </Col>
              <Col span={18}>
                {poData?.vendor_type?.vendoraddress?.replaceAll("<br>", " ")}
              </Col>
            </Row>
          </Col>
          <Col span={24}>
            <Row>
              <Col span={6}>
                <Text style={{ fontWeight: 500, whiteSpace: "nowrap" }}>
                  Vendor GST :
                </Text>
              </Col>
              <Col style={{ whiteSpace: "nowrap" }} span={18}>
                {poData?.vendor_type?.gstin}
              </Col>
            </Row>
          </Col>
        </Row>
        {/* <Row>
          <Col span={24}>
            <DescriptionItem
              title="Vendor Address"
              content={poData?.vendor_type?.vendoraddress?.replaceAll(
                "<br>",
                " "
              )}
            />
          </Col>
        </Row>
        <Row>
          <Col span={24}>
            <DescriptionItem title="Vendor GST" content="" />
          </Col>
        </Row> */}
      </Modal>
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
          <Button key="submit" type="primary" onClick={resetFunction}>
            Yes
          </Button>,
        ]}
      >
        <p>Are you sure you want to reset the entered data?</p>
      </Modal>

      {/* currency modal */}
      {showCurrency != null && (
        <CurrenceModal
          showCurrency={showCurrency}
          setShowCurrencyModal={setShowCurrenncy}
        />
      )}
      {/* upload doc modal */}

      {!materialInSuccess && (
        <Row gutter={8} style={{ height: "100%", marginTop: 10 }}>
          <Col span={6} style={{ overflowY: "auto", height: "100%" }}>
            <Row
              style={{
                height: "calc(100% - 60px)",
              }}
              gutter={[0, 4]}
            >
              <Row>
                <Card size="small" title="Vendor Details">
                  <Row gutter={[0, 8]}>
                    <Col span={24}>
                      {!searchLoading && (
                        <Typography.Title
                          style={{
                            fontSize:
                              window.innerWidth < 1600 ? "0.85rem" : "0.95rem",
                          }}
                          level={5}
                        >
                          Type
                        </Typography.Title>
                      )}
                      {!searchLoading && (
                        <Typography.Text
                          style={{
                            fontSize:
                              window.innerWidth < 1600 ? "0.7rem" : "0.8rem",
                          }}
                        >
                          {poData?.headers?.vendortype ?? "N/A"}
                        </Typography.Text>
                      )}
                      <Skeleton
                        paragraph={false}
                        style={{ width: "100%" }}
                        rows={1}
                        loading={searchLoading}
                        active
                      />
                    </Col>
                    <Col span={24}>
                      {!searchLoading && (
                        <Typography.Title
                          style={{
                            fontSize:
                              window.innerWidth < 1600 ? "0.85rem" : "0.95rem",
                          }}
                          level={5}
                        >
                          Name
                        </Typography.Title>
                      )}
                      {!searchLoading && (
                        <Typography.Text
                          style={{
                            fontSize:
                              window.innerWidth < 1600 ? "0.7rem" : "0.8rem",
                          }}
                        >
                          {poData?.headers?.vendorname ?? "N/A"}
                        </Typography.Text>
                      )}
                      <Skeleton
                        paragraph={false}
                        style={{ width: "100%" }}
                        rows={1}
                        loading={searchLoading}
                        active
                      />
                    </Col>
                    <Col span={24}>
                      {!searchLoading && (
                        <Typography.Title
                          style={{
                            fontSize:
                              window.innerWidth < 1600 ? "0.85rem" : "0.95rem",
                          }}
                          level={5}
                        >
                          Address
                        </Typography.Title>
                      )}
                      {!searchLoading && (
                        <Typography.Text
                          style={{
                            fontSize:
                              window.innerWidth < 1600 ? "0.7rem" : "0.8rem",
                          }}
                        >
                          <ToolTipEllipses
                            type="Paragraph"
                            text={
                              poData?.headers?.vendoraddress?.replaceAll(
                                "<br>",
                                " ",
                              ) ?? "N/A"
                            }
                          />
                        </Typography.Text>
                      )}
                      <Skeleton
                        paragraph={false}
                        style={{ width: "100%" }}
                        rows={1}
                        loading={searchLoading}
                        active
                      />
                    </Col>
                    <Col span={24}>
                      {!searchLoading && (
                        <Typography.Title
                          style={{
                            fontSize:
                              window.innerWidth < 1600 ? "0.85rem" : "0.95rem",
                          }}
                          level={5}
                        >
                          GSTIN
                        </Typography.Title>
                      )}
                      {!searchLoading && (
                        <Typography.Text
                          style={{
                            fontSize:
                              window.innerWidth < 1600 ? "0.7rem" : "0.8rem",
                          }}
                        >
                          {poData?.headers?.gstin ?? "N/A"}
                        </Typography.Text>
                      )}

                      <span display="flex"></span>
                      <Skeleton
                        paragraph={false}
                        style={{ width: "100%" }}
                        rows={1}
                        loading={searchLoading}
                        active
                      />
                    </Col>
                    <Col span={24}>
                      {!searchLoading && (
                        <Typography.Title
                          style={{
                            fontSize:
                              window.innerWidth < 1600 ? "0.85rem" : "0.95rem",
                          }}
                          level={5}
                        >
                          Cost Center
                        </Typography.Title>
                      )}
                      {!searchLoading && (
                        <Typography.Text
                          style={{
                            fontSize:
                              window.innerWidth < 1600 ? "0.7rem" : "0.8rem",
                          }}
                        >
                          {poData?.headers?.cost_center_name ?? "N/A"}
                        </Typography.Text>
                      )}
                      <Skeleton
                        paragraph={false}
                        style={{ width: "100%" }}
                        rows={1}
                        loading={searchLoading}
                        active
                      />
                    </Col>

                    <Col span={24}>
                      {!searchLoading && (
                        <Typography.Title
                          style={{
                            fontSize:
                              window.innerWidth < 1600 ? "0.85rem" : "0.95rem",
                          }}
                          level={5}
                        >
                          Project Code
                        </Typography.Title>
                      )}
                      {!searchLoading && (
                        <Typography.Text
                          style={{
                            fontSize:
                              window.innerWidth < 1600 ? "0.7rem" : "0.8rem",
                          }}
                        >
                          {poData?.headers?.project_code ?? "N/A"}
                        </Typography.Text>
                      )}
                      <Skeleton
                        paragraph={false}
                        style={{ width: "100%" }}
                        rows={1}
                        loading={searchLoading}
                        active
                      />
                    </Col>

                    <Col span={24}>
                      {!searchLoading && (
                        <Typography.Title
                          style={{
                            fontSize:
                              window.innerWidth < 1600 ? "0.85rem" : "0.95rem",
                          }}
                          level={5}
                        >
                          Project Description
                        </Typography.Title>
                      )}
                      {!searchLoading && (
                        <Typography.Text
                          style={{
                            fontSize:
                              window.innerWidth < 1600 ? "0.7rem" : "0.8rem",
                          }}
                        >
                          {poData?.headers?.project_description ?? "--"}
                        </Typography.Text>
                      )}
                      <Skeleton
                        paragraph={false}
                        style={{ width: "100%" }}
                        rows={1}
                        loading={searchLoading}
                        active
                      />
                    </Col>
                    <Col span={24}>
                      <Typography.Title
                        style={{
                          fontSize:
                            window.innerWidth < 1600 ? "0.85rem" : "0.95rem",
                        }}
                        level={5}
                      >
                        Currency
                      </Typography.Title>
                      <Input value={FIXED_CURRENCY_LABEL} disabled />
                    </Col>
                    <Col span={24}>
                      <Typography.Title
                        style={{
                          fontSize:
                            window.innerWidth < 1600 ? "0.85rem" : "0.95rem",
                        }}
                        level={5}
                      >
                        Location
                      </Typography.Title>
                      <MySelect
                        onChange={(value) => setSelectLocation(value)}
                        value={selectLocation}
                        options={locationOptions}
                        label="Location"
                            showError={isValid}
                        message="Location is required"
                      />
                    </Col>
                    <Col span={24}>
                      <Typography.Title
                        style={{
                          fontSize:
                            window.innerWidth < 1600 ? "0.85rem" : "0.95rem",
                        }}
                        level={5}
                      >
                        Invoice Number
                      </Typography.Title>
                      <Field
                        attr="required | Please enter invoice number"
                        value={invoice}
                        showValidation={isValid}
                      >
                        <Input
                          name="invoice_number"
                          onChange={(value) => {
                            setInvoice(value.target.value);
                          }}
                          value={invoice}
                        />
                      </Field>
                    </Col>
                    <Col span={24}>
                      <Typography.Title
                        style={{
                          fontSize:
                            window.innerWidth < 1600 ? "0.85rem" : "0.95rem",
                        }}
                        level={5}
                      >
                        Invoice Date
                      </Typography.Title>
                           <SingleDatePicker
                        setDate={(value) => setInvoiceDate(value)}
                        value={invoiceDate}
                        showError={isValid}
                        message="Please select an invoice date"
                      />
                    </Col>
                  </Row>
                </Card>
              </Row>

              {/* tax details */}
              <Col span={24} style={{ width: "100%" }}>
                <Card
                  size="small"
                  style={{ width: "100%", height: "100%" }}
                  bodyStyle={{ overflowY: "auto" }}
                  title="Tax Details"
                >
                  <Row gutter={[0, 4]}>
                    {totalValues?.map((row) => (
                      <Col span={24} key={row.label}>
                        <Row>
                          <Col
                            span={18}
                            style={{
                              fontSize: "0.8rem",
                              fontWeight:
                                totalValues?.indexOf(row) ==
                                  totalValues.length - 1 && 600,
                            }}
                          >
                            {row.label}
                          </Col>
                          <Col span={6} className="right">
                            {row.sign.toString() == "" ? (
                              ""
                            ) : (
                              <span
                                style={{
                                  fontSize: "0.7rem",
                                  fontWeight:
                                    totalValues?.indexOf(row) ==
                                      totalValues.length - 1 && 600,
                                }}
                              >
                                ({row.sign.toString()}){" "}
                              </span>
                            )}
                            <span
                              style={{
                                fontSize: "0.8rem",
                                fontWeight:
                                  totalValues?.indexOf(row) ==
                                    totalValues.length - 1 && 600,
                              }}
                            >
                              {Number(
                                row.values?.reduce((partialSum, a) => {
                                  return partialSum + Number(a);
                                }, 0),
                              ).toFixed(2)}
                            </span>
                          </Col>
                        </Row>
                      </Col>
                    ))}
                  </Row>
                </Card>
              </Col>
              <Modal
                title="Upload File Here"
                open={open}
                width={500}
                onCancel={() => setOpen(false)}
                footer={[
                  <Button key="back" onClick={() => setOpen(false)}>
                    Cancel
                  </Button>,
                  <Button key="submit" type="primary" onClick={callFileUpalod}>
                    Preview
                  </Button>,
                ]}
              >
                {loading("fetch") && <Loading />}
                <Card>
                  <Form
                    // initialValues={initialValues}
                    form={uplaodForm}
                    layout="vertical"
                  >
                    <Form.Item>
                      <Form.Item
                        name="files"
                        valuePropName="fileList"
                        getValueFromEvent={normFile}
                        // rules={rules.file}
                        noStyle
                      >
                        <Upload.Dragger name="files" {...props}>
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
                      <a
                        href="https://alwar.prod.mscorpres.com/files/samples/Import%20PO.xlsx"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <MyButton variant="downloadSample" />
                      </a>
                    </Row>
                  </Form>
                </Card>
              </Modal>
              <Drawer
                width="100%"
                title="Preview Data From Excel"
                placement="right"
                onClose={() => setPreview(false)}
                destroyOnClose={true}
                open={preview}
                bodyStyle={{
                  padding: 5,
                }}
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
                      // pagination
                      loading={loading("fetch")}
                      headText="center"
                      // export={true}
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
                      // submithtmlType="Save"
                      // resethtmlType="Back"
                      submitFunction={saveTheData}
                      nextLabel="Submit"
                      resetFunction={() => setPreview(false)}
                    ></NavFooter>
                  </Row>
                </Row>
              </Drawer>
              <Modal
                open={uplaoaClicked}
                layout="vertical"
                width={700}
                loading={uploadLoading}
                // destroyOnClose={true}
                onCancel={() => {
                  setFileName("");
                  setUploadClicked(false);
                  setUploadLoading(false);
                }}
                onOk={handleUploadDocument}
                // style={{ maxHeight: "50%", height: "50%", overflowY: "scroll" }}
              >
                <Form
                  initialValues={defaultValues}
                  form={form2}
                  layout="vertical"
                >
                  <Card style={{ height: "20rem", overflowY: "scroll" }}>
                    <div style={{ flex: 1 }}>
                      <Col
                        span={24}
                        style={{
                          overflowX: "hidden",
                          overflowY: "auto",
                        }}
                      >
                        <Form.List name="components">
                          {(fields, { add, remove }) => (
                            <>
                              <Col>
                                {fields.map((field, index) => (
                                  <Form.Item noStyle key={field.key}>
                                    <SingleProduct
                                      fields={fields}
                                      field={field}
                                      index={index}
                                      add={add}
                                      form={form2}
                                      remove={remove}
                                      // setFiles={setFiles}
                                      // files={files}
                                    />
                                  </Form.Item>
                                ))}
                              </Col>
                            </>
                          )}
                        </Form.List>
                      </Col>
                    </div>
                  </Card>
                </Form>
              </Modal>
            </Row>
          </Col>
          <Col span={18}>
            <div
              ref={tableContainerRef}
              style={{
                height: "100%",
                position: "relative",
                overflow: "hidden",
                display: "flex",
              }}
            >
              <FormTable
                columns={columns}
                data={poData?.materials}
                loading={loading("select" || pageLoading)}
              />
            </div>
          </Col>

          <NavFooter
            hideHeaderMenu
            nextLabel="Submit"
            loading={submitLoading}
            resetFunction={() => {
              setShowResetConfirm(true);
            }}
            submitFunction={validateData}
            disabled={
              {
                // uploadDoc: !poData.headers,
                // reset: !poData.headers,
                // next: !poData.headers,
                // back: !poData.headers,
              }
            }
          />
        </Row>
      )}
      {materialInSuccess && (
        <SuccessPage
          newMinFunction={newMinFunction}
          po={materialInSuccess}
          successColumns={successColumns}
        />
      )}
    </div>
  );
}
const defaultValues = {
  components: [
    {
      // file: "",
    },
  ],
};
