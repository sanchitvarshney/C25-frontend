import { useState, useMemo, useCallback } from "react";
import { Col, Row, Space } from "antd";
import { Box, IconButton } from "@mui/material";
import KeyboardArrowDown from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowRight from "@mui/icons-material/KeyboardArrowRight";
import MyDatePicker from "../../Components/MyDatePicker";
import { imsAxios } from "../../axiosInterceptor";
import { useToast } from "../../hooks/useToast.js";
import ExcelJS from "exceljs";
import MyButton from "../../Components/MyButton";
import MyDataTable from "../../Components/MyDataTable.jsx";
import { CommonIcons } from "../../Components/TableActions.jsx/TableActions";

const challanColumns = [
  { headerName: "Serial No", field: "serial_no", minwidth: 100 },
  { headerName: "Challan Date", field: "challan_date", minwidth: 130 },
  { headerName: "Challan Eway", field: "challan_eway", minwidth: 120 },
  { headerName: "Challan No", field: "challan_no", minwidth: 120 },
  { headerName: "Challan Qty", field: "challan_qty", minwidth: 110 },
  { headerName: "Challan Rate", field: "challan_rate", minwidth: 110 },
  { headerName: "Challan Value", field: "challan_value", minwidth: 120 },
];

const WoReport = () => {
  const { showToast } = useToast();
  const [searchInput, setSearchInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState([]);
  const [expandedRowKeys, setExpandedRowKeys] = useState([]);
  const [disstate, setdisstate] = useState(false);
  const [woreportdata, setworeportdata] = useState([]);
  const [isValid, setIsValid] = useState(false);

  const toggleExpand = useCallback((id) => {
    setExpandedRowKeys((prev) =>
      prev.includes(id) ? prev.filter((k) => k !== id) : [...prev, id],
    );
  }, []);

  const columns = useMemo(
    () => [
      {
        field: "_expand",
        headerName: "",
        minwidth: 48,
        sortable: false,
        disableColumnMenu: true,
        renderCell: ({ row }) => {
          if (!row.challan?.length) return null;
          const open = expandedRowKeys.includes(row.id);
          return (
            <IconButton
              size="small"
              onClick={() => toggleExpand(row.id)}
              aria-label={
                open ? "Collapse challan rows" : "Expand challan rows"
              }
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
      { headerName: "ID", field: "serialno", minwidth: 90 },
      { headerName: "Part Code", field: "partCode", minwidth: 120 },
      { headerName: "Part Name", field: "partName", flex: 1, minWidth: 260 },
      { headerName: "Min Id", field: "minId", width: 150 },
      { headerName: "Min Date", field: "minDate", width: 140 },
      { headerName: "Min Eway", field: "minEway", width: 140 },
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
    [expandedRowKeys, toggleExpand],
  );

  const getRowHeight = useCallback(
    (params) => {
      if (expandedRowKeys.includes(params.id) && params.model.challan?.length) {
        return 52 + 240;
      }
      return 52;
    },
    [expandedRowKeys],
  );

  const getRows = async () => {
    if (!searchInput) {
      setIsValid(true);
      return;
    }
    setIsValid(false);
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

  const exportToExcel = async () => {
    try {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("Sheet1");

      // Headers
      worksheet.addRow([
        "serial Number",
        "Date",
        "Part Code",
        "Product",
        "MIN ID",
        "Quantity",
        "Price",
        "Value",
        "EWB",
        "Challan Number",
        "Challan Date",
        "Quantity",
        "Price",
        "Value",
        "EWB Bill",
        "Pending Qty",
      ]);

      let currentRow = 2;

      // Data
      woreportdata.forEach((item) => {
        // Main MIN row
        worksheet.getCell(`A${currentRow}`).value = item.serial_no;
        worksheet.getCell(`B${currentRow}`).value = item.min_date;
        worksheet.getCell(`C${currentRow}`).value = item.part_code;
        worksheet.getCell(`D${currentRow}`).value = item.part_name;
        worksheet.getCell(`E${currentRow}`).value = item.min_id;
        worksheet.getCell(`F${currentRow}`).value = item.min_qty;
        worksheet.getCell(`G${currentRow}`).value = item.min_rate;
        worksheet.getCell(`H${currentRow}`).value = item.min_value;
        worksheet.getCell(`I${currentRow}`).value = item.min_eway;
        worksheet.getCell(`K${currentRow}`).value = "";
        worksheet.getCell(`P${currentRow}`).value = item.pending_qty;

        // Challan rows
        item.challan?.forEach((elem) => {
          currentRow++;

          worksheet.getCell(`A${currentRow}`).value = elem.serial_no;
          worksheet.getCell(`B${currentRow}`).value = item.min_date;
          worksheet.getCell(`C${currentRow}`).value = item.part_code;
          worksheet.getCell(`D${currentRow}`).value = item.part_name;
          worksheet.getCell(`E${currentRow}`).value = item.min_id;

          worksheet.getCell(`F${currentRow}`).value = "";
          worksheet.getCell(`G${currentRow}`).value = "";
          worksheet.getCell(`H${currentRow}`).value = "";
          worksheet.getCell(`I${currentRow}`).value = "";

          worksheet.getCell(`J${currentRow}`).value = elem.challan_no;
          worksheet.getCell(`K${currentRow}`).value = elem.challan_date;
          worksheet.getCell(`L${currentRow}`).value = elem.challan_qty;
          worksheet.getCell(`M${currentRow}`).value = elem.challan_rate;
          worksheet.getCell(`N${currentRow}`).value = elem.challan_value;
          worksheet.getCell(`O${currentRow}`).value = elem.challan_eway;
        });

        // Blank row after each item
        currentRow++;

        for (let col = 1; col <= 15; col++) {
          worksheet.getCell(currentRow, col).value = "";
        }

        currentRow++;
      });

      // Generate Excel file
      const buffer = await workbook.xlsx.writeBuffer();

      const blob = new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");

      link.href = url;
      link.download = "exported_data.xlsx";

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error exporting Excel file:", error);
    }
  };

  return (
    <div style={{ height: "calc(100vh - 180px)", margin: "10px" }}>
      <Row justify="space-between">
        <Col>
          <Space>
            <div style={{ paddingBottom: "10px" }}>
              <Space>
                <MyDatePicker
                  setDateRange={setSearchInput}
                  showError={isValid}
                  value={searchInput}
                />

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
      <div style={{ height: "calc(100vh - 180px)" }}>
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

// const wiseOptions = [
//   {
//     text: "Client Wise",
//     value: "clientwise",
//   },
//   {
//     text: "Date Wise",
//     value: "datewise",
//   },
//   {
//     text: "Work Order Wise",
//     value: "wo_sfg_wise",
//   },
// ];

export default WoReport;
