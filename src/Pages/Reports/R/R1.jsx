import React, { useState, useEffect } from "react";
import "./r.css";
import "../../Store/MaterialTransfer/Modal/viewModal.css";
import { downloadCSVCustomColumns } from "../../../Components/exportToCSV";
import { Row, Col, Button, Spin, Select, Space } from "antd";
import { MdOutlineDownloadForOffline } from "react-icons/md";
import { SearchOutlined } from "@ant-design/icons";

import MyDataTable from "../../../Components/MyDataTable";
import Tooltip from "@mui/material/Tooltip";
import MyAsyncSelect from "../../../Components/MyAsyncSelect";
import MyDatePicker from "../../../Components/MyDatePicker";
import { getProductsOptions } from "../../../api/general.ts";
import useApi from "../../../hooks/useApi.ts";
import { imsAxios } from "../../../axiosInterceptor";
import { useToast } from "../../../hooks/useToast.js";
import { v4 } from "uuid";

const R1 = () => {
  const { showToast } = useToast();
  const { executeFun, loading: loading1 } = useApi();
  const [allResponseData, setAllResponseData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [asyncOptions, setAsyncOptions] = useState([]);
  const [bomOptions, setBomOptions] = useState([]);
  const [filters, setFilters] = useState({
    selectProduct: undefined,
    bom: undefined,
    date: "",
  });

  const columns = [
    { field: "sku", headerName: "SKU", width: 60 },
    { field: "partno", headerName: "Part", width: 100 },
    { field: "new_partno", headerName: "Cat Part Code", width: 150 },
    {
      field: "components",
      headerName: "Component",
      width: 250,
    },
    {
      field: "bom_category",
      headerName: "Category",
      width: 120,
    },
    {
      field: "actions",
      headerName: "Status",
      width: 150,
      type: "actions",
      // getActions: ({ row }) => [<DownloadOutlined />],
      renderCell: (a) =>
        a.row.bom_status ==
        '<span style="color: #2db71c; font-weight: 600;">ACTIVE</span>' ? (
          <div
            style={{
              width: "80%",
              textAlign: "center",
              backgroundColor: "#03C988",
            }}
          >
            <span
              style={{
                color: "white",
                fontWeight: "bolder",
              }}
            >
              ACTIVE
            </span>
          </div>
        ) : a.row.bom_status ==
          '<span style="color: #e53935; font-weight: 600;">INACTIVE</span>' ? (
          <div
            style={{
              width: "80%",
              textAlign: "center",
              backgroundColor: "#FF1E00",
            }}
          >
            <span
              style={{
                color: "white",
                fontWeight: "bolder",
              }}
            >
              INACTIVE
            </span>
          </div>
        ) : a.row.bom_status ==
          '<span style="color: #ff9800; font-weight: 600;">ALTERNATIVE</span>' ? (
          <div
            style={{
              width: "100%",
              textAlign: "center",
              backgroundColor: "#FFB200",
            }}
          >
            <span style={{ color: "white" }}>ALTERNATIVE</span>
          </div>
        ) : (
          ""
        ),
    },
    {
      field: "bomalt_name",
      headerName: "Alternate Of",
      width: 120,
      renderCell:({row})=> (<Tooltip title={row.bomalt_name}>{row.bomalt_part}</Tooltip>)
    },
    { field: "bomqty", headerName: "BOM Qty", width: 100 },
    { field: "units_name", headerName: "UoM", width: 100 },
    { field: "opening", headerName: "Opening", width: 120 },
    { field: "inward", headerName: "Inward", width: 120 },
    { field: "outward", headerName: "Outward", width: 100 },
    { field: "closing", headerName: "Closing", width: 100 },
    {
      field: "weightedPurchaseRate",
      headerName: "Weighted Average Rate",
      width: 180,
    },
    {
      field: "transit_in",
      headerName: "Order In Transit",
      width: 150,
    },
    {
      field: "lastrate",
      headerName: "Last Purchase Price",
      width: 180,
    },
    {
      field: "currency",
      headerName: "Currency",
      width: 180,
    },
  ];

  const getProductOptions = async (searchInput) => {
    if (searchInput?.length > 2) {
      const response = await executeFun(
        () => getProductsOptions(searchInput, true),
        "select",
      );
      setAsyncOptions(response?.data || []);
    }
  };

  const getBomOptions = async (productValue) => {
    if (!productValue) {
      setBomOptions([]);
      return;
    }
    const response = await imsAxios.post("/backend/fetchBomForProduct", {
      search: productValue,
    });
    const arr = (response?.data || []).map((item) => ({
      value: item.bomid,
      label: item.bomname,
    }));
    setBomOptions(arr);
  };

  useEffect(() => {
    getBomOptions(filters.selectProduct?.value ?? filters.selectProduct);
  }, [filters.selectProduct]);

  const handleSearch = async () => {
    if (!filters.selectProduct?.value) {
      showToast("Please select product", "error");
      return;
    }
    if (!filters.bom?.value) {
      showToast("Please select BOM", "error");
      return;
    }
    setLoading(true);
    setAllResponseData([]);
    const response = await imsAxios.post("/report1", {
      product: filters.selectProduct?.value ?? filters.selectProduct,
      subject: filters.bom?.value ?? filters.bom,
      date: filters.date,
      action: "search_r1",
    });
    if (response.success) {
      const arr = (response.data || []).map((row) => ({
        ...row,
        id: v4(),
      }));
      setAllResponseData(arr);
      setLoading(false);
    } else {
      showToast(response.message, "error");
      setLoading(false);
    }
  };

  const handleDownloadingCSV = () => {
    let arr = [];
    let csvData = [];
    arr = allResponseData;
    csvData = arr.map((row) => {
      return {
        Sku: row.sku,
        Part: row.partno,
        Component: row.components,
        Category: row.bom_category,
        Status:
          row.bom_status ==
          '<span style="color: #2db71c; font-weight: 600;">ACTIVE</span>'
            ? "ACTIVE"
            : row.bom_status ==
              '<span style="color: #ff9800; font-weight: 600;">ALTERNATIVE</span>'
            ? "ALTERNATIVE"
            : "INACTIVE",
        "Alt Of": row.bomalt_name[0],
        "Bom Qty": row.bomqty,
        Uom: row.units_name,
        Opening: row.opening == 0 ? "0" : row.opening,
        Inward: row.inward == 0 ? "0" : row.inward,
        Outward: row.outward == 0 ? "0" : row.outward,
        Closing: row.closing == 0 ? "0" : row.closing,
        "Order In Transit": row.transit_in == 0 ? "0" : row.transit_in,
        "Last Purchase Price": row.lastrate == 0 ? "0" : row.lastrate,
        Currency: row.currency,
      };
    });
    downloadCSVCustomColumns(csvData, "Bom Wise Report");
  };
  const reset = () => {
    setAllResponseData([]);
  };

  return (
    <div style={{ height: "97%" }}>
      <Row>
        <Col span={24}>
          <div
            style={{
              margin: "0 15px",
            }}
          >
            <Space style={{ width: "100%" }} size={10} wrap>
              <div style={{ minWidth: 240, flex: 1 }}>
                <MyAsyncSelect
                  selectLoading={loading1("select")}
                  style={{ width: "100%" }}
                  loadOptions={getProductOptions}
                  onBlur={() => setAsyncOptions([])}
                  labelInValue
                  value={filters.selectProduct}
                  placeholder="Product Name / SKU"
                  optionsState={asyncOptions}
                  onChange={(value) =>
                    setFilters((prev) => ({
                      ...prev,
                      selectProduct: value,
                      bom: undefined,
                    }))
                  }
                />
              </div>
              <div style={{ minWidth: 220 }}>
                <Select
                  style={{ width: "100%" }}
                  placeholder="Select BOM"
                  options={bomOptions}
                  labelInValue
                  value={filters.bom || undefined}
                  onChange={(bom) =>
                    setFilters((prev) => ({
                      ...prev,
                      bom,
                    }))
                  }
                />
              </div>
              <div style={{ minWidth: 240 }}>
                <MyDatePicker
                  setDateRange={(value) =>
                    setFilters((prev) => ({
                      ...prev,
                      date: value,
                    }))
                  }
                  value={filters.date}
                  size="default"
                />
              </div>
              <Button
                type="primary"
                icon={<SearchOutlined />}
                onClick={handleSearch}
                loading={loading}
                style={{
                  minWidth: 110,
                }}
              >
                Search
              </Button>
              {allResponseData.length >= 1 && (
                <Button onClick={handleDownloadingCSV}>
                  <MdOutlineDownloadForOffline style={{ fontSize: "20px" }} />
                </Button>
              )}
            </Space>
          </div>
        </Col>
      </Row>

      <div className="hide-select" style={{ height: "calc(100% - 30px)", margin: "10px" }}>
        {loading ? (
          <div
            style={{
              height: "80vh",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div
              style={{
                display: "flex",
                // border: "1px solid red",
                width: "10%",
                justifyContent: "space-around",
              }}
            >
              <Spin size="large" />
              <div
                style={{
                  borderLeft: "2px solid grey",
                  height: "40px",
                }}
              ></div>
              <Button onClick={reset}>Reset</Button>
            </div>
          </div>
        ) : (
          <MyDataTable
            checkboxSelection={true}
            data={allResponseData}
            columns={columns}
            // loading={loading}
          />
        )}
      </div>

    </div>
  );
};

export default R1;
