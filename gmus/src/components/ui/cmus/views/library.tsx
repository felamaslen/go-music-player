import React, { useContext, useEffect } from 'react';

import { useArtists } from '../../../../hooks/fetch/artists';
import { artistsSet } from '../actions';

import { Artists } from '../artists';
import { CmusUIDispatchContext, CmusUIStateContext } from '../reducer';
import { Songs } from '../songs';
import { LibraryModeWindow } from '../types';

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
