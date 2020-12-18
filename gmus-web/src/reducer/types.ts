import { Member, MusicPlayer } from '../types/state';

export type GlobalState = {
  initialised: boolean;
  player: MusicPlayer;
  clientList: Member[];
  myClientName: string;
};
