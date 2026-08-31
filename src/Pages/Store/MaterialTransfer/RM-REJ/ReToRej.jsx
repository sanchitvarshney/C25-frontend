import { useEffect, useState } from "react";
import { useToast } from "../../../../hooks/useToast.js";
import { Col, Row, Select, Input } from "antd";
import MyAsyncSelect from "../../../../Components/MyAsyncSelect";
import { imsAxios } from "../../../../axiosInterceptor";
import NavFooter from "../../../../Components/NavFooter";
import { getComponentOptions } from "../../../../api/general.ts";
import useApi from "../../../../hooks/useApi.ts";
import { Add, Delete } from "@mui/icons-material";
import Field from "../../../../Components/Field.jsx";
import Loading from "../../../../Components/Loading.jsx";
const { TextArea } = Input;

function ReToRej() {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [isValid, setIsValid] = useState(false);
  const [asyncOptions, setAsyncOptions] = useState([]);
  const [allDataRej, setAllDataRej] = useState({
    locationFrom: "",
    comment: "",
    component: "",
    qty1: "",
    locationTo: "",
  });
  const [locationFrom, setLocationFrom] = useState([]);
  const [branch, setBranch] = useState([]);
  const [locDataTo, setloctionDataTo] = useState([]);
  const [rows, setRows] = useState([
    {
      component: "",
      qty1: "",
      locationTo: "",
      restDetail: {},
      address: "",
    },
  ]);
  const [hoveredRow, setHoveredRow] = useState(null);
  const { executeFun } = useApi();

  const [loadingLocationFrom, setLoadingLocationFrom] = useState(false);
  const [loadingBranchInfo, setLoadingBranchInfo] = useState(false);
  const [loadingQtyIndex, setLoadingQtyIndex] = useState(null);
  const [loadingComponent, setLoadingComponent] = useState(false);

  const getLocations = async () => {
    try {
      setLoadingLocationFrom(true);
      const [fromResponse, toResponse] = await Promise.all([
        imsAxios.post("/godown/fetchLocationForRM2REJ_from"),
        imsAxios.post("/godown/fetchLocationForRM2REJ_to"),
      ]);

      const fromLocations = (fromResponse?.data || []).map((ad) => ({
        label: ad.text,
        value: ad.id,
      }));
      const toLocations = (toResponse?.data || []).map((ad) => ({
        label: ad.text,
        value: ad.id,
      }));

      setLocationFrom(fromLocations);
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

  const branchInfoFunction = async () => {
    try {
      setLoadingBranchInfo(true);
      const response = await imsAxios.post("/godown/fetchLocationDetail_from", {
        location_key: allDataRej.locationFrom,
      });
      setBranch(response?.data);
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
        setAsyncOptions(arr);
        // return arr;
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

  const getRowQtyFunction = async (rowIndex, componentValue) => {
    const row = rows[rowIndex];
    const component = componentValue ?? row?.component;
    if (!allDataRej.locationFrom || !component) return;

    try {
      setLoadingQtyIndex(rowIndex);
      const response = await imsAxios.post("/godown/godownStocks", {
        component,
        location: allDataRej.locationFrom,
      });
      setRows((prev) => {
        const updated = [...prev];
        updated[rowIndex] = {
          ...updated[rowIndex],
          restDetail: response?.data,
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
      (r) => !r.component || !r.qty1 || Number(r.qty1) <= 0 || !r.locationTo,
    );

  const saveRmToRej = async () => {
    if (!allDataRej.locationFrom || hasIncompleteRow(rows)) {
      setIsValid(true);
      return;
    }
    for (let i = 0; i < rows.length; i++) {
      const r = rows[i];
      if (r.locationTo == allDataRej.locationFrom)
        return showToast(`Row ${i + 1}: Drop Location Same`, "error");
    }
    setIsValid(false);

    setLoading(true);
    try {
      const components = rows.map((r) => r.component);
      const tolocations = rows.map((r) => r.locationTo);
      const qtys = rows.map((r) => r.qty1);
      const comments = rows.map(() => allDataRej?.comment || "");
      const response = await imsAxios.post("/godown/transferRM2REJ", {
        comment: comments,
        fromlocation: allDataRej?.locationFrom,
        component: components,
        tolocation: tolocations,
        qty: qtys,
        type: "RM2REJ",
      });
      if (response?.success) {
        showToast(
          response.message.toString()?.replaceAll("<br/>", ""),
          "success",
        );
        setIsValid(false);
        setAllDataRej({
          locationFrom: "",
          comment: "",
          component: "",
          qty1: "",
          locationTo: "",
        });
        setBranch("");
        setRows([
          {
            component: "",
            qty1: "",
            locationTo: "",
            restDetail: {},
            address: "",
          },
        ]);
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

  const getRowLocationName = async (rowIndex, locationToValue) => {
    const row = rows[rowIndex];
    const locationTo = locationToValue ?? row?.locationTo;
    if (!locationTo) return;
    try {
      const response = await imsAxios.post("/godown/fetchLocationDetail_to", {
        location_key: locationTo,
      });
      setRows((prev) => {
        const updated = [...prev];
        updated[rowIndex] = { ...updated[rowIndex], address: response?.data };
        return updated;
      });
    } catch (error) {
      showToast(
        error?.response?.data?.message || "Failed to fetch location address",
        "error",
      );
    }
  };

  const reset = async () => {
    setIsValid(false);
    setAllDataRej({
      locationFrom: "",
      comment: "",
      component: "",
      qty1: "",
      locationTo: "",
    });
    setBranch("");
    setRows([
      { component: "", qty1: "", locationTo: "", restDetail: {}, address: "" },
    ]);
  };
  useEffect(() => {
    getLocations();
  }, []);

  useEffect(() => {
    if (allDataRej.locationFrom) {
      branchInfoFunction();
    }
  }, [allDataRej.locationFrom]);

  // refresh each row stock when pick location changes
  useEffect(() => {
    if (allDataRej.locationFrom) {
      rows.forEach((_, idx) => getRowQtyFunction(idx));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allDataRej.locationFrom]);

  // Note: per-row changes trigger API calls in onChange handlers
  return (
    <div style={{ height: "100%", padding: 10 }}>
      {/* <InternalNav links={MainREJ} /> */}
      {(loadingBranchInfo || loadingQtyIndex !== null) && <Loading />}

      <Row gutter={10}>
        <Col span={24} style={{ marginBottom: 10 }}>
          <Row gutter={10}>
            <Col span={2} style={{ width: "100%" }}>
              <span>Pick Location</span>
            </Col>
            <Col span={6}>
              <Field
                attr="required | Please select a Pick Location"
                value={allDataRej.locationFrom}
                showValidation={isValid}
                onChange={(e) =>
                  setAllDataRej((allDataRej) => {
                    return { ...allDataRej, locationFrom: e };
                  })
                }
              >
                <Select
                  placeholder="Please Select Location"
                  style={{ width: "100%" }}
                  options={locationFrom}
                  loading={loadingLocationFrom}
                  disabled={loadingLocationFrom}
                />
              </Field>
            </Col>
            <Col span={6}>
              <TextArea rows={2} disabled value={branch} />
            </Col>
            <Col span={8}>
              <TextArea
                rows={2}
                placeholder="Comment Optional"
                value={allDataRej.comment}
                onChange={(e) =>
                  setAllDataRej((allDataRej) => {
                    return { ...allDataRej, comment: e.target.value };
                  })
                }
              />
            </Col>
          </Row>
        </Col>

        <Col span={24}>
          <Row gutter={10}>
            <Col span={24}>
              {" "}
              <div style={{ overflowY: "auto", height: "calc(100vh - 225px)" }}>
                <table
                  style={{
                    width: "100%",
                    minWidth: 1500,
                    border: "1px solid #ccc",
                  }}
                >
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
                      <th className="table-col" style={{ width: "14vw" }}>
                        DROP (+) Loc
                      </th>
                      <th className="table-col" style={{ width: "12vw" }}>
                        WAR
                      </th>
                      <th className="table-col" style={{ width: "22vw" }}>
                        Address
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((r, idx) => {
                      const rowColor = idx % 2 === 0 ? "#ffffff" : "#f8f9fa";

                      return (
                        <tr
                          key={idx}
                          style={{
                            backgroundColor:
                              hoveredRow === idx ? "#fffaec" : rowColor,
                          }}
                          onMouseEnter={() => setHoveredRow(idx)}
                          onMouseLeave={() => setHoveredRow(null)}
                        >
                          <td style={{ width: "2vw", textAlign: "center" }}>
                            {idx > 0 && (
                              <span
                                onClick={() => {
                                  if (rows.length === 1) {
                                    showToast("Can't delete last row", "error");
                                    return;
                                  }
                                  setRows((prev) =>
                                    prev.filter((_, i) => i !== idx),
                                  );
                                }}
                                className="delete-icon"
                              >
                                <Delete color="error" />
                              </span>
                            )}
                            {idx === 0 && (
                              <span
                                onClick={() =>
                                  setRows((prev) => [
                                    {
                                      component: "",
                                      qty1: "",
                                      locationTo: "",
                                      restDetail: {},
                                      address: "",
                                    },
                                    ...prev,
                                  ])
                                }
                                style={{ cursor: "pointer" }}
                              >
                                <Add color="success" />
                              </span>
                            )}
                          </td>
                          <td style={{ width: "18vw" }}>
                            <div
                              style={{
                                width: "100%",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                              }}
                            >
                              <Field
                                attr="required | Please select Component"
                                value={r.component}
                                showValidation={isValid}
                              >
                                <MyAsyncSelect
                                  style={{ width: "100%" }}
                                  loadOptions={getComponentList}
                                  selectLoading={loadingComponent}
                                  onBlur={() => setAsyncOptions([])}
                                  placeholder="Part Name/Code"
                                  optionsState={asyncOptions}
                                  value={r.component}
                                  onChange={async (e) => {
                                    if (!allDataRej?.locationFrom) {
                                      showToast(
                                        "Please first select a Pick Location",
                                        "error",
                                      );
                                      return;
                                    }
                                    setRows((prev) => {
                                      const updated = [...prev];
                                      updated[idx] = {
                                        ...updated[idx],
                                        component: e,
                                      };
                                      return updated;
                                    });
                                    await getRowQtyFunction(idx, e);
                                  }}
                                />
                              </Field>
                            </div>
                          </td>
                          <td style={{ width: "12vw", textAlign: "center" }}>
                            <span>
                              {loadingQtyIndex === idx
                                ? "Loading..."
                                : `${r?.restDetail?.available_qty ?? "00"} ${
                                    r?.restDetail?.unit ?? ""
                                  }`}
                            </span>
                          </td>
                          <td style={{ width: "12vw" }}>
                            <Field
                              attr="required | Please add Quantity"
                              value={r.qty1}
                              treatZeroAsEmpty
                              showValidation={isValid}
                              onChange={(e) =>
                                setRows((prev) => {
                                  const updated = [...prev];
                                  updated[idx] = {
                                    ...updated[idx],
                                    qty1: e.target.value,
                                  };
                                  return updated;
                                })
                              }
                            >
                              <Input
                                type="number"
                                suffix={r?.restDetail?.unit}
                              />
                            </Field>
                          </td>
                          <td style={{ width: "14vw" }}>
                            <Field
                              attr="required | Please select Drop Location"
                              value={r.locationTo}
                              showValidation={isValid}
                            >
                              <Select
                                style={{ width: "100%" }}
                                options={locDataTo}
                                loading={loadingLocationFrom}
                                disabled={loadingLocationFrom}
                                onChange={async (e) => {
                                  setRows((prev) => {
                                    const updated = [...prev];
                                    updated[idx] = {
                                      ...updated[idx],
                                      locationTo: e,
                                    };
                                    return updated;
                                  });
                                  await getRowLocationName(idx, e);
                                }}
                              />
                            </Field>
                          </td>
                          <td style={{ width: "12vw" }}>
                            <Input disabled value={r?.restDetail?.avr_rate} />
                          </td>
                          <td style={{ width: "22vw" }}>
                            <Input
                              disabled
                              value={r.address}
                              style={{ resize: "none" }}
                            />
                          </td>
                        </tr>
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
        submitFunction={saveRmToRej}
        resetFunction={reset}
        loading={loading}
        // disabled={allDataRej.qty1 == "" ? false : true}
      />
      {/* <Row style={{ padding: "5px" }}>
        <Col span={24}>
          <div style={{ textAlign: "end" }}>
            <Button
              style={{
                backgroundColor: "red",
                color: "white",
                marginRight: "5px",
              }}
              onClick={reset}
            >
              Reset
            </Button>
            <Button type="primary" onClick={saveRmToRej}>
              Transfer
            </Button>
          </div>
        </Col>
      </Row> */}
    </div>
  );
}

export default ReToRej;
