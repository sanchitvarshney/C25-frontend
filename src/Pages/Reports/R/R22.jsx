import { Col, Row } from "antd";
import { useState } from "react";
import MyAsyncSelect from "../../../Components/MyAsyncSelect";
import MySelect from "../../../Components/MySelect";
import SingleDatePicker from "../../../Components/SingleDatePicker";
import { imsAxios } from "../../../axiosInterceptor";
import { useEffect } from "react";
import { useToast } from "../../../hooks/useToast.js";
import { v4 } from "uuid";
import MyDataTable from "../../../Components/MyDataTable";
import { getProductsOptions } from "../../../api/general.ts";
import useApi from "../../../hooks/useApi.ts";
import MyButton from "../../../Components/MyButton";
function R22() {
  const { showToast } = useToast();
  const [asyncOptions, setAsyncOptions] = useState([]);
  const [selectDate, setSelectDate] = useState("");
  const [isValid, setIsValid] = useState(false);
  const [bomName, setBomName] = useState([]);
  const [loading, setLoading] = useState(false);
  const [allData, setAllData] = useState({
    selectProduct: "",
    selectBom: "",
  });
  const [resData, setResData] = useState([]);

  const { executeFun } = useApi();
  const getDataBySearch = async (searchInput) => {
    setLoading("fetch");
    try {
      if (searchInput?.length > 2) {
        const response = await executeFun(
          () => getProductsOptions(searchInput, true),
          "select",
        );
        if (response?.success) {
          setLoading(false);
          setAsyncOptions(response.data);
        } else {
          setLoading(false);
          showToast(response.message, "error");
        }
      }
    } catch (error) {
      showToast(error?.message || "Failed to fetch data", "error");
    }
  };
  const getBom = async () => {
    const response = await imsAxios.post("/backend/fetchBomForProduct", {
      search: allData?.selectProduct?.key,
    });

    const arr = response.data.map((d) => {
      return { value: d.bomid, text: d.bomname };
    });
    setBomName(arr);
  };
  const fetchBySearch = async () => {
    if (!allData.selectProduct) {
      setIsValid(true);
      return;
    } else {
      setLoading("load");
      const response = await imsAxios.post("/report22", {
        skucode: allData.selectProduct?.key,
        subject: allData.selectBom,
        date: selectDate,
      });
      // console.log(data);
      if (response.success) {
        let arr = response.data.map((row) => {
          return {
            ...row,
            id: v4(),
            statusHtml: row.status,
            status: row.status?.includes("INACTIVE")
              ? "INACTIVE"
              : row.status.includes("ALTERNATIVE")
                ? "ALTERNATIVE"
                : row.status.includes("ACTIVE")
                  ? "ACTIVE"
                  : "",
          };
        });

        setResData(arr);
        setLoading(false);
      } else {
        showToast(response.message, "error");
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    if (allData?.selectProduct) {
      getBom();
    }
  }, [allData?.selectProduct]);

  return (
    <div>
      {" "}
      <div style={{ height: "100%" }}>
        <Row gutter={16} style={{ margin: "5px" }}>
          <Col span={5}>
            <MyAsyncSelect
              loadOptions={getDataBySearch}
              onBlur={() => setAsyncOptions([])}
              optionsState={asyncOptions}
              selectLoading={loading === "fetch"}
              placeholder="Select Product"
              value={allData.selectProduct}
              labelInValue
              onChange={(e) =>
                setAllData((allData) => {
                  return { ...allData, selectProduct: e };
                })
              }
              message="Select Product"
              showError={isValid}
            />
          </Col>
          <Col span={4}>
            <MySelect
              placeholder="Select Bom"
              options={bomName}
              value={allData?.selectBom}
              onChange={(e) =>
                setAllData((allData) => {
                  return { ...allData, selectBom: e };
                })
              }
              message="Select Bom"
              showError={isValid}
            />
          </Col>
          <Col span={4}>
            <SingleDatePicker
              setDate={setSelectDate}
              value={selectDate}
              showError={isValid}
            />
          </Col>

          <Col span={4}>
            <div>
              {/* <Button
                    onClick={reset}
                    style={{ backgroundColor: "red", color: "white", marginRight: "5px" }}
                  >
                    Cancel
                  </Button> */}
              <MyButton variant="search" onClick={fetchBySearch} type="primary">
                Generate
              </MyButton>
            </div>
          </Col>

          <Col span={24}>
            <div
              className="hide-select"
              style={{ height: "75vh", marginTop: "0.75em" }}
            >
              <MyDataTable
                checkboxSelection={true}
                loading={loading == "load"}
                data={resData}
                columns={columns}
              />
            </div>
          </Col>
        </Row>
      </div>
    </div>
  );
}

export default R22;
const columns = [
  { field: "serial_no", headerName: "S. No", width: 40 },
  { field: "partno", headerName: "Part No", width: 80 },
  { field: "new_partno", headerName: "Cat Part Code", width: 150 },
  { field: "bomalt_name", headerName: "Bom ALt Name", width: 100 },
  { field: "bomalt_part", headerName: "Alt Of", width: 80 },
  { field: "bomqty", headerName: "Bom Qty", width: 80 },
  { field: "category", headerName: "Category", width: 80 },
  { field: "components", headerName: "Components", flex: 1 },
  { field: "uom", headerName: "UoM", width: 80 },
  { field: "closingBal", headerName: "Cl Qty", width: 80 },
  { field: "openBal", headerName: "Op Qty", width: 80 },
  { field: "creditBal", headerName: "In Qty", width: 80 },
  { field: "debitBal", headerName: "Out Qty", width: 80 },
  //   { field: "openBal", headerName: "Open Bal", width: 80 },
  {
    field: "status",
    headerName: "Status",
    width: 80,
    type: "status",
    renderCell: ({ row }) => (
      <span dangerouslySetInnerHTML={{ __html: row.statusHtml }} />
    ),
  },
];
