import {
  Button,
  Col,
  Drawer,
  Input,
  Space,
  Row,
} from "antd";
import { useEffect, useState } from "react";

import { v4 } from "uuid";
import { imsAxios } from "../../../../axiosInterceptor";
import SingleDatePicker from "../../../../Components/SingleDatePicker";
import MyAsyncSelect from "../../../../Components/MyAsyncSelect";
import { useToast } from "../../../../hooks/useToast.js";
import MyDataTable from "../../../../Components/MyDataTable.jsx";

function CashReceiptEdit({
  edit,
  setEdit,
  fetchData,
  selectValueWhenFetch,
}) {
  const { showToast } = useToast();
  const [allData, setAllData] = useState([]);
  const [effectiveDate, setEffectiveDate] = useState("");
  const [cash, setCash] = useState(null);
  const [insertDate, setInsertDate] = useState("");

  const [asyncOptions, setAsyncOptions] = useState([]);

  const callFunction = async () => {
    setEffectiveDate("");
    const response = await imsAxios.post(
      "/tally/cash/cash_receipt_report",
      {
        v_code: edit?.module_used,
      }
    );
    if (response.success) {
      setInsertDate(response.data.header.insert_date);
      setEffectiveDate(response.data.header.ref_date);

      let accountObj = {
        label: response.data.header.account,
        value: response.data.header.account_code,
      };
      setCash(accountObj);
      let arr = response.data.map((row, index) => {
        let particularyObj = {
          label: row.particularLabel,
          value: row.particularID,
        };
        return {
          ...row,
          id: v4(),
          index: index + 1,
          particular: particularyObj,
        };
      });
      setAllData(arr);
    } else if (!response.success) {
      showToast(response.message?.msg || response.message, "error");
    }

    // response.data.map((aa) => setCash(aa.particulars));
    // if (response.success) {
    //   setCash(data.header[0].account);
    //   setInsertDate(data.header[0].insert_date);
    //   setEffectiveDate(data.header[0].ref_date);

    //   const arr = response.data.map((row) => {
    //     return {
    //       ...row,
    //       id: v4(),
    //     };
    //   });

    //   setAllData(arr);
    // }
  };

  const getAccount = async (search) => {
   
    const response = await imsAxios.post(
      "/tally/cash/fetch_cash",
      {
        search: search,
      }
    );

    const arr = response.data.map((row) => {
      return { value: row.id, text: row.text };
    });
    setAsyncOptions(arr);
  };

  const getParticulars = async (search) => {
  
    const response = await imsAxios.post(
      "/tally/ledger/ledger_options",
      {
        search: search,
      }
    );

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
    let arr = allData;
    arr = arr.map((row) => {
      if (row.id == id) {
        let obj = row;
        if (name === "particular") {
          let particularObj = {
            text: value.label,
            value: value.value,
          };
          obj = {
            ...obj,
            [name]: particularObj,
          };
        } else {
          obj = {
            ...obj,
            [name]: value,
          };
        }

        return obj;
      } else {
        return row;
      }
    });
    setAllData(arr);
  };

  const columns = [
    {
      headerName: "Particulars Code",
      field: "particularLabel",
      flex: 1,
      sortable: false,
      renderCell: ({ row }) => (
        <MyAsyncSelect
          value={row?.particular}
          onBlur={() => setAsyncOptions([])}
          labelInValue
          // selectLoading={selectLoading}
          loadOptions={getParticulars}
          optionsState={asyncOptions}
          placeholder="Particulars"
          onChange={(value) => {
            inputHandler("particular", value, row?.id);
          }}
        />
      ),
    },
    {
      headerName: "Payment",
      field: "ammount",
      width: 150,
      sortable: false,
      // width: "10vw",
      renderCell: ({ row }) => (
        <Input
          // size="small"
          value={row.ammount}
          onChange={(e) =>
            inputHandler("ammount", e.target.value, row.id)
          }
        />
      ),
    },
    {
      headerName: "Comment",
      field: "comment",
      width: 150,
      sortable: false,
      // width: "10vw",
      renderCell: ({ row }) => (
        <Input
          size="small"
          value={row.comment}
          onChange={(e) =>
            inputHandler("comment", e.target.value, row.id)
          }
        />
      ),
    },
  ];

  const submitHandler = async () => {
    if (selectValueWhenFetch == "date_wise") {
      const uniqueID = [];
      const par = [];
      const ammount = [];
      const comment = [];
      allData.map((p) => uniqueID.push(p.ID));
      allData.map((p) => par.push(p.particular.value));
      allData.map((p) => ammount.push(p.ammount));
      allData.map((p) => comment.push(p.comment));

      const response = await imsAxios.post(
        "/tally/cash/updateCashReceipt",
        {
          account: cash.value,
          credit: ammount,
          comment: comment,
          gls: par,
          effective_date: effectiveDate,
          ID: uniqueID,
          module_used: edit?.module_used,
        }
      );
      if (response.success) {
        fetchData("date_wise");
        showToast(response?.message, "success");
        setEdit(false);
      }  
    } else if (selectValueWhenFetch == "eff_wise") {
      const uniqueID = [];
      const par = [];
      const ammount = [];
      const comment = [];
      allData.map((p) => uniqueID.push(p.ID));
      allData.map((p) => par.push(p.particular.value));
      allData.map((p) => ammount.push(p.ammount));
      allData.map((p) => comment.push(p.comment));

      const response = await imsAxios.post(
        "/tally/cash/updateCashReceipt",
        {
          account: cash.value,
          credit: ammount,
          comment: comment,
          gls: par,
          effective_date: effectiveDate,
          ID: uniqueID,
          module_used: edit?.module_used,
        }
      );
      if (response.success) {
        fetchData("eff_wise");
        showToast(response?.message, "success");
        setEdit(false);
      } 
    } else if (selectValueWhenFetch == "key_wise") {
      const uniqueID = [];
      const par = [];
      const ammount = [];
      const comment = [];
      allData.map((p) => uniqueID.push(p.ID));
      allData.map((p) => par.push(p.particular.value));
      allData.map((p) => ammount.push(p.ammount));
      allData.map((p) => comment.push(p.comment));

      const response = await imsAxios.post(
        "/tally/cash/updateCashReceipt",
        {
          account: cash.value,
          credit: ammount,
          comment: comment,
          gls: par,
          effective_date: effectiveDate,
          ID: uniqueID,
          module_used: edit?.module_used,
        }
      );
      if (response.success) {
        fetchData("key_wise");
        showToast(response?.message, "success");
        setEdit(false);
      } 
    } else if (selectValueWhenFetch == "ledger_wise") {
      const uniqueID = [];
      const par = [];
      const ammount = [];
      const comment = [];
      allData.map((p) => uniqueID.push(p.ID));
      allData.map((p) => par.push(p.particular.value));
      allData.map((p) => ammount.push(p.ammount));
      allData.map((p) => comment.push(p.comment));

      const response = await imsAxios.post(
        "/tally/cash/updateCashReceipt",
        {
          account: cash.value,
          credit: ammount,
          comment: comment,
          gls: par,
          effective_date: effectiveDate,
          ID: uniqueID,
          module_used: edit?.module_used,
        }
      );
      if (response.success) {
        fetchData("ledger_wise");
        showToast(response?.message, "success");
        setEdit(false);
      }
    }
  };

  useEffect(() => {
    if (edit?.module_used) {
      callFunction();
    }
  }, [edit?.module_used]);

  return (
    <Space>
      <Drawer
        width="50vw"
        height="100vh"
        title="Edit Cash Receipt"
        placement="right"
        onClose={() => setEdit(false)}
        open={edit}
        extra={
          <Button
            type="primary"
            // loading={submitLoading}
            onClick={submitHandler}
          >
            Submit
          </Button>
        }
      >
        <>
          <Row gutter={16}>
            <Col span={6}>
              <Input value={insertDate} disabled />
            </Col>
            <Col span={6}>
              {effectiveDate && (
                <SingleDatePicker
                  value={effectiveDate}
                  setDate={setEffectiveDate}
                  selectedDate={effectiveDate}
                  showValue={effectiveDate}
                />
              )}
              {/* <Input value={header[0].ref_date} disabled /> */}
            </Col>
            <Col span={10}>
              <MyAsyncSelect
                size="default"
                value={cash}
                labelInValue
                onBlur={() => setAsyncOptions([])}
                loadOptions={getAccount}
                placeholder="Select Account.."
                optionsState={asyncOptions}
                onChange={(value) => setCash(value)}
              />
            </Col>
          </Row>
          <Row gutter={10}>
            <Col span={24} style={{ height: "95%" }}>
              <MyDataTable data={allData} columns={columns} />
            </Col>
          </Row>
        </>
      </Drawer>
    </Space>
  );
}

export default CashReceiptEdit;
