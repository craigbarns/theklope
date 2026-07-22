import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import { StoreProvider } from './context/StoreContext.jsx'
import './index.css'
import { capturePrerenderSnapshot } from './lib/prerenderSnapshot.js'
import { captureAcquisition } from './lib/analytics.js'
import ErrorBoundary from './components/ErrorBoundary.jsx'

// Sauvegarde le contenu SEO pré-rendu avant que createRoot ne vide #root :
// les pages produit peuvent le réafficher tant que le catalogue n'est pas
// chargé, pour que les crawlers ne voient jamais un simple spinner (Soft 404).
capturePrerenderSnapshot()
captureAcquisition()

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <ErrorBoundary>
        <StoreProvider>
          <App />
        </StoreProvider>
      </ErrorBoundary>
    </BrowserRouter>
  </React.StrictMode>,
)
