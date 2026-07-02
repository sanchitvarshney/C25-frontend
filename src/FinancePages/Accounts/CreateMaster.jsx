import { useEffect, useState } from "react";
import CreateSubGroup from "./CreateSubGroup";
import MyDataTable from "../../Components/MyDataTable";
import { Button, Card, Col, Form, Input, Row, Space } from "antd";
import { v4 } from "uuid";
import { imsAxios } from "../../axiosInterceptor";
import { useToast } from "../../hooks/useToast";

export default function CreateMaster() {
  const { showToast } = useToast();
  const [newMasterGroup, setNewMasterGroup] = useState({
    group_name: "",
    code: "",
  });
  const [masterGroups, setMasterGroups] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const masterTablColumn = [
    { headerName: "Master Group", field: "group_name", flex: 1 },
    { headerName: "Group Code", field: "code", flex: 1 },
  ];

  const getMasterGroups = async () => {
    setLoading(true);
    const response = await imsAxios.get("/tally/master_group_list");
    if (response.success) {
      const arr = response.data.map((row) => {
        return { ...row, id: v4() };
      });
      setMasterGroups(arr);
    } else {
      showToast(response.message?.msg || response.message, "error");
    }
    setLoading(false);
  };
  const inputHandler = (name, value) => {
    setNewMasterGroup((newMasterGroup) => {
      return { ...newMasterGroup, [name]: value };
    });
  };
  const addNewMaster = async () => {
    if (newMasterGroup.group_name == "" || newMasterGroup.code == "") {
      return showToast("Please input both fields", "error");
    }
    setFormLoading(true);
    const response = await imsAxios.post("/tally/create_master_group", {
      ...newMasterGroup,
    });
    setFormLoading(false);
    if (response.success) {
      showToast(response.message?.msg || response.message);
      getMasterGroups();
    } else {
      showToast(response.message?.msg || response.message, "error");
    }
  };
  const reset = () => {
    setNewMasterGroup({
      group_name: "",
      code: "",
    });
  };
  useEffect(() => {
    getMasterGroups();
  }, []);

  return (
    <div
      style={{
        height: "100%",
        overflowY: "auto",
        overflowX: "hidden",
        position: "relative",
        padding: 10,
      }}
    >
      <Row
        gutter={4}
        style={{
          height: "calc(100% - 40px)",
          marginBottom: 5,
        }}
      >
        <Col span={8}>
          <Card
            styles={{
              body: {
                // overflowY: "auto",
                maxHeight: "100%",
              },
            }}
            style={{ height: "90%", overflowY: "scroll" }}
            title="Add New Master"
            size="small"
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
                        Code
                      </span>
                    }
                  >
                    <Input
                      size="default"
                      value={newMasterGroup.code}
                      onChange={(e) => inputHandler("code", e.target.value)}
                      placeholder="Enter New Master Group Code.."
                    />
                  </Form.Item>

                  <Form.Item
                    label={
                      <span
                        style={{
                          fontSize: window.innerWidth < 1600 && "0.7rem",
                        }}
                      >
                        Master Group Name
                      </span>
                    }
                  >
                    <Input
                      size="default"
                      value={newMasterGroup.group_name}
                      onChange={(e) =>
                        inputHandler("group_name", e.target.value)
                      }
                      placeholder="Enter New Master Group Code.."
                    />
                  </Form.Item>
                </Form>
              </Col>
            </Row>

            <Row justify="end">
              <Space>
                <Button
                  loading={formLoading}
                  type="primary"
                  onClick={addNewMaster}
                >
                  Save
                </Button>
                <Button type="secondary" onClick={reset}>
                  Reset
                </Button>
              </Space>
            </Row>
          </Card>
        </Col>
        <Col
          className="remove-table-footer"
          style={{ height: "100%" }}
          span={16}
        >
          <Card
            title="Master Groups"
            size="small"
            style={{ height: "100%" }}
            styles={{ body: { height: "83%" } }}
          >
            <div
              style={{
                height: "100%",
              }}
            >
              <MyDataTable
                loading={loading}
                columns={masterTablColumn}
                data={masterGroups}
              />
            </div>
          </Card>
        </Col>
      </Row>
      <Row style={{ height: "40vh" }}>
        <CreateSubGroup />
      </Row>
    </div>
  );
}
