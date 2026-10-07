import { useEffect, useState } from "react";
import { Form, InputNumber, Modal, Input } from "antd";
import { imsAxios } from "../../../axiosInterceptor";
import { useToast } from "../../../hooks/useToast";
import Field from "../../../Components/Field.jsx";

const { TextArea } = Input;

export default function RaisePprQtyRequestModal({
  open,
  onClose,
  pprNo,
  onSuccess,
}) {
  const [loading, setLoading] = useState(false);
  const [isValid, setIsValid] = useState(false);
  const [form] = Form.useForm();
  const { showToast } = useToast();

  useEffect(() => {
    if (!open) return;
    form.setFieldsValue({ add_qty: null, remark: "" });
    setIsValid(false);
  }, [open, form]);

  const submit = async () => {
    let values;
    try {
      values = await form.validateFields();
    } catch {
      setIsValid(true);
      return;
    }
    setIsValid(false);
    setLoading(true);
    try {
      const response = await imsAxios.post("/ppr/raisePprQtyRequest", {
        ppr_no: pprNo,
        add_qty: values.add_qty,
        remark: values.remark || "",
      });
      if (response?.success) {
        showToast(response?.message || "Request raised", "success");
        onClose?.();
        onSuccess?.();
      } else {
        showToast(
          response?.message?.msg ||
            response?.message ||
            "Failed to raise request",
          "error",
        );
      }
    } catch {
      showToast("Error raising request", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title={`Raise Qty Increase Request${pprNo ? ` - ${pprNo}` : ""}`}
      open={open}
      onCancel={onClose}
      maskClosable={false}
      onOk={submit}
      okButtonProps={{ loading }}
      okText="Raise Request"
    >
      <Form layout="vertical" form={form}>
        <Form.Item
          label="Add Qty"
          name="add_qty"
          rules={[{ required: true, message: "" }]}
        >
          <Field
            attr="required | Please enter Add Qty"
            treatZeroAsEmpty
            showValidation={isValid}
          >
            <InputNumber min={1} style={{ width: "100%" }} />
          </Field>
        </Form.Item>
        <Form.Item label="Remark" name="remark">
          <TextArea rows={3} placeholder="Optional remark" />
        </Form.Item>
      </Form>
    </Modal>
  );
}
