const SUPABASE_URL = "https://mndbqzoazrejiuciyodq.supabase.co";

const SUPABASE_ANON_KEY = "sb_publishable_MJkSCTPIfZIrZPJZuxKmwA_YWEt4Bgi";

// Création de notre client Supabase
window.supabaseClient = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY,
);

console.log("✅ Supabase connecté :", window.supabaseClient);
