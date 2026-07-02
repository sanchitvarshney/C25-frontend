import  { useState } from "react";
import {  Col, Form, Row, Input } from "antd";
import MyAsyncSelect from "../../../Components/MyAsyncSelect";
import SingleDatePicker from "../../../Components/SingleDatePicker";
import NavFooter from "../../../Components/NavFooter";
import { v4 } from "uuid";
import { GridActionsCellItem } from "@mui/x-data-grid";
import { useToast } from "../../../hooks/useToast.js";
import { imsAxios } from "../../../axiosInterceptor";
import FormTable from "../../../Components/FormTable.jsx";
import { Add, Delete } from "@mui/icons-material";

function CashReceipt() {
  const { showToast } = useToast();
  const [headerCash, setHeaderCash] = useState("");
  const [selectLoading, setSelectLoading] = useState(false);
  const [asyncOptions, setAsyncOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [effectiveDate, setSetEffective] = useState("");
  //   const [headerAccount, setHeaderAccount] = useState("");
  const [cashPaymentRows, setCashPaymentRows] = useState([
    {
      id: v4(),
      glCode: "",
      cash: "",
      comment: "",
    },
  ]);

  const getCash = async (search) => {
    setSelectLoading(true);
    const response = await imsAxios.post("/tally/cash/fetch_cash", {
      search: search,
    });
    setSelectLoading(false);
    const arr = response.data.map((row) => {
      return { value: row.id, text: row.text };
    });
    setAsyncOptions(arr);
  };

  const addRows = () => {
    setCashPaymentRows((rows) => {
      return [
        {
          id: v4(),
          glCode: "",
          cash: "",
          comment: "",
        },
        ...rows,
      ];
    });
  };

  const removeRow = (id) => {
    let arr = cashPaymentRows;
    arr = arr.filter((row) => row.id != id);
    setCashPaymentRows(arr);
  };

  const CashPaymentTable = [
    {
      headerName: (
        <span onClick={addRows} style={{ cursor: "pointer" }}>
          <Add color="success" />
        </span>
      ),
      width: 150,
      type: "actions",
      field: "add",
      sortable: false,
      renderCell: ({ row }) =>
        cashPaymentRows.length > 1 ? (
          <div
            style={{ display: "flex", justifyContent: "center", width: "100%" }}
          >
            <GridActionsCellItem
              icon={<Delete color="error" />}
              onClick={() => removeRow(row.id)}
              label="Delete"
            />
          </div>
        ) : null,
    },
    {
      headerName: "Particulars",
      flex: 1,
      field: "glcode",
      sortable: false,
      renderCell: ({ row }) => (
        <MyAsyncSelect
          selectLoading={selectLoading}
          onBlur={() => setAsyncOptions([])}
          value={row?.glCode}
          onChange={(value) => {
            inputHandler("glCode", value, row?.id);
          }}
          loadOptions={getLedger}
          optionsState={asyncOptions}
          placeholder="Select Ledger.."
        />
      ),
    },
    {
      headerName: "Amount",
      field: "cash",
      sortable: false,
      flex: 1,
      renderCell: ({ row }) => (
        <Input
          value={row.cash}
          onChange={(e) => {
            inputHandler("cash", e.target.value, row.id);
          }}
          placeholder="0"
          type="number"
        />
      ),
    },

    {
      headerName: "Comment",
      field: "comment",
      sortable: false,
      flex: 1,
      //   width: "12.5vw",
      renderCell: ({ row }) =>
        !row.total && (
          <Input
            fun={inputHandler}
            onChange={(e) => {
              inputHandler("comment", e.target.value, row.id);
            }}
            value={row?.comment}
            placeholder="Enter a comment..."
          />
        ), //ask
    },
  ];

  const getLedger = async (search) => {
    setSelectLoading(true);
    const response = await imsAxios.post("/tally/ledger/ledger_options", {
      search: search,
    });
    setSelectLoading(false);
    if (response.success) {
      const arr = response.data.map((row) => {
        return { text: row.text, value: row.id };
      });
      setAsyncOptions(arr);
    } else {
      setAsyncOptions([]);
    }
  };

  const inputHandler = (name, value, id) => {
    let arr = [];
    arr = cashPaymentRows;
    arr = arr.map((row) => {
      if (row.id == id) {
        let obj = row;
        obj = {
          ...obj,
          [name]: value,
        };
        return obj;
      } else {
        return row;
      }
    });
    setCashPaymentRows(arr);
  };

  const saveFunction = async () => {
    let validating = { status: true, message: "" };
    let gls = [];
    let cash = [];
    let comment = [];
    if (headerCash == "") {
      return showToast("A account is required", "error");
    } else if (effectiveDate == "") {
      return showToast("Effective date is required", "error");
    }
    cashPaymentRows.map((row) => {
      if (row.gls == "") {
        validating = {
          status: false,
          message: "GLS is required in all the fields",
        };
      } else if (row.cash == "") {
        validating = {
          status: false,
          message: "cash is required in all the fields",
        };
      }

      if (validating) {
        gls.push(row.glCode ? row.glCode : "");
        cash.push(row.cash);
        comment.push(row.comment);
      }
    });
    if (validating.status == false) {
      showToast(validating.message, "error");
    } else if (validating.status == true) {
      setLoading(true);
      const response = await imsAxios.post("/tally/cash/insert_cashreceipt", {
        gls: gls,
        credit: cash,
        comment: comment,
        account: headerCash ? headerCash : "",
        effective_date: effectiveDate,
      });
      setLoading(false);
      if (response.success) {
        resetFunction();
        showToast(response.message, "success");
      }
    }
  };

  const resetFunction = () => {
    setHeaderCash("");
    setCashPaymentRows([
      {
        id: v4(),
        glCode: "",
        debit: "",
        comment: "",
      },
    ]);
  };

  return (
    <div style={{ height: "100%", padding: 10 }}>
      <Row gutter={10} style={{ height: "100%" }}>
        <Col span={24}>
      
            <Form size="small">
              <Row gutter={12}>
                <Col span={6}>
                  <Form.Item
                    label="Cash"
                    rules={[
                      {
                        required: true,
                        message: "Select Account",
                      },
                    ]}
                  >
                    <MyAsyncSelect
                      size="default"
                      selectLoading={selectLoading}
                      optionsState={asyncOptions}
                      onBlur={() => setAsyncOptions([])}
                      loadOptions={getCash}
                      value={headerCash}
                      placeholder="Select Account.."
                      onChange={(value) => setHeaderCash(value)}
                    />
                  </Form.Item>
                </Col>
                <Col span={6}>
                  <Form.Item
                    label="Select EffectiveDate"
                    rules={[
                      {
                        required: true,
                        message: "Select Effective Date",
                      },
                    ]}
                  >
                    <SingleDatePicker
                      size="default"
                      setDate={setSetEffective}
                    />
                  </Form.Item>
                </Col>
              </Row>
            </Form>
       
        </Col>
        <Col span={24} style={{ height: "75vh" }}>
          <FormTable data={cashPaymentRows} columns={CashPaymentTable} />
        </Col>
      </Row>
      <NavFooter
        resetFunction={resetFunction}
        submitFunction={saveFunction}
        nextLabel="Submit"
        loading={loading}
      />
    </div>
  );
}

export default CashReceipt;
