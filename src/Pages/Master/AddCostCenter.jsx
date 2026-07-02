import { useCallback, useEffect, useState } from "react";
import { Button, Form, Input } from "antd";
import PropTypes from "prop-types";
import { imsAxios } from "../../axiosInterceptor";
import MyDataTable from "../../Components/MyDataTable";
import { useToast } from "../../hooks/useToast";

function parseCostCenterText(text = "") {
  const trimmed = String(text).trim();
  const match = trimmed.match(/^(.+?)\s*\((.+)\)\s*$/);
  if (match) {
    return { code: match[1].trim(), name: match[2].trim() };
  }
  return { code: trimmed, name: trimmed };
}

export default function AddCostCenter({
  setShowAddCostModal,
}) {
  const { showToast } = useToast();
  const [centerData, setCenterData] = useState([]);
  const [newCostCenter, setNewCostCenter] = useState({
    code: "",
    name: "",
  });
  const [submitLoading, setSubmitLoading] = useState(false);
  const inputHandler = (name, value) => {
    let obj = newCostCenter;
    obj = { ...obj, [name]: value };
    setNewCostCenter(obj);
  };
  const submitCostCenter = async () => {
    if (newCostCenter.name.length > 0 && newCostCenter.code.length > 0) {
      try {
        setSubmitLoading(true);
        const response = await imsAxios.post("/purchaseOrder/createCostCenter", {
          code: newCostCenter.code,
          name: newCostCenter.name,
        });

        const isSuccess =
          Boolean(response?.success) ||
          Number(response?.code) === 200 ||
          String(response?.status).toLowerCase() === "success";

        if (isSuccess) {
          showToast(response?.message || "Cost center created successfully", "success");
          setNewCostCenter({
            code: "",
            name: "",
          });
          if (typeof setShowAddCostModal === "function") {
            setShowAddCostModal(false);
          }
          handleFetchUOMList();
        } else {
          showToast(response?.message || "Failed to create cost center", "error");
        }
      } catch (error) {
        showToast(error?.message || "Failed to create cost center", "error");
      } finally {
        setSubmitLoading(false);
      }
    } else {
      showToast("Cost Center should have a Name and ID", "error");
    }
  };

  const handleFetchUOMList = useCallback(async () => {
    try {
       const response = await imsAxios.get("backend/costcenter?search=all");

     const isSuccess =
        response?.success === true ||
        response?.status === "success"

      if (isSuccess) {
        const formattedRows = (response?.data ?? []).map((item, index) => {
          const { code, name } = parseCostCenterText(item?.text);
          return {
            ...item,
            id: item?.id ?? item?.uID ?? `cost-center-${index}`,
            code: item?.code ?? code,
            name: item?.name ?? name,
            timestamp: item?.timeStamp ?? "-",
          };
        });
        setCenterData(formattedRows);
      } else {
        showToast(response?.message || "Failed to fetch cost centers", "error");
      }
    } catch (error) {
      showToast(error?.message || "Failed to fetch cost centers", "error");
    }
  }, [showToast]);

  const columns = [
    { field: "code", headerName: "Cost Center ID", minWidth: 170, flex: 1 },
    { field: "name", headerName: "Cost Center Name", minWidth: 220, flex: 1 },
    { field: "timestamp", headerName: "Date", minWidth: 170, flex: 1 },
  ];

  useEffect(() => {
    handleFetchUOMList();
  }, [handleFetchUOMList]);

  return (
    <div
      style={{
        height: "calc(100vh - 160px)",
   
     
        padding: "12px",
      }}
    >
      <div style={{maxWidth: "100%", marginBottom: 5, display:"flex", alignItems:"center",}}>
      
          <Form style={{ width: "100%",display: "flex", gap: "1rem", alignItems:"center",  }} >
            <Form.Item label="Cost Center Id">
              <Input
                inputMode="numeric"
                value={newCostCenter.code}
                onChange={(e) => {
                  const digitsOnly = e.target.value.replaceAll(/\D/g, "");
                  inputHandler("code", digitsOnly);
                }}
                placeholder="Enter Cost Center ID"
              />
            </Form.Item>
            <Form.Item label="Cost Center Name">
              <Input
                value={newCostCenter.name}
                onChange={(e) => {
                  inputHandler("name", e.target.value);
                }}
                placeholder="Enter Cost Center Name"
              />
            </Form.Item>
            <Form.Item >
                 <Button
              onClick={submitCostCenter}
              loading={submitLoading}
              type="primary"
            >
              Submit
            </Button>
            </Form.Item>
          </Form>
       
        
       
      
      </div>
      <div  style={{ height: "100%" }}>
    
          <MyDataTable
            // loading={loading("fetch")}
            data={centerData}
            columns={columns}
          />
      
      </div>
    </div>
  );
}

AddCostCenter.propTypes = {
  setShowAddCostModal: PropTypes.func,
};
