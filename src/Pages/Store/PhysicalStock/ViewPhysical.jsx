import { useEffect, useState } from "react";
import {
  Button,
  Col,
  Divider,
  Flex,
  Form,
  Modal,
  Row,
  Space,
  Typography,
} from "antd";
import MySelect from "../../../Components/MySelect";
import useApi from "../../../hooks/useApi.ts";
import { getComponentOptions } from "../../../api/general.ts";
import MyAsyncSelect from "../../../Components/MyAsyncSelect";
import MyDatePicker from "../../../Components/MyDatePicker";
import { SearchOutlined } from "@ant-design/icons";
import { CommonIcons } from "../../../Components/TableActions.jsx/TableActions";
import MyDataTable from "../../../Components/MyDataTable";
import { getLogs, getVerifiedStocks } from "../../../api/store/physical-stock";
import { GridActionsCellItem } from "@mui/x-data-grid";
import { downloadCSV } from "../../../Components/exportToCSV";
import { convertSelectOptions } from "../../../utils/general.ts";
import { useToast } from "../../../hooks/useToast.js";
import Loading from "../../../Components/Loading.jsx";

function ViewPhysical() {
  const { showToast } = useToast();
  const [asyncOptions, setAsyncOptions] = useState([]);
  const [rows, setRows] = useState([]);
  const [logs, setLogs] = useState([]);
  const [showLogs, setShowLogs] = useState(false);
  const [selectedAudit, setSelectedAudit] = useState(null);
  const [isValid, setIsValid] = useState(false);
  const { executeFun, loading } = useApi();
  const [form] = Form.useForm();

  const wise = Form.useWatch("wise", form);

  const handleFetchComponentOptions = async (search) => {
    const response = await executeFun(
      () => getComponentOptions(search),
      "fetchComponent",
    );
    let arr = [];
    if (response.success) {
      arr = convertSelectOptions(response.data);
    }
    setAsyncOptions(arr);
  };

  const handleFetchRows = async () => {
    let values;
    try {
      values = await form.validateFields();
    } catch (error) {
      if (error?.errorFields) {
        setIsValid(true);
        return;
      }
      return;
    }
    setIsValid(false);

    const searchValue =
      values.wise === "partwise"
        ? (values.data?.value ?? values.data)
        : values.data;
    const response = await executeFun(
      () => getVerifiedStocks(values.wise, searchValue),
      "fetchRows",
    );

    let arr = [];
    if (response.success) {
      arr = response.data.map((row, index) => ({
        id: index + 1,
        component: row.name,
        partCode: row.part,
        date: row.dt,
        uom: row.uom,
        imsStock: row.cl,
        auditStock: row.rm,
        verifiedBy: row.by,
        remark: row.remark,
        auditKey: row.audit_key,
      }));
    }
    setRows(arr);
  };

  const handleDownloadExcel = () => {
    downloadCSV(rows, columns, "Verified Physical Stock");
  };

  const hideLogs = () => {
    setShowLogs(false);
    setSelectedAudit(null);
  };
  const handleViewLogs = async (row) => {
    const response = await executeFun(() => getLogs(row.auditKey), "viewLogs");

    if (response.success) {
      const arr = response.data.data.map((log, index) => ({
        id: index + 1,
        auditBy: log.audit_by,
        auditDate: log.audit_dt,
        auditStock: log.audit_qty,
        imsQty: log.ims_qty,
        remark: log.remark,
        updatedOn: log.update_date,
        updatedBy: log.update_user,
      }));
      setLogs(arr);
      setSelectedAudit(row);
      setShowLogs(true);
    } else {
      showToast(response.message || "Failed to fetch logs", "error");
    }
  };

  const actionColumn = {
    headerName: "",
    type: "actions",
    width: 30,
    getActions: ({ row }) => [
      // show logs icon
      <GridActionsCellItem
        showInMenu
        key="logs"
        label={"View Logs"}
        onClick={() => handleViewLogs(row)}
      />,
    ],
  };
  useEffect(() => {
    form.setFieldValue("data", "");
  }, [wise]);

  return (
    <Row gutter={6} style={{ height: "100%", padding: 10 }}>
      {loading("viewLogs") && <Loading />}
      <Logs
        open={showLogs}
        hide={hideLogs}
        selectedAudit={selectedAudit}
        columns={columns}
        logs={logs}
        setLogs={setLogs}
      />
      <Col span={16}>
        <Form form={form} initialValues={initialValues}>
          <Row gutter={10} align="bottom">
            {/* Filter Select */}
            <Col span={6}>
              <Form.Item
                name="wise"
                label="Select Filter"
                style={{ marginBottom: 0 }}
                rules={[{ required: true, message: "" }]}
              >
                <MySelect
                  options={wiseOptions}
                  showError={isValid}
                  message="Please select a filter"
                />
              </Form.Item>
            </Col>

            {/* Dynamic Input */}
            <Col span={10}>
              <Form.Item
                name="data"
                label={`Select ${
                  wise === "datewise"
                    ? "Date"
                    : wise === "partwise"
                      ? "Component"
                      : ""
                }`}
                style={{ marginBottom: 0 }}
                rules={[{ required: true, message: "" }]}
              >
                {wise === "partwise" && (
                  <MyAsyncSelect
                    optionsState={asyncOptions}
                    selectLoading={loading("fetchComponent")}
                    loadOptions={handleFetchComponentOptions}
                    onBlur={() => setAsyncOptions([])}
                    labelInValue
                    showError={isValid}
                    message="Please select a component"
                  />
                )}

                {wise === "datewise" && (
                  <MyDatePicker
                    setDateRange={(value) => form.setFieldValue("data", value)}
                    showError={isValid}
                    message="Please select a date"
                  />
                )}
              </Form.Item>
            </Col>

            {/* Buttons */}
            <Col>
              <Space>
                <Button
                  onClick={handleFetchRows}
                  type="primary"
                  icon={<SearchOutlined />}
                  loading={loading("fetchRows")}
                >
                  Fetch
                </Button>

                <CommonIcons
                  action="downloadButton"
                  onClick={handleDownloadExcel}
                />
              </Space>
            </Col>
          </Row>
        </Form>
      </Col>
      <Col span={24} style={{ height: "calc(100% - 50px)", overflowY: "auto" }}>
        <MyDataTable
          data={rows}
          columns={[actionColumn, ...columns]}
          loading={loading("fetchRows")}
        />
      </Col>
    </Row>
  );
}

export default ViewPhysical;

const wiseOptions = [
  {
    text: "Date Wise",
    value: "datewise",
  },
  {
    text: "Component Wise",
    value: "partwise",
  },
];

const initialValues = {
  wise: "datewise",
  data: "",
};

const columns = [
  {
    headerName: "#",
    field: "id",
    width: 30,
  },
  {
    headerName: "Date",
    field: "date",
    width: 150,
  },
  {
    headerName: "Component",
    field: "component",
    minWidth: 150,
    flex: 1,
  },
  {
    headerName: "Part Code",
    field: "partCode",
    width: 100,
  },
  {
    headerName: "UoM",
    field: "uom",
    width: 70,
  },
  {
    headerName: "IMS Stock",
    field: "imsStock",
    width: 120,
  },
  {
    headerName: "Physical Stock",
    field: "auditStock",
    width: 120,
  },

  {
    headerName: "Verified By",
    field: "verifiedBy",
    width: 120,
  },
  {
    headerName: "Remark",
    field: "remark",
    minWidth: 180,
    flex: 1,
  },
];

const Logs = ({ open, hide, selectedAudit, logs }) => {
  const handleDownloadExcel = () => {
    downloadCSV(
      logs,
      logsColumns,
      `Verified Physical Stock logs - ${selectedAudit.component}`,
    );
  };

  return (
    <Modal
      size="small"
      open={open}
      onCancel={hide}
      width={1200}
      title="Physical Logs"
      extra={"hello"}
      footer={<div></div>}
    >
      <Row gutter={[0, 6]}>
        <Col span={24}>
          <Flex vertical>
            <Typography.Text strong>Remarks:</Typography.Text>
            <Typography.Text>
              {selectedAudit?.remark === "" ? "--" : selectedAudit?.remark}
            </Typography.Text>
          </Flex>
        </Col>
        <Col span={24}>
          <Row justify="end">
            <CommonIcons
              action="downloadButton"
              onClick={handleDownloadExcel}
            />
          </Row>
        </Col>
        <Divider />
        <Col span={24} style={{ height: 500, overflow: "auto" }}>
          <MyDataTable columns={logsColumns} data={logs} />
        </Col>
      </Row>
    </Modal>
  );
};

const logsColumns = [
  {
    headerName: "#",
    field: "id",
    width: 30,
  },
  {
    headerName: "Date",
    field: "auditDate",
    width: 150,
  },
  {
    headerName: "IMS Stock",
    field: "imsQty",
    width: 120,
  },
  {
    headerName: "Physical Stock",
    field: "auditStock",
    width: 120,
  },
  {
    headerName: "Verified By",
    field: "auditBy",
    width: 120,
  },
  {
    headerName: "Updated On",
    field: "updatedOn",
    width: 180,
  },
  {
    headerName: "Updated By",
    field: "updatedBy",
    width: 180,
  },
  {
    headerName: "Remark",
    field: "remark",
    minWidth: 180,
    flex: 1,
  },
];
