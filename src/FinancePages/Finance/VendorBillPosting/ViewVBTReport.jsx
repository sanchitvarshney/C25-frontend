import  { useState, useEffect } from "react";

import { PrinterFilled } from "@ant-design/icons";
import printFunction from "../../../Components/printFunction";
import { Button, Col, Drawer, Form, Modal, Row, Space } from "antd";

// import ToolTipEllipses from "../../../Components/ToolTipEllipses";
import { imsAxios } from "../../../axiosInterceptor";
import { useToast } from "../../../hooks/useToast.js";
import SingleProduct from "./SingleProduct";
import { v4 } from "uuid";
export default function ViewVBTReport({
  viewReportData,
  setViewReportData,
  getSearchResults,
}) {
  const { showToast } = useToast();
  const [viewVbt] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [loading1, setLoading1] = useState(false);
  // const [totalValues, setTotalValues] = useState([
  //   { label: "Net Amount", sign: "", values: [] },
  //   { label: "cgst", sign: "+", values: [] },
  //   { label: "sgst", sign: "+", values: [] },
  //   { label: "igst", sign: "+", values: [] },
  //   { label: "freight", sign: "+", values: [] },
  //   { label: "Round Off", sign: "+", values: [] },
  // ]);
  const [printLoading, setPrintLoading] = useState(false);
  const [showMoreData, setShowMoreData] = useState(null);
  const [viewEditComponents, setViewEditComponents] = useState([]);
 
  useEffect(() => {
    // console.log("inside useefect", viewReportData);
    if (viewReportData?.length > 0) {
      getVBTDetails(viewReportData);
    }
  }, [viewReportData]);

  // console.log("viewReportData=", viewReportData);
  const getVBTDetails = async (viewReportData) => {
    // console.log("adddddddddddddd", viewReportData);
    setLoading(true);
    const response = await imsAxios.post("/tally/vbt_report/vbt_report_data", {
      vbt_key: viewReportData,
    });
    // console.log(data);
    setLoading(false);
    if (response.success) {
      // console.log(viewReportData);
      const arr = response.data.map((row) => {
        return {
          ...row,
          id: v4(),
          billQty: row.bill_qty,
          customDuty: row.custom_duty,
          // vbt_code: viewReportData,
          minId: row.min_id,
          partCode: row.part_code,
          freightGl: row.fright_gl,
          gsAssVal: row.gst_ass_val,
          gstInNo: row.gst_in_no,
          gstRate: row.gst_rate,
          gstType: row.gst_type,
          hsnSac: row.hsn_sac,
          igstGl: row.igst_gl,
          inRate: row.in_rate,
          invoiceDt: row.invoice_dt,
          invoiceNo: row.invoice_no,
          sgstGl: row.sgst_gl,
          tdsAmm: row.tds_amm,
          tdsAssVal: row.tds_ass_val,
          tdsCode: row.tds_code,
          tdsGl: row.tds_gl,
          vbtGl: row.vbt_gl,
          venAddress: row.ven_address,
          venAmm: row.ven_amm,
          venCode: row.ven_code,
          // vbtCode: row.vbt_code,
          otherCharges: row.other_charges,
          cgstGl: row.cgst_gl,
          unit: row.unit,
          value: row.value,
        };
      });
      // console.log("arr", arr);
      setViewEditComponents(arr);
      viewVbt.setFieldValue("components", arr);
      // console.log("componets", components);
    } else {
      
        showToast(response.message||"Something wrong happened", "error");
    
    }
  };
  const printFun = async () => {
    // setLoading(true);
    setPrintLoading(true);
    const response = await imsAxios.post("/tally/vbt_report/print_vbt_report", {
      vbt_key: viewReportData[0]?.vbt_code,
    });
    setPrintLoading(false);
    printFunction(response.data.buffer.data);

    setLoading(false);
  };
  useEffect(() => {
    if (viewEditComponents?.length > 0) {
    
      // setTotalValues(arr);
    }
  }, [setViewEditComponents]);

  const backFunction = () => {
    setViewReportData([]);
  };
  const handlerMoreData = () => {
    // console.log("viewEditComponents-----------------", viewEditComponents);
    const obj = {
      vendorCode: viewEditComponents[0]?.ven_code,
      vendorName: viewEditComponents[0]?.vendor,
      vendorAddress: viewEditComponents[0]?.ven_address?.replaceAll("<br>"),
      invoiceDate: viewEditComponents[0]?.invoice_dt,
      gstin: viewEditComponents[0]?.gst_in_no,
      minId: viewEditComponents[0]?.min_id,
      invoiceNumber: viewEditComponents[0].invoice_no,
      comments: viewEditComponents[0]?.comment,
    };
    setShowMoreData(obj);
  };
  const DescriptionItem = ({ title, content }) => (
    <div
      style={{ display: "flex", paddingBottom: 30 }}
      className="site-description-item-profile-wrapper"
    >
      <p
        style={{ marginRight: 10, fontWeight: 500, whiteSpace: "nowrap" }}
        className="site-description-item-profile-p-label"
      >
        {title}:
      </p>
      {content}
    </div>
  );
  const handleVerify = async (viewReportData) => {
    // console.log("viewReportData inside handleVerify", viewReportData);
    Modal.confirm({
      title: `Are you sure you want to verify ${viewReportData}?`,
      content:
        "Please make sure that the values are correct, This process is irreversible",
      onOk() {
        submitVerifyHandler(viewReportData);
      },
      onCancel() {
        submitUnVerifyHandler(viewReportData);
      },
      okText: "Yes",
      cancelText: "No",
    });
  };
  const submitVerifyHandler = async (viewReportData) => {
    setLoading1(true);
    let vbtKey = viewReportData;
    // let id = row.ID;
    const response = await imsAxios.patch("/tally/vbt/verify", {
      // ID: id,
      vbtKey: vbtKey,
      verificationStatus: "true",
    });
    setLoading1(false);
    if (response.status === 200) {
      getSearchResults();
      backFunction(null);
      showToast(response.data, "success");
    }
  };
  const submitUnVerifyHandler = async (viewReportData) => {
    setLoading1(true);
    let vbtKey = viewReportData;
    // let id = row.ID;
    const response = await imsAxios.patch("/tally/vbt/verify", {
      // ID: id,
      vbtKey: vbtKey,
      verificationStatus: "false",
    });
    setLoading1(false);
    if (response.success) {
      getSearchResults();
      showToast("VBT marked as incorrect", "success");
      backFunction(null);
    }
  };

  return (
    <Drawer
      title={
        <span style={{ color: viewReportData[0]?.vbt_status == "D" && "red " }}>
          VBT Key - {viewReportData}
        </span>
      }
      width="100vw"
      onClose={() => backFunction(null)}
      open={viewReportData.length > 0}
      extra={
        <Space>
          {/* <AiFillPrinter onClick={printFun} className="view-icon" /> */}
          <Button
            type=""
            shape="round"
            loading={printLoading}
            icon={<PrinterFilled />}
            onClick={printFun}
          />
          <Button onClick={handlerMoreData}>More Info</Button>
          <Button
            type="primary"
            onClick={() => {
              handleVerify(viewReportData);
            }}
            loading1={loading1}
          >
            Verify{" "}
          </Button>
        </Space>
      }
    >
      <Drawer
        width="30vw"
        onClose={() => setShowMoreData(null)}
        open={showMoreData}
      >
        <Row>
          <Col span={24}>
            <DescriptionItem title="MIN ID" content={showMoreData?.minId} />
          </Col>
        </Row>
        <Row>
          <Col span={24}>
            <DescriptionItem
              title="Invoice"
              content={showMoreData?.invoiceNumber}
            />
          </Col>
        </Row>
        <Row>
          <Col span={24}>
            <DescriptionItem
              title=" Invoice Date"
              content={showMoreData?.invoiceDate}
            />
          </Col>
        </Row>
        <Row>
          <Col span={24}>
            <DescriptionItem
              title=" Vendor"
              content={`${showMoreData?.vendorName} / ${showMoreData?.vendorCode}`}
            />
          </Col>
        </Row>
        <Row>
          <Col span={24}>
            <DescriptionItem
              title="Vendor Address"
              content={showMoreData?.vendorAddress}
            />
          </Col>
        </Row>
        <Row>
          <Col span={24}>
            <DescriptionItem
              title="GST-In Number"
              content={showMoreData?.gstin}
            />
          </Col>
        </Row>
        <Row>
          <Col span={24}>
            <DescriptionItem
              title="Comments"
              content={showMoreData?.comments}
            />
          </Col>
        </Row>
      </Drawer>
      <Form form={viewVbt} layout="vertical">
        <div
          className="remove-table-footer"
          style={{ height: "20%", opacity: loading ? 0.5 : 1 }}
        >
          {/* <MyDataTable
            loading={loading}
            data={viewReportData}
            columns={vbtReportColumns}
          />
          <MyDataTable
            loading={loading}
            data={viewReportData}
            columns={vbtReportColumns2}
          />
          <MyDataTable
            loading={loading}
            data={viewReportData}
            columns={vbtReportColumns3}
          /> */}
          <Form.List name="components">
            {(fields, { add, remove }) => (
              <>
                <Col>
                  {fields.map((field, index) => (
                    <Form.Item noStyle key={field.key || index}>
                      <SingleProduct
                        fields={fields}
                        field={field}
                        index={index}
                        add={add}
                        form={viewVbt}
                        remove={remove}
                        // tdsArray={tdsArray}
                        // allTdsOptions={allTdsOptions}
                        // setOptionState={setOptionState}
                        // optionState={optionState}
                        // glstate={glstate}
                        // setglState={setglState}
                        // getGl={getGl}
                      />
                    </Form.Item>
                  ))}
                
                </Col>
              </>
            )}
          </Form.List>

          <Row justify="end" style={{ marginTop: "20px" }}></Row>
        </div>

        {/* <TaxModal bottom={-100} visibleBottom={125} totalValues={totalValues} /> */}
      </Form>
    </Drawer>
  );
}
// vendorCode: viewReportData[0]?.ven_code,
// vendorAddress: viewReportData[0]?.ven_address,
// invoiceDate: viewReportData[0]?.vbt_invoice_date,
// gstin: viewReportData[0]?.vbt_gstin,
// minId: viewReportData[0]?.min_id,
// comments: viewReportData[0]?.vbt_comment,
