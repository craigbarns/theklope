import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import { StoreProvider } from './context/StoreContext.jsx'
import './index.css'
import { capturePrerenderSnapshot } from './lib/prerenderSnapshot.js'

// Sauvegarde le contenu SEO pré-rendu avant que createRoot ne vide #root :
// les pages produit peuvent le réafficher tant que le catalogue n'est pas
// chargé, pour que les crawlers ne voient jamais un simple spinner (Soft 404).
capturePrerenderSnapshot()

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <StoreProvider>
        <App />
      </StoreProvider>
    </BrowserRouter>
  </React.StrictMode>,
)
