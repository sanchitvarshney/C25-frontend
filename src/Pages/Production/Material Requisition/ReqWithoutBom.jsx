import { useState, useEffect } from "react";
import {
  Button,
  Card,
  Col,
  Drawer,
  Form,
  Input,
  Modal,
  Row,
  Space,
  Spin,
  Table,
  Upload,
  message,
} from "antd";
import { useToast } from "../../../hooks/useToast.js";
import MySelect from "../../../Components/MySelect";
import MyAsyncSelect from "../../../Components/MyAsyncSelect";
import { imsAxios } from "../../../axiosInterceptor";
import { v4 } from "uuid";
import {
  ExclamationCircleOutlined,
  InboxOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import Loading from "../../../Components/Loading";
import { downloadCSVCustomColumns } from "../../../Components/exportToCSV";

import { getComponentOptions } from "../../../api/general.ts";

import useApi from "../../../hooks/useApi.ts";
import FormTable from "../../../Components/FormTable.jsx";
import { Add, Remove } from "@mui/icons-material";
import Field from "../../../Components/Field.jsx";

export default function ReqWithoutBom() {
  const { showToast } = useToast();
  const [asyncOptions, setAsyncOptions] = useState([]);
  const [pickLocationOptions, setPickLocationOptions] = useState([]);
  const [headerLocationOptionsm, setHeaderLocationOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isValid, setIsValid] = useState(false);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [uploadPreviewRows, setUploadPreviewRows] = useState([]);
  // true when the table rows came from an Excel upload -> submit via bulk save
  const [isBulkImport, setIsBulkImport] = useState(false);

  const [pickLocationLoadingMessage, contextHolder] = message.useMessage();

  const [requestForm] = Form.useForm();
  const { executeFun, loading: loading1 } = useApi();
  const [rows, setRows] = useState([
    {
      id: v4(),
      component: "",
      pickLocation: "",
      qty: "",
      remarks: "",
      leftQty: "",
      unit: "--",
    },
  ]);

  const addRows = () => {
    let arr = rows;
    arr = [
      ...arr,
      {
        id: v4(),
        component: "",
        pickLocation: "",
        qty: "",
        remarks: "",
        leftQty: "",
        unit: "--",
      },
    ];
    setRows(arr);
  };

  const removeRows = (id) => {
    let arr = rows;
    arr = arr.filter((row) => row.id !== id);
    setRows(arr);
  };
  // getting header location options
  ////
  const getHeaderLocationOptions = async () => {
    setHeaderLocationOptions([]);
 
    setLoading("fetching");
    const response = await imsAxios.post(
      "/production/fetchLocationForWitoutBom"
    );
    setLoading(false);

    if (response.success) {
      const arr = response.data.map((row) => ({
        value: row.id,
        text: row.text,
      }));
      setHeaderLocationOptions(arr);
    } else {
      showToast(response.message?.msg || response.message, "error");
      setHeaderLocationOptions([]);
    }
  };

  // input handler
  const inputHandler = async (name, value, id) => {
    let arr = rows;
    if (name === "component") {
      if (value.location) {
        const values = await getComponentDetails(
          value.component,
          value.location
        );
        console.log("values", values);
        arr = arr.map((row) => {
          if (row.id === id) {
            let obj = row;

            obj = {
              ...obj,
              [name]: value.component,
              leftQty: values.available_qty,
              unit: values.unit,
            };
            return obj;
          } else {
            return row;
          }
        });
      } else {
        arr = arr.map((row) => {
          if (row.id === id) {
            let obj = row;

            obj = {
              ...obj,
              [name]: value.component,
            };
            return obj;
          } else {
            return row;
          }
        });
      }
    } else if (name === "pickLocation") {
      if (value.location) {
        console.log("value.location", value.location);
        const values = await getComponentDetails(
          value.component,
          value.location
        );
        // console.log("values getComponentDetails", values);
        arr = arr.map((row) => {
          if (row.id === id) {
            let obj = row;

            obj = {
              ...obj,
              [name]: value.location,
              leftQty: values?.available_qty ?? "",
              unit: values?.unit ?? "",
            };
            return obj;
          } else {
            return row;
          }
        });
      } else {
        arr = arr.map((row) => {
          if (row.id === id) {
            let obj = row;

            obj = {
              ...obj,
              [name]: value.location,
            };
            return obj;
          } else {
            return row;
          }
        });
      }
    } else {
      arr = arr.map((row) => {
        if (row.id === id) {
          let obj = row;

          obj[name] = value;
          return obj;
        } else {
          return row;
        }
      });
    }
    setRows(arr);
  };

  // getting component options
  const getComponentOption = async (search) => {
    // setLoading("select");
    // const response = await imsAxios.post("/backend/getComponentByNameAndNo", {
    //   search,
    // });
    // setLoading(false);
    const response = await executeFun(
      () => getComponentOptions(search),
      "select"
    );
    // console.log("response", response);

    const { data } = response;
    if (data) {
      if (data[0]) {
        const arr = data.map((row) => ({
          value: row.id,
          text: row.text,
        }));
        setAsyncOptions(arr);
      } else {
        setAsyncOptions([]);
      }
    }
  };

  // getting pick location options
  const getPickLocationOptions = async (search) => {
    setLoading("fetching");
  
    const response = await imsAxios.post("/transaction/getLocationInMin", {
      search: search,
    });
    pickLocationLoadingMessage.destroy();
    setLoading(false);
    if (response.success) {
      const arr = response.data.map((row) => ({
        value: row.id,
        text: row.text,
      }));
      setPickLocationOptions(arr);
    } else {
      setPickLocationOptions([]);
    }
  };

  // getting header location details
  const getHeaderLocationDetails = async (location) => {
    setLoading("headerLocation");

    const response = await imsAxios.post("/production/fetchLocationDetail", {
      location_key: location,
    });
    setLoading(false);

    if (response.success) {
      requestForm.setFieldValue("description", response.data);
    } else {
      showToast(response.message?.msg || response.message, "error");
      requestForm.setFieldValue("description", "");
      return {};
    }
  };
  // getting component details
  const getComponentDetails = async (componentKey, location) => {
    setLoading("component");
    const response = await imsAxios.post("/godown/godownStocks", {
      component: componentKey?.key ?? componentKey,
      location: location?.key ?? location,
    });
    setLoading(false);
    if (response.success) {
      return response.data;
    } else {
      showToast(response.message?.msg || response.message, "error");
      // return {};
    }
  };

  //  reset handler
  const resetHandler = () => {
    setIsValid(false);
    setIsBulkImport(false);
    setRows([
      {
        id: v4(),
        component: "",
        pickLocation: "",
        qty: "",
        remarks: "",
        leftQty: "",
        unit: "--",
      },
    ]);
    requestForm.resetFields();
  };

  // showing reset confirm dialog
  const showResetConfirm = () => {
    Modal.confirm({
      title: "Are you sure you want to reset the form?",
      icon: <ExclamationCircleOutlined />,
      content:
        "All the changes in the form and selected components will be cleared",
      okText: "Yes",
      cancelText: "No",
      onOk: resetHandler,
    });
  };
  // submit handler
  const submitHandler = async (values) => {
    setLoading("submitting");
    try {
      const response = await imsAxios.post(
        isBulkImport
          ? "/production/createWithoutBomBulk/save"
          : "/production/createWithoutBom",
        values
      );
      if (response.success) {
        showToast(response.message, "success");
        resetHandler();
      } else {
        showToast(response.message?.msg || response.message, "error");
      }
    } catch (error) {
      showToast(
        error?.response?.data?.message?.msg ||
          error?.response?.data?.message ||
          "Failed to submit request",
        "error"
      );
    }
    setLoading(false);
  };

  const handleDownloadSample = () => {
    downloadCSVCustomColumns(SAMPLE_DATA, "ReqWithoutBom_Sample");
  };

  const handleUploadModalClose = () => {
    setUploadPreviewRows([]);
    setUploadModalOpen(false);
  };

  // moves preview rows into the main table and closes the drawer
  const handleConfirmUpload = () => {
    setRows(uploadPreviewRows);
    setIsBulkImport(true);
    setIsValid(false);
    setUploadPreviewRows([]);
    setUploadModalOpen(false);
    showToast("Data imported successfully", "success");
  };

  const handleExcelUpload = async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    setUploadLoading(true);
    try {
      const response = await imsAxios.post(
        "/production/createWithoutBomBulk/upload",
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      if (response.success) {
        const rawRows = Array.isArray(response.data?.rows)
          ? response.data.rows
          : [];
        const mappedRows = rawRows.map((row) => {
          const comp = row[0];
          const loc = row[1];
          return {
            id: v4(),
            component: comp?.key
              ? {
                  key: comp.key,
                  value: comp.key,
                  label: `${comp.name}${comp.partNo ? ` (${comp.partNo})` : ""}`,
                }
              : "",
            componentName: comp?.name || "",
            partNo: comp?.partNo || "",
            pickLocation: loc?.value
              ? { key: loc.value, value: loc.value, label: loc.text }
              : "",
            pickLocationName: loc?.text || "",
            qty: row[2] ?? "",
            remarks: row[3] ?? "",
            leftQty: "",
            unit: "--",
          };
        });

        setUploadPreviewRows(mappedRows);
        showToast(
          `${mappedRows.length} row(s) parsed — review and confirm`,
          "success"
        );
      } else {
        showToast(response.message?.msg || response.message, "error");
      }
    } catch (error) {
      showToast(
        error?.response?.data?.message?.msg ||
          error?.response?.data?.message ||
          "Failed to upload Excel",
        "error"
      );
    }
    setUploadLoading(false);
    return Upload.LIST_IGNORE;
  };

  const hasIncompleteRow = (rows) =>
    (rows || []).some(
      (row) =>
        !row.component ||
        !row.pickLocation ||
        !row.qty ||
        Number(row.qty) <= 0
    );

  const hasDuplicateComponent = (rows) => {
    const components = (rows || []).map((row) => row.component).filter(Boolean);
    return new Set(components).size !== components.length;
  };

  // show submit confirm dialog
  const showSubmitConfirm = async () => {
    let values;
    try {
      values = await requestForm.validateFields();
    } catch (error) {
      setIsValid(true);
      return;
    }
    if (hasIncompleteRow(rows)) {
      setIsValid(true);
      return;
    }
    if (hasDuplicateComponent(rows)) {
      showToast(
        "You have entered the same component twice in a single request.",
        "error"
      );
      return;
    }
    setIsValid(false);

    const finalObj = {
      location: values.location,
      comment: values.remarks,
      component: rows.map((row) => row.component?.key ?? row.component),
      pic_loc: rows.map((row) => row.pickLocation?.key ?? row.pickLocation),
      qty: rows.map((row) => row.qty),
      remark: rows.map((row) => row.remarks),
    };
    Modal.confirm({
      title: "Are you sure you want to submit the request?",
      icon: <ExclamationCircleOutlined />,
      content: "All the changes in the form will be submitted",
      okText: "Yes",
      cancelText: "No",
      onOk: () => submitHandler(finalObj),
    });
  };

  // table columns
  const columns = [
    {
      headerName: <span style={{ cursor: "pointer" }} onClick={addRows}><Add color="success" /></span>,
      width: 120,
      type: "rowChange",
      field: "add",
      renderCell: ({ row }) =>
        rows.length > 1 && (
          // <div style={{ width: "100%" }}>
          //   <CommonIcons
          //     action="removeRow"
          //     onClick={() => removeRows(row?.id)}
          //   />
          // </div>
          <span onClick={() => removeRows(row?.id)} style={{cursor:"pointer"}}>
            <Remove color="error" />
          </span>
        ),
    },
    {
      headerName: "Component",
      field: "component",
      width: 200,
      renderCell: ({ row }) => (
        <MyAsyncSelect
          loadOptions={getComponentOption}
          optionsState={asyncOptions}
          selectLoading={loading1("select")}
          onBlur={() => setAsyncOptions([])}
          labelInValue
          value={row.component}
          showError={isValid}
          message="Component is required"
          onChange={(value) =>
            inputHandler(
              "component",
              { component: value, location: row.pickLocation },
              row.id
            )
          }
        />
      ),
    },
    {
      headerName: "Pick Location",
      field: "pickLocation",
      width: 100,
      renderCell: ({ row }) => (
        <MyAsyncSelect
          loadOptions={getPickLocationOptions}
          optionsState={pickLocationOptions}
          onBlur={() => setPickLocationOptions([])}
          value={row.pickLocation}
          labelInValue
          showError={isValid}
          message="Pick Location is required"
          onChange={(value) =>
            inputHandler(
              "pickLocation",
              { location: value, component: row.component },
              row.id
            )
          }
        />
      ),
    },
    {
      headerName: "Order Qty",
      field: "qty",
      width: 150,
      renderCell: ({ row }) => (
        <Field
          attr="required | Order Qty should be greater than zero"
          value={row.qty}
          treatZeroAsEmpty
          showValidation={isValid}
        >
          <Input
            value={row.qty}
            suffix={`${row.leftQty} ${row.unit}`}
            onChange={(e) => inputHandler("qty", e.target.value, row.id)}
            type="number"
          />
        </Field>
      ),
    },
    {
      headerName: "Remarks",
      field: "remarks",
      width: 150,
      renderCell: ({ row }) => (
        <Input
          value={row.remarks}
          onChange={(e) => inputHandler("remarks", e.target.value, row.id)}
        />
      ),
    },
  ];
  useEffect(() => {
    getHeaderLocationOptions();
    getPickLocationOptions("");
  }, []);
  useEffect(() => {
    if (loading) {
      setTimeout(() => {
        setLoading(false);
      }, 900000);
    }
  }, [loading]);
  return (
    <Row gutter={12} style={{ height: "100%", padding: "10px" }}>
      {contextHolder}
 
      {loading === "fetching" && <Loading />}
      <Col span={6}>
        <Card size="small" title="Header Details">
          {loading === "headerLocation" && <Loading />}
          <Form
            form={requestForm}
            initialValues={initialValues}
            layout="vertical"
          >
            {/* select location */}
            <Form.Item
              label="Location"
              name="location"
              rules={[{ required: true, message: "" }]}
            >
              <MySelect
                options={headerLocationOptionsm}
                onChange={getHeaderLocationDetails}
                showError={isValid}
                message="Please select a location"
              />
            </Form.Item>
            {/* location description */}
            <Form.Item label="Location Details" name="description">
              <Input.TextArea disabled rows={3} />
            </Form.Item>
            {/* remarks */}
            <Form.Item label="Remarks" name="remarks">
              <Input.TextArea rows={3} />
            </Form.Item>
          </Form>
          <Row justify="space-between" align="middle">
            <Button
              icon={<UploadOutlined />}
              onClick={() => setUploadModalOpen(true)}
            >
              Upload Excel
            </Button>
            <Space>
              <Button onClick={showResetConfirm}>Reset</Button>
              <Button
                variant="search"
                loading={loading === "submitting"}
                type="primary"
                onClick={showSubmitConfirm}
              >
                Submit
              </Button>
            </Space>
          </Row>
        </Card>
      </Col>
      <Col span={18} >
        <FormTable data={rows} columns={columns} loading={loading === "component"} />
      </Col>

      {/* Excel Upload Drawer */}
      <Drawer
        title={
          uploadPreviewRows.length > 0 ? "Preview Imported Data" : "Upload Excel"
        }
        open={uploadModalOpen}
        onClose={handleUploadModalClose}
        destroyOnClose
        width={uploadPreviewRows.length > 0 ? 900 : 480}
        footer={
          uploadPreviewRows.length > 0 ? (
            <Row justify="space-between">
              <Button onClick={() => setUploadPreviewRows([])}>
                Upload Another File
              </Button>
              <Button type="primary" onClick={handleConfirmUpload}>
                Confirm Import
              </Button>
            </Row>
          ) : null
        }
      >
        {uploadPreviewRows.length === 0 ? (
          <>
            <Spin spinning={uploadLoading}>
              <Upload.Dragger
                name="file"
                multiple={false}
                maxCount={1}
                showUploadList={false}
                accept=".xlsx,.xls,.csv"
                beforeUpload={handleExcelUpload}
              >
                <p className="ant-upload-drag-icon">
                  <InboxOutlined />
                </p>
                <p className="ant-upload-text">Click or drag file to upload</p>
                <p className="ant-upload-hint">Supports .xlsx, .xls, .csv</p>
              </Upload.Dragger>
            </Spin>
            <div style={{ marginTop: 12, textAlign: "right" }}>
              <Button type="link" onClick={handleDownloadSample}>
                Download Sample File
              </Button>
            </div>
          </>
        ) : (
          <Table
            size="small"
            rowKey="id"
            dataSource={uploadPreviewRows}
            pagination={false}
            scroll={{ y: "calc(100vh - 220px)" }}
            columns={PREVIEW_COLUMNS}
          />
        )}
      </Drawer>
    </Row>
  );
}

const SAMPLE_DATA = [
  {
    PART_CODE: "PE103062A",
    PICK_LOCATION: "C25_RM001",
    ORDER_QTY: 5,
    REMARK: "ok",
  },
];

const PREVIEW_COLUMNS = [
  { title: "Part Code", dataIndex: "partNo", key: "partNo", width: 120 },
  {
    title: "Component",
    dataIndex: "componentName",
    key: "componentName",
    width: 260,
  },
  {
    title: "Pick Location",
    dataIndex: "pickLocationName",
    key: "pickLocationName",
    width: 140,
  },
  { title: "Order Qty", dataIndex: "qty", key: "qty", width: 110 },
  { title: "Remark", dataIndex: "remarks", key: "remarks" },
];

// const initital values
const initialValues = {
  location: "",
  description: "",
  remarks: "",
};
