/* eslint-disable jsx-a11y/media-has-caption */
import React, { CSSProperties, useEffect, useRef } from 'react';
import { getSongUrl } from '../../utils/url';

type Props = {
  playing: boolean;
  onTimeUpdate: (time: number) => void;
  songId: number;
};

const hidden: CSSProperties = { visibility: 'hidden' };

export const Player: React.FC<Props> = ({ playing, onTimeUpdate, songId }) => {
  const audio = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (audio.current) {
      audio.current.ontimeupdate = (): void => {
        onTimeUpdate(audio.current?.currentTime ?? 0);
      };
    }
  }, [onTimeUpdate]);

  useEffect(() => {
    if (!audio.current) {
      return;
    }
    if (playing) {
      audio.current.play();
    } else {
      audio.current.pause();
    }
  }, [playing]);

  return <audio ref={audio} src={getSongUrl(songId)} style={hidden} />;
};
