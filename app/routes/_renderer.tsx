import { jsxRenderer, useRequestContext } from 'hono/jsx-renderer'
import { getCookie } from 'hono/cookie'

export default jsxRenderer(({ children, title }) => {
  // We grab the "Context" (c) so we can read the user's browser requests!
  const c = useRequestContext()
  
  // We peek into their browser to see if they have the secret cookie we gave them!
  const isLoggedIn = getCookie(c, 'my_access_token') !== undefined

  return (
    <html lang="en">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>{title || 'Seed Clue'}</title>
        <link rel="icon" href="/favicon.ico" />
        <link rel="stylesheet" href="/app/style.css" />
      </head>
      <body style="margin: 0; font-family: sans-serif; background: #f9f9f9; color: #333;">
        
        <nav style="display: flex; justify-content: space-between; padding: 20px; background: white; border-bottom: 1px solid #eee;">
          <a href="/" style="font-weight: bold; text-decoration: none; color: black; font-size: 24px;">Seed Clue</a>
          <div>
            {/* THE MAGIC: If they have the cookie, show "Logout". If not, show "Login"! */}
            {isLoggedIn ? (
               <a href="/logout" style="text-decoration: none; color: red;">Logout</a>
            ) : (
               <a href="/login" style="text-decoration: none; color: blue;">Login</a>
            )}
          </div>
        </nav>

        <main style="padding: 40px; max-width: 800px; margin: 0 auto;">
          {children}
        </main>

      </body>
    </html>
  )
})
