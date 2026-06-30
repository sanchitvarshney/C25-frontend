import { useState, useEffect } from "react";
import { Drawer, Input, Button, Form, message } from "antd";
//@ts-ignore
import MyAsyncSelect from "../../../Components/MyAsyncSelect";
//@ts-ignore
import { getBomOptions, getCostCentresOptions } from "../../../api/general.ts";
import { convertSelectOptions } from "@/utils/general";
import useApi from "@/hooks/useApi";

const UpdateProjectModal = ({ 
  data, 
  setIsModalVisible, 
  isModalVisible, 
  onUpdate 
}:any) => {
  const [form] = Form.useForm();


  const [bomOptions, setBomOptions] = useState([]);           
  const [costCenterOptions, setCostCenterOptions] = useState([]); 

  const { executeFun } = useApi();

  // Load BOM options
  const loadBomOptions = async (search:any) => {
    const response = await executeFun(() => getBomOptions(search), "select");
    if (response.success) {
      const options:any = convertSelectOptions(response.data); 
      setBomOptions(options);
    } else {
      setBomOptions([]);
    }
  };

  // Load Cost Center options
  const loadCostCenterOptions = async (search:any) => {
    const response = await executeFun(() => getCostCentresOptions(search), "select");
    if (response.success) {
      const options:any = convertSelectOptions(response.data);
      setCostCenterOptions(options);
    } else {
      setCostCenterOptions([]);
    }
  };

  // Populate form when modal opens with selected project data
  useEffect(() => {
    if (data && isModalVisible) {
      form.setFieldsValue({
        project: data.project,
        description: data.description || "",
        qty: data.qty || 1,
        
        bom: data.bomSubject || null,        
        costcenter: data.costcenter || null,
      });

    
      if (data.bomSubject) {
        setBomOptions([{ label: data.bomSubject, value: data.bomSubject } ] as any);
      }
      if (data.costcenter) {
        setCostCenterOptions([{ label: data.costcenter, value: data.costcenter }] as any);
      }
    }
  }, [data, isModalVisible, form]);

  const handleCancel = () => {
    form.resetFields();
    setBomOptions([]);
    setCostCenterOptions([]);
    setIsModalVisible(false);
  };

  const handleSubmit = () => {
    form
      .validateFields()
      .then((values) => {        
        const updatedData = {
          project: values.project,
          description: values.description?.trim(),
          qty: values.qty,
          bomSubject: values.bom || null,        
          costcenter: values.costcenter || null, 
        };

        onUpdate(updatedData); // Send to parent
      })
      .catch((info) => {
        message.error("Please fill in all required fields.");
      });
  };

  return (
    <Drawer
      title="Update Project"
      open={isModalVisible}           
      onClose={handleCancel}
      width={600}
      placement="right"
      footer={
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
          <Button key="cancel" onClick={handleCancel}>
            Cancel
          </Button>
          <Button key="submit" type="primary" onClick={handleSubmit}>
            Update Project
          </Button>
        </div>
      }
    >
      <Form form={form} layout="vertical">
        <Form.Item 
          name="project" 
          label="Project ID" 
          rules={[{ required: true }]}
        >
          <Input disabled />
        </Form.Item>

        <Form.Item
          name="description"
          label="Project Description"
          rules={[{ required: true, message: "Please enter project description" }]}
        >
          <Input.TextArea rows={3} placeholder="Enter project name/description" />
        </Form.Item>

        <Form.Item name="qty" label="Quantity" rules={[{ required: true }]}>
          <Input type="number" min={1} />
        </Form.Item>

        {/* BOM Field - Uses its own options */}
        <Form.Item name="bom" label="BOM">
          <MyAsyncSelect
            placeholder="Search and select BOM..."
            loadOptions={loadBomOptions}
            optionsState={bomOptions}           
            onBlur={() => setBomOptions([])}  
            allowClear
          />
        </Form.Item>

        {/* Cost Center Field - Uses its own options */}
        <Form.Item name="costcenter" label="Cost Center">
          <MyAsyncSelect
            placeholder="Search and select Cost Center..."
            loadOptions={loadCostCenterOptions}
            optionsState={costCenterOptions}       
            onBlur={() => setCostCenterOptions([])}
            allowClear
          />
        </Form.Item>
      </Form>
    </Drawer>
  );
};

export default UpdateProjectModal;