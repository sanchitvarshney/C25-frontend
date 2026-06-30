import { useEffect, useState } from "react";
import MyDataTable from "../../../Components/MyDataTable";
import { v4 } from "uuid";
import { Card, Col, Row, Tabs } from "antd";
import EditLedger from "./EditLedger";
import ToolTipEllipses from "../../../Components/ToolTipEllipses";
import { CommonIcons } from "../../../Components/TableActions.jsx/TableActions";
import { downloadCSV } from "../../../Components/exportToCSV";
import MapClient from "./MapClient";
import AddLedger from "./AddLedger";
import MapVendor from "./MapVendor";
import { imsAxios } from "../../../axiosInterceptor";

export default function CreateMaster() {
  const [ledgerList, setLedgerList] = useState([]);
  const [tableLoading, setTableLoading] = useState(false);

  const columns = [
    {
      headerName: "#",
      field: "index",
      width: 30,
    },
    {
      headerName: "Name",
      field: "ladgerName",
      renderCell: ({ row }) => <ToolTipEllipses text={row.ladgerName} />,
      width: 200,
    },
    {
      headerName: "Code",
      field: "ladgerCode",
      width: 120,
    },
    {
      headerName: "Search Name",
      field: "searchName",
      width: 150,
    },
    {
      headerName: "Group Name",
      field: "subGroup",
      renderCell: ({ row }) => <ToolTipEllipses text={row.subGroup} />,
      width: 200,
    },
    {
      headerName: "GST Applicable",
      field: "gst",
    },
    {
      headerName: "TDS Applicable",
      field: "tds",
    },
    {
      headerName: "Account Status",
      field: "accountStatus",
      width: 150,
    },
  ];
  const getLedgerList = async () => {
    setLedgerList([]);
    setTableLoading(true);
    const response = await imsAxios.get("/tally/ledger/listAllLedger");
    setTableLoading(false);
    const { data } = response;
    if (data) {
      const arr = data.map((row, index) => {
        return {
          ...row,
          id: v4(),
          index: index + 1,
        };
      });

      setLedgerList(arr);
    }
  };

  const options = [
    { text: "YES", value: "yes" },
    { text: "NO", value: "no" },
  ];
  const statusOptions = [
    { text: "ACTIVE", value: "active" },
    { text: "INACTIVE", value: "inactive" },
  ];

  useEffect(() => {
    getLedgerList();
  }, []);
  return (
    <div style={{ height: "100%", padding: 10 }}>
      <Row gutter={12} style={{ height: "100%" }}>
        <Col span={10}>
          <Tabs
            type="card"
            size="small"
            items={[
              {
                key: "1",
                label: "Add new Ledger",
                children: (
                  <AddLedger
                    getLedgerList={getLedgerList}
                    options={options}
                    statusOptions={statusOptions}
                  />
                ),
              },
              {
                key: "2",
                label: "Edit Ledger",
                children: (
                  <Card title="Edit Ledger" size="small">
                    <EditLedger getLedgerList={getLedgerList} />
                  </Card>
                ),
              },
              {
                key: "3",
                label: "Map Vendor",
                children: (
                  <MapVendor statusOptions={statusOptions} options={options} />
                ),
              },
              {
                key: "4",
                label: "Map Customer",
                children: <MapClient />,
              },
            ]}
          />
        </Col>
        {/* add form column ends */}
        <Col style={{  height: "calc(100% - 35px)" }} span={14}>
          <Row justify="end" style={{ marginBottom: 10 }}>
            <CommonIcons
              action="downloadButton"
              onClick={() => downloadCSV(ledgerList, columns, "Ledgers")}
            />
          </Row>
          <MyDataTable
            loading={tableLoading}
            columns={columns}
            data={ledgerList}
            componentsProps={{
              toolbar: {
                showQuickFilter: true,
                quickFilterProps: { debounceMs: 500 },
              },
            }}
          />
        </Col>
      </Row>
    </div>
  );
}
