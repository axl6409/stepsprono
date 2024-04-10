import React from "react"
import { BrowserRouter as Router, Route, Routes } from "react-router-dom"
import Home from "./pages/Home"
import Login from "./pages/Login"
import Register from "./pages/Register"
import {UserProvider} from "./contexts/UserContext.jsx";
import 'moment/dist/locale/fr'
import moment from "moment";
import {AppProvider} from "./contexts/AppContext.jsx";
import AuthenticatedApp from "./AuthenticatedApp.jsx";

const App = () => {
  moment.updateLocale('fr', {})
  return (
    <UserProvider>
      <AppProvider>
        <Router>
          <AuthenticatedApp />
        </Router>
      </AppProvider>
    </UserProvider>
  )
}

export default App