import { useState, useEffect } from "react";
import NavFooter from "../..//../../Components/NavFooter";
import {
  Button,
  Card,
  Col,
  Drawer,
  Modal,
  Row,
  Skeleton,
  Typography,
} from "antd";
import {
  QuantityCell,
  taxableCell,
  foreignCell,
  invoiceIdCell,
  invoiceDateCell,
  HSNCell,
  gstTypeCell,
  CGSTCell,
  SGSTCell,
  IGSTCell,
  locationCell,
  remarkCell,
  rateCell,
  autoConsumptionCell,
  gstRate,
} from "./TableCollumns";
import CurrenceModal from "../CurrenceModal";

import UploadDocs from "../../../Store/MaterialIn/MaterialInWithPO/UploadDocs";
import ToolTipEllipses from "../../../../Components/ToolTipEllipses";
import SuccessPage from "./SuccessPage";
import { imsAxios } from "../../../../axiosInterceptor";
import { useToast } from "../../../../hooks/useToast";
import MyDataTable from "../../../../Components/MyDataTable";

export default function MateirialInward({
  materialInward,
  setMaterialInward,
  asyncOptions,
  setAsyncOptions,
}) {
  const { showToast } = useToast();
  const [poData, setPoData] = useState({ materials: [] });
  const [showCurrency, setShowCurrenncy] = useState(null);
  const [invoices, setInvoices] = useState([]);
  const [showUploadDoc, setShowUploadDoc] = useState(false);
  const [autoConsumptionOptions, setAutoConsumptionOption] = useState([]);
  const [totalValues, setTotalValues] = useState([
    { label: "cgst", sign: "+", values: [] },
    { label: "sgst", sign: "+", values: [] },
    { label: "cigst", sign: "+", values: [] },
    { label: "Sub-Total value before Taxes", sign: "", values: [] },
  ]);
  const [currencies, setCurrencies] = useState([]);
  // const [locationSearchInput, setLocationSearchInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [successPageData, setSuccessPageData] = useState(false);
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [resetData, setResetData] = useState({ materials: [] });

  const validateFunction = () => {
    let validation = false;
    let arr = poData.materials.filter(
      (row) => row.maxQty > 0 && row.invoiceId != ""
    );
    arr.map((row) => {
      if (
        row.c_partno &&
        row.currency &&
        row.exchange_rate &&
        row.invoiceDate &&
        row.location &&
        row.orderqty
      ) {
        validation = true;
      } else {
        validation = false;
      }
    });

    let componentData = {
      qty: [],
      rate: [],
      currency: [],
      exchange: [],
      invoice: [],
      invoiceDate: [],
      hsncode: [],
      gsttype: [],
      gstrate: [],
      cgst: [],
      sgst: [],
      igst: [],
      remark: [],
      location: [],
      out_location: [],
      component: [],
    };
    if (validation == true) {
      let formData = new FormData();
      if (invoices.length) {
        invoices.map((file) => {
          formData.append("files", file);
        });

        arr.map((row) => {
          componentData = {
            component: [...componentData.component, row.componentKey],
            qty: [...componentData.qty, row.orderqty],
            rate: [...componentData.rate, row.orderrate],
            currency: [...componentData.currency, row.currency],
            exchange: [...componentData.exchange, row.exchange_rate],
            invoice: [...componentData.invoice, row.invoiceId],
            invoiceDate: [...componentData.invoiceDate, row.invoiceDate],
            hsncode: [...componentData.hsncode, row.hsncode],
            gsttype: [...componentData.gsttype, row.gsttype],
            gstrate: [...componentData.gstrate, row.gstrate],
            cgst: [...componentData.cgst, row.cgst],
            sgst: [...componentData.sgst, row.sgst],
            igst: [...componentData.igst, row.igst],
            remark: [...componentData.remark, row.orderremark],
            location: [...componentData.location, row.location.value],
            out_location: [
              ...componentData.out_location,
              row.autoConsumption.value
                ? row.autoConsumption.value
                : row.autoConsumption,
            ],
          };
        });
        if (
          (componentData.currency.filter((v, i, a) => v === a[0]).length ===
            componentData.currency.length) !=
          true
        ) {
          validation = false;
          return showToast("Currency of all components should be the same", "error");
        } else if (
          (componentData.gsttype.filter((v, i, a) => v === a[0]).length ===
            componentData.gsttype.length) !=
          true
        ) {
          validation = false;
          return showToast("gst type of all components should be the same", "error");
        }

        setShowSubmitConfirm({
          fileData: formData,
          componentData: componentData,
        });
      } else {
        showToast("Please add at least one document", "error");
      }
    } else {
      showToast("Please Provide all the values of all the components", "error");
    }
  };
  const submitMIN = async () => {
    //uploading invoices
    if (showSubmitConfirm) {
      const fileResponse = await imsAxios.post(
        "/transaction/upload-invoice",
        showSubmitConfirm.fileData
      );
      if (fileResponse.success) {
        let final = {
          companybranch: "BRALWR36",
          invoices: fileResponse.data,
          poid: materialInward,
        };

        final = { ...final, ...showSubmitConfirm.componentData };
        setSubmitLoading(true);

        const response = await imsAxios.post("/purchaseOrder/poMIN", final);
        setSubmitLoading(false);
        if (response.success) {
          setShowSubmitConfirm(false);
          let arr = poData.materials.filter(
            (row) => row.maxQty > 0 && row.invoiceId != ""
          );
          setSuccessPageData({
            materialInId: response?.data?.transaction_id,
            poId: final.poid,
            vendor: poData?.vendor_type?.vendorname,
            components: arr.map((row) => {
              return {
                id: row.componentKey,
                componentName: row.component_fullname,
                partNo: row.c_partno,
                inQuantity: row.orderqty,
                invoiceNumber: row.invoiceId,
                invoiceDate: row.invoiceDate,
                location: row.location?.label,
                poQuantity: row.po_order_qty,
              };
            }),
          });
          // let first = response.message.replaceAll("<br/>", " ").split("[")[0];
          // let second = response.message.replaceAll("<br/>", " ").split(";")[1];
          // let final = first + second;
          // showToast(final.replaceAll("]", ""), "success");
        } else {
          showToast(response.message, "error");
        }
      } else {
        showToast(
          "Some error occured while uploading invoices, Please try again", "error"
        );
      }
    }
  };
  const getCurrencies = async () => {
    const response = await imsAxios.get("/backend/fetchAllCurrecy");

    let arr = [];
    if (response.success) {
      arr = response.data.map((d) => {
        return {
          text: d.currency_symbol,
          value: d.currency_id,
          notes: d.currency_notes,
        };
      });
    }
    setCurrencies(arr);
  };
  const getLocation = async () => {
    const response = await imsAxios.post("/transaction/getLocationInMin", {
      search: "",
    });
    let arr = [];
    if (response.success && response.data?.data) {
      arr = response.response.data.map((d) => {
        return { text: d.text, value: d.id };
      });
      setAsyncOptions(arr);
    } else {
      setAsyncOptions([]);
    }
    return arr;
  };
  const getAutoComnsumptionOptions = async () => {
    const response = await imsAxios.get(
      "/transaction/fetchAutoConsumpLocation"
    );
    if (response.success) {
      const arr = response.data.map((row) => {
        return {
          value: row.id,
          text: row.text,
        };
      });
      setAutoConsumptionOption(arr);
    }
  };
  const inputHandler = (name, value, id) => {
    let arr = poData?.materials;
    arr = arr.map((row) => {
      let obj = row;
      if (id == row.id) {
        if (name == "orderqty") {
          if (value <= row.maxQty) {
            obj = {
              ...obj,
              [name]: value,
              inrValue: value * row.orderrate,
              usdValue: value * row.orderrate * row.exchange_rate,
              igst:
                row.gsttype == "L"
                  ? 0
                  : (value * row.orderrate * row.gstrate) / 100,
              sgst:
                row.gsttype == "I"
                  ? 0
                  : (value * row.orderrate * row.gstrate) / 200,
              cgst:
                row.gsttype == "I"
                  ? 0
                  : (value * row.orderrate * row.gstrate) / 200,
            };
          }
          return obj;
        } else if (name == "orderrate") {
          obj = {
            ...obj,
            [name]: value,
            inrValue: value * row.orderqty,
            usdValue: value * row.orderqty * row.exchange_rate,
            igst:
              row.gsttype == "L"
                ? 0
                : (value * row.orderqty * row.gstrate) / 100,
            sgst:
              row.gsttype == "I"
                ? 0
                : (value * row.orderqty * row.gstrate) / 200,
            cgst:
              row.gsttype == "I"
                ? 0
                : (value * row.orderqty * row.gstrate) / 200,
          };
          return obj;
        } else if (name == "gsttype") {
          if (value == "I") {
            obj = {
              ...obj,
              [name]: value,
              igst: (row.inrValue * row.gstrate) / 100,
              sgst: 0,
              cgst: 0,
            };
          } else if (value == "L") {
            obj = {
              ...obj,
              igst: 0,
              [name]: value,
              sgst: (row.inrValue * row.gstrate) / 200,
              cgst: (row.inrValue * row.gstrate) / 200,
            };
          }
          return obj;
        } else if (name == "gstrate") {
          obj = {
            ...obj,
            [name]: value,
            igst: row.gsttype == "L" ? 0 : (value * row.inrValue) / 100,
            sgst: row.gsttype == "I" ? 0 : (value * row.inrValue) / 200,
            cgst: row.gsttype == "I" ? 0 : (value * row.inrValue) / 200,
          };
          return obj;
        } else if (name == "currency") {
          if (value == "364907247") {
            obj = {
              ...obj,
              currency: value,
              usdValue: 0,
              exchange_rate: 1,
            };
          } else {
            obj = {
              ...obj,
              [name]: value,
            };
            setShowCurrenncy({
              currency: value,
              price: row.inrValue,
              exchange_rate: row.exchange_rate,
              symbol: currencies.filter((cur) => cur.value == value)[0].text,
              rowId: row.id,
              inputHandler: inputHandler,
            });
          }

          return obj;
        } else if (name == "exchange_rate") {
          obj = {
            ...obj,
            exchange_rate: value.rate,
            currency: value.currency,
            usdValue: row.inrValue * value.rate,
          };
          return obj;
        } else {
          obj = { ...obj, [name]: value };
          return obj;
        }
      } else {
        return row;
      }
    });
    setPoData((poData) => {
      return {
        ...poData,
        materials: arr,
      };
    });
  };

  const backFunction = () => {
    setMaterialInward(null);
  };
  const resetFunction = () => {
    setPoData(resetData);
    setShowResetConfirm(false);
  };

  const getDetail = async () => {
    setLoading(true);

    const response = await imsAxios.post("/purchaseOrder/fetchData4MIN", {
      pono: materialInward,
    });
    setLoading(false);
    if (response.success) {
      let obj = response.data;
      obj = {
        ...obj,
        materials: obj.materials.map((mat, index) => {
          let percentage = mat.gstrate;
          return {
            // adding properties in materials array
            ...mat,

            id: index,
            gsttype: mat.gsttype,
            inrValue: mat?.orderqty * mat?.orderrate,
            cgst:
              mat.gsttype == "I"
                ? 0
                : (mat?.orderqty * mat?.orderrate * (percentage / 2)) / 100,
            sgst:
              mat.gsttype == "I"
                ? 0
                : (mat?.orderqty * mat?.orderrate * (percentage / 2)) / 100,
            igst:
              mat.gsttype == "L"
                ? 0
                : (mat?.orderqty * mat?.orderrate * percentage) / 100,
            invoiceDate: "",
            invoiceId: "",
            location: "",
            maxQty: mat.orderqty,
            completed: mat.orderqty == 0,
          };
        }),
      };
      setPoData(obj);
      setResetData(obj);
    } else {
      backFunction();
      //   toast.error("Some error Occurred");
    }
  };
  const columns = [
    {
      headerName: "Component",
      field: "component_fullname",
      // sortable: false,
      width: 150,
      renderCell: ({ row }) => (
        <ToolTipEllipses text={row.component_fullname} />
      ),
      // width: 150,
    },
    {
      headerName: "Part No.",
      field: "c_partno",
      renderCell: ({ row }) => <ToolTipEllipses text={row.c_partno} />,
      sortable: false,
      width: 80,
    },
    {
      headerName: "Qty",
      field: "gstqty",
      sortable: false,
      renderCell: (params) => QuantityCell(params, inputHandler),
      width: 120,
    },
    {
      headerName: "Rate",
      field: "orderrate",
      sortable: false,
      renderCell: (params) => rateCell(params, inputHandler, currencies),
      width: 180,
    },
    {
      headerName: "Taxable Value",
      field: "inrValue",
      sortable: false,
      renderCell: taxableCell,
      width: 120,
    },
    {
      headerName: "Foreign Value",
      field: "usdValue",
      sortable: false,
      renderCell: foreignCell,
      width: 120,
    },
    {
      headerName: "Invoice ID",
      field: "invoiceId",
      sortable: false,
      renderCell: (params) => invoiceIdCell(params, inputHandler),
      width: 200,
    },
    {
      headerName: "Invoice Date",
      field: "invoiceDate",
      sortable: false,
      renderCell: (params) => invoiceDateCell(params, inputHandler),
      width: 120,
    },
    {
      headerName: "HSN Code",
      field: "hsncode",
      sortable: false,
      renderCell: (params) => HSNCell(params, inputHandler),
      width: 150,
    },
    {
      headerName: "GST Type",
      field: "gsttype",
      sortable: false,
      renderCell: (params) => gstTypeCell(params, inputHandler),
      // flex: 1,
      width: 200,
    },
    {
      headerName: "GST Rate",
      field: "gstrate",
      sortable: false,
      renderCell: (params) => gstRate(params, inputHandler),
      // flex: 1,
      width: 100,
    },
    {
      headerName: "CGST",
      renderCell: (params) => CGSTCell(params, inputHandler),
      // flex: 1,
      field: "cgst",
      sortable: false,
      width: 120,
    },
    {
      headerName: "SGST",
      renderCell: (params) => SGSTCell(params, inputHandler),
      // flex: 1,
      field: "sgst",
      sortable: false,
      width: 120,
    },
    {
      headerName: "IGST",
      renderCell: (params) => IGSTCell(params, inputHandler),
      // flex: 1,
      field: "igst",
      sortable: false,
      width: 120,
    },
    {
      headerName: "Location",
      field: "location",
      sortable: false,
      renderCell: (params) =>
        locationCell(
          params,
          inputHandler,
          setAsyncOptions,
          getLocation,
          asyncOptions
        ),
      width: 150,
    },
    {
      headerName: "Auto Consump",
      field: "autoConsumption",
      sortable: false,
      renderCell: (params) =>
        autoConsumptionCell(params, inputHandler, autoConsumptionOptions),
      width: 150,
    },
    {
      headerName: "Remarks",
      field: "orderremark",
      sortable: false,
      renderCell: (params) => remarkCell(params, inputHandler),
      width: 250,
    },
  ];
  const successColumns = [
    {
      headerName: "Component",
      renderCell: ({ row }) => <ToolTipEllipses text={row.componentName} />,
      field: "componentName",
      flex: 1,
    },
    { headerName: "Part No.", field: "partNo", flex: 1 },
    { headerName: "In Quantity", field: "inQuantity", flex: 1 },
    { headerName: "Invoice Number", field: "invoiceNumber", flex: 1 },
    { headerName: "Invoice Date", field: "invoiceDate", flex: 1 },
    { headerName: "Location", field: "location", flex: 1 },
  ];
  useEffect(() => {
    getDetail();
    getLocation();
    getCurrencies();
    getAutoComnsumptionOptions();
    setSuccessPageData(null);
    setInvoices([]);
  }, [materialInward]);
  useEffect(() => {
    let grandTotal = poData?.materials.map((row) =>
      Number(row?.cgst + row?.sgst + row?.igst + row.inrValue)
    );
    let cgsttotal = poData?.materials.map((row) => Number(row?.cgst));
    let sgsttotal = poData?.materials.map((row) => Number(row?.sgst));
    let igsttotal = poData?.materials.map((row) => Number(row?.igst));
    let inrValue = poData?.materials.map((row) => Number(row?.inrValue));
    let obj = [
      { label: "Sub-Total value before Taxes", sign: "", values: inrValue },
      { label: "CGST", sign: "+", values: cgsttotal },
      { label: "SGST", sign: "+", values: sgsttotal },
      { label: "IGST", sign: "+", values: igsttotal },
      { label: "Sub-Total values after Taxes", sign: "", values: grandTotal },
    ];
    setTotalValues(obj);
  }, [poData]);
  return (
    <Drawer
      title={
        !loading &&
        `Material In : ${materialInward} : ${poData?.materials?.length} item${
          poData?.materials?.length == 1 ? "" : "s"
        }`
      }
      width="100vw"
      onClose={() => setMaterialInward(null)}
      open={materialInward}
    >
      {/* currency modal */}
      {showCurrency != null && (
        <CurrenceModal
          showCurrency={showCurrency}
          setShowCurrencyModal={setShowCurrenncy}
        />
      )}
      {/* upload doc modal */}
      {!successPageData && (
        <Row gutter={8} style={{ height: "95%" }}>
          {/* create confirm modal */}
          <Modal
            title="Confirm Material In!"
            open={showSubmitConfirm}
            onCancel={() => setShowSubmitConfirm(false)}
            footer={[
              <Button key="back" onClick={() => setShowSubmitConfirm(false)}>
                No
              </Button>,
              <Button
                key="submit"
                type="primary"
                loading={submitLoading}
                onClick={submitMIN}
              >
                Yes
              </Button>,
            ]}
          >
            <p>Are you sure you want to generate this Material Inward Order?</p>
          </Modal>
          {/* reset confirm modal */}
          <Modal
            title="Reset Details!"
            open={showResetConfirm}
            onCancel={() => setShowResetConfirm(false)}
            footer={[
              <Button key="back" onClick={() => setShowResetConfirm(false)}>
                No
              </Button>,
              <Button key="submit" type="primary" onClick={resetFunction}>
                Yes
              </Button>,
            ]}
          >
            <p>
              Are you sure you want to reset details of the Material Inward?
            </p>
          </Modal>
          <Col style={{ height: "100%" }} span={6}>
            <Row gutter={[0, 4]} style={{ height: "100%" }}>
              {/* vendor card */}
              <Col span={24} style={{ height: "50%" }}>
                <Card
                  style={{ height: "100%" }}
                  // bodyStyle={{ height: "90%" }}
                  title="Vendor Detail"
                >
                  <Row gutter={[0, 8]}>
                    <Col span={24}>
                      <Typography.Title
                        style={{
                          fontSize:
                            window.innerWidth < 1600 ? "0.85rem" : "0.95rem",
                        }}
                        level={5}
                      >
                        Vendor Name
                      </Typography.Title>
                      {!loading && (
                        <Typography.Text
                          style={{
                            fontSize:
                              window.innerWidth < 1600 ? "0.7rem" : "0.8rem",
                          }}
                        >
                          <ToolTipEllipses
                            text={poData?.vendor_type?.vendorname}
                          />
                        </Typography.Text>
                      )}
                      <Skeleton
                        paragraph={false}
                        style={{ width: "100%" }}
                        rows={1}
                        loading={loading}
                        active
                      />
                    </Col>
                    <Col span={24}>
                      <Typography.Title
                        style={{
                          fontSize:
                            window.innerWidth < 1600 ? "0.85rem" : "0.95rem",
                        }}
                        level={5}
                      >
                        Vendor Address
                      </Typography.Title>
                      {!loading && (
                        <Typography.Text
                          style={{
                            fontSize:
                              window.innerWidth < 1600 ? "0.7rem" : "0.8rem",
                          }}
                        >
                          <ToolTipEllipses
                            type="Paragraph"
                            text={poData?.vendor_type?.vendoraddress?.replaceAll(
                              "<br>",
                              " "
                            )}
                          />
                        </Typography.Text>
                      )}
                      <Skeleton
                        paragraph={false}
                        style={{ width: "100%" }}
                        rows={1}
                        loading={loading}
                        active
                      />
                    </Col>
                    <Col span={24}>
                      <Typography.Title
                        style={{
                          fontSize:
                            window.innerWidth < 1600 ? "0.85rem" : "0.95rem",
                        }}
                        level={5}
                      >
                        Vendor GSTIN
                      </Typography.Title>

                      {!loading && (
                        <Typography.Text
                          style={{
                            fontSize:
                              window.innerWidth < 1600 ? "0.7rem" : "0.8rem",
                          }}
                        >
                          {poData?.vendor_type?.gstin}
                        </Typography.Text>
                      )}
                      <Skeleton
                        paragraph={false}
                        style={{ width: "100%" }}
                        rows={1}
                        loading={loading}
                        active
                      />
                    </Col>
                  </Row>
                </Card>
              </Col>
              {/* tax detail card */}
              <Col span={24} style={{ height: "40%" }}>
                <Card
                  style={{ height: "100%" }}
                  // bodyStyle={{ height: "90%" }}
                  title="Tax Detail"
                >
                  <Row gutter={[0, 4]}>
                    <Skeleton
                      paragraph={false}
                      style={{ width: "100%" }}
                      rows={1}
                      loading={loading}
                      active
                    />
                    <Skeleton
                      paragraph={false}
                      style={{ width: "100%" }}
                      rows={1}
                      loading={loading}
                      active
                    />
                    <Skeleton
                      paragraph={false}
                      style={{ width: "100%" }}
                      rows={1}
                      loading={loading}
                      active
                    />
                    <Skeleton
                      paragraph={false}
                      style={{ width: "100%" }}
                      rows={1}
                      loading={loading}
                      active
                    />
                    {!loading &&
                      totalValues?.map((row) => (
                        <Col span={24} key={row.label}>
                          <Row>
                            <Col
                              span={18}
                              style={{
                                fontSize: "0.8rem",
                                fontWeight:
                                  totalValues?.indexOf(row) ==
                                    totalValues.length - 1 && 600,
                              }}
                            >
                              {row.label}
                            </Col>
                            <Col span={6} className="right">
                              {row.sign.toString() == "" ? (
                                ""
                              ) : (
                                <span
                                  style={{
                                    fontSize: "0.7rem",
                                    fontWeight:
                                      totalValues?.indexOf(row) ==
                                        totalValues.length - 1 && 600,
                                  }}
                                >
                                  ({row.sign.toString()}){" "}
                                </span>
                              )}
                              <span
                                style={{
                                  fontSize: "0.8rem",
                                  fontWeight:
                                    totalValues?.indexOf(row) ==
                                      totalValues.length - 1 && 600,
                                }}
                              >
                                {Number(
                                  row.values?.reduce((partialSum, a) => {
                                    return partialSum + Number(a);
                                  }, 0)
                                ).toFixed(2)}
                              </span>
                            </Col>
                          </Row>
                        </Col>
                      ))}
                  </Row>
                </Card>
              </Col>
              <Col span={24} style={{ height: "10%" }}>
                <Row className="material-in-upload">
                  <UploadDocs
                    disable={poData?.materials?.length == 0}
                    setShowUploadDoc={setShowUploadDoc}
                    showUploadDoc={showUploadDoc}
                    setFiles={setInvoices}
                    files={invoices}
                  />
                </Row>
              </Col>
            </Row>
          </Col>
          <Col
         
            span={18}
          >
            <MyDataTable columns={columns} data={poData?.materials} />
          </Col>
        </Row>
      )}

      {successPageData && (
        <SuccessPage
          newMinFunction={() => {
            setSuccessPageData(null);
            backFunction();
          }}
          po={successPageData}
          successColumns={successColumns}
        />
      )}
      {!successPageData && materialInward && (
        <NavFooter
          backFunction={backFunction}
          hideHeaderMenu
          nextLabel="Submit"
          loading={submitLoading}
          resetFunction={() => setShowResetConfirm(true)}
          submitFunction={validateFunction}
        />
      )}
    </Drawer>
  );
}
