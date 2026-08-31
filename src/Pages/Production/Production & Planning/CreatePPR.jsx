import { useState, useEffect } from "react";
import {
  Col,
  Descriptions,
  Divider,
  Form,
  Input,
  Modal,
  Row,
  Typography,
} from "antd";
import { useToast } from "../../../hooks/useToast.js";
import MySelect from "../../../Components/MySelect";
import InputMask from "react-input-mask";
import MyAsyncSelect from "../../../Components/MyAsyncSelect";
import NavFooter from "../../../Components/NavFooter";
import { imsAxios } from "../../../axiosInterceptor";
import Loading from "../../../Components/Loading";
import AddProjectModal from "./AddProjectModal";
import { getProductsOptions, getProjectOptions } from "../../../api/general.ts";
import useApi from "../../../hooks/useApi.ts";
import Field from "../../../Components/Field.jsx";

const { TextArea } = Input;

const CreatePPR = () => {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [bomList, setBomList] = useState([]);
  const [locationn, setLocationn] = useState([]);
  const [asyncOptions, setAsyncOptions] = useState([]);
  const [showAddProjectModal, setShowAddProjectModal] = useState(false);
  const [isValid, setIsValid] = useState(false);

  const [createPPRForm] = Form.useForm();

  const { executeFun, loading: loading1 } = useApi();
  const existingQty = Form.useWatch("existingQty", {
    form: createPPRForm,
    preserve: true,
  });
  const stock = Form.useWatch("stock", {
    form: createPPRForm,
    preserve: true,
  });
  const sku = Form.useWatch("product", {
    form: createPPRForm,
    preserve: true,
  });
  const uom = Form.useWatch("uom", {
    form: createPPRForm,
    preserve: true,
  });
  const project = Form.useWatch("project", {
    form: createPPRForm,
    preserve: true,
  });

  const getLocation = async () => {
    const response = await imsAxios.get("ppr/ppr_section_location");
    const locArr = [];
    response.data.map((a) =>
      locArr.push({ text: `(${a.name}) ${a.address}`, value: a.location_key })
    );
    setLocationn(locArr);
  };

  const handleFetchProjectOptions = async (search) => {
    const response = await executeFun(
      () => getProjectOptions(search),
      "select"
    );
    setAsyncOptions(response.data);
  };

  const handleProjectChange = async (value) => {
    setLoading("page");
    const response = await imsAxios.post("/backend/projectDescription ", {
      project_name: value,
    });
    setLoading(false);
    const { data } = response;
    if (data) {
      if (response.success) {
        createPPRForm.setFieldValue(
          "projectDescription",
          data.description
        );
      } else {
        showToast(response.message?.msg || response.message, "error");
      }
    }
  };

  const handleFetchProductOptions = async (searchInput) => {
    const response = await executeFun(
      () => getProductsOptions(searchInput, true),
      "select"
    );
    setAsyncOptions(response.data);
  };

  const getExistingDetails = async (sku) => {
    setLoading("page");
    const response = await imsAxios.post("/ppr/fetchProductData", {
      search: sku,
    });
    setLoading(false);

    const { data } = response;
    if (data) {
      const bomArr = data.bom.map((row) => ({
        text: row.text,
        value: row.id,
      }));
      setBomList(bomArr);
      createPPRForm.setFieldValue(
        "existingQty",
        data?.other?.existingplanedQty
      );
      createPPRForm.setFieldValue("stock", data?.other?.stockInHand);
      createPPRForm.setFieldValue("uom", data?.other?.uom);
    }
  };

  const validateHandler = async () => {
    let values;
    try {
      values = await createPPRForm.validateFields();
    } catch (error) {
      setIsValid(true);
      return;
    }
    setIsValid(false);

    const payload = {
      comment: values.remark,
      project: values.project.value,
      requesttype: values.type,
      customer: values.customer,
      duedate: values.dueDate,
      location: values.section,
      product: values.product.value,
      projectinfo: values.projectDescription,
      qty: values.qty,
      recipe: values.bom,
      serverrefid: "",
    };

    Modal.confirm({
      title: "Confirm ",
      content: "Are you sure you want to create this PPR?",
      okText: "Continue",
      cancelText: "Cancel",
      onOk: () => submitHandler(payload),
    });
  };

  const submitHandler = async (payload) => {
    try {
      setLoading("submit");
      const response = await imsAxios.post("/ppr/createPPR", payload);
        if (response.success) {
          showToast(response.message, "success");
          resetFunction();
        } else {
          showToast( response.message, "error");
        }
    } catch (error) {
      showToast(error.message || "Something went wrong", "error");
    } finally {
      setLoading(false);
    }
  };

  const resetFunction = () => {
    setIsValid(false);
    createPPRForm.resetFields();
  };

  useEffect(() => {
    if (sku) {
      getExistingDetails(sku.value);
    }
  }, [sku]);

  useEffect(() => {
    getLocation();
  }, []);
  useEffect(() => {
    if (project) {
      handleProjectChange(project.value);
    }
  }, [project]);
  return (
    <div style={{ height: "100%", padding:10 }}>
      <Row gutter={0}>
        {loading === "page" && <Loading />}
        <Form
          initialValues={initialValues}
          form={createPPRForm}
          layout="vertical"
        >
          <Row>
            <Col span={4}>
              <Descriptions size="small" title="PPR Details">
                <Descriptions.Item
                  contentStyle={{
                    fontSize: window.innerWidth < 1600 && "0.7rem",
                  }}
                >
                  Enter details like PPR type and project name
                </Descriptions.Item>
              </Descriptions>
            </Col>
            <Col span={20}>
              <Row gutter={16}>
                <Col span={6}>
                  <Form.Item
                    rules={[{ required: true, message: "" }]}
                    name="type"
                    label="PPR Type"
                  >
                    <MySelect
                      options={pprTypeOptions}
                      showError={isValid}
                      message="Please select PPR Type"
                     
                    />
                  </Form.Item>
                </Col>
                <Col span={6}>
                  <Form.Item
                    rules={[{ required: true, message: "" }]}
                    name="project"
                    label="Project"
                  >
                    <MyAsyncSelect
                      labelInValue
                      loadOptions={handleFetchProjectOptions}
                      optionsState={asyncOptions}
                      loading={loading1("select")}
                      onBlur={() => setAsyncOptions([])}
                      showError={isValid}
                      message="Please select Project"
                    />
                  </Form.Item>
                </Col>
                <Col span={6}>
                  <Form.Item
                    name="projectDescription"
                    label="Project Description"
                  >
                    <Input disabled />
                  </Form.Item>
                </Col>
                <Col span={18}>
                  <Form.Item
                    rules={[{ required: false, message: "" }]}
                    name="remark"
                    label="Remark"
                  >
            
                      <TextArea rows={2} />
             
                  </Form.Item>
                </Col>
              </Row>
            </Col>
            <Divider />
            <Col span={4}>
              <Descriptions size="small" title="Product Details">
                <Descriptions.Item
                  contentStyle={{
                    fontSize: window.innerWidth < 1600 && "0.7rem",
                  }}
                >
                  Enter Product details and planning Qty
                </Descriptions.Item>
              </Descriptions>
            </Col>
            <Col span={20}>
              <Row gutter={16}>
                <Col span={6}>
                  <Form.Item
                    rules={[{ required: true, message: "" }]}
                    name="product"
                    label="Product"
                  >
                    <MyAsyncSelect
                      selectLoading={loading1("select")}
                      loadOptions={handleFetchProductOptions}
                      labelInValue
                      optionsState={asyncOptions}
                      onBlur={() => setAsyncOptions(null)}
                      showError={isValid}
                      message="Please select Product"
                    />
                  </Form.Item>
                </Col>
                <Col span={6}>
                  <Form.Item
                    rules={[{ required: true, message: "" }]}
                    name="bom"
                    label="BOM"
                  >
                    <MySelect
                      options={bomList}
                      showError={isValid}
                      message="Please select bom"
                    />
                  </Form.Item>
                </Col>
                <Col span={6}>
                  <Form.Item
                    rules={[{ required: true, message: "" }]}
                    name="qty"
                    label="Planning Qty"
                  >
                    <Field
                      attr="required | Qty should be greater than zero"
                      treatZeroAsEmpty
                      showValidation={isValid}
                    >
                      <Input suffix={uom} />
                    </Field>
                  </Form.Item>
                </Col>
                <Col span={6}>
                  <Row gutter={24}>
                    <Col>
                      <Typography.Text strong>Existing Qty:</Typography.Text>
                      <br />
                      <Row justify="center">
                        <Typography.Text strong>{existingQty}</Typography.Text>
                      </Row>
                    </Col>
                    <Col>
                      <Typography.Text strong>Stock:</Typography.Text>
                      <br />
                      <Row justify="center">
                        <Typography.Text strong>{stock}</Typography.Text>
                      </Row>
                    </Col>
                  </Row>
                </Col>
                <Col span={6}>
                  <Form.Item
                    rules={[{ required: true, message: "" }]}
                    name="dueDate"
                    label="Due Date"
                  >
                    <Field
                      attr="required | Please enter due date"
                      showValidation={isValid}
                    >
                      <InputMask
                        className="input-date"
                        mask="99-99-9999"
                        placeholder="__-__-____"
                        style={{ textAlign: "center" }}
                      />
                    </Field>
                  </Form.Item>
                </Col>
                <Col span={6}>
                  <Form.Item
                    rules={[{ required: true, message: "" }]}
                    name="section"
                    label="Section / Location"
                  >
                    <MySelect
                      options={locationn}
                      showError={isValid}
                      message="Please select section"
                    />
                  </Form.Item>
                </Col>
                <Col span={6}>
                  <Form.Item
                    rules={[{ required: true, message: "" }]}
                    name="customer"
                    label="Customer Name"
                  >
                    <Field
                      attr="required | Please enter customer name"
                      showValidation={isValid}
                    >
                      <Input />
                    </Field>
                  </Form.Item>
                </Col>
              </Row>
            </Col>
          </Row>
        </Form>
      </Row>
      <NavFooter
        resetFunction={resetFunction}
        submitFunction={validateHandler}
        nextLabel="Submit"
        loading={loading === "submit"}
      />

      <AddProjectModal
        showAddProjectConfirm={showAddProjectModal}
        setShowAddProjectConfirm={setShowAddProjectModal}
      />
    </div>
  );
};
export default CreatePPR;

const initialValues = {
  type: "new",
  project: undefined,
  projectDescription: undefined,
  remark: undefined,
  product: undefined,
  bom: undefined,
  qty: undefined,
  existingQty: "",
  stock: "",
  dueDate: "",
  section: undefined,
  customer: undefined,
};

const pprTypeOptions = [
  { text: "New", value: "new" },
  { text: "Repair", value: "repair" },
  { text: "Testing", value: "testing" },
  { text: "Packing", value: "packing" },
];
