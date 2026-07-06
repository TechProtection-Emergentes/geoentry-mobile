import 'react-native-url-polyfill/auto'
import { createClient } from '@supabase/supabase-js'
import AsyncStorage from '@react-native-async-storage/async-storage'

const supabaseUrl = 'https://swdncevmrdcjgrgtkjkv.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN3ZG5jZXZtcmRjamdyZ3Rramt2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODMwMDA1MTMsImV4cCI6MjA5ODU3NjUxM30.0ELCmNd-ln5sPP403bROCGOk79wfiO0pnX-hu-mtha4'

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
})