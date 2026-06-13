import { createRoute } from 'honox/factory'
import { createClient } from '@supabase/supabase-js'
import { getCookie } from 'hono/cookie'

// 1. The POST Request (This runs when they click Submit Idea!)
export const POST = createRoute(async (c) => {
  const supabaseUrl = c.env.SUPABASE_URL as string
  const supabaseAnonKey = c.env.SUPABASE_ANON_KEY as string
  
  // We grab the user's cookie so Supabase knows WHO is submitting the idea!
  const accessToken = getCookie(c, 'my_access_token')

  // We connect to Supabase, but we attach the Cookie so it knows we are logged in!
  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: { Authorization: `Bearer ${accessToken}` } }
  })

  // We read the fields they typed into the HTML form
  const body = await c.req.parseBody()
  const name = body.name as string
  const story = body.story as string

  // We insert a brand new row into the 'businesses' table!
  const { error } = await supabase.from('businesses').insert({
    name: name,
    story: story
  })

  if (error) {
    return c.text("Error saving idea: " + error.message)
  }

  // Success! Redirect them back to the homepage
  return c.redirect('/')
})


// 2. The HTML Form
export default createRoute((c) => {
  return c.render(
    <div style="max-width: 400px; margin: 40px auto; border: 1px solid #ccc; padding: 20px;">
      <h2>Submit a Business Idea</h2>
      
      <form method="post" style="display: flex; flex-direction: column; gap: 15px;">
        <label>Business Name:</label>
        <input type="text" name="name" required style="padding: 8px;" />
        
        <label>Story:</label>
        <textarea name="story" required style="padding: 8px; min-height: 100px;"></textarea>

        <button type="submit" style="padding: 10px; background: purple; color: white;">Submit Idea</button>
      </form>
    </div>
  )
})
