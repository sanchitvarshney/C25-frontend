import { useState, useEffect } from "react";

import { Card, Col, Form, InputNumber, Row, Space } from "antd";
import { imsAxios } from "../../axiosInterceptor";
import MyButton from "../../Components/MyButton";
import MyAsyncSelect from "../../Components/MyAsyncSelect";
import MyDataTable from "../../Components/MyDataTable";
import Field from "../../Components/Field";
import { getProductsOptions } from "../../api/general";
import { v4 } from "uuid";
import { useToast } from "../../hooks/useToast";

const AddSKUOpeningRate = () => {
const { showToast } =    useToast();
  const [form] = Form.useForm();
  const [submitLoading, setSubmitLoading] = useState(false);
  const [productOptions, setProductOptions] = useState([]);
  const [productLoading, setProductLoading] = useState(false);
  const [tableData, setTableData] = useState([]);
  const [tableLoading, setTableLoading] = useState(false);
  const [isValid, setIsValid] = useState(false);
  const closingQtyValue = Form.useWatch("closing_qty", form);
  const averageRateValue = Form.useWatch("average_rate", form);
  const totalValueValue = Form.useWatch("total_value", form);

  const getProductOptions = async (search) => {
    setProductLoading(true);
    const response = await getProductsOptions(search);
    setProductLoading(false);
    if (response.success && response.data) {
      setProductOptions(response.data);
    } else {
      setProductOptions([]);
    }
  };

  const fetchSKUOpeningRates = async () => {
    setTableLoading(true);
    try {
      const response = await imsAxios.get("/backend/fetch-skuOpening-rate");
      setTableLoading(false);
      if (response?.success && response?.data) {
        let arr = response.data.map((row, index) => ({
          ...row,
          id: row.product_key || v4(),
          serialNo: index + 1,
          closing_qty: parseFloat(row.closing_qty) || 0,
          average_rate: parseFloat(row.average_rate) || 0,
          total_value: parseFloat(row.total_value) || 0,
        }));
        setTableData(arr);
      } else {
        setTableData([]);
      }
    } catch (error) {
      setTableLoading(false);
    
      setTableData([]);
    }
  };

  const handleSubmit = async (values) => {
    setIsValid(false);
    setSubmitLoading(true);
    try {
      const response = await imsAxios.post("/backend/add-skuOpening-detail", {
        product: values.product?.key,
        closing_qty: values.closing_qty,
        average_rate: values.average_rate,
        total_value: values.total_value,
      });
      setSubmitLoading(false);
      if (response?.success) {
        showToast("SKU Opening Rate added successfully");
        form.resetFields();
        setProductOptions([]);
        fetchSKUOpeningRates(); // Refresh table after successful submission
      } else {
        showToast(response?.message || "Failed to add SKU Opening Rate", "error");
      }
    } catch (error) {
      setSubmitLoading(false);
      showToast(error?.response?.data?.message || "An error occurred", "error");
    }
  };

  const handleReset = () => {
    form.resetFields();
    setProductOptions([]);
    setIsValid(false);
  };

  useEffect(() => {
    fetchSKUOpeningRates();
  }, []);

  const columns = [
    { field: "serialNo", headerName: "Serial No", width: 100 },
    { field: "productName", headerName: "Product Name", width: 250 },
    { field: "product_key", headerName: "Product Key", width: 180 },
     { field: "p_sku", headerName: "SKU", width: 80 },
    
    {
      field: "closing_qty",
      headerName: "Closing Qty",
      width: 130,
      type: "number",
    },
    {
      field: "average_rate",
      headerName: "Average Rate",
      width: 130,
      type: "number",
    },
    {
      field: "total_value",
      headerName: "Total Value",
      width: 150,
      type: "number",
    },
      { field: "date", headerName: "Date", width: 180 },
  ];

  return (
    <div style={{ height: "100%", padding:10 }}>
      <Row gutter={8} style={{ height: "100%" }}>
        <Col span={8}>
          <Card title="Add SKU Opening Rate" size="small">
            <Form
              form={form}
              layout="vertical"
              onFinish={handleSubmit}
              onFinishFailed={() => setIsValid(true)}
              autoComplete="off"
            >
              <Form.Item
                label="Product"
                name="product"
                rules={[{ required: true, message: "" }]}
              >
                <MyAsyncSelect
                  placeholder="Search and select product..."
                  loadOptions={getProductOptions}
                  optionsState={productOptions}
                  onBlur={() => setProductOptions([])}
                  selectLoading={productLoading}
                  labelInValue
                  showError={isValid}
                  value={form.getFieldValue("product")}
                  message="Please select a product"
                />
              </Form.Item>

              <Field
                attr="required | Closing qty is required"
                value={closingQtyValue}
                showValidation={isValid}
              >
                <Form.Item
                  label="Closing Qty"
                  name="closing_qty"
                  rules={[
                    { required: true, message: "" },
                    {
                      type: "number",
                      min: 0,
                      message: "Closing qty must be a positive number",
                    },
                  ]}
                >
                  <InputNumber
                    placeholder="Enter closing qty"
                    style={{ width: "100%" }}
                      min={0}
                      step={1}
                      type="number"
                  />
                </Form.Item>
              </Field>

              <Field
                attr="required | Weighted Average Rate is required"
                value={averageRateValue}
                showValidation={isValid}
              >
                <Form.Item
                  label="Weighted Average Rate"
                  name="average_rate"
                  rules={[
                    { required: true, message: "" },
                    {
                      type: "number",
                      min: 0,
                      message: "Weighted Average Rate must be a positive number",
                    },
                  ]}
                >
                  <InputNumber
                    placeholder="Enter weighted average rate"
                    style={{ width: "100%" }}
                    min={0}
                    type="number"
                  />
                </Form.Item>
              </Field>

              <Field
                attr="required | Total value is required"
                value={totalValueValue}
                showValidation={isValid}
              >
                <Form.Item
                  label="Total Value"
                  name="total_value"
                  rules={[
                    { required: true, message: "" },
                    {
                      type: "number",
                      min: 0,
                      message: "Total value must be a positive number",
                    },
                  ]}
                >
                  <InputNumber
                    placeholder="Enter total value"
                    style={{ width: "100%" }}
                    min={0}
                    step={0.01}
                    precision={2}
                    type="number"
                  />
                </Form.Item>
              </Field>

              <Row justify="end">
                <Col>
                  <Space>
                    <MyButton onClick={handleReset} variant="reset">
                      Reset
                    </MyButton>
                    <MyButton
                      loading={submitLoading}
                      type="primary"
                      htmlType="submit"
                      variant="add"
                    >
                      Submit
                    </MyButton>
                  </Space>
                </Col>
              </Row>
            </Form>
          </Card>
        </Col>
        <Col style={{ height: "100%" }} span={16}>
          <MyDataTable
            loading={tableLoading}
            data={tableData}
            columns={columns}
          />
        </Col>
      </Row>
    </div>
  );
};

export default AddSKUOpeningRate;
