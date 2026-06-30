import axios from "axios";
import React, { useEffect, useState } from "react";
import { CommonIcons } from "../../../../Components/TableActions.jsx/TableActions";
import {
  asyncSelectComponent,
  inputComponent,
} from "../../../../Components/TableInput";
import { v4 } from "uuid";
import NavFooter from "../../../../Components/NavFooter";
import { useToast } from "../../../../hooks/useToast.js";
import { Button, Modal } from "antd";
import validateResponse from "../../../../Components/validateResponse";
import { imsAxios } from "../../../../axiosInterceptor";
import { getComponentOptions } from "../../../../api/general.ts";
import useApi from "../../../../hooks/useApi.ts";
import MyDataTable from "../../../../Components/MyDataTable.jsx";
export default function EditDCComponents({
  newGatePass,
  setActiveTab,
  resetFunction,
  setUpdateDCId,
  resetData,
  setPageLoading,
  updatedDCId,
}) {
  const { showToast } = useToast();
  const [rows, setRows] = useState([]);
  console.log(rows);
  const [asyncOptions, setAsyncOptions] = useState([]);
  const [selectLoading, setSelectLoading] = useState(false);
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  // const [resetData, setResetData] = useState({});
  const { executeFun, loading: loading1 } = useApi();

  const getComponents = async (searchInput) => {
    if (searchInput.length > 2) {
      // setSelectLoading(true);
      // const response = await imsAxios.post("/backend/getComponentByNameAndNo", {
      //   search: searchInput,
      // });
      // setSelectLoading(false);
      const response = await executeFun(
        () => getComponentOptions(searchInput),
        "select"
      );
      const { data } = response;
      let arr = [];
      if (!data.msg) {
        arr = data.map((d) => {
          return { text: d.text, value: d.id };
        });
        setAsyncOptions(arr);
      } else {
        setAsyncOptions([]);
      }
    }
  };
  const inputHandler = async (name, value, id) => {
    let arr = rows;
    if (name == "component") {
      setPageLoading(true);
      const response = await imsAxios.post(
        "/component/getComponentDetailsByCode",
        {
          component_code: value.value,
        }
      );
      let validatedData = validateResponse(response);
      setPageLoading(false);
      arr = arr.map((row) => {
        let obj = row;
        if (obj.id == id) {
          obj = {
            ...obj,
            [name]: value,
            rate: validatedData.data.rate,
            uom: validatedData.data.unit,
            hsn: validatedData.data.hsn,
          };
          return obj;
        } else {
          return obj;
        }
      });

      setRows(arr);
    } else {
      arr = arr.map((row) => {
        let obj = row;
        if (obj.id == id) {
          obj = {
            ...obj,
            [name]: value,
          };
          return obj;
        } else {
          return obj;
        }
      });
    }
    setRows(arr);
  };
  const addRows = () => {
    let obj = {
      id: v4(),
      component: "",
      qty: 0,
      uom: "",
      rate: 0,
      hsn: "",
      description: "",
    };
    let arr = rows;
    arr = [obj, ...arr];
    setRows(arr);
  };
  const removeRows = (id) => {
    let arr = rows.filter((row) => row.id != id);
    setRows(arr);
  };
  const validateData = () => {
    let validate = false;
    if (newGatePass.passType == "") {
      return showToast("Please select Pass Type", "error");
    } else if (newGatePass.vendorName == "") {
      return showToast("Please select a Vendor", "error");
    } else if (newGatePass.vendorBranch == "") {
      return showToast("Please select a Vendor Branch", "error");
    } else if (newGatePass.billingId == "") {
      return showToast("Please select a Billing Address", "error");
    } else if (newGatePass.vehicleNumber == "") {
      return showToast("Please enter a Vehicle Number", "error");
    }
    rows.map((row) => {
      if (row.component == "") {
        validate = "Please select a component for all the material entries";
      } else if (row.qty == "" || row.qty == 0) {
        validate = "Quantity of a component should be more than 0";
      } else if (row.rate == "" || row.rate == 0) {
        validate = "Component rate should be more than 0";
      }
    });
    if (validate) {
      return showToast(validate, "error");
    }
    let final = {
      gp: updatedDCId,
      trans_type: "DC",
      vendor: {
        passtype: newGatePass.passType,
        vendorname: newGatePass.vendorName.value,
        vendorbranch: newGatePass.vendorBranch,
        vendoraddress: newGatePass.vendorAddress,
      },
      bill: {
        billaddressid: newGatePass.billingId.value ?? newGatePass.billingId,
        billaddress: newGatePass.billinAddress,
      },
      other: {
        terms_of_payment: newGatePass.paymentTerms,
        reference_no_dt: newGatePass.referenceDate,
        other_reference: newGatePass.otherReferences,
        buyer_order_no: newGatePass.buyerOrderNumber,
        dispatch_doc_no: newGatePass.dispatchDocNumber,
        dispatch_through: newGatePass.dispatch_through,
        destination: newGatePass.destination,
        terms_of_delivery: newGatePass.deliveryTerms,
        vehicle_no: newGatePass.vehicleNumber,
        narration: newGatePass.narration,
      },
      material: {
        serial: rows.map((row) => row.serial),
        component: rows.map((row) => row.component.value),
        qty: rows.map((row) => row.qty),
        rate: rows.map((row) => row.rate),
        hsncode: rows.map((row) => row.hsn),
        remark: rows.map((row) => row.description ?? ""),
      },
    };

    setShowSubmitConfirm(final);
  };
  const submitHandler = async () => {
    if (showSubmitConfirm) {
      setSubmitLoading(true);
      const response = await imsAxios.post(
        "/gatepass/updateDc",
        showSubmitConfirm
      );
      setSubmitLoading(false);
      if (response.success) {
        setUpdateDCId(false);
        // let successInfo = {
        //   id: data.data.transactionID,
        //   components: rows,
        //   vendorName: newGatePass.vendorName.label,
        // };
        setShowSubmitConfirm(false);
        setActiveTab("1");
        showToast(response.message, "success");
      } else {
        showToast(response.message?.msg || response.message, "error");
      }
    }
    setShowSubmitConfirm(false);
  };
  const handleReset = () => {
    if (resetData.components) {
      let arr = [];
      arr = resetData.components.map((row) => ({
        id: row.serial_no,
        component: {
          label: row.selectedComponent[0].text,
          value: row.selectedComponent[0].id,
        },
        qty: row.qty,
        rate: row.rate,
        hsn: row.hsn_code,
        uom: row.unit,
        description: row.remark,
        type: "new",
      }));
      setRows(arr);
    }
    setShowResetConfirm(false);
  };
  const columns = [
    {
      headerName: <CommonIcons action="addRow" onClick={addRows} />,
      width: 80,
      field: "add",
      sortable: false,
      renderCell: ({ row }) =>
        row.type != "new" && (
          <CommonIcons action="removeRow" onClick={() => removeRows(row?.id)} />
        ),
      // sortable: false,
    },
    {
      headerName: "Component",
      field: "component",
      width: 300,
      renderCell: ({ row }) =>
        asyncSelectComponent({
          row: row,
          inputHandler: inputHandler,
          loadOptions: getComponents,
          setAsyncOptions: setAsyncOptions,
          asyncOptions: asyncOptions,
          selectLoading: loading1("select"),
          value: row.component,
        }),
    },
    {
      headerName: "Qty",
      field: "qty",
      width: 150,
      renderCell: ({ row }) =>
        inputComponent({
          row: row,
          inputHandler: inputHandler,
          value: "qty",
          suffix: row.uom,
        }),
    },
    {
      headerName: "Rate",
      field: "rate",
      flex: 1,
      renderCell: ({ row }) =>
        inputComponent({
          row: row,
          inputHandler: inputHandler,
          value: "rate",
        }),
    },
    {
      headerName: "HSN/SAC",
      field: "hsn",
      flex: 1,
      renderCell: ({ row }) =>
        inputComponent({
          row: row,
          value: "hsn",
          disabled: true,
        }),
    },
    {
      headerName: "Value",
      field: "value",
      flex: 1,
      renderCell: ({ row }) =>
        inputComponent({
          row: row,
          value: row.rate * row.qty,
          disabled: true,
          type: "calculated",
        }),
    },
    {
      headerName: "Description",
      field: "description",
      width: 350,
      renderCell: ({ row }) =>
        inputComponent({
          row: row,
          value: "description",
          inputHandler: inputHandler,
        }),
    },
  ];
  useEffect(() => {
    // console.log(newGatePass.components)
    if (newGatePass.components) {
      let arr = [];
      arr = newGatePass.components.map((row) => ({
        id: row.serial_no,
        component: {
          label: row.selectedComponent[0].text,
          value: row.selectedComponent[0].id,
        },
        qty: row.qty,
        rate: row.rate,
        hsn: row.hsn_code,
        uom: row.unit,
        description: row.remark,
        type: "new",
        serial: row.serial_no,
      }));
      setRows(arr);
    }
  }, [newGatePass]);
  return (
    <div style={{ height: "97%", overflowY: "auto" }}>
      {/* submit confirm modal */}
      <Modal
        title="Confirm Create Delivery Challan!"
        open={showSubmitConfirm}
        onCancel={() => setShowSubmitConfirm(false)}
        footer={[
          <Button key="back" onClick={() => setShowSubmitConfirm(false)}>
            No
          </Button>,
          <Button
            key="submit"
            type="primary"
            loading={submitLoading}
            onClick={submitHandler}
          >
            Yes
          </Button>,
        ]}
      >
        <p>Are you sure you want to update this Delivery Challan?</p>
      </Modal>
      {/* reset confirm modal */}
      <Modal
        title="Confirm Reset!"
        open={showResetConfirm}
        onCancel={() => setShowResetConfirm(false)}
        footer={[
          <Button key="back" onClick={() => setShowResetConfirm(false)}>
            No
          </Button>,
          <Button key="submit" type="primary" onClick={handleReset}>
            Yes
          </Button>,
        ]}
      >
        <p>
          Are you sure you want to reset the components of this Delivery Challan
          to the original Challan?
        </p>
      </Modal>
    
      <MyDataTable
        columns={columns}
        rows={rows}
         />
      <NavFooter
        nextLabel="Update"
        resetFunction={() => setShowResetConfirm(true)}
        backFunction={() => setActiveTab("1")}
        submitFunction={validateData}
      />
    </div>
  );
}
