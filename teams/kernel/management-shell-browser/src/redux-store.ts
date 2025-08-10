import { AnyAction, ThunkAction, configureStore } from '@reduxjs/toolkit';
import { TypedUseSelectorHook, useDispatch as useReduxDispatch, useSelector as useReduxSelector } from 'react-redux';
import { themeSettingsSlice } from './domains/kernel/theme-settings/adapters/redux-slice';
import { userSessionSlice } from './domains/people/user-session/adapters/redux-slice';

export const store = configureStore({
  reducer: {
    themeSettings: themeSettingsSlice.reducer,
    userSession: userSessionSlice.reducer,
  },
});

export type IRootState = ReturnType<typeof store.getState>;

export type IAppDispatch = typeof store.dispatch;

export type IAppThunk = ThunkAction<void, IRootState, unknown, AnyAction>;

export const useAppSelector: TypedUseSelectorHook<IRootState> = useReduxSelector;

export const useAppDispatch = () => useReduxDispatch<IAppDispatch>();
