import { Input } from "antd";
import Field from "./Field";
import MyAsyncSelect from "./MyAsyncSelect";
// const gstTypeOptions = [
//   { value: "I", text: "INTER STATE" },
//   { value: "L", text: "LOCAL" },
// ];

export const asyncSelectComponent = ({
  row,
  inputHandler,
  loadOptions,
  setAsyncOptions,
  asyncOptions,
  selectLoading,
  value,
  showError = false,
  message,
}) => (
  <MyAsyncSelect
    selectLoading={selectLoading}
    onBlur={() => setAsyncOptions([])}
    value={value}
    onChange={(value) => {
      inputHandler("component", value, row?.id);
    }}
    labelInValue
    loadOptions={loadOptions}
    optionsState={asyncOptions}
    showError={showError}
    message={message}
  />
);

export const inputComponent = ({ ...args }) => {
  const fieldValue =
    args.type == "calculated" ? args.value : args.row[args.value?.toString()];
  const input = (
    <Input
      value={fieldValue}
      onChange={(e) => {
        args.inputHandler(args.value, e.target.value, args.row?.id);
      }}
      disabled={args.disabled}
      suffix={args.suffix ?? ""}
    />
  );
  if (!args.showError) return input;
  return (
    <Field
      attr={`required | ${args.message ?? "This field is required"}`}
      value={fieldValue}
      treatZeroAsEmpty={args.treatZeroAsEmpty}
      showValidation={args.showError}
    >
      {input}
    </Field>
  );
};
