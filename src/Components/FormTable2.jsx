import { Form, Row, Typography } from "antd";
import React, { useState } from "react";
import { normalizeFormRules } from "../utils/general";
import { CommonIcons } from "./TableActions.jsx/TableActions";
import { useEffect } from "react";
import { memo } from "react";
import { Add, Delete } from "@mui/icons-material";

const FormTable2 = ({
  form,
  columns,
  listName,
  removableRows,
  nonRemovableColumns = 2,
  watchKeys,
  calculation,
  nonListWatchKeys,
  componentRequiredRef,
  addableRow,
  newRow,
  reverse,
}) => {
  const formValues = Form.useWatch();
  const [hoveredRow, setHoveredRow] = useState(null);
  const addRow = (rowTemplate) => {
    const names = columns.map((row) => row.name);
    const obj =
      rowTemplate && typeof rowTemplate === "object"
        ? { ...rowTemplate }
        : {};
    if (!rowTemplate) {
      names.forEach((name) => {
        if (name !== "") obj[name] = "";
      });
    }

    const rows = form.getFieldValue(listName) ?? [];
    const next = Array.isArray(rows) ? rows : [];
    const arr = reverse ? [...next, obj] : [obj, ...next];

    form.setFieldValue(listName, arr);
  };
  return (
    <div
      style={{
       
        padding: 0,
        overflowY: "auto",
        height: "calc(100vh - 200px)",
      }}
    >
      <table style={{ border: "1px solid #ccc", }}>
        <thead >
          <tr>
            {(addableRow || removableRows) && (
              <td
                className="table-col"
                style={{
                  width: 30,
                  minWidth: 30,
                  textAlign: "center",
                    
                }}
              >
                {addableRow && (
                  <span
                    onClick={() => addRow(newRow)}
                    style={{ cursor: "pointer" }}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ")
                        addRow(newRow);
                    }}
                  >
                    <Add color="success" />
                  </span>
                )}
              </td>
            )}
            {columns.map((col) =>
              !col.conditional ? (
                <td
                  key={col.name}
                  className="table-col"
             
                >
                  <Typography.Text style={{ fontSize: "0.8rem" }} strong>
                    {col.headerName}
                  </Typography.Text>
                </td>
              ) : (
                col.condition() && (
                  <td
                    key={col.name}
                    className="table-col"
                
                  >
                    <Typography.Text style={{ fontSize: "0.8rem" }} strong>
                      {col.headerName}
                    </Typography.Text>
                  </td>
                )
              ),
            )}
          </tr>
        </thead>

        <tbody>
          <Form.List
            name={listName}
            style={{
              width: "fit-content",
              height: "100%",
            }}
          >
            {(fields, { add, remove }) =>
              fields.map((field, index) => (
                <SingleRow
                  key={field.key}
                  field={field}
                  fieldsLength={fields.length}
                  nonRemovableColumns={nonRemovableColumns}
                  removableRows={removableRows}
                  addableRow={addableRow}
                  remove={remove}
                  index={index}
                  columns={columns}
                  listName={listName}
                  watchKeys={watchKeys}
                  form={form}
                  calculation={calculation}
                  formValues={formValues}
                  nonListWatchKeys={nonListWatchKeys}
                  componentRequiredRef={componentRequiredRef}
                  hoveredRow={hoveredRow}
                  setHoveredRow={setHoveredRow}
                />
              ))
            }
          </Form.List>
        </tbody>
      </table>
    </div>
  );
};

export default FormTable2;

const SingleRow = memo(
  ({
    field,
    fieldsLength,
    nonRemovableColumns = 1,
    removableRows,
    addableRow,
    remove,
    index,
    columns,
    watchKeys = [],
    listName,
    form,
    calculation,
    nonListWatchKeys = [],
    componentRequiredRef = [],
    hoveredRow,
    setHoveredRow,
  }) => {
    const rowStripe =
      index % 2 === 0 ? "#ffffff" : "#f8f9fa";
    const rowBg =
      hoveredRow === field.key ? "#fffaec" : rowStripe;
    const watchValues = watchKeys?.map((val) =>
      form.getFieldValue([listName, field.name, val]),
    );
    const nonListWatchValues = nonListWatchKeys?.map((val) =>
      form.getFieldValue(val),
    );
    const componentRequiredValues = componentRequiredRef.map((val) =>
      form.getFieldValue([listName, field.name, val]),
    );
    const valueObj = form.getFieldValue([listName, field.name]);
    const isComponentRequired = () => {
      let isRequired = false;
      componentRequiredValues.map((val) => {
        if (val && val.length > 0) {
          isRequired = true;
        }
      });
      return isRequired;
    };
    useEffect(() => {
      if (calculation) {
        let obj = {};

        watchKeys.map((key) => {
          obj = {
            ...obj,
            [key]: form.getFieldValue([listName, field.name, key]),
          };
        });
        calculation(field.name, obj);
      }
    }, [[...watchValues, ...nonListWatchValues]]);
    return (
      <Form.Item noStyle>
        <tr
          align="middle"
          style={{  backgroundColor: rowBg }}
          onMouseEnter={() => setHoveredRow(field.key)}
          onMouseLeave={() => setHoveredRow(null)}
        >
          {addableRow && !removableRows && (
            <td
              style={{
                width: 30,
                backgroundColor: rowBg,
            
              }}
            />
          )}
          {removableRows && (
            <td
              style={{
                width: "2vw",
                textAlign: "center",
                backgroundColor: rowBg,
            
              }}
            >
              {index > 0 && (
                <span
                  onClick={() => remove(field.name)}
                  className="delete-icon"
                >
                  <Delete color="error" />
                </span>
              )}
            </td>
          )}
          {columns.map((row, columnIndex) =>
            !row.conditional ? (
              <td key={columnIndex} style={columnCellStyle(row, rowBg)}>
                <Form.Item
                  rules={
                    isComponentRequired()
                      ? normalizeFormRules(rules[row.name])
                      : []
                  }
                  name={[field.name, row.name]}
                  style={{
                    margin: 0,
                    padding: 0,
                    display: row.justify && "flex",
                    justifyContent: row.justify,
                  }}
                  validateTrigger="onBlur"
                >
                  {row.field({ fieldName: field.name, ...valueObj }, index)}
                </Form.Item>
              </td>
            ) : (
              row.condition() && (
                <td style={columnCellStyle(row, rowBg)}>
                  <Form.Item
                    rules={
                      isComponentRequired()
                        ? normalizeFormRules(rules[row.name])
                        : []
                    }
                    name={[field.name, row.name]}
                    style={{
                      margin: 0,
                      padding: 0,
                      display: row.justify && "flex",
                      justifyContent: row.justify,
                    }}
                    validateTrigger="onBlur"
                  >
                    {row.field({ fieldName: field.name, ...valueObj }, index)}
                  </Form.Item>
                </td>
              )
            ),
          )}
        </tr>
      </Form.Item>
    );
  },
);


const columnCellStyle = (row, rowBg) => ({
  whiteSpace: "nowrap",
  width: row.width,
  minWidth: row.width,
  maxWidth: row.maxWidth,
  verticalAlign: "middle",
  backgroundColor: rowBg,
  padding: "2px 5px",
});
const tableRowStyle = {};

const rules = {
  hsn: [
    {
      required: true,
      message: "Please enter a HSN code!",
    },
  ],
  location: [
    {
      required: true,
      message: "Please select a Location!",
    },
  ],
};
