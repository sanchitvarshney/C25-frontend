import { useEffect, useState } from "react";
import { Col, Form, Input, Row } from "antd";
//@ts-ignore
import MyAsyncSelect from "@/Components/MyAsyncSelect.jsx";
import { getComponentOptions, getHsnOptions } from "@/api/general";
import useApi from "@/hooks/useApi";
import { convertSelectOptions } from "@/utils/general";
//@ts-ignore
import FormTable2 from "@/Components/FormTable2.jsx";
//@ts-ignore
import Field from "@/Components/Field.jsx";
//@ts-ignore
import MyButton from "../../../Components/MyButton";
import { getHsnList, mapHsn } from "@/api/master/component";
//@ts-ignore
import { useToast } from "../../../hooks/useToast";

const HsnMap = () => {
  const [asyncOptions, setAsyncOptions] = useState([]);
  const { executeFun, loading } = useApi();
  const [form] = Form.useForm();
  const { showToast } = useToast();
  const [isValid, setIsValid] = useState(false);

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
    let values;
    try {
      values = await form?.validateFields();
      const len = values?.rows?.length -1;
      if (
        values?.rows[len]?.code === undefined ||
        values?.rows[len]?.tax === undefined
      ) {
        setIsValid(true);
        return;
      }
    } catch (error: any) {
      if (error?.errorFields) {
        setIsValid(true);
        return;
      }
      showToast(
        error?.message ||
          "An error occurred while mapping HSN. Please try again.",
        "error",
      );
      return;
    }
    setIsValid(false);
    try {
      const response = await mapHsn(values?.component?.key, values?.rows);

      if (response?.success) {
        form?.resetFields();
        showToast(response?.message, "success");
      }
    } catch (error: any) {
      showToast(
        error?.message ||
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
      handleFetchComponentHsn(component?.key);
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
                rules={[{ required: true, message: "" }]}
              >
                <MyAsyncSelect
                  onBlur={() => setAsyncOptions([])}
                  loadOptions={getComponents}
                  optionsState={asyncOptions}
                  labelInValue
                  selectLoading={loading("select")}
                  showError={isValid}
                  message="Component name is required"
                  value={component}
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
              isValid,
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
  isValid,
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
    field: (row: any) => (
      <MyAsyncSelect
        onBlur={() => setAsyncOptions([])}
        loadOptions={handleFetchHsnOptions}
        optionsState={asyncOptions}
        selectLoading={loading("select")}
        labelInValue
        showError={isValid}
        message="HSN code is required"
        value={row?.code}
      />
    ),
  },
  {
    headerName: "Tax Percentage",
    width: 100,
    name: "tax",
    field: (row: any) => {
      return (
        <Field
          attr="required | Tax Rate is required"
          value={row?.tax}
          showValidation={isValid}
        >
          <Input suffix="%" type="number" />
        </Field>
      );
    },
  },
];
