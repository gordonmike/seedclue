import { createRoute } from 'honox/factory'
import { deleteCookie } from 'hono/cookie'

export default createRoute((c) => {
  // We reach into their browser and shred the secret session tokens!
  deleteCookie(c, 'my_access_token')
  deleteCookie(c, 'my_refresh_token')
  
  // Then we kick them back to the homepage
  return c.redirect('/')
})
