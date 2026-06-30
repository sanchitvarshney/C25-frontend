import React, { useState, useEffect } from "react";
import axios from "axios";
import EditIcon from "@mui/icons-material/Edit";

import DeleteIcon from "@mui/icons-material/Delete";
// import api from '../config';
import {
  QuestionCircleOutlined,
  ExclamationCircleFilled,
} from "@ant-design/icons";
import GstSideBarForm from "../GstSideBarForm/GstSideBarForm";
import MyDataTable from "../../../Components/MyDataTable";
import { Popconfirm, Row, Col, Button, Modal } from "antd";
import { useToast } from "../../../hooks/useToast.js";
import { imsAxios } from "../../../axiosInterceptor";
import { downloadCSV } from "../../../Components/exportToCSV";
import MyButton from "../../../Components/MyButton";

const ViewGstData = () => {
  const { showToast } = useToast();
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [gstData, setGstData] = useState([]);
  const [selectedGstRowData, setSelectedGstRowData] = useState(null);

  const handleEdit = (id) => {
    const rowToEdit = gstData.find((row) => row.id === id);
    setSelectedGstRowData(rowToEdit);
    setSidebarOpen(true);
  };

  const handleDelete = async (selectedGstRowData) => {
    try {
      const id = selectedGstRowData;
      const response = await imsAxios.post(`/gst/deletegstdata/${id}`);
      if (response.status === 200) {
        showToast("Deleted successfully!");
        getgstData();
      } else {
        showToast("Error in deleting data!","error");
      }
    } catch (error) {
      console.log(error);
    }
  };

  const cancel = (e) => {};

  const columns = [
    {
      headerName: "Sr no.",
      field: "id",
      type: "number",
      width: 60,
      headerClassName: "header-background",
    },
    {
      headerName: "Month",
      field: "Month",
      type: "string",
      width: 110,
      headerClassName: "header-background",
    },
    {
      headerName: "GSTIN",
      field: "Gstin",
      width: 160,
      headerClassName: "header-background",
    },
    {
      headerName: "Supplier Name",
      field: "Suppliername",
      width: 300,
      headerClassName: "header-background",
    },
    {
      headerName: "Invoice Number",
      field: "InvoiceNumber",
      width: 180,
      headerClassName: "header-background",
    },
    {
      headerName: "Invoice Type",
      field: "InvoiceType",
      width: 120,
      headerClassName: "header-background",
    },
    {
      headerName: "Invoice Date",
      field: "InvoiceDate",
      width: 120,
      headerClassName: "header-background",
    },

    {
      headerName: "Invoice Value",
      field: "InvoiceValue",
      width: 120,
      headerClassName: "header-background",
    },
    {
      headerName: "Place of Supply",
      field: "PlaceOfSupply",
      width: 120,
      headerClassName: "header-background",
    },
    {
      headerName: "Rate of Tax",
      field: "RateOfTax",
      headerClassName: "header-background",
    },

    {
      headerName: "Taxable Value",
      field: "TaxableValue",
      headerClassName: "header-background",
    },
    {
      headerName: "IGST",
      field: "IGST",
      headerClassName: "header-background",
    },
    {
      headerName: "CGST",
      field: "CGST",
      headerClassName: "header-background",
    },
    {
      headerName: "SGST",
      field: "SGST",
      headerClassName: "header-background",
    },
    {
      headerName: "Status",
      field: "statusValue",
      width: 300,
      headerClassName: "header-background",
    },
    {
      headerName: "Reconciled",
      field: "Reconciled",
      width: 120,
      headerClassName: "header-background",
    },
    {
      headerName: "Actions",
      field: "Actions",
      width: 100,
      headerClassName: "header-background",
      renderCell: (params) => (
        <>
          <button
            onClick={() => handleEdit(params.row.id)}
            style={{
              cursor: "pointer",
              background: "transparent",
              border: "none",
            }}
          >
            <EditIcon
              style={{ fontSize: "1rem", color: "green", borderRadius: "1rem" }}
            />
          </button>

          <Popconfirm
            title="Delete this item"
            description="Are you sure to delete this data?"
            onConfirm={() => handleDelete(params.row.id)}
            onCancel={cancel}
            icon={
              <QuestionCircleOutlined
                style={{
                  color: "red",
                }}
              />
            }
          >
            <button
              style={{
                cursor: "pointer",
                background: "transparent",
                border: "none",
              }}
            >
              <DeleteIcon
                style={{ fontSize: "1rem", color: "red", borderRadius: "1rem" }}
              />
            </button>
          </Popconfirm>
        </>
      ),
    },
  ];

  const getgstData = async () => {
    try {
      const response = await imsAxios.get(`/gst/getgstdata`);

      if (response.data.code === 500) {
        showToast(response?.data?.message?.msg,"error");
      } else {
        setGstData(response?.data?.gst);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  useEffect(() => {
    getgstData();
  }, []);

  const { confirm } = Modal;

  const showConfirm = () => {
    confirm({
      title: "Do you Want to Validate Data?",
      icon: <ExclamationCircleFilled />,

      onOk() {
        ValidataData();
      },
    });
  };
  const ValidataData = async () => {
    try {
      const response = await imsAxios.get(`/validate/validatedata`);

      if (response.status === 200) {
        showToast("Validation Successfully!");
      } else {
        showToast("Error in validating data","error");
      }
    } catch (error) {
      showToast(error,"error");
    }
  };

  return (
    <div style={{height:"100%", padding:10}}>
      <Button
        onClick={showConfirm}
      >
        Validate Data
      </Button>
      <MyButton
        style={{ marginLeft: "8px" }}
        onClick={() => downloadCSV(gstData, columns, "gstdata")}
        variant="download"
      >
        Download
      </MyButton>
      <Col
        style={{
          height: "calc(100% - 50px)",
          marginTop: "1rem",
        }}
      >
        <MyDataTable columns={columns} data={gstData||[]} />

        {isSidebarOpen && (
          <GstSideBarForm
            onClose={() => {
              setSidebarOpen(false);
              selectedGstRowData(null);
            }}
            columns={columns}
            selectedGstRowData={selectedGstRowData}
            gstData={gstData}
          />
        )}
      </Col>
    </div>
  );
};

export default ViewGstData;
