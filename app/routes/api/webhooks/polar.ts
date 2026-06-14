import { createRoute } from 'honox/factory'
import { createClient } from '@supabase/supabase-js'

export const POST = createRoute(async (c) => {
  const event = await c.req.json()
  console.log("🔔 POLAR WEBHOOK RECEIVED:", event.type)

  // 1. Grab the User ID from the custom metadata we securely attached!
  const userId = event.data?.metadata?.user_id || event.data?.customer?.external_id || event.data?.customer_external_id

  // 2. If we found our User ID, instantly upgrade them in Supabase!
  if (userId) {
    const supabase = createClient(c.env.SUPABASE_URL as string, c.env.SUPABASE_ANON_KEY as string)
    
    const { error } = await supabase.from('profiles').upsert({ id: userId, is_pro: true })
    
    if (error) {
      console.log("❌ SUPABASE ERROR:", error.message)
    } else {
      console.log(`✅ Successfully upgraded user ${userId} to PRO!`)
    }
  } else {
    // 3. If it failed, dump the payload so we can debug!
    console.log("⚠️ No User ID found in the webhook!")
    console.log("FULL PAYLOAD:", JSON.stringify(event.data, null, 2))
  }
  
  return c.text('Success')
})
