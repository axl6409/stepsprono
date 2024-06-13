import axios from 'axios'
console.log('API URL:', import.meta.env.VITE_NODE_ENV);
console.log('API URL:', import.meta.env.VITE_APP_API_URL);
const api = axios.create({
  baseURL: import.meta.env.VITE_NODE_ENV === 'production' ? import.meta.env.VITE_APP_API_URL : 'http://127.0.0.1:3001/api',
  withCredentials: true
});

export default api;