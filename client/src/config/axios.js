import axios from 'axios';

// Create an Axios instance with a custom base URL
const instance = axios.create({
  baseURL: 'http://localhost:3001',
});

export default instance;