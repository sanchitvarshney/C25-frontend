import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { Box } from "@mui/material";
import { Row, Col, Typography, Input, Button, Alert } from "antd";
import { ArrowLeftOutlined, SafetyOutlined } from "@ant-design/icons";
import AuthShell from "./AuthShell";
import { imsAxios } from "../../axiosInterceptor";
import useApi from "../../hooks/useApi.ts";
import { setSettings, setUser } from "../../Features/loginSlice/loginSlice";
import { useToast } from "../../hooks/useToast.js";
import { getCurrentIndianFinancialYearSession } from "../../utils/indianFinancialYear";

const { Title, Text } = Typography;

const slideKeyframes = `
@keyframes loginOtpSlideIn {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}
@keyframes loginOtpSlideOut {
  from {
    transform: translateX(0);
    opacity: 1;
  }
  to {
    transform: translateX(100%);
    opacity: 0;
  }
}
`;

const LoginOtp = () => {
  document.title = "IMS — Verify OTP";
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { executeFun, loading } = useApi();
  const { showToast } = useToast();

  const userCredentials = location.state?.userCredentials;

  const [otpCode, setOtpCode] = useState(["", "", "", "", "", ""]);
  const [otpTimer, setOtpTimer] = useState(600);
  const [isLeavingToLogin, setIsLeavingToLogin] = useState(false);

  useEffect(() => {
    if (!userCredentials?.token) {
      showToast("Session expired. Please sign in again.", "error");
    navigate({ pathname: "/login", search: location.search }, {
        replace: true,
      });
    }
  }, [userCredentials, navigate, showToast, location.search]);

  useEffect(() => {
    let interval = null;
    if (userCredentials?.token && otpTimer > 0) {
      interval = setInterval(() => {
        setOtpTimer((timer) => timer - 1);
      }, 1000);
    } else if (otpTimer === 0) {
      showToast("OTP has expired. Please login again.", "error");
    navigate({ pathname: "/login", search: location.search }, {
        replace: true,
      });
    }
    return () => clearInterval(interval);
  }, [userCredentials?.token, otpTimer, navigate, showToast,  location.search]);

  const handleOtpChange = (index, value) => {
    if (value.length <= 1 && /^\d*$/.test(value)) {
      const newOtpCode = [...otpCode];
      newOtpCode[index] = value;
      setOtpCode(newOtpCode);

      if (value && index < 5) {
        const nextInput = document.getElementById(`otp-input-${index + 1}`);
        if (nextInput) nextInput.focus();
      }
    }
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pastedText = e.clipboardData.getData("text");
    const pastedOtp = pastedText.replace(/\D/g, "").slice(0, 6);

    if (pastedOtp.length > 0) {
      const newOtpCode = ["", "", "", "", "", ""];
      for (let i = 0; i < pastedOtp.length; i++) {
        newOtpCode[i] = pastedOtp[i];
      }
      setOtpCode(newOtpCode);
      const nextIndex = Math.min(pastedOtp.length, 5);
      setTimeout(() => {
        const nextInput = document.getElementById(`otp-input-${nextIndex}`);
        if (nextInput) nextInput.focus();
      }, 0);
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otpCode[index] && index > 0) {
      const prevInput = document.getElementById(`otp-input-${index - 1}`);
      if (prevInput) prevInput.focus();
    }
  };

  const verifyOTP = async () => {
    const otpString = otpCode.join("");
    if (otpString.length !== 6) {
      showToast("Please enter the complete 6-digit OTP", "error");
      return;
    }

    if (!userCredentials?.token) {
      showToast("Session expired. Please login again.", "error");
   navigate({ pathname: "/login", search: location.search }, {
        replace: true,
      });
      return;
    }

    try {
      const res = await executeFun(
        () =>
          imsAxios.post(
            "/auth/verify",
            { otp: otpString },
            {
              headers: {
                Authorization: `${userCredentials.token}`,
              },
            },
          ),
        "verifyOtp",
      );

      if (res?.success) {
        const payload = res?.data ?? res;
        const obj = {
          email: payload.crn_email,
          phone: payload.crn_mobile,
          userName: payload.username,
          comId: payload.company_id,
          token: payload.token,
          favPages: payload.fav_pages ? JSON.parse(payload.fav_pages) : [],
          type: payload.crn_type,
          mobileConfirmed: payload.other?.m_v,
          emailConfirmed: payload.other?.e_v,
          passwordChanged: payload.other?.c_p ?? "C",
          company_branch: userCredentials.company_branch,
          currentLink: JSON.parse(localStorage.getItem("branchData"))
            ?.currentLink,
          id: payload.crn_id,
          showlegal: payload.department === "legal" ? true : false,
          session: getCurrentIndianFinancialYearSession(),
        };
        dispatch(setUser(obj));
        if (payload.settings) dispatch(setSettings(payload.settings));
        showToast("Login successful!");
  
      } else {
        showToast(res?.message || "Invalid OTP. Please try again.", "error");
        setOtpCode(["", "", "", "", "", ""]);
      }
    } catch {
      showToast("Invalid OTP. Please try again.", "error");
      setOtpCode(["", "", "", "", "", ""]);
    }
  };

  const formatTimer = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  const goBackToLogin = () => {
    setIsLeavingToLogin(true);
  };

  useEffect(() => {
    if (!isLeavingToLogin) return undefined;
    const t = window.setTimeout(() => {
         navigate(
        { pathname: "/login", search: location.search },
        { state: { fromOtp: true } },
      );
    }, 450);
    return () => window.clearTimeout(t);
  }, [isLeavingToLogin, navigate]);

  const footerLeft = (
    <Button
      type="link"
      onClick={goBackToLogin}
      disabled={isLeavingToLogin}
      style={{ color: "#666", padding: 0 }}
    >
      <ArrowLeftOutlined /> Back to Sign In
    </Button>
  );

  return (
    <AuthShell footerLeft={footerLeft}>
      <style>{slideKeyframes}</style>
      <Row
        justify="center"
        style={{ width: "100%", maxWidth: "600px" }}
        align="middle"
        gutter={[5, 5]}
      >
        <Col span={24}>
          <Box
            style={{
              position: "relative",
              animation: isLeavingToLogin
                ? "loginOtpSlideOut 0.45s ease-in forwards"
                : "loginOtpSlideIn 0.45s ease-out both",
            }}
          >
            <Title
              style={{
                color: "#04b0a8",
                textAlign: "center",
                marginBottom: 20,
                fontSize: 24,
                fontWeight: "bold",
              }}
              level={3}
            >
              Two-Factor Authentication
            </Title>

            <Text
              style={{
                textAlign: "center",
                display: "block",
                marginBottom: 30,
                color: "#666",
                fontSize: 14,
              }}
            >
              Enter the 6-digit verification code sent to your registered Email address (expires
              in 5 minutes)
            </Text>

            <div
              style={{
                display: "flex",
                justifyContent: "center",
                gap: 12,
                marginBottom: 20,
              }}
            >
              {otpCode.map((digit, index) => (
                <Input
                  key={index}
                  id={`otp-input-${index}`}
                  value={digit}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                  onKeyDown={(e) => handleOtpKeyDown(index, e)}
                  onPaste={index === 0 ? handleOtpPaste : undefined}
                  maxLength={1}
                  style={{
                    width: 50,
                    height: 50,
                    textAlign: "center",
                    fontSize: 18,
                    fontWeight: "bold",
                    border: digit ? "2px solid #04b0a8" : "1px solid #d9d9d9",
                    borderRadius: 8,
                  }}
                />
              ))}
            </div>

            <Text
              style={{
                textAlign: "center",
                display: "block",
                marginBottom: 30,
                color: "#666",
                fontSize: 14,
              }}
            >
              Code expires in {formatTimer(otpTimer)}
            </Text>

            <Button
              type="primary"
              size="large"
              block
              onClick={verifyOTP}
              loading={loading("verifyOtp")}
              style={{
                height: 45,
                fontSize: 16,
                fontWeight: "bold",
                marginBottom: 20,
                backgroundColor: "#04b0a8",
                borderColor: "#04b0a8",
              }}
            >
              Verify & Continue
            </Button>

            <Alert
              message="For your security, this code will expire in 5 minutes. Never share this code with anyone."
              type="info"
              showIcon
              icon={<SafetyOutlined />}
              style={{
                marginTop: 20,
                backgroundColor: "#e6f7ff",
                borderColor: "#91d5ff",
                borderRadius: 8,
              }}
            />
          </Box>
        </Col>
      </Row>
    </AuthShell>
  );
};

export default LoginOtp;
