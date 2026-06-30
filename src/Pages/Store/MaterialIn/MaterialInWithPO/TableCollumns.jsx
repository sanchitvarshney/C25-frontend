import { Input } from "antd";
import InputMask from "react-input-mask";
import MyAsyncSelect from "../../../../Components/MyAsyncSelect";
import MySelect from "../../../../Components/MySelect";
const gstTypeOptions = [
  { value: "I", text: "INTER STATE" },
  { value: "L", text: "LOCAL" },
];
// export const currencyCell = ({ row }, inputHandler, currencies) => (
//   <MySelect
//     onChange={(value) => inputHandler("currency", value, row.id)}
//     value={row.currency}
//     options={currencies}
//   />
// );

export const QuantityCell = ({ row }, inputHandler) => (
  <Input
    value={row.orderqty}
    onChange={(e) => inputHandler("orderqty", e.target.value, row.id)}
    suffix={row.unitsname}
  />
);

export const manualMFGCode = ({ row }, inputHandler) => (
  <Input
    value={row.mfgCode}
    onChange={(e) => inputHandler("mfgCode", e.target.value, row.id)}
  />
);
export const rateCell = ({ row }, inputHandler, currencies) => (
  <Input.Group compact>
    <Input
      style={{ width: "65%" }}
      value={row.orderrate}
      onChange={(e) => inputHandler("orderrate", e.target.value, row.id)}
      type="number"
    />
    <div style={{ width: "35%" }}>
      <MySelect
        onChange={(value) => inputHandler("currency", value, row.id)}
        value={row.currency}
        options={currencies}
      />
    </div>
  </Input.Group>
);
// export const rateCell = ({ row }, inputHandler) => (
//   <Input
//     value={row.orderrate}
//     onChange={(e) => inputHandler("orderrate", e.target.value, row.id)}
//   />
// <div
//   style={{
//     display: "flex",
//     alignItems: "center",
//     position: "relative",
//     width: "100%",
//   }}
// >
//   <span
//     style={{
//       display: "block",
//       height: "10px",
//       width: "15px",
//       fontSize: "0.2rem",
//       borderRight: "1px solid rgb(196, 196, 196)",
//       position: "absolute",
//       top: 12,
//       left: 5,
//       // background: "red",
//     }}
//   >
//     <select
//       className=""
//       style={{
//         height: "100%",
//         paddingLeft: "2px",
//         width: "100%",
//         color: "#404040",
//       }}
//       onChange={(e) =>
//         inputHandler("currency", e.target.value, row.id)
//       }
//       value={row.currency}
//     >
//       {currencies?.map((currency) => {
//         return <option value={currency.value}>{currency.label}</option>;
//       })}
//     </select>
//   </span>
//   <input
//     className="table-input"
//     type="text"
//     style={{
//       border: "1px solid #ccc",
//       // height: "25px",
//       width: "100%",
//       paddingLeft: "20px",
//       textAlign: "center",
//     }}
//     value={row.orderrate}
//     onChange={(e) =>
//       inputHandler("orderrate", e.target.value, row.id)
//     }
//   />
// </div>
// );

export const taxableCell = ({ row }) => {
  return <Input disabled={true} value={row.inrValue} />;
};
/** Foreign Value: do not show when currency is INR (364907247). */
export const foreignCell = ({ row }) => {
  const isINR = row.currency === "364907247";
  const hasForeignValue = !isINR && (Number(row.usdValue) || 0) !== 0;
  return (
    <Input disabled={true} value={hasForeignValue ? row.usdValue : ""} />
  );
};
export const invoiceIdCell = ({ row }, inputHandler) => {
  return (
    <>
      <Input
        value={row.invoiceId}
        onChange={(e) => inputHandler("invoiceId", e.target.value, row.id)}
        placeholder="Enter Invoice ID"
      />
    </>
  );
};
export const invoiceDateCell = ({ row }, inputHandler) => {
  return (
    <InputMask
      name="due_date[]"
      value={row.invoiceDate}
      onChange={(e) => inputHandler("invoiceDate", e.target.value, row.id)}
      className="date-text-input"
      mask="99-99-9999"
      placeholder="Invoice Date"
      style={{ textAlign: "center" }}
      // defaultValue="01-09-2022"
    />
  );
};
export const HSNCell = ({ row }, inputHandler) => (
  <Input
    type="text"
    value={row.hsncode}
    onChange={(e) => inputHandler("hsncode", e.target.value, row.id)}
    placeholder="Enter HSN"
  />
);
export const gstTypeCell = ({ row }, inputHandler) => (
  <MySelect
    value={row.gsttype}
    // className="table-input"
    onChange={(value) => inputHandler("gsttype", value, row.id)}
    options={gstTypeOptions}
  />
);
export const gstRate = ({ row }, inputHandler) => (
  <Input
    type="text"
    value={row.gstrate}
    onChange={(e) => inputHandler("gstrate", e.target.value, row.id)}
    placeholder="Enter HSN"
  />
);
/** When gstType is "L": show CGST. When "I": show empty. */
export const CGSTCell = ({ row }) => (
  <Input
    disabled={true}
    value={row.gsttype === "I" ? "" : (row.cgst ?? 0)}
  />
);
/** When gstType is "L": show SGST. When "I": show empty. */
export const SGSTCell = ({ row }) => (
  <Input
    disabled={true}
    value={row.gsttype === "I" ? "" : (row.sgst ?? 0)}
  />
);
/** When gstType is "I": show IGST. When "L": show empty. */
export const IGSTCell = ({ row }) => (
  <Input
    disabled={true}
    value={row.gsttype === "L" ? "" : (row.igst ?? 0)}
  />
);

export const locationCell = ({ row }, inputHandler, locationOptions) => (
  <>
    <MySelect
      labelInValue
      value={row?.location}
      onChange={(value) => {
        inputHandler("location", value, row.id);
      }}
      options={locationOptions}
      placeholder="Select Location..."
    />
  </>
);
export const autoConsumptionCell = (
  { row },
  inputHandler,
  autoConsumptionOptions
) => (
  <MySelect
    value={row?.autoConsumption}
    onChange={(value) => {
      inputHandler("autoConsumption", value, row.id);
    }}
    options={autoConsumptionOptions}
    placeholder="Select Auto Consumption..."
  />
);
// export const autoConsumptionCell = (row) => {
//   return (
//     <div style={{ width: "100%" }}>
//       <MySelect
//         height={window.innerWidth <= 1600 ? "28px" : "33px"}
//         fontSize={window.innerWidth <= 1600 ? "0.5rem" : "0.6rem"}
//         isDisabled={true}
//         value={autoComnsumptionOptions.filter((o) => o.value == "no")[0]}
//         options={autoComnsumptionOptions}
//         className="table-input"
//       />
//     </div>
//   );
// };
export const remarkCell = ({ row }, inputHandler) => (
  <Input
    type="text"
    value={row.orderremark}
    onChange={(e) => inputHandler("orderremark", e.target.value, row.id)}
    placeholder="Enter Remark"
  />
);
