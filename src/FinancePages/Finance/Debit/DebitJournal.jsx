import { useState } from "react";
import SingleDatePicker from "../../../Components/SingleDatePicker";
import { v4 } from "uuid";
import { Add, Delete } from "@mui/icons-material";
import { useToast } from "../../../hooks/useToast.js";
import NavFooter from "../../../Components/NavFooter";
import MyAsyncSelect from "../../../Components/MyAsyncSelect";
import { Col, Input, Row } from "antd";
import { imsAxios } from "../../../axiosInterceptor";
import FormTable from "../../../Components/FormTable.jsx";
import Field from "../../../Components/Field.jsx";

export default function JournalPosting() {
  const { showToast } = useToast();
  const [journalDate, setJournalDate] = useState("");
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
  const [isValid, setIsValid] = useState(false);

  const addRows = () => {
    let dummy = [];
    dummy = journalRows;
    dummy = [
      {
        id: v4(),
        glCode: "",
        debit: "",
        credit: "",
        comment: "",
      },
      ...dummy,
    ];
    setJounralRows(dummy);
  };
  const removeRow = (rowId) => {
    let arr = journalRows;
    arr = arr.filter((row) => row.id != rowId);
    let creditArr = arr.map((row, index) => {
      // console.log(index);
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
  const getLedger = async (search) => {
    setSelectLoading(true);
    const response = await imsAxios.post("/tally/ledger/ledger_options", {
      search: search,
    });
    setSelectLoading(false);
    let arr = [];
    if (response.success) {
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
  const columns = [
    {
      headerName: (
        <span onClick={addRows} style={{ cursor: "pointer" }}>
          <Add color="success" />
        </span>
      ),
      width: 80,
      type: "actions",
      field: "add",
      sortable: false,
      renderCell: ({ row }) =>
        journalRows.findIndex((r) => r.id == row.id) >= 1 && !row.total ? (
          <div style={{ display: "flex", justifyContent: "center" }}>
            <span
              onClick={() => removeRow(row?.id)}
              style={{ cursor: "pointer" }}
            >
              <Delete color="error" />
            </span>
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
              showError={isValid}
              message="G/L is required"
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
            <Field
              attr="required | Debit or Credit is required"
              value={row.debit || row.credit}
              showValidation={isValid}
              treatZeroAsEmpty
            >
              <Input
                value={row.debit}
                fun={inputHandler}
                onChange={(e) =>
                  inputHandler("debit", e.target.value, row.id)
                }
                disabled={row.credit?.length > 0}
                inputType="number"
                type="number"
              />
            </Field>
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
      renderCell: ({ row }) =>
        row.total ? (
          <Input
            value={creditTotal.toFixed(2)}
            disabled
            inputType="number"
            type="number"
          />
        ) : (
          <Field
            attr="required | Debit or Credit is required"
            value={row.debit || row.credit}
            showValidation={isValid}
            treatZeroAsEmpty
          >
            <Input
              value={row.credit}
              onChange={(e) =>
                inputHandler("credit", e.target.value, row.id)
              }
              disabled={row.debit?.length > 0}
              inputType="number"
              type="number"
            />
          </Field>
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
  const hasIncompleteRow = (rows) =>
    (rows || []).some(
      (r) => !r.total && (!r.glCode || (!r.debit && !r.credit)),
    );

  const submitHandler = async () => {
    if (!journalDate || hasIncompleteRow(journalRows)) {
      setIsValid(true);
      return;
    }
    if (Number(creditTotal) !== Number(debitTotal)) {
      return showToast("Debit total and Credit total does not match", "error");
    }
    setIsValid(false);

    let finalObj = {
      effective_date: journalDate,
      gl_code: [],
      credit: [],
      debit: [],
      comment: [],
    };
    journalRows.forEach((row, index) => {
      if (index < journalRows.length - 1) {
        finalObj = {
          ...finalObj,
          gl_code: [...finalObj.gl_code, row.glCode?.value ?? row.glCode],
          credit: [...finalObj.credit, row.credit == "" ? 0 : row.credit],
          debit: [...finalObj.debit, row.debit == "" ? 0 : row.debit],
          comment: [...finalObj.comment, row.comment],
        };
      }
    });

    setLoading(true);
    const response = await imsAxios.post("/tally/dv/createDebitVoucher", {
      ...finalObj,
    });
    setLoading(false);
    if (response.success) {
      resetHandler();
      showToast(response.message, "success");
    } else {
      showToast(response.message?.msg || response.message, "error");
    }
  };
  const resetHandler = () => {
    setIsValid(false);
    setJournalDate("");
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
    setCreditTotal(0);
  };
  return (
    <div style={{ height: "92%", padding: 10 }}>
      <Row
        gutter={12}
        style={{
          height: "100%",
        }}
      >
        <Col span={24} style={{ marginBottom: 12 }}>
     
            <Row>
              <Col span={6}>
                <SingleDatePicker
                  setDate={setJournalDate}
                  placeholder="Select Effective Date.."
                  value={journalDate}
                  showError={isValid}
                  message="Please select Effective date"
                />
              </Col>
            </Row>
      
        </Col>
        <Col style={{ height: "calc(100% - 35px)", padding: 0 }} span={24}>
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
