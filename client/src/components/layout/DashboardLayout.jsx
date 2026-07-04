import React, { useState, useEffect } from "react";
import { Outlet, Link, useNavigate, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import {
  Layout, Menu, Avatar, Typography, Button, Badge,
  Dropdown, Space, Drawer,
} from "antd";
import {
  DashboardOutlined, CalendarOutlined, UserOutlined,
  BellOutlined, LogoutOutlined, MedicineBoxOutlined,
  TeamOutlined, FileTextOutlined, MenuOutlined,
  MenuFoldOutlined, MenuUnfoldOutlined, SolutionOutlined,
} from "@ant-design/icons";
import { logout } from "../../redux/slices/authSlice";
import { fetchUnreadCount } from "../../redux/slices/notificationSlice";

const { Sider, Header, Content } = Layout;
const { Text } = Typography;

// ─── Sidebar menu config ──────────────────────────────────────────────────────
const menuConfig = {
  patient: [
    { key: "/dashboard",     icon: <DashboardOutlined />,   label: "Dashboard" },
    { key: "/appointments",  icon: <CalendarOutlined />,    label: "Appointments" },
    { key: "/doctors",       icon: <MedicineBoxOutlined />, label: "Find Doctors" },
    { key: "/notifications", icon: <BellOutlined />,        label: "Notifications" },
    { key: "/apply-doctor",  icon: <SolutionOutlined />,    label: "Become a Doctor" },
    { key: "/profile",       icon: <UserOutlined />,        label: "My Profile" },
  ],
  doctor: [
    { key: "/doctor/dashboard",     icon: <DashboardOutlined />,   label: "Dashboard" },
    { key: "/doctor/appointments",  icon: <CalendarOutlined />,    label: "Appointments" },
    { key: "/doctor/notifications", icon: <BellOutlined />,        label: "Notifications" },
    { key: "/doctor/profile",       icon: <UserOutlined />,        label: "My Profile" },
  ],
  admin: [
    { key: "/admin/dashboard",     icon: <DashboardOutlined />,   label: "Dashboard" },
    { key: "/admin/users",         icon: <TeamOutlined />,        label: "Users" },
    { key: "/admin/doctors",       icon: <MedicineBoxOutlined />, label: "Doctors" },
    { key: "/admin/appointments",  icon: <FileTextOutlined />,    label: "Appointments" },
    { key: "/admin/notifications", icon: <BellOutlined />,        label: "Notifications" },
  ],
};

// ─── Notification path helper ─────────────────────────────────────────────────
const notifPath = (role) => {
  const map = { admin: "/admin/notifications", doctor: "/doctor/notifications", patient: "/notifications" };
  return map[role] || "/notifications";
};

// ─── Sidebar content (shared between desktop Sider and mobile Drawer) ─────────
const SidebarContent = ({ role, location, unreadCount, collapsed, onItemClick }) => {
  const items = (menuConfig[role] || []).map((item) => ({
    key: item.key,
    icon:
      item.key.includes("notifications") ? (
        <Badge count={unreadCount} size="small" offset={[4, -2]}>
          {item.icon}
        </Badge>
      ) : (
        item.icon
      ),
    label: (
      <Link to={item.key} onClick={onItemClick}>
        {item.label}
      </Link>
    ),
  }));

  return (
    <>
      {/* Logo */}
      <div
        style={{
          height: 64,
          display: "flex",
          alignItems: "center",
          justifyContent: collapsed ? "center" : "flex-start",
          padding: collapsed ? 0 : "0 24px",
          borderBottom: "1px solid #f0f0f0",
          overflow: "hidden",
          flexShrink: 0,
        }}
      >
        <MedicineBoxOutlined style={{ fontSize: 22, color: "#1890ff", minWidth: 22 }} />
        {!collapsed && (
          <Text
            strong
            style={{
              marginLeft: 10, fontSize: 16, color: "#1890ff",
              whiteSpace: "nowrap", overflow: "hidden",
            }}
          >
            Book a Doctor
          </Text>
        )}
      </div>

      {/* Nav */}
      <Menu
        mode="inline"
        selectedKeys={[location.pathname]}
        items={items}
        style={{ border: "none", marginTop: 8, flex: 1 }}
      />
    </>
  );
};

// ─── Main DashboardLayout ─────────────────────────────────────────────────────
const DashboardLayout = ({ role }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  const { user } = useSelector((state) => state.auth);
  const { unreadCount } = useSelector((state) => state.notifications);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  // Detect mobile breakpoint
  useEffect(() => {
    const handler = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (!mobile) setMobileOpen(false);
    };
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);

  // Fetch unread count on mount
  useEffect(() => {
    dispatch(fetchUnreadCount());
  }, [dispatch]);

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  const userMenuItems = [
    {
      key: "logout",
      label: "Logout",
      icon: <LogoutOutlined />,
      danger: true,
      onClick: handleLogout,
    },
  ];

  const avatarSrc = user?.profilePicture
    ? `${(import.meta.env.VITE_API_URL || "http://localhost:5000/api").replace("/api", "")}${user.profilePicture}`
    : null;

  const sidebarWidth = 240;
  const collapsedWidth = 80;
  const currentWidth = isMobile ? 0 : collapsed ? collapsedWidth : sidebarWidth;

  return (
    <Layout style={{ minHeight: "100vh" }}>
      {/* ─── Desktop Sider ─── */}
      {!isMobile && (
        <Sider
          collapsed={collapsed}
          onCollapse={setCollapsed}
          trigger={null}
          width={sidebarWidth}
          collapsedWidth={collapsedWidth}
          style={{
            background: "#fff",
            boxShadow: "2px 0 8px rgba(0,0,0,0.06)",
            position: "fixed",
            left: 0, top: 0, bottom: 0,
            zIndex: 100,
            overflow: "auto",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <SidebarContent
            role={role}
            location={location}
            unreadCount={unreadCount}
            collapsed={collapsed}
            onItemClick={() => {}}
          />
        </Sider>
      )}

      {/* ─── Mobile Drawer ─── */}
      {isMobile && (
        <Drawer
          placement="left"
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          width={sidebarWidth}
          bodyStyle={{ padding: 0, display: "flex", flexDirection: "column" }}
          headerStyle={{ display: "none" }}
          style={{ zIndex: 1001 }}
        >
          <SidebarContent
            role={role}
            location={location}
            unreadCount={unreadCount}
            collapsed={false}
            onItemClick={() => setMobileOpen(false)}
          />
        </Drawer>
      )}

      {/* ─── Main area ─── */}
      <Layout
        style={{
          marginLeft: currentWidth,
          transition: "margin 0.2s ease",
          minHeight: "100vh",
        }}
      >
        {/* ─── Top Header ─── */}
        <Header
          style={{
            background: "#fff",
            padding: "0 20px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
            position: "sticky",
            top: 0,
            zIndex: 99,
            height: 64,
          }}
        >
          {/* Toggle button */}
          <Button
            type="text"
            icon={
              isMobile
                ? <MenuOutlined style={{ fontSize: 18 }} />
                : collapsed
                ? <MenuUnfoldOutlined style={{ fontSize: 18 }} />
                : <MenuFoldOutlined style={{ fontSize: 18 }} />
            }
            onClick={() => isMobile ? setMobileOpen(true) : setCollapsed(!collapsed)}
            style={{ fontSize: 18, width: 40, height: 40 }}
          />

          {/* Right: bell + avatar */}
          <Space size="middle">
            <Badge count={unreadCount} size="small">
              <Link to={notifPath(role)}>
                <BellOutlined
                  style={{ fontSize: 20, color: "#555", cursor: "pointer" }}
                />
              </Link>
            </Badge>

            <Dropdown
              menu={{ items: userMenuItems }}
              trigger={["click"]}
              placement="bottomRight"
            >
              <Space style={{ cursor: "pointer" }}>
                <Avatar
                  size={36}
                  src={avatarSrc}
                  icon={!avatarSrc ? <UserOutlined /> : null}
                  style={{ background: "#1890ff" }}
                />
                <Text
                  strong
                  style={{
                    maxWidth: 120,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    display: isMobile ? "none" : "inline",
                    fontSize: 14,
                  }}
                >
                  {user?.name}
                </Text>
              </Space>
            </Dropdown>
          </Space>
        </Header>

        {/* ─── Page Content ─── */}
        <Content
          style={{
            margin: isMobile ? "16px 12px" : "24px",
            minHeight: "calc(100vh - 64px - 48px)",
            overflow: "hidden",
          }}
        >
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default DashboardLayout;
