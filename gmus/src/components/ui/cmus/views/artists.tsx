import { useDebounce, useDebounceCallback } from '@react-hook/debounce';
import React, {
  CSSProperties,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import AutoSizer from 'react-virtualized-auto-sizer';
import { FixedSizeList as List } from 'react-window';

import { useArtistsAlbumsAndSongs } from '../../../../hooks/fetch/artists';
import { namedMemo } from '../../../../utils/component';
import { artistAlbumsLoaded, artistSongsLoaded } from '../actions';
import { CmusUIDispatchContext, CmusUIStateContext } from '../reducer';
import { NoWrapFill } from '../styled/layout';
import { AsciiSpinner } from '../styled/spinner';
import { getScrollIndex } from '../utils/scroll';

import * as Styled from './artists.styles';

type Props = {
  active: boolean;
};

type ArtistData = {
  id: string;
  artist: string;
  loading: boolean;
  active: boolean;
  parentActive: boolean;
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
  ({ row: { artist, loading, active, parentActive }, style }) => (
    <Styled.ArtistTitle active={active} parentActive={parentActive} style={style}>
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

const lineHeight = 16;
const scrollThresholdLines = 4;

export const Artists: React.FC<Props> = ({ active: parentActive }) => {
  const dispatchUI = useContext(CmusUIDispatchContext);
  const state = useContext(CmusUIStateContext);
  const {
    artists,
    artistAlbums,
    library: { activeArtist, activeAlbum, expandedArtists },
  } = state;

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
    [parentActive, artists, artistAlbums, activeArtist, activeAlbum, expandedArtists],
  );

  const ref = useRef<HTMLDivElement>(null);
  const [windowDimensions, setWindowDimensions] = useState<{ width: number; height: number }>({
    width: 0,
    height: 0,
  });
  const onResize = useCallback(() => {
    setWindowDimensions({
      width: ref.current?.offsetWidth ?? 0,
      height: ref.current?.offsetHeight ?? 0,
    });
  }, []);
  const resizeHandler = useDebounceCallback(onResize, 100);

  useEffect(() => {
    onResize();
    window.addEventListener('resize', resizeHandler);
    return (): void => {
      window.removeEventListener('resize', resizeHandler);
    };
  }, [onResize, resizeHandler]);

  const windowRef = useRef<HTMLDivElement>(null);
  const scrollIndex = getScrollIndex(
    state.artists,
    state.artistAlbums,
    state.library.activeArtist,
    state.library.activeAlbum,
    state.library.expandedArtists,
  );

  useEffect(() => {
    if (!windowRef.current) {
      return;
    }
    const heightInLines = Math.floor(windowDimensions.height / lineHeight);
    if (heightInLines < scrollThresholdLines + 1) {
      return;
    }

    const scrollPosLines = Math.floor(windowRef.current.scrollTop / lineHeight);

    const linesBefore = scrollIndex - scrollPosLines;
    const linesAfter = scrollPosLines + heightInLines - scrollIndex;

    if (linesAfter < scrollThresholdLines) {
      windowRef.current.scrollTop += lineHeight;
    } else if (linesBefore < scrollThresholdLines) {
      windowRef.current.scrollTop -= lineHeight;
    }
  }, [windowDimensions.height, scrollIndex]);

  return (
    <Styled.Container ref={ref}>
      <AutoSizer>
        {({ height, width }): React.ReactElement => (
          <List
            outerRef={windowRef}
            height={height}
            width={width}
            itemCount={artists.length}
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
