export type Song = {
  id: number;
  track: number | null;
  title: string;
  artist: string;
  album: string;
  time: number;
};

export type NullSong = { id: 0 };

export const songExists = (song: Song | NullSong): song is Song => !!song.id;
