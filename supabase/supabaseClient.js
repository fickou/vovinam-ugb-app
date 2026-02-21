import { createClient } from '@supabase/supabase-js'

const supabaseUrl = "https://uypdxhlbimxppqwpmhrj.supabase.co"
const supabaseKey = "sb_publishable_uIGaNyUU4JglGRMYQbTKTQ_nV25BdF_"

export const supabase = createClient(supabaseUrl, supabaseKey)
