export type Member = {
  name: string;
  lastPing: number;
};

export type MusicPlayer = {
  songId: number | null;
  playing: boolean;
  currentTime: number;
  master: string;
};
