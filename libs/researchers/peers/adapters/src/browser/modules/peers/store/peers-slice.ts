import {
  createAsyncThunk,
  createEntityAdapter,
  createSelector,
  createSlice,
  EntityState,
  PayloadAction,
} from '@reduxjs/toolkit';
import { RootState } from '../../../data';

import { PeerEntity } from '@peerlab/researchers/peers/core/domains/peers/entities/peer/entity';

export const PEERS_FEATURE_KEY = 'peers';

export interface PeersState extends EntityState<PeerEntity> {
  loadingStatus: 'not loaded' | 'loading' | 'loaded' | 'error';
  error: string | null;
}

export const peersAdapter = createEntityAdapter<PeerEntity>({
  selectId: (peer: PeerEntity) => peer.id,
  sortComparer: (a: PeerEntity, b: PeerEntity) => a.name.localeCompare(b.name),
});

export const fetchPeers = createAsyncThunk<PeerEntity[]>('peers/fetchStatus', async (_, thunkAPI) => {
  // TODO: replace with real API call
  // const getPeersResponse = await axios.request<GetPeersResponseDto>({
  //   baseURL: 'http://localhost:8080',
  //   method: 'GET',
  //   url: `/peers?page=${1}&limit=${10}`,
  //   headers: { Authorization: 'my-secret-api-key' },
  // });

  // const peers = getPeersResponse.data.peers;

  return [{ id: 'id-1', name: 'name-1', subjects: [], username: 'username-1' }];
});

export const initialPeersState: PeersState = peersAdapter.getInitialState({
  loadingStatus: 'not loaded',
  error: null,
});

export const peersSlice = createSlice({
  name: PEERS_FEATURE_KEY,
  initialState: initialPeersState,
  reducers: {
    add: peersAdapter.addOne,
    remove: peersAdapter.removeOne,
    removeMany: peersAdapter.setAll,
    // ...
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPeers.pending, (state: PeersState) => {
        state.loadingStatus = 'loading';
      })
      .addCase(fetchPeers.fulfilled, (state: PeersState, action: PayloadAction<PeerEntity[]>) => {
        peersAdapter.setAll(state, action.payload);
        state.loadingStatus = 'loaded';
      })
      .addCase(fetchPeers.rejected, (state: PeersState, action) => {
        state.loadingStatus = 'error';
        state.error = action.error.message || null;
      });
  },
});

/*
 * Export reducer for store configuration.
 */
export const peersReducer = peersSlice.reducer;

/*
 * Export action creators to be dispatched. For use with the `useDispatch` hook.
 * See: https://react-redux.js.org/next/api/hooks#usedispatch
 */
export const peersActions = peersSlice.actions;

/*
 * Export selectors to query state. For use with the `useSelector` hook.
 */
const { selectAll, selectEntities } = peersAdapter.getSelectors();
export const getPeersState = (rootState: RootState): PeersState => rootState[PEERS_FEATURE_KEY];
export const selectAllPeers = createSelector(getPeersState, selectAll);
export const selectPeersEntities = createSelector(getPeersState, selectEntities);
