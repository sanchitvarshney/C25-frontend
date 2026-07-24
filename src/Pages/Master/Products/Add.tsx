import React, { useEffect, useState } from "react";
import { Button, Card, Col, Form, Input, Row, Space } from "antd";
//@ts-ignore
import MySelect from "../../../Components/MySelect";
//@ts-ignore
import MyButton from "../../../Components/MyButton";
//@ts-ignore
import Field from "../../../Components/Field";
import { addProduct } from "../../../api/master/products";
import { ResponseType } from "../../../types/general";
import useApi from "../../../hooks/useApi";

const Add = ({ uomOptions, productType, getProductRows }:any) => {
  const [addProductForm] = Form.useForm();
  const { executeFun, loading } = useApi();
  const [isValid, setIsValid] = useState(false);
  const skuValue = Form.useWatch("sku", addProductForm);
  const productNameValue = Form.useWatch("name", addProductForm);
  const category = [
    { text: "Goods", value: "goods" },
    { text: "Services", value: "services" },
  ];
  const submitHandler = async () => {
    let values;
    try {
      values = await addProductForm.validateFields();
    } catch (error: any) {
      if (error?.errorFields) {
        setIsValid(true);
        return;
      }
      throw error;
    }
    setIsValid(false);

    if (values) {
      const response: ResponseType = await executeFun(
        () => addProduct(values, productType),
        "submit"
      );
      if (response.success) {
        resetHandler();
        getProductRows();
      }
    }
  };
  const resetHandler = () => {
    addProductForm.resetFields();
    setIsValid(false);
  };
  useEffect(() => {}, []);
  return (
    <div style={{ height: "100%" }}>
      <Card
        size="small"
        title={productType === "sfg" ? "Add New SFG" : "Add New FG"}
      >
        <Form
          initialValues={initialValues}
          form={addProductForm}
          layout="vertical"
        >
          <Row gutter={[0, 6]}>
            <Col span={24}>
              <Form.Item
                name="category"
                label="Product Type"
                rules={[{ required: true, message: "" }]}
              >
                <MySelect
                  options={category}
                  showError={isValid}
                  message="Category is required"
                />
              </Form.Item>
            </Col>
            <Col span={24}>
              <Row gutter={4}>
                <Col span={12}>
                  <Field
                    attr="required | SKU is required"
                    value={skuValue}
                    showValidation={isValid}
                  >
                    <Form.Item
                      name="sku"
                      label="Product SKU"
                      rules={[{ required: true, message: "" }]}
                    >
                      <Input />
                    </Form.Item>
                  </Field>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="uom"
                    label="UOM"
                    rules={[{ required: true, message: "" }]}
                  >
                    <MySelect
                      options={uomOptions}
                      showError={isValid}
                      message="UOM is required"
                    />
                  </Form.Item>
                </Col>
              </Row>
            </Col>
            <Col span={24}>
              <Field
                attr="required | Product name is required"
                value={productNameValue}
                showValidation={isValid}
              >
                <Form.Item
                  name="name"
                  label="Product Name"
                  rules={[{ required: true, message: "" }]}
                >
                  <Input />
                </Form.Item>
              </Field>
            </Col>
            <Col span={24}>
              <Row justify="end">
                <Space>
                  <Form.Item>
                    <MyButton
                      // htmlType="button"
                      onClick={resetHandler}
                      variant="reset"
                    >
                      Reset
                    </MyButton>
                  </Form.Item>
                  <Form.Item>
                    <Button
                      loading={loading("submit")}
                      type="primary"
                      onClick={submitHandler}
                    >
                      Save
                    </Button>
                  </Form.Item>
                </Space>
              </Row>
            </Col>
          </Row>
        </Form>
      </Card>
    </div>
  );
};

export default Add;

const initialValues = {
  category: "goods",
  product: undefined,
  sku: undefined,
  uom: undefined,
};
