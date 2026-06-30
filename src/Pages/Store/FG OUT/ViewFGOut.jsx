import React, { useState } from "react";
import { useToast } from "../../../hooks/useToast.js";
import { v4 } from "uuid";
import moment from "moment";
import { Button, Col, DatePicker, Row, Select } from "antd";
import { downloadCSV } from "../../../Components/exportToCSV";
import MyDataTable from "../../../Components/MyDataTable";
import { imsAxios } from "../../../axiosInterceptor";
import SingleDatePicker from "../../../Components/SingleDatePicker";
import MyButton from "../../../Components/MyButton";

const ViewFGOut = () => {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [localVar, setLocalVar] = useState({
    sel: "",
  });
  const [selectDate, setSelectDate] = useState("");
  const opt = [{ label: "Out", value: "O" }];
  const [fetchDataFromDate, setFetchDataFromDate] = useState([]);
  // console.log(fetchDataFromDate);

  const dateWise = async (e) => {
    e.preventDefault();

    if (!localVar.sel) {
      showToast("Please Select Button", "error");
    } else if (!selectDate) {
      showToast("Please Select Date", "error");
    } else {
      setLoading(true);
      const response = await imsAxios.post("/fgout/fetchFgOutRpt", {
        method: localVar.sel,
        date: selectDate,
      });
      if (response?.success) {
        let arr = response.data.map((row) => {
          return {
            ...row,
            id: v4(),
          };
        });
        setFetchDataFromDate(arr);
        setLoading(false);
      } else {
        showToast(response?.message, "error");
        setLoading(false);
      }
    }
  };

  const columns = [
    {
      headerName: "Date",
      field: "approvedate",
      width: 150,
    },
    { field: "sku", headerName: "SKU", width: 150 },
    { field: "name", headerName: "Product", width: 380 },
    { field: "approveqty", headerName: "Out Qty", width: 100 },
    { field: "approveby", headerName: "Out By", width: 320 },
    { field: "fg_type", headerName: "FG TYPE", width: 100 },
  ];



  return (
    <div style={{ height: "100%", padding:10 }}>
      <Row gutter={16}>
        <Col span={4} className="gutter-row">
          <div>
            <Select
              options={opt}
              style={{ width: "100%" }}
              placeholder="Select type"
              value={localVar.sel}
              onChange={(e) =>
                setLocalVar((localVar) => {
                  return { ...localVar, sel: e };
                })
              }
            />
          </div>
        </Col>
        <Col span={4} className="gutter-row">
          <div>
            <SingleDatePicker setDate={setSelectDate} />
            {/* <DatePicker
              style={{
                width: "100%",
              }}
              onChange={(e) => setSelectDate(moment(e).format("DD-MM-YYYY"))}
            /> */}
          </div>
        </Col>
        <Col span={2} className="gutter-row">
          <div>
            <MyButton
              onClick={dateWise}
              type="primary"
              loading={loading}
              variant="search"
            >
              Fetch
            </MyButton>
          </div>
        </Col>
      </Row>
      <div style={{ height: "92%", marginTop: "10px" }}>
        <MyDataTable
          loading={loading}
          data={fetchDataFromDate}
          columns={columns}
        />
      </div>
    </div>
  );
};

export default ViewFGOut;
