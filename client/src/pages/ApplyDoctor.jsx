import React, { useEffect, useState } from "react";
import {
  Form, Input, InputNumber, Button, Typography, Card,
  Row, Col, Select, Alert, Space, Divider, Steps,
  TimePicker, Checkbox, message as antMessage,
} from "antd";
import {
  UserOutlined, PhoneOutlined, GlobalOutlined,
  HomeOutlined, MedicineBoxOutlined, PlusOutlined,
  DeleteOutlined, CheckCircleOutlined,
} from "@ant-design/icons";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { applyDoctor, clearDoctorError, clearDoctorSuccess } from "../redux/slices/doctorSlice";
import dayjs from "dayjs";

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;
const { TextArea } = Input;

const SPECIALIZATIONS = [
  "General Practice", "Cardiology", "Dermatology", "Endocrinology",
  "Gastroenterology", "Gynecology", "Hematology", "Nephrology",
  "Neurology", "Oncology", "Ophthalmology", "Orthopedics",
  "Otolaryngology", "Pediatrics", "Psychiatry", "Pulmonology",
  "Radiology", "Rheumatology", "Surgery", "Urology",
];

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

const ApplyDoctor = () => {
  const [form] = Form.useForm();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error, success } = useSelector((state) => state.doctors);
  const [submitted, setSubmitted] = useState(false);
  const [selectedDays, setSelectedDays] = useState([]);

  useEffect(() => {
    dispatch(clearDoctorError());
    dispatch(clearDoctorSuccess());
  }, [dispatch]);

  useEffect(() => {
    if (success && submitted) {
      antMessage.success("Application submitted! Admin will review it shortly.");
      navigate("/dashboard");
    }
  }, [success, submitted, navigate]);

  const onFinish = (values) => {
    const timings = selectedDays.map((day) => ({
      day,
      startTime: values[`start_${day}`]?.format("HH:mm") || "09:00",
      endTime: values[`end_${day}`]?.format("HH:mm") || "17:00",
    }));

    const qualifications = (values.qualifications || []).map((q) => ({
      degree: q.degree,
      institution: q.institution,
      year: q.year,
    }));

    dispatch(applyDoctor({
      firstName: values.firstName,
      lastName: values.lastName,
      phone: values.phone,
      website: values.website || "",
      address: values.address,
      specialization: values.specialization,
      experience: values.experience,
      feePerConsultation: values.feePerConsultation,
      qualifications,
      timings,
    }));
    setSubmitted(true);
  };

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <Title level={3} style={{ margin: 0 }}>
          <MedicineBoxOutlined style={{ color: "#1890ff", marginRight: 10 }} />
          Apply to Become a Doctor
        </Title>
        <Paragraph type="secondary" style={{ marginTop: 6 }}>
          Fill out the form below to apply. Our admin team will review your application and get back to you.
        </Paragraph>
      </div>

      {error && (
        <Alert message={error} type="error" showIcon closable
          onClose={() => dispatch(clearDoctorError())} style={{ marginBottom: 20, borderRadius: 8 }} />
      )}

      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        requiredMark={false}
        size="large"
      >
        {/* ─── Personal Info ─── */}
        <Card title="Personal Information" style={{ borderRadius: 16, marginBottom: 24 }}>
          <Row gutter={[16, 0]}>
            <Col xs={24} sm={12}>
              <Form.Item name="firstName" label="First Name"
                rules={[{ required: true, message: "First name is required" }]}>
                <Input prefix={<UserOutlined />} placeholder="First name" style={{ borderRadius: 8 }} />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item name="lastName" label="Last Name"
                rules={[{ required: true, message: "Last name is required" }]}>
                <Input prefix={<UserOutlined />} placeholder="Last name" style={{ borderRadius: 8 }} />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item name="phone" label="Phone Number"
                rules={[{ required: true, message: "Phone number is required" }]}>
                <Input prefix={<PhoneOutlined />} placeholder="+1 (555) 000-0000" style={{ borderRadius: 8 }} />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item name="website" label="Website (Optional)">
                <Input prefix={<GlobalOutlined />} placeholder="https://yourwebsite.com" style={{ borderRadius: 8 }} />
              </Form.Item>
            </Col>
            <Col xs={24}>
              <Form.Item name="address" label="Clinic / Practice Address"
                rules={[{ required: true, message: "Address is required" }]}>
                <Input prefix={<HomeOutlined />} placeholder="Full address" style={{ borderRadius: 8 }} />
              </Form.Item>
            </Col>
          </Row>
        </Card>

        {/* ─── Professional Info ─── */}
        <Card title="Professional Information" style={{ borderRadius: 16, marginBottom: 24 }}>
          <Row gutter={[16, 0]}>
            <Col xs={24} sm={12}>
              <Form.Item name="specialization" label="Specialization"
                rules={[{ required: true, message: "Please select a specialization" }]}>
                <Select placeholder="Select specialization" style={{ borderRadius: 8 }} showSearch
                  filterOption={(input, option) => option.children.toLowerCase().includes(input.toLowerCase())}>
                  {SPECIALIZATIONS.map((s) => <Option key={s} value={s}>{s}</Option>)}
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item name="experience" label="Years of Experience"
                rules={[{ required: true, message: "Experience is required" }, { type: "number", min: 0 }]}>
                <InputNumber min={0} max={60} style={{ width: "100%", borderRadius: 8 }} placeholder="e.g. 5" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item name="feePerConsultation" label="Consultation Fee ($)"
                rules={[{ required: true, message: "Fee is required" }, { type: "number", min: 0 }]}>
                <InputNumber min={0} step={5} style={{ width: "100%", borderRadius: 8 }} placeholder="e.g. 100" />
              </Form.Item>
            </Col>
          </Row>
        </Card>

        {/* ─── Qualifications ─── */}
        <Card title="Qualifications" style={{ borderRadius: 16, marginBottom: 24 }}>
          <Form.List name="qualifications" initialValue={[{}]}>
            {(fields, { add, remove }) => (
              <>
                {fields.map(({ key, name, ...rest }) => (
                  <Row key={key} gutter={[16, 0]} align="middle">
                    <Col xs={24} sm={8}>
                      <Form.Item {...rest} name={[name, "degree"]} label="Degree"
                        rules={[{ required: true, message: "Degree required" }]}>
                        <Input placeholder="e.g. MBBS, MD" style={{ borderRadius: 8 }} />
                      </Form.Item>
                    </Col>
                    <Col xs={24} sm={10}>
                      <Form.Item {...rest} name={[name, "institution"]} label="Institution"
                        rules={[{ required: true, message: "Institution required" }]}>
                        <Input placeholder="University / College" style={{ borderRadius: 8 }} />
                      </Form.Item>
                    </Col>
                    <Col xs={24} sm={4}>
                      <Form.Item {...rest} name={[name, "year"]} label="Year">
                        <InputNumber min={1970} max={new Date().getFullYear()} style={{ width: "100%" }} />
                      </Form.Item>
                    </Col>
                    {fields.length > 1 && (
                      <Col xs={24} sm={2} style={{ paddingTop: 8 }}>
                        <Button danger type="text" icon={<DeleteOutlined />} onClick={() => remove(name)} />
                      </Col>
                    )}
                  </Row>
                ))}
                <Button type="dashed" onClick={() => add()} icon={<PlusOutlined />} block style={{ borderRadius: 8 }}>
                  Add Qualification
                </Button>
              </>
            )}
          </Form.List>
        </Card>

        {/* ─── Timings ─── */}
        <Card title="Available Days & Hours" style={{ borderRadius: 16, marginBottom: 24 }}>
          <div style={{ marginBottom: 16 }}>
            <Text type="secondary" style={{ fontSize: 13 }}>Select days when you are available:</Text>
          </div>
          <Space wrap style={{ marginBottom: 20 }}>
            {DAYS.map((day) => (
              <Button
                key={day}
                type={selectedDays.includes(day) ? "primary" : "default"}
                onClick={() => {
                  setSelectedDays((prev) =>
                    prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
                  );
                }}
                style={{ borderRadius: 20 }}
                size="small"
              >
                {day.slice(0, 3)}
              </Button>
            ))}
          </Space>

          {selectedDays.map((day) => (
            <Row key={day} gutter={[16, 0]} align="middle">
              <Col xs={6} sm={4}>
                <Text strong style={{ fontSize: 13 }}>{day.slice(0, 3)}</Text>
              </Col>
              <Col xs={9} sm={8}>
                <Form.Item name={`start_${day}`} label="Start" initialValue={dayjs("09:00", "HH:mm")}
                  style={{ marginBottom: 8 }}>
                  <TimePicker format="HH:mm" minuteStep={30} style={{ width: "100%" }} />
                </Form.Item>
              </Col>
              <Col xs={9} sm={8}>
                <Form.Item name={`end_${day}`} label="End" initialValue={dayjs("17:00", "HH:mm")}
                  style={{ marginBottom: 8 }}>
                  <TimePicker format="HH:mm" minuteStep={30} style={{ width: "100%" }} />
                </Form.Item>
              </Col>
            </Row>
          ))}

          {selectedDays.length === 0 && (
            <Text type="secondary" style={{ fontSize: 13 }}>
              Please select at least one available day.
            </Text>
          )}
        </Card>

        <Button
          type="primary" htmlType="submit" size="large"
          loading={loading}
          icon={<CheckCircleOutlined />}
          style={{ height: 52, padding: "0 40px", borderRadius: 10, fontSize: 16 }}
        >
          Submit Application
        </Button>
      </Form>
    </div>
  );
};

export default ApplyDoctor;
