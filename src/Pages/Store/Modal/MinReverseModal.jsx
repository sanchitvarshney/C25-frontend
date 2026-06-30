import React, { useState } from "react";
import { Modal, Button, Input } from "antd";
import axios from "axios";
import { useToast } from "../../../hooks/useToast.js";
import { imsAxios } from "../../../axiosInterceptor";

function MinReverseModal({
  reverseModal,
  setReverseModal,
  inputStore,
  mainData,
}) {
  const { showToast } = useToast();
  const [remark, setRemark] = useState("");
  const [reverseLoading, setReverseLoading] = useState(false);

  const ReverseUpdate = async () => {
    setReverseLoading(true);
    const authArray = [];
    const compArray = [];

    mainData.map((a) => authArray.push(a.authentication));
    mainData.map((aa) => compArray.push(aa.componentKey));

    const response = await imsAxios.post("/reversal/saveMINReversal", {
      branch: "BRALWR36",
      authentication: authArray,
      component: compArray,
      remark: remark,
      transaction: inputStore,
    });
    if (response?.success) {
      setRemark("");
      setReverseModal(false);
      setReverseLoading(false);
    } else {
      showToast(response?.message, "error");
      setReverseModal(false);
      setReverseLoading(false);
    }

  };

  return (
    <>
      <Modal
        open={reverseModal}
        //   title="Reverse"
        onOk={() => setReverseModal(false)}
        onCancel={() => setReverseModal(false)}
        footer={[
          // <Button key="back" onClick={handleCancel}>
          //   Return
          // </Button>,
          <Button
            key="submit"
            type="primary"
            onClick={ReverseUpdate}
            loading={reverseLoading}
          >
            Yes REVERSE
          </Button>,
          <Button onClick={() => setReverseModal(false)}>Close</Button>,
        ]}
      >
        <span style={{ fontWeight: "bolder", fontSize: "13px" }}>
          are you sure you want to reverse the MIN ?
        </span>
        <p style={{ fontWeight: "bolder", fontSize: "12px" }}>
          Note: "Yes REVERSE" action is an irreversible action..
        </p>
        <span style={{ fontWeight: "bolder", fontSize: "12px" }}>
          type any remark in the field below for reversal the MIN TXN:
          <span style={{ color: "green" }}>{inputStore}</span>
        </span>
        <div style={{ marginTop: "10px" }}>
          <Input
            value={remark}
            placeholder="Remark"
            onChange={(e) => setRemark(e.target.value)}
          />
        </div>
      </Modal>
    </>
  );
}

export default MinReverseModal;
