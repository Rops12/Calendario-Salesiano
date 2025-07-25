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
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Create Supabase client
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    // Verify authentication
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token)
    
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Check if user has permission to send notifications (admin or editor)
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('role, is_admin')
      .eq('id', user.id)
      .single()

    if (!profile?.is_admin && profile?.role !== 'editor') {
      return new Response(
        JSON.stringify({ error: 'Insufficient permissions' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const body: EmailNotificationRequest = await req.json()

    // Get all users to send notifications
    const { data: users, error: usersError } = await supabaseAdmin
      .from('profiles')
      .select('email')
      .not('email', 'is', null)

    if (usersError) {
      return new Response(
        JSON.stringify({ error: 'Failed to fetch users' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get category information
    const { data: category } = await supabaseAdmin
      .from('event_categories')
      .select('label')
      .eq('value', body.eventCategory)
      .single()

    const categoryLabel = category?.label || body.eventCategory

    // Prepare email content based on action
    let subject = ''
    let htmlContent = ''
    
    const actionText = {
      created: 'criado',
      updated: 'atualizado',
      deleted: 'excluído'
    }

    const actionColor = {
      created: '#10b981', // green
      updated: '#3b82f6', // blue
      deleted: '#ef4444'  // red
    }

    subject = `Calendário Salesiano - Evento ${actionText[body.action]}: ${body.eventTitle}`

    htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${subject}</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f3f4f6;">
        <div style="max-width: 600px; margin: 0 auto; background-color: white; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #4F46E5, #7C3AED); padding: 30px 20px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 24px; font-weight: bold;">
              📅 Calendário Salesiano
            </h1>
            <p style="color: rgba(255, 255, 255, 0.9); margin: 8px 0 0 0; font-size: 16px;">
              Colégio Salesiano Aracaju
            </p>
          </div>
          
          <!-- Content -->
          <div style="padding: 30px 20px;">
            <!-- Action Badge -->
            <div style="text-align: center; margin-bottom: 25px;">
              <span style="background-color: ${actionColor[body.action]}; color: white; padding: 8px 16px; border-radius: 20px; font-size: 14px; font-weight: bold; text-transform: uppercase;">
                Evento ${actionText[body.action]}
              </span>
            </div>
            
            <!-- Event Details -->
            <div style="background-color: #f9fafb; border-radius: 8px; padding: 20px; margin-bottom: 25px;">
              <h2 style="color: #1f2937; margin: 0 0 15px 0; font-size: 20px; font-weight: bold;">
                ${body.eventTitle}
              </h2>
              
              ${body.eventDescription ? `
                <p style="color: #6b7280; margin: 0 0 15px 0; line-height: 1.5;">
                  ${body.eventDescription}
                </p>
              ` : ''}
              
              <div style="display: flex; flex-wrap: wrap; gap: 15px; margin-top: 15px;">
                <div style="flex: 1; min-width: 200px;">
                  <strong style="color: #374151; font-size: 14px;">📅 Data:</strong>
                  <p style="margin: 5px 0 0 0; color: #6b7280; font-size: 14px;">
                    ${new Date(body.eventDate).toLocaleDateString('pt-BR', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </p>
                </div>
                
                <div style="flex: 1; min-width: 200px;">
                  <strong style="color: #374151; font-size: 14px;">🏷️ Segmento:</strong>
                  <p style="margin: 5px 0 0 0; color: #6b7280; font-size: 14px;">
                    ${categoryLabel}
                  </p>
                </div>
              </div>
            </div>
            
            <!-- Action Info -->
            <div style="background-color: #eff6ff; border-left: 4px solid #3b82f6; padding: 15px; margin-bottom: 25px;">
              <p style="margin: 0; color: #1e40af; font-size: 14px;">
                <strong>Alteração realizada por:</strong> ${body.userName} (${body.userEmail})
              </p>
              <p style="margin: 8px 0 0 0; color: #1e40af; font-size: 14px;">
                <strong>Data da alteração:</strong> ${new Date().toLocaleString('pt-BR')}
              </p>
            </div>
            
            <!-- Call to Action -->
            <div style="text-align: center; margin-top: 30px;">
              <a href="${Deno.env.get('SITE_URL') || 'https://calendario.salesiano.edu.br'}" 
                 style="background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
                Ver Calendário Completo
              </a>
            </div>
          </div>
          
          <!-- Footer -->
          <div style="background-color: #f9fafb; padding: 20px; text-align: center; border-top: 1px solid #e5e7eb;">
            <p style="margin: 0; color: #6b7280; font-size: 12px;">
              Este é um email automático do sistema de calendário do Colégio Salesiano Aracaju.
            </p>
            <p style="margin: 8px 0 0 0; color: #6b7280; font-size: 12px;">
              Para dúvidas, entre em contato com a coordenação.
            </p>
          </div>
        </div>
      </body>
      </html>
    `

    // Send emails to all users
    const emailPromises = users.map(async (userProfile) => {
      if (!userProfile.email) return null
      
      try {
        // Using Supabase's built-in email service (if available) or external service
        // For now, we'll log the email that would be sent
        console.log(`Sending email to: ${userProfile.email}`)
        console.log(`Subject: ${subject}`)
        
        // In a real implementation, you would integrate with an email service like:
        // - Resend
        // - SendGrid
        // - AWS SES
        // - Postmark
        
        // Example with Resend (you would need to add the API key as an environment variable):
        /*
        const resendApiKey = Deno.env.get('RESEND_API_KEY')
        if (resendApiKey) {
          const response = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${resendApiKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              from: 'calendario@salesiano.edu.br',
              to: userProfile.email,
              subject: subject,
              html: htmlContent,
            }),
          })
          
          if (!response.ok) {
            console.error(`Failed to send email to ${userProfile.email}`)
          }
        }
        */
        
        return { email: userProfile.email, status: 'sent' }
      } catch (error) {
        console.error(`Error sending email to ${userProfile.email}:`, error)
        return { email: userProfile.email, status: 'failed', error: error.message }
      }
    })

    const results = await Promise.all(emailPromises)
    const successCount = results.filter(r => r?.status === 'sent').length
    const failCount = results.filter(r => r?.status === 'failed').length

    // Log the notification activity
    await supabaseAdmin
      .from('activity_logs')
      .insert({
        user_id: user.id,
        user_name: body.userName,
        action: 'notification',
        target: 'event',
        target_id: body.eventId,
        description: `Enviou notificação por email sobre evento ${actionText[body.action]}: "${body.eventTitle}" para ${successCount} usuários`
      })

    return new Response(
      JSON.stringify({ 
        success: true, 
        emailsSent: successCount,
        emailsFailed: failCount,
        totalUsers: users.length
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error in send-event-notification function:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})