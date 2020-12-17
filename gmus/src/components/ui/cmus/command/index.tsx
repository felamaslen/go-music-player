import React, { useCallback, useContext, useEffect, useRef, useState } from 'react';
import useOnClickOutside from 'use-onclickoutside';

import { Keys } from '../../../../hooks/vim';
import { commandSet } from '../actions';
import { CmusUIDispatchContext, CmusUIStateContext } from '../reducer';

import * as Styled from './styles';

enum EndState {
  Start,
  Confirm,
  Cancel,
}

const CommandViewActive: React.FC = () => {
  const dispatchUI = useContext(CmusUIDispatchContext);

  const [tempCommand, setTempCommand] = useState<string>('');

  const ref = useRef<HTMLInputElement>(null);

  const onChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => setTempCommand(event.target.value),
    [],
  );

  const [finished, setFinished] = useState<EndState>(EndState.Start);

  const onKeyDown = useCallback((event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === Keys.enter) {
      setFinished(EndState.Confirm);
    } else if (event.key === Keys.esc) {
      setFinished(EndState.Cancel);
    }
  }, []);

  useEffect(() => {
    if (finished === EndState.Confirm) {
      dispatchUI(commandSet(tempCommand));
    } else if (finished === EndState.Cancel) {
      dispatchUI(commandSet(null));
    }
  }, [dispatchUI, finished, tempCommand]);

  const onFocus = useCallback(() => {
    setImmediate(() => ref.current?.focus());
  }, []);

  useEffect(onFocus, [onFocus]);
  useOnClickOutside(ref, onFocus);

  return (
    <Styled.CommandWrapper>
      <Styled.Before active={true}>:</Styled.Before>
      <input
        ref={ref}
        value={tempCommand}
        onChange={onChange}
        onKeyDown={onKeyDown}
        spellCheck={false}
      />
    </Styled.CommandWrapper>
  );
};

export const CommandView: React.FC = () => {
  const { commandMode } = useContext(CmusUIStateContext);

  if (!commandMode) {
    return (
      <Styled.CommandWrapper>
        <Styled.Before active={false}>:</Styled.Before>
      </Styled.CommandWrapper>
    );
  }

  return <CommandViewActive />;
};
