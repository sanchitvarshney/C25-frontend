import  { useEffect, useState } from "react";
import { v4 } from "uuid";
import { useToast } from "../../../hooks/useToast.js";
import { Col, Row, Select, Input } from "antd";
import FormTable from "../../../Components/FormTable";
import MyAsyncSelect from "../../../Components/MyAsyncSelect";
import { imsAxios } from "../../../axiosInterceptor";
import NavFooter from "../../../Components/NavFooter.jsx";
import MySelect from "../../../Components/MySelect.jsx";
import Field from "../../../Components/Field.jsx";
import { Add, Delete } from "@mui/icons-material";

const { TextArea } = Input;
const CreateFGOut = () => {
  const { showToast } = useToast();
  const [loadingUpdate, setLoadingUpdate] = useState(false);
  const [locationOptions, setLocationOptions] = useState([]);
  const [selLoading, setSelLoading] = useState(false);
  const [isValid, setIsValid] = useState(false);
  const options = [
    { label: "Sale", value: "SL001" },
    { label: "Replacement", value: "REPL" },
    { label: "Other", value: "OT001" },
  ];
  const [asyncOptions, setAsyncOptions] = useState([]);
  const [createFgOut, setCreateFgOut] = useState({
    selectType: "",
    comment: "",
    sih: "",
    pro: [],
    qty: [],
    remark: [],
    // uom: [],`
  });

  const [addRowData, setAddRowData] = useState([
    {
      id: v4(),
      product: "",
      quantity: "",
      total: "",
      location: "",
      remarks: "",
      uom: "",
      rate: 0,
    },
  ]);
  // console.log(restValue);

  const plusRow = () => {
    setAddRowData((addRowData) => [
      {
        id: v4(),
        product: "",
        quantity: "",
        location: "",
        total: "",
        remarks: "",
      },
      ...addRowData,
    ]);
  };

  const minusRow = (id) => {
    setAddRowData((addRowData) => {
      return addRowData.filter((row) => row.id != id);
    });
  };

  const getLocations = async () => {
    try {
      const response = await imsAxios.get("/ppr/mfg_locations");
      const arr = [];
      if (response?.success) {
        response?.data?.map((a) => arr.push({ text: a.text, value: a.id }));
        setLocationOptions(arr);
      }
    } catch (e) {
      showToast(e?.message || "Error fetching locations", "error");
    }
  };

  useEffect(() => {
    getLocations();
  }, []);

  const getOption = async (productSearchInput) => {
    try {
      if (productSearchInput?.length > 2) {
        setSelLoading(true);
        const response = await imsAxios.post("/fgOUT/fetchProduct", {
          searchTerm: productSearchInput,
        });
        setSelLoading(false);
        let arr = [];
        if (!response?.success) {
          showToast(
            response?.message || "Error fetching product options",
            "error",
          );
          setSelLoading(false);
          return;
        }
        arr = response?.data.map((d) => {
          return { text: d.text, value: d.id };
        });
        setAsyncOptions(arr);
        // return arr;
      }
    } catch (error) {
      setSelLoading(false);
      showToast(error?.message || "Error fetching product options", "error");
    } finally {
      setSelLoading(false);
    }
  };

const compInputHandler = async (name, id, value) => {
    if (name == "product") {
      setAddRowData((product) =>
        product.map((h) => {
          if (h.id == id) {
            return {
              ...h,
              product: value,
              location: "",
              total: "",
              uom: "",
              rate: 0,
            };
          } else {
            return h;
          }
        }),
      );
    } else if (name == "location") {
      const currentRow = addRowData.find((h) => h.id == id);
      if (!currentRow?.product) {
        showToast("Please select a product first", "error");
        return;
      }
      setAddRowData((location) =>
        location.map((h) => {
          if (h.id == id) {
            return { ...h, location: value };
          } else {
            return h;
          }
        }),
      );
      try {
        const response = await imsAxios.post("/fgOUT/fetchProductData", {
          search: currentRow.product?.value ?? currentRow.product,
          location: value,
        });

        if (response?.success) {
          const totalValue = response?.data?.total;
          const unitValue = response?.data?.unit;
          const war = Number(response?.data?.war);

          setAddRowData((product) =>
            product.map((h) => {
              if (h.id == id) {
                return {
                  ...h,
                  total: totalValue,
                  uom: unitValue,
                  rate: war,
                };
              } else {
                return h;
              }
            }),
          );
        } else {
          showToast(response?.message, "error");
        }
      } catch (error) {
        showToast(error?.message || "Error fetching product options", "error");
      }
    } else if (name == "quantity") {
      setAddRowData((quantity) =>
        quantity.map((h) => {
          if (h.id == id) {
            {
              return { ...h, quantity: value };
            }
          } else {
            return h;
          }
        }),
      );
    } else if (name == "remarks") {
      setAddRowData((remarks) =>
        remarks.map((h) => {
          if (h.id == id) {
            {
              return { ...h, remarks: value.target.value };
            }
          } else {
            return h;
          }
        }),
      );
    }
  };

  const hasIncompleteRow = (rows) =>
    (rows || []).some(
      (a) =>
        !a?.product ||
        !a?.quantity ||
        Number(a?.quantity) <= 0 ||
        !a?.location ||
        !a?.rate ||
        Number(a?.rate) <= 0,
    );

  const addFGOut = async (e) => {
    e.preventDefault();

    if (!createFgOut.selectType || hasIncompleteRow(addRowData)) {
      setIsValid(true);
      return;
    }
    setIsValid(false);

    let arrPro = [];
    let arrQty = [];
    let arrRemark = [];
    let arrLoc = [];
    let arrRate = [];
    addRowData.map((a) => arrPro.push(a.product?.value ?? a.product));
    addRowData.map((a) => arrQty.push(a.quantity));
    addRowData.map((a) => arrRemark.push(a.remarks));
    addRowData.map((a) => arrRate.push(a.rate));
    addRowData.map((a) => arrLoc.push(a.location));

    setLoadingUpdate(true);
    try {
      const response = await imsAxios.post("/fgout/createFgOut", {
        fg_out_type: createFgOut.selectType,
        product: arrPro,
        qty: arrQty,
        rate: arrRate,
        location: arrLoc,
        remark: arrRemark,
        comment: createFgOut.comment,
      });
      if (response?.success) {
        resetFunction();
        showToast(response.message, "success");
      } else {
        showToast(response.message, "error");
      }
    } catch (error) {
      showToast(error?.message ?? "Something went wrong", "error");
    } finally {
      setLoadingUpdate(false);
    }
  };

  const resetFunction = async () => {
    setCreateFgOut({
      selectType: "",
      comment: "",
    });
    setAddRowData([
      {
        id: v4(),
        product: "",
        quantity: "",
        location: "",
        total: "",
        remarks: "",
      },
    ]);
    setIsValid(false);
    showToast("Form Reset", "success");
  };

  const columns = [
    {
      headerName: (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center", // vertical centering
            width: "100%", // take full cell width
            height: "100%", // take full cell height
          }}
        >
          <span onClick={plusRow} style={{ cursor: "pointer" }}>
            <Add color="success" />
            {/* <PlusSquareFilled style={{ cursor: "pointer", fontSize: "1.5rem" }} /> */}
          </span>
        </div>
      ),
      width: 80,
      field: "add",

      // width: "5
      sortable: false,
      renderCell: ({ row }) =>
        addRowData.findIndex((r) => r.id == row.id) >= 1 && (
          <div style={{ display: "flex", justifyContent: "center" }}>
            <span
              onClick={() => minusRow(row?.id)}
              style={{ cursor: "pointer" }}
            >
              <Delete color="error" />
            </span>
          </div>
        ),
      // sortable: false,
    },

    {
      headerName: "Product / SKU",
      field: "product",
      width: 400,
      renderCell: ({ row }) => (
        <MyAsyncSelect
          selectLoading={selLoading}
          onBlur={() => setAsyncOptions([])}
          loadOptions={getOption}
          value={row?.product}
          optionsState={asyncOptions}
          labelInValue
          showError={isValid}
          message="Product is required"
          onChange={(e) => compInputHandler("product", row.id, e)}
          // placeholder="Part/Name"
        />
      ),
    },
    {
      headerName: "Location *",
      field: "location",
      width: 400,
      renderCell: ({ row }) => (
        <MySelect
          value={row?.location}
          onChange={(value) => compInputHandler("location", row.id, value)}
          options={locationOptions}
          placeholder="Select location"
          showError={isValid}
          message="Location is required"
        />
      ),
    },
    {
      headerName: "	Stock In Hand",
      // field: "qty",
      width: 170,
      renderCell: ({ row }) => (
        <Input suffix={row?.uom} disabled value={row?.total} />
      ),
    },
     {
      headerName: "Rate",
      field: "rate",
      width: 170,
      renderCell: ({ row }) => (
        <Field
          attr="required | Rate is required"
          value={row?.rate}
          treatZeroAsEmpty
          showValidation={isValid}
        >
          <Input disabled value={row?.rate} />
        </Field>
      ),
    },
    {
      headerName: "Issue Qty",
      field: "quantity ",
      width: 170,
      renderCell: ({ row }) => (
        <Field
          attr="required | Qty is required"
          value={row?.quantity}
          treatZeroAsEmpty
          showValidation={isValid}
        >
          <Input
            placeholder="Qty"
            suffix={row?.uom}
            value={row?.quantity}
            onChange={(e) =>
              compInputHandler("quantity", row.id, e.target.value)
            }
            type="number"
          />
        </Field>
      ),
    },
    {
      headerName: "Remark",
      field: "remarks ",
      width: 250,

      renderCell: ({ row }) => (
        <Input
          placeholder="Remark"
          value={addRowData?.remarks}
          onChange={(e) => compInputHandler("remarks", row.id, e)}
        />
      ),
    },
  ];

  return (
    <>
      <Row gutter={10} style={{ margin: "8px", height: "calc(100% - 70px)" }}>
        <Col span={16}>
          <Row gutter={16}>
            <Col span={8}>
              <Field
                attr="required | Please select type"
                value={createFgOut.selectType}
                showValidation={isValid}
              >
                <Select
                  style={{
                    width: "100%",
                    marginBottom: "10px",
                  }}
                  options={options}
                  placeholder="Select"
                  value={createFgOut.selectType}
                  onChange={(e) =>
                    setCreateFgOut((createFgOut) => {
                      return {
                        ...createFgOut,
                        selectType: e,
                      };
                    })
                  }
                />
              </Field>
            </Col>
            <Col span={8}>
              <TextArea
                rows={1}
                placeholder="Comment(Optional)"
                className="form-control"
                value={createFgOut.comment}
                onChange={(e) =>
                  setCreateFgOut((createFgOut) => {
                    return {
                      ...createFgOut,
                      comment: e.target.value,
                    };
                  })
                }
              />
            </Col>
          </Row>
        </Col>
        <Col
          span={24}
          style={{ height: "calc(100% - 50px)", overflowY: "auto", }}
        >
          <FormTable
            data={addRowData}
            columns={columns}
            hideHeaderMenu
            hideFooter
          />
        </Col>
      </Row>
      <Row>
        <NavFooter
          resetFunction={resetFunction}
          submitFunction={addFGOut}
          nextLabel="Submit"
          loading={loadingUpdate}
          
        />
      </Row>
    </>
  );
};

export default CreateFGOut;
