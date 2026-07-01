import { Card, Row, Col, Divider, Typography } from "antd";

const HeaderDetails = ({ headerDetails }) => {
  return (
    <Card size="small" title="JW Details">
      <Row>
        {headerDetails.map((row, index) => (
          <Entry
            key={index}
            title={row.title}
            value={row.value}
            lastIndex={index === headerDetails.length - 1}
          />
        ))}
      </Row>
    </Card>
    // </Card>
  );
};

export default HeaderDetails;

const Entry = ({ title, value, lastIndex }) => {
  return (
    <Col span={24}>
      <Row justify="space-between">
        <Col>
          <Typography.Text style={{ fontSize: "0.8rem" }} strong>
            {title}
          </Typography.Text>
        </Col>
        <Typography.Text style={{ fontSize: "0.8rem" }}>
          {value}
        </Typography.Text>
      </Row>
      {!lastIndex && <Divider style={{ margin: 7 }} />}
    </Col>
  );
};
