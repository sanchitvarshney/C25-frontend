import React, { useState, useEffect, useRef } from "react";
import {
  Route,
  Routes,
  useNavigate,
  useLocation,
  useSearchParams,
} from "react-router-dom";
import { Box, LinearProgress } from "@mui/material";
import Sidebar from "./new/Sidebar/Sidebar.jsx";
import Rout from "./Routes/Routes";
import { useSelector, useDispatch } from "react-redux/es/exports";
import "buffer";
import AppHeader from "./new/Header/AppHeader.jsx";
import {
  setNotifications,
  setTestPages,
  setCompanyBranch,
  setCurrentLink,
  setSession,
  setUser,
  setSettings,
} from "./Features/loginSlice/loginSlice.js";
import UserMenu from "./Components/UserMenu";
import socket from "./Components/socket.js";
import {
  setShowNotifications,
  setShowMessageNotifications,
  setShowTickets,
  setShowSetting,
  setShowSwitchModule,
} from "./Features/uiSlice/uiSlice.js";
import Layout, { Content } from "antd/lib/layout/layout";
import { Select, Modal, Button } from "antd";
import { SwapOutlined } from "@ant-design/icons";
import { Tooltip } from "@mui/material";
import InternalNav from "./Components/InternalNav";
import { imsAxios } from "./axiosInterceptor";
import internalLinks from "./Pages/internalLinks.jsx";
import TicketsModal from "./Components/TicketsModal/TicketsModal";
import SettingDrawer from "./Components/SettingDrawer.jsx";
import { logoutUser } from "./Features/loginSlice/logoutSlice.js";
import { useToast } from "./hooks/useToast.js";
import AlwarFooter from "./Components/footer/AlwarFooter.jsx";
import {
  buildMergedSessionSelectOptions,
  getCurrentIndianFinancialYearSession,
  LEGACY_SESSION_CODES,
} from "./utils/indianFinancialYear.js";
import {
  getSafeInternalRedirect,
  POST_LOGIN_REDIRECT_STORAGE_KEY,
} from "./utils/postLoginRedirect.js";
import ModuleSearch from "./Components/ModuleSearch/ModuleSearch.jsx";

const App = () => {
  const { showToast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const tokenFromUrl = searchParams.get("token");
  const sessionFromUrl = searchParams.get("session");
  const branchFromUrl = searchParams.get("branch");
  const comFromUrl = searchParams.get("company");
  const type = searchParams.get("type");
  const { user, testPages } = useSelector((state) => state.login);

  const { notifications } = useSelector((state) => state.login);

  const {
    showNotifications,
    showMessageNotifications,
    showTickets,
    showSetting,
    showSwitchModule,
  } = useSelector((state) => state.ui);

  const filteredRoutes = Rout.filter((route) => {
    return !route.dept || user?.showlegal;
  });

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [showSideBar, setShowSideBar] = useState(false);
  const isSwitchFlow = Boolean(
    tokenFromUrl && sessionFromUrl && comFromUrl && branchFromUrl && type,
  );
  const [loadingSwitch, setLoadingSwitch] = useState(isSwitchFlow);
  const [newNotification, setNewNotification] = useState(null);
  const { pathname, search, hash } = useLocation();

  const authPublicPaths = React.useMemo(
    () =>
      new Set([
        "/login",
        "/signup",
        "/login/otp",
        "/ims/login",
        "/first-login",
      ]),
    [],
  );
  const isAuthPublicPath = (p) => authPublicPaths.has(p);
  const isAuthShellPath =
    pathname === "/login" ||
    pathname === "/signup" ||
    pathname === "/login/otp";

  const [testPage, setTestPage] = useState(false);
  const [branchSelected, setBranchSelected] = useState(true);
  const notificationsRef = useRef();
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSwitchingModule, setIsSwitchingModule] = useState(false);
  const [switchLocation, setSwitchLocation] = useState(null);
  const [switchBranch, setSwitchBranch] = useState(null);
  const [switchSession, setSwitchSession] = useState(null);
  const [switchSuccess, setSwitchSuccess] = useState(false);
  const logoutHandler = () => {
    dispatch(logoutUser());
  };

  const handleSelectCompanyBranch = (value) => {
    dispatch(setCompanyBranch(value));
    setBranchSelected(true);
    socket.emit("getBranch", value);
  };
  const handleSelectSession = (value) => {
    dispatch(setSession(value));
  };

  // notifications receive handlers
  useEffect(() => {
    const handleConnect = () => {
      setIsConnected(true);
      setIsLoading(false);
    };

    const handleConnectError = (error) => {
      console.error("Connection error:", error);
      setIsConnected(false);
      setIsLoading(false);
    };

    const handleDisconnect = () => {
      setIsConnected(false);
      setIsLoading(false);
    };

    socket.on("connect", handleConnect);
    socket.on("connect_error", handleConnectError);
    socket.on("disconnect", handleDisconnect);

    return () => {
      socket.off("connect", handleConnect);
      socket.off("connect_error", handleConnectError);
      socket.off("disconnect", handleDisconnect);
    };
  }, []);

  const fetchUserDeatils = async (token, session, com, branch, type) => {
    setLoadingSwitch(true);
    localStorage.setItem("switchInProgress", "1");

    try {
      const response = await imsAxios.get(
        `/auth/switch?next=alwar.mscorpres.com&company=${com}&token=${token}&session=${session}&branch=${branch}&type=${type}`,
      );

      if (response?.success) {
        const payload = response?.data;
        const obj = {
          email: payload.crn_email,
          phone: payload.crn_mobile,
          comId: payload.company_id,
          userName: payload.username,
          token: payload.token,
          favPages: payload.fav_pages ? JSON.parse(payload.fav_pages) : [],
          type: payload.crn_type,
          mobileConfirmed: payload.other?.m_v,
          emailConfirmed: payload.other?.e_v,
          passwordChanged: payload.other?.c_p ?? "C",
          company_branch: branch, // Use selected branch from login form
          currentLink: JSON.parse(localStorage.getItem("branchData"))
            ?.currentLink,
          id: payload.crn_id,
          showlegal: payload.department === "legal" ? true : false,
          session: session,
        };
        localStorage.setItem("loggedInUser", JSON.stringify(obj));
        dispatch(setUser(obj));
        if (payload.settings) dispatch(setSettings(payload.settings));
        setSearchParams({}, { replace: true });
      } else {
        showToast(response?.message, "error");
        window.location.replace("https://oakter.mscorpres.com/");
      }
    } catch (error) {
      showToast(error?.message, "error");
      window.location.replace("https://oakter.mscorpres.com/");
    } finally {
      localStorage.removeItem("switchInProgress");
      setLoadingSwitch(false);
    }
  };

  useEffect(() => {
    if (tokenFromUrl && sessionFromUrl && comFromUrl && branchFromUrl && type) {
      fetchUserDeatils(
        tokenFromUrl,
        sessionFromUrl,
        comFromUrl,
        branchFromUrl,
        type,
      );
    }
  }, [tokenFromUrl, sessionFromUrl, comFromUrl, branchFromUrl, type]);

  useEffect(() => {
    if (Notification.permission == "default") {
      Notification.requestPermission();
    }
    document.addEventListener("keyup", (e) => {
      if (e.key === "Escape") {
        setShowSideBar(false);
      }
    });
    if (!user && !isAuthPublicPath(pathname)) {
      const returnTo = `${pathname}${search}${hash}`;
      navigate(`/login?redirect=${encodeURIComponent(returnTo)}`, {
        replace: true,
      });
    }
    if (user) {
      if (user.company_branch) {
        setBranchSelected(true);
      }
    }
    if (user) {
      if (user.company_branch) {
        setBranchSelected(true);
      }
      socket.emit("fetch_notifications", {
        source: "react",
      });
    }

    if (user && user.token) {
      // getting all notifications
      socket.on("all-notifications", (data) => {
        let source = Array.isArray(data)
          ? data
          : Array.isArray(data?.data)
            ? data.data
            : [];

        if (!Array.isArray(source) || source.length === 0) {
          return;
        }

        const arr = source.map((row) => ({
          ...row,
          type: row.msg_type,
          title: row.request_txt_label,
          details: row.req_date,
          file: JSON.parse(row.other_data).fileUrl,
          message: JSON.parse(row.other_data)?.message,
        }));

        dispatch(setNotifications(arr));
      });
      socket.emit("fetch_notifications", {
        source: "react",
      });
      // getting new notification
      socket.on("socket_receive_notification", (data) => {
        if (data.type == "message") {
          let arr = notificationsRef.current.filter(
            (not) => not.conversationId != data.conversationId,
          );
          arr = [data, ...arr];
          if (arr) {
            dispatch(setNotifications(arr));
          }
          setNewNotification(data);
        } else if (data[0].msg_type == "file" || data[0].msg_type == "msg") {
          data = data[0];
          let arr = notificationsRef.current;
          arr = arr.map((not) => {
            if (not.notificationId == data.notificationId) {
              return {
                ...data,
                type: data.msg_type,
                title: data.request_txt_label,
                details: data.req_date,
                file: JSON.parse(data.other_data).fileUrl,
                message: JSON.parse(data.other_data)?.message,
              };
            } else {
              return not;
            }
          });
          if (arr) {
            dispatch(setNotifications(arr));
          }
          setNewNotification(data);
        }
      });

      // event for starting detail
      socket.on("download_start_detail", (data) => {
        showToast("Your report has been started generating");
        if (data.title || data.details) {
          let arr = notificationsRef.current;
          arr = [data, ...arr];
          dispatch(setNotifications(arr));
        }
      });

      socket.on("getPageStatus", (data) => {
        let pages;
        if (testPages) {
          pages = testPages;
        } else {
          pages = [];
        }

        let arr = [];
        for (const property in data) {
          if (property.includes("/")) {
            if (data[property] == "TEST") {
              let obj = {
                url: property,
                status: data[property],
              };
              arr = [obj, ...arr];
            }
            if (data[property] == "LIVE" && property.includes("/")) {
              pages = pages.filter((page) => page.url == property);
            }
          }
        }
        dispatch(setTestPages(arr));
        let pageIsTest;
        if (arr.filter((page) => page.url == pathname)[0]) {
          pageIsTest = true;
        } else {
          pageIsTest = false;
        }

        setTestPage(pageIsTest);
      });
      socket.on("file-generate-error", (data) => {
        showToast(data?.message, "error");
        let arr = notificationsRef.current;
        if (arr.filter((row) => row.notificationId == data.notificationId)[0]) {
          arr = arr.map((row) => {
            if (row.notificationId == data.notificationId) {
              let obj = row;
              obj = {
                ...row,
                error: true,
              };
              return obj;
            } else {
              return row;
            }
          });
        } else {
          arr = [data, ...arr];
        }
        dispatch(setNotifications(arr));
      });
      socket.on("getting-loading-percentage", (data) => {
        let arr = notificationsRef.current;
        if (arr.filter((row) => row.notificationId == data.notificationId)[0]) {
          arr = arr.map((row) => {
            if (row.notificationId == data.notificationId) {
              let obj = row;
              obj = {
                ...row,
                total: data.total,
              };
              return obj;
            } else {
              return row;
            }
          });
        } else {
          arr = [data, ...arr];
        }
        dispatch(setNotifications(arr));
      });
    }
  }, []);
  useEffect(() => {
    if (!user && !isAuthPublicPath(pathname)) {
      const returnTo = `${pathname}${search}${hash}`;
      navigate(`/login?redirect=${encodeURIComponent(returnTo)}`, {
        replace: true,
      });
    } else if (user) {
      let branch = JSON.parse(
        localStorage.getItem("branchData"),
      )?.company_branch;
      if (branch) {
        setBranchSelected(true);
      }
      // handleSelectSession("23-24");
    }
  }, [user, pathname, search, hash]);

  useEffect(() => {
    if (!isAuthShellPath || !user) return;
    const redirectParam = searchParams.get("redirect");
    const safeRedirect = getSafeInternalRedirect(redirectParam);
    const link = JSON.parse(
      localStorage.getItem("branchData") || "{}",
    )?.currentLink;
    if (user.passwordChanged === "P") {
      if (safeRedirect) {
        sessionStorage.setItem(POST_LOGIN_REDIRECT_STORAGE_KEY, safeRedirect);
      }
      navigate("/first-login", { replace: true });
    } else {
      navigate(safeRedirect ?? link ?? "/", { replace: true });
    }
  }, [user, pathname, isAuthShellPath, navigate, searchParams]);

  useEffect(() => {
    if (user && user.token) {
      const tokenToUse = localStorage.getItem("newToken") || user.token;
      imsAxios.defaults.headers["Authorization"] = `${tokenToUse}`;

      imsAxios.defaults.headers["Company-Branch"] =
        user.company_branch || "BRALWR36";
      imsAxios.defaults.headers["Session"] =
        user.session || getCurrentIndianFinancialYearSession();
      socket.emit("fetch_notifications", {
        source: "react",
      });
      // getting new notification
      socket.on("socket_receive_notification", (data) => {
        if (data.type == "message") {
          let arr = notificationsRef.current.filter(
            (not) => not.conversationId != data.conversationId,
          );
          arr = [data, ...arr];
          if (arr) {
            dispatch(setNotifications(arr));
          }
          setNewNotification(data);
        } else if (data[0].msg_type == "file") {
          data = data[0];
          let arr = notificationsRef.current;
          arr = arr.map((not) => {
            if (not.notificationId == data.notificationId) {
              return {
                ...data,
                type: data.msg_type,
                title: data.request_txt_label,
                details: data.status,
                file: JSON.parse(data.other_data).fileUrl,
              };
            } else {
              return not;
            }
          });
          if (arr) {
            dispatch(setNotifications(arr));
          }
          setNewNotification(data);
        }
      });
      // getting all notifications
      socket.on("all-notifications", (data) => {
        let arr = data.data;
        arr = arr.map((row) => {
          return {
            ...row,
            type: row.msg_type,
            title: row.request_txt_label,
            details: row.req_date,
            file: JSON.parse(row.other_data).fileUrl,
          };
        });
        dispatch(setNotifications(arr));
      });
      // event for starting detail
      socket.on("download_start_detail", (data) => {
        if (data.title && data.details) {
          let arr = notificationsRef.current;
          arr = [data, ...arr];
          dispatch(setNotifications(arr));
        }
      });

      socket.on("getPageStatus", (data) => {
        let pages;
        if (testPages) {
          pages = testPages;
        } else {
          pages = [];
        }

        let arr = [];
        for (const property in data) {
          if (property.includes("/")) {
            if (data[property] == "TEST") {
              let obj = {
                url: property,
                status: data[property],
              };
              arr = [obj, ...arr];
            }
            if (data[property] == "LIVE" && property.includes("/")) {
              pages = pages.filter((page) => page.url == property);
            }
          }
        }
        dispatch(setTestPages(arr));
        let pageIsTest;
        if (arr.filter((page) => page.url == pathname)[0]) {
          pageIsTest = true;
        } else {
          pageIsTest = false;
        }

        setTestPage(pageIsTest);
      });
      socket.on("file-generate-error", (data) => {
        showToast(data?.message, "error");
        let arr = notificationsRef.current;
        if (arr.filter((row) => row.notificationId == data.notificationId)[0]) {
          arr = arr.map((row) => {
            if (row.notificationId == data.notificationId) {
              let obj = row;
              obj = {
                ...row,
                error: true,
              };
              return obj;
            } else {
              return row;
            }
          });
        } else {
          arr = [data, ...arr];
        }
        dispatch(setNotifications(arr));
      });
    }
  }, [user?.token]);

  useEffect(() => {
    setShowSideBar(false);
    setShowMessageNotifications(false);
    setShowNotifications(false);
    let currentLink = pathname;
    if (user) {
      if (pathname !== "login") {
        dispatch(setCurrentLink(currentLink));
        if (user.passwordChanged === "P") {
          navigate("/first-login");
        }
      }
    }
  }, []);
  useEffect(() => {
    notificationsRef.current = notifications;
  }, [notifications]);
  useEffect(() => {
    if (newNotification?.type) {
      if (Notification.permission == "default") {
        Notification.requestPermission(function (permission) {
          if (permission === "default") {
            let notification = new Notification(newNotification.title, {
              body: newNotification.message,
            });
            notification.onclick = () => {
              notification.close();
              window.parent.focus();
            };
          }
        });
      } else {
        let notification = new Notification(newNotification?.title, {
          body: newNotification?.message,
        });
        notification.onclick = () => {
          notification.close();
          window.parent.focus();
        };
      }
    }
  }, [newNotification]);
  useEffect(() => {
    if (showMessageNotifications) {
      {
        dispatch(setShowNotifications(false));
      }
    }
  }, [showMessageNotifications, dispatch]);

  useEffect(() => {
    if (showNotifications) {
      {
        dispatch(setShowMessageNotifications(false));
      }
    }
  }, [showNotifications, dispatch]);

  useEffect(() => {
    if (testPages) {
      let match = testPages?.filter((page) => page.url == pathname)[0];
      if (match) {
        setTestPage(true);
      } else {
        setTestPage(false);
      }
    }
  }, [navigate, user]);

  const getOffsetLeft = () => {
    // if (isTestServer && isBannerVisible) {
    //   return 92;
    // } else if (isTestServer) {
    //   return 60;
    // } else if (isBannerVisible) {
    //   return 70;
    // } else {
    if (isTestServer) return 60;
    return 40;
    // }
  };

  const options = [{ label: " C25", value: " C25" }];
  const sessionOptions = buildMergedSessionSelectOptions(LEGACY_SESSION_CODES);

  const locationBranchOptions = {
    alwar: [{ label: "B36 [ALWAR]", value: "BRALWR36" }],
    noida: [
      { label: "A-21 [BRMSC012]", value: "BRMSC012" },
      { label: "B-29 [BRMSC029]", value: "BRMSC029" },
      { label: "D-160 [BRBAD116]", value: "BRBAD116" },
    ],
  };

  const handleSwitchModule = async (location, branch, session) => {
    const existing = JSON.parse(localStorage.getItem("loggedInUser")) || {};
    const previousToken = existing?.token;

    const company = location.toLowerCase() === "alwar" ? "COM0002" : "COM0001";
    if (company === existing?.comId) {
      showToast(`You are already On ${location} Module`, "error");
      return;
    }

    const targetUrl = import.meta.env.VITE_REACT_APP_SWITCH_URL;

    const urlParams = new URLSearchParams();
    if (previousToken && location && branch && session) {
      urlParams.append("token", previousToken);
      urlParams.append("company", company);
      urlParams.append("branch", branch);
      urlParams.append("session", session);
      urlParams.append("type", "switch");
    }

    const redirectUrl = `${targetUrl}?${urlParams.toString()}`;
    window.location.replace(redirectUrl);
  };

  const path = window.location.hostname;
  const isTestServer =
    path.includes("dev.mscorpres") || path.includes("localhost");

  const refreshConnection = () => {
    setIsLoading(true);
    socket.close();
    socket.open();
  };

  if (loadingSwitch) {
    return (
      <Box sx={{ width: "100%", overflow: "hidden" }}>
        <LinearProgress
          sx={{
            position: "sticky",
            top: 0,
          }}
        />
        <Box
          sx={{
            width: "100%",
            height: "100vh",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <img
            src="/assets/images/mscorpres_auto_logo.png"
            alt=""
            style={{ width: 100, opacity: 0.8 }}
          />
        </Box>
      </Box>
    );
  }

  return (
    <div
      style={{
        height: "100vh",
        backgroundColor: isAuthShellPath ? "#fcf9f7" : "white",
      }}
    >
      <Layout
        style={{
          width: "100%",
          top: 0,
          paddingTop: "0px",
        }}
      >
        {/* header start */}

        {isTestServer && (
          <div
            style={{
              backgroundColor: "yellow",
              height: "15px",
              lineHeight: 1,
              textAlign: "center",
            }}
          >
            TEST SERVER
          </div>
        )}
        {/* {showBlackScreen && (
          <TopBanner
            messages={[
              "Welcome to IMS Alwar.",
              "System maintenance scheduled for 7th December Sunday 01 AM - 23 PM",
            ]}
            onVisibilityChange={setIsBannerVisible}
          />
        )} */}
        {/* <Information /> */}
        {user && user.passwordChanged !== "P" && (
          <Layout style={{ height: "100%" }}>
            <AppHeader
              onToggleSidebar={() => setShowSideBar((open) => !open)}
              // logo={<Logo />}
              title="IMS"
              branchOptions={options}
              sessionOptions={sessionOptions}
              branchValue={user.company_branch}
              sessionValue={user.session}
              onChangeBranch={(value) => handleSelectCompanyBranch(value)}
              onChangeSession={(value) => handleSelectSession(value)}
              showSearch
              searchComponent={<ModuleSearch />}
              socketConnected={isConnected}
              socketLoading={isLoading}
              onRefreshSocket={() => refreshConnection()}
              onClickMessages={() => dispatch(setShowTickets(true))}
              switchModule={
                <Tooltip title="Switch Module" placement="bottom">
                  <SwapOutlined
                    style={{
                      fontSize: 18,
                      color: "white",
                      cursor: "pointer",
                    }}
                    onClick={() => dispatch(setShowSwitchModule(true))}
                  />
                </Tooltip>
              }
              userMenu={
                <UserMenu
                  user={user}
                  logoutHandler={logoutHandler}
                  setShowSettings={(value) => dispatch(setShowSetting(value))}
                />
              }
              extraRight={
                showSetting ? (
                  <SettingDrawer
                    open={showSetting}
                    hide={() => dispatch(setShowSetting(false))}
                  />
                ) : null
              }
            />
          </Layout>
        )}
        {/* header ends */}
        {/* sidebar starts */}
        <Layout
          style={{
            height: "100%",
            opacity: user && !branchSelected ? 0.5 : 1,
            pointerEvents: user && !branchSelected ? "none" : "all",
          }}
        >
          <div
            style={{
              display: "flex",
              height: "100%",
              paddingTop: user && user.passwordChanged !== "P" ? 45 : 0,
            }}
          >
            <TicketsModal
              open={showTickets}
              handleClose={() => dispatch(setShowTickets(false))}
            />
            {user && user.passwordChanged !== "P" && (
              <>
                <Sidebar
                  className="site-layout-background"
                  key={1}
                  setShowSideBar={setShowSideBar}
                  showSideBar={showSideBar}
                  useJsonConfig={true}
                  topOffset={getOffsetLeft()}
                  onWidthChange={(w) => {
                    const layout = document.querySelector(
                      "#app-content-left-margin",
                    );
                    if (layout) layout.style.marginLeft = `${w}px`;
                  }}
                />
              </>
            )}
            {/* sidebar ends */}
            <Layout
              id="app-content-left-margin"
              style={{
                height: "100%",

                marginLeft:
                  user && user.passwordChanged !== "P"
                    ? showSideBar
                      ? 230
                      : 60
                    : 0,

                minWidth: 0,
              }}
            >
              <Content style={{ height: "100%" }}>
                <InternalNav links={internalLinks} />

                <div
                  style={{
                    height: (() => {
                      const headerHeight = isAuthShellPath ? 10 : 50;
                      const bannerHeight = 0;
                      const testServerHeight = isTestServer ? 15 : 0;
                      const byDefaultHeight =
                        pathname === "/auth/profile" || isAuthShellPath
                          ? 1
                          : 50;
                      return `calc(100vh - ${headerHeight}px - ${bannerHeight}px - ${testServerHeight}px - ${byDefaultHeight}px)  `;
                    })(),
                    width: "100%",
                    opacity: testPage ? 0.5 : 1,
                    pointerEvents:
                      testPage && user?.type != "developer" ? "none" : "all",

                    overflowX: "hidden",
                  }}
                >
                  <Routes>
                    {filteredRoutes.map((route, index) => (
                      <Route
                        key={index}
                        path={route.path}
                        element={<route.main />}
                      />
                    ))}
                  </Routes>
                  {pathname === "/" && <AlwarFooter />}
                </div>
              </Content>
            </Layout>
          </div>
        </Layout>
      </Layout>

      <Modal
        title={null}
        open={showSwitchModule}
        onCancel={() => {
          if (!isSwitchingModule) {
            dispatch(setShowSwitchModule(false));
            setSwitchLocation(null);
            setSwitchBranch(null);
            setSwitchSession(null);
            setIsSwitchingModule(false);
            setSwitchSuccess(false);
          }
        }}
        footer={null}
        width={400}
        centered
        maskClosable={!isSwitchingModule}
        closable={!isSwitchingModule}
      >
        {isSwitchingModule ? (
          <div
            style={{
              padding: "60px 0",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {switchSuccess ? (
              <>
                <video
                  src="/assets/check.mp4"
                  autoPlay
                  muted
                  style={{ width: 120, height: 120 }}
                />
                <p
                  style={{
                    marginTop: 16,
                    color: "#047780",
                    fontWeight: 500,
                  }}
                >
                  Authenticated! Redirecting...
                </p>
              </>
            ) : (
              <>
                <div
                  style={{
                    width: 50,
                    height: 50,
                    border: "4px solid #f3f3f3",
                    borderTop: "4px solid #047780",
                    borderRadius: "50%",
                    animation: "spin 1s linear infinite",
                  }}
                />
                <style>
                  {`
                                @keyframes spin {
                                  0% { transform: rotate(0deg); }
                                  100% { transform: rotate(360deg); }
                                }
                              `}
                </style>
                <p style={{ marginTop: 16, color: "#666" }}>
                  Authenticating...
                </p>
              </>
            )}
          </div>
        ) : (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              padding: "20px 0",
            }}
          >
            <div
              style={{
                width: 60,
                height: 60,
                borderRadius: "50%",
                background: "#f5f5f5",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 16,
              }}
            >
              <SwapOutlined style={{ fontSize: 28, color: "#047780" }} />
            </div>
            <h3 style={{ margin: "0 0 24px 0", color: "#333" }}>
              Switch Module
            </h3>
            <div style={{ width: "100%", maxWidth: 300 }}>
              <div style={{ marginBottom: 16 }}>
                <div
                  style={{
                    marginBottom: 6,
                    fontWeight: 500,
                    color: "#666",
                  }}
                >
                  Location
                </div>
                <Select
                  style={{ width: "100%" }}
                  placeholder="Select Location"
                  options={[
                    { label: "Alwar", value: "alwar" },
                    { label: "Noida", value: "noida" },
                  ]}
                  value={switchLocation}
                  onChange={(value) => {
                    setSwitchLocation(value);
                    setSwitchBranch(null);
                  }}
                />
              </div>
              <div style={{ marginBottom: 16 }}>
                <div
                  style={{
                    marginBottom: 6,
                    fontWeight: 500,
                    color: "#666",
                  }}
                >
                  Branch
                </div>
                <Select
                  style={{ width: "100%" }}
                  placeholder="Select Branch"
                  disabled={!switchLocation}
                  options={
                    switchLocation ? locationBranchOptions[switchLocation] : []
                  }
                  value={switchBranch}
                  onChange={(value) => setSwitchBranch(value)}
                />
              </div>
              <div style={{ marginBottom: 24 }}>
                <div
                  style={{
                    marginBottom: 6,
                    fontWeight: 500,
                    color: "#666",
                  }}
                >
                  Session
                </div>
                <Select
                  style={{ width: "100%" }}
                  placeholder="Select Session"
                  options={sessionOptions}
                  value={switchSession || user?.session}
                  onChange={(value) => setSwitchSession(value)}
                />
              </div>
              <Button
                type="primary"
                block
                size="large"
                style={{
                  background: "#047780",
                  borderColor: "#047780",
                  height: 44,
                }}
                disabled={!switchLocation || !switchBranch}
                onClick={() => {
                  handleSwitchModule(
                    switchLocation.charAt(0).toUpperCase() +
                      switchLocation.slice(1),
                    switchBranch,
                    switchSession || user?.session,
                  );
                }}
              >
                Switch
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default App;
