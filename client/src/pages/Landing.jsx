import React, { useEffect } from "react";
import {
  Row, Col, Typography, Button, Card, Avatar, Rate,
  Space, Statistic, Divider,
} from "antd";
import {
  CalendarOutlined, SafetyCertificateOutlined, MedicineBoxOutlined,
  TeamOutlined, StarOutlined, RightOutlined, CheckCircleOutlined,
  UserOutlined, HeartOutlined, ThunderboltOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchDoctors, fetchSpecializations } from "../redux/slices/doctorSlice";
import DoctorCard from "../components/common/DoctorCard";

const { Title, Text, Paragraph } = Typography;

// ─── Static data ──────────────────────────────────────────────────────────────
const FEATURES = [
  {
    icon: <CalendarOutlined style={{ fontSize: 32, color: "#1890ff" }} />,
    title: "Easy Scheduling",
    desc: "Book appointments in minutes, any time of day. No phone calls needed.",
  },
  {
    icon: <SafetyCertificateOutlined style={{ fontSize: 32, color: "#52c41a" }} />,
    title: "Verified Doctors",
    desc: "Every doctor on our platform is thoroughly vetted and board-certified.",
  },
  {
    icon: <MedicineBoxOutlined style={{ fontSize: 32, color: "#722ed1" }} />,
    title: "Secure Records",
    desc: "Upload and manage your medical documents securely in one place.",
  },
  {
    icon: <TeamOutlined style={{ fontSize: 32, color: "#fa8c16" }} />,
    title: "All Specializations",
    desc: "From general practice to specialized care — find the right doctor for you.",
  },
];

const STEPS = [
  { num: "01", title: "Create Account", desc: "Sign up in seconds with just your email.", icon: <UserOutlined /> },
  { num: "02", title: "Find a Doctor", desc: "Browse verified specialists by specialty or rating.", icon: <MedicineBoxOutlined /> },
  { num: "03", title: "Book Appointment", desc: "Pick a date and time that works for you.", icon: <CalendarOutlined /> },
  { num: "04", title: "Get Consultation", desc: "Meet with your doctor and receive personalized care.", icon: <HeartOutlined /> },
];

const TESTIMONIALS = [
  {
    name: "Sarah Johnson",
    role: "Patient",
    rating: 5,
    text: "Booking was effortless and the doctor was incredibly professional. Highly recommend!",
  },
  {
    name: "Michael Chen",
    role: "Patient",
    rating: 5,
    text: "Found a cardiologist in my area within minutes. The whole process was seamless.",
  },
  {
    name: "Emily Rodriguez",
    role: "Patient",
    rating: 4,
    text: "Love that I can upload my documents beforehand. Saved so much time at the appointment.",
  },
];

// ─── Hero Section ─────────────────────────────────────────────────────────────
const HeroSection = ({ onGetStarted, onBrowse }) => (
  <section
    style={{
      background: "linear-gradient(135deg, #001529 0%, #003a8c 60%, #1890ff 100%)",
      padding: "80px 24px 100px",
      position: "relative",
      overflow: "hidden",
    }}
  >
    {/* Decorative circles */}
    {[
      { size: 300, top: -100, right: -100, opacity: 0.05 },
      { size: 200, bottom: -50, left: -50, opacity: 0.07 },
    ].map((c, i) => (
      <div
        key={i}
        style={{
          position: "absolute", width: c.size, height: c.size,
          borderRadius: "50%", border: "2px solid white",
          top: c.top, right: c.right, bottom: c.bottom, left: c.left,
          opacity: c.opacity,
        }}
      />
    ))}

    <div className="page-container" style={{ position: "relative", zIndex: 1 }}>
      <Row gutter={[48, 48]} align="middle">
        <Col xs={24} lg={12}>
          <div style={{ color: "#69b1ff", fontWeight: 600, marginBottom: 12, fontSize: 14, letterSpacing: 2 }}>
            ✦ TRUSTED HEALTHCARE PLATFORM
          </div>
          <Title
            style={{
              color: "#ffffff", fontSize: "clamp(32px, 5vw, 56px)",
              lineHeight: 1.15, marginBottom: 20,
            }}
          >
            Book Your Doctor{" "}
            <span style={{ color: "#69b1ff" }}>Appointment</span>{" "}
            with Ease
          </Title>
          <Paragraph style={{ color: "#adc6ff", fontSize: 17, lineHeight: 1.8, marginBottom: 36, maxWidth: 480 }}>
            Connect with verified, board-certified doctors in your area. 
            Book appointments instantly, upload medical records securely, 
            and receive expert care — all in one platform.
          </Paragraph>
          <Space size="large" wrap>
            <Button
              type="primary" size="large" onClick={onGetStarted}
              icon={<CalendarOutlined />}
              style={{ height: 52, padding: "0 32px", fontSize: 16, borderRadius: 10 }}
            >
              Book Appointment
            </Button>
            <Button
              size="large" ghost onClick={onBrowse}
              icon={<RightOutlined />}
              style={{ height: 52, padding: "0 28px", fontSize: 16, borderRadius: 10 }}
            >
              Browse Doctors
            </Button>
          </Space>
        </Col>

        <Col xs={24} lg={12}>
          <Row gutter={[16, 16]}>
            {[
              { value: "500+", label: "Verified Doctors" },
              { value: "10K+", label: "Happy Patients" },
              { value: "50+", label: "Specializations" },
              { value: "4.9★", label: "Average Rating" },
            ].map((stat) => (
              <Col span={12} key={stat.label}>
                <Card
                  style={{
                    background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.15)",
                    borderRadius: 16, backdropFilter: "blur(10px)", textAlign: "center",
                  }}
                  bodyStyle={{ padding: "24px 16px" }}
                >
                  <Title style={{ color: "#ffffff", margin: 0, fontSize: 32 }}>{stat.value}</Title>
                  <Text style={{ color: "#adc6ff", fontSize: 13 }}>{stat.label}</Text>
                </Card>
              </Col>
            ))}
          </Row>
        </Col>
      </Row>
    </div>
  </section>
);

// ─── Main Component ────────────────────────────────────────────────────────────
const Landing = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { doctors, loading } = useSelector((state) => state.doctors);
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(fetchDoctors({ limit: 4 }));
    dispatch(fetchSpecializations());
  }, [dispatch]);

  const handleGetStarted = () => {
    if (user) {
      const map = { admin: "/admin/dashboard", doctor: "/doctor/dashboard", patient: "/dashboard" };
      navigate(map[user.role] || "/doctors");
    } else {
      navigate("/register");
    }
  };

  return (
    <div>
      {/* ─── Hero ─── */}
      <HeroSection onGetStarted={handleGetStarted} onBrowse={() => navigate("/doctors")} />

      {/* ─── Features ─── */}
      <section style={{ padding: "80px 24px", background: "#ffffff" }}>
        <div className="page-container">
          <div style={{ textAlign: "center", marginBottom: 56 }}>
            <Text style={{ color: "#1890ff", fontWeight: 600, letterSpacing: 2, fontSize: 13 }}>
              WHY CHOOSE US
            </Text>
            <Title level={2} style={{ marginTop: 8, marginBottom: 12 }}>
              Everything You Need for Better Healthcare
            </Title>
            <Paragraph type="secondary" style={{ fontSize: 16, maxWidth: 500, margin: "0 auto" }}>
              Our platform makes it simple to access quality healthcare when you need it.
            </Paragraph>
          </div>

          <Row gutter={[32, 32]}>
            {FEATURES.map((f) => (
              <Col xs={24} sm={12} lg={6} key={f.title}>
                <Card
                  style={{ borderRadius: 16, textAlign: "center", height: "100%", border: "1px solid #f0f0f0" }}
                  bodyStyle={{ padding: 32 }}
                  hoverable
                >
                  <div style={{
                    width: 72, height: 72, borderRadius: 20,
                    background: "#f0f7ff", display: "flex",
                    alignItems: "center", justifyContent: "center",
                    margin: "0 auto 20px",
                  }}>
                    {f.icon}
                  </div>
                  <Title level={4} style={{ marginBottom: 10 }}>{f.title}</Title>
                  <Text type="secondary" style={{ fontSize: 14, lineHeight: 1.7 }}>{f.desc}</Text>
                </Card>
              </Col>
            ))}
          </Row>
        </div>
      </section>

      {/* ─── How It Works ─── */}
      <section style={{ padding: "80px 24px", background: "#f8fbff" }}>
        <div className="page-container">
          <div style={{ textAlign: "center", marginBottom: 56 }}>
            <Text style={{ color: "#1890ff", fontWeight: 600, letterSpacing: 2, fontSize: 13 }}>
              HOW IT WORKS
            </Text>
            <Title level={2} style={{ marginTop: 8 }}>Get Started in 4 Simple Steps</Title>
          </div>

          <Row gutter={[32, 32]} align="middle">
            {STEPS.map((step, i) => (
              <Col xs={24} sm={12} lg={6} key={step.num}>
                <div style={{ textAlign: "center", position: "relative" }}>
                  {/* Connector line */}
                  {i < STEPS.length - 1 && (
                    <div style={{
                      display: "none",
                      position: "absolute", top: 36, left: "50%",
                      width: "100%", height: 2,
                      background: "linear-gradient(to right, #1890ff, #69b1ff)",
                    }} />
                  )}
                  <div style={{
                    width: 72, height: 72, borderRadius: "50%",
                    background: "linear-gradient(135deg, #1890ff, #096dd9)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    margin: "0 auto 16px", boxShadow: "0 8px 24px rgba(24,144,255,0.3)",
                  }}>
                    <span style={{ color: "white", fontSize: 24 }}>{step.icon}</span>
                  </div>
                  <Text style={{ color: "#1890ff", fontWeight: 700, fontSize: 13, display: "block", marginBottom: 6 }}>
                    STEP {step.num}
                  </Text>
                  <Title level={4} style={{ marginBottom: 8 }}>{step.title}</Title>
                  <Text type="secondary" style={{ fontSize: 14, lineHeight: 1.7 }}>{step.desc}</Text>
                </div>
              </Col>
            ))}
          </Row>
        </div>
      </section>

      {/* ─── Featured Doctors ─── */}
      <section style={{ padding: "80px 24px", background: "#ffffff" }}>
        <div className="page-container">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 40, flexWrap: "wrap", gap: 16 }}>
            <div>
              <Text style={{ color: "#1890ff", fontWeight: 600, letterSpacing: 2, fontSize: 13 }}>
                OUR SPECIALISTS
              </Text>
              <Title level={2} style={{ margin: "8px 0 0" }}>Meet Our Top Doctors</Title>
            </div>
            <Button type="link" onClick={() => navigate("/doctors")} icon={<RightOutlined />} style={{ fontSize: 15 }}>
              View All Doctors
            </Button>
          </div>

          <Row gutter={[24, 24]}>
            {loading
              ? Array.from({ length: 4 }).map((_, i) => (
                  <Col xs={24} sm={12} lg={6} key={i}>
                    <Card loading style={{ borderRadius: 16, height: 280 }} />
                  </Col>
                ))
              : doctors.slice(0, 4).map((doctor) => (
                  <Col xs={24} sm={12} lg={6} key={doctor._id}>
                    <DoctorCard doctor={doctor} />
                  </Col>
                ))}
          </Row>
        </div>
      </section>

      {/* ─── Testimonials ─── */}
      <section style={{ padding: "80px 24px", background: "#f8fbff" }}>
        <div className="page-container">
          <div style={{ textAlign: "center", marginBottom: 56 }}>
            <Text style={{ color: "#1890ff", fontWeight: 600, letterSpacing: 2, fontSize: 13 }}>
              PATIENT STORIES
            </Text>
            <Title level={2} style={{ marginTop: 8 }}>What Our Patients Say</Title>
          </div>

          <Row gutter={[32, 32]}>
            {TESTIMONIALS.map((t) => (
              <Col xs={24} md={8} key={t.name}>
                <Card
                  style={{ borderRadius: 16, height: "100%", border: "1px solid #f0f0f0" }}
                  bodyStyle={{ padding: 32 }}
                  hoverable
                >
                  <Rate disabled defaultValue={t.rating} style={{ fontSize: 14, marginBottom: 16 }} />
                  <Paragraph style={{ fontSize: 15, lineHeight: 1.8, marginBottom: 20, color: "#555" }}>
                    "{t.text}"
                  </Paragraph>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <Avatar style={{ background: "#1890ff" }} icon={<UserOutlined />} />
                    <div>
                      <Text strong style={{ display: "block" }}>{t.name}</Text>
                      <Text type="secondary" style={{ fontSize: 12 }}>{t.role}</Text>
                    </div>
                  </div>
                </Card>
              </Col>
            ))}
          </Row>
        </div>
      </section>

      {/* ─── CTA Section ─── */}
      <section style={{
        padding: "80px 24px",
        background: "linear-gradient(135deg, #001529 0%, #003a8c 100%)",
        textAlign: "center",
      }}>
        <div className="page-container">
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            background: "rgba(255,255,255,0.1)", borderRadius: 20,
            padding: "6px 16px", marginBottom: 24,
          }}>
            <ThunderboltOutlined style={{ color: "#69b1ff" }} />
            <Text style={{ color: "#69b1ff", fontSize: 13, fontWeight: 600 }}>
              GET STARTED TODAY — IT'S FREE
            </Text>
          </div>
          <Title style={{ color: "#ffffff", fontSize: "clamp(28px, 4vw, 44px)", marginBottom: 16 }}>
            Your Health Journey Starts Here
          </Title>
          <Paragraph style={{ color: "#adc6ff", fontSize: 17, maxWidth: 500, margin: "0 auto 36px" }}>
            Join thousands of patients who found the right doctor through our platform.
            Book your first appointment today — it's fast, easy, and free.
          </Paragraph>
          <Space size="large" wrap style={{ justifyContent: "center" }}>
            <Button
              type="primary" size="large"
              onClick={() => navigate("/register")}
              style={{ height: 52, padding: "0 40px", fontSize: 16, borderRadius: 10 }}
            >
              Create Free Account
            </Button>
            <Button
              size="large" ghost
              onClick={() => navigate("/doctors")}
              style={{ height: 52, padding: "0 36px", fontSize: 16, borderRadius: 10 }}
            >
              Browse Doctors
            </Button>
          </Space>
        </div>
      </section>
    </div>
  );
};

export default Landing;
