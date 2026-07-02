import  { useEffect, useState } from "react";
import { Drawer, Row, Col, Button, Switch, Form, Space, Input } from "antd";
import MySelect from "../../../Components/MySelect";
import { imsAxios } from "../../../axiosInterceptor";
import { useToast } from "../../../hooks/useToast";

function EditClient({
  updatingClient,
  setUpdatingClient,
  getRows,
  addClientApi,
  setAddClientApi,
}) {
  const { showToast } = useToast();
  const [updateClientForm] = Form.useForm();
  // const [statusLoading, setStatusLoading] = useState(false);
  const [tdsOptions, setTdsOptions] = useState([]);
  const [tcsOptions, setTcsOptions] = useState([]);
  const [clientStatus, setClientStatus] = useState();


  const getMatchById = async () => {
    const response = await imsAxios.get(
      `/client/getClient?code=${updatingClient?.code}`
    );

    if (response.success) {
      let obj = {
        ...response.data[0],
      };
      updateClientForm.setFieldsValue(obj);
      setClientStatus(obj.status);
    }
    setAddClientApi(false);
  };

  const getAllTdsCall = async () => {
    const response = await imsAxios.get("/vendor/getAllTds");
    if (response.success) {
      let tdsArr = response.data?.map((row) => {
        return { text: row.tds_name, value: row.tds_key };
      });
      setTdsOptions(tdsArr);
    }
  };

  const getAllTcsCall = async () => {
    setTcsOptions([]);
    const response = await imsAxios.get("/tally/tcs/getAllTcs");

    if (response.success) {
      let tcsArr = response.data?.map((row) => {
        return { text: row.tcsName, value: row.tcsKey };
      });
      setTcsOptions(tcsArr);
    }
  };


  const submitHandler = async () => {
    const values = await updateClientForm.validateFields();

    let obj = {
      code: updatingClient?.code,
      clientName: values?.name,
      email: values?.email,
      panNo: values?.panNo,
      mobileNo: values?.mobile,
      website: values?.website,
      salesPerson: values?.salePerson,
      status: clientStatus,
      tds: values?.tds,
      tcs: values?.tcs,
    };

    const response = await imsAxios.put("/client/update", obj);
    if (response.success) {
      getRows();
      setUpdatingClient(null);
      showToast(response.message);
    } else {
      showToast(response.message?.msg || response.message, "error");
    }
  };

  const changeStatus = () => {
    setClientStatus(clientStatus == "active" ? "inactive" : "active");

    showToast(
      clientStatus == "active"
        ? "Status has been Inactive"
        : "Status has been Active"
    );
  };

  useEffect(() => {
    if (addClientApi == true) {
      getAllTdsCall();
      getAllTcsCall();
      getMatchById();
    }
  }, [updatingClient, addClientApi]);

  return (
    <Drawer
      title={`Update Client: ${updatingClient?.code}`}
      open={updatingClient}
      width={600}
      onClose={() => setUpdatingClient(false)}
      placement="right"
      footer={
        <Row style={{ width: "100%" }} align="middle" justify="space-between">
          <Col>
            <Form style={{ padding: 0, margin: 0 }}>
              <Form.Item label="Active" style={{ padding: 0, margin: 0 }}>
                <Switch
                  // loading={statusLoading}
                  checked={clientStatus == "active"}
                  defaultChecked
                  onChange={changeStatus}
                />
              </Form.Item>
            </Form>
          </Col>
          <Col>
            <Space>
              <Button key="back" onClick={() => setUpdatingClient(false)}>
                Back
              </Button>

              <Button
                key="submit"
                type="primary"
                // loading={submitLoading}
                onClick={submitHandler}
              >
                Submit
              </Button>
            </Space>
          </Col>
        </Row>
      }
    >
      <Form layout="vertical" form={updateClientForm}>
        <Row>
          {/* <Space> */}
          <Col span={24}>
            <Row gutter={10}>
              <Col span={12}>
                <Form.Item label="Vendor Name" name="name">
                  <Input />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="Email" name="email">
                  <Input />
                </Form.Item>
              </Col>
            </Row>
          </Col>
          <Col span={24}>
            <Row gutter={10}>
              <Col span={12}>
                <Form.Item label="PAN Number" name="panNo">
                  <Input />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label="Mobile"
                  name="mobile"
                  rules={[
                    {
                      required: true,
                      message: "Contact no must be add",
                    },
                  ]}
                >
                  <Input />
                </Form.Item>
              </Col>
            </Row>
          </Col>
          <Col span={24}>
            <Row gutter={10}>
              <Col span={12}>
                <Form.Item label="Sale Person" name="salePerson">
                  <Input />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="Website" name="website">
                  <Input />
                </Form.Item>
              </Col>
            </Row>
          </Col>
          {/* <Col span={24}></Col> */}
          {/* <Col span={24}>
            
          </Col> */}
          <Col span={24}>
            <Form.Item label="Client TDS" name="tds">
              <MySelect mode="multiple" options={tdsOptions} />
            </Form.Item>
          </Col>
          <Col span={24}>
            <Form.Item label="Client TCS" name="tcs">
              <MySelect mode="multiple" options={tcsOptions} />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Drawer>
  );
}

export default EditClient;
