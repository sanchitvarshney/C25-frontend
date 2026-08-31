import  { useEffect, useState } from "react";
import ReqWithBomModal from "./Modal/ReqWithBomModal";
import { useToast } from "../../../hooks/useToast.js";
import { Col, Descriptions, Divider, Form, Input, Row, Typography } from "antd";
import MyAsyncSelect from "../../../Components/MyAsyncSelect";
import MySelect from "../../../Components/MySelect";
import TextArea from "antd/lib/input/TextArea";
import NavFooter from "../../../Components/NavFooter";
import { imsAxios } from "../../../axiosInterceptor";
import Loading from "../../../Components/Loading";
import Field from "../../../Components/Field.jsx";

const ReqWithBom = () => {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [isValid, setIsValid] = useState(false);
  const [tab, setTab] = useState(true);
  const [location, setLocation] = useState([]);
  const [location1, setLocation1] = useState([]);
  const [selectLoading, setSelectLoading] = useState(null);
  const [detailLocation, setDetailLocation] = useState("");
  const [detailLocation1, setDetailLocation1] = useState("");
  const [pageLoading, setPageLoading] = useState(false);
  const [detailProductName, setDetailProductName] = useState("");
  const [detailBom, setDetailBom] = useState([]);
  const [asyncOptions, setAsyncOptions] = useState([]);
  const [allBom, setAllBom] = useState({
    locValue: "",
    proSku: "",
    proBom: "",
    qty: "",
    remark: "",
    locSecond: "",
  });


  const getLocationOptions = async () => {
    setSelectLoading(true);
    try {
      const [shiftingRes, pickRes] = await Promise.all([
        imsAxios.post("/production/fetchLocationForWitoutBom"),
        imsAxios.post("/transaction/getMaterialRequestPickLocation"),
      ]);

      if (shiftingRes.success) {
        setLocation(
          shiftingRes.data.map((obj) => ({ text: obj.text, value: obj.id })),
        );
      }
      if (pickRes.success) {
        setLocation1(
          pickRes.data.map((obj) => ({ text: obj.text, value: obj.id })),
        );
      }
    } catch (error) {
      showToast(
        error?.response?.data?.message || "Failed to fetch locations",
        "error",
      );
    } finally {
      setSelectLoading(false);
    }
  };

  const locationDetail = async (locValue, setFun) => {
    setPageLoading(true);
    try {
      const response = await imsAxios.post(
        "/production/fetchLocationDetail",
        {
          location_key: locValue,
        },
      );
      if (response.success) {
        setFun(response.data);
      }
    } catch (error) {
      showToast(
        error?.response?.data?.message || "Failed to fetch location details",
        "error",
      );
    } finally {
      setPageLoading(false);
    }
  };

  const getProductSkuFetch = async (e) => {
    if (e?.length > 2) {
      setSelectLoading(true);
      try {
        const response = await imsAxios.post(
          "/backend/getProductByNameAndNo",
          {
            search: e,
          },
        );
        let arr = [];
        if (response.success) {
          arr = response.data.map((d) => {
            return { text: d.text, value: d.id };
          });
        }
        setAsyncOptions(arr);
      } catch (error) {
        showToast(
          error?.response?.data?.message || "Failed to fetch products",
          "error",
        );
      } finally {
        setSelectLoading(false);
      }
    }
  };

  const getProductName = async () => {
    setPageLoading(true);
    try {
      const response = await imsAxios.post("/production/getProductDetail", {
        p_key: allBom.proSku.value,
      });
      if (response.success) {
        setDetailProductName(response.data);
        const sto = [];
        response.boms?.map((ob) => sto.push({ text: ob.text, value: ob.id }));
        setDetailBom(sto);
      }
    } catch (error) {
      showToast(
        error?.response?.data?.message || "Failed to fetch product details",
        "error",
      );
    } finally {
      setPageLoading(false);
    }
  };

  const nextPage = () => {
    if (
      !allBom.locValue ||
      !allBom.locSecond ||
      !allBom.proSku ||
      !allBom.proBom ||
      !allBom.qty ||
      Number(allBom.qty) <= 0
    ) {
      setIsValid(true);
      return;
    }
    if (allBom.locValue === allBom.locSecond) {
      showToast(
        "Shifting Location and Pick Location cannot be the same",
        "error",
      );
      return;
    }
    setIsValid(false);
    setTab(!true);
  };

  const back = () => {
    setTab(!false);
  };

  const reset = () => {
    setIsValid(false);
    setAllBom({
      locValue: "",
      proSku: "",
      proBom: "",
      qty: "",
      remark: "",
      locSecond: "",
    });
    setDetailLocation("");
    setDetailProductName("");
  };

  useEffect(() => {
    getLocationOptions();
  }, []);

  useEffect(() => {
    if (allBom.locValue) {
      locationDetail(allBom.locValue, setDetailLocation);
    }
  }, [allBom.locValue]);

  useEffect(() => {
    if (allBom.locSecond) {
      locationDetail(allBom.locSecond, setDetailLocation1);
    }
  }, [allBom.locSecond]);

  useEffect(() => {
    if (allBom.proSku) {
      getProductName();
    }
  }, [allBom.proSku]);
  const { Text } = Typography;
  return (
    <>
      {/* {pageLoading && <Loading />} */}
      {tab ? (
        <div
          style={{
            overflowY: "auto",
            overflowX: "hidden",
            maxHeight: "100%",
            padding: 10,
          }}
        >
          {pageLoading && <Loading />}
          {/* Location */}
          <Row gutter={16}>
            <Col span={4}>
              <Descriptions size="small" title="Location">
                <Descriptions.Item
                  contentStyle={{
                    fontSize: window.innerWidth < 1600 && "0.7rem",
                  }}
                >
                  Provide Product shifting request location
                </Descriptions.Item>
              </Descriptions>
            </Col>
            <Col span={20}>
              <Row gutter={16}>
                {/* PO type */}
                <Col span={4}>
                  <Form size="small" layout="vertical">
                    <Form.Item
                      label={
                        <span
                          style={{
                            fontSize: window.innerWidth < 1600 && "0.7rem",
                          }}
                        >
                          Shifting Location
                        </span>
                      }
                      rules={[
                        {
                          required: true,
                          message: "Please Select a Shifting Location!",
                        },
                      ]}
                    >
                      <MySelect
                        size="default"
                        placeholder="Select a shifting Location"
                        value={allBom.locValue}
                        selectLoading={selectLoading}
                        options={location}
                        onChange={(e) =>
                          setAllBom((allBom) => {
                            return { ...allBom, locValue: e };
                          })
                        }
                        showError={isValid}
                        message="Please Select a Shifting Location!"
                      />
                    </Form.Item>
                  </Form>
                </Col>
                <Col span={4}>
                  <Form size="small" layout="vertical">
                    <Form.Item
                      label={
                        <span
                          style={{
                            fontSize: window.innerWidth < 1600 && "0.7rem",
                          }}
                        >
                          Location Details
                        </span>
                      }
                    >
                      <Text>{detailLocation ? detailLocation : "--"} </Text>
                    </Form.Item>
                  </Form>
                </Col>

                <Col span={4}>
                  <Form size="small" layout="vertical">
                    <Form.Item
                      label={
                        <span
                          style={{
                            fontSize: window.innerWidth < 1600 && "0.7rem",
                          }}
                        >
                          Pick Location
                        </span>
                      }
                      rules={[
                        {
                          required: true,
                          message: "Pick Location",
                        },
                      ]}
                    >
                      <MySelect
                        size="default"
                        placeholder="Pick Location"
                        value={allBom.locSecond}
                        selectLoading={selectLoading}
                        options={location1}
                        onChange={(e) =>
                          setAllBom((allBom) => {
                            return { ...allBom, locSecond: e };
                          })
                        }
                        showError={isValid}
                        message="Please Select a Pick Location!"
                      />
                    </Form.Item>
                  </Form>
                </Col>

                <Col span={4}>
                  <Form size="small" layout="vertical">
                    <Form.Item
                      label={
                        <span
                          style={{
                            fontSize: window.innerWidth < 1600 && "0.7rem",
                          }}
                        >
                          Pick Location Details
                        </span>
                      }
                    >
                      <Text>{detailLocation1 ? detailLocation1 : "--"} </Text>
                    </Form.Item>
                  </Form>
                </Col>
              </Row>
            </Col>
          </Row>
          <Divider />

          {/* Product */}
          <Row gutter={16}>
            <Col span={4}>
              <Descriptions size="small" title="Product">
                <Descriptions.Item
                  contentStyle={{
                    fontSize: window.innerWidth < 1600 && "0.7rem",
                  }}
                >
                  Product Provide Product SKU or its BOM type
                </Descriptions.Item>
              </Descriptions>
            </Col>
            <Col span={20}>
              <Row gutter={16}>
                {/* terms and conditions */}

                <Col span={6}>
                  <Form size="small" layout="vertical">
                    <Form.Item
                      label={
                        <span
                          style={{
                            fontSize: window.innerWidth < 1600 && "0.7rem",
                          }}
                        >
                          Product SKU
                        </span>
                      }
                    >
                      <MyAsyncSelect
                        selectLoading={selectLoading}
                        onBlur={() => setAsyncOptions([])}
                        value={allBom.proSku}
                        onChange={(e) =>
                          setAllBom((allBom) => {
                            return { ...allBom, proSku: e };
                          })
                        }
                        loadOptions={getProductSkuFetch}
                        labelInValue
                        optionsState={asyncOptions}
                        showError={isValid}
                        message="Please Select Product SKU!"
                      />
                    </Form.Item>
                  </Form>
                </Col>
                {/* quotations */}
                <Col span={6}>
                  <Form size="small" layout="vertical">
                    <Form.Item
                      label={
                        <span
                          style={{
                            fontSize: window.innerWidth < 1600 && "0.7rem",
                          }}
                        >
                          Product Name
                        </span>
                      }
                    >
                      <Text>
                        {" "}
                        {detailProductName.productname
                          ? detailProductName.productname
                          : "--"}{" "}
                      </Text>
                    </Form.Item>
                  </Form>
                </Col>
                {/* payment terms */}
                <Col span={6}>
                  <Form size="small" layout="vertical">
                    <Form.Item
                      label={
                        <span
                          style={{
                            fontSize: window.innerWidth < 1600 && "0.7rem",
                          }}
                        >
                          Product BOM
                        </span>
                      }
                    >
                      <MySelect
                        options={detailBom}
                        value={allBom.proBom}
                        onChange={(e) =>
                          setAllBom((allBom) => {
                            return { ...allBom, proBom: e };
                          })
                        }
                        placeholder="Select product BOM"
                        showError={isValid}
                        message="Please Select Product BOM!"
                      />
                    </Form.Item>
                  </Form>
                </Col>

                <Col span={6}>
                  <Form size="small" layout="vertical">
                    <Form.Item
                      label={
                        <span
                          style={{
                            fontSize: window.innerWidth < 1600 && "0.7rem",
                          }}
                        >
                          Product Qty
                        </span>
                      }
                    >
                      <Field
                        attr="required | Quantity should be greater than zero!"
                        value={allBom.qty}
                        treatZeroAsEmpty
                        showValidation={isValid}
                      
                      >
                        <Input
                          size="default"
                          type="number"
                          placeholder="Select product Quantity"
                            onChange={(e) =>
                          setAllBom((allBom) => {
                            return { ...allBom, qty: e.target.value };
                          })
                        }
                        />
                      </Field>
                    </Form.Item>
                  </Form>
                </Col>
              </Row>
              <Row gutter={16}>{/* terms and conditions */}</Row>
            </Col>
          </Row>

          <Divider />
          {/* Remark */}
          <Row gutter={16}>
            <Col span={4}>
              <Descriptions size="small" title="Remark">
                <Descriptions.Item
                  contentStyle={{
                    fontSize: window.innerWidth < 1600 && "0.7rem",
                  }}
                >
                  Remarks (if any)
                </Descriptions.Item>
              </Descriptions>
            </Col>
            <Col span={20}>
              <Row gutter={16}>
                {/* terms and conditions */}

                <Col span={18}>
                  <Form size="small" layout="vertical">
                    <Form.Item
                      label={
                        <span
                          style={{
                            fontSize: window.innerWidth < 1600 && "0.7rem",
                          }}
                        >
                          Remarks
                        </span>
                      }
                      rules={[
                        {
                          required: true,
                          message: "Please Enter bill from address!",
                        },
                      ]}
                    >
                      <TextArea
                        rows={4}
                        value={allBom.remark}
                        onChange={(e) =>
                          setAllBom((allBom) => {
                            return { ...allBom, remark: e.target.value };
                          })
                        }
                        placeholder="Enter Remarks"
                        style={{ resize: "none" }}
                      />
                    </Form.Item>
                  </Form>
                </Col>
              </Row>
              <Row gutter={16}>{/* terms and conditions */}</Row>
            </Col>
          </Row>
          <Divider />
          <NavFooter resetFunction={reset} submitFunction={nextPage} />
        </div>
      ) : (
        <>
          <ReqWithBomModal
            allBom={allBom}
            back={back}
            loading={loading}
            setLoading={setLoading}
            setTab={setTab}
            reset={reset}
          />
        </>
      )}
    </>
  );
};

export default ReqWithBom;
