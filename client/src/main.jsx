import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
import App from './App'
import { DarkModeProvider } from './context/DarkModeContext.jsx'  // Updated import

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <DarkModeProvider>
      <App />
    </DarkModeProvider>
  </React.StrictMode>,
)