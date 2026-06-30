import React, { useEffect, useState } from "react";
import { Col, Row, Select, Button, Input, Card } from "antd";
import { DeleteOutlined } from "@ant-design/icons";
import MyAsyncSelect from "../../../Components/MyAsyncSelect.jsx";
import "./Modal/style.css";
import { imsAxios } from "../../../axiosInterceptor.js";
import NavFooter from "../../../Components/NavFooter.jsx";
import { getProductsOptions } from "../../../api/general.ts";
import useApi from "../../../hooks/useApi.ts";
import { v4 } from "uuid";
import { useNavigate } from "react-router-dom";
import { useToast } from "../../../hooks/useToast.js";
import Loading from "../../../Components/Loading.jsx";
import { Add, Delete } from "@mui/icons-material";
const { TextArea } = Input;

function FGToFGTransfer() {
  const [loading, setLoading] = useState(false);
  const [allData, setAllData] = useState({
    locationFrom: "",
  });

  // Convert to multiple rows structure
  const [rows, setRows] = useState([
    {
      id: v4(),
      component: "",
      qty1: "",
      locationTo: "",
      stockQty: "",
      unit: "",
      avrRate: "",
      address: "",
      comment: "",
    },
  ]);

  const [locData, setloctionData] = useState([]);
  const [asyncOptions, setAsyncOptions] = useState([]);
  const [locDataTo, setloctionDataTo] = useState([]);
  const [branchName, setbBanchName] = useState([]);
  const { showToast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
    const [hoveredRow, setHoveredRow] = useState(null);

  // Add row functionality
  const addRow = () => {
    setRows((prev) => [
      {
        id: v4(),
        component: "",
        qty1: "",
        locationTo: "",
        stockQty: "",
        unit: "",
        avrRate: "",
        address: "",
        comment: "",
      },
      ...prev,
    ]);
  };

  // Remove row functionality
  const removeRow = (id) => {
    if (rows.length > 1) {
      setRows((prev) => prev.filter((row) => row.id !== id));
    } else {
      showToast("At least one row is required", "error");
    }
  };

  // console.log(branchName);
  const getLocationFunction = async () => {
    setIsLoading(true);
    try {
      const response = await imsAxios.get("/skuQueryA/q3Location");
      if (response?.success) {
        const data = response?.data;
        let v = [];
        data?.map((ad) => v.push({ label: ad.text, value: ad.id }));
        setloctionData(v);
        setloctionDataTo(v);
        setIsLoading(false);
      } else {
        showToast(response?.message || "Data Not Found", "error");
        setIsLoading(false);
      }
    } catch (error) {
      showToast(error?.message || "Server Error", "error");
      setIsLoading(false);
    }
  };

  const branchInfoFunction = async () => {
    setIsLoading(true);
    try {
      const response = await imsAxios.post("/godown/fetchLocationDetail_from", {
        location_key: allData.locationFrom,
      });
      if (response?.success) {
        setIsLoading(false);
        setbBanchName(response?.data);
      } else {
        showToast(response?.message || "Data Not Found", "error");
        setIsLoading(false);
      }
    } catch (error) {
      showToast(error?.message || "Server Error", "error");
      setIsLoading(false);
    }
  };

  const getComponentList = async (e) => {
    setIsLoading(true);
    try {
      if (e?.length > 2) {
        const response = await getProductsOptions(e);
        if (response?.success) {
          const data = response?.data;
          const arr = Array.isArray(data)
            ? data.map((d) => ({ text: d.text, value: d.value ?? d.id }))
            : [];
          setAsyncOptions(arr);
          setIsLoading(false);
        } else {
          showToast(response?.message || "Data Not Found", "error");
          setIsLoading(false);
        }
      }
    } catch (error) {
      showToast(error?.message || "Server Error", "error");
      setIsLoading(false);
    }
  };

  const getQtyFuction = async (rowIndex, componentValue) => {
    setIsLoading(true);
    const row = rows[rowIndex];
    const component = componentValue ?? row?.component;
    if (!allData.locationFrom || !component) return;

    try {
      const { data } = await imsAxios.post("/godown/godownStocksProduct", {
        product: component,
        location: allData.locationFrom,
      });

      const stockData = data?.data ?? data;
      setRows((prev) => {
        const updated = [...prev];
        updated[rowIndex] = {
          ...updated[rowIndex],
          stockQty: stockData?.available_qty ?? "0",
          unit: stockData?.unit ?? "",
          avrRate: stockData?.avr_rate ?? "",
        };
        return updated;
      });
      setIsLoading(false);
    } catch (err) {
      setRows((prev) => {
        const updated = [...prev];
        updated[rowIndex] = {
          ...updated[rowIndex],
          stockQty: "0",
          unit: "",
          avrRate: "",
        };
        return updated;
      });
      setIsLoading(false);
    }
  };

  const saveFgToFg = async () => {
    if (!allData.locationFrom) {
      return showToast("Please select Pick Location", "error");
    }

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      if (!row.component) {
        return showToast(`Row ${i + 1}: Please select Component`, "error");
      }
      if (!row.qty1) {
        return showToast(`Row ${i + 1}: Please enter Qty`, "error");
      }
      if (!row.locationTo) {
        return showToast(`Row ${i + 1}: Please select Drop Location`, "error");
      }
      if (row.locationTo === allData.locationFrom) {
        return showToast(`Row ${i + 1}: Both Location Same`, "error");
      }
    }

    setLoading(true);

    const byDrop = {};
    rows.forEach((row) => {
      const loc = row.locationTo;
      if (!byDrop[loc]) byDrop[loc] = [];
      byDrop[loc].push(row);
    });

    try {
      const successMessages = [];
      for (const dropLocation of Object.keys(byDrop)) {
        const group = byDrop[dropLocation];
        const product = group.map((r) => r.component);
        const qty = group.map((r) => r.qty1);
        const remark = group.map((r) => (r.comment || "").trim() || "--");
        const rate = group.map((r) => r?.avrRate ?? 0);

        const res = await imsAxios.post("/godown/transferFG2FG", {
          pickLocation: allData.locationFrom,
          dropLocation,
          product,
          qty,
          remark,
          rate,
        });

        // Interceptor returns response.data when success is present, so res is already the body
        const body =
          res && typeof res === "object" && "success" in res
            ? res
            : (res?.data ?? res);

        if (body?.success !== true && body?.status !== "success") {
          showToast(body?.message || "Transfer failed", "error");
          setLoading(false);
          return;
        }
        if (body?.message) successMessages.push(body.message);
      }

      showToast(
        successMessages.length
          ? successMessages.join("\n")
          : "FG to FG transfer completed.",
        "success",
      );
      setAllData({ locationFrom: "" });
      setRows([
        {
          id: v4(),
          component: "",
          qty1: "",
          locationTo: "",
          stockQty: "",
          unit: "",
          avrRate: "",
          address: "",
          comment: "",
        },
      ]);
      setbBanchName("");
    } catch (err) {
      showToast(err?.message || "Server Error", "error");
    } finally {
      setLoading(false);
    }
  };

  const getLocationName = async (rowIndex, locationValue) => {
    const row = rows[rowIndex];
    const location = locationValue ?? row?.locationTo;
    if (!location) return;

    const { data } = await imsAxios.post("/godown/fetchLocationDetail_to", {
      location_key: location,
    });

    setRows((prev) => {
      const updated = [...prev];
      updated[rowIndex] = {
        ...updated[rowIndex],
        address: data,
      };
      return updated;
    });
  };

  const reset = async (e) => {
    e.preventDefault();
    setAllData({
      locationFrom: "",
    });
    setRows([
      {
        id: v4(),
        component: "",
        qty1: "",
        locationTo: "",
        stockQty: "",
        unit: "",
        avrRate: "",
        address: "",
        comment: "",
      },
    ]);
    setbBanchName("");
  };

  useEffect(() => {
    getLocationFunction();
  }, []);

  useEffect(() => {
    if (allData.locationFrom) {
      branchInfoFunction();
    }
  }, [allData?.locationFrom]);

  useEffect(() => {
    if (!allData.locationFrom) return;
    rows.forEach((row, index) => {
      if (row.component) {
        getQtyFuction(index, row.component);
      }
    });
  }, [allData?.locationFrom]);

  return (
    <div style={{ height: "95%" }}>
      {(loading || isLoading) && <Loading />}
      <Row gutter={10} style={{ padding: "10px", height: "79vh" }}>
        <Col span={16} style={{ marginBottom: 10 }}>
       
            <Row gutter={10} >
              <Col span={4} style={{ marginBottom: "10px", width: "100%" }}>
                <span>Pick Location</span>
              </Col>
              <Col span={6}>
                <Select
                  placeholder="Please Select Location"
                  style={{ width: "100%" }}
                  options={locData}
                  value={allData.locationFrom}
                  onChange={(e) =>
                    setAllData((allData) => {
                      return { ...allData, locationFrom: e };
                    })
                  }
                />
              </Col>
              <Col span={10} >
                <TextArea rows={1} disabled value={branchName} />
              </Col>
            </Row>
    
        </Col>

        <Col span={24}>
          <Row gutter={10}>
            <Col span={24}>
              <div
                style={{
                  overflowY: "auto",
                  height: "calc(100vh - 220px)",
                }}
              >
                <table style={{ border: "1px solid #ccc", minWidth: 1500 }}>
                  <thead>
                    <tr>
                      <th className="table-col" style={{ width: "2vw" }}>
                        #
                      </th>
                      <th className="table-col" style={{ width: "18vw" }}>
                        Product/Sku Code.
                      </th>
                      <th className="table-col" style={{ width: "12vw" }}>
                        STOCK QUANTITY
                      </th>
                      <th className="table-col" style={{ width: "12vw" }}>
                        TRANSFERING QTY
                      </th>
                      <th className="table-col" style={{ width: "16vw" }}>
                        DROP (+) Loc
                      </th>
                      <th className="table-col" style={{ width: "12vw" }}>
                        Weighted Average Rate
                      </th>
                      <th className="table-col" style={{ width: "16vw" }}>
                        Comment
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((row, index) => {
                      const rowColor = index % 2 === 0 ? "#ffffff" : "#f8f9fa";
                      return (
                        <React.Fragment key={row.id}>
                          <tr
                            style={{
                              backgroundColor:
                                hoveredRow === row.id ? "#fffaec" : rowColor,
                            }}
                            onMouseEnter={() => setHoveredRow(row.id)}
                            onMouseLeave={() => setHoveredRow(null)}
                          >
                            <td style={{ width: "2vw", textAlign: "center" }}>
                              {index > 0 && (
                                <span
                                  onClick={() => removeRow(row.id)}
                                  className="delete-icon"
                                >
                                  <Delete color="error" />
                                </span>
                              )}
                              {index === 0 && (
                                <span
                                  onClick={addRow}
                                  style={{ cursor: "pointer" }}
                                >
                                  <Add color="success" />
                                </span>
                              )}
                            </td>
                            <td style={{ width: "18vw" }}>
                              <MyAsyncSelect
                                style={{ width: "100%" }}
                                loadOptions={getComponentList}
                                onBlur={() => setAsyncOptions([])}
                                placeholder="Part Name/Code"
                                value={row.component}
                                optionsState={asyncOptions}
                                onChange={(e) => {
                                  setRows((prev) => {
                                    const updated = [...prev];
                                    updated[index] = {
                                      ...updated[index],
                                      component: e,
                                    };
                                    return updated;
                                  });
                                  getQtyFuction(index, e);
                                }}
                              />
                            </td>
                            <td style={{ width: "12vw" }}>
                              <Input
                                suffix={row.unit}
                                disabled
                                value={
                                  row.stockQty
                                    ? `${row.stockQty} ${row.unit}`
                                    : "0"
                                }
                              />
                            </td>
                            <td style={{ width: "12vw" }}>
                              <Input
                                type="number"
                                value={row.qty1}
                                onChange={(e) => {
                                  setRows((prev) => {
                                    const updated = [...prev];
                                    updated[index] = {
                                      ...updated[index],
                                      qty1: e.target.value,
                                    };
                                    return updated;
                                  });
                                }}
                                suffix={row.unit}
                              />
                            </td>
                            <td style={{ width: "16vw" }}>
                              <Select
                                style={{ width: "100%" }}
                                options={locDataTo}
                                value={row.locationTo}
                                placeholder="Location"
                                onChange={(e) => {
                                  setRows((prev) => {
                                    const updated = [...prev];
                                    updated[index] = {
                                      ...updated[index],
                                      locationTo: e,
                                    };
                                    return updated;
                                  });
                                  getLocationName(index, e);
                                }}
                              />
                            </td>
                            <td style={{ width: "12vw", textAlign: "center" }}>
                              <Input disabled value={row.avrRate} />
                            </td>
                            <td style={{ width: "16vw" }}>
                              <Input
                                value={row.comment}
                                placeholder="Comment Optional"
                                onChange={(e) => {
                                  setRows((prev) => {
                                    const updated = [...prev];
                                    updated[index] = {
                                      ...updated[index],
                                      comment: e.target.value,
                                    };
                                    return updated;
                                  });
                                }}
                              />
                            </td>
                          </tr>
                          {row.locationTo && row.address && (
                            <tr>
                              <td colSpan="7" style={{ padding: "8px" }}>
                                <TextArea
                                  disabled
                                  value={row.address}
                                  placeholder={`Row ${
                                    index + 1
                                  } - Location Address`}
                                  rows={2}
                                  style={{ width: "100%" }}
                                />
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </Col>
          </Row>
        </Col>
      </Row>
      <NavFooter
        nextLabel="Transfer"
        submitFunction={saveFgToFg}
        resetFunction={reset}
        loading={loading}
      />
    </div>
  );
}

export default FGToFGTransfer;
