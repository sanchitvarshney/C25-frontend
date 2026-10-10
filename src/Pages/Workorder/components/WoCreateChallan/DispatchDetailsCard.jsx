import { Card, Form, Input, Col } from "antd";

import MySelect from "../../../../Components/MySelect";
import Field from "../../../../Components/Field.jsx";

const DispatchDetailsCard = ({ form, setaddid, addoptions, isValid }) => {
  const handleaddress = (e) => {
    setaddid(true);
    addoptions.map((item) => {
      if (item.value === e) {
        form.setFieldValue("shippingaddress", item.address);
        form.setFieldValue("dispatchfrompincode", item.pincode);
        form.setFieldValue("dispatchfromgst", item.gst);
        form.setFieldValue("dispatchaddrid", item.value);
      }
    });
  };
  //
  ///////
  return (
    <Col span={24}>
      <Card
        size="small"
        title="Dispatch Details"
        style={{ height: "100%", overflow: "hidden" }}
        bodyStyle={{ overflow: "auto", height: "98%" }}
      >
        <Form.Item
          name="dispatchid"
          label="Select Dispatch Address"
          rules={[{ required: true, message: "" }]}
        >
          <Field
            attr="required | Please select Dispatch Address!"
            showValidation={isValid}
          >
            <MySelect
              options={addoptions}
              onChange={(e) => {
                handleaddress(e);
              }}
            />
          </Field>
        </Form.Item>
        <Form.Item
          name="shippingaddress"
          label="Complete Address"
          rules={[{ required: true, message: "" }]}
        >
          <Field
            attr="required | Please enter Complete Address"
            showValidation={isValid}
          >
            <Input.TextArea rows={3} />
          </Field>
        </Form.Item>
        {/* {rtnchallan && ( */}
        <>
          <Form.Item
            name="dispatchfrompincode"
            label="Shipping Pin"
            rules={[{ required: true, message: "" }]}
          >
            <Field
              attr="required | Please enter Shipping Pin"
              showValidation={isValid}
            >
              <Input />
            </Field>
          </Form.Item>
          <Form.Item
            name="dispatchfromgst"
            label="Shipping GST"
            // rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>
        </>
        {/* )} */}
      </Card>
    </Col>
  );
};

export default DispatchDetailsCard;
