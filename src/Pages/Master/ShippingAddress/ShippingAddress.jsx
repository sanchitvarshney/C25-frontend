import { Row, Space } from "antd";
import { useEffect, useState } from "react";
import { Button } from "@mui/material";
import { Add } from "@mui/icons-material";
import { useToast } from "../../../hooks/useToast.js";
import { imsAxios } from "../../../axiosInterceptor";
import { downloadCSV } from "../../../Components/exportToCSV";
import MyDataTable from "../../../Components/MyDataTable";
import { CommonIcons } from "../../../Components/TableActions.jsx/TableActions";
import AddShippingAddress from "./AddShippingAddress.";

function ShippingAddress() {
  const { showToast } = useToast();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAddShippingModal, setShowAddShippingModal] = useState(false);

  const getRows = async () => {
    setLoading("fetch");
    const response = await imsAxios.get("/shippingAddress/getAll");
    setLoading(false);
    if (response.success) {
      let arr = response.data.map((row, index) => ({
        id: index,
        index: index + 1,
        ...row,
      }));
      setRows(arr);
    } else {
      setRows([]);
      showToast(response.message, "error");
    }
  };
  const columns = [
    { headerName: "Sr. No.", field: "index", width: 80 },
    { headerName: "Label", field: "label", flex: 1, width: 150 },
    { headerName: "Company", field: "company", flex: 1, width: 250 },
    { headerName: "State", field: "state", flex: 1, width: 150 },
    { headerName: "Pan No.", field: "pan", width: 150 },
    { headerName: "GST", field: "gst", width: 150 },
  ];
  const handleCSVDownload = () => {
    downloadCSV(rows, columns, "Shipping Address Report");
  };
  useEffect(() => {
    getRows();
  }, []);
  return (
    <div style={{ height: "100%", padding: 10 }}>
      <Row justify="end" style={{ paddingBottom: 5 }}>
        <Space>
          <Button
            variant="contained"
            onClick={() => setShowAddShippingModal(true)}
            startIcon={<Add fontSize="small" />}
            sx={{
              textTransform: "none",
              backgroundColor: "#0d9488",
              "&:hover": {
                backgroundColor: "#0f766e",
              },
            }}
          >
            Shipping Address
          </Button>
          <CommonIcons action="downloadButton" onClick={handleCSVDownload} />
        </Space>
      </Row>
      <div style={{ height: "calc(100% - 60px)", marginTop: 10 }}>
        <MyDataTable
          loading={loading === "fetch"}
          columns={columns}
          rows={rows}
        />
      </div>

      <AddShippingAddress
        open={showAddShippingModal}
        onClose={() => setShowAddShippingModal(false)}
        getRows={getRows}
      />
    </div>
  );
}

export default ShippingAddress;
