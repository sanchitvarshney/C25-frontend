import { DataGrid } from "@mui/x-data-grid";
import { Card } from "antd";

export default function FormTable({ columns, data, loading }) {
  const validColumns = (columns || []).filter(
    (col) => col && col.field && col.field.trim() !== ""
  );

  return (
    <Card
      size="small"
      style={{ width: "100%", height: "100%" }}
      styles={{
        body: {
          padding: 0,
          height: "100%",
          width: "100%",
          overflow: "auto",
        },
      }}
    >
      <DataGrid
        columns={validColumns}
        rows={data}
        loading={loading}
        autoHeight={false}
       
        sx={{
          border: "none",
          "& .MuiDataGrid-cell": {
            padding: "4px 8px",
          },
        }}
        getRowId={(row) => row.id} 
      />
    </Card>
  );
}
