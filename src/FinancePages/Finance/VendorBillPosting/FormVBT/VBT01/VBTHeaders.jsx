import { Card, Col, Form, Input, Row, Typography } from "antd";
import { useEffect } from "react";
import InputMask from "react-input-mask";
import TaxDetails from "./TaxDetails";

const COMMENT_TEMPLATES = {
  vbt06: (invoiceId) =>
    `Being Jobwork charges due of challan no:____on inv: ${invoiceId} dt:____of amount:____TDS:___ payable amt:____`,
  vbt07: (invoiceId) =>
    `Being -- purchase on inv ${invoiceId} date:____ of amt: ___ TDS:___ `,
  vbt01: (invoiceId) =>
    `Being purchased for on INV no. ${invoiceId} date: ___ amount: ___ TDS:___ `,
  vbt02: (invoiceId) =>
    `Being Service charges due to INV no. ${invoiceId} date of amount TDS:___ `,
};

function VBTHeaders({
  form,
  vbtComponent,
  taxDetails,
  editingVBT,
  roundOffValue,
  roundOffSign,
  setRoundOffSign,
  setRoundOffValue,
  apiUrl,
  editVBTCode,
}) {

  useEffect(() => {
    if (editingVBT && vbtComponent?.length > 0) {
      const header = vbtComponent[0];
      const buildComment = COMMENT_TEMPLATES[apiUrl];
      form.setFieldsValue({
        invoiceNo: header?.invoiceId,
        venAddress: header?.venAddress,
        gst: header?.gstin?.[0],
        venCode: header?.venCode,
        comment: buildComment ? buildComment(header?.invoiceId) : "",
        ackNum: header?.acknowledgeIRN,
      });
    } else {
      form.setFieldsValue({
        invoiceNo: editVBTCode[0]?.invoiceNo,
        invoiceDate: editVBTCode[0]?.invoiceDate,
        venAddress: editVBTCode[0]?.venAddress,
        comment: editVBTCode[0]?.comment,
        gst: editVBTCode[0]?.gst,
        effectiveDate: editVBTCode[0]?.effectiveDate,
        billAmmount: editVBTCode[0]?.billAmount,
        ackNum: editVBTCode[0]?.acknowledgeIRN,
      });
    }
  }, [vbtComponent, editingVBT, editVBTCode, apiUrl, form]);

  useEffect(() => {
    if (editVBTCode.length > 0) {
      const roundoffv = editVBTCode.map(
        (component) => component.roundOffValue ?? "--",
      );
      setRoundOffValue(roundoffv.filter((i) => i !== "--"));
      const roundoffs = editVBTCode.map(
        (component) => component.roundOffSign ?? "--",
      );
      setRoundOffSign(roundoffs.filter((i) => i !== "--"));
    }
  }, [editVBTCode]);

  return (
    <Row gutter={[0, 6]} style={{ height: "100%", overflowY: "auto" }}>
      <Col span={24} style={{ overflowY: "auto" }}>
        <TaxDetails title="Tax Details" summary={taxDetails} />
      </Col>
      <Col span={24} style={{ height: "50%" }}>
        <Card size="small">
          <Row gutter={6}>
            <Col span={12}>
              <Form.Item
                label="Invoice Date"
                name="invoiceDate"
                rules={[
                  {
                    required: true,
                    message: "Please Enter Invoice Date!",
                  },
                ]}
              >
                <InputMask
                  className="input-date"
                  mask="99-99-9999"
                  placeholder="__-__-____"
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="effectiveDate"
                label="Effective Date"
                rules={[
                  {
                    required: true,
                    message: "Please Enter Effective Date!",
                  },
                ]}
              >
                <InputMask
                  className="date-text-input"
                  mask="99-99-9999"
                  placeholder="__-__-____"
                />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item label="Invoice Number" name="invoiceNo">
                <Input />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                label="Invoice Amount"
                name="billAmmount"
                rules={[
                  {
                    required: true,
                    message: "Please Enter Bill Amount!",
                  },
                ]}
              >
                <Input />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item label="GSTIN Number" name="gst">
                <Input />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Typography.Text
                style={{ fontSize: "0.8rem", paddingBottom: 20 }}
              >
                Round Off
              </Typography.Text>{" "}
              <div style={{ display: "flex" }}>
                <div style={{ width: 40 }}>
                  <RoundOffSelect
                    roundOffSign={roundOffSign}
                    setRoundOffSign={setRoundOffSign}
                  />
                </div>
                <Input
                  value={roundOffValue}
                  onChange={(e) => setRoundOffValue(e.target.value)}
                />
              </div>
            </Col>
            <Col span={24}>
              <Form.Item label="Acknowledgement Number" name="ackNum">
                <Input />
              </Form.Item>
            </Col>

            <Col span={24}>
              <Form.Item label="Comments" name="comment">
                <Input.TextArea placeholder="Comments" />
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item label="Vendor Address" name="venAddress">
                <Input.TextArea />
              </Form.Item>
            </Col>
          </Row>
        </Card>
      </Col>
    </Row>
  );
}

export default VBTHeaders;

const RoundOffSelect = ({ roundOffSign, setRoundOffSign }) => {
  return (
    <select
      style={{
        height: 30,
        border: "1px lightgray solid",
        borderRadius: 5,
        outline: "none",
      }}
      value={roundOffSign}
      onInput={(value) => setRoundOffSign(value.target.value)}
    >
      <option value="+">+</option>
      <option value="-">-</option>
    </select>
  );
};
