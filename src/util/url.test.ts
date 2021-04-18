import { buildNewUrl, getUrlParam } from './url';

const mockLocation = (mock: Partial<Location>) => {
  const originalWindow = { ...window };
  const windowSpy = jest.spyOn(global, 'window', 'get');
  windowSpy.mockImplementation(
    () =>
      ({
        ...originalWindow,
        location: {
          ...originalWindow.location,
          ...mock,
        },
      } as typeof window),
  );
};

describe('getUrlParam', () => {
  afterEach(() => jest.restoreAllMocks());

  it.each([
    ['dir', 'eng-spa', '?dir=eng-spa'],
    ['lang', null, '?dir=eng-spa'],
    ['dir', null, ''],
  ])('extracts %s to %s in "%s"', (param, value, search) => {
    mockLocation({ search });
    expect(getUrlParam(param)).toBe(value);
  });
});

describe('buildNewUrl', () => {
  beforeEach(() =>
    mockLocation({
      pathname: '/index.html',
      hash: '#/translation',
    }),
  );
  afterEach(() => jest.restoreAllMocks());

  it.each([
    [{}, '/index.html?#/translation'],
    [{ dir: 'eng-spa' }, '/index.html?dir=eng-spa#/translation'],
  ])('maps %s to %s', (params, url) => expect(buildNewUrl(params)).toBe(url));
});
