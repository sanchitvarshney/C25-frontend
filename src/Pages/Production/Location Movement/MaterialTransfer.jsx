import { useState, useEffect, useRef } from "react";
import {
  Col,
  Row,
  Input,
  Card,
  Button,
  Divider,
  Tooltip,
  Typography,
} from "antd";
import {
  CheckCircleOutlined,
  DownloadOutlined,
  EnvironmentOutlined,
  FileExcelOutlined,
  ProjectOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import MySelect from "../../../Components/MySelect";
import NavFooter from "../../../Components/NavFooter";
import { imsAxios } from "../../../axiosInterceptor";
import { useToast } from "../../../hooks/useToast.js";
import MyAsyncSelect from "../../../Components/MyAsyncSelect";
import {
  getComponentOptions,
  getProjectOptions,
} from "../../../api/general.ts";
import { convertSelectOptions } from "../../../utils/general.ts";
import useApi from "../../../hooks/useApi.ts";
import { Add, Delete } from "@mui/icons-material";
import Field from "../../../Components/Field.jsx";
import { downloadCSVCustomColumns } from "../../../Components/exportToCSV.jsx";
import { godownTransferSampleFile } from "../../../utils/samplefile.js";

const emptyRow = () => ({
  componentName: "",
  qty: "",
  restDetail: {},
  comment: "",
  project: "",
});

const infoBoxStyle = {
  background: "#fafafa",
  border: "1px dashed #d9d9d9",
  borderRadius: 6,
  padding: "6px 10px",
  minHeight: 34,
  display: "flex",
  alignItems: "center",
};

const SectionTitle = ({ icon, title }) => (
  <div style={{ marginBottom: 4 }}>
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}
    >
      <Typography.Text strong style={{ fontSize: 14 }}>
        <span style={{ marginRight: 6 }}>{icon}</span>
        {title}
      </Typography.Text>
    
    </div>
  
  </div>
);

const FieldLabel = ({ children, required, style }) => (
  <Typography.Text style={{ fontSize: 12, fontWeight: 500, ...style }}>
    {required && <span style={{ color: "#ff4d4f", marginRight: 2 }}>*</span>}
    {children}
  </Typography.Text>
);

function MaterialTransfer({ type }) {
  const { showToast } = useToast();
  type == "sftorej"
    ? (document.title = "SF to REJ")
    : (document.title = "SF to SF");

  const [allData, setAllData] = useState({
    locationSel: "",
    dropLoc: "",
    pprId: "",
  });
  const { executeFun, loading: loading1 } = useApi();
  const [asyncOptions, setAsyncOptions] = useState([]);
  const [locationData, setLocationData] = useState([]);

  const [locDetail, setLocDetail] = useState("");
  const [locDetailTo, setLocDetailTo] = useState("");
  const [locRejDetail, setLocRejDetail] = useState("");

  const [project, setProject] = useState(null);
  const [projectAsyncOptions, setProjectAsyncOptions] = useState([]);
  const [pprOptions, setPprOptions] = useState([]);
  const [isPPRLoading, setIsPPRLoading] = useState(false);

  const [rows, setRows] = useState([emptyRow()]);

  const [loading, setLoading] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [uploadInfo, setUploadInfo] = useState(null);
  const [isValid, setIsValid] = useState(false);
  const fileInputRef = useRef(null);

  const isSfToRej = type == "sftorej";

  const handleFetchProjectOptions = async (search) => {
    const response = await executeFun(
      () => getProjectOptions(search),
      "project",
    );
    setProjectAsyncOptions(response?.data ?? []);
  };

  const fetchPPROptions = async (projectName) => {
    if (!projectName) {
      setPprOptions([]);
      return;
    }
    setIsPPRLoading(true);
    try {
      const response = await imsAxios.post("/purchaseOrder/pprList", {
        project_name: projectName,
      });
      if (response?.success) {
        setPprOptions(convertSelectOptions(response?.data) ?? []);
      } else {
        setPprOptions([]);
      }
    } catch (error) {
      setPprOptions([]);
      showToast("Error fetching PPR options", "error");
    } finally {
      setIsPPRLoading(false);
    }
  };

  const handleProjectChange = (value) => {
    setProject(value ?? null);
    setAllData((prev) => ({ ...prev, pprId: "" }));
    fetchPPROptions(typeof value === "object" ? value?.value : value);
  };

  const resolveProjectId = () => {
    if (project == null || project === "") return "";
    return typeof project === "object" ? (project?.value ?? "") : project;
  };

  const getLocation = async () => {
    let link = "";
    if (type == "sftorej") {
      link = "/godown/fetchLocationForSF2REJ_from";
    } else {
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
    const compKey = component?.value ?? component;
    if (!allData.locationSel || !compKey) return;
    const response = await imsAxios.post("/godown/godownStocks", {
      component: compKey,
      location: allData.locationSel,
    });
    setRows((prev) => {
      const updated = [...prev];
      updated[rowIndex] = {
        ...updated[rowIndex],
        restDetail: response.data,
        project: response.data?.project ?? "",
      };
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

  const getLocationDetailTo = async () => {
    const response = await imsAxios.post("/godown/fetchLocationDetail_to", {
      location_key: allData.dropLoc,
    });
    setLocDetailTo(response.data);
  };

  const hasIncompleteRow = (rows) =>
    (rows || []).some(
      (r) =>
        !r.componentName ||
        !r.qty ||
        Number(r.qty) <= 0 ||
        !r.comment ||
        !r.restDetail?.avr_rate,
    );

  const submitHandler = async () => {
    // validations
    if (!allData?.locationSel || !allData?.dropLoc || hasIncompleteRow(rows)) {
      setIsValid(true);

      return;
    }

    if (allData.dropLoc == allData.locationSel) {
      return showToast("Pick and Drop location cannot be the same", "error");
    }
    setIsValid(false);

    const components = rows.map(
      (r) => r.componentName?.value ?? r.componentName,
    );
    // one drop location for the whole transfer; backend still expects it per row
    const tolocations = rows.map(() => allData.dropLoc);
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
        ...(isSfToRej && {
          project_id: resolveProjectId() || null,
          ppr_id: allData.pprId || null,
          projectsIds: rows.map(
            (r) => r.restDetail?.project ?? r.project ?? "",
          ),
        }),
      },
    );

    if (response.success) {
      reset();
      setLoading(false);
      showToast(response.message?.[0]?.msg || response.message, "success");
    } else if (!response.success) {
      showToast(response.message?.[0]?.msg || response.message, "error");
      setLoading(false);
    }
  };

  const reset = () => {
    setIsValid(false);
    setAllData({
      locationSel: "",
      dropLoc: "",
      pprId: "",
    });
    setLocDetail("");
    setLocDetailTo("");
    setProject(null);
    setPprOptions([]);
    setRows([emptyRow()]);
    setUploadInfo(null);
  };

  const addRow = () => {
    setRows((prev) => [emptyRow(), ...prev]);
  };

  const handleUploadClick = () => {
    if (!allData.locationSel) {
      showToast("Please select a Pick Location first", "error");
      return;
    }
    fileInputRef.current?.click();
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadLoading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const response = await imsAxios.post(
        `/godown/validate/csv?type=sf-sf&pickLocation=${allData.locationSel}`,
        formData,
      );

      if (!(response?.success || response?.status === "success")) {
        showToast(response?.message || "Upload failed", "error");
        return;
      }
      const list = Array.isArray(response?.data) ? response.data : [];
      if (!list.length) {
        showToast("No rows returned from upload. Check file format.", "error");
        return;
      }

      const toOption = (item) => ({
        label:
          item.name && item.partCode
            ? `[${item.partCode}] ${item.name}`
            : item.name || item.partCode || item.key || "",
        value: item.key || "",
      });
      setAsyncOptions(
        list.map((item) => {
          const opt = toOption(item);
          return { text: opt.label, value: opt.value };
        }),
      );
      // stock detail comes back with the upload, so no per-row godownStocks call
      setRows(
        list.map((item) => ({
          ...emptyRow(),
          componentName: toOption(item),
          qty: item.transferQty ?? "",
          comment: item.remark ?? "",
          project: item.project ?? "",
          restDetail: {
            available_qty: item.available_qty ?? 0,
            avr_rate: item.avr_rate ?? "",
            unit: item.unit ?? "",
            project: item.project ?? "",
          },
        })),
      );
      setIsValid(false);
      setUploadInfo({ name: file.name, count: list.length });
      showToast(response?.message || "File uploaded", "success");
    } catch (error) {
      showToast(error?.message || "Failed to upload file", "error");
    } finally {
      setUploadLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
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

  useEffect(() => {
    if (allData.dropLoc) {
      getLocationDetailTo();
    }
  }, [allData.dropLoc]);

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
        <Col span={8}>
          <Card
            size="small"
            style={{ height: "calc(100vh - 190px)", overflowY: "auto" }}
            styles={{
              body: { display: "flex", flexDirection: "column", gap: 4 },
            }}
          >
        
            <SectionTitle
              icon={<EnvironmentOutlined />}
              title="Pick Location"
            />
            <FieldLabel required>Location</FieldLabel>
            <MySelect
              options={locationData}
              placeholder="Select pick location"
              value={allData.locationSel || undefined}
              onChange={(e) => {
                setAllData((prev) => ({ ...prev, locationSel: e ?? "" }));
                setLocDetail("");
              }}
              showError={isValid}
              message="Please select a Pick Location"
            />
            <div style={infoBoxStyle}>
              {locDetail ? (
                <Typography.Text style={{ fontSize: 13 }}>
                  {locDetail}
                </Typography.Text>
              ) : (
                <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                  Location address will appear here
                </Typography.Text>
              )}
            </div>

            <Divider style={{ margin: "12px 0 8px" }} />
            <SectionTitle icon={<EnvironmentOutlined />} title="Drop Location" />
            <FieldLabel required>Location</FieldLabel>
            <MySelect
              options={locRejDetail}
              placeholder="Select drop location"
              value={allData.dropLoc || undefined}
              onChange={(e) => {
                setAllData((prev) => ({ ...prev, dropLoc: e ?? "" }));
                setLocDetailTo("");
              }}
              showError={isValid}
              message="Please select a Drop Location"
            />
            <div style={infoBoxStyle}>
              {locDetailTo ? (
                <Typography.Text style={{ fontSize: 13 }}>
                  {locDetailTo}
                </Typography.Text>
              ) : (
                <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                  Location address will appear here
                </Typography.Text>
              )}
            </div>

            {isSfToRej && (
              <>
                <Divider style={{ margin: "12px 0 8px" }} />
                <SectionTitle
                  icon={<ProjectOutlined />}
                  title="Project & PPR"
                
                />
                <FieldLabel>Project</FieldLabel>
                <MyAsyncSelect
                  loadOptions={handleFetchProjectOptions}
                  optionsState={projectAsyncOptions}
                  onBlur={() => setProjectAsyncOptions([])}
                  selectLoading={loading1("project")}
                  placeholder="Search project ID / name"
                  labelInValue
                  value={project}
                  onChange={handleProjectChange}
                />
                <FieldLabel style={{ marginTop: 6 }}>PPR</FieldLabel>
                <Tooltip
                  title={resolveProjectId() ? "" : "Select a project first"}
                >
                  <div>
                    <MySelect
                      options={pprOptions}
                      selectLoading={isPPRLoading}
                      disabled={!resolveProjectId()}
                      placeholder={
                        resolveProjectId()
                          ? pprOptions.length || isPPRLoading
                            ? "Select PPR"
                            : "No PPR found for this project"
                          : "Select project first"
                      }
                      value={allData.pprId || undefined}
                      onChange={(value) =>
                        setAllData((prev) => ({ ...prev, pprId: value ?? "" }))
                      }
                    />
                  </div>
                </Tooltip>
              </>
            )}

            {/* bulk upload */}
            {type == "sftorej" && (
              <>
                <Divider style={{ margin: "12px 0 8px" }} />
                <SectionTitle
                  icon={<FileExcelOutlined />}
                  title="Bulk Upload"
                  hint=""
                />
                <Tooltip
                  title={
                    allData.locationSel ? "" : "Select a pick location first"
                  }
                >
                  <Button
                    block
                    icon={<UploadOutlined />}
                    onClick={handleUploadClick}
                    loading={uploadLoading}
                    disabled={!allData.locationSel}
                  >
                    Upload Excel / CSV
                  </Button>
                </Tooltip>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept=".csv,.xlsx,.xls"
                  style={{ display: "none" }}
                />
                {uploadInfo && (
                  <div style={{ ...infoBoxStyle, borderStyle: "solid" }}>
                    <Typography.Text style={{ fontSize: 12 }}>
                      <CheckCircleOutlined
                        style={{ color: "#52c41a", marginRight: 6 }}
                      />
                      {uploadInfo.count} row{uploadInfo.count === 1 ? "" : "s"}{" "}
                      loaded from{" "}
                      <Typography.Text strong style={{ fontSize: 12 }}>
                        {uploadInfo.name}
                      </Typography.Text>
                    </Typography.Text>
                  </div>
                )}
                <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                  Columns: PART_CODE, PROJECT, TRANSFER_QTY, REMARK. Uploading
                  replaces the rows in the table.
                </Typography.Text>
                <Button
                  type="link"
                  size="small"
                  icon={<DownloadOutlined />}
                  style={{ paddingInline: 0, alignSelf: "flex-start" }}
                  onClick={() =>
                    downloadCSVCustomColumns(
                      godownTransferSampleFile,
                      "Sample-GodownTransfer",
                    )
                  }
                >
                  Download sample file
                </Button>
              </>
            )}
          </Card>
        </Col>
        <Col span={16} style={{ height: "50vh" }}>
          <div
            style={{ marginTop: "10px", border: "1px solid #ccc", padding: 0 }}
          >
            <div
              style={{
                overflowY: "auto",
                height: "calc(100vh - 205px)",
              }}
            >
              <table style={{ minWidth: 1000, width: "100%" }}>
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
                    <th className="table-col" style={{ width: "20vw" }}>
                      Weighted Average Rate
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
                            selectLoading={loading1("select")}
                            labelInValue
                            message="Please select a Component"
                            showError={isValid}
                            value={r.componentName}
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
                          <Field
                            attr="required | Qty should be greater than zero"
                            value={r.qty}
                            treatZeroAsEmpty
                            showValidation={isValid}
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
                          >
                            <Input type="number" />
                          </Field>
                        </td>
                        <td style={{ width: "14vw" }}>
                          <Field
                            attr="required | Rate not available"
                            value={r?.restDetail?.avr_rate}
                            showValidation={isValid}
                            treatZeroAsEmpty
                          >
                            <Input disabled value={r?.restDetail?.avr_rate} />
                          </Field>
                        </td>
                        <td style={{ width: "24vw" }}>
                          <Field
                            attr="required | Comment is required"
                            value={r.comment}
                            showValidation={isValid}
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
                          >
                            <Input style={{ resize: "none" }} />
                          </Field>
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
