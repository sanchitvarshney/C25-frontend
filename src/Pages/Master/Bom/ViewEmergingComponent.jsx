import { Button, Col, Modal, Popconfirm, Row, Space, Typography } from "antd";
import React, { useEffect, useState } from "react";
import { imsAxios } from "../../../axiosInterceptor";
import { useToast } from "../../../hooks/useToast.js";
import TableActions from "../../../Components/TableActions.jsx/TableActions";
import SummaryCard from "../../../Components/SummaryCard";
import { DeleteFilled } from "@ant-design/icons";
import Loading from "../../../Components/Loading";

export default function ViewEmergingComponent({
  viewEmergingPart,
  setViewEmergingPart,
  next,
}) {
  const { showToast } = useToast();
  const [mergedComponent, setMergedComponent] = useState(null);
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState([
    {
      title: "Emerged Component:",
      description: "",
    },
    {
      title: "Parent BOM:",
      description: "",
    },
    {
      title: "Parent Component:",
      description: "",
    },
    {
      title: "Emerged By:",
      description: "",
    },
    {
      title: "Emerged On:",
      description: "",
    },
  ]);
  const handleCancel = () => {
    setViewEmergingPart(false);
  };
  const getDetails = async () => {
    if (viewEmergingPart) {
      setLoading("fetch");
      const response = await imsAxios.post("/bom/getEmergedPart", {
        parent_part: viewEmergingPart.parent_part,
        subject: viewEmergingPart.subject,
      });
      setLoading(false);
      const { data } = response;
      if (data) {
        if (response.success) {
          setMergedComponent(data.data[0]);
          let arr = [
            {
              title: "Emerged Component:",
              description: (
                <Row justify="space-between" style={{ width: "100%" }}>
                  <Col>
                    {data.data[0].emerged_component +
                      " / " +
                      data.data[0].emerged_part}
                  </Col>
                </Row>
              ),
            },
            {
              title: "Parent BOM:",
              description: viewEmergingPart?.bom,
            },
            {
              title: "Parent Component:",
              description: viewEmergingPart?.componentName,
            },
            {
              title: "Emerged By:",
              description: data.data[0].insert_by,
            },
            {
              title: "Emerged On:",
              description: data.data[0]?.insert_dt,
            },
          ];
          setSummary(arr);
        } else {
          showToast(response.message?.msg || response.message, "error");
          setMergedComponent(false);
          setViewEmergingPart(false);
        }
      }
    }
  };
  const handleDeleteEmergingConfirm = async () => {
    if (mergedComponent) {
      let obj = {
        parent_part: viewEmergingPart.parent_part,
        ref: mergedComponent?.refid,
        subject: viewEmergingPart.subject,
      };
      setLoading("submit");
      const response = await imsAxios.post("/bom/deleteEmergedPart", obj);
      setLoading(false);
      const { data } = response;
      if (data) {
        if (response.success) {
          showToast(response.message, "success");
          setMergedComponent(false);
          setViewEmergingPart(false);
          next();
        } else {
          showToast(response.message?.msg || response.message, "error");
        }
      }
    }
  };
  useEffect(() => {
    getDetails();
  }, [viewEmergingPart]);
  return (
    <Modal
      width={700}
      title="Emerging part "
      open={viewEmergingPart}
      onCancel={handleCancel}
      cancelText={"Back"}
      footer={[
        <Button key="back" onClick={handleCancel}>
          Back
        </Button>,
        <Popconfirm
          title="Are you sure you want to delete this emerging component?"
          description="Are you sure to delete this task?"
          onConfirm={handleDeleteEmergingConfirm}
          okText="Yes"
          cancelText="No"
          okButtonProps={{
            loading: loading === "submit",
          }}
        >
          <Button type="primary" shape="circle" icon={<DeleteFilled />} />
        </Popconfirm>,
      ]}
    >
      {loading === "submit" && <Loading />}
      <Row gutter={[0, 16]}>
        <SummaryCard summary={summary} loading={loading === "fetch"} />
      </Row>
    </Modal>
  );
}
