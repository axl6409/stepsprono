import React from "react"
import { BrowserRouter as Router, Route, Routes } from "react-router-dom"
import Navbar from "./components/nav/Navbar"
import Home from "./pages/Home"
import Login from "./pages/Login"
import Register from "./pages/Register"
import Dashboard from "./pages/Dashboard"
import TestComponent from "./components/Test";
import ProtectedRoute from './components/ProtectedRoute';
import {UserProvider} from "./contexts/UserContext.jsx";
import Teams from "./pages/Teams.jsx";

const App = () => {

  return (
    <UserProvider>
      <Router>
        <Navbar />
        <div className="container mx-auto p-4">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/dashboard" element={<ProtectedRoute component={Dashboard} />} />
            <Route path="/teams" element={<ProtectedRoute component={Teams} />} />
            <Route path="/test" element={<TestComponent />} />
          </Routes>
        </div>
      </Router>
    </UserProvider>
  )
}

export default App