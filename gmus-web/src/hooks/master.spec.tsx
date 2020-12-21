import { act, render, RenderResult } from '@testing-library/react';
import React from 'react';

import { masterSet, stateSet } from '../actions';
import { masterStateUpdateTimeout } from '../constants/system';
import { DispatchContext, StateContext } from '../context/state';
import { GlobalState, initialState, nullPlayer } from '../reducer';

import { useMaster } from './master';

describe(useMaster.name, () => {
  const dispatch = jest.fn();

  const TestComponent: React.FC = () => {
    useMaster();
    return null;
  };

  const setup = (state: GlobalState, options: Partial<RenderResult> = {}): RenderResult =>
    render(
      <StateContext.Provider value={state}>
        <DispatchContext.Provider value={dispatch}>
          <TestComponent />
        </DispatchContext.Provider>
      </StateContext.Provider>,
      options,
    );

  describe('when there is no master initially', () => {
    const stateNoMaster: GlobalState = {
      ...initialState,
      initialised: true,
      myClientName: 'my-client-name',
      player: {
        ...nullPlayer,
        master: '',
      },
    };

    it('should take control of master', () => {
      expect.assertions(2);
      const { unmount } = setup(stateNoMaster);

      expect(dispatch).toHaveBeenCalledTimes(1);
      expect(dispatch).toHaveBeenCalledWith(stateSet({ master: 'my-client-name' }));

      unmount();
    });

    describe('when the state is not initialised', () => {
      const stateNoMasterUninit: GlobalState = {
        ...stateNoMaster,
        initialised: false,
      };

      it('should not take control of master', () => {
        expect.assertions(1);
        const { unmount } = setup(stateNoMasterUninit);

        expect(dispatch).not.toHaveBeenCalled();

        unmount();
      });
    });
  });

  describe('when master goes away', () => {
    const stateWithMaster: GlobalState = {
      ...initialState,
      initialised: true,
      myClientName: 'my-client-name',
      clientList: [
        { name: 'master-client-a', lastPing: 0 },
        { name: 'my-client-name', lastPing: 0 },
        { name: 'other-slave-client', lastPing: 0 },
      ],
      player: {
        songId: 123,
        playing: true,
        currentTime: 17,
        seekTime: -1,
        master: 'master-client-a',
        queue: [],
      },
    };

    const stateMasterWentAway: GlobalState = {
      ...stateWithMaster,
      clientList: [
        { name: 'my-client-name', lastPing: 0 },
        { name: 'other-slave-client', lastPing: 0 },
      ],
    };

    it('should take control of master after a delay, and pause the client', () => {
      expect.assertions(2);
      jest.useFakeTimers();

      const { container, unmount } = setup(stateWithMaster);

      act(() => {
        setup(stateMasterWentAway, { container });
      });

      expect(dispatch).not.toHaveBeenCalled();

      act(() => {
        jest.runAllTimers();
      });

      expect(dispatch).toHaveBeenCalledWith(masterSet());

      unmount();
      jest.useRealTimers();
    });

    describe('and a third client takes over control', () => {
      const stateMasterWentAwayAnotherTookControl: GlobalState = {
        ...stateMasterWentAway,
        clientList: [
          { name: 'my-client-name', lastPing: 0 },
          { name: 'other-slave-client', lastPing: 0 },
        ],
        player: {
          ...stateMasterWentAway.player,
          master: 'other-slave-client',
        },
      };

      it('should not take control of master', () => {
        expect.assertions(1);
        jest.useFakeTimers();

        const { container, unmount } = setup(stateWithMaster);
        act(() => {
          setup(stateMasterWentAway, { container });
        });

        setImmediate(() => {
          act(() => {
            setup(stateMasterWentAwayAnotherTookControl, { container });
          });
        });

        jest.runAllTimers();

        expect(dispatch).not.toHaveBeenCalled();

        unmount();
        jest.useRealTimers();
      });
    });
  });

  describe('when the client is master', () => {
    const stateMaster: GlobalState = {
      ...initialState,
      initialised: true,
      myClientName: 'the-master-client',
      clientList: [{ name: 'the-master-client', lastPing: 0 }],
      player: {
        ...nullPlayer,
        master: 'the-master-client',
      },
    };

    it('should continually refresh the server with the current state', () => {
      expect.assertions(6);
      const clock = jest.useFakeTimers();
      const { unmount } = setup(stateMaster);

      act(() => {
        clock.runTimersToTime(masterStateUpdateTimeout - 1);
      });

      expect(dispatch).toHaveBeenCalledTimes(0);
      act(() => {
        clock.runTimersToTime(1);
      });

      expect(dispatch).toHaveBeenCalledTimes(1);
      expect(dispatch).toHaveBeenCalledWith(stateSet());

      dispatch.mockClear();
      expect(dispatch).toHaveBeenCalledTimes(0);

      act(() => {
        clock.runTimersToTime(masterStateUpdateTimeout);
      });

      expect(dispatch).toHaveBeenCalledTimes(1);
      expect(dispatch).toHaveBeenCalledWith(stateSet());

      unmount();
      jest.useRealTimers();
    });
  });

  describe('when the client is a slave', () => {
    const stateSlave: GlobalState = {
      ...initialState,
      initialised: true,
      myClientName: 'a-slave-client',
      clientList: [
        { name: 'the-master-client', lastPing: 0 },
        { name: 'a-slave-client', lastPing: 0 },
      ],
      player: {
        ...nullPlayer,
        master: 'the-master-client',
      },
    };

    it('should not send state updates periodically', () => {
      expect.assertions(1);
      const clock = jest.useFakeTimers();
      const { unmount } = setup(stateSlave);

      act(() => {
        clock.runTimersToTime(masterStateUpdateTimeout);
      });

      expect(dispatch).not.toHaveBeenCalled();

      unmount();
      jest.useRealTimers();
    });
  });
});

