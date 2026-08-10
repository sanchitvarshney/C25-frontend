import  { useState } from "react";
import { Col, Form, Input, Modal, Row } from "antd";
import Field from "../../../Components/Field.jsx";

export default function JwApprovalModel({
  open,
  close,
  submitHandler,
  loading,
}) {
  const [poApprovalForm] = Form.useForm();
  const [isValid, setIsValid] = useState(false);
  const handleSubmit = async () => {
    let values;
    try {
      values = await poApprovalForm.validateFields();
    } catch (error) {
      if (error?.errorFields) {
        setIsValid(true);
        return;
      }
      return;
    }
    setIsValid(false);
    submitHandler(open, values.remarks);
  };
  const handleClose = () => {
    setIsValid(false);
    close();
  };
  return (
    <Modal
      title="Basic Modal"
      open={open}
      onOk={handleSubmit}
      onCancel={handleClose}
      okText="Submit"
      confirmLoading={loading}
    >
      <Row>
        <Col span={24}>
          <Form form={poApprovalForm} layout="vertical">
            <Form.Item
              label="JW Approve Remarks"
              name="remarks"
              rules={rules.remarks}
            >
              <Field
                attr="required | Please enter remarks"
                showValidation={isValid}
              >
                <Input.TextArea rows={4} />
              </Field>
            </Form.Item>
          </Form>
        </Col>
      </Row>
    </Modal>
  );
}

// rules
const rules = {
  remarks: [
    {
      required: true,
      message: "",
    },
  ],
};
