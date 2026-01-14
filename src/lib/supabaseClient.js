import { createClient } from '@supabase/supabase-js'

// TODO: Replace with your actual values from Supabase Settings > API
const PROJECT_URL = '****************'
const SUPABASE_KEY = '****************'

export const supabase = createClient(PROJECT_URL, SUPABASE_KEY)
