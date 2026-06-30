import React, { useState, useEffect } from "react";
import { Button, Col, Input, Row, Select } from "antd";
import MyDatePicker from "../../Components/MyDatePicker";
import { useToast } from "../../hooks/useToast.js";
import MyAsyncSelect from "../../Components/MyAsyncSelect";
import { v4 } from "uuid";
import MyDataTable from "../../Components/MyDataTable";
import { ArrowRightOutlined } from "@ant-design/icons";
import JwInwordModal from "./Modal/JwInwordModal";
import { imsAxios } from "../../axiosInterceptor";
import useLoading from "../../hooks/useLoading";
import useApi from "../../hooks/useApi.ts";
import { getVendorOptions } from "../../api/general.ts";
import { convertSelectOptions } from "../../utils/general.ts";
import MyButton from "../../Components/MyButton";

const JwsfInward = () => {
  const { showToast } = useToast();
  const [asyncOptions, setAsyncOptions] = useState([]);
  const [loading, setLoading] = useLoading(false);
  const [editModal, setEditModal] = useState(false);
  const [datee, setDatee] = useState("");
  const [allData, setAllData] = useState({
    setType: "datewise",
    jw: "",
    sku: "",
    ven: "",
  });
  const [dateData, setDateData] = useState([]);
  const [jwData, setDJWData] = useState([]);
  const [skuData, setSKUData] = useState([]);
  const [vendorData, setVendorData] = useState([]);
  const { executeFun, loading: loading1 } = useApi();
  const option = [
    { label: "Date Wise", value: "datewise" },
    { label: "JW ID Wise", value: "jw_transaction_wise" },
    { label: "SFG SKU Wise", value: "jw_sfg_wise" },
    { label: "Vendor Wise", value: "vendorwise" },
  ];

  const getOption = async (e) => {
    if (e?.length > 2) {
      const response = await imsAxios.post("/backend/getProductByNameAndNo", {
        search: e,
      });
      let arr = [];
      arr = response?.data.map((d) => {
        return { text: d.text, value: d.id };
      });
      setAsyncOptions(arr);
    }
  };

  const getVendor = async (search) => {
    if (search.length > 2) {
      const response = await executeFun(
        () => getVendorOptions(search),
        "select"
      );
      let arr = [];
      if (response.success) {
        arr = convertSelectOptions(response.data);
      }
      setAsyncOptions(arr);
    }
  };

  const fetchDatewise = async () => {
    if (allData?.setType == "") {
      showToast("Please Select Option", "error");
    } else {
      setLoading("fetch", true);
      const response = await imsAxios.post("/jobwork/jw_sf_inward", {
        data: datee,
        wise: allData.setType,
      });
      if (response.success) {
        let arr = response.data.map((row, index) => {
          return {
            ...row,
            id: v4(),
            index: index + 1,
          };
        });
        setDateData(arr);
        setLoading("fetch", false);
      } else if (!response.success) {
        showToast(response.message?.msg || response.message, "error");
        setLoading("fetch", false);
      }
    }
  };

  const fetchJWwise = async () => {
    setLoading("fetch", true);
    const response = await imsAxios.post("/jobwork/jw_sf_inward", {
      data: allData.jw,
      wise: allData.setType,
    });
    if (response.success) {
      let arr = response.data.map((row, index) => {
        return {
          ...row,
          id: v4(),
          index: index + 1,
        };
      });
      setDJWData(arr);
      setLoading("fetch", false);
    } else if (!response.success) {
      showToast(response.message?.msg || response.message, "error");
      setLoading("fetch", false);
    }
  };

  const fetchSKUwise = async () => {
    setLoading("fetch", true);
    const response = await imsAxios.post("/jobwork/jw_sf_inward", {
      data: allData.sku,
      wise: allData.setType,
    });
    if (response.success) {
      let arr = response.data.map((row, index) => {
        return {
          ...row,
          id: v4(),
          index: index + 1,
        };
      });
      setSKUData(arr);
      setLoading("fetch", false);
    } else if (!response.success) {
      showToast(response.message?.msg || response.message, "error");
      setLoading("fetch", false);
    }
  };
  const fetchVendorwise = async () => {
    setLoading("fetch", true);
    const response = await imsAxios.post("/jobwork/jw_sf_inward", {
      data: allData.ven,
      wise: allData.setType,
    });
    if (response.success) {
      let arr = response.data.map((row, index) => {
        return {
          ...row,
          id: v4(),
          index: index + 1,
        };
      });
      setVendorData(arr);
      setLoading("fetch", false);
    } else if (!response.success) {
      showToast(response.message?.msg || response.message, "error");
      setLoading("fetch", false);
    }
  };

  const columns = [
    { field: "index", headerName: "S No.", width: 8 },
    { field: "date", headerName: "JW Date", width: 120 },
    { field: "vendor", headerName: "Vendor", width: 380 },
    { field: "transaction_id", headerName: "JW Id", width: 150 },
    { field: "sku_code", headerName: "SKU", width: 100 },
    { field: "sku_name", headerName: "Product", width: 340 },
    { field: "ord_qty", headerName: "JW PO Order Qty", width: 150 },
    // { field: "jw_sku_name", headerName: "Actions", width: 260 },
    {
      field: "actions",
      type: "actions",
      headerName: "Actions",
      width: 150,
      getActions: ({ row }) => [
       
        <ArrowRightOutlined
          key="arrow-right"
          onClick={() => setEditModal({ all: allData.setType, row })}
          style={{ color: "#1890ff", fontSize: "15px" }}
        />,
      ],
    },
  ];
  return (
    <div style={{ height: "95%", padding: "10px" }}>
      {/* <InternalNav links={JobworkLinks} /> */}
      <Row gutter={10}>
        <Col span={4}>
          <Select
            placeholder="Please Select Option"
            style={{ width: "100%" }}
            options={option}
            value={allData.setType}
            onChange={(e) =>
              setAllData((allData) => {
                return { ...allData, setType: e };
              })
            }
          />
        </Col>
        {allData.setType == "datewise" ? (
          <>
            <Col span={5}>
              <MyDatePicker setDateRange={setDatee} size="default" />
            </Col>
            <Col span={2}>
              <Button
                type="primary"
                loading={loading("fetch")}
                onClick={fetchDatewise}
              >
                Fetch
              </Button>
            </Col>
          </>
        ) : allData.setType == "jw_transaction_wise" ? (
          <>
            <Col span={6}>
              <Input
                placeholder="JW/Challan"
                value={allData.jw}
                onChange={(e) =>
                  setAllData((allData) => {
                    return { ...allData, jw: e.target.value };
                  })
                }
              />
            </Col>
            <Col span={2}>
              <Button
                loading={loading("fetch")}
                type="primary"
                onClick={fetchJWwise}
              >
                Fetch
              </Button>
            </Col>
          </>
        ) : allData.setType == "jw_sfg_wise" ? (
          <>
            <Col span={6}>
              <MyAsyncSelect
                style={{ width: "100%" }}
                onBlur={() => setAsyncOptions([])}
                loadOptions={getOption}
                value={allData.sku}
                optionsState={asyncOptions}
                onChange={(e) =>
                  setAllData((allData) => {
                    return { ...allData, sku: e };
                  })
                }
                placeholder="SFG SKU wise"
              />
            </Col>
            <Col span={2}>
              <Button
                loading={loading("fetch")}
                type="primary"
                onClick={fetchSKUwise}
              >
                Fetch
              </Button>
            </Col>
          </>
        ) : allData.setType == "vendorwise" ? (
          <>
            <Col span={6}>
              <MyAsyncSelect
                style={{ width: "100%" }}
                onBlur={() => setAsyncOptions([])}
                loadOptions={getVendor}
                value={allData.ven}
                optionsState={asyncOptions}
                onChange={(e) =>
                  setAllData((allData) => {
                    return { ...allData, ven: e };
                  })
                }
                placeholder="Vendor wise"
              />
            </Col>
            <Col span={2}>
              <Button
                loading={loading("fetch")}
                type="primary"
                onClick={fetchVendorwise}
              >
                Fetch
              </Button>
            </Col>
          </>
        ) : (
          <>
            <Col span={5}>
              <MyDatePicker setDateRange={setDatee} size="default" />
            </Col>
            <Col span={2}>
              <MyButton
                variant="search"
                type="primary"
                loading={loading("fetch")}
                onClick={fetchDatewise}
              >
                Fetch
              </MyButton>
            </Col>
          </>
        )}
      </Row>

      <div style={{ height: "CALC(100% - 20px)", marginTop: "10px" }}>
        {allData.setType == "datewise" ? (
          <MyDataTable
            loading={loading("fetch")}
            data={dateData}
            columns={columns}
          />
        ) : allData.setType == "jw_transaction_wise" ? (
          <MyDataTable data={jwData} columns={columns} />
        ) : allData.setType == "jw_sfg_wise" ? (
          <MyDataTable data={skuData} columns={columns} />
        ) : allData.setType == "vendorwise" ? (
          <MyDataTable data={vendorData} columns={columns} />
        ) : (
          <MyDataTable data={dateData} columns={columns} />
        )}
      </div>

      <JwInwordModal
        editModal={editModal}
        setEditModal={setEditModal}
        fetchDatewise={fetchDatewise}
        fetchJWwise={fetchJWwise}
        fetchSKUwise={fetchSKUwise}
        fetchVendorwise={fetchVendorwise}
      />
    </div>
  );
};

export default JwsfInward;
