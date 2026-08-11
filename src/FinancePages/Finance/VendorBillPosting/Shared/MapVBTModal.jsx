import { Button, Drawer, Space, Divider } from "antd";
import { useEffect, useState } from "react";
import { useToast } from "../../../../hooks/useToast.js";
import { imsAxios } from "../../../../axiosInterceptor";
import Loading from "../../../../Components/Loading";
import MyAsyncSelect from "../../../../Components/MyAsyncSelect";
import MySelect from "../../../../Components/MySelect";

const VBT_OPTIONS = [
  { value: "vbt01", text: "VBT 1" },
  { value: "vbt02", text: "VBT 2" },
  { value: "vbt03", text: "VBT 3" },
  { value: "vbt04", text: "VBT 4" },
  { value: "vbt05", text: "VBT 5" },
  { value: "vbt06", text: "VBT 6" },
  { value: "vbt07", text: "VBT 7" },
];

const decodeGroupLabel = (label) =>
  label.replaceAll("&amp;", " & ").replaceAll("amp;", "");

export default function MapVBTModal({ mapVBT, setMapVBT }) {
  const { showToast } = useToast();
  const [selectedVBT, setSelectedVBT] = useState();
  const [groups, setGroups] = useState([]);
  const [gstGlGroups, setGstGlGroups] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(false);
  const [gstSubmitLoading, setGstSubmitLoading] = useState(false);

  const [groupSearchOptions, setGroupSearchOptions] = useState([]);
  const [groupSelectLoading, setGroupSelectLoading] = useState(false);
  const [gstGlSearchOptions, setGstGlSearchOptions] = useState([]);
  const [gstGlSelectLoading, setGstGlSelectLoading] = useState(false);

  const getGroups = async () => {
    if (selectedVBT) {
      setFetchLoading(true);
      const response = await imsAxios.post("/tally/vbt/fetch_vbt_group", {
        vbt_key: selectedVBT,
      });
      setFetchLoading(false);
      if (response.success) {
        const arr = response.data.vbt_group_key.map((row) => ({
          value: row.code,
          label: decodeGroupLabel(row.label),
        }));
        setGroups(arr);
      } else {
        setGroups([]);
      }
    }
  };
  const getGSTGlGroups = async () => {
    setFetchLoading(true);
    const response = await imsAxios.post("/tally/vbt/fetch_vbt_group", {
      vbt_key: "gst",
    });
    setFetchLoading(false);
    if (response.success) {
      const arr = response.data.vbt_group_key.map((row) => ({
        value: row.code,
        label: decodeGroupLabel(row.label),
      }));
      setGstGlGroups(arr);
    } else {
      setGstGlGroups([]);
    }
  };
  const searchGroups = async (search) => {
    setGroupSelectLoading(true);
    const response = await imsAxios.post("/tally/getSubgroup", {
      search: search,
    });
    setGroupSelectLoading(false);
    if (response.success) {
      setGroupSearchOptions(
        response.data.map((row) => ({ text: row.label, value: row.id })),
      );
    } else {
      setGroupSearchOptions([]);
    }
  };
  const searchGstGlGroups = async (search) => {
    setGstGlSelectLoading(true);
    const response = await imsAxios.post("/tally/getSubgroup", {
      search: search,
    });
    setGstGlSelectLoading(false);
    if (response.success) {
      setGstGlSearchOptions(
        response.data.map((row) => ({ text: row.label, value: row.id })),
      );
    } else {
      setGstGlSearchOptions([]);
    }
  };
  const submitGSTGlFunction = async () => {
    const selGroups = gstGlGroups.map((group) => group.value);
    setGstSubmitLoading(true);
    const response = await imsAxios.post("/tally/vbt/update_vbt_group_module", {
      vbt_module: "gst",
      sub_groups: selGroups,
    });
    setGstSubmitLoading(false);
    if (response.success) {
      showToast(response.message, "success");
      setMapVBT(null);
    } else {
      showToast(response.message?.msg || response.message, "error");
    }
  };
  const submitFunction = async () => {
    const selGroups = groups.map((group) => group.value);
    setLoading(true);
    const response = await imsAxios.post("/tally/vbt/update_vbt_group_module", {
      vbt_module: selectedVBT,
      sub_groups: selGroups,
    });
    setLoading(false);
    if (response.success) {
      showToast(response.message, "success");
      setMapVBT(null);
    } else {
      showToast(response.message?.msg || response.message, "error");
    }
  };
  useEffect(() => {
    getGroups();
  }, [selectedVBT]);
  useEffect(() => {
    if (mapVBT) {
      setSelectedVBT(mapVBT);
      getGSTGlGroups();
    }
  }, [mapVBT]);

  return (
    <Drawer
      title="Map VBT"
      width="35vw"
      open={mapVBT}
      onClose={() => {
        setMapVBT(null);
      }}
      className={`vbt_map ${mapVBT && "open"}`}
    >
      {fetchLoading && <Loading />}
      <div style={{ marginBottom: 10 }} className="vbt-map-form">
        <div style={{ marginBottom: "20px" }}>
          <p style={{ marginBottom: "10px" }}>Select VBT Type</p>
          <MySelect
            options={VBT_OPTIONS}
            value={selectedVBT}
            onChange={(value) => setSelectedVBT(value)}
          />
        </div>
        <div>
          <p style={{ marginBottom: "10px" }}>Select VBT Group</p>
          <MyAsyncSelect
            mode="multiple"
            selectLoading={groupSelectLoading}
            onBlur={() => setGroupSearchOptions([])}
            value={groups}
            labelInValue
            onChange={(value) => setGroups(value)}
            loadOptions={searchGroups}
            optionsState={groupSearchOptions}
            placeholder="Select Group..."
          />
        </div>
      </div>
      <Space>
        <Button loading={loading} type="primary" onClick={submitFunction}>
          Submit
        </Button>
      </Space>
      <Divider />
      <Space direction="vertical">
        <div className="vbt-map-form">
          <div>
            <p style={{ marginBottom: "10px" }}>Select GST GL</p>
            <MyAsyncSelect
              mode="multiple"
              selectLoading={gstGlSelectLoading}
              onBlur={() => setGstGlSearchOptions([])}
              value={gstGlGroups}
              labelInValue
              onChange={(value) => setGstGlGroups(value)}
              loadOptions={searchGstGlGroups}
              optionsState={gstGlSearchOptions}
              placeholder="Select Group..."
            />
          </div>
        </div>
        <Button
          loading={gstSubmitLoading}
          type="primary"
          onClick={submitGSTGlFunction}
        >
          Submit
        </Button>
      </Space>
    </Drawer>
  );
}
