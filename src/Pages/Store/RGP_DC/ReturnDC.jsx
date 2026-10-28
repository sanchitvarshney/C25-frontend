import { useState } from "react";
import { Col, Row, Space } from "antd";
import MyDatePicker from "../../../Components/MyDatePicker";
import MyDataTable from "../../../Components/MyDataTable";
import MyAsyncSelect from "../../../Components/MyAsyncSelect";
import { downloadCSV } from "../../../Components/exportToCSV";
import { CommonIcons } from "../../../Components/TableActions.jsx/TableActions";
import ToolTipEllipses from "../../../Components/ToolTipEllipses";
import { imsAxios } from "../../../axiosInterceptor";
import { useToast } from "../../../hooks/useToast.js";
import useApi from "../../../hooks/useApi.ts";
import { getVendorOptions } from "../../../api/general.ts";
import { convertSelectOptions } from "../../../utils/general.ts";
import MyButton from "../../../Components/MyButton";

const ReturnDC = () => {
  const { showToast } = useToast();
  const [searchLoading, setSearchLoading] = useState(false);
  const [vendor, setVendor] = useState(null);
  const [asyncOptions, setAsyncOptions] = useState([]);
  const [rows, setRows] = useState([]);
  const [dateRange, setDateRange] = useState("");
  const { executeFun, loading: loading1 } = useApi();

  const columns = [
    {
      headerName: "#",
      width: 60,
      field: "serial_no",
      align: "center",
      headerAlign: "center",
    },
    {
      headerName: "Vendor",
      flex: 1,
      minWidth: 220,
      field: "vendor",
      renderCell: ({ row }) => <ToolTipEllipses text={row.vendor} />,
    },
    {
      headerName: "Item",
      flex: 1.6,
      minWidth: 280,
      field: "item",
      renderCell: ({ row }) => <ToolTipEllipses text={row.item} />,
    },
    { headerName: "Part No.", width: 130, field: "part_no" },
    { headerName: "Unit", width: 90, field: "unit" },
    {
      headerName: "Outward",
      width: 110,
      field: "outward",
      type: "number",
      align: "center",
      headerAlign: "center",
    },
    {
      headerName: "Returned",
      width: 110,
      field: "returned",
      type: "number",
      align: "center",
      headerAlign: "center",
    },
    {
      headerName: "Balance",
      width: 110,
      field: "balance",
      type: "number",
      align: "center",
      headerAlign: "center",
    },
  ];

  // getting rows for the consolidated return report, filtered by vendor + date range
  const getSearchResults = async () => {
    setSearchLoading(true);
    try {
      const response = await imsAxios.post(
        "/gatepass/consolidatedReturnReport",
        {
          data: dateRange,
          vendor: vendor?.value,
        },
      );
      if (response.success) {
        const arr = (response.data ?? []).map((row, index) => ({
          ...row,
          id: index + 1,
          serial_no: index + 1,
        }));
        setRows(arr);
      } else {
        setRows([]);
        showToast(response.message || "Failed to fetch return report", "error");
      }
    } catch (error) {
      showToast("An error occurred while fetching the return report", "error");
      console.error(error);
    } finally {
      setSearchLoading(false);
    }
  };

  // getting vendors list for the vendor filter
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

  return (
    <div
      style={{
        height: "calc(100vh - 160px)",
        padding: "10px",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Row justify="space-between" align="middle" gutter={[12, 12]}>
        <Col>
          <Space size="middle" wrap>
            <div style={{ width: 260 }}>
              <MyAsyncSelect
                selectLoading={loading1("select")}
                labelInValue
                optionsState={asyncOptions}
                onBlur={() => setAsyncOptions([])}
                loadOptions={getVendors}
                placeholder="Select Vendor"
                value={vendor}
                onChange={(value) => {
                  setVendor(value);
                  setAsyncOptions([]);
                }}
              />
            </div>
            <div style={{ width: 280 }}>
              <MyDatePicker
                size="default"
                setDateRange={setDateRange}
                value={dateRange}
              />
            </div>
            <MyButton
              disabled={!dateRange || !vendor}
              type="primary"
              loading={searchLoading}
              onClick={getSearchResults}
              variant="search"
            >
              Search
            </MyButton>
          </Space>
        </Col>
        <Col>
          <CommonIcons
            action="downloadButton"
            onClick={() =>
              downloadCSV(rows, columns, "Consolidated Return Report")
            }
            disabled={rows.length === 0}
          />
        </Col>
      </Row>
      <div style={{ flex: 1, minHeight: 0, marginTop: 10 }}>
        <MyDataTable loading={searchLoading} data={rows} columns={columns} />
      </div>
    </div>
  );
};

export default ReturnDC;
