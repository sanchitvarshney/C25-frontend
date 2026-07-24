
import FormTable2 from "../../../../Components/FormTable2";
import { Input, Typography } from "antd";
import MyAsyncSelect from "../../../../Components/MyAsyncSelect";
import Field from "../../../../Components/Field";

const Components = ({
  asyncOptions,
  setAsyncOptions,
  getComponentOptions,
  loading,
  form,
  isValid,
}) => {

  const componentColumn = {
    headerName: "Components",
    name: "component",
    width: 250,
    flex: true,
    field: () => (
      <MyAsyncSelect
        optionsState={asyncOptions}
        onBlur={() => setAsyncOptions([])}
        loadOptions={getComponentOptions}
        selectLoading={loading}
        labelInValue
        showError={isValid}
        message="Please select a component"
      />
    ),
  };
  let columns = componentsItems(isValid);
  columns.splice(1, 0, componentColumn);

  return (
    <FormTable2
      removableRows={true}
      addableRow={true}
      nonRemovableColumns={1}
      //   columns={componentsItems().splice(2, 0, componentColumn)}
      columns={columns}
      listName="components"
      watchKeys={watchKeys}
      nonListWatchKeys={[]}
      componentRequiredRef={[]}
      form={form}
    />
  );
};

export default Components;

const watchKeys = ["component"];

const componentsItems = (isValid) => [
  {
    headerName: "#",
    name: "",
    width: 30,
    field: (_, index) => (
      <Typography.Text type="secondary">{index + 1}.</Typography.Text>
    ),
  },

  {
    headerName: "Qty",
    name: "qty",
    width: 250,
    flex: true,
    field: () => (
      <Field attr="required | Please enter Qty" showValidation={isValid}>
        <Input type="number" />
      </Field>
    ),
  },
];
