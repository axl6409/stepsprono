import axios from 'axios'

require('dotenv').config();

const api = axios.create({
  baseURL: process.env.NODE_ENV === 'production' ? process.env.REACT_APP_API_URL : 'http://127.0.0.1:3001/api',
  withCredentials: true
});

export default api;