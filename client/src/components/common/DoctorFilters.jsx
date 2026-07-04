import React from "react";
import { Card, Select, Slider, InputNumber, Space, Button, Typography, Row, Col } from "antd";
import { FilterOutlined, ClearOutlined } from "@ant-design/icons";

const { Text } = Typography;
const { Option } = Select;

const DoctorFilters = ({
  specializations = [],
  filters,
  onFilterChange,
  onReset,
}) => {
  const handleChange = (key, value) => {
    onFilterChange({ ...filters, [key]: value });
  };

  return (
    <Card
      title={
        <Space>
          <FilterOutlined style={{ color: "#1890ff" }} />
          <Text strong>Filters</Text>
        </Space>
      }
      extra={
        <Button type="link" icon={<ClearOutlined />} onClick={onReset} size="small">
          Reset
        </Button>
      }
      style={{ borderRadius: 12, marginBottom: 24 }}
      bodyStyle={{ padding: "16px 20px" }}
    >
      <Row gutter={[16, 16]}>
        {/* Specialization */}
        <Col xs={24} sm={12} md={6}>
          <Text type="secondary" style={{ fontSize: 12, display: "block", marginBottom: 6 }}>
            SPECIALIZATION
          </Text>
          <Select
            placeholder="All Specializations"
            style={{ width: "100%" }}
            value={filters.specialization || undefined}
            onChange={(val) => handleChange("specialization", val)}
            allowClear
            showSearch
            filterOption={(input, option) =>
              option.children.toLowerCase().includes(input.toLowerCase())
            }
          >
            {specializations.map((s) => (
              <Option key={s} value={s}>{s}</Option>
            ))}
          </Select>
        </Col>

        {/* Min Experience */}
        <Col xs={24} sm={12} md={6}>
          <Text type="secondary" style={{ fontSize: 12, display: "block", marginBottom: 6 }}>
            MIN EXPERIENCE (YEARS)
          </Text>
          <InputNumber
            min={0}
            max={50}
            placeholder="0"
            style={{ width: "100%" }}
            value={filters.minExp}
            onChange={(val) => handleChange("minExp", val)}
          />
        </Col>

        {/* Fee Range */}
        <Col xs={24} sm={12} md={6}>
          <Text type="secondary" style={{ fontSize: 12, display: "block", marginBottom: 6 }}>
            MAX FEE ($)
          </Text>
          <InputNumber
            min={0}
            max={10000}
            step={10}
            placeholder="Any"
            style={{ width: "100%" }}
            value={filters.maxFee}
            onChange={(val) => handleChange("maxFee", val)}
          />
        </Col>

        {/* Min Fee */}
        <Col xs={24} sm={12} md={6}>
          <Text type="secondary" style={{ fontSize: 12, display: "block", marginBottom: 6 }}>
            MIN FEE ($)
          </Text>
          <InputNumber
            min={0}
            max={10000}
            step={10}
            placeholder="Any"
            style={{ width: "100%" }}
            value={filters.minFee}
            onChange={(val) => handleChange("minFee", val)}
          />
        </Col>
      </Row>
    </Card>
  );
};

export default DoctorFilters;
