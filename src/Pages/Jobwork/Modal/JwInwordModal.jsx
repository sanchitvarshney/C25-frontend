import { useState, useEffect } from "react";
import {
  Card,
  Col,
  Drawer,
  Row,
  Space,
  Input,
  Select,
  Button,
  Skeleton,
  Popconfirm,
  Form,
  Typography,
  Upload,
  Modal,
  Checkbox,
} from "antd";
import {
  CheckCircleOutlined,
  CloseCircleFilled,
  CloudUploadOutlined,
  DownloadOutlined,
  FileExcelOutlined,
  FormOutlined,
  InboxOutlined,
} from "@ant-design/icons";
import MySelect from "../../../Components/MySelect";
import { v4 } from "uuid";
import MyAsyncSelect from "../../../Components/MyAsyncSelect";
import { useToast } from "../../../hooks/useToast.js";
import { imsAxios } from "../../../axiosInterceptor";
import useLoading from "../../../hooks/useLoading";
import {
  getComponentOptions,
  savejwsfinward,
} from "../../../api/general.ts";
import * as XLSX from "xlsx";
import useApi from "../../../hooks/useApi.ts";
import NavFooter from "../../../Components/NavFooter";
import { GridActionsCellItem } from "@mui/x-data-grid";
import { Delete } from "@mui/icons-material";
import { uploadMinInvoice } from "../../../api/store/material-in";
import SuccessPage from "../../Store/MaterialIn/SuccessPage";
import ToolTipEllipses from "../../../Components/ToolTipEllipses";
import SingleProduct from "../../Master/Vendor/SingleProduct";
import FormTable from "../../../Components/FormTable.jsx";
export default function JwInwordModal({ editModal, setEditModal }) {
  const { showToast } = useToast();
  const [asyncOptions, setAsyncOptions] = useState([]);
  const [locValue, setLocValue] = useState([]);
  const [header, setHeaderData] = useState([]);
  const [modalLoad, setModalLoad] = useLoading();
  const [modalUploadLoad, setModalUploadLoad] = useState(false);
  const { all, row } = editModal;
  const [mainData, setMainData] = useState([]);
  const [eWayBill, setEWayBill] = useState("");
  const [bomList, setBomList] = useState([]);
  const [showBomList, setShowBomList] = useState(false);
  const [conrem, setConRem] = useState("");
  const [loading, setLoading] = useState(false);
  const [attachment, setAttachment] = useState("");
  const [irnNo, setIrnNo] = useState("");
  const [materialInSuccess, setMaterialInSuccess] = useState(false);
  const [isApplicable, setIsApplicable] = useState(false);
  const [isScan, setIsScan] = useState(false);
  // const [pickLocationOptions, setPickLocationOptions] = useState([]);
  const [modalForm] = Form.useForm();
  const [excelUploadForm] = Form.useForm();

  const fileComponents = Form.useWatch("fileComponents", modalForm);
  const [uplaoaClicked, setUploadClicked] = useState(false);
  const [consumptionStep, setConsumptionStep] = useState("details");
  const [consumptionMode, setConsumptionMode] = useState("");
  const [excelRows, setExcelRows] = useState([]);
  const { executeFun, loading: loading1 } = useApi();
  const getFetchData = async () => {
    setModalLoad("fetch", true);
    const response = await imsAxios.get(
      `/jobwork/fetch_jw_sf_inward_components?skucode=${row.sku}&transaction=${row.transaction_id}`
    );

    if (response.success) {
      getLocation(response?.data.header.vendor.code,response.data.header.jobworkID);
      let arr = response?.data.body.map((row, index) => {
        return {
          ...row,
          id: v4(),
          index: index + 1,
          // orderqty: row.orderQty,
          unitsname: row.unit,
          component: {
            label: `${row.component.name} ${row.component.part}`,
            value: row.component.key,
          },
        };
      });
      setIsApplicable(response.data.header.einvoiceStatus);
      setMainData(arr);
      setHeaderData(response.data.header);
      setModalLoad("fetch", false);
    } else if (!response.success) {
      showToast(response?.message, "error");
    }
    setModalLoad("fetch", false);
  };
  const getOption = async (e) => {
    if (e?.length > 2) {
      const response = await executeFun(() => getComponentOptions(e), "select");
      //     setLoading("select", false);
      //     const { data } = response;
      // const response = await imsAxios.post("/backend/getComponentByNameAndNo", {
      //   search: e,
      // });
      const { data } = response;
      let arr = [];
      arr = data.map((d) => {
        return { text: d.text, value: d.id };
      });
      setAsyncOptions(arr);
    }
  };
  const getLocation = async (vendor,jw) => {
    const response = await imsAxios.get(`/backend/jw/warehouse/location?vendor=${vendor}&jw=${jw}`);
    let arr = [];
    arr = response.data.map((d) => {
      return { label: d.name, value: d.key };
    });
    setLocValue(arr);
  };

  const getPickLocation = async () => {
    let vendor = header?.vendor?.code;
    if (vendor) {
      try {
        const response = await imsAxios.get(
          `/backend/fetchVendorJWLocation?vendor=${vendor}`
        );
        if (response.success) {
          let arr = [];
          arr = response.data.map((row) => ({
            value: row.id,
            text: row.text,
          }));
          setPickLocationOptions(arr);
        } else {
          showToast(response.message, "error");
        }
      } catch (error) {
        showToast(error.message || "Failed to fetch pick location", "error");
      }
    }
  };
  const inputHandler = async (name, id, value) => {
    if (name == "component") {
      setMainData((a) =>
        a.map((aa) => {
          if (aa.id == id) {
            {
              return { ...aa, component: value };
            }
          } else {
            return aa;
          }
        })
      );
    } else if (name == "orderqty") {
      setMainData((a) =>
        a.map((aa) => {
          if (aa.id == id) {
            {
              return { ...aa, orderqty: value };
            }
          } else {
            return aa;
          }
        })
      );
    } else if (name == "rate") {
      if (value !== "" && Number(value) < 0) {
        showToast("Rate should not be negative", "error");
        value = 0;
      }
      setMainData((a) =>
        a.map((aa) => {
          if (aa.id == id) {
            {
              return { ...aa, rate: value };
            }
          } else {
            return aa;
          }
        })
      );
    } else if (name == "invoice") {
      setMainData((a) =>
        a.map((aa) => {
          if (aa.id == id) {
            {
              return { ...aa, invoice: value };
            }
          } else {
            return aa;
          }
        })
      );
    } else if (name == "remark") {
      setMainData((a) =>
        a.map((aa) => {
          if (aa.id == id) {
            {
              return { ...aa, remark: value };
            }
          } else {
            return aa;
          }
        })
      );
    } else if (name == "conRemark") {
      setBomList((a) =>
        a.map((aa) => {
          if (aa.id == id) {
            {
              return { ...aa, conRemark: value };
            }
          } else {
            return aa;
          }
        })
      );
    } else if (name == "location") {
      setMainData((a) =>
        a.map((aa) => {
          if (aa.id == id) {
            {
              return { ...aa, location: value };
            }
          } else {
            return aa;
          }
        })
      );
    } else if (name == "rqdQty") {
      setBomList((a) =>
        a.map((aa) => {
          if (aa.id == id) {
            return { ...aa, rqdQty: value };
          }
          return aa;
        })
      );
    } else if (name == "irn") {
      setMainData((a) =>
        a.map((aa) => {
          if (aa.id == id) {
            {
              return { ...aa, irn: value };
            }
          } else {
            return aa;
          }
        })
      );
    }
  };
  const removeRow = (id) => {
    setBomList((prev) => {
      const filtered = prev.filter((row) => row.id != id);
      // Reindex to keep the serial numbers continuous
      return filtered.map((row, index) => ({ ...row, id: index + 1 }));
    });
  };

  const exceedsPendingStock = (row) => {
    const rqd = Number(row.rqdQty);
    const pending = Number(row.pendingStock);
    if (row.rqdQty === "" || row.rqdQty == null) return false;
    return !Number.isNaN(rqd) && !Number.isNaN(pending) && rqd > pending;
  };

  const formatBomRows = (rows = []) =>
    rows.map((r, id) => ({
      id: id + 1,
      bomQty: r.bom_qty,
      partName: r.part_name,
      cat_part_code: r.cat_part_code,
      partNo: r.part_no,
      pendingStock: r.pending_jw_qty,
      rqdQty: r.rqd_qty,
      pending_jw_qty: r.pending_jw_qty,
      uom: r.uom,
      key: r.key,
      conRemark: r.remark ?? r.conRemark ?? "",
      last_rate: r.last_rate,
    }));

  const applyExcelRemarks = (rows, payload) => {
    const remarkByPart = (payload?.part ?? []).reduce((acc, part, index) => {
      acc[String(part).trim()] = payload?.remark?.[index] ?? "";
      return acc;
    }, {});

    return rows.map((row) => ({
      ...row,
      conRemark:
        row.conRemark ||
        remarkByPart[String(row.partNo).trim()] ||
        remarkByPart[String(row.key).trim()] ||
        "",
    }));
  };

  const fetchBomItems = async (type, payload) => {
    const isExcelUpload = type === "excel";
    const response = await imsAxios({
      // Browsers drop GET request bodies, so Excel uses POST to send part/remark.
      method: "POST",
      url: "/jobwork/bom-items",
      params: {
        jwID: header?.jobworkID,
        sfgCreateQty: mainData[0]?.orderqty,
        type,
      },
      ...(isExcelUpload
        ? {
            data: payload,
          }
        : {}),
    });
    return response;
  };

  const getBomRowsFromResponse = (response) => {
    if (Array.isArray(response?.data)) return response.data;
    if (Array.isArray(response?.data?.data)) return response.data.data;
    return [];
  };

  const isBomResponseSuccess = (response) =>
    response?.success ||
    response?.status === "success" ||
    response?.code == 200 ||
    response?.data?.status === "success" ||
    response?.data?.code == 200;

  const readExcelRows = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const workbook = XLSX.read(event.target.result, { type: "array" });
          const sheetName = workbook.SheetNames[0];
          const sheet = workbook.Sheets[sheetName];
          const rows = XLSX.utils.sheet_to_json(sheet, { defval: "" });
          const formattedRows = rows
            .map((row, index) => {
              const partcode =
                row.partcode ??
                row.Partcode ??
                row.PartCode ??
                row["Part Code"] ??
                row["Part code"] ??
                row.part_code ??
                row.PART_CODE ??
                row.PARTCODE ??
                "";
              const remark = row.remark ?? row.Remark ?? row.REMARK ?? "";
              return {
                id: index + 1,
                partcode: String(partcode).trim(),
                remark: String(remark).trim(),
              };
            })
            .filter((row) => row.partcode || row.remark);
          resolve(formattedRows);
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = reject;
      reader.readAsArrayBuffer(file);
    });

  const excelUploadProps = {
    name: "file",
    multiple: false,
    maxCount: 1,
    accept: ".xlsx,.xls",
    beforeUpload() {
      return false;
    },
  };

  const normFile = (e) => {
    if (Array.isArray(e)) {
      return e;
    }
    return e?.fileList;
  };

  const downloadExcelSample = () => {
    const worksheet = XLSX.utils.json_to_sheet([
      {
        partcode: "P4881",
        remark: "urgent",
      },
      {
        partcode: "P4882",
        remark: "low stock",
      },
    ]);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Sample");
    XLSX.writeFile(workbook, "jw-sf-inward-sample.xlsx");
  };

  const columns = [
    {
      field: "componentname",
      headerName: "Part Name",
      width: 320,
      renderCell: ({ row }) => (
        <MyAsyncSelect
          style={{ width: "100%" }}
          onBlur={() => setAsyncOptions([])}
          loadOptions={getOption}
          value={row.component}
          optionsState={asyncOptions}
          onChange={(e) => inputHandler("component", row.id, e)}
          placeholder="Part/Name"
          selectLoading={loading1("select")}
        />
      ),
    },
    {
      field: "orderqty",
      headerName: "Quantity",
      width: 180,
      renderCell: ({ row }) => (
        <Input
          suffix={row.unitsname}
          value={row.orderqty}
          type="number"
          placeholder="Qty"
          onChange={(e) => inputHandler("orderqty", row.id, e.target.value)}
        />
      ),
    },
    {
      field: "rate",
      headerName: "Rate",
      width: 180,
      renderCell: ({ row }) => (
        <Input
          type="number"
          min={0}
          value={row.rate ?? ""}
          placeholder="Rate"
          onChange={(e) => inputHandler("rate", row.id, e.target.value)}
        />
      ),
    },
    {
      field: "value",
      headerName: "Value",
      width: 120,
      renderCell: ({ row }) => (
        <Typography.Text>
          {row.orderqty * row.rate ? row.orderqty * row.rate : "--"}
        </Typography.Text>
      ),
    },
    {
      field: "invoice",
      headerName: "Invoice Id",
      width: 220,
      renderCell: ({ row }) => (
        <Input
          //  value={row.orderqty}
          placeholder="Invoice"
          onChange={(e) => inputHandler("invoice", row.id, e.target.value)}
        />
      ),
    },
    // {
    //   field: "irn",
    //   headerName: "Acknowledgment Number",
    //   width: 220,
    //   renderCell: ({ row }) => (
    //     <Input
    //       //  value={row.orderqty}
    //       placeholder="Acknowledgment Number"
    //       onChange={(e) => inputHandler("irn", row.id, e.target.value)}
    //     />
    //   ),
    // },
    {
      field: "remark",
      headerName: "Remark",
      width: 220,
      renderCell: ({ row }) => (
        <Input
          //  value={row.orderqty}
          placeholder="Remark"
          onChange={(e) => inputHandler("remark", row.id, e.target.value)}
        />
      ),
    },
    {
      field: "location",
      headerName: "Location",
      width: 120,
      renderCell: ({ row }) => (
        <Select
          style={{ width: "100%" }}
          options={locValue}
          onChange={(e) => inputHandler("location", row.id, e)}
        />
      ),
    },
  ];
  const bomcolumns = [
    {
      headerName: "",
      width: 50,
      fixed: "left",
      type: "actions",
      field: "add",
      sortable: false,
      renderCell: ({ row }) => [
        <GridActionsCellItem
          icon={<Delete color="error" sx={{ fontSize: "1.7rem", cursor: "pointer" }} />}
          onClick={() => {
            removeRow(row.id);
          }}
          label="Delete"
        />,
      ],
    },
    {
      field: "id",
      headerName: "#",
      width: 50,
      fixed: "left",
      renderCell: ({ row }) => <Typography.Text>{row.id}</Typography.Text>,
    },
    {
      field: "partNo",
      headerName: "Part No.",
      minWidth: 130,
      fixed: "left",
      renderCell: ({ row }) => <Typography.Text>{row.partNo}</Typography.Text>,
    },
    {
      field: "cat_part_code",
      headerName: "Cat Part No.",
      minWidth: 160,
      fixed: "left",
      renderCell: ({ row }) => (
        <Typography.Text>{row.cat_part_code}</Typography.Text>
      ),
    },
    {
      field: "partName",
      headerName: "Part Name",
      width: 320,
      renderCell: ({ row }) => <ToolTipEllipses text={row.partName} />,
    },
    {
      field: "bomQty",
      headerName: "Bom Qty",
      width: 150,
      renderCell: ({ row }) => <Typography.Text>{row.bomQty}</Typography.Text>,
    },
    {
      field: "rqdQty",
      headerName: "Required Qty",
      width: 120,
      renderCell: ({ row }) => {
        const exceeds = exceedsPendingStock(row);
        return (
          <Input
            value={row.rqdQty}
            type="number"
            status={exceeds ? "error" : undefined}
            style={
              exceeds
                ? { borderColor: "#ff4d4f", backgroundColor: "#fff1f0" }
                : undefined
            }
            // onChange={(e) => inputHandler("rqdQty", row.id, e.target.value)}
          />
        );
      },
    },
    {
      field: "uom",
      headerName: "Uom",
      width: 50,
      renderCell: ({ row }) => <Typography.Text>{row.uom}</Typography.Text>,
    },
    {
      field: "conRemark",
      headerName: "Consumption Remark",
      width: 150,
      renderCell: ({ row }) => (
        <Input
          value={row.conRemark}
          onChange={(e) => inputHandler("conRemark", row.id, e.target.value)}
        />
      ),
    },
    {
      field: "last_rate",
      headerName: "Rate",
      width: 180,
      renderCell: ({ row }) => <Input disabled value={row.last_rate} />,
    },
    {
      field: "pendingStock",
      headerName: "JW Pending Stock",
      width: 180,
      renderCell: ({ row }) => (
        <Typography.Text
          type={exceedsPendingStock(row) ? "danger" : undefined}
          strong={exceedsPendingStock(row)}
        >
          {row.pendingStock}
        </Typography.Text>
      ),
    },
  ];
  const excelPreviewColumns = [
    {
      field: "id",
      headerName: "#",
      width: 50,
      renderCell: ({ row }) => <Typography.Text>{row.id}</Typography.Text>,
    },
    {
      field: "partcode",
      headerName: "Part Code",
      width: 180,
      renderCell: ({ row }) => <Typography.Text>{row.partcode}</Typography.Text>,
    },
    {
      field: "remark",
      headerName: "Remark",
      width: 260,
      renderCell: ({ row }) => <Typography.Text>{row.remark}</Typography.Text>,
    },
  ];
  const prev = async () => {
    setConsumptionStep(consumptionMode === "excel" ? "excelPreview" : "method");
    setShowBomList(false);
    setBomList([]);
  };

  const resetConsumptionFlow = () => {
    setConsumptionStep("details");
    setConsumptionMode("");
    setShowBomList(false);
    setBomList([]);
    setExcelRows([]);
    excelUploadForm.resetFields();
  };

  const saveFunction = async (fetchAttachment) => {
    // let filedata = modalForm.getFieldValue("fileComponents");
    let value = await modalForm.validateFields();
    let filedata = value.fileComponents;
    let pickLocation = value.pickLocation;
    let payload = {
      attachment: fetchAttachment,
      companybranch: "BRALWR36",
      cost_center: header.costCenter,
      documentName: filedata.map((r) => r.documentName),
      component: mainData[0].component.value ?? mainData[0].component,
      consCompcomponents: bomList.map((r) => r.key),
      consQty: bomList.map((r) => r.rqdQty),
      consRemark: bomList.map((r) => r.conRemark),
      ewaybill: eWayBill,
      invoice: mainData[0].invoice,
      irn: irnNo,
      jobwork_trans_id: header.jobworkID,
      drop_location: mainData[0].location,
      product: row.sku_code,
      qty: mainData[0].orderqty,
      rate: mainData[0].rate,
      remark: mainData[0].remark,
      qrScan: isScan == true ? "Y" : "N",
      pick_location: pickLocation,
      consRate: bomList.map((r) => r.last_rate),
    };
    setModalUploadLoad(true);
    const response = await savejwsfinward(payload);

    if (response.success === true || response.status === "success") {
      const successComponents = bomList.map((row) => ({
        id: row.id,
        componentName: row.partName,
        partNo: row.partNo,
        inQuantity: row.bomQty,
        invoiceNumber: mainData[0]?.invoice,
        location: mainData[0]?.location,
        poQuantity: row.rqdQty,
        pending_jw_qty: row.pending_jw_qty,
      }));

      setModalUploadLoad(false);
      setUploadClicked(false);
      setShowBomList(false);
      modalForm.resetFields();
      setBomList([]);
      showToast(response.message, "success");

      setMaterialInSuccess({
        materialInId: response.data.txn,
        poId: mainData[0]?.jobwork_id || header?.jobworkID,
        vendor: row?.vendor,
        components: successComponents,
      });
    } else {
      setModalUploadLoad(false);
      showToast(response.message, "error");
    }
  };
  const getBomList = async (type = "manual", payload) => {
    setLoading(true);
 try {
     const response = await executeFun(
       () => fetchBomItems(type, payload),
       "select"
     );
   
    if (isBomResponseSuccess(response)) {
      let arr = formatBomRows(getBomRowsFromResponse(response));
      if (type === "excel") {
        arr = applyExcelRemarks(arr, payload);
      }
      setBomList(arr);
      setLoading(false);
      setShowBomList(true);
      setConsumptionMode(type);
      setConsumptionStep("bomPreview");
    } else {
      showToast(response?.data?.message?.msg || response?.message, "error");
      setLoading(false);
    
    }
  
 } catch (error) {
  
    setLoading(false);
 }

 
  };

  const handleManualEntry = () => {
    if (loading) return;
    getBomList("manual");
  };

  const handleNextFromDetails = () => {
    const sfgCreateQty = mainData[0]?.orderqty;
    if (sfgCreateQty === "" || sfgCreateQty == null) {
      showToast("The sfgCreateQty field is required.", "error");
      return;
    }
    for (let i = 0; i < mainData.length; i++) {
      const r = mainData[i];
      if (!r.rate && r.rate !== 0) {
        showToast(`Rate is required for row ${i + 1}.`, "error");
        return;
      }
      if (!r.invoice || String(r.invoice).trim() === "") {
        showToast(`Invoice ID is required for row ${i + 1}.`, "error");
        return;
      }
      if (!r.location) {
        showToast(`Location is required for row ${i + 1}.`, "error");
        return;
      }
    }
    setConsumptionStep("method");
  };

  const handleExcelPreview = async () => {
    const values = excelUploadForm.getFieldsValue();
    const file = values.files?.[0]?.originFileObj;
    if (!file) {
      showToast("Please select an Excel file", "error");
      return;
    }
    try {
      setLoading(true);
      const rows = await readExcelRows(file);
      if (!rows.length) {
        showToast("Excel should have partcode and remark columns", "error");
        return;
      }
      setExcelRows(rows);
      setConsumptionStep("excelPreview");
    } catch (error) {
      showToast("Unable to read Excel file", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleExcelSubmit = () => {
    if (!excelRows.length) {
      showToast("Please preview Excel data first", "error");
      return;
    }
    const payload = {
      part: excelRows.map((row) => row.partcode),
      remark: excelRows.map((row) => row.remark ?? ""),
    };
    getBomList("excel", payload);
  };

  // const addAttachmentModal = async () => {
  //   // const values = await modalForm.validateFields();
  //   Modal.confirm({
  //     title: "Do you want to submit this JW SF Inward??",
  //     content: (
  //       <Form form={modalForm} layout="vertical">
  //         <Form.Item
  //           label="Invoice / Document"
  //           rules={[
  //             {
  //               required: true,
  //               message: "Please Select attachment!",
  //             },
  //           ]}
  //         >
  //           <Form.Item
  //             name="invoice"
  //             valuePropName="file"
  //             getValueFromEvent={(e) => e?.file}
  //             noStyle
  //             rules={[
  //               {
  //                 required: true,
  //                 message: "Please Select attachment!",
  //               },
  //             ]}
  //           >
  //             <Upload.Dragger
  //               name="invoice"
  //               beforeUpload={() => false}
  //               // maxCount={1}
  //               multiple={true}
  //             >
  //               <p className="ant-upload-drag-icon">
  //                 <InboxOutlined />
  //               </p>
  //               <p className="ant-upload-text">
  //                 Click or drag file to this area to upload
  //               </p>
  //               <p className="ant-upload-hint">
  //                 Upload vendor invoice / Document.
  //               </p>
  //             </Upload.Dragger>
  //           </Form.Item>
  //         </Form.Item>
  //       </Form>
  //     ),
  //     onOk: () => submitHandler(),
  //     okText: "Submit",
  //   });
  // };
  const newMinFunction = () => {
    setMaterialInSuccess(false);
  };
  const submitHandler = async () => {
    try {
      setModalUploadLoad(true);
      const formData = new FormData();
      const values = await modalForm.validateFields();
      let fileName;
      values.fileComponents.map((comp) => {
        formData.append("files", comp.file[0]?.originFileObj);
      });
      const fileResponse = await executeFun(
        () => uploadMinInvoice(formData),
        "submit"
      );
      if (fileResponse.success) {
        // API returns { success, data: "filename.pdf" } - attachment is in data
        const fetchAttachment =
          typeof fileResponse.data === "string"
            ? fileResponse.data
            : fileResponse.data?.data;
        setAttachment(fetchAttachment);
        saveFunction(fetchAttachment);
      } else {
        setModalUploadLoad(false);
      }
    } catch (error) {
      setModalUploadLoad(false);
    }
  };

  useEffect(() => {
    if (editModal) {
      getFetchData();
      // getLocation();
      setEWayBill("");
      resetConsumptionFlow();
      newMinFunction();
      // getPickLocation();
    }
  }, [editModal]);

  // useEffect(() => {
  //   if (header?.vendor?.code) {
  //     getPickLocation();
  //   }
  // }, [header?.vendor?.code]);

  const text = "Are you sure to update this jw sf Inward?";
  const closeModal = () => {
    setEditModal(false);
    resetConsumptionFlow();
    modalForm.resetFields();
  };

  const infoItems = [
    { label: "JW PO ID", value: header?.jobworkID },
    { label: "Jobwork ID", value: header?.jobworkID },
    {
      label: "FG/SFG Name & SKU",
      value: `${header?.product?.name || ""} / ${header?.product?.sku || ""}`,
    },
    { label: "JW PO created by", value: header?.createdBy },
    { label: "FG/SFG BOM of Recipe", value: header?.bom?.name },
    { label: "Registered Date & Time", value: header?.registereDt },
    { label: "FG/SFG Ord Qty", value: header?.orderedQty },
    { label: "Job ID Status", value: header?.jwStatus },
    { label: "FG/SFG processed Qty", value: header?.proceedQty },
    { label: "Job Worker", value: header?.vendor?.name },
  ];

  const renderLeftInfo = () => (
    <Card type="inner" title={header?.jobworkID} style={{ height: "100%" }}>
      <Row gutter={[0, 10]}>
        {infoItems.map((item) => (
          <Col span={24} key={item.label}>
            <Typography.Text strong style={{ fontSize: 12 }}>
              {item.label}:{" "}
            </Typography.Text>
            <Typography.Text style={{ fontSize: 12 }}>
              {item.value || "--"}
            </Typography.Text>
          </Col>
        ))}
        <Col span={24}>
          <Form size="small" layout="vertical">
            <Form.Item label="E-Way Bill No.">
              <Input
                style={{ width: "100%" }}
                size="small"
                value={eWayBill}
                onChange={(e) => setEWayBill(e.target.value)}
              />
            </Form.Item>
          </Form>
        </Col>
        {isApplicable == "Y" && (
          <Col span={24}>
            <Checkbox
              checked={isScan}
              onChange={(e) => setIsScan(e.target.checked)}
            />
            <Typography.Text
              style={{
                fontSize: 11,
                marginLeft: "4px",
                fontWeight: 700,
              }}
            >
              Scan with QR Code
            </Typography.Text>
            <Form size="small" layout="vertical" style={{ marginTop: 5 }}>
              <Form.Item label="Acknowledgment Number">
                <Input
                  size="small"
                  style={{ width: "100%" }}
                  value={irnNo}
                  onChange={(e) => setIrnNo(e.target.value)}
                  disabled={isScan}
                />
              </Form.Item>
            </Form>
          </Col>
        )}
      </Row>
    </Card>
  );

  const renderDetailsStep = () => (
    <div
      style={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        minHeight: 0,
      }}
    >
      <div style={{ flex: 1, minHeight: 0, overflow: "hidden" }}>
        <FormTable data={mainData} columns={columns} />
      </div>
      <Row style={{ marginTop: 10 }}>
        <Col span={24}>
          <div style={{ textAlign: "end" }}>
            <NavFooter
              loading={loading}
              submitFunction={handleNextFromDetails}
              backFunction={closeModal}
              nextLabel="Next"
            />
          </div>
        </Col>
      </Row>
    </div>
  );

  const renderMethodStep = () => (
    <Card
      bordered={false}
      style={{
        minHeight: "100%",
        borderRadius: 18,
        background:
          "linear-gradient(135deg, #f7fbff 0%, #eef6ff 50%, #fff7ed 100%)",
        boxShadow: "0 14px 35px rgba(24, 144, 255, 0.12)",
      }}
      styles={{ body: { minHeight: "100%", padding: 28 } }}
    >
      <div style={{ textAlign: "center", marginBottom: 32 }}>
        <Typography.Title level={3} style={{ marginBottom: 6 }}>
          Choose Consumption Entry Type
        </Typography.Title>
        <Typography.Text type="secondary">
          Select how you want to build the consumption list for this inward.
        </Typography.Text>
      </div>

      <Row gutter={[24, 24]} justify="center" align="middle">
        <Col xs={24} md={10}>
          <Card
            hoverable
            bordered={false}
            onClick={handleManualEntry}
            style={{
              minHeight: 240,
              borderRadius: 18,
              background: "#ffffff",
              boxShadow: "0 16px 38px rgba(15, 23, 42, 0.10)",
              cursor: "pointer",
            }}
            styles={{ body: { padding: 26, textAlign: "center" } }}
          >
            <div
              style={{
                width: 72,
                height: 72,
                borderRadius: 22,
                margin: "0 auto 18px",
                display: "grid",
                placeItems: "center",
                background: "linear-gradient(135deg, #e6f4ff, #bae0ff)",
                color: "#1677ff",
                fontSize: 34,
              }}
            >
              <FormOutlined />
            </div>
            <Typography.Title level={4} style={{ marginBottom: 8 }}>
              Manual Entry
            </Typography.Title>
            <Typography.Paragraph type="secondary" style={{ minHeight: 44 }}>
              Fetch BOM consumption directly for the entered SFG quantity.
            </Typography.Paragraph>
            <Button
              type="primary"
              size="large"
              loading={loading}
              onClick={(event) => {
                event.stopPropagation();
                handleManualEntry();
              }}
              style={{ borderRadius: 10, minWidth: 130 }}
            >
              Continue
            </Button>
          </Card>
        </Col>
        <Col xs={24} md={10}>
          <Card
            hoverable
            bordered={false}
            onClick={() => {
              setConsumptionMode("excel");
              setConsumptionStep("excelUpload");
            }}
            style={{
              minHeight: 240,
              borderRadius: 18,
              background: "#ffffff",
              boxShadow: "0 16px 38px rgba(15, 23, 42, 0.10)",
              cursor: "pointer",
            }}
            styles={{ body: { padding: 26, textAlign: "center" } }}
          >
            <div
              style={{
                width: 72,
                height: 72,
                borderRadius: 22,
                margin: "0 auto 18px",
                display: "grid",
                placeItems: "center",
                background: "linear-gradient(135deg, #f6ffed, #b7eb8f)",
                color: "#389e0d",
                fontSize: 34,
              }}
            >
              <FileExcelOutlined />
            </div>
            <Typography.Title level={4} style={{ marginBottom: 8 }}>
              Upload from Excel
            </Typography.Title>
            <Typography.Paragraph type="secondary" style={{ minHeight: 44 }}>
              Upload an Excel file with partcode and remark columns.
            </Typography.Paragraph>
            <Button
              size="large"
              style={{ borderRadius: 10, minWidth: 130 }}
              icon={<CloudUploadOutlined />}
            >
              Upload Excel
            </Button>
          </Card>
        </Col>
      </Row>
      <Row justify="center" style={{ marginTop: 30 }}>
        <Button
          size="large"
          onClick={() => setConsumptionStep("details")}
          style={{ borderRadius: 10, minWidth: 120 }}
        >
          Back
        </Button>
      </Row>
    </Card>
  );

  const renderExcelUploadStep = () => (
    <Card
      bordered={false}
      style={{
        minHeight: "100%",
        borderRadius: 18,
        background: "linear-gradient(135deg, #f8fbff 0%, #f0f7ff 100%)",
        boxShadow: "0 14px 35px rgba(15, 23, 42, 0.08)",
      }}
      styles={{ body: { padding: 28 } }}
    >
      <div style={{ textAlign: "center", marginBottom: 24 }}>
        <div
          style={{
            width: 68,
            height: 68,
            borderRadius: 22,
            margin: "0 auto 14px",
            display: "grid",
            placeItems: "center",
            background: "linear-gradient(135deg, #e6fffb, #87e8de)",
            color: "#08979c",
            fontSize: 32,
          }}
        >
          <CloudUploadOutlined />
        </div>
        <Typography.Title level={3} style={{ marginBottom: 4 }}>
          Upload Consumption Excel
        </Typography.Title>
        <Typography.Text type="secondary">
          Use two clean columns only: partcode and remark. Preview before submit.
        </Typography.Text>
      </div>
      <Form form={excelUploadForm} layout="vertical">
        <Form.Item>
          <Form.Item
            name="files"
            valuePropName="fileList"
            getValueFromEvent={normFile}
            noStyle
          >
            <Upload.Dragger
              name="files"
              {...excelUploadProps}
              style={{
                borderRadius: 18,
                padding: "30px 20px",
                background: "#ffffff",
                border: "1px dashed #69b1ff",
                boxShadow: "inset 0 0 0 1px rgba(24, 144, 255, 0.04)",
              }}
            >
              <p className="ant-upload-drag-icon">
                <InboxOutlined style={{ color: "#1677ff", fontSize: 48 }} />
              </p>
              <p className="ant-upload-text" style={{ fontWeight: 700 }}>
                Click or drag Excel file to upload
              </p>
              <p className="ant-upload-hint">
                Required columns: partcode, remark
              </p>
            </Upload.Dragger>
          </Form.Item>
        </Form.Item>
      </Form>
      <Card
        size="small"
        bordered={false}
        style={{
          marginTop: 18,
          borderRadius: 14,
          background: "rgba(255, 255, 255, 0.78)",
        }}
      >
        <Row gutter={[12, 12]}>
          {["Column 1: partcode", "Column 2: remark", "Preview first, then submit"].map(
            (text) => (
              <Col xs={24} md={8} key={text}>
                <Typography.Text>
                  <CheckCircleOutlined style={{ color: "#52c41a" }} /> {text}
                </Typography.Text>
              </Col>
            )
          )}
        </Row>
      </Card>
      <Row justify="space-between" align="middle" style={{ marginTop: 20 }}>
        <Button
          size="large"
          icon={<DownloadOutlined />}
          onClick={downloadExcelSample}
          style={{ borderRadius: 10 }}
        >
          Download Sample
        </Button>
        <Space>
          <Button
            size="large"
            onClick={() => setConsumptionStep("method")}
            style={{ borderRadius: 10 }}
          >
            Back
          </Button>
          <Button
            type="primary"
            size="large"
            loading={loading}
            onClick={handleExcelPreview}
            style={{ borderRadius: 10, minWidth: 130 }}
          >
            Preview
          </Button>
        </Space>
      </Row>
    </Card>
  );

  const renderExcelPreviewStep = () => (
    <Card
      bordered={false}
      style={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        borderRadius: 18,
        background: "#ffffff",
        boxShadow: "0 14px 35px rgba(15, 23, 42, 0.08)",
      }}
      styles={{
        body: {
          padding: 18,
          height: "100%",
          display: "flex",
          flexDirection: "column",
          minHeight: 0,
        },
      }}
    >
      <Row justify="space-between" align="middle" style={{ marginBottom: 10 }}>
        <Col>
          <Typography.Title level={3} style={{ margin: 0 }}>
            Excel Preview
          </Typography.Title>
          <Typography.Text type="secondary">
            Review {excelRows.length} rows before creating consumption preview.
          </Typography.Text>
        </Col>
        <Col>
          <div
            style={{
              padding: "8px 14px",
              borderRadius: 999,
              background: "#f6ffed",
              color: "#389e0d",
              fontWeight: 700,
            }}
          >
            {excelRows.length} rows ready
          </div>
        </Col>
      </Row>
      <Card
        size="small"
        bordered={false}
        style={{
          flex: 1,
          minHeight: 0,
          borderRadius: 16,
          border: "1px solid #e6f4ff",
          overflow: "hidden",
        }}
        styles={{ body: { padding: 0, height: "100%" } }}
      >
        <div
          style={{
            height: "100%",
            maxHeight: "100%",
            overflow: "auto",
          }}
        >
          <FormTable
            data={excelRows}
            columns={excelPreviewColumns}
            headText="left"
            cellText="left"
          />
        </div>
      </Card>
      <Row justify="space-between" align="middle" style={{ marginTop: 12 }}>
        <Typography.Text type="secondary">
          Next will call getBomItem with part and remark in body.
        </Typography.Text>
        <Space>
          <Button
            size="large"
            onClick={() => setConsumptionStep("excelUpload")}
            style={{ borderRadius: 10 }}
          >
            Back
          </Button>
          <Button
            type="primary"
            size="large"
            loading={loading}
            onClick={handleExcelSubmit}
            style={{ borderRadius: 10, minWidth: 150 }}
          >
            Next
          </Button>
        </Space>
      </Row>
    </Card>
  );

  const renderBomPreviewStep = () => (
    <Card
      bordered={false}
      style={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        borderRadius: 18,
        background: "#ffffff",
        boxShadow: "0 14px 35px rgba(15, 23, 42, 0.08)",
      }}
      styles={{
        body: {
          padding: 18,
          height: "100%",
          display: "flex",
          flexDirection: "column",
          minHeight: 0,
        },
      }}
    >
      <Row justify="space-between" align="middle" style={{ marginBottom: 10 }}>
        <Col>
          <Typography.Title level={3} style={{ margin: 0 }}>
            Consumption Preview
          </Typography.Title>
          <Typography.Text type="secondary">
            Confirm consumption quantities and remarks before saving inward.
          </Typography.Text>
        </Col>
        <Col>
          <div
            style={{
              padding: "8px 14px",
              borderRadius: 999,
              background: "#e6f4ff",
              color: "#1677ff",
              fontWeight: 700,
            }}
          >
            {bomList.length} components
          </div>
        </Col>
      </Row>
      <div
        style={{
          flex: 1,
          minHeight: 0,
          border: "1px solid #e6f4ff",
          borderRadius: 16,
          overflow: "hidden",
        }}
      >
        <FormTable
          data={bomList}
          columns={bomcolumns}
          loading={loading}
          headText="left"
          cellText="left"
          getRowStyle={(row) =>
            exceedsPendingStock(row) ? { backgroundColor: "#fff1f0" } : {}
          }
        />
      </div>
      <Row style={{ marginTop: 12 }}>
        <Col span={24}>
          <div style={{ textAlign: "end" }}>
            <Space>
              <Button size="large" onClick={prev} style={{ borderRadius: 10 }}>
                Back
              </Button>
              <Button
                type="primary"
                size="large"
                onClick={() => setUploadClicked(true)}
                loading={modalUploadLoad}
                style={{ borderRadius: 10, minWidth: 130 }}
              >
                Submit
              </Button>
            </Space>
          </div>
        </Col>
      </Row>
    </Card>
  );

  const renderRightContent = () => {
    if (consumptionStep === "method") return renderMethodStep();
    if (consumptionStep === "excelUpload") return renderExcelUploadStep();
    if (consumptionStep === "excelPreview") return renderExcelPreviewStep();
    if (consumptionStep === "bomPreview") return renderBomPreviewStep();
    return renderDetailsStep();
  };
  const renderModalLoader = () =>
    loading ? (
      <div
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 30,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "rgba(255, 255, 255, 0.55)",
          backdropFilter: "blur(3px)",
          borderRadius: 12,
        }}
      >
        <div
          style={{
            height: 110,
            width: 110,
            display: "grid",
            placeItems: "center",
            background: "#fff",
            borderRadius: 16,
            boxShadow: "0 16px 40px rgba(15, 23, 42, 0.18)",
          }}
        >
          <img
            src="/loading.gif"
            alt="loading"
            style={{ width: 76, height: "auto" }}
          />
        </div>
      </div>
    ) : null;
  return (
    <Space>
      <Drawer
        width="100vw"
        //   title="JW Purchase Order (PO) - IN"
        title={
          <span style={{ fontSize: "15px", color: "#1890ff" }}>
            {row?.vendor}
          </span>
        }
        placement="right"
        closable={false}
        onClose={closeModal}
        open={editModal}
        getContainer={false}
        destroyOnClose={true}
        bodyStyle={{
          height: "calc(100vh - 55px)",
          padding: 8,
          overflow: "hidden",
        }}
        style={
          {
            //  position: "absolute",
          }
        }
        extra={
          <Space>
            <CloseCircleFilled onClick={closeModal} />
          </Space>
        }
      >
        <>
          {!materialInSuccess && (
            <Skeleton active loading={modalLoad("fetch")}>
              <Row
                gutter={10}
                style={{ height: "100%", minHeight: 0, position: "relative" }}
              >
                {renderModalLoader()}
                <Col span={6} style={{ height: "100%", overflow: "auto" }}>
                  {renderLeftInfo()}
                </Col>
                <Col
                  span={18}
                  style={{
                    height: "100%",
                    minHeight: 0,
                    overflow: "hidden",
                  }}
                >
                  {renderRightContent()}
                </Col>
              </Row>
              {false && (
                <>
              <Card type="inner" title={header?.jobworkID}>
                <Row gutter={10}>
                  <Col
                    span={8}
                    style={{ fontSize: "12px", fontWeight: "bolder" }}
                  >
                    JW PO ID: {header?.jobworkID}
                  </Col>
                  <Col
                    span={8}
                    style={{ fontSize: "12px", fontWeight: "bolder" }}
                  >
                    Jobwork ID: {header?.jobworkID}
                  </Col>
                  <Col
                    span={8}
                    style={{ fontSize: "12px", fontWeight: "bolder" }}
                  >
                    FG/SFG Name & SKU:{" "}
                    {`${header?.product?.name || ""} / ${
                      header?.product?.sku || ""
                    }`}
                  </Col>
                  <Col
                    span={8}
                    style={{ fontSize: "12px", fontWeight: "bolder" }}
                  >
                    JW PO created by: {header?.createdBy}
                  </Col>
                  <Col
                    span={8}
                    style={{ fontSize: "12px", fontWeight: "bolder" }}
                  >
                    FG/SFG BOM of Recipe: {header?.bom?.name}
                  </Col>
                  <Col
                    span={8}
                    style={{ fontSize: "12px", fontWeight: "bolder" }}
                  >
                    Regisered Date & Time: {header?.registereDt}
                  </Col>
                  <Col
                    span={8}
                    style={{ fontSize: "12px", fontWeight: "bolder" }}
                  >
                    FG/SFG Ord Qty: {header?.orderedQty}
                  </Col>
                  <Col
                    span={8}
                    style={{ fontSize: "12px", fontWeight: "bolder" }}
                  >
                    Job ID Status: {header?.jwStatus}
                  </Col>
                  <Col
                    span={8}
                    style={{ fontSize: "12px", fontWeight: "bolder" }}
                  >
                    FG/SFG processed Qty: {header?.proceedQty}
                  </Col>
                  <Col
                    span={8}
                    style={{ fontSize: "12px", fontWeight: "bolder" }}
                  >
                    Job Worker: {header?.vendor?.name}
                  </Col>
                  <Col
                    span={8}
                    style={{
                      fontSize: "15px",
                      fontWeight: "bolder",
                      marginTop: "20px",
                    }}
                  >
                    <Form size="small">
                      <Form.Item label="E-Way Bill No.">
                        <Input
                          style={{ width: "15rem" }}
                          size="small"
                          value={eWayBill}
                          onChange={(e) => setEWayBill(e.target.value)}
                        />
                      </Form.Item>
                    </Form>
                  </Col>
                  {/* {showBomList && bomList && <Col
                    span={8}
                    style={{
                      fontSize: "15px",
                      fontWeight: "bolder",
                      marginTop: "20px",
                    }}
                  >
                    <Form size="small">
                      <Form.Item label="Pick Location" name="pickLocation">
                        <MySelect options={pickLocationOptions} />
                      </Form.Item>
                    </Form>
                  </Col>} */}
                  {isApplicable == "Y" && (
                    <Col
                      span={6}
                      style={{ display: "flex", paddingLeft: "-2px" }}
                    >
                      <span>
                        <Col span={24}>
                          <Checkbox
                            checked={isScan}
                            onChange={(e) => setIsScan(e.target.checked)}
                          />
                          <Typography.Text
                            style={{
                              fontSize: 11,
                              marginLeft: "4px",
                              fontWeight: 700,
                            }}
                          >
                            {" "}
                            Scan with QR Code
                          </Typography.Text>
                        </Col>{" "}
                        <Col
                          span={24}
                          style={{
                            marginTop: "5px",
                            fontSize: "12px",
                            fontWeight: "bolder",
                            // marginLeft: "8rem",
                          }}
                        >
                          <Form size="small">
                            <Form.Item label="Acknowledgment Number">
                              <Input
                                size="small"
                                style={{ width: "15rem" }}
                                value={irnNo}
                                onChange={(e) => setIrnNo(e.target.value)}
                                disabled={isScan}
                              />
                            </Form.Item>
                          </Form>
                        </Col>
                      </span>
                    </Col>
                  )}
                </Row>
              </Card>
              <div style={{ height: "50%", marginTop: "5px" }}>
                <div style={{ height: "100%" }}>
                  {showBomList && bomList ? (
                    <FormTable
                      data={bomList}
                      columns={bomcolumns}
                      loading={loading}
                      getRowStyle={(row) =>
                        exceedsPendingStock(row)
                          ? { backgroundColor: "#fff1f0" }
                          : {}
                      }
                    />

                  ) : (
                    <FormTable data={mainData} columns={columns} />
                  )}
                </div>
              </div>
              <Row style={{ marginTop: "50px" }}>
                <Col span={24}>
                  <div style={{ textAlign: "end" }}>
                    {showBomList ? (
                      <>
                        <Button onClick={prev}>Back</Button>

                        <Button
                          style={{ marginLeft: 4 }}
                          type="primary"
                          onClick={() => setUploadClicked(true)}
                          // loading={loading}
                          loading={modalUploadLoad}
                        >
                          Save
                        </Button>
                      </>
                    ) : (
                      <NavFooter
                        loading={loading}
                        submitFunction={getBomList}
                        backFunction={closeModal}
                        // resetFunction={resetHandler}
                        nextLabel="Next"
                      />
                    )}
                  </div>
                </Col>
              </Row>
                </>
              )}
            </Skeleton>
          )}

          {materialInSuccess && (
            <SuccessPage
              newMinFunction={newMinFunction}
              title={"Sfg"}
              po={materialInSuccess}
              successColumns={successColumns}
            />
          )}
          <Modal
            open={uplaoaClicked}
            width={700}
            title={"Upload Document"}
            maskClosable={false}
            keyboard={false}
            confirmLoading={modalUploadLoad}
            // destroyOnClose={true}
            onOk={() => submitHandler()}
            onCancel={() => setUploadClicked(false)}
            // style={{ maxHeight: "50%", height: "50%", overflowY: "scroll" }}
          >
            {" "}
            <Form
              style={{ height: "100%" }}
              initialValues={defaultValues}
              form={modalForm}
              layout="vertical"
            >
              {" "}
              <Card style={{ height: "20rem", overflowY: "scroll" }}>
                <div style={{ flex: 1 }}>
                  <Col
                    span={24}
                    style={{
                      overflowX: "hidden",
                      overflowY: "auto",
                    }}
                  >
                    <Form.List name="fileComponents">
                      {(fields, { add, remove }) => (
                        <>
                          <Col>
                            {fields.map((field, index) => (
                              <Form.Item noStyle>
                                <SingleProduct
                                  fields={fields}
                                  field={field}
                                  index={index}
                                  add={add}
                                  form={modalForm}
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
        </>
      </Drawer>
    </Space>
  );
}
const successColumns = [
  {
    headerName: "Component",
    renderCell: ({ row }) => <ToolTipEllipses text={row.componentName} />,
    field: "componentName",
    flex: 1,
  },
  { headerName: "Part No.", field: "partNo", flex: 1 },
  { headerName: "SFG Quantity", field: "poQuantity", flex: 1 },
  { headerName: "In Quantity", field: "inQuantity", flex: 1 },
  { headerName: "Invoice Number", field: "invoiceNumber", flex: 1 },
  { headerName: "Pending With Jobwork", field: "pending_jw_qty", flex: 1 },
  // { headerName: "Invoice Date", field: "invoiceDate", flex: 1 },
  // { headerName: "Location", field: "location", flex: 1 },
];
const defaultValues = {
  vendorType: "v01",
  vendorName: "",
  vendorBranch: "",
  gstin: "",
  vendorAddress: "",
  ewaybill: "",
  companybranch: "BRALWR36",
  projectID: "",
  costCenter: "",
  components: [
    {
      gstType: "L",
      location: "",
      autoConsumption: 0,
      currency: "364907247",
      exchangeRate: 1,
    },
  ],
  fileComponents: [
    {
      // file: "",
    },
  ],
};
