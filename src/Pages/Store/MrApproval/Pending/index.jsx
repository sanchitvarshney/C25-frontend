import { useEffect, useState } from "react";
import { imsAxios } from "../../../../axiosInterceptor";
import { useToast } from "../../../../hooks/useToast.js";
import { Row, Col, Input, Button } from "antd";
import MyDataTable from "../../../../Components/MyDataTable";
import { GridActionsCellItem } from "@mui/x-data-grid";
import printFunction, {
  downloadFunction,
} from "../../../../Components/printFunction";
import RequestApproveModal from "./RequestApproveModal";
import { Form, Modal } from "antd/es";
import {
  ExclamationCircleOutlined,
  CloseOutlined,
  SaveOutlined,
} from "@ant-design/icons";

import { PrinterOutlined } from "@ant-design/icons";
import Loading from "../../../../Components/Loading.jsx";
const PendingApproval = () => {
  const { showToast } = useToast();
  const [loading, setLoading] = useState("fetch");
  const [rows, setRows] = useState([]);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [ModalForm] = Form.useForm();
  const getRows = async () => {
    try {
      setRows([]);
      const payload = {
        branch: "BRALWR36",
        status: "",
      };
      const response = await imsAxios.post(
        "storeApproval/fetchTransactionForApproval",
        payload,
      );
      const data = response?.data;

      if (response.success) {
        const arr = data.map((row, index) => ({
          id: index + 1,
          requestedFrom: row.user_name,
          requestId: row.transaction_id,
          requestDate: row.insert_full_date,
        }));

        setRows(arr);
      } else {
        showToast(response.message, "error");
      }
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };
  const showSubmitConfirmationModal = (type) => {
    // submit confirm modal
    Modal.confirm({
      title: "Do you Want to Cancel the Material Requisition?",
      icon: <ExclamationCircleOutlined />,
      content: (
        <Form form={ModalForm}>
          <Form.Item name="remark">
            <Input
              // onChange={(e) => {
              //   setCancelRemark(e.target.value);
              // }}
              placeholder="Please input the remark"
            />
          </Form.Item>
        </Form>
      ),
      okText: "Yes",
      cancelText: "No",
      onOk: async () => {
        await cancelmr(type);
      },
    });
  };
  const cancelmr = async (type) => {
    const values = await ModalForm.validateFields();
    // console.log("type", type);
    // console.log("values", values);
    // return;
    const response = await imsAxios.post("/storeApproval/requestCancellation", {
      transaction: type.requestId,
      remark: values.remark,
    });
    // console.log("response", response);
    if (response.success) {
      showToast(response.message, "success");
      ModalForm.resetFields();
    } else {
      showToast(response.message, "error");
    }
  };

  const columns = [
    {
      headerName: "#",
      minWidth: 80,
      maxWidth: 80,
      field: "id",
    },
    {
      headerName: "Requested From",
      flex: 1,

      field: "requestedFrom",
    },
    {
      headerName: "Request Id",
      width: 180,
      maxWidth: 180,
      field: "requestId",
    },
    {
      headerName: "Request Date",
      width: 160,
      maxWidth: 160,
      field: "requestDate",
    },
    {
      headerName: "Action",
      type: "actions",
      pin: "right",
      width: 300,
      maxWidth: 300,
      renderCell: (params) => {
        return (
          <div style={{ display: "flex", gap: 10 }}>
            <Button
              onClick={() =>
                setShowApproveModal({
                  requestId: params.row.requestId,
                })
              }
              style={{
                background: "#fffdef",
                borderColor: "#3f3e3e",
                color: "#272727",
              }}
              icon={<SaveOutlined />}
              size="small"
            >
              Process
            </Button>
            <Button
              onClick={() => showSubmitConfirmationModal(params.row)}
              icon={<CloseOutlined />}
              size="small"
              style={{
                background: "#ffffff",
                borderColor: "#ff8484",
                color: "#f76565",
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={() => handleDownload("print", params.row.requestId)}
              size="small"
              style={{
                background: "#e6f4ff",
                borderColor: "#91caff",
                color: "#0958d9",
              }}
              icon={<PrinterOutlined />}
            />
            {/* <MyButton
            onClick={() =>
              handleDownload("download", params.row.requestId)
            }
            type="primary"
            variant="download"
            size="small"
         /> */}
          </div>
        );
      },
    },
  ];
  const handleDownload = async (action, requestId) => {
    try {
      setLoading("download");
      const response = await imsAxios.post("/storeApproval/print_request", {
        transaction: requestId,
      });

      const { data, success } = response;

      if (success) {
        const buffer = data.buffer.data;
        if (action === "print") {
          printFunction(buffer);
        } else {
          downloadFunction(buffer, requestId);
        }
      } else {
        showToast(response.message?.msg ?? response.message, "error");
      }
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getRows();
  }, []);
  return (
    <Row style={{ height: "100%", padding: 15 }}>
      {loading === "download" && <Loading />}
      <Col span={24}>
        <MyDataTable
          loading={loading === "fetch"}
          data={rows}
          columns={columns}
        />
      </Col>
      <RequestApproveModal
        getRows={getRows}
        show={showApproveModal}
        hide={() => setShowApproveModal(false)}
      />
    </Row>
  );
};

export default PendingApproval;
