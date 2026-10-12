import { useEffect, useState } from "react";
import {
  Drawer,
  Col,
  Form,
  Input,
  Row,
  Button,
  Modal,
  Descriptions,
} from "antd";
import { imsAxios } from "../../../../axiosInterceptor";
import MySelect from "../../../../Components/MySelect";
import Field from "../../../../Components/Field";
import NavFooter from "../../../../Components/NavFooter";
import { useToast } from "../../../../hooks/useToast.js";
import Loading from "../../../../Components/Loading";

const initialValues = {
  gst: "",
  phone: "",
  country: 83,
  state: "",
  city: "",
  zipcode: "",
  address: "",
};

const AddClientBranch = ({ openBranch, setOpenBranch }) => {
  const { showToast } = useToast();
  const [countriesOptions, setCountriesOptions] = useState([]);
  const [stateOptions, setStateOptions] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState(83);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(false);
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [isValid, setIsValid] = useState(false);
  const [addBranchForm] = Form.useForm();

  const getCountries = async () => {
    setPageLoading(true);
    const response = await imsAxios.get("/tally/backend/countries");
    setPageLoading(false);
    if (response.success && response.data[0]) {
      let arr = response.data.map((row) => ({
        text: row.name,
        value: row.code,
      }));
      setCountriesOptions(arr);
    }
  };
  const getState = async () => {
    setPageLoading(true);
    const response = await imsAxios.get("/tally/backend/states");
    setPageLoading(false);
    if (response.success && response.data[0]) {
      let arr = response.data.map((row) => ({
        text: row.name,
        value: row.code,
      }));
      setStateOptions(arr);
    }
  };
  const submitHandler = async () => {
    if (!showSubmitConfirm) {
      return;
    }
    const newObj = {
      clientCode: openBranch?.vendor_code,
      gst: showSubmitConfirm.gst,
      phoneNo: showSubmitConfirm.phone,
      country: showSubmitConfirm.country,
      state: showSubmitConfirm.state,
      city: showSubmitConfirm.city,
      pinCode: showSubmitConfirm.zipcode,
      address: showSubmitConfirm.address,
    };
    try {
      setSubmitLoading(true);
      const response = await imsAxios.post("/client/addBranch", newObj);
      if (response.success) {
        showToast(response.message);
        resetFunction();
        setOpenBranch(false);
        setShowSubmitConfirm(false);
      } else {
        showToast(response.message?.msg || response.message, "error");
      }
    } catch (error) {
      showToast(error?.message || "Failed to add branch", "error");
    } finally {
      setSubmitLoading(false);
    }
  };
  const resetFunction = () => {
    addBranchForm.setFieldsValue(initialValues);
    setSelectedCountry(83);
    setShowResetConfirm(false);
    setIsValid(false);
  };
  useEffect(() => {
    getCountries();
  }, []);
  useEffect(() => {
    if (openBranch) {
      resetFunction();
    }
  }, [openBranch]);
  useEffect(() => {
    let obj = addBranchForm.getFieldsValue(true);
    addBranchForm.setFieldsValue({
      ...obj,
      state: "",
    });
    if (selectedCountry === 83) {
      getState();
    }
  }, [selectedCountry]);
  return (
    <Drawer
      open={openBranch}
      onClose={() => setOpenBranch(false)}
      width="100vw"
      title={`Add Branch of Client: ${openBranch?.vendor_code ?? ""}`}
    >
      {/* submit confirm modal */}
      <Modal
        open={showSubmitConfirm}
        title="Add Branch"
        onOk={submitHandler}
        onCancel={() => setShowSubmitConfirm(false)}
        footer={[
          <Button key="back" onClick={() => setShowSubmitConfirm(false)}>
            No
          </Button>,
          <Button
            key="submit"
            type="primary"
            loading={submitLoading}
            onClick={submitHandler}
          >
            Yes
          </Button>,
        ]}
      >
        Are you sure you want to add this branch?
      </Modal>
      {/* reset cofirm modal */}
      <Modal
        open={showResetConfirm}
        title="Reset Info"
        onOk={resetFunction}
        onCancel={() => setShowResetConfirm(false)}
        footer={[
          <Button key="back" onClick={() => setShowResetConfirm(false)}>
            No
          </Button>,
          <Button key="submit" type="primary" onClick={resetFunction}>
            Yes
          </Button>,
        ]}
      >
        Are you sure you want to want to reset the entered Info?
      </Modal>
      <Form
        layout="vertical"
        size="small"
        form={addBranchForm}
        initialValues={initialValues}
        onFinish={(values) => {
          setIsValid(false);
          setShowSubmitConfirm(values);
        }}
        onFinishFailed={() => setIsValid(true)}
      >
        {pageLoading && <Loading />}
        <Row>
          <Col span={4}>
            <Descriptions size="small" title="Branch Address Information">
              <Descriptions.Item
                contentStyle={{
                  fontSize: window.innerWidth < 1600 && "0.7rem",
                  marginTop: window.innerWidth < 1600 && -15,
                }}
              >
                Please provide client address info
              </Descriptions.Item>
            </Descriptions>
          </Col>
          <Col span={20}>
            <Row gutter={16}>
              {/* Client Country */}
              <Col span={6}>
                <Form.Item
                  name="country"
                  label="Country"
                  rules={[{ required: true, message: "" }]}
                >
                  <MySelect
                    options={countriesOptions}
                    size="default"
                    onChange={(value) => setSelectedCountry(value)}
                    showError={isValid}
                    message="Please select Client's Country!"
                  />
                </Form.Item>
              </Col>

              {/* Client State */}
              <Col span={6}>
                <Form.Item
                  name="state"
                  label="State"
                  rules={[{ required: true, message: "" }]}
                >
                  {selectedCountry == 83 ? (
                    <MySelect
                      options={stateOptions}
                      size="default"
                      showError={isValid}
                      message="Please select client's state"
                    />
                  ) : (
                    <Field
                      attr="required | Please select client's state"
                      showValidation={isValid}
                    >
                      <Input size="default" />
                    </Field>
                  )}
                </Form.Item>
              </Col>

              {/* Client's city */}
              <Col span={6}>
                <Form.Item
                  name="city"
                  label="City"
                  rules={[{ required: true, message: "" }]}
                >
                  <Field
                    attr="required | Please enter client's City"
                    showValidation={isValid}
                  >
                    <Input size="default" />
                  </Field>
                </Form.Item>
              </Col>

              {/* zip code */}
              <Col span={6}>
                <Form.Item
                  name="zipcode"
                  label="ZIP Code"
                  rules={[{ required: true, message: "" }]}
                >
                  <Field
                    attr="required | Please enter Clients zip code!"
                    showValidation={isValid}
                  >
                    <Input size="default" />
                  </Field>
                </Form.Item>
              </Col>

              {/* Client number */}
              <Col span={6}>
                <Form.Item
                  name="phone"
                  label="Phone Number"
                  rules={[{ required: true, message: "" }]}
                >
                  <Field
                    attr="required | Please enter client's phone number!"
                    showValidation={isValid}
                  >
                    <Input size="default" />
                  </Field>
                </Form.Item>
              </Col>

              {/* GST Number */}
              <Col span={6}>
                <Form.Item
                  name="gst"
                  label="GST Number"
                  rules={[{ required: true, message: "" }]}
                >
                  <Field
                    attr="required | Please Input the client's GST Number !"
                    showValidation={isValid}
                  >
                    <Input size="default" />
                  </Field>
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              {/* Client address */}
              <Col span={12}>
                <Form.Item
                  name="address"
                  label="Address"
                  rules={[{ required: true, message: "" }]}
                >
                  <Field
                    attr="required | Please Enter Client's Address!"
                    showValidation={isValid}
                  >
                    <Input.TextArea rows={4} size="default" />
                  </Field>
                </Form.Item>
              </Col>
            </Row>
          </Col>
        </Row>

        <NavFooter
          submithtmlType="submit"
          submitButton={true}
          nextLabel="Submit"
          formName="add-client-branch"
          resetFunction={setShowResetConfirm}
        />
      </Form>
    </Drawer>
  );
};

export default AddClientBranch;
