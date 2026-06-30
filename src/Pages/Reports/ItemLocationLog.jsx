import { useState } from "react";
import {
  Tooltip,
  Card,
  Col,
  Collapse,
  Divider,
  Form,
  Pagination,
  Row,
  Typography,
} from "antd";
import ToolTipEllipses from "../../Components/ToolTipEllipses";
import { imsAxios } from "../../axiosInterceptor";
import MyAsyncSelect from "../../Components/MyAsyncSelect";
import MyDataTable from "../../Components/MyDataTable";
import { v4 } from "uuid";
import SummaryCard from "../../Components/SummaryCard";
import { CommonIcons } from "../../Components/TableActions.jsx/TableActions";
import { downloadCSV } from "../../Components/exportToCSV";
import { getComponentOptions } from "../../api/general.ts";
import useApi from "../../hooks/useApi.ts";
import MyButton from "../../Components/MyButton";
import { useToast } from "../../hooks/useToast.js";
const initialSummaryData = [
  { title: "Component", description: "--" },
  { title: "Part Code", description: "--" },
  // { title: "Opening", description: "--" },
  {
    title: "Closing",
    description: "--",
  },
  {
    title: "Last In (Date)",
    description: "--",
  },
  { title: "Last Rate", description: "--" },
  { title: "Last Vendor", description: "--" },
  { title: "Last Entry By", description: "--" },
  { title: "Last Entry Date", description: "--" },
  { title: "Last Remark", description: "--" },
];

export default function ItemLocationLog() {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState([]);
  const [bomDetails, setBomDetails] = useState([]);
  const [altDetails, setAltDetails] = useState([]);
  const [asyncOptions, setAsyncOptions] = useState([]);
  const [summaryData, setSummaryData] = useState(initialSummaryData);
  const { executeFun, loading: loading1 } = useApi();
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);
  const [totalRecords, setTotalRecords] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  // initializing searh form
  const [searchForm] = Form.useForm();

  //getting components options
  const getComponentOption = async (search) => {
    const response = await executeFun(
      () => getComponentOptions(search),
      "select",
    );

    getData(response);
  };

  // getting location options
  const getLocatonOptions = async (search) => {
    setLoading("select");
    const response = await imsAxios.post("/backend/fetchLocation", {
      searchTerm: search,
    });
    getData(response);
  };

  // getting data from response for setting async options for async select
  const getData = (response) => {
    const { data, success, message, massage } = response;
    if (success) {
      const arr = data.map((row) => ({
        text: row.text,
        value: row.id,
      }));

      setAsyncOptions(arr);
    } else {
      showToast(message ?? massage, "error");
    }
  };
  const getDetails = async (values) => {
    setLoading(true);
    const response = await imsAxios.post("/report/common/altpartDetails", {
      component: values.component,
      location: values.location,
    });
    if (response.success) {
      setAltDetails(response.data);
      setLoading(false);
    }
    setLoading(false);
  };
  // getting rows
  const getRows = async (values, page = 1, limit = pageSize) => {
    try {
      setLoading("fetch");
      setSummaryData(initialSummaryData);
      setRows([]);

      const response = await imsAxios.get("/q2/view", {
        params: {
          location: values.location,
          key: values.component,
          page,
          limit,
        },
      });

      getDetails(values);
      if (response?.success == false) {
        showToast(response?.message, "error");
        setLoading(false);
        return;
      }

        if (response.success) {
          const bomDetails = response?.data?.header?.bomDetails;
          const header = response.data.header;
          const arr = response.data.body.map((row) => ({
            index: row.serial_no,
            id: v4(),
            qty_in_rate: row.qty_in_rate ?? "-",
            weightedPurchaseRate: row.weightedPurchaseRate ?? "-",
            weightedPurchaseRateCurrency:
              row.weightedPurchaseRateCurrency ?? "-",
            ...row,
          }));
          let bomDetailsArr = [];
          for (const key in bomDetails) {
            let obj = {
              sku: key,
              bom: bomDetails[key].map((row) => ({
                name: row.bom_name,
                qty: row.bom_qty,
              })),
              product: bomDetails[key].map((row) => row.product),
            };
            bomDetailsArr = [...bomDetailsArr, obj];
          }
          setBomDetails(bomDetailsArr);
          setRows(arr);

          const pagination = response?.pagination;
          if (pagination) {
            setCurrentPage(pagination.currentPage ?? page);
            setTotalRecords(pagination.totalRecords ?? 0);
            setTotalPages(pagination.totalPages ?? 0);
          }

          setSummaryData([
            { title: "Component", description: header?.partName ?? "--" },
            { title: "Part Code", description: header?.partNo ?? "--" },
            { title: "Attribute Code", description: header?.uniqueID ?? "--" },
            { title: "MFG Code", description: header?.mfgCode ?? "--" },
            // {
            //   title: "Opening",
            //   description: (header?.openingBalance ?? 0) + " " + (header?.uom ?? ""),
            // },
            {
              title: "Closing",
              description:
                (header?.closingqty ?? 0) + " " + (header?.uom ?? ""),
            },
            {
              title: "Last In (Date)",
              description: header?.lastInDate ?? "--",
            },
            { title: "Last Rate", description: header?.lastRate ?? "--" },
            { title: "Last Vendor", description: header?.lastVendor ?? "--" },
            { title: "Last Entry By", description: header?.lastEntryBy ?? header?.lastPhysicalEntryBy ?? "--" },
            { title: "Last Entry Date", description: header?.lastEntryDate ?? header?.lastPhysicalEntryDt ?? "--" },
            { title: "Last Remark", description: header?.lastRemark ?? "--" },
          ]);
        } else {
          setBomDetails([]);
          setRows([]);
          setSummaryData(initialSummaryData);
        }
    
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (page, size) => {
    const values = searchForm.getFieldsValue();
    if (!values?.component || !values?.location) return;
    setPageSize(size);
    getRows(values, page, size);
  };

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
      width: 30,
    },
    {
      headerName: "Date",
      field: "transactionDate",
      width: 150,
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
              row.transactionType === "CONSUMPTION"
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
      width: 200,
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
      headerName: "Qty In Rate",
      field: "qtyInRate",
      width: 120,
    },
    {
      headerName: "Out Rate",
      field: "outRate",
      width: 120,
    },
    {
      headerName: "Weighted Average Rate",
      field: "tbl_weighted_rate",
      width: 120,
      // renderCell: ({ row }) => (
      //   <Tooltip title={row.weightedPurchaseRateCurrency}>
      //     {row.weightedPurchaseRate}
      //   </Tooltip>
      // ),
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
      headerName: "Doc Type",
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
    {
      headerName: "Remark",
      field: "remark",
      width: 200,
    },
  ];

  return (
    <Row gutter={6} style={{ padding: "10px", height: "100%" }}>
      <Col span={6} style={{ height: "100%", overflowY: "auto" }}>
        <Row gutter={[0, 6]}>
          <Col span={24}>
            <Card size="small">
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
                  <Col span={24}>
                    <Form.Item
                      label="Location"
                      rules={rules.location}
                      name="location"
                    >
                      <MyAsyncSelect
                        onBlur={() => setAsyncOptions([])}
                        loadOptions={getLocatonOptions}
                        optionsState={asyncOptions}
                        // selectLoading={loading === "select"}
                      />
                    </Form.Item>
                  </Col>
                  <Col span={24}>
                    <Row gutter={6}>
                      <Col span={12}>
                        <MyButton
                          variant="search"
                          loading={loading === "fetch"}
                          htmlType="submit"
                          block
                          type="primary"
                        >
                          Fetch
                        </MyButton>
                      </Col>
                      <Col span={12}>
                        <CommonIcons
                          disabled={rows.length === 0}
                          onClick={() =>
                            downloadCSV(rows, columns, "Item Location Log")
                          }
                          action="downloadButton"
                        />
                      </Col>
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
          <Col style={{ height: "100%", overflow: "auto" }} span={24}>
            <Card title="BOM Details" size="small">
              <Collapse>
                {bomDetails.map((row) => (
                  <Collapse.Panel
                    header={`${row.product} | ${row.sku} | BOM Count : ${row.bom.length}`}
                    key={row.key}
                  >
                    {row.bom?.length === 0 && (
                      <Row key={row.name} justify="space-between">
                        <Col>
                          <Typography.Text
                            style={{ fontSize: "0.8rem" }}
                            type="secondary"
                          >
                            No BOM found for this SKU
                          </Typography.Text>
                        </Col>
                      </Row>
                    )}
                    {row.bom?.length &&
                      row.bom?.map((bom) => (
                        <Row key={row.name} justify="space-between">
                          <Col>
                            <Typography.Text
                              style={{ fontSize: "0.8rem" }}
                              strong
                            >
                              BOM: {bom.name}
                            </Typography.Text>
                          </Col>
                          <Col>
                            <Typography.Text
                              style={{ fontSize: "0.8rem" }}
                              strong
                            >
                              Qty: {bom.qty}
                            </Typography.Text>
                          </Col>
                          <Divider style={{ margin: 5 }} />
                        </Row>
                      ))}
                  </Collapse.Panel>
                ))}
              </Collapse>
            </Card>
            <Card
              title="Similar Components"
              size="small"
              style={{ marginTop: 6 }}
            >
              <Collapse loading={loading}>
                {altDetails.map((row) => (
                  <Collapse.Panel
                    header={`${row.partName} `}
                    key={row.partName}
                  >
                    <Row key={row.partName} justify="space-between">
                      <Col>
                        <Typography.Text style={{ fontSize: "0.8rem" }} strong>
                          Part: {row.partNo}
                        </Typography.Text>
                      </Col>
                      <Col>
                        <Typography.Text style={{ fontSize: "0.8rem" }} strong>
                          Cat Part: {row.newPartNo}
                        </Typography.Text>
                      </Col>
                      <Col>
                        <Typography.Text style={{ fontSize: "0.8rem" }} strong>
                          Closing: {row.closingQty + " " + row.uom}
                        </Typography.Text>
                      </Col>
                      <Divider style={{ margin: 5 }} />
                    </Row>
                  </Collapse.Panel>
                ))}
              </Collapse>
            </Card>
          </Col>
        </Row>
      </Col>
      <Col span={18}>
        <div
          style={{ height: "100%", display: "flex", flexDirection: "column" }}
        >
          <div
            className="remove-table-footer"
            style={{ flex: 1, minHeight: 0,  }}
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
  location: "",
};

// form rules
const rules = {
  component: [{ required: true, message: "Please select a component" }],
  location: [{ required: true, message: "Please select a location" }],
};
