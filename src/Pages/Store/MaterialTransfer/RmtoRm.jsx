import React, { useEffect, useState } from "react";
import { useToast } from "../../../hooks/useToast.js";
import { Col, Row, Select, Button, Input, Card } from "antd";
import { DeleteOutlined } from "@ant-design/icons";
import MyAsyncSelect from "../../../Components/MyAsyncSelect";
import "./Modal/style.css";
import { imsAxios } from "../../../axiosInterceptor";
import NavFooter from "../../../Components/NavFooter";
import { getComponentOptions } from "../../../api/general.ts";
import useApi from "../../../hooks/useApi.ts";
import { v4 } from "uuid";
import AddIcon from "@mui/icons-material/Add";
import { Add, Delete } from "@mui/icons-material";
const { TextArea } = Input;

function RmtoRm() {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
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
      avrRate: "00",
      address: "",
      comment: "",
    },
  ]);

  const [locData, setloctionData] = useState([]);
  const [asyncOptions, setAsyncOptions] = useState([]);
  const [locDataTo, setloctionDataTo] = useState([]);
  const [branchName, setbBanchName] = useState([]);
  const [seacrh, setSearch] = useState(null);
  const { executeFun, loading: loading1 } = useApi();

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

  // console.log(branchName);
  const getLocationFunction = async () => {
    const response = await imsAxios.post("/godown/fetchLocationForRM2RM_from");

    let v = [];
    response.data.map((ad) => v.push({ label: ad.text, value: ad.id }));
    setloctionData(v);
  };
  const getLocationFunctionTo = async () => {
    const response = await imsAxios.post("/godown/fetchLocationForRM2RM_to");

    let v = [];
    response.data.map((ad) => v.push({ label: ad.text, value: ad.id }));
    setloctionDataTo(v);
  };

  const branchInfoFunction = async () => {
    const response = await imsAxios.post("/godown/fetchLocationDetail_from", {
      location_key: allData.locationFrom,
    });
    // console.log(data.data);
    setbBanchName(response?.data);
  };

  const getComponentList = async (e) => {
    if (e?.length > 2) {
      // const response = await imsAxios.post("/backend/getComponentByNameAndNo", {
      //   search: e,
      // });
      const response = await executeFun(() => getComponentOptions(e), "select");
      const { data } = response;
      let arr = [];
      arr = data?.map((d) => {
        return { text: d.text, value: d.id };
      });
      // return arr;
      setAsyncOptions(arr);
    }
  };

  const getQtyFuction = async (rowIndex, componentValue) => {
    const row = rows[rowIndex];
    const component = componentValue ?? row?.component;
    if (!allData.locationFrom || !component) return;

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
  };

  const saveRmToRm = async () => {
    // Validations
    if (!allData.locationFrom) {
      return showToast("Please select a Pick Location", "error");
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
      if (row.locationTo == allData.locationFrom) {
        return showToast(`Row ${i + 1}: Both Location Same`, "error");
      }
    }

    setLoading(true);

    // Prepare arrays for payload
    const components = rows.map((row) => row.component);
    const tolocations = rows.map((row) => row.locationTo);
    const qtys = rows.map((row) => row.qty1);
    const comments = rows.map((row) => row.comment || "");

    const response = await imsAxios.post("/godown/transferRM2RM", {
      comment: comments,
      fromlocation: allData.locationFrom,
      component: components,
      tolocation: tolocations,
      qty: qtys,
      type: "RM2RM",
    });

    if (response.success) {
      showToast(
        response.message.toString()?.replaceAll("<br/>", ""),
        "success",
      );
      // Reset form
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
      setLoading(false);
    } else {
      showToast(response?.message, "error");
      setLoading(false);
    }
  };

  const handleBranchSelection = async (branchCode) => {
    try {
      const response = await imsAxios.post("/location/fetchLocationBranch", {
        branch: branchCode,
      });
      let arr = [];
      const list = response?.data;
      if (Array.isArray(list)) {
        list.map((a) => arr.push({ label: a.text, value: a.id }));
      }

      // Update global location options and reset all row locations
      setloctionDataTo(arr);
      setRows((prev) =>
        prev.map((row) => ({
          ...row,
          locationTo: "", // Reset location when branch changes
        })),
      );
    } catch (error) {
      showToast("Failed to fetch drop locations for selected branch", "error");
    }
  };

  const getLocationName = async (rowIndex, locationValue) => {
    const row = rows[rowIndex];
    const location = locationValue ?? row?.locationTo;
    if (!location) return;

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
  };

  const reset = async (e) => {
    e.preventDefault();
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
    getLocationFunction();
    getLocationFunctionTo();
  }, []);

  useEffect(() => {
    if (allData.locationFrom) {
      branchInfoFunction();
    }
  }, [allData?.locationFrom]);

  return (
    <div style={{ height: "calc(100vh - 200px)", padding: 10 }}>
      {/* <InternalNav links={Main} /> */}
      <Row gutter={10}>
        <Col span={16} style={{ marginBottom: 10 }}>
   
            <Row gutter={10}>
              <Col span={3} style={{ width: "100%" }}>
                <span>Pick Location</span>
              </Col>
              <Col span={8}>
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
                <table style={{ border: "1px solid #ccc" }}>
                  <thead >
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
                              <MyAsyncSelect
                                style={{ width: "100%" }}
                                loadOptions={getComponentList}
                                onBlur={() => setAsyncOptions([])}
                                onInputChange={(e) => setSearch(e)}
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
                            <td style={{ width: "12vw", textAlign: "center" }}>
                              <span>
                                {row.stockQty ?? "00"} {row.unit ?? ""}
                              </span>
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
                                suffix={row.unit || ""}
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
        submitFunction={saveRmToRm}
        resetFunction={reset}
        loading={loading}
      />
    </div>
  );
}

export default RmtoRm;
