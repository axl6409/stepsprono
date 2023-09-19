import { useState, useEffect } from 'react'
import axios from 'axios'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import instance from "../axios.js";

function App() {

  const [data, setData] = useState('');

  useEffect(() => {
    // Make a GET request to the server API
    instance.get('/api/data')
      .then((response) => {
        setData(response.data.message);
      })
      .catch((error) => {
        console.error('Error fetching data:', error);
      });
  }, []);

  return (
    <>
      <h1>Data from Server:</h1>
      <p>{data}</p>
    </>
  )
}

export default App
