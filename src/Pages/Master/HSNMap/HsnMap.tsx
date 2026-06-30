import  { useEffect, useState } from "react";
import {  Col, Form, Input, Row } from "antd";
//@ts-ignore
import MyAsyncSelect from "@/Components/MyAsyncSelect.jsx";
import { getComponentOptions, getHsnOptions } from "@/api/general";
import useApi from "@/hooks/useApi";
import { convertSelectOptions } from "@/utils/general";
//@ts-ignore
import FormTable2 from "@/Components/FormTable2.jsx";
//@ts-ignore
import MyButton from "../../../Components/MyButton";
import { getHsnList, mapHsn } from "@/api/master/component";
//@ts-ignore
import {useToast} from "../../../hooks/useToast";

const HsnMap = () => {
  const [asyncOptions, setAsyncOptions] = useState([]);
  const { executeFun, loading } = useApi();
  const [form] = Form.useForm();
 const { showToast } = useToast();
  
  const component = Form.useWatch("component", form);

  const getComponents = async (search: string) => {
    const response = await executeFun(
      () => getComponentOptions(search),
      "select",
    );
    //@ts-ignore
    setAsyncOptions(convertSelectOptions(response?.data ?? []));
  };

  const handleFetchHsnOptions = async (search: string) => {
    const response = await executeFun(() => getHsnOptions(search), "select");

    setAsyncOptions(response.data ?? []);
  };

  const submitHandler = async () => {
    try {
      const values = await form?.validateFields();
      const response = await mapHsn(values?.component, values?.rows);

      if (response?.success) {
        form?.resetFields();
      }
    } catch (error: any) {
      showToast(
        error?.errorFields?.[0]?.errors?.[0] ||
          "An error occurred while mapping HSN. Please try again.",
        "error",
      );
    }
  };

  const handleFetchComponentHsn = async (key: string) => {
    const response = await executeFun(() => getHsnList(key), "fetch");
    const fetchedRows = Array.isArray(response?.data) ? response.data : [];
    form.setFieldValue(
      "rows",
      fetchedRows.length > 0 ? fetchedRows : [initialValues.rows[0]],
    );
  };

  useEffect(() => {
    if (component) {
      handleFetchComponentHsn(component);
    }
  }, [component]);
  return (
    <Form
      initialValues={initialValues}
      form={form}
      style={{ height: "100%", padding: "10px" }}
    >
      <Row gutter={14}>
        <Col span={12}>
          <Row gutter={12} style={{}}>
            <Col span={12}>
              <Form.Item
                name="component"
                label="Component Name"
                rules={[{ required: true, message: "Component name is required" }]}
         
              >
                <MyAsyncSelect
                  onBlur={() => setAsyncOptions([])}
                  loadOptions={getComponents}
                  optionsState={asyncOptions}
                  selectLoading={loading("select")}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item>
                <MyButton
                  onClick={submitHandler}
                  loading={loading("submit")}
                  variant="submit"
                  text="Save"
                />
              </Form.Item>
            </Col>
          </Row>
        </Col>
        <Col
          span={24}
          // className="remove-table-footer remove-cell-border"
          style={{ height: "100%", marginTop: 10 }}
        >
          <FormTable2
            form={form}
            listName="rows"
            columns={columns(
              setAsyncOptions,
              asyncOptions,
              handleFetchHsnOptions,
              loading,
            )}
            addableRow={true}
            newRow={initialValues.rows[0]}
            removableRows={true}
            nonRemovableColumns={1}
          />
        </Col>
      </Row>
    </Form>
  );
};

export default HsnMap;

const initialValues = {
  component: undefined,
  rows: [{ code: undefined, tax: undefined }],
};

const columns = (
  //@ts-ignore
  setAsyncOptions,
  //@ts-ignore
  asyncOptions,
  //@ts-ignore
  handleFetchHsnOptions,
  //@ts-ignore
  loading,
) => [
  {
    headerName: "HSN Code",
    width: "160px",
    name: "code",
    field: () => (
      <MyAsyncSelect
        onBlur={() => setAsyncOptions([])}
        loadOptions={handleFetchHsnOptions}
        optionsState={asyncOptions}
        selectLoading={loading("select")}
      />
    ),
    rules: [
      {
        required: true,
        message: `HSN Code is required.`,
      },
    ],
  },
  {
    headerName: "Tax Percentage",
    width: 100,
    name: "tax",
    rules: [
      {
        required: true,
        message: `Tax Rate is required.`,
      },
    ],
    field: () => <Input suffix="%" type="number" />,
  },
];
