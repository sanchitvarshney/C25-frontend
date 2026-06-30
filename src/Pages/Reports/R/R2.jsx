import { useEffect, useState } from "react";
import { Col, Row, Space } from "antd";
import { downloadCSV } from "../../../Components/exportToCSV";
import MyDataTable from "../../../Components/MyDataTable";
import { v4 } from "uuid";
import MyAsyncSelect from "../../../Components/MyAsyncSelect";
import MySelect from "../../../Components/MySelect";
import MyDatePicker from "../../../Components/MyDatePicker";
import { imsAxios } from "../../../axiosInterceptor";
import { CommonIcons } from "../../../Components/TableActions.jsx/TableActions";
import ToolTipEllipses from "../../../Components/ToolTipEllipses";
import useApi from "../../../hooks/useApi.ts";
import { getProjectOptions } from "../../../api/general.ts";
import MyButton from "../../../Components/MyButton";
import { useToast } from "../../../hooks/useToast.js";

const R2 = () => {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState([]);
  const [asyncOptions, setAsyncOptions] = useState([]);
  const [wise, setWise] = useState("A");
  const [type, setType] = useState("PO");
  const [searchTerm, setSearchTerm] = useState("");

  const { executeFun, loading: loading1 } = useApi();
  const options = [
    { text: "All", value: "A" },
    { text: "Pending", value: "P" },
    { text: "Project", value: "PROJECT" },
    { text: "Requested By", value: "by" },
  ];
  const optionsJW = [
    { text: "All", value: "A" },
    // { text: "Pending", value: "P" },
    // { text: "Project", value: "PROJECT" },
  ];
  const typeoptions = [
    { text: "PO", value: "PO" },
    { text: "JW", value: "JW" },
  ];

  const columns = [
    { field: "i", headerName: "Sr. No.", width: 8 },
    {
      field: "reg_date",
      headerName: "Po Date",
      width: 100,
    },
    {
      field: "reg_by",
      headerName: "Create By",
      width: 130,
    },
    {
      field: "po_raise_by",
      headerName: "Requested By",
      width: 130,
    },
    {
      field: "po_approve_by",
      headerName: "Approved By",
      width: 130,
    },
    {
      field: "po_order_id",
      headerName: "Po Order Id",
      width: 120,
    },
    { field: "part_no", headerName: "Part", width: 100 },
    { field: "new_partno", headerName: "Cat Part Code", width: 150 },
    {
      field: "component_name",
      headerName: "Component",
      width: 350,
    },
    { field: "unit_name", headerName: "UoM", width: 80 },
    { field: "po_rate", headerName: "Rate", width: 100 },
    {
      field: "ordered_qty",
      headerName: "Order Qty",
      width: 120,
    },
    {
      field: "ordered_pending",
      headerName: "Pending Qty",
      width: 150,
    },
    {
      field: "ordered_inward",
      headerName: "Inward Qty",
      width: 150,
    },
    {
      field: "vendor_code",
      headerName: "Vendor Code",
      width: 100,
    },
    {
      field: "vendor_name",
      headerName: "Vendor Name",
      width: 280,
    },
    {
      field: "due_date",
      headerName: "Due Date",
      width: 100,
    },
    {
      field: "po_cost_center",
      headerName: "Cost Center",
      width: 150,
    },
    {
      field: "po_project",
      headerName: "Project Name",
      width: 120,
    },
    {
      field: "branch",
      headerName: "Branch-In",
      width: 120,
    },
    {
      field: "po_remark",
      headerName: "Remark",
      width: 120,
    },
    {
      field: "po_status",
      renderCell: ({ row }) => (
        <ToolTipEllipses text={row.po_status ? "Active" : "Closed"} />
      ),
      headerName: "Status",
      width: 100,
    },
  ];
  const columnsJW = [
    { field: "i", headerName: "Sr. No.", width: 8 },
    {
      field: "reg_date",
      headerName: "Po Date",
      width: 100,
    },
    {
      field: "reg_by",
      headerName: "Create By",
      width: 130,
    },

    {
      field: "po_order_id",
      headerName: "Po Order Id",
      width: 120,
    },
    { field: "part_no", headerName: "Part", width: 100 },
    { field: "new_partno", headerName: "Cat Part Code", width: 150 },
    {
      field: "component_name",
      headerName: "Component",
      width: 350,
    },
    { field: "unit_name", headerName: "UoM", width: 80 },
    { field: "po_rate", headerName: "Rate", width: 100 },
    {
      field: "ordered_qty",
      headerName: "Order Qty",
      width: 120,
    },
    {
      field: "ordered_pending",
      headerName: "Pending Qty",
      width: 150,
    },

    {
      field: "vendor_code",
      headerName: "Vendor Code",
      width: 100,
    },
    {
      field: "vendor_name",
      headerName: "Vendor Name",
      width: 280,
    },
    {
      field: "due_date",
      headerName: "Due Date",
      width: 100,
    },
    {
      field: "po_cost_center",
      headerName: "Cost Center",
      width: 150,
    },
    {
      field: "po_project",
      headerName: "Project Name",
      width: 120,
    },
    {
      field: "po_remark",
      headerName: "Remark",
      width: 130,
    },
    {
      field: "branch",
      headerName: "Branch-In",
      width: 120,
    },
    {
      field: "po_status",
      renderCell: ({ row }) => (
        <ToolTipEllipses text={row.po_status ? "Active" : "Closed"} />
      ),
      headerName: "Status",
      width: 100,
    },
  ];

  const handleDownloadCSV = () => {
    downloadCSV(rows, columns, "PO Report");
  };

  const fetch = async () => {
    setRows([]);
    setLoading(true);
    let response;
    if (type == "JW") {
      response = await imsAxios.get(
        `/JWReport?wise=${wise}&data=${searchTerm}`,
      );
      if (response.success && response?.data?.length > 0) {
        let arr = response.data.map((row, index) => {
          return {
            ...row,
            id: v4(),
            i: index + 1,
          };
        });
        setRows(arr);
        showToast(response.message, "success");
        setLoading(false);
      } else if (!response.success) {
        showToast(response.message, "error");
        setLoading(false);
      }
      setLoading(false);
    } else {
      response = await imsAxios.post("/report2", {
        data: searchTerm,
        wise: wise,
      });

      if (response.success) {
        let arr = response.data.map((row, index) => {
          return {
            ...row,
            id: v4(),
            i: index + 1,
          };
        });
        setRows(arr);
        setLoading(false);
      } else if (!response.success) {
        showToast(response.message, "error");
        setLoading(false);
      }
      setLoading(false);
    }
  };
  const handleFetchProjectOptions = async (search) => {
    const response = await executeFun(
      () => getProjectOptions(search),
      "select",
    );
    setAsyncOptions(response.data);
  };

  const getUsers = async (search) => {
    try {
      setLoading(true);
      const response = await imsAxios.post("/backend/fetchAllUser", {
        search: search,
      });
     if (response.success) {
       setLoading(false);
      let arr = response?.data?.map((row) => ({ text: row.text, value: row.id }));
      setAsyncOptions(arr);
     } else {
       showToast(response.message, "error");
       setLoading(false);
     }
    } catch (e) {
      showToast(e?.message || "Error fetching users", "error");
      setLoading(false);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    setRows([]);
  }, [type]);

  return (
    <div style={{ height: "100%" }}>
      <Row justify="space-between" style={{ padding: "0 5px" }}>
        <Space>
          <div style={{ width: 200 }}>
            <MySelect options={typeoptions} value={type} onChange={setType} />
          </div>
          <div style={{ width: 200 }}>
            <MySelect
              options={type == "JW" ? optionsJW : options}
              value={wise}
              onChange={setWise}
            />
          </div>
          <div style={{ width: 300 }}>
            {wise === "A" || wise === "P" ? (
              <MyDatePicker size="default" setDateRange={setSearchTerm} />
            ) : wise === "PROJECT" ? (
              wise == "PROJECT" && (
                <MyAsyncSelect
                  onBlur={() => setAsyncOptions([])}
                  loadOptions={handleFetchProjectOptions}
                  // value={allData.part}
                  selectLoading={loading1("select")}
                  optionsState={asyncOptions}
                  onChange={setSearchTerm}
                />
              )
            ) : (
              <MyAsyncSelect
                onBlur={() => setAsyncOptions([])}
                loadOptions={getUsers}
                // selectLoading={loading1("select")}
                optionsState={asyncOptions}
                onChange={setSearchTerm}
              />
            )}
          </div>
          <MyButton
            variant="search"
            loading={loading}
            onClick={fetch}
            type="primary"
          >
            Fetch
          </MyButton>
        </Space>

        <Col>
          <CommonIcons
            disabled={rows.length === 0}
            onClick={handleDownloadCSV}
            action={"downloadButton"}
          />
        </Col>
      </Row>

      <div
        className="hide-select"
        style={{ height: "calc(100% - 50px)", margin: "5px", marginBottom: 0 }}
      >
        <MyDataTable
          loading={loading}
          data={rows}
          columns={type == "JW" ? columnsJW : columns}
          checkboxSelection={true}
        />
      </div>
    </div>
  );
};

export default R2;
