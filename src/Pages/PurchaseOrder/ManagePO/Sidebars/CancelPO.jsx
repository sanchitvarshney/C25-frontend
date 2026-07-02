import  { useState, useEffect } from "react";
import { useToast } from "../../../../hooks/useToast.js";
import { Button, Col, Drawer, Form, Input, Row, Modal } from "antd";
import { imsAxios } from "../../../../axiosInterceptor";

const LABELS = {
  cancel: {
    title: "Cancelling Purchase Order",
    reasonLabel: "Cancelation Reason",
    reasonPlaceholder: "Please enter Cancelation Reason",
    button: "Cancel PO",
    confirmTitle:
      "Are you sure you want to cancel this PO ? Since the advanced payment has already been made to the vendor.",
  },
  close: {
    title: "Closing Purchase Order",
    reasonLabel: "Close Reason",
    reasonPlaceholder: "Please enter Close Reason",
    button: "Close PO",
    confirmTitle:
      "Are you sure you want to close this PO ? Since the advanced payment has already been made to the vendor.",
  },
};

export default function CancelPO({
  showCancelPO,
  setShowCancelPO,
  setRows,
  getSearchResults,
  rows,
  variant = "cancel",
}) {
  const labels = LABELS[variant] || LABELS.cancel;
  const { showToast } = useToast();
  const [reason, setReason] = useState("");
  // const [status, setStatus] = useState();
  const [payment, setPayment] = useState(false);
  const [loading, setLoading] = useState(false);
  const getPOStatus = async () => {
    if (showCancelPO) {
      const response = await imsAxios.post("/purchaseOrder/fetchStatus4PO", {
        purchaseOrder: showCancelPO,
      });
      if (response.success) {
        // setStatus("okay");
        setPayment(response?.data?.advPayment == "1" ? true : false);
      }
    }
  };

  const showCofirmModal = () => {
    Modal.confirm({
      okText: "Save",
      title: labels.confirmTitle,
      onOk() {
        handleCancelPO();
      },
    });
  };
  const handleCancelPO = async () => {
    if (showCancelPO) {
      setLoading(true);

      const response = await imsAxios.post("/purchaseOrder/CancelPO", {
        purchase_order: showCancelPO,
        remark: reason,
      }).then((res) => {
        if(!res.success){
          showToast(res.message?.msg || res.message, "error")
          setLoading(false);
          setShowCancelPO(null);
        }
        else{
          return res
        }
      }
    );
      setLoading(false);
      if (response?.success) {
        showToast(response.message?.msg || response.message, "success");
        setReason("");
        let arr = rows;
        getSearchResults();
        // arr = arr.map((row) => {
        //   if (row.po_transaction == showCancelPO) {
        //     return {
        //       ...row,
        //       po_status: "C",
        //     };
        //   } else {
        //     return row;
        //   }
        // });
        setRows(arr);
        setShowCancelPO(null);
      } else {
        showToast(response?.message?.msg || response?.message, "error");
      }
    }
  };
  useEffect(() => {
    // console.log(showCancelPO);
    getPOStatus();
    setReason("");
  }, [showCancelPO]);
  useEffect(() => {
    console.log(reason);
  }, [reason]);
  return (
    <Drawer
      title={`${labels.title}: ${showCancelPO}`}
      width="50vw"
      onClose={() => setShowCancelPO(null)}
      open={showCancelPO}
    >
      <Form layout="vertical">
        <Row>
          <Col span={24}>
            <Form.Item
              name="reason"
              label={labels.reasonLabel}
              rules={[
                { required: true, message: labels.reasonPlaceholder },
              ]}
            >
              <Input.TextArea
                rows={6}
                style={{ resize: "none" }}
                onChange={(e) => setReason(e.target.value)}
                placeholder={labels.reasonPlaceholder}
                value={reason}
              />
            </Form.Item>
          </Col>
        </Row>
        <Row>
          <Col>
            <Button
              loading={loading}
              disabled={reason.length < 5 ? true : false}
              onClick={payment ? showCofirmModal : handleCancelPO}
              type="primary"
            >
              {labels.button}
            </Button>
          </Col>
        </Row>
      </Form>
    </Drawer>
  );
}
