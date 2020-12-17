import React, { useContext, useMemo } from 'react';

import { Song } from '../../../../types';
import { CmusUIStateContext } from '../reducer';

import * as Styled from './songs.styles';

type Props = {
  active: boolean;
};

const emptyArray: Song[] = [];

export const Songs: React.FC<Props> = ({ active }) => {
  const {
    artistSongs,
    library: { activeArtist, activeAlbum, activeSongId },
  } = useContext(CmusUIStateContext);

  const activeArtistSongs = activeArtist ? artistSongs[activeArtist] ?? emptyArray : emptyArray;

  const songs = useMemo<Song[]>(
    () =>
      activeAlbum
        ? activeArtistSongs.filter(({ album }) => album === activeAlbum)
        : activeArtistSongs,
    [activeArtistSongs, activeAlbum],
  );

  return (
    <Styled.Container>
      {songs.map((song) => (
        <Styled.Song key={song.id} active={song.id === activeSongId} parentActive={active}>
          {song.track} - {song.title || 'Untitled Track'}
        </Styled.Song>
      ))}
    </Styled.Container>
  );
};
