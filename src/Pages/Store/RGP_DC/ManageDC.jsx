import { useState, useCallback } from "react";
import { useToast } from "../../../hooks/useToast.js";
import { Button, Col, Input, Row, Select } from "antd";
import { Link } from "react-router-dom";
import MyDataTable from "../../../Components/MyDataTable";
import { v4 as uuidv4 } from "uuid";
import MyDatePicker from "../../../Components/MyDatePicker";
import { MdOutlineDownloadForOffline } from "react-icons/md";
import { downloadCSVCustomColumns } from "../../../Components/exportToCSV";
import { GridActionsCellItem } from "@mui/x-data-grid";
import EditDC from "./EditDC/EditDC";
import ToolTipEllipses from "../../../Components/ToolTipEllipses";
import { imsAxios } from "../../../axiosInterceptor";
import MyButton from "../../../Components/MyButton";
import validateResponse from "../../../Components/validateResponse";
import printFunction, {
  downloadFunction,
} from "../../../Components/printFunction";
import Field from "../../../Components/Field.jsx";
const SELECT_OPTIONS = [
  { label: "Date Wise", value: "datewise" },
  { label: "GP ID Wise", value: "gpwise" },
];

function ManageDC() {
  const { showToast } = useToast();
  const COLUMNS = [
    {
      headerName: "",
      width: 30,
      type: "actions",
      getActions: ({ row }) => [
        <GridActionsCellItem
          key="edit"
          showInMenu
          label="Edit"
          onClick={() => {
            setIsReturnDC(false);
            setUpdateDCId(row.transaction_id);
          }}
        />,
        <GridActionsCellItem
          key="return"
          showInMenu
          label="Return"
          onClick={() => {
            setIsReturnDC(true);
            setUpdateDCId(row.transaction_id);
          }}
        />,
        <GridActionsCellItem
          key="download"
          showInMenu
          label="Download"
          onClick={() => downloadFun(row.transaction_id)}
        />,
        <GridActionsCellItem
          key="print"
          showInMenu
          label="Print"
          onClick={() => printFun(row.transaction_id)}
        />,
        <GridActionsCellItem
          key="ewaybill"
          showInMenu
          label={
            <Link
              style={{ textDecoration: "none", color: "black" }}
              to={`/warehouse/e-way/dc/${row.transaction_id.replaceAll("/", "_")}`}
              target="_blank"
            >
              Create E-Way Bill
            </Link>
          }
        />,
      ],
    },
    {
      field: "transaction_id",
      headerName: "Journal ID",
      width: 200,
      renderCell: ({ row }) => (
        <ToolTipEllipses text={row.transaction_id} copy />
      ),
    },
    { field: "vendor_name", headerName: "To (Name)", width: 500 },
    { field: "insert_date", headerName: "Created Date/Time", width: 200 },
    { field: "component_name", headerName: "Component Name", width: 200 },
    { field: "part_no", headerName: "Part No.", width: 200 },
    {
      field: "quantity",
      headerName: "Quantity / Returned Qty",
      width: 200,
      renderCell: ({ row }) => (
        <span>
          {row.quantity} / {row.returned_qty ?? 0}
        </span>
      ),
    },
    { field: "rate", headerName: "Rate", width: 200 },
    { field: "hsn", headerName: "HSN", width: 200 },
    { field: "total", headerName: "Amount", width: 200 },
    { field: "ewaybill_status", headerName: "E WayBill Status", width: 200 },
    { field: "ewaybill_no", headerName: "E WayBill No.", width: 200 },
  ];
  const [state, setState] = useState({
    selType: "datewise",
    gpInput: "",
  });
  const [tableData, setTableData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState("");
  const [updatedDCId, setUpdateDCId] = useState(null);
  const [isReturnDC, setIsReturnDC] = useState(false);
  const [isValid, setIsValid] = useState(false);
  const fetchData = useCallback(async () => {
    const hasEmptyField =
      !state.selType ||
      (state.selType === "datewise" && !dateRange) ||
      (state.selType === "gpwise" && !state.gpInput.trim());

    if (hasEmptyField) {
      setIsValid(true);
      return;
    }
    setIsValid(false);

    setLoading(true);
    try {
      const response = await imsAxios.post("/gatepass/fetchAllGatepass", {
        data: state.selType === "datewise" ? dateRange : state.gpInput,
        wise: state.selType,
      });

      if (response.success) {
        const formattedData = response.data.map((row) => ({
          ...row,
          id: uuidv4(),
        }));
        setTableData(formattedData);
        showToast("Data fetched successfully", "success");
      } else {
        showToast(response?.message || "Failed to fetch data", "error");
      }
    } catch (error) {
      showToast("An error occurred while fetching data", "error");
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [state.selType, state.gpInput, dateRange]);

  const handleDownloadCSV = useCallback(() => {
    const csvData = tableData.map((row) => ({
      "Journal ID": row.transaction_id,
      "To (Name)": row.vendor_name,
      "Component Name": row.component_name,
      "Part No": row.part_no,
      HSN: row.hsn,
      Quantity: row.quantity,
      Rate: row.rate,
      Amount: row.total,
      "Created Date/Time": row.insert_date,
      "EWay Bill Status": row.ewaybill_status,
      "Eway Bill No": row.ewaybill_no,
    }));

    downloadCSVCustomColumns(csvData, "Manage DC Report");
  }, [tableData]);

  const printFun = useCallback(async (id) => {
    setLoading(true);
    try {
      const response = await imsAxios.post("/gatepass/printGatePass", {
        transaction: id,
      });
      const validatedData = validateResponse(response);
      printFunction(validatedData.buffer.data);
    } catch (error) {
      showToast("Failed to print document", "error");
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, []);

  const downloadFun = useCallback(async (id) => {
    setLoading(true);
    try {
      const response = await imsAxios.post("/gatepass/printGatePass", {
        transaction: id,
      });
      const validatedData = validateResponse(response);

      downloadFunction(validatedData.buffer?.data, id);
    } catch (error) {
      showToast("Failed to download document", "error");
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, []);

  return (
    <div style={{ height: "calc(100vh - 160px)", padding: "10px" }}>
      {updatedDCId && (
        <EditDC
          updatedDCId={updatedDCId}
          setUpdateDCId={setUpdateDCId}
          isReturnDC={isReturnDC}
          setIsReturnDC={setIsReturnDC}
        />
      )}
      <Row gutter={16} style={{ paddingBottom: 5 }}>
        <Col span={4}>
          <Field
            attr="required | Please select a type"
            value={state.selType}
            showValidation={isValid}
          >
            <Select
              style={{ width: "100%" }}
              options={SELECT_OPTIONS}
              placeholder="Select Option"
              value={state.selType}
              onChange={(value) =>
                setState((prev) => ({ ...prev, selType: value, gpInput: "" }))
              }
              disabled={loading}
              aria-label="Select search type"
            />
          </Field>
        </Col>
        {state.selType === "datewise" && (
          <>
            <Col span={5}>
              <MyDatePicker
                setDateRange={setDateRange}
                size="default"
                value={dateRange}
                disabled={loading}
                showError={isValid}
                message="Please select a date range"
              />
            </Col>
            <Col span={2}>
              <MyButton
                variant="search"
                type="primary"
                onClick={fetchData}
                disabled={loading}
              >
                Fetch
              </MyButton>
            </Col>
          </>
        )}
        {state.selType === "gpwise" && (
          <>
            <Col span={5}>
              <Field
                attr="required | Please enter a valid GP ID"
                value={state.gpInput}
                showValidation={isValid}
              >
                <Input
                  style={{ width: "100%" }}
                  placeholder="Enter GP ID"
                  value={state.gpInput}
                  onChange={(e) =>
                    setState((prev) => ({ ...prev, gpInput: e.target.value }))
                  }
                  disabled={loading}
                  aria-label="Gate Pass ID"
                />
              </Field>
            </Col>
            <Col span={2}>
              <MyButton
                variant="search"
                type="primary"
                onClick={fetchData}
                disabled={loading}
              >
                Fetch
              </MyButton>
            </Col>
          </>
        )}
        {tableData.length > 0 && (
          <Col span={1} offset={state.selType ? 12 : 13}>
            <Button onClick={handleDownloadCSV} disabled={loading}>
              <MdOutlineDownloadForOffline style={{ fontSize: "20px" }} />
            </Button>
          </Col>
        )}
      </Row>
      <div style={{ height: "100%", marginTop: "10px" }}>
        <MyDataTable loading={loading} data={tableData} columns={COLUMNS} />
      </div>
    </div>
  );
}

export default ManageDC;
