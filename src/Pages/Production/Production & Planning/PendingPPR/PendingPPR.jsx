import { useState, useEffect } from "react";
import { useToast } from "../../../../hooks/useToast.js";
import { Button, Input, Row, Space } from "antd";
import MySelect from "../../../../Components/MySelect";
import MyDatePicker from "../../../../Components/MyDatePicker";
import { v4 } from "uuid";
import MyDataTable from "../../../../Components/MyDataTable";
import ClosePPR from "./ClosePPR";
import EditPPR from "./EditPPR";
import { downloadCSV } from "../../../../Components/exportToCSV";
import TableActions, {
  CommonIcons,
} from "../../../../Components/TableActions.jsx/TableActions";
import MyAsyncSelect from "../../../../Components/MyAsyncSelect";
import ToolTipEllipses from "../../../../Components/ToolTipEllipses";
import { imsAxios } from "../../../../axiosInterceptor";
import ExecutePPR from "./ExecutePPR";
import ViewComponents from "./ViewComponents";
import MyButton from "../../../../Components/MyButton";

const PendingPPR = () => {
  const { showToast } = useToast();
  const [cancelPPR, setsCancelPPR] = useState(null);
  const [executePPR, setExcecutePPR] = useState(null);
  const [editPPR, setEditPPR] = useState(null);
  const [viewComponents, setViewComponents] = useState(null);
  const [selectLoading, setSelectLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const [rows, setRows] = useState([]);
  const [wise, setWise] = useState("pprno");
  const [asyncOptions, setAsyncOptions] = useState([]);
  const pprWiseOptions = [
    { text: "New", value: "new" },
    { text: "Repair", value: "repair" },
    { text: "Testing", value: "testing" },
    { text: "Packing", value: "packing" },
  ];

  const wiseOptions = [
    { text: "PPR No.", value: "pprno" },
    { text: "Date Wise", value: "datewise" },
    { text: "Product Wise", value: "skuwise" },
    { text: "PPR Status", value: "pprtype" },
  ];

  const getProducts = async (e) => {
    if (e?.length > 2) {
      setSelectLoading(true);
      const response = await imsAxios.post("/backend/fetchAllProduct", {
        searchTerm: e,
      });

      if (response?.success) {
      
        let arr = [];
        arr = response.data.map((d) => {
          return { text: d.text, value: d.id };
        });
          setSelectLoading(true);
        setAsyncOptions(arr);
      } else {
        setAsyncOptions([]);
        setSelectLoading(false);
        showToast(response.message, "error");
      }
    }
  };

  const getRows = async () => {
    setSearchLoading(true);
    if (searchInput != "") {
      const response = await imsAxios.post("/ppr/fetchPendingPpr", {
        searchBy: wise,
        searchValue: searchInput.value ?? searchInput,
      });

      setSearchLoading(false);
      if (response.success) {
        const arr = response.data.map((row, index) => {
          return {
            ...row,
            id: v4(),
            serial_no: index + 1,
          };
        });
        setRows(arr);
      } else if (!response.success) {
        showToast(response.message?.msg || response.message, "error");
        setRows([]);
      }
    }
  };

  const columns = [
    {
      headerName: "",
      field: "action",
      type: "actions",
      width: 30,
      getActions: ({ row }) => [
        // execute ppr
        <TableActions
          showInMenu={true}
          action="check"
          onClick={() => {
            setExcecutePPR(row);
          }}
          label="Execute PPR"
        />,
        // close ppr
        <TableActions
          showInMenu={true}
          action="cancel"
          onClick={() => {
            setsCancelPPR(row);
          }}
          label="Cancel PPR"
        />,
        // edit ppr
        <TableActions
          showInMenu={true}
          action="edit"
          // disabled={!row.rqd_status}
          label="Edit PPR"
          onClick={() => {
            setEditPPR({
              ppr: row.prod_transaction,
              skucode: row.prod_product_sku,
            });
          }}
        />,
        // view component list
        <TableActions
          showInMenu={true}
          action="view"
          disabled={!row.rqd_status}
          label="View Components"
          onClick={() => {
            setViewComponents({
              ppr: row.prod_transaction,
              sku: row.prod_product_sku,
              server: row?.rqd_status[0]?.server,
              client: row?.rqd_status[0]?.client,
              project: row.prod_project,
              product: row.prod_name,
              executedQty: row.totalConsumption,
              plannedQty: row.prod_planned_qty,
              remainingQty: row.consumptionRemaining,
            });
          }}
        />,
      ],
    },
    { headerName: "#", width: 30, field: "serial_no" },
    {
      headerName: "PPR No.",
      minWidth: 160,
      field: "prod_transaction",
      renderCell: ({ row }) => (
        <ToolTipEllipses text={row.prod_transaction} copy={true} />
      ),
    },
    { headerName: "Type", width: 100, field: "prod_type" },
    {
      headerName: "Project",
      width: 150,
      field: "prod_project",
      renderCell: ({ row }) => <ToolTipEllipses text={row.prod_project} />,
    },
    {
      headerName: "Customer",
      width: 120,
      field: "prod_customer",
      renderCell: ({ row }) => <ToolTipEllipses text={row.prod_customer} />,
    },
    {
      headerName: "Create By",
      width: 150,
      field: "prod_insert_by",
      renderCell: ({ row }) => <ToolTipEllipses text={row.prod_insert_by} />,
    },
    {
      headerName: "Req Data/Time",
      width: 150,
      field: "prod_insert_dt",
      renderCell: ({ row }) => <ToolTipEllipses text={row.prod_insert_dt} />,
    },
    {
      headerName: "Product SKU",
      width: 120,
      field: "prod_product_sku",
    },
    {
      headerName: "Product Name",
      minWidth: 150,
      flex: 1,
      field: "prod_name",
      renderCell: ({ row }) => <ToolTipEllipses text={row.prod_name} />,
    },
    {
      headerName: "Planned Qty",
      width: 100,
      field: "prod_planned_qty",
    },
    { headerName: "Due Date", width: 120, field: "prod_due_date" },
    { headerName: "Exceuted Qty", width: 100, field: "totalConsumption" },
    { headerName: "Qty Remaining", width: 120, field: "consumptionRemaining" },
  ];
  const columnsdownld = [
    // { headerName: "#", width: 30, field: "serial_no" },
    {
      headerName: "Req No.",
      minWidth: 160,
      field: "prod_transaction",
      renderCell: ({ row }) => (
        <ToolTipEllipses text={row.prod_transaction} copy={true} />
      ),
    },
    { headerName: "Type", width: 100, field: "prod_type" },
    {
      headerName: "Project",
      width: 150,
      field: "prod_project",
      renderCell: ({ row }) => <ToolTipEllipses text={row.prod_project} />,
    },
    {
      headerName: "Customer",
      width: 120,
      field: "prod_customer",
      renderCell: ({ row }) => <ToolTipEllipses text={row.prod_customer} />,
    },
    {
      headerName: "Create By",
      width: 150,
      field: "prod_insert_by",
      renderCell: ({ row }) => <ToolTipEllipses text={row.prod_insert_by} />,
    },
    {
      headerName: "Req Data/Time",
      width: 150,
      field: "prod_insert_dt",
      renderCell: ({ row }) => <ToolTipEllipses text={row.prod_insert_dt} />,
    },
    {
      headerName: "Product SKU",
      width: 120,
      field: "prod_product_sku",
    },
    {
      headerName: "Product Name",
      minWidth: 150,
      flex: 1,
      field: "prod_name",
      renderCell: ({ row }) => <ToolTipEllipses text={row.prod_name} />,
    },
    {
      headerName: "Planned Qty",
      width: 100,
      field: "prod_planned_qty",
    },
    { headerName: "Due Date", width: 120, field: "prod_due_date" },
    { headerName: "Exceuted Qty", width: 100, field: "totalConsumption" },
    { headerName: "Qty Remaining", width: 120, field: "consumptionRemaining" },
  ];
  useEffect(() => {
    if (wise == "pprtype") {
      setSearchInput("new");
    } else {
      setSearchInput("");
    }
  }, [wise]);
  return (
    <div style={{ height: "100%", padding: 10 }}>
      <ClosePPR
        setsCancelPPR={setsCancelPPR}
        cancelPPR={cancelPPR}
        getRows={getRows}
      />
      <ExecutePPR
        getRows={getRows}
        editPPR={executePPR}
        setEditPPR={setExcecutePPR}
      />
      <EditPPR editPPR={editPPR} setEditPPR={setEditPPR} />
      <ViewComponents
        viewComponents={viewComponents}
        setViewComponents={setViewComponents}
      />
      <Row justify="space-between">
        <div>
          <Space>
            <div style={{ width: 200 }}>
              <MySelect options={wiseOptions} onChange={setWise} value={wise} />
            </div>
            <div style={{ width: 300 }}>
              {wise === "datewise" ? (
                <MyDatePicker
                  size="default"
                  setDateRange={setSearchInput}
                  value={searchInput}
                />
              ) : wise == "skuwise" ? (
                <MyAsyncSelect
                  selectLoading={selectLoading}
                  onBlur={() => setAsyncOptions([])}
                  value={searchInput}
                  onChange={(value) => setSearchInput(value)}
                  loadOptions={getProducts}
                  optionsState={asyncOptions}
                  placeholder="Select Product..."
                />
              ) : wise == "pprtype" ? (
                <MySelect
                  options={pprWiseOptions}
                  value={searchInput}
                  labelInValue
                  onChange={(value) => setSearchInput(value)}
                />
              ) : (
                wise == "pprno" && (
                  <Input
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                  />
                )
              )}
            </div>
            <MyButton
              variant="search"
              disabled={!searchInput ? true : false}
              type="primary"
              loading={searchLoading}
              onClick={getRows}
              id="submit"
            >
              Search
            </MyButton>
          </Space>
        </div>
        <Space>
          <CommonIcons
            action="downloadButton"
            onClick={() =>
              downloadCSV(rows, columnsdownld, "Pending PPR Report")
            }
            disabled={rows.length == 0}
          />
        </Space>
      </Row>
      <div style={{ height: "calc(100% - 40px)", marginTop: 10 }}>
        <MyDataTable columns={columns} data={rows} loading={searchLoading} />
      </div>
    </div>
  );
};

export default PendingPPR;
