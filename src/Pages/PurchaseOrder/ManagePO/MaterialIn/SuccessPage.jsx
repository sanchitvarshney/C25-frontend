import  { useState } from "react";
import { Col, Result, Row } from "antd";
import { CommonIcons } from "../../../../Components/TableActions.jsx/TableActions";
import  {
  downloadFunction,
} from "../../../../Components/printFunction";
import MyDataTable from "../../../../Components/MyDataTable";
import { imsAxios } from "../../../../axiosInterceptor";

export default function SuccessPage({ po, successColumns, newMinFunction }) {
  // const [printLoading, setPringLoading] = useState(false);
  const [downloadLoading, setDownloadLoading] = useState(false);
  // const printFun = async () => {
  //   setPringLoading(true);

  //   const response = await imsAxios.post("/minPrint/printSingleMin", {
  //     transaction: po?.materialInId,
  //   });
  //   setPringLoading(false);
  //   printFunction(response.data.buffer.data);
  // };
  const handleDownload = async () => {
    setDownloadLoading(true);
    const response = await imsAxios.post("/minPrint/printSingleMin", {
      transaction: po?.materialInId,
    });
    setDownloadLoading(false);
    let filename = `MIN ${po?.materialInId}`;
    downloadFunction(response.data.buffer.data, filename);
  };
  return (
    <div style={{ height: "100vh" }}>
      <Result
        status="success"
        title="Material Inward successfull"
        subTitle={`Material Inward ${po?.materialInId}  (${
          po.components.length
        } component${po.components.length > 1 ? "s" : ""}) ${
          po?.poId ? `from  ${po?.poId}` : ""
        } from ${po?.vendor.vendorname}`}
        extra={[
          <Row justify="center" gutter={16} key={"refresh"}>
            <Col>
              <CommonIcons action={"refreshButton"} onClick={newMinFunction} />
            </Col>
            {/* <Col>
              <CommonIcons
                loading={printLoading}
                action={"printButton"}
                onClick={printFun}
              />
            </Col> */}
            <Col>
              <CommonIcons
                loading={downloadLoading}
                action={"downloadButton"}
                onClick={handleDownload}
              />
            </Col>
          </Row>,
          <Row style={{ marginTop: 15, height: "40vh" }} key={"table"}>
            <MyDataTable data={po.components} columns={successColumns} />
          </Row>,
        ]}
      />
    </div>
  );
}
