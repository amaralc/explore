import { PayloadAction, createSlice } from '@reduxjs/toolkit';
import { IUser } from '../../user/types';
import { IUserSession } from '../types';

const initialState: IUserSession = {
  isAuthenticated: false,
  user: null,
};

export const userSessionSlice = createSlice({
  name: 'userSession',
  initialState,
  reducers: {
    setUserSession: (state, action: PayloadAction<IUser | null>) => {
      state.user = action.payload;
      state.isAuthenticated = true;
    },
  },
});
