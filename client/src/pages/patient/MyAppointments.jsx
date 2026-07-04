import React, { useEffect, useState } from "react";
import {
  Typography, Tabs, Pagination, Alert, Modal,
  Form, Rate, Input, Button, message as antMessage,
} from "antd";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchMyAppointments, cancelAppointment, rateAppointment,
  clearAppointmentError, clearAppointmentSuccess,
} from "../../redux/slices/appointmentSlice";
import AppointmentCard from "../../components/common/AppointmentCard";
import EmptyState from "../../components/common/EmptyState";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import { useNavigate, useSearchParams } from "react-router-dom";

const { Title, Text } = Typography;
const { TextArea } = Input;

const PAGE_SIZE = 8;

const MyAppointments = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const { appointments, pagination, loading, error, success } = useSelector(
    (state) => state.appointments
  );

  const [activeTab, setActiveTab] = useState(searchParams.get("status") || "all");
  const [currentPage, setCurrentPage] = useState(1);
  const [ratingModal, setRatingModal] = useState({ open: false, appointment: null });
  const [rateForm] = Form.useForm();

  const loadAppointments = (tab = activeTab, page = currentPage) => {
    const params = { page, limit: PAGE_SIZE };
    if (tab !== "all") params.status = tab;
    dispatch(fetchMyAppointments(params));
  };

  useEffect(() => {
    loadAppointments();
    dispatch(clearAppointmentError());
  }, [dispatch]);

  useEffect(() => {
    if (success) {
      antMessage.success("Action completed successfully!");
      dispatch(clearAppointmentSuccess());
      loadAppointments();
    }
  }, [success]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setCurrentPage(1);
    setSearchParams(tab !== "all" ? { status: tab } : {});
    loadAppointments(tab, 1);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    loadAppointments(activeTab, page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCancel = (id) => {
    dispatch(cancelAppointment(id));
  };

  const handleRateOpen = (appointment) => {
    setRatingModal({ open: true, appointment });
    rateForm.resetFields();
  };

  const handleRateSubmit = async (values) => {
    const { appointment } = ratingModal;
    await dispatch(rateAppointment({
      id: appointment._id,
      score: values.score,
      review: values.review || "",
    }));
    setRatingModal({ open: false, appointment: null });
    antMessage.success("Rating submitted!");
    loadAppointments();
  };

  const TAB_ITEMS = [
    { key: "all",       label: "All" },
    { key: "pending",   label: "Pending" },
    { key: "approved",  label: "Upcoming" },
    { key: "completed", label: "Completed" },
    { key: "cancelled", label: "Cancelled" },
    { key: "rejected",  label: "Rejected" },
  ];

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <Title level={3} style={{ margin: 0 }}>My Appointments</Title>
        <Text type="secondary">Manage and track all your medical appointments</Text>
      </div>

      {error && (
        <Alert
          message={error}
          type="error"
          showIcon
          closable
          onClose={() => dispatch(clearAppointmentError())}
          style={{ marginBottom: 20, borderRadius: 8 }}
        />
      )}

      <Tabs
        activeKey={activeTab}
        onChange={handleTabChange}
        items={TAB_ITEMS}
        style={{ marginBottom: 24 }}
      />

      {loading ? (
        <LoadingSpinner fullscreen tip="Loading appointments..." />
      ) : appointments.length === 0 ? (
        <EmptyState
          description={`No ${activeTab !== "all" ? activeTab : ""} appointments found`}
          actionText="Book an Appointment"
          onAction={() => navigate("/doctors")}
        />
      ) : (
        <>
          {appointments.map((apt) => (
            <AppointmentCard
              key={apt._id}
              appointment={apt}
              onCancel={handleCancel}
              onRate={handleRateOpen}
              loading={loading}
            />
          ))}

          {pagination?.total > PAGE_SIZE && (
            <div style={{ textAlign: "center", marginTop: 24 }}>
              <Pagination
                current={currentPage}
                total={pagination.total}
                pageSize={PAGE_SIZE}
                onChange={handlePageChange}
                showSizeChanger={false}
                showTotal={(total) => `Total ${total} appointments`}
              />
            </div>
          )}
        </>
      )}

      {/* ─── Rate Modal ─── */}
      <Modal
        title="⭐ Rate Your Consultation"
        open={ratingModal.open}
        onCancel={() => setRatingModal({ open: false, appointment: null })}
        footer={null}
        centered
      >
        <Form form={rateForm} layout="vertical" onFinish={handleRateSubmit}>
          <Form.Item
            name="score"
            label="Overall Rating"
            rules={[{ required: true, message: "Please rate this consultation" }]}
          >
            <Rate allowHalf style={{ fontSize: 32 }} />
          </Form.Item>
          <Form.Item name="review" label="Write a Review (Optional)">
            <TextArea
              rows={4}
              placeholder="Share your experience..."
              maxLength={500}
              showCount
            />
          </Form.Item>
          <Form.Item style={{ marginBottom: 0, textAlign: "right" }}>
            <Button
              onClick={() => setRatingModal({ open: false, appointment: null })}
              style={{ marginRight: 8 }}
            >
              Cancel
            </Button>
            <Button type="primary" htmlType="submit" loading={loading}>
              Submit Rating
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default MyAppointments;
