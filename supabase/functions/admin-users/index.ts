import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

interface CreateUserRequest {
  name: string;
  email: string;
  role: 'admin' | 'editor' | 'viewer';
}

interface UpdateUserRequest {
  id: string;
  name?: string;
  email?: string;
  role?: 'admin' | 'editor' | 'viewer';
}

interface DeleteUserRequest {
  id: string;
}

interface ResetPasswordRequest {
  email: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Create Supabase client with service role key
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

    // Verify the request is from an authenticated admin user
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Verify user is admin
    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token)
    
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Check if user is admin
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('role, is_admin')
      .eq('id', user.id)
      .single()

    if (!profile?.is_admin || profile?.role !== 'admin') {
      return new Response(
        JSON.stringify({ error: 'Insufficient permissions' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const url = new URL(req.url)
    const action = url.searchParams.get('action')

    switch (action) {
      case 'create': {
        const body: CreateUserRequest = await req.json()
        
        // Create user in auth
        const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
          email: body.email,
          password: 'temp123456', // Temporary password
          email_confirm: true
        })

        if (authError) {
          return new Response(
            JSON.stringify({ error: `Erro ao criar usuário: ${authError.message}` }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        if (!authData.user) {
          return new Response(
            JSON.stringify({ error: 'Falha ao criar usuário' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        // Update profile with name
        const { data: profileData, error: profileError } = await supabaseAdmin
          .from('profiles')
          .update({
            name: body.name, // CORREÇÃO AQUI
            email: body.email,
            role: body.role,
            is_admin: body.role === 'admin'
          })
          .eq('id', authData.user.id)
          .select()
          .single()

        if (profileError) {
          // Cleanup: delete the auth user if profile creation fails
          await supabaseAdmin.auth.admin.deleteUser(authData.user.id)
          return new Response(
            JSON.stringify({ error: `Erro ao criar perfil: ${profileError.message}` }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        // Send password reset email
        await supabaseAdmin.auth.resetPasswordForEmail(body.email, {
          redirectTo: `${req.headers.get('origin')}/reset-password`
        })

        return new Response(
          JSON.stringify({
            user: {
              id: authData.user.id,
              name: body.name,
              email: body.email,
              role: body.role,
              createdAt: profileData.created_at,
              updatedAt: profileData.updated_at
            }
          }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      case 'update': {
        const body: UpdateUserRequest = await req.json()
        
        const updateData: any = {}
        if (body.name) updateData.name = body.name; // CORREÇÃO AQUI
        if (body.email) updateData.email = body.email;
        if (body.role) {
          updateData.role = body.role
          updateData.is_admin = body.role === 'admin'
        }
        updateData.updated_at = new Date().toISOString()
        
        const { error } = await supabaseAdmin
          .from('profiles')
          .update(updateData)
          .eq('id', body.id)
        
        if (error) {
          return new Response(
            JSON.stringify({ error: error.message }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        // Update auth email if changed
        if (body.email) {
          await supabaseAdmin.auth.admin.updateUserById(body.id, {
            email: body.email
          })
        }

        return new Response(
          JSON.stringify({ success: true }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      case 'delete': {
        const body: DeleteUserRequest = await req.json()
        
        const { error } = await supabaseAdmin.auth.admin.deleteUser(body.id)
        
        if (error) {
          return new Response(
            JSON.stringify({ error: `Erro ao deletar usuário: ${error.message}` }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        return new Response(
          JSON.stringify({ success: true }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      case 'reset-password': {
        const body: ResetPasswordRequest = await req.json()
        
        const { error } = await supabaseAdmin.auth.resetPasswordForEmail(body.email, {
          redirectTo: `${req.headers.get('origin')}/reset-password`
        })
        
        if (error) {
          return new Response(
            JSON.stringify({ error: `Erro ao enviar email de redefinição: ${error.message}` }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        return new Response(
          JSON.stringify({ success: true }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      default:
        return new Response(
          JSON.stringify({ error: 'Invalid action' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
    }

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
