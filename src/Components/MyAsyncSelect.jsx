import { useEffect, useState, forwardRef } from "react";
import { Select, Empty, Spin, Row } from "antd";
import { SearchOutlined } from "@ant-design/icons";
const { Option } = Select;

const MyAsyncSelect = forwardRef(function MyAsyncSelect({
  value,
  onChange,
  loadOptions,
  size,
  placeholder,
  onBlur,
  optionsState,
  defaultValue,
  selectLoading,
  labelInValue,
  borderBottom,
  mode,
  disabled,
  noBorder,
  color,
  hideArrow,
  searchIcon,
  onFocus,
  onMouseEnter,
}, ref) {
  const [searchValue, setSearchValue] = useState("");
  const updatedValue = useDebounce(searchValue);
 

  useEffect(() => {
    if (updatedValue.length >= 3) {
      loadOptions(updatedValue);
    }
  }, [updatedValue]);

  // Normalize value for labelInValue mode
  const normalizedValue = labelInValue
    ? value && typeof value === "object" && value.value !== undefined
      ? value
      : value === "" || value === null || value === undefined
      ? undefined
      : undefined
    : value;

  return (
    <Select
      ref={ref}
      onMouseEnter={onMouseEnter}
      onBlur={onBlur}
      disabled={disabled}
      showSearch
      variant={noBorder ? "borderless" : "outlined"}
      value={normalizedValue}
      placeholder={placeholder}
      onFocus={onFocus}
      // suffixIcon={<SearchOutlined />}
      // allowClear
      defaultValue={defaultValue}
      mode={mode}
      suffixIcon={hideArrow ? null : undefined}
      size={size ? size : "default"}
      style={{
        width: "100%",
        color: color,
        cursor: "pointer",
      }}
      filterOption={false}
      onSearch={(value) => {
        setSearchValue(value);
      }}
      onChange={onChange}
      notFoundContent={
        selectLoading ? (
          <Row justify="center" style={{ padding: 5 }}>
            <Spin size="small" />
          </Row>
        ) : null
      }
      labelInValue={labelInValue}
      options={(optionsState || []).map((d) => ({
        value: d.value,
        label: d.text,
      }))}
    ></Select>
  );
});

export default MyAsyncSelect;

export const useDebounce = (value, delay = 500) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(timeout);
  }, [value, delay]);

  return debouncedValue;
};
