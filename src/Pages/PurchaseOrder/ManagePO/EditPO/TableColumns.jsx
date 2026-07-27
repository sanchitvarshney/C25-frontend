import { Input } from "antd";
import MyAsyncSelect from "../../../../Components/MyAsyncSelect";
import InputMask from "react-input-mask";
import MySelect from "../../../../Components/MySelect";
import Field from "../../../../Components/Field";
const gstTypeOptions = [
  { value: "I", text: "INTER STATE" },
  { value: "L", text: "LOCAL" },
];

export const componenetSelect = (
  { row },
  inputHandler,
  loadOptions,
  setAsyncOptions,
  asynOptions,
  isValid
) => (
  <MyAsyncSelect
    onBlur={() => setAsyncOptions([])}
    value={row?.component}
    onChange={(value) => {
      inputHandler("component", value, row?.id);
    }}
    labelInValue
    styles={{ width: "100%" }}
    loadOptions={loadOptions}
    optionsState={asynOptions}
    showError={isValid}
    message="Please select a component"
  />
);

export const quantityCell = ({ row }, inputHandler, isValid) => (
  <Field attr="required | Qty is required" value={row.qty} showValidation={isValid}>
    <Input
      style={{ border: row.qtyApproval && "1px solid red" }}
      value={row.qty}
      onChange={(e) => inputHandler("qty", e.target.value, row.id)}
      suffix={row.unit}
    />
  </Field>
);

export const rateCell = ({ row }, inputHandler, currencies, isValid) => (
  <Input.Group compact>
    <Field
      attr="required | Rate is required"
      value={row.rate}
      showValidation={isValid}
      style={{ width: "65%", display: "inline-block" }}
    >
      <Input
        style={{ width: "100%", border: row.rateAppr && "1px solid red" }}
        value={row.rate}
        onChange={(e) => inputHandler("rate", e.target.value, row.id)}
      />
    </Field>
    <div style={{ width: "35%", display: "inline-block", verticalAlign: "top" }}>
      <MySelect
        onChange={(value) => inputHandler("currency", value, row.id)}
        value={row.currency}
        options={currencies}
        showError={isValid}
        message="Please select currency"
      />
    </div>
  </Input.Group>
);
export const disabledCell = (value) => (
  <Input
    disabled={true}
    value={value}
    // onChange={(e) => inputHandler("project_rate", e.target.value, row.id)}
  />
);
export const taxableCell = ({ row }) => {
  return <Input disabled={true} value={row.inrValue} />;
};
export const foreignCell = ({ row }) => {
  return <Input disabled={true} value={row.foreginValue} />;
};
export const invoiceDateCell = ({ row }, inputHandler, isValid) => {
  return (
    // <SingleDatePicker
    //   row={row}
    //   name="duedate"
    //   value={row.duedate != "" ? row.duedate : "empty"}
    //   tablePicker={true}
    //   inputHandler={inputHandler}
    // />
    <Field
      attr="required | Due date is required"
      value={row.duedate}
      showValidation={isValid}
    >
      <InputMask
        name="duedate"
        value={row.duedate ?? ""}
        onChange={(e) => inputHandler("duedate", e.target.value, row.id)}
        className="date-text-input"
        mask="99-99-9999"
        placeholder="Invoice Date"
        style={{ textAlign: "center" }}
        // defaultValue="01-09-2022"
      />
    </Field>
  );
};
export const HSNCell = ({ row }, inputHandler, isValid) => (
  <Field attr="required | HSN Code is required" value={row.hsncode} showValidation={isValid}>
    <Input
      type="text"
      value={row.hsncode}
      onChange={(e) => inputHandler("hsncode", e.target.value, row.id)}
      placeholder="Enter HSN"
    />
  </Field>
);
export const gstTypeCell = ({ row }, inputHandler, isValid) => (
  <MySelect
    value={row.gsttype}
    onChange={(value) => inputHandler("gsttype", value, row.id)}
    options={gstTypeOptions}
    showError={isValid}
    message="Please select GST type"
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
export const internalRemarkCell = ({ row }, inputHandler) => (
  <Input
    placeholder="Internal Remark..."
    value={row.internal_remark || ""}
    onChange={(e) => inputHandler("internal_remark", e.target.value, row.id)}
    // style={{ backgroundColor: "#fffbe6" }}
  />
);