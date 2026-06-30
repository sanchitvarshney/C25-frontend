import { useEffect, useState } from "react";
import { List, Empty, Progress, Typography, Skeleton } from "antd";
import { ConfigProvider } from "antd";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { CommonIcons } from "../TableActions.jsx/TableActions";
import { getSocketLink } from "../../axiosInterceptor";
import { Delete, Refresh } from "@mui/icons-material";
import ConfirmationNotifyModal from "./ConfirmationNotifyModal";
import { setNotifications } from "../../Features/loginSlice/loginSlice.js";
import { deleteAllNotifications } from "../../api/notifications.js";
import socket from "../socket.js";
import { useToast } from "../../hooks/useToast.js";

const NotificationDropdown = ({ open, onClose, notifications, anchorRef }) => {
  const dispatch = useDispatch();
  const { showToast } = useToast();
  const allNotifications = useSelector((state) => state.login.notifications);
  const [position, setPosition] = useState({ top: 0, right: 0 });
  const [isPositioned, setIsPositioned] = useState(false);
  const [isConfirmModal, setIsConfirmModal] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [refreshLoading, setRefreshLoading] = useState(false);
  const [listLoading, setListLoading] = useState(false);
  const [pendingSocketRefresh, setPendingSocketRefresh] = useState(false);

  useEffect(() => {
    if (open && anchorRef?.current) {
      const calculatePosition = () => {
        if (!anchorRef?.current) return;

        const rect = anchorRef.current.getBoundingClientRect();
        const dropdownWidth = 420;
        const viewportWidth = window.innerWidth;
        const rightEdge = viewportWidth - rect.right;
        let right = rightEdge;
        if (right + dropdownWidth > viewportWidth - 12) {
          right = viewportWidth - dropdownWidth - 12;
        }
        right = Math.max(12, right);
        setPosition({
          top: rect.bottom + 8,
          right: right,
        });
        setIsPositioned(true);
      };
      requestAnimationFrame(() => {
        calculatePosition();
      });

      const updatePosition = () => {
        calculatePosition();
      };

      window.addEventListener("resize", updatePosition);
      window.addEventListener("scroll", updatePosition, true);

      return () => {
        window.removeEventListener("resize", updatePosition);
        window.removeEventListener("scroll", updatePosition, true);
      };
    } else {
      setIsPositioned(false);
    }
  }, [open, anchorRef]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        open &&
        anchorRef?.current &&
        !anchorRef.current.contains(event.target) &&
        !event.target.closest(".notification-dropdown")
      ) {
        onClose();
      }
    };

    if (open) {
      const timeoutId = setTimeout(() => {
        document.addEventListener("mousedown", handleClickOutside);
      }, 100);

      return () => {
        clearTimeout(timeoutId);
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }
  }, [open, anchorRef, onClose]);

  const handleDeleteAllNotifications = async () => {
    try {
      setDeleteLoading(true);
      const res = await deleteAllNotifications();
      if (res?.success === false) {
        showToast(res?.message || "Could not delete notifications", "error");
        return;
      }
      dispatch(
        setNotifications(
          allNotifications.filter((n) => n?.type === "message"),
        ),
      );
      setPendingSocketRefresh(true);
      setListLoading(true);
      socket.emit("fetch_notifications", { source: "react" });
      showToast("Notifications deleted", "success");
      setIsConfirmModal(false);
    } catch (e) {
      const msg =
        e?.message || e?.data?.message || "Could not delete notifications";
      showToast(msg, "error");
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleRefreshNotification = (silent = false) => {
    if (!silent) setRefreshLoading(true);
    setListLoading(true);
    setPendingSocketRefresh(true);
    socket.emit("fetch_notifications", { source: "react" });
  };

  const openNotificationFile = (filePath) => {
    if (!filePath) return;
    const fileUrl =
      getSocketLink().split(":")[1] + "/" + filePath.substring(2);
    window.open(
      fileUrl,
      "Oakter",
      "width=250,height=250,status=0,scrollbars=0,location=0,resizable=no",
    );
  };

  useEffect(() => {
    if (open) {
      handleRefreshNotification(true);
    }
  }, [open]);

  useEffect(() => {
    if (!pendingSocketRefresh) return;
    setPendingSocketRefresh(false);
    setRefreshLoading(false);
    setListLoading(false);
  }, [notifications, pendingSocketRefresh]);

  if (!open) return null;

  const EmptyList = () => (
    <div
      style={{
        maxHeight: "calc(100vh - 460px)",
        minHeight: "calc(100vh - 460px)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Empty
        image="https://gw.alipayobjects.com/zos/antfincdn/ZHrcdLPrvN/empty.svg"
        styles={{ image: { height: 80 } }}
        description={<span>No Notifications</span>}
      />
    </div>
  );

  return (
    <>
      <style>{`@keyframes rotate-refresh { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      {/* Arrow indicator - positioned relative to button */}
      {anchorRef?.current && isPositioned && (
        <div
          style={{
            position: "fixed",
            top: `${position.top - 6}px`,
            right: anchorRef.current
              ? `${
                  window.innerWidth -
                  anchorRef.current.getBoundingClientRect().right -
                  -6
                }px`
              : `${position.right + 20}px`,
            width: 0,
            height: 0,
            borderLeft: "8px solid transparent",
            borderRight: "8px solid transparent",
            borderBottom: "8px solid #f5f5f5",
            zIndex: 10001,
            filter: "drop-shadow(0 -2px 4px rgba(0, 0, 0, 0.1))",
            opacity: isPositioned ? 1 : 0,
            transition: "opacity 0.2s ease-out",
          }}
        />
      )}
      <div
        className="notification-dropdown"
        style={{
          position: "fixed",
          top: `${position.top}px`,
          right: `${position.right}px`,
          width: "420px",
          maxHeight: "calc(100vh - 100px)",
          backgroundColor: "#f5f5f5",
          borderRadius: "2px",
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
          border: "1px solid rgba(0, 0, 0, 0.08)",
          zIndex: 10000,
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          marginTop: 2,
          opacity: isPositioned ? 1 : 0,
          transform: isPositioned ? "translateY(0)" : "translateY(-10px)",
          transition: "opacity 0.2s ease-out, transform 0.2s ease-out",
          pointerEvents: isPositioned ? "auto" : "none",
        }}
      >
        <div
          style={{
            padding: "12px 16px",
            // borderBottom: "1px solid #f0f0f0",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Typography.Text
            style={{
              fontSize: "16px",
              fontWeight: "600",
              margin: 0,
              color: "#000",
            }}
          >
            Notifications
            {notifications.length > 0 && (
              <span
                style={{
                  marginLeft: "8px",
                  fontSize: "14px",
                  fontWeight: "normal",
                  color: "#000",
                }}
              >
                ({notifications.length})
              </span>
            )}
          </Typography.Text>
          <div
            className="flex justify-end items-center"
            style={{ gap: 12, cursor: "pointer" }}
          >
            <ConfirmationNotifyModal
              setOpen={setIsConfirmModal}
              open={isConfirmModal}
              onConfirm={handleDeleteAllNotifications}
              confirmLoading={deleteLoading}
            >
              <span
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") e.currentTarget.click();
                }}
                style={{ display: "inline-flex", alignItems: "center" }}
              >
                <Delete fontSize="small" color="error"  />
              </span>
            </ConfirmationNotifyModal>
            <span onClick={handleRefreshNotification}>
              <Refresh
                fontSize="small"
                style={{
                  animation: refreshLoading
                    ? "rotate-refresh 0.9s linear infinite"
                    : "none",
                  opacity: refreshLoading ? 0.7 : 1,
                }}
              />
            </span>
          </div>
        </div>
        <div
          style={{
            overflowY: "auto",
            maxHeight: "calc(100vh - 360px)",
            minHeight: "calc(100vh - 360px)",
            backgroundColor: "#fff",
            margin: "0px  12px 12px 12px",
          }}
        >
          <ConfigProvider renderEmpty={EmptyList}>
            {listLoading ? (
              <div style={{ padding: "16px" }}>
                <Skeleton active title={{ width: "70%" }} paragraph={{ rows: 2 }} />
                <Skeleton active title={{ width: "60%" }} paragraph={{ rows: 2 }} />
                <Skeleton active title={{ width: "65%" }} paragraph={{ rows: 2 }} />
              </div>
            ) : (
            <List
              bordered={false}
              dataSource={notifications}
              renderItem={(item) => (
                <List.Item
                  style={{
                    padding: "12px 16px",
                    borderBottom: "1px solid #f0f0f0",
                  }}
                  actions={[
                    <span key="action">
                      {item.type == "file" &&
                        (item.loading ||
                        (item.status == "pending" && item.total) ? (
                          <Progress
                            width={32}
                            type="circle"
                            percent={item.total}
                          />
                        ) : (
                          <button
                            type="button"
                            onClick={() => openNotificationFile(item.file)}
                            style={{
                              border: "none",
                              background: "transparent",
                              padding: 0,
                              cursor: "pointer",
                            }}
                          >
                            <CommonIcons
                              loading={item.loading || item.status == "pending"}
                              action="downloadButton"
                              size="small"
                            />
                          </button>
                        ))}
                      {item.type == "msg" && (
                        <span>{JSON.parse(item?.other_data)?.message}</span>
                      )}
                    </span>,
                  ]}
                >
                  {item.type == "message" ? (
                    <Link
                      style={{
                        flexDirection: "column",
                        alignItems: "flex-start",
                        display: "flex",
                      }}
                      to="/messenger"
                      onClick={onClose}
                    >
                      {!item.loading && (
                        <Typography.Text
                          style={{
                            margin: 0,
                            fontSize: "0.8rem",
                            fontWeight: "500",
                          }}
                        >
                          From: {item.title}
                        </Typography.Text>
                      )}
                      {!item.loading && (
                        <Typography.Text
                          style={{
                            margin: 0,
                            fontSize: "0.7rem",
                            marginTop: "4px",
                          }}
                        >
                          {item.message}
                        </Typography.Text>
                      )}
                    </Link>
                  ) : (
                    <div
                      style={{
                        flexDirection: "column",
                        alignItems: "flex-start",
                        display: "flex",
                      }}
                    >
                      <Typography.Text
                        style={{
                          margin: 0,
                          fontSize: "0.8rem",
                          fontWeight: "500",
                        }}
                      >
                        {item.title}
                      </Typography.Text>
                      <Typography.Text
                        style={{
                          margin: 0,
                          fontSize: "0.7rem",
                          marginTop: "4px",
                        }}
                      >
                        {item.details}
                      </Typography.Text>
                    </div>
                  )}
                </List.Item>
              )}
            />
            )}
          </ConfigProvider>
        </div>
      </div>
    </>
  );
};

export default NotificationDropdown;
