import React, { useEffect, useState, useCallback } from "react";
import { Row, Col, Typography, Pagination, Spin, Alert } from "antd";
import { useDispatch, useSelector } from "react-redux";
import { fetchDoctors, fetchSpecializations, clearDoctorError } from "../redux/slices/doctorSlice";
import DoctorCard from "../components/common/DoctorCard";
import DoctorFilters from "../components/common/DoctorFilters";
import SearchBar from "../components/common/SearchBar";
import EmptyState from "../components/common/EmptyState";
import LoadingSpinner from "../components/common/LoadingSpinner";
import { useNavigate } from "react-router-dom";

const { Title, Text } = Typography;

const DEFAULT_FILTERS = { specialization: "", minExp: null, minFee: null, maxFee: null };

const Doctors = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { doctors, specializations, pagination, loading, error } = useSelector(
    (state) => state.doctors
  );

  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 12;

  const loadDoctors = useCallback(
    (page = 1, search = searchTerm, activeFilters = filters) => {
      const params = { page, limit: PAGE_SIZE };
      if (search) params.search = search;
      if (activeFilters.specialization) params.specialization = activeFilters.specialization;
      if (activeFilters.minExp != null) params.minExp = activeFilters.minExp;
      if (activeFilters.minFee != null) params.minFee = activeFilters.minFee;
      if (activeFilters.maxFee != null) params.maxFee = activeFilters.maxFee;
      dispatch(fetchDoctors(params));
    },
    [dispatch, searchTerm, filters]
  );

  useEffect(() => {
    dispatch(fetchSpecializations());
    loadDoctors(1);
  }, [dispatch]);

  const handleSearch = (value) => {
    setSearchTerm(value);
    setCurrentPage(1);
    loadDoctors(1, value, filters);
  };

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    setCurrentPage(1);
    loadDoctors(1, searchTerm, newFilters);
  };

  const handleReset = () => {
    setFilters(DEFAULT_FILTERS);
    setSearchTerm("");
    setCurrentPage(1);
    loadDoctors(1, "", DEFAULT_FILTERS);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    loadDoctors(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div style={{ background: "#f8fbff", minHeight: "100vh" }}>
      {/* ─── Header Banner ─── */}
      <div style={{
        background: "linear-gradient(135deg, #001529 0%, #003a8c 100%)",
        padding: "48px 24px",
      }}>
        <div className="page-container" style={{ textAlign: "center" }}>
          <Title level={2} style={{ color: "#ffffff", margin: 0, marginBottom: 8 }}>
            Find Your Doctor
          </Title>
          <Text style={{ color: "#adc6ff", fontSize: 16 }}>
            Browse our network of verified, board-certified specialists
          </Text>
          <div style={{ maxWidth: 560, margin: "24px auto 0" }}>
            <SearchBar
              placeholder="Search by name, specialization..."
              onSearch={handleSearch}
              style={{ borderRadius: 12 }}
            />
          </div>
        </div>
      </div>

      {/* ─── Content ─── */}
      <div className="page-container" style={{ padding: "32px 24px" }}>
        {/* Filters */}
        <DoctorFilters
          specializations={specializations}
          filters={filters}
          onFilterChange={handleFilterChange}
          onReset={handleReset}
        />

        {/* Result Count */}
        {!loading && (
          <div style={{ marginBottom: 20 }}>
            <Text type="secondary">
              {pagination?.total != null
                ? `Showing ${doctors.length} of ${pagination.total} doctors`
                : `${doctors.length} doctor${doctors.length !== 1 ? "s" : ""} found`}
            </Text>
          </div>
        )}

        {error && (
          <Alert
            message={error}
            type="error"
            showIcon
            closable
            onClose={() => dispatch(clearDoctorError())}
            style={{ marginBottom: 24, borderRadius: 8 }}
          />
        )}

        {/* Grid */}
        {loading ? (
          <LoadingSpinner fullscreen tip="Loading doctors..." />
        ) : doctors.length === 0 ? (
          <EmptyState
            description="No doctors found matching your criteria"
            actionText="Clear Filters"
            onAction={handleReset}
          />
        ) : (
          <>
            <Row gutter={[24, 24]}>
              {doctors.map((doctor) => (
                <Col xs={24} sm={12} lg={8} xl={6} key={doctor._id}>
                  <DoctorCard doctor={doctor} />
                </Col>
              ))}
            </Row>

            {pagination?.total > PAGE_SIZE && (
              <div style={{ textAlign: "center", marginTop: 40 }}>
                <Pagination
                  current={currentPage}
                  total={pagination.total}
                  pageSize={PAGE_SIZE}
                  onChange={handlePageChange}
                  showSizeChanger={false}
                  showQuickJumper
                  showTotal={(total, range) => `${range[0]}-${range[1]} of ${total} doctors`}
                />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Doctors;
