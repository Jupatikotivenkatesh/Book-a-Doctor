import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import doctorReducer from "./slices/doctorSlice";
import appointmentReducer from "./slices/appointmentSlice";
import notificationReducer from "./slices/notificationSlice";
import adminReducer from "./slices/adminSlice";

const store = configureStore({
  reducer: {
    auth: authReducer,
    doctors: doctorReducer,
    appointments: appointmentReducer,
    notifications: notificationReducer,
    admin: adminReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ["auth/login/fulfilled", "auth/register/fulfilled"],
      },
    }),
});

export default store;
