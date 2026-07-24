import { useEffect, useState } from "react";
import { useToast } from "../../../hooks/useToast.js";
import {
  Row,
  Col,
  Input,
  Form,
  Descriptions,
  Divider,
  Modal,
  InputNumber,
} from "antd";
import MyAsyncSelect from "../../../Components/MyAsyncSelect";
import Field from "../../../Components/Field";
import NavFooter from "../../../Components/NavFooter";
import { imsAxios } from "../../../axiosInterceptor";
import MySelect from "../../../Components/MySelect";
import SingleDatePicker from "../../../Components/SingleDatePicker";
import SingleProduct from "./SingleProduct";
import { validatePAN } from "../../../utils/general";
import { getVendorBranchBankOptions } from "./vendorBranchBankOptions";
import { mergeMsmeYearOptions } from "../../../utils/indianFinancialYear";

const msmeOptions = [
  { text: "Yes", value: "Y" },
  { text: "No", value: "N" },
];
const MSME_YEAR_LEGACY = [
  { text: "2023-2024", value: "2023-2024" },
  { text: "2024-2025", value: "2024-2025" },
  { text: "2025-2026", value: "2025-2026" },
  { text: "2026-2027", value: "2026-2027" },
];
const msmeYearOptions = mergeMsmeYearOptions(MSME_YEAR_LEGACY);
const msmeTypeOptions = [
  { text: "Micro", value: "Micro" },
  { text: "Small", value: "Small" },
  { text: "Medium", value: "Medium" },
];
const msmeActivityOptions = [
  { text: "Manufacturing", value: "Manufacturing" },
  { text: "Service", value: "Service" },
  { text: "Trading", value: "Trading" },
];

const transactionTypeOptions = [
  { text: "Cheque", value: "cheque" },
  { text: "e-Fund Transfer", value: "transfer" },
  { text: "UPI", value: "upi" },
  { text: "Other", value: "other" },
  { text: "N/A", value: "na" },
];

const AddVendor = () => {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [asyncOptions, setAsyncOptions] = useState([]);
  const [files, setFiles] = useState([]);
  const [currencies, setCurrencies] = useState([]);
  const [addVendorForm] = Form.useForm();
  const [selectLoading, setSelectLoading] = useState(false);
  const [showSubmitConfirmModal, setShowSubmitConfirmModal] = useState(false);
  const [showResetConfirmModal, setShowResetConfirmModal] = useState(false);
  const msmeStat = Form.useWatch("msmeStatus", addVendorForm);
  const einvoice = Form.useWatch("applicability", addVendorForm);
  const transactionType = Form.useWatch("transactionType", addVendorForm);
  const bankNameWatch = Form.useWatch("bankName", addVendorForm);
  const [isValid, setIsValid] = useState(false);
  const vendorNameValue = Form.useWatch("vendorName", addVendorForm);
  const pannoValue = Form.useWatch("panno", addVendorForm);
  const mobileValue = Form.useWatch("mobile", addVendorForm);
  const msmeIdValue = Form.useWatch("msmeId", addVendorForm);
  const gstinValue = Form.useWatch("gstin", addVendorForm);
  const branchValue = Form.useWatch("branch", addVendorForm);
  const cityValue = Form.useWatch("city", addVendorForm);
  const pincodeValue = Form.useWatch("pincode", addVendorForm);
  const addressValue = Form.useWatch("address", addVendorForm);
  const stateValue = Form.useWatch("state", addVendorForm);
  

  // const [groupOptions, setGroupOptions] = useState([]);

  const getFetchState = async (e) => {
    if (e.length > 2) {
      setSelectLoading(true);
      const { data } = await imsAxios.post("/backend/stateList", {
        search: e,
      });
      setSelectLoading(false);
      let arr = [];
      if (data && Array.isArray(data)) {
        arr = data.map((d) => {
          return { text: d.text, value: d.id };
        });
      }
      setAsyncOptions(arr);
      // return arr;
    }
  };

  const getCurrencies = async () => {
    try {
      const { data } = await imsAxios.get("/backend/fetchAllCurrecy");
      const arr =
        data?.data?.map((d) => ({
          text: d.currency_symbol,
          value: d.currency_id,
          notes: d.currency_notes,
        })) || [];
      setCurrencies([{ text: "N/A", value: "N/A" }, ...arr]);
    } catch (e) {
      setCurrencies([{ text: "N/A", value: "N/A" }]);
    }
  };

  // const getGroupOptions = async () => {
  //   try {
  //     const response = await imsAxios.post("/groups/groupSelect2");
  //     const { data } = response;
  //     if (data?.code === 200) {
  //       const arr = data.data.map((row) => ({
  //         text: row.text,
  //         value: row.id,
  //       }));
  //       setGroupOptions(arr);
  //     } else if (data?.message?.msg) {
  //       toast.error(data.message.msg);
  //     }
  //   } catch (error) {
  //     setGroupOptions([]);
  //   }
  // };

  const submitHandler = async () => {
    setLoading("submit");
    setShowSubmitConfirmModal(false);
    const response = await imsAxios.post(
      "/vendor/addVendor",
      showSubmitConfirmModal,
    );
    setLoading(false);
    if (response.success) {
      showToast(response?.message, "success");
      reset();
    } else {
      setShowSubmitConfirmModal(false);
      showToast(response.message, "error");
    }
  };

  const validateHandler = async () => {
    const formData = new FormData();
    let values;
    try {
      values = await addVendorForm.validateFields();
    } catch (error) {
      if (error?.errorFields) {
        setIsValid(true);
        return;
      }
      showToast(error?.message || "Something went wrong", "error");
      return;
    }
    setIsValid(false);

    const uploadedFie = addVendorForm.getFieldValue("components");
    if (values.components && Array.isArray(values.components)) {
      values.components.map((comp) => {
        if (comp.file && Array.isArray(comp.file) && comp.file[0]) {
          formData.append("file", comp.file[0]?.originFileObj);
        }
      });
    }

    const obj = {
      vendor: {
        vendorname: values.vendorName,
        panno: values.panno.toUpperCase(),
        cinno: !values.cinno
          ? "--"
          : values.cinno === ""
            ? "--"
            : values.cinno.toUpperCase(),
        term_days: values.paymentTerms ?? 30,
        msme_status: values.msmeStatus,
        msme_year: values.year,
        msme_id: values.msmeId,
        msme_type: values.type,
        msme_activity: values.activity,
        msme_effective_from: values.msmeEffectiveFrom || "--",
        eInvoice: values.applicability,
        dateOfApplicability:
          values.applicability === "Y" ? values.dobApplicabilty : "--",
        group: values.group,
        documentName:
          uploadedFie && Array.isArray(uploadedFie)
            ? uploadedFie.map((r) => r.documentName)
            : [],
        // file: formData,
      },
      branch: {
        branch: values.branch,
        address: values.address,
        state: values.state?.value || values.state,
        city: values.city,
        pincode: values.pincode,
        fax: values.fax === "" ? "--" : values.fax,
        mobile: values.mobile,
        email: (values.email === "" || values.email === undefined || !values.email) ? "--" : values.email,
        gstin: values.gstin.toUpperCase(),
        transaction_type: values.transactionType,
        account_no: values.accountNo,
        ifs_code: values.ifsCode,
        bank_name: values.bankName,
        bank_branch: values.bankBranch,
        ledger_currency: values.ledgerCurrency,
      },
    };

    formData.append("vendor", JSON.stringify(obj.vendor));
    formData.append("branch", JSON.stringify(obj.branch));
    setShowSubmitConfirmModal(formData);
  };

  const reset = async () => {
    setShowSubmitConfirmModal(false);
    addVendorForm.resetFields();
    setFiles([]);
    setIsValid(false);
  };
  // useEffect(() => {
  //   // console.log("msmsStatus", msmsStatus);
  //   if (msmsStatus) {
  //     setMsmeStat(msmsStatus);
  //   }
  // }, [msmsStatus]);

  // const changeMSmeStatus = (value) => {
  //   console.log("value", value);
  //   setMsmeStat(value);
  // };
  // useEffect(() => {
  //       setMsmeStat(value);
  // }, [third]);

  useEffect(() => {
    // getGroupOptions();
  }, []);

  // Load currencies for "Currency of Ledger"
  useEffect(() => {
    getCurrencies();
  }, []);

  // Keep bank fields in sync with Type = N/A
  useEffect(() => {
    if (!transactionType) return;

    if (transactionType === "na") {
      addVendorForm.setFieldValue("accountNo", "N/A");
      addVendorForm.setFieldValue("ifsCode", "N/A");
      addVendorForm.setFieldValue("bankName", "N/A");
      addVendorForm.setFieldValue("bankBranch", "N/A");
      addVendorForm.setFieldValue("ledgerCurrency", "N/A");
    } else {
      // Clear fields when user selects a real payment type.
      if (addVendorForm.getFieldValue("accountNo") === "N/A") {
        addVendorForm.setFieldValue("accountNo", "");
      }
      if (addVendorForm.getFieldValue("ifsCode") === "N/A") {
        addVendorForm.setFieldValue("ifsCode", "");
      }
      if (addVendorForm.getFieldValue("bankName") === "N/A") {
        addVendorForm.setFieldValue("bankName", "");
      }
      if (addVendorForm.getFieldValue("bankBranch") === "N/A") {
        addVendorForm.setFieldValue("bankBranch", "");
      }
      if (addVendorForm.getFieldValue("ledgerCurrency") === "N/A") {
        addVendorForm.setFieldValue("ledgerCurrency", "");
      }
    }
  }, [transactionType, addVendorForm]);

  return (
    <div
      style={{ height: "calc(100vh - 165px)", overflow: "auto", padding: 10 }}
    >
      <Form
        initialValues={initialValues}
        layout="vertical"
        form={addVendorForm}
      >
        <Modal
          title="Submit Confirm"
          open={showSubmitConfirmModal}
          onOk={submitHandler}
          confirmLoading={loading === "submit"}
          onCancel={() => setShowSubmitConfirmModal(false)}
        >
          <p>Are you sure you want to create this vendor?</p>
        </Modal>
        <Modal
          title="Reset Confirm"
          open={showResetConfirmModal}
          onOk={reset}
          onCancel={() => setShowResetConfirmModal(false)}
        >
          <p>Are you sure you want to create this vendor?</p>
        </Modal>
        <Row gutter={16}>
          <Col span={4}>
            <Descriptions
              size="small"
              title={<p style={{ fontSize: "0.8rem" }}>Vendor Details</p>}
            >
              <Descriptions.Item
                contentStyle={{
                  fontSize: window.innerWidth < 1600 && "0.7rem",
                }}
              >
                Provide Vendor Details
                <br /> (New Or Supplementary)
              </Descriptions.Item>
            </Descriptions>
          </Col>
          <Col span={20}>
            <Row gutter={16}>
              <Col span={6}>
                <Field
                  attr="required | Please enter Vendor Name"
                  value={vendorNameValue}
                  showValidation={isValid}
                >
                  <Form.Item
                    label="Vendor Name"
                    name="vendorName"
                    rules={[{ required: true, message: "" }]}
                  >
                    <Input />
                  </Form.Item>
                </Field>
              </Col>
              <Col span={6}>
                <Field
                  attr="required | Please enter Pan Number"
                  value={pannoValue}
                  showValidation={isValid}
                >
                  <Form.Item
                    label="Pan Number"
                    name="panno"
                    rules={[{ required: true, message: "" }]}
                  >
                    <Input
                      maxLength={10}
                      onChange={(e) => {
                        const raw = e.target.value
                          .replace(/[^A-Za-z0-9]/g, "")
                          .slice(0, 10)
                          .toUpperCase();
                        const { valid, formattedPAN } = validatePAN(raw);
                        addVendorForm.setFieldValue("panno", formattedPAN);
                        if (!valid && formattedPAN.length === 10) {
                          showToast(
                            "Invalid Pan Number! Please Enter Valid Pan Number.",
                            "error",
                          );
                        }
                      }}
                    />
                  </Form.Item>
                </Field>
              </Col>
              <Col span={6}>
                <Form.Item label="CIN Number" name="cinno">
                  <Input />
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item
                  label="Payment Terms (in-days)"
                  name="paymentTerms"
                  rules={rules.paymentTerms}
                >
                  <InputNumber
                    style={{ width: "100%" }}
                    min={1}
                    max={999}
                    // value={paymentTerms.value}
                    // onChange={(e) => inputHandler("cin", e.target.value)}//
                    size="default"
                  />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              {/* <Col span={6}>
                <Form.Item label="Group" name="group">
                  <MySelect options={groupOptions} />
                </Form.Item>
              </Col> */}
              <Col span={6}>
                <Form.Item label="Email" name="email">
                  <Input />
                </Form.Item>
              </Col>
              <Col span={6}>
                <Field
                  attr="required | Please enter Mobile Number"
                  value={mobileValue}
                  showValidation={isValid}
                >
                  <Form.Item
                    label="Mobile"
                    name="mobile"
                    rules={[{ required: true, message: "" }]}
                  >
                    <Input />
                  </Form.Item>
                </Field>
              </Col>
              <Col span={6}>
                <Form.Item label="Fax Number" name="fax">
                  <Input />
                </Form.Item>
              </Col>
              <Col span={24}>
                <Row gutter={16}>
                  <Col span={4}>
                    <Form.Item
                      label="MSME Status"
                      name="msmeStatus"
                      rules={rules.status}
                    >
                      <MySelect options={msmeOptions} />
                    </Form.Item>
                  </Col>
                  {msmeStat === "Y" && (
                    <>
                      <Col span={5}>
                        <Form.Item
                          label="MSME Year"
                          name="year"
                          rules={[{ required: true, message: "" }]}
                        >
                          <MySelect
                            options={msmeYearOptions}
                            showError={isValid}
                            message="Please select MSME Year"
                          />
                        </Form.Item>
                      </Col>
                      <Col span={5}>
                        <Field
                          attr="required | Please enter MSME Number"
                          value={msmeIdValue}
                          showValidation={isValid}
                        >
                          <Form.Item
                            label="MSME Number"
                            name="msmeId"
                            rules={[
                              { required: true, message: "" },
                              {
                                pattern: /^UDYAM-[A-Z]{2}-\d{2}-\d{7}$/,
                                message:
                                  "MSME number must be in the format UDYAM-XX-00-0000000",
                              },
                            ]}
                          >
                            <Input />
                          </Form.Item>
                        </Field>
                      </Col>
                      <Col span={5}>
                        <Form.Item
                          label="MSME Type"
                          name="type"
                          rules={[{ required: true, message: "" }]}
                        >
                          <MySelect
                            options={msmeTypeOptions}
                            showError={isValid}
                            message="Please select MSME Type"
                          />
                        </Form.Item>
                      </Col>
                      <Col span={5}>
                        <Form.Item
                          label="MSME Activity"
                          name="activity"
                          rules={[{ required: true, message: "" }]}
                        >
                          <MySelect
                            options={msmeActivityOptions}
                            showError={isValid}
                            message="Please select MSME Activity"
                          />
                        </Form.Item>
                      </Col>
                      <Col span={5}>
                        <Form.Item
                          label="Effective From"
                          name="msmeEffectiveFrom"
                        >
                          <SingleDatePicker
                            size="default"
                            setDate={(value) =>
                              addVendorForm.setFieldValue(
                                "msmeEffectiveFrom",
                                value,
                              )
                            }
                          />
                        </Form.Item>
                      </Col>
                    </>
                  )}
                </Row>
              </Col>
            </Row>
          </Col>
        </Row>

        <Divider />
        <Divider />
        <Row gutter={16}>
          <Col span={4}>
            <Descriptions
              size="small"
              title={<p style={{ fontSize: "0.8rem" }}>GST Details</p>}
            >
              <Descriptions.Item
                contentStyle={{
                  fontSize: window.innerWidth < 1600 && "0.7rem",
                }}
              >
                Provide GSt Details
              </Descriptions.Item>
            </Descriptions>
          </Col>
          <Col span={12}>
            <Row gutter={16}>
              <Col span={8}>
                <Field
                  attr="required | Please enter GST Number"
                  value={gstinValue}
                  showValidation={isValid}
                >
                  <Form.Item
                    label="GST Number"
                    name="gstin"
                    rules={[{ required: true, message: "" }]}
                  >
                    <Input />
                  </Form.Item>
                </Field>
              </Col>
              <Col span={8}>
                <Form.Item
                  label="E-Invoice Applicability"
                  name="applicability"
                  rules={[{ required: true, message: "" }]}
                >
                  <MySelect
                    options={msmeOptions}
                    showError={isValid}
                    message="Please select E-Invoice Applicability"
                  />
                </Form.Item>
              </Col>
              {einvoice === "Y" && (
                <Col span={8}>
                  <Form.Item
                    label="Date of Applicability"
                    name="dobApplicabilty"
                    rules={rules.dobApplicabilty}
                  >
                    <SingleDatePicker
                      size="default"
                      setDate={(value) =>
                        addVendorForm.setFieldValue("dobApplicabilty", value)
                      }
                    />
                  </Form.Item>
                </Col>
              )}
            </Row>
          </Col>
        </Row>

        <Divider />
        <Row gutter={16}>
          <Col span={4}>
            <Descriptions
              size="small"
              title={<p style={{ fontSize: "0.8rem" }}>Branch Details</p>}
            >
              <Descriptions.Item
                contentStyle={{
                  fontSize: window.innerWidth < 1600 && "0.7rem",
                }}
              >
                Provide Branch Details
              </Descriptions.Item>
            </Descriptions>
          </Col>
          <Col span={20}>
            <Row gutter={16}>
              <Col span={6}>
                <Field
                  attr="required | Please enter Branch Name"
                  value={branchValue}
                  showValidation={isValid}
                >
                  <Form.Item
                    label="Branch Name"
                    name="branch"
                    rules={[{ required: true, message: "" }]}
                  >
                    <Input />
                  </Form.Item>
                </Field>
              </Col>
              <Col span={6}>
                <Form.Item
                  label="Select State"
                  name="state"
                  rules={[{ required: true, message: "" }]}
                >
                  <MyAsyncSelect
                    selectLoading={selectLoading}
                    onBlur={() => setAsyncOptions([])}
                    optionsState={asyncOptions}
                    loadOptions={getFetchState}
                    showError={isValid}
                    message="Please select a State"
                    labelInValue
                    value={stateValue}
                  />
                </Form.Item>
              </Col>
              <Col span={6}>
                <Field
                  attr="required | Please enter City"
                  value={cityValue}
                  showValidation={isValid}
                >
                  <Form.Item
                    label="City"
                    name="city"
                    rules={[{ required: true, message: "" }]}
                  >
                    <Input />
                  </Form.Item>
                </Field>
              </Col>
              <Col span={6}>
                <Field
                  attr="required | Please enter Pin Code"
                  value={pincodeValue}
                  showValidation={isValid}
                >
                  <Form.Item
                    label="Pin Code"
                    name="pincode"
                    rules={[{ required: true, message: "" }]}
                  >
                    <Input />
                  </Form.Item>
                </Field>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={24}>
                <Field
                  attr="required | Please enter Complete Address"
                  value={addressValue}
                  showValidation={isValid}
                >
                  <Form.Item
                    label="Complete Address"
                    name="address"
                    rules={[{ required: true, message: "" }]}
                  >
                    <Input.TextArea rows={4} />
                  </Form.Item>
                </Field>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={4}>
                <Descriptions
                  size="small"
                  title={<p style={{ fontSize: "0.8rem" }}>Bank Details</p>}
                >
                  <Descriptions.Item
                    contentStyle={{
                      fontSize: window.innerWidth < 1600 && "0.7rem",
                    }}
                  >
                    Provide Bank Details
                  </Descriptions.Item>
                </Descriptions>
              </Col>
              <Col span={20}>
                <Row gutter={16}>
                  <Col span={24}>
                    <Form.Item label="Type" name="transactionType">
                      <MySelect options={transactionTypeOptions} />
                    </Form.Item>
                  </Col>

                  <Col span={12}>
                    <Form.Item label="A/c No" name="accountNo">
                      <Input />
                    </Form.Item>
                  </Col>

                  <Col span={12}>
                    <Form.Item label="IFS Code" name="ifsCode">
                      <Input />
                    </Form.Item>
                  </Col>

                  <Col span={12}>
                    <Form.Item label="Bank Name" name="bankName">
                      <MySelect
                        placeholder="Select bank"
                        options={getVendorBranchBankOptions(bankNameWatch)}
                      />
                    </Form.Item>
                  </Col>

                  <Col span={12}>
                    <Form.Item label="Bank Branch" name="bankBranch">
                      <Input />
                    </Form.Item>
                  </Col>

                  <Col span={24}>
                    <Form.Item label="Currency of Ledger" name="ledgerCurrency">
                      <MySelect options={currencies} />
                    </Form.Item>
                  </Col>
                </Row>
              </Col>
            </Row>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col span={4} style={{ height: "20rem", overflowY: "scroll" }}>
            <Descriptions
              size="small"
              title={<p style={{ fontSize: "0.8rem" }}>Upload Document</p>}
            >
              <Descriptions.Item
                contentStyle={{
                  fontSize: window.innerWidth < 1600 && "0.7rem",
                }}
              >
                Upload vendor PDF document
              </Descriptions.Item>
            </Descriptions>
          </Col>
          <Col span={20}>
            <Row gutter={16}>
              <Col span={24}>
                <div style={{ flex: 1 }}>
                  <Col
                    span={24}
                    style={{
                      maxHeight: "calc(100vh - 20rem)",
                      overflowY: "auto",
                    }}
                  >
                    <Form.List name="components">
                      {(fields, { add, remove }) => (
                        <>
                          <Col>
                            {fields.map((field, index) => (
                              <Form.Item key={field.key} noStyle>
                                <SingleProduct
                                  fields={fields}
                                  field={field}
                                  index={index}
                                  add={add}
                                  form={addVendorForm}
                                  remove={remove}
                                  setFiles={setFiles}
                                  files={files}
                                />
                              </Form.Item>
                            ))}
                          </Col>
                        </>
                      )}
                    </Form.List>
                  </Col>
                </div>
              </Col>
            </Row>
          </Col>
        </Row>
      </Form>
      <NavFooter
        resetFunction={() => setShowResetConfirmModal(true)}
        submitFunction={validateHandler}
        nextLabel="Submit"
      />
    </div>
  );
};
const initialValues = {
  paymentTerms: 30,
  vendorName: "",
  panno: "",
  gstin: "",
  branch: "",
  state: "",
  mobile: "",
  city: "",
  pincode: "",
  address: "",
  transactionType: undefined,
  accountNo: "",
  ifsCode: "",
  bankName: "",
  bankBranch: "",
  ledgerCurrency: "",
  msmeStatus: "N",
  group: undefined,
  components: [{}],
};

const rules = {
  // keep validation rules aligned with ims-frontend when enabled
};

export default AddVendor;
