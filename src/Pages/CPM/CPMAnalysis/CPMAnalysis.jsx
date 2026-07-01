import  { useEffect, useState, useMemo, useCallback } from "react";
import { Button, Input, Space, Row, Col, Tooltip } from "antd";
import { Box, IconButton } from "@mui/material";
import KeyboardArrowDown from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowRight from "@mui/icons-material/KeyboardArrowRight";
import { useToast } from "../../../hooks/useToast.js";
import { downloadCSVAntTable } from "../../../Components/exportToCSV";
import MyAsyncSelect from "../../../Components/MyAsyncSelect";
import { CommonIcons } from "../../../Components/TableActions.jsx/TableActions";
import { imsAxios } from "../../../axiosInterceptor";
import { InfoCircleFilled } from "@ant-design/icons";
import { getProjectOptions } from "../../../api/general.ts";
import useApi from "../../../hooks/useApi.ts";
import MyButton from "../../../Components/MyButton";
import MyDataTable from "../../../Components/MyDataTable.jsx";

const csvExportColumns = [
  { headerName: "Part", dataIndex: "part" },
  { headerName: "Name", dataIndex: "name" },
  { headerName: "Type", dataIndex: "type" },
  { headerName: "BOM QTY", dataIndex: "bomqty" },
  { headerName: "BOM RATE", dataIndex: "bomrate" },
  { headerName: "UoM", dataIndex: "unit" },
  { headerName: "PROJECT REQUIRED QTY (A)", dataIndex: "requirement" },
  { headerName: "PO ORDERED QTY (B)", dataIndex: "order_qty" },
  { headerName: "RECIEVED PO QTY (c)", dataIndex: "inward_qty" },
  { headerName: "PENDING PO QTY (D = B-C)", dataIndex: "pending_qty" },
  { headerName: "STOCK IN HAND AT 2ND FLOOR (E)", dataIndex: "branch_stock" },
  { headerName: "STOCK AT SHOP FLOOR (F)", dataIndex: "sfFloor" },
  { headerName: "PENDING REQUIRED QTY (G)", dataIndex: "pending_reqqty" },
  { headerName: "OVER STOCK QTY (H = D+E+F-G)", dataIndex: "over_st_qty" },
  { headerName: "DEBIT NOTE QTY", dataIndex: "debit_qty" },
];

const nestedColumns = [
  { headerName: "Sr. No", field: "index", width: 80 },
  { headerName: "Part", field: "part", width: 100 },
  { headerName: "Code", field: "ven_code", width: 120 },
  { headerName: "Name", field: "ven_name", flex: 1, minWidth: 200 },
  { headerName: "PO Ord Qty", field: "total_ord", width: 120 },
  { headerName: "Recv. Qty", field: "inward_qty", width: 120 },
  { headerName: "Pending Qty", field: "pending_qty", width: 120 },
];

export default function CPMAnalysis() {
  const { showToast } = useToast();
  const [fileInfo, setFileInfo] = useState("");
  const [projectId, setProjectId] = useState("");
  const [searchLoading, setSearchLoading] = useState(false);
  const [nestedTableLoading, setNestedTableLoading] = useState(false);
  const [rows, setRows] = useState([]);
  const [filteredRows, setFilteredRows] = useState([]);
  const [filterText, setFilterText] = useState("");
  const [asyncOptions, setAsyncOptions] = useState([]);
  const [search, setSearch] = useState("");
  const [expandedRowKeys, setExpandedRowKeys] = useState([]);

  const { executeFun, loading } = useApi();

  const toggleExpand = useCallback((id) => {
    setExpandedRowKeys((prev) => {
      if (prev.includes(id)) return [];
      return [id];
    });
  }, []);

  const fetchRowDetails = useCallback(
    async (record) => {
      if (!record?.key) return;
      const partKey = record.part;
      setNestedTableLoading(partKey);
      try {
        const response = await imsAxios.post("/ppr/fetch_groupProjectBomReport", {
          project: projectId,
          part: record.key,
        });
        if (!response.success) {
          showToast(response.message?.msg || response.message, "error");
          return;
        }
        const arr1 = (response.data || []).map((row, index) => ({
          ...row,
          index: index + 1,
          id: `detail-${record.id}-${index}`,
        }));
        setRows((prev) =>
          prev.map((row) =>
            row.part === partKey ? { ...row, details: arr1 } : row
          )
        );
        setFilteredRows((prev) =>
          prev.map((row) =>
            row.part === partKey ? { ...row, details: arr1 } : row
          )
        );
      } catch (e) {
        console.error(e);
        showToast("Failed to load BOM details", "error");
      } finally {
        setNestedTableLoading(false);
      }
    },
    [projectId, showToast]
  );

  useEffect(() => {
    if (expandedRowKeys.length !== 1) return;
    const rowId = expandedRowKeys[0];
    const record = filteredRows.find((r) => r.id === rowId);
    if (!record || record.details !== undefined || !record.key) return;
    fetchRowDetails(record);
  }, [expandedRowKeys, filteredRows, fetchRowDetails]);

  const columns = useMemo(
    () => [
      {
        field: "_expand",
        headerName: "",
        width: 48,
        sortable: false,
        disableColumnMenu: true,
        renderCell: ({ row }) => {
          const open = expandedRowKeys.includes(row.id);
          return (
            <IconButton
              size="small"
              onClick={() => toggleExpand(row.id)}
              aria-label={open ? "Collapse details" : "Expand details"}
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
      { headerName: "Part", field: "part", width: 120 },
      { headerName: "Name", field: "name", flex: 1, minWidth: 220 },
      { headerName: "TYPE", field: "type", width: 130 },
      { headerName: "BOM QTY", field: "bomqty", width: 120 },
      { headerName: "BOM RATE", field: "bomrate", width: 120 },
      { headerName: "UoM", field: "unit", width: 100 },
      {
        headerName: "PROJECT REQUIRED QTY (A)",
        field: "requirement",
        width: 160,
      },
      { headerName: "PO ORDERED QTY (B)", field: "order_qty", width: 150 },
      { headerName: "RECIEVED PO QTY (c)", field: "inward_qty", width: 150 },
      { headerName: "PENDING PO QTY (D = B-C)", field: "pending_qty", width: 150 },
      {
        headerName: "STOCK IN HAND AT 2ND FLOOR (E)",
        field: "branch_stock",
        width: 180,
      },
      { headerName: "STOCK AT SHOP FLOOR (F)", field: "sfFloor", width: 160 },
      {
        headerName: "PENDING REQUIRED QTY (G)",
        field: "pending_reqqty",
        width: 170,
      },
      {
        headerName: "OVER STOCK QTY (H = D+E+F-G)",
        field: "over_st_qty",
        width: 180,
      },
      { headerName: "DEBIT NOTE QTY", field: "debit_qty", width: 140 },
      {
        field: "_detailPanel",
        headerName: "PO / receipt breakdown",
        flex: 1,
        minWidth: 520,
        sortable: false,
        disableColumnMenu: true,
        renderCell: ({ row }) => {
          if (!expandedRowKeys.includes(row.id)) return "";
          const detailRows = row.details ?? [];
          return (
            <Box sx={{ width: "100%", height: 240 }}>
              <MyDataTable
                columns={nestedColumns}
                data={detailRows}
                loading={nestedTableLoading === row.part}
                hideFooter
                hideHeaderMenu
              />
            </Box>
          );
        },
      },
    ],
    [expandedRowKeys, nestedTableLoading, toggleExpand]
  );

  const getRowHeight = useCallback(
    (params) => {
      if (expandedRowKeys.includes(params.id)) {
        return 52 + 240;
      }
      return 52;
    },
    [expandedRowKeys]
  );

  const getRows = async () => {
    setSearchLoading(true);
    const response = await imsAxios.post("/ppr/fetch_finalProjectBomReport", {
      project: projectId,
    });
    setSearchLoading(false);
    if (response.success) {
      const list = Array.isArray(response.data) ? response.data : [];
      let arr = list.map((row, idx) => ({
        ...row,
        id: `row-${row.key ?? row.part ?? idx}`,
        uniqueKey: row.key,
        leftQty: "--",
        requirement: Number(row.requirement)?.toLocaleString("hi-IN"),
        order_qty: Number(row.order_qty)?.toLocaleString("hi-IN"),
        inward_qty: Number(row.inward_qty)?.toLocaleString("hi-IN"),
        pending_qty: Number(row.pending_qty)?.toLocaleString("hi-IN"),
        branch_stock: Number(row.branch_stock)
          ? Number(row.branch_stock)?.toLocaleString("hi-IN")
          : Number(row.branch_stock),
        pending_reqqty: Number(row.pending_reqqty)
          ? Number(row.pending_reqqty)?.toLocaleString("hi-IN")
          : Number(row.pending_reqqty),
        over_st_qty: Number(row.over_st_qty)
          ? Number(row.over_st_qty)?.toLocaleString("hi-IN")
          : Number(row.over_st_qty),
        sfFloor: Number(row.sf_stock)?.toLocaleString("hi-IN") ?? 0,
        debit_qty: Number(row.dnQty)?.toLocaleString("hi-IN") ?? 0,
      }));
      if (arr.length > 0) {
        arr[0] = { ...arr[0], date: search.date };
      }
      setRows(arr);
      setFilteredRows(arr);
      setExpandedRowKeys([]);
    } else {
      setRows([]);
      setFilteredRows([]);
      showToast(response.message?.msg || response.message, "error");
    }
  };

  const getDate = async () => {
    const response = await imsAxios.post("/backend/fetchProjectData", {
      search: projectId,
    });
    if (!response.success) return;
    const fromOther = response.other?.detail;
    const fromData =
      !Array.isArray(response.data) && response.data?.other?.detail;
    setFileInfo(fromOther || fromData || "");
  };

  const handleFetchProjectOptions = async (searchText) => {
    const response = await executeFun(
      () => getProjectOptions(searchText),
      "select"
    );
    setAsyncOptions(response.data);
  };

  useEffect(() => {
    if (!filterText) {
      setFilteredRows(rows);
      return;
    }
    const q = filterText.toLowerCase();
    const fil = rows.filter(
      (row) =>
        row.part?.toLowerCase().includes(q) ||
        row.name?.toLowerCase().includes(q)
    );
    setFilteredRows(fil);
  }, [filterText, rows]);

  useEffect(() => {
    if (projectId) {
      getDate();
    }
  }, [projectId]);

  return (
    <div style={{ height: "100%", padding: 10 }}>
      <Row justify="space-between">
        <Space>
          <div style={{ width: 250 }}>
            <MyAsyncSelect
              onBlur={() => setAsyncOptions([])}
              optionsState={asyncOptions}
              placeholder="Project ID"
              selectLoading={loading("select")}
              loadOptions={handleFetchProjectOptions}
              onInputChange={(e) => setSearch(e)}
              onChange={(e) => setProjectId(e)}
              value={projectId}
            />
          </div>

          <MyButton
            variant="search"
            type="primary"
            loading={searchLoading}
            onClick={getRows}
            id="submit"
          >
            Search
          </MyButton>

          <CommonIcons
            action="downloadButton"
            onClick={() =>
              downloadCSVAntTable(
                rows,
                csvExportColumns,
                `CPM Analysis project:${rows[0]?.project}`
              )
            }
            disabled={rows.length == 0}
          />
          <Tooltip
            placement="bottom"
            title={fileInfo?.length > 0 ? `Project Detail: ${fileInfo} ` : ""}
          >
            <Button
              type="primary"
              shape="circle"
              icon={<InfoCircleFilled />}
              disabled={fileInfo === ""}
            />
          </Tooltip>
        </Space>
        <Col span={4}>
          <Input
            onChange={(e) => setFilterText(e.target.value)}
            placeholder="Search part..."
          />
        </Col>
      </Row>
      <div style={{ marginTop: 10, height: "calc(100vh - 200px)" }}>
        <MyDataTable
          columns={columns}
          data={filteredRows}
          loading={searchLoading}
          getRowHeight={getRowHeight}
          disableVirtualization={expandedRowKeys.length > 0}
          hideFooter
          hideHeaderMenu
        />
      </div>
    </div>
  );
}
