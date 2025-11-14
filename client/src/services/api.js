import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const createApiInstance = (getAuthHeaders) => {
  const instance = axios.create({
    baseURL: API_URL,
  });

  // Add auth token to requests
  instance.interceptors.request.use(
    (config) => {
      const headers = getAuthHeaders();
      if (headers.Authorization) {
        config.headers.Authorization = headers.Authorization;
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  return instance;
};

export default createApiInstance;
