import React, { useState, useEffect } from "react";
import "./r.css";
import { Button, Col, Input, Row, Skeleton } from "antd";
import { useToast } from "../../../hooks/useToast.js";
import {
  downloadCSV} from "../../../Components/exportToCSV";
import MyDataTable from "../../../Components/MyDataTable";
import { v4 } from "uuid";
import MyAsyncSelect from "../../../Components/MyAsyncSelect";
import MySelect from "../../../Components/MySelect";
import SingleDatePicker from "../../../Components/SingleDatePicker";
import { MdOutlineDownloadForOffline } from "react-icons/md";
import { imsAxios } from "../../../axiosInterceptor";
import { getProductsOptions } from "../../../api/general.ts";
import useApi from "../../../hooks/useApi.ts";
import MyButton from "../../../Components/MyButton";
import { Tooltip } from "@mui/material";
const { TextArea } = Input;
function R9() {
  const { showToast } = useToast();
  const [locDataTo, setloctionDataTo] = useState([]);
  const [asyncOptions, setAsyncOptions] = useState([]);

  const [seacrh, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  const [bomName, setBomName] = useState([]);
  const [selectDate, setSelectDate] = useState("");
  const [allData, setAllData] = useState({
    selectProduct: "",
    selectBom: "",
    selectLocation: "",
  });
  const [resData, setResData] = useState([]);
  const [locationDetail, setLocationDetail] = useState("");

  const { executeFun, loading1 } = useApi();
  const handleDownloadingCSV = () => {
    downloadCSV(resData, columns, "Location Wise BOM Report");
  };

  const getDataBySearch = async (searchInput) => {
    if (searchInput?.length > 2) {
      const response = await executeFun(
        () => getProductsOptions(searchInput, true),
        "select"
      );
      setAsyncOptions(response.data);
    }
  };

const getDataByLocation = async (e) => {
  try {
    const response = await imsAxios.post("/backend/fetchLocation");
    let v = [];
    response.data?.map((ad) => v.push({ text: ad.text, value: ad.id }));
    setloctionDataTo(v);

    if (e?.length > 3) {
      const response = await imsAxios.post("/backend/fetchLocation", {
        searchTerm: e,
      });

      if (!response.success) {
        showToast(response.message, "error");
      } else {
        let arr = [];
        arr = response.data.map((d) => {
          return { text: d.text, value: d.id };
        });
        setloctionDataTo(arr);
      }
    }
  } catch (error) {
    console.error("Error fetching location data:", error);
    showToast(
      error?.response?.data?.message ||
        error?.message ||
        "Failed to fetch location data",
      "error"
    );
  }
};

  const getBom = async () => {
    const response = await imsAxios.post("/backend/fetchBomForProduct", {
      search: allData?.selectProduct,
    });
    const arr = response.data.map((d) => {
      return { value: d.bomid, text: d.bomname };
    });
    setBomName(arr);
  };

  const fetchBySearch = async () => {
    if (!allData.selectProduct) {
      showToast("Please select a product", "error");
    } else if (!allData.selectBom) {
      showToast("Please select a bom", "error");
    } else if (!allData.selectLocation) {
      showToast("Please select a Location", "error");
    } else if (!selectDate[0]) {
      showToast("Please select a valid date", "error");
    } else {
      setLoading(true);
      const response = await imsAxios.post("/report9", {
        skucode: allData.selectProduct,
        subject: allData.selectBom,
        location: allData.selectLocation,
        date: selectDate,
        action: "search_r9",
      });
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
      } else if (!response.success) {
        setLoading(true);
        showToast(response.message, "error");
        setLoading(false);
      }
    }
  };

  const getLocationFunctionTo = async (e) => {
    const response = await imsAxios.post("/backend/fetchLocation", {
      seacrhTerm: e,
    });

    let v = [];
    response.data.map((ad) => v.push({ text: ad.text, value: ad.id }));
    setloctionDataTo(v);
  };

  const getLocationShow = async () => {
    const response = await imsAxios.post("/report9/fetchLocationDetail", {
      location_key: allData?.selectLocation,
    });
    setLocationDetail(response.data);
  };

  const columns = [
    // { field: "dt", headerName: "S.No.", width: 150 },
    { field: "partno", headerName: "Part No", width: 80 },
    { field: "new_partno", headerName: "Cat Part Code", width: 150 },
    {
      field: "components",
      headerName: "Component",
      width: 380,
    },
    { field: "category", headerName: "Category", width: 100 },
    {
      field: "status",
      headerName: "Status",
      width: 150,
      type: "status",
      renderCell: ({ row }) => (
        <span dangerouslySetInnerHTML={{ __html: row.statusHtml }} />
      ),
    },
    { field: "bomalt_part", headerName: "Alt Of", width: 120, renderCell:({row})=> (<Tooltip title={row.bomalt_name}>{row.bomalt_part}</Tooltip>) },
    { field: "bomqty", headerName: "Bom Qty", width: 120 },
    { field: "uom", headerName: "UoM", width: 100 },
    { field: "openBal", headerName: "Op Qty", width: 100 },
    { field: "creditBal", headerName: "In Qty", width: 100 },
    { field: "debitBal", headerName: "Out Qty", width: 100 },
    { field: "closingBal", headerName: "Cl Qty", width: 100 },
    {
      field: "weightedPurchaseRate",
      headerName: "Weighted Average Rate",
      width: 180,
    },
  ];

  useEffect(() => {
    if (allData?.selectProduct) {
      getBom();
    }
  }, [allData?.selectProduct]);

  useEffect(() => {
    if (allData.selectProduct || allData.selectBom) {
      getLocationFunctionTo();
    }
  }, [allData.selectProduct || allData.selectBom]);

  useEffect(() => {
    if (allData?.selectLocation) {
      getLocationShow();
    }
  }, [allData?.selectLocation]);

  useEffect(() => {
    getDataByLocation();
  }, []);

  return (
    <div style={{ height: "calc(100vh - 200px)",  }}>
      <Row gutter={16} style={{ margin: "5px" }}>
        <Col span={5}>
          <Row gutter={16}>
            <Col span={24}>
              <MyAsyncSelect
                style={{ width: "100%" }}
                onBlur={() => setAsyncOptions([])}
                optionsState={asyncOptions}
                placeholder="Select Product"
                loadOptions={getDataBySearch}
                value={allData.selectProduct.value}
                onChange={(e) =>
                  setAllData((allData) => {
                    return { ...allData, selectProduct: e };
                  })
                }
              />
            </Col>
            <Col span={24} style={{ marginTop: "5px" }}>
              <MySelect
                placeholder="Select Bom"
                options={bomName}
                value={allData?.selectBom.value}
                onChange={(e) =>
                  setAllData((allData) => {
                    return { ...allData, selectBom: e };
                  })
                }
              />
            </Col>
            <Col span={24} style={{ marginTop: "5px" }}>
              <MyAsyncSelect
                style={{ width: "100%" }}
                onBlur={() => setAsyncOptions([])}
                optionsState={locDataTo}
                placeholder="Select Location"
                loadOptions={getDataByLocation}
                onInputChange={(e) => setSearch(e)}
                value={allData.selectLocation.value}
                onChange={(e) =>
                  setAllData((allData) => {
                    return { ...allData, selectLocation: e };
                  })
                }
              />
            </Col>
            <Col span={24} style={{ marginTop: "5px" }}>
              <SingleDatePicker setDate={setSelectDate} />
            </Col>
            <Col span={24} style={{ marginTop: "5px" }}>
              {locationDetail.length > 1 && (
                <TextArea rows={3} disabled value={locationDetail} />
              )}
            </Col>
            {allData?.selectBom.length > 1 && (
              <Col span={24} style={{ marginTop: "5px" }}>
                <div style={{ display: "flex", justifyContent: "end" }}>
                  {/* <Button
                    onClick={reset}
                    style={{ backgroundColor: "red", color: "white", marginRight: "5px" }}
                  >
                    Cancel
                  </Button> */}
                  <MyButton
                    variant="search"
                    onClick={fetchBySearch}
                    type="primary"
                  >
                    Generate
                  </MyButton>
                </div>
              </Col>
            )}
          </Row>
        </Col>
        <Col span={19}>
          <Row>
            {resData.length > 1 && (
              <Col span={24}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "end",
                    marginBottom: "5px",
                  }}
                >
                  <Button onClick={handleDownloadingCSV}>
                    <MdOutlineDownloadForOffline style={{ fontSize: "20px" }} />
                  </Button>
                </div>
              </Col>
            )}
            <Col span={24}>
              <Skeleton loading={loading} active>
                <div className="hide-select" style={{ height: "calc(100vh - 130px)" }}>
                  <MyDataTable
                    checkboxSelection={true}
                    loading={loading}
                    data={resData}
                    columns={columns}
                  />
                </div>
              </Skeleton>
            </Col>
          </Row>
        </Col>
      </Row>
    </div>
  );
}

export default R9;
