import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import React, { useEffect, useState } from "react";

export default function FormTable({
  columns,
  data,
  loading,
  getRowStyle,
  headText = "center",
  cellText = "left",
}) {
  const [hoveredRow, setHoveredRow] = useState(null);
  const [headers, setHeaders] = useState([]);
  const [cells, setCells] = useState([]);
  const getColumnWidth = (column) => column.width ?? column.minWidth ?? 120;
  const fixedLefts = columns.reduce((acc, column, index) => {
    const previousIndex = index - 1;
    const previousLeft = previousIndex >= 0 ? acc[previousIndex] ?? 0 : 0;
    const previousWidth =
      previousIndex >= 0 && columns[previousIndex]?.fixed === "left"
        ? getColumnWidth(columns[previousIndex])
        : 0;
    acc[index] = previousLeft + previousWidth;
    return acc;
  }, {});
  const getColumnSizeStyles = (column) => {
    if (column.width) {
      return {
        width: `${column.width}px !important`,
        maxWidth: `${column.width}px !important`,
        minWidth: `${column.width}px !important`,
      };
    }
    if (column.minWidth) {
      return {
        minWidth: `${column.minWidth}px !important`,
      };
    }
    return {};
  };
  useEffect(() => {
    let arr = columns.map((row) => {
      return row.headerName;
    });
    let arr1 = columns.map((row) => {
      return row.renderCell({ row });
    });
    setHeaders(arr);
    setCells(arr1);
  }, [columns]);

  return (
    <TableContainer
      style={{
        height: "100%",
        border: "1px solid white",
        borderRadius: "0px",
        overflow: "auto",
      }}
    >
      {/* <div
        size="small"
        style={{
          width: "100%",
          height: "100%",
          borderRadius: "0px",
          border: "1px solid #ccc",
        }}
      > */}
        <Table
          stickyHeader
          sx={{
            width: "100%",
            minWidth: "max-content",
            overflowX: "auto",
            border: "1px solid #ccc",
          }}
          size="small"
          aria-label="a dense table"
        >
          <TableHead>
            <TableRow>
              {columns.map((row, index) => (
                <TableCell
                  sx={{
                    ...getColumnSizeStyles(row),
                    backgroundColor: "#f1f7fc",
                    padding: "0px",
                    textAlign: row.headText || headText,
                    fontSize: "14px",
                    border: "1px solid white",
                    borderBottom: "1px solid #c6def4",
                    overflow: "hidden",
                    ...(row.fixed === "left"
                      ? {
                          position: "sticky",
                          left: fixedLefts[index],
                          zIndex: 5,
                          boxShadow: "2px 0 6px rgba(15, 23, 42, 0.08)",
                        }
                      : {}),
                  }}
                  key={index}
                  component="th"
                >
                  {row.headerName}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {data?.map((row, rowIndex) => {
              const rowColor = rowIndex % 2 === 0 ? "#ffffff" : "#f8f9fa";
              const customStyle = getRowStyle?.(row) ?? {};
              const hasHighlight = Boolean(customStyle.backgroundColor);
              const backgroundColor = hoveredRow === row.id
                ? hasHighlight
                  ? "#ffccc7"
                  : "#fffaec"
                : customStyle.backgroundColor ?? rowColor;
              return (
                <TableRow
                  key={row?.id ?? `row-${rowIndex}`}
                  style={{
                    backgroundColor,
                    ...customStyle,
                  }}
                  onMouseEnter={() => setHoveredRow(row.id)}
                  onMouseLeave={() => setHoveredRow(null)}
                >
                  {columns.map((col, index) => (
                    <TableCell
                      key={index}
                      size="small"
                      sx={{
                        ...getColumnSizeStyles(col),
                        justifyContent: "center",
                        textAlign: col.align || cellText,
                        padding: "2px 5px",
                        border: "none",
                        ...(col.fixed === "left"
                          ? {
                              position: "sticky",
                              left: fixedLefts[index],
                              zIndex: 4,
                              backgroundColor,
                              boxShadow: "2px 0 6px rgba(15, 23, 42, 0.06)",
                            }
                          : {}),
                      }}
                    >
                      <div style={{ display: "contents" }}>
                        {col.renderCell({ row })}
                      </div>
                    </TableCell>
                  ))}
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
    
    </TableContainer>
  );
}
