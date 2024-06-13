import React from "react"
import { BrowserRouter as Router, Route, Routes } from "react-router-dom"
import {UserProvider} from "./contexts/UserContext.jsx";
import 'moment/dist/locale/fr'
import moment from "moment";
import {AppProvider} from "./contexts/AppContext.jsx";
import AuthenticatedApp from "./AuthenticatedApp.jsx";

const App = () => {
  moment.updateLocale('fr', {})
  React.useEffect(() => {
    console.log('API URL:', process.env.VITE_APP_API_URL);
  }, []);
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