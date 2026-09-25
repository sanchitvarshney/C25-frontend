import { useState, useEffect } from "react";
import { Col, Input, Row, Space } from "antd";
import MySelect from "../../Components/MySelect";
import MyDatePicker from "../../Components/MyDatePicker";
import MyDataTable from "../../Components/MyDataTable";
import { GridActionsCellItem } from "@mui/x-data-grid";
import { CommonIcons } from "../../Components/TableActions.jsx/TableActions";
import { downloadCSV } from "../../Components/exportToCSV";
import MyAsyncSelect from "../../Components/MyAsyncSelect";
import { getClientOptions } from "./components/api";
import { imsAxios } from "../../axiosInterceptor";
import { useToast } from "../../hooks/useToast.js";
import printFunction, {
  downloadFunction,
} from "../../Components/printFunction";
import MyButton from "../../Components/MyButton";
import Field from "../../Components/Field.jsx";
//
const WoCompleted = () => {
  const actionColumn = {
    headerName: "",
    field: "actions",
    width: 10,
    type: "actions",
    getActions: ({ row }) => [
      <GridActionsCellItem
        showInMenu
        key={"print"}
        onClick={() => printwocompleted(row)}
        label="Print"
      />,
      <GridActionsCellItem
        showInMenu
        key={"download"}
        onClick={() => {
          downloadwocompleted(row);
        }}
        label="Download"
      />,
    ],
  };
  const [wise, setWise] = useState(wiseOptions[0].value);
  const [searchInput, setSearchInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [isValid, setIsValid] = useState(false);
  const [asyncOptions, setAsyncOptions] = useState([]);
  const [rows, setRows] = useState([]);
  const { showToast } = useToast();

  const handleClientOptions = async (search) => {
    try {
      setLoading("select");
      const arr = await getClientOptions(search);
      setAsyncOptions(arr);
    } catch (error) {
      showToast(
        error?.message || "Some error occured while fetching clients",
        "error",
      );
    } finally {
      setLoading(false);
    }
  };

  const printwocompleted = async (row) => {
    try {
      setLoading("fetch");
      const response = await imsAxios.post(
        "/createwo/print_wo_completed_list",
        {
          transaction: row.transactionId,
        },
      );

      if (response.success) {
        printFunction(response.data.buffer.data);
        showToast(response.message, "success");
      } else {
        showToast(response.message || "Some error occured", "error");
      }
    } catch (error) {
      console.log("some error occured while fetching rows", error);
    } finally {
      setLoading(false);
    }
  };

  const downloadwocompleted = async (row) => {
    try {
      setLoading("fetch");
      const response = await imsAxios.post(
        "/createwo/print_wo_completed_list",
        {
          transaction: row.transactionId,
        },
      );

      if (response.success) {
        downloadFunction(response.data.buffer.data, "wo_completed.pdf");
        showToast(response.message, "success");
      } else {
        showToast(response.message || "Some error occured", "error");
      }
    } catch (error) {
      console.log("some error occured while fetching rows", error);
    } finally {
      setLoading(false);
    }
  };

  const isSearchInputEmpty = () => {
    if (wise === wiseOptions[1].value) {
      return !searchInput || searchInput === "";
    }
    return (
      searchInput === undefined ||
      searchInput === null ||
      searchInput === "" ||
      (typeof searchInput === "object" && !searchInput?.value)
    );
  };

  const getRows = async () => {
    if (isSearchInputEmpty()) {
      setIsValid(true);
      return;
    }
    setIsValid(false);
    try {
      setLoading("fetch");
      const response = await imsAxios.post(
        "/createwo/fetch_wo_completed_list",
        {
          wise: wise,
          data: searchInput?.value || searchInput,
        },
      );

      if (response.success) {
        const arr = response.data.map((row, index) => ({
          id: index + 1,
          date: row.date,
          requiredQty: row.ord_qty,
          sku: row.sku_code,
          product: row.sku_name,
          transactionId: row.transaction_id,
        }));
        setRows(arr);
      } else {
        showToast(response.message || "Some error occured", "error");
      }
    } catch (error) {
      showToast(
        error?.message || "Some error occured while fetching rows",
        "error",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (wise !== wiseOptions[1].value) {
      setSearchInput("");
    }
    setIsValid(false);
  }, [wise]);

  return (
    <div style={{ height: "calc(100vh - 180px)", margin: "10px" }}>
      <Row justify="space-between">
        <Col>
          <Space>
            <div style={{ paddingBottom: "10px" }}>
              <Space>
                <div style={{ width: 200 }}>
                  <MySelect
                    onChange={setWise}
                    options={wiseOptions}
                    value={wise}
                    placeholder="Select Wise"
                    showError={isValid}
                    message="Please select a wise!"
                  />
                </div>
                {wise === wiseOptions[0].value && (
                  <div style={{ width: 270 }}>
                    <MyAsyncSelect
                      selectLoading={loading === "select"}
                      optionsState={asyncOptions}
                      onBlur={() => setAsyncOptions([])}
                      value={searchInput}
                      labelInValue
                      onChange={setSearchInput}
                      loadOptions={handleClientOptions}
                      showError={isValid}
                      message="Please select a client!"
                    />
                  </div>
                )}
                {wise === wiseOptions[1].value && (
                  <MyDatePicker
                    setDateRange={setSearchInput}
                    showError={isValid}
                    message="Please select a date range!"
                    value={searchInput}
                  />
                )}
                {wise === wiseOptions[2].value && (
                  <div style={{ width: 270 }}>
                    <Field
                      attr="required | Please enter a work order number!"
                      value={searchInput}
                      showValidation={isValid}
                    >
                      <Input
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                      />
                    </Field>
                  </div>
                )}

                <MyButton
                  variant="search"
                  onClick={getRows}
                  loading={loading === "fetch"}
                  type="primary"
                >
                  Fetch
                </MyButton>
              </Space>
            </div>
          </Space>
        </Col>
        <CommonIcons
          action="downloadButton"
          type="primary"
          onClick={() => {
            downloadCSV(rows, downldcolumns, "Challan Report");
          }}
        />
      </Row>
      <div style={{ height: "calc(100vh - 185px)", marginTop: "10px" }}>
        <MyDataTable
          loading={loading === "fetch"}
          data={rows}
          columns={[actionColumn, ...columns]}
        />
      </div>
    </div>
  );
};

const wiseOptions = [
  {
    text: "Client Wise",
    value: "clientwise",
  },
  {
    text: "Date Wise",
    value: "datewise",
  },
  {
    text: "Work Order Wise",
    value: "wo_sfg_wise",
  },
];

// id: index + 1,
//         date: row.date,
//         requiredQty: row.ord_qty,
//         sku: row.sku_name,
//         product: row.sku_code,
//         transactionId:
const columns = [
  {
    headerName: "#",
    flex: 1,
    field: "id",
  },
  {
    headerName: "Date",
    flex: 1,
    field: "date",
  },
  {
    headerName: "SKU",
    flex: 1,
    field: "sku",
  },
  {
    headerName: "Product",
    flex: 1,
    field: "product",
  },
  {
    headerName: "Wo Number",
    flex: 1,
    field: "transactionId",
  },
  {
    headerName: "Quantity",
    flex: 1,
    field: "requiredQty",
  },
];
const downldcolumns = [
  {
    headerName: "Date",
    Width: 130,
    field: "date",
  },
  {
    headerName: "SKU",
    width: 100,
    field: "sku",
  },
  {
    headerName: "Product",
    width: 200,
    field: "product",
  },
  {
    headerName: "Wo Number",
    width: 200,
    field: "transactionId",
  },
  {
    headerName: "Quantity",
    width: 150,
    field: "requiredQty",
  },
];

export default WoCompleted;
