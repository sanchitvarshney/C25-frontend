import { useState } from "react";
import { Button, Col, Drawer, Form, Input, Row, Space } from "antd";
import { imsAxios } from "../../../axiosInterceptor";
import MyAsyncSelect from "../../../Components/MyAsyncSelect";
import Field from "../../../Components/Field";
import SubmitConfirmModal from "./SubmitConfirmModal";
import MyButton from "../../../Components/MyButton";
import { useToast } from "../../../hooks/useToast.js";

function AddShippingAddress({ getRows, open, onClose }) {
  const { showToast } = useToast();
  const [asyncOptions, setAsyncOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitConfirmModal, setSubmitConfirmModal] = useState(false);
  const [isValid, setIsValid] = useState(false);

  const [addShippingAddressForm] = Form.useForm();
  const labelValue = Form.useWatch("label", addShippingAddressForm);
  const nameValue = Form.useWatch("name", addShippingAddressForm);
  const panValue = Form.useWatch("pan", addShippingAddressForm);
  const gstinValue = Form.useWatch("gstin", addShippingAddressForm);
  const addressValue = Form.useWatch("address", addShippingAddressForm);
  const stateValue = Form.useWatch("state", addShippingAddressForm);

  const getStateOptions = async (searchTerm) => {
    setLoading("select");
    const response = await imsAxios.post("/backend/stateList", {
      search: searchTerm,
    });
    setLoading(false);
    if (response.success && response.data) {
      let arr = response.data.map((row) => ({
        value: row.id,
        text: row.text,
      }));
      setAsyncOptions(arr);
    } else {
      setAsyncOptions([]);
    }
  };
  const validateHandler = (values) => {
    setIsValid(false);
    let obj = {
      label: values.label,
      company: values.name,
      pan: values.pan,
      gstin: values.gstin,
      state: values.state?.key,
      address: values.address,
    };
    setSubmitConfirmModal(obj);
  };
  const submitHandler = async () => {
    if (submitConfirmModal) {
      setLoading("submit");
      const response = await imsAxios.post(
        "/shippingAddress/saveShippingAddress",
        submitConfirmModal
      );
      setLoading(false);
      if (response.success) {
        showToast(response.message, "success");
        resetHandler();
        setSubmitConfirmModal(false);
        getRows();
        onClose();
      } else {
        showToast(response.message, "error");
      }
    }
  };
  const resetHandler = () => {
    const obj = {
      label: "",
      name: "",
      pan: "",
      gstin: "",
      state: "",
      address: "",
    };
    addShippingAddressForm.setFieldsValue(obj);
    setIsValid(false);
  };
  return (
    <Drawer
      width="50vw"
      title="Add Shipping Address"
      onClose={onClose}
      open={open}
    >
      <SubmitConfirmModal
        open={submitConfirmModal}
        handleCancel={() => setSubmitConfirmModal(false)}
        loading={loading === "submit"}
        submitHandler={submitHandler}
      />
      <Form
        style={{ height: "95%" }}
        onFinish={validateHandler}
        onFinishFailed={() => setIsValid(true)}
        form={addShippingAddressForm}
        layout="vertical"
      >
        <Row>
          <Col span={24}>
            <Field
              attr="required | Please enter a label!"
              value={labelValue}
              showValidation={isValid}
            >
              <Form.Item
                label="Address label"
                name="label"
                rules={[{ required: true, message: "" }]}
              >
                <Input />
              </Form.Item>
            </Field>
          </Col>
          <Col span={24}>
            <Field
              attr="required | Please enter a company Name!"
              value={nameValue}
              showValidation={isValid}
            >
              <Form.Item
                label="Company Name"
                name="name"
                rules={[{ required: true, message: "" }]}
              >
                <Input />
              </Form.Item>
            </Field>
          </Col>
          <Col span={24}>
            <Field
              attr="required | Please enter pan number!"
              value={panValue}
              showValidation={isValid}
            >
              <Form.Item
                label="Pan No."
                name="pan"
                rules={[{ required: true, message: "" }]}
              >
                <Input />
              </Form.Item>
            </Field>
          </Col>
          <Col span={24}>
            <Field
              attr="required | Please enter GST number!"
              value={gstinValue}
              showValidation={isValid}
            >
              <Form.Item
                label="GSTIN"
                name="gstin"
                rules={[{ required: true, message: "" }]}
              >
                <Input />
              </Form.Item>
            </Field>
          </Col>
          <Col span={24}>
            <Form.Item
              label="State"
              name="state"
              rules={[{ required: true, message: "" }]}
            >
              <MyAsyncSelect
                loading={loading === "select"}
                loadOptions={getStateOptions}
                optionsState={asyncOptions}
                onBlur={() => setAsyncOptions([])}
                showError={isValid}
                message="Please Select state!"
                labelInValue
                value={stateValue}
              />
            </Form.Item>
          </Col>
          <Col span={24}>
            <Field
              attr="required | Please enter complete address!"
              value={addressValue}
              showValidation={isValid}
            >
              <Form.Item
                label="Address"
                name="address"
                rules={[{ required: true, message: "" }]}
              >
                <Input.TextArea rows={4} />
              </Form.Item>
            </Field>
          </Col>
        </Row>
      </Form>
      <Row justify="end">
        <Col>
          <Space>
            <MyButton variant="reset" htmlType="button">
              Reset
            </MyButton>
            <Button onClick={onClose}>Back</Button>
            <MyButton
              variant="add"
              type="primary"
              htmlType="submit"
              onClick={() => addShippingAddressForm.submit()}
            >
              Save
            </MyButton>
          </Space>
        </Col>
      </Row>
    </Drawer>
  );
}

export default AddShippingAddress;
