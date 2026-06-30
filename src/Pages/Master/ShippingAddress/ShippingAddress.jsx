import { Col, Row } from "antd";
import { useEffect, useState } from "react";
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
    { headerName: "Label", field: "label", flex: 1 },
    { headerName: "Company", field: "company", flex: 1 },
    { headerName: "State", field: "state", flex: 1 },
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
    <div style={{ height: "100%", padding: "10px" }}>
      <Row gutter={12} style={{ height: "100%" }}>
        <Col span={6}>
          <AddShippingAddress
            getRows={getRows}
            handleCSVDownload={handleCSVDownload}
          />
        </Col>
        <Col span={18}>
          <MyDataTable
            loading={loading === "fetch"}
            columns={columns}
            rows={rows}
          />
        </Col>
      </Row>
    </div>
  );
}

export default ShippingAddress;
