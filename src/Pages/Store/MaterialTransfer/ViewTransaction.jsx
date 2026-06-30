import React, { useState } from "react";
import { FaDownload } from "react-icons/fa";
import { useToast } from "../../../hooks/useToast.js";
import { Button, Col, DatePicker, Row, Select, Space } from "antd";
import {
  downloadCSV,
  downloadCSVCustomColumns,
} from "../../../Components/exportToCSV";
import { v4 } from "uuid";
import MyDataTable from "../../../Components/MyDataTable";
import MyDatePicker from "../../../Components/MyDatePicker";
import { imsAxios } from "../../../axiosInterceptor";
import { CommonIcons } from "../../../Components/TableActions.jsx/TableActions";
import MyButton from "../../../Components/MyButton";


function ViewTransaction() {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const options = [{ label: "Date Wise", value: "datewise" }];
  const [allData, setAllData] = useState({
    selectdate: "datewise",
  });
  const [datee, setDatee] = useState("");
  const [dataComesFromDateWise, setDataComesFromDateWise] = useState([]);
  
  const columns = [
    { field: "date", headerName: "Date", width: 150 },
    { field: "part", headerName: "Part Code", width: 150 },
    { field: "cat_part", headerName: "Cat Part Code", width: 150 },
    { field: "name", headerName: "Component", width: 350 },
    { field: "out_location", headerName: "Out Location", width: 150 },
    { field: "in_location", headerName: "In Location", width: 150 },
    {
      field: "qty",
      headerName: "Qty",
      width: 120,
      renderCell: ({ row }) => <span>{`${row?.qty} ${row?.uom}`}</span>,
    },
    { field: "transaction", headerName: "Transaction In", width: 150 },
    { field: "completed_by", headerName: "Shiffed By", width: 150 },
  ];
  const handleDownloadingCSV = () => {
    downloadCSV(dataComesFromDateWise, columns, "View Transaction");
  };

  const dateWise = async (e) => {
    e.preventDefault();
    if (!allData.selectdate) {
      showToast("Please Select Mode Then Proceed Next", "error");
    } else if (!datee[0]) {
      showToast("Please Select Date", "error");
    } else {
      setDataComesFromDateWise([]);
      setLoading(true);

      // console.log("datee->>>", c);

      const response = await imsAxios.post("/godown/report_rmsf_same", {
        data: datee,
        wise: allData.selectdate,
      });
     
      if (response?.success) {
        let arr = response?.data.map((row) => {
          return {
            ...row,
            id: v4(),
          };
        });
        setDataComesFromDateWise(arr);
        setLoading(false);
      } else {
        showToast(response?.message, "error");
        setLoading(false);
      }
    }
  };
  return (
    <div style={{ height: "100%", padding:10 }}>
      <Row gutter={0} justify="space-between" >
        <Space>
          <div style={{ width: 120 }}>
            <Select
              options={options}
              style={{ width: "100%" }}
              placeholder="Select"
              value={allData.selectdate}
              onChange={(e) =>
                setAllData((allData) => {
                  return { ...allData, selectdate: e };
                })
              }
            />
          </div>
          <div style={{ width: 250 }}>
            <MyDatePicker size="default" setDateRange={setDatee} />
          </div>
          <MyButton
            onClick={dateWise}
            loading={loading}
            type="primary"
            variant="search"
          >
            Fetch
          </MyButton>
        </Space>
        <Col className="gutter-row">
          <CommonIcons
            disabled={dataComesFromDateWise.length === 0}
            action="downloadButton"
            onClick={handleDownloadingCSV}
          />
        </Col>
      </Row>
      <div style={{ height: "calc(100% - 40px)", marginTop: 10 }}>
        <MyDataTable
          loading={loading}
          data={dataComesFromDateWise}
          columns={columns}
        />
      </div>
    </div>
  );
}

export default ViewTransaction;
