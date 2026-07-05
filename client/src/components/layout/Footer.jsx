import React from "react";
import { Layout, Row, Col, Typography, Space, Divider } from "antd";
import { MedicineBoxOutlined, PhoneOutlined, MailOutlined } from "@ant-design/icons";
import { Link } from "react-router-dom";

const { Footer: AntFooter } = Layout;
const { Title, Text, Paragraph } = Typography;

const Footer = () => {
  return (
    <AntFooter style={{ background: "#001529", color: "#ffffff", padding: "48px 24px 24px" }}>
      <div className="page-container">
        <Row gutter={[32, 32]}>
          {/* Brand */}
          <Col xs={24} sm={12} md={8}>
            <Space align="center" style={{ marginBottom: 16 }}>
              <MedicineBoxOutlined style={{ fontSize: 28, color: "#1890ff" }} />
              <Title level={4} style={{ color: "#ffffff", margin: 0 }}>
                MediBook
              </Title>
            </Space>
            <Paragraph style={{ color: "#8c8c8c", lineHeight: 1.8 }}>
              Connecting patients with trusted healthcare professionals. Book appointments
              easily and manage your health journey in one place.
            </Paragraph>
          </Col>

          {/* Quick Links */}
          <Col xs={24} sm={12} md={8}>
            <Title level={5} style={{ color: "#ffffff", marginBottom: 16 }}>
              Quick Links
            </Title>
            <Space direction="vertical" size="small">
              {[
                { to: "/", label: "Home" },
                { to: "/doctors", label: "Find Doctors" },
                { to: "/login", label: "Login" },
                { to: "/register", label: "Register" },
              ].map((link) => (
                <Link key={link.to} to={link.to} style={{ color: "#8c8c8c" }}>
                  {link.label}
                </Link>
              ))}
            </Space>
          </Col>

          {/* Contact */}
          <Col xs={24} sm={12} md={8}>
            <Title level={5} style={{ color: "#ffffff", marginBottom: 16 }}>
              Contact Us
            </Title>
            <Space direction="vertical" size="small">
              <Space>
                <PhoneOutlined style={{ color: "#1890ff" }} />
                <Text style={{ color: "#8c8c8c" }}>+1 (800) 123-4567</Text>
              </Space>
              <Space>
                <MailOutlined style={{ color: "#1890ff" }} />
                <Text style={{ color: "#8c8c8c" }}>support@medibook.com</Text>
              </Space>
            </Space>
          </Col>
        </Row>

        <Divider style={{ borderColor: "#1f3352", margin: "32px 0 16px" }} />

        <Text style={{ color: "#8c8c8c", display: "block", textAlign: "center" }}>
          © {new Date().getFullYear()} Book a Doctor. All rights reserved.
        </Text>
      </div>
    </AntFooter>
  );
};

export default Footer;
