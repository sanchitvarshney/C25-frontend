import { useEffect, useState } from "react";
import { Card, Col, Form, Radio, Row, Space } from "antd";
import useLoading from "../../../../hooks/useLoading";
import MyAsyncSelect from "../../../../Components/MyAsyncSelect";
import { imsAxios } from "../../../../axiosInterceptor";
import SingleDatePicker from "../../../../Components/SingleDatePicker";
import MyButton from "../../../../Components/MyButton";
import ToolTipEllipses from "../../../../Components/ToolTipEllipses";
import MyDataTable from "../../../../Components/MyDataTable";
import { useToast } from "../../../../hooks/useToast.js";
import { GridActionsCellItem } from "@mui/x-data-grid";
import ViewMRTransaction from "../../ApprovedTransaction/ViewMRTransaction";
import { downloadCSV } from "../../../../Components/exportToCSV";
import { CommonIcons } from "../../../../Components/TableActions.jsx/TableActions";

const ProccessedMrRequest = () => {
  const { showToast } = useToast();
  const [loading, setLoading] = useLoading();
  const [asyncOptions, setAsyncOptions] = useState([]);
  const [showDetails, setShowDetails] = useState(null);
  const [rows, setRows] = useState([]);
  const [filterForm] = Form.useForm();

  const getUser = async (search) => {
    try {
      setLoading("select", true);
      const response = await imsAxios.post("/backend/fetchAllUser", { search });

      if (response?.success) {
        let arr = response?.data.map((row) => ({
          value: row.id,
          text: row.text,
        }));
        setAsyncOptions(arr);
      }
    } catch (error) {
    } finally {
      setLoading("select", false);
    }
  };

  const getRows = async () => {
    try {
      const values = await filterForm.validateFields();
      setLoading("fetch", true);
      const payload = {
        date: values.date,
        user: values.user,
      };
      const response = await imsAxios.post(
        "/transaction/viewApprovalStatus",
        payload,
      );

      if (response?.success) {
        const arr = response.data.map((row, index) => ({
          id: index + 1,
          requestDate: row.datetime,
          requestId: row.transaction,
          pickLocation: row.location,
          rmQty: row.totalrm,
        }));

        setRows(arr);
      } else {
        showToast(response?.message, "error");
      }
    } catch (error) {
    } finally {
      setLoading("fetch", false);
    }
  };

  const handleDownload = () => {
    downloadCSV(rows, columns, "MR Approved Requests");
  };
  const actionColumn = {
    headerName: "",
    type: "actions",
    width: 20,
    getActions: ({ row }) => [
      // VIEW Icon
      <GridActionsCellItem
        showInMenu
        // disabled={disabled}
        label="View"
        onClick={() => {
          setShowDetails(row.requestId);
        }}
      />,
    ],
  };

  return (
    <Row gutter={0} style={{ padding: 10, height: "100%" }}>
      <Col span={24} style={{marginBottom: 0}}>
        <Form form={filterForm}>
          <Row gutter={10}>
              <Col span={5}>
                <Form.Item name="user" label="User">
              <MyAsyncSelect
                selectLoading={loading("select")}
                onBlur={() => setAsyncOptions([])}
                loadOptions={getUser}
                optionsState={asyncOptions}
              />
            </Form.Item>
              </Col>
            <Col span={6}>
              <Form.Item
                name="date"
                label="Select Date"
                style={{ marginBottom: 0 }}
              >
                <SingleDatePicker
                  setDate={(value) => filterForm.setFieldValue("date", value)}
                />
              </Form.Item>
            </Col>

            <Col span={2}>
              <MyButton
                variant="search"
                loading={loading("fetch")}
                onClick={getRows}
              />
            </Col>

            <Col span={2}>
              <CommonIcons action="downloadButton" onClick={handleDownload} />
            </Col>
          </Row>
        </Form>
      </Col>
      <Col span={24} style={{ height: "calc(100% - 60px)", overflowY: "auto" }} >
        <MyDataTable data={rows} columns={[actionColumn, ...columns]} />
      </Col>
      {showDetails && (
        <Col span={10} style={{ height: "100%", overflowY: "hidden" }}>
          <Card
            size="small"
            title={`Request: ${showDetails}`}
            style={{ height: "100%" }}
            extra={
              <MyButton
                variant="clear"
                text="Close"
                onClick={() => setShowDetails(null)}
              />
            }
            bodyStyle={{ height: "95%", overflow: "hidden" }}
          >
            <ViewMRTransaction viewTransaction={showDetails} />
          </Card>
        </Col>
      )}
    </Row>
  );
};

export default ProccessedMrRequest;

const columns = [
  {
    headerName: "#",
    field: "id",
    width: 30,
  },
  {
    headerName: "Request Date",
    field: "requestDate",
    minWidth: 150,
    flex: 1,
  },
  {
    headerName: "Request ID",
    field: "requestId",
    minWidth: 150,
    flex: 1,
    renderCell: ({ row }) => (
      <ToolTipEllipses text={row.requestId} copy={true} />
    ),
  },
  {
    headerName: "RM qty",
    field: "rmQty",
    width: 100,
    renderCell: ({ row }) => <ToolTipEllipses text={row.rmQty} />,
  },
  {
    headerName: "Pick Location",
    field: "pickLocation",
    width: 120,
  },
];
