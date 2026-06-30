import React, { useState, useEffect } from "react";
import { Col, Row, Input, Typography, Card, Button } from "antd";
import MySelect from "../../../Components/MySelect";
import NavFooter from "../../../Components/NavFooter";
import { v4 } from "uuid";
import { imsAxios } from "../../../axiosInterceptor";
import { useToast } from "../../../hooks/useToast.js";
import MyAsyncSelect from "../../../Components/MyAsyncSelect";
import { useSelector } from "react-redux";
import { getComponentOptions } from "../../../api/general.ts";
import useApi from "../../../hooks/useApi.ts";
import { Add, Delete } from "@mui/icons-material";
const { paragraph } = Typography;

const { TextArea } = Input;
function MaterialTransfer({ type }) {
  const { showToast } = useToast();
  type == "sftorej"
    ? (document.title = "SF to REJ")
    : (document.title = "SF to SF");

  const [allData, setAllData] = useState({
    locationSel: "",
  });
  const { executeFun, loading: loading1 } = useApi();
  const [asyncOptions, setAsyncOptions] = useState([]);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [locationData, setLocationData] = useState([]);

  const [locDetail, setLocDetail] = useState("");
  const [locRejDetail, setLocRejDetail] = useState("");

  const [rows, setRows] = useState([
    {
      componentName: "",
      qty: "",
      rejLoc: "",
      restDetail: {},
      address: "",
      comment: "",
    },
  ]);

  const [loading, setLoading] = useState(false);
  // console.log(restDetail)

  const getLocation = async () => {
    let link = "";
    console.log("nothing");
    if (type == "sftorej") {
      console.log("rejection goes on here");
      link = "/godown/fetchLocationForSF2REJ_from";
    } else {
      console.log("rejection does not goes on here");
      link = "/godown/fetchLocationForSF2SF_from";
    }
    const response = await imsAxios.post(link);
    let arr = [];
    response.data.map((a) => arr.push({ text: a.text, value: a.id }));
    setLocationData(arr);
  };

  const getLocationDetail = async () => {
    const response = await imsAxios.post("godown/fetchLocationDetail_from", {
      location_key: allData.locationSel,
    });
    // console.log(data.data)
    setLocDetail(response.data);
  };

  const getComponent = async (e) => {
    if (e?.length > 2) {
   
      const response = await executeFun(() => getComponentOptions(e), "select");
      const { data } = response;
      let arr = [];
      arr = data?.map((d) => {
        return { text: d.text, value: d.id };
      });
      setAsyncOptions(arr);
    }
  };

  const getRowComponentDetail = async (rowIndex, componentValue) => {
    const row = rows[rowIndex];
    const component = componentValue ?? row?.componentName;
    if (!allData.locationSel || !component) return;
    const response = await imsAxios.post("/godown/godownStocks", {
      component,
      location: allData.locationSel,
    });
    setRows((prev) => {
      const updated = [...prev];
      updated[rowIndex] = { ...updated[rowIndex], restDetail: response.data };
      return updated;
    });
  };

  const getDropLoc = async () => {
    if (type == "sftorej") {
      const response = await imsAxios.post("/godown/fetchLocationForSF2REJ_to");

      let arr = [];
      response.data.map((a) => arr.push({ text: a.text, value: a.id }));
      setLocRejDetail(arr);
    } else {
      const response = await imsAxios.post("/godown/fetchLocationForSF2SF_to");

      let arr = [];
      response.data.map((a) => arr.push({ text: a.text, value: a.id }));
      setLocRejDetail(arr);
    }
  };

  const getRowDropLocationDetail = async (rowIndex, rejLocValue) => {
    const row = rows[rowIndex];
    const rejLoc = rejLocValue ?? row?.rejLoc;
    if (!rejLoc) return;
    const response = await imsAxios.post("/godown/fetchLocationDetail_to", {
      location_key: rejLoc,
    });
    setRows((prev) => {
      const updated = [...prev];
      updated[rowIndex] = { ...updated[rowIndex], address: response.data };
      return updated;
    });
  };

  const submitHandler = async () => {
    // validations
    if (!allData?.locationSel)
      return showToast("Please select a Pick Location", "error");

    for (let i = 0; i < rows.length; i++) {
      const r = rows[i];
      if (!r.componentName)
        return showToast(`Row ${i + 1}: Please select Component`, "error");
      if (!r.qty) return showToast(`Row ${i + 1}: Please enter Qty`, "error");
      if (!r.rejLoc)
        return showToast(`Row ${i + 1}: Please select Drop Location`, "error");
      if (r.rejLoc == allData.locationSel)
        return showToast(`Row ${i + 1}: Both Location Same`, "error");
    }

    const components = rows.map((r) => r.componentName);
    const tolocations = rows.map((r) => r.rejLoc);
    const qtys = rows.map((r) => r.qty);
    const comments = rows.map((r) => r.comment || "");
    const rates = rows.map((r) => r.restDetail?.avr_rate || "");

    setLoading(true);
    const response = await imsAxios.post(
      type == "sftorej" ? "/godown/transferSF2REJ" : "/godown/transferSF2SF",
      {
        comments: comments,
        fromlocation: allData.locationSel,
        component: components,
        tolocation: tolocations,
        qty: qtys,
        type: type == "sftorej" ? "SF2REJ" : "SF2SF",
         rate: rates,
      },
    );

    if (response.success) {
      setAllData({
        locationSel: "",
      });
      setRows([
        {
          componentName: "",
          qty: "",
          rejLoc: "",
          restDetail: {},
          address: "",
          comment: "",
        },
      ]);
      setLocDetail("");
      setLoading(false);
      showToast(response.message, "success");
    } else if (!response.success) {
      showToast(response.message?.msg || response.message, "error");
      setLoading(false);
    }
  };

  const reset = () => {
    setAllData({
      locationSel: "",
    });
    setRows([
      {
        componentName: "",
        qty: "",
        rejLoc: "",
        restDetail: {},
        address: "",
        comment: "",
      },
    ]);
  };

  const addRow = () => {
    setRows((prev) => [
      {
        componentName: "",
        qty: "",
        rejLoc: "",
        restDetail: {},
        address: "",
        comment: "",
      },
      ...prev,
    ]);
  };

  const handleBranchSelection = async (branchCode) => {
    try {
      const response = await imsAxios.post("/location/fetchLocationBranch", {
        branch: branchCode,
      });
      let arr = [];
      const list = response?.data ?? response; // support both shapes
      if (Array.isArray(list)) {
        list.map((a) => arr.push({ text: a.text, value: a.id }));
      }
      // Update global location options and reset all row locations
      setLocRejDetail(arr);
      setRows((prev) =>
        prev.map((row) => ({
          ...row,
          rejLoc: "", // Reset location when branch changes
        })),
      );
    } catch (error) {
      console.error("Error fetching locations for branch", error);
      showToast("Failed to fetch drop locations for selected branch", "error");
    }
  };

  const removeRow = (index) => {
    setRows((prev) => prev.filter((_, i) => i !== index));
  };

  useEffect(() => {
    getLocation();
    getDropLoc();
  }, []);

  useEffect(() => {
    if (allData.locationSel) {
      getLocationDetail();
    }
  }, [allData.locationSel]);

  // when pick location changes, refresh each row's stock detail (if component selected)
  useEffect(() => {
    if (allData?.locationSel) {
      rows.forEach((_, idx) => getRowComponentDetail(idx));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allData?.locationSel]);
  return (
    <div style={{ height: "calc(100vh - 160px)", padding: 10 }}>
      <Row gutter={10}>
        <Col span={12}>
      
            <Row>
              <Col span={12} style={{ padding: "5px", display: "flex", gap: 5, alignItems: "center" }}>
                <span style={{ fontWeight: "bold", minWidth: "100px" }}>Pick Location</span>
                <MySelect
                  options={locationData}
                  placeholder="Check Location"
                  value={allData.locationSel}
                  onChange={(e) =>
                    setAllData((allData) => {
                      return { ...allData, locationSel: e };
                    })
                  }
                />
              </Col>
              <Col span={12} style={{ padding: "5px" }}>
                <Input disabled value={locDetail} />
              </Col>
            </Row>
      
        </Col>
        <Col span={24} style={{ height: "50vh" }}>
          <div
            style={{ marginTop: "10px", border: "1px solid #ccc", padding: 0 }}
          >
            <div
              style={{
                overflowY: "auto",
                height: "calc(100vh - 250px)",
              }}
            >
              <table style={{ minWidth: 1500 }}>
                <thead style={{ backgroundColor: "grey", color: "white" }}>
                  <tr>
                    <th className="table-col" style={{ width: "10vw" }}>
                      Actions
                    </th>
                    <th className="table-col" style={{ width: "20vw" }}>
                      Component/Part
                    </th>
                    <th className="table-col" style={{ width: "14vw" }}>
                      In Stock Qty
                    </th>
                    <th className="table-col" style={{ width: "14vw" }}>
                      Transfer Qty
                    </th>
                    <th className="table-col" style={{ width: "18vw" }}>
                      DROP (+) Loc
                    </th>
                    <th className="table-col" style={{ width: "20vw" }}>
                      Weighted Average Rate
                    </th>
                    <th className="table-col" style={{ width: "24vw" }}>
                      Address
                    </th>
                    <th className="table-col" style={{ width: "24vw" }}>
                      Comment
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r, idx) => {
                    const rowColor = idx % 2 === 0 ? "#ffffff" : "#efefef";
                    return (
                      <tr key={idx} style={{ backgroundColor: rowColor }}>
                        <td style={{ width: "2vw", textAlign: "center" }}>
                          {idx > 0 && (
                            <span
                              onClick={() => removeRow(idx)}
                              className="delete-icon"
                            >
                              <Delete color="error" />
                            </span>
                          )}
                          {idx === 0 && (
                            <span
                              onClick={addRow}
                              style={{ cursor: "pointer" }}
                            >
                              <Add color="success" />
                            </span>
                          )}
                        </td>
                        <td style={{ width: "20vw" }}>
                          <MyAsyncSelect
                            loadOptions={getComponent}
                            optionsState={asyncOptions}
                            value={r.componentName}
                            selectLoading={loading1("select")}
                            onChange={async (e) => {
                              setRows((prev) => {
                                const updated = [...prev];
                                updated[idx] = {
                                  ...updated[idx],
                                  componentName: e,
                                };
                                return updated;
                              });
                              await getRowComponentDetail(idx, e);
                            }}
                          />
                        </td>
                        <td style={{ textAlign: "center", width: "14vw" }}>
                          <paragraph>
                            {r?.restDetail?.available_qty
                              ? `${r?.restDetail?.available_qty} ${r?.restDetail?.unit}`
                              : "0"}
                          </paragraph>
                        </td>
                        <td style={{ width: "14vw" }}>
                          <Input
                            type="number"
                            value={r.qty}
                            onChange={(e) =>
                              setRows((prev) => {
                                const updated = [...prev];
                                updated[idx] = {
                                  ...updated[idx],
                                  qty: e.target.value,
                                };
                                return updated;
                              })
                            }
                          />
                        </td>
                        <td style={{ width: "18vw" }}>
                          <MySelect
                            options={locRejDetail}
                            placeholder="Check Location"
                            value={r.rejLoc}
                            onChange={async (e) => {
                              setRows((prev) => {
                                const updated = [...prev];
                                updated[idx] = { ...updated[idx], rejLoc: e };
                                return updated;
                              });
                              await getRowDropLocationDetail(idx, e);
                            }}
                          />
                        </td>
                        <td style={{ width: "14vw" }}>
                          <Input disabled value={r?.restDetail?.avr_rate} />
                        </td>
                        <td style={{ width: "24vw" }}>
                          <Input
                            disabled
                            value={r.address}
                            style={{ resize: "none" }}
                          />
                        </td>
                        <td style={{ width: "24vw" }}>
                          <Input
                            value={r.comment}
                            onChange={(e) =>
                              setRows((prev) => {
                                const updated = [...prev];
                                updated[idx] = {
                                  ...updated[idx],
                                  comment: e.target.value,
                                };
                                return updated;
                              })
                            }
                            style={{ resize: "none" }}
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </Col>
      </Row>
      <NavFooter
        submitFunction={submitHandler}
        nextLabel="Transfer"
        loading={loading}
        resetFunction={reset}
      />
    </div>
  );
}

export default MaterialTransfer;
