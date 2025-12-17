console.log('🔵 supabase-test.js cargado');

const SUPABASE_CONFIG = {
  URL: 'https://icszzxkdxatfytpmoviq.supabase.co',
  ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imljc3p6eGtkeGF0Znl0cG1vdmlxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI2Mzk2NjUsImV4cCI6MjA3ODIxNTY2NX0.hmQWNB3sCyBh39gdNgQLjjlIvliwJje-OYf0kkPObVA'
};

let supabase = null;

function initSupabase() {
  console.log('🔵 initSupabase() ejecutándose');

  if (supabase) {
    console.log('ℹ️ Supabase ya estaba inicializado');
    return true;
  }

  if (!window.supabase) {
    console.error('❌ Librería de Supabase no cargada');
    return false;
  }

  const supabaseLib = window.supabase;
  supabase = supabaseLib.createClient(SUPABASE_CONFIG.URL, SUPABASE_CONFIG.ANON_KEY);

  window.supabaseClient = supabase;
  window.supabase = supabase;

  console.log('✅ Supabase inicializado correctamente');
  return true;
}

console.log('🔵 Exponiendo initSupabase...');
window.initSupabase = initSupabase;
console.log('✅ window.initSupabase expuesto:', typeof window.initSupabase);
