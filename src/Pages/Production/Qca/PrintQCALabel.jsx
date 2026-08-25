import { useState } from "react";
import { Button, Card, Col, Form, Input, Row } from "antd";
import MySelect from "../../../Components/MySelect";
import { imsAxios } from "../../../axiosInterceptor";
import printFunction from "../../../Components/printFunction";
import { useToast } from "../../../hooks/useToast.js";
import Field from "../../../Components/Field.jsx";

const PrintQCALabel = () => {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [isValid, setIsValid] = useState(false);
  const [printLabelForm] = Form.useForm();

  const printHandler = async () => {
    let values;
    try {
      values = await printLabelForm.validateFields();
    } catch (error) {
      setIsValid(true);
      return;
    }
    setIsValid(false);
    try {
      setLoading(true);
      const response = await imsAxios.post("/qcalable/generateQcaLable", {
        skuType: values.type,
        totalQr: values.quantity,
      });
      if (response.success) {
        showToast(response.message, "success");
        printFunction(response.data.buffer.data);
      }
      else{
        showToast(response.message, "error");
      }
    } catch (error) {
      showToast(error.message, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Row style={{ height: "100%", padding:10 }}>
      <Col span={6}>
        <Card>
          <Form
            initialValues={defaultValues}
            form={printLabelForm}
            layout="vertical"
          >
            <Form.Item label="SKU Type" name="type" rules={rules.type}>
              <MySelect
                options={typeOptions}
                showError={isValid}
                message="Please select FG type"
              />
            </Form.Item>
            <Form.Item label="Quantity" name="quantity" rules={rules.quantity} >
              <Field
                attr="required | Please input quantity"
                showValidation={isValid}
                treatZeroAsEmpty
              >
                <Input type="number" />
              </Field>
            </Form.Item>
          </Form>
          <Row>
            <Col span={24}>
              <Button
                onClick={printHandler}
                loading={loading}
                block
                type="primary"
              >
                Print
              </Button>
            </Col>
          </Row>
        </Card>
      </Col>
    </Row>
  );
};

const typeOptions = [
  {
    label: "FG",
    value: "FG",
  },
  {
    label: "SFG",
    value: "SFG",
  },
];

const defaultValues = {
  type: "FG",
  quantity: "",
};

const rules = {
  type: [
    {
      required: true,
      message: "",
    },
  ],
  quantity: [
    {
      required: true,
      message: "",
    },
  ],
};
export default PrintQCALabel;
