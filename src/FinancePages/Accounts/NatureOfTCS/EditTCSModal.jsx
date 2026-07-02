import  { useEffect } from "react";
import {
  Button,
  Col,
  Drawer,
  Form,
  Row,
  Input,
  Select,
} from "antd";
import { useState } from "react";
import { imsAxios } from "../../../axiosInterceptor";
import MyAsyncSelect from "../../../Components/MyAsyncSelect";
import {useToast} from "../../../hooks/useToast";

const { TextArea } = Input;

function EditTCS({
  editingTCS,
  setEditingTCS,
  getTCSList,
}) {
 const { showToast } = useToast()
  const status = [
    { label: "Open", value: "open" },
    { label: "Close", value: "closed" },
  ];
  const [tcsData, setTCSData] = useState({});

  const [loading, setLoading] = useState(false);
  const [asyncOptions, setAsyncOptions] = useState([]);
  const [selectLoading, setSelectLoading] = useState(false);

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
      `/tally/tcs/tcsLedgerOptions?search=${search}`
    );
  
    let arr = [];
    if (response.success) {
      arr = response.data.map((d) => {
        return { text: d.text, value: d.id };
      });
      setAsyncOptions(arr);
        setSelectLoading(false);
    } else {
      setAsyncOptions([]);
        setSelectLoading(false);
    }
  };

  const updateTCS = async () => {
    const {
      desc,
      glKey,
      name,
      percentage,
      tcsCode,
      ID,
      status,
    } = tcsData;
    setLoading(true);
    const response = await imsAxios.put(
      "/tally/tcs/update",
      {
        ID: ID,
        code: tcsCode,
        name: name,
        percentage: percentage,
        description: desc,
        ledger: glKey,
        status: status,
      }
    );
    setLoading(false);
    if (response.success) {
      showToast(response.message);
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
      onClose={() => setEditingTCS(null)}
      open={editingTCS}
      extra={
        <Button
          loading={loading}
          type="primary"
          onClick={updateTCS}
        >
          Update
        </Button>
      }
    >
      <Row gutter={16}>
        <Col span={24}>
          <Form size="small" layout="vertical">
            <Form.Item
              label={
                <span
                  style={{
                    fontSize:
                      window.innerWidth < 1600 && "0.7rem",
                  }}
                >
                  TCS Name
                </span>
              }
              rules={[
                {
                  required: true,
                  message: "Please Enter TDS Name!",
                },
              ]}
            >
              <Input
                size="default"
                value={tcsData?.name}
                onChange={(e) =>
                  inputHandler("name", e.target.value)
                }
                placeholder="Enter New TDS Name.."
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
                    fontSize:
                      window.innerWidth < 1600 && "0.7rem",
                  }}
                >
                  TDS Code
                </span>
              }
              rules={[
                {
                  required: true,
                  message: "Please Enter a TCS Code!",
                },
              ]}
            >
              <Input
                size="default"
                value={tcsData?.tcsCode}
                onChange={(e) =>
                  inputHandler("tcsCode", e.target.value)
                }
                placeholder="Enter New TCS Code.."
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
                    fontSize:
                      window.innerWidth < 1600 && "0.7rem",
                  }}
                >
                  TDS Description
                </span>
              }
              rules={[
                {
                  required: true,
                  message:
                    "Please Enter a TCS Description!",
                },
              ]}
            >
              <TextArea
                rows={4}
                style={{ resize: "none" }}
                size="default"
                value={tcsData?.desc}
                onChange={(e) =>
                  inputHandler("desc", e.target.value)
                }
                placeholder="Enter a TCS Desctiption.."
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
                    fontSize:
                      window.innerWidth < 1600 && "0.7rem",
                  }}
                >
                  TDS Percentage
                </span>
              }
              rules={[
                {
                  required: true,
                  message: "Please EnterT DS Percentage!",
                },
              ]}
            >
              <Input
                size="default"
                value={tcsData?.percentage}
                onChange={(e) => {
                  inputHandler(
                    "percentage",
                    e.target.value
                  );
                }}
                placeholder="Enter Percentage..."
                type="number"
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
                    fontSize:
                      window.innerWidth < 1600 && "0.7rem",
                  }}
                >
                  G/L
                </span>
              }
              rules={[
                {
                  required: true,
                  message: "Please select G/L!",
                },
              ]}
            >
              <MyAsyncSelect
                onBlur={() => setAsyncOptions([])}
                value={tcsData?.glName}
                onChange={(value) => {
                  inputHandler("glKey", value);
                }}
                loadOptions={getGLList}
                optionsState={asyncOptions}
                defaultOptions
                placeholder="Select G/L..."
                selectLoading={selectLoading}
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
                    fontSize:
                      window.innerWidth < 1600 && "0.7rem",
                  }}
                >
                  Status
                </span>
              }
              rules={[
                {
                  required: true,
                  message: "Please select G/L!",
                },
              ]}
            >
              <Select
                size="default"
                value={tcsData?.status}
                options={status}
                onChange={(e) => inputHandler("status", e)}
              />
            </Form.Item>
          </Form>
        </Col>
      </Row>
    </Drawer>
  );
}

export default EditTCS;
