import { useContext, useEffect, useRef, useState } from 'react';

import { masterSet, stateSet } from '../actions';
import { masterStateUpdateTimeout } from '../constants/system';
import { DispatchContext, StateContext } from '../context/state';
import { isMaster } from '../selectors';

export function useMaster(): void {
  const state = useContext(StateContext);
  const dispatch = useContext(DispatchContext);
  const clientIsMaster = isMaster(state);

  const masterUpdateTimer = useRef<number>(0);
  useEffect(() => {
    if (clientIsMaster) {
      masterUpdateTimer.current = window.setInterval(() => {
        dispatch(stateSet());
      }, masterStateUpdateTimeout);
    }

    return (): void => {
      window.clearInterval(masterUpdateTimer.current);
    };
  }, [dispatch, clientIsMaster]);

  const clientList = state.clientList;
  useEffect(() => {
    if (clientIsMaster) {
      dispatch(stateSet({ master: state.myClientName }));
    }
  }, [clientList, dispatch, clientIsMaster, state.myClientName]);

  // wait one second for first update message from existing master,
  // before assuming master doesn't exist
  const [initialised, setInitialised] = useState<boolean>(false);
  const initMasterTimer = useRef<number>(0);
  useEffect(() => {
    initMasterTimer.current = setTimeout(() => {
      setInitialised(true);
    }, 1000);
  }, []);

  const shouldInitMaster = initialised && !state.player.master;
  useEffect(() => {
    if (shouldInitMaster) {
      dispatch(stateSet({ master: state.myClientName }));
    }
  }, [dispatch, shouldInitMaster, state.myClientName]);

  const masterWentAway =
    initialised && !state.clientList.some(({ name }) => name === state.player.master);
  const retakeControlTimer = useRef<number>(0);

  useEffect(() => {
    if (masterWentAway) {
      retakeControlTimer.current = window.setTimeout(() => {
        dispatch(masterSet());
      }, Math.floor(Math.random() * 1000));
    }

    return (): void => {
      clearTimeout(retakeControlTimer.current);
    };
  }, [dispatch, masterWentAway, state.myClientName]);
}
