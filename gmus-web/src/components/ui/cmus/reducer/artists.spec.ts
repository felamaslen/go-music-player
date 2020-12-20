import { artistAlbumsLoaded, artistSongsLoaded, artistsSet, CmusUIActionType } from '../actions';

import { stateWithActiveArtist } from './fixtures';
import { cmusUIReducer, initialCmusUIState } from './reducer';

describe(CmusUIActionType.ArtistsSet, () => {
  const action = artistsSet(['Artist A', 'Artist B']);

  it('should set the artists array', () => {
    expect.assertions(1);
    const result = cmusUIReducer(initialCmusUIState, action);
    expect(result.artists).toStrictEqual(['Artist A', 'Artist B']);
  });

  it('should set the active artist to the first artist in the list', () => {
    expect.assertions(2);
    const result = cmusUIReducer(
      {
        ...initialCmusUIState,
        library: {
          ...initialCmusUIState.library,
          activeArtist: 'Artist Z',
          activeAlbum: 'Some album',
        },
      },
      action,
    );
    expect(result.library.activeArtist).toBe('Artist A');
    expect(result.library.activeAlbum).toBeNull();
  });
});

describe(CmusUIActionType.ArtistAlbumsLoaded, () => {
  const action = artistAlbumsLoaded('My artist', ['Album A', 'Album B']);

  it('should set the albums for the given artist', () => {
    expect.assertions(1);
    const result = cmusUIReducer(initialCmusUIState, action);
    expect(result.artistAlbums).toStrictEqual(
      expect.objectContaining({
        'My artist': ['Album A', 'Album B'],
      }),
    );
  });
});

describe(CmusUIActionType.ArtistSongsLoaded, () => {
  const action = artistSongsLoaded('My artist', [
    { id: 12, track: 23, title: 'Title A', artist: 'My artist', album: 'Album A', time: 123 },
    { id: 73, track: 17, title: 'Title B', artist: 'My artist', album: 'Album B', time: 456 },
  ]);

  it('should set the songs for the given artist', () => {
    expect.assertions(1);
    const result = cmusUIReducer(initialCmusUIState, action);
    expect(result.artistSongs).toStrictEqual(
      expect.objectContaining({
        'My artist': [
          {
            id: 12,
            track: 23,
            title: 'Title A',
            artist: 'My artist',
            album: 'Album A',
            time: 123,
          },
          {
            id: 73,
            track: 17,
            title: 'Title B',
            artist: 'My artist',
            album: 'Album B',
            time: 456,
          },
        ],
      }),
    );
  });

  describe('when the artist is the active artist', () => {
    it('should set the active song ID to the first song ID in the list', () => {
      expect.assertions(1);
      const result = cmusUIReducer(stateWithActiveArtist, action);
      expect(result.library.activeSongId).toBe(12);
    });
  });
});
