import axios from 'axios'

require('dotenv').config();

const api = axios.create({
  baseURL: import.meta.env.VITE_NODE_ENV === 'production' ? import.meta.env.VITE_APP_API_URL : 'http://127.0.0.1:3001/api',
  withCredentials: true
});

export default api;