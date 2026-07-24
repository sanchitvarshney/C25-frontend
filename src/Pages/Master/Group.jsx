import { useEffect, useState } from "react";
import { useToast } from "../../hooks/useToast.js";
import { Col, Form, Input, Row, Space } from "antd";
import MyDataTable from "../../Components/MyDataTable";
import { v4 } from "uuid";
import { imsAxios } from "../../axiosInterceptor";
import MyButton from "../../Components/MyButton";
import Field from "../../Components/Field";

const Group = () => {
  const { showToast } = useToast();
  const [newGroup, setNewGroup] = useState("");
  const [groupData, setGroupData] = useState([]);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [tableLoading, setTableLoading] = useState(false);
  const [isValid, setIsValid] = useState(false);

  const columns = [
    { field: "ID", headerName: "Serial No", width: 100 },
    { field: "group_name", headerName: "Group Name", flex: 1 },
  ];

  const addGroup = async (e) => {
    e.preventDefault();
    if (!newGroup) {
      setIsValid(true);
      return;
    }
    setIsValid(false);
    setSubmitLoading(true);
    const response = await imsAxios.post("/groups/insert", {
      group_name: newGroup,
    });
    setSubmitLoading(false);
    if (response.success) {
      showToast(response.message, "success");
      fetchGroup();
      setNewGroup("");
    } else {
      showToast(response.message, "error");
    }
  };

  const fetchGroup = async () => {
    setTableLoading(true);

    const response = await imsAxios.get("/groups/allGroups");
    setTableLoading(false);
    if (response.success) {
      let arr = response.data.map((row) => {
        return {
          ...row,
          id: v4(),
        };
      });
      setGroupData(arr);
    } else {
      showToast(response.message, "error");
    }
  };

  const reset = () => {
    setNewGroup("");
    setIsValid(false);
  };

  useEffect(() => {
    fetchGroup();
  }, []);
  return (
    <div style={{ height: "100%" , padding: 10}}>
      <Row gutter={12} style={{ height: "100%" }}>
        <Col span={12}>
          <Row gutter={12}  >
           <Col span={16}>
            <Form >
              <Field
                attr="required | Please Add a Group"
                value={newGroup}
                showValidation={isValid}
              >
                <Form.Item label="Group Name">
                  <Input
                    placeholder="Enter Group Name.."
                    value={newGroup}
                    onChange={(e) => setNewGroup(e.target.value)}
                  />
                </Form.Item>
              </Field>
            </Form>
           </Col>
       
              <Col span={8} >
                <Space>
                  <MyButton onClick={reset} variant="reset">
                    Reset
                  </MyButton>
                  <MyButton
                    loading={submitLoading}
                    type="primary"
                    onClick={addGroup}
                    variant="add"
                  >
                    Submit
                  </MyButton>
                </Space>
              </Col>
            </Row>
        
        </Col>
        <Col style={{ height: "calc(100% - 50px)" }} span={24}>
          <MyDataTable
            loading={tableLoading}
            data={groupData}
            columns={columns}
          />
        </Col>
      </Row>
    </div>
  );
};

export default Group;
