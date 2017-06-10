import axios from 'axios';

const prefix = 'https://api.github.com';
const constructURL = (url) => `${prefix}${url}`;

export const get = (url, params) => {
  return axios.get(constructURL(url), {
    headers: {
      Accept: 'application/vnd.github.v3+json'
    },
    params
  });
}
