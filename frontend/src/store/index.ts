import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import encryptionReducer from './slices/encryptionSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    encryption: encryptionReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
