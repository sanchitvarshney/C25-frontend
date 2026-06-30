import React, { useEffect, useState } from "react";

import { useToast } from "../../../hooks/useToast.js";
import { Col, Row, Select, Button, Input } from "antd";
import MyAsyncSelect from "../../../Components/MyAsyncSelect";
import "./Modal/style.css";
import { imsAxios } from "../../../axiosInterceptor";
import NavFooter from "../../../Components/NavFooter";
import { getComponentOptions } from "../../../api/general.ts";
import useApi from "../../../hooks/useApi.ts";
const { TextArea } = Input;

function SFToRM() {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [allData, setAllData] = useState({
    locationFrom: "",
    companyBranch: "",
    comment: "",
    locationTo: "",
    component: "",
    qty1: "",
  });

  const [locData, setloctionData] = useState([]);
  const [asyncOptions, setAsyncOptions] = useState([]);
  const [locDataTo, setloctionDataTo] = useState([]);
  const [branchName, setbBanchName] = useState([]);
  const [qty, setQty] = useState([]);
  const [seacrh, setSearch] = useState(null);
  const [locationName, setLocationName] = useState([]);
  const { executeFun, loading: loading1 } = useApi();
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
    setbBanchName(response.data);
  };

  const getComponentList = async (e) => {
    if (e?.length > 2) {
      const response = await executeFun(() => getComponentOptions(e), "select");
      const { data } = response;
      let arr = [];
      arr = data.map((d) => {
        return { text: d.text, value: d.id };
      });
      setAsyncOptions(arr);
    }
  };

  const getQtyFuction = async () => {
    const response = await imsAxios.post("/godown/godownStocks", {
      component: allData.component,
      location: allData.locationFrom,
    });
    setQty(response.data);
  };

  const saveRmToRm = async () => {
    if (!allData.locationFrom) {
      showToast("Please enter location", "error");
    } else if (!allData.component) {
      showToast("Please Enter component", "error");
    } else if (!allData.qty1) {
      showToast("Please Enter a qty", "error");
    } else if (!allData.locationTo) {
      showToast("Please enter location", "error");
    } else if (allData.locationFrom == allData.locationTo) {
      showToast("Both Location Same....", "error");
    } else {
      setLoading(true);
      const response = await imsAxios.post("/godown/transferRM2RM", {
        comment: allData.comment,
        fromlocation: allData.locationFrom,
        component: [allData.component],
        tolocation: [allData.locationTo],
        qty: [allData.qty1],
        type: "RM2RM",
      });
      if (response.success) {
        showToast(response.message.toString()?.replaceAll("<br/>", ""), "success");
        setAllData({
          locationFrom: "",
          companyBranch: "",
          comment: "",
          locationTo: "",
          component: "",
          qty1: "",
        });
        setbBanchName("");
        setLocationName("");
        setQty("");
        setLoading(false);
      } else {
        showToast(response.message, "error");
        setLoading(false);
      }
    }
  };

  const getLocationName = async () => {
    const response = await imsAxios.post("/godown/fetchLocationDetail_to", {
      location_key: allData?.locationTo,
    });
    setLocationName(response.data);
  };

  const reset = async (e) => {
    e.preventDefault();
    setAllData({
      locationFrom: "",
      companyBranch: "",
      comment: "",
      locationTo: "",
      component: "",
      qty1: "",
    });
    setbBanchName("");
    setLocationName("");
    setQty("");
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

  useEffect(() => {
    if (allData?.locationFrom && allData?.component) {
      getQtyFuction();
    }
  }, [allData?.locationFrom, allData?.component]);

  useEffect(() => {
    if (allData.locationTo) {
      getLocationName();
    }
  }, [allData.locationTo]);

  return (
    <div style={{ height: "95%" }}>
      <Row gutter={10} style={{ padding: "10px", height: "79vh" }}>
        <Col span={6}>
          <Row gutter={10} style={{ margin: "5px" }}>
            <Col span={24} style={{ marginBottom: "10px", width: "100%" }}>
              <span>Pick Location</span>
            </Col>
            <Col span={24}>
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
            <Col span={24} style={{ marginTop: "10px" }}>
              <TextArea rows={2} disabled value={branchName} />
            </Col>
            <Col span={24} style={{ marginTop: "10px" }}>
              <TextArea
                rows={2}
                value={allData.comment}
                placeholder="Comment Optional"
                onChange={(e) =>
                  setAllData((allData) => {
                    return { ...allData, comment: e.target.value };
                  })
                }
              />
            </Col>
          </Row>
        </Col>

        <Col span={18}>
          <Row gutter={10}>
            <Col span={24}>
              <table>
                <tr>
                  <th className="an">Component/Part No.</th>
                  <th className="an">STOCK QUANTITY</th>
                  <th className="an">TRANSFERING QTY</th>
                  <th className="an">DROP (+) Loc</th>
                </tr>
                <tr>
                  <td>
                    <MyAsyncSelect
                      style={{ width: "100%" }}
                      loadOptions={getComponentList}
                      onBlur={() => setAsyncOptions([])}
                      onInputChange={(e) => setSearch(e)}
                      placeholder="Part Name/Code"
                      value={allData.component}
                      optionsState={asyncOptions}
                      onChange={(e) =>
                        setAllData((allData) => {
                          return { ...allData, component: e };
                        })
                      }
                    />
                  </td>
                  <td>
                    <Input
                      suffix={qty?.unit}
                      disabled
                      value={
                        qty?.available_qty
                          ? `${qty?.available_qty} ${qty?.unit}`
                          : "0"
                      }
                    />
                  </td>
                  <td>
                    <Input
                      value={allData?.qty1}
                      onChange={(e) =>
                        setAllData((allData) => {
                          return { ...allData, qty1: e.target.value };
                        })
                      }
                      suffix={qty?.unit}
                    />
                  </td>
                  <td>
                    <Select
                      style={{ width: "100%" }}
                      options={locDataTo}
                      value={allData.locationTo}
                      placeholder="Location"
                      onChange={(e) =>
                        setAllData((allData) => {
                          return { ...allData, locationTo: e };
                        })
                      }
                    />
                  </td>
                </tr>
              </table>
            </Col>
            {allData.locationTo && (
              <Col span={24}>
                <TextArea disabled value={locationName} />
              </Col>
            )}
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

export default SFToRM;
