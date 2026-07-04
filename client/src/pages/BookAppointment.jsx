import React, { useEffect, useState } from "react";
import {
  Row, Col, Card, Form, Input, DatePicker, TimePicker,
  Button, Typography, Avatar, Tag, Space, Alert,
  Divider, Steps, message as antMessage, Skeleton,
} from "antd";
import {
  CalendarOutlined, ClockCircleOutlined, UserOutlined,
  FileTextOutlined, ArrowLeftOutlined, CheckCircleOutlined,
  MedicineBoxOutlined, DollarOutlined,
} from "@ant-design/icons";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchDoctorById } from "../redux/slices/doctorSlice";
import { bookAppointment, uploadDocuments, clearAppointmentError, clearAppointmentSuccess } from "../redux/slices/appointmentSlice";
import FileUploader from "../components/common/FileUploader";
import dayjs from "dayjs";

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

const DISABLED_DATES = (current) => current && current < dayjs().startOf("day");

const BookAppointment = () => {
  const { doctorId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [form] = Form.useForm();

  const { selectedDoctor: doctor, loading: doctorLoading } = useSelector((state) => state.doctors);
  const { loading, uploadLoading, error, success } = useSelector((state) => state.appointments);
  const { user } = useSelector((state) => state.auth);

  const [files, setFiles] = useState([]);
  const [bookedAppointment, setBookedAppointment] = useState(null);
  const [currentStep, setCurrentStep] = useState(0); // 0=form, 1=success

  useEffect(() => {
    dispatch(fetchDoctorById(doctorId));
    dispatch(clearAppointmentError());
    dispatch(clearAppointmentSuccess());
  }, [dispatch, doctorId]);

  const avatarSrc = doctor?.userId?.profilePicture
    ? `${import.meta.env.VITE_API_URL?.replace("/api", "")}${doctor.userId.profilePicture}`
    : null;

  const handleSubmit = async (values) => {
    const date = values.date.format("YYYY-MM-DD");
    const time = values.time.format("HH:mm");

    const resultAction = await dispatch(
      bookAppointment({
        doctorId,
        date,
        time,
        reason: values.reason,
        symptoms: values.symptoms || "",
      })
    );

    if (bookAppointment.fulfilled.match(resultAction)) {
      const appointment = resultAction.payload;
      setBookedAppointment(appointment);

      // Upload documents if any
      if (files.length > 0) {
        const formData = new FormData();
        files.forEach((file) => formData.append("documents", file));
        await dispatch(uploadDocuments({ id: appointment._id, formData }));
      }

      antMessage.success("Appointment booked successfully!");
      setCurrentStep(1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  // ─── Success Screen ───────────────────────────────────────────────────────
  if (currentStep === 1 && bookedAppointment) {
    return (
      <div style={{ background: "#f8fbff", minHeight: "100vh", padding: "40px 24px" }}>
        <div className="page-container" style={{ maxWidth: 640, margin: "0 auto" }}>
          <Card style={{ borderRadius: 20, textAlign: "center", padding: "40px 32px" }}>
            <div style={{
              width: 88, height: 88, borderRadius: "50%",
              background: "linear-gradient(135deg, #52c41a, #73d13d)",
              display: "flex", alignItems: "center", justifyContent: "center",
              margin: "0 auto 24px",
              boxShadow: "0 8px 24px rgba(82,196,26,0.3)",
            }}>
              <CheckCircleOutlined style={{ fontSize: 44, color: "white" }} />
            </div>

            <Title level={2} style={{ color: "#52c41a", marginBottom: 8 }}>
              Appointment Booked!
            </Title>
            <Paragraph type="secondary" style={{ fontSize: 15, marginBottom: 32 }}>
              Your appointment request has been submitted. The doctor will review and confirm it shortly.
              You will be notified by email and in-app.
            </Paragraph>

            <Card
              style={{ background: "#f8fbff", borderRadius: 12, textAlign: "left", marginBottom: 32 }}
              bodyStyle={{ padding: 20 }}
            >
              <Title level={5} style={{ marginBottom: 16 }}>📋 Appointment Summary</Title>
              {doctor && (
                <Space style={{ marginBottom: 12 }}>
                  <Avatar
                    src={avatarSrc}
                    icon={!avatarSrc ? <UserOutlined /> : null}
                    style={{ background: "#e6f7ff", color: "#1890ff" }}
                  />
                  <div>
                    <Text strong>Dr. {doctor.firstName} {doctor.lastName}</Text>
                    <br />
                    <Text type="secondary" style={{ fontSize: 12 }}>{doctor.specialization}</Text>
                  </div>
                </Space>
              )}
              <Divider style={{ margin: "12px 0" }} />
              <Space direction="vertical" size={6} style={{ width: "100%" }}>
                <Space>
                  <CalendarOutlined style={{ color: "#1890ff" }} />
                  <Text>Date: <Text strong>{bookedAppointment.date}</Text></Text>
                </Space>
                <Space>
                  <ClockCircleOutlined style={{ color: "#52c41a" }} />
                  <Text>Time: <Text strong>{bookedAppointment.time}</Text></Text>
                </Space>
                <Space>
                  <FileTextOutlined style={{ color: "#fa8c16" }} />
                  <Text>Reason: <Text strong>{bookedAppointment.reason}</Text></Text>
                </Space>
                <Space>
                  <MedicineBoxOutlined style={{ color: "#722ed1" }} />
                  <Text>Status: <Tag color="warning">Pending Approval</Tag></Text>
                </Space>
                {files.length > 0 && (
                  <Space>
                    <FileTextOutlined style={{ color: "#1890ff" }} />
                    <Text>{files.length} document(s) uploaded</Text>
                  </Space>
                )}
              </Space>
            </Card>

            <Space direction="vertical" size={12} style={{ width: "100%" }}>
              <Button
                type="primary" block size="large"
                icon={<CalendarOutlined />}
                onClick={() => navigate("/appointments")}
                style={{ height: 48, borderRadius: 10 }}
              >
                View My Appointments
              </Button>
              <Button
                block size="large"
                icon={<MedicineBoxOutlined />}
                onClick={() => navigate("/doctors")}
                style={{ height: 48, borderRadius: 10 }}
              >
                Browse More Doctors
              </Button>
            </Space>
          </Card>
        </div>
      </div>
    );
  }

  // ─── Booking Form ─────────────────────────────────────────────────────────
  return (
    <div style={{ background: "#f8fbff", minHeight: "100vh" }}>
      {/* Header */}
      <div style={{
        background: "linear-gradient(135deg, #001529 0%, #003a8c 100%)",
        padding: "32px 24px",
      }}>
        <div className="page-container">
          <Button
            icon={<ArrowLeftOutlined />} ghost
            onClick={() => navigate(-1)}
            style={{ marginBottom: 12, borderRadius: 8 }}
          >
            Back
          </Button>
          <Title level={3} style={{ color: "#ffffff", margin: 0 }}>
            <CalendarOutlined style={{ marginRight: 10 }} />
            Book an Appointment
          </Title>
        </div>
      </div>

      <div className="page-container" style={{ padding: "32px 24px" }}>
        <Row gutter={[24, 24]}>
          {/* Form */}
          <Col xs={24} lg={16}>
            <Card style={{ borderRadius: 16 }}>
              {error && (
                <Alert
                  message={error}
                  type="error"
                  showIcon
                  closable
                  onClose={() => dispatch(clearAppointmentError())}
                  style={{ marginBottom: 24, borderRadius: 8 }}
                />
              )}

              <Form
                form={form}
                layout="vertical"
                onFinish={handleSubmit}
                requiredMark={false}
                size="large"
              >
                <Title level={4} style={{ marginBottom: 20 }}>
                  📝 Appointment Details
                </Title>

                <Row gutter={[16, 0]}>
                  <Col xs={24} sm={12}>
                    <Form.Item
                      name="date"
                      label="Preferred Date"
                      rules={[{ required: true, message: "Please select a date" }]}
                    >
                      <DatePicker
                        style={{ width: "100%", borderRadius: 8 }}
                        disabledDate={DISABLED_DATES}
                        format="MMMM D, YYYY"
                        placeholder="Select date"
                      />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={12}>
                    <Form.Item
                      name="time"
                      label="Preferred Time"
                      rules={[{ required: true, message: "Please select a time" }]}
                    >
                      <TimePicker
                        style={{ width: "100%", borderRadius: 8 }}
                        format="HH:mm"
                        minuteStep={15}
                        placeholder="Select time"
                        showNow={false}
                      />
                    </Form.Item>
                  </Col>
                </Row>

                <Form.Item
                  name="reason"
                  label="Reason for Visit"
                  rules={[
                    { required: true, message: "Please describe your reason for visit" },
                    { max: 500, message: "Reason cannot exceed 500 characters" },
                  ]}
                >
                  <TextArea
                    rows={3}
                    placeholder="e.g. Regular checkup, follow-up, specific symptoms..."
                    maxLength={500}
                    showCount
                    style={{ borderRadius: 8 }}
                  />
                </Form.Item>

                <Form.Item
                  name="symptoms"
                  label="Symptoms / Additional Notes (Optional)"
                >
                  <TextArea
                    rows={4}
                    placeholder="Describe your symptoms, current medications, or any relevant medical history..."
                    maxLength={1000}
                    showCount
                    style={{ borderRadius: 8 }}
                  />
                </Form.Item>

                <Divider style={{ margin: "24px 0" }} />

                <Title level={5} style={{ marginBottom: 12 }}>
                  📎 Medical Documents (Optional)
                </Title>
                <Paragraph type="secondary" style={{ fontSize: 13, marginBottom: 16 }}>
                  Upload lab results, prescriptions, insurance cards, or any relevant medical documents.
                  You can also upload documents after booking.
                </Paragraph>
                <FileUploader onFilesChange={setFiles} disabled={loading || uploadLoading} />

                <Divider style={{ margin: "24px 0" }} />

                <Button
                  type="primary"
                  htmlType="submit"
                  block
                  size="large"
                  loading={loading || uploadLoading}
                  icon={<CheckCircleOutlined />}
                  style={{ height: 52, borderRadius: 10, fontSize: 16 }}
                >
                  {loading || uploadLoading ? "Submitting..." : "Confirm Appointment"}
                </Button>
              </Form>
            </Card>
          </Col>

          {/* Doctor Summary */}
          <Col xs={24} lg={8}>
            <Card style={{ borderRadius: 16, position: "sticky", top: 80 }}>
              <Title level={5} style={{ marginBottom: 16 }}>👨‍⚕️ Booking With</Title>
              {doctorLoading || !doctor ? (
                <Skeleton avatar active paragraph={{ rows: 4 }} />
              ) : (
                <>
                  <div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
                    <Avatar
                      size={56}
                      src={avatarSrc}
                      icon={!avatarSrc ? <UserOutlined /> : null}
                      style={{ background: "#e6f7ff", color: "#1890ff", flexShrink: 0 }}
                    />
                    <div>
                      <Text strong style={{ display: "block", fontSize: 16 }}>
                        Dr. {doctor.firstName} {doctor.lastName}
                      </Text>
                      <Tag color="blue" style={{ marginTop: 4 }}>{doctor.specialization}</Tag>
                    </div>
                  </div>

                  <Divider style={{ margin: "12px 0" }} />

                  <Space direction="vertical" size={8} style={{ width: "100%" }}>
                    <Space size={8}>
                      <ClockCircleOutlined style={{ color: "#1890ff" }} />
                      <Text style={{ fontSize: 13 }}>{doctor.experience} years experience</Text>
                    </Space>
                    <Space size={8}>
                      <DollarOutlined style={{ color: "#52c41a" }} />
                      <Text style={{ fontSize: 13 }}>
                        Consultation fee: <Text strong>${doctor.feePerConsultation}</Text>
                      </Text>
                    </Space>
                    {doctor.address && (
                      <Space size={8} align="start">
                        <span style={{ fontSize: 14 }}>📍</span>
                        <Text type="secondary" style={{ fontSize: 12 }}>{doctor.address}</Text>
                      </Space>
                    )}
                  </Space>

                  {doctor.timings?.length > 0 && (
                    <>
                      <Divider style={{ margin: "12px 0" }} />
                      <Text strong style={{ fontSize: 13, display: "block", marginBottom: 8 }}>
                        Available Days:
                      </Text>
                      {doctor.timings.map((t) => (
                        <Tag key={t.day} style={{ marginBottom: 4, fontSize: 11 }}>
                          {t.day}: {t.startTime}–{t.endTime}
                        </Tag>
                      ))}
                    </>
                  )}
                </>
              )}
            </Card>
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default BookAppointment;
