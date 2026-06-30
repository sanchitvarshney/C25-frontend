import React, { useState, useEffect, useCallback } from "react";
import { useToast } from "../../../hooks/useToast.js";
import { Input, Row, Space } from "antd";
import MyDataTable from "../../../Components/MyDataTable";
import { v4 } from "uuid";
import MyDatePicker from "../../../Components/MyDatePicker";
import socket from "../../../Components/socket";
import { useSelector } from "react-redux/es/exports";
import { imsAxios } from "../../../axiosInterceptor";
import MySelect from "../../../Components/MySelect";
import ToolTipEllipses from "../../../Components/ToolTipEllipses";
import { CommonIcons } from "../../../Components/TableActions.jsx/TableActions";
import { downloadCSV } from "../../../Components/exportToCSV";
import MyButton from "../../../Components/MyButton";
import { GridActionsCellItem } from "@mui/x-data-grid";
import useApi from "../../../hooks/useApi.ts";
import { downloadAttachement } from "../../../api/store/material-in";
import { downloadFromLink } from "../../../utils/general.ts";
import {
  registerReportNavDetailedDownload,
  unregisterReportNavDetailedDownload,
} from "../../../utils/reportNavDetailedDownload";
const TransactionIn = () => {
  const { showToast } = useToast();
  const [wise, setWise] = useState("M");
  const [searchInput, setSearchInput] = useState("");
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);

  const { user } = useSelector((state) => state.login);
  const { executeFun, loading: loading1 } = useApi();
  const wiseOptions = [
    { text: "Date Wise", value: "M" },
    { text: "PO Wise", value: "P" },
  ];
  const getRows = async () => {
    setLoading("fetch");
    const response = await imsAxios.get(`/transaction/transactionIn?data=${searchInput}&type=${wise}`);
    setLoading(false);
      if (response.success) {
        let arr = response.data.map((row, index) => ({
          index: index + 1,
          id: v4(),
          ...row,
        }));
        setRows(arr);
      } else {
        showToast(response.message?.msg || response.message, "error");
        setRows([]);
      }
  };

  const handleDownloadAttachement = async (transactionId) => {
    const response = await executeFun(
      () => downloadAttachement(transactionId),
      "download"
    );
    if (response.success) {
      downloadFromLink(response.data.url);
      // window.open(response.data.url, "_blank", "noreferrer");
    }
  };
  const columns = [
    {
      field: "actions",
      headerName: "",
      type: "actions",
      width: 30,
      getActions: ({ row }) => [
        <GridActionsCellItem
          key="download-attachment"
          showInMenu
          onClick={() => handleDownloadAttachement(row.TRANSACTION)}
          disabled={row.invoiceStatus == false}
          label="Download Attachement"
          // disabled={row.approval_status == "C"}
        />,
      ],
    },
    { headerName: "Sr. No", field: "index", width: 80 },
    {
      headerName: "Date",
      field: "DATE",
      width: 120,
      renderCell: ({ row }) => <ToolTipEllipses text={row.DATE} />,
    },
    { headerName: "Transaction Type", field: "TYPE", width: 120 },
    { headerName: "Part No.", field: "PART", width: 100 },
    { headerName: "Cat Part Code", field: "PART_NEW", width: 100 },
    {
      headerName: "Component",
      field: "COMPONENT",
      minWidth: 200,
      flex: 1,
      renderCell: ({ row }) => <ToolTipEllipses text={row.COMPONENT} />,
    },
    { headerName: "In Location", field: "LOCATION", width: 120 },
    { headerName: "Rate", field: "RATE", width: 100 },
    { headerName: "Currency", field: "CURRENCY", width: 100 },
    { headerName: "In Qty", field: "INQTY", width: 120 },
    {
      headerName: "Vendor",
      field: "VENDOR",
      width: 150,
      renderCell: ({ row }) => <ToolTipEllipses text={row.VENDOR} />,
    },
    {
      headerName: "Doc Id",
      field: "INVOICENUMBER",
      width: 150,
      renderCell: ({ row }) => <ToolTipEllipses text={row.INVOICENUMBER} />,
    },
    { headerName: "Transaction Id", field: "TRANSACTION", width: 150 },
    { headerName: "Document Date", field: "DOC_DATE", width: 150 },
    { headerName: "Cost Center", field: "COSTCENTER", width: 150 },
    { headerName: "By", field: "ISSUEBY", width: 120 },
  ];
  const handleDownloadingCSV = useCallback(() => {
    const newId = v4();
    socket.emit("trans_in", {
      otherdata: JSON.stringify({
        date: searchInput,
        branch: user.company_branch,
        wise: wise,
      }),
      notificationId: newId,
    });
  }, [searchInput, wise, user?.company_branch]);

  useEffect(() => {
    registerReportNavDetailedDownload(handleDownloadingCSV);
    return () => unregisterReportNavDetailedDownload();
  }, [handleDownloadingCSV]);
  const handleSimmpleDownloadingCSV = () => {
    downloadCSV(rows, columns, "MIN Register Report");
  };
  useEffect(() => {
    setSearchInput("");
  }, [wise]);
  return (
    <div style={{ height: "calc(100vh - 140px)", padding: "10px" }}>
      <Row justify="space-between">
        <Space>
          <div style={{ width: 150 }}>
            <MySelect
              options={wiseOptions}
              defaultValue={wiseOptions.filter((o) => o.value === wise)[0]}
              onChange={setWise}
              value={wise}
            />
          </div>
          <div style={{ width: 300 }}>
            {wise === "M" && (
              <MyDatePicker
                size="default"
                setDateRange={setSearchInput}
                dateRange={searchInput}
                value={searchInput}
              />
            )}
            {wise === "P" && (
              <Input
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
              />
            )}
          </div>
          <MyButton
            variant="search"
            onClick={getRows}
            type="primary"
            loading={loading === "fetch"}
            disabled={wise === "" || searchInput === ""}
          >
            Fetch
          </MyButton>
        </Space>
        <Space>
          <CommonIcons
            tooltip="Download Brief Report"
            onClick={handleSimmpleDownloadingCSV}
            action="downloadButton"
          />
        </Space>
      </Row>
      <div style={{ height: "calc(100% - 20px)", marginTop: 10 }}>
        <MyDataTable
          loading={loading === "fetch" || loading1("download")}
          rows={rows}
          columns={columns}
        />
      </div>
    </div>
  );
};

export default TransactionIn;
