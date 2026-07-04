import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../services/api";

export const fetchDashboardStats = createAsyncThunk(
  "admin/fetchStats",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get("/admin/stats");
      return data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch stats");
    }
  }
);

export const fetchAllUsers = createAsyncThunk(
  "admin/fetchUsers",
  async (params = {}, { rejectWithValue }) => {
    try {
      const { data } = await api.get("/admin/users", { params });
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch users");
    }
  }
);

export const toggleUserStatus = createAsyncThunk(
  "admin/toggleUserStatus",
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await api.put(`/admin/users/${id}/toggle-status`);
      return { id, isActive: data.data.isActive };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to toggle status");
    }
  }
);

export const fetchDoctorApplications = createAsyncThunk(
  "admin/fetchDoctorApplications",
  async (params = {}, { rejectWithValue }) => {
    try {
      const { data } = await api.get("/admin/doctors", { params });
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch applications");
    }
  }
);

export const updateDoctorStatus = createAsyncThunk(
  "admin/updateDoctorStatus",
  async ({ id, status, rejectionReason }, { rejectWithValue }) => {
    try {
      const { data } = await api.put(`/admin/doctors/${id}/status`, { status, rejectionReason });
      return data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Update failed");
    }
  }
);

export const fetchAllAppointments = createAsyncThunk(
  "admin/fetchAllAppointments",
  async (params = {}, { rejectWithValue }) => {
    try {
      const { data } = await api.get("/admin/appointments", { params });
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch appointments");
    }
  }
);

const adminSlice = createSlice({
  name: "admin",
  initialState: {
    stats: null,
    users: [],
    doctorApplications: [],
    appointments: [],
    pagination: {},
    loading: false,
    error: null,
    success: false,
  },
  reducers: {
    clearAdminError: (state) => { state.error = null; },
    clearAdminSuccess: (state) => { state.success = false; },
  },
  extraReducers: (builder) => {
    const pending = (state) => { state.loading = true; state.error = null; };
    const rejected = (state, action) => { state.loading = false; state.error = action.payload; };

    builder
      .addCase(fetchDashboardStats.pending, pending)
      .addCase(fetchDashboardStats.fulfilled, (state, action) => {
        state.loading = false;
        state.stats = action.payload;
      })
      .addCase(fetchDashboardStats.rejected, rejected)

      .addCase(fetchAllUsers.pending, pending)
      .addCase(fetchAllUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.users = action.payload.data;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchAllUsers.rejected, rejected)

      .addCase(toggleUserStatus.fulfilled, (state, action) => {
        state.users = state.users.map((u) =>
          u._id === action.payload.id ? { ...u, isActive: action.payload.isActive } : u
        );
      })

      .addCase(fetchDoctorApplications.pending, pending)
      .addCase(fetchDoctorApplications.fulfilled, (state, action) => {
        state.loading = false;
        state.doctorApplications = action.payload.data;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchDoctorApplications.rejected, rejected)

      .addCase(updateDoctorStatus.pending, pending)
      .addCase(updateDoctorStatus.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.doctorApplications = state.doctorApplications.map((d) =>
          d._id === action.payload._id ? action.payload : d
        );
      })
      .addCase(updateDoctorStatus.rejected, rejected)

      .addCase(fetchAllAppointments.pending, pending)
      .addCase(fetchAllAppointments.fulfilled, (state, action) => {
        state.loading = false;
        state.appointments = action.payload.data;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchAllAppointments.rejected, rejected);
  },
});

export const { clearAdminError, clearAdminSuccess } = adminSlice.actions;
export default adminSlice.reducer;
