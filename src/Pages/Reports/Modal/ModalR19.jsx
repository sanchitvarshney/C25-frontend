import React, { useEffect, useState } from "react";
import { Col, Modal, Row, Select } from "antd";
import axios from "axios";
import { useToast } from "../../../hooks/useToast.js";
import MyAsyncSelect from "../../../Components/MyAsyncSelect";
import { imsAxios } from "../../../axiosInterceptor";
import { getComponentOptions } from "../../../api/general.ts";
import useApi from "../../../hooks/useApi.ts";

function ModalR19({ modalOpen, setModalOpen, allData, fetchData }) {
  const { showToast } = useToast();
  const [allSelectedValue, setAllSelectedValue] = useState([]);
  const [asyncOptions, setAsyncOptions] = useState([]);
  const [selectLoading, setSelectLoading] = useState(false);
  const { executeFun, loading: loading1 } = useApi();
  const getExist = async () => {
    const response = await imsAxios.post("/report19/getSelectedValue");
    const arr = data.data.part_options.map((d) => {
      return { value: d.id, label: d.text };
    });
    setAllSelectedValue(arr);
  };

  const getComponents = async (search) => {
    // setSelectLoading(true);
    // const response = await imsAxios.post("/backend/getComponentByNameAndNo", {
    //   search: search,
    // });
    // setSelectLoading(false);
    const response = await executeFun(
      () => getComponentOptions(search),
      "select"
    );
    const { data } = response;
    if (data[0]) {
      let arr = data.map((row) => ({
        text: row.text,
        value: row.id,
      }));
      setAsyncOptions(arr);
    } else {
      showToast(response.message?.msg || response.message, "error");
    }
  };

  const saveData = async () => {
    const response = await imsAxios.post("/report19/addPart", {
      component_part: allSelectedValue,
    });
    if (response.success) {
      fetchData();
      setModalOpen(false);
      showToast(response.message, "success");
    }
  };

  useEffect(() => {
    if (modalOpen) {
      getExist();
    }
  }, [modalOpen]);
  return (
    <Modal
      width="800px"
      title="Add Component for Report"
      open={modalOpen}
      onOk={() => saveData()}
      onCancel={() => setModalOpen(false)}
    >
      <Row>
        <span>Component / Part</span>
        <Col span={24}>
          <MyAsyncSelect
            // allowClear
            onBlur={() => setAsyncOptions([])}
            loadOptions={getComponents}
            selectLoading={loading1("select")}
            size="default"
            mode="multiple"
            optionsState={asyncOptions}
            value={allSelectedValue}
            onChange={(e) => {
              setAllSelectedValue(e);
            }}
          />
        </Col>
      </Row>
    </Modal>
  );
}

export default ModalR19;
