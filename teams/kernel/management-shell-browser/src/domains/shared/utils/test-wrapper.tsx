import { Provider as ReduxProvider } from 'react-redux';

import { ReducersMapObject, combineReducers, configureStore } from '@reduxjs/toolkit';

import { enableDevTools } from '../../../config';

export const TestWrapper = ({
  reducers = {},
  children,
}: {
  reducers: ReducersMapObject<unknown, any>;
  children: React.ReactNode;
}) => {
  return (
    <ReduxProvider
      store={configureStore({
        reducer: combineReducers(reducers),
        devTools: enableDevTools,
      })}
    >
      {children}
    </ReduxProvider>
  );
};
