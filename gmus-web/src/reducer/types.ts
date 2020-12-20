import { Song } from '../types';
import { Member, MusicPlayer } from '../types/state';

export type GlobalState = {
  initialised: boolean;
  player: MusicPlayer;
  songInfo: Song | null;
  clientList: Member[];
  myClientName: string;
};
