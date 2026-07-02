import  { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useDispatch } from "react-redux";

import "swiper/css";
import "swiper/css/pagination";
import ForgotPassword from "./ForgotPassword.tsx";
import "swiper/css/effect-fade";
import { Box, CircularProgress } from "@mui/material";
import {
  Form,
  Row,
  Typography,
  Col,
  Input,
  Button,
  Flex,
} from "antd";
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
    company_branch: "BRALWR36",
  });
  const { Title, Link: AntLink } = Typography;
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
            company_branch: inpVal.company_branch,
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
        <Text>Don&apos;t have an account? </Text>
        <Link to="/signup" className="auth-shell-footer-link">
          Sign Up
        </Link>
      </div>
    ) : (
      <span onClick={back} style={{ cursor: "pointer" }}>
        If you have an account,{" "}
        <span style={{ textDecoration: "underline", color: "blue" }}>Login</span>
      </span>
    );

  return (
    <AuthShell footerLeft={footerLeft}>
      {fromOtp ? <style>{loginFromOtpKeyframes}</style> : null}
      <ForgotPassword show={showForgotPassword} hide={() => setShowForgotPassword(false)} />
      <Row justify="center" style={{ width: "100%", maxWidth: "600px" }} align="middle" gutter={[5, 5]}>
        <Col span={24}>
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
            <Title
              style={{
                color: "gray",
                marginBottom: 20,
              }}
              level={4}
            >
              Log In to your account
            </Title>
            <Form
              name="basic"
              layout="vertical"
              onFinish={handleSubmit}
              autoComplete="off"
              form={loginForm}
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
                  disabled={isLoginBusy}
                />
              </Form.Item>
              <Form.Item
                label="Password"
                name="password"
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
                  disabled={isLoginBusy}
                />
              </Form.Item>

              {forgotPassword === "0" ? (
                <>
                  <div className="flex justify-center w-full">
                    <ImageCaptcha
                      key={captchaKey}
                      value={captchaInput}
                      onChange={(e) => setCaptchaInput(e.target.value)}
                      onCodeChange={setExpectedCaptchaCode}
                      placeholder="Enter letters above"
                      disabled={isLoginBusy}
                    />
                    <Flex justify="end" style={{ marginTop: "12px" }}>
                      <Button onClick={() => setShowForgotPassword(true)} type="link">
                        Forgot Password?
                      </Button>
                    </Flex>
                  </div>
                  <Form.Item wrapperCol={{ offset: 0, span: 24 }}>
                    <Button
                      disabled={isLoginBusy}
                      block
                      size="large"
                      type="primary"
                      htmlType="submit"
                      style={{ marginTop: "1em" }}
                      loading={loading("submit")}
                    >
                      Log In
                    </Button>
                  </Form.Item>
                  <div
                    className="flex flex-col items-center justify-center w-full"
                    style={{ marginTop: "0.5rem" }}
                  >
                    {googleLoginLoading && (
                      <div className="flex justify-center items-center py-2">
                        <CircularProgress size={20} />
                      </div>
                    )}
                    {!loading("submit") && !googleLoginLoading && (
                      <Typography
                        style={{
                         
                          textAlign: "center",
                          marginBottom: 8,
                          fontWeight: "bold",
                          border: "1px solid #ccc",
                          borderRadius: "50%",
                          backgroundColor: "#f0f0f0",
                          width: "50px",
                          height: "50px",
                          display: "flex",
                          justifyContent: "center",
                          alignItems: "center",
                        }}
                        variant="subtitle2"
                      >
                        OR
                      </Typography>
                    )}
                    <div className="flex justify-center items-center w-full">
                      {!loading("submit") && !googleLoginLoading && (
                        <GoogleLogin
                          onSuccess={(credentialResponse) => {
                            handleLoginWithGoogle(credentialResponse);
                          }}
                          onError={() => {
                            showToast("Google login failed", "error");
                          }}
                          shape="circle"
                        />
                      )}
                    </div>
                  </div>

                  <br />
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
                    />
                  </Form.Item>
                  <Form.Item wrapperCol={{ offset: 0, span: 24 }}>
                    <Button
                      block
                      size="large"
                      type="primary"
                      htmlType="button"
                      style={{ marginTop: "1em" }}
                      disabled={!ispassSame}
                      onClick={setThePassword}
                    >
                      Reset Password
                    </Button>
                  </Form.Item>

                  <AntLink style={{ marginLeft: "8em" }} onClick={back}>
                    Back to Log In
                  </AntLink>
                  <AntLink style={{ marginLeft: "1em" }} onClick={() => navigate("/signup")}>
                    Create an Account
                  </AntLink>
                </>
              )}
            </Form>
          </Box>
        </Col>
      </Row>
    </AuthShell>
  );
};

export default Login;
