import React, { useState } from "react";
import "./r.css";
import { useToast } from "../../../hooks/useToast.js";
import { MdOutlineDownloadForOffline } from "react-icons/md";
import { Button, Col, DatePicker, Row } from "antd";
import { downloadCSVCustomColumns } from "../../../Components/exportToCSV";
import { v4 } from "uuid";
import MySelect from "../../../Components/MySelect";
import MyDataTable from "../../../Components/MyDataTable";
import { imsAxios } from "../../../axiosInterceptor";
import MyButton from "../../../Components/MyButton";

const { RangePicker } = DatePicker;

const R14 = () => {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [allData, setAllData] = useState({
    selType: "",
  });
  const [responseData, setResponseData] = useState([]);

  const options = [{ label: "Fetch", value: "fetchStock" }];

  const handleDownloadingCSV = () => {
    let arr = [];
    let csvData = [];
    arr = responseData;
    csvData = arr.map((row) => {
      return {
        Date: row.dt,
        "Part Name": row.name,
        "Part No": row.part,
        Uom: row.uom,
        "IMS Stock": row.cl,
        "Physical Stock": row.rm,
        "Verified By": row.by,
        Remark: row.remark,
      };
    });
    downloadCSVCustomColumns(csvData, "RM Physical Report");
  };

  const columns = [
    { field: "dt", headerName: "Date", width: 150 },
    { field: "name", headerName: "Part Name", width: 380 },
    { field: "part", headerName: "Part No", width: 100 },
    { field: "new_part", headerName: "Cat Part Code", width: 150 },
    { field: "uom", headerName: "UoM", width: 100 },
    {
      field: "cl",
      headerName: "IMS Stock",
      width: 100,
    },
    // { field: "Alt Of", headerName: "Alt Of", width: 100 },
    { field: "rm", headerName: "Physical Stock", width: 200 },
    { field: "by", headerName: "Verified By", width: 200 },
    { field: "remark", headerName: "Remark", width: 220 },
  ];

  const fetch = async () => {
    if (!allData.selType) {
      showToast("Please Select Type", "error");
    } else {
      setLoading(true);
      const response = await imsAxios.post("/audit/fetchAuditReport", {
        type: allData.selType.value,
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
        showToast(response.message, "error");
        setLoading(false);
      }
    }
  };

  return (
    <div style={{ height: "calc(100vh - 170px)",  }}>
      <Row gutter={16} style={{ margin: "5px" }}>
        <>
          <Col span={4}>
            <div>
              <MySelect
                style={{ width: "100%" }}
                placeholder="Please Select Option "
                options={options}
                // value={allData?.selType}
                onChange={(e) =>
                  setAllData((allData) => {
                    return { ...allData, selType: e };
                  })
                }
              />
            </div>
          </Col>

          <Col span={2}>
            <MyButton variant="search" onClick={fetch} type="primary" block>
              Fetch
            </MyButton>
          </Col>

          {responseData.length > 1 ? (
            <Col span={1} offset={17}>
              <Button onClick={handleDownloadingCSV}>
                <MdOutlineDownloadForOffline style={{ fontSize: "20px" }} />
              </Button>
            </Col>
          ) : (
            ""
          )}
        </>
      </Row>

    
        <div className="hide-select" style={{ height: "calc(100vh - 210px)", margin: "10px" }}>
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

export default R14;
