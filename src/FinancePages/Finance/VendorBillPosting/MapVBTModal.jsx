import { Button, Drawer, Space, Divider } from "antd";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { useToast } from "../../../hooks/useToast.js";
import { imsAxios } from "../../../axiosInterceptor";
import Loading from "../../../Components/Loading";
import MyAsyncSelect from "../../../Components/MyAsyncSelect";
import MySelect from "../../../Components/MySelect";

export default function MapVBTModal({ mapVBT, setMapVBT }) {
  const { showToast } = useToast();
  const [selectedVBT, setSelectedVBT] = useState();
  const [selectedGroup, setSelectedGroup] = useState("");
  const [groups, setGroups] = useState([]);
  const [gstGlGroups, setGstGlGroups] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(false);
  const [selectLoading, setSelectLoading] = useState(false);
  const [gstSubmitLoading, setGstSubmitLoading] = useState(false);
  const [asyncOptions, setAsyncOptions] = useState([]);
  const vbtOptions = [
    { value: "vbt01", text: "VBT 1" },
    { value: "vbt02", text: "VBT 2" },
    { value: "vbt03", text: "VBT 3" },
    { value: "vbt04", text: "VBT 4" },
    { value: "vbt05", text: "VBT 5" },
    { value: "vbt06", text: "VBT 6" },
    { value: "vbt07", text: "VBT 7" },
  ];

  const getGroups = async (search) => {
    if (selectedVBT) {
      setFetchLoading(true);
      const response = await imsAxios.post("/tally/vbt/fetch_vbt_group", {
        vbt_key: selectedVBT,
      });
      setFetchLoading(false);
      if (response.success) {
        // let arr = data.data.vbt_group_key.split(",");
        let arr = data.data.vbt_group_key.map((row) => {
          return {
            value: row.code,
            label: row.label.replaceAll("&amp;", " & ").replaceAll("amp;", ""),
          };
        });
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
      // let arr = data.data.vbt_group_key.split(",");
      let arr = data.data.vbt_group_key.map((row) => {
        return {
          value: row.code,
          label: row.label.replaceAll("&amp;", " & ").replaceAll("amp;", ""),
        };
      });
      setGstGlGroups(arr);
    } else {
      setGstGlGroups([]);
    }
  };
  const searchGroups = async (search) => {
    setSelectLoading(true);
    const response = await imsAxios.post("/tally/getSubgroup", {
      search: search,
    });
    setSelectLoading(false);
    if (response.success) {
      let arr = response.data.map((row) => ({
        text: row.label,
        value: row.id,
      }));
      setAsyncOptions(arr);
    } else {
      setAsyncOptions([]);
    }
  };
  const submitGSTGlFunction = async () => {
    let selGroups = gstGlGroups.map((group) => {
      return group.value;
    });
    setGstSubmitLoading(true);
    const response = await imsAxios.post("/tally/vbt/update_vbt_group_module", {
      vbt_module: "gst",
      sub_groups: selGroups,
    });
    setGstSubmitLoading(false);
    if (response.success) {
      if (data.message.msg.toLowerCase().includes("updated")) {
        showToast("VBT Updated", "success");
      } else {
        showToast(data.message.msg, "error");
      }
      setSelectedGroup(null);
      setMapVBT(null);
    } else {
      showToast(response.message?.msg || response.message, "error");
    }
  };
  const submitFunction = async () => {
    let selGroups = groups.map((group) => {
      return group.value;
    });
    setLoading(true);
    const response = await imsAxios.post("/tally/vbt/update_vbt_group_module", {
      vbt_module: selectedVBT,
      sub_groups: selGroups,
    });
    setLoading(false);
    if (response.success) {
      if (data.message.msg.toLowerCase().includes("updated")) {
        showToast("VBT Updated", "success");
      } else {
        showToast(data.message.msg, "error");
      }
      setSelectedGroup(null);
      setMapVBT(null);
    } else {
      showToast(response.message?.msg || response.message, "error");
    }
  };
  useEffect(() => {
    console.log(selectedVBT);
    getGroups();
    setSelectedGroup([]);
  }, [selectedVBT]);
  useEffect(() => {
    if (mapVBT) {
      let sel = mapVBT;
      setSelectedVBT(sel);
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
            options={vbtOptions}
            value={selectedVBT}
            onChange={(value) => setSelectedVBT(value)}
          />
        </div>
        <div>
          <p style={{ marginBottom: "10px" }}>Select VBT Group</p>
          <MyAsyncSelect
            mode="multiple"
            selectLoading={selectLoading}
            onBlur={() => setAsyncOptions([])}
            value={groups}
            labelInValue
            onChange={(value) => setGroups(value)}
            loadOptions={searchGroups}
            optionsState={asyncOptions}
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
              selectLoading={selectLoading}
              onBlur={() => setAsyncOptions([])}
              value={gstGlGroups}
              labelInValue
              onChange={(value) => setGstGlGroups(value)}
              loadOptions={searchGroups}
              optionsState={asyncOptions}
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
