import React, { useEffect, useState } from "react";
import {
  Typography, Card, Table, Button, Tag, Space, Modal,
  Form, Input, Avatar, Alert, Tabs, Pagination,
  Descriptions, Divider, List, message as antMessage,
} from "antd";
import {
  CheckOutlined, CloseOutlined, UserOutlined,
  EyeOutlined, MedicineBoxOutlined, ClockCircleOutlined,
} from "@ant-design/icons";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchDoctorApplications, updateDoctorStatus,
  clearAdminError, clearAdminSuccess,
} from "../../redux/slices/adminSlice";
import StatusBadge from "../../components/common/StatusBadge";
import LoadingSpinner from "../../components/common/LoadingSpinner";

const { Title, Text } = Typography;
const { TextArea } = Input;
const PAGE_SIZE = 15;

const AdminDoctors = () => {
  const dispatch = useDispatch();
  const { doctorApplications, pagination, loading, error, success } = useSelector((s) => s.admin);

  const [activeTab,    setActiveTab]    = useState("pending");
  const [currentPage,  setCurrentPage]  = useState(1);
  const [rejectModal,  setRejectModal]  = useState({ open: false, id: null });
  const [detailModal,  setDetailModal]  = useState({ open: false, doctor: null });
  const [form] = Form.useForm();

  const load = (tab = activeTab, page = currentPage) => {
    const params = { page, limit: PAGE_SIZE };
    if (tab !== "all") params.status = tab;
    dispatch(fetchDoctorApplications(params));
  };

  useEffect(() => { load(); }, [dispatch]);

  useEffect(() => {
    if (success) {
      antMessage.success("Doctor status updated.");
      dispatch(clearAdminSuccess());
      load();
      setDetailModal({ open: false, doctor: null });
    }
  }, [success]);

  const handleApprove = (id) => dispatch(updateDoctorStatus({ id, status: "approved" }));

  const handleReject = (values) => {
    dispatch(updateDoctorStatus({
      id: rejectModal.id,
      status: "rejected",
      rejectionReason: values.reason || "",
    }));
    setRejectModal({ open: false, id: null });
    form.resetFields();
  };

  const columns = [
    {
      title: "Doctor",
      render: (_, doc) => (
        <Space>
          <Avatar icon={<UserOutlined />} style={{ background: "#e6f7ff", color: "#1890ff" }} />
          <div>
            <Text strong>Dr. {doc.firstName} {doc.lastName}</Text>
            <br />
            <Text type="secondary" style={{ fontSize: 12 }}>{doc.userId?.email}</Text>
          </div>
        </Space>
      ),
    },
    {
      title: "Specialization",
      dataIndex: "specialization",
      render: (s) => <Tag color="blue">{s}</Tag>,
    },
    {
      title: "Experience",
      dataIndex: "experience",
      render: (e) => `${e} yrs`,
    },
    {
      title: "Fee",
      dataIndex: "feePerConsultation",
      render: (f) => `$${f}`,
    },
    {
      title: "Status",
      dataIndex: "status",
      render: (s) => <StatusBadge status={s} />,
    },
    {
      title: "Applied",
      dataIndex: "createdAt",
      render: (d) => new Date(d).toLocaleDateString(),
    },
    {
      title: "Actions",
      render: (_, doc) => (
        <Space size={6}>
          <Button
            size="small" icon={<EyeOutlined />}
            onClick={() => setDetailModal({ open: true, doctor: doc })}
          >
            View
          </Button>
          {doc.status === "pending" && (
            <>
              <Button
                type="primary" size="small" icon={<CheckOutlined />}
                onClick={() => handleApprove(doc._id)}
                loading={loading}
              >
                Approve
              </Button>
              <Button
                danger size="small" icon={<CloseOutlined />}
                onClick={() => {
                  setRejectModal({ open: true, id: doc._id });
                  form.resetFields();
                }}
              >
                Reject
              </Button>
            </>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Title level={3} style={{ marginBottom: 24 }}>
        <MedicineBoxOutlined style={{ color: "#1890ff", marginRight: 10 }} />
        Doctor Applications
      </Title>

      {error && (
        <Alert message={error} type="error" showIcon closable
          onClose={() => dispatch(clearAdminError())} style={{ marginBottom: 20 }} />
      )}

      <Tabs
        activeKey={activeTab}
        onChange={(tab) => { setActiveTab(tab); setCurrentPage(1); load(tab, 1); }}
        items={[
          { key: "pending",  label: "Pending" },
          { key: "approved", label: "Approved" },
          { key: "rejected", label: "Rejected" },
          { key: "all",      label: "All" },
        ]}
        style={{ marginBottom: 16 }}
      />

      <Card style={{ borderRadius: 16 }} bodyStyle={{ padding: 0 }}>
        {loading ? (
          <LoadingSpinner fullscreen />
        ) : (
          <Table
            dataSource={doctorApplications}
            columns={columns}
            rowKey="_id"
            pagination={false}
            scroll={{ x: 800 }}
          />
        )}
      </Card>

      {pagination?.total > PAGE_SIZE && (
        <div style={{ textAlign: "center", marginTop: 16 }}>
          <Pagination
            current={currentPage}
            total={pagination.total}
            pageSize={PAGE_SIZE}
            onChange={(p) => { setCurrentPage(p); load(activeTab, p); }}
            showSizeChanger={false}
          />
        </div>
      )}

      {/* ─── Doctor Detail Modal ──────────────────────────────────────────── */}
      <Modal
        title={
          detailModal.doctor
            ? `Dr. ${detailModal.doctor.firstName} ${detailModal.doctor.lastName}`
            : "Doctor Details"
        }
        open={detailModal.open}
        onCancel={() => setDetailModal({ open: false, doctor: null })}
        footer={
          detailModal.doctor?.status === "pending" ? (
            <Space>
              <Button
                onClick={() => setDetailModal({ open: false, doctor: null })}
              >
                Close
              </Button>
              <Button
                danger
                icon={<CloseOutlined />}
                onClick={() => {
                  setDetailModal({ open: false, doctor: null });
                  setRejectModal({ open: true, id: detailModal.doctor._id });
                  form.resetFields();
                }}
              >
                Reject
              </Button>
              <Button
                type="primary"
                icon={<CheckOutlined />}
                loading={loading}
                onClick={() => handleApprove(detailModal.doctor._id)}
              >
                Approve
              </Button>
            </Space>
          ) : (
            <Button onClick={() => setDetailModal({ open: false, doctor: null })}>
              Close
            </Button>
          )
        }
        width={620}
        centered
      >
        {detailModal.doctor && (() => {
          const doc = detailModal.doctor;
          return (
            <>
              <Descriptions column={2} size="small" bordered style={{ marginBottom: 16 }}>
                <Descriptions.Item label="First Name">{doc.firstName}</Descriptions.Item>
                <Descriptions.Item label="Last Name">{doc.lastName}</Descriptions.Item>
                <Descriptions.Item label="Email">{doc.userId?.email || "—"}</Descriptions.Item>
                <Descriptions.Item label="Phone">{doc.phone}</Descriptions.Item>
                <Descriptions.Item label="Specialization">
                  <Tag color="blue">{doc.specialization}</Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Experience">{doc.experience} years</Descriptions.Item>
                <Descriptions.Item label="Consultation Fee">${doc.feePerConsultation}</Descriptions.Item>
                <Descriptions.Item label="Status">
                  <StatusBadge status={doc.status} />
                </Descriptions.Item>
                <Descriptions.Item label="Address" span={2}>{doc.address}</Descriptions.Item>
                {doc.website && (
                  <Descriptions.Item label="Website" span={2}>
                    <a href={doc.website} target="_blank" rel="noopener noreferrer">
                      {doc.website}
                    </a>
                  </Descriptions.Item>
                )}
              </Descriptions>

              {/* Qualifications */}
              {doc.qualifications?.length > 0 && (
                <>
                  <Divider orientation="left" style={{ fontSize: 13 }}>
                    🎓 Qualifications
                  </Divider>
                  <List
                    size="small"
                    dataSource={doc.qualifications}
                    renderItem={(q) => (
                      <List.Item style={{ padding: "6px 0" }}>
                        <Space>
                          <Tag>{q.degree}</Tag>
                          <Text>{q.institution}</Text>
                          {q.year && <Text type="secondary" style={{ fontSize: 12 }}>{q.year}</Text>}
                        </Space>
                      </List.Item>
                    )}
                  />
                </>
              )}

              {/* Available Timings */}
              {doc.timings?.length > 0 && (
                <>
                  <Divider orientation="left" style={{ fontSize: 13 }}>
                    <ClockCircleOutlined style={{ marginRight: 6 }} />
                    Available Hours
                  </Divider>
                  {doc.timings.map((t) => (
                    <div
                      key={t.day}
                      style={{
                        display: "flex", justifyContent: "space-between",
                        padding: "5px 0", borderBottom: "1px solid #f0f0f0",
                      }}
                    >
                      <Text strong style={{ fontSize: 13 }}>{t.day}</Text>
                      <Text type="secondary" style={{ fontSize: 13 }}>
                        {t.startTime} – {t.endTime}
                      </Text>
                    </div>
                  ))}
                </>
              )}

              {doc.rejectionReason && (
                <>
                  <Divider />
                  <Text type="danger" style={{ fontSize: 13 }}>
                    Rejection reason: {doc.rejectionReason}
                  </Text>
                </>
              )}
            </>
          );
        })()}
      </Modal>

      {/* ─── Reject Modal ──────────────────────────────────────────────────── */}
      <Modal
        title="Reject Application"
        open={rejectModal.open}
        onCancel={() => setRejectModal({ open: false, id: null })}
        footer={null}
        centered
      >
        <Form form={form} layout="vertical" onFinish={handleReject}>
          <Form.Item name="reason" label="Reason (Optional)">
            <TextArea rows={3} placeholder="Reason for rejection..." maxLength={300} showCount />
          </Form.Item>
          <div style={{ textAlign: "right" }}>
            <Button
              onClick={() => setRejectModal({ open: false, id: null })}
              style={{ marginRight: 8 }}
            >
              Cancel
            </Button>
            <Button type="primary" danger htmlType="submit" loading={loading}>
              Reject
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default AdminDoctors;
