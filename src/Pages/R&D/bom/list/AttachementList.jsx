import React, { useEffect, useState } from "react";
import { imsAxios } from "../../../../axiosInterceptor";
import MyDataTable from "../../../../Components/MyDataTable";
import TableActions from "../../../../Components/TableActions.jsx/TableActions";
import { v4 } from "uuid";
import { useToast } from "../../../../hooks/useToast.js";
const AttachementList = ({
 
  attachlist,
  setAttachLsit,
  showDocs,
  setShowDocs,
}) => {
   const { showToast } = useToast();
  const [rows, setRows] = useState([]);
  const [documentRow, setDocumentRow] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleFetchProductList = async (val) => {
    setLoading(true);
    const isDraft = window.location.pathname.includes("draft");
    const url = isDraft
      ? `/bomRnd/draftAttachment/${val}`
      : `/bomRnd/attachment/${val}`;

    const response = await imsAxios.get(url);
    if (response.success) {
      //   setRows(response.data);
      let arr = response.data;
      let a = arr?.map((r, index) => {
        return {
          id: v4(),
          type: "Document",
          ...r,
        };
      });
      setDocumentRow(a);

      // console.log("rows", rowing);
      setRows(a);
      showToast(response.message, "success");
      setLoading(false);
    } else {
      showToast(response.message.msg, "success");
      setLoading(false);
    }
    setLoading(false);
  };
  useEffect(() => {
    if (attachlist.key) {
      let val = attachlist?.key;
      handleFetchProductList(val);
    }
  }, [attachlist]);
  //   const handleDownloadDoc = async (url: string) => {
  //     window.open(url, "_blank", "noreferrer");
  //   };

  const doccolumns = [
    // { headerName: "#", field: "id", width: 30 },
    {
      headerName: "File Name",
      field: "fileName",
      width: 300,
      //   renderCell: ({ row }: { row: ProductType }) => (
      //     <ToolTipEllipses text={row.name} />
      //   ),
    },
    {
      headerName: "Type",
      field: "type",
      width: 90,
      //   renderCell: ({ row }: { row: ProductType }) => (
      //     <ToolTipEllipses text={row.name} />
      //   ),
    },
    {
      headerName: "File Size",
      field: "fileSize",
      width: 90,
      //   renderCell: ({ row }: { row: ProductType }) => (
      //     <ToolTipEllipses text={row.name} />
      //   ),
    },
    {
      headerName: "Inserted Date",
      field: "insertDt",
      width: 190,
    },
    {
      headerName: "Action",
      field: "sku",
      width: 100,
      renderCell: ({ row }) => (
        <>
          {/* <TableActions
            action="download"
            type="secondary"
            onClick={row.filePath}
          > */}
          <a target="_blank" href={row?.filePath}>
            {" "}
            <TableActions
              action="download"
              type="secondary"
              onClick={row.filePath}
            />
          </a>
          {/* </TableActions> */}
        </>
      ),
    },
  ];
  return (
    <Drawer
      title="Attachments"
      width={800}
      open={attachlist?.key}
      onClose={() => setAttachLsit(null)}
    >
      <Flex vertical gap={3} style={{ marginBottom: 10, height: "100%" }}>
        <MyDataTable columns={doccolumns} data={rows} loading={loading} />
      </Flex>

      {rows?.documents?.fileName === 0 && (
        <Flex justify="center" style={{ marginTop: 200 }}>
          <Typography.Text strong type="secondary">
            No attachments found for this BOM!
          </Typography.Text>
        </Flex>
      )}
      {/* {props.bom.documents?.length > 0 && (
        <Flex vertical gap={5}>
          <Flex justify={"space-between"}>
            <Typography.Text strong>Attachements:</Typography.Text>
            <Typography.Text>
              {props.bom.documents.length} found
            </Typography.Text>
          </Flex>
          {props.bom.documents.map((row) => (
            <Card size="small">
              <Flex align="center" justify={"space-between"}>
                <Typography.Text strong>{row.fileName}</Typography.Text>
                <CommonIcons
                  onClick={() => handleDownloadDoc(row.url)}
                  action="downloadButton"
                />
              </Flex>
            </Card>
          ))} */}
      {/* </Flex> */}
      {/* )} */}
    </Drawer>
  );
};

export default AttachementList;
