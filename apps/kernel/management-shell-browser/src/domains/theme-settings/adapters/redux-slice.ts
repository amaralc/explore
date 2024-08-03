import { PayloadAction, createSlice } from '@reduxjs/toolkit';
import { IThemeSettings } from '../types';

const initialState: IThemeSettings = {
  colorPreset: 'blue',
  contrast: 'high',
  direction: 'ltr',
  paletteMode: 'light',
  responsiveFontSizes: true,
  layout: 'horizontal',
  navColor: 'blend-in',
  stretch: false,
};

export const themeSettingsSlice = createSlice({
  name: 'themeSettings',
  initialState,
  reducers: {
    overrideSettings: (state, action: PayloadAction<IThemeSettings>) => {
      state.colorPreset = action.payload.colorPreset;
      state.contrast = action.payload.contrast;
      state.direction = action.payload.direction;
      state.paletteMode = action.payload.paletteMode;
      state.responsiveFontSizes = action.payload.responsiveFontSizes;
      state.layout = action.payload.layout;
      state.navColor = action.payload.navColor;
      state.stretch = action.payload.stretch;
    },
  },
});
