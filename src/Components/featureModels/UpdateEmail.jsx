
import { Modal, Form, Input, Button, Space } from "antd";
import { useSelector } from "react-redux/es/exports";

const UpdateEmail = ({ open, handleClose }) => {
  const { user } = useSelector(
      (state) => state.login
    );

  const [form] = Form.useForm();

  const onFinish = () => {

    handleClose();
    form.resetFields();
  };

  return (
    <Modal
      title="Update Email"
      open={open}
      onCancel={() => {
        handleClose();
        form.resetFields();
      }}
      footer={null}
      width={500}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        initialValues={{ email: user?.crn_email }}
      >
        <Form.Item
          label="Email"
          name="email"
          rules={[
            { required: true, message: "Please enter your email" },
            { type: "email", message: "Please enter a valid email" },
          ]}
        >
          <Input placeholder="Enter your email" />
        </Form.Item>
        <Form.Item>
          <Space>
            <Button onClick={() => {
              handleClose();
              form.resetFields();
            }}>
              Cancel
            </Button>
            <Button type="primary" htmlType="submit">
              Update
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default UpdateEmail;

