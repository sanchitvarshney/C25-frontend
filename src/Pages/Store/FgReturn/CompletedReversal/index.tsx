import { useState } from "react";
import {  Col, Form,  Row, } from "antd";
//@ts-ignore
import MyButton from "../../../../Components/MyButton";
//@ts-ignore
import MyDatePicker from "../../../../Components/MyDatePicker";
//@ts-ignore
import { CommonIcons } from "../../../../Components/TableActions.jsx/TableActions";
//@ts-ignore
import useApi from "../../../../hooks/useApi";
//@ts-ignore
import MyDataTable from "../../../../Components/MyDataTable";
import { getCompletedReturns } from "../../../../api/store/fgReturn";
//@ts-ignore
import ToolTipEllipses from "../../../../Components/ToolTipEllipses";
//@ts-ignore
import { downloadCSV, exportCSVFile } from "../../../../Components/exportToCSV";

const CompletedFgReturn = () => {
  const [rows, setRows] = useState([]);
  const [form] = Form.useForm();
  const { executeFun, loading } = useApi();
  const [isValid, setIsValid] = useState(false);

  const handleFetchRows = async () => {
    const values = await form.validateFields();
   if(!values.date) {
    setIsValid(true);
    return
   };

    setIsValid(false);
      const response = await executeFun(
        () => getCompletedReturns(values.date),
        "fetch"
      );
      setRows(response.data);
  
  };

  const handleDownload = () => [
    downloadCSV(rows, columns, "Completed FG Return Report"),
  ];
  return (
    <Row style={{ height: "100%", padding: 10 }} gutter={[12, 10]}>
   <Col span={12}>
  <Form form={form}>
    <Row gutter={10} align="middle">

      {/* Date Range */}
      <Col span={14}>
        <Form.Item
          name="date"
          label="Period"
          style={{ marginBottom: 0 }}
        >
          <MyDatePicker
            setDateRange={(value:any) =>
              form.setFieldValue("date", value)
            }
                showError={isValid}
            value={form.getFieldValue("date")}
          />
        </Form.Item>
      </Col>

      {/* Download Button */}
      <Col>
        <CommonIcons
          onClick={handleDownload}
          action="downloadButton"
        />
      </Col>

      {/* Fetch Button */}
      <Col>
        <MyButton
          onClick={handleFetchRows}
          variant="search"
          text="fetch"
          loading={loading("fetch")}
        />
      </Col>

    </Row>
  </Form>
</Col>
      <Col span={24} style={{ height: "calc(100% - 40px)", overflowY: "auto" }}>
        <MyDataTable columns={columns} data={rows} loading={loading("fetch")} />
      </Col>
    </Row>
  );
};

export default CompletedFgReturn;

const columns = [
  {
    headerName: "#",
    field: "id",
    width: 30,
  },
  {
    headerName: "Date",
    field: "date",
    width: 120,
  },
  {
    headerName: "Trans. Id",
    field: "transactionId",
    width: 150,
    renderCell: ({ row }:any) => (
      <ToolTipEllipses text={row.transactionId} copy={true} />
    ),
  },
  {
    headerName: "SKU",
    field: "sku",
    width: 150,
    renderCell: ({ row }:any) => <ToolTipEllipses text={row.sku} copy={true} />,
  },
  {
    headerName: "Product",
    field: "product",
    minWidth: 150,
    flex: 1,
  },
  {
    headerName: "In Qty",
    field: "inQty",
    width: 150,
  },
  {
    headerName: "Exec. Qty",
    field: "executedQty",
    width: 150,
  },
  {
    headerName: "Exec. By",
    field: "executedBy",
    width: 150,
  },
];
