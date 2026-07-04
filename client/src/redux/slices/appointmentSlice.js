import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../services/api";

export const bookAppointment = createAsyncThunk(
  "appointments/book",
  async (appointmentData, { rejectWithValue }) => {
    try {
      const { data } = await api.post("/appointments", appointmentData);
      return data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Booking failed");
    }
  }
);

export const fetchMyAppointments = createAsyncThunk(
  "appointments/fetchMine",
  async (params = {}, { rejectWithValue }) => {
    try {
      const { data } = await api.get("/users/appointments", { params });
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch appointments");
    }
  }
);

export const fetchAppointmentById = createAsyncThunk(
  "appointments/fetchById",
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await api.get(`/appointments/${id}`);
      return data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Appointment not found");
    }
  }
);

export const uploadDocuments = createAsyncThunk(
  "appointments/uploadDocuments",
  async ({ id, formData }, { rejectWithValue }) => {
    try {
      const { data } = await api.post(`/appointments/${id}/documents`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Upload failed");
    }
  }
);

export const cancelAppointment = createAsyncThunk(
  "appointments/cancel",
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await api.put(`/appointments/${id}/cancel`);
      return data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Cancellation failed");
    }
  }
);

export const rateAppointment = createAsyncThunk(
  "appointments/rate",
  async ({ id, score, review }, { rejectWithValue }) => {
    try {
      const { data } = await api.post(`/appointments/${id}/rate`, { score, review });
      return { id, rating: data.data };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Rating failed");
    }
  }
);

const appointmentSlice = createSlice({
  name: "appointments",
  initialState: {
    appointments: [],
    selectedAppointment: null,
    pagination: {},
    loading: false,
    uploadLoading: false,
    error: null,
    success: false,
  },
  reducers: {
    clearAppointmentError: (state) => { state.error = null; },
    clearAppointmentSuccess: (state) => { state.success = false; },
    clearSelectedAppointment: (state) => { state.selectedAppointment = null; },
  },
  extraReducers: (builder) => {
    const pending = (state) => { state.loading = true; state.error = null; };
    const rejected = (state, action) => { state.loading = false; state.error = action.payload; };

    builder
      .addCase(bookAppointment.pending, pending)
      .addCase(bookAppointment.fulfilled, (state, action) => {
        state.loading = false;
        state.appointments.unshift(action.payload);
        state.success = true;
      })
      .addCase(bookAppointment.rejected, rejected)

      .addCase(fetchMyAppointments.pending, pending)
      .addCase(fetchMyAppointments.fulfilled, (state, action) => {
        state.loading = false;
        state.appointments = action.payload.data;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchMyAppointments.rejected, rejected)

      .addCase(fetchAppointmentById.pending, pending)
      .addCase(fetchAppointmentById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedAppointment = action.payload;
      })
      .addCase(fetchAppointmentById.rejected, rejected)

      .addCase(uploadDocuments.pending, (state) => { state.uploadLoading = true; state.error = null; })
      .addCase(uploadDocuments.fulfilled, (state) => {
        state.uploadLoading = false;
        state.success = true;
      })
      .addCase(uploadDocuments.rejected, (state, action) => {
        state.uploadLoading = false;
        state.error = action.payload;
      })

      .addCase(cancelAppointment.pending, pending)
      .addCase(cancelAppointment.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.appointments = state.appointments.map((apt) =>
          apt._id === action.payload._id ? action.payload : apt
        );
        if (state.selectedAppointment?._id === action.payload._id) {
          state.selectedAppointment = action.payload;
        }
      })
      .addCase(cancelAppointment.rejected, rejected)

      .addCase(rateAppointment.pending, pending)
      .addCase(rateAppointment.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.appointments = state.appointments.map((apt) =>
          apt._id === action.payload.id
            ? { ...apt, rating: action.payload.rating }
            : apt
        );
      })
      .addCase(rateAppointment.rejected, rejected);
  },
});

export const { clearAppointmentError, clearAppointmentSuccess, clearSelectedAppointment } =
  appointmentSlice.actions;
export default appointmentSlice.reducer;
