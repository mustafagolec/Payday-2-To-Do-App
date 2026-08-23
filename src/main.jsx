import React from 'react'
import { createRoot } from 'react-dom/client'
import '@fontsource/oswald/300.css'
import '@fontsource/oswald/400.css'
import '@fontsource/oswald/500.css'
import '@fontsource/oswald/600.css'
import './styles.css'
import App from './App'

// F11 tam ekran: oyun HUD'unun hakkini vermek icin.
window.addEventListener('keydown', (e) => {
  if (e.key === 'F11') {
    e.preventDefault()
    window.pd2?.window.fullscreen()
  }
})

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
