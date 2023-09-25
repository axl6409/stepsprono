import axios from 'axios'

require('dotenv').config();
export const authAxios = axios.create({
  baseURL: process.env.SERVER_BASE_URL,
  timeout: 5000
})

export const publicAxios = axios.create({
  baseURL: process.env.PUBLIC_BASE_URL,
  timeout: 5000
})