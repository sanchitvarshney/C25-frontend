import React, { useEffect, useState } from "react";
import { useToast } from "../../../hooks/useToast.js";
import "../../common.css";
import { v4 } from "uuid";
import { Button, Col, Input, Row, Select, Skeleton } from "antd";
import MyAsyncSelect from "../../../Components/MyAsyncSelect";
import MyDataTable from "../../../Components/MyDataTable";
import { DeleteTwoTone, DeleteOutlined } from "@ant-design/icons";
import { imsAxios } from "../../../axiosInterceptor";
import MyButton from "../../../Components/MyButton";

const { TextArea } = Input;

const Rejection = () => {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [loadingRejection, setLoadingRejection] = useState(false);
  const [rejectedValue, setRejectedvalue] = useState({
    selValue: "",
  });
  const [asyncOptions, setAsyncOptions] = useState([]);
  const [allDataComes, setAllDataComes] = useState([]);
  const [loctionData, setloctionData] = useState([]);
  const [valueComesApi, setValueComesApi] = useState({
    branch: "",
    component: [],
    quantity: [],
    loc_to: [],
    remark: "",
  });

  const getRejectedList = async (e) => {
    if (e?.length > 2) {
      const response = await imsAxios.post("/backend/getMinTransactionByNo", {
        search: e,
      });
      let arr = [];
      arr = response?.data.map((d) => {
        return { text: d.text, value: d.id };
      });
      setAsyncOptions(arr);
      // return arr;
    }
  };

  const getLoctionsss = async () => {
    const response = await imsAxios.post("/rejection/fetchAllotedLocation");
    let u = [];
    response?.data.map((d) => u.push({ label: d.text, value: d.id }));
    setloctionData(u);
  };

  const rejectListFunction = async () => {
    setAllDataComes([]);
    setLoading(true);
    const response = await imsAxios.post("/rejection/fetchMINData", {
      min_transaction: rejectedValue?.selValue,
    });
    if (response?.success) {
      let arr = response?.data.map((row, index) => {
        return {
          ...row,
          id: v4(),
          index: index + 1,
        };
      });
      getLoctionsss();
      setAllDataComes(arr);
      setLoading(false);
    } else {
      showToast(response?.message, "error");
      setLoading(false);
    }
  };

  const reset = () => {
    setAllDataComes([]);
  };

  const resetData = (i) => {
    setAllDataComes((allDataComes) => {
      return allDataComes.filter((row) => row.id != i);
    });
  };

  const compInputHandler = async (name, value, id) => {
    if (name == "inward_qty") {
      setAllDataComes((a) =>
        a.map((aa) => {
          if (aa.id == id) {
            {
              return { ...aa, inward_qty: value };
            }
          } else {
            return aa;
          }
        })
      );
    } else if (name == "loc") {
      setAllDataComes((a) =>
        a.map((aa) => {
          if (aa.id == id) {
            {
              return { ...aa, loc: value };
            }
          } else {
            return aa;
          }
        })
      );
    }
  };

  const columns = [
    {
      field: "Actions",
      headerName: "Actions",
      width: 100,
      renderCell: ({ row }) => (
        <>
          <DeleteTwoTone
            onClick={() => resetData(row.id)}
            // onClick={() => console.log(row)}
            style={{ fontSize: "20px" }}
          />
        </>
      ),
    },
    { field: "componentName", headerName: "Component", width: 300 },
    { field: "partno", headerName: "Part", width: 100 },
    { field: "hsncode", headerName: "HSN", width: 100 },
    { field: "gsttype", headerName: "GST", width: 100 },
    {
      field: "inward_qty",
      headerName: "Total",
      width: 140,
      renderCell: ({ row }) => (
        <>
          <Input
            suffix={row.uom}
            value={row.inward_qty}
            placeholder="QTY"
            onChange={(e) =>
              compInputHandler("inward_qty", e.target.value, row.id)
            }
          />
        </>
      ),
    },
    { field: "rejected_qty", headerName: "Reject Qty", width: 100 },
    { field: "min_date", headerName: "Date", width: 180 },
    { field: "location", headerName: "Pick(-) From", width: 120 },
    {
      field: "loc",
      headerName: "Drop (+)To",
      width: 160,
      renderCell: ({ row }) => (
        <Select
          style={{ width: "100%" }}
          options={loctionData}
          onChange={(e) => compInputHandler("loc", e, row.id)}
        />
      ),
    },
  ];

  const rejectionFun = async () => {
    setLoadingRejection(true);
    let compArry = [];
    let qtyArry = [];
    let locArry = [];
    allDataComes.map((aa) => compArry.push(aa.componentKey));
    allDataComes.map((aa) => qtyArry.push(aa?.inward_qty));
    allDataComes.map((aa) => locArry.push(aa?.loc));
    const response = await imsAxios.post("/rejection/saveRejection", {
      branch: "BRALWR36",
      component: compArry,
      qty: qtyArry,
      loc_to: locArry,
      remark: valueComesApi.remark,
      min_transaction: rejectedValue.selValue,
    });

    if (response?.success) {
      showToast(response?.message, "success");
      setAllDataComes([]);
      setLoadingRejection(false);
    } else {
      // allDataComes([]);
      showToast(response?.message, "error");
      setLoadingRejection(false);
    }
  };

  return (
    <div style={{ padding: 10, height: "100%" }}>
      <Row gutter={10}>
        <Col span={4}>
          <MyAsyncSelect
            style={{ width: "100%" }}
            onBlur={() => setAsyncOptions([])}
            loadOptions={getRejectedList}
            placeholder="MIN / TXN ID"
            optionsState={asyncOptions}
            onChange={(e) =>
              setRejectedvalue((rejectedValue) => {
                return { ...rejectedValue, selValue: e };
              })
            }
          />
        </Col>
        <Col span={2}>
          <MyButton
            variant="search"
            type="primary"
            onClick={rejectListFunction}
            loading={loading}
          >
            Fetch
          </MyButton>
        </Col>
        {allDataComes.length > 0 && (
          <Col span={8} offset={10}>
            <TextArea placeholder="Reject Comment (Not Compulsory)" />
          </Col>
        )}
      </Row>

<div style={{ height: "calc(100% - 50px)", marginTop: "10px" }}>
        <MyDataTable data={allDataComes} columns={columns} loading={loading} />
  </div>

      {allDataComes.length > 0 && (
        <Row gutter={16}>
          <Col span={24}>
            <div style={{ textAlign: "end" }}>
              <Button onClick={reset} style={{ marginRight: "5px" }}>
                Reset
              </Button>
              <Button
                icon={<DeleteOutlined />}
                onClick={rejectionFun}
                loading={loadingRejection}
                style={{ background: "red", color: "white" }}
              >
                Rejection
              </Button>
            </div>
          </Col>
        </Row>
      )}
    </div>
  );
};

export default Rejection;
