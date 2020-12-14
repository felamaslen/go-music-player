import { act, fireEvent, render } from '@testing-library/react';
import React from 'react';
import { Identify, Props } from './index';

describe(Identify.name, () => {
  const props: Props = {
    connecting: false,
    onIdentify: jest.fn(),
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
    it('should call the onIdentify prop', () => {
      expect.assertions(2);
      const { getByDisplayValue, getByText } = render(<Identify {...props} />);
      const input = getByDisplayValue('');
      const button = getByText('Connect');

      act(() => {
        fireEvent.change(input, { target: { value: 'my-computer' } });
      });
      act(() => {
        fireEvent.click(button);
      });

      expect(props.onIdentify).toHaveBeenCalledTimes(1);
      expect(props.onIdentify).toHaveBeenCalledWith('my-computer');
    });
  });

  describe('when connecting', () => {
    const propsConnecting: Props = { ...props, connecting: true };

    it('should disable the connect button', () => {
      expect.assertions(1);

      const { getByText } = render(<Identify {...propsConnecting} />);
      const button = getByText('Connect') as HTMLButtonElement;
      expect(button.disabled).toBe(true);
    });

    it('should display a loading spinner', () => {
      expect.assertions(1);

      const { container } = render(<Identify {...propsConnecting} />);
      expect(container).toMatchInlineSnapshot(`
        <div>
          <div>
            <div>
              <span>
                Set client name:
              </span>
              <input
                type="text"
              />
              <button
                disabled=""
              >
                Connect
              </button>
              <div
                class="css-1d9ls5a"
              >
                <div
                  class="css-18jumju"
                />
                <div
                  class="css-1ix8i79"
                />
                <div
                  class="css-mdd9ud"
                />
                <div
                  class="css-qbu4to"
                />
                <div
                  class="css-1wtwgn9"
                />
              </div>
            </div>
          </div>
        </div>
      `);
    });
  });
});
