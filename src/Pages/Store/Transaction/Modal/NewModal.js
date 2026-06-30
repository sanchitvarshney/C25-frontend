import axios from "axios";
import React, { useEffect, useState } from "react";
import { useToast } from "../../../../hooks/useToast.js";
import RemoveModal from "./RemoveModal";
import { Button, Col, Drawer, Input, Row, Select, Space, Spin } from "antd";
import { GridActionsCellItem } from "@mui/x-data-grid";
import { CloseCircleFilled, CheckCircleFilled } from "@ant-design/icons";
import MyDataTable from "../../../../Components/MyDataTable";
import { v4 } from "uuid";
import { imsAxios } from "../../../../axiosInterceptor";

export default function NewModal({
  modalOpen,
  setModalOpen,
  open,
  setOpen,
  getPendingData,
}) {
  const { showToast } = useToast();
  const [delModal, setDelModal] = useState(false);
  const [spinLoading, setSpinLoading] = useState(false);
  const [mat, setMat] = useState([]);
  const [head, setHead] = useState([]);
  const [location, setLocation] = useState([]);
  const [loading, setLoading] = useState(false);

  const compInputHandler = async (name, value, id) => {
    console.log(name, value, id);
    if (name == "qty") {
      setMat((issueQty) =>
        issueQty.map((a) => {
          if (a.serial_no == id) {
            {
              return { ...a, qty: value };
            }
          } else {
            return a;
          }
        })
      );
    } else if (name == "comment") {
      setMat((remarkk) =>
        remarkk.map((a) => {
          if (a.serial_no == id) {
            {
              return { ...a, remark: value };
            }
          } else {
            return a;
          }
        })
      );
    } else if (name == "loc") {
      setMat((locStore) =>
        locStore.map((a) => {
          if (a.serial_no == id) {
            {
              return { ...a, loc: value };
            }
          } else {
            return a;
          }
        })
      );
    }
  };

  const getDataFetch = async () => {
    setLoading(true);
    const response = await imsAxios.post(
      "/storeApproval/fetchTransactionItems",
      {
        transaction: open?.transaction_id,
      }
    );
    if (data.success) {
      let arr = data.data.material.map((row) => {
        return {
          ...row,
          id: v4(),
        };
      });
      if (arr.length > 0) {
        setMat(arr);
        setHead(data?.data?.header);
        setLoading(false);
      } else {
        setModalOpen(false);
        getPendingData();
      }
      } else {
        showToast(data.message?.msg || data.message, "error");
        setOpen(false);
        getPendingData();
        // setLoading(false);
      }
  };

  const getLocation = async () => {
    const response = await imsAxios.get(
      "/storeApproval/fetchLocationAllotedTransApprv"
    );
    const arr = [];
    response.data.map((a) => arr.push({ label: a.text, value: a.id }));
    setLocation(arr);
  };

  const saveFunction = async (materialData, headerData) => {
    setSpinLoading(true);
    console.log(materialData, headerData);
    const response = await imsAxios.post(
      "/storeApproval/AllowComponentsApproval",
      {
        location: headerData?.locationKey,
        pickLocation: materialData?.loc,
        component: materialData?.compKey,
        issueQty: materialData?.qty,
        remark: materialData?.remark,
        authKey: materialData?.authIdentity,
        subject: headerData?.bomKey,
        rate: materialData?.weightedRate,
      }
    );
    if (data.success) {
      if (mat.length > 1) {
        getDataFetch();
        setSpinLoading(false);
        // getPendingData();
        // setOpen(false);
        setMat([]);
      } else {
        setOpen(false);
        getPendingData();
        setSpinLoading(false);
      }
    } else {
      showToast(data.message?.msg || data.message, "error");
      setSpinLoading(false);
    }
  };

  const columns = [
    { field: "serial_no", headerName: "#", width: 80 },
    { field: "component", headerName: "Component/ Part Code", width: 350 },
    { field: "requiredQty", headerName: "Requested Qty", width: 150 },
    {
      field: "leftQty",
      headerName: "Available Qty",
      width: 150,
    },
    {
      field: "qty",
      headerName: "Issued Qty",
      width: 180,
      renderCell: ({ row }) => (
        // console.log(row),
        <>
          <Input
            // size="small"
            value={row?.qty}
            onChange={(e) =>
              compInputHandler("qty", e.target.value, row.serial_no)
            }
          />
        </>
      ),
    },
    {
      field: "location",
      headerName: "Pick Location",
      width: 180,
      renderCell: ({ row }) => (
        // console.log(row),
        <>
          <Select
            style={{ width: "100%" }}
            options={location}
            value={row?.loc}
            onChange={(e) => compInputHandler("loc", e, row.serial_no)}
          />
          {/* <Select
            options={location}
            value={row?.loc}
            onChange={(e) => compInputHandler("loc", e, row.serial_no)}
          /> */}
        </>
      ),
    },
    {
      field: "comment",
      headerName: "Remarks",
      width: 180,
      renderCell: ({ row }) => (
        // console.log(row),
        <>
          <Input
            // size="small"
            value={row?.comment}
            onChange={(e) =>
              compInputHandler("comment", e.target.value, row.serial_no)
            }
          />
        </>
      ),
    },
    {
      field: "actions",
      headerName: "Actions",
      type: "actions",
      width: 200,
      getActions: ({ row }) => [
        <GridActionsCellItem
          label="Reject"
          icon={<CloseCircleFilled onClick={() => setDelModal(row)} />}
        />,
        <GridActionsCellItem
          label="Approve"
          icon={
            <CheckCircleFilled onClick={() => saveFunction(row, head[0])} />
          }
        />,
      ],
    },
  ];

  const reset = () => {
    setOpen(false);
    setMat([]);
    // setModalOpen(false);
    // setDelModal(false);
  };

  const close = () => {
    setOpen(false);
    // setMat([]);
  };
  useEffect(() => {
    if (open?.transaction_id) {
      getDataFetch();
    }
  }, [open?.transaction_id]);

  useEffect(() => {
    if (open.transaction_id) {
      getLocation();
    }
  }, [open.transaction_id]);
  return (
    <>
      <Space>
        <Drawer
          width="100vw"
          title={`Material Requisition Request : ${open?.transaction_id}`}
          placement="right"
          closable={false}
          onClose={close}
          open={open}
          getContainer={false}
          style={{
            position: "absolute",
          }}
          extra={
            <Space>
              heloo
              {/* <CloseCircleFilled onClick={reset} /> */}
            </Space>
          }
        >
          {spinLoading ? (
            <Row gutter={16} justify="end">
              <Col span={24}>
                <div
                  style={{
                    textAlign: "center",
                  }}
                >
                  <Spin tip="Loading........." />
                </div>
              </Col>
            </Row>
          ) : (
            <MyDataTable loading={loading} data={mat} columns={columns} />
          )}
        </Drawer>
      </Space>

      <RemoveModal
        delModal={delModal}
        setDelModal={setDelModal}
        modalOpen={modalOpen?.transaction_id}
        getDataFetch={getDataFetch}
        mat={mat}
        setOpen={setOpen}
      />
    </>
  );
}
