import React, {Suspense, lazy} from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import * as serviceWorkerRegistration from './serviceWorkerRegistration.js';

const App = lazy(() => import('./App.jsx'));

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Suspense fallback={<div>Loading...</div>}>
      <App />
    </Suspense>
  </React.StrictMode>
);

serviceWorkerRegistration.register();