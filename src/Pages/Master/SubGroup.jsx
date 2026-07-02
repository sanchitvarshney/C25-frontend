import  { useEffect, useState } from "react";
import { useToast } from "../../hooks/useToast.js";
import { Card, Col, Form, Input, Row, Space, Drawer, Button, } from "antd";
import MyDataTable from "../../Components/MyDataTable";
import { v4 } from "uuid";
import { imsAxios } from "../../axiosInterceptor";
import MyButton from "../../Components/MyButton";
import MyAsyncSelect from "../../Components/MyAsyncSelect";
import TableActions from "../../Components/TableActions.jsx/TableActions";

const SubGroup = () => {
  const { showToast } = useToast();
  const [form] = Form.useForm();
  const [editForm] = Form.useForm();
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [subGroupName, setSubGroupName] = useState("");
  const [subGroupDesc, setSubGroupDesc] = useState("");
  const [groupOptions, setGroupOptions] = useState([]);
  const [asyncOptions, setAsyncOptions] = useState([]);
  const [editAsyncOptions, setEditAsyncOptions] = useState([]);
  const [subGroupData, setSubGroupData] = useState([]);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [tableLoading, setTableLoading] = useState(false);
  const [selectLoading, setSelectLoading] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingRow, setEditingRow] = useState(null);

  // Fetch groups for dropdown
  const fetchGroups = async (search = "") => {
    try {
      setSelectLoading(true);
      const response = await imsAxios.post("/groups/groupSelect2", {
        searchTerm: search,
      });
      if (response?.success) {
        const arr = response?.data.map((row) => ({
          text: row.text,
          value: row.id || row.key,
        }));
        setGroupOptions(arr);
        setAsyncOptions(arr);
      }
    } catch (error) {
      console.error("Error fetching groups:", error);
      setGroupOptions([]);
      setAsyncOptions([]);
    } finally {
      setSelectLoading(false);
    }
  };

  // Fetch subgroup list
  const fetchSubGroup = async () => {
    try {
      setTableLoading(true);
      const response = await imsAxios.get("/master/subgroup/list");
      setTableLoading(false);

      if (response?.success) {
        const arr = response?.data.map((row, index) => ({
          id: row.subGroup?.key || v4(),
          serialNo: index + 1,
          groupName: row.group?.name || "--",
          groupKey: row.group?.key || "--",
          subGroupName: row.subGroup?.name || "--",
          subGroupKey: row.subGroup?.key || "--",
          subGroupDesc: row.subGroupDesc || "--",
          createdAt: row.createdAt || "--",
        }));
        setSubGroupData(arr);
      } else {
        setSubGroupData([]);
      }
    } catch (error) {
      setTableLoading(false);
      setSubGroupData([]);
      showToast(error?.message, "error");
    }
  };

  // Submit new subgroup
  const addSubGroup = async () => {
    if (!selectedGroup) {
      showToast("Please select a Group", "error");
      return;
    }
    if (!subGroupName.trim()) {
      showToast("Please enter Sub Group Name", "error");
      return;
    }
    if (!subGroupDesc.trim()) {
      showToast("Please enter Description", "error");
      return;
    }

    try {
      setSubmitLoading(true);
      const groupKey =
        typeof selectedGroup === "object" ? selectedGroup.value : selectedGroup;

      const payload = {
        groupId: groupKey,
        subGroupName: subGroupName.trim(),
        subGroupDesc: subGroupDesc.trim(),
      };

      const response = await imsAxios.post("/master/subgroup/add", payload);
      setSubmitLoading(false);

      if (response?.success) {
        showToast("Sub Group added successfully", "success");
        reset();
        fetchSubGroup();
      } else {
        showToast(
          response?.message, "error"
        );
      }
    } catch (error) {
      setSubmitLoading(false);
      console.error("Error adding subgroup:", error);
      showToast(
        error?.response?.data?.message?.msg || "Failed to add Sub Group", "error"
      );
    }
  };

  const reset = () => {
    setSelectedGroup(null);
    setSubGroupName("");
    setSubGroupDesc("");
    form.resetFields();
  };

  const handleEdit = async (row) => {
    setEditingRow(row);
    setEditModalVisible(true);
    await fetchGroups();

    const groupOption = groupOptions.find(
      (opt) => opt.value === row.groupKey
    ) || { text: row.groupName, value: row.groupKey };

    setEditAsyncOptions(groupOptions.length > 0 ? groupOptions : [groupOption]);

    editForm.setFieldsValue({
      group: groupOption,
      subGroupName: row.subGroupName,
      subGroupDesc: row.subGroupDesc,
    });
  };

  const handleUpdate = async () => {
    try {
      const values = await editForm.validateFields();

      if (!values.group) {
        showToast("Please select a Group", "error");
        return;
      }
      if (!values.subGroupName?.trim()) {
        showToast("Please enter Sub Group Name", "error");
        return;
      }
      if (!values.subGroupDesc?.trim()) {
        showToast("Please enter Description", "error");
        return;
      }

      setUpdateLoading(true);
      const groupKey =
        typeof values.group === "object" ? values.group.value : values.group;

      const payload = {
        groupId: groupKey,
        subGroupName: values.subGroupName.trim(),
        subGroupDesc: values.subGroupDesc.trim(),
      };

      const response = await imsAxios.put(
        `/master/subgroup/edit/${editingRow.subGroupKey}`,
        payload
      );
      setUpdateLoading(false);

      if (response?.success) {
        showToast(response?.message, "success");
        setEditModalVisible(false);
        setEditingRow(null);
        editForm.resetFields();
        fetchSubGroup();
      } else {
        showToast(response?.message, "error");
      }
    } catch (error) {
      setUpdateLoading(false);
      console.error("Error updating subgroup:", error);
      if (error?.errorFields) {
        return;
      }
      showToast(
        error?.response?.message, "error"
      );
    }
  };

  // Handle modal close
  const handleModalClose = () => {
    setEditModalVisible(false);
    setEditingRow(null);
    editForm.resetFields();
    setEditAsyncOptions([]);
  };
  const columns = [
    { field: "serialNo", headerName: "Serial No", width: 100 },
    { field: "groupName", headerName: "Group Name", flex: 1 },
    { field: "subGroupName", headerName: "Sub Group Name", flex: 1 },
    { field: "subGroupDesc", headerName: "Description", flex: 2 },
    { field: "createdAt", headerName: "Created At", width: 150 },
    {
      headerName: "Action",
      type: "actions",
      field: "action",
      getActions: ({ row }) => [
        <TableActions
          key="edit"
          action="edit"
          onClick={() => handleEdit(row)}
        />,
      ],
    },
  ];

  useEffect(() => {
    fetchGroups();
    fetchSubGroup();
  }, []);

  return (
    <div style={{ height: "100%", padding: 10 }}>
      <Row gutter={12} style={{  height: "100%" }}>
        <Col span={8}>
          <Card title="Add Sub Group" size="small">
            <Form form={form} layout="vertical">
              <Form.Item
                label="Group"
                rules={[{ required: true, message: "Please select a Group" }]}
              >
                <MyAsyncSelect
                  placeholder="Select Group..."
                  optionsState={asyncOptions}
                  loadOptions={fetchGroups}
                  onBlur={() => setAsyncOptions([])}
                  onChange={(value) => {
                    setSelectedGroup(value);
                    form.setFieldValue("group", value);
                  }}
                  value={selectedGroup}
                />
              </Form.Item>

              <Form.Item
                label="Sub Group Name"
                rules={[
                  { required: true, message: "Please enter Sub Group Name" },
                ]}
              >
                <Input
                  placeholder="Enter Sub Group Name..."
                  value={subGroupName}
                  onChange={(e) => {
                    setSubGroupName(e.target.value);
                    form.setFieldValue("subGroupName", e.target.value);
                  }}
                />
              </Form.Item>

              <Form.Item
                label="Description"
                rules={[
                  { required: true, message: "Please enter Description" },
                ]}
              >
                <Input.TextArea
                  rows={4}
                  placeholder="Enter Description..."
                  value={subGroupDesc}
                  onChange={(e) => {
                    setSubGroupDesc(e.target.value);
                    form.setFieldValue("description", e.target.value);
                  }}
                />
              </Form.Item>
            </Form>
            <Row justify="end">
              <Col>
                <Space>
                  <MyButton onClick={reset} variant="reset">
                    Reset
                  </MyButton>
                  <MyButton
                    loading={submitLoading}
                    type="primary"
                    onClick={addSubGroup}
                    variant="add"
                  >
                    Submit
                  </MyButton>
                </Space>
              </Col>
            </Row>
          </Card>
        </Col>
        <Col style={{ height: "100%" }} span={16}>
          <MyDataTable
            loading={tableLoading}
            data={subGroupData}
            columns={columns}
          />
        </Col>
      </Row>

      {/* Edit Drawer */}
      <Drawer
        title="Edit Sub Group"
        open={editModalVisible}
        onClose={handleModalClose}
         extra={
                <Space>
                   <Button key="cancel" onClick={handleModalClose}>
            Cancel
          </Button>
          <Button
            key="update"
            type="primary"
            loading={updateLoading}
            onClick={handleUpdate}
          >
            Update
          </Button>
                </Space>
              }
      
        width={600}
        placement="right"
      >
        <Form form={editForm} layout="vertical">
          <Form.Item
            name="group"
            label="Group"
            rules={[{ required: true, message: "Please select a Group" }]}
          >
            <MyAsyncSelect
              placeholder="Select Group..."
              optionsState={editAsyncOptions}
              loadOptions={fetchGroups}
              onBlur={() => setEditAsyncOptions([])}
              onChange={(value) => {
                editForm.setFieldValue("group", value);
              }}
            selectLoading={selectLoading}
            />
          </Form.Item>

          <Form.Item
            name="subGroupName"
            label="Sub Group Name"
            rules={[{ required: true, message: "Please enter Sub Group Name" }]}
          >
            <Input placeholder="Enter Sub Group Name..." />
          </Form.Item>

          <Form.Item
            name="subGroupDesc"
            label="Description"
            rules={[{ required: true, message: "Please enter Description" }]}
          >
            <Input.TextArea rows={4} placeholder="Enter Description..." />
          </Form.Item>
        </Form>
      </Drawer>
    </div>
  );
};

export default SubGroup;
