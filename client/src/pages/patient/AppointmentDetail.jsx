import React, { useEffect, useState } from "react";
import {
  Row, Col, Card, Typography, Button, Avatar, Tag, Space,
  Divider, Descriptions, Upload, Alert, Popconfirm,
  Skeleton, Timeline, message as antMessage,
} from "antd";
import {
  UserOutlined, CalendarOutlined, ClockCircleOutlined,
  UploadOutlined, ArrowLeftOutlined, FileTextOutlined,
  DollarOutlined, CheckCircleOutlined, FilePdfOutlined,
  FileImageOutlined, MedicineBoxOutlined,
} from "@ant-design/icons";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchAppointmentById, cancelAppointment, uploadDocuments, clearAppointmentError } from "../../redux/slices/appointmentSlice";
import StatusBadge from "../../components/common/StatusBadge";
import FileUploader from "../../components/common/FileUploader";
import dayjs from "dayjs";

const { Title, Text, Paragraph } = Typography;

const AppointmentDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { selectedAppointment: appointment, loading, uploadLoading, error } = useSelector(
    (state) => state.appointments
  );
  const { user } = useSelector((state) => state.auth);

  const [docFiles, setDocFiles] = useState([]);
  const [showUpload, setShowUpload] = useState(false);

  useEffect(() => {
    dispatch(fetchAppointmentById(id));
    return () => dispatch(clearAppointmentError());
  }, [dispatch, id]);

  const handleCancel = async () => {
    const result = await dispatch(cancelAppointment(id));
    if (cancelAppointment.fulfilled.match(result)) {
      antMessage.success("Appointment cancelled.");
      dispatch(fetchAppointmentById(id));
    }
  };

  const handleUploadDocs = async () => {
    if (docFiles.length === 0) {
      antMessage.warning("Please select at least one file.");
      return;
    }
    const formData = new FormData();
    docFiles.forEach((f) => formData.append("documents", f));
    const result = await dispatch(uploadDocuments({ id, formData }));
    if (uploadDocuments.fulfilled.match(result)) {
      antMessage.success("Documents uploaded successfully!");
      setDocFiles([]);
      setShowUpload(false);
      dispatch(fetchAppointmentById(id));
    }
  };

  const getFileIcon = (mimetype) => {
    if (mimetype?.includes("pdf")) return <FilePdfOutlined style={{ color: "#f5222d" }} />;
    if (mimetype?.includes("image")) return <FileImageOutlined style={{ color: "#1890ff" }} />;
    return <FileTextOutlined />;
  };

  if (loading && !appointment) {
    return (
      <div style={{ padding: "24px" }}>
        <Skeleton active avatar paragraph={{ rows: 8 }} />
      </div>
    );
  }

  if (error && !appointment) {
    return (
      <Alert
        message={error}
        type="error"
        showIcon
        action={<Button onClick={() => navigate(-1)}>Go Back</Button>}
      />
    );
  }

  if (!appointment) return null;

  const doctor = appointment.doctorId;
  const isOwner = appointment.patientId?._id === user?._id || appointment.patientId === user?._id;
  const isUpcoming = ["pending", "approved"].includes(appointment.status);
  const avatarSrc = doctor?.profilePicture
    ? `${import.meta.env.VITE_API_URL?.replace("/api", "")}${doctor.profilePicture}`
    : null;

  return (
    <div>
      <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)} style={{ marginBottom: 20 }}>
        Back
      </Button>

      <Title level={3} style={{ marginBottom: 24 }}>
        Appointment Details
        <StatusBadge status={appointment.status} style={{ marginLeft: 12 }} />
      </Title>

      {error && (
        <Alert message={error} type="error" showIcon closable
          onClose={() => dispatch(clearAppointmentError())} style={{ marginBottom: 20 }} />
      )}

      <Row gutter={[24, 24]}>
        {/* Left Column */}
        <Col xs={24} lg={16}>
          {/* Doctor Info */}
          <Card title="Doctor Information" style={{ borderRadius: 16, marginBottom: 24 }}>
            {doctor ? (
              <div style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
                <Avatar
                  size={72} src={avatarSrc}
                  icon={!avatarSrc ? <UserOutlined /> : null}
                  style={{ background: "#e6f7ff", color: "#1890ff", flexShrink: 0 }}
                />
                <div>
                  <Title level={4} style={{ margin: 0 }}>
                    Dr. {doctor.firstName} {doctor.lastName}
                  </Title>
                  <Tag color="blue" style={{ marginTop: 4 }}>{doctor.specialization}</Tag>
                  <Space style={{ marginTop: 8, display: "flex", flexWrap: "wrap" }} size={16}>
                    <Space size={4}>
                      <DollarOutlined style={{ color: "#52c41a" }} />
                      <Text>${doctor.feePerConsultation}</Text>
                    </Space>
                    {doctor.experience && (
                      <Space size={4}>
                        <ClockCircleOutlined style={{ color: "#1890ff" }} />
                        <Text>{doctor.experience} yrs experience</Text>
                      </Space>
                    )}
                  </Space>
                </div>
              </div>
            ) : (
              <Text type="secondary">Doctor information unavailable</Text>
            )}
          </Card>

          {/* Appointment Info */}
          <Card title="Appointment Information" style={{ borderRadius: 16, marginBottom: 24 }}>
            <Descriptions column={{ xs: 1, sm: 2 }} bordered size="small">
              <Descriptions.Item label="Date">
                <Space>
                  <CalendarOutlined style={{ color: "#1890ff" }} />
                  <Text strong>{appointment.date}</Text>
                </Space>
              </Descriptions.Item>
              <Descriptions.Item label="Time">
                <Space>
                  <ClockCircleOutlined style={{ color: "#52c41a" }} />
                  <Text strong>{appointment.time}</Text>
                </Space>
              </Descriptions.Item>
              <Descriptions.Item label="Status" span={2}>
                <StatusBadge status={appointment.status} />
              </Descriptions.Item>
              <Descriptions.Item label="Reason" span={2}>
                {appointment.reason || "—"}
              </Descriptions.Item>
              {appointment.symptoms && (
                <Descriptions.Item label="Symptoms" span={2}>
                  {appointment.symptoms}
                </Descriptions.Item>
              )}
              {appointment.feeCharged > 0 && (
                <Descriptions.Item label="Fee">
                  ${appointment.feeCharged}
                </Descriptions.Item>
              )}
              {appointment.rejectionReason && (
                <Descriptions.Item label="Rejection Reason" span={2}>
                  <Text type="danger">{appointment.rejectionReason}</Text>
                </Descriptions.Item>
              )}
            </Descriptions>
          </Card>

          {/* Consultation Notes (after completion) */}
          {appointment.status === "completed" && (
            <Card
              title={<Space><MedicineBoxOutlined style={{ color: "#52c41a" }} /><span>Consultation Summary</span></Space>}
              style={{ borderRadius: 16, marginBottom: 24 }}
            >
              {appointment.consultationNotes && (
                <div style={{ marginBottom: 16 }}>
                  <Text strong style={{ display: "block", marginBottom: 6 }}>Doctor's Notes:</Text>
                  <Paragraph style={{ background: "#f6ffed", padding: 16, borderRadius: 8 }}>
                    {appointment.consultationNotes}
                  </Paragraph>
                </div>
              )}
              {appointment.prescription && (
                <div style={{ marginBottom: 16 }}>
                  <Text strong style={{ display: "block", marginBottom: 6 }}>Prescription:</Text>
                  <Paragraph style={{ background: "#fff7e6", padding: 16, borderRadius: 8 }}>
                    {appointment.prescription}
                  </Paragraph>
                </div>
              )}
              {appointment.followUpDate && (
                <div>
                  <Text strong style={{ display: "block", marginBottom: 6 }}>Follow-up Date:</Text>
                  <Space>
                    <CalendarOutlined style={{ color: "#1890ff" }} />
                    <Text>{dayjs(appointment.followUpDate).format("MMMM D, YYYY")}</Text>
                  </Space>
                  {appointment.followUpSummary && (
                    <Paragraph type="secondary" style={{ marginTop: 8 }}>
                      {appointment.followUpSummary}
                    </Paragraph>
                  )}
                </div>
              )}
              {!appointment.consultationNotes && !appointment.prescription && !appointment.followUpDate && (
                <Text type="secondary">No notes available yet.</Text>
              )}
            </Card>
          )}

          {/* Medical Documents */}
          <Card
            title="Medical Documents"
            style={{ borderRadius: 16, marginBottom: 24 }}
            extra={
              isOwner && isUpcoming && (
                <Button
                  type="link"
                  onClick={() => setShowUpload(!showUpload)}
                  icon={<UploadOutlined />}
                >
                  {showUpload ? "Cancel" : "Upload"}
                </Button>
              )
            }
          >
            {showUpload && (
              <div style={{ marginBottom: 20 }}>
                <FileUploader onFilesChange={setDocFiles} disabled={uploadLoading} />
                <Button
                  type="primary"
                  style={{ marginTop: 12 }}
                  loading={uploadLoading}
                  onClick={handleUploadDocs}
                  disabled={docFiles.length === 0}
                >
                  Upload {docFiles.length > 0 ? `(${docFiles.length})` : ""}
                </Button>
                <Divider />
              </div>
            )}

            {appointment.documents?.length > 0 ? (
              <Space direction="vertical" style={{ width: "100%" }} size={8}>
                {appointment.documents.map((doc, i) => (
                  <div
                    key={i}
                    style={{
                      display: "flex", alignItems: "center", gap: 12,
                      background: "#fafafa", padding: "10px 14px",
                      borderRadius: 8, border: "1px solid #f0f0f0",
                    }}
                  >
                    {getFileIcon(doc.mimetype)}
                    <div style={{ flex: 1 }}>
                      <Text style={{ fontSize: 13 }} ellipsis>{doc.originalName}</Text>
                      <Text type="secondary" style={{ fontSize: 11, display: "block" }}>
                        {(doc.size / 1024).toFixed(1)} KB · {dayjs(doc.uploadedAt).format("MMM D, YYYY")}
                      </Text>
                    </div>
                    <Button
                      type="link" size="small"
                      href={`${import.meta.env.VITE_API_URL?.replace("/api", "")}${doc.path}`}
                      target="_blank" rel="noopener noreferrer"
                    >
                      View
                    </Button>
                  </div>
                ))}
              </Space>
            ) : (
              <Text type="secondary">No documents uploaded yet.</Text>
            )}
          </Card>
        </Col>

        {/* Right Column — Actions */}
        <Col xs={24} lg={8}>
          <Card style={{ borderRadius: 16, position: "sticky", top: 80 }}>
            <Title level={5} style={{ marginBottom: 16 }}>Actions</Title>

            <Space direction="vertical" style={{ width: "100%" }} size={10}>
              {isOwner && isUpcoming && (
                <Popconfirm
                  title="Cancel Appointment"
                  description="Are you sure you want to cancel this appointment?"
                  onConfirm={handleCancel}
                  okText="Yes, Cancel" cancelText="No" okType="danger"
                >
                  <Button danger block loading={loading} style={{ borderRadius: 8 }}>
                    Cancel Appointment
                  </Button>
                </Popconfirm>
              )}

              {isUpcoming && isOwner && (
                <Button
                  type="primary" block
                  icon={<UploadOutlined />}
                  onClick={() => setShowUpload(true)}
                  style={{ borderRadius: 8 }}
                >
                  Upload Documents
                </Button>
              )}

              <Button
                block
                onClick={() => navigate("/appointments")}
                style={{ borderRadius: 8 }}
              >
                Back to Appointments
              </Button>

              <Button
                type="primary" ghost block
                onClick={() => navigate("/doctors")}
                style={{ borderRadius: 8 }}
                icon={<MedicineBoxOutlined />}
              >
                Book Another
              </Button>
            </Space>

            {appointment.rating?.score && (
              <>
                <Divider />
                <Title level={5} style={{ marginBottom: 8 }}>Your Rating</Title>
                <Space direction="vertical">
                  <Space>
                    {Array.from({ length: 5 }).map((_, i) => (
                      <span key={i} style={{ color: i < appointment.rating.score ? "#faad14" : "#d9d9d9", fontSize: 18 }}>
                        ★
                      </span>
                    ))}
                    <Text strong>{appointment.rating.score}/5</Text>
                  </Space>
                  {appointment.rating.review && (
                    <Text type="secondary" style={{ fontSize: 13 }}>
                      "{appointment.rating.review}"
                    </Text>
                  )}
                </Space>
              </>
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default AppointmentDetail;
