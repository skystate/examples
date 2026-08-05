import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { SkyStateProvider } from '@skystate/react'
import App from './App'
import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <SkyStateProvider
      account="acc_aM0X1lKdzWGJJZyj"
      project="mempad"
      environment="development"
      callbackUrl={window.location.origin}
    >
      <App />
    </SkyStateProvider>
  </StrictMode>,
)
