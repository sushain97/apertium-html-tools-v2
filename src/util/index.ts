import axios, { AxiosPromise, CancelTokenSource } from 'axios';
import * as queryString from 'query-string';

import Config from '../../config';

// https://stackoverflow.com/q/417142/1266600. Preserve enough space for the
// host and path.
export const MaxURLLength = 2048 - window.location.origin.length - 25;

export const apyFetch = (path: string, params?: Record<string, string>): [CancelTokenSource, AxiosPromise<unknown>] => {
  const source = axios.CancelToken.source();

  return [
    source,
    axios.post(`${Config.apyURL}/${path}`, params ? queryString.stringify(params) : '', {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      cancelToken: source.token,
      validateStatus: (status) => status == 200,
    }),
  ];
};

export const getUrlParam = (key: string): string | null => {
  const value = queryString.parse(location.search)[key];
  return value instanceof Array ? value[0] : value;
};

export const buildNewUrl = (params: Record<string, string>): string => {
  return `${window.location.pathname}?${queryString.stringify(params)}${window.location.hash}`;
};
