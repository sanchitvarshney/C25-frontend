import { useState, useEffect, useMemo, useCallback } from "react";
import { Col, Row, Space } from "antd";
import { Box, IconButton } from "@mui/material";
import KeyboardArrowDown from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowRight from "@mui/icons-material/KeyboardArrowRight";
import MyDatePicker from "../../Components/MyDatePicker";
import { imsAxios } from "../../axiosInterceptor";
import { useToast } from "../../hooks/useToast.js";
import * as XLSX from "xlsx";
import MyButton from "../../Components/MyButton";
import MyDataTable from "../../Components/MyDataTable.jsx";
import { CommonIcons } from "../../Components/TableActions.jsx/TableActions";

const challanColumns = [
  { headerName: "Serial No", field: "serial_no", width: 100 },
  { headerName: "Challan Date", field: "challan_date", width: 130 },
  { headerName: "Challan Eway", field: "challan_eway", width: 120 },
  { headerName: "Challan No", field: "challan_no", width: 120 },
  { headerName: "Challan Qty", field: "challan_qty", width: 110 },
  { headerName: "Challan Rate", field: "challan_rate", width: 110 },
  { headerName: "Challan Value", field: "challan_value", width: 120 },
];

const WoReport = () => {
  const { showToast } = useToast();
  const [wise, setWise] = useState(wiseOptions[0].value);
  const [searchInput, setSearchInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [asyncOptions, setAsyncOptions] = useState([]);
  const [rows, setRows] = useState([]);
  const [expandedRowKeys, setExpandedRowKeys] = useState([]);
  const [disstate, setdisstate] = useState(false);
  const [woreportdata, setworeportdata] = useState([]);

  const toggleExpand = useCallback((id) => {
    setExpandedRowKeys((prev) =>
      prev.includes(id) ? prev.filter((k) => k !== id) : [...prev, id]
    );
  }, []);

  const handleClientOptions = async (search) => {
    try {
      setLoading("select");
      const arr = await getClientOptions(search);
      setAsyncOptions(arr);
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  const columns = useMemo(
    () => [
      {
        field: "_expand",
        headerName: "",
        width: 48,
        sortable: false,
        disableColumnMenu: true,
        renderCell: ({ row }) => {
          if (!row.challan?.length) return null;
          const open = expandedRowKeys.includes(row.id);
          return (
            <IconButton
              size="small"
              onClick={() => toggleExpand(row.id)}
              aria-label={open ? "Collapse challan rows" : "Expand challan rows"}
            >
              {open ? (
                <KeyboardArrowDown fontSize="small" />
              ) : (
                <KeyboardArrowRight fontSize="small" />
              )}
            </IconButton>
          );
        },
      },
      { headerName: "ID", field: "serialno", width: 90 },
      { headerName: "Part Code", field: "partCode", width: 120 },
      { headerName: "Part Name", field: "partName", flex: 1, minWidth: 160 },
      { headerName: "Min Id", field: "minId", width: 100 },
      { headerName: "Min Date", field: "minDate", width: 120 },
      { headerName: "Min Eway", field: "minEway", width: 100 },
      { headerName: "Min Qty", field: "minQty", width: 90 },
      { headerName: "Pending qty", field: "pending_qty", width: 110 },
      { headerName: "Min Rate", field: "minRate", width: 100 },
      { headerName: "Min Value", field: "minValue", width: 110 },
      {
        field: "_challanPanel",
        headerName: "Challan breakdown",
        flex: 1,
        minWidth: 520,
        sortable: false,
        disableColumnMenu: true,
        renderCell: ({ row }) => {
          if (!expandedRowKeys.includes(row.id) || !row.challan?.length) {
            return "";
          }
          return (
            <Box sx={{ width: "100%", height: 240 }}>
              <MyDataTable
                columns={challanColumns}
                data={row.challan}
                hideFooter
                hideHeaderMenu
              />
            </Box>
          );
        },
      },
    ],
    [expandedRowKeys, toggleExpand]
  );

  const getRowHeight = useCallback(
    (params) => {
      if (expandedRowKeys.includes(params.id) && params.model.challan?.length) {
        return 52 + 240;
      }
      return 52;
    },
    [expandedRowKeys]
  );

  const getRows = async () => {
    try {
      setLoading("fetch");
      const response = await imsAxios.post("/wo_challan/fetch_DC_report", {
        wise: "date",
        data: searchInput,
      });
      if (response.success) {
        let newArr = response.data.map((r, index) => ({
          id: `row-${index}-${r.serial_no || r.min_id || index}`,
          serialno: r.serial_no,
          partCode: r.part_code,
          minDate: r.min_date,
          partName: r.part_name,
          minEway: r.min_eway,
          minId: r.min_id,
          minQty: r.min_qty,
          pending_qty: r.pending_qty,
          minRate: r.min_rate,
          minValue: r.min_value,
          challan: r?.challan?.map((ch, chIndex) => ({
            ...ch,
            id: `challan-${index}-${chIndex}-${ch.challan_no || ch.serial_no || chIndex}`,
          })),
        }));
        setRows(newArr);
        setworeportdata(response.data);
        setExpandedRowKeys([]);
        setdisstate(true);
      } else {
        showToast(response.message, "error");
      }
    } catch (error) {
      console.log("some error occured while fetching rows", error);
    } finally {
      setLoading(false);
    }
  };

  const exportToExcel = () => {
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(woreportdata);

    // Adding headers starting from B2
    ws["A1"] = { t: "s", v: "serial Number" };
    ws["B1"] = { t: "s", v: "Date" };
    ws["C1"] = { t: "s", v: "Part Code" };
    ws["D1"] = { t: "s", v: "Product" };
    ws["E1"] = { t: "s", v: "MIN ID" };
    ws["F1"] = { t: "s", v: "Quantity" };
    ws["G1"] = { t: "s", v: "Price" };
    ws["H1"] = { t: "s", v: "Value" };
    ws["I1"] = { t: "s", v: "EWB" };
    ws["J1"] = { t: "s", v: "Challan Number" };
    ws["K1"] = { t: "s", v: "Challan Date" };
    ws["L1"] = { t: "s", v: "Quantity" };
    ws["M1"] = { t: "s", v: "Price" };
    ws["N1"] = { t: "s", v: "Value" };
    ws["O1"] = { t: "s", v: "EWB Bill" };
    ws["P1"] = { t: "s", v: "Pending Qty" };

    let currentRow = 2;
    let serialnumber = 1;

    // Adding data starting from B3
    woreportdata.forEach((item, index) => {
      ws[`A${currentRow}`] = { t: "n", v: item.serial_no };
      ws[`B${currentRow}`] = { t: "s", v: item.min_date };
      ws[`C${currentRow}`] = { t: "s", v: item.part_code };
      ws[`D${currentRow}`] = { t: "s", v: item.part_name };
      ws[`E${currentRow}`] = { t: "s", v: item.min_id };
      ws[`F${currentRow}`] = { t: "s", v: item.min_qty };
      ws[`G${currentRow}`] = { t: "s", v: item.min_rate };
      ws[`H${currentRow}`] = { t: "s", v: item.min_value };
      ws[`I${currentRow}`] = { t: "s", v: item.min_eway };
      ws[`K${currentRow}`] = { t: "s", v: "" };
      ws[`P${currentRow}`] = { t: "s", v: item.pending_qty };
      //wo report
      item.challan?.forEach((elem, subindex) => {
        currentRow = currentRow + 1;
        serialnumber = serialnumber + 1;
        ws[`A${currentRow}`] = { t: "n", v: elem.serial_no };
        ws[`B${currentRow}`] = { t: "s", v: item.min_date };
        ws[`C${currentRow}`] = { t: "s", v: item.part_code };
        ws[`D${currentRow}`] = { t: "s", v: item.part_name };
        ws[`E${currentRow}`] = { t: "s", v: item.min_id };
        ws[`F${currentRow}`] = { t: "s", v: "" };
        ws[`G${currentRow}`] = { t: "s", v: "" };
        ws[`H${currentRow}`] = { t: "s", v: "" };
        ws[`I${currentRow}`] = { t: "s", v: "" };
        // ws[`G${currentRow}`] = { t: "s", v: item.min_rate };
        // ws[`H${currentRow}`] = { t: "s", v: item.min_value };
        // ws[`I${currentRow}`] = { t: "s", v: item.min_eway };
        ws[`J${currentRow}`] = { t: "s", v: elem.challan_no };
        ws[`K${currentRow}`] = { t: "s", v: elem.challan_date };
        ws[`L${currentRow}`] = { t: "s", v: elem.challan_qty };
        ws[`M${currentRow}`] = { t: "s", v: elem.challan_rate };
        ws[`N${currentRow}`] = { t: "s", v: elem.challan_value };
        ws[`O${currentRow}`] = { t: "s", v: elem.challan_eway };
      });
      ws[`A${currentRow + 1}`] = { t: "n", v: "" };
      ws[`B${currentRow + 1}`] = { t: "s", v: "" };
      ws[`C${currentRow + 1}`] = { t: "s", v: "" };
      ws[`D${currentRow + 1}`] = { t: "s", v: "" };
      ws[`E${currentRow + 1}`] = { t: "s", v: "" };
      ws[`F${currentRow + 1}`] = { t: "s", v: "" };
      ws[`G${currentRow + 1}`] = { t: "s", v: "" };
      ws[`H${currentRow + 1}`] = { t: "s", v: "" };
      ws[`I${currentRow + 1}`] = { t: "s", v: "" };
      ws[`J${currentRow + 1}`] = { t: "s", v: "" };
      ws[`K${currentRow + 1}`] = { t: "s", v: "" };
      ws[`L${currentRow + 1}`] = { t: "s", v: "" };
      ws[`M${currentRow + 1}`] = { t: "s", v: "" };
      ws[`N${currentRow + 1}`] = { t: "s", v: "" };
      ws[`O${currentRow + 1}`] = { t: "s", v: "" };
      currentRow += 2;
      serialnumber++;
    });

    XLSX.utils.book_append_sheet(wb, ws, "Sheet1");

    const range = XLSX.utils.encode_range({
      s: { c: 0, r: 0 }, // start from A1
      e: { c: 16, r: currentRow + 100 }, // end at the last cell (considering headers and child rows)
    });

    ws["!ref"] = range;

    XLSX.writeFile(wb, "exported_data.xlsx");
  };

  useEffect(() => {
    if (wise !== wiseOptions[1].value) {
      setSearchInput("");
    }
  }, [wise]);

  return (
    <div style={{ height: "calc(100vh - 180px)", margin: "10px" }}>
      <Row justify="space-between">
        <Col>
          <Space>
            <div style={{ paddingBottom: "10px" }}>
              <Space>
                <MyDatePicker setDateRange={setSearchInput} />

                <MyButton
                  variant="search"
                  onClick={getRows}
                  loading={loading === "fetch"}
                  type="primary"
                >
                  Fetch
                </MyButton>
              </Space>
            </div>
          </Space>
        </Col>
        <CommonIcons
          action="downloadButton"
          type="primary"
          disabled={disstate ? "" : "disabled"}
          onClick={exportToExcel}
        />
      </Row>
      <div style={{ height: "calc(100vh - 180px)", }}>
        <MyDataTable
          columns={columns}
          data={rows}
          loading={loading === "fetch"}
          getRowHeight={getRowHeight}
          disableVirtualization={expandedRowKeys.length > 0}
          hideHeaderMenu
        />
      </div>
    </div>
  );
};

const wiseOptions = [
  {
    text: "Client Wise",
    value: "clientwise",
  },
  {
    text: "Date Wise",
    value: "datewise",
  },
  {
    text: "Work Order Wise",
    value: "wo_sfg_wise",
  },
];

export default WoReport;
