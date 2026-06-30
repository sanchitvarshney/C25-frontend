import React, { useState } from "react";
import { Col, Drawer, Input, Modal, Row, Space } from "antd";

import axios from "axios";
import { useToast } from "../../../hooks/useToast.js";
import { useEffect } from "react";
import { imsAxios } from "../../../axiosInterceptor";

function CloseModal({ closeModalOpen, setCloseModalOpen, getRows }) {
  const { showToast } = useToast();
  const [remark, setRemark] = useState("");
  const { seltype, row } = closeModalOpen;
  // console.log(row);

  const generateFun = async () => {
    const response = await imsAxios.post("/jobwork/closePO", {
      skucode: row.skuKey,
      transaction: row.jwId,
      remark: remark,
    });
    setCloseModalOpen(false);
    if (response.success) {
      setRemark("");

      getRows();
    } else if (!response.success) {
      showToast(response.message?.msg || response.message, "error");
    }
  };

  return (
    <form>
      <Modal
        title="are you sure you want to close the Jobwork Purchase Order ?"
        centered
        open={closeModalOpen}
        onOk={() => {
          generateFun();
        }}
        onCancel={() => setCloseModalOpen(false)}
        width={800}
      >
        <Row>
          <Col span={24}>
            Once the Purchase Order will closed, users will not able to proceed
            further action against to this same purchase order{" "}
            <span style={{ fontWeight: "bolder", color: "blue" }}>
              {row?.jwid}{" "}
            </span>
            and product SKU.
          </Col>
          <Col span={24} style={{ marginTop: "10px" }}>
            Note: "CLOSE" action is an reversible action..
          </Col>
          <Col
            span={24}
            style={{
              marginTop: "10px",
              fontSize: "12px",
              fontWeight: "bolder",
            }}
          >
            type any remark in the field below for cancel PO
            <span style={{ fontWeight: "bolder", color: "blue" }}>
              {" "}
              #{row?.jwid}
            </span>{" "}
            (*mandatory)
          </Col>
          <Col span={24} style={{ marginTop: "10px" }}>
            <Input
              placeholder="Remark"
              value={remark}
              onChange={(e) => setRemark(e.target.value)}
            />
          </Col>
        </Row>
      </Modal>
    </form>
  );
}

export default CloseModal;
