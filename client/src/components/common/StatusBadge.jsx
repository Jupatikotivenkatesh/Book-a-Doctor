import React from "react";
import { Tag } from "antd";

const statusConfig = {
  pending:   { color: "warning",  label: "Pending" },
  approved:  { color: "success",  label: "Approved" },
  rejected:  { color: "error",    label: "Rejected" },
  completed: { color: "blue",     label: "Completed" },
  cancelled: { color: "default",  label: "Cancelled" },
};

const StatusBadge = ({ status, style }) => {
  const config = statusConfig[status] || { color: "default", label: status };
  return (
    <Tag color={config.color} style={{ borderRadius: 20, padding: "2px 10px", fontWeight: 500, ...style }}>
      {config.label}
    </Tag>
  );
};

export default StatusBadge;
