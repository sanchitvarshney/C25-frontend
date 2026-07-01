import { useState, useEffect } from "react";
import { Table } from "antd";
import "./summary.css";
import { useToast } from "../../../hooks/useToast.js";
import { imsAxios } from "../../../axiosInterceptor";
import { downloadCSV } from "../../../Components/exportToCSV";
import MyButton from "../../../Components/MyButton";
// import Spinner from "../Spin/Spinner";

const columns = [
  {
    title: "Month",
    dataIndex: "month",
    key: "month",
    width: 14,
    fixed: "left",
    align: "center",
  },
  {
    title: "GST",
    children: [
      {
        title: "IGST",
        dataIndex: "g_igstSum",
        key: "g_igstSum",
        width: 15,
        align: "center",
      },
      {
        title: "CGST",
        dataIndex: "g_cgstSum",
        key: "g_cgstSum",
        width: 14,

        align: "center",
      },
      {
        title: "SGST",
        dataIndex: "g_sgstSum",
        key: "g_sgstSum",
        width: 14,

        align: "center",
      },
    ],
  },
  {
    title: "Book",
    children: [
      {
        title: "IGST",
        dataIndex: "b_igstSum",
        key: "b_igstSum",
        width: 14,
        align: "center",
      },
      {
        title: "CGST",
        dataIndex: "b_cgstSum",
        key: "b_cgstSum",
        width: 14,
        align: "center",
      },
      {
        title: "SGST",
        dataIndex: "b_sgstSum",
        key: "b_sgstSum",
        width: 14,
        align: "center",
      },
    ],
  },
];

const Summary = () => {
  const { showToast } = useToast();
  const [summaryData, setGstData] = useState([]);
  useEffect(() => {
    getData();
  }, []);

  const getData = async () => {
    try {
      const response = await imsAxios.get(`/summary/getsummary`);
      if (response.status === 200) {
        setGstData(response.data);
      } else {
        showToast("error in getting data!", "error");
      }
    } catch (error) {
      showToast(error, "error");
    }
  };

  return (
    <div style={{height:"100%", padding:10}}>
      <MyButton
      
        onClick={() => downloadCSV(summaryData, columns, "Summary")}
        variant="download"
      >
        Download
      </MyButton>
      <div className="summary-container">
        <>
          <div style={{ height: "100%", marginTop: "10px" }}>
            <Table
              dataSource={summaryData}
              columns={columns}
              bordered={true}
              // itemSizeSM={}
              size="small"
              pagination={false}
            />
          </div>
        </>
      </div>
    </div>
  );
};

export default Summary;
