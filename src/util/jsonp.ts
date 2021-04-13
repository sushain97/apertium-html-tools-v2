import axios, { AxiosPromise, CancelTokenSource } from 'axios';
import jsonpAdapter from 'axios-jsonp';

const _ = {
  get: (url: string, params?: unknown): [CancelTokenSource, AxiosPromise<unknown>] => {
    const source = axios.CancelToken.source();

    return [
      source,
      axios({
        url,
        adapter: jsonpAdapter,
        params,
        cancelToken: source.token,
        validateStatus: (status) => status == 200,
      }),
    ];
  },
};

export = _;
