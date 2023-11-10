import React from "react"
import { BrowserRouter as Router, Route, Routes } from "react-router-dom"
import Navbar from "./components/nav/Navbar"
import Home from "./pages/Home"
import Login from "./pages/Login"
import Register from "./pages/Register"
import Dashboard from "./pages/Dashboard"
import ProtectedRoute from './components/ProtectedRoute';
import {UserProvider} from "./contexts/UserContext.jsx";
import Teams from "./pages/Teams.jsx";
import Admin from "./pages/admin/Admin.jsx";
import Users from "./pages/admin/Users.jsx";
import Matchs from "./pages/Matchs.jsx";
import Classements from "./pages/Classements.jsx";
import Bets from "./pages/Bets.jsx";
import moment from "moment";
import 'moment/locale/fr'
import PassedMatchs from "./pages/matchs/PassedMatchs.jsx";
import UpcomingMatchs from "./pages/matchs/UpcomingMatchs.jsx";
import Settings from "./pages/admin/Settings.jsx";
import EditUser from "./components/admin/EditUser.jsx";

const App = () => {
  moment.locale('fr')

  return (
    <UserProvider>
      <Router>
        <Navbar />
        <div className="container mx-auto">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/dashboard" element={<ProtectedRoute component={Dashboard} />} />
            <Route path="/matchs" element={<ProtectedRoute component={Matchs} />} />
            <Route path="/matchs/passed" element={<ProtectedRoute component={PassedMatchs} />} />
            <Route path="/matchs/upcoming" element={<ProtectedRoute component={UpcomingMatchs} />} />
            <Route path="/pronostic/:matchId" element={<ProtectedRoute component={Bets} />} />
            <Route path="/classement" element={<ProtectedRoute component={Classements} />} />
            <Route path="/teams" element={<ProtectedRoute component={Teams} />} />
            <Route path="/admin" element={<ProtectedRoute component={Admin} />} />
            <Route path="/admin/users" element={<ProtectedRoute component={Users} />} />
            <Route path="/admin/users/edit/:id" element={<ProtectedRoute component={EditUser} />} />
            <Route path="/admin/settings" element={<ProtectedRoute component={Settings} />} />
            <Route path="/admin/teams" element={<ProtectedRoute component={Teams} />} />
          </Routes>
        </div>
      </Router>
    </UserProvider>
  )
}

export default App