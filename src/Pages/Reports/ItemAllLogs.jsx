//updated code
import { useState } from "react";
import { Button, Card, Col, Form, Row, Space, Pagination } from "antd"; // CHANGE: Added Pagination
import ToolTipEllipses from "../../Components/ToolTipEllipses";
import { imsAxios } from "../../axiosInterceptor";
import MyAsyncSelect from "../../Components/MyAsyncSelect";
import MyDataTable from "../../Components/MyDataTable";
import { v4 } from "uuid";
import SummaryCard from "../../Components/SummaryCard";
import { CommonIcons } from "../../Components/TableActions.jsx/TableActions";
import { downloadCSV } from "../../Components/exportToCSV";
// CHANGE: Removed MyDatePicker import as date range is no longer needed
// import MyDatePicker from "../../Components/MyDatePicker";
import { FileImageOutlined } from "@ant-design/icons";
import ComponentImages from "../Master/Components/material/ComponentImages";
import useApi from "../../hooks/useApi.ts";
import { getComponentOptions } from "../../api/general.ts";
import MyButton from "../../Components/MyButton";
import { useToast } from "../../hooks/useToast.js";

export default function ItemAllLogs() {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState([]);
  const [asyncOptions, setAsyncOptions] = useState([]);
  const [summaryData, setSummaryData] = useState([
    { title: "Component", description: "" },
    // { title: "Closing Stock", description: "" },
    { title: "Last In (Date)", description: "" },
    { title: "Last Rate", description: "" },
  ]);
  const [showImages, setShowImages] = useState(false);
  const { executeFun, loading: loading1 } = useApi();

  // CHANGE: Added pagination state variables
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);
  const [totalRecords, setTotalRecords] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  // initializing search form
  const [searchForm] = Form.useForm();
  const selectedComonents = Form.useWatch("component", searchForm);

  //getting components options
  const getComponentOption = async (search) => {
    const response = await executeFun(
      () => getComponentOptions(search),
      "select"
    );
    const { data, success, message } = response;
    if (success) {
      getData(data);
    } else {
      showToast(message, "error");
    }
  };

  const getData = (response) => {
   
    if (response?.length > 0) {
      const arr = response?.map((row) => ({
        text: row.text,
        value: row.id,
      }));

      setAsyncOptions(arr);
    }
  };

  // CHANGE: Updated getRows function to accept page and limit parameters
  const getRows = async (values, page = 1, limit = pageSize) => {
    setLoading("fetch");
    setSummaryData([
      { title: "Component", description: "" },
      // { title: "Closing Stock", description: "" },
      { title: "Last In (Date)", description: "" },
      { title: "Last Rate", description: "" },
    ]);
    setRows([]);

    const response = await imsAxios.get("/q1/view", {
      params: {
        wise: "C",
        data: values.component,
        page: page,
        limit: limit,
      },
    });

    setLoading(false);
    if (response.success) {
      const body = response?.data?.body ?? [];
      const arr = body.map((row) => ({
        index: row.serial_no,
        id: v4(),
        ...row,
      }));
      setRows(arr);

      const pagination = response?.data?.pagination;
      if (pagination) {
        setCurrentPage(pagination.currentPage ?? page);
        setTotalRecords(pagination.totalRecords ?? 0);
        setTotalPages(pagination.totalPages ?? 0);
      }
      setSummaryData([
        { title: "Component", description: response.data.header.partName },
        { title: "Part Code", description: response.data.header.partCode },
        { title: "Unique Id", description: response.data.header.uniqueID },
        // {
        //   title: "Closing",
        //   description:
        //     response.response.data1.closingqty + " " + response.response.data1.uom,
        // },
        {
          title: "Last In (Date)",
          description: response.data.header.lastIN ?? "--",
        },
        { title: "Last Rate", description: response.data.header.lastRate },
      ]);
    }else {
      showToast(response.message, "error");
    }
  };

  const handlePageChange = (page, size) => {
    const values = searchForm.getFieldsValue();
    if (!values?.component) return;
    setPageSize(size);
    getRows(values, page, size);
  };

  // CHANGE: Added function to handle initial form submission
  const handleFormSubmit = (values) => {
    setCurrentPage(1);
    setTotalRecords(0);
    setTotalPages(0);
    getRows(values, 1, pageSize);
  };

  // columns
  let columns = [
    {
      headerName: "#",
      field: "index",
      width: 80,
    },
    {
      headerName: "Date",
      field: "transactionDate",
      width: 120,
      renderCell: ({ row }) => <ToolTipEllipses text={row.transactionDate} />,
    },
    {
      headerName: "Type",
      field: "transactionType",
      width: 30,
      renderCell: ({ row }) => (
        <div
          style={{
            height: "15px",
            width: "15px",
            borderRadius: "50px",
            backgroundColor:
              row.transactionType=== "CONSUMPTION"
                ? "#678983"
                : row.transactionType === "INWARD"
                ? "#59CE8F"
                : row.transactionType === "TRANSFER"
                ? "#FFB100"
                : row.transactionType === "ISSUE"
                ? "#DD5353"
                : row.transactionType === "JOBWORK"
                ? "#DD5353"
                 : row.transactionType === "CONVERSION"
                ? "#ff9bb9"
                : row.transactionType === "CANCELLED" && "#36454F",
          }}
        />
      ),
    },
    {
      headerName: "Transaction",
      field: "transactionID",
      width: 150,
      renderCell: ({ row }) => (
        <ToolTipEllipses text={row.transactionID} copy={true} />
      ),
    },
    {
      headerName: "Qty In",
      field: "qtyIn",
      width: 120,
    },
    {
      headerName: "Qty Out",
      field: "qtyOut",
      width: 120,
    },
    {
      headerName: "Rate",
      field: "rate",
      width: 120,
    },
    {
      field: "tbl_weighted_rate",
      headerName: "Weighted Average Rate",
      width: 180,
    },
    {
      headerName: "Method",
      field: "transactionMode",
      width: 120,
    },
    {
      headerName: "Loc In",
      field: "locationIn",
      width: 120,
    },
    {
      headerName: "Loc Out",
      field: "locationOut",
      width: 120,
    },
    {
      headerName: "Vendor Type",
      field: "vendorType",
      width: 120,
    },
    {
      headerName: "Vendor",
      field: "vendorName",
      minWidth: 150,
      flex: 1,
      renderCell: ({ row }) => <ToolTipEllipses text={row.vendorName} />,
    },
    {
      headerName: "Vendor Code",
      field: "vendorCode",
      minWidth: 120,
      renderCell: ({ row }) => (
        <ToolTipEllipses text={row.vendorCode} copy={true} />
      ),
    },
    {
      headerName: "Created/Approved By",
      field: "transactionBy",
      minWidth: 150,
      renderCell: ({ row }) => <ToolTipEllipses text={row.transactionBy} />,
    },
  ];

  return (
    <Row gutter={12} style={{ padding: "10px", height: "100%" }}>
      <ComponentImages setShowImages={setShowImages} showImages={showImages} />
      <Col span={6} style={{ height: "100%", overflowY: "auto" }}>
        <Row gutter={[0, 6]}>
          <Col span={24}>
            <Card size="small">
              {/* CHANGE: Updated Form onFinish to use new handler */}
              <Form
                onFinish={handleFormSubmit}
                form={searchForm}
                initialValues={initialValues}
                layout="vertical"
              >
                <Row>
                  <Col span={24}>
                    <Form.Item
                      label="Component"
                      rules={rules.component}
                      name="component"
                    >
                      <MyAsyncSelect
                        onBlur={() => setAsyncOptions([])}
                        loadOptions={getComponentOption}
                        optionsState={asyncOptions}
                        selectLoading={loading1("select")}
                      />
                    </Form.Item>
                  </Col>

                  {/* CHANGE: Removed Date Range Field */}
                  {/* <Col span={24}>
                    <Form.Item
                      label="Date Range"
                      rules={rules.date}
                      name="date"
                    >
                      <MyDatePicker
                        setDateRange={(value) =>
                          searchForm.setFieldValue("date", value)
                        }
                        size="default"
                      />
                    </Form.Item>
                  </Col> */}

                  <Col span={24}>
                    <Row gutter={6}>
                      <Space>
                        <MyButton
                          variant="search"
                          loading={loading === "fetch"}
                          block
                          htmlType="submit"
                          type="primary"
                        >
                          Fetch
                        </MyButton>

                        <CommonIcons
                          disabled={rows.length === 0}
                          onClick={() =>
                            downloadCSV(rows, columns, "Item Location Log")
                          }
                          action="downloadButton"
                        />
                        <Button
                          type="primary"
                          shape="circle"
                          disabled={!selectedComonents}
                          icon={<FileImageOutlined />}
                          onClick={() => {
                            setShowImages({
                              partNumber: selectedComonents,
                            });
                          }}
                        />
                      </Space>
                    </Row>
                  </Col>
                </Row>
              </Form>
            </Card>
          </Col>
          <Col span={24}>
            <SummaryCard
              title="Component Stock"
              loading={loading === "fetch"}
              summary={summaryData}
            />
          </Col>
        </Row>
      </Col>
      <Col span={18}>
        {/* CHANGE: Wrapped MyDataTable with pagination */}
        <div
          style={{ height: "100%", display: "flex", flexDirection: "column" }}
        >
          <div
            className="remove-table-footer"
            style={{ flex: 1, minHeight: 0 }}
          >
            <MyDataTable
              loading={loading === "fetch"}
              data={rows}
              columns={columns}
              pagination={false}
            />
          </div>
          {totalRecords > 0 && (
            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                padding: "8px 0",
                flexShrink: 0,
              }}
            >
              <Pagination
                current={currentPage}
                pageSize={pageSize}
                total={totalRecords}
                showSizeChanger
                pageSizeOptions={[25, 50, 100]}
                showTotal={(total, range) =>
                  `${range[0]}-${range[1]} of ${total} records`
                }
                onChange={handlePageChange}
              />
            </div>
          )}
        </div>
      </Col>
    </Row>
  );
}

// initial form values
const initialValues = {
  component: "",
  // date: "", // CHANGE: Removed date from initial values
};

// form rules
const rules = {
  component: [{ required: true, message: "Please select a component" }],
  // date: [{ required: true, message: "Please select a date range" }], // CHANGE: Removed date validation
};
