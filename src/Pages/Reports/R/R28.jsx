import React, { useState } from "react";
import { Button, Col, Row, Space } from "antd";
import MyDatePicker from "../../../Components/MyDatePicker";
import axios from "axios";
import { v4 } from "uuid";
import MyDataTable from "../../../Components/MyDataTable";
import { DownloadOutlined } from "@ant-design/icons";
import {
  downloadCSV,
  downloadCSVCustomColumns,
} from "../../../Components/exportToCSV";
import { imsAxios } from "../../../axiosInterceptor";
import { CommonIcons } from "../../../Components/TableActions.jsx/TableActions";
import ToolTipEllipses from "../../../Components/ToolTipEllipses";
import SingleDatePicker from "../../../Components/SingleDatePicker";
import MyButton from "../../../Components/MyButton";
import { useToast } from "../../../hooks/useToast.js";
//weekky report
function R28() {
  const { showToast } = useToast();
  const [datee, setDatee] = useState("");
  const [loading, setLoading] = useState(false);
  const [dateData, setDateData] = useState([]);

  const columns = [
    {
      headerName: "#",
      width: 30,
      field: "id",
    },
    {
      headerName: "Part Code",
      flex: 1,
      field: "part_code",
    },
    {
      headerName: "RM QTY",
      flex: 1,
      field: "rm_qty",
    },
    {
      headerName: "SF QTY",
      flex: 1,
      field: "sf_qty",
    },
    {
      field: "weightedPurchaseRate",
      headerName: "Weighted Average Rate",
      width: 180,
    },
  ];

  const getRows = async () => {
    setDateData([]);
    setLoading(true);
    const response = await imsAxios.post("/report28", {
      date: datee,
    });
    if (response.success) {
      setLoading(false);
      showToast(response.message, "success");
      let arr = response.data.map((row, index) => {
        return {
          ...row,
          id: index + 1,
        };
      });
      setDateData(arr);
      setLoading(false);
    } else if (!response.success) {
      showToast(response.message, "error");
      setLoading(false);
    }
  };

  const handleDownloadingCSV = () => {
    downloadCSV(dateData, columns, `RM Issue Register Report ${datee}`);
  };

  return (
    <div style={{ height: "100%" }}>
      <Row style={{ padding: 5, paddingTop: 0 }}>
        <Col span={3}>
          {/* <MyDatePicker size="default" setDateRange={setDatee} /> */}
          <SingleDatePicker
            setDate={setDatee}
            placeholder="Select Effective Date.."
            selectedDate={datee}
            value={datee}
          />
        </Col>
        <MyButton
          variant="search"
          style={{ marginLeft: 4 }}
          loading={loading}
          onClick={getRows}
          type="primary"
        >
          Fetch
        </MyButton>
      </Row>
      <div style={{ height: "calc(100% - 50px)", paddingRight: 5, paddingLeft: 5 }}>
        <MyDataTable loading={loading} columns={columns} data={dateData} />
      </div>
    </div>
  );
}

export default R28;
