
import { Col, Drawer, Space, Row } from "antd";
import { CloseCircleFilled, } from "@ant-design/icons";

function InfoModal({ infoModalInfo, setInfoModalInfo, view }) {
  console.log(view);
  return (
    <Space>
      <Drawer
        width="40vw"
        //   title={`${closeModalOpen?.vendor}`}
        title="View"
        placement="right"
        closable={false}
        onClose={() => setInfoModalInfo(false)}
        open={infoModalInfo}
        getContainer={false}
        style={
          {
            //  position: "absolute",
          }
        }
        extra={
          <Space>
            <CloseCircleFilled onClick={() => setInfoModalInfo(false)} />
          </Space>
        }
      >
        <Row>
          <Col></Col>
        </Row>
      </Drawer>
    </Space>
  );
}

export default InfoModal;
