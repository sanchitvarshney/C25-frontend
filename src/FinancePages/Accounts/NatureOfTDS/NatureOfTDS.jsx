import { useState, useEffect } from "react";
import { AiFillEdit } from "react-icons/ai";
import EditTDSMoal from "./EditTDSMoal";
import MyDataTable from "../../../Components/MyDataTable";
import MyAsyncSelect from "../../../Components/MyAsyncSelect";
import {
  Button,
  Card,
  Col,
  Form,
  Input,
  Row,
  Space,
} from "antd";
import { v4 } from "uuid";
import { GridActionsCellItem } from "@mui/x-data-grid";
import ToolTipEllipses from "../../../Components/ToolTipEllipses";
import { CommonIcons } from "../../../Components/TableActions.jsx/TableActions";
import { downloadCSV } from "../../../Components/exportToCSV";
import { imsAxios } from "../../../axiosInterceptor";
import { useToast } from "../../../hooks/useToast";

export default function NatureOfTDS() {
 const { showToast } = useToast();
  const [editingTDS, setEditingTDS] = useState(null);
  const [loading, setLoading] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [selectLoading, setSelectLoading] = useState(false);
  const [TDSList, setTDSList] = useState([]);
  const [newTDS, setNewTDS] = useState({
    code: "",
    name: "",
    description: "",
    percentage: "",
    ledger: "",
  });
  const [asyncOptions, setAsyncOptions] = useState([]);
  const columns = [
    {
      headerName: "Action",

      type: "actions",
      field: "action",
      width: 65,
      getActions: ({ row }) => [
        <GridActionsCellItem
        key={row.id ?? "edit"}
          icon={<AiFillEdit />}
          onClick={() => setEditingTDS(row)}
          label="Edit"
        />,
      ],
    },

    {
      headerName: "Code",
      field: "tds_code",
      renderCell: ({ row }) => (
        <ToolTipEllipses text={row.tds_code} copy={true} />
      ),
      width: 170,
    },
    {
      headerName: "Name",
      field: "name",
      renderCell: ({ row }) => <ToolTipEllipses text={row.name} />,
      flex: 1,
    },
    {
      headerName: "Description",
      field: "desc",
      renderCell: ({ row }) => <ToolTipEllipses text={row.desc} />,
      flex: 1,
    },
    {
      headerName: "Percentage",
      field: "percentage",
      width: 90,
    },
    {
      headerName: "G/L Code",
      field: "gl_code",
      renderCell: ({ row }) => <ToolTipEllipses text={row.gl_code} />,
      flex: 1,
    },
  ];
  const getGLCodes = async (searchInput) => {
    setSelectLoading(true);
    const response = await imsAxios.post("/tally/tds/tds_ledger_options", {
      search: searchInput,
    });
    setSelectLoading(false);
    let arr = [];
    if (response.success) {
      arr = response.data.map((d) => {
        return { text: d.text, value: d.id };
      });
      setAsyncOptions(arr);
    } else {
      setAsyncOptions([]);
    }
  };
  const inputHandler = (name, value) => {
    setNewTDS((newTDS) => {
      return {
        ...newTDS,
        [name]: value,
      };
    });
  };
  const createTDS = async () => {
    const { code, name, description, percentage, ledger } = newTDS;
    if (!code || !name || !description || !percentage || !ledger) {
      showToast("Please enter all the fields", "error");
    
    } else {
      setFormLoading(true);
      const response = await imsAxios.post("/tally/tds/add_new_nature_of_tds", {
        ...newTDS,
        ledger: newTDS.ledger,
      });
      setFormLoading(false);
   
      if (response.success) {
        showToast(response.message || response.message?.msg);
       
        reset();
      } else {
        showToast(response.message || response.message?.msg, "error");
    
      }
    }
  };
  const reset = () => {
    setNewTDS({
      code: "",
      name: "",
      description: "",
      percentage: "",
      ledger: "",
    });
  };
  const getTDSList = async () => {
    setLoading(true);
    const response = await imsAxios.get("/tally/tds/nature_of_tds");
    if (response.success) {
      const arr = response.data.map((row) => {
        return {
          ...row,
          id: v4(),
        };
      });
      setTDSList(arr);
    } else {
      showToast(response.message || response.message?.msg, "error");
     
    }

    setLoading(false);
 
  };

  useEffect(() => {
    getTDSList();
    setEditingTDS(null);
  }, []);

  // useEffect(() => {
  //   const res = TDSList.filter((a) => {
  //     return a.tds_code.toLowerCase().match(search.toLowerCase());
  //   });
  //   setFilterData(res);
  // }, [search]);
  return (
    <div style={{ height: "100%", padding:10 }}>
      <EditTDSMoal
        getGLCodes={getGLCodes}
        editingTDS={editingTDS}
        setEditingTDS={setEditingTDS}
        getTDSList={getTDSList}
      />
      <Row gutter={12} style={{ height: "100%" }}>
        <Col span={8}>
          <Card title="Add New TDS" size="small">
            <Form size="small" layout="vertical">
              <Row gutter={10}>
                <Col span={12}>
                  <Form.Item label="TDS Code">
                    <Input
                      size="default"
                      value={newTDS.code}
                      onChange={(e) => inputHandler("code", e.target.value)}
                      placeholder="Enter New TDS Code.."
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item label=" TDS Name">
                    <Input
                      size="default"
                      value={newTDS.name}
                      onChange={(e) => inputHandler("name", e.target.value)}
                      placeholder="Enter New TDS Name.."
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={10}>
                <Col span={12}>
                  <Form.Item label="Description">
                    <Input
                      size="default"
                      value={newTDS.description}
                      onChange={(e) =>
                        inputHandler("description", e.target.value)
                      }
                      placeholder="Enter Description"
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item label="Percentage">
                    <Input
                      size="default"
                      value={newTDS.percentage}
                      onChange={(e) =>
                        inputHandler("percentage", e.target.value)
                      }
                      suffix="%"
                      placeholder="Enter Percentage"
                      type="number"
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={10}>
                <Col span={24}>
                  <Form.Item label=" GL Code">
                    <MyAsyncSelect
                      selectLoading={selectLoading}
                      onBlur={() => setAsyncOptions([])}
                      value={newTDS.ledger}
                      onChange={(value) => {
                        inputHandler("ledger", value);
                      }}
                      loadOptions={getGLCodes}
                      optionsState={asyncOptions}
                      defaultOptions
                      placeholder="Select G/L..."
                    />
                  </Form.Item>
                </Col>
              </Row>
              <Row justify="end">
                <Col>
                  <Space
                    align="center"
                    style={{ height: "100%", paddingTop: 7 }}
                  >
                    <Button
                      size="default"
                      onClick={createTDS}
                      loading={formLoading}
                      type="primary"
                    >
                      Save
                    </Button>
                    <Button size="default">Reset</Button>

                    <CommonIcons
                      action="downloadButton"
                      onClick={() =>
                        downloadCSV(TDSList, columns, "TDS Report")
                      }
                    />
                  </Space>
                </Col>
              </Row>
            </Form>
          </Card>
        </Col>
        <Col
          span={16}
          className="remove-table-footer"
          style={{ height: "calc(100% - 5px)" }}
        >
          <MyDataTable loading={loading} columns={columns} data={TDSList} />
        </Col>
      </Row>
    </div>
  );
}
