import { Button, Form, Input } from "antd";
import MyDataTable from "../../../Components/MyDataTable";
import { imsAxios } from "../../../axiosInterceptor";
import { useEffect, useState } from "react";
import { v4 } from "uuid";
import MyButton from "../../../Components/MyButton";
import { useToast } from "../../../hooks/useToast.js";

function QaProcess() {
  const { showToast } = useToast();
  const [rows, setRows] = useState([]);
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const addRows = async (values) => {
    setLoading(true);
    const response = await imsAxios.post(
      "/qaProcessmaster/insert_Process",
      values,
    );
    if (response.success) {
      showToast(response.message, "success");
      getRows();
      form.resetFields();
    } else {
      showToast(response.message, "error");
    }
    setLoading(false);
  };
  const getRows = async () => {
    const response = await imsAxios.get("/qaProcessmaster/fetch_Process");
    if (response.success) {
      const data = response.data;
      const arr = data.map((row, index) => {
        return {
          ...row,
          id: v4(),
          index: index + 1,
        };
      });
      setRows(arr);
    }
  };
  const submitForm = async () => {
    const values = await form.validateFields();
    addRows(values);
  };
  const columns = [
    {
      headerName: "Index",
      field: "index",
      width: 100,
    },
    {
      headerName: "Process Code",
      field: "process_code",
      flex: 1,
    },
    {
      headerName: "Process Name",
      field: "process_name",
      flex: 1,
    },
    {
      headerName: "Process Decsription",
      field: "process_desc",
      flex: 1,
    },
  ];
  useEffect(() => {
    getRows();
  }, []);

  return (
    <div
      style={{
        height: "calc(100vh - 120px)",
        padding: 10,
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Form
        form={form}
        style={{
          display: "flex",
          gap: "1rem",
          alignItems: "center",
          marginBottom: 10,
          flexShrink: 0,
        }}
      >
        <Form.Item
          name="processName"
          label="Process Name"
          rules={rules.processName}
          style={{ marginBottom: 0 }}
        >
          <Input />
        </Form.Item>
        <Form.Item
          name="processDesc"
          label="Process Description"
          rules={rules.processDesc}
          style={{ marginBottom: 0 }}
        >
          <Input />
        </Form.Item>
        <Form.Item style={{ marginBottom: 0 }}>
          <Button onClick={() => form.resetFields()}>Reset</Button>
        </Form.Item>
        <Form.Item style={{ marginBottom: 0 }}>
          <MyButton
            variant="search"
            type="primary"
            onClick={submitForm}
            loading={loading}
          >
            Submit
          </MyButton>
        </Form.Item>
      </Form>

      <div style={{ flex: 1, minHeight: 0 }}>
        <MyDataTable columns={columns} data={rows} />
      </div>
    </div>
  );
}

export default QaProcess;

const rules = {
  processName: [
    {
      required: true,
      message: "Process Name is required",
    },
  ],
  processDesc: [
    {
      required: true,
      message: "Process description is required",
    },
  ],
};
