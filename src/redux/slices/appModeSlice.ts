import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export enum AppMode {
  PASSENGER = 'passenger',
  RIDER = 'rider'
}

interface AppModeState {
  currentMode: AppMode;
}

const initialState: AppModeState = {
  currentMode: AppMode.PASSENGER, // Default mode is passenger
};

const appModeSlice = createSlice({
  name: 'appMode',
  initialState,
  reducers: {
    setAppMode: (state, action: PayloadAction<AppMode>) => {
      state.currentMode = action.payload;
    },
    toggleAppMode: (state) => {
      state.currentMode = state.currentMode === AppMode.PASSENGER 
        ? AppMode.RIDER 
        : AppMode.PASSENGER;
    },
  },
});

export const { setAppMode, toggleAppMode } = appModeSlice.actions;

export default appModeSlice.reducer; 