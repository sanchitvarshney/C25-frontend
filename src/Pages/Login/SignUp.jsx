import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Box } from "@mui/material";
import { Row, Col, Typography, Form, Input, Button, Modal } from "antd";
import AuthShell, { Text } from "./AuthShell";
import { imsAxios } from "../../axiosInterceptor";
import ImageCaptcha from "../../Components/ImageCaptcha/ImageCaptcha";
import { useToast } from "../../hooks/useToast.js";

const { Title } = Typography;

const SignUp = () => {
  document.title = "IMS Sign Up";
  const [signUp] = Form.useForm();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [captchaInput, setCaptchaInput] = useState("");
  const [expectedCaptchaCode, setExpectedCaptchaCode] = useState("");
  const [captchaKey, setCaptchaKey] = useState(Math.random());

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
    <span>
      If you have an account,{" "}
      <Link to="/login" className="auth-shell-footer-link">
        Login
      </Link>
    </span>
  );

  return (
    <AuthShell footerLeft={footerLeft}>
      <Row justify="center" style={{ width: "100%", maxWidth: "600px" }} align="middle" gutter={[5, 5]}>
        <Col span={24}>
          <Box style={{ position: "relative" }}>
            <Title
              style={{
                color: "gray",
                marginBottom: 20,
              }}
              level={4}
            >
              Sign Up to get started
            </Title>
            <Form name="signup" layout="vertical" autoComplete="off" form={signUp}>
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
                <Input size="large" />
              </Form.Item>
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
                  onChange={(e) => {
                    const onlyDigits = e.target.value.replace(/[^0-9]/g, "");
                    signUp.setFieldsValue({ number: onlyDigits });
                  }}
                />
              </Form.Item>
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
                <Input size="large" />
              </Form.Item>

              <Form.Item
                label="Password"
                name="password"
                rules={[
                  {
                    required: true,
                  },
                ]}
              >
                <Input.Password />
              </Form.Item>

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
                <Input.Password />
              </Form.Item>
            </Form>
            <div className="flex justify-center">
              <ImageCaptcha
                key={captchaKey}
                value={captchaInput}
                onChange={(e) => setCaptchaInput(e.target.value)}
                onCodeChange={setExpectedCaptchaCode}
                placeholder="Enter letters above"
              />
            </div>
            <Button block size="large" type="primary" style={{ marginTop: "2em" }} onClick={() => validatecreateNewUser()}>
              Sign Up
            </Button>
          </Box>
        </Col>
      </Row>
    </AuthShell>
  );
};

export default SignUp;
