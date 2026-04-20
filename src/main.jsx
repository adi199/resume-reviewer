import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { A2UIProvider } from '@a2ui/react'
import { injectStyles } from '@a2ui/react/styles'
import './index.css'
import App from './App.jsx'

// Inject base A2UI styles
injectStyles()

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <A2UIProvider onAction={(msg) => console.log('A2UI Action:', msg)}>
      <App />
    </A2UIProvider>
  </StrictMode>,
)
