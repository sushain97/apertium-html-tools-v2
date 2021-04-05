import axios, { AxiosPromise } from 'axios';
import jsonpAdapter from 'axios-jsonp';

const _ = {
  get: (url: string): AxiosPromise<any> => {
    return axios({
      url,
      adapter: jsonpAdapter,
      validateStatus: (status) => status == 200,
    });
  },
};

export = _;
