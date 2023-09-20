// Router.js
import React from 'react';
import { Routes, Route, BrowserRouter as Router } from "react-router-dom";
import App from './App'; // Import your main App component
import HomePage from './pages/HomePage'; // Import your HomePage component

function AppRouter() {
  return (
    <div>
      <BrowserRouter>
        <NavBar />
        <Routes>
          <Route exact path="/" component={App} />
          <Route path="/homepage" component={HomePage} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default AppRouter;
