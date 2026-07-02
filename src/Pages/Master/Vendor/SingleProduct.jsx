import { Button, Col, Form, Input, Row, Upload } from "antd";
import { Add, Delete } from "@mui/icons-material";

export default function SingleProduct({
  field,
  fields,
  add,
  remove,
}) {

  const normFile = (e) => {
    if (Array.isArray(e)) {
      return e;
    }
    return e?.fileList;
  };
  return (
    <Row
      style={{
        // background: "#f5f5f58f",
        padding: "5px 15px",
        borderRadius: 10,
        marginTop: 5,
        maxHeight: "50%",
        height: "50%",
        overflowY: "hidden",
      }}
      gutter={[6, 10]}
      key={field.key}
    >
      <Col span={6}>
        {" "}
        <Form.Item label="Document Name" name={[field.name, "documentName"]}>
          <Input />
        </Form.Item>
      </Col>
      <Col span={6}>
        <Form.Item
          name={[field.name, "file"]}
          label="Upload"
          valuePropName="fileList"
          getValueFromEvent={normFile}
        >
          <Upload beforeUpload={() => false} name="logo">
            <Button>Click to upload</Button>
          </Upload>
        </Form.Item>
        {/* <Form.Item
          label="File"
          name={[field.name, "file"]}
          valuePropName="fileList"
          getValueFromEvent={normFile}
        >
          <UploadDocs setFiles={setFiles} files={files} />

        </Form.Item> */}
      </Col>
      <Col span={12}>
        <Row justify="end" align="middle" style={{ height: "100%", gap: 10 }}>
          {fields.length > 1 && (
            <Button
              onClick={() => remove(field.name)}
               style={{
              background: "#ffffff",
              borderColor: "#ff8484",
              color: "#f76565",
            }}
              size="small"
              icon={<Delete fontSize="small"  />}
           />
            
          )}
          <Button
            size="small"
            style={{
              background: "#e4f8df",
              borderColor: "#5ab137",
              color: "#158015",
            }}
            onClick={() => add()}
            icon={<Add fontSize="small" />}
          />
        </Row>
      </Col>
    </Row>
  );
}
// const gstRateOptions = [
//   { value: "0", text: "00%" },
//   { value: "5", text: "05%" },
//   { value: "12", text: "12%" },
//   { value: "18", text: "18%" },
//   { value: "28", text: "28%" },
// ];
