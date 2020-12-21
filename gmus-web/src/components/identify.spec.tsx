import { act, fireEvent, render, RenderResult } from '@testing-library/react';
import React from 'react';

import { Identify, Props } from './identify';

describe(Identify.name, () => {
  const props: Props = {
    connecting: false,
    onIdentify: jest.fn(),
    setInteracted: jest.fn(),
  };

  it('should render an input', () => {
    expect.assertions(1);
    const { getByDisplayValue } = render(<Identify {...props} />);
    expect(getByDisplayValue('')).toBeInTheDocument();
  });

  it('should render a connect button', () => {
    expect.assertions(1);
    const { getByText } = render(<Identify {...props} />);
    expect(getByText('Connect')).toBeInTheDocument();
  });

  describe('when pressing the connect button', () => {
    const setupConnect = (): RenderResult => {
      const renderResult = render(<Identify {...props} />);
      const input = renderResult.getByDisplayValue('');
      const button = renderResult.getByText('Connect');

      act(() => {
        fireEvent.change(input, { target: { value: 'my-computer' } });
      });
      act(() => {
        fireEvent.click(button);
      });

      return renderResult;
    };

    it('should call the onIdentify prop', () => {
      expect.assertions(2);
      setupConnect();

      expect(props.onIdentify).toHaveBeenCalledTimes(1);
      expect(props.onIdentify).toHaveBeenCalledWith('my-computer');
    });

    it('should set interacted to true', () => {
      expect.assertions(2);
      setupConnect();

      expect(props.setInteracted).toHaveBeenCalledTimes(1);
      expect(props.setInteracted).toHaveBeenCalledWith(true);
    });
  });

  describe('when connecting', () => {
    const propsConnecting: Props = { ...props, connecting: true };

    it('should not render the connect button', () => {
      expect.assertions(1);

      const { queryByText } = render(<Identify {...propsConnecting} />);
      expect(queryByText('Connect')).not.toBeInTheDocument();
    });
  });
});
