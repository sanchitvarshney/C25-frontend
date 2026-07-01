
import { Col,  Drawer, Row, Space, Skeleton } from "antd";

function UpdateViewModal({ viewModal, setViewModal, header, loadingUpdate }) {


  return (
    <Space>
      <Drawer
        title="Details"
        placement="top"
        closable={() => setViewModal(false)}
        onClose={() => setViewModal(false)}
        open={viewModal}
        width="10vw"

        //   key={placement}
      >
        <Skeleton loading={loadingUpdate} active>
          <Col span={24}>
            <Row
              gutter={10}
              style={{ border: "0.9px solid grey", margin: "0px", padding: "30px" }}
            >
              <Col span={12} style={{ padding: "3px" }}>
                <span>Job Work ID :</span>
                {header?.jobwork_id}
              </Col>
              <Col span={12} style={{ padding: "3px" }}>
                <span>JW PO created by :</span>
                {/* {header?.jobwork_id} */}
              </Col>
              <Col span={12} style={{ padding: "3px" }}>
                <span>FG/SFG Name & SKU:</span>
                {`${header?.product_name} / ${header?.sku_code}`}
              </Col>
              <Col span={12} style={{ padding: "3px" }}>
                <span>Regisered Date & Time :</span>
                {header?.registered_date}
              </Col>
              <Col span={12} style={{ padding: "3px" }}>
                <span>FG/SFG BOM of Recipe :</span>
                {header?.subject_name}
              </Col>
              <Col span={12} style={{ padding: "3px" }}>
                <span>Job Worker:</span>
                {header?.vendor_name}
              </Col>
              <Col span={12} style={{ padding: "3px" }}>
                <span>FG/SFG Ord Qty :</span>
                {header?.ordered_qty}
              </Col>
            </Row>
          </Col>
          {/* <Divider /> */}
          {/* <div style={{ height: "74%", marginTop: "20px" }}>
            <div style={{ height: "100%" }}>
              <MyDataTable columns={columns} data={component} />
            </div>
          </div> */}
        </Skeleton>
      </Drawer>
    </Space>
  );
}

export default UpdateViewModal;
