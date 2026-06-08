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

    // ── Helper: ekstrak storage path dari public URL ──────────────────
    function extractStoragePath(url) {
      if (!url) return null;
      const marker = "/object/public/";
      const idx = url.indexOf(marker);
      if (idx === -1) return null;
      return url.slice(idx + marker.length); // "produk-images/filename.jpg"
    }

    // ── Helper: hapus file dari Supabase Storage ──────────────────────
    async function deleteStorageFile(gambarUrl) {
      const storagePath = extractStoragePath(gambarUrl);
      if (!storagePath) return;

      const bucketName = storagePath.split("/")[0]; // "produk-images"

      await fetch(`${supabaseUrl}/storage/v1/object/${bucketName}`, {
        method: "DELETE",
        headers: {
          apikey: supabaseAnonKey,
          Authorization: `Bearer ${supabaseAnonKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prefixes: [storagePath] }),
      });
    }

    try {
      // ── GET ──────────────────────────────────────────────────────────
      if (method === "GET") {
        const { searchParams } = new URL(request.url);

        // Fetch produk tunggal by id (untuk edit modal)
        if (searchParams.get("id")) {
          const res = await fetch(
            `${supabaseUrl}/rest/v1/produk?id=eq.${parseInt(searchParams.get("id"))}&select=*`,
            { headers: dbHeaders }
          );
          const data = await res.json();
          return json({ data, success: true });
        }

        const page     = searchParams.get("page")     ? Math.max(1, parseInt(searchParams.get("page"))) : 1;
        const limit    = searchParams.get("limit")    ? parseInt(searchParams.get("limit")) : 20;
        const search   = searchParams.get("search")   ? searchParams.get("search").trim() : "";
        const kategori = searchParams.get("kategori") || "";
        const featured = searchParams.get("featured") || "";

        const from = (page - 1) * limit;

        let qs = `select=*&order=is_featured.desc,nama.asc&offset=${from}&limit=${limit}`;
        if (search)   qs += `&nama=ilike.*${encodeURIComponent(search)}*`;
        if (kategori && kategori !== "all") qs += `&kategori_id=eq.${parseInt(kategori)}`;
        if (featured === "true") qs += `&is_featured=eq.true`;

        const res = await fetch(`${supabaseUrl}/rest/v1/produk?${qs}`, {
          headers: { ...dbHeaders, Prefer: "count=exact" },
        });

        const data = await res.json();

        const contentRange = res.headers.get("content-range") || "";
        const total = parseInt(contentRange.split("/")[1]) || 0;
        const totalPages = Math.ceil(total / limit);

        return json({
          data,
          success: true,
          pagination: {
            page,
            limit,
            total,
            totalPages,
            hasNext: page < totalPages,
            hasPrev: page > 1,
          },
        });
      }

      // ── POST ─────────────────────────────────────────────────────────
      if (method === "POST") {
        const product = await request.json();
        const res = await fetch(`${supabaseUrl}/rest/v1/produk`, {
          method: "POST",
          headers: { ...dbHeaders, Prefer: "return=representation" },
          body: JSON.stringify(product),
        });
        const data = await res.json();
        return json({ data, success: true });
      }

      // ── PUT ──────────────────────────────────────────────────────────
      if (method === "PUT") {
        const { id, ...updates } = await request.json();

        // Ambil gambar lama sebelum update
        const current = await fetch(
          `${supabaseUrl}/rest/v1/produk?id=eq.${id}&select=gambar_url`,
          { headers: dbHeaders }
        );
        const [currentProduct] = await current.json();
        const oldUrl = currentProduct?.gambar_url || null;

        // Update row
        await fetch(`${supabaseUrl}/rest/v1/produk?id=eq.${id}`, {
          method: "PATCH",
          headers: dbHeaders,
          body: JSON.stringify(updates),
        });

        // Hapus gambar lama hanya jika diganti dengan yang baru
        const newUrl = updates.gambar_url || null;
        if (oldUrl && newUrl && oldUrl !== newUrl) {
          await deleteStorageFile(oldUrl);
        }

        return json({ success: true });
      }

      // ── DELETE ───────────────────────────────────────────────────────
      if (method === "DELETE") {
        const { id } = await request.json();

        // Ambil gambar sebelum row dihapus
        const current = await fetch(
          `${supabaseUrl}/rest/v1/produk?id=eq.${id}&select=gambar_url`,
          { headers: dbHeaders }
        );
        const [currentProduct] = await current.json();
        const gambarUrl = currentProduct?.gambar_url || null;

        // Hapus row
        await fetch(`${supabaseUrl}/rest/v1/produk?id=eq.${id}`, {
          method: "DELETE",
          headers: dbHeaders,
        });

        // Hapus file dari storage
        if (gambarUrl) await deleteStorageFile(gambarUrl);

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
