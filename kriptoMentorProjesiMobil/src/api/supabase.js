// src/api/supabase.js
import { createClient } from '@supabase/supabase-js';

// Bunları kendi Supabase projenize ait URL ve anon key ile değiştirin:
const SUPABASE_URL = 'https://wkhkgjuqlwzjavnqzobr.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndraGtnanVxbHd6amF2bnF6b2JyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDUyNDI1MDcsImV4cCI6MjA2MDgxODUwN30.ffvcK39MErJ6vJBmK4eMD6UUo7O-RyP8-OPVgH2uK_Y';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
