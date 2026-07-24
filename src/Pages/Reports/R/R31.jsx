import { Card, Col, Form, Input, Row, Space } from "antd";
import { useEffect, useState } from "react";
import { imsAxios } from "../../../axiosInterceptor";
import { downloadCSV } from "../../../Components//exportToCSV";
import MyAsyncSelect from "../../../Components/MyAsyncSelect";
import MyDataTable from "../../../Components/MyDataTable";
import MyDatePicker from "../../../Components/MyDatePicker";
import MySelect from "../../../Components/MySelect";
import { CommonIcons } from "../../../Components/TableActions.jsx/TableActions";
import SingleDatePicker from "../../../Components/SingleDatePicker";
import { getVendorOptions } from "../../../api/general.ts";
import useApi from "../../../hooks/useApi.ts";
import { convertSelectOptions } from "../../../utils/general.ts";
import MyButton from "../../../Components/MyButton";
import { useToast } from "../../../hooks/useToast.js";
import Field from "../../../Components/Field";

function R31() {
  const { showToast } = useToast();
  const [asyncOptions, setAsyncOptions] = useState([]);
  const [fetchLoading, setFetchLoading] = useState(false);
  const [rows, setRows] = useState([]);
  const [isValid, setIsValid] = useState(false);
  const [wise, setWise] = useState([]);
  const [selectvendor, setSelectVendor] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const { executeFun, loading: loading1 } = useApi();
  const [searchForm] = Form.useForm();

  useEffect(() => {
    setSearchTerm("");
  }, [wise]);

  const getRows = async () => {
    if (!selectvendor?.key || !searchTerm || !wise) {
      setIsValid(true);
      return;
    }
    setIsValid(false);
    setFetchLoading(true);
    // log
    const response = await imsAxios.post("/report31", {
      wise: wise,
      data: searchTerm,
      vendor: selectvendor.key,
    });
    setFetchLoading(false);
    if (response.success) {
      let arr = response.data.map((row, index) => ({
        ...row,
        id: index + 1,
      }));
      setRows(arr);
    } else {
      showToast(response.message, "error");
      setRows([]);
    }
  };

  const columns = [
    // { headerName: "id", field: "id", flex: 1 },
    { headerName: "Cat Part Code", field: "cat_part_no", width: 130 },
    { headerName: "Part Code", field: "part_no", width: 130 },
    { headerName: "Cat Part Name", field: "part_name", width: 350 },
    { headerName: "Create By", field: "create_by", width: 130 },
    { headerName: "Create Date", field: "create_dt", width: 130 },
    { headerName: "Doc Date", field: "doc_date", width: 130 },
    { headerName: "Doc Reference", field: "doc_ref", width: 130 },
    { headerName: "Hsn", field: "hsn", width: 130 },
    { headerName: "Qty", field: "qty", width: 130 },
    { headerName: "Transaction Id", field: "txn_id", width: 130 },
    { headerName: "Unit", field: "unit", width: 130 },
  ];

  const wiseOptions = [
    { text: "Document Number", value: "doc_no" },
    { text: "Document Date", value: "doc_date" },
    { text: "Created Date", value: "create_date" },
  ];

  // const getVendorLocation = async () => {
  //   let vendor = searchForm.getFieldsValue().vendor;
  //   if (vendor) {
  //     setFormLoading(true);
  //     const response = await imsAxios.post("/backend/fetchVendorJWLocation", {
  //       search: vendor,
  //     });

  //     setFormLoading(false);
  //     if (response.success) {
  //       let arr = [];
  //       arr = response.data.map((row) => ({
  //         value: row.id,
  //         text: row.text,
  //       }));
  //       setLocationOptions(arr);
  //     } else {
  //       toast.error(response.message?.msg || response.message);
  //     }
  //   }
  // };
  const getVendorOption = async (search) => {
    const response = await executeFun(() => getVendorOptions(search), "select");
    let arr = [];
    if (response.success) {
      arr = convertSelectOptions(response.data);
    }
    setAsyncOptions(arr);
  };
  // useEffect(() => {
  //   getVendorLocation();
  // }, [searchForm.getFieldsValue().vendor]);

  // useEffect(() => {
  //   getVendorLocation();
  // }, []);

  return (
    <div style={{ height: "100%" }}>
      <Row gutter={4} style={{ height: "100%", padding: "0px 5px" }}>
        <Col
          style={{ overflowY: "auto", height: "100%", paddingBottom: 50 }}
          span={6}
        >
          <Card size="small" style={{ marginBottom: 5 }}>
            <Form layout="vertical" size="small" form={searchForm}>
              <Row>
                <Col span={24}>
                  <Form.Item name="Wise" label="Select Wise">
                    <MySelect
                      options={wiseOptions}
                      defaultValue={
                        wiseOptions.filter((o) => o.value === wise)[0]
                      }
                      onChange={setWise}
                      value={wise}
                      message="Wise field is required"
                      showError={isValid}
                    />
                  </Form.Item>
                </Col>

                <Col span={24}>
                  <Form.Item name="Search" label="Select Period">
                    {wise === "doc_no" ? (
                      <Field
                        attr="required | Please enter Document Number"
                        value={searchTerm}
                        showValidation={isValid}
                      >
                        <Input
                          type="text"
                          size="default"
                          placeholder="Enter Document Number"
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                        />
                      </Field>
                    ) : wise == "create_date" ? (
                      <MyDatePicker
                        size="default"
                        setDateRange={setSearchTerm}
                        dateRange={searchTerm}
                        value={searchTerm}
                        showError={isValid}
                        message="Please select a Date Period"
                      />
                    ) : (
                      <SingleDatePicker
                        setDate={setSearchTerm}
                        value={searchTerm}
                        showError={isValid}
                        message="Please select a Date"
                      />
                    )}
                  </Form.Item>
                </Col>
                <Col span={24}>
                  <Form.Item name="vendor" label="Select Vendor">
                    <MyAsyncSelect
                      onBlur={() => setAsyncOptions([])}
                      selectLoading={loading1("select")}
                      placeholder="Enter the Vendor Code or Name..."
                      labelInValue
                      onChange={setSelectVendor}
                      loadOptions={getVendorOption}
                      optionsState={asyncOptions}
                      showError={isValid}
                      message="Please select a Vendor"
                    />
                  </Form.Item>
                </Col>
                <Col span={24}>
                  <Space>
                    <Form.Item style={{ marginBottom: 0 }}>
                      <MyButton
                        variant="search"
                        loading={fetchLoading}
                        size="default"
                        htmlType="submit"
                        type="primary"
                        onClick={() => getRows()}
                      >
                        Generate
                      </MyButton>
                    </Form.Item>
                    <Form.Item style={{ marginBottom: 0 }}>
                      <CommonIcons
                        action="downloadButton"
                        onClick={() => downloadCSV(rows, columns, "R30 Report")}
                      />
                    </Form.Item>
                  </Space>
                </Col>
              </Row>
            </Form>
          </Card>
        </Col>
        <Col span={18}>
          <div className="hide-select" style={{ height: "100%" }}>
            <MyDataTable
              // checkboxSelection={true}
              loading={fetchLoading}
              data={rows}
              columns={columns}
            />
          </div>
        </Col>
      </Row>
    </div>
  );
}

export default R31;
