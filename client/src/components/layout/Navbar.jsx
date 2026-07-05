import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import {
  Layout, Button, Badge, Avatar, Dropdown, Space,
  Typography, Drawer, Menu,
} from "antd";
import {
  UserOutlined, BellOutlined, LogoutOutlined,
  DashboardOutlined, MedicineBoxOutlined, MenuOutlined,
  CalendarOutlined,
} from "@ant-design/icons";
import { logout } from "../../redux/slices/authSlice";

const { Header } = Layout;
const { Text } = Typography;

const ROLE_DASHBOARD = {
  admin:   "/admin/dashboard",
  doctor:  "/doctor/dashboard",
  patient: "/dashboard",
};

const ROLE_NOTIF = {
  admin:   "/admin/notifications",
  doctor:  "/doctor/notifications",
  patient: "/notifications",
};

const Navbar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const { unreadCount } = useSelector((state) => state.notifications);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
    setDrawerOpen(false);
  };

  const avatarSrc = user?.profilePicture
    ? `${(import.meta.env.VITE_API_URL || "http://localhost:5000/api").replace("/api", "")}${user.profilePicture}`
    : null;

  const dashPath = user ? ROLE_DASHBOARD[user.role] || "/" : "/";
  const notifPath = user ? ROLE_NOTIF[user.role] || "/notifications" : "/notifications";

  // Desktop user dropdown items
  const userMenuItems = [
    { key: "dashboard", label: <Link to={dashPath}>Dashboard</Link>,     icon: <DashboardOutlined /> },
    { key: "notif",     label: <Link to={notifPath}>Notifications</Link>, icon: <BellOutlined /> },
    { type: "divider" },
    { key: "logout", label: "Logout", icon: <LogoutOutlined />, danger: true, onClick: handleLogout },
  ];

  // Mobile drawer menu items
  const mobileMenuItems = [
    { key: "/",       label: <Link to="/" onClick={() => setDrawerOpen(false)}>Home</Link> },
    { key: "/doctors",label: <Link to="/doctors" onClick={() => setDrawerOpen(false)}>Find Doctors</Link> },
    ...(user ? [
      { key: dashPath,  label: <Link to={dashPath} onClick={() => setDrawerOpen(false)}>Dashboard</Link> },
      { key: notifPath, label: <Link to={notifPath} onClick={() => setDrawerOpen(false)}>Notifications</Link> },
      { key: "logout",  label: <span onClick={handleLogout} style={{ color: "#f5222d" }}>Logout</span> },
    ] : [
      { key: "/login",    label: <Link to="/login"    onClick={() => setDrawerOpen(false)}>Login</Link> },
      { key: "/register", label: <Link to="/register" onClick={() => setDrawerOpen(false)}>Register</Link> },
    ]),
  ];

  return (
    <>
      <Header
        style={{
          background: "#ffffff",
          padding: "0 20px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
          position: "sticky",
          top: 0,
          zIndex: 1000,
          height: 64,
        }}
      >
        {/* ─── Logo ─── */}
        <Link
          to="/"
          style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none" }}
        >
          <MedicineBoxOutlined style={{ fontSize: 24, color: "#1890ff" }} />
          <Text strong style={{ fontSize: 24, color: "#1890ff" }}>
            MediBook
          </Text>
        </Link>

        {/* ─── Desktop: centre nav ─── */}
        <div
          className="hide-mobile"
          style={{ display: "flex", alignItems: "center", gap: 8 }}
        >
          <Button type="text" onClick={() => navigate("/doctors")}>
            Find Doctors
          </Button>
        </div>

        {/* ─── Desktop: right actions ─── */}
        <Space size="middle" className="hide-mobile">
          {user ? (
            <>
              <Badge count={unreadCount} size="small" offset={[-2, 2]}>
                <Link to={notifPath}>
                  <BellOutlined style={{ fontSize: 20, color: "#555", cursor: "pointer" }} />
                </Link>
              </Badge>
              <Dropdown menu={{ items: userMenuItems }} trigger={["click"]} placement="bottomRight">
                <Space style={{ cursor: "pointer" }}>
                  <Avatar
                    size={34}
                    src={avatarSrc}
                    icon={!avatarSrc ? <UserOutlined /> : null}
                    style={{ background: "#1890ff" }}
                  />
                  <Text
                    strong
                    style={{
                      maxWidth: 130, overflow: "hidden",
                      textOverflow: "ellipsis", whiteSpace: "nowrap", fontSize: 14,
                    }}
                  >
                    {user.name}
                  </Text>
                </Space>
              </Dropdown>
            </>
          ) : (
            <>
              <Button type="default" onClick={() => navigate("/login")}>
                Login
              </Button>
              <Button type="primary" onClick={() => navigate("/register")}>
                Register
              </Button>
            </>
          )}
        </Space>

        {/* ─── Mobile: hamburger ─── */}
        <Button
          type="text"
          icon={<MenuOutlined style={{ fontSize: 20 }} />}
          onClick={() => setDrawerOpen(true)}
          style={{
            display: "none",
          }}
          className="show-mobile-flex"
        />
        {/* Use a plain div instead to avoid SSR issues */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
          }}
        >
          {/* Mobile bell (when logged in) */}
          {user && (
            <Badge count={unreadCount} size="small" style={{ display: "none" }} className="show-mobile">
              <Link to={notifPath}>
                <BellOutlined style={{ fontSize: 20, color: "#555" }} />
              </Link>
            </Badge>
          )}
          <Button
            type="text"
            icon={<MenuOutlined style={{ fontSize: 20 }} />}
            onClick={() => setDrawerOpen(true)}
            style={{
              // Only show on mobile via inline breakpoint — handled by the Drawer
              display: "flex",
              alignItems: "center",
            }}
          />
        </div>
      </Header>

      {/* ─── Mobile Drawer ─── */}
      <Drawer
        title={
          <Space>
            <MedicineBoxOutlined style={{ color: "#1890ff" }} />
            <Text strong style={{ color: "#1890ff" }}>Book a Doctor</Text>
          </Space>
        }
        placement="right"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        width={260}
        bodyStyle={{ padding: 0 }}
      >
        {user && (
          <div style={{ padding: "16px 20px", borderBottom: "1px solid #f0f0f0" }}>
            <Space>
              <Avatar
                size={40}
                src={avatarSrc}
                icon={!avatarSrc ? <UserOutlined /> : null}
                style={{ background: "#1890ff" }}
              />
              <div>
                <Text strong style={{ display: "block" }}>{user.name}</Text>
                <Text type="secondary" style={{ fontSize: 12, textTransform: "capitalize" }}>
                  {user.role}
                </Text>
              </div>
            </Space>
          </div>
        )}
        <Menu
          mode="inline"
          style={{ border: "none" }}
          items={mobileMenuItems}
        />
      </Drawer>
    </>
  );
};

export default Navbar;
