import React, { useEffect } from "react";
import {
  Row, Col, Card, Typography, Statistic, Button,
  Space, List, Avatar, Skeleton, Tag,
} from "antd";
import {
  TeamOutlined, MedicineBoxOutlined, CalendarOutlined,
  ClockCircleOutlined, CheckCircleOutlined, ArrowRightOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchDashboardStats, fetchDoctorApplications } from "../../redux/slices/adminSlice";
import StatusBadge from "../../components/common/StatusBadge";

const { Title, Text } = Typography;

const AdminDashboard = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { stats, doctorApplications, loading } = useSelector((state) => state.admin);

  useEffect(() => {
    dispatch(fetchDashboardStats());
    dispatch(fetchDoctorApplications({ status: "pending", limit: 5 }));
  }, [dispatch]);

  const statCards = stats
    ? [
        { title: "Total Patients",    value: stats.totalUsers,           icon: <TeamOutlined />,         color: "#1890ff", path: "/admin/users" },
        { title: "Active Doctors",    value: stats.totalDoctors,         icon: <MedicineBoxOutlined />,  color: "#52c41a", path: "/admin/doctors" },
        { title: "Total Appointments",value: stats.totalAppointments,    icon: <CalendarOutlined />,     color: "#722ed1", path: "/admin/appointments" },
        { title: "Pending Doctors",   value: stats.pendingDoctors,       icon: <ClockCircleOutlined />,  color: "#faad14", path: "/admin/doctors?status=pending" },
        { title: "Pending Apts",      value: stats.pendingAppointments,  icon: <ClockCircleOutlined />,  color: "#fa8c16", path: "/admin/appointments?status=pending" },
        { title: "Completed Apts",    value: stats.completedAppointments,icon: <CheckCircleOutlined />,  color: "#13c2c2", path: "/admin/appointments?status=completed" },
      ]
    : [];

  return (
    <div>
      <Title level={3} style={{ marginBottom: 24 }}>Admin Dashboard</Title>

      {/* Stats Grid */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        {loading && !stats
          ? Array.from({ length: 6 }).map((_, i) => (
              <Col xs={12} sm={8} md={4} key={i}>
                <Card loading style={{ borderRadius: 16 }} />
              </Col>
            ))
          : statCards.map((s) => (
              <Col xs={12} sm={8} md={4} key={s.title}>
                <Card
                  hoverable onClick={() => navigate(s.path)}
                  style={{ borderRadius: 16, textAlign: "center", cursor: "pointer", borderTop: `4px solid ${s.color}` }}
                  bodyStyle={{ padding: 16 }}
                >
                  <div style={{ color: s.color, fontSize: 24, marginBottom: 6 }}>{s.icon}</div>
                  <Title level={2} style={{ margin: 0, color: s.color }}>{s.value}</Title>
                  <Text type="secondary" style={{ fontSize: 12 }}>{s.title}</Text>
                </Card>
              </Col>
            ))}
      </Row>

      {/* Pending Doctor Applications */}
      <Card
        title={
          <Space>
            <MedicineBoxOutlined style={{ color: "#faad14" }} />
            <span>Pending Doctor Applications</span>
            {stats?.pendingDoctors > 0 && (
              <Tag color="warning">{stats.pendingDoctors} pending</Tag>
            )}
          </Space>
        }
        extra={
          <Button type="link" onClick={() => navigate("/admin/doctors")} icon={<ArrowRightOutlined />}>
            View All
          </Button>
        }
        style={{ borderRadius: 16 }}
      >
        {loading ? (
          <Skeleton active paragraph={{ rows: 4 }} />
        ) : doctorApplications.length === 0 ? (
          <Text type="secondary" style={{ padding: "24px 0", display: "block", textAlign: "center" }}>
            No pending applications.
          </Text>
        ) : (
          <List
            dataSource={doctorApplications.slice(0, 5)}
            renderItem={(doc) => (
              <List.Item actions={[<StatusBadge key="s" status={doc.status} />]}>
                <List.Item.Meta
                  avatar={<Avatar icon={<UserOutlined />} style={{ background: "#e6f7ff", color: "#1890ff" }} />}
                  title={<Text strong>Dr. {doc.firstName} {doc.lastName}</Text>}
                  description={
                    <Space size={8}>
                      <Tag color="blue">{doc.specialization}</Tag>
                      <Text type="secondary" style={{ fontSize: 12 }}>{doc.experience} yrs exp</Text>
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

export default AdminDashboard;
