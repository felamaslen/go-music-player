import { render, waitFor } from '@testing-library/react';
import nock from 'nock';
import React from 'react';
import { Song } from '../types';

import { useCurrentlyPlayingSongInfo } from './status';

describe(useCurrentlyPlayingSongInfo.name, () => {
  const TestComponent: React.FC<{ songId: number | null }> = ({ songId }) => {
    const songInfo = useCurrentlyPlayingSongInfo(songId);
    return <div data-testid="info">{JSON.stringify(songInfo)}</div>;
  };

  describe('when there is no song ID', () => {
    it('should return null', () => {
      expect.assertions(1);
      const { getByTestId } = render(<TestComponent songId={null} />);
      expect(JSON.parse(getByTestId('info').innerHTML)).toBeNull();
    });
  });

  describe('when there is a song ID in state', () => {
    const testSong: Song = {
      id: 1765,
      track: 12,
      title: 'My song',
      artist: 'My artist',
      album: 'My album',
      time: 218,
    };

    beforeEach(() => {
      nock('http://my-api.url:1234')
        .get('/song-info?id=1765')
        .reply(200, testSong, { 'Access-Control-Allow-Origin': '*' });
    });

    it('should return the song info from the API', async () => {
      expect.assertions(2);
      const { getByTestId } = render(<TestComponent songId={1765} />);
      await waitFor(() => {
        expect(JSON.parse(getByTestId('info').innerHTML)).toStrictEqual(testSong);
      });
    });
  });
});
