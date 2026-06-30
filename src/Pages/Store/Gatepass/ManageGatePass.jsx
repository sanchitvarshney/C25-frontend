import React, { useState, useEffect } from "react";
import { useToast } from "../../../hooks/useToast.js";
import MyDataTable from "../../../Components/MyDataTable";
import MyDatePicker from "../../../Components/MyDatePicker";
import MySelect from "../../../Components/MySelect";
import printFunction, {
  downloadFunction,
} from "../../../Components/printFunction";
import { Button, Col, Input, Row, Space } from "antd";
import { v4 } from "uuid";
import { downloadCSV } from "../../../Components/exportToCSV";
import TableActions, {
  CommonIcons,
} from "../../../Components/TableActions.jsx/TableActions";
import { imsAxios } from "../../../axiosInterceptor";
import MyButton from "../../../Components/MyButton";

export default function ManageGatePass() {
  const { showToast } = useToast();
  const [wise, setWise] = useState("datewise");
  const [searchInput, setSearchInput] = useState("");
  const [searchDateRange, setSearchDateRange] = useState();
  const [rows, setRows] = useState([]);
  const [searchLoading, serSearchLoading] = useState(false);
  const [loading, setLoading] = useState(false);

  const wiseOptions = [
    { text: "Date Wise", value: "datewise" },
    { text: "GP ID Wise", value: "gpwise" },
    { text: "Mobile / Email Wise", value: "mobemailwise" },
  ];
  const columns = [
    {
      headerName: "Serial No.",
      field: "index",
      width: 100,
    },
    {
      headerName: "Jounral ID",
      field: "transaction_id",
      flex: 1,
    },
    {
      headerName: "To (Name)",
      field: "recipient",
      flex: 1,
    },
    {
      headerName: "Created Date/Time",
      field: "gp_reg_date",
      flex: 1,
    },
    {
      headerName: "Action",
      field: "action",
      type: "actions",
      flex: 1,
      getActions: ({ row }) => [
        <TableActions
          action="print"
          onClick={() => {
            printFun(row.transaction_id);
          }}
        />,
        <TableActions
          action="download"
          onClick={() => {
            downloadFun(row.transaction_id);
          }}
        />,
      ],
    },
  ];
  const downloadFun = async (id) => {
    setLoading(true);
    let filename = `Gatepass ${id}`;
    const response = await imsAxios.post("/gatepass/printGP", {
      transaction: id,
    });
    setLoading(false);
    if (response?.success) {
      console.log(response,"rseponse=========================")
      downloadFunction(response?.data.buffer.data, filename);
    } else {
      showToast(response.message, "error");
    }
  };
  const printFun = async (id) => {
    setLoading(true);
    const response = await imsAxios.post("/gatepass/printGP", {
      transaction: id,
    });
    setLoading(false);
    if (response?.success) {
      printFunction(response?.data.buffer.data);
    } else {
      showToast(response?.message, "error");
    }
  };
  const getRows = async () => {
    serSearchLoading(true);
    const response = await imsAxios.post("/gatepass/fetchAllGP", {
      data: wise == "datewise" ? searchDateRange : searchInput,
      wise: wise,
    });
    serSearchLoading(false);
    if (response?.success) {
      const arr = response.data.map((row, index) => {
        return {
          ...row,
          id: v4(),
          index: index + 1,
        };
      });
      setRows(arr);
    } else {
      showToast(response?.message, "error");
    }
  };
  const additional = () => (
    <Space>
      <div style={{ width: 150 }}>
        <MySelect options={wiseOptions} onChange={setWise} value={wise} />
      </div>
      <div style={{ width: 300 }}>
        {wise === "datewise" ? (
          <div style={{ width: 300 }}>
            <MyDatePicker
              setDateRange={setSearchDateRange}
              dateRange={searchDateRange}
              value={searchDateRange}
              size="default"
            />
          </div>
        ) : wise === "gpwise" ? (
          <div style={{ width: 300 }}>
            <Input
              type="text"
              // className="form-control w-100 "
              placeholder="Enter GP ID"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
          </div>
        ) : (
          wise === "mobemailwise" && (
            <div style={{ width: 300 }}>
              <Input
                type="text"
                // className="form-control w-100 "
                placeholder="Enter Email / Phone Number"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
              />
            </div>
          )
        )}
      </div>
      <Button
        loading={searchLoading}
        disabled={
          wise === "datewise"
            ? searchDateRange === ""
              ? true
              : false
            : !searchInput
            ? true
            : false
        }
        type="primary"
        onClick={getRows}
        id="submit"
      >
        Search
      </Button>
      <CommonIcons
        action="downloadButton"
        onClick={() => downloadCSV(rows, columns, "GatePass Report")}
        disabled={rows.length == 0}
      />
    </Space>
  );
  return (
    <div style={{ position: "relative", height: "95%", padding:10 }}>
      <Row
        justify="space-between"
      >
        <Col>
          <Space>
            <div style={{ width: 150 }}>
              <MySelect options={wiseOptions} onChange={setWise} value={wise} />
            </div>
            <div style={{ width: 300 }}>
              {wise === "datewise" ? (
                <div style={{ width: 300 }}>
                  <MyDatePicker
                    setDateRange={setSearchDateRange}
                    dateRange={searchDateRange}
                    value={searchDateRange}
                    size="default"
                  />
                </div>
              ) : wise === "gpwise" ? (
                <div style={{ width: 300 }}>
                  <Input
                    type="text"
                    // className="form-control w-100 "
                    placeholder="Enter GP ID"
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                  />
                </div>
              ) : (
                wise === "mobemailwise" && (
                  <div style={{ width: 300 }}>
                    <Input
                      type="text"
                      // className="form-control w-100 "
                      placeholder="Enter Email / Phone Number"
                      value={searchInput}
                      onChange={(e) => setSearchInput(e.target.value)}
                    />
                  </div>
                )
              )}
            </div>
            <MyButton
              variant="search"
              loading={searchLoading}
              disabled={
                wise === "datewise"
                  ? searchDateRange === ""
                    ? true
                    : false
                  : !searchInput
                  ? true
                  : false
              }
              type="primary"
              onClick={getRows}
              id="submit"
            >
              Search
            </MyButton>
          </Space>
        </Col>
        <Col>
          <Space>
            <CommonIcons
              action="downloadButton"
              onClick={() => downloadCSV(rows, columns, "GatePass Report")}
              disabled={rows.length == 0}
            />
          </Space>
        </Col>
      </Row>
      <div
        style={{
          height: "calc(100% - 10px)",
          marginTop:"10px"
      
        }}
      >
        <MyDataTable
          pagination={true}
          data={rows}
          columns={columns}
          headText="center"
          loading={loading || searchLoading}
        />
      </div>
    </div>
  );
}
