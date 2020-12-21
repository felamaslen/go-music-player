import React, { useContext } from 'react';

import { CmusUIStateContext } from '../reducer';
import { LibraryModeWindow } from '../types';

import { Artists, Props as PropsArtists } from './artists';
import * as Styled from './library.styles';
import { Songs } from './songs';

export type Props = Pick<PropsArtists, 'currentArtist'> & Styled.ContainerProps;

export const ViewLibrary: React.FC<Props> = ({ hidden, currentArtist }) => {
  const { library } = useContext(CmusUIStateContext);

  return (
    <Styled.Container hidden={hidden}>
      <Artists
        active={library.modeWindow === LibraryModeWindow.ArtistList}
        currentArtist={currentArtist}
      />
      <Songs active={library.modeWindow === LibraryModeWindow.SongList} />
    </Styled.Container>
  );
};
