import  { useState, useEffect } from "react";
import MyDatePicker from "../../../Components/MyDatePicker";
import { useToast } from "../../../hooks/useToast.js";
import { BsDownload, BsEyeFill } from "react-icons/bs";
import MyDataTable from "../../../Components/MyDataTable";
import ViewContraDetail from "./ViewContraDetail";
import { AiFillPrinter } from "react-icons/ai";
import printFunction, {
  downloadFunction,
} from "../../../Components/printFunction";
import MySelect from "../../../Components/MySelect";
import { Button, Input, Row, Space } from "antd";
import { GridActionsCellItem } from "@mui/x-data-grid";
import { v4 } from "uuid";
import { DownloadOutlined } from "@ant-design/icons";
import { downloadCSV } from "../../../Components/exportToCSV";
import { imsAxios } from "../../../axiosInterceptor";
import MyAsyncSelect from "../../../Components/MyAsyncSelect";
import TableActions from "../../../Components/TableActions.jsx/TableActions";
import ContraEdit from "./ContraEdit";
import MyButton from "../../../Components/MyButton";

export default function ContraReport() {
  const { showToast } = useToast();
  const [wise, setWise] = useState("date");
  const [searchDateRange, setSearchDateRange] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [contraId, setContraId] = useState(null);
  // const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [asyncOptions, setAsyncOptions] = useState([]);
  const [selectLoading, setSelectLoading] = useState(false);
  const [editingContra, setEditingContra] = useState(null);

  const wiseOptions = [
    { text: "Created Date Wise", value: "date" },
    { text: "Contra ID Wise", value: "number" },
    { text: "Effective Date Wise", value: "effective" },
    { text: "Ledger Wise", value: "ledger" },
  ];
  const getRows = async () => {
    let d;
    if (wise == "date") {
      if (searchDateRange) {
        d = searchDateRange;
      } else {
        showToast("Please select a time period", "error");
      }
    } else if (wise == "number") {
      if (searchInput) {
        d = searchInput?.trim();
      } else {
        showToast("Please Enter a Contra ID", "error");
      }
    } else if (wise == "ledger") {
      if (searchInput) {
        d = searchInput?.trim();
      } else {
        showToast("Please Enter a Contra ID", "error");
      }
    } else if (wise == "effective") {
      if (searchDateRange) {
        d = searchDateRange;
      } else {
        showToast("Please select a time period", "error");
      }
    }

    setLoading(true);
    const response = await imsAxios.post("/tally/contra/contra_report_list", {
      wise: wise,
      data: d,
    });
    setLoading(false);
    if (response.success) {
      const arr = response.data.map((row, index) => {
        return {
          ...row,
          id: v4(),
          index: index + 1,
          status: row.status == "D" ? "Deleted" : "--",
        };
      });
      setRows(arr);
    } else {
      showToast(response.message?.msg || response.message, "error");
      setRows([]);
    }
    setLoading(false);
  };
  const printFun = async (id) => {
    setLoading(true);
    const response = await imsAxios.post("/tally/contra/contra_print", {
      code: id,
    });
    printFunction(response?.data?.buffer?.data);
    setLoading(false);
  };
  const handleDownload = async (id) => {
    setLoading(true);
    let link = "/tally/contra/contra_print";
    let filename = "Contra Transaction " + id;

    const response = await imsAxios.post(link, {
      code: id,
    });
    downloadFunction(response?.data?.buffer?.data, filename);
    setLoading(false);
  };
  // const deleteFun = async () => {
  //   setLoading(true);
  //   if (deleteConfirm) {
  //     const response = await imsAxios.post("/tally/contra/contra_delete", {
  //       contra_code: deleteConfirm,
  //     });
  //     setLoading(false);
  //     if (response.success) {
  //       setDeleteConfirm(null);
  //       showToast(response.message, "success");
  //       getRows();
  //     } else {
  //       showToast(response.message?.msg || response.message, "error");
  //     }
  //   }
  // };
  const getLedger = async (search) => {
    setSelectLoading(true);
    const response = await imsAxios.post("/tally/contra/bank_cash_ledgers", {
      search: search,
    });
    setSelectLoading(false);
    let arr = [];
    if (response.success) {
      arr = response.data.map((row) => {
        return { text: row.text, value: row.id };
      });
      setAsyncOptions(arr);
    } else {
      arr = [];
    }
    setAsyncOptions(arr);
  };
  const columns = [
    {
      headerName: "Serial No.",
      field: "index",
      flex: 1,
    },
    {
      headerName: "Contra ID",
      field: "contra_number",
      flex: 1,
    },
    {
      headerName: "Created Date",
      field: "create_date",
      flex: 1,
    },
    {
      headerName: "Reference Date",
      field: "ref_date",
      flex: 1,
    },
    {
      headerName: "Amount",
      field: "ammount",
      flex: 1,
    },
    {
      headerName: "Status",
      field: "status",
      renderCell: ({ row }) => (
        <span style={{ color: row.status == "Deleted" && "red" }}>
          {row.status}
        </span>
      ),
      // width: "16vw",
      sortable: false,
      flex: 1,
    },
    {
      headerName: "Action",
      field: "action",
      type: "actions",
      flex: 1,
      getActions: ({ row }) => [
        <GridActionsCellItem
        key={row.id ?? "view"}
          disabled={loading}
          icon={<BsEyeFill className="view-icon" />}
          onClick={() => {
            setContraId(row.contra_number);
          }}
          label="Delete"
        />,
        <GridActionsCellItem
        key={row.id ?? "print"}
          disabled={loading}
          icon={<AiFillPrinter className="view-icon" />}
          onClick={() => {
            printFun(row.contra_number);
          }}
          label="Delete"
        />,
        <GridActionsCellItem
        key={row.id ?? "download"}
          disabled={loading}
          icon={<BsDownload className="view-icon" />}
          onClick={() => {
            handleDownload(row.contra_number);
          }}
          label="Delete"
        />,

        <TableActions
          key={row.id ?? "edit"}
          action="edit"
          disabled={loading}
          onClick={() => {
            setEditingContra(row.contra_number);
          }}
        />,
        // <GridActionsCellItem
        //   disabled={row.status == "Deleted"}
        //   icon={
        //     <Popconfirm
        //       title="Are you sure to delete this Transaction?"
        //       onConfirm={deleteFun}
        //       onCancel={() => {
        //         setDeleteConfirm(null);
        //       }}
        //       okText="Yes"
        //       cancelText="No"
        //     >
        //       <AiFillDelete
        //         style={{ marginTop: -5 }}
        //         className={`view-icon ${row.status == "Deleted" && "disable"}`}
        //       />{" "}
        //     </Popconfirm>
        //   }
        //   onClick={() => {
        //     setDeleteConfirm(row.contra_number);
        //   }}
        //   label="Delete"
        // />,
      ],
    },
  ];
  useEffect(() => {
    setSearchInput("");
  }, [wise]);
  return (
    <div style={{ position: "relative", height: "100%", padding: 10 }}>
      <ViewContraDetail contraId={contraId} setContraId={setContraId} />
      <ContraEdit contra={editingContra} close={() => setEditingContra(null)} />
      <Row justify="space-between">
        <div>
          <Space>
            <div style={{ width: 250 }}>
              <MySelect options={wiseOptions} onChange={setWise} value={wise} />
            </div>
            <div style={{ width: 300 }}>
              {wise === "date" ? (
                <MyDatePicker
                  size="default"
                  setDateRange={setSearchDateRange}
                  dateRange={searchDateRange}
                  value={searchDateRange}
                />
              ) : wise === "number" ? (
                <Input
                  size="default"
                  type="text"
                  // className="form-control w-100 "
                  placeholder="Enter Conttra Number"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                />
              ) : wise === "effective" ? (
                <MyDatePicker
                  size="default"
                  setDateRange={setSearchDateRange}
                  dateRange={searchDateRange}
                  value={searchDateRange}
                />
              ) : (
                wise === "ledger" && (
                  <MyAsyncSelect
                    selectLoading={selectLoading}
                    onBlur={() => setAsyncOptions([])}
                    value={searchInput}
                    onChange={setSearchInput}
                    optionsState={asyncOptions}
                    loadOptions={getLedger}
                  />
                )
              )}
            </div>
            <MyButton
              disabled={
                wise === "date" || wise === "effective"
                  ? searchDateRange === ""
                    ? true
                    : false
                  : !searchInput
                    ? true
                    : false
              }
              type="primary"
              onClick={getRows}
              variant="search"
              loading={loading}
            >
              Search
            </MyButton>
          </Space>
        </div>
        <Space>
          <Button
            type="primary"
            onClick={() => downloadCSV(rows, columns, "Contra Report")}
            shape="circle"
            icon={<DownloadOutlined />}
            disabled={rows.length == 0}
          />
        </Space>
      </Row>
      <div className="" style={{ height: "calc(100% - 50px)", marginTop: 10 }}>
        <MyDataTable
          loading={loading}
          pagination={true}
          headText="center"
          columns={columns}
          data={rows}
        />
      </div>
    </div>
  );
}
