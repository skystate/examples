import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { SkyStateProvider } from '@skystate/react'
import { client } from './skystate'
import App from './App'
import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <SkyStateProvider client={client}>
      <App />
    </SkyStateProvider>
  </StrictMode>,
)
