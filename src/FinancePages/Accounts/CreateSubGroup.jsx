import { useEffect, useState } from "react";
import Tree from "../../Components/Tree";

// import Loading from "../../Components/Loading";
import { Button, Card, Col, Form, Input, Row, Space } from "antd";
import MyAsyncSelect from "../../Components/MyAsyncSelect";
import { imsAxios } from "../../axiosInterceptor";
import { useToast } from "../../hooks/useToast";
import Field from "../../Components/Field.jsx";

export default function CreateSubGroup() {
  const { showToast } = useToast();
  const [newsubGroup, setNewSubGroup] = useState({
    group_name: "",
    code: "",
    parent: "",
  });
  const [subGroups, setSubGroups] = useState([]);
  // const [searchInput, setSearchInput] = useState("");
  const [subGroupAsyncOptions, setSubGroupAsyncOptions] = useState([]);
  // const [loading, setLoading] = useState(false);
  const [selectLoading, setSelectLoading] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [isValid, setIsValid] = useState(false);

  const getSubGroupsTree = async () => {
    const response = await imsAxios.get("/tally/sub_group_tree");
    if (response.success) {
      setSubGroups(response.data);
    }
  };

  const getSubGroupSelect = async (value) => {
    setSelectLoading(true);
    const response = await imsAxios.post("/tally/getSubgroup", {
      search: value,
    });
    let arr = [];
    setSelectLoading(false);
    if (response.success) {
      arr = response.data.map((d) => {
        return { text: d.label, value: d.id };
      });
      setSubGroupAsyncOptions(arr);
    } else {
      setSubGroupAsyncOptions([]);
    }
    // return arr;
  };
  const inputHandler = (name, value) => {
    setNewSubGroup((newsubGroup) => {
      return { ...newsubGroup, [name]: value };
    });
  };
  const createNewSubGroup = async () => {
    if (!newsubGroup.parent || !newsubGroup.group_name || !newsubGroup.code) {
      setIsValid(true);
      return;
    }
    setIsValid(false);
    setFormLoading(true);
    const response = await imsAxios.post("/tally/create_sub_group", {
      ...newsubGroup,
      parent: newsubGroup.parent?.value ?? newsubGroup.parent,
    });
    setFormLoading(false);
    getSubGroupsTree();
    reset();
    if (response.success) {
      showToast(response.message?.msg || response.message);
    } else {
      showToast(response.message?.msg || response.message, "error");
    }
  };
  const reset = () => {
    setIsValid(false);
    setNewSubGroup({
      group_name: "",
      code: "",
      parent: "",
    });
  };
  useEffect(() => {
    getSubGroupsTree();
  }, []);

  useEffect(() => {}, [subGroupAsyncOptions]);
  return (
    <div style={{ position: "relative", height: "100%", width: "100%" }}>
      {/* sub groups */}
      <Row
        gutter={4}
        style={{
          opacity: 1,
          pointerEvents: "all",
          position: "relative",
          padding: "0px 5px",
          height: "100%",
        }}
      >
        <Col span={8}>
          <Card title="Add Sub Group" size="small">
            <Row gutter={8}>
              <Col span={24}>
                <Form size="small" layout="vertical">
                  <Form.Item label="Code">
                    <Field
                      attr="required | Code is required"
                      value={newsubGroup.code}
                      showValidation={isValid}
                      onChange={(e) => {
                        inputHandler("code", e.target.value);
                      }}
                    >
                      <Input
                        size="default"
                        placeholder="Enter New Sub Group Code.."
                      />
                    </Field>
                  </Form.Item>

                  <Form.Item label="Sub Group Name">
                    <Field
                      attr="required | Sub Group Name is required"
                      value={newsubGroup.group_name}
                      showValidation={isValid}
                      onChange={(e) => {
                        inputHandler("group_name", e.target.value);
                      }}
                    >
                      <Input
                        size="default"
                        placeholder="Enter New Sub Group Name.."
                      />
                    </Field>
                  </Form.Item>

                  <Form.Item label="Under Group">
                    <MyAsyncSelect
                      onBlur={() => {
                        setSubGroupAsyncOptions([]);
                      }}
                      value={newsubGroup.parent}
                      onChange={(value) => {
                        inputHandler("parent", value);
                      }}
                      optionsState={subGroupAsyncOptions}
                      loadOptions={getSubGroupSelect}
                      placeholder="Search..."
                      selectLoading={selectLoading}
                      labelInValue
                      showError={isValid}
                      message="Please select a parent"
                    />
                  </Form.Item>
                </Form>
              </Col>
            </Row>
            <Row justify="end">
              <Space>
                <Button
                  type="primary"
                  onClick={createNewSubGroup}
                  loading={formLoading}
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
        <Col span={16} style={{ position: "relative" }}>
          <Card
            size="small"
            style={{ height: "90%", padding: 5 }}
            title="Sub Groups"
          >
            {/* {loading && <Loading />} */}
            {subGroups.length > 0 && <Tree subGroups={subGroups} />}
          </Card>
        </Col>
      </Row>
    </div>
  );
}
