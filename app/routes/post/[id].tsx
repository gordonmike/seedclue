import { createRoute } from 'honox/factory'
import { createClient } from '@supabase/supabase-js'

export default createRoute(async (c) => {
    // 1. Grab the ID from the URL
    const id = c.req.param('id')

    const supabaseUrl = c.env.SUPABASE_URL as string
    const supabaseAnonKey = c.env.SUPABASE_ANON_KEY as string
    const supabase = createClient(supabaseUrl, supabaseAnonKey)

    // 2. Fetch the current post
    const { data: business } = await supabase.from('businesses').select('*').eq('id', id).single()

    if (!business) {
        return c.notFound()
    }

    // 3. THE MAGIC: Fetch the "Next" post!
    // We look for the newest post that is STILL older than the current post's timestamp
    const { data: nextPost } = await supabase
        .from('businesses')
        .select('id, name')
        .lt('created_at', business.created_at)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()

    // 4. Render the dedicated post page!
    return c.render(
        <div style="max-width: 1500px; margin: 40px auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px; background: white;">
            <a href="/" style="display: inline-block; margin-bottom: 20px; color: purple; text-decoration: none; font-weight: bold;">← Back to Home</a>

            <h1 style="margin: 0 0 20px 0; color: #333; font-size: 36px;">{business.name}</h1>
            <p style="margin: 0; color: #666; line-height: 1.5; white-space: pre-wrap; font-size: 18px;">{business.story}</p>

            {/* If there is a next post, draw the beautiful Next button at the bottom right! */}
            {nextPost && (
                <div style="text-align: right; margin-top: 60px; padding-top: 20px; border-top: 1px solid #eee;">
                    <span style="color: #999; font-size: 14px; text-transform: uppercase; font-weight: bold;">Next Post</span><br />
                    
                    <a href={`/post/${nextPost.id}`} style="display: inline-block; margin-top: 5px; color: purple; text-decoration: none; font-size: 22px; font-weight: bold;">
                        {nextPost.name} →
                    </a>
                </div>
            )}
        </div>
    )
})
