import { ActionKeyPressed, ActionTypeKeyPressed, Keys } from '../../../../hooks/vim';
import { Song } from '../../../../types';
import { CmusUIActionType, searched } from '../actions';
import { CmusUIState, LibraryModeWindow, View } from '../types';
import { stateSearching } from './fixtures';
import { cmusUIReducer, initialCmusUIState } from './reducer';

describe('Searching', () => {
  const actionToSearch: ActionKeyPressed = { type: ActionTypeKeyPressed, key: Keys.slash };

  describe(Keys.slash, () => {
    it('should set searchMode to true', () => {
      expect.assertions(1);
      const result = cmusUIReducer(initialCmusUIState, actionToSearch);
      expect(result.searchMode).toBe(true);
    });
  });

  describe(CmusUIActionType.Searched, () => {
    const stateSearchingArtists: CmusUIState = {
      ...stateSearching,
      view: View.Library,
      artists: ['Amy Winehouse', 'Anticon', 'Bach'],
      library: {
        ...stateSearching.library,
        activeArtist: null,
        modeWindow: LibraryModeWindow.ArtistList,
      },
    };

    const stateSearchingSongs: CmusUIState = {
      ...stateSearching,
      view: View.Library,
      artists: ['Amy Winehouse'],
      artistSongs: {
        'Amy Winehouse': [
          { id: 184, title: 'Rehab' } as Song,
          { id: 883, title: 'Wake Up Alone' } as Song,
        ],
      },
      library: {
        ...stateSearching.library,
        activeArtist: 'Amy Winehouse',
        activeSongId: null,
        modeWindow: LibraryModeWindow.SongList,
      },
    };

    describe('artists', () => {
      it('should select the first match', () => {
        expect.assertions(1);
        const result = cmusUIReducer(stateSearchingArtists, searched('ant'));
        expect(result.library.activeArtist).toBe('Anticon');
      });
    });

    describe('songs', () => {
      it('should select the first match (by title)', () => {
        expect.assertions(1);
        const result = cmusUIReducer(stateSearchingSongs, searched('w'));
        expect(result.library.activeSongId).toBe(883);
      });
    });

    describe('when finishing / cancelling', () => {
      it('should set searchMode to false', () => {
        expect.assertions(1);
        const result = cmusUIReducer(stateSearchingArtists, searched(null));
        expect(result.searchMode).toBe(false);
      });
    });
  });
});
