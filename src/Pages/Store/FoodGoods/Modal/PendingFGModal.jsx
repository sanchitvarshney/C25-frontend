import { useState } from "react";
import { useToast } from "../../../../hooks/useToast.js";
import {
  Col,
  Input,
  Modal,
  Row,
  Skeleton,
} from "antd";
import {
  CaretRightOutlined,
} from "@ant-design/icons";
import { imsAxios } from "../../../../axiosInterceptor";
import Field from "../../../../Components/Field.jsx";

function PendingFGModal({ fGModal, setFGModal, getPendingData }) {
  const { showToast } = useToast();
  const [loadingModal, setLoadingModal] = useState(false);
  const [allPendingData, setAllPendingData] = useState({
    qty: "",
  });
    const [isValid, setIsValid] = useState(false);

  const submitData = async () => {
      if(allPendingData?.qty === "" || allPendingData?.qty === 0 || allPendingData?.qty === "0" || !allPendingData?.qty) {
      setIsValid(true);
      return
    } 
    setIsValid(false);
    setLoadingModal(true);
    const response = await imsAxios.post("/fgIN/saveFGs", {
      pprqty: allPendingData.qty,
      pprrequest1: fGModal.mfg_ref_transid_1,
      pprrequest2: fGModal.mfg_transaction,
      pprsku: fGModal.mfg_sku,
      rate: fGModal.warRate ?? 0,
    });
    //  console.log(data.message)
    if (response?.success) {
      getPendingData();
      setAllPendingData({
        qty: "",
      });
      setLoadingModal(false);
      setFGModal(false);
    } else {
      showToast(response?.message, "error");
      setAllPendingData({
        qty: "",
      });
      setFGModal(false);
      setLoadingModal(false);
    }
  };


  return (
    <Modal
      // style={{ top: -200 }}
      title="FG Inwarding"
      centered
      open={fGModal}
         maskClosable={false}
      onOk={() => {
        submitData();

      }}
       onCancel={() => {
        setFGModal(false)
        setIsValid(false)
        setAllPendingData({
          qty: "",
        });
      }}
      width={900}
    >
      <Row>
        <Skeleton active loading={loadingModal}>
          <Col
            span={24}
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <span style={{ fontWeight: "bolder" }}>
              WAR Rate: {fGModal.warRate ?? 0}
            </span>
            <div style={{ textAlign: "end", fontWeight: "bolder" }}>
              {fGModal.mfg_ref_id}
              <CaretRightOutlined style={{ color: "red" }} />
              <CaretRightOutlined style={{ color: "red" }} />
              <CaretRightOutlined style={{ color: "red" }} />
              {fGModal.mfg_transaction}
            </div>
          </Col>
          <Col span={24} style={{ marginTop: "10px" }}>
            <Row gutter={10} style={{ textAlign: "center" }}>
              <Col
                span={12}
                style={{ border: "1px solid grey", padding: "5px" }}
              >
                NAME / SKU
              </Col>
              <Col
                span={4}
                style={{ border: "1px solid grey", padding: "5px" }}
              >
                MFG / STIN QTY
              </Col>
              <Col
                span={8}
                style={{ border: "1px solid grey", padding: "5px" }}
              >
                IN QTY
              </Col>
              {/* <Divider/> */}

              <Col
                span={12}
                style={{
                  border: "1px solid grey",
                  padding: "5px",
                  fontWeight: "bolder",
                }}
              >
                {`${fGModal.p_name} / ${fGModal.mfg_sku}`}
              </Col>
              <Col
                span={4}
                style={{
                  border: "1px solid grey",
                  padding: "5px",
                  fontWeight: "bolder",
                }}
              >
                {`${fGModal.mfg_prod_planing_qty}/${fGModal.completedQTY}`}
              </Col>
               <Col
                span={8}
                style={{ border: "1px solid grey", padding: "5px 40px" }}
              >
                <Field
                  attr="required | Please enter IN QTY"
                      value={allPendingData.qty}
                  showValidation={isValid}
                  treatZeroAsEmpty
                >
                  <Input
                    suffix={fGModal.mfg_prod_planing_qty}
                    placeholder="Qty"
                    style={{ width: "100%" }}
                    value={allPendingData.qty}
                    onChange={(e) =>
                      setAllPendingData((allPendingData) => {
                        return { ...allPendingData, qty: e.target.value };
                      })
                    }
                  />
                </Field>
              </Col>
            </Row>
          </Col>
        </Skeleton>
      </Row>
    </Modal>
  );
}

export default PendingFGModal;
