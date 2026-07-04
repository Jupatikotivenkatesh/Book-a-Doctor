import React, { useEffect } from "react";
import {
  Row, Col, Card, Avatar, Typography, Button, Rate, Tag,
  Space, Divider, Timeline, Descriptions, Skeleton, Alert,
} from "antd";
import {
  UserOutlined, EnvironmentOutlined, PhoneOutlined,
  GlobalOutlined, DollarOutlined, ClockCircleOutlined,
  StarOutlined, CalendarOutlined, ArrowLeftOutlined,
  CheckCircleOutlined, MedicineBoxOutlined,
} from "@ant-design/icons";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchDoctorById, clearDoctorError } from "../redux/slices/doctorSlice";

const { Title, Text, Paragraph } = Typography;

const DAYS_ORDER = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

const DoctorDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { selectedDoctor: doctor, loading, error } = useSelector((state) => state.doctors);
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(fetchDoctorById(id));
    return () => dispatch(clearDoctorError());
  }, [dispatch, id]);

  const handleBook = () => {
    if (!user) {
      navigate("/login", { state: { from: { pathname: `/book/${id}` } } });
      return;
    }
    navigate(`/book/${id}`);
  };

  const avatarSrc = doctor?.profilePicture
    ? `${import.meta.env.VITE_API_URL?.replace("/api", "")}${doctor.profilePicture}`
    : doctor?.userId?.profilePicture
    ? `${import.meta.env.VITE_API_URL?.replace("/api", "")}${doctor.userId.profilePicture}`
    : null;

  const sortedTimings = doctor?.timings
    ? [...doctor.timings].sort((a, b) => DAYS_ORDER.indexOf(a.day) - DAYS_ORDER.indexOf(b.day))
    : [];

  if (loading) {
    return (
      <div style={{ background: "#f8fbff", minHeight: "100vh", padding: "32px 24px" }}>
        <div className="page-container">
          <Skeleton active avatar paragraph={{ rows: 8 }} />
        </div>
      </div>
    );
  }

  if (error || !doctor) {
    return (
      <div style={{ background: "#f8fbff", minHeight: "100vh", padding: "32px 24px" }}>
        <div className="page-container">
          <Alert
            message={error || "Doctor not found"}
            type="error"
            showIcon
            action={
              <Button type="primary" onClick={() => navigate("/doctors")}>
                Back to Doctors
              </Button>
            }
          />
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: "#f8fbff", minHeight: "100vh" }}>
      {/* ─── Banner ─── */}
      <div style={{
        background: "linear-gradient(135deg, #001529 0%, #003a8c 100%)",
        padding: "32px 24px 80px",
      }}>
        <div className="page-container">
          <Button
            icon={<ArrowLeftOutlined />}
            ghost
            onClick={() => navigate("/doctors")}
            style={{ marginBottom: 20, borderRadius: 8 }}
          >
            Back to Doctors
          </Button>
        </div>
      </div>

      {/* ─── Profile Card overlapping banner ─── */}
      <div className="page-container" style={{ marginTop: -60, padding: "0 24px 40px" }}>
        <Card style={{ borderRadius: 20, boxShadow: "0 8px 32px rgba(0,0,0,0.1)", marginBottom: 24 }}>
          <Row gutter={[32, 24]} align="middle">
            {/* Avatar */}
            <Col xs={24} sm="auto" style={{ textAlign: "center" }}>
              <Avatar
                size={120}
                src={avatarSrc}
                icon={!avatarSrc ? <UserOutlined /> : null}
                style={{ background: "#e6f7ff", color: "#1890ff", fontSize: 48 }}
              />
              {doctor.isAvailable !== false && (
                <Tag color="success" style={{ marginTop: 10, display: "block", width: "fit-content", margin: "10px auto 0" }}>
                  <CheckCircleOutlined /> Available
                </Tag>
              )}
            </Col>

            {/* Info */}
            <Col xs={24} sm={14} md={16}>
              <Title level={2} style={{ marginBottom: 4 }}>
                Dr. {doctor.firstName} {doctor.lastName}
              </Title>
              <Space wrap style={{ marginBottom: 12 }}>
                <Tag color="blue" style={{ borderRadius: 20, fontSize: 14, padding: "2px 12px" }}>
                  {doctor.specialization}
                </Tag>
                <Tag color="green" style={{ borderRadius: 20, fontSize: 14, padding: "2px 12px" }}>
                  {doctor.experience} Years Experience
                </Tag>
              </Space>

              <Space wrap size={24} style={{ marginBottom: 16 }}>
                <Space size={6}>
                  <DollarOutlined style={{ color: "#52c41a" }} />
                  <Text strong>${doctor.feePerConsultation} / consultation</Text>
                </Space>
                {doctor.phone && (
                  <Space size={6}>
                    <PhoneOutlined style={{ color: "#1890ff" }} />
                    <Text>{doctor.phone}</Text>
                  </Space>
                )}
                {doctor.address && (
                  <Space size={6}>
                    <EnvironmentOutlined style={{ color: "#fa8c16" }} />
                    <Text>{doctor.address}</Text>
                  </Space>
                )}
              </Space>

              {doctor.totalRatings > 0 && (
                <Space>
                  <Rate disabled allowHalf defaultValue={doctor.averageRating} style={{ fontSize: 16 }} />
                  <Text type="secondary">
                    {doctor.averageRating.toFixed(1)} ({doctor.totalRatings} reviews)
                  </Text>
                </Space>
              )}
            </Col>

            {/* Book button */}
            <Col xs={24} sm="auto" style={{ textAlign: "center" }}>
              <Button
                type="primary"
                size="large"
                onClick={handleBook}
                icon={<CalendarOutlined />}
                style={{ height: 52, padding: "0 32px", fontSize: 16, borderRadius: 12 }}
                block
              >
                Book Appointment
              </Button>
              {!user && (
                <Text type="secondary" style={{ display: "block", marginTop: 8, fontSize: 12 }}>
                  Login required to book
                </Text>
              )}
            </Col>
          </Row>
        </Card>

        <Row gutter={[24, 24]}>
          {/* Left Column */}
          <Col xs={24} lg={16}>
            {/* Qualifications */}
            {doctor.qualifications?.length > 0 && (
              <Card
                title={
                  <Space>
                    <MedicineBoxOutlined style={{ color: "#1890ff" }} />
                    <span>Qualifications</span>
                  </Space>
                }
                style={{ borderRadius: 16, marginBottom: 24 }}
              >
                <Timeline
                  items={doctor.qualifications.map((q) => ({
                    color: "blue",
                    children: (
                      <div>
                        <Text strong style={{ fontSize: 15 }}>{q.degree}</Text>
                        <br />
                        <Text type="secondary">{q.institution}</Text>
                        {q.year && <Tag style={{ marginLeft: 8, fontSize: 11 }}>{q.year}</Tag>}
                      </div>
                    ),
                  }))}
                />
              </Card>
            )}

            {/* About / Website */}
            {doctor.website && (
              <Card
                title="Online Presence"
                style={{ borderRadius: 16, marginBottom: 24 }}
              >
                <Space>
                  <GlobalOutlined style={{ color: "#1890ff" }} />
                  <a href={doctor.website} target="_blank" rel="noopener noreferrer">
                    {doctor.website}
                  </a>
                </Space>
              </Card>
            )}
          </Col>

          {/* Right Column */}
          <Col xs={24} lg={8}>
            {/* Availability */}
            {sortedTimings.length > 0 && (
              <Card
                title={
                  <Space>
                    <ClockCircleOutlined style={{ color: "#1890ff" }} />
                    <span>Available Hours</span>
                  </Space>
                }
                style={{ borderRadius: 16, marginBottom: 24 }}
              >
                {sortedTimings.map((timing) => (
                  <div
                    key={timing.day}
                    style={{
                      display: "flex", justifyContent: "space-between",
                      padding: "8px 0", borderBottom: "1px solid #f0f0f0",
                    }}
                  >
                    <Text strong style={{ fontSize: 13 }}>{timing.day}</Text>
                    <Text type="secondary" style={{ fontSize: 13 }}>
                      {timing.startTime} – {timing.endTime}
                    </Text>
                  </div>
                ))}
              </Card>
            )}

            {/* Quick Info */}
            <Card style={{ borderRadius: 16 }}>
              <Descriptions column={1} size="small">
                <Descriptions.Item label="Specialization">
                  <Tag color="blue">{doctor.specialization}</Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Experience">
                  {doctor.experience} years
                </Descriptions.Item>
                <Descriptions.Item label="Consultation Fee">
                  <Text strong style={{ color: "#52c41a" }}>${doctor.feePerConsultation}</Text>
                </Descriptions.Item>
                {doctor.totalRatings > 0 && (
                  <Descriptions.Item label="Rating">
                    <Space>
                      <StarOutlined style={{ color: "#faad14" }} />
                      <Text>{doctor.averageRating.toFixed(1)}/5</Text>
                    </Space>
                  </Descriptions.Item>
                )}
              </Descriptions>

              <Divider style={{ margin: "16px 0" }} />

              <Button
                type="primary"
                block
                size="large"
                onClick={handleBook}
                icon={<CalendarOutlined />}
                style={{ borderRadius: 8 }}
              >
                Book Now
              </Button>
            </Card>
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default DoctorDetail;
