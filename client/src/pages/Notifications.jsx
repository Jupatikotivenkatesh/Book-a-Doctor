import React, { useEffect } from "react";
import {
  List, Card, Typography, Button, Badge, Space,
  Skeleton, Empty, Divider, Tooltip, message as antMessage,
} from "antd";
import {
  BellOutlined, CheckOutlined, DeleteOutlined,
  CalendarOutlined, MedicineBoxOutlined, StarOutlined,
} from "@ant-design/icons";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchNotifications, markAsRead, markAllAsRead,
  deleteNotification, fetchUnreadCount,
} from "../redux/slices/notificationSlice";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

const { Title, Text } = Typography;

const TYPE_ICONS = {
  appointment_booked:    { icon: <CalendarOutlined />,    color: "#1890ff" },
  appointment_approved:  { icon: <CalendarOutlined />,    color: "#52c41a" },
  appointment_rejected:  { icon: <CalendarOutlined />,    color: "#f5222d" },
  appointment_cancelled: { icon: <CalendarOutlined />,    color: "#fa8c16" },
  appointment_completed: { icon: <CalendarOutlined />,    color: "#722ed1" },
  doctor_approved:       { icon: <MedicineBoxOutlined />, color: "#52c41a" },
  doctor_rejected:       { icon: <MedicineBoxOutlined />, color: "#f5222d" },
  follow_up_reminder:    { icon: <BellOutlined />,        color: "#fa8c16" },
  document_uploaded:     { icon: <CalendarOutlined />,    color: "#1890ff" },
  general:               { icon: <BellOutlined />,        color: "#8c8c8c" },
};

const NotificationItem = ({ notification, onRead, onDelete }) => {
  const config = TYPE_ICONS[notification.type] || TYPE_ICONS.general;

  return (
    <List.Item
      style={{
        padding: "14px 20px",
        background: notification.isRead ? "transparent" : "#e6f7ff",
        borderRadius: 10,
        marginBottom: 8,
        border: notification.isRead ? "1px solid #f0f0f0" : "1px solid #91d5ff",
        cursor: "pointer",
        transition: "all 0.2s",
      }}
      onClick={() => !notification.isRead && onRead(notification._id)}
      actions={[
        <Tooltip title="Delete" key="delete">
          <Button
            type="text" danger size="small"
            icon={<DeleteOutlined />}
            onClick={(e) => { e.stopPropagation(); onDelete(notification._id); }}
          />
        </Tooltip>,
        !notification.isRead && (
          <Tooltip title="Mark as read" key="read">
            <Button
              type="text" size="small"
              icon={<CheckOutlined style={{ color: "#52c41a" }} />}
              onClick={(e) => { e.stopPropagation(); onRead(notification._id); }}
            />
          </Tooltip>
        ),
      ].filter(Boolean)}
    >
      <List.Item.Meta
        avatar={
          <div style={{
            width: 44, height: 44, borderRadius: "50%",
            background: `${config.color}1a`,
            display: "flex", alignItems: "center", justifyContent: "center",
            flexShrink: 0,
          }}>
            {React.cloneElement(config.icon, { style: { color: config.color, fontSize: 18 } })}
          </div>
        }
        title={
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Text strong style={{ fontSize: 14 }}>{notification.title}</Text>
            {!notification.isRead && (
              <Badge color="#1890ff" style={{ width: 8, height: 8 }} />
            )}
          </div>
        }
        description={
          <div>
            <Text style={{ fontSize: 13, color: "#555", display: "block", marginBottom: 4 }}>
              {notification.message}
            </Text>
            <Text type="secondary" style={{ fontSize: 11 }}>
              {dayjs(notification.createdAt).fromNow()}
            </Text>
          </div>
        }
      />
    </List.Item>
  );
};

const Notifications = () => {
  const dispatch = useDispatch();
  const { notifications, unreadCount, loading } = useSelector((state) => state.notifications);

  useEffect(() => {
    dispatch(fetchNotifications({ limit: 30 }));
    dispatch(fetchUnreadCount());
  }, [dispatch]);

  const handleRead = (id) => dispatch(markAsRead(id));
  const handleDelete = (id) => dispatch(deleteNotification(id));
  const handleReadAll = async () => {
    await dispatch(markAllAsRead());
    antMessage.success("All notifications marked as read.");
  };

  return (
    <div>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
        <div>
          <Title level={3} style={{ margin: 0 }}>
            <BellOutlined style={{ marginRight: 10, color: "#1890ff" }} />
            Notifications
            {unreadCount > 0 && (
              <Badge
                count={unreadCount}
                style={{ marginLeft: 10, background: "#1890ff" }}
              />
            )}
          </Title>
          <Text type="secondary">Stay updated on your appointments and actions</Text>
        </div>

        {unreadCount > 0 && (
          <Button
            type="primary" ghost
            icon={<CheckOutlined />}
            onClick={handleReadAll}
            style={{ borderRadius: 8 }}
          >
            Mark All as Read
          </Button>
        )}
      </div>

      <Card style={{ borderRadius: 16 }} bodyStyle={{ padding: 0 }}>
        {loading ? (
          <div style={{ padding: 24 }}>
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} avatar active paragraph={{ rows: 2 }} style={{ marginBottom: 16 }} />
            ))}
          </div>
        ) : notifications.length === 0 ? (
          <Empty
            image={<BellOutlined style={{ fontSize: 64, color: "#bfbfbf" }} />}
            description="No notifications yet"
            style={{ padding: "48px 24px" }}
          />
        ) : (
          <div style={{ padding: "16px 16px" }}>
            {notifications.map((notification) => (
              <NotificationItem
                key={notification._id}
                notification={notification}
                onRead={handleRead}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};

export default Notifications;
