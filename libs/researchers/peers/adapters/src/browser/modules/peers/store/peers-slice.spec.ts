import { peersAdapter, peersReducer } from './peers-slice';

describe('peers reducer', () => {
  it('should handle initial state', () => {
    const expected = peersAdapter.getInitialState({
      loadingStatus: 'not loaded',
      error: null,
    });

    expect(peersReducer(undefined, { type: '' })).toEqual(expected);
  });

  // it('should handle fetchPeerss', () => {
  //   let state = peersReducer(undefined, fetchPeers.pending(null, null));

  //   expect(state).toEqual(
  //     expect.objectContaining({
  //       loadingStatus: 'loading',
  //       error: null,
  //       entities: {},
  //     })
  //   );

  //   state = peersReducer(
  //     state,
  //     fetchPeers.fulfilled(
  //       [
  //         {
  //           id: randomUUID(),
  //           name: 'First',
  //           username: 'first',
  //           subjects: ['wasm', 'rust', 'javascript', 'typescript'],
  //         },
  //         {
  //           id: randomUUID(),
  //           name: 'Second',
  //           username: 'second',
  //           subjects: ['wasm', 'rust', 'python'],
  //         },
  //       ],
  //       null,
  //       null
  //     )
  //   );

  //   expect(state).toEqual(
  //     expect.objectContaining({
  //       loadingStatus: 'loaded',
  //       error: null,
  //       entities: { 1: { id: 1 } },
  //     })
  //   );

  //   state = peersReducer(state, fetchPeers.rejected(new Error('Uh oh'), null, null));

  //   expect(state).toEqual(
  //     expect.objectContaining({
  //       loadingStatus: 'error',
  //       error: 'Uh oh',
  //       entities: { 1: { id: 1 } },
  //     })
  //   );
  // });
});
