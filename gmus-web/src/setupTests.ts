// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';
import nock from 'nock';

beforeEach(() => {
  jest.restoreAllMocks();
});

beforeAll(() => {
  nock.disableNetConnect();
  nock.enableNetConnect('http://my-api.url:1234');
});

afterAll(() => {
  nock.enableNetConnect();
});
