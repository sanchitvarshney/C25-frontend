
import { useState } from "react";
import Loading from "../../Components/Loading";
import {
  downloadCSVCustomColumns,
} from "../../Components/exportToCSV";
import { v4 } from "uuid";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TableContainer,
} from "@mui/material";
import  {
  CommonIcons,
} from "../../Components/TableActions.jsx/TableActions";
import { Button, Col, Form, Row, Space } from "antd";
import MyDatePicker from "../../Components/MyDatePicker";
import { imsAxios } from "../../axiosInterceptor";
import SummaryCard from "../../Components/SummaryCard";

export default function ChartOfAccounts() {
  const [charts, setCharts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState("");
   const [hoveredRow, setHoveredRow] = useState(null);
  const [summary, setSummary] = useState([
    { title: "From - To", description: "" },
    { title: "Closing", description: "" },
    { title: "Opening", description: "" },
    { title: "Total Credit", description: "" },
    { title: "Total Debit", description: "" },
  ]);
  let arr = [];
  const getChart = async () => {
    setLoading(true);
    const response = await imsAxios.post("/tally/ledger/tally", {
      date: dateRange,
    });
    setLoading(false);
    const { data, summary, success } = response;
    if (success) {
      setCharts(flatArray(data));

      let summaryData = [
        { title: "From - To", description: dateRange },
        {
          title: "Closing",
          description: Number(summary[0].closing),
        },
        {
          title: "Opening",
          description: Number(summary[0].opening),
        },
        {
          title: "Total Credit",
          // description: Number(data.summary[0].total_credit)

          description: Number(summary[0].total_credit),
        },
        {
          title: "Total Debit",
          description: Number(summary[0].total_debit),
        },
      ];
      setSummary(summaryData);
    }
  };
  const handleDownloadCSV = () => {
    let csvData = [];
    csvData = charts.map((row) => {
      return {
        Code: row.code,
        Name: row.label
          ? row.label
              .toString()
              .replaceAll("&amp;", "&")
              // .replaceAll("amp", "")
              .replaceAll(";", "")
          : " ",

        Type: row.parent
          ? row.parent == "--"
            ? "Master"
            : "Sub Group"
          : !row.type
            ? "Ledger"
            : row.type,
        Opening: row.opening ?? "--",
        Debit: row.debit && row.debit,
        Credit: row.credit && row.credit,
        Closing: row.closing ?? "--",
      };
    });
    // "From - To": dateRange },
    csvData = [
      {
        Code: "",
        label: "Grand Total",
        Type: "",
        Opening: summary[2].description,
        Debit: summary[4].description,
        Credit: summary[3].description,
        Closing: summary[1].description,
        "From - To": dateRange,
      },
      ...csvData,
      {
        Code: "",
        label: "Grand Total",
        Type: "",
        Opening: summary[2].description,
        Debit: summary[4].description,
        Credit: summary[3].description,
        Closing: summary[1].description,
      },
    ];

    csvData = [...csvData];
    downloadCSVCustomColumns(csvData, "Charts");
  };
  const flatArray = (array) => {
    array?.map((row) => {
      if (row.nodes) {
        arr = [...arr, row];
        flatArray(row.nodes);
        if (row.legers) {
          // let total row.legers.
          arr = [...arr, ...row.legers];
        }
      } else {
        arr = [...arr, row];
        if (row.legers) {
          arr = [
            ...arr,
            ...row.legers,
            {
              type: "End Total",
              label: row.label + " Total",
              debit: row.total_debit,
              credit: row.total_credit,
              closing: row.total_closing,
              opening: row.total_opening,
            },
          ];
        }
      }
    });
    arr = arr.map((row) => {
      return {
        ...row,
        id: v4(),
        type: row.parent
          ? row.parent == "--"
            ? "Master"
            : "Sub Group"
          : !row.type
            ? "Ledger"
            : row.type,
        lable:
          row.label &&
          row.label
            .replaceAll("&amp;", "&")
            .replaceAll("amp", "")
            .replaceAll(";", ""),
      };
    });
    return arr;
  };
  return (
    <>
      <div
        style={{
          position: "relative",
          width: "100%",
          height: "100%",
          padding: 10,
          overflow: "hidden",
        }}
      >
        <Row style={{ marginBottom: 10 }} justify="space-between">
          <Space>
            <Form layout="inline">
              <Form.Item label="Select Range">
                <MyDatePicker setDateRange={setDateRange} />
              </Form.Item>
              <Button
                onClick={getChart}
                disabled={dateRange == ""}
                type="primary"
              >
                Fetch
              </Button>
            </Form>
          </Space>
          <CommonIcons
            action="downloadButton"
            onClick={handleDownloadCSV}
            disabled={charts.length == 0}
          />
        </Row>
        <Row gutter={12} style={{ height: "100%" }}>
          <Col span={4}>
            <SummaryCard summary={summary} title="Summary" loading={loading} />
          </Col>
          <Col span={20}>
            {/* <Card size="small" style={{ height: "100%" }}> */}
            <TableContainer
              style={{
                height: "calc(100vh - 180px)",
                border: "1px solid white",
                borderRadius: "0px",
              }}
            >
              {loading && <Loading />}

              <div
                size="small"
                style={{
                  width: "100%",
                  height: "100%",
                  borderRadius: "0px",
                  border: "1px solid #ccc",
                }}
              >
                {" "}
                <Table
                  stickyHeader
                  sx={{ width: "100%", overflowX: "auto" }}
                  size="small"
                  aria-label="a dense table"
                >
                  <TableHead>
                    <TableRow  >
                      <TableCell className="accountTable " >Code</TableCell>
                      <TableCell className="accountTable">Name</TableCell>
                      <TableCell className="accountTable">Type</TableCell>
                      <TableCell className="accountTable">Opening</TableCell>
                      <TableCell className="accountTable">Debit</TableCell>
                      <TableCell className="accountTable">Credit</TableCell>
                      <TableCell className="accountTable">Closing</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {charts.map((row, idx) => {
                      const rowColor = idx % 2 === 0 ? "#ffffff" : "#f8f9fa";
                      return (
                        <TableRow
                          key={row.name}
                          sx={{
                            backgroundColor:
                                hoveredRow === row.id ? "#fffaec" : rowColor,
                            "&:last-child td, &:last-child th": { border: 0 },
                          }}
                               onMouseEnter={() => setHoveredRow(idx)}
                            onMouseLeave={() => setHoveredRow(null)}
                        >
                          {/* code */}
                          <TableCell
                            style={{
                              fontWeight: row.type === "End Total" && "bold",
                            }}
                            component="th"
                            scope="row"
                          >
                            {row.code}
                          </TableCell>
                          {/* name */}
                          <TableCell
                            style={{
                              fontWeight: row.type === "End Total" && "bold",
                            }}
                          >
                            {row.label}
                          </TableCell>
                          {/* type */}
                          <TableCell
                            style={{
                              fontWeight: row.type === "End Total" && "bold",
                            }}
                          >
                            {row.parent
                              ? row.parent == "--"
                                ? "Master"
                                : "Sub Group"
                              : !row.type
                                ? "Ledger"
                                : row.type}
                          </TableCell>
                          {/* opening */}
                          <TableCell
                            style={{
                              fontWeight: row.type === "End Total" && "bold",
                            }}
                          >
                            {/* {row.opening} */}
                            {row.opening}
                          </TableCell>
                          {/* debit */}
                          <TableCell
                            style={{
                              fontWeight: row.type === "End Total" && "bold",
                            }}
                          >
                            {/* {row.debit} */}
                            {row.debit}
                          </TableCell>
                          {/* credit */}
                          <TableCell
                            style={{
                              fontWeight: row.type === "End Total" && "bold",
                            }}
                          >
                            {/* {row.credit} */}
                            {row.credit}
                          </TableCell>
                          {/* closing */}
                          <TableCell
                            style={{
                              fontWeight: row.type === "End Total" && "bold",
                            }}
                          >
                            {/* {row.closing} */}
                            {row.closing}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </TableContainer>
            {/* </Card> */}
          </Col>
        </Row>
      </div>
    </>
  );
}
