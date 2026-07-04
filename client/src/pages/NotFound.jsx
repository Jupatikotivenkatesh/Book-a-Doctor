import React from "react";
import { Result, Button, Space } from "antd";
import { useNavigate } from "react-router-dom";
import { HomeOutlined, ArrowLeftOutlined } from "@ant-design/icons";

const NotFound = () => {
  const navigate = useNavigate();
  return (
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "center",
      minHeight: "80vh", padding: "24px",
    }}>
      <Result
        status="404"
        title="404 - Page Not Found"
        subTitle="The page you are looking for doesn't exist or has been moved."
        extra={
          <Space>
            <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)}>
              Go Back
            </Button>
            <Button type="primary" icon={<HomeOutlined />} onClick={() => navigate("/")}>
              Go Home
            </Button>
          </Space>
        }
      />
    </div>
  );
};

export default NotFound;
