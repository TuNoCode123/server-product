import axios from "axios";

const instance = axios.create({
  baseURL: process.env.URL_SSO ?? "something wrong",
  timeout: 10000,
});
instance.interceptors.request.use(
  function (config) {
    // Do something before request is sent
    return config;
  },
  function (error) {
    return Promise.reject(error);
  }
);

// Add a response interceptor
instance.interceptors.response.use(
  function (response) {
    // Any status code that lie within the range of 2xx cause this function to trigger
    // Do something with response data
    return response && response.data ? response.data : response;
  },
  function (error) {
    // Any status codes that falls outside the range of 2xx cause this function to trigger
    // Do something with response error
    return error && error.response
      ? error.response.data
      : Promise.reject(error);
  }
);
export default instance;
