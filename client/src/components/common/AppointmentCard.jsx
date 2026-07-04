import React from "react";
import { Card, Avatar, Typography, Space, Button, Popconfirm, Divider, Tooltip } from "antd";
import {
  UserOutlined, CalendarOutlined, ClockCircleOutlined,
  FileTextOutlined, StarOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import StatusBadge from "./StatusBadge";
import dayjs from "dayjs";

const { Text, Title } = Typography;

const AppointmentCard = ({ appointment, onCancel, onRate, loading }) => {
  const navigate = useNavigate();
  if (!appointment) return null;

  const doctor = appointment.doctorId;
  const doctorName = doctor
    ? `Dr. ${doctor.firstName} ${doctor.lastName}`
    : "Unknown Doctor";

  const avatarSrc = doctor?.profilePicture
    ? `${import.meta.env.VITE_API_URL?.replace("/api", "")}${doctor.profilePicture}`
    : null;

  const isUpcoming = ["pending", "approved"].includes(appointment.status);
  const isCompleted = appointment.status === "completed";
  const canRate = isCompleted && !appointment.rating?.score;

  return (
    <Card
      style={{ borderRadius: 16, marginBottom: 16 }}
      bodyStyle={{ padding: "20px 24px" }}
      hoverable
    >
      <div style={{ display: "flex", alignItems: "flex-start", gap: 16, flexWrap: "wrap" }}>
        {/* Avatar */}
        <Avatar
          size={56}
          src={avatarSrc}
          icon={!avatarSrc ? <UserOutlined /> : null}
          style={{ background: "#e6f7ff", color: "#1890ff", flexShrink: 0 }}
        />

        {/* Main Info */}
        <div style={{ flex: 1, minWidth: 200 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 6 }}>
            <Title level={5} style={{ margin: 0 }}>{doctorName}</Title>
            <StatusBadge status={appointment.status} />
          </div>

          {doctor?.specialization && (
            <Text type="secondary" style={{ fontSize: 13, display: "block", marginBottom: 8 }}>
              {doctor.specialization}
            </Text>
          )}

          <Space wrap size={16}>
            <Space size={6}>
              <CalendarOutlined style={{ color: "#1890ff" }} />
              <Text style={{ fontSize: 13 }}>{appointment.date}</Text>
            </Space>
            <Space size={6}>
              <ClockCircleOutlined style={{ color: "#52c41a" }} />
              <Text style={{ fontSize: 13 }}>{appointment.time}</Text>
            </Space>
          </Space>

          {appointment.reason && (
            <Text type="secondary" style={{ fontSize: 12, display: "block", marginTop: 6 }}>
              Reason: {appointment.reason}
            </Text>
          )}

          {appointment.rejectionReason && (
            <Text type="danger" style={{ fontSize: 12, display: "block", marginTop: 4 }}>
              Rejection: {appointment.rejectionReason}
            </Text>
          )}
        </div>

        {/* Actions */}
        <Space direction="vertical" size="small" style={{ alignItems: "flex-end", flexShrink: 0 }}>
          <Button
            type="default"
            size="small"
            icon={<FileTextOutlined />}
            onClick={() => navigate(`/appointments/${appointment._id}`)}
          >
            Details
          </Button>

          {isUpcoming && onCancel && (
            <Popconfirm
              title="Cancel Appointment"
              description="Are you sure you want to cancel this appointment?"
              onConfirm={() => onCancel(appointment._id)}
              okText="Yes, Cancel"
              cancelText="No"
              okType="danger"
            >
              <Button type="default" danger size="small" loading={loading}>
                Cancel
              </Button>
            </Popconfirm>
          )}

          {canRate && onRate && (
            <Tooltip title="Rate this consultation">
              <Button
                type="primary"
                size="small"
                icon={<StarOutlined />}
                onClick={() => onRate(appointment)}
                ghost
              >
                Rate
              </Button>
            </Tooltip>
          )}

          {isCompleted && appointment.rating?.score && (
            <Space size={4}>
              <StarOutlined style={{ color: "#faad14" }} />
              <Text style={{ fontSize: 12, color: "#faad14" }}>
                {appointment.rating.score}/5
              </Text>
            </Space>
          )}
        </Space>
      </div>

      {/* Follow-up info */}
      {appointment.followUpDate && (
        <>
          <Divider style={{ margin: "12px 0" }} />
          <Text type="secondary" style={{ fontSize: 12 }}>
            🔔 Follow-up: {dayjs(appointment.followUpDate).format("MMM D, YYYY")}
            {appointment.followUpSummary && ` — ${appointment.followUpSummary}`}
          </Text>
        </>
      )}
    </Card>
  );
};

export default AppointmentCard;
