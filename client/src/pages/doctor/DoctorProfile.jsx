import React, { useEffect } from "react";
import {
  Row, Col, Card, Form, Input, InputNumber, Select,
  Button, Typography, Tag, Alert, TimePicker,
  message as antMessage, Skeleton,
} from "antd";
import {
  UserOutlined, PhoneOutlined, HomeOutlined,
  GlobalOutlined, SaveOutlined,
} from "@ant-design/icons";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchMyDoctorProfile, updateDoctorProfile,
  clearDoctorError, clearDoctorSuccess,
} from "../../redux/slices/doctorSlice";
import dayjs from "dayjs";

const { Title, Text } = Typography;
const { Option } = Select;

const SPECIALIZATIONS = [
  "General Practice", "Cardiology", "Dermatology", "Endocrinology",
  "Gastroenterology", "Gynecology", "Neurology", "Oncology",
  "Orthopedics", "Pediatrics", "Psychiatry", "Surgery", "Urology",
];

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

const DoctorProfile = () => {
  const dispatch = useDispatch();
  const { myProfile, loading, error, success } = useSelector((state) => state.doctors);
  const [form] = Form.useForm();

  useEffect(() => {
    dispatch(fetchMyDoctorProfile());
    dispatch(clearDoctorError());
  }, [dispatch]);

  useEffect(() => {
    if (myProfile) {
      const timingFields = {};
      myProfile.timings?.forEach((t) => {
        timingFields[`start_${t.day}`] = dayjs(t.startTime, "HH:mm");
        timingFields[`end_${t.day}`] = dayjs(t.endTime, "HH:mm");
      });
      form.setFieldsValue({
        firstName: myProfile.firstName,
        lastName: myProfile.lastName,
        phone: myProfile.phone,
        website: myProfile.website,
        address: myProfile.address,
        specialization: myProfile.specialization,
        experience: myProfile.experience,
        feePerConsultation: myProfile.feePerConsultation,
        qualifications: myProfile.qualifications,
        selectedDays: myProfile.timings?.map((t) => t.day) || [],
        ...timingFields,
      });
    }
  }, [myProfile, form]);

  useEffect(() => {
    if (success) {
      antMessage.success("Profile updated!");
      dispatch(clearDoctorSuccess());
    }
  }, [success, dispatch]);

  const onFinish = (values) => {
    const selectedDays = values.selectedDays || [];
    const timings = selectedDays.map((day) => ({
      day,
      startTime: values[`start_${day}`]?.format("HH:mm") || "09:00",
      endTime: values[`end_${day}`]?.format("HH:mm") || "17:00",
    }));
    dispatch(updateDoctorProfile({
      firstName: values.firstName, lastName: values.lastName,
      phone: values.phone, website: values.website || "",
      address: values.address, specialization: values.specialization,
      experience: values.experience, feePerConsultation: values.feePerConsultation,
      qualifications: values.qualifications || [],
      timings,
    }));
  };

  if (loading && !myProfile) return <Skeleton active paragraph={{ rows: 10 }} />;

  if (!myProfile) {
    return (
      <Alert
        message="Doctor profile not found."
        description="Your profile may not be set up yet."
        type="warning"
        showIcon
      />
    );
  }

  return (
    <div>
      <Title level={3} style={{ marginBottom: 24 }}>
        My Doctor Profile
        <Tag
          color={myProfile.status === "approved" ? "success" : myProfile.status === "pending" ? "warning" : "error"}
          style={{ marginLeft: 12 }}
        >
          {myProfile.status}
        </Tag>
      </Title>

      {error && (
        <Alert message={error} type="error" showIcon closable
          onClose={() => dispatch(clearDoctorError())} style={{ marginBottom: 20 }} />
      )}

      <Form form={form} layout="vertical" onFinish={onFinish} requiredMark={false} size="large">
        <Card title="Personal Information" style={{ borderRadius: 16, marginBottom: 24 }}>
          <Row gutter={[16, 0]}>
            <Col xs={24} sm={12}>
              <Form.Item name="firstName" label="First Name"
                rules={[{ required: true }]}>
                <Input prefix={<UserOutlined />} style={{ borderRadius: 8 }} />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item name="lastName" label="Last Name"
                rules={[{ required: true }]}>
                <Input prefix={<UserOutlined />} style={{ borderRadius: 8 }} />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item name="phone" label="Phone" rules={[{ required: true }]}>
                <Input prefix={<PhoneOutlined />} style={{ borderRadius: 8 }} />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item name="website" label="Website">
                <Input prefix={<GlobalOutlined />} style={{ borderRadius: 8 }} />
              </Form.Item>
            </Col>
            <Col xs={24}>
              <Form.Item name="address" label="Address" rules={[{ required: true }]}>
                <Input prefix={<HomeOutlined />} style={{ borderRadius: 8 }} />
              </Form.Item>
            </Col>
          </Row>
        </Card>

        <Card title="Professional Information" style={{ borderRadius: 16, marginBottom: 24 }}>
          <Row gutter={[16, 0]}>
            <Col xs={24} sm={12}>
              <Form.Item name="specialization" label="Specialization" rules={[{ required: true }]}>
                <Select showSearch style={{ borderRadius: 8 }}>
                  {SPECIALIZATIONS.map((s) => <Option key={s} value={s}>{s}</Option>)}
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item name="experience" label="Years of Experience" rules={[{ required: true }]}>
                <InputNumber min={0} max={60} style={{ width: "100%" }} />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item name="feePerConsultation" label="Consultation Fee ($)" rules={[{ required: true }]}>
                <InputNumber min={0} step={5} style={{ width: "100%" }} />
              </Form.Item>
            </Col>
          </Row>
        </Card>

        <Card title="Available Days" style={{ borderRadius: 16, marginBottom: 24 }}>
          <Form.Item name="selectedDays" label="Select Days">
            <Select mode="multiple" placeholder="Select days" style={{ borderRadius: 8 }}>
              {DAYS.map((d) => <Option key={d} value={d}>{d}</Option>)}
            </Select>
          </Form.Item>
          <Form.Item noStyle shouldUpdate>
            {({ getFieldValue }) => {
              const days = getFieldValue("selectedDays") || [];
              return days.map((day) => (
                <Row key={day} gutter={16} align="middle">
                  <Col span={4}><Text strong style={{ fontSize: 13 }}>{day.slice(0, 3)}</Text></Col>
                  <Col span={9}>
                    <Form.Item name={`start_${day}`} label="Start" style={{ marginBottom: 8 }}>
                      <TimePicker format="HH:mm" minuteStep={30} style={{ width: "100%" }} />
                    </Form.Item>
                  </Col>
                  <Col span={9}>
                    <Form.Item name={`end_${day}`} label="End" style={{ marginBottom: 8 }}>
                      <TimePicker format="HH:mm" minuteStep={30} style={{ width: "100%" }} />
                    </Form.Item>
                  </Col>
                </Row>
              ));
            }}
          </Form.Item>
        </Card>

        <Button type="primary" htmlType="submit" loading={loading}
          icon={<SaveOutlined />} style={{ height: 48, padding: "0 32px", borderRadius: 8 }}>
          Save Profile
        </Button>
      </Form>
    </div>
  );
};

export default DoctorProfile;
