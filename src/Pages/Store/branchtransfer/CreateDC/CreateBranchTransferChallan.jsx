import { useState, useEffect } from "react";
import {
  Col,
  Descriptions,
  Divider,
  Form,
  Input,
  Row,
  Modal,
  Button,
  Tabs,
} from "antd";
import MyAsyncSelect from "../../../../Components/MyAsyncSelect";
import MySelect from "../../../../Components/MySelect";
import NavFooter from "../../../../Components/NavFooter";
import AddDCComponents from "./AddDCComponents";
import SuccessPage from "../SuccessPage";
import Loading from "../../../../Components/Loading";
import validateResponse from "../../../../Components/validateResponse";
import { imsAxios } from "../../../../axiosInterceptor";

import { getVendorOptions } from "../../../../api/general.ts";
import { convertSelectOptions } from "../../../../utils/general.ts";
import useApi from "../../../../hooks/useApi.ts";
import { useToast } from "../../../../hooks/useToast.js";
import Field from "../../../../Components/Field.jsx";

export default function CreateBranchTransferChallan() {
  const { showToast } = useToast();
  const [newGatePass, setNewGatePass] = useState({
    passType: "",
    pickupbranch: "",
    dropoffbranch: "",
    vendorName: "",
    vendorBranch: "",
    vendorAddress: "",
    vendorGSTIN: "",
    paymentTerms: "",
    referenceDate: "",
    otherReferences: "",
    dispatchDocNumber: "",
    dipatchThrough: "",
    destination: "",
    deliveryTerms: "",
    vehicleNumber: "",
    narration: "",
    billingId: "",
    billinAddress: "",
    billingPan: "",
    billingGSTIN: "",
  });

  const { executeFun, loading: loading1 } = useApi();
  const [asyncOptions, setAsyncOptions] = useState([]);
  const [billToOptions, setBillTopOptions] = useState([]);
  const [vendorBranches, setVendorBranches] = useState([]);
  const [isValid, setIsValid] = useState(false);
  const [pageLoading, setPageLoading] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [activeTab, setActiveTab] = useState();
  const [successPage, setSuccessPage] = useState(false);
  const [pickuplocation, setpickuplocation] = useState([]);
  const [droplocation, setdroplocation] = useState([]);
  const [branchOptions, setBranchOptions] = useState([]);

  const getfromtolocations = async (value) => {
    const response = await imsAxios.post("/branchTransfer/transferLocations", {
      from_branch: newGatePass.pickupbranch,
      to_branch: value,
    });
    if (response.success) {
      const droparr = [];
      const pickuparr = [];
      response.data.droplocs.map((a) =>
        droparr.push({ text: a.text, value: a.value }),
      );
      response.data.picklocs.map((a) =>
        pickuparr.push({ text: a.text, value: a.value }),
      );
      setpickuplocation(pickuparr);
      setdroplocation(droparr);
    } else {
      showToast(response.message, "error");
    }
  };

  const inputHandler = async (name, value) => {
    let obj = newGatePass;

    if (name == "vendorName") {
      const branches = await getVendorBracnch(value.value);
      const { address, gstin } = await getVendorAddress({
        vendorCode: value.value,
        vendorBranch: branches[0]?.value,
      });
      obj = {
        ...obj,
        [name]: value,
        vendorBranch: branches[0].value,
        vendorAddress: address,
        vendorGSTIN: gstin,
      };
    }
    if (name == "vendorBranch") {
      const { address, gstin } = await getVendorAddress({
        vendorCode: obj.vendorName.value,
        vendorBranch: value,
      });
      obj = {
        ...obj,
        [name]: value,
        vendorAddress: address,
        vendorGSTIN: gstin,
      };
    } else if (name == "billingId") {
      let billingDetails = await getBillingAddress(value);
      obj = {
        ...obj,
        [name]: value,
        billinAddress: billingDetails.address,
        billingGSTIN: billingDetails.gstin,
        billingPan: billingDetails.pan,
      };
    } else {
      obj = {
        ...obj,
        [name]: value,
      };
    }
    setNewGatePass(obj);
  };
  //getting vendor branches
  const getVendorBracnch = async (vendorCode) => {
    setPageLoading(true);
    const response = await imsAxios.post("/backend/vendorBranchList", {
      vendorcode: vendorCode,
    });
    setPageLoading(false);
    let validatedData = validateResponse(response);
    const arr = validatedData.map((d) => {
      return { value: d.id, text: d.text };
    });
    setVendorBranches(arr);
    return arr;
  };
  // getting vendors for vendor select
  const getVendors = async (search) => {
    if (search?.length > 2) {
      const response = await executeFun(
        () => getVendorOptions(search),
        "select",
      );
      let arr = [];
      if (response.success) {
        arr = convertSelectOptions(response.data);
      }
      setAsyncOptions(arr);
    }
  };
  // getting vendor address after selecting vendor branch
  const getVendorAddress = async ({ vendorCode, vendorBranch }) => {
    const response = await imsAxios.post("/backend/vendorAddress", {
      vendorcode: vendorCode,
      branchcode: vendorBranch,
    });
    let validatedData = validateResponse(response);
    return {
      address: validatedData?.address,
      gstin: validatedData?.gstid,
    };
  };

  // get all branch List

  const getallbranchs = async () => {
    const response = await imsAxios.get("/branchTransfer/listBranchTransfer");
    const arr = [];
    response.data.map((a) => arr.push({ text: a.text, value: a.id }));
    setBranchOptions(arr);
  };

  // gettig billing address
  const getBillTo = async () => {
    // setSelectLoading(true);
    const response = await imsAxios.post("/backend/billingAddressList", {
      search: "",
    });
    // setSelectLoading(false);
    let arr = [];
    arr = response?.data.map((d) => {
      return { text: d.text, value: d.id };
    });
    setBillTopOptions(arr);
  };
  // getting billing address details
  const getBillingAddress = async (billaddressid) => {
    setPageLoading(true);
    const response = await imsAxios.post("/backend/billingAddress", {
      billing_code: billaddressid,
    });
    setPageLoading(false);
    let validatedData = validateResponse(response);
    return {
      gstin: validatedData?.gstin,
      pan: validatedData?.pan,
      address: validatedData?.address,
    };
  };
  const validateDCDetails = () => {
    const hasEmptyField =
      !newGatePass.pickupbranch ||
      !newGatePass.dropoffbranch ||
      !newGatePass.vendorName?.value ||
      !newGatePass.vendorBranch ||
      !newGatePass.vendorAddress?.trim() ||
      !newGatePass.paymentTerms?.trim() ||
      !newGatePass.referenceDate?.trim() ||
      !newGatePass.otherReferences?.trim() ||
      !newGatePass.dispatchDocNumber?.trim() ||
      !newGatePass.dipatchThrough?.trim() ||
      !newGatePass.destination?.trim() ||
      !newGatePass.deliveryTerms?.trim() ||
      !newGatePass.vehicleNumber?.trim() ||
      !newGatePass.narration?.trim() ||
      !newGatePass.billingId ||
      !newGatePass.billinAddress?.trim();

    if (hasEmptyField) {
      setIsValid(true);
      return;
    }
    setIsValid(false);
    setActiveTab("2");
  };

  const resetFunction = () => {
    setNewGatePass({
      passType: "",
      pickupbranch: "",
      dropoffbranch: "",
      vendorName: "",
      vendorBranch: "",
      vendorAddress: "",
      vendorGSTIN: "",
      paymentTerms: "",
      referenceDate: "",
      otherReferences: "",
      dispatchDocNumber: "",
      dipatchThrough: "",
      destination: "",
      deliveryTerms: "",
      vehicleNumber: "",
      narration: "",
      billingId: "",
      billinAddress: "",
      billingPan: "",
      billingGSTIN: "",
    });
    setShowResetConfirm(false);
    setIsValid(false);
  };
  useEffect(() => {
    getBillTo();
    getallbranchs();
  }, []);
  return (
    <div
      style={{ height: "calc(100vh - 155px)", overflow: "hidden", padding: 10 }}
    >
      {!successPage && (
        <>
          {pageLoading && <Loading />}
          <Tabs
            style={{
              height: "100%",
              overflow: "auto",
              overflowX: "hidden",
              position: "relative",
            }}
            activeKey={activeTab}
            size="small"
          >
            <Tabs.TabPane
              tab={<span onClick={() => setActiveTab("1")}>DC Details</span>}
              key="1"
            >
              <>
                <div>
                  {/* reset confirm modal */}
                  <Modal
                    title="Confirm Reset!"
                    open={showResetConfirm}
                    onCancel={() => setShowResetConfirm(false)}
                    footer={[
                      <Button
                        key="back"
                        onClick={() => setShowResetConfirm(false)}
                      >
                        No
                      </Button>,
                      <Button
                        key="submit"
                        type="primary"
                        onClick={resetFunction}
                      >
                        Yes
                      </Button>,
                    ]}
                  >
                    <p>
                      Are you sure you want to reset the details of this
                      Delivery Challan?
                    </p>
                  </Modal>
                  {/* vendor */}
                  <Row>
                    <Col span={4}>
                      <Descriptions size="small" title="Transfer Details">
                        <Descriptions.Item
                          contentStyle={{
                            fontSize: window.innerWidth < 1600 && "0.7rem",
                          }}
                        >
                          Provide Transfer Type
                        </Descriptions.Item>
                      </Descriptions>
                    </Col>
                    <Col span={20}>
                      <Row gutter={16}>
                        {/* PO type */}
                        <Col span={6}>
                          <Form size="small" layout="vertical">
                            <Form.Item
                              label={
                                <span
                                  style={{
                                    fontSize:
                                      window.innerWidth < 1600 && "0.7rem",
                                  }}
                                >
                                  Pick Up Branch
                                </span>
                              }
                              required
                            >
                              <MySelect
                                size="default"
                                options={branchOptions}
                                value={newGatePass.pickupbranch}
                                showError={isValid}
                                message="Please select Pick Up Branch"
                                onChange={(value) => {
                                  inputHandler("pickupbranch", value);
                                }}
                              />
                            </Form.Item>
                          </Form>
                        </Col>
                        <Col span={6}>
                          <Form size="small" layout="vertical">
                            <Form.Item
                              label={
                                <span
                                  style={{
                                    fontSize:
                                      window.innerWidth < 1600 && "0.7rem",
                                  }}
                                >
                                  Drop Off Branch
                                </span>
                              }
                              required
                            >
                              <MySelect
                                size="default"
                                options={branchOptions}
                                value={newGatePass.dropoffbranch}
                                showError={isValid}
                                message="Please select Drop Off Branch"
                                onChange={(value) => {
                                  inputHandler("dropoffbranch", value);
                                  getfromtolocations(value);
                                }}
                              />
                            </Form.Item>
                          </Form>
                        </Col>
                      </Row>
                    </Col>
                  </Row>
                  <Divider />
                  <Row>
                    <Col span={4}>
                      <Descriptions size="small" title="Party Details">
                        <Descriptions.Item
                          contentStyle={{
                            fontSize: window.innerWidth < 1600 && "0.7rem",
                          }}
                        >
                          Type Name or Code of the vendor
                        </Descriptions.Item>
                      </Descriptions>
                    </Col>

                    <Col span={20}>
                      <Row gutter={16}>
                        {/* vendor type */}
                        <Col span={6}>
                          <Form size="small" layout="vertical">
                            <Form.Item
                              label={
                                <span
                                  style={{
                                    fontSize:
                                      window.innerWidth < 1600 && "0.7rem",
                                  }}
                                >
                                  Vendor Name
                                </span>
                              }
                              required
                            >
                              <MyAsyncSelect
                                selectLoading={loading1("select")}
                                size="default"
                                labelInValue
                                // onBlur={() => setAsyncOptions([])}
                                optionsState={asyncOptions}
                                value={newGatePass.vendorName}
                                onChange={(value) => {
                                  inputHandler("vendorName", value);
                                }}
                                loadOptions={getVendors}
                                showError={isValid}
                                message="Please select a Vendor"
                              />
                            </Form.Item>
                          </Form>
                        </Col>

                        {/* venodr branch */}
                        <Col span={6}>
                          <Form size="small" layout="vertical">
                            <Form.Item
                              label={
                                <div
                                  style={{
                                    fontSize:
                                      window.innerWidth < 1600 && "0.7rem",
                                    display: "flex",
                                    justifyContent: "space-between",
                                    width: 350,
                                    // background: "red",
                                  }}
                                >
                                  Vendor Branch
                                </div>
                              }
                              required
                            >
                              <MySelect
                                value={newGatePass.vendorBranch}
                                onChange={(value) => {
                                  inputHandler("vendorBranch", value);
                                }}
                                options={vendorBranches}
                                showError={isValid}
                                message="Please select a Vendor Branch"
                              />
                            </Form.Item>
                          </Form>
                        </Col>
                        <Col span={6}>
                          <Form size="small" layout="vertical">
                            <Form.Item label="GSTIN">
                              <Input
                                size="default"
                                value={newGatePass.vendorGSTIN}
                                disabled
                              />
                            </Form.Item>
                          </Form>
                        </Col>
                      </Row>
                      <Row gutter={8}>
                        <Col span={18}>
                          <Form size="small" layout="vertical">
                            <Form.Item
                              label={
                                <span
                                  style={{
                                    fontSize:
                                      window.innerWidth < 1600 && "0.7rem",
                                  }}
                                >
                                  Bill From Address
                                </span>
                              }
                            >
                              <Field
                                attr="required | Please enter Bill From Address"
                                value={newGatePass.vendorAddress}
                                showValidation={isValid}
                              >
                                <Input.TextArea
                                  rows={4}
                                  value={newGatePass?.vendorAddress?.replaceAll(
                                    "<br>",
                                    "\n",
                                  )}
                                  onChange={(e) => {
                                    inputHandler(
                                      "vendorAddress",
                                      e.target.value,
                                    );
                                  }}
                                  style={{ resize: "none" }}
                                />
                              </Field>
                            </Form.Item>
                          </Form>
                        </Col>
                      </Row>
                    </Col>
                  </Row>
                  <Divider />
                  {/* PASS TERMS */}
                  <Row>
                    <Col span={4}>
                      <Descriptions size="small" title="DC Terms">
                        <Descriptions.Item
                          contentStyle={{
                            fontSize: window.innerWidth < 1600 && "0.7rem",
                          }}
                        >
                          Provide Branch Transfer terms and other information
                        </Descriptions.Item>
                      </Descriptions>
                    </Col>
                    <Col span={20}>
                      <Row gutter={16}>
                        {/* terms and conditions */}

                        <Col span={6}>
                          <Form size="small" layout="vertical">
                            <Form.Item
                              label={
                                <span
                                  style={{
                                    fontSize:
                                      window.innerWidth < 1600 && "0.7rem",
                                  }}
                                >
                                  Mode / Terms and Conditions
                                </span>
                              }
                            >
                              <Field
                                attr="required | Please enter Mode / Terms and Conditions"
                                value={newGatePass.paymentTerms}
                                showValidation={isValid}
                              >
                                <Input
                                  size="default"
                                  onChange={(e) =>
                                    inputHandler("paymentTerms", e.target.value)
                                  }
                                  value={newGatePass.paymentTerms}
                                />
                              </Field>
                            </Form.Item>
                          </Form>
                        </Col>
                        {/* reference and date */}
                        <Col span={6}>
                          <Form size="small" layout="vertical">
                            <Form.Item
                              label={
                                <span
                                  style={{
                                    fontSize:
                                      window.innerWidth < 1600 && "0.7rem",
                                  }}
                                >
                                  Reference Number & Date
                                </span>
                              }
                            >
                              <Field
                                attr="required | Please enter Reference Number & Date"
                                value={newGatePass.referenceDate}
                                showValidation={isValid}
                              >
                                <Input
                                  size="default"
                                  onChange={(e) =>
                                    inputHandler(
                                      "referenceDate",
                                      e.target.value,
                                    )
                                  } // onChange={inputHandler}
                                  value={newGatePass.referenceDate}
                                />
                              </Field>
                            </Form.Item>
                          </Form>
                        </Col>
                        {/* other refrences */}
                        <Col span={6}>
                          <Form size="small" layout="vertical">
                            <Form.Item
                              label={
                                <span
                                  style={{
                                    fontSize:
                                      window.innerWidth < 1600 && "0.7rem",
                                  }}
                                >
                                  Other Terms
                                </span>
                              }
                            >
                              <Field
                                attr="required | Please enter Other Terms"
                                value={newGatePass.otherReferences}
                                showValidation={isValid}
                              >
                                <Input
                                  size="default"
                                  value={newGatePass.otherReferences}
                                  onChange={(e) =>
                                    inputHandler(
                                      "otherReferences",
                                      e.target.value,
                                    )
                                  }
                                />
                              </Field>
                            </Form.Item>
                          </Form>
                        </Col>
                      </Row>
                      <Row gutter={16}>
                        {/* delivery terms */}
                        <Col span={6}>
                          <Form size="small" layout="vertical">
                            <Form.Item
                              label={
                                <span
                                  style={{
                                    fontSize:
                                      window.innerWidth < 1600 && "0.7rem",
                                  }}
                                >
                                  Terms of Delivery
                                </span>
                              }
                            >
                              <Field
                                attr="required | Please enter Terms of Delivery"
                                value={newGatePass.deliveryTerms}
                                showValidation={isValid}
                              >
                                <Input
                                  size="default"
                                  onChange={(e) =>
                                    inputHandler(
                                      "deliveryTerms",
                                      e.target.value,
                                    )
                                  }
                                  value={newGatePass.deliveryTerms}
                                />
                              </Field>
                            </Form.Item>
                          </Form>
                        </Col>
                        {/* dispatch doc number */}
                        <Col span={6}>
                          <Form size="small" layout="vertical">
                            <Form.Item
                              label={
                                <span
                                  style={{
                                    fontSize:
                                      window.innerWidth < 1600 && "0.7rem",
                                  }}
                                >
                                  Dispatch Doc Number
                                </span>
                              }
                            >
                              <Field
                                attr="required | Please enter Dispatch Doc Number"
                                value={newGatePass.dispatchDocNumber}
                                showValidation={isValid}
                              >
                                <Input
                                  size="default"
                                  onChange={(e) =>
                                    inputHandler(
                                      "dispatchDocNumber",
                                      e.target.value,
                                    )
                                  }
                                  value={newGatePass.dispatchDocNumber}
                                />
                              </Field>
                            </Form.Item>
                          </Form>
                        </Col>
                        {/* dispatch trough */}
                        <Col span={6}>
                          <Form size="small" layout="vertical">
                            <Form.Item
                              label={
                                <span
                                  style={{
                                    fontSize:
                                      window.innerWidth < 1600 && "0.7rem",
                                  }}
                                >
                                  Dispatched Through
                                </span>
                              }
                            >
                              <Field
                                attr="required | Please enter Dispatched Through"
                                value={newGatePass.dipatchThrough}
                                showValidation={isValid}
                              >
                                <Input
                                  onChange={(e) =>
                                    inputHandler(
                                      "dipatchThrough",
                                      e.target.value,
                                    )
                                  }
                                  value={newGatePass.dipatchThrough}
                                />
                              </Field>
                            </Form.Item>
                          </Form>
                        </Col>
                      </Row>
                      <Row gutter={16}>
                        {/* destination */}
                        <Col span={6}>
                          <Form size="small" layout="vertical">
                            <Form.Item
                              label={
                                <div
                                  style={{
                                    fontSize:
                                      window.innerWidth < 1600 && "0.7rem",
                                    display: "flex",
                                    justifyContent: "space-between",
                                    width: 350,
                                  }}
                                >
                                  Destination
                                </div>
                              }
                            >
                              <Field
                                attr="required | Please enter Destination"
                                value={newGatePass.destination}
                                showValidation={isValid}
                              >
                                <Input
                                  size="default"
                                  onChange={(e) =>
                                    inputHandler("destination", e.target.value)
                                  }
                                  value={newGatePass.destination}
                                />
                              </Field>
                            </Form.Item>
                          </Form>
                        </Col>
                        {/* vehicle number */}
                        <Col span={6}>
                          <Form size="small" layout="vertical">
                            <Form.Item
                              label={
                                <span
                                  style={{
                                    fontSize:
                                      window.innerWidth < 1600 && "0.7rem",
                                  }}
                                >
                                  Vehicle Number
                                </span>
                              }
                            >
                              <Field
                                attr="required | Please enter a Vehicle Number"
                                value={newGatePass.vehicleNumber}
                                showValidation={isValid}
                              >
                                <Input
                                  size="default"
                                  onChange={(e) =>
                                    inputHandler(
                                      "vehicleNumber",
                                      e.target.value,
                                    )
                                  }
                                  value={newGatePass.vehicleNumber}
                                />
                              </Field>
                            </Form.Item>
                          </Form>
                        </Col>
                      </Row>
                      <Row>
                        <Col span={18}>
                          <Form size="small" layout="vertical">
                            <Form.Item
                              label={
                                <span
                                  style={{
                                    fontSize:
                                      window.innerWidth < 1600 && "0.7rem",
                                  }}
                                >
                                  Narration
                                </span>
                              }
                            >
                              <Field
                                attr="required | Please enter Narration"
                                value={newGatePass.narration}
                                showValidation={isValid}
                              >
                                <Input.TextArea
                                  rows={4}
                                  value={newGatePass?.narration}
                                  onChange={(e) =>
                                    inputHandler("narration", e.target.value)
                                  }
                                  style={{ resize: "none" }}
                                />
                              </Field>
                            </Form.Item>
                          </Form>
                        </Col>
                      </Row>
                    </Col>
                  </Row>

                  <Divider />
                  <Row>
                    <Col span={4}>
                      <Descriptions size="small" title="Warehouse Details">
                        <Descriptions.Item
                          contentStyle={{
                            fontSize: window.innerWidth < 1600 && "0.7rem",
                          }}
                        >
                          Provide warehouse information
                        </Descriptions.Item>
                      </Descriptions>
                    </Col>
                    <Col span={20}>
                      <Row gutter={16}>
                        {/* billing id */}
                        <Col span={6}>
                          <Form size="small" layout="vertical">
                            <Form.Item
                              label={
                                <span
                                  style={{
                                    fontSize:
                                      window.innerWidth < 1600 && "0.7rem",
                                  }}
                                >
                                  Billing Id
                                </span>
                              }
                              required
                            >
                              <MySelect
                                size="default"
                                value={newGatePass.billingId}
                                onChange={(value) => {
                                  inputHandler("billingId", value);
                                }}
                                options={billToOptions}
                                showError={isValid}
                                message="Please select a Billing Address"
                              />
                            </Form.Item>
                          </Form>
                        </Col>
                        {/* pan number */}
                        <Col span={6}>
                          <Form size="small" layout="vertical">
                            <Form.Item
                              label={
                                <span
                                  style={{
                                    fontSize:
                                      window.innerWidth < 1600 && "0.7rem",
                                  }}
                                >
                                  PAN
                                </span>
                              }
                            >
                              <Input
                                disabled
                                size="default"
                                name="bill_pan"
                                value={newGatePass.billingPan}
                              />
                            </Form.Item>
                          </Form>
                        </Col>
                        {/* gstin */}
                        <Col span={6}>
                          <Form size="small" layout="vertical">
                            <Form.Item
                              label={
                                <span
                                  style={{
                                    fontSize:
                                      window.innerWidth < 1600 && "0.7rem",
                                  }}
                                >
                                  GSTIN / UIN
                                </span>
                              }
                            >
                              <Input
                                disabled
                                size="default"
                                name="bill_gstin"
                                value={newGatePass.billingGSTIN}
                              />
                            </Form.Item>
                          </Form>
                        </Col>
                      </Row>
                      {/* billing address */}
                      <Row>
                        <Col span={18}>
                          <Form size="small" layout="vertical">
                            <Form.Item
                              label={
                                <span
                                  style={{
                                    fontSize:
                                      window.innerWidth < 1600 && "0.7rem",
                                  }}
                                >
                                  Billing Address
                                </span>
                              }
                            >
                              <Field
                                attr="required | Please enter a Billing Address"
                                value={newGatePass.billinAddress}
                                showValidation={isValid}
                              >
                                <Input.TextArea
                                  style={{ resize: "none" }}
                                  rows={4}
                                  onChange={(e) =>
                                    inputHandler(
                                      "billinAddress",
                                      e.target.value,
                                    )
                                  }
                                  value={newGatePass.billinAddress?.replaceAll(
                                    "<br>",
                                    " ",
                                  )}
                                />
                              </Field>
                            </Form.Item>
                          </Form>
                        </Col>
                      </Row>
                    </Col>
                  </Row>
                  <Divider />
                </div>
                <NavFooter
                  resetFunction={() => setShowResetConfirm(true)}
                  submitFunction={validateDCDetails}
                />
              </>
            </Tabs.TabPane>
            <Tabs.TabPane
              tab={<span>Component Details</span>}
              disabled={activeTab !== "2"}
              key="2"
              style={{ height: "100%", overflowY: "hidden" }}
            >
              <div style={{ height: "100%" }}>
                <AddDCComponents
                  setActiveTab={setActiveTab}
                  newGatePass={newGatePass}
                  detailsResetFunction={resetFunction}
                  setSuccessPage={setSuccessPage}
                  setPageLoading={setPageLoading}
                  pickuplocs={pickuplocation}
                  droplocs={droplocation}
                />
              </div>
            </Tabs.TabPane>
          </Tabs>
        </>
      )}
      {successPage && (
        <SuccessPage
          successInfo={successPage}
          createNewDC={() => {
            setSuccessPage(false);
            setActiveTab("1");
          }}
        />
      )}
    </div>
  );
}
