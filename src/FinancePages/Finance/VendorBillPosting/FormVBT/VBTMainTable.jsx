import { useCallback, useEffect, useMemo, useState } from "react";
import MyDatePicker from "../../../../Components/MyDatePicker";
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
import useApi from "../../../../hooks/useApi.ts";
import { convertSelectOptions } from "../../../../utils/general.ts";
import { getVendorOptions } from "../../../../api/general.ts";
import MyButton from "../../../../Components/MyButton";
import { FaInfoCircle } from "react-icons/fa";
import { ExclamationCircleOutlined } from "@ant-design/icons";
import { RiProhibitedLine } from "react-icons/ri";
import Field from "../../../../Components/Field.jsx";

const VBT_ROUTE_TO_API_URL = {
  "vb-1": "vbt01",
  "vb-2": "vbt02",
  "vb-3": "vbt03",
  "vb-4": "vbt04",
  "vb-5": "vbt05",
  "vb-6": "vbt06",
  "vb-7": "vbt07",
};

const wiseOptions = [
  { value: "date_wise", text: "Date Wise" },
  { value: "min_wise", text: "MIN Wise" },
  { value: "vendor_wise", text: "Vendor Wise" },
];

const hasDisableWorkflow = (apiUrl) => apiUrl === "vbt01" || apiUrl === "vbt06";

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
  const [apiUrl, setApiUrl] = useState("");
  const [ModalForm] = Form.useForm();
  const [extracted, setExtracted] = useState([]);
  const [combinedData, setCombinedDate] = useState([]);
  const [isValid, setIsValid] = useState(false);
  const [showDisableModal, setShowDisableModal] = useState(false);
  const [isValidDisable, setIsValidDisable] = useState(false);
  const [disableModalLoading, setDisableModalLoading] = useState(false);

  useEffect(() => {
    if (editVbtDrawer) {
      setEditingVBT(editVbtDrawer);
    }
  }, [editVbtDrawer]);

  useEffect(() => {
    const routeSegment = window.location.href.split("/").at(-1);
    setApiUrl(VBT_ROUTE_TO_API_URL[routeSegment] ?? "");
  }, []);

  const showTypeColumn = useMemo(
    () => vbtData?.some((r) => r?.type != null && String(r.type).trim() !== ""),
    [vbtData],
  );

  const getRows = useCallback(async () => {
    const isEmpty =
      wise === "date_wise" ? !searchDateRange : !searchInput;
    if (isEmpty) {
      setIsValid(true);
      return;
    }
    setIsValid(false);
    setPreviewdisData(false);
    let d;
    if (wise === "date_wise") {
      d = searchDateRange;
    } else if (wise === "vendor_wise") {
      d = searchInput?.value ?? searchInput;
    } else if (wise === "min_wise") {
      d = searchInput?.trim();
    }
    setSearchLoading(true);
    const fetchPath =
      apiUrl === "vbt06"
        ? `/tally/${apiUrl}/fetch_vbtjw`
        : `/tally/${apiUrl}/fetch_${apiUrl}`;
    const response = await imsAxios.post(fetchPath, { wise, data: d });

    const { data } = response;
    if (response.success) {
      const arr = data.map((row) => ({ ...row, id: v4() }));
      const allData = data?.disable?.map((row) => ({ ...row, id: v4() }));
      setVBTData(arr);
      if (allData) {
        setCombinedDate(allData);
        setExtracted(arr);
      }
    } else {
      showToast(response.message?.msg || response.message, "error");
      setVBTData([]);
    }
    setSearchLoading(false);
  }, [wise, searchDateRange, searchInput, apiUrl, showToast]);

  const disableVbt = useCallback(
    (singleRow) => {
      if (singleRow) {
        ModalForm.setFieldValue(
          "min_transaction",
          singleRow.transaction ?? singleRow.min_transaction,
        );
        ModalForm.setFieldValue(
          "part_code",
          singleRow.itemCode ?? singleRow.part_code,
        );
      }
      setIsValidDisable(false);
      setShowDisableModal(true);
    },
    [ModalForm],
  );

  const handleDisableCancel = useCallback(() => {
    setShowDisableModal(false);
    setIsValidDisable(false);
  }, []);

  const handleDisableConfirm = useCallback(async () => {
    let values;
    try {
      values = await ModalForm.validateFields();
    } catch (error) {
      setIsValidDisable(true);
      return;
    }
    setIsValidDisable(false);
    setDisableModalLoading(true);
    const response = await imsAxios.put("/tally/vbt/disable_vbtprocess", {
      min_transaction: values.min_transaction,
      part_code: values.part_code,
      remark: values.remark,
    });
    setDisableModalLoading(false);
    if (response.success) {
      showToast(response.data.status, "success");
      setShowDisableModal(false);
      getRows();
    } else {
      showToast(response.data.message, "error");
    }
  }, [ModalForm, showToast, getRows]);

  const vbtTableColumns = useMemo(
    () => [
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
        id: "vendor-code",
        renderCell: ({ row }) => <span>{row?.venCode ?? row?.ven_code}</span>,
      },
      {
        headerName: "Transaction",
        field: "transaction",
        sortable: true,
        flex: 1,
        id: "min-id",
        renderCell: ({ row }) => (
          <span>{row?.min_transaction ?? row?.transaction}</span>
        ),
      },
      {
        headerName: "PART / SKU",
        field: "itemCode",
        flex: 1,
        sortable: true,
        id: "part-id",
        renderCell: ({ row }) => <span>{row?.itemCode ?? row?.part_code}</span>,
      },
      {
        headerName: "DATE",
        field: "minDate",
        flex: 1,
        sortable: true,
        id: "min-date",
        renderCell: ({ row }) => (
          <span>{row?.minDate ?? row?.min_in_date}</span>
        ),
      },
      {
        headerName: "ACTIONS",
        button: true,
        field: "action",
        type: "actions",
        flex: 1,
        getActions: ({ row }) => {
          if (!hasDisableWorkflow(apiUrl)) {
            return [
              <GridActionsCellItem
                key="edit"
                icon={<AiFillEdit />}
                onClick={() => setEditingVBT([row])}
                label="Edit"
              />,
            ];
          }

          const status = row.vbpStatus ?? row.vbp_status;
          if (status === "PENDING") {
            return [
              <GridActionsCellItem
                key="info"
                icon={
                  <FaInfoCircle
                    style={{ color: "#003E7E" }}
                    onClick={() => disableVbt(row)}
                  />
                }
              />,
              <GridActionsCellItem
                key="edit"
                icon={<AiFillEdit />}
                onClick={() => setEditingVBT([row])}
                label="Edit"
              />,
            ];
          }

          return [
            <GridActionsCellItem
              key="disabled"
              icon={
                <RiProhibitedLine
                  style={{ color: "red" }}
                  onClick={() => showToast(row.remark, "error")}
                />
              }
            />,
          ];
        },
      },
    ],
    [vbtData, showTypeColumn, apiUrl, disableVbt, showToast],
  );

  const getVendors = useCallback(
    async (search) => {
      const response = await executeFun(
        () => getVendorOptions(search),
        "select",
      );
      setAsyncOptions(
        response.success ? convertSelectOptions(response.data) : [],
      );
    },
    [executeFun],
  );

  const getMultipleVBTDetail = useCallback(() => {
    const mins = selectedRows.map(
      (row) => vbtData.filter((r) => r.id == row)[0],
    );
    setEditingVBT(mins);
  }, [selectedRows, vbtData]);

  useEffect(() => {
    setSearchInput(wise === "min_wise" ? "" : null);
    setVBTData([]);
    setPreviewdisData(false);
    setIsValid(false);
  }, [wise]);

  useEffect(() => {
    setVBTData(previewdisData ? combinedData : extracted);
  }, [previewdisData]);

  return (
    <div style={{ height: "100%", padding: 10 }}>
      <MapVBTModal mapVBT={mapVBT} setMapVBT={setMapVBT} />
      <Modal
        title={
          <span>
            <ExclamationCircleOutlined style={{ marginRight: 8 }} />
            Are you sure you want to disable this VBT?
          </span>
        }
        open={showDisableModal}
        onOk={handleDisableConfirm}
        onCancel={handleDisableCancel}
        okText="Yes"
        cancelText="No"
        confirmLoading={disableModalLoading}
      >
        <Form form={ModalForm} layout="vertical">
          <Form.Item
            name="min_transaction"
            label="Transaction"
            rules={[{ required: true, message: "" }]}
          >
            <Field
              attr="required | Please Enter Transaction Number!"
              showValidation={isValidDisable}
            >
              <Input disabled />
            </Field>
          </Form.Item>
          <Form.Item
            name="part_code"
            label="Part / SKU"
            rules={[{ required: true, message: "" }]}
          >
            <Field
              attr="required | Please Enter Part Code!"
              showValidation={isValidDisable}
            >
              <Input disabled />
            </Field>
          </Form.Item>

          <Form.Item
            name="remark"
            label="Remark"
            rules={[{ required: true, message: "" }]}
          >
            <Field
              attr="required | Please Enter Remark!"
              showValidation={isValidDisable}
            >
              <Input.TextArea rows={3} placeholder="Please input the remark" />
            </Field>
          </Form.Item>
        </Form>
      </Modal>
      <div
        style={{
          position: "relative",
          height: "100%",
          overflow: "hidden",
        }}
      >
        <VBT01Report
          setVBTData={setVBTData}
          editingVBT={editingVBT}
          setEditingVBT={setEditingVBT}
          setApiUrl={setApiUrl}
          apiUrl={apiUrl}
        />
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
                    showError={isValid}
                    message="Please select a time period"
                  />
                ) : wise === "min_wise" ? (
                  <Field
                    attr="required | Please Enter a MIN Number"
                    value={searchInput}
                    showValidation={isValid}
                    onChange={(e) => setSearchInput(e.target.value)}
                  >
                    <Input type="text" size="default" placeholder="Enter MIN Number" />
                  </Field>
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
                      labelInValue
                      showError={isValid}
                      message="Please select a Vendor"
                    />
                  )
                )}
              </div>
              <MyButton
                size="default"
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
                  type="primary"
                >
                  Create VBT
                </Button>
              )}
            </Space>
          </div>
          <Space>
            {hasDisableWorkflow(apiUrl) && (
              <Checkbox
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
            columns={vbtTableColumns}
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
