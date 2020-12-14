import React, { useCallback, useState } from 'react';
import { CircleLoader } from 'react-spinners';

export type Props = {
  connecting: boolean;
  onIdentify: (name: string) => void;
};

export const Identify: React.FC<Props> = ({ connecting, onIdentify }) => {
  const [name, setName] = useState<string>('');
  const onChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => setName(event.target.value),
    [],
  );
  const onConnect = useCallback(() => {
    onIdentify(name);
  }, [name, onIdentify]);

  return (
    <div>
      <div>
        <span>Set client name:</span>
        <input type="text" onChange={onChange} />
        <button onClick={onConnect} disabled={connecting}>
          Connect
        </button>
        {connecting && <CircleLoader size={50} />}
      </div>
    </div>
  );
};
