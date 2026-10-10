import { Button, Col, Row, Card } from "antd";
import { useState } from "react";

import MyDatePicker from "../../Components/MyDatePicker";
import socket from "../../Components/socket";
import { useSelector } from "react-redux";
import { useToast } from "../../hooks/useToast.js";

import { v4 } from "uuid";

const TdsReport = () => {
  const { showToast } = useToast();
  const [dateRange, setDateRange] = useState("");
  const [isValid, setIsValid] = useState(false);
  const { user } = useSelector((state) => state.login);
  const emitDownloadEvent = () => {
    if (!dateRange) {
      setIsValid(true);
      return;
    }
    setIsValid(false);
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
      <Row
        gutter={16}
        style={{
          margin: "5px",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100%",
        }}
      >
        <Card size="small" title="TDS Report">
          <Col span={24}>
            <MyDatePicker
              setDateRange={setDateRange}
              value={dateRange}
              showError={isValid}
              message="Please select a date range"
            />
          </Col>
          <Col
            span={24}
            style={{ display: "flex", justifyContent: "center", marginTop: 10 }}
          >
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
