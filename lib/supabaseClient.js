import { createClient } from '@supabase/supabase-js'

const supabaseUrl = "https://ysjmlitjykghxpywumtj.supabase.co"
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlzam1saXRqeWtnaHhweXd1bXRqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcxMzIzNTgsImV4cCI6MjA3MjcwODM1OH0.sNxOVuyOgUphBicL0mmxgXUgcmyFQYKU3vJFq8fQnWs"

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
