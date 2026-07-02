import  { useEffect, useState } from "react";
import MyDatePicker from "../../../../Components/MyDatePicker";
import "../../../../";
import { useToast } from "../../../../hooks/useToast.js";
import { AiFillEdit } from "react-icons/ai";
import MyDataTable from "../../../../Components/MyDataTable";
import MapVBTModal from "../Shared/MapVBTModal";
import MyAsyncSelect from "../../../../Components/MyAsyncSelect";
import MySelect from "../../../../Components/MySelect";
import { GridActionsCellItem } from "@mui/x-data-grid";
import { Button, Checkbox, Form, Input, Modal, Row, Space } from "antd";
import { v4 } from "uuid";
import { imsAxios } from "../../../../axiosInterceptor";
import VBT01Report from "./VBT01/VBT01Report";
// import VBT02Report from "./VBTtype2/VBT02Report";
import useApi from "../../../../hooks/useApi.ts";
import { convertSelectOptions } from "../../../../utils/general.ts";
import { getVendorOptions } from "../../../../api/general.ts";
import MyButton from "../../../../Components/MyButton";
import { FaInfoCircle } from "react-icons/fa";
import { ExclamationCircleOutlined } from "@ant-design/icons";
import { RiProhibitedLine } from "react-icons/ri";
const VBTMainTable = ({ editVbtDrawer }) => {
  const { showToast } = useToast();
  const [wise, setWise] = useState("min_wise");
  const [searchInput, setSearchInput] = useState("");
  const [searchDateRange, setSearchDateRange] = useState("");
  const [vbtData, setVBTData] = useState([]);
  const [selectedRows, setSelectedRows] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [editingVBT, setEditingVBT] = useState(null);
  const [mapVBT, setMapVBT] = useState(false);
  const [asyncOptions, setAsyncOptions] = useState([]);
  const [previewdisData, setPreviewdisData] = useState(false);
  const { executeFun, loading: loading1 } = useApi();
  const [url, setUrl] = useState("");
  const [apiUrl, setApiUrl] = useState("");
  const [ModalForm] = Form.useForm();
  const [extracted, setExtracted] = useState([]);
  const [combinedData, setCombinedDate] = useState([]);
  useEffect(() => {
    if (editVbtDrawer) {
      setEditingVBT(editVbtDrawer);
    }
  }, [editVbtDrawer]);

  useEffect(() => {
    const pageUrl = window.location.href.split("/");
    let splitUrl = pageUrl.at(-1);
    setUrl(splitUrl);
  }, []);

  useEffect(() => {
    // console.log("url", url);
    if (url === "vb-1") {
      setApiUrl("vbt01");
    } else if (url === "vb-2") {
      setApiUrl("vbt02");
    } else if (url === "vb-3") {
      setApiUrl("vbt03");
    } else if (url === "vb-4") {
      setApiUrl("vbt04");
    } else if (url === "vb-5") {
      setApiUrl("vbt05");
    } else if (url === "vb-6") {
      setApiUrl("vbt06");
    } else if (url === "vb-") {
      setApiUrl("vbt07");
    }
  }, [url]);

  const showTypeColumn = vbtData?.some(
    (r) => r?.type != null && String(r.type).trim() !== "",
  );

  const vbtTableColumnsonesix = [
    {
      headerName: "Sr. No.",
      renderCell: ({ row }) => <span>{vbtData?.indexOf(row) + 1}</span>,
      sortable: true,
      flex: 1,
      id: "serial-no",
      width: "120px",
    },
    ...(showTypeColumn
      ? [
          {
            headerName: "Type",
            field: "type",
            sortable: true,
            flex: 1,
            id: "type",
          },
        ]
      : []),

    {
      headerName: "Vendor Code",
      field: "venCode",
      sortable: true,
      flex: 1,
      id: "vendor code",
          renderCell: ({ row }) => <span>{row?.venCode ?? row?.ven_code}</span>,
    },
    {
      headerName: "Transaction",
      field: "transaction",
      sortable: true,
      flex: 1,
      id: "min id",
       renderCell: ({ row }) => <span>{row?.min_transaction ?? row?.transaction}</span>,
    },
    {
      headerName: "PART / SKU",
      field: "itemCode",
      flex: 1,
      sortable: true,
      id: "part id",
        renderCell: ({ row }) => <span>{row?.itemCode ?? row?.part_code}</span>,
    },
    {
      headerName: "DATE",
      field: "minDate",
      flex: 1,
      sortable: true,
      id: "min date",
       renderCell: ({ row }) => <span>{row?.minDate ?? row?.min_in_date}</span>,
    },

    {
      headerName: "ACTIONS",
      button: true,
      field: "action",
      type: "actions",
      flex: 1,
      getActions: ({ row }) =>
        (apiUrl == "vbt06" && (row.vbpStatus ?? row.vbp_status)== "PENDING") ||
        (apiUrl === "vbt01" && (row.vbpStatus ?? row.vbp_status)== "PENDING")
          ? [
              <>
                <GridActionsCellItem
                  icon={
                    <FaInfoCircle
                      style={{ color: "#003E7E" }}
                      onClick={() => disableVbt(row)}
                    />
                  }
                />
                <GridActionsCellItem
                  icon={<AiFillEdit />}
                  onClick={() => setEditingVBT([row])}
                  label="Edit"
                />
              </>,
            ]
          : [
              <>
                <GridActionsCellItem
                  icon={
                    <RiProhibitedLine
                      style={{ color: "red" }}
                      onClick={() => showToast(row.remark, "error")}
                    />
                  }
                />
                {/* <GridActionsCellItem
                  icon={<AiFillEdit />}
                  onClick={() => setEditingVBT([row.min_transaction])}
                  label="Edit"
                /> */}
              </>,
            ],
    },
  ];
  const vbtTableColumnselse = [
    {
      headerName: "Sr. No.",
      renderCell: ({ row }) => <span>{vbtData?.indexOf(row) + 1}</span>,
      sortable: true,
      flex: 1,
      id: "serial-no",
      width: "120px",
    },
     ...(showTypeColumn
      ? [
          {
            headerName: "Type",
            field: "type",
            sortable: true,
            flex: 1,
            id: "type",
          },
        ]
      : []),
    {
      headerName: "Vendor Code",
      field: "venCode",
      sortable: true,
      flex: 1,
      id: "vendor code",
         renderCell: ({ row }) => <span>{row?.venCode ?? row?.ven_code}</span>,
    },
    {
      headerName: "Transaction",
      field: "transaction",
      sortable: true,
      flex: 1,
      id: "min id",
        renderCell: ({ row }) => <span>{row?.min_transaction ?? row?.transaction}</span>,
    },
    {
      headerName: "PART / SKU",
      field: "part_code",
      flex: 1,
      sortable: true,
      id: "part id",
            renderCell: ({ row }) => <span>{row?.itemCode ?? row?.part_code}</span>,
    },
    {
      headerName: "DATE",
      field: "min_in_date",
      flex: 1,
      sortable: true,
      id: "min date",
           renderCell: ({ row }) => <span>{row?.minDate ?? row?.min_in_date}</span>,
    },

    {
      headerName: "ACTIONS",
      button: true,
      field: "action",
      type: "actions",
      flex: 1,
      getActions: ({ row }) => [
        <GridActionsCellItem
        key="edit"
          icon={<AiFillEdit />}
          onClick={() => setEditingVBT([row])}
          label="Edit"
        />,
      ],
    },
  ];
  const getVendors = async (search) => {
    console.log("this is the search", search);
    const response = await executeFun(() => getVendorOptions(search), "select");
    let arr = [];
    if (response.success) {
      arr = convertSelectOptions(response.data);
    }
    setAsyncOptions(arr);
  };

  const getMultipleVBTDetail = async () => {
    let mins = selectedRows.map((row) => vbtData.filter((r) => r.id == row)[0]);
    setEditingVBT(mins?.map((row) => row));
  };
  const getRows = async () => {
    setPreviewdisData(false);
    let d;
    if (wise === "date_wise") {
      if (searchDateRange) {
        d = searchDateRange;
      } else {
        showToast("Please select a time period", "error");
      }
    } else if (wise === "vendor_wise") {
      if (searchInput) {
        d = searchInput;
      } else {
        showToast("Please select a Vendor", "error");
      }
    } else if (wise === "min_wise") {
      if (searchInput) {
        d = searchInput?.trim();
      } else {
        showToast("Please Enter a MIN Number", "error");
      }
    }
    setSearchLoading(true);
    let response;
    if (apiUrl === "vbt06") {
      response = await imsAxios.post(`/tally/${apiUrl}/fetch_vbtjw`, {
        wise: wise,
        data: d,
      });
    } else {
      response = await imsAxios.post(`/tally/${apiUrl}/fetch_${apiUrl}`, {
        wise: wise,
        data: d,
      });
    }

    const { data } = response;
    if (response.success) {
      const arr = data.map((row) => {
        return {
          ...row,
          id: v4(),
        };
      });
      //for disable purpose
      const alldata = data?.disable?.map((row) => {
        return {
          ...row,
          id: v4(),
        };
      });
      setVBTData(arr);
      if (alldata) {
        setCombinedDate(alldata);
        setExtracted(arr);
        // setVBTData(combinedData);
      }
    } else {
      showToast(response.message?.msg || response.message, "error");
      setVBTData([]);
    }
    setSearchLoading(false);
    // console.log(data);
  };
  // const submitHandler = () => {
  //   setEditingVBT(null);
  // };
  const wiseOptions = [
    { value: "date_wise", text: "Date Wise" },
    { value: "min_wise", text: "MIN Wise" },
    { value: "vendor_wise", text: "Vendor Wise" },
  ];

  const disableVbt = async (singleRow) => {
    if (singleRow) {
      ModalForm.setFieldValue("min_transaction", singleRow.transaction ?? singleRow.min_transaction);
      ModalForm.setFieldValue("part_code", singleRow.itemCode ?? singleRow.part_code);
    }

    Modal.confirm({
      title: "Are you sure you want to disbale this VBT?",
      icon: <ExclamationCircleOutlined />,
      content: (
        <Form form={ModalForm} layout="vertical">
          <Form.Item
            name="min_transaction"
            label="Transaction"
            rules={[
              {
                required: true,
                message: "Please Enter Transaction Number!",
              },
            ]}
          >
            <Input disabled />
          </Form.Item>
          <Form.Item
            name="part_code"
            label="Part / SKU"
            // rules={rules.nos_of_boxes}
            rules={[
              {
                required: true,
                message: "Please Enter Part Code!",
              },
            ]}
          >
            <Input disabled />
          </Form.Item>

          <Form.Item
            name="remark"
            label="Remark"
            rules={[
              {
                required: true,
                message: "Please Enter Remark!",
              },
            ]}
          >
            <Input.TextArea rows={3} placeholder="Please input the remark" />
          </Form.Item>
        </Form>
      ),
      okText: "Yes",
      cancelText: "No",
      onOk: async () => {
        await disabletheSelelcted();
      },
    });
  };
  const disabletheSelelcted = async () => {
    const values = await ModalForm.validateFields();
    const response = await imsAxios.put("/tally/vbt/disable_vbtprocess", {
      min_transaction: values.min_transaction,
      part_code: values.part_code,
      remark: values.remark,
    });
    if (response.success) {
      showToast(response.data.status, "success");
      getRows();
    } else {
      showToast(response.data.message, "error");
    }
  };
  // ----------------------------
  useEffect(() => {
    if (wise == "min_wise") {
      setSearchInput("");
    } else {
      setSearchInput(null);
    }

    setVBTData([]);
    setPreviewdisData(false);
  }, [wise]);

  useEffect(() => {
    if (previewdisData) {
      setVBTData(combinedData);
    } else {
      setVBTData(extracted);
    }
  }, [previewdisData]);

  return (
    <div style={{ height: "100%", padding: 10 }}>
      <MapVBTModal mapVBT={mapVBT} setMapVBT={setMapVBT} />
      <div
        style={{
          position: "relative",
          height: "100%",
          overflow: "hidden",
        }}
      >
        {/* search header
        <CreateVBT1
          setVBTData={setVBTData}
          editingVBT={editingVBT}
          setEditingVBT={setEditingVBT}
        /> */}
        {apiUrl === "vbt03" ? (
          <VBT01Report
            setVBTData={setVBTData}
            editingVBT={editingVBT}
            setEditingVBT={setEditingVBT}
            setApiUrl={setApiUrl}
            apiUrl={apiUrl}
          />
        ) : (
          <VBT01Report
            setVBTData={setVBTData}
            editingVBT={editingVBT}
            setEditingVBT={setEditingVBT}
            setApiUrl={setApiUrl}
            apiUrl={apiUrl}
          />
        )}
        <Row justify="space-between">
          <div className="left">
            <Space>
              <div style={{ width: 250 }}>
                <MySelect
                  options={wiseOptions}
                  value={wise}
                  onChange={setWise}
                />
              </div>
              <div style={{ width: 300 }}>
                {wise === "date_wise" ? (
                  <MyDatePicker
                    size="default"
                    setDateRange={setSearchDateRange}
                    dateRange={searchDateRange}
                    value={searchDateRange}
                  />
                ) : wise === "min_wise" ? (
                  <Input
                    type="text"
                    size="default"
                    // className="form-control w-100 "
                    placeholder="Enter MIN Number"
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                  />
                ) : (
                  wise === "vendor_wise" && (
                    <MyAsyncSelect
                      size="default"
                      selectLoading={loading1("select")}
                      onBlur={() => setAsyncOptions([])}
                      value={searchInput}
                      onChange={(value) => setSearchInput(value)}
                      loadOptions={getVendors}
                      optionsState={asyncOptions}
                      defaultOptions
                      placeholder="Select Vendor..."
                    />
                  )
                )}
              </div>
              <MyButton
                size="default"
                disabled={
                  wise === "date_wise"
                    ? searchDateRange === ""
                      ? true
                      : false
                    : !searchInput
                      ? true
                      : false
                }
                loading={searchLoading}
                type="primary"
                onClick={getRows}
                variant="search"
              >
                Search
              </MyButton>
              {wise == "vendor_wise" && (
                <Button
                  onClick={getMultipleVBTDetail}
                  disabled={selectedRows.length < 2}
                  // loading={loading}
                  type="primary"
                >
                  Create VBT
                </Button>
              )}
              {/* {confirmModal && (
                <ConfirmModal
                  open={open}
                  setOpen={setOpen}
                  // submitHandler={submitHandler}
                  loading={loading}
                  setCreateVBT={setCreateVBT}
                  createVBT={createVBT}
                  setEditingVBT={setEditingVBT}
                  editingVBT={editingVBT}
                />
              )} */}
            </Space>
          </div>
          <Space>
            {(apiUrl == "vbt06" || apiUrl == "vbt01") && (
              <Checkbox
                // onClick={() => setPreviewdisData(!previewdisData)}
                disabled={vbtData.length == 0}
                checked={previewdisData}
                onChange={(e) => setPreviewdisData(e.target.checked)}
              >
                Preview disabled data
              </Checkbox>
            )}
            <Button
              onClick={() => {
                setMapVBT(apiUrl);
              }}
              size="default"
              type="primary"
            >
              Map VBT
            </Button>
          </Space>
        </Row>
        <div style={{ height: "calc(100% - 50px)", marginTop: 10 }}>
          <MyDataTable
            checkboxSelection={wise == "vendor_wise"}
            loading={searchLoading}
            columns={
              apiUrl == "vbt06" || apiUrl == "vbt01"
                ? vbtTableColumnsonesix
                : vbtTableColumnselse
            }
            data={vbtData}
            onSelectionModelChange={(newSelectionModel) => {
              setSelectedRows(newSelectionModel);
            }}
          />
        </div>
      </div>
    </div>
  );
};
export default VBTMainTable;
