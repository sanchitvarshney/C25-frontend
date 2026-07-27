import { Input, Tooltip } from "antd";
import MyAsyncSelect from "../../../Components/MyAsyncSelect";
import MySelect from "../../../Components/MySelect";
import SingleDatePicker from "../../../Components/SingleDatePicker";
import Field from "../../../Components/Field";
const gstTypeOptions = [
  { value: "I", text: "INTER STATE" },
  { value: "L", text: "LOCAL" },
];

export const componentSelect = (
  { row },
  inputHandler,
  loadOptions,
  setAsyncOptions,
  asyncOptions,
  selectLoading,
  gstState,
  isValid,
) => (
  <MyAsyncSelect
    selectLoading={selectLoading}
    onBlur={() => setAsyncOptions([])}
    // onInputChange={(value) => setSearchInput(value)}
    value={row?.component}
    onChange={(value) => {
      inputHandler("component", value, row?.id);
    }}
    labelInValue
    styles={{ width: "100%" }}
    loadOptions={loadOptions}
    optionsState={asyncOptions}
    showError={isValid}
    message="Please select a component"
  />
);

export const quantityCell = ({ row }, inputHandler, isValid) => (
  <Tooltip
    trigger={["hover"]}
    title={"Order Qty Should be less than or equal to PR Qty"}
    placement="topLeft"
    classNames={{ root: "numeric-input" }}
    color="red"
    open={row.qtyApproval ? undefined : false}
  >
    <Field
      attr="required | Qty is required"
      value={row.qty}
      showValidation={isValid}
    >
      <Input
        style={{ borderColor: row.qtyApproval && "red" }}
        value={row.qty}
        onChange={(e) => inputHandler("qty", e.target.value, row.id)}
        suffix={row.unit}
      />
    </Field>
  </Tooltip>
);
export const rateCell = ({ row }, inputHandler, currencies, isValid) => (
  <Input.Group compact>
    <Field
      attr="required | Rate is required"
      value={row.rate}
      showValidation={isValid}
      style={{ width: "62%", display: "inline-block" }}
    >
      <Input
        style={{ width: "100%", borderColor: row.approval && "red" }}
        value={row.rate}
        onChange={(e) => inputHandler("rate", e.target.value, row.id)}
      />
    </Field>
    <div
      style={{
        width: "35%",
        marginLeft: "1px",
        display: "inline-block",
        verticalAlign: "top",
      }}
    >
      <MySelect
        options={currencies}
        value={row.currency}
        onChange={(value) => inputHandler("currency", value, row.id)}
        showError={isValid}
        message="Please select currency"
      />
    </div>
  </Input.Group>
);
export const disabledCell = ({ row }, value, inputHandler) => (
  <Input
    disabled
    value={value}
    onChange={(e) => inputHandler("qty", e.target.value, row.id)}
  />
);
export const taxableCell = ({ row }) => {
  return <Input disabled={true} value={Number(row.inrValue).toFixed(2)} />;
};
export const foreignCell = ({ row }) => {
  return (
    <Input
      disabled={true}
      value={
        row?.currency == 364907247 ? 0 : Number(row?.foreginValue).toFixed(2)
      }
    />
  );
};
export const invoiceDateCell = ({ row }, inputHandler, isValid) => {
  return (
    <SingleDatePicker
      row={row}
      value={row.duedate}
      name="duedate"
      tablePicker={true}
      inputHandler={inputHandler}
      format="DD-MM-YYYY"
      placeholder="Select Date"
      showError={isValid}
      message="Due date is required"
    />
  );
};
export const HSNCell = ({ row }, inputHandler) => (
  <Input
    type="text"
    value={row.hsncode}
    onChange={(e) => inputHandler("hsncode", e.target.value, row.id)}
    placeholder="Enter HSN Code"
  />
);
export const gstTypeCell = ({ row }, inputHandler) => (
  <MySelect
    value={row.gsttype || "L"} // Display the current GST type, default to "L"
    onChange={(value) => inputHandler("gsttype", value, row.id)}
    options={gstTypeOptions}
  />
);
export const gstRate = ({ row }, inputHandler) => (
  <Input
    type="text"
    value={row.gstrate}
    onChange={(e) => inputHandler("gstrate", e.target.value, row.id)}
    placeholder="Enter GST Rate"
  />
);
export const CGSTCell = ({ row }) => <Input disabled={true} value={row.cgst} />;
export const SGSTCell = ({ row }) => <Input disabled={true} value={row.sgst} />;
export const IGSTCell = ({ row }) => <Input disabled={true} value={row.igst} />;
export const itemDescriptionCell = ({ row }, inputHandler) => (
  <Input
    type="text"
    value={row.remark}
    onChange={(e) => inputHandler("remark", e.target.value, row.id)}
    placeholder="Enter Remark"
  />
);

// Inside tableColumns.js or inline below
export const internalRemarkCell = ({ row }, inputHandler) => (
  <Input
    placeholder="Internal Remark"
    value={row.internal_remark || ""}
    onChange={(e) => inputHandler("internal_remark", e.target.value, row.id)}
    // style={{ backgroundColor: "#fffbe6" }}
  />
);
