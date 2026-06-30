import {  Row, Space, Input } from "antd";
import { useState, useEffect } from "react";
import { useToast } from "../../../hooks/useToast.js";
import MyAsyncSelect from "../../../Components/MyAsyncSelect";
import MyDataTable from "../../../Components/MyDataTable";
import MySelect from "../../../Components/MySelect";
import { v4 } from "uuid";
import { downloadCSV } from "../../../Components/exportToCSV";
import { CommonIcons } from "../../../Components/TableActions.jsx/TableActions";
import ToolTipEllipses from "../../../Components/ToolTipEllipses";
import { imsAxios } from "../../../axiosInterceptor";
import MyButton from "../../../Components/MyButton";

const CompletedPPR = () => {
  const { showToast } = useToast();
  const [wise, setWise] = useState("skuwise");
  const [asyncOptions, setAsyncOptions] = useState([]);
  const [searchInput, setSearchInput] = useState("");
  const [selectLoading, setSelectLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [rows, setRows] = useState([]);

  const wiseOptions = [
    { text: "Product SKU Wise  ", value: "skuwise" },
    { text: "PRR Status", value: "pprtype" },
    { text: "PRR No.", value: "pprno" },
  ];

  const selOpt = [
    { text: "New", value: "new" },
    { text: "Repair", value: "repair" },
    { text: "Testing", value: "testing" },
    { text: "Packing", value: "packing" },
  ];

  const getProductDataFromType = async (e) => {
    if (e?.length > 2) {
      setSelectLoading(true);
      const response = await imsAxios.post("/backend/fetchAllProduct", {
        searchTerm: e,
      });
      setSelectLoading(false);
      let arr = [];
      arr = response.data.map((d) => {
        return { text: d.text, value: d.id };
      });
      setAsyncOptions(arr);
    }
  };
  const getRows = async () => {
    setSearchLoading(true);
    const response = await imsAxios.post("ppr/fetchCompletePpr", {
      searchBy: wise,
      searchValue: searchInput,
    });
    setSearchLoading(false);
    if (response.success) {
      let arr = response.data.map((row, index) => {
        return {
          ...row,
          id: v4(),
          index: index + 1,
        };
      });
      setRows(arr);
    } else {
      setRows([]);
      showToast(response.message?.msg || response.message, "error");
    }
  };

  const columns = [
    { headerName: "Serial No.", width: 100, field: "index" },
    { headerName: "Type", width: 70, field: "prod_type" },
    { headerName: "Req No.", flex: 1, field: "prod_transaction" },
    {
      headerName: "Project",
      width: 150,
      field: "prod_project",
      renderCell: ({ row }) => <ToolTipEllipses text={row.prod_project} />,
    },
    { headerName: "Customer", flex: 1, field: "prod_customer" },
    { headerName: "Create By", flex: 1, field: "prod_insert_by" },
    { headerName: "Req Data/Time", flex: 1, field: "prod_insert_dt" },
    { headerName: "Product SKU", flex: 1, field: "prod_product_sku" },
    { headerName: "Product Name", flex: 1, field: "prod_name" },
    { headerName: "Planned Qty", flex: 1, field: "prod_planned_qty" },
    { headerName: "Due Date", flex: 1, field: "prod_due_date" },
    { headerName: "Qty Excuted", flex: 1, field: "totalConsumption" },
    { headerName: "Qty Remained", flex: 1, field: "consumptionRemaining" },
  ];
  useEffect(() => {
    setSearchInput("");
    if (wise == "pprtype") {
      setSearchInput("new");
    }
  }, [wise]);
  return (
    <div style={{ height: "100%", padding:10 }}>
      <Row
        justify="space-between"
      >
        <div>
          <Space>
            <div style={{ width: 200 }}>
              <MySelect
                size={"default"}
                options={wiseOptions}
                defaultValue={wiseOptions.filter((o) => o.value === wise)[0]}
                onChange={setWise}
                value={wise}
              />
            </div>
            <div style={{ width: 300 }}>
              {wise === "skuwise" ? (
                <div>
                  <MyAsyncSelect
                    size="default"
                    selectLoading={selectLoading}
                    onBlur={() => setAsyncOptions([])}
                    value={searchInput}
                    onChange={(value) => setSearchInput(value)}
                    loadOptions={getProductDataFromType}
                    optionsState={asyncOptions}
                    placeholder="Product SKU wise"
                  />
                </div>
              ) : wise == "pprtype" ? (
                <MySelect
                  options={selOpt}
                  value={searchInput}
                  onChange={(value) => setSearchInput(value)}
                />
              ) : (
                wise == "pprno" && (
                  <Input
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                  />
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
              // className="primary-button search-wise-btn"
            >
              Search
            </MyButton>
          </Space>
          {/* <div className="po_search_options">
                <div className="search-type">

                </div>
              </div> */}
        </div>
        <Space>
          <CommonIcons
            action="downloadButton"
            onClick={() => downloadCSV(rows, columns, "Completed PPR Report")}
            disabled={rows.length == 0}
          />
        </Space>
      </Row>
      <div style={{ height: "calc(100% - 40px)", marginTop:10 }}>
        <MyDataTable
          // export={true}
          columns={columns}
          data={rows}
          loading={searchLoading}
        />
      </div>
    </div>
  );
};

export default CompletedPPR;
