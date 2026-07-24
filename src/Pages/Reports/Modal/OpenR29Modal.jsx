import { useEffect, useState } from "react";

import { useToast } from "../../../hooks/useToast.js";
import MyDatePicker from "../../../Components/MyDatePicker";
import { v4 } from "uuid";
import { Modal, Row, Col, Select } from "antd";
import MyAsyncSelect from "../../../Components/MyAsyncSelect";
import { imsAxios } from "../../../axiosInterceptor";
import { getProductsOptions } from "../../../api/general.ts";
import useApi from "../../../hooks/useApi.ts";
import Field from "../../../Components/Field";

const OpenR29Modal = ({
  viewModal,
  setViewModal,
  setAllResponseData,
  setLoading,
}) => {
  const { showToast } = useToast();
  const [asyncOptions, setAsyncOptions] = useState([]);
  const [date, setDate] = useState("");
  const [dataa, setData] = useState({
    selectProduct: "",
    bom: "",
  });
  const [isValid, setIsValid] = useState(false);
  const [bomLoading, setBomLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const { executeFun, loading } = useApi();
  // console.log(dataa);
  const [bomName, setBomName] = useState([]);

  const getProductNameFecth = async (searchInput) => {
    if (searchInput?.length > 2) {
      const response = await executeFun(
        () => getProductsOptions(searchInput, true),
        "select",
      );
      let { data } = response;

      setAsyncOptions(data);
    }
  };

  const getBom = async () => {
    setBomLoading(true);
    try {
      const response = await imsAxios.post("/backend/fetchBomForProduct", {
        search: dataa?.selectProduct?.value,
      });
      const arr = response.data.map((d) => {
        return { value: d.bomid, label: d.bomname };
      });
      setBomName(arr);
    } finally {
      setBomLoading(false);
    }
  };

  useEffect(() => {
    if (dataa.selectProduct?.value) {
      getBom();
    }
  }, [dataa.selectProduct]);

  const generateFun = async () => {
    setLoading(true);
    setAllResponseData([]);
    const response = await imsAxios.post("/report29", {
      product: dataa.selectProduct?.value,
      subject: dataa.bom,
      date: date,
    });
    if (response.success) {
      setData({
        selectProduct: "",
        bom: "",
      });
      let arr = response.data.map((row) => {
        return {
          ...row,
          id: v4(),
        };
      });
      setAllResponseData(arr);
      // setShow(false);
      setLoading(false);
    } else if (!response.success) {
      showToast(response.message, "error");
      // setViewModal(false);
      // setShow(false);
      setLoading(false);
    }
  };

  const handleOk = async () => {
    if (!dataa.selectProduct?.value || !dataa.bom || !date) {
      setIsValid(true);
      return;
    }
    setIsValid(false);
    setSubmitting(true);
    try {
      await generateFun();
      setViewModal(false);
    } finally {
      setSubmitting(false);
    }
  };

  if (!viewModal) {
    return null;
  }

  return (
    <form>
      <Modal
        title="BOM Wise SF Report"
        centered
        open={viewModal}
        onOk={handleOk}
        confirmLoading={submitting}
        onCancel={() => {
          setViewModal(false);
          setIsValid(false);
        }}
        width={800}
      >
        <Row gutter={16}>
          <Col span={12}>
            <MyAsyncSelect
              selectLoading={loading("select")}
              style={{ width: "100%" }}
              loadOptions={getProductNameFecth}
              onBlur={() => setAsyncOptions([])}
              value={dataa.selectProduct}
              placeholder="Product Name / SKU"
              optionsState={asyncOptions}
              labelInValue
              showError={isValid}
              message="Please select Product"
              onChange={(e) =>
                setData((dataa) => {
                  return { ...dataa, selectProduct: e };
                })
              }
            />
          </Col>
          <Col span={12}>
            <Field
              attr="required | Please select BOM"
              value={dataa.bom}
              showValidation={isValid}
            >
              <Select
                style={{ width: "100%" }}
                placeholder="Select Bom"
                options={bomName}
                value={dataa.bom}
                loading={bomLoading}
                disabled={bomLoading}
                onChange={(e) =>
                  setData((dataa) => {
                    return { ...dataa, bom: e };
                  })
                }
              />
            </Field>
          </Col>
          <Col span={12} style={{ marginTop: "5px" }}>
            <MyDatePicker
              setDateRange={setDate}
              size="default"
              showError={isValid}
              value={date}
            />
          </Col>
        </Row>
      </Modal>
    </form>
  );
};

export default OpenR29Modal;
