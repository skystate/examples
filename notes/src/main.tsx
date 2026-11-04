import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { SkyStateProvider } from '@skystate/react'
import App from './App'
import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <SkyStateProvider
      account="acc_aM0X1lKdzWGJJZyj"
      project="examples-notes"
      environment={import.meta.env.PROD ? 'production' : 'development'}
      callbackUrl={window.location.origin + import.meta.env.BASE_URL}
    >
      <App />
    </SkyStateProvider>
  </StrictMode>,
)
