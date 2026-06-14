import { createRoute } from 'honox/factory'
import { createClient } from '@supabase/supabase-js'
import { getCookie } from 'hono/cookie'

export default createRoute(async (c) => {
  const supabaseUrl = c.env.SUPABASE_URL as string
  const supabaseAnonKey = c.env.SUPABASE_ANON_KEY as string
  const accessToken = getCookie(c, 'my_access_token')

  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: { Authorization: `Bearer ${accessToken}` } }
  })

  // Fetch all the ideas for the feed
  const { data: businesses } = await supabase.from('businesses').select('*').order('created_at', { ascending: false })

  // Find out if the current logged-in user is PRO!
  let isPro = false
  if (accessToken) {
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const { data: profile } = await supabase.from('profiles').select('is_pro').eq('id', user.id).single()
      if (profile?.is_pro) {
        isPro = true
      }
    }
  }

  return c.render(
    <div style="max-width: 600px; margin: 40px auto;">
      <div style="display: flex; align-items: center; gap: 15px; margin-bottom: 20px;">
        <h1 style="font-size: 32px; font-weight: bold; margin: 0;">Welcome to Scoutio</h1>
        
        {/* THE PRO BADGE MAGIC! */}
        {isPro && (
          <span style="background: gold; color: black; padding: 5px 10px; border-radius: 20px; font-weight: bold; font-size: 14px;">PRO MEMBER</span>
        )}
      </div>
      
      <a href="/submit" style="display: inline-block; margin-bottom: 30px; padding: 10px 15px; background: purple; color: white; text-decoration: none; border-radius: 5px;">+ Submit New Idea</a>

      <div style="display: flex; flex-direction: column; gap: 20px;">
        {businesses?.map((business) => (
          <div style="padding: 20px; border: 1px solid #ddd; border-radius: 8px; background: white;">
            <h3 style="margin: 0 0 10px 0; color: #333;">{business.name}</h3>
            <p style="margin: 0; color: #666; line-height: 1.5;">{business.story}</p>
          </div>
        ))}
      </div>
    </div>
  )
})
