import { memo, useEffect, useState } from "react";
import { Form, Input, Row, Col, Typography } from "antd";
import Loading from "../../../../../Components/Loading";
import MySelect from "../../../../../Components/MySelect";

const GST_TYPE_OPTIONS = [
  { text: "Local", value: "L" },
  { text: "Interstate", value: "I" },
];

function arePropsEqual(prev, next) {
  return (
    prev.field.key === next.field.key &&
    prev.field.name === next.field.name &&
    prev.index === next.index &&
    prev.form === next.form &&
    prev.apiUrl === next.apiUrl &&
    prev.isCreate === next.isCreate &&
    prev.editApiUrl === next.editApiUrl &&
    prev.loading === next.loading &&
    prev.tdsArray === next.tdsArray &&
    prev.allTdsOptions === next.allTdsOptions &&
    prev.glCodes === next.glCodes &&
    prev.freightGlOptions === next.freightGlOptions &&
    prev.glstate === next.glstate &&
    prev.lastRateArr === next.lastRateArr
  );
}

function SingleComponent({
  index,
  field,
  form,
  allTdsOptions,
  tdsArray,
  glCodes,
  apiUrl,
  isCreate,
  editApiUrl,
  freightGlOptions,
  loading,
  glstate,
  lastRateArr,
}) {
  const [showLastRateWarning, setShowLastRateWarning] = useState({
    rate: "",
    gl: "",
    glN: "",
  });

  const qty =
    Form.useWatch(["components", field.name, "vbtBillQty"], form) ?? 0;
  const tcs = Form.useWatch(["components", field.name, "tcs"], form) ?? 0;
  const freight =
    Form.useWatch(["components", field.name, "freight"], form) ?? 0;
  const gstType = Form.useWatch(["components", field.name, "gstType"], form);

  const taxableValue =
    Form.useWatch(["components", field.name, "taxableValue"], form) ?? 0;
  const totalBilAmm =
    Form.useWatch(["components", field.name, "totalBilAmm"], form) ?? 0;
  const vbtInRate =
    Form.useWatch(["components", field.name, "vbtInRate"], form) ?? 0;
  const freightAmount =
    Form.useWatch(["components", field.name, "freightAmount"], form) ?? 0;
  const gstAmount =
    Form.useWatch(["components", field.name, "gstAmount"], form) ?? 0;
  const tdsPercent =
    Form.useWatch(["components", field.name, "tdsPercent"], form) ?? 0;
  const gstAssValue =
    Form.useWatch(["components", field.name, "gstAssValue"], form) ?? 0;
  const tdsAssVals =
    Form.useWatch(["components", field.name, "tdsAssValue"], form) ?? 0;
  const tdsName =
    Form.useWatch(["components", field.name, "tdsName"], form) ?? 0;
  const glName = Form.useWatch(["components", field.name, "glName"], form) ?? 0;
  const gloptions =
    Form.useWatch(["components", field.name, "glCodeValue"], form) ?? 0;
  const glCode =
    Form.useWatch(["components", field.name, "tds_gl_code"], form) ?? 0;
  const vbtBillQty =
    Form.useWatch(["components", field.name, "vbtBillQty"], form) ?? 0;
  const tds_key =
    Form.useWatch(["components", field.name, "tds_key"], form) ?? 0;
  const billAmount =
    Form.useWatch(["components", field.name, "billAmm"], form) ?? 0;
  const gstRate =
    Form.useWatch(["components", field.name, "gstRate"], form)?.replaceAll(
      "%",
      "",
    ) ?? 0;

  useEffect(() => {
    let updatedTdsPercentage = 0;
    if (allTdsOptions.length > 0) {
      let arr = allTdsOptions.filter((r) => r.tds_name === tdsName.label);
      form.setFieldValue(
        ["components", field.name, "glName"],
        arr[0]?.ladger_name,
      );

      form.setFieldValue(
        ["components", field.name, "tds_gl_code"],
        arr[0]?.ledger_key,
      );
      form.setFieldValue(
        ["components", field.name, "tds_key"],
        arr[0]?.tds_key,
      );
      form.setFieldValue(
        ["components", field.name, "tdsPercent"],
        arr[0]?.tds_percent,
      );
      updatedTdsPercentage = arr[0]?.tds_percent;
    } else {
      updatedTdsPercentage = tdsPercent ?? 0;
    }
    let values = +Number(qty).toFixed(3) * +Number(vbtInRate).toFixed(3);
    let value = +Number(values).toFixed(2);
    const amountWithFreight =
      +Number(value) + +Number(freightAmount).toFixed(2);

    let taxPercentage = gstRate;
    let taxAmounts = +Number((amountWithFreight * taxPercentage) / 100);
    let taxAmount = taxAmounts;
    const cgsts = gstType === "L" ? +Number(taxAmount) / 2 : 0;
    const cgst = cgsts.toFixed(2);
    const sgsts = gstType === "L" ? +Number(taxAmount) / 2 : 0;
    const sgst = sgsts.toFixed(2);
    const igsts = gstType === "I" ? +Number(taxAmount) : 0;
    const igst = igsts.toFixed(2);
    taxAmount =
      +Number(cgst).toFixed(2) +
      +Number(sgst).toFixed(2) +
      +Number(igst).toFixed(2);
    let amountAfterTaxs = amountWithFreight + taxAmount;
    let amountAfterTax = +Number(amountAfterTaxs).toFixed(2);

    let tdsAmounts = +Number((tdsAssVals * updatedTdsPercentage) / 100);
    let tdsAmount = +Number(tdsAmounts).toFixed(2);
    tdsAmount = tds_key ? +Number(tdsAmount).toFixed(2) : 0;

    tdsAmount = Math.round(tdsAmount);
    let valueAfterTDS = +Number(amountAfterTax - tdsAmount);
    valueAfterTDS = +Number(valueAfterTDS).toFixed(2);
    let gstAssesValues =
      +Number(value).toFixed(3) + +Number(freightAmount).toFixed(3);
    let gstAssesValue = +Number(gstAssesValues).toFixed(2);

    if (editApiUrl === "vbt07" || apiUrl === "vbt07") {
      let amountWithFreightsevens = +Number(amountWithFreight - tdsAmount);
      let amountWithFreightseven = +Number(amountWithFreightsevens).toFixed(2);

      form.setFieldValue(
        ["components", field.name, "venAmmount"],
        amountWithFreightseven,
      );
    } else {
      form.setFieldValue(
        ["components", field.name, "venAmmount"],
        valueAfterTDS,
      );
    }

    form.setFieldValue("totalBilAmm", amountAfterTax);
    form.setFieldValue(
      ["components", field.name, "totalBilAmm"],
      amountAfterTax,
    );
    form.setFieldValue(["components", field.name, "taxableValue"], value);
    form.setFieldValue(["components", field.name, "gstAmount"], gstAmount);
    form.setFieldValue(["components", field.name, "igstAmount"], igst);
    form.setFieldValue(["components", field.name, "sgstAmount"], sgst);
    form.setFieldValue(["components", field.name, "cgstAmount"], cgst);
    form.setFieldValue(["components", field.name, "tdsAmount"], tdsAmount);
    form.setFieldValue(["components", field.name, "inrPrice"], vbtInRate);

    form.setFieldValue(
      ["components", field.name, "gstAssValue"],
      gstAssesValue,
    );
    ////CIF calculation
    // taxable+freight+CD+SWS+ other
    let cifValue = gstAssesValues;
    let cifPrices = cifValue / vbtBillQty;
    let cifPrice = +Number(cifPrices).toFixed(2);

    form.setFieldValue(["components", field.name, "cifValue"], cifValue);
    form.setFieldValue(["components", field.name, "cifPrice"], cifPrice);
    if (
      !form.isFieldTouched(["components", field.name, "tdsAssValue"]) &&
      form.isFieldTouched("components")
    ) {
      form.setFieldValue(
        ["components", field.name, "tdsAssValue"],
        amountWithFreight,
      );
    }
  }, [
    qty,
    vbtBillQty,
    vbtInRate,
    tcs,
    freight,
    gstRate,
    tdsName,
    freightAmount,
    glName,
    tdsPercent,
    taxableValue,
    gstAssValue,
    glCode,
    gstType,
    tdsAssVals,
    tds_key,
    loading,
    gloptions,
    billAmount,
    totalBilAmm,
  ]);

  useEffect(() => {
    showRateWarning();
  }, [vbtInRate]);
  useEffect(() => {
    showGlWarning();
  }, [gloptions]);

  const showRateWarning = () => {
    const partCode = form.getFieldValue(["components", field.name, "partCode"]);
    const lastRateFoundObj = lastRateArr?.find((row) => row.partCode === partCode);

    if (lastRateFoundObj?.inRate !== vbtInRate) {
      setShowLastRateWarning((curr) => ({
        ...curr,
        rate: lastRateFoundObj?.inRate,
      }));
    } else {
      setShowLastRateWarning((curr) => ({
        ...curr,
        rate: "",
      }));
    }
  };
  const showGlWarning = () => {
    const partCode = form.getFieldValue(["components", field.name, "partCode"]);
    const lastRateFoundObj = lastRateArr?.find((row) => row.partCode === partCode);

    if (lastRateFoundObj?.ledgerCode !== gloptions.key) {
      setShowLastRateWarning((curr) => ({
        ...curr,
        gl: lastRateFoundObj?.ledgerCode,
        glN: lastRateFoundObj?.ledgerName,
      }));
    } else {
      setShowLastRateWarning((curr) => ({
        ...curr,
        gl: "",
        glN: "",
      }));
    }
  };

  return (
    <Row
      style={{
        background: "#f5f5f58f",
        padding: "5px 15px",
        borderRadius: 10,
        marginTop: 5,
      }}
      gutter={[6, -6]}
      key={field.key}
    >
      {loading === field.key && <Loading />}
      {isCreate ? (
        <>
          <Col span={1}>
            <Typography.Text type="secondary" style={{ marginRight: 5 }} strong>
              {index + 1}.
            </Typography.Text>
          </Col>
          <Col span={3}>
            <Form.Item label="MIN ID" name={[field.name, "minId"]}>
              <Input disabled />
            </Form.Item>
          </Col>
          <Col span={3}>
            <Form.Item label="Part Code" name={[field.name, "partCode"]}>
              <Input rows={1} disabled />
            </Form.Item>
          </Col>
          <Col span={4}>
            <Form.Item label="Part Name" name={[field.name, "partName"]}>
              <Input rows={1} disabled />
            </Form.Item>
          </Col>

          <Col span={3}>
            <Form.Item label="Invoice Qty" name={[field.name, "vbtBillQty"]}>
              <Input />
            </Form.Item>
          </Col>
          <Col span={2}>
            <Form.Item label="MIN Qty" name={[field.name, "vbtInQty"]}>
              <Input disabled />
            </Form.Item>
          </Col>

          <Col span={4}>
            <Form.Item
              label="Price"
              name={[field.name, "vbtInRate"]}
              validateStatus={showLastRateWarning.rate && "warning"}
              help={
                showLastRateWarning.rate &&
                `Last price was ${showLastRateWarning.rate}`
              }
              onBlur={() =>
                setShowLastRateWarning((curr) => ({ ...curr, rate: "" }))
              }
              onFocus={() => showRateWarning()}
            >
              <Input />
            </Form.Item>
          </Col>

          <Col span={3}>
            <Form.Item label="Value" name={[field.name, "taxableValue"]}>
              <Input />
            </Form.Item>
          </Col>
          <Col span={3}>
            <Form.Item label="HSN/SAC" name={[field.name, "hsnCode"]}>
              <Input />
            </Form.Item>
          </Col>
          <Col span={3}>
            <Form.Item label="GST Type" name={[field.name, "gstType"]}>
              <MySelect options={GST_TYPE_OPTIONS} />
            </Form.Item>
          </Col>
          <Col span={2}>
            <Form.Item label="GST Rate" name={[field.name, "gstRate"]}>
              <Input />
            </Form.Item>
          </Col>
          <Col span={3}>
            <Form.Item
              label="GST Ass. Value"
              name={[field.name, "gstAssValue"]}
            >
              <Input />
            </Form.Item>
          </Col>
          {gstType === "L" && (
            <>
              <Col span={2}>
                <Form.Item label="CGST" name={[field.name, "cgstAmount"]}>
                  <Input />
                </Form.Item>
              </Col>
              <Col span={4}>
                <Form.Item
                  label="CGST G/L"
                  name={[field.name, "cgst"]}
                  rules={[
                    {
                      required: true,
                      message: "CGST GL is required",
                    },
                  ]}
                >
                  <MySelect labelInValue options={glstate} />
                </Form.Item>
              </Col>
              <Col span={2}>
                <Form.Item label="SGST" name={[field.name, "sgstAmount"]}>
                  <Input />
                </Form.Item>
              </Col>
              <Col span={4}>
                <Form.Item
                  label="SGST G/L"
                  name={[field.name, "sgst"]}
                  rules={[
                    {
                      required: true,
                      message: "SGST GL is required",
                    },
                  ]}
                >
                  <MySelect labelInValue options={glstate} />
                </Form.Item>
              </Col>
            </>
          )}
          {gstType === "I" && (
            <>
              {" "}
              <Col span={2}>
                <Form.Item label="IGST" name={[field.name, "igstAmount"]}>
                  <Input />
                </Form.Item>
              </Col>{" "}
              <Col span={4}>
                <Form.Item
                  label="IGST G/L"
                  name={[field.name, "igst"]}
                  rules={[
                    {
                      required: true,
                      message: "IGST GL is required",
                    },
                  ]}
                >
                  <MySelect labelInValue options={glstate} />
                </Form.Item>
              </Col>
            </>
          )}
          {apiUrl === "vbt01" ||
          apiUrl === "vbt04" ||
          apiUrl === "vbt05" ||
          apiUrl === "vbt07" ? (
            <>
              <Col span={4}>
                <Form.Item
                  label="Purchase G/L Code"
                  name={[field.name, "glCodeValue"]}
                  validateStatus={showLastRateWarning.gl && "warning"}
                  help={
                    showLastRateWarning.gl &&
                    `Last GL was ${showLastRateWarning.glN}`
                  }
                  onBlur={() =>
                    setShowLastRateWarning((curr) => ({
                      ...curr,
                      gl: "",
                      glN: "",
                    }))
                  }
                  onFocus={() => showGlWarning()}
                >
                  <MySelect options={glCodes} labelInValue />
                </Form.Item>
              </Col>
              <Col span={2}>
                <Form.Item label="Freight" name={[field.name, "freightAmount"]}>
                  <Input />
                </Form.Item>
              </Col>
              {apiUrl === "vbt04" ? (
                ""
              ) : (
                <Col span={4}>
                  <Form.Item label="Freight G/L" name={[field.name, "freight"]}>
                    <MySelect options={freightGlOptions} />
                  </Form.Item>
                </Col>
              )}
            </>
          ) : apiUrl === "vbt02" ? (
            <Col span={4}>
              <Form.Item
                label="Services G/L Code"
                name={[field.name, "glCodeValue"]}
                validateStatus={showLastRateWarning.gl && "warning"}
                help={
                  showLastRateWarning.gl &&
                  `Last GL was ${showLastRateWarning.glN}`
                }
                onBlur={() =>
                  setShowLastRateWarning((curr) => ({
                    ...curr,
                    gl: "",
                    glN: "",
                  }))
                }
                onFocus={() => showGlWarning()}
              >
                <MySelect options={glCodes} labelInValue />
              </Form.Item>
            </Col>
          ) : (
            <Col span={4}>
              <Form.Item
                label="Jobwork  G/L Code"
                name={[field.name, "glCodeValue"]}
                validateStatus={showLastRateWarning.gl && "warning"}
                help={
                  showLastRateWarning.gl &&
                  `Last GL was ${showLastRateWarning.glN}`
                }
                onBlur={() =>
                  setShowLastRateWarning((curr) => ({
                    ...curr,
                    gl: "",
                    glN: "",
                  }))
                }
                onFocus={() => showGlWarning()}
              >
                <MySelect options={glCodes} labelInValue />
              </Form.Item>
            </Col>
          )}
          <Col span={3}>
            <Form.Item label="TDS Code" name={[field.name, "tdsName"]}>
              <MySelect labelInValue options={tdsArray} />
            </Form.Item>
          </Col>
          {allTdsOptions.length > 0 && (
            <>
              <Col span={3}>
                <Form.Item label="TDS GL" name={[field.name, "glName"]}>
                  <Input />
                </Form.Item>
              </Col>
              <Col span={3}>
                <Form.Item
                  label="TDS Ass. Value"
                  name={[field.name, "tdsAssValue"]}
                >
                  <Input
                    onBlur={() => {
                      form.setFields([
                        {
                          name: ["components", field.name, "tdsAssValue"],
                          touched: false,
                        },
                      ]);
                    }}
                  />
                </Form.Item>
              </Col>
              <Col span={1}>
                <Form.Item label="TDS %" name={[field.name, "tdsPercent"]}>
                  <Input />
                </Form.Item>
              </Col>
              <Col span={2}>
                <Form.Item label="TDS Amount" name={[field.name, "tdsAmount"]}>
                  <Input />
                </Form.Item>
              </Col>
            </>
          )}
          <Col span={3}>
            <Form.Item label="Ven Amount" name={[field.name, "venAmmount"]}>
              <Input />
            </Form.Item>
          </Col>
          <Col span={3}>
            <Form.Item label="INR Price" name={[field.name, "inrPrice"]}>
              <Input />
            </Form.Item>
          </Col>{" "}
          <Col span={3}>
            <Form.Item label="CIF Value" name={[field.name, "cifValue"]}>
              <Input />
            </Form.Item>
          </Col>
          <Col span={3}>
            <Form.Item label="CIF Price" name={[field.name, "cifPrice"]}>
              <Input />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item
              label="Description"
              name={[field.name, "itemDescription"]}
            >
              <Input.TextArea rows={3} />
            </Form.Item>
          </Col>
        </>
      ) : (
        <>
          <Col span={1}>
            <Typography.Text type="secondary" style={{ marginRight: 5 }} strong>
              {index + 1}.
            </Typography.Text>
          </Col>
          <Col span={3}>
            <Form.Item label="MIN ID" name={[field.name, "minId"]}>
              <Input disabled />
            </Form.Item>
          </Col>
          <Col span={3}>
            <Form.Item label="Part Code" name={[field.name, "partCode"]}>
              <Input rows={1} disabled />
            </Form.Item>
          </Col>
          <Col span={4}>
            <Form.Item label="Part Name" name={[field.name, "partName"]}>
              <Input rows={1} disabled />
            </Form.Item>
          </Col>
          <Col span={4}>
            <Form.Item label="Po Number" name={[field.name, "poNumber"]}>
              <Input rows={1} disabled />
            </Form.Item>
          </Col>
          <Col span={4}>
            <Form.Item label="Project ID" name={[field.name, "projectID"]}>
              <Input rows={1} disabled />
            </Form.Item>
          </Col>
          <Col span={3}>
            <Form.Item label="Invoice Qty" name={[field.name, "vbtBillQty"]}>
              <Input />
            </Form.Item>
          </Col>
          <Col span={2}>
            <Form.Item label="MIN Qty" name={[field.name, "vbtInQty"]}>
              <Input disabled />
            </Form.Item>
          </Col>
          <Col span={2} offset={allTdsOptions.length === 0 && 1}>
            <Form.Item label="Price" name={[field.name, "vbtInRate"]}>
              <Input />
            </Form.Item>
          </Col>
          <Col span={3}>
            <Form.Item label="Value" name={[field.name, "taxableValue"]}>
              <Input disabled />
            </Form.Item>
          </Col>
          <Col span={3}>
            <Form.Item label="HSN/SAC" name={[field.name, "hsnCode"]}>
              <Input disabled />
            </Form.Item>
          </Col>
          <Col span={2}>
            <Form.Item label="GST Type" name={[field.name, "gstType"]}>
              <MySelect options={GST_TYPE_OPTIONS} />
            </Form.Item>
          </Col>
          <Col span={2}>
            <Form.Item label="GST Rate" name={[field.name, "gstRate"]}>
              <Input />
            </Form.Item>
          </Col>
          {editApiUrl === "vbt01" ||
          editApiUrl === "vbt04" ||
          editApiUrl === "vbt05" ? (
            <>
              <Col span={4}>
                <Form.Item
                  label="Purchase G/L Code"
                  name={[field.name, "purchase_gl"]}
                >
                  <MySelect options={glCodes} labelInValue />
                </Form.Item>
              </Col>
              <Col span={2}>
                <Form.Item label="Freight" name={[field.name, "freightAmount"]}>
                  <Input />
                </Form.Item>
              </Col>

              {editApiUrl === "vbt04" ? (
                ""
              ) : (
                <Col span={4}>
                  <Form.Item label="Freight G/L" name={[field.name, "freight"]}>
                    <MySelect options={freightGlOptions} />
                  </Form.Item>
                </Col>
              )}
            </>
          ) : editApiUrl === "vbt02" ? (
            <Col span={4}>
              <Form.Item
                label="Services G/L Code"
                name={[field.name, "purchase_gl"]}
              >
                <MySelect options={glCodes} labelInValue />
              </Form.Item>
            </Col>
          ) : (
            <Col span={4}>
              <Form.Item
                label="Jobwork  G/L Code"
                name={[field.name, "purchase_gl"]}
              >
                <MySelect options={glCodes} labelInValue />
              </Form.Item>
            </Col>
          )}
          <Col span={3}>
            <Form.Item
              label="GST Ass. Value"
              name={[field.name, "gstAssValue"]}
            >
              <Input disabled />
            </Form.Item>
          </Col>
          {gstType === "L" && (
            <Col span={2}>
              <Form.Item label="CGST" name={[field.name, "cgstAmount"]}>
                <Input disabled />
              </Form.Item>
            </Col>
          )}
          {gstType === "L" && (
            <Col span={4}>
              <Form.Item
                label="CGST G/L"
                name={[field.name, "cgst"]}
                rules={[
                  {
                    required: true,
                    message: "CGST GL is required",
                  },
                ]}
              >
                <MySelect labelInValue options={glstate} />
              </Form.Item>
            </Col>
          )}
          {gstType === "L" && (
            <Col span={2}>
              <Form.Item label="SGST" name={[field.name, "sgstAmount"]}>
                <Input disabled />
              </Form.Item>
            </Col>
          )}
          {gstType === "L" && (
            <Col span={4}>
              <Form.Item
                label="SGST G/L"
                name={[field.name, "sgst"]}
                rules={[
                  {
                    required: true,
                    message: "SGST GL is required",
                  },
                ]}
              >
                <MySelect labelInValue options={glstate} />
              </Form.Item>
            </Col>
          )}
          {gstType === "I" && (
            <Col span={2}>
              <Form.Item label="IGST" name={[field.name, "igstAmount"]}>
                <Input disabled />
              </Form.Item>
            </Col>
          )}
          {gstType === "I" && (
            <Col span={4}>
              <Form.Item
                label="IGST G/L"
                name={[field.name, "igst"]}
                rules={[
                  {
                    required: true,
                    message: "IGST GL is required",
                  },
                ]}
              >
                <MySelect labelInValue options={glstate} />
              </Form.Item>
            </Col>
          )}
          <Col span={3}>
            <Form.Item label="TDS Code" name={[field.name, "tdsName"]}>
              <MySelect labelInValue options={tdsArray} />
            </Form.Item>
          </Col>
          {allTdsOptions.length > 0 && (
            <>
              <Col span={3}>
                <Form.Item label="TDS GL" name={[field.name, "glName"]}>
                  <Input />
                </Form.Item>
              </Col>
              <Col span={3}>
                <Form.Item
                  label="TDS Ass. Value"
                  name={[field.name, "tdsAssValue"]}
                >
                  <Input
                    onBlur={() => {
                      form.setFields([
                        {
                          name: ["components", field.name, "tdsAssValue"],
                          touched: false,
                        },
                      ]);
                    }}
                  />
                </Form.Item>
              </Col>
              <Col span={1}>
                <Form.Item label="TDS %" name={[field.name, "tdsPercent"]}>
                  <Input disabled />
                </Form.Item>
              </Col>
              <Col span={2}>
                <Form.Item label="TDS Amount" name={[field.name, "tdsAmount"]}>
                  <Input disabled />
                </Form.Item>
              </Col>
            </>
          )}
          <Col span={3}>
            <Form.Item label="Ven Amount" name={[field.name, "venAmmount"]}>
              <Input disabled />
            </Form.Item>
          </Col>
          <Col span={3}>
            <Form.Item label="INR Price" name={[field.name, "inrPrice"]}>
              <Input />
            </Form.Item>
          </Col>{" "}
          <Col span={3}>
            <Form.Item label="CIF Value" name={[field.name, "cifValue"]}>
              <Input />
            </Form.Item>
          </Col>
          <Col span={3}>
            <Form.Item label="CIF Price" name={[field.name, "cifPrice"]}>
              <Input />
            </Form.Item>
          </Col>
          <Col offset={allTdsOptions.length === 0 && 1} span={6}>
            <Form.Item
              label="Description"
              name={[field.name, "itemDescription"]}
            >
              <Input.TextArea rows={3} />
            </Form.Item>
          </Col>
        </>
      )}
    </Row>
  );
}

export default memo(SingleComponent, arePropsEqual);
