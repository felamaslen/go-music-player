import { AnyAction } from '../actions';
import { Member, MusicPlayer } from '../types/state';

export type GlobalState = {
  lastAction: AnyAction | null;
  player: MusicPlayer;
  clientList: Member[];
  myClientName: string;
};
