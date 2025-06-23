import * as React from 'react'
import { ChakraProvider } from '@chakra-ui/react'
import * as ReactDOM from 'react-dom/client'
import App from './App'
import theme from './theme'
import { BrowserRouter } from 'react-router-dom'
import { Routes, Route } from 'react-router-dom'
import ConnexionPage from './pages/connexion.page.jsx'
import InscriptionPage from './pages/inscription.page.jsx'
import AgentTransactionPage from './pages/agentTransaction.page.jsx'
import AdminDashboard from './pages/adminDashboard.page.jsx'

const rootElement = document.getElementById('root')
ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <BrowserRouter>
      <ChakraProvider theme={theme} > 
      <Routes>
          {/* La route principale pour votre composant App (page d'accueil) */}
          <Route path="/" element={<App />} />

          {/* Les routes pour vos pages de connexion et d'inscription */}
          <Route path="/connexion" element={<ConnexionPage />} />
          <Route path="/inscription" element={<InscriptionPage />} />
          <Route path="/agent" element={<AgentTransactionPage />} />
          <Route path="/admin-dashboard" element={<AdminDashboard />} />
      </Routes>
    </ChakraProvider>
    </BrowserRouter>
  </React.StrictMode>,
)