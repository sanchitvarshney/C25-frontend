import  { useEffect, useState } from "react";
import { Card, Col, Form, Input, Row, Space } from "antd";
//@ts-ignore
import MyDataTable from "../../Components/MyDataTable";
//@ts-ignore
import MyButton from "../../Components/MyButton";
//@ts-ignore
import useApi from "../../hooks/useApi.ts";
import { createUOM, getUOMList } from "../../api/master/uom";
//@ts-ignore
import { useToast } from "../../hooks/useToast.js";

const Uom = () => {
  const [uomData, setUomData] = useState([]);
  const { showToast } = useToast();

  const { executeFun, loading } = useApi();
  const [form] = Form.useForm();

  //   fetch uom
  const handleFetchUOMList = async () => {
    const response = await executeFun(() => getUOMList(), "fetch");
    setUomData(response.data ?? []);

  };

  //   add UOM
  const submitHandler = async () => {
  try {    const values = await form.validateFields();
    const payload = {
      name: values.name,
      details: values.details,
    };

    const response = await executeFun(() => createUOM(payload), "fetch");
    if (response.success) {
      form.resetFields();
      handleFetchUOMList();
    }
  } catch (error:any) {
    showToast(error?.errorFields?.[0]?.errors?.[0] , "error");
  }


  };

  const resetHandler = () => {
    form.resetFields();

    //old code
    // setNewUom({
    //   uom: "",
    //   description: "",
    // });
  };

  const columns = [
    { field: "id", headerName: "#", width: 30 },
    { field: "name", headerName: "Unit", minWidth: 170, flex: 1 },
    { field: "details", headerName: "Specification", minWidth: 170, flex: 1 },
  ];
  // old code
  // const columns = [
  //   { field: "index", headerName: "S.No", width: 170 },
  //   { field: "units_name", headerName: "Unit", width: 170 },
  //   { field: "units_details", headerName: "Specification", width: 170 },
  // ];

  useEffect(() => {
    handleFetchUOMList();
  }, []);

  return (
    <div style={{ height: "100%", padding: 10 }}>
      <Row gutter={12} >
        <Col span={8}>
          <Card size="small" title="Create UOM">
            <Form form={form} layout="vertical">
              <Form.Item name="name" label="Unit" rules={[{ required: true, message: "Please enter unit name" }]}>
                <Input />
              </Form.Item>
              <Form.Item name="details" label="Specification">
                <Input.TextArea rows={3} />
              </Form.Item>
              <Row justify="center">
                <Space>
                  <MyButton onClick={resetHandler} variant="reset" />
                  <MyButton
                    loading={loading("submit")}
                    onClick={submitHandler}
                    variant="submit"
                  />
                </Space>
              </Row>
            </Form>
          </Card>
        </Col>
        <Col span={16}>
          <div className="m-2" style={{ height: "100%" }}>
            <div style={{ height: "80vh" }}>
              <MyDataTable
                loading={loading("fetch")}
                data={uomData}
                columns={columns}
              />
            </div>
          </div>
        </Col>
      </Row>
    </div>
  );
};

export default Uom;
