import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_NODE_ENV === 'production' ? import.meta.env.VITE_API_URL + '/api' : 'http://127.0.0.1:3001/api',
  withCredentials: true
});

export default api;