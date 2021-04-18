import * as queryString from 'query-string';

// https://stackoverflow.com/q/417142/1266600. Preserve enough space for the
// host and path.
export const MaxURLLength = 2048 - window.location.origin.length - 25;

export const getUrlParam = (key: string): string | null => {
  const value = queryString.parse(window.location.search)[key];
  if (value == null) {
    return null;
  }
  if (typeof value === 'string') {
    return value;
  }
  return value.length > 0 ? value[0] : null;
};

export const buildNewUrl = (params: Record<string, string>): string => {
  return `${window.location.pathname}?${queryString.stringify(params)}${window.location.hash}`;
};
