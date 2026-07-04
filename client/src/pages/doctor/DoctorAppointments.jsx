import React, { useEffect, useState } from "react";
import {
  Typography, Tabs, Card, Button, Space,
  Modal, Form, Input, Alert, message as antMessage,
  Pagination, Avatar, Drawer, Descriptions, Divider,
  List, Tag, Tooltip,
} from "antd";
import {
  CheckOutlined, CloseOutlined, UserOutlined,
  CalendarOutlined, ClockCircleOutlined, FileTextOutlined,
  EyeOutlined, FilePdfOutlined, FileImageOutlined,
  PhoneOutlined, MailOutlined,
} from "@ant-design/icons";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchDoctorAppointments, updateAppointmentStatus,
  completeAppointment, clearDoctorError, clearDoctorSuccess,
} from "../../redux/slices/doctorSlice";
import StatusBadge from "../../components/common/StatusBadge";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import EmptyState from "../../components/common/EmptyState";
import dayjs from "dayjs";

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;
const PAGE_SIZE = 10;

// ─── Document icon helper ──────────────────────────────────────────────────────
const DocIcon = ({ mimetype }) => {
  if (mimetype?.includes("pdf")) return <FilePdfOutlined style={{ color: "#f5222d" }} />;
  if (mimetype?.includes("image")) return <FileImageOutlined style={{ color: "#1890ff" }} />;
  return <FileTextOutlined />;
};

const DoctorAppointments = () => {
  const dispatch = useDispatch();
  const { appointments, pagination, loading, error, success } = useSelector((s) => s.doctors);

  const [activeTab, setActiveTab]     = useState("pending");
  const [currentPage, setCurrentPage] = useState(1);

  // Modals
  const [rejectModal,   setRejectModal]   = useState({ open: false, id: null });
  const [completeModal, setCompleteModal] = useState({ open: false, id: null });
  // Patient records drawer
  const [drawer, setDrawer] = useState({ open: false, appointment: null });

  const [rejectForm]   = Form.useForm();
  const [completeForm] = Form.useForm();

  const loadAppts = (tab = activeTab, page = currentPage) => {
    const params = { page, limit: PAGE_SIZE };
    if (tab !== "all") params.status = tab;
    dispatch(fetchDoctorAppointments(params));
  };

  useEffect(() => { loadAppts(); }, [dispatch]);

  useEffect(() => {
    if (success) {
      antMessage.success("Action completed successfully.");
      dispatch(clearDoctorSuccess());
      loadAppts();
      // Close any open drawer if it was the completed appointment
      if (drawer.open) setDrawer({ open: false, appointment: null });
    }
  }, [success]);

  const handleApprove = (id) =>
    dispatch(updateAppointmentStatus({ appointmentId: id, status: "approved" }));

  const handleReject = (values) => {
    dispatch(updateAppointmentStatus({
      appointmentId: rejectModal.id,
      status: "rejected",
      rejectionReason: values.reason || "",
    }));
    setRejectModal({ open: false, id: null });
    rejectForm.resetFields();
  };

  const handleComplete = (values) => {
    dispatch(completeAppointment({
      appointmentId: completeModal.id,
      consultationNotes: values.consultationNotes || "",
      prescription:      values.prescription     || "",
      followUpDate:      values.followUpDate      || null,
      followUpSummary:   values.followUpSummary   || "",
    }));
    setCompleteModal({ open: false, id: null });
    completeForm.resetFields();
  };

  const openDrawer = (apt) => {
    setDrawer({ open: true, appointment: apt });
  };

  const TABS = [
    { key: "pending",   label: "Pending Review" },
    { key: "approved",  label: "Upcoming" },
    { key: "completed", label: "Completed" },
    { key: "all",       label: "All" },
  ];

  return (
    <div>
      <Title level={3} style={{ marginBottom: 24 }}>
        <CalendarOutlined style={{ marginRight: 10, color: "#1890ff" }} />
        Patient Appointments
      </Title>

      {error && (
        <Alert message={error} type="error" showIcon closable
          onClose={() => dispatch(clearDoctorError())} style={{ marginBottom: 20 }} />
      )}

      <Tabs
        activeKey={activeTab}
        onChange={(tab) => { setActiveTab(tab); setCurrentPage(1); loadAppts(tab, 1); }}
        items={TABS}
        style={{ marginBottom: 24 }}
      />

      {loading ? (
        <LoadingSpinner fullscreen />
      ) : appointments.length === 0 ? (
        <EmptyState description={`No ${activeTab !== "all" ? activeTab : ""} appointments`} />
      ) : (
        <>
          {appointments.map((apt) => {
            const patient = apt.patientId;
            return (
              <Card
                key={apt._id}
                style={{ borderRadius: 16, marginBottom: 16 }}
                bodyStyle={{ padding: "16px 20px" }}
              >
                <div style={{ display: "flex", alignItems: "flex-start", gap: 16, flexWrap: "wrap" }}>
                  {/* Avatar */}
                  <Avatar
                    icon={<UserOutlined />}
                    style={{ background: "#e6f7ff", color: "#1890ff", flexShrink: 0 }}
                  />

                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 200 }}>
                    <Space size={8} wrap style={{ marginBottom: 6 }}>
                      <Text strong>{patient?.name || "Patient"}</Text>
                      <StatusBadge status={apt.status} />
                      {apt.documents?.length > 0 && (
                        <Tag color="purple" style={{ fontSize: 11 }}>
                          📎 {apt.documents.length} doc{apt.documents.length > 1 ? "s" : ""}
                        </Tag>
                      )}
                    </Space>

                    <Space wrap size={16} style={{ marginBottom: 6 }}>
                      <Space size={4}>
                        <CalendarOutlined style={{ color: "#1890ff" }} />
                        <Text style={{ fontSize: 13 }}>{apt.date}</Text>
                      </Space>
                      <Space size={4}>
                        <ClockCircleOutlined style={{ color: "#52c41a" }} />
                        <Text style={{ fontSize: 13 }}>{apt.time}</Text>
                      </Space>
                    </Space>

                    <Text type="secondary" style={{ fontSize: 12 }}>
                      Reason: {apt.reason}
                    </Text>
                  </div>

                  {/* Actions */}
                  <Space wrap size={8}>
                    {/* View patient records */}
                    <Tooltip title="View Patient Records">
                      <Button
                        size="small"
                        icon={<EyeOutlined />}
                        onClick={() => openDrawer(apt)}
                      >
                        Records
                      </Button>
                    </Tooltip>

                    {apt.status === "pending" && (
                      <>
                        <Button
                          type="primary" size="small" icon={<CheckOutlined />}
                          onClick={() => handleApprove(apt._id)} loading={loading}
                        >
                          Approve
                        </Button>
                        <Button
                          danger size="small" icon={<CloseOutlined />}
                          onClick={() => {
                            setRejectModal({ open: true, id: apt._id });
                            rejectForm.resetFields();
                          }}
                        >
                          Reject
                        </Button>
                      </>
                    )}

                    {apt.status === "approved" && (
                      <Button
                        type="primary" size="small" ghost
                        icon={<FileTextOutlined />}
                        onClick={() => {
                          setCompleteModal({ open: true, id: apt._id });
                          completeForm.resetFields();
                        }}
                      >
                        Complete
                      </Button>
                    )}
                  </Space>
                </div>
              </Card>
            );
          })}

          {pagination?.total > PAGE_SIZE && (
            <div style={{ textAlign: "center", marginTop: 16 }}>
              <Pagination
                current={currentPage}
                total={pagination.total}
                pageSize={PAGE_SIZE}
                onChange={(p) => { setCurrentPage(p); loadAppts(activeTab, p); }}
                showSizeChanger={false}
              />
            </div>
          )}
        </>
      )}

      {/* ─── Patient Records Drawer ─────────────────────────────────────────── */}
      <Drawer
        title="Patient Records"
        placement="right"
        width={480}
        open={drawer.open}
        onClose={() => setDrawer({ open: false, appointment: null })}
      >
        {drawer.appointment && (() => {
          const apt = drawer.appointment;
          const patient = apt.patientId;
          return (
            <>
              {/* Patient Info */}
              <Card
                size="small"
                style={{ borderRadius: 12, marginBottom: 16, background: "#f8fbff" }}
              >
                <Space>
                  <Avatar icon={<UserOutlined />}
                    style={{ background: "#1890ff", color: "white" }} size={48} />
                  <div>
                    <Text strong style={{ fontSize: 15 }}>{patient?.name || "Patient"}</Text>
                    {patient?.email && (
                      <Space size={4} style={{ display: "flex", marginTop: 2 }}>
                        <MailOutlined style={{ fontSize: 11, color: "#8c8c8c" }} />
                        <Text type="secondary" style={{ fontSize: 12 }}>{patient.email}</Text>
                      </Space>
                    )}
                    {patient?.phone && (
                      <Space size={4} style={{ display: "flex" }}>
                        <PhoneOutlined style={{ fontSize: 11, color: "#8c8c8c" }} />
                        <Text type="secondary" style={{ fontSize: 12 }}>{patient.phone}</Text>
                      </Space>
                    )}
                  </div>
                </Space>
              </Card>

              {/* Appointment Summary */}
              <Descriptions
                title="Appointment Info"
                size="small"
                column={1}
                bordered
                style={{ marginBottom: 20 }}
              >
                <Descriptions.Item label="Date">{apt.date}</Descriptions.Item>
                <Descriptions.Item label="Time">{apt.time}</Descriptions.Item>
                <Descriptions.Item label="Status">
                  <StatusBadge status={apt.status} />
                </Descriptions.Item>
                <Descriptions.Item label="Reason">{apt.reason}</Descriptions.Item>
                {apt.symptoms && (
                  <Descriptions.Item label="Symptoms">{apt.symptoms}</Descriptions.Item>
                )}
              </Descriptions>

              {/* Medical Documents */}
              <Divider orientation="left" style={{ fontSize: 13 }}>
                📎 Uploaded Documents ({apt.documents?.length || 0})
              </Divider>

              {apt.documents?.length > 0 ? (
                <List
                  size="small"
                  dataSource={apt.documents}
                  renderItem={(doc, i) => (
                    <List.Item
                      key={i}
                      style={{
                        background: "#fafafa", borderRadius: 8,
                        marginBottom: 8, padding: "8px 12px",
                        border: "1px solid #f0f0f0",
                      }}
                      actions={[
                        <Button
                          key="view"
                          type="link"
                          size="small"
                          href={`${import.meta.env.VITE_API_URL?.replace("/api", "")}${doc.path}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          View
                        </Button>,
                      ]}
                    >
                      <List.Item.Meta
                        avatar={<DocIcon mimetype={doc.mimetype} />}
                        title={
                          <Text style={{ fontSize: 13 }} ellipsis={{ tooltip: doc.originalName }}>
                            {doc.originalName}
                          </Text>
                        }
                        description={
                          <Text type="secondary" style={{ fontSize: 11 }}>
                            {(doc.size / 1024).toFixed(1)} KB
                            {doc.uploadedAt &&
                              ` · ${dayjs(doc.uploadedAt).format("MMM D, YYYY")}`}
                          </Text>
                        }
                      />
                    </List.Item>
                  )}
                />
              ) : (
                <Text type="secondary" style={{ fontSize: 13 }}>
                  No documents uploaded by the patient.
                </Text>
              )}

              {/* Consultation Notes (if completed) */}
              {apt.status === "completed" && (
                <>
                  <Divider orientation="left" style={{ fontSize: 13 }}>
                    📋 Visit Summary
                  </Divider>
                  {apt.consultationNotes && (
                    <div style={{ marginBottom: 12 }}>
                      <Text strong style={{ display: "block", marginBottom: 4 }}>Notes:</Text>
                      <Paragraph
                        style={{ background: "#f6ffed", padding: 12, borderRadius: 8, margin: 0 }}
                      >
                        {apt.consultationNotes}
                      </Paragraph>
                    </div>
                  )}
                  {apt.prescription && (
                    <div style={{ marginBottom: 12 }}>
                      <Text strong style={{ display: "block", marginBottom: 4 }}>Prescription:</Text>
                      <Paragraph
                        style={{ background: "#fff7e6", padding: 12, borderRadius: 8, margin: 0 }}
                      >
                        {apt.prescription}
                      </Paragraph>
                    </div>
                  )}
                  {apt.followUpDate && (
                    <Space size={6}>
                      <CalendarOutlined style={{ color: "#1890ff" }} />
                      <Text>
                        Follow-up: {dayjs(apt.followUpDate).format("MMMM D, YYYY")}
                      </Text>
                    </Space>
                  )}
                  {!apt.consultationNotes && !apt.prescription && !apt.followUpDate && (
                    <Text type="secondary" style={{ fontSize: 13 }}>No visit summary added.</Text>
                  )}
                </>
              )}

              {/* Quick action buttons inside drawer */}
              <Divider />
              <Space direction="vertical" style={{ width: "100%" }} size={10}>
                {apt.status === "pending" && (
                  <>
                    <Button
                      type="primary" block icon={<CheckOutlined />}
                      onClick={() => {
                        handleApprove(apt._id);
                        setDrawer({ open: false, appointment: null });
                      }}
                      loading={loading}
                    >
                      Approve Appointment
                    </Button>
                    <Button
                      danger block icon={<CloseOutlined />}
                      onClick={() => {
                        setDrawer({ open: false, appointment: null });
                        setRejectModal({ open: true, id: apt._id });
                        rejectForm.resetFields();
                      }}
                    >
                      Reject Appointment
                    </Button>
                  </>
                )}
                {apt.status === "approved" && (
                  <Button
                    type="primary" block ghost icon={<FileTextOutlined />}
                    onClick={() => {
                      setDrawer({ open: false, appointment: null });
                      setCompleteModal({ open: true, id: apt._id });
                      completeForm.resetFields();
                    }}
                  >
                    Mark as Completed
                  </Button>
                )}
              </Space>
            </>
          );
        })()}
      </Drawer>

      {/* ─── Reject Modal ───────────────────────────────────────────────────── */}
      <Modal
        title="Reject Appointment"
        open={rejectModal.open}
        onCancel={() => setRejectModal({ open: false, id: null })}
        footer={null}
        centered
      >
        <Form form={rejectForm} layout="vertical" onFinish={handleReject}>
          <Form.Item name="reason" label="Reason for Rejection (Optional)">
            <TextArea rows={3} placeholder="e.g. Time conflict, emergency..." maxLength={300} showCount />
          </Form.Item>
          <div style={{ textAlign: "right" }}>
            <Button onClick={() => setRejectModal({ open: false, id: null })} style={{ marginRight: 8 }}>
              Cancel
            </Button>
            <Button type="primary" danger htmlType="submit" loading={loading}>
              Confirm Rejection
            </Button>
          </div>
        </Form>
      </Modal>

      {/* ─── Complete Consultation Modal ─────────────────────────────────────── */}
      <Modal
        title="Complete Consultation"
        open={completeModal.open}
        onCancel={() => setCompleteModal({ open: false, id: null })}
        footer={null}
        centered
        width={560}
      >
        <Form form={completeForm} layout="vertical" onFinish={handleComplete}>
          <Form.Item name="consultationNotes" label="Consultation Notes">
            <TextArea rows={3} placeholder="Notes about the consultation..." maxLength={1000} showCount />
          </Form.Item>
          <Form.Item name="prescription" label="Prescription">
            <TextArea rows={3} placeholder="Medications and dosage..." maxLength={1000} showCount />
          </Form.Item>
          <Form.Item name="followUpDate" label="Follow-up Date (Optional)">
            <Input type="date" style={{ borderRadius: 8 }} />
          </Form.Item>
          <Form.Item name="followUpSummary" label="Follow-up Notes (Optional)">
            <TextArea rows={2} placeholder="What to address at follow-up..." maxLength={500} />
          </Form.Item>
          <div style={{ textAlign: "right" }}>
            <Button onClick={() => setCompleteModal({ open: false, id: null })} style={{ marginRight: 8 }}>
              Cancel
            </Button>
            <Button type="primary" htmlType="submit" loading={loading}>
              Mark as Completed
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default DoctorAppointments;
