import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // Gestion du CORS (Preflight)

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { demandeId } = await req.json()
    
    // 1. Initialisation des clients Supabase
    // Client Admin (Service Role) pour les opérations privilégiées
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { autoRefreshToken: false, persistSession: false } }
    )

    // Client pour vérifier l'identité de l'appelant
    const authHeader = req.headers.get('Authorization')!
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    )

    // 2. Vérification de l'identité de l'utilisateur
    const { data: { user: currentUser }, error: authError } = await supabaseClient.auth.getUser()
    if (authError || !currentUser) {
      console.error('[AUTH ERROR]', authError)
      return new Response(JSON.stringify({ error: 'Non authentifié' }), { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 401 
      })
    }

    // 3. Vérification du rôle via le client Admin (pour éviter les problèmes de RLS sur user_roles)
    const { data: roleData, error: roleError } = await supabaseAdmin
      .from('user_roles')
      .select('role')
      .eq('user_id', currentUser.id)
      .single()

    if (roleError || !roleData || (roleData.role !== 'admin' && roleData.role !== 'super_admin')) {
      console.error('[ROLE ERROR]', roleError || 'Not an admin')
      return new Response(JSON.stringify({ error: 'Action réservée aux administrateurs' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 403
      })
    }

    // 4. Récupération de la demande


    const { data: demande, error: fetchError } = await supabaseAdmin
      .from('demandes')
      .select('*')
      .eq('id', demandeId)
      .single()

    if (fetchError || !demande) throw new Error('Demande introuvable')
    if (demande.status === 'validated') throw new Error('Cette demande est déjà validée')

    console.log(`[APPROVAL] Création du compte pour ${demande.email}...`)

    // 4. Création du compte Auth (CONFIRMÉ AUTOMATIQUEMENT)
    const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email: demande.email,
      password: demande.password_temp,
      email_confirm: true,
      user_metadata: { 
        first_name: demande.first_name, 
        last_name: demande.last_name 
      }
    })

    if (createError) throw createError
    if (!newUser?.user) throw new Error('Échec de la création de l\'utilisateur Auth')

    const userId = newUser.user.id


    // 5. Synchronisation des tables métier
    // Profil
    await supabaseAdmin.from('profiles').upsert({
      user_id: userId,
      first_name: demande.first_name,
      last_name: demande.last_name,
      status: 'active'
    })

    // Rôle
    await supabaseAdmin.from('user_roles').upsert({
      user_id: userId,
      role: 'member'
    })

    // Membre
    await supabaseAdmin.from('members').insert({
      user_id: userId,
      first_name: demande.first_name,
      last_name: demande.last_name,
      email: demande.email,
      status: 'active'
    })

    // 6. Mise à jour finale de la demande
    await supabaseAdmin.from('demandes')
      .update({ 
        status: 'validated', 
        user_id: userId,
        password_temp: null // Sécurité : on efface le mot de passe temporaire
      })
      .eq('id', demandeId)

    return new Response(JSON.stringify({ success: true, userId }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (error: any) {
    console.error('[ERROR]', error.message)
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
