import { createRoute } from 'honox/factory'
import { Polar } from '@polar-sh/sdk'
import { getCookie } from 'hono/cookie'
import { createClient } from '@supabase/supabase-js'

export const POST = createRoute(async (c) => {
  // 1. Authenticate with Supabase to get the User ID
  const supabaseUrl = c.env.SUPABASE_URL as string
  const supabaseAnonKey = c.env.SUPABASE_ANON_KEY as string
  const accessToken = getCookie(c, 'my_access_token')

  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: { Authorization: `Bearer ${accessToken}` } }
  })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return c.redirect('/login')
  }

  // 2. Authenticate with Polar using the Access Token
  const polar = new Polar({
    accessToken: c.env.POLAR_ACCESS_TOKEN as string,
    // We explicitly tell it to use the Sandbox!
    server: 'sandbox', 
  })

  // 3. Create a secure Checkout Session
  try {
    const session = await polar.checkouts.create({
      products: ["67209136-dc71-45f8-ab41-b15fce97ad05"],
      // Use the correct spelling!
      externalCustomerId: user.id,
      // ALSO put it in metadata, which is the bulletproof way to send data to webhooks!
      metadata: {
        user_id: user.id
      },
      successUrl: "https://seedclue.pages.dev/"
    })



    // 4. Redirect the user to the securely generated Checkout URL
    return c.redirect(session.url)
  } catch (error) {
    console.error("Error creating Polar checkout session:", error)
    return c.text("Error creating checkout session", 500)
  }
})
