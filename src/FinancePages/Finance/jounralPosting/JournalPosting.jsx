import React, { useState, useEffect } from "react";
import SingleDatePicker from "../../../Components/SingleDatePicker";
import { v4 } from "uuid";
import axios from "axios";
import { useToast } from "../../../hooks/useToast.js";
import NavFooter from "../../../Components/NavFooter";
import links from "./links";
import MyAsyncSelect from "../../../Components/MyAsyncSelect";
import { GridActionsCellItem } from "@mui/x-data-grid";
import { Card, Col, DatePicker, Form, Input, Row } from "antd";
import { imsAxios } from "../../../axiosInterceptor";
import { useLocation } from "react-router-dom";
import dayjs from "dayjs";
import FormTable from "../../../Components/FormTable.jsx";
import { Add, Delete } from "@mui/icons-material";

export default function JournalPosting() {
  const { showToast } = useToast();
  const [debitTotal, setDebitTotal] = useState(0);
  const [creditTotal, setCreditTotal] = useState(0);
  const [asyncOptions, setAsyncOptions] = useState([]);
  const [journalRows, setJounralRows] = useState([
    {
      id: v4(),
      glCode: "",
      debit: "",
      credit: "",
      comment: "",
    },
    {
      id: v4(),
      glCode: "",
      debit: "",
      credit: "",
      comment: "",
    },
    { id: v4(), total: true, debit: 0, credit: 0 },
  ]);
  const [loading, setLoading] = useState(false);
  const [selectLoading, setSelectLoading] = useState(false);
  const [addJournalForm] = Form.useForm();
  const { pathname } = useLocation();

  const addRows = () => {
    let dummy = [];
    dummy = journalRows;
    dummy = [
      { id: v4(), glCode: "", debit: "", credit: "", comment: "" },
      ...dummy,
    ];
    setJounralRows(dummy);
  };
  //Calculate the credit and debit amount using the array
  const calculateTotalValue = (arr) => {
    let creditArr = arr.map((row, index) => {
      if (index < arr.length - 1) {
        if (row.credit != "") {
          return row.credit;
        } else {
          return 0;
        }
      } else {
        return 0;
      }
    });
    let debitArr = arr.map((row, index) => {
      if (index < arr.length - 1) {
        if (row.debit != "") {
          return row.debit;
        } else {
          return 0;
        }
      } else {
        return 0;
      }
    });
    setCreditTotal(
      creditArr?.reduce((partialSum, a) => {
        return Number(partialSum) + Number(a);
      }, 0),
    );
    setDebitTotal(
      debitArr?.reduce((partialSum, a) => {
        return Number(partialSum) + Number(a);
      }, 0),
    );
    setJounralRows(arr);
  };
  const removeRow = (rowId) => {
    let arr = journalRows;
    arr = arr.filter((row) => row.id != rowId);
    calculateTotalValue(arr);
  };
  const getLedger = async (search) => {
    setSelectLoading(true);
    const response = await imsAxios.post("/tally/ledger/ledger_options", {
      search: search,
    });
    setSelectLoading(false);
    let arr = [];
    if (!data.msg) {
      arr = response.data.map((d) => {
        return { text: d.text, value: d.id };
      });
      setAsyncOptions(arr);
    } else {
      setAsyncOptions([]);
    }
  };
  const inputHandler = (name, value, id) => {
    let arr = [];

    arr = journalRows.map((row) => {
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
    calculateTotalValue(arr);
  };
  const columns = [
    {
      headerName: (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            width: "100%",
          }}
        >
          <span onClick={addRows} style={{ cursor: "pointer" }}>
            <Add color="success" />
          </span>
        </div>
      ),
      width: 80,
      type: "actions",
      field: "add",
      sortable: false,
      renderCell: ({ row }) =>
        journalRows.length > 3 && !row.total ? (
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
      headerName: "GL Code",
      field: "glCode",
      width: 400,
      sortable: false,
      renderCell: ({ row }) =>
        row.total ? (
          <div
            style={{
              width: "100%",
              textAlign: "center",
              fontSize: "1.1rem",
            }}
          >
            Total
          </div>
        ) : (
          <div style={{ width: "100%" }}>
            <MyAsyncSelect
              onBlur={() => setAsyncOptions([])}
              value={row?.glCode}
              onChange={(value) => {
                inputHandler("glCode", value, row?.id);
              }}
              labelInValue
              selectLoading={selectLoading}
              optionsState={asyncOptions}
              loadOptions={getLedger}
              placeholder="Select G/L..."
            />
          </div>
        ),
    },
    {
      headerName: "Debit",
      field: "debit",
      flex: 1,
      sortable: false,
      renderCell: ({ row }) => (
        <>
          {row.total ? (
            <Input
              disabled={true}
              value={debitTotal.toFixed(2)}
              onChange={(e) => inputHandler("debit", e.target.value, row.id)}
              name="debit"
              inputType="number"
              type="number"
            />
          ) : (
            <Input
              value={row.debit}
              fun={inputHandler}
              onChange={(e) => inputHandler("debit", e.target.value, row.id)}
              disabled={row.credit?.length > 0}
              inputType="number"
              type="number"
            />
          )}
        </>
      ),

      // width: "10vw",
    },
    {
      headerName: "Credit",
      field: "credit",
      flex: 1,
      sortable: false,
      // width: "10vw",
      renderCell: ({ row }) => (
        <Input
          // size="small"
          value={row.total ? creditTotal.toFixed(2) : row.credit}
          onChange={(e) => inputHandler("credit", e.target.value, row.id)}
          disabled={row.total || row.debit?.length > 0}
          type="number"
        />
      ),
    },
    {
      headerName: "Comment",
      // width: "20.5vw",
      field: "comment",
      flex: 1,
      sortable: false,
      renderCell: ({ row }) =>
        !row.total && (
          <Input
            onChange={(e) => {
              inputHandler("comment", e.target.value, row.id);
            }}
            value={row?.comment}
            name="comment"
          />
        ),
    },
  ];
  const submitHandler = async () => {
    const values = await addJournalForm.validateFields();

    let finalObj = {
      effective_date: dayjs(values.effectiveDate).format("DD-MM-YYYY"),
      gls: [],
      credit: [],
      debit: [],
      comment: [],
    };
    let problem = null;
    journalRows.map((row, index) => {
      if (row.glCode == "") {
        problem = "gls";
      } else {
        if (index < journalRows.length - 1) {
          finalObj = {
            ...finalObj,
            gls: [...finalObj.gls, row.glCode.value],
            credit: [...finalObj.credit, row.credit == "" ? 0 : row.credit],
            debit: [...finalObj.debit, row.debit == "" ? 0 : row.debit],
            comment: [...finalObj.comment, row.comment],
          };
        }
      }
    });
    if (!problem) {
      setLoading(true);
      let link = "/tally/jv/create_jv";
      if (pathname.includes("jv01")) {
        link = "/tally/jv/create_jv01";
      }
      const response = await imsAxios.post(link, {
        ...finalObj,
      });
      setLoading(false);
      if (response.success) {
        resetHandler();
        showToast(data.message.msg, "success");
      } else {
        showToast(response.message?.msg || response.message, "error");
      }
    } else {
      if (problem == "gls") {
        return showToast("All entries should have a gls", "error");
      }
    }
  };
  const resetHandler = () => {
    setJounralRows([
      {
        id: v4(),
        glCode: "",
        debit: "",
        credit: "",
        comment: "",
      },
      {
        id: v4(),
        glCode: "",
        debit: "",
        credit: "",
        comment: "",
      },
      { id: v4(), total: true, debit: 0, credit: 0 },
    ]);
    setDebitTotal(0);
    addJournalForm.setFieldValue("effectiveDate", "");
    setCreditTotal(0);
    // setJournalDate("");
  };
  useEffect(() => {
    if (loading) {
      setTimeout(() => {
        setLoading(false);
      }, 120000);
    }
  }, [loading]);
  return (
    <div style={{ height: "76vh", padding: 10,  }}>
      <Row gutter={12}>
        <Col span={24}>
         
            <Row>
              <Form
                style={{ width: "100%" }}
                layout="vertical"
                form={addJournalForm}
              >
                <Col span={6}>
                  <Form.Item
                    label="Effective Date"
                    name="effectiveDate"
                    rules={[
                      {
                        required: true,
                        message: "Select Effective Date",
                      },
                    ]}
                  >
                    <DatePicker format="DD-MM-YYYY" style={{ width: "100%" }} />
                  </Form.Item>
                  {/* <SingleDatePicker
                  setDate={setJournalDate}
                  placeholder="Select Effective Date.."
                  selectedDate={journalDate}
                  value={journalDate}
                  /> */}
                </Col>
              </Form>
            </Row>
      
        </Col>
        <Col style={{ maxHeight:"calc(100vh - 240px)", padding: 0 }} span={24}>
          <FormTable data={journalRows} columns={columns} />
        </Col>
      </Row>
      <NavFooter
        loading={loading}
        submitFunction={submitHandler}
        resetFunction={resetHandler}
        nextLabel="Submit"
      />
    </div>
  );
}
