import React, { useEffect, useState } from "react";
import { useToast } from "../../../hooks/useToast.js";
import { Col, Row, Select, Input } from "antd";
import MyAsyncSelect from "../../../Components/MyAsyncSelect";
import "./Modal/style.css";
import { imsAxios } from "../../../axiosInterceptor";
import NavFooter from "../../../Components/NavFooter";
import { getComponentOptions } from "../../../api/general.ts";
import useApi from "../../../hooks/useApi.ts";
import { v4 } from "uuid";
import { Add, Delete } from "@mui/icons-material";
import Field from "../../../Components/Field.jsx";
import Loading from "../../../Components/Loading.jsx";
const { TextArea } = Input;

function RmtoRm() {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [isValid, setIsValid] = useState(false);
  const [hoveredRow, setHoveredRow] = useState(null);
  const [allData, setAllData] = useState({
    locationFrom: "",
    companyBranch: "",
  });

  const [rows, setRows] = useState([
    {
      id: v4(),
      component: "",
      qty1: "",
      locationTo: "",
      stockQty: "00",
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
  const { executeFun } = useApi();

  const [loadingLocationFrom, setLoadingLocationFrom] = useState(false);
  const [loadingBranchInfo, setLoadingBranchInfo] = useState(false);
  const [loadingQtyIndex, setLoadingQtyIndex] = useState(null);
  const [loadingComponent, setLoadingComponent] = useState(false);

  // Add row functionality
  const addRow = () => {
    setRows((prev) => [
      {
        id: v4(),
        component: "",
        qty1: "",
        locationTo: "",
        stockQty: "00",
        unit: "",
        avrRate: "00",
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

  const branchInfoFunction = async () => {
    try {
      setLoadingBranchInfo(true);
      const response = await imsAxios.post("/godown/fetchLocationDetail_from", {
        location_key: allData.locationFrom,
      });
      // console.log(data.data);
      setbBanchName(response?.data);
    } catch (error) {
      showToast(
        error?.response?.data?.message || "Failed to fetch branch details",
        "error",
      );
    } finally {
      setLoadingBranchInfo(false);
    }
  };

  const getComponentList = async (e) => {
    if (e?.length > 2) {
      try {
        setLoadingComponent(true);
        const response = await executeFun(
          () => getComponentOptions(e),
          "select",
        );
        const { data } = response;
        let arr = [];
        arr = data?.map((d) => {
          return { text: d.text, value: d.id };
        });
        // return arr;
        setAsyncOptions(arr);
      } catch (error) {
        showToast(
          error?.response?.data?.message || "Failed to fetch components",
          "error",
        );
      } finally {
        setLoadingComponent(false);
      }
    }
  };

  const getQtyFuction = async (rowIndex, componentValue) => {
    const row = rows[rowIndex];
    const component = componentValue ?? row?.component;
    if (!allData.locationFrom || !component) return;

    try {
      setLoadingQtyIndex(rowIndex);
      const response = await imsAxios.post("/godown/godownStocks", {
        component: component,
        location: allData.locationFrom,
      });

      setRows((prev) => {
        const updated = [...prev];
        updated[rowIndex] = {
          ...updated[rowIndex],
          stockQty: response?.data?.available_qty || "0",
          unit: response?.data?.unit || "",
          avrRate: response?.data?.avr_rate || "",
        };
        return updated;
      });
    } catch (error) {
      showToast(
        error?.response?.data?.message || "Failed to fetch stock quantity",
        "error",
      );
    } finally {
      setLoadingQtyIndex(null);
    }
  };

  const hasIncompleteRow = (rows) =>
    (rows || []).some(
      (row) =>
        !row.component || !row.qty1 || Number(row.qty1) <= 0 || !row.locationTo,
    );

  const saveRmToRm = async () => {
    // Validations
    if (!allData.locationFrom || hasIncompleteRow(rows)) {
      setIsValid(true);
      return;
    }

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      if (row.locationTo == allData.locationFrom) {
        return showToast(`Row ${i + 1}: Both Location Same`, "error");
      }
    }
    setIsValid(false);

    setLoading(true);

    try {
      // Prepare arrays for payload
      const components = rows.map((row) => row.component);
      const tolocations = rows.map((row) => row.locationTo);
      const qtys = rows.map((row) => row.qty1);
      const comments = rows.map((row) => row.comment || "");
      const rate = rows.map((row) => row.avrRate || 0);

      const response = await imsAxios.post("/godown/transferRM2RM", {
        comment: comments,
        fromlocation: allData.locationFrom,
        component: components,
        tolocation: tolocations,
        qty: qtys,
        rate: rate,
        type: "RM2RM",
      });

      if (response.success) {
        showToast(
          response.message.toString()?.replaceAll("<br/>", ""),
          "success",
        );
        // Reset form
        setIsValid(false);
        setAllData({
          locationFrom: "",
          companyBranch: "",
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
      } else {
        showToast(response?.message, "error");
      }
    } catch (error) {
      showToast(
        error?.response?.data?.message || "Failed to transfer material",
        "error",
      );
    } finally {
      setLoading(false);
    }
  };

  const getLocationName = async (rowIndex, locationValue) => {
    const row = rows[rowIndex];
    const location = locationValue ?? row?.locationTo;
    if (!location) return;

    try {
      const response = await imsAxios.post("/godown/fetchLocationDetail_to", {
        location_key: location,
      });

      setRows((prev) => {
        const updated = [...prev];
        updated[rowIndex] = {
          ...updated[rowIndex],
          address: response?.data,
        };
        return updated;
      });
    } catch (error) {
      showToast(
        error?.response?.data?.message || "Failed to fetch location address",
        "error",
      );
    }
  };

  const reset = async (e) => {
    e.preventDefault();
    setIsValid(false);
    setAllData({
      locationFrom: "",
      companyBranch: "",
      dropBranch: "",
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
    getLocations();
  }, []);

  const getLocations = async () => {
    try {
      setLoadingLocationFrom(true);

      const [fromResponse, toResponse] = await Promise.all([
        imsAxios.post("/godown/fetchLocationForRM2RM_from"),
        imsAxios.post("/godown/fetchLocationForRM2RM_to"),
      ]);

      const fromLocations = fromResponse.data.map((ad) => ({
        label: ad.text,
        value: ad.id,
      }));

      const toLocations = toResponse.data.map((ad) => ({
        label: ad.text,
        value: ad.id,
      }));

      setloctionData(fromLocations);
      setloctionDataTo(toLocations);
    } catch (error) {
      showToast(
        error?.response?.data?.message || "Failed to fetch locations",
        "error",
      );
    } finally {
      setLoadingLocationFrom(false);
    }
  };

  useEffect(() => {
    if (allData.locationFrom) {
      branchInfoFunction();
    }
  }, [allData?.locationFrom]);

  return (
    <div style={{ height: "calc(100vh - 200px)", padding: 10 }}>
      {(loadingBranchInfo || loadingQtyIndex) && <Loading />}
      <Row gutter={10}>
        <Col span={16} style={{ marginBottom: 10 }}>
          <Row gutter={10}>
            <Col span={3} style={{ width: "100%" }}>
              <span>Pick Location</span>
            </Col>
            <Col span={8}>
              <Field
                attr="required | Please select a Pick Location"
                value={allData.locationFrom}
                showValidation={isValid}
                onChange={(e) =>
                  setAllData((allData) => {
                    return { ...allData, locationFrom: e };
                  })
                }
              >
                <Select
                  placeholder="Please Select Location"
                  style={{ width: "100%" }}
                  options={locData}
                  loading={loadingLocationFrom}
                  disabled={loadingLocationFrom}
                />
              </Field>
            </Col>
            <Col span={10}>
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
                <table style={{ border: "1px solid #ccc" }}>
                  <thead>
                    <tr>
                      <th className="table-col" style={{ width: "10vw" }}>
                        #
                      </th>
                      <th className="table-col" style={{ width: "18vw" }}>
                        Component / Part No.
                      </th>
                      <th className="table-col" style={{ width: "12vw" }}>
                        Stock QTY
                      </th>
                      <th className="table-col" style={{ width: "12vw" }}>
                        Transfering QTY
                      </th>
                      <th className="table-col" style={{ width: "16vw" }}>
                        DROP (+) Loc
                      </th>
                      <th className="table-col" style={{ width: "16vw" }}>
                        DROP (+) Loc Details
                      </th>
                      <th className="table-col" style={{ width: "12vw" }}>
                        WAR
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
                              <Field
                                attr="required | Please select Component"
                                value={row.component}
                                showValidation={isValid}
                              >
                                <MyAsyncSelect
                                  style={{ width: "100%" }}
                                  loadOptions={getComponentList}
                                  onBlur={() => setAsyncOptions([])}
                                  placeholder="Part Name/Code"
                                  selectLoading={loadingComponent}
                                  optionsState={asyncOptions}
                                  onChange={(e) => {
                                    if (!allData?.locationFrom) {
                                      showToast(
                                        "Please first select a Pick Location",
                                        "error",
                                      );
                                      return;
                                    }
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
                              </Field>
                            </td>
                            <td style={{ width: "12vw", textAlign: "center" }}>
                              <span>
                                {loadingQtyIndex === index
                                  ? "Loading..."
                                  : `${row.stockQty ?? "00"} ${row.unit ?? ""}`}
                              </span>
                            </td>
                            <td style={{ width: "12vw" }}>
                              <Field
                                attr="required | Please enter Qty"
                                value={row.qty1}
                                treatZeroAsEmpty
                                showValidation={isValid}
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
                              >
                                <Input type="number" suffix={row.unit || ""} />
                              </Field>
                            </td>
                            <td style={{ width: "16vw" }}>
                              <Field
                                attr="required | Please select Drop Location"
                                value={row.locationTo}
                                showValidation={isValid}
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
                              >
                                <Select
                                  style={{ width: "100%" }}
                                  options={locDataTo}
                                  placeholder="Location"
                                  loading={loadingLocationFrom}
                                  disabled={loadingLocationFrom}
                                />
                              </Field>
                            </td>
                            <td  style={{ width: "20vw" }}>
                              <Input
                                disabled
                                value={row.address}
                                placeholder={`Row ${
                                  index + 1
                                } - Location Address`}
                                rows={2}
                                style={{ width: "100%" }}
                              />
                            </td>
                            <td style={{ width: "12vw", textAlign: "center" }}>
                              {/* <Input disabled value={row.avrRate} /> */}
                              <span>{row.avrRate ?? "00"}</span>
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
        submitFunction={saveRmToRm}
        resetFunction={reset}
        loading={loading}
      />
    </div>
  );
}

export default RmtoRm;
