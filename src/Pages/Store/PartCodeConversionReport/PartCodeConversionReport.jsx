import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Row, Col, Space } from "antd";
import { Box, IconButton } from "@mui/material";
import KeyboardArrowDown from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowRight from "@mui/icons-material/KeyboardArrowRight";
import MySelect from "../../../Components/MySelect";
import MyDatePicker from "../../../Components/MyDatePicker";
import { CommonIcons } from "../../../Components/TableActions.jsx/TableActions";
import MyAsyncSelect from "../../../Components/MyAsyncSelect";
import { imsAxios } from "../../../axiosInterceptor";
import { useToast } from "../../../hooks/useToast.js";
import Exceljs from "exceljs";
import { getComponentOptions } from "../../../api/general.ts";
import useApi from "../../../hooks/useApi.ts";
import MyButton from "../../../Components/MyButton";
import MyDataTable from "../../../Components/MyDataTable.jsx";

const consumptionColumns = [
  { headerName: "Serial Number", field: "serial_no", width: 110 },
  { headerName: "Consumption Part Name", field: "consump_part_name", flex: 1, minWidth: 160 },
  { headerName: "Consumption Part Code", field: "consump_part_code", width: 150 },
  { headerName: "Consumption Quantity", field: "consump_qty", width: 130 },
  { headerName: "UoM", field: "uom", width: 80 },
  {headerName: "Avg. Rate", field: "avr_rate", width: 100 },
  { headerName: "Pick Location", field: "pick_location", flex: 1, minWidth: 120 },
];

const PartCodeConversionReport = () => {
  const { showToast } = useToast();
  const wiseOptions = [
    {
      text: "Component Wise",
      value: "rm",
    },
    {
      text: "Date Wise",
      value: "date",
    },
  ];

  const [wise, setWise] = useState(wiseOptions[0].value);
  const [searchInput, setSearchInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [asyncOptions, setAsyncOptions] = useState([]);
  const [fetchConversion, SetfetchConversion] = useState([]);
  const [expandedRowKeys, setExpandedRowKeys] = useState([]);
  const { executeFun, loading: loading1 } = useApi();

  const rows = useMemo(
    () =>
      fetchConversion.map((record, index) => ({
        ...record,
        id: `row-${index}-${record.txn_id ?? record.serial_no ?? index}`,
        consumption: (record.consumption || []).map((c, i) => ({
          ...c,
          id: `cons-${index}-${i}`,
        })),
      })),
    [fetchConversion]
  );

  const toggleExpand = useCallback((id) => {
    setExpandedRowKeys((prev) => {
      if (prev.includes(id)) return [];
      return [id];
    });
  }, []);

  const columns = useMemo(
    () => [
      {
        field: "_expand",
        headerName: "",
        width: 48,
        sortable: false,
        disableColumnMenu: true,
        renderCell: ({ row }) => {
          if (!row.consumption?.length) return null;
          const open = expandedRowKeys.includes(row.id);
          return (
            <IconButton
              size="small"
              onClick={() => toggleExpand(row.id)}
              aria-label={open ? "Collapse consumption rows" : "Expand consumption rows"}
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
      { headerName: "Serial Number", field: "serial_no", width: 120 },
      { headerName: "Final label", field: "final_label", width: 120 },
      { headerName: "Final Part", field: "final_part", flex: 1, minWidth: 120 },
      { headerName: "Final QTY", field: "final_qty", width: 100 },
      { headerName: "UoM", field: "uom", width: 80 },
      { headerName: "Transaction Date", field: "txn_dt", width: 130 },
      { headerName: "Transaction By", field: "txn_by", width: 120 },
      { headerName: "Transaction Id", field: "txn_id", width: 120 },
      { headerName: "Drop Location", field: "drop_location", flex: 1, minWidth: 120 },
      {
        field: "_consumptionPanel",
        headerName: "Consumption breakdown",
        flex: 1,
        minWidth: 520,
        sortable: false,
        disableColumnMenu: true,
        renderCell: ({ row }) => {
          if (!expandedRowKeys.includes(row.id) || !row.consumption?.length) {
            return "";
          }
          return (
            <Box sx={{ width: "100%", height: 240 }}>
              <MyDataTable
                columns={consumptionColumns}
                data={row.consumption}
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
      if (expandedRowKeys.includes(params.id) && params.model.consumption?.length) {
        return 52 + 240;
      }
      return 52;
    },
    [expandedRowKeys]
  );

  const handleSubmit = async () => {
    try {
      setLoading(true);
      const response = await imsAxios.get(
        `/conversion/fetch/conversion?wise=${wise}&data=${searchInput}`
      );

      if (response.success) {
        SetfetchConversion(response.data);
        setExpandedRowKeys([]);
        showToast(response.data.status, "success");
      } else {
        showToast(response.message, "error");
        SetfetchConversion([]);
      }
    } catch (error) {
      console.log("some error occured while fetching rows", error);
    } finally {
      setLoading(false);
    }
  };

  const handleClientOptions = async (search) => {
    try {
      const response = await executeFun(
        () => getComponentOptions(search),
        "select"
      );
      const { data } = response;
      if (response.success) {
        const arr = data.map((row) => ({
          text: row.text,
          value: row.id,
        }));
        setAsyncOptions(arr);
      }
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    if (wise !== wiseOptions[1].value) {
      setSearchInput("");
    }
  }, [wise]);

  const handleDownload = () => {
    const workbook = new Exceljs.Workbook();
    const sheet = workbook.addWorksheet("Part Code Conversion Report");

    sheet.getRow(1).fill = {
      pattern: "solid",
      type: "pattern",
      fgColor: { argb: "FFCCFFCC" },
      bgColor: { argb: "FF0000" },
    };

    sheet.getRow(1).font = {
      family: 4,
      size: 12,
      bold: true,
    };

    const excelColumns = [
      { header: "Serial Number", key: "serial_no", width: 10 },
      { header: "Final Label", key: "final_label", width: 20 },
      { header: "Final Part", key: "final_part", width: 15 },
      { header: "Final Qty", key: "final_qty", width: 10 },
      { header: "UoM", key: "uom", width: 10 },
      { header: "Transaction Date", key: "txn_dt", width: 20 },
      { header: "Transaction By", key: "txn_by", width: 20 },
      { header: "Transaction Id", key: "txn_id", width: 20 },
      { header: "Drop Location", key: "drop_location", width: 20 },
      { header: "Serial Number", key: "serial_no_consumption", width: 10 },
      { header: "Consumption Part Name", key: "consump_part_name", width: 20 },
      { header: "Consumption Part Code", key: "consump_part_code", width: 20 },
      { header: "Consumption Quantity", key: "consump_qty", width: 10 },
      { header: "Consumption UoM", key: "consump_uom", width: 10 },
      { header: "Avg. Rate", key: "avr_rate", width: 10 },
      { header: "Pick Location", key: "pick_location", width: 20 },
    ];

    sheet.columns = excelColumns;

    fetchConversion.forEach((record) => {
      const rowData = {
        serial_no: record.serial_no,
        final_label: record.final_label,
        final_part: record.final_part,
        final_qty: record.final_qty,
        uom: record.uom,
        txn_dt: record.txn_dt,
        txn_by: record.txn_by,
        txn_id: record.txn_id,
        drop_location: record.drop_location,
        serial_no_consumption: "",
        consump_part_name: "",
        consump_part_code: "",
        consump_qty: "",
        consump_uom: "",
        pick_location: "",
      };

      if (record.consumption && record.consumption.length > 0) {
        record.consumption.forEach((consumptionItem, index) => {
          const consumptionKeyPrefix = index === 0 ? "" : index;
          rowData[`serial_no_consumption${consumptionKeyPrefix}`] =
            consumptionItem.serial_no;
          rowData[`consump_part_name${consumptionKeyPrefix}`] =
            consumptionItem.consump_part_name;
          rowData[`consump_part_code${consumptionKeyPrefix}`] =
            consumptionItem.consump_part_code;
          rowData[`consump_qty${consumptionKeyPrefix}`] =
            consumptionItem.consump_qty;
          rowData[`consump_uom${consumptionKeyPrefix}`] = consumptionItem.uom;
          rowData[`pick_location${consumptionKeyPrefix}`] =
            consumptionItem.pick_location;
            rowData[`avr_rate${consumptionKeyPrefix}`] = consumptionItem.avr_rate;
        });
      }

      sheet.addRow(rowData);
    });

    workbook.xlsx.writeBuffer().then((data) => {
      const blob = new Blob([data], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheet.sheet",
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "PartCodeConversionReport.xlsx";
      link.click();
      window.URL.revokeObjectURL(url);
    });
  };

  return (
    <div style={{ height: "calc(100%-160)", padding: 10 }}>
      <Row justify="space-between">
        <Col>
          <Space>
            <div style={{ paddingBottom: "10px" }}>
              <Space>
                <div style={{ width: 200 }}>
                  <MySelect
                    onChange={setWise}
                    options={wiseOptions}
                    value={wise}
                    placeholder="Select Wise"
                  />
                </div>
                {wise === wiseOptions[0].value && (
                  <div style={{ width: 270 }}>
                    <MyAsyncSelect
                      selectLoading={loading1("select")}
                      optionsState={asyncOptions}
                      onBlur={() => setAsyncOptions([])}
                      value={searchInput}
                      onChange={setSearchInput}
                      loadOptions={handleClientOptions}
                    />
                  </div>
                )}
                {wise === wiseOptions[1].value && (
                  <MyDatePicker setDateRange={setSearchInput} />
                )}
                <MyButton
                  variant="search"
                  onClick={handleSubmit}
                  loading={loading}
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
          onClick={handleDownload}
        />
      </Row>
      <Row style={{ height: "calc(100vh - 190px)", marginTop: 8 }}>
        <Col span={24} style={{ height: "100%" }}>
          <MyDataTable
            columns={columns}
            data={rows}
            loading={loading}
            getRowHeight={getRowHeight}
            disableVirtualization={expandedRowKeys.length > 0}
            hideHeaderMenu
          />
        </Col>
      </Row>
    </div>
  );
};

export default PartCodeConversionReport;
