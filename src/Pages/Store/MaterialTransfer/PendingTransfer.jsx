import React, { useEffect, useState } from "react";
import { useToast } from "../../../hooks/useToast.js";
import ViewModal from "./Modal/ViewModal";

import { Button, Col, DatePicker, Input, Row, Select } from "antd";
import MySelect from "../../../Components/MySelect";
import MyDataTable from "../../../Components/MyDataTable";
import { GridActionsCellItem } from "@mui/x-data-grid";
import { EyeTwoTone } from "@ant-design/icons";
import { v4 } from "uuid";
import MyDatePicker from "../../../Components/MyDatePicker";
import { imsAxios } from "../../../axiosInterceptor";
import MyButton from "../../../Components/MyButton";

function PendingTransfer() {
  const { showToast } = useToast();
  const [locationData, setLocationData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [allData, setAllData] = useState({
    typeWise: "datewise",
    selectdate: "",
    transactionText: "",
    locationText: "",
  });

  const [datee, setDatee] = useState("");
  const [dataComesFromDateWise, setDataComesFromDateWise] = useState([]);
  const [dataComesFromTransactionWise, setDataComesFromTransactionWise] =
    useState([]);
  const [dataComesFromLocationWise, setdataComesFromLocationWise] = useState(
    []
  );
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

  // fetch Date wise
  const dateWise = async (e) => {
    setLoading(true);
    e.preventDefault();

    const response = await imsAxios.post("/godown/fetchPending_tranfers", {
      data: datee,
      wise: allData.typeWise,
    });

    if (response?.success) {
      let arr = response?.data.map((row) => {
        return { ...row, id: v4() };
      });
      setDataComesFromDateWise(arr);
      setLoading(false);
    } else {
      showToast(response?.message, "error");
      setLoading(false);
    }
  };

  const transactionWise = async () => {
    setLoading(true);
    const response = await imsAxios.post("/godown/fetchPending_tranfers", {
      data: allData.transactionText,
      wise: allData.typeWise,
    });

    if (response?.success) {
      let arr = response?.data.map((row) => {
        return { ...row, id: v4() };
      });
      setDataComesFromTransactionWise(arr);
      setLoading(false);
      // setFilterDate(data.data);
    } else {
      showToast(response?.message, "error");
      setLoading(false);
    }
    
  };


  const locationWiseDateFecth = async () => {
    setLoading(true);
    const response = await imsAxios.post("/godown/fetchPending_tranfers", {
      data: allData.locationText,
      wise: allData.typeWise,
    });
  
    if (response?.success) {
      let arr = response?.data.map((row) => {
        return { ...row, id: v4() };
      });
      setdataComesFromLocationWise(arr);
      setLoading(false);
      // setFilterDate(data.data);
    } else {
      showToast(response?.message, "error");
      setLoading(false);
    }
  };

  const getLocation = async () => {
    const response = await imsAxios.post("/backend/fetchLocation");
    const arr = [];
    response?.data.map((a) => arr.push({ text: a.text, value: a.id }));
    setLocationData(arr);
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
              onChange={(e) =>
                setAllData((allData) => {
                  return { ...allData, typeWise: e };
                })
              }
            />
          </div>
        </Col>
        {allData.typeWise == "datewise" ? (
          <>
            <Col span={5} className="gutter-row">
              <MyDatePicker setDateRange={setDatee} size="default" />
            </Col>
            <Col span={2}>
              <MyButton
                onClick={dateWise}
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
              <Input
                style={{ width: "100%" }}
                value={allData.transactionText}
                onChange={(e) =>
                  setAllData((allData) => {
                    return { ...allData, transactionText: e.target.value };
                  })
                }
              />
            </Col>
            <Col span={2}>
              <MyButton
                onClick={transactionWise}
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
              />
            </Col>
            <Col span={2}>
              <MyButton
                onClick={locationWiseDateFecth}
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
        {allData.typeWise == "datewise" ? (
          <MyDataTable
            loading={loading}
            data={dataComesFromDateWise}
            columns={columns}
          />
        ) : allData.typeWise == "transactionwise" ? (
          <MyDataTable
            loading={loading}
            data={dataComesFromTransactionWise}
            columns={columns}
          />
        ) : allData.typeWise == "locationwise" ? (
          <MyDataTable
            loading={loading}
            data={dataComesFromLocationWise}
            columns={columns}
          />
        ) : (
          <MyDataTable
            loading={loading}
            data={dataComesFromDateWise}
            columns={columns}
          />
        )}
      </div>

      <ViewModal setViewModal={setViewModal} viewModal={viewModal} />
    </div>
  );
}

export default PendingTransfer;
