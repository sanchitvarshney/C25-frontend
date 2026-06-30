import { useEffect, useState } from "react";
import { useToast } from "../../hooks/useToast.js";
import errorToast from "../../Components/errorToast";
import {
  Avatar,
  Button,
  Form,
  Input,
  Modal,
  Skeleton,
  Typography,
} from "antd";
import validateResponse from "../../Components/validateResponse";
import {
  ExclamationCircleOutlined,
  CheckCircleOutlined,
  UserOutlined,
  SafetyOutlined,
  EditOutlined,
  RightOutlined,
} from "@ant-design/icons";
import { useDispatch, useSelector } from "react-redux";
import OtpVerify from "./OtpVerify";
import { imsAxios } from "../../axiosInterceptor";
import { setUser } from "../../Features/loginSlice/loginSlice";
import { capitalizeWords } from "../../utils/capitallizeWords.js";

export default function Profile() {
  const { showToast } = useToast();
  document.title = "Profile";
  const [userDetails, setUserDetails] = useState();
  const [activeTab, setActiveTab] = useState("1");
  const [skeletonLoading, setSkeletonLoading] = useState(false);
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);
  const [showOTPVerifyModal, setShowOTPVerifyModal] = useState(false);
  const { user } = useSelector((state) => state.login);
  const dispatch = useDispatch();

  const getUserDetails = async () => {
    setSkeletonLoading(true);
    const response = await imsAxios.get("/profile/userDetails");
    setSkeletonLoading(false);
    if (response.success) {
      setUserDetails(response.data);
    } else {
      showToast(response.message, "error");
    }
  };
  const onFinish = async () => {
    const response = await imsAxios.post("/profile/userChangePassword", {
      oldpassword: showSubmitConfirm.currentPassword,
      newpassword: showSubmitConfirm.password,
    });
    validateResponse(response?.data);
    setShowSubmitConfirm(false);
  };
  const handleOTP = () => {
    setShowOTPVerifyModal(true);
  };
  const updateUserState = (property) => {
    let obj = {
      mobileConfirmed: user.mobileConfirmed,
      emailConfirmed: user.emailConfirmed,
      passwordChanged: user.passwordChanged,
    };
    if (property === "mobileConfirmed") {
      obj = {
        ...obj,
        mobileConfirmed: "C",
      };
    }
    dispatch(setUser(obj));
  };
  useEffect(() => {
    getUserDetails();
  }, []);
  return (
    <div style={{ padding: 4, minHeight: "calc(100vh - 120px)", backgroundColor: "#f5f5f5" }}>
      <Modal
        title="Confirm Password Update!"
        open={showSubmitConfirm}
        onCancel={() => setShowSubmitConfirm(false)}
        footer={[
          <Button key="back" onClick={() => setShowSubmitConfirm(false)}>
            No
          </Button>,
          <Button key="submit" type="primary" onClick={onFinish}>
            Yes
          </Button>,
        ]}
      >
        <p>Are you sure to Update your password?</p>
      </Modal>
      {/* Verify otp modal */}
      <OtpVerify
        updateUserState={updateUserState}
        showOTPVerifyModal={showOTPVerifyModal}
        setShowOTPVerifyModal={setShowOTPVerifyModal}
      />

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 3fr",
          gap: 0,
          minHeight: "calc(100vh - 110px)",
        }}
      >
        {/* Left Sidebar - Profile Section */}
        <div
          style={{
            backgroundColor: "#f1f1f1",
            padding: "40px 30px",
            color: "black",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          {skeletonLoading ? (
            <Skeleton.Avatar
              loading={skeletonLoading}
              active
              size={100}
              shape="circle"
            />
          ) : (
            <>
              <Avatar
                size={100}
                style={{
                  backgroundColor: "#2d7a7a",
                  fontSize: 40,
                  marginBottom: 20,
                  color: "white",
                }}
              >
                {userDetails?.name?.[0]?.toUpperCase()}
              </Avatar>
              <Typography.Title
                level={2}
                style={{
                  color: "black",
                  margin: "0 0 20px 0",
                  fontWeight: "bold",
                  textAlign: "center",
                }}
              >
                {userDetails?.name || "Developer Account"}
              </Typography.Title>

              <div
                style={{
                  width: "100%",
                  padding: "10px 0",
                  borderTop: "1px solid rgba(0,0,0,0.2)",
              
                }}
              />
            

              <div style={{ width: "100%" }}>
                <div
                  onClick={() => setActiveTab("1")}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "15px 20px",
                    marginBottom: 10,
                    backgroundColor:
                      activeTab == "1" ? "rgba(0,0,0,0.2)" : "transparent",
                    borderRadius: 8,
                    cursor: "pointer",
                    transition: "all 0.3s",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <UserOutlined style={{ fontSize: 18 }} />
                    <Typography.Text style={{ color: "black", fontSize: 16 }}>
                      Personal Information
                    </Typography.Text>
                  </div>
                  <RightOutlined style={{ fontSize: 12 }} />
                </div>
                <div
                  onClick={() => setActiveTab("2")}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "15px 20px",
                    backgroundColor:
                      activeTab == "2" ? "rgba(0,0,0,0.2)" : "transparent",
                    borderRadius: 8,
                    cursor: "pointer",
                    transition: "all 0.3s",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <SafetyOutlined style={{ fontSize: 18 }} />
                    <Typography.Text style={{ color: "black", fontSize: 16 }}>
                      Security Setting
                    </Typography.Text>
                  </div>
                  <RightOutlined style={{ fontSize: 12 }} />
                </div>
              </div>
            </>
          )}
        </div>

        {/* Right Content Area - Details Section */}
        <div
          style={{
            backgroundColor: "white",
            padding: "40px 50px",
               minHeight: "calc(100vh - 80px)",
          }}
        >
          {activeTab == "1" ? (
            <>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Typography.Title level={2} style={{ margin: 0 }}>
                  Personal Information
                </Typography.Title>
                {/* <Button
                  type="text"
                  icon={<EditOutlined />}
                  onClick={() => {
                    // Handle edit functionality
                  }}
                /> */}
              </div>
          

              {skeletonLoading ? (
                <Skeleton active paragraph={{ rows: 3 }} />
              ) : (
                <div style={{ maxWidth: 600 }}>
                
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "150px 1fr",
                      gap: "20px 30px",
                      padding: "20px 0",
                      borderBottom: "1px solid #f0f0f0",
                    }}
                  >
                    <Typography.Text
                      strong
                      style={{ color: "#666", fontSize: 14 }}
                    >
                      Email
                    </Typography.Text>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <Typography.Text style={{ fontSize: 14 }}>
                        {userDetails?.email || "-"}
                      </Typography.Text>
                      {user?.emailConfirmed == "C" ? (
                        <CheckCircleOutlined
                          style={{ color: "green", fontSize: 16 }}
                        />
                      ) : (
                        <ExclamationCircleOutlined
                          style={{ color: "red", fontSize: 16 }}
                        />
                      )}
                    </div>
                  </div>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "150px 1fr",
                      gap: "20px 30px",
                      padding: "20px 0",
                      borderBottom: "1px solid #f0f0f0",
                    }}
                  >
                    <Typography.Text
                      strong
                      style={{ color: "#666", fontSize: 14 }}
                    >
                      Phone Number
                    </Typography.Text>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <Typography.Text style={{ fontSize: 14 }}>
                        {userDetails?.phone || "-"}
                      </Typography.Text>
                      {user?.mobileConfirmed == "C" ? (
                        <CheckCircleOutlined
                          style={{ color: "green", fontSize: 16 }}
                        />
                      ) : (
                        <ExclamationCircleOutlined
                          onClick={handleOTP}
                          style={{
                            color: "red",
                            fontSize: 16,
                            cursor: "pointer",
                          }}
                        />
                      )}
                    </div>
                  </div>
                    <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "150px 1fr",
                      gap: "20px 30px",
                      padding: "20px 0",
                      borderBottom: "1px solid #f0f0f0",
                    }}
                  >
                    <Typography.Text
                      strong
                      style={{ color: "#666", fontSize: 14 }}
                    >
                      Department
                    </Typography.Text>
                    <Typography.Text style={{ fontSize: 14 }}>
                      {capitalizeWords(userDetails?.type) || "-"}
                    </Typography.Text>
                  </div>
                </div>
              )}
            </>
          ) : (
            <>
              <Typography.Title level={2} style={{ margin: "0 0 20px 0" }}>
                Security Setting
              </Typography.Title>
              <Typography.Text
                style={{
                  color: "#666",
                  fontSize: 14,
                  display: "block",
                  marginBottom: 30,
                }}
              >
                Update your password to keep your account secure.
              </Typography.Text>

              {skeletonLoading ? (
                <Skeleton active paragraph={{ rows: 3 }} />
              ) : (
                <div style={{ maxWidth: 600 }}>
                  <Form
                    name="update password"
                    layout="vertical"
                    validateMessages={{
                      required: "${label} is required!",
                      types: {
                        email: "${label} is not a valid email!",
                        number: "${label} is not a valid number!",
                      },
                      string: {
                        min: "${label} should be at least ${min} characters long",
                      },
                    }}
                    onFinish={(values) => setShowSubmitConfirm(values)}
                  >
                    <Form.Item
                      name="currentPassword"
                      rules={[
                        {
                          required: true,
                        },
                      ]}
                      label="Current Password"
                    >
                      <Input.Password size="large" />
                    </Form.Item>
                    <Form.Item
                      name="password"
                      rules={[
                        {
                          required: "Please enter a new password",
                          min: 8,
                        },
                      ]}
                      label="New Password"
                    >
                      <Input.Password size="large" />
                    </Form.Item>
                    <Form.Item
                      rules={[
                        {
                          required: true,
                          message: "Please confirm your password!",
                        },
                        ({ getFieldValue }) => ({
                          validator(_, value) {
                            if (!value || getFieldValue("password") === value) {
                              return Promise.resolve();
                            }
                            return Promise.reject(
                              new Error(
                                "The two passwords that you entered do not match!"
                              )
                            );
                          },
                        }),
                      ]}
                      name="confirmPassword"
                      label="Confirm New Password"
                    >
                      <Input.Password size="large" />
                    </Form.Item>
                    <Form.Item>
                      <Button type="primary" htmlType="submit" size="large">
                        Update Password
                      </Button>
                    </Form.Item>
                  </Form>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}