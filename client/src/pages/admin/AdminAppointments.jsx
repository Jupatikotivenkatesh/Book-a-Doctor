import React, { useEffect, useState } from "react";
import {
  Typography, Card, Table, Tag, Space, Alert,
  Avatar, Tabs, Pagination, Button,
} from "antd";
import { CalendarOutlined, UserOutlined } from "@ant-design/icons";
import { useDispatch, useSelector } from "react-redux";
import { fetchAllAppointments, clearAdminError } from "../../redux/slices/adminSlice";
import StatusBadge from "../../components/common/StatusBadge";

const { Title, Text } = Typography;
const PAGE_SIZE = 20;

const AdminAppointments = () => {
  const dispatch = useDispatch();
  const { appointments, pagination, loading, error } = useSelector((s) => s.admin);
  const [activeTab, setActiveTab] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);

  const load = (tab = activeTab, page = currentPage) => {
    const params = { page, limit: PAGE_SIZE };
    if (tab !== "all") params.status = tab;
    dispatch(fetchAllAppointments(params));
  };

  useEffect(() => { load(); }, [dispatch]);

  const columns = [
    {
      title: "Patient",
      render: (_, r) => (
        <Space>
          <Avatar icon={<UserOutlined />} style={{ background: "#e6f7ff", color: "#1890ff" }} />
          <div>
            <Text strong>{r.patientId?.name || "—"}</Text>
            <br />
            <Text type="secondary" style={{ fontSize: 11 }}>{r.patientId?.email || "—"}</Text>
          </div>
        </Space>
      ),
    },
    {
      title: "Doctor",
      render: (_, r) => {
        const doc = r.doctorId;
        return doc
          ? <Text>{`Dr. ${doc.firstName} ${doc.lastName}`}</Text>
          : <Text type="secondary">—</Text>;
      },
    },
    {
      title: "Date & Time",
      render: (_, r) => (
        <Space direction="vertical" size={0}>
          <Text style={{ fontSize: 13 }}>{r.date}</Text>
          <Text type="secondary" style={{ fontSize: 11 }}>{r.time}</Text>
        </Space>
      ),
    },
    { title: "Reason", dataIndex: "reason", ellipsis: true },
    { title: "Status", dataIndex: "status", render: (s) => <StatusBadge status={s} /> },
    {
      title: "Booked",
      dataIndex: "createdAt",
      render: (d) => new Date(d).toLocaleDateString(),
    },
  ];

  return (
    <div>
      <Title level={3} style={{ marginBottom: 24 }}>
        <CalendarOutlined style={{ color: "#1890ff", marginRight: 10 }} />
        All Appointments
      </Title>

      {error && (
        <Alert message={error} type="error" showIcon closable
          onClose={() => dispatch(clearAdminError())} style={{ marginBottom: 20 }} />
      )}

      <Tabs
        activeKey={activeTab}
        onChange={(tab) => { setActiveTab(tab); setCurrentPage(1); load(tab, 1); }}
        items={[
          { key: "all", label: "All" },
          { key: "pending", label: "Pending" },
          { key: "approved", label: "Approved" },
          { key: "completed", label: "Completed" },
          { key: "cancelled", label: "Cancelled" },
          { key: "rejected", label: "Rejected" },
        ]}
        style={{ marginBottom: 16 }}
      />

      <Card style={{ borderRadius: 16 }} bodyStyle={{ padding: 0 }}>
        <Table
          dataSource={appointments}
          columns={columns}
          rowKey="_id"
          pagination={false}
          loading={loading}
          scroll={{ x: 800 }}
        />
      </Card>

      {pagination?.total > PAGE_SIZE && (
        <div style={{ textAlign: "center", marginTop: 16 }}>
          <Pagination
            current={currentPage} total={pagination.total} pageSize={PAGE_SIZE}
            onChange={(p) => { setCurrentPage(p); load(activeTab, p); }}
            showSizeChanger={false}
            showTotal={(t) => `${t} appointments`}
          />
        </div>
      )}
    </div>
  );
};

export default AdminAppointments;
