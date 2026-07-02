import { useState,useEffect } from "react";
import { useLocation } from "react-router-dom";
import { imsAxios } from "../../../../axiosInterceptor";
import ToolTipEllipses from "../../../../Components/ToolTipEllipses";
import { Switch } from "antd";
import MyDataTable from "../../../../Components/MyDataTable";
import { GridActionsCellItem } from "@mui/x-data-grid";
import ViewModal from "./ViewModal";
import { downloadExcel } from "../../../../Components/printFunction";
import EditModal from "./Edit";
import { downloadCSVnested2 } from "../../../../Components/exportToCSV";
import { CommonIcons } from "../../../../Components/TableActions.jsx/TableActions";
import { Row } from "antd";
import { useToast } from "../../../../hooks/useToast.js";

const ManageBOM = () => {
  const { showToast } = useToast();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [viewBom, setViewBom] = useState(false);
  const [editBom, setEditBom] = useState(false);
  const { pathname } = useLocation();
  const bomType = pathname.includes("sfg") ? "sfg" : "fg";

  const getRows = async () => {
    let url = "";
    if (bomType === "sfg") {
      url = "bom/semiFgBom";
    } else {
      url = "bom/fgBom";
    }
    setLoading("fetch");
    const response = await imsAxios.get(url);
    setLoading(false);
    const { data } = response;
    if (data) {
      if (response.success) {
        const arr = response.data.map((row, index) => ({
          id: index + 1,
          product: row.subject_name,
          sku: row.bom_product_sku,
          createdDate: row.insert_date,
          level: row.bom_level,
          bomId: row.subject_id,
          status: row.bom_status,
        }));

        setRows(arr);
      }
    }
  };
  const toggleStatus = async (id, status) => {
    const statusText = status ? "ENABLE" : "DISABLE";
    setLoading(id);
    const response = await imsAxios.post("/bom/updateBOMStatus", {
      subject_id: id,
      status: statusText,
    });
    if (response.success) {
      setRows((curr) =>
        curr.map((row) => {
          if (row.bomId === id) {
            return {
              ...row,
              status: row.status === "ENABLE" ? "DISABLED" : "ENABLE",
            };
          } else {
            return row;
          }
        })
      );
    }

    setLoading(false);
  };
  const handleBOMDownload = async (id, name) => {
    setLoading("fetch");
    const response = await imsAxios.post("/bom/bomExcelDownload", {
      subject_id: id,
    });
    setLoading(false);

    if (response.success) {
      downloadExcel(response.data.buffer.data, `BOM ${name}`);
    } else {
      showToast(response.message?.msg || response.message, "error");
    }
  };
  const actionColumns = [
    {
      headerName: "",
      width: 30,
      type: "actions",
      field: "actions",
      getActions: ({ row }) => [
        <GridActionsCellItem
        key={"view"}
          showInMenu
          // disabled={disabled}
          label="View"
          onClick={() => setViewBom({ name: row.product, id: row.bomId })}
        />,
        <GridActionsCellItem
        key={"edit"}
          showInMenu
          // disabled={disabled}
          label="Edit"
          onClick={() => setEditBom({ name: row.product, id: row.bomId })}
        />,
        <GridActionsCellItem
        key={"download"}
          showInMenu
          // disabled={disabled}
          label="Download"
          onClick={() => handleBOMDownload(row.bomId, row.product)}
        />,
      ],
    },
    {
      headerName: "Status",
      width: 100,
      field: "status",
      type: "actions",
      renderCell: ({ row }) => (
        <Switch
          size="small"
          checked={row.status === "ENABLE"}
          loading={loading === row.bomId}
          onChange={(value) => {
            toggleStatus(row.bomId, value);
          }}
        />
      ),
    },
  ];

  useEffect(() => {
    getRows();
  }, []);

  const handleDownload = () => {
    downloadCSVnested2(rows, columns, "FG BOM", actionColumns);
  };
  return (
    <div style={{ height: "calc(100vh - 160px)", padding: 10,  }}>
      <Row justify="end" >
        <CommonIcons
          disabled={rows.length === 0}
          onClick={handleDownload}
          action="downloadButton"
        />
      </Row>
     <div style={{marginTop:10, height:"100%"}}>
       <MyDataTable
        loading={loading === "fetch"}
        columns={[...actionColumns, ...columns]}
        data={rows}
      />
     </div>

      <ViewModal show={viewBom} close={() => setViewBom(false)} />
      <EditModal
        bomType={bomType}
        show={editBom}
        close={() => setEditBom(false)}
      />
    </div>
  );
};

export default ManageBOM;

const columns = [
  {
    headerName: "#",
    field: "id",
    width: 30,
  },
  {
    headerName: "Product",
    field: "product",
    minWidth: 200,
    flex: 1,
    renderCell: ({ row }) => <ToolTipEllipses text={row.product} />,
  },
  {
    headerName: "SKU",
    field: "sku",
    minWidth: 150,
    renderCell: ({ row }) => <ToolTipEllipses text={row.sku} copy={true} />,
  },
  {
    headerName: "Project",
    field: "bom_project",
    minWidth: 150,
  },
  // {
  //   headerName: "Level",
  //   field: "level",
  //   minWidth: 50,
  // },
  {
    headerName: "Created Date",
    field: "createdDate",
    minWidth: 150,
    renderCell: ({ row }) => <ToolTipEllipses text={row.createdDate} />,
  },
];
