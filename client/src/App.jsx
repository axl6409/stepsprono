import React, { useState, useEffect } from 'react';
import {createBrowserRouter, Link} from 'react-router-dom'; // Import Link from react-router-dom
import axios from 'axios';
import reactLogo from './assets/react.svg';
import viteLogo from '../public/vite.svg'; // Corrected the import path
import './App.css';
import instance from '../axios.js'; // Corrected the import path
import HomePage from './pages/HomePage';
import AppRouter from "./Router.jsx";
import ReactDOM from "react-dom/client"; // Corrected the import path

const router = createBrowserRouter([
  {
    path: "/",
    element: <div>Hello world!</div>,
  },
]);


ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);

export default App;
