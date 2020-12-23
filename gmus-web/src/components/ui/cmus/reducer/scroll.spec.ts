import { ActionKeyPressed, ActionTypeKeyPressed, Keys } from '../../../../hooks/vim';
import { Song } from '../../../../types';
import { CmusUIState, LibraryModeWindow } from '../types';
import { stateDifferentView, stateLibrary, stateQueue } from './fixtures';
import { cmusUIReducer } from './reducer';

describe('Scroll actions', () => {
  describe(Keys.J, () => {
    const action: ActionKeyPressed = { type: ActionTypeKeyPressed, key: Keys.J };

    describe('when in library view', () => {
      describe('when in the artist list mode', () => {
        const stateArtistMode: CmusUIState = {
          ...stateLibrary,
          artists: ['Artist A', 'Artist B'],
          artistAlbums: {
            'Artist A': ['Album 1', 'Album 2'],
          },
          artistSongs: {
            'Artist A': [
              { id: 456, album: 'Album 2' } as Song,
              { id: 123, album: 'Album 1' } as Song,
            ],
          },
          library: {
            ...stateLibrary.library,
            activeArtist: 'Artist A',
            modeWindow: LibraryModeWindow.ArtistList,
          },
        };

        it('should set the active artist to the next available artist', () => {
          expect.assertions(1);
          const result = cmusUIReducer(stateArtistMode, action);

          expect(result.library.activeArtist).toBe('Artist B');
        });

        it('should set the active song ID to the first by the artist', () => {
          expect.assertions(1);
          const state: CmusUIState = {
            ...stateArtistMode,
            artistSongs: {
              'Artist B': [{ id: 123 } as Song, { id: 456 } as Song],
            },
          };
          const result = cmusUIReducer(state, action);

          expect(result.library.activeSongId).toBe(123);
        });

        describe('when there are no songs loaded for the artist', () => {
          it('should set the active song ID to null', () => {
            expect.assertions(1);
            const state: CmusUIState = {
              ...stateArtistMode,
              artistSongs: {},
            };
            const result = cmusUIReducer(state, action);

            expect(result.library.activeSongId).toBeNull();
          });
        });

        describe('when the current artist is expanded', () => {
          const stateArtistModeWithAlbums: CmusUIState = {
            ...stateArtistMode,
            library: {
              ...stateArtistMode.library,
              expandedArtists: ['Artist A'],
            },
          };

          it('should select the next album', () => {
            expect.assertions(2);
            const result = cmusUIReducer(stateArtistModeWithAlbums, action);

            expect(result.library.activeArtist).toBe('Artist A');
            expect(result.library.activeAlbum).toBe('Album 1');
          });

          it('should set the active song ID to the first matching the album', () => {
            expect.assertions(1);
            const result = cmusUIReducer(stateArtistModeWithAlbums, action);

            expect(result.library.activeSongId).toBe(123);
          });
        });
      });

      describe('when in the song list mode', () => {
        const stateSongsMode: CmusUIState = {
          ...stateLibrary,
          artists: ['Artist A'],
          artistSongs: {
            'Artist A': [
              { id: 123, album: 'Album 1' } as Song,
              { id: 456, album: 'Album 1' } as Song,
              { id: 789, album: 'Album 2' } as Song,
            ],
          },
          library: {
            ...stateLibrary.library,
            activeArtist: 'Artist A',
            activeSongId: 123,
            modeWindow: LibraryModeWindow.SongList,
          },
        };

        it('should set the active song ID to the next available song', () => {
          expect.assertions(1);
          const result = cmusUIReducer(stateSongsMode, action);

          expect(result.library.activeSongId).toBe(456);
        });

        describe('when filtered by album', () => {
          const stateFiltered: CmusUIState = {
            ...stateSongsMode,
            library: { ...stateSongsMode.library, activeAlbum: 'Album 1' },
          };
          it('should only scroll within the selected album', () => {
            expect.assertions(2);

            const firstResult = cmusUIReducer(stateFiltered, action);
            const secondResult = cmusUIReducer(firstResult, action);

            expect(firstResult.library.activeSongId).toBe(456);
            expect(secondResult.library.activeSongId).toBe(456);
          });
        });
      });
    });

    describe('when in queue view', () => {
      it('should select the next item in the queue', () => {
        expect.assertions(1);
        const result = cmusUIReducer(stateQueue, action);
        expect(result.queue.active).toBe(887);
      });
    });

    describe('when in a different view', () => {
      it('should set the scroll delta and increment the serial number', () => {
        expect.assertions(1);
        const result = cmusUIReducer(stateDifferentView, action);
        expect(result.scroll).toStrictEqual({ delta: 1, serialNumber: 8814 });
      });
    });
  });

  describe(Keys.K, () => {
    const action: ActionKeyPressed = { type: ActionTypeKeyPressed, key: Keys.K };

    describe('when in library view', () => {
      describe('when in the artist list mode', () => {
        const stateArtistMode: CmusUIState = {
          ...stateLibrary,
          artists: ['Artist A', 'Artist B'],
          artistAlbums: {
            'Artist B': ['Album 1', 'Album 2'],
          },
          artistSongs: {
            'Artist B': [
              { id: 456, album: 'Album 2' } as Song,
              { id: 123, album: 'Album 1' } as Song,
            ],
          },
          library: {
            ...stateLibrary.library,
            activeArtist: 'Artist B',
            modeWindow: LibraryModeWindow.ArtistList,
          },
        };

        it('should set the active artist to the previous available artist', () => {
          expect.assertions(1);
          const result = cmusUIReducer(stateArtistMode, action);

          expect(result.library.activeArtist).toBe('Artist A');
        });

        it('should set the active song ID to the first by the artist', () => {
          expect.assertions(1);
          const state: CmusUIState = {
            ...stateArtistMode,
            artistSongs: {
              'Artist A': [{ id: 123 } as Song, { id: 456 } as Song],
            },
          };
          const result = cmusUIReducer(state, action);

          expect(result.library.activeSongId).toBe(123);
        });

        describe('when there are no songs loaded for the artist', () => {
          it('should set the active song ID to null', () => {
            expect.assertions(1);
            const state: CmusUIState = {
              ...stateArtistMode,
              artistSongs: {},
            };
            const result = cmusUIReducer(state, action);

            expect(result.library.activeSongId).toBeNull();
          });
        });

        describe('when the current artist is expanded', () => {
          const stateArtistModeWithAlbums: CmusUIState = {
            ...stateArtistMode,
            library: {
              ...stateArtistMode.library,
              expandedArtists: ['Artist B'],
              activeAlbum: 'Album 2',
            },
          };

          it('should select the previous album', () => {
            expect.assertions(2);
            const result = cmusUIReducer(stateArtistModeWithAlbums, action);

            expect(result.library.activeArtist).toBe('Artist B');
            expect(result.library.activeAlbum).toBe('Album 1');
          });

          it('should set the active song ID to the first matching the album', () => {
            expect.assertions(1);
            const result = cmusUIReducer(stateArtistModeWithAlbums, action);

            expect(result.library.activeSongId).toBe(123);
          });
        });
      });

      describe('when in the song list mode', () => {
        const stateSongsMode: CmusUIState = {
          ...stateLibrary,
          artists: ['Artist A'],
          artistSongs: {
            'Artist A': [{ id: 123 } as Song, { id: 456 } as Song, { id: 789 } as Song],
          },
          library: {
            ...stateLibrary.library,
            activeArtist: 'Artist A',
            activeSongId: 456,
            modeWindow: LibraryModeWindow.SongList,
          },
        };

        it('should set the active song ID to the previous available song', () => {
          expect.assertions(1);
          const result = cmusUIReducer(stateSongsMode, action);

          expect(result.library.activeSongId).toBe(123);
        });
      });
    });

    describe('when in queue view', () => {
      it('should select the next item in the queue', () => {
        expect.assertions(1);
        const result = cmusUIReducer(
          { ...stateQueue, queue: { ...stateQueue.queue, active: 189 } },
          action,
        );
        expect(result.queue.active).toBe(75);
      });
    });

    describe('when in a different view', () => {
      it('should set the scroll delta and increment the serial number', () => {
        expect.assertions(1);
        const result = cmusUIReducer(stateDifferentView, action);
        expect(result.scroll).toStrictEqual({ delta: -1, serialNumber: 8814 });
      });
    });
  });

  describe(Keys.pageDown, () => {
    const action: ActionKeyPressed = { type: ActionTypeKeyPressed, key: Keys.pageDown };

    describe('when in library view', () => {
      describe('when in the artist list mode', () => {
        const stateArtistMode: CmusUIState = {
          ...stateLibrary,
          artists: Array(26)
            .fill(0)
            .map((_, index) => `Artist ${index + 1}`),
          artistAlbums: {
            'Artist 3': ['Album 1', 'Album 2'],
            'Artist 4': ['Album Z'],
            'Artist 18': ['Album 3'],
          },
          artistSongs: {
            'Artist 18': [{ id: 123, album: 'Album 3' } as Song],
          },
          library: {
            ...stateLibrary.library,
            activeArtist: 'Artist 1',
            activeAlbum: null,
            expandedArtists: ['Artist 3', 'Artist 18'],
            modeWindow: LibraryModeWindow.ArtistList,
          },
        };

        it('should page the active artist and album by 20 rows down', () => {
          expect.assertions(2);
          const result = cmusUIReducer(stateArtistMode, action);

          expect(result.library.activeArtist).toBe('Artist 18');
          expect(result.library.activeAlbum).toBe('Album 3');
        });

        it('should set the active song ID to the first by the artist', () => {
          expect.assertions(1);
          const result = cmusUIReducer(stateArtistMode, action);

          expect(result.library.activeSongId).toBe(123);
        });
      });

      describe('when in the song list mode', () => {
        const stateSongsMode: CmusUIState = {
          ...stateLibrary,
          artists: ['Artist A'],
          artistSongs: {
            'Artist A': Array(30)
              .fill(0)
              .map((_, index) => ({ id: index + 100 } as Song)),
          },
          library: {
            ...stateLibrary.library,
            activeArtist: 'Artist A',
            activeSongId: 101,
            modeWindow: LibraryModeWindow.SongList,
          },
        };

        it('should set the active song ID to the one 20th after current', () => {
          expect.assertions(1);
          const result = cmusUIReducer(stateSongsMode, action);

          expect(result.library.activeSongId).toBe(121);
        });
      });
    });
  });

  describe(Keys.pageUp, () => {
    const action: ActionKeyPressed = { type: ActionTypeKeyPressed, key: Keys.pageUp };

    describe('when in library view', () => {
      describe('when in the artist list mode', () => {
        const stateArtistMode: CmusUIState = {
          ...stateLibrary,
          artists: Array(26)
            .fill(0)
            .map((_, index) => `Artist ${index + 1}`),
          artistAlbums: {
            'Artist 3': ['Album 1', 'Album 2'],
            'Artist 4': ['Album X', 'Album Y', 'Album Z'],
            'Artist 18': ['Album 3'],
          },
          artistSongs: {
            'Artist 3': [{ id: 123, album: 'Album 1' } as Song],
          },
          library: {
            ...stateLibrary.library,
            activeArtist: 'Artist 18',
            activeAlbum: 'Album 3',
            expandedArtists: ['Artist 3', 'Artist 4', 'Artist 18'],
            modeWindow: LibraryModeWindow.ArtistList,
          },
        };

        it('should page the active artist and album by 20 rows down', () => {
          expect.assertions(2);
          const result = cmusUIReducer(stateArtistMode, action);

          expect(result.library.activeArtist).toBe('Artist 3');
          expect(result.library.activeAlbum).toBe('Album 1');
        });

        it('should set the active song ID to the first by the artist', () => {
          expect.assertions(1);
          const result = cmusUIReducer(stateArtistMode, action);

          expect(result.library.activeSongId).toBe(123);
        });
      });

      describe('when in the song list mode', () => {
        const stateSongsMode: CmusUIState = {
          ...stateLibrary,
          artists: ['Artist A'],
          artistSongs: {
            'Artist A': Array(30)
              .fill(0)
              .map((_, index) => ({ id: index + 100 } as Song)),
          },
          library: {
            ...stateLibrary.library,
            activeArtist: 'Artist A',
            activeSongId: 128,
            modeWindow: LibraryModeWindow.SongList,
          },
        };

        it('should set the active song ID to the one 20th prior to current', () => {
          expect.assertions(1);
          const result = cmusUIReducer(stateSongsMode, action);

          expect(result.library.activeSongId).toBe(108);
        });
      });
    });
  });
});
