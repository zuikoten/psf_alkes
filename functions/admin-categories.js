export default {
  async fetch(request, env) {
    const supabaseUrl = env.SUPABASE_URL;
    const supabaseAnonKey = env.SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      return json({ error: "Missing Supabase configuration" }, 500);
    }

    const method = request.method;

    // Handle CORS preflight
    if (method === "OPTIONS") {
      return new Response(null, { status: 204 });
    }

    const dbHeaders = {
      apikey: supabaseAnonKey,
      Authorization: `Bearer ${supabaseAnonKey}`,
      "Content-Type": "application/json",
    };

    try {
      // GET — ambil semua kategori
      if (method === "GET") {
        const res = await fetch(
          `${supabaseUrl}/rest/v1/kategori?select=*&order=id.asc`,
          { headers: dbHeaders }
        );
        const data = await res.json();
        return json({ data, success: true });
      }

      // POST — tambah kategori
      if (method === "POST") {
        const { nama_kategori, deskripsi } = await request.json();
        const res = await fetch(`${supabaseUrl}/rest/v1/kategori`, {
          method: "POST",
          headers: { ...dbHeaders, Prefer: "return=representation" },
          body: JSON.stringify({ nama_kategori, deskripsi }),
        });

        if (!res.ok) {
          const errText = await res.text();
          return json({ error: `Supabase error: ${errText}` }, res.status);
        }

        const data = await res.json();
        return json({ data, success: true });
      }

      // PUT — update kategori
      if (method === "PUT") {
        const { id, nama_kategori, deskripsi } = await request.json();
        const res = await fetch(
          `${supabaseUrl}/rest/v1/kategori?id=eq.${id}`,
          {
            method: "PATCH",
            headers: dbHeaders,
            body: JSON.stringify({ nama_kategori, deskripsi }),
          }
        );

        if (!res.ok) {
          const errText = await res.text();
          return json({ error: `Supabase error: ${errText}` }, res.status);
        }

        return json({ success: true });
      }

      // DELETE — hapus kategori
      if (method === "DELETE") {
        const { id } = await request.json();
        const res = await fetch(
          `${supabaseUrl}/rest/v1/kategori?id=eq.${id}`,
          { method: "DELETE", headers: dbHeaders }
        );

        if (!res.ok) {
          const errText = await res.text();
          return json({ error: `Supabase error: ${errText}` }, res.status);
        }

        return json({ success: true });
      }

      return json({ error: "Method not allowed" }, 405);
    } catch (error) {
      console.error("Error:", error);
      return json({ error: error.message }, 500);
    }
  },
};

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}
