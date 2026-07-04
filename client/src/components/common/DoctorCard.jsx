import React, { useState } from "react";
import { Card, Avatar, Typography, Rate, Tag, Button, Space, Tooltip } from "antd";
import {
  UserOutlined, DollarOutlined,
  ClockCircleOutlined, ArrowRightOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";

const { Title, Text, Paragraph } = Typography;

// ─── Build a safe absolute image URL ─────────────────────────────────────────
const getAvatarSrc = (doctor) => {
  const base =
    (import.meta.env.VITE_API_URL || "http://localhost:5000/api").replace("/api", "");
  const pic = doctor.profilePicture || doctor.userId?.profilePicture;
  if (!pic) return null;
  if (pic.startsWith("http")) return pic;
  return `${base}${pic}`;
};

const DoctorCard = ({ doctor }) => {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const [imgError, setImgError] = useState(false);

  if (!doctor) return null;

  const avatarSrc = !imgError ? getAvatarSrc(doctor) : null;

  const handleBook = (e) => {
    e.stopPropagation();
    if (!user) { navigate("/login"); return; }
    navigate(`/book/${doctor._id}`);
  };

  return (
    <Card
      hoverable
      onClick={() => navigate(`/doctors/${doctor._id}`)}
      className="doctor-card"
      style={{ borderRadius: 16, overflow: "hidden", height: "100%", cursor: "pointer" }}
      bodyStyle={{ padding: 20 }}
    >
      {/* ─── Header: avatar + name ─── */}
      <div style={{ display: "flex", alignItems: "flex-start", gap: 14, marginBottom: 14 }}>
        <Avatar
          size={68}
          src={avatarSrc}
          icon={!avatarSrc ? <UserOutlined /> : null}
          style={{ background: "#e6f7ff", color: "#1890ff", flexShrink: 0, fontSize: 26 }}
          onError={() => { setImgError(true); return false; }}
        />
        <div style={{ flex: 1, minWidth: 0 }}>
          <Title
            level={5}
            style={{ margin: 0, lineHeight: 1.4, fontSize: 14 }}
            ellipsis={{ tooltip: `Dr. ${doctor.firstName} ${doctor.lastName}` }}
          >
            Dr. {doctor.firstName} {doctor.lastName}
          </Title>
          <Tag color="blue" style={{ marginTop: 5, borderRadius: 20, fontSize: 11 }}>
            {doctor.specialization}
          </Tag>
        </div>
      </div>

      {/* ─── Stats ─── */}
      <Space wrap size={12} style={{ marginBottom: 10, width: "100%" }}>
        <Tooltip title="Years of experience">
          <Space size={4}>
            <ClockCircleOutlined style={{ color: "#1890ff", fontSize: 12 }} />
            <Text type="secondary" style={{ fontSize: 12 }}>
              {doctor.experience} yrs exp
            </Text>
          </Space>
        </Tooltip>
        <Tooltip title="Consultation fee">
          <Space size={4}>
            <DollarOutlined style={{ color: "#52c41a", fontSize: 12 }} />
            <Text type="secondary" style={{ fontSize: 12 }}>
              ${doctor.feePerConsultation}
            </Text>
          </Space>
        </Tooltip>
      </Space>

      {/* ─── Rating ─── */}
      {doctor.totalRatings > 0 && (
        <div style={{ marginBottom: 10 }}>
          <Rate
            disabled
            value={doctor.averageRating}
            allowHalf
            style={{ fontSize: 12 }}
          />
          <Text type="secondary" style={{ fontSize: 11, marginLeft: 5 }}>
            ({doctor.totalRatings})
          </Text>
        </div>
      )}

      {/* ─── Address ─── */}
      {doctor.address && (
        <Paragraph
          type="secondary"
          style={{ fontSize: 11, marginBottom: 14 }}
          ellipsis={{ rows: 1, tooltip: doctor.address }}
        >
          📍 {doctor.address}
        </Paragraph>
      )}

      {/* ─── Actions ─── */}
      <Space style={{ width: "100%", justifyContent: "space-between" }}>
        <Button
          type="link"
          size="small"
          icon={<ArrowRightOutlined />}
          style={{ padding: 0, color: "#1890ff", fontSize: 12 }}
        >
          View Profile
        </Button>
        <Button
          type="primary"
          size="small"
          onClick={handleBook}
          style={{ borderRadius: 20, fontSize: 12 }}
        >
          Book Now
        </Button>
      </Space>
    </Card>
  );
};

export default DoctorCard;
