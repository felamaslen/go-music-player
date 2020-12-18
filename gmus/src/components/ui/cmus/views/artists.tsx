import { useDebounce } from '@react-hook/debounce';
import React, { CSSProperties, useContext, useEffect, useMemo, useRef } from 'react';
import AutoSizer from 'react-virtualized-auto-sizer';
import { FixedSizeList as List } from 'react-window';

import { useArtistsAlbumsAndSongs } from '../../../../hooks/fetch/artists';
import { namedMemo } from '../../../../utils/component';
import { artistAlbumsLoaded, artistSongsLoaded } from '../actions';
import { CmusUIDispatchContext, CmusUIStateContext } from '../reducer';
import { NoWrapFill } from '../styled/layout';
import { AsciiSpinner } from '../styled/spinner';
import { getArtistAlbumScrollIndex, lineHeight, useAutoJumpyScroll } from '../utils/scroll';

import * as Styled from './artists.styles';

export type Props = {
  active: boolean;
  currentArtist: string | null;
};

type ArtistData = {
  id: string;
  artist: string;
  loading: boolean;
  active: boolean;
  parentActive: boolean;
  highlight: boolean;
};

type AlbumData = {
  id: string;
  album: string;
  active: boolean;
  parentActive: boolean;
};

type RowData = ArtistData | AlbumData;

const isArtist = (data: RowData): data is ArtistData => Reflect.has(data, 'artist');

const itemKey = (index: number, data: RowData[]): string => data[index].id;

const Artist = namedMemo<{ row: ArtistData; style: CSSProperties }>(
  'Artist',
  ({ row: { artist, loading, active, parentActive, highlight }, style }) => (
    <Styled.ArtistTitle
      active={active}
      parentActive={parentActive}
      style={style}
      highlight={highlight}
    >
      {loading ? <AsciiSpinner /> : <>&nbsp;&nbsp;</>}
      <NoWrapFill>{artist || 'Unknown Artist'}</NoWrapFill>
    </Styled.ArtistTitle>
  ),
);

const Album = namedMemo<{ row: AlbumData; style: CSSProperties }>(
  'Album',
  ({ row: { album, active, parentActive }, style }) => (
    <Styled.AlbumTitle active={active} parentActive={parentActive} style={style}>
      <NoWrapFill>{album || 'Unknown Album'}</NoWrapFill>
    </Styled.AlbumTitle>
  ),
);

const Row = namedMemo<{ index: number; data: RowData[]; style: CSSProperties }>(
  'ArtistListRow',
  ({ index, data, style }) => {
    const row = data[index];
    if (isArtist(row)) {
      return <Artist row={row} style={style} />;
    }
    return <Album row={row} style={style} />;
  },
);

export const Artists: React.FC<Props> = ({ active: parentActive, currentArtist }) => {
  const dispatchUI = useContext(CmusUIDispatchContext);
  const state = useContext(CmusUIStateContext);
  const {
    artists,
    artistAlbums,
    library: { activeArtist, activeAlbum, expandedArtists },
  } = state;

  const [debouncedActiveArtist, setDebouncedActiveArtist] = useDebounce(activeArtist, 200);
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

  const itemData = useMemo<RowData[]>(
    () =>
      artists.reduce<RowData[]>((last, artist) => {
        const expanded = expandedArtists.includes(artist);
        const artistRow: ArtistData = {
          id: artist,
          artist,
          loading: !(artist in artistAlbums) && expandedArtists.includes(artist),
          active: activeArtist === artist && activeAlbum === null,
          parentActive,
          highlight: currentArtist === artist,
        };

        if (!expanded) {
          return [...last, artistRow];
        }

        return [
          ...last,
          artistRow,
          ...(artistAlbums[artist] ?? []).map<AlbumData>((album) => ({
            id: `${artist}-${album}`,
            album,
            active: activeArtist === artist && activeAlbum === album,
            parentActive: parentActive && activeArtist === artist && activeAlbum === album,
          })),
        ];
      }, []),
    [
      parentActive,
      artists,
      artistAlbums,
      activeArtist,
      activeAlbum,
      expandedArtists,
      currentArtist,
    ],
  );

  const windowRef = useRef<HTMLDivElement>(null);
  const scrollIndex = getArtistAlbumScrollIndex(
    state.artists,
    state.artistAlbums,
    state.library.activeArtist,
    state.library.activeAlbum,
    state.library.expandedArtists,
  );

  useAutoJumpyScroll(windowRef, scrollIndex);

  return (
    <Styled.Container>
      <AutoSizer>
        {({ height, width }): React.ReactElement => (
          <List
            outerRef={windowRef}
            height={height}
            width={width}
            itemCount={itemData.length}
            itemSize={lineHeight}
            itemKey={itemKey}
            itemData={itemData}
          >
            {Row}
          </List>
        )}
      </AutoSizer>
    </Styled.Container>
  );
};
