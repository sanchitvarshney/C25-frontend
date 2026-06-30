import React, { useEffect } from "react";
import { imsAxios } from "../../../axiosInterceptor";
import { useState } from "react";
import MyDataTable from "../../../Components/MyDataTable";
import { v4 } from "uuid";
import { useToast } from "../../../hooks/useToast";

function BlockTCS() {
  const { showToast } = useToast();
  const [allBlockedData, setAllBlockedData] = useState([]);
  const [loading, setLoading] = useState(false);

  const getAllBlockTCS = async () => {
    setLoading(true);
    const response = await imsAxios.get("tally/tcs/list/blocked");
    if (response.success) {
      const arr = response.data.map((row) => {
        return {
          ...row,
          id: v4(),
        };
      });
      setAllBlockedData(arr);
    } else {
      showToast(response.message?.msg || response.message, "error");
    }

    setLoading(false);
  };

  const columns = [
    {
      headerName: "TCS Code",
      field: "tcsCode",
      flex: 1,
    },
    {
      headerName: "Name",
      field: "name",
      flex: 1,
    },
    {
      headerName: "GL/ Code",
      field: "glCode",
      flex: 1,
    },
    {
      headerName: "Description",
      field: "desc",
      flex: 1,
    },
    {
      headerName: "Percentage",
      field: "percentage",
      flex: 1,
    },
    {
      headerName: "Status",
      field: "status",
      renderCell: ({ row }) => (
        <span
          style={{
            border: "1px solid red",
            padding: "2px 10px",
            borderRadius: "4px",
            color: "red",
          }}
        >
          {row.status}
        </span>
      ),
      flex: 1,
    },
  ];

  useEffect(() => {
    getAllBlockTCS();
  }, []);
  return (
    <div style={{ height: "calc(100vh - 120px)", padding: 10 }}>
      {/* <Col span={24} style={{ height: "100%", margin: "5px" }}> */}
        <MyDataTable
          loading={loading}
          columns={columns}
          data={allBlockedData}
        />
      {/* </Col> */}
    </div>
  );
}

export default BlockTCS;
