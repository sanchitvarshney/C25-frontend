import { useEffect, useState } from "react";
import MySelect from "../../../../Components/MySelect";
import { useToast } from "../../../../hooks/useToast.js";
import {
  Button,
  Drawer,
  Row,
  Col,
  Input,
  Form,
  Skeleton,
  Switch,
  Space,
  InputNumber,
  Typography,
  Divider,
  Flex,
} from "antd";
import { imsAxios } from "../../../../axiosInterceptor";
import UploadDocs from "../../../Store/MaterialIn/MaterialInWithPO/UploadDocs";
import MyButton from "../../../../Components/MyButton";
import { v4 } from "uuid";
import SingleDatePicker from "../../../../Components/SingleDatePicker";
import dayjs from "dayjs";
import { mergeMsmeYearOptions } from "../../../../utils/indianFinancialYear";

const msmeOptions = [
  { text: "Yes", value: "Y" },
  { text: "No", value: "N" },
];
const MSME_YEAR_LEGACY = [
  { text: "2023-2024", value: "2023-2024" },
  { text: "2024-2025", value: "2024-2025" },
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
// const transactionTypeOptions = [
//   { text: "Cheque", value: "cheque" },
//   { text: "e-Fund Transfer", value: "transfer" },
//   { text: "UPI", value: "upi" },
//   { text: "Other", value: "other" },
//   { text: "N/A", value: "na" },
// ];

const EditBranch = ({ fetchVendor, setEditVendor, editVendor }) => {
  const { showToast } = useToast();
  const [submitLoading, setSubmitLoading] = useState(false);
  const [skeletonLoading, setSkeletonLoading] = useState(false);
  const [vendorStatus, setVendorStatus] = useState();
  const [statusLoading, setStatusLoading] = useState(false);
  const [editMSME, setEditMSME] = useState([]);
  const [tdsOptions, setTdsOptions] = useState([]);
  const [rows, setRows] = useState([]);
  const [files, setFiles] = useState([]);
  const [updateVendorForm] = Form.useForm();
  const [updateMSMEForm] = Form.useForm();
  const [isMSMEEdited, setIsMSMEEdited] = useState([]);
  const einvoice = Form.useWatch("applicability", updateVendorForm);
  let msmeStat = "";
  msmeStat = Form.useWatch("vendor_msme_status", updateVendorForm);

  const getDetails = async () => {
    setSkeletonLoading(true);

    const tdsResponse = await imsAxios.get("/vendor/getAllTds");
    const vendorResponse = await imsAxios.post("/vendor/getVendor", {
      vendor_id: editVendor?.vendor_code,
    });
    setSkeletonLoading(false);

    if (tdsResponse.success) {
      const tdsArr = tdsResponse.data.map((row) => {
        return { text: row.tds_name, value: row.tds_key };
      });
      setTdsOptions(tdsArr);
    }

    if (vendorResponse.success) {
      const vendor = Array.isArray(vendorResponse.data)
        ? vendorResponse.data[0]
        : vendorResponse.data;

      const rawMsmeFrom = vendor?.msme_effective_from;
      const hasValidMsmeDate =
        rawMsmeFrom &&
        rawMsmeFrom !== "--" &&
        String(rawMsmeFrom).trim() !== "";
      const parsedMsmeFrom = hasValidMsmeDate ? dayjs(rawMsmeFrom) : null;
      const msmeEffectiveFrom = parsedMsmeFrom?.isValid()
        ? parsedMsmeFrom
        : undefined;

      const obj = {
        msmeStatus: vendor?.vendor_msme_status,
        year: vendor?.vendor_msme_year,
        msmeId: vendor?.vendor_msme_id,
        type: vendor?.vendor_msme_type,
        activity: vendor?.vendor_msme_activity,
        transactionType: vendor?.transaction_type,
        accountNo: vendor?.account_no,
        ifsCode: vendor?.ifs_code,
        bankName: vendor?.bank_name,
        bankBranch: vendor?.bank_branch,
        ledgerCurrency: vendor?.ledger_currency,
        msmeEffectiveFrom,
        ...vendor,
        applicability: vendor?.eInvoice?.status ?? vendor?.applicability,
        dobApplicabilty: vendor?.eInvoice?.date ?? vendor?.dobApplicabilty,
      };
      updateVendorForm.setFieldsValue(obj);
      setVendorStatus(obj.vendor_status);

      const msmedata = vendor?.msme_data || [];
      const a =
        msmedata?.map((r) => {
          return {
            vendor_msme_year: r.year,
            vendor_msme_type: r.type,
            vendor_msme_activity: r.activity,
            id: v4(),
          };
        }) ?? [];

      setRows(a);
      setIsMSMEEdited(false);
    }
  };


  const formatMsmeEffectiveFrom = (val) => {
    if (!val) return "--";
    return dayjs.isDayjs(val) ? val.format("DD-MM-YYYY") : val;
  };

  const submitHandler = async () => {
    let obj;
    const values = await updateVendorForm.validateFields();

    if (values.vendor_msme_status === "Y") {
      obj = {
        vendorcode: editVendor?.vendor_code,
        vendorname: values?.vendor_name,
        panno: values?.vendor_pan,
        cinno: values?.vendor_cin,
        tally_tds: values.vendor_tds,
        term_days: values.vendor_term_days,
        msme_status: values.vendor_msme_status,
        msme_year: rows.map((r) => r.vendor_msme_year),
        msme_id: values.vendor_msme_id,
        msme_type: rows.map((r) => r.vendor_msme_type),
        msme_activity: rows.map((r) => r.vendor_msme_activity),
        eInvoice: values.applicability || "N",
        dateOfApplicability:
          values.applicability === "Y" ? values.dobApplicabilty : "--",
        transaction_type: values.transactionType,
        account_no: values.accountNo,
        ifs_code: values.ifsCode,
        bank_name: values.bankName,
        bank_branch: values.bankBranch,
        ledger_currency: values.ledgerCurrency,
        msme_effective_from: formatMsmeEffectiveFrom(values.msmeEffectiveFrom),
      };
    } else {
      obj = {
        vendorcode: editVendor?.vendor_code,
        vendorname: values?.vendor_name,
        panno: values?.vendor_pan,
        cinno: values?.vendor_cin,
        tally_tds: values.vendor_tds,
        term_days: values.vendor_term_days,
        msme_status: "N",
        msme_id: "--",
        eInvoice: values.applicability || "N",
        dateOfApplicability:
          values.applicability === "Y" ? values.dobApplicabilty : "--",
        transaction_type: values.transactionType,
        account_no: values.accountNo,
        ifs_code: values.ifsCode,
        bank_name: values.bankName,
        bank_branch: values.bankBranch,
        ledger_currency: values.ledgerCurrency,
        msme_effective_from: formatMsmeEffectiveFrom(values.msmeEffectiveFrom),
      };
    }
    const formData = new FormData();
    formData.append("uploadfile", files[0] ?? []);
    formData.append("vendor", JSON.stringify(obj));
    setSubmitLoading(true);
    const response = await imsAxios.post("/vendor/updateVendor", formData);
    setSubmitLoading(false);
    if (response.success) {
      showToast(response.message, "success");
      fetchVendor();
      setEditVendor(null);
    } else {
      showToast(response.message, "error");
    }
  };

  const changeStatus = async (value) => {
    setStatusLoading(true);
    const response = await imsAxios.post("/vendor/updateVendorStatus", {
      status: value ? "B" : "A",
      vendor_code: editVendor?.vendor_code,
    });
    setStatusLoading(false);
    if (response.success) {
      showToast(response.message, "success");
      if (value) {
        setVendorStatus("B");
      } else {
        setVendorStatus("A");
      }
    }
  };



  useEffect(() => {
    if (editVendor) {
      getDetails();
    }
  }, [editVendor]);

  const deleteRow = (id) => {
    const newrows = rows.filter((a) => a.id !== id);
    setIsMSMEEdited(newrows);
    setRows(newrows);
  };

  const close = () => {
    setEditMSME(false);
    updateMSMEForm.resetFields();
  };

  useEffect(() => {
    if (rows) {
      setRows(rows);
    }
  }, [rows]);

  useEffect(() => {
    if (msmeStat === "N") {
      updateVendorForm.setFieldValue("vendor_msme_id", "--");
    }
  }, [msmeStat]);

  const saveMSMEEntry = async () => {
    setEditMSME(false);
    const values = await updateMSMEForm.validateFields();
    let value;
    let val;
    val = {
      id: v4(),
      vendor_msme_year: values.vendor_msme_year,
      vendor_msme_type: values.vendor_msme_type,
      vendor_msme_activity: values.vendor_msme_activity,
    };
    const found = rows.find(
      (row) => row.vendor_msme_year === val.vendor_msme_year
    );
    if (found) {
      const removerow = rows.filter(
        (r) => r.vendor_msme_year !== val.vendor_msme_year
      );
      value = [...removerow, val];
    } else {
      value = [...rows, val];
    }

    const a = value.filter((b) => b.vendor_msme_year !== "--");
    setIsMSMEEdited(a);
    setRows(a);
    updateMSMEForm.resetFields();
  };

  return (
    <>
      <Drawer
        title={`Update Vendor: ${editVendor?.vendor_code}`}
        open={editVendor}
        width={700}
        onClose={() => setEditVendor(false)}
        placement="right"
        footer={
          <Row style={{ width: "100%" }} align="middle" justify="space-between">
            <Col>
              <Form style={{ padding: 0, margin: 0 }}>
                <Form.Item label="Active" style={{ padding: 0, margin: 0 }}>
                  <Switch
                    loading={statusLoading}
                    checked={vendorStatus == "B"}
                    defaultChecked
                    onChange={changeStatus}
                  />
                </Form.Item>
              </Form>
            </Col>
            <Col>
              <Space>
                <Button key="back" onClick={() => setEditVendor(false)}>
                  Back
                </Button>

                <Button
                  key="submit"
                  type="primary"
                  loading={submitLoading}
                  onClick={submitHandler}
                >
                  Submit
                </Button>
              </Space>
            </Col>
          </Row>
        }
      >
        {<Skeleton active loading={skeletonLoading} />}
        {!skeletonLoading && (
          <Form
            form={updateVendorForm}
            layout="vertical"
          >
            <Row>
              <Col span={24}>
                <Form.Item label="Vendor Name" name="vendor_name">
                  <Input />
                </Form.Item>
              </Col>
              <Col span={24}>
                <Row gutter={8}>
                  <Col span={8}>
                    <Form.Item label="Pan Number" name="vendor_pan">
                      <Input />
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item label="CIN Number" name="vendor_cin">
                      <Input />
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item
                      label="Due Date (in days)"
                      name="vendor_term_days"
                    >
                      <InputNumber
                        style={{ width: "100%" }}
                        size="default"
                        min={1}
                        max={999}
                        type="number"
                      />
                    </Form.Item>
                  </Col>
                </Row>
              </Col>
              <Col span={24}>
                <Form.Item label="Vendor TDS" name="vendor_tds">
                  <MySelect
                    mode="multiple"
                    options={tdsOptions}
                  />
                </Form.Item>
              </Col>
   
              <Col span={8}>
                <Form.Item
                  style={{ padding: "3px" }}
                  label="E-Invoice Applicability"
                  name="applicability"
                >
                  <MySelect options={msmeOptions} />
                </Form.Item>
              </Col>
              {einvoice === "Y" && (
                <Col span={8}>
                  <Form.Item
                    style={{ padding: "3px" }}
                    label="Date of Applicability"
                    name="dobApplicabilty"
                  >
                    <SingleDatePicker
                      size="default"
                      setDate={(value) =>
                        updateVendorForm.setFieldValue("dobApplicabilty", value)
                      }
                    />
                  </Form.Item>
                </Col>
              )}
              <Col span={24}>
                <Row gutter={[10, 10]}>
                  <Col span={8}>
                    <Form.Item label="MSME Status" name="vendor_msme_status">
                      <MySelect options={msmeOptions} />
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item label="MSME Id" name="vendor_msme_id">
                      <Input />
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item label="Effective From" name="msmeEffectiveFrom">
                      <SingleDatePicker
                        size="default"
                        setDate={(value) =>
                          updateVendorForm.setFieldValue(
                            "msmeEffectiveFrom",
                            value
                          )
                        }
                        value={updateVendorForm.getFieldValue(
                          "msmeEffectiveFrom"
                        )}
                      />
                    </Form.Item>
                  </Col>
                </Row>
              </Col>
              <Col span={24} style={{ height: "10rem" }}>
                <Flex vertical gap={10} align="center">
                  <MyButton
                    variant="add"
                    type="default"
                    text="Add MSME"
                    onClick={() => setEditMSME(true)}
                  ></MyButton>
                  <Divider />
                  <Flex
                    gap={[10, 10]}
                    style={{ width: "100%" }}
                    justify="center"
                  >
                    <>
                      <div style={{ width: 185 }}>
                        <Typography.Text strong>Year</Typography.Text>
                      </div>
                      <div style={{ width: 180 }}>
                        <Typography.Text strong>Type</Typography.Text>
                      </div>
                      <div style={{ width: 200 }}>
                        <Typography.Text strong>Activity</Typography.Text>
                      </div>
                    </>
                  </Flex>
                  {isMSMEEdited ? (
                    <Flex
                      gap={10}
                      style={{ width: "100%" }}
                      justify="center"
                      vertical
                    >
                      {isMSMEEdited.map((a) => (
                        <Flex key={a.id}>
                          <div style={{ width: 40 }}></div>
                          <div style={{ width: 200 }}>
                            <Typography.Text
                              type="secondary"
                              style={{ fontSize: 12 }}
                            >
                              {a.vendor_msme_year}
                            </Typography.Text>
                          </div>
                          <div style={{ width: 180 }}>
                            <Typography.Text
                              type="secondary"
                              style={{ fontSize: 12 }}
                            >
                              {a.vendor_msme_type}
                            </Typography.Text>
                          </div>
                          <div style={{ width: 180 }}>
                            <Typography.Text
                              type="secondary"
                              style={{ fontSize: 12 }}
                            >
                              {a.vendor_msme_activity}
                            </Typography.Text>
                          </div>
                          <div style={{ width: 40 }}>
                            <MyButton
                              variant="delete"
                              text=""
                              size="small"
                              onClick={() => deleteRow(a.id)}
                            ></MyButton>
                          </div>
                        </Flex>
                      ))}
                    </Flex>
                  ) : msmeStat == "Y" ? (
                    <Flex
                      gap={10}
                      style={{ width: "100%" }}
                      justify="center"
                      vertical
                    >
                      {rows.map((a) => (
                        <Flex key={a.id}>
                          <div style={{ width: 40 }}></div>
                          <div style={{ width: 200 }}>
                            <Typography.Text
                              type="secondary"
                              style={{ fontSize: 12 }}
                            >
                              {a.vendor_msme_year}
                            </Typography.Text>
                          </div>
                          <div style={{ width: 180 }}>
                            <Typography.Text
                              type="secondary"
                              style={{ fontSize: 12 }}
                            >
                              {a.vendor_msme_type}
                            </Typography.Text>
                          </div>
                          <div style={{ width: 200 }}>
                            <Typography.Text
                              type="secondary"
                              style={{ fontSize: 12 }}
                            >
                              {a.vendor_msme_activity}
                            </Typography.Text>
                          </div>
                          <div style={{ width: 40 }}>
                            <MyButton
                              variant="delete"
                              text=""
                              size="small"
                              onClick={() => deleteRow(a.id)}
                            ></MyButton>
                          </div>
                        </Flex>
                      ))}
                    </Flex>
                  ) : (
                    ""
                  )}
                </Flex>
              </Col>
              <Divider />
      
              <Col span={24}>
                <Divider />
                <Form.Item label="Vendor Document" name="file">
                  <Row className="material-in-upload">
                    <UploadDocs
                      setFiles={setFiles}
                      files={files}
                    />
                  </Row>
                </Form.Item>
              </Col>
            </Row>
          </Form>
        )}
      </Drawer>
      <Drawer
        title={`Adding MSME for ${editVendor?.vendor_code}`}
        open={editMSME == true || isMSMEEdited == true}
        width={600}
        placement="right"
        onClose={close}
        extra={
          <Space>
            <Button onClick={close}>Back</Button>
            <Button
              type="primary"
              loading={submitLoading}
              onClick={saveMSMEEntry}
            >
              Save
            </Button>
          </Space>
        }
      >
        <Form
          form={updateMSMEForm}
          layout="vertical"
        >
          <Divider />
          <Row gutter={[10, 10]}>
            <Col span={8}>
              <Form.Item
                label="MSME Year"
                name="vendor_msme_year"
                rules={[
                  {
                    required: true,
                    message: "Please select the Year",
                  },
                ]}
              >
                <MySelect options={msmeYearOptions} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                label="MSME Type"
                name="vendor_msme_type"
                rules={[
                  {
                    required: true,
                    message: "Please select the Type",
                  },
                ]}
              >
                <MySelect options={msmeTypeOptions} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                label="MSME Activity"
                name="vendor_msme_activity"
                rules={[
                  {
                    required: true,
                    message: "Please select the Activity",
                  },
                ]}
              >
                <MySelect options={msmeActivityOptions} />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Drawer>
    </>
  );
};

export default EditBranch;
