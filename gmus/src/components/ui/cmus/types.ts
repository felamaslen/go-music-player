import { LocalAction } from '../../../actions';
import { Song } from '../../../types/songs';

export enum View {
  Library,
}

export enum LibraryModeWindow {
  ArtistList = 'ArtistList',
  SongList = 'SongList',
}

export type CmusUIState = {
  globalAction: LocalAction | null;
  globalActionSerialNumber: number;
  view: View;
  artists: string[];
  artistAlbums: Record<string, string[]>;
  artistSongs: Record<string, Song[]>;
  library: {
    expandedArtists: string[];
    activeArtist: string | null;
    activeAlbum: string | null;
    activeSongId: number | null;
    modeWindow: LibraryModeWindow;
    visibleSongs: Song[];
  };
};
