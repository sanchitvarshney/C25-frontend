import { useEffect, useState } from "react";
import { Form, Modal, Row, Typography, Col, Button, Input } from "antd";
import { imsAxios } from "../../../../axiosInterceptor";
import { useToast } from "../../../../hooks/useToast.js";

export default function PoRejectModa({ open, close, getRows }) {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [rejectForm] = Form.useForm();

  //   submit handler
  const submitHandler = async () => {
    const values = await rejectForm.validateFields();
    setLoading("submit");
    const response = await imsAxios.post("/purchaseOrder/rejectPo", {
      poid: open,
      remark: values.remarks,
    });
    setLoading(false);
    if (response.success) {
      close();
      resetHandler();
      getRows();
      showToast(response.message, "success");
    } else {
      showToast(response.message?.msg || response.message, "error");
    }
  };

  //   reset handler
  const resetHandler = () => {
    rejectForm.setFieldsValue({
      remarks: "",
    });
  };

  useEffect(() => {
    if (open) {
      resetHandler();
    }
  }, [open]);

  return (
    <Modal
      title={`Are you sure you want to Reject ${open}`}
      open={open}
      onOk={submitHandler}
      confirmLoading={loading === "submit"}
      onCancel={close}
      okText="Reject PO"
      cancelText="No"
    >
      <Row >
        <Col span={24}>
          <Row justify="center">
            <Form form={rejectForm} layout="vertical" style={{ width: "100%" }}>
              <Col span={24}>
                <Form.Item
                  rules={rules.remarks}
                  label="Reject PO Remarks"
                  name="remarks"
                >
                  <Input.TextArea
                    rows={3}
                    placeholder="Enter remarks here..."
                  />
                </Form.Item>
              </Col>
            </Form>
          </Row>
        </Col>
      </Row>
    </Modal>
  );
}

// form rules
const rules = {
  remarks: [
    {
      required: true,
      message: "Please enter remarks",
    },
  ],
};
