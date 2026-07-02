import  { useState } from "react";
import { Col, Input, Row, Space, Tooltip } from "antd";
import MyDatePicker from "../../../Components/MyDatePicker.jsx";
import { useToast } from "../../../hooks/useToast.js";
import MyDataTable from "../../../Components/MyDataTable.jsx";
import { downloadCSV } from "../../../Components/exportToCSV.jsx";
import { CommonIcons } from "../../../Components/TableActions.jsx/TableActions.jsx";
import ToolTipEllipses from "../../../Components/ToolTipEllipses.jsx";
import { imsAxios } from "../../../axiosInterceptor.js";
import { GridActionsCellItem } from "@mui/x-data-grid";
import MyButton from "../../../Components/MyButton/index.jsx";
import ViewPORequest from "./ViewPORequest.jsx";
import EditPO from "../ManagePO/EditPO/EditPO.jsx";
import ViewPOLogs from "./ViewPOLogs";
import CancelPO from "../ManagePO/Sidebars/CancelPO.jsx";
import MySelect from "../../../Components/MySelect.jsx";

 const wiseOptions = [
    { value: "single_date_wise", text: "Date Wise" },
    { value: "po_wise", text: "PO ID Wise" },

  ];

const RequestPo = () => {
  const { showToast } = useToast();
  const [searchLoading, setSearchLoading] = useState(false);
  const [viewPoId, setViewPoId] = useState(null);
  const [rows, setRows] = useState([]);
  const [wise, setWise] = useState("po_wise");
  const [searchDateRange, setSearchDateRange] = useState("");
   const [searchInput, setSearchInput] = useState("");
  const [updatePoId, setUpdatePoId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [viewPoLogsId, setViewPoLogsId] = useState(null);
  const [showClosePO, setShowClosePO] = useState(null);

  const columns = [
    {
      headerName: "",
      type: "actions",
      width: 30,
      getActions: ({ row }) => [
        // VIEW Icon
        <GridActionsCellItem
          key="view"
          showInMenu
          label="View"
          onClick={() => getComponentData(row.po_transaction, row.po_status)}
        />,
        <GridActionsCellItem
          key="edit"
          showInMenu
          label="Edit"
          onClick={() => getPoDetail(row.po_transaction)}
          disabled={
            row.poacceptstatus === "UNDER VERIFICATION" ||
            row.poacceptstatus === "PENDING"
          }
        />,
        <GridActionsCellItem
          key="poLogs"
          showInMenu
          label="View PO Logs"
          onClick={() => setViewPoLogsId(row.po_transaction)}
        />,
        <GridActionsCellItem
          key="close"
          showInMenu
          label="Close PO"
          onClick={() => handleClosePO(row.po_transaction)}
        />,
      ],
    },
    {
      headerName: "#.",
      field: "index",
      width: 30,
    },
    {
      headerName: "PR ID",
      field: "po_transaction",
      renderCell: ({ row }) => (
        <ToolTipEllipses text={row.po_transaction} copy={true} />
      ),
      width: 180,
    },
    {
      headerName: "PR ACCEPTANCE",
      field: "poacceptstatus",
      renderCell: ({ row }) => {
        const status = (row.poacceptstatus || "").toUpperCase().trim();
        const isUnderVerification = status === "UNDER VERIFICATION";

        const leaderEmail = row.leader_email;

        // Colors
        let bgColor = "#8c8c8c";
        if (status === "APPROVED") bgColor = "#52c41a";
        else if (status === "REJECTED") bgColor = "#ff4d4f";
        else if (status === "PENDING") bgColor = "#faad14";

        const textColor = status === "PENDING" ? "#000" : "#fff";

        const badge = (
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: bgColor,
              color: textColor,
              padding: "6px 18px",
              borderRadius: "16px",
              fontSize: "0.75rem",
              fontWeight: 600,
              minHeight: "28px",
              boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
              cursor: isUnderVerification && leaderEmail ? "help" : "default",
            }}
          >
            {row.poacceptstatus || "N/A"}
          </div>
        );

        if (isUnderVerification && leaderEmail) {
          return (
            <Tooltip
              title={
                <div style={{ textAlign: "center", lineHeight: "1.5" }}>
                  <small style={{ opacity: 0.85 }}>Under Verification by</small>
                  <br />
                  <strong style={{ fontSize: "15px", color: "#fff" }}>
                    {leaderEmail}
                  </strong>
                  <br />
                  <small style={{ opacity: 0.7, fontSize: "11px" }}>
                    {row.leader_name || ""}
                  </small>
                </div>
              }
              color="#1a1a1a"
              overlayInnerStyle={{ borderRadius: 10, padding: "10px 14px" }}
              mouseEnterDelay={0}
            >
              <span style={{ display: "inline-block" }}>{badge}</span>
            </Tooltip>
          );
        }

        return <span style={{ display: "inline-block" }}>{badge}</span>;
      },
      flex: 1,
      minWidth: 180,
    },
    {
      headerName: "Cost Center",
      field: "cost_center",
      renderCell: ({ row }) => <ToolTipEllipses text={row.cost_center} />,
      flex: 1,
      minWidth: 150,
    },

    {
      headerName: "Vendor Name",
      field: "vendor_name",
      renderCell: ({ row }) => <ToolTipEllipses text={row.vendor_name} />,
      flex: 2,
      minWidth: 200,
    },
    {
      headerName: "Vendor Code",
      field: "vendor_id",
      renderCell: ({ row }) => (
        <ToolTipEllipses text={row.vendor_id} copy={true} />
      ),
      width: 100,
    },
    {
      headerName: "Project ID",
      field: "project_id",
      renderCell: ({ row }) => (
        <ToolTipEllipses text={row.project_id} copy={true} />
      ),
      minWidth: 150,
      flex: 1,
    },
    {
      headerName: "Project Name",
      field: "project_name",
      renderCell: ({ row }) => <ToolTipEllipses text={row.project_name} />,
      minWidth: 150,
      flex: 1,
    },
    {
      headerName: "Requested By",
      field: "requested_by",
      renderCell: ({ row }) => <ToolTipEllipses text={row.requested_by} />,
      minWidth: 150,
      flex: 1,
    },
    {
      headerName: "Approved By/Rejected By",
      field: "approved_by",
      renderCell: ({ row }) => <ToolTipEllipses text={row.approved_by} />,
      minWidth: 200,
      flex: 1,
    },

    {
      headerName: "Po Reg. Date",
      field: "po_reg_date",
      renderCell: ({ row }) => <ToolTipEllipses text={row.po_reg_date} />,
      flex: 1,
      minWidth: 150,
    },
    {
      headerName: "Created By",
      field: "po_reg_by",
      renderCell: ({ row }) => <ToolTipEllipses text={row.po_reg_by} />,
      flex: 1,
      minWidth: 150,
    },
    {
      headerName: "Approval Status",
      field: "approval_status",
      renderCell: ({ row }) => <ToolTipEllipses text={row.approval_status} />,
      flex: 1,
      minWidth: 150,
    },
    {
      headerName: "Advance Payment",
      field: "advPayment",
      renderCell: ({ row }) => (
        <ToolTipEllipses text={row.advPayment == "0" ? "NO" : "YES"} />
      ),
      flex: 1,
      minWidth: 150,
    },
    {
      headerName: "Comment",
      field: "po_comment",
      renderCell: ({ row }) => <ToolTipEllipses text={row.po_comment} />,
      flex: 1,
      minWidth: 150,
    },
  ];

  const handleClosePO = async (poid) => {
    setLoading(true);
    const response = await imsAxios.post("/purchaseOrder/fetchStatus4PO", {
      purchaseOrder: poid,
    });
    setLoading(false);
    if (response.success) {
      setShowClosePO(poid);
    } else {
      showToast(response.message, "error");
    }
  };

  const getSearchResults = async (silent = false) => {
  
      if (!silent) {
        showToast("Please select start and end dates for the results", "error");
          return;
      }
    
 
    const search = wise === "single_date_wise" ? searchDateRange : searchInput.trim();

    setRows([]);
    setSearchLoading(true);
    try {
      const response = await imsAxios.post("/purchaseOrder/requested", {
        data: search,
        wise: wise,
      });
      setSearchLoading(false);
      if (response.success) {
        let arr = response.data?.map((row, index) => ({
          ...row,
          id: row.po_transaction,
          index: index + 1,
        }));
        setRows(arr);
      } else if (response.message) {
        if (!silent) {
          showToast(response.message, "error");
        }
        else{
          showToast(response.message, "error");
        }
      } 
    } catch (error) {
      setSearchLoading(false);
      showToast("Error fetching PO list", "error");
    }
  };

  //getting component view data - now opens ViewPORequest modal
  const getComponentData = async (poid) => {
    setViewPoId(poid);
  };

  const getPoDetail = async (poid) => {
    setLoading(true);
    const response = await imsAxios.post("/purchaseOrder/fetchData4Update", {
      pono: poid.replaceAll("_", "/"),
    });
    setLoading(false);
    if (response.success) {
      setUpdatePoId({
        ...response.data.bill,
        materials: response.data.materials,
        ...response.data.ship,
        ...response.data.vendor[0],
      });
    } else {
      showToast(response.message, "error");
    }
  };

  return (
    <div className="manage-po" style={{ position: "relative", height: "calc(100vh - 135px)", margin: "10px" }}>
      <Row
        justify="space-between"
     
      >
        <Col>
          <Space>
            <div style={{ width: 150 }}>
              <MySelect options={wiseOptions} onChange={setWise} value={wise} />
            </div>
            <div style={{ width: 300 }}>
               {wise === "single_date_wise" ? (
                  <MyDatePicker
                size="default"
                setDateRange={setSearchDateRange}
                dateRange={searchDateRange}
                value={searchDateRange}
              />
              ) :   (
                <Input
                  style={{ width: "100%" }}
                  type="text"
                  placeholder="Enter Po Number"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                />
              ) }
            
            </div>
            <MyButton
              
              type="primary"
              loading={searchLoading}
              onClick={getSearchResults}
              id="submit"
              variant="search"
            >
              Search
            </MyButton>
          </Space>
        </Col>
        <Col>
          <Space>
            <CommonIcons
              action="downloadButton"
              onClick={() => downloadCSV(rows, columns, "Pending PO Report")}
              disabled={rows.length == 0}
            />
          </Space>
        </Col>
      </Row>

      <div
        style={{
          height: "calc(100% - 40px)",
       marginTop: "10px",
        }}
      >
        <MyDataTable
          loading={loading || searchLoading}
          rows={rows}
          columns={columns}
        />
      </div>
      <ViewPORequest
        poId={viewPoId}
        setPoId={setViewPoId}
        getRows={getSearchResults}
      />
      {updatePoId && (
        <EditPO
          updatePoId={updatePoId}
          setUpdatePoId={setUpdatePoId}
          getRows={getSearchResults}
        />
      )}
      <ViewPOLogs poId={viewPoLogsId} setPoId={setViewPoLogsId} />
      <CancelPO
        variant="close"
        getSearchResults={getSearchResults}
        setShowCancelPO={setShowClosePO}
        showCancelPO={showClosePO}
        setRows={setRows}
        rows={rows}
      />
    </div>
  );
};

export default RequestPo;
