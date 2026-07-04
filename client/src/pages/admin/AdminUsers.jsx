import React, { useEffect, useState } from "react";
import {
  Typography, Card, Table, Button, Tag, Space, Input,
  Alert, Popconfirm, Avatar, message as antMessage, Pagination,
} from "antd";
import { TeamOutlined, UserOutlined, SearchOutlined } from "@ant-design/icons";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchAllUsers, toggleUserStatus, clearAdminError,
} from "../../redux/slices/adminSlice";

const { Title, Text } = Typography;
const { Search } = Input;
const PAGE_SIZE = 20;

const AdminUsers = () => {
  const dispatch = useDispatch();
  const { users, pagination, loading, error } = useSelector((s) => s.admin);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const load = (page = currentPage, searchTerm = search) => {
    const params = { page, limit: PAGE_SIZE };
    if (searchTerm) params.search = searchTerm;
    dispatch(fetchAllUsers(params));
  };

  useEffect(() => { load(); }, [dispatch]);

  const handleSearch = (value) => {
    setSearch(value);
    setCurrentPage(1);
    load(1, value);
  };

  const handleToggle = async (id) => {
    const result = await dispatch(toggleUserStatus(id));
    if (toggleUserStatus.fulfilled.match(result)) {
      antMessage.success("User status updated.");
    }
  };

  const columns = [
    {
      title: "User",
      render: (_, u) => (
        <Space>
          <Avatar icon={<UserOutlined />} style={{ background: "#e6f7ff", color: "#1890ff" }} />
          <div>
            <Text strong>{u.name}</Text>
            <br />
            <Text type="secondary" style={{ fontSize: 12 }}>{u.email}</Text>
          </div>
        </Space>
      ),
    },
    {
      title: "Role",
      dataIndex: "role",
      render: (r) => <Tag color={r === "admin" ? "red" : r === "doctor" ? "blue" : "green"}>{r}</Tag>,
    },
    { title: "Phone", dataIndex: "phone", render: (p) => p || "—" },
    {
      title: "Status",
      dataIndex: "isActive",
      render: (v) => <Tag color={v ? "success" : "error"}>{v ? "Active" : "Inactive"}</Tag>,
    },
    {
      title: "Joined",
      dataIndex: "createdAt",
      render: (d) => new Date(d).toLocaleDateString(),
    },
    {
      title: "Actions",
      render: (_, u) => u.role !== "admin" && (
        <Popconfirm
          title={u.isActive ? "Deactivate this user?" : "Activate this user?"}
          onConfirm={() => handleToggle(u._id)}
          okText="Yes" cancelText="No"
        >
          <Button size="small" danger={u.isActive}>
            {u.isActive ? "Deactivate" : "Activate"}
          </Button>
        </Popconfirm>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24, flexWrap: "wrap", gap: 16 }}>
        <Title level={3} style={{ margin: 0 }}>
          <TeamOutlined style={{ color: "#1890ff", marginRight: 10 }} />
          User Management
        </Title>
        <Search
          placeholder="Search users..."
          onSearch={handleSearch}
          style={{ width: 280, borderRadius: 8 }}
          prefix={<SearchOutlined />}
          allowClear
        />
      </div>

      {error && (
        <Alert message={error} type="error" showIcon closable
          onClose={() => dispatch(clearAdminError())} style={{ marginBottom: 20 }} />
      )}

      <Card style={{ borderRadius: 16 }} bodyStyle={{ padding: 0 }}>
        <Table
          dataSource={users} columns={columns} rowKey="_id"
          pagination={false} loading={loading} scroll={{ x: 700 }}
        />
      </Card>

      {pagination?.total > PAGE_SIZE && (
        <div style={{ textAlign: "center", marginTop: 16 }}>
          <Pagination
            current={currentPage} total={pagination.total} pageSize={PAGE_SIZE}
            onChange={(p) => { setCurrentPage(p); load(p); }}
            showSizeChanger={false}
            showTotal={(t) => `${t} users`}
          />
        </div>
      )}
    </div>
  );
};

export default AdminUsers;
