import React, { useState, useEffect, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux/es/exports";
import { Button, Col, Popover, Row, Space } from "antd";
import MyDataTable from "../../../Components/MyDataTable";
import { v4 } from "uuid";
import { MdOutlineDownloadForOffline } from "react-icons/md";
import MyDatePicker from "../../../Components/MyDatePicker";
import { setNotifications } from "../../../Features/loginSlice/loginSlice";
import socket from "../../../Components/socket";
import {
  downloadCSV,
  downloadCSVCustomColumns,
} from "../../../Components/exportToCSV";
import { imsAxios } from "../../../axiosInterceptor";
import { DownloadOutlined } from "@ant-design/icons";
import MyButton from "../../../Components/MyButton/index.jsx";
import { useToast } from "../../../hooks/useToast.js";
import MySelect from "../../../Components/MySelect.jsx";
import {
  registerReportNavDetailedDownload,
  unregisterReportNavDetailedDownload,
} from "../../../utils/reportNavDetailedDownload";

const wiseOptions = [
  { text: "Issue", value: "ISSUE" },
  { text: "Job Work", value: "JOBWORK" },
  { text: "Consumption", value: "CONSUMPTION" },
  { text: "SFG Consumption", value: "SFG-CONSUMPTION" },
  { text: "Transfer", value: "TRANSFER" },
];

const TransactionOut = () => {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [datee, setDatee] = useState("");
  const [dateData, setDateData] = useState([]);
  const [fetchData, setFetchData] = useState([]);
  const [search, setSearch] = useState("");
  const [wise, setWise] = useState("ISSUE");
  const { user, notifications } = useSelector((state) => state.login);

  const content1 = (row) => (
    <div>
      <span
        style={{ fontWeight: "bold" }}
        dangerouslySetInnerHTML={{ __html: row }}
      />
    </div>
  );

  const columns = [
    { field: "DATE", headerName: "Date", width: 170 },
    { field: "TYPE", headerName: "Type", width: 100 },
    { field: "PART", headerName: "Part No.", width: 150 },
    { field: "PART_NEW", headerName: "Cat Part Code", width: 150 },
    { field: "COMPONENT", headerName: "Component", minWidth: 200, flex: 1 },
    { field: "FROMLOCATION", headerName: "From Location", width: 160 },
    { field: "TOLOCATION", headerName: "To Location", width: 160 },
    { field: "OUTQTY", headerName: "Out Qty", width: 140 },
    { field: "UNIT", headerName: "UoM", width: 140 },
    {
      field: "VENDORCODE",
      headerName: "Vendor",
      width: 160,
      renderCell: ({ row }) => (
        // console.log(row),
        <Popover content={content1(row?.VENDORNAME)}>
          <span style={{ fontWeight: "bolder", cursor: "pointer" }}>
            {row?.VENDORCODE}
          </span>
        </Popover>
      ),
    },
    { field: "REQUESTEDBY", headerName: "Requested By", width: 160 },
    { field: "ISSUEBY", headerName: "Approved By", width: 160 },
  ];

  const handleDownloadingCSV = useCallback(() => {
    const newId = v4();
    socket.emit("trans_out", {
      otherdata: JSON.stringify({ date: datee, branch: user.company_branch }),
      notificationId: newId,
    });
  }, [datee, user?.company_branch]);

  useEffect(() => {
    registerReportNavDetailedDownload(handleDownloadingCSV);
    return () => unregisterReportNavDetailedDownload();
  }, [handleDownloadingCSV]);
  const handleSimmpleDownloadingCSV = () => {
    downloadCSV(dateData, columns, "RM Register Report");
  };
  // const handleDownloadXML = () => {
  //   console.log("fetching report");
  //   let newId = v4();
  //   socket.emit("rmsfXML", {
  //     otherdata: { date: datee },
  //     notificationId: newId,
  //   });
  // };
  // console.log(datee);

  const rmIssue = async (e) => {
    e.preventDefault();

    if (!datee[0] || !datee[1]) {
      showToast("a", "error");
    } else {
      setLoading(true);
      setDateData([]);
      const response = await imsAxios.get(`/transaction/transactionOut?data=${datee}&type=${wise}`, {
        data: datee,
      });
      // console.log("Response", data);
      if (response.success) {
        let arr = response.data.map((row) => {
          return {
            ...row,
            id: v4(),
          };
        });
        setDateData(arr);
        setLoading(false);
      } else {
        showToast(response.message?.msg || response.message, "error");
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    const ress = dateData.filter((a) => {
      return a.PART.toLowerCase().match(search.toLowerCase());
    });
    setFetchData(ress);
  }, [search]);

  // console.log(dateData);
  return (
    <div style={{ height: "calc(100vh - 120px)", padding:10}}>
      <Row gutter={10}  justify="space-between">
        <Col>
          <Space>
              <div style={{ width: "200px" }}> 
             <MySelect
              options={wiseOptions}
              defaultValue={wiseOptions.filter((o) => o.value === wise)[0]}
              onChange={setWise}
              value={wise}
            />
           </div>
            <MyDatePicker setDateRange={setDatee} size="default" />

            <MyButton
              variant="search"
              onClick={rmIssue}
              loading={loading}
              block
              type="primary"
            >
              Fetch
            </MyButton>
          </Space>
        </Col>
        {/* {dateData.length > 0 && ( */}
        <Col>
          <Space>
            <Button
              tooltip="Download Brief Report"
              onClick={handleSimmpleDownloadingCSV}
              shape="circle"
              icon={<DownloadOutlined />}
            />
          </Space>
        </Col>
        {/* // )} */}
      </Row>
      <div style={{ height:"calc(100vh - 180px)", marginTop: "10px" }}>
        <MyDataTable loading={loading} data={dateData} columns={columns} />
      </div>
    </div>
  );
};

export default TransactionOut;
