import { useState } from "react";
import {  Col, Input, Row, Space } from "antd";
import MyDatePicker from "../../../Components/MyDatePicker";
import { useToast } from "../../../hooks/useToast.js";
import printFunction, {
  downloadFunction,
} from "../../../Components/printFunction";
import ViewComponentSideBar from "./Sidebars/ViewComponentSideBar";
import EditPO from "./EditPO/EditPO";
import MateirialInward from "./MaterialIn/MateirialInward";
import CancelPO from "./Sidebars/CancelPO";
import MyDataTable from "../../../Components/MyDataTable";
import MySelect from "../../../Components/MySelect";
import MyAsyncSelect from "../../../Components/MyAsyncSelect";
import UploadDoc from "./UploadDoc";
import { downloadCSV } from "../../../Components/exportToCSV";
import {
  CommonIcons,
} from "../../../Components/TableActions.jsx/TableActions";
import ToolTipEllipses from "../../../Components/ToolTipEllipses";
import { imsAxios } from "../../../axiosInterceptor";
import { GridActionsCellItem } from "@mui/x-data-grid";
import useApi from "../../../hooks/useApi.ts";
import { getVendorOptions } from "../../../api/general.ts";
import { convertSelectOptions } from "../../../utils/general.ts";
import MyButton from "../../../Components/MyButton";

const ManagePO = () => {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  // const [selectLoading, setSelectLoading] = useState(false);
  const [viewLoading, setViewLoading] = useState(false);
  const [asyncOptions, setAsyncOptions] = useState([]);
  const [showViewSidebar, setShowViewSideBar] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const [componentData, setComponentData] = useState(null);
  const [wise, setWise] = useState("po_wise");
  const [rows, setRows] = useState([]);
  const [updatePoId, setUpdatePoId] = useState(null);
  const [materialInward, setMaterialInward] = useState(null);
  const [searchDateRange, setSearchDateRange] = useState("");
  const [showUploadDocModal2, setShowUploadDocModal2] = useState(null);
  const [showCancelPO, setShowCancelPO] = useState(null);
  const [newPoLogs, setnewPoLogs] = useState([]);
  const { executeFun, loading: loading1 } = useApi();
  const wiseOptions = [
    { value: "single_date_wise", text: "Date Wise" },
    { value: "po_wise", text: "PO ID Wise" },
    { value: "vendor_wise", text: "Vendor Wise" },
    {value: "requestPo", text:"Requested PR"},
  ];
  const printFun = async (poid) => {
    setLoading(true);
    const response = await imsAxios.post("/poPrint", {
      poid: poid,
    });

    if (response.success) {
      printFunction(response.data.buffer.data);
    } else {
      showToast(response.message, "error");
    }
    setLoading(false);
  };

  const handleCancelPO = async (poid) => {
    setLoading(true);
    const response = await imsAxios.post("/purchaseOrder/fetchStatus4PO", {
      purchaseOrder: poid,
    });
    setLoading(false);
    if (response.success) {
      setShowCancelPO(poid);
    } else {
      showToast("PO is already cancelled", "error");
    }
  };
  const handleDownload = async (poid) => {
    setLoading(true);
    const response = await imsAxios.post("/poPrint", {
      poid: poid,
    });
    setLoading(false);
    if (response.success) {
      let filename = `PO ${poid}`;
      downloadFunction(response.data.buffer.data, filename);
    } else {
      showToast(response.message, "error");
    }
  };

  const columns = [
    {
      field: "actions",
      headerName: "",
      type: "actions",
      width: 30,
      getActions: ({ row }) => [
        // Edit icon
        <GridActionsCellItem
        key={"edit"}
          showInMenu
          // disabled={disabled}
          label={"Edit"}
          onClick={() => getPoDetail(row.po_transaction)}
        />,
        // VIEW Icon
        <GridActionsCellItem
        key={"view"}
          showInMenu
          // disabled={disabled}
          label="View"
          onClick={() => getComponentData(row.po_transaction, row.po_status)}
        />,

        // Download icon
        <GridActionsCellItem
          key={"download"}
          showInMenu
          // disabled={disabled}
          label="Download"
          disabled={row.approval_status === "P"}
          onClick={() => handleDownload(row.po_transaction)}
        />,

        // Print Icon
        <GridActionsCellItem
          key={"print"}
          showInMenu
          // disabled={disabled}
          label="Print"
          disabled={row.approval_status === "PENDING"}
          onClick={() => printFun(row.po_transaction)}
        />,

        // Close PO icon
        <GridActionsCellItem
          key={"close"}
          showInMenu
          // disabled={disabled}
          label="Cancel"
          // disabled={row.approval_status == "C"}
          onClick={() => handleCancelPO(row.po_transaction)}
        />,

        // Upload DOC Icon
        <GridActionsCellItem
          key={"upload"}
          onClick={() => setShowUploadDocModal2(row.po_transaction)}
          showInMenu
          // disabled={disabled}
          label="Upload FIle"
          // disabled={row.approval_status == "C"}
        />,
      ],
    },
    {
      headerName: "#.",
      field: "index",
      width: 30,
    },
    {
      headerName: "PO ID",
      field: "po_transaction",
      renderCell: ({ row }) => (
        <ToolTipEllipses text={row.po_transaction} copy={true} />
      ),
      width: 150,
    },
    {
      headerName: "Cost Center",
      field: "cost_center",
      renderCell: ({ row }) => <ToolTipEllipses text={row.cost_center} />,
      flex: 1,
      minWidth: 150,
    },
    {
      headerName:"PO ACCEPTANCE",
      field:"poacceptstatus",
      renderCell:({row})=>(
        <ToolTipEllipses text={row.poacceptstatus} />
      ),
      flex:1,
      minWidth:150
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
  //getting rows from database from all 3 filter po wise, data wise, vendor wise
  const getSearchResults = async () => {
    setRows([]);
    let search;
    if (wise == "single_date_wise") {
      search = searchDateRange;
    } else {
      search = null;
    }
    if (searchInput || search) {
      setSearchLoading(true);
      const response = await imsAxios.post(
        "/purchaseOrder/fetchPendingData4PO",
        {
          data:
            wise == "vendor_wise"
              ? searchInput
              : wise == "po_wise"
              ? searchInput.trim()
              : wise == "single_date_wise" && searchDateRange,
          wise: wise,
        }
      );
    
      if (response.success) {
          setSearchLoading(false);
        let arr = response?.data?.map((row, index) => ({
          ...row,
          id: row.po_transaction,
          index: index + 1,
        }));
        setRows(arr);
      } else {
         setSearchLoading(false);
        showToast(response.message, "error");
      }
    } else {
      if (wise == "single_date_wise" && searchDateRange == null) {
         setSearchLoading(false);
        showToast("Please select start and end dates for the results", "error");
      } else if (wise == "po_wise") {
         setSearchLoading(false);
        showToast("Please enter a PO id", "error");
      } else if (wise == "vendor_wise") {
         setSearchLoading(false);
        showToast("Please select a vendor", "error");
      }
    }
  };
  //getting vendors list for filter by vendors
  const getVendors = async (search) => {
    if (search?.length > 2) {
      const response = await executeFun(
        () => getVendorOptions(search),
        "select"
      );
      let arr = [];
      if (response.success) {
        arr = convertSelectOptions(response.data);
      }
      setAsyncOptions(arr);
    }
  };
  //getting component view data
  const getComponentData = async (poid, status) => {
    setViewLoading(true);
    const response = await imsAxios.post(
      "/purchaseOrder/fetchComponentList4PO",
      {
        poid,
      }
    );
    setViewLoading(false);
    if (response.success) {
      const arr = response.data.map((row, index) => {
        return {
          ...row,
          id: index,
        };
      });
      setComponentData({ poid: poid, components: arr, status: status });

      setShowViewSideBar(true);
      getPoLogs(poid);
    } else {
      showToast(response.message, "error");
    }
  };

  const getPoLogs = async (po_id) => {
    const response = await imsAxios.post("/purchaseOthers/pologs", {
      po_id,
    });
    if (response.success) {
      let arr = response.data;
      setnewPoLogs(arr.reverse());
      // console.logg("data for po logs", arr);
    }
  };
  const getPoDetail = async (poid) => {
    setLoading(true);
    const response = await imsAxios
      .post("/purchaseOrder/fetchData4Update", {
        pono: poid.replaceAll("_", "/"),
      })
      .then((res) => {
        if (!res.success) {
          showToast(res.message, "error");
          setLoading(false);
        } else {
          return res;
        }
      });
    setLoading(false);
    if (response?.success) {
      setUpdatePoId({
        ...response.data.bill,
        materials: response.data.materials,
        ...response.data.ship,
        ...response.data.vendor[0],
      });
    } else {
        setLoading(false);
      showToast(response?.message, "error");
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
              ) : wise === "po_wise" ? (
                <Input
                  style={{ width: "100%" }}
                  type="text"
                  placeholder="Enter Po Number"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                />
              ) : (
                wise === "vendor_wise" && (
                  <MyAsyncSelect
                    size="default"
                    selectLoading={loading1("select")}
                    onBlur={() => setAsyncOptions([])}
                    value={searchInput}
                    onChange={(value) => setSearchInput(value)}
                    loadOptions={getVendors}
                    optionsState={asyncOptions}
                    placeholder="Select Vendor..."
                  />
                )
              )}
            </div>
            <MyButton
              disabled={
                wise === "single_date_wise"
                  ? searchDateRange === ""
                    ? true
                    : false
                  : !searchInput
                  ? true
                  : false
              }
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
      <UploadDoc
        setShowUploadDocModal2={setShowUploadDocModal2}
        showUploadDocModal2={showUploadDocModal2}
      />
      <CancelPO
        getSearchResults={getSearchResults}
        setShowCancelPO={setShowCancelPO}
        showCancelPO={showCancelPO}
        setRows={setRows}
        rows={rows}
      />

      {updatePoId && (
        <EditPO updatePoId={updatePoId} setUpdatePoId={setUpdatePoId} />
      )}
      <MateirialInward
        materialInward={materialInward}
        setMaterialInward={setMaterialInward}
        asyncOptions={asyncOptions}
        setAsyncOptions={setAsyncOptions}
      />
      <div
       style={{
          height: "calc(100% - 45px)",
          marginTop: "10px",
      }}
      >
        <MyDataTable
          loading={loading || viewLoading || searchLoading}
          rows={rows}
          columns={columns}
        />
      </div>
      <ViewComponentSideBar
        getPoLogs={getPoLogs}
        newPoLogs={newPoLogs}
        setnewPoLogs={setnewPoLogs}
        setShowViewSideBar={setShowViewSideBar}
        showViewSidebar={showViewSidebar}
        componentData={componentData}
      />
    </div>
  );
};

export default ManagePO;