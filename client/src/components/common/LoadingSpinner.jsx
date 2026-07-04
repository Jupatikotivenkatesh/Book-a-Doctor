import React from "react";
import { Spin } from "antd";
import { LoadingOutlined } from "@ant-design/icons";

const LoadingSpinner = ({ size = "large", tip = "Loading...", fullscreen = false }) => {
  const indicator = <LoadingOutlined style={{ fontSize: size === "large" ? 40 : 24 }} spin />;

  if (fullscreen) {
    return (
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "center",
        minHeight: "60vh", flexDirection: "column", gap: 16,
      }}>
        <Spin indicator={indicator} size={size} tip={tip} />
      </div>
    );
  }

  return <Spin indicator={indicator} size={size} tip={tip} />;
};

export default LoadingSpinner;
