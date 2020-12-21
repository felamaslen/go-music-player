import React, { useContext, useEffect, useState } from 'react';
import { Keys } from '../../../hooks/vim';
import { searched } from './actions';
import { CmusUIDispatchContext } from './reducer';

export const Search: React.FC = () => {
  const dispatchUI = useContext(CmusUIDispatchContext);
  const [term, setTerm] = useState<string>('');

  useEffect(() => {
    dispatchUI(searched(term));
  }, [dispatchUI, term]);

  useEffect(() => {
    const listener = (event: KeyboardEvent): void => {
      if (event.key === Keys.enter || event.key === Keys.esc) {
        dispatchUI(searched(null));
      } else if (event.key === 'Backspace') {
        setTerm((last) => last.substring(0, last.length - 1));
      } else if (/^\w$/.test(event.key)) {
        setTerm((last) => `${last}${event.key}`);
      }
    };

    window.addEventListener('keydown', listener);
    return (): void => {
      window.removeEventListener('keydown', listener);
    };
  }, [dispatchUI]);

  return <div>/{term}</div>;
};
