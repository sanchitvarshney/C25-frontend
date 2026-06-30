import { Button, Col, Row, Space, Card } from "antd";
import React, { useState } from "react";

import MyDatePicker from "../../Components/MyDatePicker";
import socket from "../../Components/socket";
import { useSelector } from "react-redux";
import { useToast } from "../../hooks/useToast.js";

import { v4 } from "uuid";

const TdsReport = () => {
  const { showToast } = useToast();
  const [dateRange, setDateRange] = useState("");
  const { user, notifications } = useSelector((state) => state.login);
  const emitDownloadEvent = () => {
    let newId = v4();
  

    if (!user.company_branch) {
      showToast("Please select a branch to download report", "error");
      return;
    }
    const payload = {
      date: dateRange,
      notificationId: newId,
    };
  
    socket.emit("getTdsReport", payload);
  };
  return (
    <div style={{ height: "100%" }}>
      <Row gutter={16} style={{ margin: "5px", display: "flex", justifyContent: "center", alignItems: "center", height: "100%" }}>
        <Card size="small" title="TDS Report">
    <Col span={24}>
          <MyDatePicker setDateRange={setDateRange} />
        </Col>
        <Col span={24} style={{ display: "flex", justifyContent: "center", marginTop: 10 }}>
          <Button
            // loading={loading}
            type="primary"
            onClick={emitDownloadEvent}
          >
            Download Report
          </Button>
        </Col>
        </Card>
    
      </Row>
    </div>
  );
};

export default TdsReport;
const columns = [
  {
    headerName: "Section",
    field: "tcsCode",
    flex: 1,
  },
  {
    headerName: "VBT No.",
    field: "tcsCode",
    flex: 1,
  },
  {
    headerName: "Vendor Name",
    field: "tcsCode",
    flex: 1,
  },
  {
    headerName: "Pan No.",
    field: "tcsCode",
    flex: 1,
  },
  {
    headerName: "Invoice No.",
    field: "tcsCode",
    flex: 1,
  },
  {
    headerName: "Invoice Date",
    field: "tcsCode",
    flex: 1,
  },
  {
    headerName: "GST Assesable Value",
    field: "tcsCode",
    flex: 1,
  },
  {
    headerName: "TDS Assessable Value",
    field: "tcsCode",
    flex: 1,
  },
  {
    headerName: "TDS Rate.",
    field: "tcsCode",
    flex: 1,
  },
  {
    headerName: "To Be Deducted TDS On GST AV",
    field: "tcsCode",
    flex: 1,
  },
  {
    headerName: "TDS Duducted.",
    field: "tcsCode",
    flex: 1,
  },
  {
    headerName: "Difference",
    field: "tcsCode",
    flex: 1,
  },
];
