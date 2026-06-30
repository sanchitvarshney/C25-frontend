import React, { useEffect, useState } from "react";
import MyDataTable from "../../../../Components/MyDataTable";
import { Card, Col, Form, Input, Row, Space } from "antd";
import MyDatePicker from "../../../../Components/MyDatePicker";
import MyButton from "../../../../Components/MyButton";
import { imsAxios } from "../../../../axiosInterceptor";
import MySelect from "../../../../Components/MySelect";
import ToolTipEllipses from "../../../../Components/ToolTipEllipses";
import TableActions from "../../../../Components/TableActions.jsx/TableActions";
import ExecutePPR from "./ExecutePPR";
import useApi from "../../../../hooks/useApi";
import { getProductsOptions } from "../../../../api/general.ts";
import MyAsyncSelect from "../../../../Components/MyAsyncSelect";
import { getPendingReturns } from "../../../../api/store/fgReturn";

const wiseOptions = [
  { value: "datewise", text: "Date Wise" },
  { value: "skuwise", text: "SKU Wise" },
];

function PendingReversal() {
  const [rows, setRows] = useState([]);
  const [executePPR, setExecutePPR] = useState([]);
  const [asyncOptions, setAsyncOptions] = useState([]);

  const [form] = Form.useForm();
  const { executeFun, loading } = useApi();

  const wise = Form.useWatch("wise", form);

  const handleFetchProductOptions = async (search) => {
    const response = await executeFun(
      () => getProductsOptions(search),
      "select"
    );

    setAsyncOptions(response?.data);
  };

  const getRows = async () => {
    const values = await form.validateFields();
    const response = await executeFun(
      () => getPendingReturns(values.data, values.wise),
      "fetch"
    );

    setRows(response.data);
  };
  const getExecuteDetails = async (row) => {

    const response = await imsAxios.post("/fg_return/fetchComponentDetails", {
      product_id: row.productKey,
      fg_return_txn: row.transactionId,
    });

    if (response.success) {
      
      setExecutePPR(row);
    }
  };

  const actionColumns = [
    {
      headerName: "",
      button: true,
      field: "action",
      type: "actions",
      width: 30,
      // minWidth: "20%",
      getActions: ({ row }) => [
        <TableActions
          showInMenu={true}
          action="check"
          onClick={() => {
            getExecuteDetails(row);
          }}
          label="Execute"
        />,
      ],
      // style: { backgroundColor: "transparent" },
    },
  ];

  useEffect(() => {
    if (wise === "skuwise") {
      form.setFieldValue("data", "");
    }
  }, [wise]);

  return (
    <Row gutter={[12, 6]} style={{ height: "100%", padding: 10 }}>
      <ExecutePPR
        getRows={getRows}
        editPPR={executePPR}
        setEditPPR={setExecutePPR}
      />
  <Col span={16}>
  <Form form={form} initialValues={initialValues}>
    <Row gutter={10} align="middle">

      {/* Wise Select */}
      <Col span={8}>
        <Form.Item
          name="wise"
          label="Select Wise"
          style={{ marginBottom: 0 }}
        >
          <MySelect options={wiseOptions} />
        </Form.Item>
      </Col>

      {/* Product / Date */}
      <Col span={10}>
        <Form.Item
          name="data"
          label={wise === "skuwise" ? "Select Product" : "Select Date"}
          style={{ marginBottom: 0 }}
        >
          {wise === "skuwise" ? (
            <MyAsyncSelect
              loadOptions={handleFetchProductOptions}
              selectLoading={loading("select")}
              optionsState={asyncOptions}
              onBlur={() => setAsyncOptions([])}
            />
          ) : (
            <MyDatePicker
              setDateRange={(value) =>
                form.setFieldValue("data", value)
              }
            />
          )}
        </Form.Item>
      </Col>

      {/* Button */}
      <Col span={6}>
        <MyButton
          loading={loading("fetch")}
          onClick={getRows}
          variant="search"
          text="Fetch"
        />
      </Col>

    </Row>
  </Form>
</Col>
      <Col span={24} style={{ height: "calc(100% - 50px)", overflowY: "auto" }}>
        <MyDataTable
          loading={loading("fetch")}
          data={rows}
          columns={[...actionColumns, ...columns]}
        />
      </Col>
    </Row>
  );
}

export default PendingReversal;

const initialValues = {
  wise: "datewise",
  data: undefined,
};

const columns = [
  {
    headerName: "#",
    field: "id",
    width: 30,
  },

  {
    headerName: "SKU",
    field: "sku",
    renderCell: ({ row }) => <ToolTipEllipses text={row.sku} />,
    width: 100,
  },
  {
    headerName: "Product",
    field: "name",
    renderCell: ({ row }) => <ToolTipEllipses text={row.name} />,
    minWidth: 200,
    flex: 1,
  },

  {
    headerName: "Inserted By",
    field: "insertedBy",
    renderCell: ({ row }) => <ToolTipEllipses text={row.insertedBy} />,
    width: 100,
  },
  {
    headerName: "Insert Date",
    field: "insertedDate",
    renderCell: ({ row }) => <ToolTipEllipses text={row.insertedDate} />,
    width: 150,
  },
  {
    headerName: "Location In",
    field: "inLocation",
    renderCell: ({ row }) => <ToolTipEllipses text={row.inLocation} />,
    width: 100,
  },

  {
    headerName: "UoM",
    field: "uom",
    renderCell: ({ row }) => <ToolTipEllipses text={row.uom} />,
    width: 100,
  },
  {
    headerName: "Return Qty",
    field: "returnQty",
    renderCell: ({ row }) => <ToolTipEllipses text={row.returnQty} />,
    width: 80,
  },
  {
    headerName: "Exec. Qty",
    field: "executedQty",
    renderCell: ({ row }) => <ToolTipEllipses text={row.executedQty} />,
    width: 80,
  },
  {
    headerName: "Rem. Qty",
    field: "remainingQty",
    renderCell: ({ row }) => <ToolTipEllipses text={row.remainingQty} />,
    width: 80,
  },

  {
    headerName: "Status",
    field: "status",
    renderCell: ({ row }) => <ToolTipEllipses text={row.status} />,
    width: 100,
  },
  {
    headerName: "Remark",
    field: "remarks",
    renderCell: ({ row }) => <ToolTipEllipses text={row.remarks} />,
    minWidth: 200,
    flex: 1,
  },
];
