import { useEffect, useState } from "react";
import { Button, Input, Row, Space, Modal } from "antd";
import MyDatePicker from "../../../Components/MyDatePicker";
import MySelect from "../../../Components/MySelect";
import MyAsyncSelect from "../../../Components/MyAsyncSelect";
import { v4 } from "uuid";
import { useToast } from "../../../hooks/useToast.js";
import MyDataTable from "../../../Components/MyDataTable";
import { DownloadOutlined } from "@ant-design/icons";
import { downloadCSV } from "../../../Components/exportToCSV";
import { imsAxios } from "../../../axiosInterceptor";
import useApi from "../../../hooks/useApi.ts";
import { getComponentOptions, getVendorOptions } from "../../../api/general.ts";
import { convertSelectOptions } from "../../../utils/general.ts";
import MyButton from "../../../Components/MyButton";
import Field from "../../../Components/Field.jsx";
function SampleQC() {
  const { showToast } = useToast();
  const [wise, setWise] = useState("datewise");
  const [searchInput, setSearchInput] = useState("");
  const [asyncOptions, setAsyncOptions] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [rows, setRows] = useState([]);
  const [isValid, setIsValid] = useState(false);
  const [samples, setsSamples] = useState([]);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const { executeFun, loading: loading1 } = useApi();
  const wiseOptions = [
    { text: "Date Wise", value: "datewise" },
    { text: "PO Wise", value: "powise" },
    { text: "Vendor Wise", value: "vendorwise" },
    { text: "MIN Wise", value: "minwise" },
    { text: "Part Wise", value: "partwise" },
  ];
  const getVendors = async (search) => {
    const response = await executeFun(() => getVendorOptions(search), "select");
    let arr = [];
    if (response.success) {
      arr = convertSelectOptions(response.data);
    }
    setAsyncOptions(arr);
  };
  const getPartOptions = async (search) => {
    // setSelectLoading(true);
    // const response = await imsAxios.post("/backend/getComponentByNameAndNo", {
    //   search: search,
    // });
    // setSelectLoading(false);
    const response = await executeFun(
      () => getComponentOptions(search),
      "select",
    );
    const { data } = response;
    const arr = data.map((row) => {
      return {
        value: row.id,
        text: row.text,
      };
    });
    setAsyncOptions(arr);
  };
  const getRows = async () => {
    if (!searchInput || !wise) {
      setIsValid(true);
      return;
    }
    setIsValid(false);
    setSearchLoading(true);
    const response = await imsAxios.post("/qc/fetchQCSamples", {
      data: searchInput?.value ?? searchInput,
      wise: wise,
    });
    setSearchLoading(false);
    if (response.success) {
      const arr = response.data.map((row, index) => {
        return {
          ...row,
          id: v4(),
          index: index + 1,
          sampleQty: 0,
          remark: "",
        };
      });
      setRows(arr);
    } else {
      showToast(response.message?.msg || response.message, "error");
      setRows([]);
    }
  };
  const inputHandler = (name, value, id) => {
    let arr = rows;
    arr = arr.map((row) => {
      let obj = row;
      if (row.id == id) {
        obj = {
          ...obj,
          [name]: value,
        };
        return obj;
      } else {
        return row;
      }
    });
    setRows(arr);
  };
  const columns = [
    {
      headerName: "Serial No.",
      width: 100,
      renderCell: ({ row }) => row.index,
      field: "index",
    },
    {
      headerName: "MIN Date",
      width: 150,
      field: "date",
      renderCell: ({ row }) => row.date,
    },
    {
      headerName: "PO TXN",
      width: 120,
      field: "pono",
      renderCell: ({ row }) => row.pono,
    },
    {
      headerName: "MIN TXN",
      width: 150,
      field: "min_txn",
      renderCell: ({ row }) => row.min_txn,
    },
    {
      headerName: "MIN Doc No.",
      width: 150,
      field: "invoice",
      renderCell: ({ row }) => row.invoice,
    },
    {
      headerName: "Vendor",
      field: "vendorcode",
      renderCell: ({ row }) => row.vendorcode,
    },
    {
      headerName: "Vendor Name",
      width: 180,
      field: "vendorname",
      renderCell: ({ row }) => row.vendorname,
    },
    {
      headerName: "Part",
      width: 100,
      field: "part",
      renderCell: ({ row }) => row.part,
    },
    {
      headerName: "Component",
      width: 180,
      field: "component",
      renderCell: ({ row }) => row.component,
    },
    {
      headerName: "MIN Qty",
      width: 100,
      field: "inQty",
      renderCell: ({ row }) => row.inQty,
    },
    {
      headerName: "UoM",
      width: 100,
      field: "unit",
      renderCell: ({ row }) => row.unit,
    },
    {
      headerName: "Sample Qty",
      field: "sampleQty",
      width: 150,
      renderCell: ({ row }) => (
        <Input
          value={row.sampleQty}
          onChange={(e) => inputHandler("sampleQty", e.target.value, row.id)}
        />
      ),
    },
    {
      headerName: "Remark",
      field: "remark",
      width: 180,
      renderCell: ({ row }) => (
        <Input
          value={row.remark}
          placeholder="Enter Remarks..."
          onChange={(e) => inputHandler("remark", e.target.value, row.id)}
        />
      ),
    },
  ];
  const confirmColumns = [
    { headerName: "Part Code", flex: 1, field: "part" },
    {
      headerName: "Component",
      width: 350,
      field: "component",
    },
    {
      headerName: "Sample Qty",
      flex: 1,
      field: "sampleQty",
    },
    { headerName: "Remarks", width: 300, field: "remark" },
  ];
  const openConfirmModal = () => {
    let arr = rows.filter((row) => row.sampleQty != "" && row.sampleQty != 0);

    if (arr.length == 0) {
      return showToast("No Samples to preview", "error");
    }
    setsSamples(arr);
    // console.log(arr);
    setShowConfirmModal(true);
  };
  const submitHandler = async () => {
    const finalObj = {
      remark: samples.map((sample) => sample.remark),
      authKey: samples.map((sample) => sample.authKey),
      min_txn: samples.map((sample) => sample.min_txn),
      vendor: samples.map((sample) => sample.vendorcode),
      min_dt: samples.map((sample) => sample.date),
      component: samples.map((sample) => sample.componentKey),
      samQty: samples.map((sample) => sample.sampleQty),
    };
    setSubmitLoading(true);
    const response = await imsAxios.post("/qc/addSampling_stage1", finalObj);
    setSubmitLoading(false);
    if (response.success) {
      showToast(response.message, "success");
      getRows();
      setShowConfirmModal(false);
      // setsSamples([]);
    } else {
      showToast(response.message?.msg || response.message, "error");
    }
  };
  const resetFun = () => {
    let arr = rows;
    arr = arr.map((row) => {
      return {
        ...row,
        sampleQty: 0,
        remark: "",
      };
    });
    setRows(arr);
  };
  useEffect(() => {
    setSearchInput("");
    setIsValid(false);
  }, [wise]);

  return (
    <div style={{ height: "100%", padding: 10 }}>
      <Modal
        title={`Confirm Samples : ${samples.length} Item${
          samples.length == 1 ? "" : "s"
        }`}
        width={1000}
        open={showConfirmModal}
        onCancel={() => setShowConfirmModal(false)}
        onOk={submitHandler}
        confirmLoading={submitLoading}
        extra
      >
        <div
          className="remove-table-footer"
          style={{ height: "50vh", overflow: "auto" }}
        >
          <MyDataTable columns={confirmColumns} data={samples} />
        </div>
      </Modal>
      <Row justify="space-between">
        <div>
          <Space>
            <div style={{ width: 200 }}>
              <MySelect
                size={"default"}
                options={wiseOptions}
                defaultValue={wiseOptions.filter((o) => o.value === wise)[0]}
                onChange={setWise}
                value={wise}
                message="Please select a wise"
                showError={isValid}
              />
            </div>
            <div style={{ width: 300 }}>
              {wise === "datewise" ? (
                <MyDatePicker
                  size="default"
                  setDateRange={setSearchInput}
                  dateRange={setSearchInput}
                  value={searchInput}
                  showError={isValid}
                  message="Please select a date range"
                />
              ) : wise === "powise" ? (
                <Field
                  attr="required | Please enter a PO Number"
                  value={searchInput}
                  showValidation={isValid}
                  onChange={(e) => setSearchInput(e.target.value)}
                >
                  <Input
                    style={{ width: "100%" }}
                    type="text"
                    placeholder="Enter Po Number"
                  />
                </Field>
              ) : wise === "vendorwise" ? (
                <div>
                  <MyAsyncSelect
                    size="default"
                    selectLoading={loading1("select")}
                    onBlur={() => setAsyncOptions([])}
                    value={searchInput}
                    onChange={(value) => setSearchInput(value)}
                    loadOptions={getVendors}
                    optionsState={asyncOptions}
                    placeholder="Select Vendor..."
                    labelInValue
                    showError={isValid}
                    message="Please select a Vendor"
                  />
                </div>
              ) : wise === "minwise" ? (
                <div>
                  <Field
                    attr="required | Please enter a MIN Number"
                    value={searchInput}
                    showValidation={isValid}
                    onChange={(e) => setSearchInput(e.target.value)}
                  >
                    <Input placeholder="Enter MIN Number" />
                  </Field>
                </div>
              ) : (
                wise == "partwise" && (
                  <div>
                    <MyAsyncSelect
                      size="default"
                      selectLoading={loading1("select")}
                      onBlur={() => setAsyncOptions([])}
                      value={searchInput}
                      onChange={(value) => setSearchInput(value)}
                      loadOptions={getPartOptions}
                      optionsState={asyncOptions}
                      placeholder="Part no"
                      labelInValue
                      showError={isValid}
                      message="Please select a Part"
                    />
                  </div>
                )
              )}{" "}
            </div>
            <MyButton
              variant="search"
              type="primary"
              loading={searchLoading}
              onClick={getRows}
              id="submit"
              // className="primary-button search-wise-btn"
            >
              Search
            </MyButton>
          </Space>
        </div>
        <Space>
          <Button
            type="primary"
            onClick={() => downloadCSV(rows, columns, "Stage 1 QC Report")}
            shape="circle"
            icon={<DownloadOutlined />}
            disabled={rows.length == 0}
          />
          <MyButton variant="reset" onClick={resetFun}>
            Reset
          </MyButton>
          <Button onClick={openConfirmModal} type="primary">
            Save Samples
          </Button>
        </Space>
      </Row>
      <div style={{ height: "calc(100% - 40px)", marginTop: "10px" }}>
        <MyDataTable
          loading={searchLoading}
          columns={columns}
          data={rows}
          hideFooter
        />
      </div>
    </div>
  );
}

export default SampleQC;
