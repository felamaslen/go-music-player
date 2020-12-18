import React, { useContext } from 'react';

import { CmusUIStateContext } from '../reducer';
import { LibraryModeWindow } from '../types';

import { Artists, Props as PropsArtists } from './artists';
import { Songs } from './songs';

export type Props = Pick<PropsArtists, 'currentArtist'>;

export const ViewLibrary: React.FC<Props> = ({ currentArtist }) => {
  const { library } = useContext(CmusUIStateContext);

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
