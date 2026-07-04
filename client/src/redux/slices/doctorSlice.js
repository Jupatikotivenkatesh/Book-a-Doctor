import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../services/api";

export const fetchDoctors = createAsyncThunk(
  "doctors/fetchAll",
  async (params = {}, { rejectWithValue }) => {
    try {
      const { data } = await api.get("/doctors", { params });
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch doctors");
    }
  }
);

export const fetchDoctorById = createAsyncThunk(
  "doctors/fetchById",
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await api.get(`/doctors/${id}`);
      return data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Doctor not found");
    }
  }
);

export const fetchMyDoctorProfile = createAsyncThunk(
  "doctors/fetchMyProfile",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get("/doctors/profile/me");
      return data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch profile");
    }
  }
);

export const applyDoctor = createAsyncThunk(
  "doctors/apply",
  async (formData, { rejectWithValue }) => {
    try {
      const { data } = await api.post("/doctors/apply", formData);
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Application failed");
    }
  }
);

export const updateDoctorProfile = createAsyncThunk(
  "doctors/updateProfile",
  async (profileData, { rejectWithValue }) => {
    try {
      const { data } = await api.put("/doctors/profile/me", profileData);
      return data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Update failed");
    }
  }
);

export const fetchDoctorAppointments = createAsyncThunk(
  "doctors/fetchAppointments",
  async (params = {}, { rejectWithValue }) => {
    try {
      const { data } = await api.get("/doctors/appointments/list", { params });
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch appointments");
    }
  }
);

export const updateAppointmentStatus = createAsyncThunk(
  "doctors/updateAppointmentStatus",
  async ({ appointmentId, status, rejectionReason }, { rejectWithValue }) => {
    try {
      const { data } = await api.put(`/doctors/appointments/${appointmentId}/status`, {
        status,
        rejectionReason,
      });
      return data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Update failed");
    }
  }
);

export const completeAppointment = createAsyncThunk(
  "doctors/completeAppointment",
  async ({ appointmentId, ...details }, { rejectWithValue }) => {
    try {
      const { data } = await api.put(`/doctors/appointments/${appointmentId}/complete`, details);
      return data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to complete appointment");
    }
  }
);

export const fetchSpecializations = createAsyncThunk(
  "doctors/fetchSpecializations",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get("/doctors/specializations");
      return data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch specializations");
    }
  }
);

const doctorSlice = createSlice({
  name: "doctors",
  initialState: {
    doctors: [],
    selectedDoctor: null,
    myProfile: null,
    appointments: [],
    specializations: [],
    pagination: {},
    loading: false,
    error: null,
    success: false,
  },
  reducers: {
    clearDoctorError: (state) => { state.error = null; },
    clearDoctorSuccess: (state) => { state.success = false; },
    clearSelectedDoctor: (state) => { state.selectedDoctor = null; },
  },
  extraReducers: (builder) => {
    const pending = (state) => { state.loading = true; state.error = null; };
    const rejected = (state, action) => { state.loading = false; state.error = action.payload; };

    builder
      .addCase(fetchDoctors.pending, pending)
      .addCase(fetchDoctors.fulfilled, (state, action) => {
        state.loading = false;
        state.doctors = action.payload.data;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchDoctors.rejected, rejected)

      .addCase(fetchDoctorById.pending, pending)
      .addCase(fetchDoctorById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedDoctor = action.payload;
      })
      .addCase(fetchDoctorById.rejected, rejected)

      .addCase(fetchMyDoctorProfile.pending, pending)
      .addCase(fetchMyDoctorProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.myProfile = action.payload;
      })
      .addCase(fetchMyDoctorProfile.rejected, rejected)

      .addCase(applyDoctor.pending, pending)
      .addCase(applyDoctor.fulfilled, (state) => {
        state.loading = false;
        state.success = true;
      })
      .addCase(applyDoctor.rejected, rejected)

      .addCase(updateDoctorProfile.pending, pending)
      .addCase(updateDoctorProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.myProfile = action.payload;
        state.success = true;
      })
      .addCase(updateDoctorProfile.rejected, rejected)

      .addCase(fetchDoctorAppointments.pending, pending)
      .addCase(fetchDoctorAppointments.fulfilled, (state, action) => {
        state.loading = false;
        state.appointments = action.payload.data;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchDoctorAppointments.rejected, rejected)

      .addCase(updateAppointmentStatus.pending, pending)
      .addCase(updateAppointmentStatus.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.appointments = state.appointments.map((apt) =>
          apt._id === action.payload._id ? action.payload : apt
        );
      })
      .addCase(updateAppointmentStatus.rejected, rejected)

      .addCase(completeAppointment.pending, pending)
      .addCase(completeAppointment.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.appointments = state.appointments.map((apt) =>
          apt._id === action.payload._id ? action.payload : apt
        );
      })
      .addCase(completeAppointment.rejected, rejected)

      .addCase(fetchSpecializations.fulfilled, (state, action) => {
        state.specializations = action.payload;
      });
  },
});

export const { clearDoctorError, clearDoctorSuccess, clearSelectedDoctor } = doctorSlice.actions;
export default doctorSlice.reducer;
