import { getPubsubUrl, getSongUrl } from './url';

describe(getPubsubUrl.name, () => {
  it('should return a websocket URL', () => {
    expect.assertions(1);
    expect(getPubsubUrl()).toBe('ws://my-api.url:1234/pubsub');
  });

  describe.each`
    case                 | apiUrl                     | testCase          | expectedPubsubUrl
    ${'is https'}        | ${'https://some.api:1876'} | ${'a secure URL'} | ${'wss://some.api:1876/pubsub'}
    ${'has no port'}     | ${'http://some.api'}       | ${'no port'}      | ${'ws://some.api/pubsub'}
    ${'has no protocol'} | ${'//some.api'}            | ${'no protocol'}  | ${'ws://some.api/pubsub'}
  `('when the URL $case', ({ testCase, apiUrl, expectedPubsubUrl }) => {
    const envBefore = process.env.REACT_APP_API_URL;
    beforeAll(() => {
      process.env.REACT_APP_API_URL = apiUrl;
      window.location.protocol = 'http:';
    });
    afterAll(() => {
      process.env.REACT_APP_API_URL = envBefore;
    });

    it(`should return ${testCase}`, () => {
      expect.assertions(1);
      expect(getPubsubUrl()).toBe(expectedPubsubUrl);
    });
  });
});

describe(getSongUrl.name, () => {
  it('should return a correct URL', () => {
    expect.assertions(1);
    expect(getSongUrl(12372)).toBe('http://my-api.url:1234/stream?songid=12372');
  });
});
