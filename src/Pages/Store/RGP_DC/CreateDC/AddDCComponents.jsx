import { useState } from "react";
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
import FormTable from "../../../../Components/FormTable.jsx";

export default function AddDCComponents({
  newGatePass,
  setActiveTab,
  detailsResetFunction,
  setSuccessPage,
  setPageLoading,
}) {
  const { showToast } = useToast();
  const [rows, setRows] = useState([
    {
      id: v4(),
      component: "",
      qty: 0,
      uom: "",
      rate: 0,
      hsn: "",
      description: "",
    },
  ]);
  const [asyncOptions, setAsyncOptions] = useState([]);
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const { executeFun, loading: loading1 } = useApi();
  const [isValid, setIsValid] = useState(false);

  const getComponents = async (searchInput) => {
    if (searchInput.length > 2) {
      // setSelectLoading(true);
      // const response = await imsAxios.post("/backend/getComponentByNameAndNo", {
      //   search: searchInput,
      // });
      // setSelectLoading(false);
      const response = await executeFun(
        () => getComponentOptions(searchInput),
        "select",
      );
      const { data } = response;
      let arr = [];
      if (response?.success) {
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
        },
      );
      let validatedData = validateResponse(response);
      setPageLoading(false);
      arr = arr.map((row) => {
        let obj = row;
        if (obj.id == id) {
          obj = {
            ...obj,
            [name]: value,
            rate: validatedData.rate,
            uom: validatedData.unit,
            hsn: validatedData.hsn,
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
  const hasIncompleteRow = (data) =>
    (data || []).some(
      (row) =>
        !row?.component ||
        !row?.qty ||
        Number(row?.qty) <= 0 ||
        !row?.rate ||
        Number(row?.rate) <= 0,
    );

  const validateData = () => {
    if (
      newGatePass.passType == "" ||
      !newGatePass.vendorName ||
      newGatePass.vendorBranch == "" ||
      newGatePass.billingId == "" ||
      newGatePass.vehicleNumber == ""
    ) {
      return showToast(
        "Please complete the DC Details tab before adding components",
        "error",
      );
    }

    const componentValues = rows.map((row) => row.component);
    const duplicateFound = componentValues.some(
      (comp, index) =>
        comp &&
        componentValues.findIndex((c) => c?.value === comp?.value) !== index,
    );
    if (duplicateFound) {
      return showToast(
        "You have entered the same component twice in a single request.",
        "error",
      );
    }

    if (hasIncompleteRow(rows)) {
      setIsValid(true);
      return;
    }
    setIsValid(false);

    let final = {
      trans_type: "DC",
      vendor: {
        passtype: newGatePass.passType,
        vendorname: newGatePass.vendorName.value,
        vendorbranch: newGatePass.vendorBranch,
        vendoraddress: newGatePass.vendorAddress,
      },
      bill: {
        billaddressid: newGatePass.billingId,
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
        "/gatepass/createGatePass",
        showSubmitConfirm,
      );
      setSubmitLoading(false);
      if (response.success) {
        setShowSubmitConfirm(false);
        detailsResetFunction();
        resetFunction();
        let successInfo = {
          id: response.data.txn,
          components: rows,
          vendorName: newGatePass.vendorName.label,
        };
        setSuccessPage(successInfo);
      } else {
        showToast(response.message, "error");
      }
    }
    setShowSubmitConfirm(false);
  };

  const resetFunction = () => {
    setRows([
      {
        id: v4(),
        component: "",
        qty: 0,
        uom: "",
        rate: 0,
        hsn: "",
        description: "",
      },
    ]);
    setShowResetConfirm(false);
    setIsValid(false);
  };
  const columns = [
    {
      headerName: <CommonIcons action="addRow" onClick={addRows} />,
      width: 80,
      field: "add",
      sortable: false,
      renderCell: ({ row }) =>
        rows.indexOf(row) >= 1 && (
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
          showError: isValid,
          message: "Component is required",
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
          showError: isValid,
          treatZeroAsEmpty: true,
          message: "Qty is required",
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
          showError: isValid,
          treatZeroAsEmpty: true,
          message: "Rate is required",
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
          inputHandler: inputHandler,
          // disabled: true,
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
  return (
    <div style={{ height: "100%" }}>
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
        <p>Are you sure you want to generate this Delivery Challan?</p>
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
          <Button key="submit" type="primary" onClick={resetFunction}>
            Yes
          </Button>,
        ]}
      >
        <p>
          Are you sure you want to reset the components of this Delivery
          Challan?
        </p>
      </Modal>
      <FormTable columns={columns} data={rows} />
      <NavFooter
        nextLabel="Create"
        resetFunction={() => setShowResetConfirm(true)}
        backFunction={() => setActiveTab("1")}
        submitFunction={validateData}
      />
    </div>
  );
}
