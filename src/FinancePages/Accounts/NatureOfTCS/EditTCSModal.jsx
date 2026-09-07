import { useEffect } from "react";
import { Button, Col, Drawer, Form, Row, Input, Select } from "antd";
import { useState } from "react";
import { imsAxios } from "../../../axiosInterceptor";
import MyAsyncSelect from "../../../Components/MyAsyncSelect";
import { useToast } from "../../../hooks/useToast";
import Loading from "../../../Components/Loading";
import Field from "../../../Components/Field.jsx";

const { TextArea } = Input;

function EditTCS({ editingTCS, setEditingTCS, getTCSList }) {
  const { showToast } = useToast();
  const status = [
    { label: "Open", value: "open" },
    { label: "Close", value: "closed" },
  ];
  const [tcsData, setTCSData] = useState({});

  const [loading, setLoading] = useState(false);
  const [asyncOptions, setAsyncOptions] = useState([]);
  const [selectLoading, setSelectLoading] = useState(false);
  const [isValid, setIsValid] = useState(false);

  // const [allGLDataa, setAllGLData] = useState([]);

  const inputHandler = (name, value) => {
    setTCSData((editingTCS) => {
      return {
        ...editingTCS,
        [name]: value,
      };
    });
  };

  const getGLList = async (search) => {
    setSelectLoading(true);
    const response = await imsAxios.get(
      `/tally/tcs/tcsLedgerOptions?search=${search}`,
    );
    setSelectLoading(false);
    let arr = [];
    if (response.success) {
      arr = response.data.map((d) => {
        return { text: d.text, value: d.id };
      });
      setAsyncOptions(arr);
    } else {
      setAsyncOptions([]);
    }
  };

  const updateTCS = async () => {
    const { desc, glKey, name, percentage, tcsCode, ID, status } = tcsData;
    if (!desc || !glKey || !name || !percentage || !tcsCode || !status) {
      setIsValid(true);
      return;
    }
    setIsValid(false);
    setLoading(true);
    const response = await imsAxios.put("/tally/tcs/update", {
      ID: ID,
      code: tcsCode,
      name: name,
      percentage: percentage,
      description: desc,
      ledger: glKey?.value ?? glKey,
      status: status,
    });
    setLoading(false);
    if (response.success) {
      showToast(response.message);
      setIsValid(false);
      setEditingTCS(null);
      getTCSList();
    } else {
      showToast(response.message?.msg || response.message, "error");
    }
  };

  useEffect(() => {
    setTCSData(editingTCS);
  }, [editingTCS]);

  return (
    <Drawer
      title={`Update TCS: ${editingTCS?.glCode}`}
      placement="left"
      width="40vw"
      onClose={() => {
        setIsValid(false);
        setEditingTCS(null);
      }}
      open={editingTCS}
      extra={
        <Button loading={loading} type="primary" onClick={updateTCS}>
          Update
        </Button>
      }
    >
      {selectLoading && <Loading />}
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
                  TCS Name
                </span>
              }
            >
              <Field
                attr="required | Please Enter TCS Name!"
                value={tcsData?.name}
                showValidation={isValid}
                onChange={(e) => inputHandler("name", e.target.value)}
              >
                <Input size="default" placeholder="Enter New TCS Name.." />
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
                  TCS Code
                </span>
              }
            >
              <Field
                attr="required | Please Enter a TCS Code!"
                value={tcsData?.tcsCode}
                showValidation={isValid}
                onChange={(e) => inputHandler("tcsCode", e.target.value)}
              >
                <Input size="default" placeholder="Enter New TCS Code.." />
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
                  TCS Description
                </span>
              }
            >
              <Field
                attr="required | Please Enter a TCS Description!"
                value={tcsData?.desc}
                showValidation={isValid}
                onChange={(e) => inputHandler("desc", e.target.value)}
              >
                <TextArea
                  rows={4}
                  style={{ resize: "none" }}
                  size="default"
                  placeholder="Enter a TCS Desctiption.."
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
                  TCS Percentage
                </span>
              }
            >
              <Field
                attr="required | Please Enter TCS Percentage!"
                value={tcsData?.percentage}
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
                onBlur={() => setAsyncOptions([])}
                value={tcsData?.glKey}
                onChange={(value) => {
                  inputHandler("glKey", value);
                }}
                loadOptions={getGLList}
                optionsState={asyncOptions}
                defaultOptions
                placeholder="Select G/L..."
                labelInValue
                showError={isValid}
                message="Please select G/L!"
              />
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
                  Status
                </span>
              }
            >
              <Field
                attr="required | Please select a Status!"
                value={tcsData?.status}
                showValidation={isValid}
                onChange={(e) => inputHandler("status", e)}
              >
                <Select size="default" options={status} />
              </Field>
            </Form.Item>
          </Form>
        </Col>
      </Row>
    </Drawer>
  );
}

export default EditTCS;
