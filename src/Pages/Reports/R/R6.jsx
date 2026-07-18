import { useState } from "react";
import "./r.css";
import { Button, Card, Col, Form, Row, Typography } from "antd";
import MyDatePicker from "../../../Components/MyDatePicker";
import socket from "../../../Components/socket";
import { v4 } from "uuid";
import MyAsyncSelect from "../../../Components/MyAsyncSelect";
import { imsAxios } from "../../../axiosInterceptor";
import { DownloadOutlined, SyncOutlined } from "@ant-design/icons";

const R6 = () => {
  const [loading, setLoading] = useState(false);
  const [asyncOptions, setAsyncOptions] = useState([]);

  const [form] = Form.useForm();
  const location = Form.useWatch("location", form);
    const date = Form.useWatch("date", form);
  const [showValidation, setShowValidation] = useState(false);

  const emitDownloadEvent = async () => {
      if (!date) {
      setShowValidation(true);
      return;
    }
    const values = await form.validateFields();
    let newId = v4();

    const payload = {
      location: values.location?.value,
      date: values.date,
    };
    if (values.location) {
      socket.emit("allCompLocation", {
        otherdata: payload,
        notificationId: newId,
      });
    } else {
      //wait
      socket.emit("allComp", {
        otherdata: payload,
        notificationId: newId,
      });
    }
  };
  const getLocatonOptions = async (search) => {
    setLoading("select");
    const response = await imsAxios.post("/backend/fetchLocation", {
      searchTerm: search,
    });
    getData(response);
  };

  const getData = (response) => {
    const { data } = response;
    if (data) {
      if (data.length) {
        const arr = data.map((row) => ({
          text: row.text,
          value: row.id,
        }));

        setAsyncOptions(arr);
      }
    }
  };

  const resetHandler = () => {
    form.resetFields();
  };
  return (
    <Row
      style={{
        width: "100%",
        justifyContent: "center",
        alignItems: "center",
        height: "calc(100vh - 150px)",
      }}

    >
  
      <Card size="small" title="RM Stock">
        <Form initialValues={initialValues} form={form} layout="vertical">
          <Form.Item label="Location" name="location">
            <MyAsyncSelect
              onBlur={() => setAsyncOptions([])}
              loadOptions={getLocatonOptions}
              optionsState={asyncOptions}
              labelInValue={true}
              selectLoading={loading === "select"}
            />
          </Form.Item>
          <Form.Item label="Date" name="date">
             <MyDatePicker
              size="default"
              value={date}
              setDateRange={(value) => {
                setShowValidation(false);
                form.setFieldValue("date", value);
              }}
              showError={showValidation}
            />
          </Form.Item>
        </Form>
        <div
          style={{
            width: 300,
            marginBottom: 20,
            display: "flex",
            justifyContent: "center",
          }}
        >
          <Typography.Text
            style={{ textAlign: "center" }}
            strong
            type="secondary"
          >
            {!location &&
              "No location has been selected so the report will be generated for all locations (Branch Wise)"}
            {location &&
              `The report will be generated for ${location.label} location`}
          </Typography.Text>
        </div>

        <Row gutter={[0, 6]}>
          <Col span={24}>
            <Button icon={<SyncOutlined />} onClick={resetHandler} block>
              Reset
            </Button>
          </Col>
          <Col span={24}>
            <Button
              icon={<DownloadOutlined />}
              onClick={emitDownloadEvent}
              block
              type="primary"
            >
              Download
            </Button>
          </Col>
        </Row>
      </Card>
    </Row>
  );
};

export default R6;

const initialValues = {
  location: undefined,
  date: "",
};
