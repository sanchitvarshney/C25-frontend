import { Select, Spin } from "antd";
export default function MySelect({
  options,
  selectLoading,
  size,
  value,
  onChange,
  disabled,
  labelInValue,
  mode,
  placeholder,
  defaultValue,
  message="Field is required",
  showError= false
}) {
  const isEmpty = value === undefined || value === null || value === "" || !value;
  const showValidation = showError  && isEmpty;
  return (
    <div style={{ position: "relative", width: "100%" }}>
    <Select
      labelInValue={labelInValue}
      mode={mode}
      defaultValue={defaultValue}
      placeholder={placeholder}
      disabled={disabled}
      allowClear
      value={value}
      notFoundContent={selectLoading ? <Spin size="small" /> : null}
      onChange={onChange}
      optionFilterProp="text"
      size={size ? size : "default"}
      style={{
        width: "100%",
      }}
      fieldNames={{ label: "text" }}
      showSearch
      filterOption={(input, option) => {
        return (option?.text?.toString()?.toLowerCase() ?? "").includes(
          input?.toString()?.toLowerCase()
        );
      }}
      options={options}
    />
        {showValidation && <span className="field-validation-tooltip">{message}</span>}
      </div>
  );
}
