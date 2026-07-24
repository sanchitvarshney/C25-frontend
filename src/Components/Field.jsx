import { cloneElement, isValidElement } from "react";
import "./Field.css";

/**
 * Usage: attr="required | Your error message here"
 * value: the current field value — falsy / undefined = empty
 * showValidation: set to true when the form is submitted to reveal errors
 */
const Field = ({
  attr = "",
  value,
  onChange,
  showValidation,
  children,
  style,
  className,
  ...rest
}) => {
  const [rule, message = "This field is required"] = attr.split("|").map((s) => s.trim());
  const isRequired = rule === "required";
  const isEmpty =
    value === undefined ||
    value === null ||
    value === "" ||
    (typeof value === "object" && !value?.value);
  const showError = showValidation && isRequired && isEmpty;

  const content =
    onChange && isValidElement(children)
      ? cloneElement(children, { value, onChange, ...rest })
      : children;

  return (
    <div style={{ position: "relative", ...style }} className={className}>
      {content}
      {showError && <span className="field-validation-tooltip">{message}</span>}
    </div>
  );
};

export default Field;
