//@ts-ignore
import ToolTipEllipses from "../../../Components/ToolTipEllipses.jsx";
//@ts-ignore
import MyDataTable from "../../../Components/MyDataTable.jsx";
//@ts-ignore
import TableActions from "../../../Components/TableActions.jsx/TableActions.jsx";
//@ts-ignore
import { CommonIcons } from "../../../Components/TableActions.jsx/TableActions";
//@ts-ignore
import { downloadCSVnested2 } from "../../../Components/exportToCSV";
import { Row } from "antd";

interface PropTypes {
  rows: any[];
  loading: boolean;
  setEditingProduct: React.Dispatch<React.SetStateAction<string | boolean>>;
  setUpdatingImage: React.Dispatch<React.SetStateAction<false | any>>;
  productType: any;
  setShowImages: React.Dispatch<React.SetStateAction<false | any>>;
}
function View({
  rows,
  loading,
  setEditingProduct,
  setUpdatingImage,
  productType,
  setShowImages,
}: PropTypes) {
  const actionColumn = [
    {
      headerName: "Actions",
      width: 100,
      type: "actions",
      getActions: ({ row }: { row: any }) => [
        <TableActions
          action="edit"
          onClick={() => row.productKey && setEditingProduct(row.productKey)}
        />,
        <TableActions action="view" onClick={() => setShowImages(row)} />,
        <TableActions
          disabled={productType === "sfg"}
          action="upload"
          onClick={() => setUpdatingImage(row)}
        />,
      ],
    },
  ];
  const handleDownload = () => {
    downloadCSVnested2(rows, columns, "Products");
  };
  return (
    <div style={{ height: "100%" }}>
      <Row justify="end" style={{ margin: "5x 0" }}>
        <CommonIcons
          disabled={rows?.length === 0}
          onClick={handleDownload}
          action="downloadButton"
        />
      </Row>
      <MyDataTable
        loading={loading}
        data={rows}
        columns={[...columns, ...actionColumn]}
      />
    </div>
  );
}

export default View;
const columns = [
  { headerName: "#", field: "id", width: 30 }, 
  {
    headerName: "Product Name",
    field: "name",
    flex: 1,
    renderCell: ({ row }:any) => <ToolTipEllipses text={row.name} />,
  },
  {
    headerName: "SKU",
    field: "sku",
    width: 100,
    renderCell: ({ row }:any) => <ToolTipEllipses text={row.sku} copy={true} />,
  },
  {
    headerName: "Unit",
    field: "uom",
    width: 80,
  },
  {
    headerName: "Category",
    field: "category",
    width: 100,
    renderCell: ({ row }:any) => (
      <>
        {row?.category == ""
          ? "--"
          : row?.category == "services"
          ? "Services"
          : "Goods"}
      </>
    ),
  },
];
