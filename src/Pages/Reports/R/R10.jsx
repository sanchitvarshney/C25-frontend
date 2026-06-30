import React, { useState, useEffect } from "react";
import InternalNav from "../../..//Components/InternalNav";
import axios from "axios";
import { useSelector } from "react-redux";
import { Button, Col, Form, Modal, Row, Space } from "antd";
import MyAsyncSelect from "../../../Components/MyAsyncSelect";
import MySelect from "../../../Components/MySelect";
import validateResponse from "../../../Components/validateResponse";
import MyDataTable from "../../../Components/MyDataTable";
import ToolTipEllipses from "../../../Components/ToolTipEllipses";
import { CommonIcons } from "../../../Components/TableActions.jsx/TableActions";
import { downloadCSV } from "../../../Components/exportToCSV";
import Loading from "../../../Components/Loading";
import { imsAxios } from "../../../axiosInterceptor";
import { getComponentOptions } from "../../../api/general.ts";
import useApi from "../../../hooks/useApi.ts";
const R10 = () => {
  const { user } = useSelector((state) => state.login);
  const [showUpdatModal, setShowUpdateModal] = useState(false);
  const [asyncOptions, setAsyncOptions] = useState([]);
  const [locationOptions, setLocationOptions] = useState([]);
  const [selectedUser, setSelectedUser] = useState({
    value: user?.id,
    label: user?.userName,
  });
  const [selectLoading, setSelectLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(false);
  const [tableLoading, setTableLoading] = useState(false);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [updateData, setUpdateData] = useState({
    components: [],
    locations: [],
  });
  const [columns, setColumns] = useState([]);
  const [rows, setrows] = useState([]);
  const { executeFun, loading: loading1 } = useApi();
  const getDataOnLoad = async () => {
    setPageLoading(true);
    setTableLoading(true);
    // table data fetch
    const response = await imsAxios.post("/report10", {
      user_id: selectedUser.value,
    });
    setTableLoading(false);
    // getting selected value
    const res = await imsAxios.post("/report10/getSelectedValue", {
      user_id: selectedUser.value,
    });
    setPageLoading(false);
    let arr = [];
    if (!response.success || !response.data) {
      setColumns([]);
      setrows([]);
      setUpdateData({
        components: [],
        locations: [],
      });
      return;
    }

    const data = response.data;

    // Process the data array from response
    if (data.data && Array.isArray(data.data)) {
      data.data.forEach((element) => {
        let obj;
        let locationData = {};
        // Each element is an object with part name as key and location data as value
        for (let partName in element) {
          locationData = element[partName];
          obj = {
            name: partName,
            ...locationData,
          };
        }
        if (obj) {
          arr.push(obj);
        }
      });
    }

    // Calculate totals for each row
    arr = arr.map((row) => {
      let values = [];
      for (let prop in row) {
        if (
          prop !== "name" &&
          prop !== "parts_codes" &&
          prop !== "new_partnos" &&
          typeof row[prop] === "number"
        ) {
          values.push(row[prop]);
        }
      }

      return {
        ...row,
        total: values.reduce((partialSum, a) => {
          return partialSum + a;
        }, 0),
      };
    });

    // Create columns from head array
    let cols = [];
    if (data.head && Array.isArray(data.head)) {
      cols = data.head.map((row) => ({
        headerName: row,
        field: row,
        width: 100,
      }));
    }

    cols = [
      {
        headerName: "Sr. No.",
        field: "id",
        width: 80,
      },
      {
        headerName: "Component",
        field: "name",
        renderCell: ({ row }) => <ToolTipEllipses text={row.name} />,
        width: 300,
      },
      {
        headerName: "Part Code",
        field: "parts_codes",
        renderCell: ({ row }) => <ToolTipEllipses text={row.parts_codes} />,
        width: 150,
      },
      {
        headerName: "Cat Part Code",
        field: "new_partnos",
        renderCell: ({ row }) => <ToolTipEllipses text={row.new_partnos} />,
        width: 150,
      },
      ...cols,
      {
        headerName: "Total",
        field: "total",
        width: 100,
      },
    ];

    // Map parts_codes and new_partnos to rows
    arr = arr.map((row, index) => ({
      ...row,
      id: index + 1,
      parts_codes:
        data.parts_codes && data.parts_codes[index]
          ? data.parts_codes[index]
          : "",
      new_partnos:
        data.new_partnos && data.new_partnos[index]
          ? data.new_partnos[index]
          : "",
    }));

    setColumns(cols);
    setrows(arr);

    // selected data
    if (res.success) {
      let i;
      let partsArr = [];
      let locationArr = [];
      partsArr = res.data.part_options.map((row) => ({
        label: row.text,
        value: row.id,
      }));
      locationArr = res.data.loc_options.map((row) => ({
        label: row.text,
        value: row.id,
      }));
      let obj = { components: partsArr, locations: locationArr };
      setUpdateData(obj);
    } else {
      setUpdateData({
        components: [],
        locations: [],
      });
    }
  };
  const getComponents = async (search) => {
    // setSelectLoading(true);
    // const response = await imsAxios.post("/backend/getComponentByNameAndNo", {
    //   search: search,
    // });
    // setSelectLoading(false);
    const response = await executeFun(
      () => getComponentOptions(search),
      "select"
    );
    const { data } = response;
    let arr = data.map((row) => ({
      value: row.id,
      text: row.text,
    }));
    setAsyncOptions(arr);
  };
  const getLocation = async () => {
    setPageLoading(true);
    const response = await imsAxios.post("/backend/fetchLocation");
    let arr = response.data.map((row) => ({ value: row.id, text: row.text }));
    setLocationOptions(arr);
    setPageLoading(false);
  };
  const searchLocation = async (search) => {
    const response = await imsAxios.post("/backend/fetchLocation", {
      searchTerm: search,
    });
    let arr = response?.data.map((row) => ({ text: row.text, value: row.id }));
    setAsyncOptions(arr);
  };
  const getUsers = async (search) => {
    setSelectLoading(true);
    const response = await imsAxios.post("/backend/fetchAllUser", {
      search: search,
    });
    setSelectLoading(false);
    let arr = response.data.map((row) => ({ text: row.text, value: row.id }));
    setAsyncOptions(arr);
  };
  const updateDataTable = async (userId) => {
    // true;
  
    if (updateData.locations.length > 0) {
      const response = await imsAxios.post("report10/update", {
        component_part: updateData.components.map((row) =>
          row && row?.value ? row?.value : row
        ),
        location: updateData.locations.map((row) =>
          row && row?.value ? row?.value : row
        ),
        user_id: selectedUser.value,
      });
      setUpdateLoading(false);

      if (response.success) {
        getDataOnLoad();
      }
    }
    setShowUpdateModal(false);
  };
  const getSelectedValue = async () => {
    setModalLoading(true);
    const res = await imsAxios.post("/report10/getSelectedValue", {
      user_id: selectedUser.value,
    });
    setModalLoading(false);
    if (res.success) {
      let i;
      let partsArr = [];
      let locationArr = [];
      partsArr = res.data.part_options.map((row) => ({
        label: row.text,
        value: row.id,
      }));
      locationArr = res.data.loc_options.map((row) => ({
        label: row.text,
        value: row.id,
      }));
      let obj = { components: partsArr, locations: locationArr };
      setUpdateData(obj);
    } else {
      setUpdateData({
        components: [],
        locations: [],
      });
    }
  };
  useEffect(() => {
    getDataOnLoad();
    getLocation();
  }, []);
  useEffect(() => {
    // getDataOnLoad();
    updateDataTable(selectedUser);
    getSelectedValue();
  }, [selectedUser]);
  useEffect(() => {
    console.log(updateData);
  }, [updateData]);
  const additional = () => (
    <Space style={{ width: 120 }}>
      <Button onClick={() => setShowUpdateModal(true)} type="primary">
        Update
      </Button>
      <CommonIcons
        onClick={() => downloadCSV(rows, columns, "Location Wise Report")}
        action="downloadButton"
      />
    </Space>
  );
  return (
    <div style={{ height: "100%" }}>
      <Row
        justify="space-between"
        style={{ padding: "0px 10px", paddingBottom: 5 }}
      >
        <Space style={{ width: 120 }}>
          <Button onClick={() => setShowUpdateModal(true)} type="primary">
            Update
          </Button>
          <CommonIcons
            onClick={() => downloadCSV(rows, columns, "Location Wise Report")}
            action="downloadButton"
          />
        </Space>
      </Row>
      {/* update data modal */}
      <Modal
        width={800}
        title="Location Wise Report"
        open={showUpdatModal}
        footer={[
          <Row justify="space-between">
            <Col span={4}>
              <MyAsyncSelect
                optionsState={asyncOptions}
                onBlur={() => setAsyncOptions([])}
                value={selectedUser}
                labelInValue
                selectLoading={selectLoading}
                loadOptions={getUsers}
                onChange={(value) => setSelectedUser(value)}
              />
            </Col>
            <Col>
              <Button
                loading={updateLoading}
                type="primary"
                onClick={updateDataTable}
              >
                Update
              </Button>
            </Col>
          </Row>,
        ]}
        // confirmLoading={confirmLoading}
        onCancel={() => setShowUpdateModal(false)}
      >
        {modalLoading && <Loading />}
        <Form>
          <Row>
            {/* components select */}
            <Col span={24}>
              <Form.Item label="Select Components">
                <MyAsyncSelect
                  optionsState={asyncOptions}
                  onBlur={() => setAsyncOptions([])}
                  mode="multiple"
                  value={updateData.components}
                  // defaultValue={}
                  // labelInValue
                  selectLoading={loading1("select")}
                  loadOptions={getComponents}
                  onChange={(value) =>
                    setUpdateData((data) => ({
                      ...data,
                      // components: value.map((row) => row.value),
                      components: value,
                    }))
                  }
                />
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item label="Select Location">
                <MyAsyncSelect
                  optionsState={asyncOptions}
                  labelInValue
                  onBlur={() => setAsyncOptions([])}
                  onChange={(value) =>
                  {
                   
                    setUpdateData((data) => ({
                      ...data,
                      locations: value?.[0]?.value,
                    }))
                  }
                  }
                  value={updateData.locations}
                  // defaultValue={[]}
                  loadOptions={searchLocation}
                  mode="multiple"
                  options={locationOptions}
                />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
      <div
        className="hide-select"
        style={{ height: "90%", padding: "0px 10px" }}
      >
        <MyDataTable
          checkboxSelection={true}
          loading={tableLoading}
          columns={columns}
          rows={rows}
        />
      </div>
    </div>
  );
};

export default R10;
