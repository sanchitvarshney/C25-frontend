import  { useState } from "react";
import { Button, Col, Input, Row, Select } from "antd";
import MyDatePicker from "../../Components/MyDatePicker.jsx";
import MyAsyncSelect from "../../Components/MyAsyncSelect.jsx";
import { v4 } from "uuid";
import MyDataTable from "../../Components/MyDataTable.jsx";
import { ArrowRightOutlined, LoadingOutlined } from "@ant-design/icons";
import JwRmConsumptionModal from "./Modal/JwRmConsumptionModal.jsx";
import { imsAxios } from "../../axiosInterceptor.js";
import useLoading from "../../hooks/useLoading.js";
import useApi from "../../hooks/useApi.ts";
import { getVendorOptions, getProductsOptions } from "../../api/general.ts";
import { convertSelectOptions } from "../../utils/general.ts";
import { useToast } from "../../hooks/useToast.js";
import Field from "../../Components/Field.jsx";

const WISE_OPTIONS = [
  { label: "Date Wise", value: "date" },
  { label: "JW ID Wise", value: "jw" },
  { label: "SFG SKU Wise", value: "sfg" },
  { label: "Vendor Wise", value: "vendor" },
];

const EMPTY_RESULTS = {
  date: [],
  jw: [],
  sfg: [],
  vendor: [],
};

const JwRmConsumption = () => {
  const { showToast } = useToast();
  const [asyncOptions, setAsyncOptions] = useState([]);
  const [loading, setLoading] = useLoading(false);
  const [editModal, setEditModal] = useState(false);
  const [datee, setDatee] = useState("");
  const [isValid, setIsValid] = useState(false);
  const [allData, setAllData] = useState({
    setType: "date",
    jw: "",
    sku: "",
    ven: "",
  });
  const [results, setResults] = useState(EMPTY_RESULTS);
  const [actionRowId, setActionRowId] = useState(null);
  const { executeFun, loading: selectLoading } = useApi();

  const getOption = async (e) => {
    if (e?.length > 2) {
      const response = await executeFun(
        () => getProductsOptions(e),
        "select"
      );
      setAsyncOptions(response.success ? response.data : []);
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

  const getFilterValue = () => {
    switch (allData.setType) {
      case "jw":
        return allData.jw;
      case "sfg":
        return allData.sku?.value;
      case "vendor":
        return allData.ven?.value;
      default:
        return datee;
    }
  };

  const fetchData = async () => {
    const value = getFilterValue();
    if (!value) {
      setIsValid(true);
      return;
    }
    setIsValid(false);
    setLoading("fetch", true);
    const response = await imsAxios.get(
      `jobwork/rm-consumption/view?data=${encodeURIComponent(
        value
      )}&wise=${allData.setType}`
    );
    if (response.success) {
      const arr = response.data.map((row, index) => ({
        id: v4(),
        index: index + 1,
        date: row.date,
        transaction_id: row.transaction,
        transaction: row.transaction,
        vendor: row.vendor?.name || "",
        vendorCode: row.vendor?.code || "",
        sku_code: row.product?.sku || "",
        sku_name: row.product?.name || "",
        productKey: row.product?.skey || "",
        ord_qty: row.qty?.order || "0",
        consump_qty: row.qty?.consump || "0",
        // Keep original nested structure for reference
        originalData: row,
      }));
      setResults((prev) => ({ ...prev, [allData.setType]: arr }));
    } else {
      showToast(response.message, "error");
    }
    setLoading("fetch", false);
  };

  const handleActionsClick = async (row) => {
    if (actionRowId) return;
    // Use transaction_id or transaction field from the mapped data
    const jwId =
      row?.transaction_id || row?.transaction || row?.originalData?.transaction;
    // Convert qty to number if it's a string
    const qty = parseFloat(row?.ord_qty) || 0;

    if (!jwId) {
      showToast("JW ID is missing", "error");
      return;
    }

    if (!qty || qty === 0) {
      showToast("Order quantity is missing or invalid", "error");
      return;
    }

    setActionRowId(row.id);
    try {
      // Execute GET request to fetch BOM data
      const response = await imsAxios.get(
        `/jobwork/rm-consumption/view/bom?jw=${encodeURIComponent(
          jwId
        )}&qty=${qty}`
      );

      if (response.success || response.data) {
        showToast("BOM data fetched successfully", "success");
        // Open the edit modal with the row data, including qty for BOM API call
        setEditModal({
          all: allData.setType,
          row: row,
          bomData: response.data?.header?.bom || response,
          qty: qty, // Store qty for use in getFetchData
        });
      } else {
        showToast(response.message || "Failed to fetch BOM data", "error");
      }
    } catch (error) {
      showToast(error.message || "Error fetching BOM data", "error");
    } finally {
      setActionRowId(null);
    }
  };

  const columns = [
    { field: "index", headerName: "S No.", width: 80 },
    { field: "date", headerName: "JW Date", width: 120 },
    { field: "vendor", headerName: "Vendor", width: 250 },
    { field: "transaction_id", headerName: "JW Id", width: 190 },
    { field: "sku_code", headerName: "SKU", width: 120 },
    { field: "sku_name", headerName: "Product", width: 300 },
    { field: "ord_qty", headerName: "JW PO Order Qty", width: 150 },
    { field: "consump_qty", headerName: "Consumed Qty", width: 150 },
    {
      type: "actions",
      headerName: "Actions",
      width: 100,
      getActions: ({ row }) =>
        actionRowId === row.id
          ? [
              <LoadingOutlined
                key={row.id}
                style={{ color: "#1890ff", fontSize: "15px" }}
              />,
            ]
          : [
              <ArrowRightOutlined
                key={row.id}
                onClick={() => handleActionsClick(row)}
                style={{
                  color: "#1890ff",
                  fontSize: "15px",
                  cursor: actionRowId ? "not-allowed" : "pointer",
                  opacity: actionRowId ? 0.5 : 1,
                }}
              />,
            ],
    },
  ];

  return (
    <div style={{ height: "95%", padding: 10 }}>
      <Row gutter={10}>
        <Col span={4}>
          <Select
            placeholder="Please Select Option"
            style={{ width: "100%" }}
            options={WISE_OPTIONS}
            value={allData.setType}
            onChange={(e) => {
              setIsValid(false);
              setAllData((allData) => {
                return { ...allData, setType: e };
              });
            }}
          />
        </Col>
        {allData.setType == "date" ? (
          <>
            <Col span={5}>
              <MyDatePicker
                setDateRange={setDatee}
                value={datee}
                size="default"
                showError={isValid}
              />
            </Col>
            <Col span={2}>
              <Button type="primary" loading={loading("fetch")} onClick={fetchData}>
                Fetch
              </Button>
            </Col>
          </>
        ) : allData.setType == "jw" ? (
          <>
            <Col span={6}>
              <Field
                attr="required | Please enter JW/Challan"
                value={allData.jw}
                showValidation={isValid}
                onChange={(e) =>
                  setAllData((allData) => {
                    return { ...allData, jw: e.target.value };
                  })
                }
              >
                <Input placeholder="JW/Challan" />
              </Field>
            </Col>
            <Col span={2}>
              <Button loading={loading("fetch")} type="primary" onClick={fetchData}>
                Fetch
              </Button>
            </Col>
          </>
        ) : allData.setType == "sfg" ? (
          <>
            <Col span={6}>
              <MyAsyncSelect
                style={{ width: "100%" }}
                onBlur={() => setAsyncOptions([])}
                loadOptions={getOption}
                value={allData.sku}
                labelInValue={true}
                showError={isValid}
                selectLoading={selectLoading("select")}
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
              <Button loading={loading("fetch")} type="primary" onClick={fetchData}>
                Fetch
              </Button>
            </Col>
          </>
        ) : (
          <>
            <Col span={6}>
              <MyAsyncSelect
                style={{ width: "100%" }}
                onBlur={() => setAsyncOptions([])}
                loadOptions={getVendor}
                value={allData.ven}
                labelInValue={true}
                showError={isValid}
                selectLoading={selectLoading("select")}
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
              <Button loading={loading("fetch")} type="primary" onClick={fetchData}>
                Fetch
              </Button>
            </Col>
          </>
        )}
      </Row>

      <div style={{ height: "95%", marginTop: "10px" }}>
        <MyDataTable
          loading={loading("fetch")}
          data={results[allData.setType] ?? []}
          columns={columns}
        />
      </div>

      <JwRmConsumptionModal
        editModal={editModal}
        setEditModal={setEditModal}
        fetchData={fetchData}
      />
    </div>
  );
};

export default JwRmConsumption;
