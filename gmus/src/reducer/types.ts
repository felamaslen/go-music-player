import { Member, MusicPlayer } from '../types/state';

export type GlobalState = {
  player: MusicPlayer;
  clientList: Member[];
  myClientName: string;
};
