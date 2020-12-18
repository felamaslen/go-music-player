import React, { useContext, useEffect } from 'react';

import { useArtists } from '../../../../hooks/fetch/artists';
import { artistsSet } from '../actions';

import { CmusUIDispatchContext, CmusUIStateContext } from '../reducer';
import { LibraryModeWindow } from '../types';

import { Artists, Props as PropsArtists } from './artists';
import { Songs } from './songs';

export type Props = Pick<PropsArtists, 'currentArtist'>;

export const ViewLibrary: React.FC<Props> = ({ currentArtist }) => {
  const dispatchUI = useContext(CmusUIDispatchContext);
  const { library } = useContext(CmusUIStateContext);

  const { artists } = useArtists();
  useEffect(() => {
    dispatchUI(artistsSet(artists));
  }, [dispatchUI, artists]);

  return (
    <>
      <Artists
        active={library.modeWindow === LibraryModeWindow.ArtistList}
        currentArtist={currentArtist}
      />
      <Songs active={library.modeWindow === LibraryModeWindow.SongList} />
    </>
  );
};
