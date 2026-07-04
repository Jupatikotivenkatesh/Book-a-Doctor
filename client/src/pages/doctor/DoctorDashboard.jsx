import React, { useEffect } from "react";
import {
  Row, Col, Card, Typography, Button, Avatar, Space,
  List, Tag, Skeleton,
} from "antd";
import {
  CalendarOutlined, UserOutlined, ClockCircleOutlined,
  CheckCircleOutlined, ArrowRightOutlined, BellOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchMyDoctorProfile, fetchDoctorAppointments } from "../../redux/slices/doctorSlice";
import { fetchUnreadCount } from "../../redux/slices/notificationSlice";
import StatusBadge from "../../components/common/StatusBadge";

const { Title, Text } = Typography;

const StatCard = ({ title, value, icon, color }) => (
  <Card style={{ borderRadius: 16, borderLeft: `4px solid ${color}` }} bodyStyle={{ padding: 20 }}>
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
      <div>
        <Text type="secondary" style={{ fontSize: 13 }}>{title}</Text>
        <Title level={2} style={{ margin: 0, color }}>{value}</Title>
      </div>
      <div style={{
        width: 48, height: 48, borderRadius: 12, background: `${color}1a`,
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        {React.cloneElement(icon, { style: { fontSize: 22, color } })}
      </div>
    </div>
  </Card>
);

const DoctorDashboard = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { myProfile, appointments, loading } = useSelector((state) => state.doctors);
  const { unreadCount } = useSelector((state) => state.notifications);

  useEffect(() => {
    dispatch(fetchMyDoctorProfile());
    dispatch(fetchDoctorAppointments({ limit: 5 }));
    dispatch(fetchUnreadCount());
  }, [dispatch]);

  const pending   = appointments.filter((a) => a.status === "pending").length;
  const approved  = appointments.filter((a) => a.status === "approved").length;
  const completed = appointments.filter((a) => a.status === "completed").length;

  return (
    <div>
      {/* Welcome Banner */}
      <Card
        style={{
          borderRadius: 20, marginBottom: 24,
          background: "linear-gradient(135deg, #001529, #003a8c)", border: "none",
        }}
        bodyStyle={{ padding: "28px 32px" }}
      >
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} sm={16}>
            <Space size={16}>
              <Avatar size={64} icon={<UserOutlined />}
                style={{ background: "#1890ff", fontSize: 28 }} />
              <div>
                <Text style={{ color: "#adc6ff" }}>Welcome back,</Text>
                <Title level={3} style={{ color: "#fff", margin: "2px 0 0" }}>
                  Dr. {myProfile?.firstName || user?.name} 👋
                </Title>
                {myProfile?.specialization && (
                  <Tag color="blue" style={{ marginTop: 4 }}>{myProfile.specialization}</Tag>
                )}
              </div>
            </Space>
          </Col>
          <Col xs={24} sm={8} style={{ textAlign: "right" }}>
            <Button type="primary" onClick={() => navigate("/doctor/appointments")}
              icon={<CalendarOutlined />} style={{ borderRadius: 10 }} block>
              View Appointments
            </Button>
            {unreadCount > 0 && (
              <Button ghost onClick={() => navigate("/doctor/notifications")}
                icon={<BellOutlined />}
                style={{ marginTop: 8, borderRadius: 10, borderColor: "rgba(255,255,255,0.4)", color: "white" }} block>
                {unreadCount} new notification{unreadCount > 1 ? "s" : ""}
              </Button>
            )}
          </Col>
        </Row>
      </Card>

      {/* Stats */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={12} sm={8}>
          <StatCard title="Pending" value={pending} icon={<ClockCircleOutlined />} color="#faad14" />
        </Col>
        <Col xs={12} sm={8}>
          <StatCard title="Approved" value={approved} icon={<CalendarOutlined />} color="#1890ff" />
        </Col>
        <Col xs={12} sm={8}>
          <StatCard title="Completed" value={completed} icon={<CheckCircleOutlined />} color="#52c41a" />
        </Col>
      </Row>

      {/* Recent Appointments */}
      <Card
        title={<Space><CalendarOutlined style={{ color: "#1890ff" }} /><span>Recent Appointments</span></Space>}
        extra={<Button type="link" onClick={() => navigate("/doctor/appointments")} icon={<ArrowRightOutlined />}>View All</Button>}
        style={{ borderRadius: 16 }}
      >
        {loading ? <Skeleton active paragraph={{ rows: 4 }} /> :
          appointments.length === 0 ? (
            <Text type="secondary" style={{ padding: "24px 0", display: "block", textAlign: "center" }}>
              No appointments yet.
            </Text>
          ) : (
            <List
              dataSource={appointments.slice(0, 5)}
              renderItem={(apt) => (
                <List.Item actions={[<StatusBadge key="s" status={apt.status} />]}>
                  <List.Item.Meta
                    avatar={<Avatar icon={<UserOutlined />} style={{ background: "#e6f7ff", color: "#1890ff" }} />}
                    title={<Text strong>{apt.patientId?.name || "Patient"}</Text>}
                    description={
                      <Space size={12}>
                        <Space size={4}>
                          <CalendarOutlined style={{ fontSize: 11, color: "#8c8c8c" }} />
                          <Text type="secondary" style={{ fontSize: 12 }}>{apt.date}</Text>
                        </Space>
                        <Space size={4}>
                          <ClockCircleOutlined style={{ fontSize: 11, color: "#8c8c8c" }} />
                          <Text type="secondary" style={{ fontSize: 12 }}>{apt.time}</Text>
                        </Space>
                      </Space>
                    }
                  />
                </List.Item>
              )}
            />
          )}
      </Card>
    </div>
  );
};

export default DoctorDashboard;
