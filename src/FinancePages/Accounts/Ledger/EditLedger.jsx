import { useEffect, useState } from "react";
import MySelect from "../../../Components/MySelect";
import Loading from "../../../Components/Loading";
import MyAsyncSelect from "../../../Components/MyAsyncSelect";
import { Button, Col, Form, Input, Row, Space } from "antd";
import validateResponse from "../../../Components/validateResponse";
import { imsAxios } from "../../../axiosInterceptor";
import { useToast } from "../../../hooks/useToast";
import Field from "../../../Components/Field.jsx";

export default function EditLedger({ getLedgerList }) {
  const { showToast } = useToast();
  const [selectLoading, setSelectLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [selectedLedger, setSelectedLedger] = useState(null);
  const [ledgerData, setLedgerData] = useState();
  const [asyncOptions, setAsyncOptions] = useState([]);
  const [isValid, setIsValid] = useState(false);

  // const confirmCode = async () => {
  //   setCodeConfirmLoading(true);
  //   const response = await imsAxios.post("/tally/ledger/check_leadger_code", {
  //     code: ledgerData?.l_code,
  //   });
  //   setCodeConfirmLoading(false);
  //   if (response.success) {
  //     if (response.data.exist) {
  //       setCodeConfirmed("exist");
  //     } else if (!response.data.exist) {
  //       setCodeConfirmed("not exist");
  //     }
  //   } else {
  //     setCodeConfirmed("exist");
  //     showToast(response.message?.msg || response.message);

  //   }
  // };

  const options = [
    { text: "YES", value: "yes" },
    { text: "NO", value: "no" },
  ];
  const statusOptions = [
    { text: "ACTIVE", value: "active" },
    { text: "INACTIVE", value: "inactive" },
  ];
  const ledgerTypeOptions = [
    { text: "Ledger", value: "L" },
    { text: "Cash", value: "CA" },
    { text: "Bank", value: "B" },
    { text: "Vendor", value: "V" },
    { text: "Customer", value: "CU" },
  ];
  const getLedgers = async (search) => {
    setSelectLoading(true);
    const response = await imsAxios.post("/tally/ledger/ledger_options", {
      search: search,
    });
    setSelectLoading(false);
    if (response.success) {
      let arr = response.data.map((row) => {
        return {
          text: row.text,
          value: row.id,
        };
      });
      setAsyncOptions(arr);
    } else {
      setAsyncOptions([]);
    }
  };
  const getSubGroupSelect = async (search) => {
    setSelectLoading(true);
    const response = await imsAxios.post("/tally/getSubgroup", {
      search: search,
    });
    setSelectLoading(false);
    if (response.success) {
      let arr = response.data.map((row) => {
        return {
          text: row.label,
          value: row.id,
        };
      });
      setAsyncOptions(arr);
    } else {
      setAsyncOptions([]);
    }
  };
  const getLedgerData = async () => {
    setLoading(true);
    if (selectedLedger) {
      const response = await imsAxios.post("/tally/ledger/editLedger", {
        code: selectedLedger?.value ?? selectedLedger,
      });
      setLoading(false);
      validateResponse(response);
      if (response.success) {
        let obj = response.data;
        obj = {
          ...obj,
          subGroup: { label: obj.group_name, value: obj.group_key },
        };
        setLedgerData(obj);
      }
    }
  };
  const inputHandler = (name, value) => {
    let obj = ledgerData;
    obj = {
      ...obj,
      [name]: value,
    };
    setLedgerData(obj);
  };
  const submitHandler = async () => {
    if (
      !selectedLedger ||
      !ledgerData?.l_code ||
      !ledgerData?.ladger_name ||
      !(ledgerData?.subGroup?.value ?? ledgerData?.subGroup) ||
      !ledgerData?.gst_applicable ||
      !ledgerData?.tds_applicable ||
      !ledgerData?.ledger_type
    ) {
      setIsValid(true);
      return;
    }
    setIsValid(false);
    const finalObj = {
      l_key: selectedLedger?.value ?? selectedLedger,
      name: ledgerData.ladger_name,
      code: ledgerData.l_code,
      sub_group: ledgerData.subGroup.value
        ? ledgerData.subGroup.value
        : ledgerData.subGroup,
      search_name: ledgerData.search_name,
      gst: ledgerData.gst_applicable,
      tds: ledgerData.tds_applicable,
      status: ledgerData.account_status,
      type: ledgerData.ledger_type,
    };
    setSubmitLoading(true);
    const response = await imsAxios.post("/tally/ledger/updateLedger", {
      ...finalObj,
    });
    validateResponse(response);
    setSubmitLoading(false);
    if (response.success) {
      showToast(response.message);
      getLedgerList();
      resetHandler();
    }
    setSubmitLoading(false);
  };
  const resetHandler = () => {
    setIsValid(false);
    let obj = {
      account_status: "active",
      group_key: "",
      group_name: "",
      gst_applicable: "yes",
      l_code: "",
      l_key: "",
      ladger_name: "",
      ledger_type: "L",
      search_name: "",
      subGroup: "",
      tds_applicable: "yes",
    };
    setLedgerData(obj);
    setSelectedLedger(null);
  };
  useEffect(() => {
    if (selectedLedger) {
      getLedgerData();
    }
  }, [selectedLedger]);
  return (
    <>
      {loading && <Loading />}

      <Row gutter={10} span={24}>
        <Col span={12}>
          <Form size="small" layout="vertical">
            <Form.Item
              label={
                <span
                  style={{
                    fontSize: window.innerWidth < 1600 && "0.7rem",
                  }}
                >
                  Select Ledger
                </span>
              }
            >
              <MyAsyncSelect
                selectLoading={selectLoading}
                onBlur={() => setAsyncOptions([])}
                value={selectedLedger}
                onChange={(value) => setSelectedLedger(value)}
                // defaultOptions
                loadOptions={getLedgers}
                optionsState={asyncOptions}
                placeholder="Select Ledger..."
                labelInValue
                showError={isValid}
                message="Please select a Ledger"
              />
            </Form.Item>
          </Form>
        </Col>
        <Col span={12}>
          <Form size="small" layout="vertical">
            <Form.Item
              label={
                <span
                  style={{
                    fontSize: window.innerWidth < 1600 && "0.7rem",
                  }}
                >
                  Ledger Code
                </span>
              }
            >
              <Row>
                {/* <Col span={3}>
                  <CommonIcons
                    disabled={ledgerData?.l_code.length <= 3}
                    onClick={confirmCode}
                    loading={codeConfirmLoading}
                    action={
                      codeConfirmed === "pending"
                        ? "searchButton"
                        : codeConfirmed === "not exist"
                        ? "checkButton"
                        : codeConfirmed === "exist" && "closeButton"
                    }
                    size="default"
                  />
                </Col> */}
                <Col span={24}>
                  <Field
                    attr="required | Ledger Code is required"
                    value={ledgerData?.l_code}
                    showValidation={isValid}
                    onChange={(e) => inputHandler("l_code", e.target.value)}
                  >
                    <Input size="default" placeholder="Enter a Ledger Code.." />
                  </Field>
                </Col>
              </Row>
            </Form.Item>
          </Form>
        </Col>
      </Row>

      <Row gutter={10} span={24}>
        <Col span={12}>
          <Form size="small" layout="vertical">
            <Form.Item
              label={
                <span
                  style={{
                    fontSize: window.innerWidth < 1600 && "0.7rem",
                  }}
                >
                  Ledger Name
                </span>
              }
            >
              <Field
                attr="required | Ledger Name is required"
                value={ledgerData?.ladger_name}
                showValidation={isValid}
                onChange={(e) => inputHandler("ladger_name", e.target.value)}
              >
                <Input size="default" placeholder="Enter Ledger Name.." />
              </Field>
            </Form.Item>
          </Form>
        </Col>
        <Col span={12}>
          <Form size="small" layout="vertical">
            <Form.Item
              label={
                <span
                  style={{
                    fontSize: window.innerWidth < 1600 && "0.7rem",
                  }}
                >
                  Search Name
                </span>
              }
            >
              <Input
                size="default"
                value={ledgerData?.search_name}
                onChange={(e) => inputHandler("search_name", e.target.value)}
                placeholder="Sub Group"
              />
            </Form.Item>
          </Form>
        </Col>
      </Row>

      <Row gutter={10} span={24}>
        <Col span={12}>
          <Form size="small" layout="vertical">
            <Form.Item
              label={
                <span
                  style={{
                    fontSize: window.innerWidth < 1600 && "0.7rem",
                  }}
                >
                  Sub Group
                </span>
              }
            >
              <MyAsyncSelect
                selectLoading={selectLoading}
                onBlur={() => setAsyncOptions([])}
                value={ledgerData?.subGroup}
                onChange={(value) => {
                  inputHandler("subGroup", value);
                }}
                // defaultOptions
                loadOptions={getSubGroupSelect}
                optionsState={asyncOptions}
                placeholder="Select Sub Group..."
                labelInValue
                showError={isValid}
                message="Please select a Sub Group"
              />
            </Form.Item>
          </Form>
        </Col>
        <Col span={12}>
          <Form size="small" layout="vertical">
            <Form.Item
              label={
                <span
                  style={{
                    fontSize: window.innerWidth < 1600 && "0.7rem",
                  }}
                >
                  GST Apply
                </span>
              }
            >
              <MySelect
                value={ledgerData?.gst_applicable}
                onChange={(value) => {
                  inputHandler("gst_applicable", value);
                }}
                options={options}
                showError={isValid}
                message="Please select GST Apply"
              />
            </Form.Item>
          </Form>
        </Col>
      </Row>

      <Row gutter={10} span={24}>
        <Col span={12}>
          <Form size="small" layout="vertical">
            <Form.Item
              label={
                <span
                  style={{
                    fontSize: window.innerWidth < 1600 && "0.7rem",
                  }}
                >
                  TDS Apply
                </span>
              }
            >
              <MySelect
                value={ledgerData?.tds_applicable}
                onChange={(value) => {
                  inputHandler("tds_applicable", value);
                }}
                options={options}
                showError={isValid}
                message="Please select TDS Apply"
              />
            </Form.Item>
          </Form>
        </Col>
        <Col span={12}>
          <Form size="small" layout="vertical">
            <Form.Item
              label={
                <span
                  style={{
                    fontSize: window.innerWidth < 1600 && "0.7rem",
                  }}
                >
                  Account Status (Active or Inactive)
                </span>
              }
            >
              <MySelect
                value={ledgerData?.account_status}
                onChange={(value) => {
                  inputHandler("account_status", value);
                }}
                options={statusOptions}
              />
            </Form.Item>
          </Form>
        </Col>
      </Row>

      <Row gutter={10} span={24}>
        <Col span={12}>
          <Form size="small" layout="vertical">
            <Form.Item
              label={
                <span
                  style={{
                    fontSize: window.innerWidth < 1600 && "0.7rem",
                  }}
                >
                  Ledger Type
                </span>
              }
            >
              <MySelect
                value={ledgerData?.ledger_type}
                onChange={(value) => {
                  inputHandler("ledger_type", value);
                }}
                options={ledgerTypeOptions}
                showError={isValid}
                message="Please select a Ledger Type"
              />
            </Form.Item>
          </Form>
        </Col>
        <Col span={12}>
          <Space
            align="center"
            justify="flex-end"
            style={{
              height: "100%",
              paddingTop: 7,
              width: "100%",
            }}
          >
            <Button
              loading={submitLoading}
              onClick={submitHandler}
              // disabled={codeConfirmed !== "not exist"}
              type="primary"
            >
              Save
            </Button>
            <Button type="default" onClick={resetHandler}>
              Reset
            </Button>
          </Space>
        </Col>
      </Row>

      <Row justify="end"></Row>
    </>
  );
}
