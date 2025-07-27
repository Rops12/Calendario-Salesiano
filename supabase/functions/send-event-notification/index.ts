// supabase/functions/send-event-notification/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// ... (cabeçalhos CORS e interface permanecem os mesmos) ...

serve(async (req) => {
  // ... (a lógica inicial de verificação de permissão permanece a mesma) ...

  try {
    // ... (código para criar supabaseAdmin, verificar token e permissões) ...

    const body: EmailNotificationRequest = await req.json();
    const { data: users, error: usersError } = await supabaseAdmin
      .from('profiles')
      .select('email')
      .not('email', 'is', null);

    // ... (lógica para obter categoryLabel e criar o conteúdo do e-mail) ...
    const subject = `Calendário Salesiano - Evento ...`;
    const htmlContent = `...`; // O HTML do seu e-mail

    // --- BLOCO DE CÓDIGO ATUALIZADO ---
    const resendApiKey = Deno.env.get('RESEND_API_KEY');

    if (!resendApiKey) {
      console.error("RESEND_API_KEY não está configurada nos segredos da função.");
      return new Response(JSON.stringify({ error: 'Configuração de envio de e-mail incompleta no servidor.' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const emailsToSend = users.map(u => u.email).filter(Boolean);
    if (emailsToSend.length > 0) {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${resendApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          // IMPORTANTE: Altere para o seu e-mail de domínio verificado no Resend
          from: 'Calendário Salesiano <nao-responda@seu-dominio-verificado.com>',
          to: emailsToSend, // Resend aceita um array de destinatários
          subject: subject,
          html: htmlContent,
        }),
      });

      if (!response.ok) {
        const errorBody = await response.json();
        console.error(`Falha ao enviar e-mails via Resend:`, errorBody);
      }
    }
    // --- FIM DO BLOCO DE CÓDIGO ATUALIZADO ---

    // ... (o restante da função para registrar o log de atividade permanece o mesmo) ...

    return new Response(
      JSON.stringify({ success: true, emailsSent: emailsToSend.length }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    // ... (bloco catch permanece o mesmo) ...
  }
})
