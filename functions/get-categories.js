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

    // Ambil semua kategori dengan count produk
    const { data, error } = await supabase
      .from("kategori")
      .select(`
        id,
        nama_kategori,
        produk:produk(count)
      `)
      .order("nama_kategori", { ascending: true });

    if (error) throw error;

    // Format data dan hitung jumlah produk
    const categoriesWithCount = (data || []).map(cat => ({
      id: cat.id,
      nama_kategori: cat.nama_kategori,
      produk_count: cat.produk?.[0]?.count || 0
    }));

    // Urutkan berdasarkan jumlah produk terbanyak
    const sortedCategories = categoriesWithCount.sort(
      (a, b) => b.produk_count - a.produk_count
    );

    return new Response(
      JSON.stringify({ 
        categories: sortedCategories, 
        success: true 
      }),
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