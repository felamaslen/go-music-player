import React from 'react';
import { FlexColumn, FlexRow, NoWrap } from '../styled/layout';

import * as Styled from './help.styles';

type Command = { command: string; description: string };

const commandsGeneral: Command[] = [
  { command: 'c', description: 'play / pause' },
  { command: 'j', description: 'select next list item' },
  { command: 'k', description: 'select previous list item' },
  { command: '<PageDown>', description: 'select next page of list items' },
  { command: '<PageUp>', description: 'select pervious page of list items' },
  { command: ':q', description: 'log out' },
  { command: '<Esc>', description: 'close this dialog' },
];

const commandsLibrary: Command[] = [
  { command: '<Tab>', description: 'switch between artists and albums' },
  { command: '<Space>', description: 'toggle albums for selected artist' },
];

type CommandGroup = {
  title: string;
  commands: Command[];
};

const commandGroups: CommandGroup[] = [
  { title: 'Library view', commands: commandsLibrary },
  { title: 'General', commands: commandsGeneral },
];

export const HelpDialog: React.FC = () => (
  <Styled.HelpDialogContainer>
    <h3>Commands available</h3>
    {commandGroups.map(({ title, commands }) => (
      <FlexColumn key={title}>
        <Styled.CommandGroupTitle>{title}</Styled.CommandGroupTitle>
        <FlexRow>
          <Styled.Commands>
            {commands.map(({ command }) => (
              <NoWrap key={command}>{command}</NoWrap>
            ))}
          </Styled.Commands>
          <Styled.Commands>
            {commands.map(({ command, description }) => (
              <NoWrap key={command}>{description}</NoWrap>
            ))}
          </Styled.Commands>
        </FlexRow>
      </FlexColumn>
    ))}
  </Styled.HelpDialogContainer>
);
