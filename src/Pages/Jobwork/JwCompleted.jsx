import { useState } from "react";
import { Col, Input, Row, Select } from "antd";
import MyAsyncSelect from "../../Components/MyAsyncSelect";
import MyDataTable from "../../Components/MyDataTable";
import MyDatePicker from "../../Components/MyDatePicker";
import { useToast } from "../../hooks/useToast.js";
import { v4 } from "uuid";
import CompletedModal from "./Modal/CompletedModal";
import { imsAxios } from "../../axiosInterceptor";
import printFunction, {
  downloadFunction,
} from "../../Components/printFunction";
import TableActions from "../../Components/TableActions.jsx/TableActions";
import ViewModal from "./Modal/ViewModal";
import { getVendorOptions, getProductsOptions } from "../../api/general.ts";
import { convertSelectOptions } from "../../utils/general.ts";
import useApi from "../../hooks/useApi.ts";
import useLoading from "../../hooks/useLoading";
import MyButton from "../../Components/MyButton";
import Field from "../../Components/Field.jsx";

const WISE_OPTIONS = [
  { label: "Date Wise", value: "datewise" },
  { label: "JW ID Wise", value: "jw_transaction_wise" },
  { label: "SFG SKU Wise", value: "jw_sfg_wise" },
  { label: "Vendor Wise", value: "vendorwise" },
];

const EMPTY_RESULTS = {
  datewise: [],
  jw_transaction_wise: [],
  jw_sfg_wise: [],
  vendorwise: [],
};

const JwCompleted = () => {
  const { showToast } = useToast();
  const [viewModalOpen, setViewModalOpen] = useState(null);
  const [asyncOptions, setAsyncOptions] = useState([]);
  const [loading, setLoading] = useLoading();
  const [datee, setDatee] = useState("");
  const [isValid, setIsValid] = useState(false);
  const [allData, setAllData] = useState({
    setType: "datewise",
    jw: "",
    sku: "",
    ven: "",
  });
  const [results, setResults] = useState(EMPTY_RESULTS);
  const [editModal, setEditModal] = useState(false);
  const [printingId, setPrintingId] = useState(null);
  const [downloadingId, setDownloadingId] = useState(null);
  const { executeFun, loading: selectLoading } = useApi();

  const getOption = async (e) => {
    if (e?.length > 2) {
      const response = await executeFun(() => getProductsOptions(e), "select");
      setAsyncOptions(response.success ? response.data : []);
    }
  };

  const getVendor = async (search) => {
    if (search.length > 2) {
      const response = await executeFun(
        () => getVendorOptions(search),
        "select",
      );
      let arr = [];
      if (response.success) {
        arr = convertSelectOptions(response.data);
      }
      setAsyncOptions(arr);
    }
  };

  const handlePrint = async (row) => {
    setPrintingId(row.id);
    try {
      const response = await imsAxios.post("/jobwork/print_jw_analysis", {
        transaction: row.transaction_id,
      });
      printFunction(response?.data.buffer?.data);
    } finally {
      setPrintingId(null);
    }
  };

  const handleDownload = async (row) => {
    setDownloadingId(row.id);
    try {
      const response = await imsAxios.post("/jobwork/print_jw_analysis", {
        transaction: row.transaction_id,
      });
      downloadFunction(response?.data.buffer?.data, row.transaction_id);
    } finally {
      setDownloadingId(null);
    }
  };

  const getFilterValue = () => {
    switch (allData.setType) {
      case "jw_transaction_wise":
        return allData.jw;
      case "jw_sfg_wise":
        return allData.sku?.value;
      case "vendorwise":
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
    const response = await imsAxios.post("jobwork/fetch_jw_completed_list", {
      data: value,
      wise: allData.setType,
    });
    if (response.success) {
      const arr = response.data.map((row, index) => ({
        ...row,
        id: v4(),
        index: index + 1,
      }));
      setResults((prev) => ({ ...prev, [allData.setType]: arr }));
    } else {
      showToast(response.message, "error");
    }
    setLoading("fetch", false);
  };

  const columns = [
    { field: "index", headerName: "S No.", width: 18 },
    { field: "status", headerName: "Status", width: 120 },
    { field: "date", headerName: "JW Date", width: 120 },
    { field: "transaction_id", headerName: "JW Id.", width: 190 },
    { field: "sku_code", headerName: "SKU", width: 100 },
    { field: "sku_name", headerName: "Product", width: 510 },
    { field: "ord_qty", headerName: "Order Qty", width: 120 },
    {
      field: "actions",
      type: "actions",
      headerName: "Actions",
      width: 150,
      getActions: ({ row }) => [
        <TableActions
          key="print"
          action="print"
          disabled={printingId === row.id || downloadingId === row.id}
          onClick={() => handlePrint(row)}
        />,
        <TableActions
          key="download"
          action="download"
          disabled={printingId === row.id || downloadingId === row.id}
          onClick={() => handleDownload(row)}
        />,
        <TableActions
          key="view"
          action="view"
          onClick={() =>
            setViewModalOpen({
              jwId: row.transaction_id,
              po_sku_transaction: row.transaction_id,
              skuKey: row.sku_key,
            })
          }
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
        {allData.setType == "datewise" ? (
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
              <MyButton
                variant="search"
                type="primary"
                loading={loading("fetch")}
                onClick={fetchData}
              >
                Fetch
              </MyButton>
            </Col>
          </>
        ) : allData.setType == "jw_transaction_wise" ? (
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
              <MyButton
                variant="search"
                loading={loading("fetch")}
                type="primary"
                onClick={fetchData}
              >
                Fetch
              </MyButton>
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
              <MyButton
                variant="search"
                loading={loading("fetch")}
                type="primary"
                onClick={fetchData}
              >
                Fetch
              </MyButton>
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
              <MyButton
                variant="search"
                loading={loading("fetch")}
                type="primary"
                onClick={fetchData}
              >
                Fetch
              </MyButton>
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

      <CompletedModal editModal={editModal} setEditModal={setEditModal} />
      <ViewModal
        setViewModalOpen={setViewModalOpen}
        viewModalOpen={viewModalOpen}
      />
    </div>
  );
};

export default JwCompleted;
