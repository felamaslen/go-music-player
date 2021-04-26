export type Member = {
  name: string;
  lastPing: number;
};

export type MusicPlayer = {
  songId: number | null;
  playing: boolean;
  currentTime: number;
  seekTime: number;
  master: string;
  activeClients: string[];
  queue: number[];
};
