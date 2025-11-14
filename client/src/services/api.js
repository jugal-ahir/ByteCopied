import axios from 'axios';

// Ensure API URL always ends with /api
const getApiUrl = () => {
  const envUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
  // If URL doesn't end with /api, append it
  if (envUrl && !envUrl.endsWith('/api')) {
    return envUrl.endsWith('/') ? `${envUrl}api` : `${envUrl}/api`;
  }
  return envUrl;
};

const API_URL = getApiUrl();

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
