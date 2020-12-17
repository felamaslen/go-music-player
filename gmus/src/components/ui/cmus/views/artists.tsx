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
import { FixedSizeNodeData, FixedSizeTree as Tree, TreeWalker, TreeWalkerValue } from 'react-vtree';
import { NodeComponentProps, NodePublicState } from 'react-vtree/dist/es/Tree';

import { useArtistsAlbumsAndSongs } from '../../../../hooks/fetch/artists';
import { artistAlbumsLoaded, artistSongsLoaded } from '../actions';
import { CmusUIDispatchContext, CmusUIStateContext } from '../reducer';
import { CmusUIState } from '../types';
import { getScrollIndex } from '../utils/scroll';

import * as Styled from './artists.styles';

type Props = {
  active: boolean;
};

type TreeNode = {
  name: string;
  id: string;
  focused: boolean;
  active: boolean;
  shouldBeOpen?: boolean;
  children?: TreeNode[];
};

type TreeMeta = {
  node: TreeNode;
};

type TreeData = FixedSizeNodeData &
  Omit<TreeNode, 'children'> & {
    isArtist: boolean;
  };

function useTreeWalker(
  { artists, artistAlbums, library: { activeArtist, activeAlbum, expandedArtists } }: CmusUIState,
  focused: boolean,
): { treeWalker: TreeWalker<TreeData, TreeMeta>; haveData: boolean } {
  const treeNodes = useMemo<TreeNode[]>(
    () =>
      artists.map<TreeNode>((artist) => ({
        name: artist,
        id: artist,
        focused,
        active: activeArtist === artist && activeAlbum === null,
        shouldBeOpen: expandedArtists.includes(artist),
        children:
          artistAlbums[artist]?.map<TreeNode>((album) => ({
            name: album,
            id: `${artist}-${album}`,
            focused,
            active: activeArtist === artist && activeAlbum === album,
          })) ?? undefined,
      })),
    [artists, artistAlbums, focused, activeArtist, activeAlbum, expandedArtists],
  );

  const getNodeData = useCallback(
    (node: TreeNode, isArtist: boolean): TreeWalkerValue<TreeData, TreeMeta> => ({
      data: {
        id: node.id,
        name: node.name,
        focused: node.focused,
        active: node.active,
        shouldBeOpen: node.shouldBeOpen,
        isOpenByDefault: !!node.shouldBeOpen,
        isArtist,
      },
      node,
    }),
    [],
  );

  const treeWalker = useMemo<TreeWalker<TreeData, TreeMeta>>(
    () =>
      // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
      function* treeWalkerGenerator() {
        for (let i = 0; i < treeNodes.length; i += 1) {
          yield getNodeData(treeNodes[i], true);
        }

        while (true) {
          const parent = yield;

          if (parent?.node.children) {
            for (let i = 0; i < parent.node.children.length; i += 1) {
              yield getNodeData(parent.node.children[i], false);
            }
          }
        }
      },
    [treeNodes, getNodeData],
  );

  return { treeWalker, haveData: treeNodes.length > 0 };
}

const Node: React.FC<NodeComponentProps<TreeData, NodePublicState<TreeData>>> = ({
  data: { name, isArtist, focused, active, shouldBeOpen },
  isOpen,
  setOpen,
  style,
}) => {
  useEffect(() => {
    if (!!isOpen !== !!shouldBeOpen) {
      setOpen(!!shouldBeOpen);
    }
  }, [isOpen, shouldBeOpen, setOpen]);

  if (isArtist) {
    return (
      <Styled.ArtistTitle active={active} parentActive={focused} style={style as CSSProperties}>
        <span>{name || 'Unknown Artist'}</span>
      </Styled.ArtistTitle>
    );
  }

  return (
    <Styled.AlbumTitle active={active} parentActive={focused} style={style as CSSProperties}>
      <span>{name || 'Unknown Album'}</span>
    </Styled.AlbumTitle>
  );
};

const lineHeight = 16;
const scrollThresholdLines = 4;

export const Artists: React.FC<Props> = ({ active }) => {
  const dispatchUI = useContext(CmusUIDispatchContext);
  const state = useContext(CmusUIStateContext);
  const {
    library: { activeArtist, expandedArtists },
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

  const { treeWalker, haveData } = useTreeWalker(state, active);

  return (
    <Styled.Container ref={ref}>
      {haveData && (
        <Tree
          outerRef={windowRef}
          treeWalker={treeWalker}
          itemSize={lineHeight}
          width={windowDimensions.width}
          height={windowDimensions.height}
        >
          {Node}
        </Tree>
      )}
    </Styled.Container>
  );
};
