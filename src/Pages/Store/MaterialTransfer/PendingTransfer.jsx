import  { useEffect, useState } from "react";
import { useToast } from "../../../hooks/useToast.js";
import ViewModal from "./Modal/ViewModal";

import { Col, Input, Row, Select } from "antd";
import MySelect from "../../../Components/MySelect";
import MyDataTable from "../../../Components/MyDataTable";
import { GridActionsCellItem } from "@mui/x-data-grid";
import { EyeTwoTone } from "@ant-design/icons";
import { v4 } from "uuid";
import MyDatePicker from "../../../Components/MyDatePicker";
import { imsAxios } from "../../../axiosInterceptor";
import MyButton from "../../../Components/MyButton";
import Field from "../../../Components/Field.jsx";

function PendingTransfer() {
  const { showToast } = useToast();
  const [locationData, setLocationData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isValid, setIsValid] = useState(false);
  const [allData, setAllData] = useState({
    typeWise: "datewise",
    selectdate: "",
    transactionText: "",
    locationText: "",
  });

  const [datee, setDatee] = useState("");
  const [tableData, setTableData] = useState([]);
  const [viewModal, setViewModal] = useState(false);

  const opt = [
    { label: "Date", value: "datewise" },
    { label: "Transaction", value: "transactionwise" },
    { label: "Location", value: "locationwise" },
  ];

  const columns = [
    { field: "insert_date", headerName: "Date", width: 160 },
    { field: "component_part", headerName: "Part", width: 100 },
    { field: "component_name", headerName: "Component", width: 300 },
    { field: "transfer_from", headerName: "Out Location", width: 150 },
    { field: "transfer_to", headerName: "In Location", width: 150 },
    {
      field: "request_qty",
      headerName: "Qty",
      width: 100,
      renderCell: ({ row }) => (
        <span>{row.request_qty + "/" + row.required_qty}</span>
      ),
    },
    { field: "transaction_id", headerName: "Txn ID", width: 150 },
    { field: "request_by", headerName: "Req. By", width: 150 },
    {
      field: "actions",
      headerName: "Action",
      width: 150,
      type: "actions",
      getActions: ({ row }) => [
        <GridActionsCellItem
          key="view"
          icon={<EyeTwoTone onClick={() => setViewModal(row)} />}
        />,
      ],
    },
  ];

  const wiseValueMap = {
    datewise: datee,
    transactionwise: allData.transactionText,
    locationwise: allData.locationText,
  };

  const fetchPendingTransfers = async (e) => {
    e?.preventDefault?.();
    const wiseValue = wiseValueMap[allData.typeWise];
    if (!wiseValue) {
      setIsValid(true);
      return;
    }
    setIsValid(false);
    setLoading(true);
    try {
      const response = await imsAxios.post("/godown/fetchPending_tranfers", {
        data: wiseValue,
        wise: allData.typeWise,
      });

      if (response?.success) {
        setTableData(
          (response?.data || []).map((row) => ({ ...row, id: v4() })),
        );
      } else {
        setTableData([]);
        showToast(response?.message, "error");
      }
    } catch (error) {
      showToast(
        error?.response?.data?.message || "Failed to fetch pending transfers",
        "error",
      );
    } finally {
      setLoading(false);
    }
  };

  const getLocation = async () => {
    try {
      const response = await imsAxios.post("/backend/fetchLocation");
      const arr = (response?.data || []).map((a) => ({
        text: a.text,
        value: a.id,
      }));
      setLocationData(arr);
    } catch (error) {
      showToast(
        error?.response?.data?.message || "Failed to fetch locations",
        "error",
      );
    }
  };

  useEffect(() => {
    getLocation();
  }, []);

  return (
    <div style={{ height: "100%", padding: "10px" }}>
      <Row gutter={16} >
        <Col span={4} className="gutter-row">
          <div>
            <Select
              style={{ width: "100%" }}
              options={opt}
              placeholder="Select Option"
              value={allData.typeWise}
              onChange={(e) => {
                setIsValid(false);
                setTableData([]);
                setAllData((allData) => {
                  return { ...allData, typeWise: e };
                });
              }}
            />
          </div>
        </Col>
        {allData.typeWise == "datewise" ? (
          <>
            <Col span={5} className="gutter-row">
              <MyDatePicker
                setDateRange={setDatee}
                value={datee}
                size="default"
                showError={isValid}
              />
            </Col>
            <Col span={2}>
              <MyButton
                onClick={fetchPendingTransfers}
                loading={loading}
                type="primary"
                variant="search"
              >
                Fetch
              </MyButton>
            </Col>
          </>
        ) : allData.typeWise == "transactionwise" ? (
          <>
            <Col span={5} className="gutter-row">
              <Field
                attr="required | Please enter Transaction Id"
                value={allData.transactionText}
                showValidation={isValid}
                onChange={(e) =>
                  setAllData((allData) => {
                    return { ...allData, transactionText: e.target.value };
                  })
                }
              >
                <Input style={{ width: "100%" }} />
              </Field>
            </Col>
            <Col span={2}>
              <MyButton
                onClick={fetchPendingTransfers}
                loading={loading}
                type="primary"
                variant="search"
              >
                Fetch
              </MyButton>
            </Col>
          </>
        ) : allData.typeWise == "locationwise" ? (
          <>
            <Col span={5} className="gutter-row">
              <MySelect
                options={locationData}
                onChange={(e) =>
                  setAllData((allData) => {
                    return { ...allData, locationText: e };
                  })
                }
                value={allData.locationText}
                showError={isValid}
                message="Please select a Location"
              />
            </Col>
            <Col span={2}>
              <MyButton
                onClick={fetchPendingTransfers}
                loading={loading}
                type="primary"
                variant="search"
              >
                Fetch
              </MyButton>
            </Col>
          </>
        ) : (
          ""
        )}
      </Row>

      <div style={{ height: "calc(100% - 50px)", marginTop: "10px" }}>
        <MyDataTable loading={loading} data={tableData} columns={columns} />
      </div>

      <ViewModal setViewModal={setViewModal} viewModal={viewModal} />
    </div>
  );
}

export default PendingTransfer;
