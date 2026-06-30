import { useEffect, useRef, useState } from "react";
import {
  Col,
  Drawer,
  Flex,
  Form,
  Input,
  Modal,
  Row,
  Skeleton,
  Tabs,
  Typography,
} from "antd";
import { useToast } from "../../../../hooks/useToast.js";
import { v4 } from "uuid";
import MySelect from "../../../../Components/MySelect";
import NavFooter from "../../../../Components/NavFooter";
import { imsAxios } from "../../../../axiosInterceptor";
import MyButton from "../../../../Components/MyButton";
import MyAsyncSelect from "../../../../Components/MyAsyncSelect";
import { InfoCircleFilled, InfoCircleOutlined } from "@ant-design/icons";
import MyDataTable from "../../../../Components/MyDataTable.jsx";

export default function ExecutePPR({ editPPR, setEditPPR }) {
  const { showToast } = useToast();
  const [tabItems, setTabItems] = useState([]);
  const [tabsExist, setTabsExist] = useState(["1", "P", "PCK", "O", "PCB"]);
  const [activeKey, setActiveKey] = useState("1");
  const [pageLoading, setPageLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [tableData, setTableData] = useState([]);
  const [headerData, setHeaderData] = useState({});
  const [locationOptions, setLocationOptions] = useState([]);

  const locationOptionsRef = useRef(null);
  const onChange = (newActiveKey) => {
    setActiveKey(newActiveKey);
  };

  const remove = (targetKey) => {
    let newActiveKey = activeKey;
    let lastIndex = -1;
    tabItems.forEach((item, i) => {
      if (item.key === targetKey) {
        lastIndex = i - 1;
      }
    });
    const newPanes = tabItems.filter((item) => item.key !== targetKey);
    let arr = newPanes.map((pane) => pane.key);
    setTabsExist(arr);
    if (newPanes.length && newActiveKey === targetKey) {
      if (lastIndex >= 0) {
        newActiveKey = newPanes[lastIndex].key;
      } else {
        newActiveKey = newPanes[0].key;
      }
    }
    setTabItems(newPanes);
    setActiveKey(newActiveKey);
  };
  const onEdit = (targetKey, action) => {
    remove(targetKey);
  };
  const getPPRData = async (editPPR) => {
    setPageLoading(true);
   
    // return;
    const response = await imsAxios.post("/fg_return/fetchComponentDetails", {
      product_id: editPPR?.productKey,
      fg_return_txn: editPPR?.transactionId,
    });
    setPageLoading(false);

    if (response.success) {
      let  {data}  = response;
      let arr1 = {
        ...data.header_data,
        location: "",
        mfgQty: 1,
        myComment: "",
        fg_return_txn: editPPR.transactionId,
        product_id: editPPR.productKey,
      };
      setHeaderData(arr1);
      let arr = data.comp_data.map((row) => {
        return {
          ...row,
          id: v4(),
          actQty: headerData.mfgQty ? row.qty * headerData.mfgQty : row.qty,
          rej: "",
          rem: "",
        };
      });
      setTableData(arr);
      if (response.success) {
     
      } else {
        showToast(response.message, "error");
        setEditPPR(null);
      }
    } else {
      showToast(response.message, "error");
    }
  };
  const columns = [
    {
      headerName: "Part Name",
      width: 350,
      field: "name",
      renderCell: ({ row }) => (
        <span
          style={{
            color: +row.location_qty < +row.qty && "red",
          }}
        >
          {row.name}
        </span>
      ),
    },
    {
      headerName: "Part Code",
      flex: 1,
      field: "partno",
      renderCell: ({ row }) => <span>{row.partno}</span>,
    },
    {
      headerName: "BOM Qty",
      flex: 1,
      field: "qty",
      renderCell: ({ row }) => (
        <span>
          {row.qty} {row.unit}
        </span>
      ),
    },
    {
      headerName: "Stock Qty",
      flex: 1,
      field: "location_qty",
      renderCell: ({ row }) => (
        <span>
          {row.location_qty} {row.unit}
        </span>
      ),
    },
    {
      headerName: "In Qty",
      flex: 1,
      field: "annuaCons",
      renderCell: ({ row }) => (
        <Input
          style={{ border: row.borderRed && "1px solid red" }}
          value={row.actQty}
          suffix={row.unit}
          onChange={(e) => compInputHandler("actQty", e.target.value, row.id)}
        />
      ),
    },

    {
      headerName: "Remark",
      flex: 1,
      field: "remark",
      renderCell: ({ row }) => (
        <Input
          value={row.rem}
          onChange={(e) => compInputHandler("rem", e.target.value, row.id)}
        />
      ),
    },
  ];

  const getLocations = async (search) => {
    // setLoading("select");
    const response = await imsAxios.post("/backend/fetchLocation", {
      searchTerm: search,
    });
    getData(response);
  };
  const getData = (response) => {
    const { data } = response;

    if (response?.success) {
      if (data.length) {
        const arr = data.map((row) => ({
          text: row.text,
          value: row.id,
        }));

        setLocationOptions(arr);
        locationOptionsRef.current = arr;
      }
    }
  };
  // console.log("location ref", locationOptionsRef);
  const compInputHandler = async (name, value, id) => {
    let arr = tableData;
    arr = arr.map((row) => {
      let obj = row;
      if (obj.id == id) {
        obj = {
          ...obj,
          [name]: value,
        };
        return obj;
      } else {
        return obj;
      }
    });
 
    setTableData(arr);
  };
  const headerInputhandler = (name, value) => {
    let obj = headerData;
    obj = { ...obj, [name]: value };
    setHeaderData(obj);
  };
  const validateHandler = () => {
    if (headerData.location == "") {
      return showToast("Please select a location", "error");
    } else if (headerData.mfgQty == "") {
      return showToast("Please enter manufacutre quantity", "error");
    }
    let arr = [];
    arr = tabsExist.map((tab) => {
      return tableData.filter((row) => row.type == tab);
    });
    arr = arr.reduce((r, c) => {
      return [...r, ...c];
    });
    // console.log("header", headerData);

    const finalObj = {
      bom: headerData.bom_id,
      fg_return_txn: headerData.fg_return_txn,
      qty: headerData.mfgQty,
      product_id: headerData.product_id,
      location: headerData.location,
      comment: headerData.remark,
      component: arr.map((row) => row.key),
      comp_qty: arr.map((row) => row.actQty),
      remark: arr.map((row) => row.rem),
    };

    console.log("finalObj---", finalObj);
    // return;
    Modal.confirm({
      title: "Execute",
      content: "Are you sure you want to execute this?",
      okText: "Execute",
      onOk: () => submitHandler(finalObj),
    });
  };
  const submitHandler = async (finalObj) => {
   
    try {
      setSubmitLoading(true);
      const response = await imsAxios.post(
        "/fg_return/executeFG_reversal",
        finalObj
      );
    
      if (response.success) {
     
        showToast(response.message, "success");
        setEditPPR(null);
      } else {
        showToast(response.message?.msg || response.message, "error");
      }
  
    } catch (error) {
    } finally {
      setSubmitLoading(false);
    }
  };
  // const table = (rows, tab) => (
  const calcActualQty = () => {
    let headQty = headerData.mfgQty;
    let arr = tableData;
    arr = arr.map((row) => ({
      ...row,
      actQty: row.qty * headQty,
    }));
    setTableData(arr);
  };
  useEffect(() => {
    if (!editPPR) {
      setHeaderData({});
      setTableData([]);
    } else if (editPPR && !Array.isArray(editPPR)) {
      getPPRData(editPPR);
      setTabsExist(["1", "P", "PCK", "O", "PCB"]);
    }
  }, [editPPR]);
  const { Text } = Typography;
  useEffect(() => {
    let arr = tabsExist.map((tab) => {
      return {
        label:
          tab == "P"
            ? "Part"
            : tab == "PCK"
            ? "Packing"
            : tab === "PCB"
            ? "PCB"
            : tab == "1"
            ? "Header Details"
            : "Other",
        key: tab,
        children:
          tab != "1" ? (
            <div className=" remove-cell-border" style={{ height: "73vh" }}>
              <div style={{ height: "95%" }}>
                {/* {pageLoading && <Loading />} */}
                <MyDataTable
                  columns={columns}
                  data={tableData?.filter((row) => row.type == tab)}
                />
              </div>
            </div>
          ) : (
            <div style={{ height: "70vh" }}>
              {!pageLoading && (
                <>
                  {" "}
                  <Row style={{ margin: "30px 0" }} gutter={16}>
                    <Col span={6}>
                      <Text>
                        Product:
                        <br /> {headerData?.productname_sku}
                      </Text>
                    </Col>
                    <Col span={6}>
                      <Text>
                        BOM No.: <br />
                        {headerData?.bom}
                      </Text>
                    </Col>
                  </Row>
                  <Row style={{ margin: "30px 0" }} gutter={16}>
                    {headerData?.location && (
                      <Col span={6}>
                        Location: <br />
                        {headerData?.location}
                      </Col>
                    )}

                    <Col span={6}>
                      Left Qty: <br />
                      {headerData?.left_qty}
                    </Col>
                  </Row>
                  <Row gutter={16}>
                    <Col span={6}>
                      <Form size="small" layout="vertical">
                        <Form.Item
                          label={
                            <div
                              style={{
                                fontSize: window.innerWidth < 1600 && "0.7rem",
                              }}
                            >
                              Select Location
                            </div>
                          }
                          rules={[
                            {
                              required: true,
                              message: "Please  Select Location",
                            },
                          ]}
                        >
                          <MyAsyncSelect
                            ref={locationOptionsRef}
                            onBlur={() => setLocationOptions([])}
                            value={headerData?.location}
                            onChange={(value) =>
                              setHeaderData((d) => {
                                return { ...d, location: value };
                              })
                            }
                            loadOptions={getLocations}
                            optionsState={locationOptions}
                          />
                        </Form.Item>
                      </Form>
                    </Col>
                    <Col span={6}>
                      <Form size="small" layout="vertical">
                        <Form.Item
                          label={
                            <div
                              style={{
                                fontSize: window.innerWidth < 1600 && "0.7rem",
                              }}
                            >
                              Inward Qty
                            </div>
                          }
                          rules={[
                            {
                              required: true,
                              message: "Enter Inward Qty",
                            },
                          ]}
                        >
                          <Input
                            value={headerData.mfgQty}
                            onChange={(e) =>
                              headerInputhandler("mfgQty", +e.target.value)
                            }
                            size="default"
                          />
                        </Form.Item>
                      </Form>
                    </Col>
                    <Col span={4}>
                      <Form layout="vertical">
                        <Form.Item label=" ">
                          <MyButton onClick={calcActualQty}>Calculate</MyButton>
                        </Form.Item>
                      </Form>
                    </Col>
                  </Row>
                  <Row gutter={16}>
                    <Col span={6}>
                      {" "}
                      <Form size="small" layout="vertical">
                        <Form.Item
                          label={
                            <div
                              style={{
                                fontSize: window.innerWidth < 1600 && "0.7rem",
                              }}
                            >
                              Remark
                            </div>
                          }
                        >
                          <Input.TextArea
                            // disabled={true}
                            onChange={(e) =>
                              headerInputhandler("remark", e.target.value)
                            }
                            value={headerData?.remark}
                            style={{ resize: "none" }}
                            rows={4}
                          />
                        </Form.Item>
                      </Form>
                    </Col>
                    {/* <Col span={6}>
                      <Form size="small" layout="vertical">
                        <Form.Item
                          label={
                            <div
                              style={{
                                fontSize: window.innerWidth < 1600 && "0.7rem",
                              }}
                            >
                              Comments
                            </div>
                          }
                        >
                          <Input.TextArea
                            value={headerData?.myComment}
                            onChange={(e) =>
                              setHeaderData((d) => {
                                return { ...d, myComment: e.target.value };
                              })
                            }
                            style={{ resize: "none" }}
                            rows={4}
                          />
                        </Form.Item>
                      </Form>
                    </Col> */}
                  </Row>
                </>
              )}

              <NavFooter
                submitFunction={() => {
                  calcActualQty();
                  setActiveKey("P");
                }}
              />
            </div>
          ),
        closable: tab == "1" ? false : true,
      };
    });

    setTabItems(arr);
  }, [tableData, headerData, locationOptions]);
  return (
    <Drawer
      title={
        editPPR?.transactionId?.length &&
        `Execute MIS: ${editPPR?.transactionId}`
      }
      width="100vw"
      onClose={() => setEditPPR(null)}
      open={editPPR?.transactionId && editPPR}
    >
      <Skeleton active loading={pageLoading} />
      <Skeleton active loading={pageLoading} />
      <Skeleton active loading={pageLoading} />
      {!pageLoading && (
        <Tabs
          type="editable-card"
          onChange={onChange}
          onTabClick={() => console.log("something")}
          tabBarExtraContent={
            activeKey == "1"
              ? false
              : {
                  right: (
                    <Text>
                      {tableData.filter((row) => row.type == activeKey).length}{" "}
                      Items
                    </Text>
                  ),
                }
          }
          activeKey={activeKey}
          onEdit={onEdit}
          items={tabsExist.map((tab) => {
            return {
              disabled: activeKey === "1",
              ...tabItems.filter((item) => tab == item.key)[0],
            };
          })}
          hideAdd={true}
        />
      )}
      {activeKey !== "1" && (
        <Flex align="center" gap={5}>
          <InfoCircleOutlined />
          <Typography.Text strong>
            If you do not want to execute a component then leave the quantity
            field blank, Entering 0 is not a valid input.
          </Typography.Text>
        </Flex>
      )}
      {activeKey != 1 && (
        <NavFooter
          loading={submitLoading}
          submitFunction={validateHandler}
          nextLabel="Submit"
        />
      )}
    </Drawer>
  );
}
