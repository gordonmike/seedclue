import { createRoute } from 'honox/factory'
import { createClient } from '@supabase/supabase-js'
import { setCookie } from 'hono/cookie'

// 1. The POST Request (Handles both Signup and Login)
export const POST = createRoute(async (c) => {
  const supabaseUrl = c.env.SUPABASE_URL as string
  const supabaseAnonKey = c.env.SUPABASE_ANON_KEY as string
  const supabase = createClient(supabaseUrl, supabaseAnonKey)

  const body = await c.req.parseBody()
  const email = body.email as string
  const password = body.password as string
  const action = body.action as string // This tells us if they clicked "Login" or "Signup"

  if (action === 'signup') {
    const { data, error } = await supabase.auth.signUp({ email, password })
    if (error) return c.text("Signup Error: " + error.message)
    
    // If Supabase automatically logged them in, save the cookies!
    if (data.session) {
      setCookie(c, 'my_access_token', data.session.access_token)
      setCookie(c, 'my_refresh_token', data.session.refresh_token)
    }
    
    // Redirect to the homepage!
    return c.redirect('/')
  }


  if (action === 'login') {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) return c.text("Login Error: " + error.message)

    // THE MAGIC: We save the user's secret session tokens into their browser Cookies!
    setCookie(c, 'my_access_token', data.session.access_token)
    setCookie(c, 'my_refresh_token', data.session.refresh_token)

    // Redirect them to the homepage now that they are logged in!
    return c.redirect('/')
  }

  return c.text("Invalid action")
})

// 2. The HTML Form
export default createRoute((c) => {
  return c.render(
    <div style="max-width: 400px; margin: 40px auto; border: 1px solid #ccc; padding: 20px;">
      <h2>Login to Seed Clue</h2>
      
      <form method="post" style="display: flex; flex-direction: column; gap: 15px;">
        <label>Email:</label>
        <input type="email" name="email" required style="padding: 8px;" />
        
        <label>Password:</label>
        <input type="password" name="password" required style="padding: 8px;" />
        
        <div style="display: flex; gap: 10px;">
          {/* We use 'name="action"' so the server knows which button was clicked! */}
          <button type="submit" name="action" value="login" style="padding: 10px; background: green; color: white; flex: 1;">Login</button>
          <button type="submit" name="action" value="signup" style="padding: 10px; background: blue; color: white; flex: 1;">Sign Up</button>
        </div>
      </form>
    </div>
  )
})
