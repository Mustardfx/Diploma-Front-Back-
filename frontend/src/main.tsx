import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { ThemeProvider, getInitialTheme } from './context/ThemeContext'

// Применяем тему до рендера, чтобы не было вспышки при светлой/космической теме.
const _t = getInitialTheme()
if (_t === 'light') document.documentElement.classList.add('theme-light')
else if (_t === 'cosmic') document.documentElement.classList.add('theme-cosmic')

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </StrictMode>,
)
