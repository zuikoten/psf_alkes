import { createClient } from "@supabase/supabase-js";

const corsHeaders = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*",
};

export async function onRequestOptions() {
  return new Response(null, { status: 204, headers: corsHeaders });
}

export async function onRequestGet(context) {
  const { env } = context;
  const supabaseUrl = env.SUPABASE_URL;
  const supabaseAnonKey = env.SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return new Response(
      JSON.stringify({ error: "Konfigurasi Supabase tidak ditemukan" }),
      { status: 500, headers: corsHeaders }
    );
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    const { data, error } = await supabase
      .from("kategori")
      .select("id, nama_kategori")
      .order("nama_kategori", { ascending: true });

    if (error) throw error;

    return new Response(
      JSON.stringify({ categories: data || [], success: true }),
      { status: 200, headers: corsHeaders }
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: error.message, success: false }),
      { status: 500, headers: corsHeaders }
    );
  }
}
