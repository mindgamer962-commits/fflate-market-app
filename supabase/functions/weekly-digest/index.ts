import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

serve(async (req) => {
    try {
        const supabase = createClient(
            SUPABASE_URL!,
            SUPABASE_SERVICE_ROLE_KEY!
        )

        // 1. Fetch all users with email
        const { data: users, error: userError } = await supabase
            .from('profiles')
            .select('email, full_name')
            .not('email', 'is', null)

        if (userError) throw userError

        // 2. Fetch top products of the week (for the digest)
        const { data: topProducts, error: productError } = await supabase
            .from('products')
            .select('*')
            .eq('is_active', true)
            .order('click_count', { ascending: false })
            .limit(3)

        if (productError) throw productError

        // 3. For each user, send an email
        // Note: In production, you'd want to use batch sending if supported or a queue
        const emailPromises = users.map(async (user: any) => {
            const resp = await fetch('https://api.resend.com/emails', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${RESEND_API_KEY}`,
                },
                body: JSON.stringify({
                    from: 'Smart Discover <onboarding@resend.dev>',
                    to: user.email,
                    subject: 'Your Weekly Product Digest!',
                    html: `
            <h1>Hello, ${user.full_name || 'shopper'}!</h1>
            <p>Here are this week's top trending products you shouldn't miss:</p>
            <ul>
              ${topProducts.map(p => `<li><strong>${p.title}</strong> - Only ₹${p.price}</li>`).join('')}
            </ul>
            <p>Visit <a href="https://smart-discover.vercel.app">Smart Discover</a> to see more!</p>
          `,
                }),
            })
            return resp.json()
        })

        const results = await Promise.all(emailPromises)

        return new Response(
            JSON.stringify({ message: `Sent ${results.length} emails`, results }),
            { headers: { "Content-Type": "application/json" } }
        )
    } catch (err) {
        return new Response(
            JSON.stringify({ error: err.message }),
            { status: 500, headers: { "Content-Type": "application/json" } }
        )
    }
})
