import { useEffect, useState } from "react";
import "../../Modal/modal.css";
import { useToast } from "../../../../hooks/useToast.js";
import {
  Button,
  Row,
  Col,
  Input,
  Skeleton,
  Form,
  Drawer,
  Space,
  Typography,
  Divider,
} from "antd";
import MySelect from "../../../../Components/MySelect";
import MyAsyncSelect from "../../../../Components/MyAsyncSelect";
import Loading from "../../../../Components/Loading";
import { imsAxios } from "../../../../axiosInterceptor";
const { TextArea } = Input;
import { getVendorBranchBankOptions } from "../vendorBranchBankOptions";
const transactionTypeOptions = [
  { text: "Cheque", value: "cheque" },
  { text: "e-Fund Transfer", value: "transfer" },
  { text: "UPI", value: "upi" },
  { text: "Other", value: "other" },
  { text: "N/A", value: "na" },
];
const ViewModal = ({ viewVendor, setViewVendor }) => {
  const { showToast } = useToast();
  const [allField, setAllField] = useState({
    branchCode: "",
    label: "",
    state: "",
    city: "",
    gst: "",
    pcode: "",
    email: "",
    mob: "",
    address: "",
    fax: "",
    addresscode: "",
    transactionType: "",
    accountNo: "",
    ifsCode: "",
    bankName: "",
    bankBranch: "",
    ledgerCurrency: "",
  });
  const [resetData, setResetData] = useState({});
  const [skeletonLoading, setSkeletonLoading] = useState(false);
  const [spinLoading, setSpinLoading] = useState(false);
  const [submitLoading, setsubmitLoading] = useState(false);
  const [allBranchData, setAllBranchData] = useState([]);
  const [asyncOptions, setAsyncOptions] = useState([]);
  const [currencies, setCurrencies] = useState([]);

  const getCurrencies = async () => {
    try {
      const response = await imsAxios.get("/backend/fetchAllCurrecy");
      const arr =
        response?.data?.map((d) => ({
          text: d.currency_symbol,
          value: d.currency_id,
          notes: d.currency_notes,
        })) || [];
      setCurrencies(arr);
    } catch (error) {
      setCurrencies([]);
    }
  };

  const fetchAllBranchList = async () => {
    setSkeletonLoading(true);
    const response = await imsAxios.post("/vendor/getAllBranchList", {
      vendor_id: viewVendor.vendor_code,
    });
    if (response.success) {
      let a = [];
      response.data.map((d) => a.push({ text: d.text, value: d.id }));
      getBranchDetails(a[0].value, "skeletonLoading");
      setAllBranchData(a);
    
      setSkeletonLoading(false);
    }
    setSkeletonLoading(false);
  };
  const getBranchDetails = async (branchId, loadingType) => {
    if (loadingType != "skeletonLoading") {
      setSpinLoading(true);
    }
    const response = await imsAxios.post("/vendor/getBranchDetails", {
      addresscode: branchId,
    });
    setSpinLoading(false);
    if (response.success) {
      const d = response?.data?.[0] || {};
      const isNaType = (d.transaction_type ?? "") === "na";
      const bankNA = {
        accountNo: "N/A",
        ifsCode: "N/A",
        bankName: "N/A",
        bankBranch: "N/A",
        ledgerCurrency: "N/A",
      };
      const bankFromApi = {
        accountNo: d.account_no ?? "",
        ifsCode: d.ifs_code ?? "",
        bankName: d.bank_name ?? "",
        bankBranch: d.bank_branch ?? "",
        ledgerCurrency: d.ledger_currency ?? "",
      };
      setAllField((allField) => {
        return {
          ...allField,
          branchCode: response.data[0].address_code,
          label: response.data[0].label,
          email: response.data[0].email_id,
          city: response.data[0].city,
          gst: response.data[0].gstin,
          pcode: response.data[0].pincode,
          mob: response.data[0].mobile_no,
          fax: response.data[0].fax,
          address: response.data[0].address,
          state: {
            value: response.data[0].statecode,
            label: response.data[0].statename,
          },
          transactionType: d.transaction_type ?? "",
          ...(isNaType ? bankNA : bankFromApi),
        };
      });
      setResetData((allField) => {
        return {
          ...allField,
          branchCode: response.data[0].address_code,
          label: response.data[0].label,
          email: response.data[0].email_id,
          city: response.data[0].city,
          gst: response.data[0].gstin,
          pcode: response.data[0].pincode,
          mob: response.data[0].mobile_no,
          fax: response.data[0].fax,
          address: response.data[0].address,
          state: {
            value: response.data[0].statecode,
            label: response.data[0].statename,
          },
          transactionType: d.transaction_type ?? "",
          ...(isNaType ? bankNA : bankFromApi),
        };
      });
    }
  };
  const getOption = async (a) => {
    if (a?.length > 1) {
      const response = await imsAxios.post("/backend/stateList", {
        search: a,
      });

      if (response.success && response.data) {
        let arr = response.data.map((d) => {
          return { text: d.text, value: d.id };
        });
        setAsyncOptions(arr);
      }
    }
  };

  const updateBranch = async () => {
    if (allField.label == "") {
      return showToast("Please enter branch name", "error");
    } else if (allField.city == "") {
      return showToast("Please enter City name", "error");
    } else if (allField.address == "") {
      return showToast("Please enter Complete branch address", "error");
    } else if (allField.pcode == "") {
      return showToast("Please enter branch Pincode", "error");
    } else if (allField.gst == "") {
      return showToast("Please enter branch GST Number", "error");
    }
    setsubmitLoading(true);
    const response = await imsAxios.post("/vendor/updateBranchDetails", {
      label: allField.label,
      state: allField.state.value,
      city: allField.city,
      address: allField.address,
      pincode: allField.pcode,
      fax: allField.fax === "" ? "--" : allField.fax,
      email: allField.email === "" ? "--" : allField.email,
      mobile: allField.mob === "" ? "--" : allField.mob,
      gstid: allField.gst,
      address_code: allField.branchCode,
      vendor_code: viewVendor.vendor_code,
      transaction_type: allField.transactionType,
      account_no: allField.accountNo,
      ifs_code: allField.ifsCode,
      bank_name: allField.bankName,
      bank_branch: allField.bankBranch,
      ledger_currency: allField.ledgerCurrency,
    });
    setsubmitLoading(false);
    if (response.success) {
      setViewVendor(null);
      showToast(response.message, "success");
    } else {
      showToast(response.message, "error");
    }
  };

  const reset = () => {
    setAllField(resetData);
  };

  useEffect(() => {
    if (viewVendor == false) {
      reset();
    } else if (viewVendor) {
      fetchAllBranchList();
      getCurrencies();
    }
  }, [viewVendor]);

  return (
    <form>
      <Drawer
        title={`Edit Branch of Vendor: ${viewVendor?.vendor_code}`}
        centered
        confirmLoading={submitLoading}
        open={viewVendor}
        onClose={() => setViewVendor(false)}
        width="50vw"
      >
        <Skeleton loading={skeletonLoading} active />
        <Skeleton loading={skeletonLoading} active />
        {spinLoading && <Loading />}
        {!skeletonLoading && (
          <Form style={{ marginTop: -10 }} layout="vertical" size="small">
            <Row style={{ width: "100%" }}>
              <Col span={24}>
                <Form.Item label="Select Branch">
                  <MySelect
                    value={allField.branchCode}
                    options={allBranchData}
                    onChange={(e) => {
                      getBranchDetails(e);
                      setAllField((allField) => {
                        return { ...allField, addresscode: e };
                      });
                    }}
                  />
                </Form.Item>
              </Col>
              <Col span={24} style={{ padding: "3px 0" }}>
                <Typography.Title
                  level={5}
                  style={{ marginTop: 8, marginBottom: 8 }}
                >
                  Branch Details
                </Typography.Title>
              </Col>
              <>
                <Col span={12} style={{ padding: "3px" }}>
                  <Form.Item label="Branch Name">
                    <Input
                      size="default "
                      value={allField.label}
                      onChange={(e) =>
                        setAllField((allField) => {
                          return { ...allField, label: e.target.value };
                        })
                      }
                    />
                  </Form.Item>
                </Col>

                <Col span={12} style={{ padding: "3px" }}>
                  <Form.Item label="State">
                    <MyAsyncSelect
                      optionsState={asyncOptions}
                      onBlur={() => setAsyncOptions([])}
                      value={allField?.state}
                      labelInValue
                      loadOptions={getOption}
                      onChange={(e) =>
                        setAllField((allField) => {
                          return { ...allField, state: e };
                        })
                      }
                    />
                  </Form.Item>
                </Col>
                <Col span={12} style={{ padding: "3px" }}>
                  <Form.Item label="City">
                    <Input
                      size="default "
                      value={allField.city}
                      onChange={(e) =>
                        setAllField((allField) => {
                          return { ...allField, city: e.target.value };
                        })
                      }
                    />
                  </Form.Item>
                </Col>
                <Col span={12} style={{ padding: "3px" }}>
                  <Form.Item label="GST Number">
                    <Input
                      size="default "
                      value={allField.gst}
                      onChange={(e) =>
                        setAllField((allField) => {
                          return { ...allField, gst: e.target.value };
                        })
                      }
                    />
                  </Form.Item>
                </Col>
                <Col span={12} style={{ padding: "3px" }}>
                  <Form.Item label="Pin Code">
                    <Input
                      size="default "
                      value={allField.pcode}
                      onChange={(e) =>
                        setAllField((allField) => {
                          return { ...allField, pcode: e.target.value };
                        })
                      }
                    />
                  </Form.Item>
                </Col>
                <Col span={12} style={{ padding: "3px" }}>
                  <Form.Item label="Email">
                    <Input
                      size="default "
                      value={allField.email}
                      onChange={(e) =>
                        setAllField((allField) => {
                          return { ...allField, email: e.target.value };
                        })
                      }
                    />
                  </Form.Item>
                </Col>
                <Col span={12} style={{ padding: "3px" }}>
                  <Form.Item label="Mobile">
                    <Input
                      size="default "
                      value={allField.mob}
                      onChange={(e) =>
                        setAllField((allField) => {
                          return { ...allField,   mob: e.target.value.replace(/\D/g, ""), };
                        })
                      }
                    />
                  </Form.Item>
                </Col>
                <Col span={12} style={{ padding: "3px" }}>
                  <Form.Item label="Fax Number">
                    <Input
                      size="default "
                      value={allField.fax}
                      onChange={(e) =>
                        setAllField((allField) => {
                          return { ...allField, fax: e.target.value };
                        })
                      }
                    />
                  </Form.Item>
                </Col>
                <Col span={24} style={{ padding: "3px" }}>
                  <Form.Item label="Branch Address">
                    <TextArea
                      rows={4}
                      maxLength={200}
                      value={allField.address}
                      onChange={(e) =>
                        setAllField((allField) => {
                          return { ...allField, address: e.target.value };
                        })
                      }
                    />
                  </Form.Item>
                </Col>
              </>
            </Row>
            <Divider style={{ margin: "16px 0" }} />
            <Typography.Title
              level={5}
              style={{ marginTop: 0, marginBottom: 12 }}
            >
              Bank Details
            </Typography.Title>
            <Row style={{ width: "100%" }}>
              <Col span={24} style={{ padding: "3px" }}>
                <Form.Item label="Type">
                  <MySelect
                    value={allField.transactionType}
                    options={transactionTypeOptions}
                    onChange={(val) => {
                      if (val === "na") {
                        setAllField((f) => ({
                          ...f,
                          transactionType: val,
                          accountNo: "N/A",
                          ifsCode: "N/A",
                          bankName: "N/A",
                          bankBranch: "N/A",
                          ledgerCurrency: "N/A",
                        }));
                      } else {
                        setAllField((f) => ({
                          ...f,
                          transactionType: val,
                          ...(f.transactionType === "na"
                            ? {
                                accountNo: "",
                                ifsCode: "",
                                bankName: "",
                                bankBranch: "",
                                ledgerCurrency: "",
                              }
                            : {}),
                        }));
                      }
                    }}
                  />
                </Form.Item>
              </Col>
              <Col span={12} style={{ padding: "3px" }}>
                <Form.Item label="A/c No">
                  <Input
                    value={allField.accountNo}
                    onChange={(e) =>
                      setAllField((allField) => ({
                        ...allField,
                        accountNo: e.target.value,
                      }))
                    }
                  />
                </Form.Item>
              </Col>
              <Col span={12} style={{ padding: "3px" }}>
                <Form.Item label="IFS Code">
                  <Input
                    value={allField.ifsCode}
                    onChange={(e) =>
                      setAllField((allField) => ({
                        ...allField,
                        ifsCode: e.target.value,
                      }))
                    }
                  />
                </Form.Item>
              </Col>
              <Col span={12} style={{ padding: "3px" }}>
                <Form.Item label="Bank Name">
                  <MySelect
                    placeholder="Select bank"
                    options={getVendorBranchBankOptions(allField.bankName)}
                    value={allField.bankName || undefined}
                    onChange={(val) =>
                      setAllField((f) => ({
                        ...f,
                        bankName: val ?? "",
                      }))
                    }
                  />
                </Form.Item>
              </Col>
              <Col span={12} style={{ padding: "3px" }}>
                <Form.Item label="Bank Branch">
                  <Input
                    value={allField.bankBranch}
                    onChange={(e) =>
                      setAllField((allField) => ({
                        ...allField,
                        bankBranch: e.target.value,
                      }))
                    }
                  />
                </Form.Item>
              </Col>
              <Col span={24} style={{ padding: "3px" }}>
                <Form.Item label="Currency of Ledger">
                  <MySelect
                    value={allField.ledgerCurrency}
                    options={currencies}
                    onChange={(val) =>
                      setAllField((allField) => ({
                        ...allField,
                        ledgerCurrency: val,
                      }))
                    }
                  />
                </Form.Item>
              </Col>
            </Row>
            <Row justify="end">
              <Space>
                <Button onClick={reset} size="default">
                  Reset
                </Button>
                <Button
                  size="default"
                  type="primary"
                  loading={submitLoading}
                  onClick={updateBranch}
                >
                  Submit
                </Button>
              </Space>
            </Row>
          </Form>
        )}
      </Drawer>
    </form>
  );
};

export default ViewModal;
