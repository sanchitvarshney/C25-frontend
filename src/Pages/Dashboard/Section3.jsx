
import { Card, Col, Row, Typography } from "antd";
import { customColor } from "../../utils/customColor";
const Section3 = ({ columns, rows, title, date, setDate }) => {

  return (
    <Col span={12} style={{ minHeight: "100%" }}>
      <Card
        style={{ minHeight: "100%", backgroundColor:customColor.cardColor }}
        styles={{ body: { minHeight: "100%" } }}
        size="small"
      >
        <Row>
          <Col span={24}>
            <Row justify="space-between" align="middle">
              <Col>
                <Typography.Title type="secondary" level={5}>
                  {title}
                </Typography.Title>
              </Col>
              {/* <Col>
                <MyDatePicker setDateRange={setDate} startingDate={true} />
              </Col> */}
            </Row>
          </Col>
          <Col span={24}>
            {rows.length === 0 && (
              <Row justify="center" style={{ margin: 50 }}>
                <Typography.Text type="secondary">
                  No Data Found
                </Typography.Text>
              </Row>
            )}
            {rows.length > 0 && (
              <table style={{ width: "100%" }}>
                <thead>
                  <tr>
                    {columns.map((col, colIndex) => (
                      <th key={colIndex} style={{ textAlign: "left", padding: "8px" }}>
                        <Typography.Text strong>{col.headerName}</Typography.Text>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row, rowIndex) => (
                    <tr key={rowIndex} style={{ borderBottom: "1px solid #f0f0f0" }}>
                      {columns.map((col, colIndex) => (
                        <td key={colIndex} style={{ padding: "8px" }}>
                          {row[col.field]}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </Col>
        </Row>
      </Card>
    </Col>
  );
};
export default Section3;
