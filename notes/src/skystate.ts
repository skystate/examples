import { createSkyStateClient } from '@skystate/react'

// The app owns the SkyState client: create and start it once, outside React.
export const client = createSkyStateClient({
  account: 'acc_aM0X1lKdzWGJJZyj',
  project: 'examples-notes',
  environment: import.meta.env.PROD ? 'production' : 'development',
  callbackUrl: window.location.origin + import.meta.env.BASE_URL,
})
void client.init()
