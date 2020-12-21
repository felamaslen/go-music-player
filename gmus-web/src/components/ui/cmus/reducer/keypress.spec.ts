import {
  masterSet,
  playPaused,
  queueOrdered,
  queuePushed,
  queueRemoved,
  stateSet,
} from '../../../../actions';
import { ActionKeyPressed, ActionTypeKeyPressed, Keys } from '../../../../hooks/vim';
import { Song } from '../../../../types';

import { CmusUIState, LibraryModeWindow, Overlay, View } from '../types';

import {
  stateDifferentView,
  stateFromMode,
  stateLibrary,
  stateQueue,
  stateWithActiveSong,
} from './fixtures';
import { cmusUIReducer, initialCmusUIState } from './reducer';

describe(ActionTypeKeyPressed, () => {
  describe.each`
    key          | toView
    ${Keys['1']} | ${View.Library}
    ${Keys['2']} | ${View.ClientList}
    ${Keys['3']} | ${View.Queue}
  `('$key', ({ key, toView }) => {
    const action: ActionKeyPressed = { type: ActionTypeKeyPressed, key };

    it(`should set the view to ${toView}`, () => {
      expect.assertions(1);
      const result = cmusUIReducer(stateDifferentView, action);

      expect(result.view).toBe(toView);
    });
  });

  describe(Keys.tab, () => {
    describe('when in library view', () => {
      describe.each`
        fromModeWindow                  | toModeWindow
        ${LibraryModeWindow.ArtistList} | ${LibraryModeWindow.SongList}
        ${LibraryModeWindow.SongList}   | ${LibraryModeWindow.ArtistList}
      `('when the mode window is $fromModeWindow', ({ fromModeWindow, toModeWindow }) => {
        it(`should set the mode window to ${toModeWindow}`, () => {
          expect.assertions(1);
          const result = cmusUIReducer(stateFromMode(fromModeWindow), {
            type: ActionTypeKeyPressed,
            key: Keys.tab,
          });

          expect(result.library.modeWindow).toBe(toModeWindow);
        });
      });
    });
  });

  describe(Keys.B, () => {
    const action: ActionKeyPressed = { type: ActionTypeKeyPressed, key: Keys.B };

    it('should set skip delta to 1', () => {
      expect.assertions(1);
      const result = cmusUIReducer(initialCmusUIState, action);
      expect(result.skipSong).toStrictEqual({
        delta: 1,
        serialNumber: 1,
      });
    });
  });

  describe(Keys.C, () => {
    const action: ActionKeyPressed = { type: ActionTypeKeyPressed, key: Keys.C };

    it('should set the globalAction to play/pause', () => {
      expect.assertions(2);
      const result = cmusUIReducer(stateLibrary, action);
      expect(result.globalAction).toStrictEqual(playPaused());
      expect(result.globalActionSerialNumber).toBe(stateLibrary.globalActionSerialNumber + 1);
    });
  });

  describe(Keys.E, () => {
    const action: ActionKeyPressed = { type: ActionTypeKeyPressed, key: Keys.E };

    describe('when in library view', () => {
      it('should set global action to add the selected song to the queue', () => {
        expect.assertions(1);
        const result = cmusUIReducer(stateWithActiveSong, action);
        expect(result.globalAction).toStrictEqual(queuePushed(1867));
      });
    });
  });

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
            'Artist A': [{ id: 123 } as Song, { id: 456 } as Song, { id: 789 } as Song],
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

  describe(Keys.p, () => {
    const action: ActionKeyPressed = { type: ActionTypeKeyPressed, key: Keys.p };

    describe('when on the queue view', () => {
      it('should set a global action to move the song down the queue', () => {
        expect.assertions(1);
        const result = cmusUIReducer(
          { ...stateQueue, queue: { ...stateQueue.queue, active: 75 } },
          action,
        );
        expect(result.globalAction).toStrictEqual(queueOrdered(75, 1));
      });
    });
  });

  describe(Keys.P, () => {
    const action: ActionKeyPressed = { type: ActionTypeKeyPressed, key: Keys.P };

    describe('when on the queue view', () => {
      it('should set a global action to move the song up the queue', () => {
        expect.assertions(1);
        const result = cmusUIReducer(
          { ...stateQueue, queue: { ...stateQueue.queue, active: 75 } },
          action,
        );
        expect(result.globalAction).toStrictEqual(queueOrdered(75, -1));
      });
    });
  });

  describe(Keys.Z, () => {
    const action: ActionKeyPressed = { type: ActionTypeKeyPressed, key: Keys.Z };

    it('should set skip delta to -1', () => {
      expect.assertions(1);
      const result = cmusUIReducer(initialCmusUIState, action);
      expect(result.skipSong).toStrictEqual({
        delta: -1,
        serialNumber: 1,
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

  describe(Keys.space, () => {
    const action: ActionKeyPressed = { type: ActionTypeKeyPressed, key: Keys.space };

    describe('when in library view', () => {
      describe('when in the artist list mode', () => {
        it('should toggle the active artist', () => {
          expect.assertions(2);

          const state: CmusUIState = {
            ...initialCmusUIState,
            library: {
              ...initialCmusUIState.library,
              expandedArtists: [],
              activeArtist: 'Some artist',
            },
          };

          const firstResult = cmusUIReducer(state, action);
          expect(firstResult.library.expandedArtists).toStrictEqual(['Some artist']);

          const secondResult = cmusUIReducer(firstResult, action);
          expect(secondResult.library.expandedArtists).toStrictEqual([]);
        });

        describe('when there is no active artist', () => {
          it('should return the state', () => {
            expect.assertions(1);
            const stateNoActive: CmusUIState = {
              ...initialCmusUIState,
              library: {
                ...initialCmusUIState.library,
                activeArtist: null,
              },
            };

            const result = cmusUIReducer(stateNoActive, action);
            expect(result).toStrictEqual(stateNoActive);
          });
        });

        describe('when the active album will disappear', () => {
          const stateWithActiveAlbum: CmusUIState = {
            ...initialCmusUIState,
            artistAlbums: {
              'Artist A': ['Album A', 'Album B', 'Album C'],
            },
            library: {
              ...initialCmusUIState.library,
              activeArtist: 'Artist A',
              expandedArtists: ['Artist A'],
              activeAlbum: 'Album B',
            },
          };

          it('should set the active album to null', () => {
            expect.assertions(2);
            const result = cmusUIReducer(stateWithActiveAlbum, action);
            expect(result.library.activeArtist).toBe('Artist A');
            expect(result.library.activeAlbum).toBeNull();
          });
        });
      });
    });
  });

  describe(Keys.enter, () => {
    const action: ActionKeyPressed = { type: ActionTypeKeyPressed, key: Keys.enter };

    describe('when in library view', () => {
      describe('when in the songs list mode', () => {
        const state: CmusUIState = {
          ...initialCmusUIState,
          globalActionSerialNumber: 1875,
          library: {
            ...initialCmusUIState.library,
            modeWindow: LibraryModeWindow.SongList,
            activeSongId: 713,
          },
        };

        it('should set the globalAction to play the active song and increment the serial', () => {
          expect.assertions(2);

          const result = cmusUIReducer(state, action);

          expect(result.globalAction).toStrictEqual(
            stateSet({
              playing: true,
              songId: 713,
              currentTime: 0,
              seekTime: 0,
            }),
          );
          expect(result.globalActionSerialNumber).toBe(1876);
        });
      });
    });

    describe('when in client list view', () => {
      const state: CmusUIState = {
        ...initialCmusUIState,
        globalActionSerialNumber: 123,
        view: View.ClientList,
        clientList: {
          active: 'some-active-client',
        },
      };

      it('should set the globalAction to set the given client to master', () => {
        expect.assertions(1);
        const result = cmusUIReducer(state, action);
        expect(result.globalAction).toStrictEqual(masterSet('some-active-client'));
      });
    });

    describe('when on the queue view', () => {
      it('should set the globalAction to play the active song', () => {
        expect.assertions(1);

        const result = cmusUIReducer(
          { ...stateQueue, queue: { ...stateQueue.queue, active: 75 } },
          action,
        );

        expect(result.globalAction).toStrictEqual(
          stateSet({
            playing: true,
            songId: 75,
            currentTime: 0,
            seekTime: 0,
          }),
        );
      });
    });
  });

  describe(Keys.D, () => {
    const action: ActionKeyPressed = { type: ActionTypeKeyPressed, key: Keys.D };

    describe('when on the queue view', () => {
      it('should set the globalAction to remove the active song from the queue', () => {
        expect.assertions(1);

        const result = cmusUIReducer(
          { ...stateQueue, queue: { ...stateQueue.queue, active: 75 } },
          action,
        );

        expect(result.globalAction).toStrictEqual(queueRemoved(75));
      });
    });
  });

  describe(Keys.esc, () => {
    const action: ActionKeyPressed = { type: ActionTypeKeyPressed, key: Keys.esc };

    describe.each`
      overlay
      ${Overlay.Help}
    `('when the overlay is set to $overlay', ({ overlay }) => {
      const stateWithOverlay: CmusUIState = {
        ...initialCmusUIState,
        overlay,
      };

      it('should reset the overlay', () => {
        expect.assertions(1);
        const result = cmusUIReducer(stateWithOverlay, action);
        expect(result.overlay).toBeNull();
      });
    });
  });

  describe(Keys.colon, () => {
    const action: ActionKeyPressed = { type: ActionTypeKeyPressed, key: Keys.colon };

    it('should enter command mode', () => {
      expect.assertions(1);
      const result = cmusUIReducer(stateLibrary, action);
      expect(result.commandMode).toBe(true);
    });
  });

  describe(Keys.question, () => {
    const action: ActionKeyPressed = { type: ActionTypeKeyPressed, key: Keys.question };

    it('should set the overlay to help mode', () => {
      expect.assertions(1);
      const result = cmusUIReducer(initialCmusUIState, action);
      expect(result.overlay).toBe(Overlay.Help);
    });
  });
});
