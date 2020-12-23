import { masterSet, playPaused, queuePushed, queueRemoved, stateSet } from '../../../../actions';
import { ActionKeyPressed, ActionTypeKeyPressed, Keys } from '../../../../hooks/vim';

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
