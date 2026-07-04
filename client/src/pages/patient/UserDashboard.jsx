import React, { useEffect } from "react";
import {
  Row, Col, Card, Typography, Button, Avatar, Space,
  Statistic, Tag, Divider, List, Skeleton,
} from "antd";
import {
  CalendarOutlined, MedicineBoxOutlined, BellOutlined,
  UserOutlined, ArrowRightOutlined, ClockCircleOutlined,
  CheckCircleOutlined, SolutionOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchMyAppointments } from "../../redux/slices/appointmentSlice";
import { fetchUnreadCount } from "../../redux/slices/notificationSlice";
import StatusBadge from "../../components/common/StatusBadge";

const { Title, Text, Paragraph } = Typography;

const StatCard = ({ title, value, icon, color, onClick, loading }) => (
  <Card
    hoverable={!!onClick}
    onClick={onClick}
    style={{ borderRadius: 16, cursor: onClick ? "pointer" : "default", borderLeft: `4px solid ${color}` }}
    bodyStyle={{ padding: 20 }}
    loading={loading}
  >
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
      <div>
        <Text type="secondary" style={{ fontSize: 13, display: "block", marginBottom: 4 }}>{title}</Text>
        <Title level={2} style={{ margin: 0, color }}>{value}</Title>
      </div>
      <div style={{
        width: 52, height: 52, borderRadius: 12,
        background: `${color}1a`,
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        {React.cloneElement(icon, { style: { fontSize: 24, color } })}
      </div>
    </div>
  </Card>
);

const UserDashboard = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { appointments, loading } = useSelector((state) => state.appointments);
  const { unreadCount } = useSelector((state) => state.notifications);

  useEffect(() => {
    dispatch(fetchMyAppointments({ limit: 5 }));
    dispatch(fetchUnreadCount());
  }, [dispatch]);

  const pending   = appointments.filter((a) => a.status === "pending").length;
  const upcoming  = appointments.filter((a) => a.status === "approved").length;
  const completed = appointments.filter((a) => a.status === "completed").length;
  const recent    = [...appointments].slice(0, 5);

  const avatarSrc = user?.profilePicture
    ? `${import.meta.env.VITE_API_URL?.replace("/api", "")}${user.profilePicture}`
    : null;

  const getGreeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 18) return "Good afternoon";
    return "Good evening";
  };

  return (
    <div>
      {/* ─── Welcome ─── */}
      <Card
        style={{
          borderRadius: 20, marginBottom: 24,
          background: "linear-gradient(135deg, #001529 0%, #003a8c 100%)",
          border: "none",
        }}
        bodyStyle={{ padding: "28px 32px" }}
      >
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} sm={16}>
            <Space size={16}>
              <Avatar
                size={64}
                src={avatarSrc}
                icon={!avatarSrc ? <UserOutlined /> : null}
                style={{ background: "#1890ff", fontSize: 28, flexShrink: 0 }}
              />
              <div>
                <Text style={{ color: "#adc6ff", fontSize: 14 }}>{getGreeting()},</Text>
                <Title level={3} style={{ color: "#ffffff", margin: "2px 0 0" }}>
                  {user?.name} 👋
                </Title>
                <Text style={{ color: "#adc6ff", fontSize: 13 }}>
                  Manage your appointments and health records
                </Text>
              </div>
            </Space>
          </Col>
          <Col xs={24} sm={8} style={{ textAlign: "right" }}>
            <Space direction="vertical" style={{ width: "100%" }}>
              <Button
                type="primary" size="large"
                icon={<CalendarOutlined />}
                onClick={() => navigate("/doctors")}
                style={{ borderRadius: 10, background: "#1890ff" }}
                block
              >
                Book Appointment
              </Button>
              {unreadCount > 0 && (
                <Button
                  ghost size="middle"
                  icon={<BellOutlined />}
                  onClick={() => navigate("/notifications")}
                  style={{ borderRadius: 10, borderColor: "rgba(255,255,255,0.4)", color: "white" }}
                  block
                >
                  {unreadCount} new notification{unreadCount > 1 ? "s" : ""}
                </Button>
              )}
            </Space>
          </Col>
        </Row>
      </Card>

      {/* ─── Stats ─── */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={12} sm={6}>
          <StatCard
            title="Pending" value={pending}
            icon={<ClockCircleOutlined />} color="#faad14"
            onClick={() => navigate("/appointments?status=pending")}
            loading={loading}
          />
        </Col>
        <Col xs={12} sm={6}>
          <StatCard
            title="Upcoming" value={upcoming}
            icon={<CalendarOutlined />} color="#1890ff"
            onClick={() => navigate("/appointments?status=approved")}
            loading={loading}
          />
        </Col>
        <Col xs={12} sm={6}>
          <StatCard
            title="Completed" value={completed}
            icon={<CheckCircleOutlined />} color="#52c41a"
            onClick={() => navigate("/appointments?status=completed")}
            loading={loading}
          />
        </Col>
        <Col xs={12} sm={6}>
          <StatCard
            title="Notifications" value={unreadCount}
            icon={<BellOutlined />} color="#722ed1"
            onClick={() => navigate("/notifications")}
          />
        </Col>
      </Row>

      {/* ─── Quick Actions ─── */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        {[
          { icon: <MedicineBoxOutlined />, label: "Find a Doctor", desc: "Browse specialists", path: "/doctors", color: "#1890ff" },
          { icon: <CalendarOutlined />, label: "My Appointments", desc: "View all bookings", path: "/appointments", color: "#52c41a" },
          { icon: <BellOutlined />, label: "Notifications", desc: "Stay up to date", path: "/notifications", color: "#722ed1" },
          { icon: <SolutionOutlined />, label: "Become a Doctor", desc: "Apply to join", path: "/apply-doctor", color: "#fa8c16" },
        ].map((action) => (
          <Col xs={12} sm={6} key={action.path}>
            <Card
              hoverable
              onClick={() => navigate(action.path)}
              style={{ borderRadius: 14, textAlign: "center", cursor: "pointer" }}
              bodyStyle={{ padding: 16 }}
            >
              <div style={{
                width: 48, height: 48, borderRadius: 12,
                background: `${action.color}1a`,
                display: "flex", alignItems: "center", justifyContent: "center",
                margin: "0 auto 10px",
              }}>
                {React.cloneElement(action.icon, { style: { fontSize: 22, color: action.color } })}
              </div>
              <Text strong style={{ display: "block", fontSize: 13 }}>{action.label}</Text>
              <Text type="secondary" style={{ fontSize: 11 }}>{action.desc}</Text>
            </Card>
          </Col>
        ))}
      </Row>

      {/* ─── Recent Appointments ─── */}
      <Card
        title={<Space><CalendarOutlined style={{ color: "#1890ff" }} /><span>Recent Appointments</span></Space>}
        extra={
          <Button type="link" onClick={() => navigate("/appointments")} icon={<ArrowRightOutlined />}>
            View All
          </Button>
        }
        style={{ borderRadius: 16 }}
      >
        {loading ? (
          <Skeleton active paragraph={{ rows: 4 }} />
        ) : recent.length === 0 ? (
          <div style={{ textAlign: "center", padding: "32px 0" }}>
            <CalendarOutlined style={{ fontSize: 48, color: "#bfbfbf", display: "block", marginBottom: 12 }} />
            <Text type="secondary" style={{ fontSize: 15 }}>No appointments yet</Text>
            <br />
            <Button
              type="primary" style={{ marginTop: 16 }}
              onClick={() => navigate("/doctors")}
            >
              Book Your First Appointment
            </Button>
          </div>
        ) : (
          <List
            dataSource={recent}
            renderItem={(apt) => {
              const doctor = apt.doctorId;
              const doctorName = doctor
                ? `Dr. ${doctor.firstName} ${doctor.lastName}`
                : "Unknown Doctor";
              return (
                <List.Item
                  style={{ padding: "12px 0", cursor: "pointer" }}
                  onClick={() => navigate(`/appointments/${apt._id}`)}
                  actions={[<StatusBadge key="status" status={apt.status} />]}
                >
                  <List.Item.Meta
                    avatar={
                      <Avatar
                        icon={<UserOutlined />}
                        style={{ background: "#e6f7ff", color: "#1890ff" }}
                      />
                    }
                    title={<Text strong>{doctorName}</Text>}
                    description={
                      <Space size={12}>
                        <Space size={4}>
                          <CalendarOutlined style={{ fontSize: 12, color: "#8c8c8c" }} />
                          <Text type="secondary" style={{ fontSize: 12 }}>{apt.date}</Text>
                        </Space>
                        <Space size={4}>
                          <ClockCircleOutlined style={{ fontSize: 12, color: "#8c8c8c" }} />
                          <Text type="secondary" style={{ fontSize: 12 }}>{apt.time}</Text>
                        </Space>
                      </Space>
                    }
                  />
                </List.Item>
              );
            }}
          />
        )}
      </Card>
    </div>
  );
};

export default UserDashboard;
