import { useEffect, useState } from "react";
import AddBilling from "./Modal/AddBilling";
import MyDataTable from "../../Components/MyDataTable";
import { v4 } from "uuid";
import { Row, Space } from "antd";
import { imsAxios } from "../../axiosInterceptor";
import { Button } from "@mui/material";
import { Add } from "@mui/icons-material";

const BillingAddress = () => {
  const [dataa, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  const [ShowAddBillingModal, setShowAddBillingModal] = useState(false);

  const fetchLocation = async () => {
    setLoading(true);
    const response = await imsAxios.get("/billingAddress/getAll");
    setLoading(false);
    if (response.success) {
      let arr = response.data.map((row) => {
        return {
          ...row,
          id: v4(),
        };
      });
      setData(arr);
    }
  };

  const columns = [
    { field: "label", headerName: "Label", flex: 1 },
    { field: "company", headerName: "Company", flex: 1 },
    { field: "state", headerName: "State", flex: 1 },
    { field: "pan", headerName: "PAN No.", flex: 1 },
    { field: "gst", headerName: "GSN", flex: 1 },
    { field: "cin", headerName: "CIN", flex: 1 },
    { field: "insert_dt", headerName: "Register Date", flex: 1 },
  ];

  useEffect(() => {
    fetchLocation();
  }, []);

  return (
    <div style={{ height: "100%", padding: 10 }}>
      <Row justify="end" style={{ paddingBottom: 5 }}>
        <Space>
          <Button
            variant="contained"
            onClick={() => setShowAddBillingModal(true)}
            startIcon={<Add fontSize="small" />}
            sx={{
              textTransform: "none",
              backgroundColor: "#0d9488",
              "&:hover": {
                backgroundColor: "#0f766e",
              },
            }}
          >
            Billing Address
          </Button>
        </Space>
      </Row>
      <div style={{ height: "calc(100% - 60px)", marginTop: 10 }}>
        <MyDataTable loading={loading} data={dataa} columns={columns} />
      </div>

      <AddBilling
        setShowAddBillingModal={setShowAddBillingModal}
        ShowAddBillingModal={ShowAddBillingModal}
        fetchLocation={fetchLocation}
      />
    </div>
  );
};

export default BillingAddress;
