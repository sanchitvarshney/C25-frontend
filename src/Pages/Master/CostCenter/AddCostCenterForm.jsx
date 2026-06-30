import { Button, Card, Form, Input, Modal, Row, Space } from "antd";
import { useForm } from "antd/es/form/Form";

import { imsAxios } from "../../../axiosInterceptor";
import { useState } from "react";
import { useToast } from "../../../hooks/useToast.js";

const AddCostCenterForm = ({ getRows }) => {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [addCostCenterForm] = useForm();

  const submitHandler = async (values) => {
    try {
      setLoading("submitting");
      const response = await imsAxios.post("/purchaseOrder/createCostCenter", {
        cost_center_id: values.id,
        cost_center_name: values.name,
      });

      if (response.success) {
        showToast(response.message, "success");
        resetHandler();
        getRows();
      } else {
        showToast(response.message, "error");
      }
    } catch (error) {
      console.log("there is some error");
    } finally {
      setLoading(false);
    }
  };

  const validateHandler = async () => {
    const values = await addCostCenterForm.validateFields();

    // showing submit confirm'
    Modal.confirm({
      title: "Are you sure you want to add this cost center?",
      onOk() {
        submitHandler(values);
      },
      //   onCancel() {
      //     console.log("Cancel");
      //   },
    });
  };

  const resetHandler = () => {
    addCostCenterForm.resetFields();
  };
  const confirmResetHandler = () => {
    Modal.confirm({
      title: "Are you sure you want to reset this form?",
      onOk() {
        resetHandler();
      },
    });
  };
  return (
    <Card size="small" title="Add Cost Center">
      <Form
        defaultValues={defaultValues}
        layout="vertical"
        form={addCostCenterForm}
      >
        <Form.Item name="id" label="Cost Center Id" rules={rules.id}>
          <Input />
        </Form.Item>
        <Form.Item name="name" label="Cost Center Name" rules={rules.name}>
          <Input />
        </Form.Item>

        <Row justify="end">
          <Space>
            <Button
              loading={loading === "submitting"}
              onClick={confirmResetHandler}
            >
              Reset
            </Button>
            <Button
              loading={loading === "submitting"}
              onClick={validateHandler}
              type="primary"
            >
              Submit
            </Button>
          </Space>
        </Row>
      </Form>
    </Card>
  );
};

const rules = {
  name: [
    {
      required: true,
      message: "Please enter Cost Center Name",
    },
  ],
  id: [
    {
      required: true,
      message: "Please enter Cost Center Id",
    },
  ],
};
const defaultValues = {
  id: "",
  name: "",
};
export default AddCostCenterForm;
