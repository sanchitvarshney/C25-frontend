import  { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useDispatch } from "react-redux";

import "swiper/css";
import "swiper/css/pagination";
import ForgotPassword from "./ForgotPassword.tsx";
import "swiper/css/effect-fade";
import { Box, CircularProgress } from "@mui/material";
import { Form, Typography, Input, Button, Flex, Divider } from "antd";
import { Lock, ShieldCheck, User } from "lucide-react";
import { imsAxios } from "../../axiosInterceptor";
import useApi from "../../hooks/useApi.ts";
import { setSettings, setUser } from "../../Features/loginSlice/loginSlice";
import ImageCaptcha from "../../Components/ImageCaptcha/ImageCaptcha";
import { GoogleLogin } from "@react-oauth/google";
import { getCurrentIndianFinancialYearSession } from "../../utils/indianFinancialYear";
import AuthShell, { Text } from "./AuthShell";
import { useToast } from "../../hooks/useToast.js";

const loginFromOtpKeyframes = `
@keyframes loginFormSlideFromLeft {
  from {
    transform: translateX(-100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}
`;

const Login = () => {
  document.title = "IMS Login";
  const [forgotPassword, setForgotPassword] = useState("0");
  const [captchaInput, setCaptchaInput] = useState("");
  const [expectedCaptchaCode, setExpectedCaptchaCode] = useState("");
  const [captchaKey, setCaptchaKey] = useState(Math.random());
  const [ispassSame, setIsPassSame] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const { executeFun, loading } = useApi();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const fromOtp = Boolean(location.state?.fromOtp);
  const { showToast } = useToast();
  const [googleLoginLoading, setGoogleLoginLoading] = useState(false);
  const isLoginBusy = loading("submit") || googleLoginLoading;

  const [inpVal, setInpVal] = useState({
    username: "",
    password: "",
    company_branch: "BROAKTRC25",
  });
  const { Link: AntLink } = Typography;
  const [loginForm] = Form.useForm();
  const inputHandler = (name, value) => {
    setInpVal(() => {
      return {
        ...inpVal,
        [name]: value,
      };
    });
  };

  const isCaptchaValid = () => captchaInput.trim() === expectedCaptchaCode;

  const handleSubmit = async () => {
    if (!isCaptchaValid()) {
      showToast("Please enter the captcha text shown above", "error");
      return;
    }
    const { username, password } = inpVal;
    if (username === "" && password === "") {
      showToast("Please fill the field", "error");
    } else if (username === "") {
      showToast("username Field is Empty", "error");
    } else if (password === "") {
      showToast("password fill is empty", "error");
    } else {
      const res = await executeFun(
        () =>
          imsAxios.post("/auth/signin", {
            username: username,
            password: password,
          }),
        "submit",
      );
      if (res?.success) {
        const isTwoStep = res?.data?.isTwoStep;
        if (isTwoStep === "Y") {
          showToast("OTP sent to your registered email address", "success");
          navigate(
            {
              pathname: "/login/otp",
              search: location.search || undefined,
            },
            {
              replace: true,
              state: {
                userCredentials: {
                  username,
                  token: res?.data?.tempToken,
                  qrCode: res?.data?.qrCode,
                  company_branch: inpVal.company_branch,
                },
              },
            },
          );
        } else {
          const payload = res?.data ?? res;
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
            company_branch: inpVal.company_branch ?? payload.company_id,
            currentLink: JSON.parse(localStorage.getItem("branchData"))?.currentLink,
            id: payload.crn_id,
            showlegal: payload.department === "legal" ? true : false,
            session: getCurrentIndianFinancialYearSession(),
          };

          dispatch(setUser(obj));
          if (payload.settings) dispatch(setSettings(payload.settings));
          showToast("Login successful!");
        }
      } else {
        setCaptchaInput("");
        setCaptchaKey(Math.random());
        showToast(res?.message, "error");
      }
    }
  };

  const setThePassword = async () => {
    const values = await loginForm.validateFields();

    let response = await imsAxios.post("/auth/forgot_password", {
      username: values.username,
      new_password: values.confirmPassword,
    });

    if (response.success) {
      showToast(response.message, "success");
    }
  };
  const back = () => {
    setForgotPassword("0");
  };

  const isPasswordSame = () => {
    if (
      loginForm.getFieldValue("confirmPassword") === loginForm.getFieldValue("password")
    ) {
      setIsPassSame(true);
    } else {
      setIsPassSame(false);
    }
  };
  useEffect(() => {
    isPasswordSame();
  }, [
    loginForm.getFieldValue("confirmPassword"),
    loginForm.getFieldValue("password"), 
  ]);

  const handleLoginWithGoogle = async (googleResponse) => {
    setGoogleLoginLoading(true);
    const data = {
      credential: googleResponse.credential,
    };
    try {
      const response = await imsAxios.post("/auth/google", data);

      if (response?.success) {
        const payload = response?.data;
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
          company_branch: inpVal.company_branch,
          currentLink: JSON.parse(localStorage.getItem("otherData"))?.currentLink,
          id: payload.crn_id,
          showlegal: payload.department === "legal" ? true : false,
          session: getCurrentIndianFinancialYearSession(),
        };

        dispatch(setUser(obj));
        if (payload.settings) dispatch(setSettings(payload.settings));

        showToast("Login successful!");
      } else {
        showToast(response?.message || "Google login failed. Please try again.", "error");
        setGoogleLoginLoading(false);
      }
    } catch (error) {
      console.log(error, "data===================error");
      showToast(error?.message || "Google login failed. Please try again.", "error");
      setGoogleLoginLoading(false);
    }
  };

  const footerLeft =
    forgotPassword === "0" ? (
      <div>
        <Text type="secondary">Don&apos;t have an account? </Text>
        <Link to="/signup" className="auth-link">
          Create one
        </Link>
      </div>
    ) : (
      <div>
        <Text type="secondary">Already have an account? </Text>
        <AntLink className="auth-link" onClick={back}>
          Log In
        </AntLink>
      </div>
    );

  return (
    <AuthShell footerLeft={footerLeft}>
      {fromOtp ? <style>{loginFromOtpKeyframes}</style> : null}
      <ForgotPassword show={showForgotPassword} hide={() => setShowForgotPassword(false)} />
      <Box
        style={{
          position: "relative",
          ...(fromOtp
            ? {
                animation: "loginFormSlideFromLeft 0.45s ease-out both",
              }
            : {}),
        }}
      >
        <span className="auth-eyebrow">
          <ShieldCheck size={14} /> Secure sign-in
        </span>
        <h1 className="auth-title">
          {forgotPassword === "0" ? "Welcome back" : "Reset your password"}
        </h1>
        <p className="auth-subtitle">
          {forgotPassword === "0"
            ? "Log in to your account to manage your inventory."
            : "Enter your account details and choose a new password."}
        </p>
        <Form
          name="basic"
          layout="vertical"
          onFinish={handleSubmit}
          autoComplete="off"
          form={loginForm}
          requiredMark={false}
        >
          <Form.Item
            label="Email / Mobile / CRN Number"
            name="username"
            rules={[
              {
                required: true,
                message: "Please provide either your email / mobile number or CRN Number",
              },
            ]}
          >
            <Input
              value={inpVal.username}
              onChange={(e) => inputHandler("username", e.target.value)}
              size="large"
              prefix={<User size={16} />}
              placeholder="you@company.com or CRN"
              disabled={isLoginBusy}
            />
          </Form.Item>
          <Form.Item
            label="Password"
            name="password"
            style={forgotPassword === "0" ? { marginBottom: 6 } : undefined}
            rules={[
              {
                required: true,
                message: "Please input your password!",
              },
            ]}
          >
            <Input.Password
              value={inpVal.password}
              onChange={(e) => inputHandler("password", e.target.value)}
              size="large"
              prefix={<Lock size={16} />}
              placeholder="Enter your password"
              disabled={isLoginBusy}
            />
          </Form.Item>

          {forgotPassword === "0" ? (
            <>
              <Flex justify="end" style={{ marginBottom: 16 }}>
                <Button
                  onClick={() => setShowForgotPassword(true)}
                  type="link"
                  className="auth-link-btn"
                >
                  Forgot password?
                </Button>
              </Flex>
              <div className="auth-captcha">
                <div className="auth-captcha-head">
                  <span>Security check</span>
                  <span>Click image to refresh</span>
                </div>
                <ImageCaptcha
                  key={captchaKey}
                  value={captchaInput}
                  onChange={(e) => setCaptchaInput(e.target.value)}
                  onCodeChange={setExpectedCaptchaCode}
                  placeholder="Enter letters shown"
                  size="large"
                  inputStyle={{ width: "100%" }}
                  disabled={isLoginBusy}
                />
              </div>
              <Form.Item style={{ marginBottom: 0 }}>
                <Button
                  disabled={isLoginBusy}
                  block
                  size="large"
                  type="primary"
                  htmlType="submit"
                  loading={loading("submit")}
                >
                  Log In
                </Button>
              </Form.Item>

              <Divider plain className="auth-divider">
                or continue with
              </Divider>
              <div className="auth-social">
                {googleLoginLoading && <CircularProgress size={20} />}
                {!loading("submit") && !googleLoginLoading && (
                  <GoogleLogin
                    onSuccess={(credentialResponse) => {
                      handleLoginWithGoogle(credentialResponse);
                    }}
                    onError={() => {
                      showToast("Google login failed", "error");
                    }}
                       use_fedcm_for_button
                    shape="pill"
                  />
                )}
              </div>
            </>
          ) : (
            <>
              <Form.Item
                label="Confirm Password"
                name="confirmPassword"
                rules={[
                  {
                    required: true,
                    message: "Please input your password!",
                  },
                ]}
              >
                <Input.Password
                  value={inpVal.password}
                  onChange={(e) => inputHandler("password", e.target.value)}
                  size="large"
                  prefix={<Lock size={16} />}
                />
              </Form.Item>
              <Form.Item>
                <Button
                  block
                  size="large"
                  type="primary"
                  htmlType="button"
                  disabled={!ispassSame}
                  onClick={setThePassword}
                >
                  Reset Password
                </Button>
              </Form.Item>

              <Flex justify="space-between">
                <AntLink className="auth-link" onClick={back}>
                  Back to Log In
                </AntLink>
                <AntLink className="auth-link" onClick={() => navigate("/signup")}>
                  Create an Account
                </AntLink>
              </Flex>
            </>
          )}
        </Form>
      </Box>
    </AuthShell>
  );
};

export default Login;
