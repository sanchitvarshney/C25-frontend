import { useState } from "react";
import { useToast } from "../../../hooks/useToast.js";
import { Button, Row, Space, Form, Drawer } from "antd";
import MyDatePicker from "../../../Components/MyDatePicker";
import MyDataTable from "../../../Components/MyDataTable";
import { imsAxios } from "../../../axiosInterceptor";
import Loading from "../../../Components/Loading";
import MyButton from "../../../Components/MyButton";
function PendingBranchTransfer() {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState([]);
  const [showViewModel, setShowViewModal] = useState(false);
  const [detailData, setDetailData] = useState([]);

  const [qcReportForm] = Form.useForm();
  const getcomoponents = async (trans_id) => {
    setLoading("fetchData");
    try {
      const response = await imsAxios.get(
        `/branchTransfer/incomingBranchTransferDetails?trans_id=${trans_id}`,
      );
      const { data, success, message } = response?.data ?? {};
      if (success) {
        const arr = data.map((row, index) => {
          return {
            key: index,
            id: index,
            index: index + 1,
            ...row,
          };
        });
        setDetailData(arr);
        setShowViewModal(true);
      } else {
        showToast(message, "error");
      }
    } catch (error) {
      showToast(error, "error");
    } finally {
      setLoading(false);
    }
  };

  const getRows = async () => {
    setLoading("fetch");
    try {
      setRows([]);
      const values = await qcReportForm.validateFields();

      const [from, to] = values.date.split(/-(?=\d{2}-\d{2}-\d{4}$)/);
      const response = await imsAxios.get(
        `/branchTransfer/incomingBranchTransferList?from=${from}&to=${to}`,
      
      )
      const { data, success, message } = response ?? {};
      if (success) {
        showToast(message, "success");

        const arr = data.map((row, index) => {
          return {
            key: index,
            id: index,
            index: index + 1,
            ...row,
          };
        });
        setRows(arr);
      } else {
        showToast(message, "error");
      }
    } catch (error) {
      showToast(error?.message|| "Something went wrong", "error");
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      headerName: "#",
      width: 50,
      field: "index",
      renderCell: (params) => <span>{params.row.index}</span>,
    },
    {
      headerName: "Vendor",
      width: 250,
      field: "vendor",
    },
    {
      headerName: "Transaction Id",
      width: 180,
      field: "transId",
      renderCell: (params) => (
        <span
          onClick={() => getcomoponents(params.row.transId)}
          style={{
            cursor: "pointer",
            color: "#0f766e",
            textDecoration: "underline",
          }}
        >
          {params.row.transId}
        </span>
      ),
    },
    {
      headerName: "Pick Up Location",
      width: 180,
      field: "fromLocation",
    },
    {
      headerName: "Drop Location",
      width: 180,
      field: "toLocation",
    },
    {
      headerName: "Request Branch",
      width: 180,
      field: "branchName",
      renderCell: (params) => {
        return (
          <span>{`${params.row?.branchName} (${params.row?.branchCode})`}</span>
        );
      },
    },
    {
      headerName: "Vechile Number",
      flex: 1,
      minWidth: 200,
      field: "vehicleNo",
    },
    {
      headerName: "Description",
      flex: 1,
      minWidth: 200,
      field: "narration",
    },
    {
      headerName: "Request Date",
      flex: 1,
      minWidth: 200,
      field: "insertDate",
    },
  ];

  return (
    <>
      <div style={{ height: "calc(100vh - 160px)", margin: 10 }}>
        {loading === "fetchData" && <Loading />}
        <Row justify="space-between">
          <Form
            form={qcReportForm}
            layout="vertical"
            initialValues={defaultValues}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                width: "100%",
                alignItems: "center",
              }}
            >
              <Space align="center">
                <Form.Item
                  name="date"
                  label="Date"
                  layout="horizontal"
                  rules={rules.date}
                  style={{ marginBottom: 0 }}
                >
                  <MyDatePicker
                    setDateRange={(value) =>
                      qcReportForm.setFieldValue("date", value)
                    }
                  />
                </Form.Item>

                <MyButton
                  variant="search"
                  type="primary"
                  loading={loading === "fetch"}
                  onClick={getRows}
                  id="submit"
                >
                  Search
                </MyButton>
              </Space>
            </div>
          </Form>
        </Row>
        <div style={{ height: "calc(100vh - 180px)", marginTop: 10 }}>
          <MyDataTable
            columns={columns}
            data={rows}
            loading={loading === "fetch"}
          />
        </div>
      </div>
      <ViewModal
        show={showViewModel}
        setshow={setShowViewModal}
        detaildata={detailData}
        status={status}
        loading={loading}
        setLoading={setLoading}
        component={<Loading />}
      />
    </>
  );
}

const defaultValues = {
  ppr: "",
  process: "",
  status: "date",
};

const rules = {
  ppr: [{ required: true, message: "Please select Vendor" }],
};

export default PendingBranchTransfer;

const ViewModal = ({
  loading,
  show,
  setshow,
  detaildata,
  // status,
  component,
}) => {
  const { showToast } = useToast();
  const [isLoading , setIsLoading] = useState(false);
  const viewcolumns = [
    {
      headerName: "#",
      width: 50,
      field: "index",
    },
    {
      headerName: "Component",
      width: 220,
      field: "componentName",
    },
    {
      headerName: "Part Number",
      width: 150,
      field: "partNo",
    },
    {
      headerName: "Quantity",
      width: 100,
      field: "qty",
    },
    {
      headerName: "From Location",
      width: 150,
      field: "locOutName",
    },
    {
      headerName: "To Location",
      width: 150,
      field: "locInName",
    },
    {
      headerName: "Remark",
      width: 150,
      field: "remark",
    },
    {
      headerName: "Inserted By",
      width: 180,
      field: "insertByName",
    },
    {
      headerName: "Inserted Date",
      width: 160,
      field: "insertDate",
    },
  ];
  const approveTransfer = async () => {
    if (detaildata[0].transId === "" || detaildata[0].transId === null || detaildata[0].transId === undefined) {
      showToast( "Please Select Branch Transfer", "error");
      return;
    }
    try {
      setIsLoading(true);
      const response = await imsAxios.post("/branchTransfer/createBranchTransferInward", {
         trans_id: detaildata[0].transId,
      })
   
      if (response.success) {
        showToast(response.message, "success");
        setIsLoading(false);
      setshow(false);
      } else  {
        showToast(response.message?.msg || response.message, "error");
        setIsLoading(false);
      }
    
      
    } catch (error) {
      setIsLoading(false);
      showToast(error?.message || "Server Error", "error");
      
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Drawer
      width="80vw"
      title={`Branch Transfer - ${detaildata[0]?.transId || ""}`}
      onClose={() => {
        setshow(false);
      }}
      extra={
        <Space>
          <Button type="primary" disabled={isLoading} loading={isLoading} onClick={approveTransfer}>
           Approve
          </Button>
        </Space>
      }
      open={show}
      bodyStyle={{ paddingTop: 5 }}
    >
      {loading === "fetch" && component}
      <MyDataTable columns={[...viewcolumns]} data={detaildata} />
    </Drawer>
  );
};
