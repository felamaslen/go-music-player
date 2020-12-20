import { render, RenderResult, waitFor } from '@testing-library/react';
import nock from 'nock';
import React from 'react';
import { songInfoFetched } from '../actions';
import { DispatchContext, StateContext } from '../context/state';
import { GlobalState, initialState } from '../reducer';
import { Song } from '../types';

import { useCurrentlyPlayingSongInfo } from './status';

describe(useCurrentlyPlayingSongInfo.name, () => {
  const TestComponent: React.FC = () => {
    useCurrentlyPlayingSongInfo();
    return null;
  };

  const dispatch = jest.fn();

  const setup = (state: GlobalState): RenderResult =>
    render(
      <StateContext.Provider value={state}>
        <DispatchContext.Provider value={dispatch}>
          <TestComponent />
        </DispatchContext.Provider>
      </StateContext.Provider>,
    );

  const testSong: Song = {
    id: 1765,
    track: 12,
    title: 'My song',
    artist: 'My artist',
    album: 'My album',
    time: 218,
  };

  describe('when there is no song ID', () => {
    const stateNoId: GlobalState = {
      ...initialState,
      player: {
        ...initialState.player,
        songId: null,
      },
    };

    describe('when there is no song info in state', () => {
      const stateNoIdNoInfo: GlobalState = {
        ...stateNoId,
        songInfo: null,
      };

      it('should not do anything', () => {
        expect.assertions(1);
        setup(stateNoIdNoInfo);
        expect(dispatch).not.toHaveBeenCalled();
      });
    });

    describe('when there is song info in state', () => {
      const stateNoIdWithInfo: GlobalState = {
        ...stateNoId,
        songInfo: testSong,
      };

      it('should dispatch an action to clear the current info', () => {
        expect.assertions(2);
        setup(stateNoIdWithInfo);
        expect(dispatch).toHaveBeenCalledTimes(1);
        expect(dispatch).toHaveBeenCalledWith(songInfoFetched(null));
      });
    });
  });

  describe('when there is a song ID in state', () => {
    const stateWithSongId: GlobalState = {
      ...initialState,
      player: {
        ...initialState.player,
        songId: testSong.id,
      },
    };

    describe('when the song info is already fetched for the playing song ID', () => {
      const stateFetched: GlobalState = {
        ...stateWithSongId,
        songInfo: testSong,
      };

      it('should not do anything', () => {
        expect.assertions(1);
        setup(stateFetched);
        expect(dispatch).not.toHaveBeenCalled();
      });
    });

    describe('when the song info is stale', () => {
      const stateStale: GlobalState = {
        ...stateWithSongId,
        songInfo: { ...testSong, id: testSong.id + 1 },
      };

      beforeEach(() => {
        nock('http://my-api.url:1234')
          .get('/song-info?id=1765')
          .reply(200, testSong, { 'Access-Control-Allow-Origin': '*' });
      });

      it('should fetch the info for the updated song ID, and update the state', async () => {
        expect.assertions(3);
        setup(stateStale);
        await waitFor(() => {
          expect(dispatch).toHaveBeenCalledTimes(1);
        });

        expect(dispatch).toHaveBeenCalledWith(songInfoFetched(testSong));
      });
    });
  });
});
