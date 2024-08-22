import React from "react"
import {UserProvider} from "./contexts/UserContext.jsx";
import 'moment/dist/locale/fr'
import moment from "moment";
import {AppProvider} from "./contexts/AppContext.jsx";
import AppContent from "./AppContent.jsx";

const App = () => {
  moment.updateLocale('fr', {})

  return (
    <UserProvider>
      <AppProvider>
        <AppContent />
      </AppProvider>
    </UserProvider>
  )
}

export default App