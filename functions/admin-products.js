exports.handler = async (event, context) => {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: "Missing Supabase configuration" }),
    };
  }

  const method = event.httpMethod;

  // ── Header standar ────────────────────────────────────────────────────
  const dbHeaders = {
    apikey: supabaseAnonKey,
    Authorization: `Bearer ${supabaseAnonKey}`,
    "Content-Type": "application/json",
  };

  // ── Helper: ekstrak storage path dari public URL ──────────────────────
  // URL format: .../storage/v1/object/public/produk-images/filename.jpg
  // Path yang dibutuhkan Storage Delete API: produk-images/filename.jpg
  function extractStoragePath(url) {
    if (!url) return null;
    const marker = "/object/public/";
    const idx = url.indexOf(marker);
    if (idx === -1) return null;
    return url.slice(idx + marker.length); // "produk-images/filename.jpg"
  }

  // ── Helper: hapus file dari Supabase Storage ──────────────────────────
  // Storage Delete API menerima array of paths di body { prefixes: [...] }
  async function deleteStorageFile(gambarUrl) {
    const storagePath = extractStoragePath(gambarUrl);
    if (!storagePath) return; // bukan URL storage kita, skip

    // Ambil nama bucket (bagian pertama dari path)
    const bucketName = storagePath.split("/")[0]; // "produk-images"

    await fetch(`${supabaseUrl}/storage/v1/object/${bucketName}`, {
      method: "DELETE",
      headers: {
        apikey: supabaseAnonKey,
        Authorization: `Bearer ${supabaseAnonKey}`,
        "Content-Type": "application/json",
      },
      // API minta array of full paths termasuk bucket
      body: JSON.stringify({ prefixes: [storagePath] }),
    });
    // Kita tidak throw error di sini — kalau file sudah tidak ada pun tidak masalah
  }

  try {
    // ── GET — ambil produk dengan filter + paginasi ──────────────────
    if (method === "GET") {
      const params = event.queryStringParameters || {};

      // Fetch produk tunggal by id (untuk edit modal)
      if (params.id) {
        const res = await fetch(
          `${supabaseUrl}/rest/v1/produk?id=eq.${parseInt(params.id)}&select=*`,
          {
            headers: dbHeaders,
          },
        );
        const data = await res.json();
        return ok({ data, success: true });
      }

      const page = params.page ? Math.max(1, parseInt(params.page)) : 1;
      const limit = params.limit ? parseInt(params.limit) : 20;
      const search = params.search ? params.search.trim() : "";
      const kategori = params.kategori || "";
      const featured = params.featured || ""; // 'true' | '' (semua)

      const from = (page - 1) * limit;
      const to = from + limit - 1;

      // Supabase REST: bangun query string manual
      let qs = `select=*&order=is_featured.desc,nama.asc&offset=${from}&limit=${limit}`;

      // Prefer: count=exact supaya dapat header Content-Range
      if (search) qs += `&nama=ilike.*${encodeURIComponent(search)}*`;
      if (kategori && kategori !== "all")
        qs += `&kategori_id=eq.${parseInt(kategori)}`;
      if (featured === "true") qs += `&is_featured=eq.true`;

      const res = await fetch(`${supabaseUrl}/rest/v1/produk?${qs}`, {
        headers: { ...dbHeaders, Prefer: "count=exact" },
      });

      const data = await res.json();

      // Total dari header Content-Range: 0-19/153
      const contentRange = res.headers.get("content-range") || "";
      const total = parseInt(contentRange.split("/")[1]) || 0;
      const totalPages = Math.ceil(total / limit);

      return ok({
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

    // ── POST — tambah produk (tidak ada gambar lama) ──────────────────
    if (method === "POST") {
      const product = JSON.parse(event.body);
      const res = await fetch(`${supabaseUrl}/rest/v1/produk`, {
        method: "POST",
        headers: { ...dbHeaders, Prefer: "return=representation" },
        body: JSON.stringify(product),
      });
      const data = await res.json();
      return ok({ data, success: true });
    }

    // ── PUT — update produk, hapus gambar lama jika gambar diganti ────
    if (method === "PUT") {
      const { id, ...updates } = JSON.parse(event.body);

      // 1. Ambil gambar_url saat ini sebelum diupdate
      const current = await fetch(
        `${supabaseUrl}/rest/v1/produk?id=eq.${id}&select=gambar_url`,
        { headers: dbHeaders },
      );
      const [currentProduct] = await current.json();
      const oldUrl = currentProduct?.gambar_url || null;

      // 2. Update row di database
      await fetch(`${supabaseUrl}/rest/v1/produk?id=eq.${id}`, {
        method: "PATCH",
        headers: dbHeaders,
        body: JSON.stringify(updates),
      });

      // 3. Hapus gambar lama dari storage HANYA jika:
      //    - ada gambar lama
      //    - gambar baru berbeda dari gambar lama (benar-benar diganti)
      const newUrl = updates.gambar_url || null;
      if (oldUrl && newUrl && oldUrl !== newUrl) {
        await deleteStorageFile(oldUrl);
      }

      return ok({ success: true });
    }

    // ── DELETE — hapus produk + hapus gambarnya dari storage ─────────
    if (method === "DELETE") {
      const { id } = JSON.parse(event.body);

      // 1. Ambil gambar_url sebelum row dihapus
      const current = await fetch(
        `${supabaseUrl}/rest/v1/produk?id=eq.${id}&select=gambar_url`,
        { headers: dbHeaders },
      );
      const [currentProduct] = await current.json();
      const gambarUrl = currentProduct?.gambar_url || null;

      // 2. Hapus row dari database
      await fetch(`${supabaseUrl}/rest/v1/produk?id=eq.${id}`, {
        method: "DELETE",
        headers: dbHeaders,
      });

      // 3. Hapus file dari storage
      if (gambarUrl) {
        await deleteStorageFile(gambarUrl);
      }

      return ok({ success: true });
    }

    return {
      statusCode: 405,
      body: JSON.stringify({ error: "Method not allowed" }),
    };
  } catch (error) {
    console.error("Error:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};

function ok(body) {
  return {
    statusCode: 200,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  };
}
