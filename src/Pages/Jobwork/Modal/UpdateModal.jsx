import  { useState, useEffect } from "react";
import {CloseCircleFilled } from "@ant-design/icons";
import { useToast } from "../../../hooks/useToast.js";
import { v4 } from "uuid";
import { Button, Col, Drawer, Row, Skeleton, Space, Input,Tooltip } from "antd";
import FormTable from "../../../Components/FormTable";
import { imsAxios } from "../../../axiosInterceptor";
import TableActions from "../../../Components/TableActions.jsx/TableActions";
import Field from "../../../Components/Field.jsx";

function UpdateModal({ updateModalInfo, setUpdateModalInfo, getRows }) {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [view, setView] = useState([]);
  const [mainData, setMainData] = useState([]);
  const [isValid, setIsValid] = useState(false);

  let row = updateModalInfo.row;

  const getAllData = async () => {
    // console.log("this is the status", row.recipeStatus);
    setLoading(true);
    const response = await imsAxios.post("/jobwork/fetchJwAnlyUpdate", {
      jw_transaction: row?.jwId,
      po_transaction: row?.jwId,
      skucode: row?.skuKey,
    });
    
   
    if (response.success) {
       setView(response?.data?.header);
      let arr = response?.data?.body?.map((row, index) => {
        return {
          ...row,
          id: v4(),
          index: index + 1,
          rate: row.rate,
          bom_req: row.bom_req_qty,
        };
      });
      setMainData(arr);
      setLoading(false);
    } else{
      showToast(response.message, "error");
      setLoading(false);
    }
  };

  const compInputHandler = async (name, value, id) => {
    console.log(name, value, id);
    if (name == "bom_req") {
      setMainData((issueQty) =>
        issueQty.map((a) => {
          if (a.id == id) {
            {
              return { ...a, bom_req: value };
            }
          } else {
            return a;
          }
        })
      );
    } else {
      let arr = mainData;
      arr = arr.map((row) => {
        let obj = row;
        if (obj.id === id) {
          return {
            ...obj,
            [name]: value,
          };
        } else {
          return obj;
        }
      });
      setMainData(arr);
    }
  };

  const reset = (i) => {
    setMainData((allDataComes) => {
      let filteredData = allDataComes.filter((row) => row.id != i);
      // Update the index for remaining rows
      return filteredData.map((row, index) => ({
        ...row,
        index: index + 1,
      }));
    });
  };
  const columns = [
    { field: "index", headerName: "S No.", width: 60 },
    { field: "part_code", headerName: "Part Code.", width: 120 },
    { field: "component_name", headerName: "Component Name", width: 450 },
    { field: "part_status", headerName: "Status", width: 100 },
    {
      field: "part_alt",
      headerName: "Alt Part",
      width: 150,
      renderCell: ({ row }) => {
        // Handle the new backend structure with alts array
        if (row?.part_alt && Array.isArray(row.part_alt) && row.part_alt.length > 0) {
          const altParts = row.part_alt
            .filter((alt) => alt.alt_component_part !== "N/A")
            .map((alt) => alt.alt_component_part)
            .join(", ");

          const altNames = row.part_alt
            .filter((alt) => alt.alt_component_name !== "N/A")
            .map((alt) => alt.alt_component_name)
            .join(", ");

          return (
            <Tooltip title={altNames}>
              <span>{altParts}</span>
            </Tooltip>
          );
        }

        // Fallback for old structure or empty alts
        const altNames = Array.isArray(row?.alt_component_part)
          ? row.alt_component_part.join(", ")
          : "";
        const altParts = Array.isArray(row?.alt_component_part)
          ? row.alt_component_part.join(", ")
          : "";

        return (
          <Tooltip title={altNames}>
            <span>{altParts}</span>
          </Tooltip>
        );
      },
    },
    { field: "bom_req_qty", headerName: "BOM Required Qty", width: 180 },
    {
      field: "rate",
      headerName: "Rate",
      width: 180,
      renderCell: ({ row }) => (
        <Field
          attr="required | Rate is required"
          value={row?.rate}
          treatZeroAsEmpty
          showValidation={isValid}
        >
          <Input
            value={row.rate}
            type="number"
            onChange={(e) => compInputHandler("rate", e.target.value, row.id)}
          />
        </Field>
      ),
    },
    { field: "uom", headerName: "UoM", width: 100 },
    {
      // field: "bom_req_qty",
      headerName: "Update Qty",
      width: 240,
      renderCell: ({ row }) => (
        <Field
          attr="required | Update Qty is required"
          value={row?.bom_req}
          treatZeroAsEmpty
          showValidation={isValid}
        >
          <Input
            disabled={row?.recipeStatus == "PENDING"}
            type="number"
            value={row?.bom_req}
            onChange={(e) =>
              compInputHandler("bom_req", e.target.value, row.id)
            }
          />
        </Field>
      ),
    },
    {
      field: "Actions",
      headerName: "Actions",
      width: 150,
      renderCell: ({ row }) => (
        <>
          <TableActions
            action="delete"
            disabled={row?.recipeStatus == "PENDING"}
            onClick={() => reset(row.id)}
            // onClick={() => console.log(row)}
            style={{ fontSize: "20px", marginLeft: "10px" }}
          />
        </>
      ),
    },
  ];

  const hasIncompleteRow = (rows) =>
    (rows || []).some(
      (a) =>
        !a?.rate ||
        Number(a?.rate) <= 0 ||
        !a?.bom_req ||
        Number(a?.bom_req) <= 0,
    );

  const updateFun = async () => {
    if (hasIncompleteRow(mainData)) {
      setIsValid(true);
      return;
    }
    setIsValid(false);

    let allCompArray = [];
    let allQtyArray = [];
    mainData.map((a) => allCompArray.push(a.component_key));
    mainData.map((a) => allQtyArray.push(a.bom_req ?? "")); 

    //  console.log(view);
    setSubmitLoading(true);

    const response = await imsAxios.post("/jobwork/updateJwAnlyComp", {
      component: allCompArray,
      qty: allQtyArray,
      sku_trans_id: view?.jobwork_sku_id,
      trans_id: view?.jobwork_id,
      rate: mainData.map((row) => row.rate ?? 0),
      part_alt: mainData.reduce((acc, row) => {
        // Only include if there are valid alt parts
        if (Array.isArray(row.part_alt) && row.part_alt.length > 0) {
          const validAlts = row.part_alt
            .filter((alt) => alt.alt_component_part !== "N/A")
            .map((alt) => alt.alt_component_key); // or alt.alt_component_part if you want part code
          if (validAlts.length > 0) {
            acc[row.component_key] = validAlts;
          }
        }
        return acc;
      }, {}),
    });
    setSubmitLoading(false);
    if (response.success) {
      getRows();
      setUpdateModalInfo(false);
    } else if (!response.success) {
      showToast(response.message?.msg || response.message, "error");
      setUpdateModalInfo(false);
    }
    //  console.log(data)
  };

  const handleClose = () => {
    setUpdateModalInfo(false);
    setIsValid(false);
  };

  useEffect(() => {
    if (updateModalInfo) {
      getAllData();
    }
  }, [updateModalInfo]);
  return (
    <Space>
      <Drawer
        width="100vw"
        title={
          <span style={{ fontSize: "15px", color: "#1890ff" }}>
            {`${row?.jwId} / ${row?.vendor}`}
          </span>
        }
        placement="right"
        closable={false}
        onClose={handleClose}
        open={updateModalInfo}
        getContainer={false}
        style={
          {
            //  position: "absolute",
          }
        }
        extra={
          <Space>
            <CloseCircleFilled onClick={handleClose} />
          </Space>
        }
      >
        <Skeleton active loading={loading}>
          <Row>
            <Col span={24}>
              <Row gutter={5}>
                <Col span={8} style={{ fontSize: "12px", fontWeight: "bold" }}>
                  JW PO ID:
                  <span>{view?.jobwork_id}</span>
                </Col>
                <Col
                  span={8}
                  style={{ fontSize: "12px", fontWeight: "bolder" }}
                >
                  Jobwork ID : <span>{view?.jobwork_id}</span>
                </Col>

                <Col
                  span={8}
                  style={{ fontSize: "12px", fontWeight: "bolder" }}
                >
                  FG/SFG Name & SKU :<span>{view?.product_name}</span>
                </Col>
                <Col
                  span={8}
                  style={{ fontSize: "12px", fontWeight: "bolder" }}
                >
                  JW PO created by :<span>{view?.created_by}</span>
                </Col>
                <Col
                  span={8}
                  style={{ fontSize: "12px", fontWeight: "bolder" }}
                >
                  FG/SFG BOM of Recipe :<span>{view?.subject_name}</span>
                </Col>
                <Col
                  span={8}
                  style={{ fontSize: "12px", fontWeight: "bolder" }}
                >
                  Regisered Date & Time :<span>{view?.registered_date}</span>
                </Col>
                <Col
                  span={8}
                  style={{ fontSize: "12px", fontWeight: "bolder" }}
                >
                  FG/SFG Ord Qty :<span>{view?.ordered_qty}</span>
                </Col>
                <Col
                  span={8}
                  style={{ fontSize: "12px", fontWeight: "bolder" }}
                >
                  Job ID Status :<span>{view?.jw_status}</span>
                </Col>
                <Col
                  span={8}
                  style={{ fontSize: "12px", fontWeight: "bolder" }}
                >
                  FG/SFG processed Qty:
                  <span>{view?.proceed_qty}</span>
                </Col>
                <Col
                  span={8}
                  style={{ fontSize: "12px", fontWeight: "bolder" }}
                >
                  FG/SFG processed Qty:
                  <span>{view?.vendor_name}</span>
                </Col>
              </Row>
            </Col>
          </Row>
        </Skeleton>

        <Skeleton loading={loading} active>
          <div style={{ height: "calc(100vh - 220px)", marginTop: "10px" }}>
        
              <FormTable
            
                columns={columns}
                data={mainData}
        
              />
            </div>
       
        </Skeleton>

        <Skeleton loading={loading} active>
          <Row>
            <Col span={24}>
              <div style={{ textAlign: "end", marginTop: "30px" }}>
                <Button
                  loading={submitLoading}
                  onClick={updateFun}
                  type="primary"
                >
                  Update
                </Button>
              </div>
            </Col>
          </Row>
        </Skeleton>
      </Drawer>
    </Space>
  );
}

export default UpdateModal;
