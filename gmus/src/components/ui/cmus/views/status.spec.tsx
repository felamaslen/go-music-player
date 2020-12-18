import { render, RenderResult, waitFor } from '@testing-library/react';
import React from 'react';

import { StateContext } from '../../../../context/state';
import { GlobalState, initialState, nullPlayer } from '../../../../reducer';
import { Song } from '../../../../types';

import { PlayerStatus } from './status';

describe(PlayerStatus.name, () => {
  const testSongId = 23;

  const testSong: Song = {
    id: testSongId,
    track: 12,
    title: 'My song',
    artist: 'My artist',
    album: 'My album',
    time: 374,
  };

  const setup = (globalState: Partial<GlobalState> = {}, song: Song | null): RenderResult =>
    render(
      <StateContext.Provider value={{ ...initialState, ...globalState }}>
        <PlayerStatus song={song} />
      </StateContext.Provider>,
    );

  describe('when a song is active', () => {
    const stateWithSongActive: Partial<GlobalState> = {
      player: {
        ...nullPlayer,
        currentTime: 128,
        songId: testSongId,
      },
    };

    it.each`
      property                                   | expectedValue
      ${'artist, album, title and track number'} | ${'My artist - My album - 12. My song'}
      ${'current and total play time'}           | ${'02:08 / 06:14'}
    `('should render the $property', async ({ expectedValue }) => {
      const { getByText } = setup(stateWithSongActive, testSong);

      await waitFor(() => {
        expect(getByText(expectedValue)).toBeInTheDocument();
      });
    });

    describe('when playing', () => {
      const statePlaying: Partial<GlobalState> = {
        player: {
          ...initialState.player,
          songId: testSongId,
          playing: true,
        },
      };

      it('should display a playing indicator', () => {
        expect.assertions(1);
        const { getByText } = setup(statePlaying, testSong);
        expect(getByText('>')).toBeInTheDocument();
      });
    });

    describe('when not playing', () => {
      const stateNotPlaying: Partial<GlobalState> = {
        player: {
          ...nullPlayer,
          songId: testSongId,
          playing: false,
        },
      };

      it('should display a paused indicator', () => {
        expect.assertions(1);
        const { getByText } = setup(stateNotPlaying, testSong);
        expect(getByText('|')).toBeInTheDocument();
      });
    });
  });

  describe('when no song is active', () => {
    const stateWithSongInactive: Partial<GlobalState> = {
      player: { ...nullPlayer, songId: null },
    };

    it('should display an inactive indicator', () => {
      expect.assertions(1);
      const { getByText } = setup(stateWithSongInactive, null);
      expect(getByText('.')).toBeInTheDocument();
    });
  });
});
