import { Col, Form, Input, Row, Modal, Card } from "antd";
import { useEffect, useState } from "react";
import MyAsyncSelect from "../../../../Components/MyAsyncSelect";
import { imsAxios } from "../../../../axiosInterceptor";
import NavFooter from "../../../../Components/NavFooter";
import Loading from "../../../../Components/Loading";
import { useToast } from "../../../../hooks/useToast.js";
import FormTable2 from "../../../../Components/FormTable2";
import MySelect from "../../../../Components/MySelect";
import { submitScrapreChallan } from "../api";
import SingleDatePicker from "../../../../Components/SingleDatePicker";
import {
  getComponentDetail,
  getComponentOptions,
} from "../../../../api/general.ts";
import useApi from "../../../../hooks/useApi.ts";
import { convertSelectOptions } from "../../../../utils/general.ts";
import { useNavigate, useSearchParams } from "react-router-dom";
import Field from "../../../../Components/Field.jsx";

const CreateScrapeChallan = () => {
  const { showToast } = useToast();
  const [addOptions, setAddOptions] = useState([]);
  const [ClientBranchOptions, setclientBranchOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isValid, setIsValid] = useState(false);
  const [clientData, setClientData] = useState([]);
  const [asyncOptions, setAsyncOptions] = useState([]);
  const [clientcode, setClientCode] = useState("");
  const [searchParams] = useSearchParams();
  const [editScrapeChallan, setEditScrapeChallan] = useState("");
  const [challanId, setChallanID] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [remarkValid, setRemarkValid] = useState(false);

  const [challanForm] = Form.useForm();
  const isthereClientCode = Form.useWatch("clientname", challanForm);
  const [ModalForm] = Form.useForm();
  const defaultValues = {
    vendorType: "v01",
    vendorName: "",
    vendorBranch: "",
    gstin: "",
    vendorAddress: "",
    ewaybill: "",
    companybranch: "BRALWR36",
    projectID: "",
    costCenter: "",
    components: [
      {
        component: "",
        qty: "",
        rate: "",
        value: "",
        hsnCode: "",
        remarks: "",
      },
    ],
  };
  var challan = searchParams.get("challan");

  const navigate = useNavigate();
  const { executeFun, loading: componentLoading } = useApi();
  //   get client options -->
  const getClientOptions = async (inputValue) => {
    try {
      setLoading("select");
      const response = await imsAxios.post("/backend/getClient", {
        searchTerm: inputValue,
      });
      if (response?.success) {
        let arr = response.data.map((row) => ({
          text: row.name,
          value: row.code,
        }));
        setAsyncOptions(arr);
      } else {
        showToast("Some error occured wile getting vendors", "error");
      }
    } catch (error) {
      showToast(error, "error");
    } finally {
      setLoading(false);
    }
  };
  const handlebilladress = (e) => {
    clientData?.branchList?.map((item) => {
      if (item.id === e.value || item.id === e) {
        // challanForm.setFieldValue("billPan", clientData.client.pan_no);
        // challanForm.setFieldValue("billGST", item.gst);
        challanForm.setFieldValue("billingaddress", item.address);
        challanForm.setFieldValue("clientAddrId", item.id);
      }
    });
  };
  const getAddInfo = async (e) => {
    try {
      setLoading("fetch");
      const response = await imsAxios.post("backend/fetchClientAddress", {
        addressID: e,
        code: clientcode,
      });
      if (response.success) {
        challanForm.setFieldValue("address", response?.data.address);
      }
    } catch (error) {
      showToast(error?.message || error, "error");
    } finally {
      setLoading(false);
    }
  };
  const handleaddress = (e) => {
    addOptions.map((item) => {
      if (item.value === e.value || item.value === e) {
        challanForm.setFieldValue("shippingaddress", item.address);
      }
    });
  };
  //   get vendor branch options
  const getclientDetials = async (inputValue, dm) => {
    try {
      setLoading("fetch");
      setClientCode(inputValue);
      const response = await imsAxios.post("/backend/fetchClientDetail", {
        code: inputValue,
      });
      const { data } = response;
      if (response.success) {
        const arr = data.branchList.map((row) => ({
          text: row.text,
          value: row.id,
          address: row.address,
        }));
        setclientBranchOptions(arr);
        setAddOptions(arr);
        setClientData(data);
        if (dm === undefined && editScrapeChallan !== "edit") {
          challanForm.setFieldValue("clientbranch", "");
          challanForm.setFieldValue("gstin", "");
          challanForm.setFieldValue("address", "");
        }
      } else {
        showToast(response.message, "error");
      }
    } catch (error) {
      showToast(error, "error");
    } finally {
      setLoading(false);
    }
  };
  const handleFetchComponentOptions = async (search) => {
    const response = await executeFun(
      () => getComponentOptions(search),
      "select",
    );
    let arr = [];
    if (response.success) {
      arr = convertSelectOptions(response.data);
    }
    setAsyncOptions(arr);
  };
  const calculation = (fieldName, watchValues) => {
    const { qty, rate } = watchValues;
    const value = +Number(qty ?? 0) * +Number(rate ?? 0).toFixed(3);

    challanForm.setFieldValue(
      ["components", fieldName, "value"],
      +Number(value).toFixed(3),
    );
  };
  const handleFetchComponentDetails = async (row, rowId, value) => {
    const response = await executeFun(
      () => getComponentDetail(value.value),
      "fetch",
    );
    if (response.success) {
      const { data } = response;
      challanForm.setFieldValue(["components", rowId, "gstRate"], data.gstrate);
      challanForm.setFieldValue(["components", rowId, "hsnCode"], data.hsn);
      challanForm.setFieldValue(["components", rowId, "rate"], data.rate);
    }
  };
  const hasIncompleteRow = (rows) =>
    (rows || []).some(
      (r) =>
        !r?.component ||
        !r?.qty ||
        Number(r?.qty) <= 0 ||
        !r?.rate ||
        Number(r?.rate) <= 0 ||
        !r?.hsnCode,
    );

  const validateHandler = async () => {
    let values;
    try {
      values = await challanForm.validateFields();
    } catch (error) {
      setIsValid(true);
      return;
    }
    if (hasIncompleteRow(values.components)) {
      setIsValid(true);
      return;
    }
    setIsValid(false);
    setRemarkValid(false);
    setConfirmOpen(true);
  };

  const handleConfirmSubmit = async () => {
    try {
      await ModalForm.validateFields();
    } catch (error) {
      setRemarkValid(true);
      return;
    }
    setRemarkValid(false);
    await submitHandler();
  };
  const submitHandler = async () => {
    let values, remarkvalue;
    try {
      values = await challanForm.validateFields();
      remarkvalue = await ModalForm.validateFields();
    } catch (error) {
      setIsValid(true);
      return;
    }
    if (hasIncompleteRow(values.components)) {
      setIsValid(true);
      return;
    }

    let payload = {
      header: {
        billingaddr: values.billingaddress,
        billingid: values.billingid.value,
        client_id: values.clientname.value,
        client_addr_id: values.clientbranch,
        clientaddr: values.address,
        dispatchaddr: values.shippingaddress,
        dispatchid: values.dispatchid.value,

        eway_no: values.nature,
        ship_doc: values.pd,
        other_ref: values.or,
        vehicle: values.vn,
        insert_dt: values.insertDate,
        challan_remark: remarkvalue.remark,
      },
      material: {
        component: values.components.map((r) => r.component.key),
        hsncode: values.components.map((r) => r.hsnCode),
        qty: values.components.map((r) => r.qty),
        rate: values.components.map((r) => r.rate),
        value: values.components.map((r) => r.value),
        comp_remark: values.components.map((r) => r.remarks),
      },
    };
    // console.log("payload", payload);
    // console.log("addressid", values);
    let response;
    let editPayload = {
      challan_id: challanId,
      header: {
        clientadd_id: values.components[0]?.clientBranchId,
        clientaddress: values.address,
        ship_doc_no: values.pd,
        vehicle: values.vn,
        eway_no: values.nature,
        other_ref: values.or,
        billingid: values.billingid && values.billingid?.value,
        billingaddress: values.billingaddress,
        dispatchid: values.dispatchid && values.dispatchid?.value,
        dispatchaddress: values.shippingaddress,
        challan_remark: remarkvalue.remark,
      },
      material: {
        id: values.components.map((r) => r.rowID),
        component: values.components.map((r) => r.componentKey),
        qty: values.components.map((r) => r.qty),
        rate: values.components.map((r) => r.rate),
        hsncode: values.components.map((r) => r.hsnCode),
        remark: values.components.map((r) => r.remarks),
      },
    };

    setLoading(true);
    try {
      if (editScrapeChallan === "edit") {
        response = await imsAxios.post(
          "/wo_challan/updateWO_ScrapChallan",
          editPayload,
        );

        if (response.success) {
          showToast(response.message, "success");
          challanForm.resetFields();
          ModalForm.resetFields();
          setConfirmOpen(false);
          navigate("/wo/view-challan");
        } else {
          showToast(response.message, "error");
        }
      } else {
        response = await executeFun(
          () => submitScrapreChallan(payload),
          "select",
        );

        if (response.success) {
          challanForm.resetFields();
          ModalForm.resetFields();
          setConfirmOpen(false);
          setRemarkValid(false);
        } else {
          showToast(response.message || response.data?.error, "error");
        }
      }
    } finally {
      setLoading(false);
    }
  };
  const getScrapeDetails = async (challan) => {
    let response;
    try {
      setLoading("fetch");
      response = await imsAxios.post("/wo_challan/editWO_ScrapChallan", {
        challan_no: challan,
      });
    } catch (error) {
      showToast(error?.message || error, "error");
      return;
    } finally {
      setLoading(false);
    }
    setEditScrapeChallan("edit");

    if (response.success) {
      challanForm.setFieldValue("clientname", response.header.clientcode);
      challanForm.setFieldValue(
        "clientnameCode",
        response.header.clientcode.value,
      );
      challanForm.setFieldValue("clientbranch", response.header.client_branch);

      challanForm.setFieldValue("nature", response.header.eway_no);
      challanForm.setFieldValue("pd", response.header.ship_doc_no);
      challanForm.setFieldValue("vn", response.header.vehicle);
      challanForm.setFieldValue("or", response.header.other_ref);
      challanForm.setFieldValue(
        "address",
        response.header.clientaddress?.label,
      );
      challanForm.setFieldValue("billingid", response.header.billing_info);
      challanForm.setFieldValue(
        "billingaddress",
        response.header.billing_address,
      );
      challanForm.setFieldValue("dispatchid", response.header.dispatch_info);
      ModalForm.setFieldValue("remark", response.header.challan_remark);
      challanForm.setFieldValue(
        "shippingaddress",
        response.header.dispatch_address,
      );
      let arr = response.material.map((r) => {
        return {
          component: { label: r.component_name, value: r.component_key },
          qty: r.out_qty,
          rate: r.part_rate,
          valu: r.component_name,
          hsnCode: r.hsn_code,
          remarks: r.remarks,
          rowID: r.row_id,
          componentKey: r.component_key,
          clientBranchId: response.header?.clientaddress?.value,
        };
      });

      challanForm.setFieldValue("components", arr);
    }
  };
  useEffect(() => {
    if (challan) {
      getScrapeDetails(challan);
      setChallanID(challan);
    }
  }, [challan]);
  useEffect(() => {
    if (isthereClientCode && editScrapeChallan === "edit") {
      let a = challanForm.getFieldValue("clientnameCode");
      console.log("isthereClientCode", a);
      getclientDetials(a);
    }
  }, [isthereClientCode]);

  return (
    <>
      {loading === "fetch" && <Loading />}
      <Form
        style={{ height: "calc(100vh - 180px)", margin: 10 }}
        layout="vertical"
        form={challanForm}
        initialValues={defaultValues}
      >
        <Row gutter={8} style={{ height: "100%", overflow: "hidden" }}>
          <Col span={6} style={{ height: "100%", overflow: "hidden" }}>
            <Row gutter={[0, 6]} style={{ overflow: "auto", height: "100%" }}>
              <Col span={24}>
                <Card size="small" title="Client Details">
                  <Form.Item
                    name="clientname"
                    label="Client Name"
                    rules={[{ required: true, message: "" }]}
                  >
                    <MyAsyncSelect
                      selectLoading={loading === "select"}
                      size="default"
                      labelInValue
                      onBlur={() => setAsyncOptions([])}
                      optionsState={asyncOptions}
                      loadOptions={getClientOptions}
                      onChange={(value) => getclientDetials(value.value)}
                      showError={isValid}
                      message="Please select Client!"
                    />
                  </Form.Item>
                  <Form.Item
                    name="clientbranch"
                    label="Client Branch"
                    rules={[{ required: true, message: "" }]}
                  >
                    <MySelect
                      options={ClientBranchOptions}
                      onChange={(e) => {
                        getAddInfo(e);
                      }}
                      size="default"
                      placeholder="Select Client Branch!"
                      showError={isValid}
                      message="Please select client branch!"
                    />
                  </Form.Item>

                  <Row gutter={6}>
                    <Col span={12}>
                      <Form.Item name="nature" label="E-way Bill Number">
                        <Input />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item name="pd" label="Ship Doc. Number">
                        <Input />
                      </Form.Item>
                    </Col>
                  </Row>
                  <Form.Item
                    name="vn"
                    label="Vehicle Number"
                    // rules={[{ required: true, message: "Please input Vechile Number!" }]}
                  >
                    <Input />
                  </Form.Item>
                  <Form.Item name="or" label="Other References">
                    <Input />
                  </Form.Item>
                  <Form.Item
                    name="address"
                    label="Client Address"
                    rules={[{ required: true, message: "" }]}
                  >
                    <Field
                      attr="required | Please select address!"
                      showValidation={isValid}
                    >
                      <Input />
                    </Field>
                  </Form.Item>
                  {!editScrapeChallan && (
                    <Form.Item
                      label="Insert Date"
                      name="insertDate"
                      rules={[{ required: true, message: "" }]}
                    >
                      <SingleDatePicker
                        setDate={(value) =>
                          challanForm.setFieldValue("insertDate", value)
                        }
                        showError={isValid}
                        message="Please Enter Insert Date"
                      />
                    </Form.Item>
                  )}
                </Card>
              </Col>

              <Col span={24}>
                <Card
                  size="small"
                  title="Billing Details"
                  style={{ height: "100%", overflow: "hidden" }}
                  bodyStyle={{ overflow: "auto", height: "98%" }}
                >
                  <Form.Item
                    name="billingid"
                    label="Select billing Address"
                    rules={[{ required: true, message: "" }]}
                  >
                    <MySelect
                      options={addOptions}
                      labelInValue
                      onChange={(e) => {
                        handlebilladress(e);
                      }}
                      showError={isValid}
                      message="Please select billing Address!"
                    />
                  </Form.Item>
                  <Form.Item
                    name="billingaddress"
                    label="Complete Address"
                    rules={[{ required: true, message: "" }]}
                  >
                    <Field
                      attr="required | Please enter Billing Address!"
                      showValidation={isValid}
                    >
                      <Input.TextArea rows={3} />
                    </Field>
                  </Form.Item>
                </Card>
              </Col>
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
                    <MySelect
                      options={addOptions}
                      labelInValue
                      onChange={(e) => {
                        handleaddress(e);
                      }}
                      showError={isValid}
                      message="Please select Dispatch Address!"
                    />
                  </Form.Item>
                  <Form.Item
                    name="shippingaddress"
                    label="Complete Address"
                    rules={[{ required: true, message: "" }]}
                  >
                    <Field
                      attr="required | Please enter Dispatch Address!"
                      showValidation={isValid}
                    >
                      <Input.TextArea rows={3} />
                    </Field>
                  </Form.Item>
                </Card>
              </Col>
            </Row>
          </Col>

          <Col span={18} style={{ height: "100%", overflow: "hidden" }}>
            <FormTable2
              removableRows={true}
              nonRemovableColumns={1}
              // columns={[
              //   ...productItems(
              //     location,

              //     asyncOptions,
              //     setAsyncOptions,
              //     getComponent
              //   ),
              // ]}
              columns={columns({
                handleFetchComponentOptions,
                componentLoading,
                asyncOptions,
                setAsyncOptions,

                handleFetchComponentDetails,
                // handleFetchPreviousRate,
                // compareRates,
                challanForm,
                // currencies,
                // setShowCurrenncy,
                isValid,
              })}
              listName="components"
              watchKeys={["rate", "qty", "gstRate"]}
              nonListWatchKeys={["gstType"]}
              componentRequiredRef={["rate", "qty"]}
              form={challanForm}
              calculation={calculation}
              rules={listRules}
              addableRow={true}
              reverse={true}
              newRow={defaultValues.components[0]}
            />
          </Col>
        </Row>
      </Form>
      <NavFooter
        type="primary"
        resetFunction={() => {
          challanForm.resetFields();
          setIsValid(false);
          setRemarkValid(false);
        }}
        submitFunction={validateHandler}
        nextLabel="Submit"
        loading={loading === true}
      />
      <Modal
        open={confirmOpen}
        title="Do you want to submit Scrape Challan?"
        okText="Submit"
        confirmLoading={loading === true || loading === "select"}
        onOk={handleConfirmSubmit}
        onCancel={() => {
          setConfirmOpen(false);
          setRemarkValid(false);
        }}
      >
        <Form form={ModalForm} layout="vertical">
          <Form.Item
            name="remark"
            label="Remark"
            rules={[{ required: true, whitespace: true, message: "" }]}
          >
            <Field
              attr="required | Please input remark!"
              showValidation={remarkValid}
            >
              <Input.TextArea
                rows={3}
                maxLength={250}
                placeholder="Please input the remark"
              />
            </Field>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};
const listRules = {
  hsn: [
    {
      required: true,
      message: "Please enter a HSN code!",
    },
  ],
  location: [
    {
      required: true,
      message: "Please select a Location!",
    },
  ],
  qty: [
    {
      required: true,
      message: "Please enter MIN Qty!",
    },
  ],
  file: [
    {
      required: true,
      message: "Please select document!",
    },
  ],
  rate: [
    {
      required: true,
      message: "Please component rate!",
    },
  ],
  docDate: [
    {
      required: true,
      message: "Please select doc Date!",
    },
  ],
  invoiceId: [
    {
      required: true,
      message: "Please select doc id!",
    },
  ],
};

export default CreateScrapeChallan;

const columns = ({
  componentLoading,
  asyncOptions,
  setAsyncOptions,
  handleFetchComponentOptions,
  handleFetchComponentDetails,
  isValid,
}) => [
  {
    headerName: "Part Component",
    name: "component",
    field: (row, index) => (
      <Field
        attr="required | Please select a component!"
        value={row.component}
        showValidation={isValid}
      >
        <MyAsyncSelect
          onBlur={() => setAsyncOptions([])}
          selectLoading={componentLoading("select")}
          labelInValue
          loadOptions={handleFetchComponentOptions}
          optionsState={asyncOptions}
          onChange={(value) => {
            handleFetchComponentDetails(row, index, value);

            // handleFetchPreviousRate(value, index);
          }}
        />
      </Field>
    ),
    width: 250,
    flex: 1,
  },
  {
    headerName: "Qty",
    name: "qty",
    width: 100,
    // renderCell: ({ row }) => ,
    field: (row) => (
      <Field
        attr="required | Qty should be greater than zero!"
        value={row.qty}
        treatZeroAsEmpty
        showValidation={isValid}
      >
        <Input type="number" />
      </Field>
    ),
  },
  {
    headerName: "Rate",
    name: "rate",
    width: 100,
    // renderCell: ({ row }) => ,
    field: (row) => (
      <Field
        attr="required | Rate should be greater than zero!"
        value={row.rate}
        treatZeroAsEmpty
        showValidation={isValid}
      >
        <Input type="number" />
      </Field>
    ),
  },
  {
    headerName: "Value",
    name: "value",
    width: 100,
    // renderCell: ({ row }) => ,
    field: () => <Input type="number" />,
  },
  // {
  //   headerName: "Rate",
  //   name: "rate",
  //   rules: [
  //     {
  //       warningOnly: true,
  //       validator: (first, value) => {
  //         let fieldName = first.field.split(".");
  //         fieldName = fieldName.map((row) => {
  //           if (!isNaN(row)) {
  //             return +row;
  //           } else return row;
  //         });
  //         fieldName.pop();
  //         const row = form.getFieldValue(fieldName);
  //         const vendorType = form.getFieldValue("vendorType");

  //         if (
  //           row.previousRate != row.rate &&
  //           row.previousRate &&
  //           vendorType === "v01"
  //         ) {
  //           return Promise.reject(`Prev. rate was ${row.previousRate}`);
  //         } else {
  //           return Promise.resolve();
  //         }
  //       },
  //     },
  //   ],
  //   field: (row, index) => (
  //     <Input
  //       onChange={(e) => compareRates(e.target.value, index)}
  //       addonAfter={
  //         <div style={{ width: 50 }}>
  //           <Form.Item noStyle name={[index, "currency"]}>
  //             <MySelect
  //               options={currencies}
  //               onChange={(value) => {
  //                 value !== "364907247"
  //                   ? setShowCurrenncy({
  //                       currency: value,
  //                       price: row.value,
  //                       exchangeRate: row.exchangeRate,
  //                       symbol: currencies.filter(
  //                         (cur) => cur.value == value
  //                       )[0].text,
  //                       rowId: index,
  //                       form: form,
  //                     })
  //                   : form.setFieldValue(
  //                       ["components", index, "exchangeRate"],
  //                       1
  //                     );
  //               }}
  //             />
  //           </Form.Item>
  //         </div>
  //       }
  //     />
  //   ),
  //   width: 200,
  // },

  {
    headerName: "HSN Code",
    name: "hsnCode",
    field: (row) => (
      <Field
        attr="required | Please enter a HSN code!"
        value={row.hsnCode}
        showValidation={isValid}
      >
        <Input />
      </Field>
    ),
    width: 150,
  },

  {
    headerName: "Remarks",
    name: "remarks",
    field: () => <Input.TextArea rows={1} />,
    width: 250,
  },
];
