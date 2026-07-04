import React, { useEffect, useState } from "react";
import {
  Row, Col, Card, Form, Input, Button, Typography, Avatar,
  Upload, Divider, Alert, Space, message as antMessage, Tabs,
} from "antd";
import {
  UserOutlined, MailOutlined, PhoneOutlined, HomeOutlined,
  LockOutlined, CameraOutlined, SaveOutlined,
} from "@ant-design/icons";
import { useDispatch, useSelector } from "react-redux";
import {
  updateProfile, changePassword, clearError, clearSuccess,
} from "../../redux/slices/authSlice";
import api from "../../services/api";

const { Title, Text } = Typography;
const { TextArea } = Input;

const UserProfile = () => {
  const dispatch = useDispatch();
  const { user, loading, error, success } = useSelector((state) => state.auth);
  const [profileForm] = Form.useForm();
  const [passwordForm] = Form.useForm();
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (user) {
      profileForm.setFieldsValue({
        name: user.name,
        email: user.email,
        phone: user.phone || "",
        address: user.address || "",
      });
    }
    dispatch(clearError());
    dispatch(clearSuccess());
  }, [user, profileForm, dispatch]);

  useEffect(() => {
    if (success) {
      antMessage.success("Updated successfully!");
      dispatch(clearSuccess());
    }
  }, [success, dispatch]);

  const handleProfileSave = (values) => {
    dispatch(updateProfile({ name: values.name, phone: values.phone, address: values.address }));
  };

  const handlePasswordChange = async (values) => {
    const result = await dispatch(
      changePassword({ currentPassword: values.currentPassword, newPassword: values.newPassword })
    );
    if (changePassword.fulfilled.match(result)) {
      antMessage.success("Password changed successfully!");
      passwordForm.resetFields();
    }
  };

  const handleAvatarUpload = async ({ file }) => {
    const allowed = ["image/jpeg", "image/png", "image/jpg", "image/webp"];
    if (!allowed.includes(file.type)) {
      antMessage.error("Only JPG, PNG, or WebP images allowed.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      antMessage.error("Image must be under 5MB.");
      return;
    }
    setUploading(true);
    const formData = new FormData();
    formData.append("profilePicture", file);
    try {
      await api.post("/users/profile/picture", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      antMessage.success("Profile picture updated!");
      window.location.reload(); // refresh user data
    } catch (err) {
      antMessage.error(err.response?.data?.message || "Upload failed.");
    } finally {
      setUploading(false);
    }
  };

  const avatarSrc = user?.profilePicture
    ? `${import.meta.env.VITE_API_URL?.replace("/api", "")}${user.profilePicture}`
    : null;

  const tabItems = [
    {
      key: "profile",
      label: "Profile Information",
      children: (
        <Form
          form={profileForm}
          layout="vertical"
          onFinish={handleProfileSave}
          requiredMark={false}
          size="large"
        >
          <Row gutter={[16, 0]}>
            <Col xs={24} sm={12}>
              <Form.Item
                name="name"
                label="Full Name"
                rules={[{ required: true, message: "Name is required" }, { min: 2 }]}
              >
                <Input prefix={<UserOutlined />} placeholder="Your full name" style={{ borderRadius: 8 }} />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item name="email" label="Email Address">
                <Input
                  prefix={<MailOutlined />}
                  disabled
                  style={{ borderRadius: 8, background: "#fafafa" }}
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item name="phone" label="Phone Number">
                <Input prefix={<PhoneOutlined />} placeholder="+1 (555) 000-0000" style={{ borderRadius: 8 }} />
              </Form.Item>
            </Col>
            <Col xs={24}>
              <Form.Item name="address" label="Address">
                <Input prefix={<HomeOutlined />} placeholder="Your address" style={{ borderRadius: 8 }} />
              </Form.Item>
            </Col>
          </Row>

          <Button
            type="primary" htmlType="submit" loading={loading}
            icon={<SaveOutlined />}
            style={{ borderRadius: 8, height: 44 }}
          >
            Save Changes
          </Button>
        </Form>
      ),
    },
    {
      key: "password",
      label: "Change Password",
      children: (
        <Form
          form={passwordForm}
          layout="vertical"
          onFinish={handlePasswordChange}
          requiredMark={false}
          size="large"
          style={{ maxWidth: 420 }}
        >
          <Form.Item
            name="currentPassword"
            label="Current Password"
            rules={[{ required: true, message: "Enter your current password" }]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="Current password" style={{ borderRadius: 8 }} />
          </Form.Item>

          <Form.Item
            name="newPassword"
            label="New Password"
            rules={[
              { required: true, message: "Enter a new password" },
              { min: 6, message: "Password must be at least 6 characters" },
            ]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="New password" style={{ borderRadius: 8 }} />
          </Form.Item>

          <Form.Item
            name="confirmPassword"
            label="Confirm New Password"
            dependencies={["newPassword"]}
            rules={[
              { required: true, message: "Please confirm your new password" },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue("newPassword") === value) return Promise.resolve();
                  return Promise.reject(new Error("Passwords do not match"));
                },
              }),
            ]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="Confirm new password" style={{ borderRadius: 8 }} />
          </Form.Item>

          <Button
            type="primary" htmlType="submit" loading={loading}
            icon={<LockOutlined />}
            style={{ borderRadius: 8, height: 44 }}
          >
            Update Password
          </Button>
        </Form>
      ),
    },
  ];

  return (
    <div>
      <Title level={3} style={{ marginBottom: 24 }}>My Profile</Title>

      {error && (
        <Alert message={error} type="error" showIcon closable
          onClose={() => dispatch(clearError())} style={{ marginBottom: 20, borderRadius: 8 }} />
      )}

      <Row gutter={[24, 24]}>
        {/* Avatar Card */}
        <Col xs={24} md={8} lg={6}>
          <Card style={{ borderRadius: 16, textAlign: "center" }} bodyStyle={{ padding: 32 }}>
            <div style={{ position: "relative", display: "inline-block", marginBottom: 16 }}>
              <Avatar
                size={120}
                src={avatarSrc}
                icon={!avatarSrc ? <UserOutlined /> : null}
                style={{ background: "#e6f7ff", color: "#1890ff", fontSize: 48 }}
              />
              <Upload
                showUploadList={false}
                customRequest={handleAvatarUpload}
                accept="image/*"
              >
                <Button
                  shape="circle"
                  icon={<CameraOutlined />}
                  size="small"
                  loading={uploading}
                  style={{
                    position: "absolute", bottom: 0, right: 0,
                    background: "#1890ff", border: "2px solid white",
                    color: "white",
                  }}
                />
              </Upload>
            </div>
            <Title level={4} style={{ margin: 0 }}>{user?.name}</Title>
            <Text type="secondary" style={{ fontSize: 13 }}>{user?.email}</Text>
            <br />
            <Text
              style={{
                display: "inline-block", marginTop: 8, padding: "2px 12px",
                borderRadius: 20, background: "#e6f7ff", color: "#1890ff",
                fontSize: 12, fontWeight: 600, textTransform: "capitalize",
              }}
            >
              {user?.role}
            </Text>
          </Card>
        </Col>

        {/* Forms */}
        <Col xs={24} md={16} lg={18}>
          <Card style={{ borderRadius: 16 }}>
            <Tabs items={tabItems} />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default UserProfile;
