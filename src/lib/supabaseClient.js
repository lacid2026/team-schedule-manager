import { createClient } from '@supabase/supabase-js'

// TODO: Replace with your actual values from Supabase Settings > API
const PROJECT_URL = 'https://eagpbukywqlewdgotqxp.supabase.co'
const SUPABASE_KEY = 'sb_publishable_Twy3-AOVCQUdiMjAZETPfw_ZmNxEave'

export const supabase = createClient(PROJECT_URL, SUPABASE_KEY)
