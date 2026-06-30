import { useEffect, useState } from "react";
import {
  Button,
  Card,
  Col,
  Divider,
  Drawer,
  Form,
  Input,
  Row,
  Skeleton,
  Space,
} from "antd";
import MySelect from "../../../Components/MySelect";
import { imsAxios } from "../../../axiosInterceptor";
import { v4 } from "uuid";
import FormTableDataGrid from "../../../Components/FormTableDataGrid";
import ToolTipEllipses from "../../../Components/ToolTipEllipses";
import errorToast from "../../../Components/errorToast";
import { useToast } from "../../../hooks/useToast.js";
import Loading from "../../../Components/Loading";
import MyAsyncSelect from "../../../Components/MyAsyncSelect";
import NavFooter from "../../../Components/NavFooter";
import useLoading from "../../../hooks/useLoading";

function JWRMChallanEditMaterials({
  editingJWMaterials,
  setEditingJWMaterials,
  getRows,
}) {
  const { showToast } = useToast();
  const [rows, setRows] = useState([]);
  const [vendorData, setVendorData] = useState(null);
  const [loading, setLoading] = useLoading();
  const [asyncOptions, setAsyncOptions] = useState([]);
  const [vendorBranchOptions, setVendorBranchOptions] = useState([]);
  const [bilingAddressOptions, setBillingAddressOptions] = useState([]);
  const [dispatchAddressOptions, setDispatchAddressOptions] = useState([]);

  const [createJobWorkChallanForm] = Form.useForm();
  const getDetails = async () => {
   
    setLoading("fetchingDetails", true);
    const response = await imsAxios.post("/jobwork/editJobworkChallan", {
      challan_no: editingJWMaterials,
    });
  
    setLoading("fetchingDetails", false);
    if (response?.success) {
      const material = response?.data?.material ?? [];
      const arr = material.map((row, index) => ({
        id: v4(),
        index: index + 1,
        ...row,
      }));
      setRows(arr);

      const obj = response?.data?.header ?? {};
      const vendorCode = obj.vendorcode;
      const vendor = vendorCode
        ? { label: vendorCode.label, value: vendorCode.value }
        : null;
      try {
        createJobWorkChallanForm.setFieldsValue({ ...obj, vendor });
        if (vendorCode?.value) {
          await getVendorBranches(vendorCode.value);
        }
        if (obj.dispatch_info?.value) {
          await getDispatchAddressDetails(obj.dispatch_info.value);
        }
        if (obj.billing_info?.value) {
          await getBillingAddressDetails(obj.billing_info.value);
        }
        setVendorData(vendor ? { vendor, ...obj } : obj);
      } catch (err) {
        console.error("Error setting form/address details:", err);
      }
    }
  };
  const inputHandler = (name, value, id) => {
    let arr = rows;
    arr = arr.map((row) => {
      if (row.id === id) {
        row = {
          ...row,
          [name]: value,
        };
        return row;
      } else {
        return row;
      }
    });
    setRows(arr);
  };
  const submitHandler = async () => {
    let vendor = createJobWorkChallanForm.getFieldsValue();

    const finalObj = {
      material: {
        component: rows.map((row) => row.component_key),
        hsncode: rows.map((row) => row.hsn_code),
        qty: rows.map((row) => row.issue_qty),
        rate: rows.map((row) => row.part_rate),
        remark: rows.map((row) => row.remarks),
      },
      header: {
        vendorbranch: vendor.vendorbranch.value ?? vendor.vendorbranch,
        vendoraddress: vendor.vendor_address,
        nature: vendor.nature_process,
        duration: vendor.duration_process,
        vehicle: vendor.vehicle,
        other_ref: vendor.other_ref,
        billingid: vendor.billing_info.value ?? vendor.billing_info,
        billingaddress: vendor.billing_address,
        dispatchid: vendor.dispatch_info.value ?? vendor.dispatch_info,
        dispatchaddress: vendor.dispatch_to__line1,
      },
      transaction_id: editingJWMaterials,
    };
    console.log(finalObj);

    setLoading("submit", true);
    const response = await imsAxios.post(
      "/jobwork/updateJobworkChallan",
      finalObj
    );
    setLoading("submit", false);
    if (response.success) {
      showToast(response.message, "success");
      setEditingJWMaterials(false);
      getRows();
    } else {
      if (response.message) {
        showToast(response.message, "error");
      } else {
        showToast(errorToast(response.message), "error");
      }
    }
  };
  const getAsyncOptions = async (search, type) => {
    let link =
      type === "dispatch"
        ? "/backend/dispatchAddressList"
        : type === "billing"
        ? "/backend/billingAddressList"
        : type === "vendor" && "/backend/vendorList";
    setLoading("select", true);
    const response = await imsAxios.post(link, {
      search: search,
    });
    setLoading("select", false);
    const data = response.data ?? [];
    if (data.length) {
      const arr = data.map((row) => ({
        text: row.label ?? row.text,
        value: row.key ?? row.id,
      }));
      setAsyncOptions(arr);
    } else {
      setAsyncOptions([]);
    }
  };
  const getVendorBranches = async (vendor_id) => {
    setLoading("values", true);
    const response = await imsAxios.post("/backend/vendorBranchList", {
      vendorcode: vendor_id,
    });
    setLoading("values", false);
    // console.log("response->", response)
    const { data } = response;
 
      if (response.success) {
        let arr = response.data.map((row) => ({
          text: row.text,
          value: row.id,
        }));
        setVendorBranchOptions(arr);
      } else {
        showToast(response.message, "error");
      }

  };
  const getVendorBranchDetails = async (branchCode) => {
    const vendorCode = createJobWorkChallanForm.getFieldsValue().vendor.value;
    let obj1 = createJobWorkChallanForm.getFieldsValue();
    setLoading("values", true);
    const response = await imsAxios.post("backend/vendorAddress", {
      branchcode: branchCode,
      vendorcode: vendorCode,
    });
    setLoading("values", false);
    const { data } = response;
    if (data) {
      if (response.success) {
        let obj = {
          vendor_address: data.data.address?.replaceAll("<br>", "\n"),
          vendor_gst: data.data.gstid,
        };
        obj1 = { ...obj1, ...obj };
        createJobWorkChallanForm.setFieldsValue(obj);
        return obj;
      } else {
        showToast(response.message, "error");
      }
    }
  };
  const getBillingDispatchAddress = async () => {
    setLoading("values", true);
    const billingResponse = await imsAxios.post("/backend/billingAddressList");
    const dispatchgResponse = await imsAxios.post(
      "/backend/dispatchAddressList"
    );
    setLoading("values", false);
    const billingData = billingResponse.data ?? [];
    const dispatchData = dispatchgResponse.data ?? [];
    if (billingData.length) {
      const arr = billingData.map((row) => ({
        text: row.label ?? row.text,
        value: row.key ?? row.id,
      }));
      setBillingAddressOptions(arr);
    } else if (billingResponse.message) {
      showToast(billingResponse.message?.msg ?? billingResponse.message, "error");
    }
    if (dispatchData.length) {
      const arr = dispatchData.map((row) => ({
        text: row.label ?? row.text,
        value: row.key ?? row.id,
      }));
      setDispatchAddressOptions(arr);
    } else if (dispatchgResponse.message) {
      showToast(dispatchgResponse.message?.msg ?? dispatchgResponse.message, "error");
    }
  };
  const getDispatchAddressDetails = async (code) => {
    let obj1 = createJobWorkChallanForm.getFieldsValue();
    setLoading("values", true);
    const response = await imsAxios.post("/backend/dispatchAddress", {
      dispatch_code: code,
    });
    setLoading("values", false);
    
      if (response.success) {
        obj1 = {
          ...obj1,
          dispatch_to__line1: response.data.address.replaceAll("<br>", "\n"),
          dispatchfromgst: response.data.gstin,
          dispatch_to__pincode: response.data.pincode,
          // billingaddrpan: data.data.pan,
        };
        createJobWorkChallanForm.setFieldsValue(obj1);
      } else {
        showToast(response.message, "error");
      }
  };
  const getBillingAddressDetails = async (code) => {
    let obj1 = createJobWorkChallanForm.getFieldsValue();
    setLoading("values", true);
    const response = await imsAxios.post("/backend/billingAddress", {
      billing_code: code,
    });
    setLoading("values", false);
    
      if (response.success) {
        obj1 = {
          ...obj1,
          billing_address: response.data.address.replaceAll("<br>", "\n"),
          billingaddrgst: response.data.gstin,
          billingaddrcin: response.data.cin,
          billingaddrpan: response.data.pan,
        };
        createJobWorkChallanForm.setFieldsValue(obj1);
      } else {
        showToast(response.message, "error");
      }

  };
  const columns = [
    {field:"", headerName: "Sr. No", renderCell: ({ row }) => row.index, width: 80 },
    {field:"component_name",
      headerName: "Component",
      renderCell: ({ row }) => (
        <div style={{ width: 300 }}>
          <ToolTipEllipses text={row.component_name} />
        </div>
      ),
      width: 300,
    },
    {field:"unit_name",
      headerName: "Qty",
      renderCell: ({ row }) => (
        <div style={{ width: "100%" }}>
          <Input
            style={{ width: "100%" }}
            value={row.issue_qty}
            onChange={(e) => inputHandler("issue_qty", e.target.value, row.id)}
            suffix={row.unit_name}
            type="number"
          />
        </div>
      ),
      width: 120,
    },
    {field:"part_rate",
      headerName: "Rate",
      renderCell: ({ row }) => (
        <div style={{ width: "100%" }}>
          <Input
            style={{ width: "100%" }}
            value={row.part_rate}
            onChange={(e) => inputHandler("part_rate", e.target.value, row.id)}
            type="number"
          />
        </div>
      ),
      width: 100,
    },
    {field:"issue_qty",
      headerName: "Value",
      renderCell: ({ row }) => (
        <div style={{ width: "100%" }}>
          <Input value={+row.issue_qty * +Number(row.part_rate).toFixed(2)} />
        </div>
      ),
      width: 120,
    },
    {field:"hsn_code",
      headerName: "HSN",
      renderCell: ({ row }) => (
        <div style={{ width: "100%" }}>
          <Input
            value={row.hsn_code}
            onChange={(e) => inputHandler("hsn_code", e.target.value, row.id)}
          />
        </div>
      ),
      width: 120,
    },
    {field:"remarks",
      headerName: "Description",
      width:200,
      renderCell: ({ row }) => (
        <div style={{ width: "100%" }}>
          <Input
            value={row.remarks}
            onChange={(e) => inputHandler("remarks", e.target.value, row.id)}
          />
        </div>
      ),
    },
  ];
  useEffect(() => {
    if (editingJWMaterials) {
      getDetails();
      getBillingDispatchAddress();
    }
  }, [editingJWMaterials]);

  return (
    <Drawer
      title={`Editing Challan Number: ${editingJWMaterials}`}
      width="100vw"
      open={editingJWMaterials}
      onClose={() => setEditingJWMaterials(false)}
    >
      <Row style={{ height: "100%" }}>
        <Col span={10} style={{ height: "95%", overflowY: "scroll" }}>
          <Card size="small">
            {}
            {(loading("page") || loading("values")) && <Loading />}
            <Form
              // onFinish={submitHandler}
              form={createJobWorkChallanForm}
              layout="vertical"
            >
              <Divider style={{ marginTop: 10 }} orientation="left">
                Vendor Details
              </Divider>
              <Row gutter={4}>
                <Col span={12}>
                  {loading("fetchingDetails") && (
                    <Skeleton.Input active block style={{ margin: 10 }} />
                  )}
                  {!loading("fetchingDetails") && (
                    <Form.Item label="Vendor Name" name="vendor">
                      <MyAsyncSelect
                        loadOptions={(value) =>
                          getAsyncOptions(value, "vendor")
                        }
                        disabled={true}
                        selectLoading={loading("select")}
                        optionsState={asyncOptions}
                        onChange={(value) => getVendorBranches(value)}
                        onBlur={() => setAsyncOptions([])}
                      />
                    </Form.Item>
                  )}
                </Col>
                <Col span={12}>
                  {loading("fetchingDetails") && (
                    <Skeleton.Input active block style={{ margin: 10 }} />
                  )}
                  {!loading("fetchingDetails") && (
                    <Form.Item
                      label="Vendor Branch"
                      name="vendorbranch"
                      rules={[
                        {
                          required: true,
                          message: "Please Select a Vendor branch!",
                        },
                      ]}
                    >
                      <MySelect
                        onChange={(value) => getVendorBranchDetails(value)}
                        options={vendorBranchOptions}
                      />
                    </Form.Item>
                  )}
                </Col>

                <Col span={12}>
                  {loading("fetchingDetails") && (
                    <Skeleton.Input active block style={{ margin: 10 }} />
                  )}
                  {!loading("fetchingDetails") && (
                    <Form.Item
                      label="Nature of Processing"
                      name="nature_process"
                    >
                      <Input />
                    </Form.Item>
                  )}
                </Col>

                <Col span={12}>
                  {loading("fetchingDetails") && (
                    <Skeleton.Input active block style={{ margin: 10 }} />
                  )}
                  {!loading("fetchingDetails") && (
                    <Form.Item
                      label="Duration of Processing"
                      name="duration_process"
                    >
                      <Input />
                    </Form.Item>
                  )}
                </Col>
                <Col span={12}>
                  <Form.Item
                    label="Vehicle Number"
                    name="vehicle"
                    rules={[
                      {
                        required: true,
                        message: "Please enter a vehicle number!",
                      },
                    ]}
                  >
                    <Input />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item label="Other References" name="other_ref">
                    <Input />
                  </Form.Item>
                </Col>

                <Col span={24}>
                  {loading("fetchingDetails") && (
                    <Skeleton.Input active block style={{}} />
                  )}
                  {!loading("fetchingDetails") && (
                    <Form.Item label="Vendor Address" name="vendor_address">
                      <Input.TextArea disabled />
                    </Form.Item>
                  )}
                </Col>
                <Divider style={{ marginTop: 10 }} orientation="left">
                  Billing Details
                </Divider>

                <Col span={24}>
                  {loading("fetchingDetails") && (
                    <Skeleton.Input active block style={{ margin: 10 }} />
                  )}
                  {!loading("fetchingDetails") && (
                    <Form.Item label="Billing Address ID" name="billing_info">
                      <MySelect
                        options={bilingAddressOptions}
                        onChange={getBillingAddressDetails}
                      />
                    </Form.Item>
                  )}
                </Col>

                <Col span={24}>
                  {loading("fetchingDetails") && (
                    <Skeleton.Input active block style={{ margin: 10 }} />
                  )}
                  {!loading("fetchingDetails") && (
                    <Form.Item label="Billing Address" name="billing_address">
                      <Input.TextArea />
                    </Form.Item>
                  )}
                </Col>

                <Divider orientation="left">Dispatch Details</Divider>

                <Col span={24}>
                  {loading("fetchingDetails") && (
                    <Skeleton.Input active block style={{ margin: 10 }} />
                  )}
                  {!loading("fetchingDetails") && (
                    <Form.Item label="Dispatch Address ID" name="dispatch_info">
                      <MySelect
                        onChange={getDispatchAddressDetails}
                        options={dispatchAddressOptions}
                      />
                    </Form.Item>
                  )}
                </Col>

                <Col span={24}>
                  {loading("fetchingDetails") && (
                    <Skeleton.Input active block style={{ margin: 10 }} />
                  )}
                  {!loading("fetchingDetails") && (
                    <Form.Item
                      label="Dispatch Address"
                      name="dispatch_to__line1"
                    >
                      <Input.TextArea />
                    </Form.Item>
                  )}
                </Col>
              </Row>
            </Form>
          </Card>
        </Col>
        <Col span={14} style={{ height: "95%" }}>
          <FormTableDataGrid data={rows} columns={columns} />
        </Col>
      </Row>
      <NavFooter
        loading={loading("submit")}
        nextLabel="Submit"
        submitFunction={submitHandler}
      />
    </Drawer>
  );
}

export default JWRMChallanEditMaterials;
