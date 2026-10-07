import  { useEffect, useMemo, useState } from "react";
import {
  Button,
  Card,
  Col,
  Input,
  Modal,
  Row,
  Space,
  Typography,
} from "antd";
import MyDataTable from "../../../Components/MyDataTable";
import MySelect from "../../../Components/MySelect";
import MyDatePicker from "../../../Components/MyDatePicker";
import ToolTipEllipses from "../../../Components/ToolTipEllipses";
import { imsAxios } from "../../../axiosInterceptor";
import { useToast } from "../../../hooks/useToast";

const decisionOptions = [
  { text: "APPROVE", value: "APPROVE" },
  { text: "REJECT", value: "REJECT" },
];

const statusOptions = [
  { text: "PENDING", value: "PENDING" },
  { text: "APPROVED", value: "APPROVED" },
  { text: "REJECTED", value: "REJECTED" },
  { text: "APPLIED", value: "APPLIED" },
  { text: "All", value: "" },
];

const defaultFilters = {
  ppr_no: "",
  project_id: "",
  status: "PENDING",
  dateRange: "",
};

const filterLabelStyle = {
  display: "block",
  fontSize: 12,
  fontWeight: 500,
  marginBottom: 4,
};

export default function PprQtyRequests() {
  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState([]);
  const {showToast} = useToast();
  const [filters, setFilters] = useState(defaultFilters);

  const [decideModal, setDecideModal] = useState(null); 

  const getLogId = (row) =>
    row?.id ??
    row?.log_id ??
    row?.logId ??
    row?.id_pk ??
    row?.request_id ??
    row?.qty_log_id ??
    null;

  const columns = useMemo(
    () => [
      { headerName: "#", field: "id", width: 60 },
      {
        headerName: "Log ID",
        field: "log_id",
        width: 90,
        renderCell: ({ row }) => (
          <ToolTipEllipses text={row.log_id} copy={true} />
        ),
      },
      {
        headerName: "PPR No",
        field: "ppr_no",
        width: 150,
        renderCell: ({ row }) => (
          <ToolTipEllipses text={row.ppr_no} copy={true} />
        ),
      },
      { headerName: "Project", field: "project_id", width: 170 },
      { headerName: "Old Qty", field: "old_planned_qty", width: 100 },
      { headerName: "Add Qty", field: "requested_add_qty", width: 100 },
      { headerName: "Preview/Final Qty", field: "final_planned_qty", width: 130 },
      { headerName: "Requested By", field: "requested_by", width: 150 },
      { headerName: "Requested At", field: "requested_at", width: 160 },
      {
        headerName: "Remark",
        field: "remark",
        flex: 1,
        minWidth: 220,
        renderCell: ({ row }) => (
          <ToolTipEllipses
            text={
              row.request_remark ??
              row.remark ??
              row.decision_remark ??
              row.decided_remark ??
              "--"
            }
          />
        ),
      },
      {
        headerName: "Actions",
        field: "actions",
        width: 120,
        sortable: false,
        renderCell: ({ row }) => (
          <Space>
            <Button
              size="small"
              type="primary"
              onClick={() => {
                const logId = getLogId(row);
                if (!logId) {
                  showToast("Log id missing in this row", "error");
                  return;
                }
                setDecideModal({
                  log_id: logId,
                  decision: "APPROVE",
                  remark: "",
                });
              }}
            >
              Approve
            </Button>
            <Button
              size="small"
              danger
              onClick={() => {
                const logId = getLogId(row);
                if (!logId) {
                  showToast("Log id missing in this row", "error");
                  return;
                }
                setDecideModal({
                  log_id: logId,
                  decision: "REJECT",
                  remark: "",
                });
              }}
            >
              Reject
            </Button>
          </Space>
        ),
      },
    ],
    [],
  );

  // `f` lets Reset fetch with the defaults before the state update lands
  const fetchRows = async (f = filters) => {
    setLoading(true);
    setRows([]);
    try {
      const payload = {};
      if (f.ppr_no) payload.ppr_no = f.ppr_no.trim();
      if (f.project_id) payload.project_id = f.project_id.trim();
      if (f.status) payload.status = f.status;
      if (f.dateRange && typeof f.dateRange === "string") {
        payload.from_date = f.dateRange.substring(0, 10);
        payload.to_date = f.dateRange.substring(11, 21);
      }
      const response = await imsAxios.post("/ppr/fetchPprQtyLogs", payload);
      if (response?.success) {
        const arr = (response?.data || []).map((r, idx) => ({
          id: idx + 1, // grid serial
          log_id:
            r?.id ??
            r?.log_id ??
            r?.logId ??
            r?.id_pk ??
            r?.request_id ??
            r?.qty_log_id ??
            null,
          ...r,
        }));
        setRows(arr);
      } else {
        showToast(response?.message?.msg || response?.message || "Failed to fetch", "error");
      }
    } catch {
      showToast("Error fetching requests", "error");
    } finally {
      setLoading(false);
    }
  };

  const resetFilters = () => {
    setFilters(defaultFilters);
    fetchRows(defaultFilters);
  };

  useEffect(() => {
    fetchRows();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const decide = async () => {
    if (!decideModal?.log_id) return;
    setLoading(true);
    try {
      const response = await imsAxios.post("/ppr/decidePprQtyRequest", {
        log_id: decideModal.log_id,
        decision: decideModal.decision,
        remark: decideModal.remark || "",
      });
      if (response?.success) {
        showToast(response?.message || "Decision saved", "success");
        setDecideModal(null);
        await fetchRows();
      } else {
        showToast(response?.message?.msg || response?.message || "Failed to decide", "error");
      }
    } catch {
      showToast("Error updating decision", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ height: "calc(100vh - 125px)", padding: 10 }}>
      <Row gutter={10} style={{ height: "100%" }}>
        {/* filters */}
        <Col xs={24} md={7} lg={5} style={{ height: "100%" }}>
          <Card
            size="small"
            title="Filters"
            style={{ height: "100%", overflowY: "auto" }}
          >
            <Space direction="vertical" size={12} style={{ width: "100%" }}>
              <div>
                <Typography.Text style={filterLabelStyle}>Status</Typography.Text>
                <MySelect
                  options={statusOptions}
                  value={filters.status}
                  onChange={(v) =>
                    setFilters((p) => ({ ...p, status: v ?? "" }))
                  }
                />
              </div>
              <div>
                <Typography.Text style={filterLabelStyle}>PPR No</Typography.Text>
                <Input
                  placeholder="Enter PPR No"
                  allowClear
                  value={filters.ppr_no}
                  onChange={(e) =>
                    setFilters((p) => ({ ...p, ppr_no: e.target.value }))
                  }
                  onPressEnter={() => fetchRows()}
                />
              </div>
              <div>
                <Typography.Text style={filterLabelStyle}>Project ID</Typography.Text>
                <Input
                  placeholder="Enter Project ID"
                  allowClear
                  value={filters.project_id}
                  onChange={(e) =>
                    setFilters((p) => ({ ...p, project_id: e.target.value }))
                  }
                  onPressEnter={() => fetchRows()}
                />
              </div>
              <div>
                <Typography.Text style={filterLabelStyle}>Date Range</Typography.Text>
                <MyDatePicker
                  value={filters.dateRange}
                  setDateRange={(v) =>
                    setFilters((p) => ({ ...p, dateRange: v }))
                  }
                />
              </div>
              <Space style={{ width: "100%" }} direction="vertical" size={8}>
                <Button
                  type="primary"
                  onClick={() => fetchRows()}
                  loading={loading}
                  block
                >
                  Fetch
                </Button>
                <Button onClick={resetFilters} disabled={loading} block>
                  Reset
                </Button>
              </Space>
            </Space>
          </Card>
        </Col>

        {/* table */}
        <Col xs={24} md={17} lg={19} style={{ height: "100%" }}>
          <MyDataTable columns={columns} data={rows} loading={loading} />
        </Col>
      </Row>

      <Modal
        title={`Decide Request - Log ${decideModal?.log_id ?? ""}`}
        open={!!decideModal}
        onCancel={() => setDecideModal(null)}
        onOk={decide}
        okButtonProps={{ loading }}
        okText="Submit"
      >
        <Row gutter={8}>
          <Col span={24} style={{ marginBottom: 8 }}>
            <MySelect
              options={decisionOptions}
              value={decideModal?.decision}
              onChange={(v) =>
                setDecideModal((p) => ({ ...(p || {}), decision: v }))
              }
            />
          </Col>
          <Col span={24}>
            <Input.TextArea
              rows={3}
              placeholder="Remark (optional)"
              value={decideModal?.remark}
              onChange={(e) =>
                setDecideModal((p) => ({ ...(p || {}), remark: e.target.value }))
              }
            />
          </Col>
        </Row>
      </Modal>
    </div>
  );
}

