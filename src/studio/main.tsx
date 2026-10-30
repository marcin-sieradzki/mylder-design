// The studio: the gallery of designs and the design board with its inspector.
import '@mylder/perron/perron.css'
import './studio.css'
import { PerronProvider } from '@mylder/perron'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <PerronProvider locale="en">
      <App />
    </PerronProvider>
  </StrictMode>,
)
