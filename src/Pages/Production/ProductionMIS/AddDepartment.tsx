import { createDepartment } from "@/api/production/mis";
import useApi from "@/hooks/useApi";
import { Flex, Form, Input, Modal } from "antd";
//@ts-ignore
import MyButton from "@/Components/MyButton/index.jsx";

interface ModalProps {}

const AddDepartmentModal = ({}: ModalProps) => {
  const [form] = Form.useForm();
  const { executeFun, loading } = useApi();

  const handleCreateDepartment = async () => {
    const values = await form.validateFields();

    const response = await executeFun(
      () => createDepartment(values.name),
      "submit"
    );
    if (response.success) {
      form.setFieldValue("name", undefined);
    }
  };
  return (
   
    <Form form={form} layout="vertical">
      <Form.Item name="name" label="Department Name">
        <Input />
      </Form.Item>
      <Flex justify="end">
        <MyButton
          onClick={handleCreateDepartment}
          loading={loading("submit")}
          variant="add"
        />
      </Flex>
    </Form>
    
  );
};

export default AddDepartmentModal;
