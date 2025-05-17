import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import rideReducer from './slices/rideSlice';
import mapReducer from './slices/mapSlice';
import notificationReducer from './slices/notificationSlice';
import appModeReducer from './slices/appModeSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    ride: rideReducer,
    map: mapReducer,
    notification: notificationReducer,
    appMode: appModeReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch; 