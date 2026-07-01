import {
  Button,
  Card,
  Col,
  Form,
  Input,
  Modal,
  Row,
  Space,
} from "antd";
import MySelect from "../../Components/MySelect";
import MyAsyncSelect from "../../Components/MyAsyncSelect";
import { useState } from "react";
import { imsAxios } from "../../axiosInterceptor";
import { useEffect } from "react";
import Loading from "../../Components/Loading";
import FormTable3 from "../../Components/FormTable3";
import { validateTable } from "../../Components/FormTable3";
import { useToast } from "../../hooks/useToast.js";
import useLoading from "../../hooks/useLoading";
import { getComponentOptions } from "../../api/general.ts";
import useApi from "../../hooks/useApi.ts";

const UpdateJW = () => {
  const { showToast } = useToast();
  const [jwUpdateForm] = Form.useForm();
  const [asyncOptions, setAsyncOptions] = useState([]);
  const [loading, setLoading] = useLoading();
  const [components, setComponents] = useState([
    {
      id: 1,
      component: {
        label: "",
        value: "",
      },
      partCode: "",
      unit: "",
      qty: "",
      rate: "",
    },
  ]);

  const { executeFun } = useApi();
  const originalPoNomber = Form.useWatch("originalPoNomber", jwUpdateForm);

  const getOriginalPoOptions = async (search) => {
    setLoading("select", true);
    const response = await imsAxios.post("/JWSupplementary/fetchJwOption", {
      searchTerm: search?.trim(),
    });
    setLoading("select", false);

    let arr = [];
    arr = response.data.map((d) => {
      return { text: d.text, value: d.id };
    });
    setAsyncOptions(arr);
  };

  const getDetails = async (jwId) => {
    try {
      const payload = {
        sup_jobwork_id: jwId,
      };
      setLoading("fetchDetails", true);
      const response = await imsAxios.post(
        "/JWSupplementary/fetchSupplementaryData",
        payload
      );
      setLoading("fetchDetails", false);
      const { data } = response;
     
        if (response.success) {
          const finalObj = {
            jwId: data.headers.jobwork_id,
            orderedQty: data.headers.ordered_qty,
            product: data.headers.product_name,
            date: data.headers.registered_date,
            sku: data.headers.sku_code,
            bom: data.headers.subject_name,
            vendor: data.headers.vendor_name,
          };
          const componentsArr = data.components.map((row) => ({
            component: {
              label: row.component_name,
              value: row.component_key,
            },
            partCode: row.component_part,
            unit: row.component_uom,
            qty: row.recipe_qty,
            rowId: row.row_id,
            rate: "",
          }));
          setComponents(componentsArr);
          jwUpdateForm.setFieldsValue(finalObj);
        }
 
    } catch (error) {
      showToast(error.message, "error");
    } finally {
      setLoading(false);
    }
  };

  const getComponentOption = async (search) => {
    setLoading("select", true);
    // const response = await imsAxios.post("/backend/getComponentByNameAndNo", {
    //   search,
    // });
    const response = await executeFun(
      () => getComponentOptions(search),
      "select"
    );
    setLoading("select", false);
    const { data } = response;
    let arr = [];
    arr = data.map((d) => {
      return { text: d.text, value: d.id };
    });
    setAsyncOptions(arr);
  };

  const getComponentDetails = async (componentKey) => {
    setLoading("fetchComponent", true);
    const response = await imsAxios.post("/JWSupplementary/getComponentData", {
      component: componentKey,
    });
    setLoading("fetchComponent", false);
    // setLoading(false);
    const { data } = response;
    if (data) {
      if (response.success) {
        return { partCode: data.data.part, unit: data.data.unit };
      }
    }
  };
  const calculation = async (values, setEditingRow, name) => {
    const { component } = values;
    let obj = values;
    if (component?.value && name === "component") {
      const { partCode, unit } = await getComponentDetails(component.value);
      obj = { ...obj, partCode, unit };
    }
    setEditingRow(obj);
  };

  const validateHandler = async () => {
    const values = await jwUpdateForm.validateFields();
    const { errors, arr } = validateTable(tableRules, components);
    if (errors) {
      showToast(errors, "error");
      setComponents(arr);
      return;
    }

    const finalObj = {
      original_po: values?.originalPoNomber,
      supp_po_id: values?.suppPoNomber,
      remark: values?.comment,
      row: components.map((row) => row.rowId ?? null),
      part: components.map((row) => row.component.value),
      qty: components.map((row) => row.qty),
      rate: components.map((row) => row.rate),
    };
    Modal.confirm({
      title: "Updating Jobwork",
      content: "Are you sure you want to update jobwork?",
      onOk: () => submitHandler(finalObj),
      okText: "Continue",
      cancelText: "Cancel",
    });
  };

  const submitHandler = async (payload) => {
    const url = "/JWSupplementary/updateJobworkRecipe";
    setLoading("submit", true);
    const response = await imsAxios.post(url, payload);
    setLoading("submit", false);
    const { data } = response;
    if (data) {
      if (response.success) {
        showToast(response.message, "success");
      } else {
        showToast(response.message?.msg || response.message, "error");
      }
    }
  };
  useEffect(() => {
    if (originalPoNomber) {
      getDetails(originalPoNomber);
    }
  }, [originalPoNomber]);

  return (
    <div  style={{ height: "90%", padding: 10 }}>
      <Form
        initialValues={initialValues}
        layout="vertical"
        form={jwUpdateForm}
        style={{ height: "100%" }}
      >
        <Row gutter={6} style={{ height: "100%", overflowY: "hidden" }}>
          {loading("fetchDetails") && <Loading />}
          <Col span={4}>
            <Row gutter={[0, 6]}>
              <Col span={24}>
                <Card size="small" title="Update Jobwork">
                  <Form.Item name="poType" label="Po Type">
                    <MySelect options={poTypeOptions} />
                  </Form.Item>
                  <Form.Item
                    name="originalPoNomber"
                    label="Original PO"
                    rules={rules.originalPoNomber}
                  >
                    <MyAsyncSelect
                      loadOptions={getOriginalPoOptions}
                      optionsState={asyncOptions}
                      onBlur={() => setAsyncOptions([])}
                      selectLoading={loading("select")}
                    />
                  </Form.Item>
                  <Form.Item
                    name="suppPoNomber"
                    label="Supplemantary PO"
                    rules={rules.suppPoNomber}
                  >
                    <Input />
                  </Form.Item>
                  <Form.Item name="comment" label="Comment">
                    <Input.TextArea rows={3} />
                  </Form.Item>
                  <Row justify="end">
                    <Space>
                      <Button onClick={() => {}}>Reset</Button>
                      <Button
                        loading={loading("submit")}
                        type="primary"
                        onClick={validateHandler}
                      >
                        Submit
                      </Button>
                    </Space>
                  </Row>
                </Card>
              </Col>
            </Row>
          </Col>
          <Col span={20} style={{ overflow: "hidden", height: "100%" }}>
            <Card
              size="small"
              style={{ height: "100%" }}
              styles={{
                body: {
                  height: "98%",
                },
              }}
            >
              {loading("fetchComponent") && <Loading />}
              <FormTable3
                columns={[
                  ...componentsItems(
                    getComponentOption,
                    loading,
                    asyncOptions,
                    setAsyncOptions
                  ),
                ]}
                calculation={calculation}
                removableRows={true}
                addableRow={true}
                data={components}
                setData={setComponents}
                rules={tableRules}
              />
            </Card>
          </Col>
        </Row>
      </Form>
    </div>
  );
};

const poTypeOptions = [
  {
    text: "Supplementary",
    value: "S",
  },
];

const initialValues = {
  poType: "S",
};

const rules = {
  originalPoNomber: [
    {
      required: true,
      message: "Please select original PO",
    },
  ],
  suppPoNomber: [
    {
      required: true,
      message: "Please enter supplementary PO",
    },
  ],
};
const tableRules = {
  rate: [
    {
      required: true,
      message: "Please enter rate",
    },
  ],
  component: [
    {
      required: true,
      message: "Please select a  component",
    },
  ],
  qty: [
    {
      required: true,
      message: "Please enter qty",
    },
  ],
};

const componentsItems = (
  getComponentOption,
  loading,
  asyncOptions,
  setAsyncOptions
) => [
  {
    headerName: "#",
    name: "index",
    width: 30,
  },
  {
    headerName: "Component",
    name: "component",
    width: 250,
    flex: true,
    field: (row, _, inputHandler, name) => (
      <MyAsyncSelect
        optionsState={asyncOptions}
        onBlur={() => setAsyncOptions([])}
        // selectLoading={loading1("select")}
        loadOptions={getComponentOption}
        labelInValue={true}
        value={row[name]}
        onChange={(value) => inputHandler(value, row.id, name)}
      />
    ),
  },
  {
    headerName: "Part Code",
    name: "partCode",
    width: 150,
    field: (row, _, inputHandler, name) => <Input value={row[name]} disabled />,
  },
  {
    headerName: "Qty",
    name: "qty",
    width: 100,
    field: (row, _, inputHandler, name) => (
      <Input
        value={row[name]}
        onChange={(e) => inputHandler(e.target.value, row.id, name)}
      />
    ),
  },
  {
    headerName: "UoM",
    name: "unit",
    width: 100,
    field: (row, _, inputHandler, name) => <Input value={row[name]} disabled />,
  },
  {
    headerName: "Rate",
    name: "rate",
    width: 100,
    field: (row, _, inputHandler, name) => (
      <Input
        value={row[name]}
        onChange={(e) => inputHandler(e.target.value, row.id, name)}
      />
    ),
  },
];
export default UpdateJW;
