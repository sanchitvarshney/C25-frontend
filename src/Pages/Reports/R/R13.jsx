import React, { useState, useEffect } from "react";
import "./r.css";

import axios from "axios";
import {
  downloadCSV,
  downloadCSVCustomColumns,
} from "../../../Components/exportToCSV";

import moment from "moment";
import { Col, DatePicker, Row, Select, Button, Space } from "antd";
import InternalNav from "../../../Components/InternalNav";
import { DownloadOutlined, PlusCircleOutlined } from "@ant-design/icons";
import MyDataTable from "../../../Components/MyDataTable";
import { MdOutlineDownloadForOffline } from "react-icons/md";
import { v4 } from "uuid";
import MyDatePicker from "../../../Components/MyDatePicker";
import { imsAxios } from "../../../axiosInterceptor";
import MyButton from "../../../Components/MyButton";
import { useToast } from "../../../hooks/useToast.js";

const { RangePicker } = DatePicker;

const R13 = () => {
  const { showToast } = useToast();
  const [datee, setDatee] = useState("");
  const [loading, setLoading] = useState(false);
  const [allData, setAllData] = useState({
    selType: "",
  });
  const [responseData, setResponseData] = useState([]);

  const options = [{ label: "Inward", value: "M" }];

  const columns = [
    { field: "DATE", headerName: "Date", width: 150 },
    {
      field: "COMPONENT",
      headerName: "Component",
      width: 380,
    },
    { field: "PART", headerName: "Part No", width: 100 },
    { field: "PART_NEW", headerName: "Cat Part Code", width: 150 },
    { field: "TYPE", headerName: "V Type", width: 100 },
    {
      field: "LOCATION",
      headerName: "Location",
      width: 100,
    },
    { field: "RATE", headerName: "Rate", width: 100 },
    { field: "INQTY", headerName: "In Qty", width: 120 },
    { field: "UNIT", headerName: "UoM", width: 100 },
    {
      field: "VENDOR",
      headerName: "Vendor Name",
      width: 220,
    },
    { field: "PONUMBER", headerName: "Po No", width: 140 },
    {
      field: "INVOIVENUMBER",
      headerName: "Inv Doc",
      width: 150,
    },
    {
      field: "TRANSACTION",
      headerName: "Transaction Code",
      width: 150,
    },
    {
      field: "ISSUEBY",
      headerName: "Added By",
      width: 140,
    },
    { field: "COMMENT", headerName: "Comment", width: 150 },
    { field: "PROJECT", headerName: "Project", width: 150 },
  ];

  const handleDownloadingCSV = () => {
    let arr = [];
    let csvData = [];
    arr = responseData;
    csvData = arr.map((row) => {
      return {
        Date: row.DATE,
        Component: row.COMPONENT,
        "Part No": row.PART,
        "Vendor Type": row.TYPE,
        Location: row.LOCATION,
        Rate: row.RATE,
        "In Qty": row.INQTY,
        Uom: row.UNIT,
        "Vendor Name": row.VENDOR,
        "Po No": row.PONUMBER,
        "Inv Doc": row.INVOIVENUMBER,
        "Transaction Code": row.TRANSACTION,
        "Added By": row.ISSUEBY,
        Comment: row.COMMENT,
        Project: row.PROJECT,
      };
    });
    downloadCSVCustomColumns(csvData, "Custome MIN Report");
  };

  const fetch = async () => {
    if (!allData.selType) {
      showToast("Please Select Type", "error");
    } else if (!datee[0]) {
      showToast("Please Select Date First", "error");
    } else {
      setLoading(true);
      setResponseData([]);
      const response = await imsAxios.post("/transaction/transactionIn", {
        data: datee,
        min_types: allData?.selType,
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
        showToast(response.message?.msg || response.message, "error");
        setLoading(false);
      }
    }
  };

  return (
    <div style={{ height: "calc(100vh - 170px)",  }}>
      <Row gutter={16} style={{ margin: "5px" }}>
        <Col span={2} className="gutter-row">
          <Select
            placeholder="Please Select Option "
            options={options}
            style={{
              width: "100%",
            }}
            // value={allData?.selType}
            onChange={(e) =>
              setAllData((allData) => {
                return { ...allData, selType: e };
              })
            }
          />
        </Col>
        <Col span={4}>
          <MyDatePicker setDateRange={setDatee} size="default" />
        </Col>
        <Col span={1} className="gutter-row">
          <MyButton variant="search" type="primary" onClick={fetch}>
            Fetch
          </MyButton>
        </Col>
        {responseData.length > 1 && (
          <Col span={1} offset={16}>
            <Button onClick={handleDownloadingCSV}>
              <MdOutlineDownloadForOffline style={{ fontSize: "20px" }} />
            </Button>
          </Col>
        )}
      </Row>

      <div className="hide-select" style={{ height: "calc(100% - 40px)", margin: "10px" }}>
        <MyDataTable
          loading={loading}
          data={responseData}
          columns={columns}
          checkboxSelection={true}
        />
      </div>
    </div>
  );
};

export default R13;
