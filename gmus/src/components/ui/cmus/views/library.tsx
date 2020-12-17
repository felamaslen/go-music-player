import React, { useContext, useEffect } from 'react';

import { useArtists } from '../../../../hooks/fetch/artists';
import { artistsSet } from '../actions';

import { CmusUIDispatchContext, CmusUIStateContext } from '../reducer';
import { LibraryModeWindow } from '../types';

import { Artists } from './artists';
import { Songs } from './songs';

export const ViewLibrary: React.FC = () => {
  const dispatchUI = useContext(CmusUIDispatchContext);
  const { library } = useContext(CmusUIStateContext);

  const { artists } = useArtists();
  useEffect(() => {
    dispatchUI(artistsSet(artists));
  }, [dispatchUI, artists]);

  return (
    <>
      <Artists active={library.modeWindow === LibraryModeWindow.ArtistList} />
      <Songs active={library.modeWindow === LibraryModeWindow.SongList} />
    </>
  );
};
