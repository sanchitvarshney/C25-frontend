import  { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Box } from "@mui/material";
import { Row, Col, Typography, Form, Input, Button, Modal } from "antd";
import { Lock, Mail, Phone, User, UserPlus } from "lucide-react";
import AuthShell, { Text } from "./AuthShell";
import { imsAxios } from "../../axiosInterceptor";
import ImageCaptcha from "../../Components/ImageCaptcha/ImageCaptcha";
import { useToast } from "../../hooks/useToast.js";

const SignUp = () => {
  document.title = "IMS Sign Up";
  const [signUp] = Form.useForm();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [captchaInput, setCaptchaInput] = useState("");
  const [expectedCaptchaCode, setExpectedCaptchaCode] = useState("");

  const isCaptchaValid = () => captchaInput.trim() === expectedCaptchaCode;

  const createNewUser = async (values) => {
    const response = await imsAxios.post("/auth/singup/new", {
      username: values.name,
      email: values.username,
      mobile: values.number,
      password: values.password2,
    });

    if (response.success) {
      showToast(response.message, "success");
      signUp.resetFields();
      navigate("/login");
    } else {
      showToast(response.message?.msg || response.message, "error");
    }
  };

  const askModalConfirm = (values) => {
    Modal.confirm({
      title: `Are you sure you want to create this new user?`,
      content: (
        <>
          <Typography>
            You requested for creating account. Please make sure that the values are correct.
          </Typography>
          <Row style={{ marginTop: "1em" }}>
            <Text>
              {" "}
              Email Id -<Text strong>{values.username}</Text>
            </Text>
          </Row>
          <Row>
            <Text>
              {" "}
              Number -<Text strong>{values.number}</Text>
            </Text>
          </Row>
        </>
      ),
      onOk() {
        createNewUser(values);
      },
      okText: "Yes",
      cancelText: "No",
    });
  };

  const validatecreateNewUser = async () => {
    if (!isCaptchaValid()) {
      showToast("Please enter the captcha text shown above", "error");
      return;
    }
    const values = await signUp.validateFields();
    askModalConfirm(values);
  };

  const footerLeft = (
    <div>
      <Text type="secondary">Already have an account? </Text>
      <Link to="/login" className="auth-link">
        Log In
      </Link>
    </div>
  );

  return (
    <AuthShell footerLeft={footerLeft}>
      <Box style={{ position: "relative" }}>
        <span className="auth-eyebrow">
          <UserPlus size={14} /> New account
        </span>
        <h1 className="auth-title">Create your account</h1>
        <p className="auth-subtitle">Fill in your details to get started with IMS.</p>
        <Form name="signup" layout="vertical" autoComplete="off" form={signUp} requiredMark={false}>
          <Form.Item
            label="Full Name"
            name="name"
            rules={[
              {
                required: true,
                message: "Please provide your name",
              },
            ]}
          >
            <Input size="large" prefix={<User size={16} />} placeholder="Your full name" />
          </Form.Item>
          <Row gutter={12}>
            <Col xs={24} sm={12}>
              <Form.Item
                label="Mobile Number"
                name="number"
                rules={[
                  {
                    required: true,
                    message: "Please provide phone number.",
                  },
                  {
                    pattern: /^[0-9]+$/,
                    message: "Mobile number must contain digits only.",
                  },
                ]}
              >
                <Input
                  size="large"
                  inputMode="numeric"
                  maxLength={10}
                  prefix={<Phone size={16} />}
                  placeholder="10-digit number"
                  onChange={(e) => {
                    const onlyDigits = e.target.value.replace(/[^0-9]/g, "");
                    signUp.setFieldsValue({ number: onlyDigits });
                  }}
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label="Email Address"
                name="username"
                rules={[
                  {
                    required: true,
                    message: "Please provide either your email or phone number or CRN Number",
                  },
                ]}
              >
                <Input size="large" prefix={<Mail size={16} />} placeholder="you@company.com" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={12}>
            <Col xs={24} sm={12}>
              <Form.Item
                label="Password"
                name="password"
                rules={[
                  {
                    required: true,
                  },
                ]}
              >
                <Input.Password size="large" prefix={<Lock size={16} />} placeholder="Password" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label="Confirm Password"
                name="password2"
                dependencies={["password"]}
                rules={[
                  {
                    required: true,
                  },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue("password") === value) {
                        return Promise.resolve();
                      }
                      return Promise.reject(
                        new Error("The new password that you entered do not match!"),
                      );
                    },
                  }),
                ]}
              >
                <Input.Password size="large" prefix={<Lock size={16} />} placeholder="Re-enter" />
              </Form.Item>
            </Col>
          </Row>
        </Form>
        <div className="auth-captcha">
          <div className="auth-captcha-head">
            <span>Security check</span>
            <span>Click image to refresh</span>
          </div>
          <ImageCaptcha
            value={captchaInput}
            onChange={(e) => setCaptchaInput(e.target.value)}
            onCodeChange={setExpectedCaptchaCode}
            placeholder="Enter letters shown"
            size="large"
            inputStyle={{ width: "100%" }}
          />
        </div>
        <Button block size="large" type="primary" onClick={() => validatecreateNewUser()}>
          Create Account
        </Button>
      </Box>
    </AuthShell>
  );
};

export default SignUp;
