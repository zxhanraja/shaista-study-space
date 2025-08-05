

import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types';

// The user's Supabase credentials, permanently set as requested.
const supabaseUrl = 'https://dudohlxazinpaatoyabn.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR1ZG9obHhhemlucGFhdG95YWJuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQzOTc2NTYsImV4cCI6MjA2OTk3MzY1Nn0.8onmCJ9HIMVnWD50Fka-NWymIQJlKeSCMPAHqKbrFq0';

// Create and export the Supabase client.
export const supabase = createClient<Database>(supabaseUrl, supabaseKey);