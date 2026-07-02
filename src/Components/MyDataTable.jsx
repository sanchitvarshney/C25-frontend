import { useMemo } from "react";
import { Box, Typography, alpha } from "@mui/material";
import { styled } from "@mui/material/styles";
import {
  DataGrid,
  GridToolbarContainer,
  GridToolbarFilterButton,
  GridToolbarExport,
  GridToolbarColumnsButton,
  gridPageCountSelector,
  gridPageSelector,
  useGridApiContext,
  useGridSelector,
} from "@mui/x-data-grid";
import Pagination from "@mui/material/Pagination";
// Enhanced Styled Components
const StyledGridOverlay = styled("div")(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  height: "100%",
  padding: theme.spacing(3),
  animation: "fadeIn 0.5s ease-in",
  "@keyframes fadeIn": {
    from: {
      opacity: 0,
      transform: "translateY(-10px)",
    },
    to: {
      opacity: 1,
      transform: "translateY(0)",
    },
  },
  "& .ant-empty-img-1": {
    fill: theme.palette.mode === "light" ? "#aeb8c2" : "#262626",
  },
  "& .ant-empty-img-2": {
    fill: theme.palette.mode === "light" ? "#f5f5f7" : "#595959",
  },
  "& .ant-empty-img-3": {
    fill: theme.palette.mode === "light" ? "#dce0e6" : "#434343",
  },
  "& .ant-empty-img-4": {
    fill: theme.palette.mode === "light" ? "#fff" : "#1c1c1c",
  },
  "& .ant-empty-img-5": {
    fillOpacity: theme.palette.mode === "light" ? "0.8" : "0.08",
    fill: theme.palette.mode === "light" ? "#f5f5f5" : "#fff",
  },
}));

const StyledToolbarContainer = styled(GridToolbarContainer)(({ theme }) => ({
  // padding: theme.spacing(2, 3),
  // backgroundColor: alpha(theme.palette.primary.main, 0.04),
  // borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
  // borderRadius: theme.shape.borderRadius,
  // marginBottom: theme.spacing(1),
  gap: theme.spacing(1),
  "& .MuiButton-root": {
    padding: theme.spacing(0.75, 1.5),
    borderRadius: theme.shape.borderRadius,
    textTransform: "none",
    fontWeight: 500,
    transition: "all 0.2s ease-in-out",
    "&:hover": {
      backgroundColor: alpha(theme.palette.primary.main, 0.08),
      transform: "translateY(-1px)",
      boxShadow: `0 2px 8px ${alpha(theme.palette.primary.main, 0.2)}`,
    },
  },
}));

const StyledPagination = styled(Pagination)(({ theme }) => ({
  padding: theme.spacing(2),
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  "& .MuiPaginationItem-root": {
    borderRadius: theme.shape.borderRadius,
    fontWeight: 500,
    transition: "all 0.2s ease-in-out",

    "&:hover": {
      backgroundColor: alpha(theme.palette.primary.main, 0.1),
      transform: "scale(1.05)",
    },
    "&.Mui-selected": {
      backgroundColor: "#0f766e",
      color: theme.palette.primary.contrastText,
      boxShadow: `0 2px 8px ${alpha(theme.palette.primary.main, 0.3)}`,
      "&:hover": {
        // backgroundColor: theme.palette.primary.dark,
        transform: "scale(1.01)",
      },
    },
  },
}));

const CustomPagination = () => {
  const apiRef = useGridApiContext();
  const page = useGridSelector(apiRef, gridPageSelector);
  const pageCount = useGridSelector(apiRef, gridPageCountSelector);
  const rowCount = apiRef.current.getAllRowIds().length;

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        // padding: (theme) => theme.spacing(1.5, 2),
        backgroundColor: (theme) => alpha(theme.palette.background.paper, 0.8),
        // borderTop: (theme) => `1px solid ${alpha(theme.palette.divider, 0.1)}`,
      }}
    >
      <Typography
        variant="body2"
        sx={{
          color: "text.secondary",
          fontWeight: 500,
        }}
      >
        Total: {rowCount} {rowCount === 1 ? "row" : "rows"}
      </Typography>
      <StyledPagination
        color="primary"
        count={pageCount}
        page={page + 1}
        onChange={(event, value) => apiRef.current.setPage(value - 1)}
        shape="rounded"
        size="medium"
      />
    </Box>
  );
};

function CustomNoRowsOverlay() {
  return (
    <StyledGridOverlay>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 2,
        }}
      >
        <Box
          sx={{
            position: "relative",
            animation: "float 3s ease-in-out infinite",
            "@keyframes float": {
              "0%, 100%": {
                transform: "translateY(0px)",
              },
              "50%": {
                transform: "translateY(-10px)",
              },
            },
          }}
        >
          <svg
            width="140"
            height="120"
            viewBox="0 0 184 152"
            aria-hidden
            focusable="false"
          >
            <g fill="none" fillRule="evenodd">
              <g transform="translate(24 31.67)">
                <ellipse
                  className="ant-empty-img-5"
                  cx="67.797"
                  cy="106.89"
                  rx="67.797"
                  ry="12.668"
                />
                <path
                  className="ant-empty-img-1"
                  d="M122.034 69.674L98.109 40.229c-1.148-1.386-2.826-2.225-4.593-2.225h-51.44c-1.766 0-3.444.839-4.592 2.225L13.56 69.674v15.383h108.475V69.674z"
                />
                <path
                  className="ant-empty-img-2"
                  d="M33.83 0h67.933a4 4 0 0 1 4 4v93.344a4 4 0 0 1-4 4H33.83a4 4 0 0 1-4-4V4a4 4 0 0 1 4-4z"
                />
                <path
                  className="ant-empty-img-3"
                  d="M42.678 9.953h50.237a2 2 0 0 1 2 2V36.91a2 2 0 0 1-2 2H42.678a2 2 0 0 1-2-2V11.953a2 2 0 0 1 2-2zM42.94 49.767h49.713a2.262 2.262 0 1 1 0 4.524H42.94a2.262 2.262 0 0 1 0-4.524zM42.94 61.53h49.713a2.262 2.262 0 1 1 0 4.525H42.94a2.262 2.262 0 0 1 0-4.525zM121.813 105.032c-.775 3.071-3.497 5.36-6.735 5.36H20.515c-3.238 0-5.96-2.29-6.734-5.36a7.309 7.309 0 0 1-.222-1.79V69.675h26.318c2.907 0 5.25 2.448 5.25 5.42v.04c0 2.971 2.37 5.37 5.277 5.37h34.785c2.907 0 5.277-2.421 5.277-5.393V75.1c0-2.972 2.343-5.426 5.25-5.426h26.318v33.569c0 .617-.077 1.216-.221 1.789z"
                />
              </g>
              <path
                className="ant-empty-img-3"
                d="M149.121 33.292l-6.83 2.65a1 1 0 0 1-1.317-1.23l1.937-6.207c-2.589-2.944-4.109-6.534-4.109-10.408C138.802 8.102 148.92 0 161.402 0 173.881 0 184 8.102 184 18.097c0 9.995-10.118 18.097-22.599 18.097-4.528 0-8.744-1.066-12.28-2.902z"
              />
              <g
                className="ant-empty-img-4"
                transform="translate(149.65 15.383)"
              >
                <ellipse cx="20.654" cy="3.167" rx="2.849" ry="2.815" />
                <path d="M5.698 5.63H0L2.898.704zM9.259.704h4.985V5.63H9.259z" />
              </g>
            </g>
          </svg>
        </Box>
        <Typography
          variant="h6"
          sx={{
            color: "text.secondary",
            fontWeight: 500,
            mt: 0.5,
          }}
        >
          No Data Available
        </Typography>
        <Typography
          variant="body2"
          sx={{
            color: "text.disabled",
            textAlign: "center",
            maxWidth: 300,
          }}
        >
          There are no rows to display. Data will appear here once available.
        </Typography>
      </Box>
    </StyledGridOverlay>
  );
}

export default function MyDataTable(props) {
  // Omit 'rules' so it's never passed to DataGrid (Form.Item expects array; prevents rules.some error when used inside Form)
  const { components: userComponents = {}, ...dataTableProps } =
    props;

  // Ensure every column has a unique `field` so DataGrid gets valid keys (fixes "unique key" warning)
  const columnsWithKeys = useMemo(() => {
    const cols = props.columns || [];
    const used = new Set();
    return cols.map((col, index) => {
      let field = col.field;
      if (field == null || field === "") {
        field = `col_${index}`;
      }
      if (used.has(field)) {
        field = `${field}_${index}`;
      }
      used.add(field);
      return { ...col, field };
    });
  }, [props.columns]);

  function CustomToolbar() {
    return (
      <StyledToolbarContainer>
        {props.filterIcon && <GridToolbarFilterButton />}
        {props.editColumns && <GridToolbarColumnsButton />}
        {props.export && <GridToolbarExport />}
      </StyledToolbarContainer>
    );
  }

  return (
    <Box
      sx={{
        height: "100%",
        width: "100%",
        position: "relative",
        overflow: "hidden",
        borderRadius: "0px",
        boxShadow: (theme) =>
          theme.palette.mode === "light"
            ? "0 2px 8px rgba(0,0,0,0.08)"
            : "0 2px 8px rgba(0,0,0,0.3)",
        backgroundColor: (theme) => theme.palette.background.paper,
        transition: "all 0.3s ease-in-out",
        "&:hover": {
          boxShadow: (theme) =>
            theme.palette.mode === "light"
              ? "0 4px 16px rgba(0,0,0,0.12)"
              : "0 4px 16px rgba(0,0,0,0.4)",
        },
      }}
    >
      <DataGrid
        onCellKeyDown={(params, events) => events.stopPropagation()}
        rows={props.data}
        rowLength={100}
        disableColumnMenu={props.hideHeaderMenu}
        columns={columnsWithKeys}
        components={{
          Toolbar: CustomToolbar,
          NoRowsOverlay: CustomNoRowsOverlay,
          Pagination: CustomPagination,
          ...userComponents,
        }}
        componentsProps={{
          footer: { rows: props.data },

          menu: {
            anchorOrigin: {
              vertical: "bottom",
              horizontal: "left",
            },
            transformOrigin: {
              vertical: "top",
              horizontal: "left",
            },
          },
        }}
        pageSize={100}
        rowsPerPageOptions={[25, 50, 100, 1000]}
        density="compact"
        sx={{
          border: "none",
          borderRadius: 0,
          "& .MuiDataGrid-root": {
            border: "none",
          },
          // Global menu/popper styling to ensure downward opening
          "& .MuiPopper-root": {
            zIndex: 1300,
            borderRadius: 0,
            "& .MuiPaper-root": {
              borderRadius: 0,
              boxShadow: (theme) =>
                theme.palette.mode === "light"
                  ? "0 4px 16px rgba(0,0,0,0.15)"
                  : "0 4px 16px rgba(0,0,0,0.5)",
              marginTop: (theme) => theme.spacing(0.5),
            },
          },
          "& *": {
            borderRadius: "0 !important",
          },
          "& .MuiDataGrid-columnHeaders": {
            backgroundColor: (theme) => alpha(theme.palette.primary.main, 0.06),
            borderBottom: (theme) =>
              `2px solid ${alpha(theme.palette.primary.main, 0.2)}`,
            fontWeight: 600,
            fontSize: window.innerWidth < 1600 ? "0.75rem" : "0.875rem",
            "& .MuiDataGrid-columnHeaderTitle": {
              fontWeight: 600,
              color: (theme) => theme.palette.text.primary,
            },
            "& .MuiDataGrid-columnHeader:focus, & .MuiDataGrid-columnHeader:focus-within":
              {
                outline: "none",
              },
          },
          "& .MuiDataGrid-row": {
            transition: "all 0.2s ease-in-out",
            "&:hover": {
              backgroundColor: (theme) =>
                alpha(theme.palette.primary.main, 0.04),
              transform: "scale(1.001)",
              boxShadow: (theme) =>
                `0 2px 8px ${alpha(theme.palette.primary.main, 0.1)}`,
            },
            "&.Mui-selected": {
              backgroundColor: (theme) =>
                alpha(theme.palette.primary.main, 0.12),
              "&:hover": {
                backgroundColor: (theme) =>
                  alpha(theme.palette.primary.main, 0.16),
              },
            },
          },
          "& .MuiDataGrid-cell": {
            fontSize: window.innerWidth < 1600 ? "0.75rem" : "0.875rem",
            borderBottom: (theme) =>
              `1px solid ${alpha(theme.palette.divider, 0.08)}`,
            padding: (theme) => theme.spacing(1, 1.5),
            transition: "all 0.2s ease-in-out",
            "&:focus, &:focus-within": {
              outline: "none !important",
              border: "none !important",
            },
            "&:hover": {
              backgroundColor: (theme) =>
                alpha(theme.palette.primary.main, 0.02),
            },
          },
          "& .MuiDataGrid-footerContainer": {
            borderTop: (theme) =>
              `1px solid ${alpha(theme.palette.divider, 0.1)}`,
            minHeight: "56px",
          },
          "& .MuiDataGrid-toolbarContainer": {
            padding: (theme) => theme.spacing(0, 2),
          },
          "& .MuiLinearProgress-root": {
            backgroundColor: (theme) => alpha(theme.palette.primary.main, 0.1),
            "& .MuiLinearProgress-bar": {
              backgroundColor: (theme) => theme.palette.primary.main,
            },
          },
          "& .MuiDataGrid-overlayWrapper": {
            backgroundColor: (theme) =>
              alpha(theme.palette.background.default, 0.8),
          },
          // Action menu styling - ensure it opens downward
          "& .MuiDataGrid-menuIcon": {
            "& .MuiSvgIcon-root": {
              transition: "transform 0.2s ease-in-out",
            },
          },
          "& .MuiDataGrid-menuList": {
            borderRadius: (theme) => theme.shape.borderRadius,
            boxShadow: (theme) =>
              theme.palette.mode === "light"
                ? "0 4px 16px rgba(0,0,0,0.15)"
                : "0 4px 16px rgba(0,0,0,0.5)",
            padding: (theme) => theme.spacing(0.5),
            "& .MuiMenuItem-root": {
              borderRadius: (theme) => theme.shape.borderRadius,
              padding: (theme) => theme.spacing(1, 1.5),
              margin: (theme) => theme.spacing(0.25, 0),
              transition: "all 0.2s ease-in-out",
              "&:hover": {
                backgroundColor: (theme) =>
                  alpha(theme.palette.primary.main, 0.08),
              },
              "&.Mui-disabled": {
                opacity: 0.5,
              },
            },
          },
          // Action cell menu (GridActionsCellItem with showInMenu)
          "& .MuiDataGrid-actionsCell": {
            "& .MuiIconButton-root": {
              "&:hover": {
                backgroundColor: (theme) =>
                  alpha(theme.palette.action.hover, 0.04),
              },
            },
          },
          // Menu component styling for action menus
          "& .MuiMenu-paper": {
            marginTop: (theme) => theme.spacing(0.5),
            borderRadius: (theme) => theme.shape.borderRadius,
            boxShadow: (theme) =>
              theme.palette.mode === "light"
                ? "0 4px 16px rgba(0,0,0,0.15)"
                : "0 4px 16px rgba(0,0,0,0.5)",
            "& .MuiList-root": {
              padding: (theme) => theme.spacing(0.5),
              "& .MuiMenuItem-root": {
                borderRadius: (theme) => theme.shape.borderRadius,
                padding: (theme) => theme.spacing(1, 1.5),
                margin: (theme) => theme.spacing(0.25, 0),
                transition: "all 0.2s ease-in-out",
                "&:hover": {
                  backgroundColor: (theme) =>
                    alpha(theme.palette.primary.main, 0.08),
                },
              },
            },
          },
          // Ensure column menu opens downward
          "& .MuiDataGrid-columnHeader": {
            "& .MuiDataGrid-menuIcon": {
              "&:hover": {
                backgroundColor: (theme) =>
                  alpha(theme.palette.action.hover, 0.04),
              },
            },
          },
        }}
        loading={props.loading}
        {...dataTableProps}
      />
    </Box>
  );
}
