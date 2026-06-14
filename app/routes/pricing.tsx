import { createRoute } from 'honox/factory'
import { createClient } from '@supabase/supabase-js'
import { getCookie } from 'hono/cookie'

export default createRoute(async (c) => {
  // 1. Connect to Supabase
  const supabaseUrl = c.env.SUPABASE_URL as string
  const supabaseAnonKey = c.env.SUPABASE_ANON_KEY as string
  const accessToken = getCookie(c, 'my_access_token')

  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: { Authorization: `Bearer ${accessToken}` } }
  })

  // 2. Ask Supabase for the details of the logged-in user
  const { data: { user } } = await supabase.auth.getUser()

  // If they aren't logged in, they can't buy Pro! Send them to login.
  if (!user) {
    return c.redirect('/login')
  }

  // 4. Render the Pricing HTML
  return c.render(
    <div style="max-width: 600px; margin: 60px auto; text-align: center;">
      <h2>Upgrade to Seed Clue Pro</h2>
      <p style="margin-bottom: 40px; color: #666;">Unlock unlimited ideas and premium features.</p>
      
      <div style="border: 1px solid #ddd; padding: 40px; border-radius: 12px; background: white;">
        <h3 style="font-size: 28px; margin: 0;">$2 / month</h3>
        <p style="color: #666; margin-bottom: 30px;">Cancel anytime.</p>
        
        {/* We use a form to securely request a checkout session from our backend! */}
        <form method="post" action="/api/checkout">
          <button type="submit" style="display: block; width: 100%; padding: 15px; background: black; color: white; text-decoration: none; border-radius: 8px; font-weight: bold; border: none; cursor: pointer;">
            Subscribe with Polar
          </button>
        </form>

      </div>
    </div>
  )
})
