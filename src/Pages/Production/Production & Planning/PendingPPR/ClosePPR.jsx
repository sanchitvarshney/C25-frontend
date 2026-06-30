import React, { useEffect, useState } from "react";
import { Button, Col, Drawer, Form, Input, Row, Typography } from "antd";
import { useToast } from "../../../../hooks/useToast.js";
import { imsAxios } from "../../../../axiosInterceptor";

export default function ClosePPR({
  cancelPPR,
  setsCancelPPR,
  getRows,
  //   rows,
}) {
  const { showToast } = useToast();
  const [remark, setRemark] = useState("");
  const [loading, setLoading] = useState(false);

  const handleCancelPPR = async () => {
    setLoading(true);
    const response = await imsAxios.post("/ppr/closePPR", {
      sku: cancelPPR.prod_product_sku,
      ppr: cancelPPR.prod_transaction,
      remark: remark,
    });
    setLoading(false);
    if (response.success) {
      showToast(response.message, "success");
      getRows();
      setTimeout(() => {
        setsCancelPPR(null);
      }, 3000);
    } else {
      showToast(response.message?.msg || response.message, "error");
    }
  };
  useEffect(() => {
    setRemark("");
  }, [cancelPPR]);
  // console.log(remark);
  const { Text } = Typography;
  return (
    <Drawer
      title={`Cancelling PPR: ${cancelPPR?.prod_transaction}`}
      width="50vw"
      onClose={() => setsCancelPPR(null)}
      open={cancelPPR}
    >
      <Row style={{ marginBottom: 20 }}>
        <Col>
          <Text>
            Once the PPR will closed, you will not able to proceed further
            action against to this same PPR request{" "}
            {cancelPPR?.prod_transaction} and product SKU{" "}
            {cancelPPR?.prod_product_sku}.
          </Text>
        </Col>
      </Row>
      {/* <Form layout="vertical"> */}
      <Row>
        <Text>Closing Reason</Text>
        <Col style={{ margin: "10px 0" }} span={24}>
          <Input.TextArea
            rows={6}
            style={{ resize: "none" }}
            onChange={(e) => setRemark(e.target.value)}
            placeholder="Please enter Closing Reason"
            value={remark}
          />
          {/* </Form.Item> */}
        </Col>
      </Row>
      <Row justify="end">
        <Col>
          <Button
            loading={loading}
            disabled={remark.length < 5 ? true : false}
            onClick={handleCancelPPR}
            type="primary"
          >
            Cancel PO
          </Button>
        </Col>
      </Row>
      {/* </Form> */}
    </Drawer>
  );
}
