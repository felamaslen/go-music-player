import React from 'react';
import { FlexRow, NoWrap } from '../styled/layout';
import { H3 } from '../styled/typography';

import * as Styled from './help.styles';

type Command = { command: string; description: string };

const commandsGeneral: Command[] = [
  { command: 'z', description: 'previous song' },
  { command: 'c', description: 'play / pause' },
  { command: 'b', description: 'next song' },
  { command: 's', description: 'toggle shuffle mode' },
  { command: 'j', description: 'select next list item' },
  { command: 'k', description: 'select previous list item' },
  { command: '<PageDown>', description: 'select next page of list items' },
  { command: '<PageUp>', description: 'select pervious page of list items' },
  { command: '1', description: 'show library view' },
  { command: '2', description: 'show client list' },
  { command: '3', description: 'show queue' },
  { command: ':q', description: 'log out' },
  { command: '<Esc>', description: 'close this dialog' },
];

const commandsLibrary: Command[] = [
  { command: '<Tab>', description: 'switch between artists/albums and songs' },
  { command: '<Space>', description: 'toggle albums for selected artist' },
  { command: '<Enter>', description: 'play the selected song' },
  { command: 'e', description: 'add selected item to queue' },
  { command: '/', description: 'search for an item' },
];

const commandsClientList: Command[] = [
  { command: '<Enter>', description: 'set the selected client to master' },
  { command: '<Space>', description: 'toggle active state of selected client' },
];

const commandsQueue: Command[] = [
  { command: 'd', description: 'remove the selected song from the queue' },
  { command: 'P', description: 'move the selected song up the queue' },
  { command: 'p', description: 'move the selected song down the queue' },
  { command: '<Enter>', description: 'play the selected song' },
];

type CommandGroup = {
  title: string;
  commands: Command[];
};

const commandGroups: CommandGroup[] = [
  { title: 'General', commands: commandsGeneral },
  { title: 'Library view', commands: commandsLibrary },
  { title: 'Client list', commands: commandsClientList },
  { title: 'Queue', commands: commandsQueue },
];

export const HelpDialog: React.FC = () => (
  <Styled.HelpDialogContainer>
    <H3>Available commands</H3>
    {commandGroups.map(({ title, commands }) => (
      <Styled.CommandGroup key={title}>
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
      </Styled.CommandGroup>
    ))}
  </Styled.HelpDialogContainer>
);
