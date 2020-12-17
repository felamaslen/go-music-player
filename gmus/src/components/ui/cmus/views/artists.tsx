import { useDebounce } from '@react-hook/debounce';
import React, { useContext, useEffect } from 'react';

import { useArtistsAlbumsAndSongs } from '../../../../hooks/fetch/artists';
import { Song } from '../../../../types/songs';
import { namedMemo } from '../../../../utils/component';
import { artistAlbumsLoaded, artistSongsLoaded } from '../actions';
import { CmusUIDispatchContext, CmusUIStateContext } from '../reducer';

import * as Styled from './artists.styles';

type Props = {
  active: boolean;
};

type PropsArtist = {
  artist: string;
  albums?: string[];
  songs?: Song[];
  active: boolean;
  parentActive: boolean;
  expanded: boolean;
  activeAlbum: string | null;
};

const Artist = namedMemo<PropsArtist>(
  'Artist',
  ({ artist, albums, active, parentActive, expanded, activeAlbum }) => (
    <Styled.ArtistRow key={artist}>
      <Styled.ArtistTitle active={active} parentActive={parentActive}>
        <span>{artist || 'Unknown Artist'}</span>
      </Styled.ArtistTitle>
      {expanded && (
        <Styled.ArtistAlbums>
          {albums?.map((album) => (
            <Styled.AlbumTitle key={album} active={active && album === activeAlbum}>
              {album || 'Unknown Album'}
            </Styled.AlbumTitle>
          ))}
        </Styled.ArtistAlbums>
      )}
    </Styled.ArtistRow>
  ),
);

export const Artists: React.FC<Props> = ({ active }) => {
  const dispatchUI = useContext(CmusUIDispatchContext);
  const {
    artists,
    artistAlbums,
    library: { expandedArtists, activeArtist, activeAlbum },
  } = useContext(CmusUIStateContext);

  const [debouncedActiveArtist, setDebouncedActiveArtist] = useDebounce(activeArtist, 100);
  useEffect(() => {
    setDebouncedActiveArtist(activeArtist);
  }, [activeArtist, setDebouncedActiveArtist]);

  const { albums, songs } = useArtistsAlbumsAndSongs(
    debouncedActiveArtist ?? '',
    !(debouncedActiveArtist && expandedArtists.includes(debouncedActiveArtist)),
    !debouncedActiveArtist,
  );
  useEffect(() => {
    if (albums) {
      dispatchUI(artistAlbumsLoaded(albums.artist, albums.albums));
    }
  }, [dispatchUI, albums]);
  useEffect(() => {
    if (songs) {
      dispatchUI(artistSongsLoaded(songs.artist, songs.songs));
    }
  }, [dispatchUI, songs]);

  return (
    <Styled.Container>
      {artists.map((artist) => (
        <Artist
          key={artist}
          artist={artist}
          albums={artistAlbums[artist]}
          active={artist === activeArtist}
          parentActive={active}
          expanded={expandedArtists.includes(artist)}
          activeAlbum={activeAlbum}
        />
      ))}
    </Styled.Container>
  );
};
