import { createClient } from "@supabase/supabase-js";

const corsHeaders = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*",
};

export async function onRequestOptions() {
  return new Response(null, { status: 204, headers: corsHeaders });
}

export async function onRequestGet(context) {
  const { request, env } = context;
  const supabaseUrl = env.SUPABASE_URL;
  const supabaseAnonKey = env.SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return new Response(
      JSON.stringify({ error: "Konfigurasi Supabase tidak ditemukan." }),
      { status: 500, headers: corsHeaders }
    );
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    const { searchParams } = new URL(request.url);

    const mode       = searchParams.get("mode")     || "default";
    const limitParam = searchParams.get("limit")    ? parseInt(searchParams.get("limit")) : null;
    const page       = searchParams.get("page")     ? Math.max(1, parseInt(searchParams.get("page"))) : 1;
    const search     = searchParams.get("search")   ? searchParams.get("search").trim() : "";
    const kategoriId = searchParams.get("kategori") || null;

    // ── terbaru ──────────────────────────────────────────────────────
    if (mode === "terbaru") {
      const limit = limitParam || 6;
      const { data, error } = await supabase
        .from("produk").select("*")
        .order("created_at", { ascending: false }).limit(limit);
      if (error) throw error;
      return respond({ data, success: true });
    }

    // ── unggulan ─────────────────────────────────────────────────────
    if (mode === "unggulan") {
      const limit = limitParam || 4;
      const { data, error } = await supabase
        .from("produk").select("*")
        .eq("is_featured", true)
        .order("created_at", { ascending: false }).limit(limit);
      if (error) throw error;
      return respond({ data, success: true });
    }

    // ── katalog ──────────────────────────────────────────────────────
    if (mode === "katalog") {
      const limit = limitParam || 12;
      const from  = (page - 1) * limit;
      const to    = from + limit - 1;

      let query = supabase
        .from("produk").select("*", { count: "exact" })
        .order("created_at", { ascending: false }).range(from, to);

      if (search)                            query = query.ilike("nama", `%${search}%`);
      if (kategoriId && kategoriId !== "all") query = query.eq("kategori_id", parseInt(kategoriId));

      const { data, error, count } = await query;
      if (error) throw error;

      const totalPages = Math.ceil((count || 0) / limit);
      return respond({
        data, success: true,
        pagination: { page, limit, total: count || 0, totalPages, hasNext: page < totalPages, hasPrev: page > 1 },
      });
    }

    // ── detail ───────────────────────────────────────────────────────
    if (mode === "detail") {
      const id = parseInt(searchParams.get("id"));
      if (!id || isNaN(id)) return respond({ data: null, success: false, error: "ID produk tidak valid" });

      const { data, error } = await supabase
        .from("produk").select("*, kategori(nama_kategori)")
        .eq("id", id).single();

      if (error) return respond({ data: null, success: false, error: "Produk tidak ditemukan" });
      return respond({ data, success: true });
    }

    // ── default / legacy ─────────────────────────────────────────────
    let query = supabase.from("produk").select("*").order("created_at", { ascending: false });
    if (limitParam && !isNaN(limitParam)) query = query.limit(limitParam);
    const { data, error } = await query;
    if (error) throw error;
    return respond({ data, success: true });

  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: error.message, success: false }),
      { status: 500, headers: corsHeaders }
    );
  }
}

function respond(body) {
  return new Response(JSON.stringify(body), { status: 200, headers: corsHeaders });
}
