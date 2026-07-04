import React, { useEffect } from "react";
import {
  Form, Input, Button, Typography, Card, Row, Col,
  Divider, Alert, Space,
} from "antd";
import {
  UserOutlined, MailOutlined, LockOutlined,
  MedicineBoxOutlined, PhoneOutlined,
} from "@ant-design/icons";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { register, clearError, clearSuccess } from "../redux/slices/authSlice";
import { message as antMessage } from "antd";

const { Title, Text, Paragraph } = Typography;

const Register = () => {
  const [form] = Form.useForm();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error, success } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(clearError());
    dispatch(clearSuccess());
  }, [dispatch]);

  useEffect(() => {
    if (success) {
      antMessage.success("Registration successful! Welcome to Book a Doctor.");
      navigate("/dashboard");
    }
  }, [success, navigate]);

  const onFinish = (values) => {
    const { name, email, password, phone } = values;
    dispatch(register({ name, email, password, phone }));
  };

  return (
    <div style={{
      minHeight: "100vh", background: "linear-gradient(135deg, #f0f7ff 0%, #e6f7ff 100%)",
      display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 16px",
    }}>
      <Row style={{ width: "100%", maxWidth: 960 }} gutter={[32, 32]} align="middle">
        {/* Left panel */}
        <Col xs={0} md={12}>
          <div style={{ padding: "0 24px" }}>
            <Space style={{ marginBottom: 24 }}>
              <MedicineBoxOutlined style={{ fontSize: 36, color: "#1890ff" }} />
              <Title level={2} style={{ margin: 0, color: "#001529" }}>Book a Doctor</Title>
            </Space>
            <Title level={3} style={{ color: "#333" }}>Start Your Health Journey Today</Title>
            <Paragraph style={{ color: "#666", fontSize: 16, lineHeight: 1.8 }}>
              Join thousands of patients finding and booking appointments with verified doctors.
            </Paragraph>
            {[
              "Access 500+ verified specialists",
              "Book appointments instantly",
              "Upload medical documents securely",
              "Get follow-up care easily",
            ].map((item) => (
              <div key={item} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                <div style={{
                  width: 24, height: 24, borderRadius: "50%",
                  background: "#1890ff", display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <span style={{ color: "white", fontSize: 13 }}>✓</span>
                </div>
                <Text style={{ fontSize: 15 }}>{item}</Text>
              </div>
            ))}
          </div>
        </Col>

        {/* Right panel — Form */}
        <Col xs={24} md={12}>
          <Card
            style={{ borderRadius: 20, boxShadow: "0 12px 40px rgba(0,0,0,0.1)", border: "none" }}
            bodyStyle={{ padding: "36px 32px" }}
          >
            <div style={{ textAlign: "center", marginBottom: 28 }}>
              <MedicineBoxOutlined style={{ fontSize: 32, color: "#1890ff", display: "block", marginBottom: 8 }} />
              <Title level={3} style={{ margin: 0 }}>Create Account</Title>
              <Text type="secondary">Sign up to get started</Text>
            </div>

            {error && (
              <Alert
                message={error}
                type="error"
                showIcon
                closable
                onClose={() => dispatch(clearError())}
                style={{ marginBottom: 20, borderRadius: 8 }}
              />
            )}

            <Form
              form={form}
              layout="vertical"
              onFinish={onFinish}
              requiredMark={false}
              size="large"
            >
              <Form.Item
                name="name"
                label="Full Name"
                rules={[
                  { required: true, message: "Please enter your full name" },
                  { min: 2, message: "Name must be at least 2 characters" },
                  { max: 100, message: "Name cannot exceed 100 characters" },
                ]}
              >
                <Input
                  prefix={<UserOutlined style={{ color: "#bfbfbf" }} />}
                  placeholder="John Doe"
                  style={{ borderRadius: 8 }}
                />
              </Form.Item>

              <Form.Item
                name="email"
                label="Email Address"
                rules={[
                  { required: true, message: "Please enter your email" },
                  { type: "email", message: "Please enter a valid email" },
                ]}
              >
                <Input
                  prefix={<MailOutlined style={{ color: "#bfbfbf" }} />}
                  placeholder="john@example.com"
                  style={{ borderRadius: 8 }}
                />
              </Form.Item>

              <Form.Item
                name="phone"
                label="Phone Number (Optional)"
              >
                <Input
                  prefix={<PhoneOutlined style={{ color: "#bfbfbf" }} />}
                  placeholder="+1 (555) 000-0000"
                  style={{ borderRadius: 8 }}
                />
              </Form.Item>

              <Form.Item
                name="password"
                label="Password"
                rules={[
                  { required: true, message: "Please enter a password" },
                  { min: 6, message: "Password must be at least 6 characters" },
                ]}
              >
                <Input.Password
                  prefix={<LockOutlined style={{ color: "#bfbfbf" }} />}
                  placeholder="Min. 6 characters"
                  style={{ borderRadius: 8 }}
                />
              </Form.Item>

              <Form.Item
                name="confirmPassword"
                label="Confirm Password"
                dependencies={["password"]}
                rules={[
                  { required: true, message: "Please confirm your password" },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue("password") === value) {
                        return Promise.resolve();
                      }
                      return Promise.reject(new Error("Passwords do not match"));
                    },
                  }),
                ]}
              >
                <Input.Password
                  prefix={<LockOutlined style={{ color: "#bfbfbf" }} />}
                  placeholder="Re-enter your password"
                  style={{ borderRadius: 8 }}
                />
              </Form.Item>

              <Form.Item style={{ marginBottom: 12 }}>
                <Button
                  type="primary"
                  htmlType="submit"
                  block
                  loading={loading}
                  style={{ height: 48, borderRadius: 8, fontSize: 16, fontWeight: 600 }}
                >
                  {loading ? "Creating Account..." : "Create Account"}
                </Button>
              </Form.Item>
            </Form>

            <Divider style={{ margin: "16px 0" }}>
              <Text type="secondary" style={{ fontSize: 13 }}>Already have an account?</Text>
            </Divider>

            <div style={{ textAlign: "center" }}>
              <Link to="/login">
                <Button block style={{ height: 44, borderRadius: 8 }}>
                  Sign In Instead
                </Button>
              </Link>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Register;
