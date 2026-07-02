import  { useEffect, useState } from "react";
import { Button, Input, Popconfirm, Row, Space } from "antd";
import { useToast } from "../../../hooks/useToast.js";
import MySelect from "../../../Components/MySelect";
import MyDatePicker from "../../../Components/MyDatePicker";
import MyAsyncSelect from "../../../Components/MyAsyncSelect";
import { v4 } from "uuid";
import {
  CheckOutlined,
  CloseOutlined,
  DownloadOutlined,
} from "@ant-design/icons";
import { downloadCSV } from "../../../Components/exportToCSV";
import { imsAxios } from "../../../axiosInterceptor";
import ToolTipEllipses from "../../../Components/ToolTipEllipses";
import useApi from "../../../hooks/useApi.ts";
import { getComponentOptions, getVendorOptions } from "../../../api/general.ts";
import { convertSelectOptions } from "../../../utils/general.ts";
import MyButton from "../../../Components/MyButton";
import MyDataTable from "../../../Components/MyDataTable.jsx";
function PendingQC() {
  const { showToast } = useToast();
  const [wise, setWise] = useState("datewise");
  const [searchInput, setSearchInput] = useState("");
  const [asyncOptions, setAsyncOptions] = useState([]);
  const [rows, setRows] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [tableLoading, setTableLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const { executeFun, loading: loading1 } = useApi();
  const wiseOptions = [
    { text: "Sample Date Wise", value: "datewise" },
    { text: "Vendor Wise", value: "vendorwise" },
    { text: "Part Wise", value: "partwise" },
  ];

  const getPartOptions = async (search) => {
    // setSelectLoading(false);
    // const response = await imsAxios.post("/backend/getComponentByNameAndNo", {
    //   search: search,
    // });
    // setSelectLoading(true);
    const response = await executeFun(
      () => getComponentOptions(search),
      "select"
    );
    const { data } = response;
    const arr = data.map((row) => {
      return {
        text: row.text,
        value: row.id,
      };
    });
    setAsyncOptions(arr);
  };

  const getVendors = async (search) => {
    const response = await executeFun(() => getVendorOptions(search), "select");
    let arr = [];
    if (response.success) {
      arr = convertSelectOptions(response.data);
    }
    setAsyncOptions(arr);
  };

  const getRows = async () => {
    setSearchLoading(true);
    setTableLoading(true);

    const response = await imsAxios.post("/qc/pendingSample", {
      data: searchInput,
      wise: wise,
    });
    setTableLoading(false);
    setSearchLoading(false);

    if (response.success) {
      const arr = response.data.map((row, index) => {
        return {
          ...row,
          id: v4(),
          index: index + 1,
          remark: "",
          status: "",
        };
      });
      console.log(arr);
      setRows(arr);
    } else {
      showToast(response.message, "error");
      setRows([]);
    }
  };
  const submitSample = async (row) => {
    setSubmitLoading(row.id);
    const response = await imsAxios.post("/qc/updateSampling_stage2", {
      component: row.componentKey,
      sample_txn: row.transaction,
      min_txn: row.qc_transaction,
      authKey: row.authkey,
      status: "P",
      remark: row.remark,
    });
    setSubmitLoading(false);
    if (response.success) {
      showToast(response.message, "success");
      let arr = rows;
      arr = arr.map((tableRow) => {
        if (tableRow.id === row.id) {
          return {
            ...tableRow,
            status: "P",
          };
        } else {
          return tableRow;
        }
      });
      setRows(arr);
    } else {
      showToast(response.message?.msg || response.message, "error");
    }
  };
  const rejectSample = async (row) => {
    setSubmitLoading(row.id);

    const response = await imsAxios.post("/qc/updateSampling_stage2", {
      component: row.componentKey,
      sample_txn: row.transaction,
      min_txn: row.qc_transaction,
      authKey: row.authkey,
      status: "F",
      remark: row.remark,
    });
    setSubmitLoading(false);
    if (response.success) {
      showToast(response.message, "success");
      let arr = rows;
      arr = arr.map((tableRow) => {
        if (tableRow.id === row.id) {
          return {
            ...tableRow,
            status: "F",
          };
        } else {
          return tableRow;
        }
      });
      setRows(arr);
    } else {
      showToast(response.message?.msg || response.message, "error");
    }
  };
  const columns = [
    {
      headerName: "Sr. No.",
      width: 80,
      field: "index",
      renderCell: ({ row }) => <p>{row.index}</p>,
    },
    {
      headerName: "Sample No.",
      width: 120,
      field: "transaction",
      renderCell: ({ row }) => (
        <ToolTipEllipses copy={true} text={row.transaction} />
      ),
    },
    {
      headerName: "MIN No.",
      field: "qc_transaction",
      width: 150,
      renderCell: ({ row }) => (
        <ToolTipEllipses copy={true} text={row.qc_transaction} />
      ),
    },
    {
      headerName: "Component",
      field: "component",
      width: 250,
      renderCell: ({ row }) => <ToolTipEllipses text={row.component} />,
    },
    {
      headerName: "Part",
      width: 150,
      field: "part",
      renderCell: ({ row }) => <ToolTipEllipses copy={true} text={row.part} />,
    },
    {
      headerName: "Vendor Code",
      width: 120,
      field: "vendorcode",
      renderCell: ({ row }) => (
        <ToolTipEllipses copy={true} text={row.vendorcode} />
      ),
    },
    {
      headerName: "Vendor Name",
      width: 200,
      field: "vendorcode",
      renderCell: ({ row }) => (
        <ToolTipEllipses copy={true} text={row.vendorname} />
      ),
    },
    {
      headerName: "Sample Date",
      width: 150,
      field: "sample_dt",
      renderCell: ({ row }) => <ToolTipEllipses text={row.sample_dt} />,
    },
    {
      headerName: "In Qty",
      width: 150,
      field: "inQty",
      renderCell: ({ row }) => <ToolTipEllipses text={row.inQty} />,
    },
    {
      headerName: "Invoice",
      width: 180,
      field: "part",
      renderCell: ({ row }) => (
        <ToolTipEllipses copy={true} text={row.invoice} />
      ),
    },
    {
      headerName: "Sample Qty.",
      width: 150,
      field: "samQty",
      renderCell: ({ row }) => <ToolTipEllipses text={row.samQty} />,
    },
    {
      headerName: "UoM",
      width: 120,
      field: "unit",
      renderCell: ({ row }) => <ToolTipEllipses text={row.unit} />,
    },
    {
      headerName: "Remarks",
      field: "remark",
      width: 200,
      renderCell: ({ row }) =>
        row.status === "" ? (
          <Input
            value={row.remark}
            onChange={(e) => inputHandler("remark", e.target.value, row.id)}
          />
        ) : row.status === "F" ? (
          <p
            style={{
              color: "brown",
              textAlign: "center",
              alignSelf: "center",
              marginTop: 5,
            }}
          >
            Rejected
          </p>
        ) : (
          row.status === "P" && (
            <p
              style={{
                color: "green",
                textAlign: "center",
                marginTop: 5,
              }}
            >
              Passed
            </p>
          )
        ),
    },
    {
      headerName: "Actions",
      field: "actions",
      width: 80,
      renderCell: ({ row }) => (
        <Space>
          <Popconfirm
            title={`Are you sure to pass Sample ${row.transaction}?`}
            onConfirm={() => submitSample(row)}
            // onCancel={() => {
            //   setShowConfirmModal(null);
            // }}
            okText="Yes"
            loading={submitLoading === row.id}
            cancelText="No"
          >
            <Button
              shape="circle"
              type="primary"
              size="small"
              icon={<CheckOutlined />}
            />
          </Popconfirm>
          <Popconfirm
            title={`Are you sure to reject Sample ${row.transaction}?`}
            onConfirm={() => rejectSample(row)}
            okButtonProps={{
              loading: submitLoading === row.id,
            }}
            // onCancel={() => {
            //   setShowConfirmModal(null);
            // }}
            okText="Yes"
            cancelText="No"
          >
            <Button
              shape="circle"
              type="primary"
              size="small"
              icon={<CloseOutlined />}
            />
            {/* <CommonIcons
              disabled={row.status !== ""}
              size="small"
              action="closeButton"
            /> */}
          </Popconfirm>
        </Space>
      ),
    },
  ];

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
  useEffect(() => {
    setSearchInput("");
  }, [wise]);
  return (
    <div style={{height:"100%", padding:10}}>
      <Row justify="space-between">
        <div>
          <Space>
            <div style={{ width: 200 }}>
              <MySelect
                size="default"
                options={wiseOptions}
                defaultValue={wiseOptions.filter((o) => o.value === wise)[0]}
                onChange={setWise}
                value={wise}
              />
            </div>
            <div style={{ width: 300 }}>
              {wise === "datewise" ? (
                <MyDatePicker
                  size="default"
                  setDateRange={setSearchInput}
                  dateRange={setSearchInput}
                  value={searchInput}
                />
              ) : wise === "partwise" ? (
                <MyAsyncSelect
                  size="default"
                  selectLoading={loading1("select")}
                  onBlur={() => setAsyncOptions([])}
                  value={searchInput}
                  onChange={(value) => setSearchInput(value)}
                  loadOptions={getPartOptions}
                  optionsState={asyncOptions}
                  placeholder="Select Part..."
                />
              ) : (
                wise === "vendorwise" && (
                  <div>
                    <MyAsyncSelect
                      size="default"
                      onBlur={() => setAsyncOptions([])}
                      selectLoading={loading1("select")}
                      value={searchInput}
                      onChange={(value) => setSearchInput(value)}
                      loadOptions={getVendors}
                      optionsState={asyncOptions}
                      placeholder="Select Vendor..."
                    />
                  </div>
                )
              )}{" "}
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
          <Button
            type="primary"
            onClick={() => downloadCSV(rows, columns, "Stage 2 QC Report")}
            shape="circle"
            icon={<DownloadOutlined />}
            disabled={rows.length == 0}
          />
        </Space>
      </Row>
      <div style={{ height: "calc(100% - 40px)", marginTop: "10px" }}>
        <MyDataTable columns={columns} data={rows} loading={tableLoading} />
      </div>
    </div>
  );
}

export default PendingQC;
