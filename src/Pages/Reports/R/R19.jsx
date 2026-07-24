import { useState, useEffect } from "react";
import { Button, Col, Row, Select } from "antd";
import MyAsyncSelect from "../../../Components/MyAsyncSelect";
import { useToast } from "../../../hooks/useToast.js";
import MyDataTable from "../../../Components/MyDataTable";
import { v4 } from "uuid";
import { ArrowRightOutlined } from "@ant-design/icons";
import ModalR19 from "../Modal/ModalR19";
import { imsAxios } from "../../../axiosInterceptor";
import { getProductsOptions } from "../../../api/general.ts";
import useApi from "../../../hooks/useApi.ts";
import MyButton from "../../../Components/MyButton";
import Field from "../../../Components/Field.jsx";

function R19() {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  const [mainData, setMainData] = useState([]);
  const [bomName, setBomName] = useState([]);
  const [asyncOptions, setAsyncOptions] = useState([]);
  const [allData, setAllData] = useState({
    selectProduct: "",
    selectBom: "",
  });
  const [isValid, setIsValid] = useState(false);

  const { executeFun } = useApi();
  const getDataBySearch = async (searchInput) => {
    if (searchInput?.length > 2) {
      const response = await executeFun(
        () => getProductsOptions(searchInput, true),
        "select",
      );

      setAsyncOptions(response.data);
    }
  };

  const getBom = async () => {
    const response = await imsAxios.post("/backend/fetchBomForProduct", {
      search: allData?.selectProduct?.key,
    });
    //  console.log(data);
    const arr = response.data.map((d) => {
      return { value: d.bomid, label: d.bomname };
    });
    setBomName(arr);

    //  setBranch(arr);
  };

  const fetchData = async () => {
    if (allData?.selectProduct == "") {
      setIsValid(true);
      return;
    } else {
      setLoading(true);
      setMainData([]);
      const response = await imsAxios.post("/report19", {
        sku: allData?.selectProduct?.key,
        bom: allData?.selectBom,
      });

      if (response.success) {
        let arr = response.data.map((row, i) => {
          return { ...row, id: v4(), i: i + 1 };
        });
        setMainData(arr);
        setLoading(false);
      } else {
        showToast(response.message?.msg || response.message, "error");
        setLoading(false);
      }
    }
    //  console.log(data);
  };

  const columns = [
    { field: "i", headerName: "S.No.", width: 80 },
    { field: "vendor_code", headerName: "Code", width: 100 },
    { field: "vendor_name", headerName: "Vendor", width: 300 },
    { field: "part_code", headerName: "Part", width: 100 },
    { field: "part_name", headerName: "Component", width: 250 },
    { field: "order_qty", headerName: "Po Qty", width: 100 },
    { field: "inward_qty", headerName: "Inward Qty", width: 120 },
    { field: "pending_qty", headerName: "Pending Qty", width: 150 },
    { field: "closing_qty", headerName: "Closing Qty", width: 150 },
    { field: "estmt_qty", headerName: "No. of SB", width: 100 },
    { field: "del_per", headerName: "Delivery %", width: 100 },
  ];

  useEffect(() => {
    if (allData.selectProduct) {
      getBom();
    }
  }, [allData.selectProduct]);

  //   useEffect(() => {
  //     console.log(allData);
  //   }, [allData]);

  return (
    <div style={{ height: "97%" }}>
      <Row gutter={10} style={{ margin: "5px" }}>
        <Col span={5}>
          <MyAsyncSelect
            style={{ width: "100%" }}
            onBlur={() => setAsyncOptions([])}
            optionsState={asyncOptions}
            placeholder="Select Product"
            loadOptions={getDataBySearch}
            value={allData.selectProduct}
            onChange={(e) =>
              setAllData((allData) => {
                return { ...allData, selectProduct: e };
              })
            }
            labelInValue
            message={"Please select product"}
            showError={isValid}
          />
        </Col>

        <Col span={5}>
          <Field
            attr="required | Please enter Qty"
            value={allData.selectBom}
            showValidation={isValid}
            style={{ minWidth: 240, flex: 1 }}
          >
            <Select
              style={{ width: "100%" }}
              placeholder="Select Bom"
              options={bomName}
              value={allData?.selectBom}
              onChange={(e) =>
                setAllData((allData) => {
                  return { ...allData, selectBom: e };
                })
              }
            />
          </Field>
        </Col>

        <Col span={1}>
          <MyButton variant="search" type="primary" onClick={fetchData}>
            Fetch
          </MyButton>
        </Col>

        {/* {mainData?.length > 0 && ( */}
        <Col span={1} offset={12}>
          <Button
            onClick={() => setModalOpen(true)}
            disabled={mainData?.length > 0 ? false : true}
          >
            <ArrowRightOutlined />
            {/* <CaretRightOutlined /> */}
          </Button>
        </Col>
        {/* )} */}
      </Row>

      <div className="hide-select" style={{ height: "90%", margin: "10px" }}>
        <MyDataTable
          checkboxSelection={true}
          loading={loading}
          data={mainData}
          columns={columns}
        />
      </div>

      <ModalR19
        modalOpen={modalOpen}
        setModalOpen={setModalOpen}
        allData={allData}
        fetchData={fetchData}
      />
    </div>
  );
}

export default R19;
