import { LocalAction } from '../../../actions';
import { Song } from '../../../types/songs';

export enum View {
  Library = 'Library',
  ClientList = 'Client list',
  Queue = 'Queue',
}

export enum Overlay {
  Help = 'Help',
}

export enum LibraryModeWindow {
  ArtistList = 'ArtistList',
  SongList = 'SongList',
}

export type CmusUIState = {
  globalAction: LocalAction | null;
  globalActionSerialNumber: number;
  scroll: {
    delta: number;
    serialNumber: number;
  };
  skipSong: {
    delta: 0 | 1 | -1;
    serialNumber: number;
  };
  view: View;
  commandMode: boolean;
  overlay: Overlay | null;
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
  clientList: {
    active: string | null;
  };
  queue: {
    info: Song[];
    active: number | null;
  };
};
