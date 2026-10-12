import { useState } from "react";
import { Button, Col, Input, Row, Select } from "antd";
import MyDatePicker from "../../../Components/MyDatePicker";
import { imsAxios } from "../../../axiosInterceptor";
import { useToast } from "../../../hooks/useToast.js";
import { v4 } from "uuid";
import MyAsyncSelect from "../../../Components/MyAsyncSelect";
import MyDataTable from "../../../Components/MyDataTable";
import { GridActionsCellItem } from "@mui/x-data-grid";
import ToolTipEllipses from "../../../Components/ToolTipEllipses";
import CashEditModal from "./model/cashEditModal";
import TableActions from "../../../Components/TableActions.jsx/TableActions";
import MyButton from "../../../Components/MyButton";
import Field from "../../../Components/Field.jsx";

const FILTER_OPTIONS = [
  { label: "Date Wise", value: "date_wise" },
  { label: "Effective Wise", value: "eff_wise" },
  { label: "Code Wise", value: "key_wise" },
  { label: "Ledger Wise", value: "ledger_wise" },
];

const LIST_URL = "/tally/cash/cashpayment_list";
const DATE_TYPES = ["date_wise", "eff_wise"];

function CashPaymentResister() {
  const { showToast } = useToast();
  const [asyncOptions, setAsyncOptions] = useState([]);
  const [datee, setDatee] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectLoading, setSelectLoading] = useState(false);
  const [selectedValue, setSelectedValue] = useState({
    selType: "",
    code: "",
    pick: "",
  });
  const [cashEdit, setCashEdit] = useState(false);
  const [isValid, setIsValid] = useState(false);
  const [rows, setRows] = useState([]);

  const { selType, code, pick } = selectedValue;

  const patchSelected = (patch) =>
    setSelectedValue((prev) => ({ ...prev, ...patch }));

  const getLedgerFunction = async (search) => {
    if (!search || search.length <= 1) return;
    setSelectLoading(true);
    try {
      const { data } = await imsAxios.post("/tally/ledger/ledger_options", {
        search,
      });
      setAsyncOptions(
        (data || []).map((d) => ({ text: d.text, value: d.id }))
      );
    } finally {
      setSelectLoading(false);
    }
  };

  // Resolve the `data` value to send for the active filter, or "" when invalid.
  const getQueryValue = () => {
    if (DATE_TYPES.includes(selType)) return datee || "";
    if (selType === "key_wise") return code?.trim() || "";
    if (selType === "ledger_wise") return pick?.value ?? pick ?? "";
    return "";
  };

  const fetchData = async () => {
    const value = getQueryValue();
    if (!selType || !value) {
      setIsValid(true);
      return;
    }
    setIsValid(false);
    setRows([]);
    setLoading(true);
    try {
      const response = await imsAxios.post(LIST_URL, {
        wise: selType,
        data: value,
      });
      if (response.success) {
        setRows((response.data || []).map((row) => ({ ...row, id: v4() })));
      } else {
        showToast(response.message?.msg || response.message, "error");
      }
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      field: "actions",
      headerName: "View",
      width: 100,
      type: "actions",
      getActions: ({ row }) => [
        <GridActionsCellItem key={"view"} label="View" />,
        <TableActions
          key={"edit"}
          action="edit"
          onClick={() => setCashEdit(row.module_used)}
        />,
      ],
    },
    { field: "ref_date", headerName: "DATE", width: 120 },
    { field: "bank_name", headerName: "BANK NAME", width: 400 },
    { field: "bank_name_code", headerName: "BANK CODE", width: 150 },
    { field: "perticular", headerName: "PARTICULAR", width: 250 },
    { field: "perticular_code", headerName: "PARTICULAR CODE", width: 180 },
    { field: "which_module", headerName: "VOUCHER TYPE", width: 180 },
    {
      field: "module_used",
      headerName: "VOUCHER ID",
      width: 200,
      renderCell: ({ row }) => (
        <ToolTipEllipses copy={true} text={row.module_used}>
          {row?.module_used}
        </ToolTipEllipses>
      ),
    },
    { field: "payment", headerName: "PAYMENT", width: 140 },
    {
      field: "comment",
      headerName: "COMMENT",
      width: 240,
      renderCell: ({ row }) => (
        <ToolTipEllipses text={row.comment}>{row?.comment}</ToolTipEllipses>
      ),
    },
    { field: "status", headerName: "STATUS", width: 140 },
  ];

  const renderFilterField = () => {
    if (selType === "key_wise") {
      return (
        <Field
          attr="required | Code is required"
          value={code}
          showValidation={isValid}
          onChange={(e) => patchSelected({ code: e.target.value })}
        >
          <Input placeholder="Code" />
        </Field>
      );
    }
    if (selType === "ledger_wise") {
      return (
        <MyAsyncSelect
          selectLoading={selectLoading}
          style={{ width: "100%" }}
          onBlur={() => setAsyncOptions([])}
          loadOptions={getLedgerFunction}
          value={pick}
          optionsState={asyncOptions}
          onChange={(e) => patchSelected({ pick: e })}
          labelInValue
          showError={isValid}
          message="Please select a Ledger"
        />
      );
    }
    return (
      <MyDatePicker
        setDateRange={setDatee}
        size="default"
        value={datee}
        showError={isValid}
        message="Please select a date range"
      />
    );
  };

  return (
    <>
      <div style={{ height: "100%", padding: 10 }}>
        <CashEditModal cashEdit={cashEdit} setCashEdit={setCashEdit} />
        <Row gutter={10}>
          <Col span={4}>
            <Select
              options={FILTER_OPTIONS}
              style={{ width: "100%" }}
              placeholder="Select option"
              value={selType || undefined}
              onChange={(e) => {
                setIsValid(false);
                setRows([]);
                patchSelected({ selType: e });
              }}
              showError={isValid && !selType}
              message="Please select an option"
            />
          </Col>
          <Col span={4}>{renderFilterField()}</Col>
          <Col span={1}>
            {selType === "ledger_wise" ? (
              <MyButton
                loading={loading}
                type="primary"
                onClick={fetchData}
                variant="search"
              />
            ) : (
              <Button loading={loading} type="primary" onClick={fetchData}>
                Search
              </Button>
            )}
          </Col>
        </Row>
        <div style={{ height: "calc(100vh - 190px)", marginTop: "10px" }}>
          <MyDataTable loading={loading} data={rows} columns={columns} />
        </div>
      </div>
      <CashEditModal cashEdit={cashEdit} setCashEdit={setCashEdit} />
    </>
  );
}

export default CashPaymentResister;
