import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405)

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || ''
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') || ''
    const mailjetApiKey = Deno.env.get('MAILJET_API_KEY') || ''
    const mailjetSecret = Deno.env.get('MAILJET_SECRET_KEY') || Deno.env.get('MAILJET_API_SECRET') || ''
    const fromEmail = Deno.env.get('MAILJET_FROM_EMAIL') || ''
    const fromName = Deno.env.get('MAILJET_FROM_NAME') || 'SE7EN FIT'

    if (!mailjetApiKey || !mailjetSecret || !fromEmail) {
      return json({ error: 'Mailjet secrets are not configured in Supabase.' }, 500)
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: req.headers.get('Authorization') || '' } },
      auth: { persistSession: false },
    })

    const { data: authData, error: authError } = await supabase.auth.getUser()
    if (authError || !authData?.user) return json({ error: 'Authentication required' }, 401)

    const body = await req.json().catch(() => ({}))
    const recipientEmail = String(body.recipient_email || body.to || '').trim()
    const recipientName = String(body.recipient_name || '').trim()
    const subject = String(body.subject || '').trim()
    const message = String(body.message || body.body || '').trim()

    if (!recipientEmail || !subject || !message) {
      return json({ error: 'Email, subject and message are required.' }, 400)
    }

    const { data: queued, error: insertError } = await supabase
      .from('email_messages')
      .insert({
        owner_profile_id: authData.user.id,
        recipient_email: recipientEmail,
        recipient_name: recipientName || null,
        subject,
        message,
        template_name: body.template_name || null,
        status: 'queued',
        metadata: { provider: 'mailjet', source: 'gym_owner_website' },
      })
      .select('*')
      .single()

    if (insertError) return json({ error: insertError.message }, 400)

    const mailjetResult = await fetch('https://api.mailjet.com/v3.1/send', {
      method: 'POST',
      headers: {
        Authorization: `Basic ${btoa(`${mailjetApiKey}:${mailjetSecret}`)}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        Messages: [{
          From: { Email: fromEmail, Name: fromName },
          To: [{ Email: recipientEmail, Name: recipientName || recipientEmail }],
          Subject: subject,
          TextPart: message,
          HTMLPart: message.replace(/\n/g, '<br>'),
          CustomID: queued.id,
        }],
      }),
    })

    const providerBody = await mailjetResult.json().catch(() => ({}))
    const status = mailjetResult.ok ? 'sent' : 'failed'

    const { data: updated, error: updateError } = await supabase
      .from('email_messages')
      .update({
        status,
        sent_at: mailjetResult.ok ? new Date().toISOString() : null,
        metadata: { provider: 'mailjet', source: 'gym_owner_website', response: providerBody },
      })
      .eq('id', queued.id)
      .select('*')
      .single()

    if (updateError) return json({ error: updateError.message }, 400)
    if (!mailjetResult.ok) return json({ error: 'Mailjet send failed', provider: providerBody, email: updated }, 502)

    return json({ success: true, status: 'sent', email: updated })
  } catch (error) {
    return json({ error: error instanceof Error ? error.message : 'Unknown error' }, 500)
  }
})
