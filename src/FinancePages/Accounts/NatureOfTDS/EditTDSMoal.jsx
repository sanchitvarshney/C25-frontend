import { Button, Col, Drawer, Form, Input, Row } from "antd";
import TextArea from "antd/lib/input/TextArea";
import { useState } from "react";
import { useEffect } from "react";
import { imsAxios } from "../../../axiosInterceptor";
import MyAsyncSelect from "../../../Components/MyAsyncSelect";
import { useToast } from "../../../hooks/useToast";
import Field from "../../../Components/Field.jsx";

export default function EditTDSMoal({ editingTDS, setEditingTDS, getTDSList }) {
  const { showToast } = useToast();
  // const [ledgerOption, setLedgerOption] = useState(null);
  const [asyncOptions, setAsyncOptions] = useState([]);
  const [tdsData, setTdsData] = useState({});
  const [loading, setLoading] = useState(false);
  const [selectLoading, setSelectLoading] = useState(false);
  const [isValid, setIsValid] = useState(false);
  const inputHandler = (name, value) => {
    setTdsData((editingTDS) => {
      return {
        ...editingTDS,
        [name]: value,
      };
    });
  };
  const updateTDS = async () => {
    const { tds_code, desc, tds_key, gl_key, name, percentage } = tdsData;
    if (!tds_code || !desc || !gl_key || !name || !percentage) {
      setIsValid(true);
      return;
    }
    setIsValid(false);
    // setLoading(true);
    const response = await imsAxios.post(
      "/tally/tds/update_new_nature_of_tds",
      {
        code: tds_code,
        name: name,
        description: desc,
        percentage: +percentage,
        ledger: gl_key?.value ?? gl_key,
        tds_key: tds_key,
      },
    );
    setLoading(false);
    if (response.success) {
      showToast(response.message || response.message?.msg);
      setIsValid(false);
      setEditingTDS(null);
      getTDSList();
    } else {
      showToast(response.message?.msg || response.message, "error");
    }
  };
  const getGLCodes = async (search) => {
    setSelectLoading(true);
    const response = await imsAxios.post("/tally/tds/tds_ledger_options", {
      search: search,
    });
    setSelectLoading(false);
    if (response.success) {
      const arr = response.data.map((row) => {
        return {
          text: row.text,
          value: row.id,
        };
      });
      setAsyncOptions(arr);
    }
  };
  useEffect(() => {
    setEditingTDS((editingTDS) => {
      return { ...editingTDS, ledger: { label: editingTDS?.name } };
    });
  }, []);
  useEffect(() => {
    setTdsData(editingTDS);
  }, [editingTDS]);
  return (
    <Drawer
      title={`Update TDS:  ${editingTDS?.name}`}
      width="40vw"
      extra={
        <Button loading={loading} type="primary" onClick={updateTDS}>
          Submit
        </Button>
      }
      placement="right"
      onClose={() => {
        setIsValid(false);
        setEditingTDS(null);
      }}
      open={editingTDS}
    >
      <Row gutter={16}>
        <Col span={24}>
          <Form size="small" layout="vertical">
            <Form.Item
              label={
                <span
                  style={{
                    fontSize: window.innerWidth < 1600 && "0.7rem",
                  }}
                >
                  TDS Name
                </span>
              }
            >
              <Field
                attr="required | Please Enter TDS Name!"
                value={tdsData?.name}
                showValidation={isValid}
                onChange={(e) => inputHandler("name", e.target.value)}
              >
                <Input size="default" placeholder="Enter New TDS Name.." />
              </Field>
            </Form.Item>
          </Form>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={24}>
          <Form size="small" layout="vertical">
            <Form.Item
              label={
                <span
                  style={{
                    fontSize: window.innerWidth < 1600 && "0.7rem",
                  }}
                >
                  TDS Code
                </span>
              }
            >
              <Field
                attr="required | Please Enter a TDS Code!"
                value={tdsData?.tds_code}
                showValidation={isValid}
                onChange={(e) => inputHandler("tds_code", e.target.value)}
              >
                <Input size="default" placeholder="Enter New TDS Code.." />
              </Field>
            </Form.Item>
          </Form>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={24}>
          <Form size="small" layout="vertical">
            <Form.Item
              label={
                <span
                  style={{
                    fontSize: window.innerWidth < 1600 && "0.7rem",
                  }}
                >
                  TDS Description
                </span>
              }
            >
              <Field
                attr="required | Please Enter a TDS Description!"
                value={tdsData?.desc}
                showValidation={isValid}
                onChange={(e) => inputHandler("desc", e.target.value)}
              >
                <TextArea
                  rows={4}
                  style={{ resize: "none" }}
                  size="default"
                  placeholder="Enter a TDS Desctiption.."
                />
              </Field>
            </Form.Item>
          </Form>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={24}>
          <Form size="small" layout="vertical">
            <Form.Item
              label={
                <span
                  style={{
                    fontSize: window.innerWidth < 1600 && "0.7rem",
                  }}
                >
                  TDS Percentage
                </span>
              }
            >
              <Field
                attr="required | Please Enter TDS Percentage!"
                value={tdsData?.percentage}
                showValidation={isValid}
                treatZeroAsEmpty
                onChange={(e) => {
                  inputHandler("percentage", e.target.value);
                }}
              >
                <Input
                  size="default"
                  placeholder="Enter Percentage..."
                  type="number"
                />
              </Field>
            </Form.Item>
          </Form>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={24}>
          <Form size="small" layout="vertical">
            <Form.Item
              label={
                <span
                  style={{
                    fontSize: window.innerWidth < 1600 && "0.7rem",
                  }}
                >
                  G/L
                </span>
              }
            >
              <MyAsyncSelect
                size="default"
                onBlur={() => setAsyncOptions([])}
                optionsState={asyncOptions}
                value={tdsData?.gl_key}
                onChange={(value) => {
                  inputHandler("gl_key", value);
                }}
                selectLoading={selectLoading}
                loadOptions={getGLCodes}
                placeholder="Select ax G/L"
                defaultOptions
                labelInValue
                showError={isValid}
                message="Please select G/L!"
              />
            </Form.Item>
          </Form>
        </Col>
      </Row>
    </Drawer>
  );
}
