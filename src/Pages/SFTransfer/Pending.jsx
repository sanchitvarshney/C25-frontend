import React from "react";
import { useState, useEffect } from "react";
import { Button, Col, Form, Input, Modal, Row, Space } from "antd";
import MySelect from "../../Components/MySelect";
import MyDatePicker from "../../Components/MyDatePicker";
import ToolTipEllipses from "../../Components/ToolTipEllipses";
import MyDataTable from "../../Components/MyDataTable";
import { imsAxios } from "../../axiosInterceptor";
import { v4 } from "uuid";
import { GridActionsCellItem } from "@mui/x-data-grid";
import { EyeFilled } from "@ant-design/icons";
import SFTransferDrawer from "./SFTransferDrawer";
import MyButton from "../../Components/MyButton";
import { useToast } from "../../hooks/useToast";
function Pending() {
  const { showToast } = useToast();
  const [searchInput, setSearchInput] = useState("");
  const [rows, setRows] = useState([]);
  const [sfTransferModal, setSfTransferModal] = useState(false);
  const [drawerData, setDrawerData] = useState([]);
  const [loading, setLoading] = useState(false);
  const getRows = async () => {
    setLoading(true);
    const response = await imsAxios.post("/sfMin/sfMinTransferList", {
      date: searchInput,
    });
  
    if (response?.success) {
      let arr = response?.data.map((row, index) => {
        return {
          ...row,
          id: index + 1,
        };
      });
      setRows(arr);
      setLoading(false);
    }
    if (!response.success) {
      showToast(response.message?.msg || response.message, "error");
    }
    setLoading(false);
  };
  const columns = [
  
    {
      headerName: "#",
      width: 30,
      field: "id",
    },
    {
      field: "insert_date",
      headerName: "Registeration Date",
      flex: 1,
    },
    {
      field: "insert_by",
      headerName: "Created By",
      flex: 1,
    },

    {
      field: "trans_id",
      headerName: "Transaction Id",
      flex: 1,
    },
    {
      field: "remark",
      headerName: "Remark",
      flex: 1,
    },
    {
      headerName: "Action",
      flex: 1,
      renderCell: ({ row }) => (
        <div>
          <Button
            // icon={<DownloadOutlined />}

            onClick={() => setDrawerData(row)}
            // onClick={() => downloadFunction(row.inv, seoice)}
            type="primary"
          >
            Process
          </Button>
        </div>
      ),
    },
  ];
  return (
    <Row
      style={{
        height: "90%",
        paddingRight: 10,
        paddingLeft: 10,
      }}
    >
      <Col span={24}>
        <Row>
          <Col>
            <div style={{ paddingTop: 10, paddingBottom: 10 }}>
              <Space>
                <MyDatePicker setDateRange={setSearchInput} />

                <MyButton
                  onClick={getRows}
                  loading={loading}
                  type="primary"
                  variant="search"
                >
                  Fetch
                </MyButton>
              </Space>
            </div>
          </Col>
        </Row>
      </Col>
      <Col span={24} style={{ height: "100%" }}>
        <MyDataTable laoding={loading} data={rows} columns={columns} />
      </Col>
      {drawerData && (
        <SFTransferDrawer
          sfTransferModal={sfTransferModal}
          setSfTransferModal={setSfTransferModal}
          setDrawerData={setDrawerData}
          drawerData={drawerData}
        />
      )}

      {/* <ViewModal showView={showView} setShowView={setShowView} />
     
      <FinalizeModal
        getRows={getRows}
        showView={showFinalizeModal}
        setShowView={setShowFinalizeModal}
      /> */}
    </Row>
  );
}

export default Pending;
