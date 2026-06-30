import React, { useState } from "react";
import "./r.css";
import { MdOutlineDownloadForOffline } from "react-icons/md";
import { Button, Col, Row } from "antd";
import { downloadCSVCustomColumns } from "../../../Components/exportToCSV";
import { v4 } from "uuid";
import MyDataTable from "../../../Components/MyDataTable";
import MyDatePicker from "../../../Components/MyDatePicker";
import { imsAxios } from "../../../axiosInterceptor";
import MyButton from "../../../Components/MyButton";
import { useToast } from "../../../hooks/useToast";

const R5 = () => {
  const { showToast } = useToast();
  const [responseData, setResponseData] = useState([]);
  const [selectDate, setSelectDate] = useState("");
  const [loading, setLoading] = useState(false);

  const columns = [
    { field: "fgtype", headerName: "Type", width: 80 },
    { field: "sku", headerName: "SKU", width: 100 },
    { field: "product", headerName: "Product", width: 300 },
    { field: "openBal", headerName: "Opening Qty", width: 120 },
    { field: "creditBal", headerName: "Inward Qty", width: 120 },
    { field: "debitBal", headerName: "Outward Qty", width: 120 },
    { field: "closingBal", headerName: "Closing Qty", width: 130 },
    { field: "minqty", headerName: "MIN. Stock", width: 100 },
    { field: "batchqty", headerName: "Batch Size", width: 100 },
    { field: "replenishment", headerName: "Replenishment", width: 150 },
    { field: "eqp", headerName: "EQP", width: 80 },
  ];

  const handleDownloadingCSV = () => {
    let arr = [];
    let csvData = [];
    arr = responseData;
    csvData = arr.map((row) => {
      return {
        Type: row.fgtype,
        SKU: row.sku,
        Product: row.product,
        "OP Qty": row.openBal,
        "Inward Qty": row.creditBal,
        "Outward Qty": row.debitBal,
        "Closing Qty": row.closingBal,
        "Min Stock": row.closingBal,
        "Batch Size": row.batchqty,
        Replenishment: row.replenishment,
        Eqp: row.eqp,
      };
    });
    downloadCSVCustomColumns(csvData, "Finish Goods Stock");
  };

  const fetch = async () => {
    if (!selectDate) {
      showToast("Please Select Date First Then Proceed Next Step", "error");
    } else {
      setResponseData([]);
      setLoading(true);
      const response = await imsAxios.post("/report5", {
        date: selectDate,
        action: "search_r5",
      });

      if (response.success) {
        let arr = response.data.map((row) => {
          return {
            ...row,
            id: v4(),
          };
        });
        setResponseData(arr);
        setLoading(false);
      } else if (!response.success) {
        setLoading(true);
        showToast(response.message, "error");
        setLoading(false);
      }
    }
  };

  return (
    <div style={{ height: "95%" }}>
      <Row gutter={10} style={{ margin: "5px" }}>
        <Col span={5}>
          {/* <SingleDatePicker setDate={setSelectDate} /> */}
          <MyDatePicker setDateRange={setSelectDate} size="default" />
        </Col>
        <Col span={1}>
          <MyButton variant="search" type="primary" onClick={fetch}>
            Fetch
          </MyButton>
        </Col>
        {responseData.length > 1 && (
          <Col span={1} offset={17}>
            <Button onClick={handleDownloadingCSV}>
              <MdOutlineDownloadForOffline style={{ fontSize: "20px" }} />
            </Button>
          </Col>
        )}
      </Row>

      <div className="hide-select" style={{ height: "calc(100% - 30px)", margin: "10px" }}>
        <MyDataTable
          checkboxSelection={true}
          loading={loading}
          data={responseData}
          columns={columns}
        />
      </div>
    </div>
  );
};

export default R5;
