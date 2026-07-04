import React from "react";
import { Empty, Button } from "antd";

const EmptyState = ({
  description = "No data found",
  image = Empty.PRESENTED_IMAGE_SIMPLE,
  actionText,
  onAction,
  style,
}) => (
  <div style={{ padding: "48px 24px", textAlign: "center", ...style }}>
    <Empty
      image={image}
      description={<span style={{ color: "#8c8c8c", fontSize: 15 }}>{description}</span>}
    >
      {actionText && onAction && (
        <Button type="primary" onClick={onAction} size="large" style={{ marginTop: 8 }}>
          {actionText}
        </Button>
      )}
    </Empty>
  </div>
);

export default EmptyState;
