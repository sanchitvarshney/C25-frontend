import React, { useEffect, useMemo } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Paper,
  Chip,
  CircularProgress,
  Divider,
} from "@mui/material";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { Launch as LaunchIcon } from "@mui/icons-material";
import { useDispatch, useSelector } from "react-redux";
// @ts-ignore
import MyDatePicker from "../../Components/MyDatePicker";
import {
  fetchGatePassSummary,
  fetchMasterSummary,
  fetchMfgProducts,
  fetchMinSummary,
  fetchPendingSummary,
  fetchTransactionsSummary,
  setSummaryDate,
  // @ts-ignore
} from "../../Features/dashboardSlice/dashboardSlice";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip as ReTooltip,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend,
} from "recharts";

const CHART_COLORS = [
  "#6366F1",
  "#06B6D4",
  "#F59E0B",
  "#EC4899",
  "#10B981",
  "#3B82F6",
  "#F97316",
  "#14B8A6",
];

const Dashboard = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.login);
  const images = [
  "/assets/smallCard.png",
  "/assets/smallCard2.png",
  "/assets/smallCard3.png",
  "/assets/smallCard4.png",
];
const getImage = (index) => {
  return images[index % images.length];
};


  const {
    summaryDate,
    masterSummary,
    transactionSummary,
    gatePassSummary,
    minSummary,
    pendingTransactionSummary,
    mfgProducts,
    loading,
  } = useSelector((state) => state.dashboard);

  const getGreetingTime = () => {
    const hour = new Date().getHours();
    if (hour < 12) {
      return "Good Morning";
    } else if (hour < 16) {
      return "Good Afternoon";
    } else {
      return "Good Evening";
    }
  };

  const transactionsChartData = useMemo(
    () =>
      (transactionSummary || []).map((i) => ({
        name: i.title,
        value: Number(i.value ?? 0),
      })),
    [transactionSummary]
  );

  const gatePassChartData = useMemo(
    () =>
      (gatePassSummary || []).map((i) => ({
        name: i.title,
        value: Number(i.value ?? 0),
      })),
    [gatePassSummary]
  );

  const pendingChartData = useMemo(
    () =>
      (pendingTransactionSummary || []).map((i) => ({
        name: i.title,
        value: Number(i.value ?? 0),
      })),
    [pendingTransactionSummary]
  );

  const topMfgProducts = useMemo(
    () =>
      (mfgProducts || [])
        .slice(0, 10)
        .map((p) => ({ name: p.product, qty: Number(p.qty ?? 0) })),
    [mfgProducts]
  );

  useEffect(() => {
    if (summaryDate && summaryDate.split("-").length > 2) {
      dispatch(fetchTransactionsSummary(summaryDate));

      dispatch(fetchGatePassSummary(summaryDate));

      dispatch(fetchMinSummary(summaryDate));

      dispatch(fetchPendingSummary(summaryDate));

      dispatch(fetchMfgProducts(summaryDate));
    }
  }, [summaryDate]);

  useEffect(() => {
    dispatch(fetchMasterSummary());
  }, []);

  const renderSummaryGrid = (title, items, loadingFlag, subtitle) => (
    <Box sx={{ width: "100%" }}>
      <Paper
        elevation={0}
        sx={{
          py: 2,
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            mb: 1,
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: "bold" }}>
            {title}
          </Typography>
          {subtitle && (
            <Typography variant="body2" color="text.secondary">
              {subtitle}
            </Typography>
          )}
        </Box>
        {/* <Divider sx={{ mb: 2 }} /> */}
        {loadingFlag ? (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              py: 4,
            }}
          >
            <CircularProgress size={24} />
          </Box>
        ) : (
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                sm: "1fr 1fr",
                md: "repeat(4, 1fr)",
              },
              gap: 3,
            }}
          >
            {items.map((it, idx) => (
              <Card
                key={`${it.title}-${idx}`}
                sx={{
                  borderRadius: 2,
                  boxShadow: "0 0 12px rgba(0,0,0,0.12)",
                  position: "relative",
                  overflow: "hidden",
                  transition: "all 0.25s ease",
                  "&:hover": {
                    boxShadow: "0 0 20px rgba(0,0,0,0.18)",
                    transform: "translateY(-2px)",
                  },
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    width: 300,
                    height: 300,
                    borderRadius: "50%",
                    background: `url(${getImage(idx)}) no-repeat center center`,
                    backgroundSize: "cover",
                    top: -100,
                    right: -180,
                  }}
                />
                <CardContent
                  sx={{
                    display: "grid",
                    gridTemplateColumns: "1fr auto",
                    alignItems: "center",
                    gap: 2,
                  }}
                >
                  {/* LEFT: content */}
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">
                      {it.title}
                    </Typography>

                    <Typography variant="h5" sx={{ my: 0.5 }}>
                      {it.value ?? "-"}
                    </Typography>

                    {it?.date && (
                      <Typography variant="caption" color="text.secondary">
                        Last: {it.date}
                      </Typography>
                    )}

                    {it?.link && (
                      <Box sx={{ mt: 1 }}>
                        <Chip
                          size="small"
                          icon={<LaunchIcon fontSize="small" />}
                          label="Details"
                          color="primary"
                          variant="outlined"
                          sx={{p:1.6}}
                          clickable
                          onClick={() => (window.location.href = it.link)}
                        />
                      </Box>
                    )}
                  </Box>
                </CardContent>
              </Card>
            ))}
          </Box>
        )}
      </Paper>
    </Box>
  );

  const renderSummaryGridThree = (title, items, loadingFlag, subtitle) => (
    <Box sx={{ width: "100%" , display: "flex", flexDirection: "column" , alignItems: "center", justifyContent: "center", mt: 2}}>
      <Paper
        elevation={0}
        sx={{
        
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            mb: 1,
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: "bold" }}>
            {title}
          </Typography>
        </Box>
        {/* <Divider sx={{ mb: 2 }} /> */}
        {loadingFlag ? (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              py: 4,
            }}
          >
            <CircularProgress size={24} />
          </Box>
        ) : (
          // <Box

          // >
          <>
            <Card
              sx={{
                minWidth: { sx: 300, md: 900 },
               
                borderRadius: 2,
                boxShadow: "0 0 12px rgba(0,0,0,0.12)",
            
                position: "relative",
                overflow: "hidden",
                transition: "all 0.25s ease",
                "&:hover": {
                  boxShadow: "0 0 20px rgba(0,0,0,0.18)",
                },
              }}
            >
              <div
                style={{
                  position: "absolute",
                  width: 140,
                  height: 150,
                  // borderRadius: "50%",
                  background: `url('/assets/cardImg.png') no-repeat center center`,
                  backgroundSize: "cover",
                  top: 0,
                  left: 0,
                }}
              />
              <div
                style={{
                 position:"absolute",
                 bottom:10,
                 left:10
                }}
              >
         
                
                  <Typography variant="subtitle2" sx={{ maxWidth: 180  }}>
                    {subtitle ?? "-"}
                  </Typography>
            
              </div>

              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: {
                    xs: "1fr",
                    sm: "1fr 1fr",
                    md: "repeat(3, 1fr)",
                  },
                  gap: 3,
                  marginLeft: {
                    xs: 15,
                    sm: 25,
                  },
                }}
              >
                {items.map((it, idx) => (
                  <Card
                    key={`${it.title}-${idx}`}
                    elevation={0}
                    sx={{
                     
                    
                      borderRadius: 0,
                      my: 2,
                      position: "relative",
                      overflow: "hidden",

                      borderLeft: "1px solid #d9d9d9",
                    }}
                  >
                    <CardContent
                      sx={{
                        display: "grid",
                        gridTemplateColumns: "1fr auto",
                        alignItems: "center",
                        gap: 2,
                      }}
                    >
                  
                      <Box>
                        <Typography variant="subtitle2" color="text.secondary">
                          {it.title}
                        </Typography>

                        <Typography variant="h5" sx={{ my: 0.5 }}>
                          {it.value ?? "-"}
                        </Typography>

                        {it?.date && (
                          <Typography variant="caption" color="text.secondary">
                            Last: {it.date}
                          </Typography>
                        )}

                        {it?.link && (
                          <Box sx={{ mt: 1 }}>
                            <Chip
                              size="small"
                              icon={<LaunchIcon fontSize="small" />}
                              label="Details"
                              color="primary"
                              variant="outlined"
                              clickable
                              onClick={() => (window.location.href = it.link)}
                            />
                          </Box>
                        )}
                      </Box>
                    </CardContent>
                  </Card>
                ))}
              </Box>
            </Card>
          </>
        )}
      </Paper>
    </Box>
  );
  const theme = createTheme();

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ flexGrow: 1, p: 2, minHeight: "calc(100vh - 300px)" }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
      
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: "bold" }}>
            {getGreetingTime()}, {user?.userName || ""}
          </Typography>
          <Box sx={{ minWidth: 260 }}>
            <MyDatePicker
              value={summaryDate}
              setDateRange={(v) => {
                dispatch(setSummaryDate(v));
              }}
              startingDate={true}
            />
          </Box>
        </Box>

        {renderSummaryGrid("", masterSummary, loading.master)}

        {/* Row 2: Transactions Overview and Pending Summary */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
            gap: 3,
            mb: 3,
          }}
        >
          <Box>
            <Paper
              sx={{
                p: 2,
                height: 360,
                position: "relative",
                overflow: "hidden",

                boxShadow: "0 0 12px rgba(0,0,0,0.12)",
                transition: "box-shadow 0.3s ease",
                "&:hover": {
                  boxShadow: "0 0 20px rgba(0,0,0,0.18)",
                },
              }}
            >
              <Typography variant="h6" sx={{ mb: 2, fontWeight: "bold" }}>
                Transactions Overview
              </Typography>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={transactionsChartData}>
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <ReTooltip />
                  <Legend />
                  <Bar dataKey="value" name="Count">
                    {transactionsChartData?.map((_, idx) => (
                      <Cell
                        key={`tc-${idx}`}
                        fill={CHART_COLORS[idx % CHART_COLORS.length]}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </Paper>
          </Box>
          <Box>
            <Paper
              sx={{
                p: 2,
                height: 360,
                overflow: "hidden",
                position: "relative",
                boxShadow: "0 0 12px rgba(0,0,0,0.12)",
                transition: "box-shadow 0.3s ease",
                "&:hover": {
                  boxShadow: "0 0 20px rgba(0,0,0,0.18)",
                },
              }}
            >
              <Typography variant="h6" sx={{ mb: 2, fontWeight: "bold" }}>
                Pending Summary
              </Typography>
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={pendingChartData}
                    dataKey="value"
                    nameKey="name"
                    outerRadius={110}
                  >
                    {pendingChartData.map((_, idx) => (
                      <Cell
                        key={`pc-${idx}`}
                        fill={CHART_COLORS[idx % CHART_COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <ReTooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </Paper>
          </Box>
        </Box>

        {/* Row 3: Gate Pass Overview and Top MFG Products */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
            gap: 3,
            mb: 3,
          }}
        >
          <Box>
            <Paper
              sx={{
                p: 2,
                height: 360,
                overflow: "hidden",
                position: "relative",
                boxShadow: "0 0 12px rgba(0,0,0,0.12)",
                transition: "box-shadow 0.3s ease",
                "&:hover": {
                  boxShadow: "0 0 20px rgba(0,0,0,0.18)",
                },
              }}
            >
              {" "}
              <Typography variant="h6" sx={{ mb: 2, fontWeight: "bold" }}>
                Gate Pass Overview
              </Typography>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={gatePassChartData}>
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <ReTooltip />
                  <Legend />
                  <Bar dataKey="value" name="Count">
                    {gatePassChartData.map((_, idx) => (
                      <Cell
                        key={`gp-${idx}`}
                        fill={CHART_COLORS[idx % CHART_COLORS.length]}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </Paper>
          </Box>
          <Box>
            <Paper
              sx={{
                p: 2,
                height: 360,
                overflow: "hidden",
                position: "relative",
                boxShadow: "0 0 12px rgba(0,0,0,0.12)",
                transition: "box-shadow 0.3s ease",
                "&:hover": {
                  boxShadow: "0 0 20px rgba(0,0,0,0.18)",
                },
              }}
            >
              <Typography variant="h6" sx={{ mb: 2, fontWeight: "bold" }}>
                Top MFG Products
              </Typography>
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={topMfgProducts}>
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} hide={false} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <ReTooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="qty"
                    name="Qty"
                    stroke="#6366F1"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </Paper>
          </Box>
        </Box>

        {renderSummaryGridThree("MIN Summary", minSummary, loading.min, "Summary of Material Inward")}
     
      </Box>
    </ThemeProvider>
  );
};

export default Dashboard;
