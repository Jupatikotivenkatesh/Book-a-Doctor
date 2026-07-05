import React, { useEffect } from "react";
import {
  Form,
  Input,
  Button,
  Typography,
  Card,
  Checkbox,
  Divider,
  Alert,
  Space,
  Row,
  Col,
  Select,
} from "antd";
import {
  MailOutlined,
  LockOutlined,
  MedicineBoxOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  login,
  clearError,
  clearSuccess,
} from "../redux/slices/authSlice";
import { message as antMessage } from "antd";

const { Title, Text, Paragraph } = Typography;

const ROLE_REDIRECTS = {
  admin: "/admin/dashboard",
  doctor: "/doctor/dashboard",
  patient: "/dashboard",
};

const Login = () => {
  const [form] = Form.useForm();

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const { loading, error, success, user } = useSelector(
    (state) => state.auth
  );

  const from = location.state?.from?.pathname || null;

  useEffect(() => {
    dispatch(clearError());
    dispatch(clearSuccess());
  }, [dispatch]);

  useEffect(() => {
    if (success && user) {
      antMessage.success(`Welcome back, ${user.name}!`);

      const destination =
        from || ROLE_REDIRECTS[user.role] || "/dashboard";

      navigate(destination, { replace: true });
    }
  }, [success, user, navigate, from]);

  const onFinish = ({ email, password, role }) => {
    dispatch(
      login({
        email,
        password,
        role,
      })
    );
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background:
          "linear-gradient(135deg, #f0f7ff 0%, #e6f7ff 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "40px 16px",
      }}
    >
      <Row
        style={{ width: "100%", maxWidth: 960 }}
        gutter={[32, 32]}
        align="middle"
      >
        {/* Left Branding */}
        <Col xs={0} md={12}>
          <div style={{ padding: "0 24px" }}>
            <Space style={{ marginBottom: 24 }}>
              <MedicineBoxOutlined
                style={{
                  fontSize: 36,
                  color: "#1890ff",
                }}
              />
              <Title
                level={2}
                style={{
                  margin: 0,
                  color: "#001529",
                }}
              >
                Book a Doctor
              </Title>
            </Space>

            <Title level={3} style={{ color: "#333" }}>
              Welcome Back
            </Title>

            <Paragraph
              style={{
                color: "#666",
                fontSize: 16,
                lineHeight: 1.8,
              }}
            >
              Sign in to manage your appointments, view your
              health records, and connect with your doctors.
            </Paragraph>

            <div
              style={{
                background: "white",
                borderRadius: 16,
                padding: 24,
                boxShadow:
                  "0 4px 16px rgba(0,0,0,0.06)",
                marginTop: 32,
              }}
            >
              <Text
                strong
                style={{
                  display: "block",
                  marginBottom: 8,
                }}
              >
                🔒 Your data is safe with us
              </Text>

              <Text
                type="secondary"
                style={{
                  fontSize: 14,
                  lineHeight: 1.7,
                }}
              >
                We use industry-standard encryption to protect
                your personal health information.
              </Text>
            </div>
          </div>
        </Col>

        {/* Login Card */}
        <Col xs={24} md={12}>
          <Card
            style={{
              borderRadius: 20,
              boxShadow:
                "0 12px 40px rgba(0,0,0,0.1)",
              border: "none",
            }}
            bodyStyle={{
              padding: "36px 32px",
            }}
          >
            <div
              style={{
                textAlign: "center",
                marginBottom: 28,
              }}
            >
              <MedicineBoxOutlined
                style={{
                  fontSize: 32,
                  color: "#1890ff",
                  display: "block",
                  marginBottom: 8,
                }}
              />

              <Title level={3} style={{ margin: 0 }}>
                Sign In
              </Title>

              <Text type="secondary">
                Enter your credentials to continue
              </Text>
            </div>

            {error && (
              <Alert
                message={error}
                type="error"
                showIcon
                closable
                onClose={() => dispatch(clearError())}
                style={{
                  marginBottom: 20,
                  borderRadius: 8,
                }}
              />
            )}

            <Form
              form={form}
              layout="vertical"
              onFinish={onFinish}
              requiredMark={false}
              size="large"
              initialValues={{
                role: "patient",
              }}
            >
              {/* Role Selection */}

              <Form.Item
                name="role"
                label="Login As"
                rules={[
                  {
                    required: true,
                    message: "Please select a role",
                  },
                ]}
              >
                <Select
                  prefix={<UserOutlined />}
                  placeholder="Select role"
                >
                  <Select.Option value="patient">
                    Patient
                  </Select.Option>

                  <Select.Option value="doctor">
                    Doctor
                  </Select.Option>

                  <Select.Option value="admin">
                    Admin
                  </Select.Option>
                </Select>
              </Form.Item>

              {/* Email */}

              <Form.Item
                name="email"
                label="Email Address"
                rules={[
                  {
                    required: true,
                    message: "Please enter your email",
                  },
                  {
                    type: "email",
                    message:
                      "Please enter a valid email",
                  },
                ]}
              >
                <Input
                  prefix={
                    <MailOutlined
                      style={{
                        color: "#bfbfbf",
                      }}
                    />
                  }
                  placeholder="your@email.com"
                  autoComplete="email"
                  style={{
                    borderRadius: 8,
                  }}
                />
              </Form.Item>

              {/* Password */}

              <Form.Item
                name="password"
                label="Password"
                rules={[
                  {
                    required: true,
                    message:
                      "Please enter your password",
                  },
                ]}
              >
                <Input.Password
                  prefix={
                    <LockOutlined
                      style={{
                        color: "#bfbfbf",
                      }}
                    />
                  }
                  placeholder="Your password"
                  autoComplete="current-password"
                  style={{
                    borderRadius: 8,
                  }}
                />
              </Form.Item>

              <Form.Item style={{ marginBottom: 4 }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Checkbox>Remember me</Checkbox>

                  <Link
                    to="#"
                    style={{
                      fontSize: 13,
                      color: "#1890ff",
                    }}
                  >
                    Forgot password?
                  </Link>
                </div>
              </Form.Item>

              <Form.Item
                style={{
                  marginTop: 20,
                  marginBottom: 12,
                }}
              >
                <Button
                  type="primary"
                  htmlType="submit"
                  block
                  loading={loading}
                  style={{
                    height: 48,
                    borderRadius: 8,
                    fontSize: 16,
                    fontWeight: 600,
                  }}
                >
                  {loading
                    ? "Signing In..."
                    : "Sign In"}
                </Button>
              </Form.Item>
            </Form>

            <Divider style={{ margin: "16px 0" }}>
              <Text
                type="secondary"
                style={{ fontSize: 13 }}
              >
                New to Book a Doctor?
              </Text>
            </Divider>

            <div style={{ textAlign: "center" }}>
              <Link to="/register">
                <Button
                  block
                  style={{
                    height: 44,
                    borderRadius: 8,
                  }}
                >
                  Create Free Account
                </Button>
              </Link>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Login;