// supabase/functions/send-event-notification/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

interface EmailNotificationRequest {
  eventId: string;
  eventTitle: string;
  eventDescription?: string;
  eventDate: string;
  eventCategory: string;
  action: 'created' | 'updated' | 'deleted';
  userEmail: string;
  userName: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    )

    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Missing authorization header' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token)
    
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Invalid token' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('role, is_admin')
      .eq('id', user.id)
      .single()

    if (!profile?.is_admin && profile?.role !== 'editor') {
      return new Response(JSON.stringify({ error: 'Insufficient permissions' }), { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    const body: EmailNotificationRequest = await req.json()

    const { data: users, error: usersError } = await supabaseAdmin
      .from('profiles')
      .select('email')
      .not('email', 'is', null)

    if (usersError) {
      return new Response(JSON.stringify({ error: 'Failed to fetch users' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }
    
    const emailsToSend = users.map(u => u.email).filter(Boolean);

    if (emailsToSend.length === 0) {
      return new Response(JSON.stringify({ success: true, message: 'No users with emails to notify.' }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    const { data: category } = await supabaseAdmin
      .from('event_categories')
      .select('label')
      .eq('value', body.eventCategory)
      .single()

    const categoryLabel = category?.label || body.eventCategory;
    
    // CONTEÚDO E LÓGICA DO E-MAIL (SEM ALTERAÇÕES)
    // ... (o HTML e a lógica do assunto permanecem os mesmos) ...

    const actionText = {
      created: 'criado',
      updated: 'atualizado',
      deleted: 'excluído'
    }
    const subject = `Calendário Salesiano - Evento ${actionText[body.action]}: ${body.eventTitle}`
    const htmlContent = `...`; // O HTML do e-mail permanece o mesmo
    
    // --- IMPLEMENTAÇÃO DO ENVIO DE E-MAIL ---
    // Substitua este bloco pela integração real com seu provedor de e-mail.
    // O código abaixo é um exemplo usando Resend.
    // Certifique-se de adicionar a RESEND_API_KEY aos seus segredos do Supabase.

    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    if (!resendApiKey) {
      console.warn("RESEND_API_KEY não configurada. Simulando envio de e-mail.");
      // Simulação para desenvolvimento
      for (const email of emailsToSend) {
        console.log(`--- SIMULATING EMAIL TO: ${email} ---`);
        console.log(`Subject: ${subject}`);
        console.log(`------------------------------------`);
      }
    } else {
        const response = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${resendApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: 'Calendário Salesiano <nao-responda@seu-dominio.com>', // Configure um domínio verificado no Resend
            to: emailsToSend, // Resend aceita um array de e-mails
            subject: subject,
            html: htmlContent,
          }),
        });

        if (!response.ok) {
          const errorBody = await response.json();
          console.error(`Falha ao enviar e-mails via Resend:`, errorBody);
          return new Response(JSON.stringify({ error: 'Failed to send emails', details: errorBody }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
        }
    }

    // --- FIM DA IMPLEMENTAÇÃO DO ENVIO ---

    await supabaseAdmin
      .from('activity_logs')
      .insert({
        user_id: user.id,
        user_name: body.userName,
        action: 'notification',
        target: 'event',
        target_id: body.eventId,
        description: `Enviou notificação por email sobre evento ${actionText[body.action]}: "${body.eventTitle}" para ${emailsToSend.length} usuários`
      })

    return new Response(JSON.stringify({ success: true, emailsSent: emailsToSend.length }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })

  } catch (error) {
    console.error('Error in send-event-notification function:', error)
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
  }
})
