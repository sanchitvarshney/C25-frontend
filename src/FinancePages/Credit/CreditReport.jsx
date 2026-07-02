import { useState, useEffect } from "react";
import {
  Button,
  Col,
  Input,
  Row,
  Space,
} from "antd";
import MyDatePicker from "../../../Components/MyDatePicker";
import { imsAxios } from "../../../axiosInterceptor";
import { v4 } from "uuid";
import MyDataTable from "../../../Components/MyDataTable";
import printFunction, {
  downloadFunction,
} from "../../../Components/printFunction";
import {
  CloudDownloadOutlined,
  PrinterFilled,
  EyeFilled,
  EditFilled,
} from "@ant-design/icons";
import { GridActionsCellItem } from "@mui/x-data-grid";
import MySelect from "../../../Components/MySelect";
import ToolTipEllipses from "../../../Components/ToolTipEllipses";
import { CommonIcons } from "../../../Components/TableActions.jsx/TableActions";
import { downloadCSV } from "../../../Components/exportToCSV";
import MyAsyncSelect from "../../../Components/MyAsyncSelect";
import CreditView from "./CreditView";
import CreditEdit from "./CreditEdit";
import { useToast } from "../../hooks/useToast";


function CreditReport() {
const { showToast} =  useToast();
  const wiseOptions = [
    { text: "Date", value: "date_wise" },
    { text: "Effective Wise", value: "eff_wise" },
    { text: "Debit Code", value: "code_wise" },
    { text: "Ledger", value: "vendor_wise" },
  ];
  const [rows, setRows] = useState([]);
  const [wise, setWise] = useState("date_wise");
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewDebitDetail, setViewDebitDetail] =
    useState(null);
  // const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [editDebit, setEditDebit] = useState(null);
  const [selectLoading, setSelectLoading] = useState(false);
  const [asyncOptions, setAsyncOptions] = useState([]);

  const getRows = async () => {
    setRows([]);
    setLoading("fetch");
    const response = await imsAxios.post(
      "/tally/cn/creditVoucherList",
      {
        wise: wise,
        data: searchTerm,
      }
    );
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
      setRows([]);
      showToast(response.message?.msg || response.message, "error");
     
      setLoading(false);
    }
  };

  // const deleteFun = async () => {
  //   setLoading(true);
  //   if (deleteConfirm) {
  //     const response = await imsAxios.post(
  //       "/tally/jv/jv_delete",
  //       {
  //         jv_code: deleteConfirm,
  //       }
  //     );
  //     setLoading(false);
  //     if (response.success) {
  //       setDeleteConfirm(null);
  //       showToast(response.message);
    
  //       getRows();
  //     } else {
  //       showToast(response.message?.msg || response.message, "error");
     
  //     }
  //   }
  // };

  const columns = [
    {
      headerName: "Sr No.",
      field: "index",
      width: 80,
    },
    {
      headerName: "Date",
      field: "ref_date",
    },

    {
      headerName: "Debit Code",
      field: "module_used",
      renderCell: ({ row }) => (
        <ToolTipEllipses
          copy={true}
          text={row.module_used}
        />
      ),
      flex: 1,
    },
    {
      headerName: "Account",
      field: "account",
      renderCell: ({ row }) => (
        <ToolTipEllipses text={row.account} />
      ),
      flex: 1,
    },
    {
      headerName: "Account Code",
      field: "account_code",
      flex: 1,
    },
    {
      headerName: "Credit",
      field: "credit",
      width: 120,
    },
    {
      headerName: "Debit",
      field: "debit",
      width: 120,
    },
    {
      headerName: "Comment",
      renderCell: ({ row }) => (
        <ToolTipEllipses text={row.comment} />
      ),
      field: "comment",
      flex: 1,
    },

    {
      headerName: "Status",
      field: "status",
      renderCell: ({ row }) => (
        <span
          style={{
            color: row.status == "Deleted" && "brown",
          }}
        >
          {row.status}
        </span>
      ),
      width: 120,
    },

    {
      headerName: "Action",
      field: "action",
      type: "actions",
      flex: 1,
      getActions: ({ row }) => [
        // view voucher
        <GridActionsCellItem
        key={row?.id ?? "view"}
          disabled={loading}
          icon={<EyeFilled className="view-icon" />}
          onClick={() => {
            setViewDebitDetail(row?.module_used);
          }}
          label="view"
        />,
        <GridActionsCellItem
        key={row?.id ?? "print"}
          // print voucher
          disabled={loading}
          icon={<PrinterFilled className="view-icon" />}
          onClick={() => {
            printFun(row.module_used);
          }}
          label="print"
        />,
        <GridActionsCellItem
        key={row?.id ?? "download"}
          // download voucher
          disabled={loading}
          icon={
            <CloudDownloadOutlined className="view-icon" />
          }
          onClick={() => {
            handleDownload(row.module_used);
          }}
          label="download"
        />,
        <GridActionsCellItem
        key={row?.id ?? "edit"}
          // edit voucher
          disabled={loading}
          icon={<EditFilled className="view-icon" />}
          onClick={() => {
            setEditDebit(row.module_used);
          }}
          label="download"
        />,
      ],
    },
  ];

  const printFun = async (key) => {
    setLoading(true);
    const response = await imsAxios.post(
      "/tally/cn/printCreditVoucher",
      {
        cn_key: key,
      }
    );
    setLoading(false);
    if (response.success) {
      printFunction(response.data.buffer.data);
    }
    // module_used
  };
  const handleDownload = async (id) => {
    setLoading(true);
    let link = "/tally/cn/printCreditVoucher";
    let filename = "Debit Voucher " + id;

    const response = await imsAxios.post(link, {
      cn_key: id,
    });
    if (response.success) {
      downloadFunction(response.data.buffer.data, filename);
    }
    setLoading(false);
  };
  const getLedgerName = async (e) => {
    setSelectLoading(true);
    const response = await imsAxios.post(
      "/tally/ledger/ledger_options",
      {
        search: e,
      }
    );
    setSelectLoading(false);
    if (response.success) {
      let arr = response.data.map((row) => {
        return {
          text: row.text,
          value: row.id,
        };
      });
      setAsyncOptions(arr);
    } else {
      setAsyncOptions([]);
    }
  };
  useEffect(() => {
    setSearchTerm("");
  }, [wise]);
  return (
    <div style={{ height: "100%" }}>
      <Row
        justify="space-between"
        style={{ padding: 5, paddingTop: 5 }}
      >
        <Col>
          <Space>
            <div style={{ width: 150 }}>
              <MySelect
                options={wiseOptions}
                value={wise}
                onChange={(value) => setWise(value)}
              />
            </div>
            <div style={{ width: 300 }}>
              {wise === "date_wise" && (
                <MyDatePicker
                  size="default"
                  setDateRange={setSearchTerm}
                />
              )}
              {wise === "eff_wise" && (
                <MyDatePicker
                  size="default"
                  setDateRange={setSearchTerm}
                />
              )}
              {wise === "code_wise" && (
                <Input
                  placeholder="Debit Code"
                  value={searchTerm}
                  onChange={(e) =>
                    setSearchTerm(e.target.value)
                  }
                />
              )}
              {wise === "vendor_wise" && (
                <MyAsyncSelect
                  selectLoading={selectLoading}
                  onBlur={() => setAsyncOptions([])}
                  value={searchTerm}
                  onChange={(value) => setSearchTerm(value)}
                  // defaultOptions
                  loadOptions={getLedgerName}
                  optionsState={asyncOptions}
                  placeholder="Select Ledger..."
                />
              )}
            </div>
            <Button
              loading={loading === "fetch"}
              type="primary"
              onClick={getRows}
            >
              Fetch
            </Button>
          </Space>
        </Col>
        <Space>
          <CommonIcons
            action="downloadButton"
            onClick={() =>
              downloadCSV(rows, columns, "Credit Report")
            }
          />
        </Space>
      </Row>
      <div style={{ height: "95%", padding: "0px 5px" }}>
        <MyDataTable
          loading={loading === "fetch"}
          data={rows}
          columns={columns}
        />
      </div>
      <CreditView
        setViewDebitDetail={setViewDebitDetail}
        viewDebitDetail={viewDebitDetail}
      />
      <CreditEdit
        setEditDebit={setEditDebit}
        editDebit={editDebit}
      />
    </div>
  );
}

export default CreditReport;
