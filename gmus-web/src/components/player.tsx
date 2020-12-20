/* eslint-disable jsx-a11y/media-has-caption */
import { useThrottleCallback } from '@react-hook/throttle';
import React, { useCallback, useEffect, useRef, useState } from 'react';

type Props = {
  src: string;
  playing: boolean;
  seekTime: number;
  onTimeUpdate: (time: number) => void;
  onEnded: () => void;
  timeUpdateFPS: number;
};

type AudioState = {
  bufferRange: {
    start: number;
    end: number;
  };
  time: number;
  duration: number;
  paused: boolean;
  waiting: boolean;
};

const initialAudioState: AudioState = {
  bufferRange: { start: 0, end: 0 },
  time: 0,
  duration: 0,
  paused: true,
  waiting: false,
};

function parseBufferRange(bufferRange: TimeRanges): AudioState['bufferRange'] {
  if (!bufferRange.length) {
    return initialAudioState.bufferRange;
  }
  return { start: bufferRange.start(0), end: bufferRange.end(0) };
}

export const Player: React.FC<Props> = ({
  src,
  playing,
  seekTime,
  onTimeUpdate: reportTimeUpdate,
  onEnded,
  timeUpdateFPS,
}) => {
  const audio = useRef<HTMLAudioElement | null>(null);
  const [state, setState] = useState(initialAudioState);

  const onPlay = useCallback(() => setState((last) => ({ ...last, paused: false })), []);
  const onPause = useCallback(() => setState((last) => ({ ...last, paused: true })), []);
  const onWaiting = useCallback(() => setState((last) => ({ ...last, waiting: true })), []);
  const onPlaying = useCallback(() => setState((last) => ({ ...last, waiting: false })), []);

  const onDurationChange = useCallback(() => {
    setState((last) => {
      if (!audio.current) {
        return last;
      }
      const { duration, buffered } = audio.current;
      return {
        ...last,
        duration,
        bufferRange: parseBufferRange(buffered),
      };
    });
  }, []);

  const onTimeUpdate = useCallback(() => {
    setState((last) => (audio.current ? { ...last, time: audio.current.currentTime } : last));
  }, []);
  const onTimeUpdateThrottled = useThrottleCallback(onTimeUpdate, timeUpdateFPS);

  useEffect(() => {
    reportTimeUpdate(state.time);
  }, [state.time, reportTimeUpdate]);

  const onProgress = useCallback(() => {
    setState((last) =>
      audio.current ? { ...last, bufferRange: parseBufferRange(audio.current.buffered) } : last,
    );
  }, []);

  const play = useCallback(() => {
    audio.current?.play();
  }, []);

  const pause = useCallback(() => {
    audio.current?.pause();
  }, []);

  const shouldSeekTo = useRef<number>(-1);
  const onCanPlay = useCallback(() => {
    if (audio.current) {
      if (state.duration && shouldSeekTo.current !== -1) {
        audio.current.currentTime = Math.min(state.duration, Math.max(0, shouldSeekTo.current));
        shouldSeekTo.current = -1;
      }
    }
  }, [state.duration]);

  const seek = useCallback(
    (time: number) => {
      if (audio.current && state.duration) {
        audio.current.currentTime = Math.min(state.duration, Math.max(0, time));
      } else {
        shouldSeekTo.current = time;
      }
    },
    [state.duration],
  );

  const lastSeekTime = useRef<number>(-1);
  useEffect(() => {
    if (seekTime !== lastSeekTime.current && seekTime !== -1) {
      lastSeekTime.current = seekTime;
      seek(seekTime);
    }
  }, [seekTime, seek]);

  useEffect(() => {
    if (playing) {
      play();
    } else {
      pause();
    }
  }, [src, playing, play, pause]);

  return (
    <audio
      controls={false}
      onCanPlay={onCanPlay}
      onDurationChange={onDurationChange}
      onPause={onPause}
      onPlay={onPlay}
      onPlaying={onPlaying}
      onProgress={onProgress}
      onTimeUpdate={onTimeUpdateThrottled}
      onWaiting={onWaiting}
      onEnded={onEnded}
      ref={audio}
      src={src}
    />
  );
};
