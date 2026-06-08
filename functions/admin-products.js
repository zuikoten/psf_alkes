function makeDbHeaders(key) {
  return {
    apikey: key,
    Authorization: `Bearer ${key}`,
    "Content-Type": "application/json",
  };
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function extractStoragePath(url) {
  if (!url) return null;
  const marker = "/object/public/";
  const idx = url.indexOf(marker);
  if (idx === -1) return null;
  return url.slice(idx + marker.length);
}

async function deleteStorageFile(supabaseUrl, key, gambarUrl) {
  const storagePath = extractStoragePath(gambarUrl);
  if (!storagePath) return;
  const bucketName = storagePath.split("/")[0];
  await fetch(`${supabaseUrl}/storage/v1/object/${bucketName}`, {
    method: "DELETE",
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ prefixes: [storagePath] }),
  });
}

export async function onRequestOptions() {
  return new Response(null, { status: 204 });
}

// ── GET ────────────────────────────────────────────────────────────────
export async function onRequestGet(context) {
  const { request, env } = context;
  const headers = makeDbHeaders(env.SUPABASE_ANON_KEY);
  const { searchParams } = new URL(request.url);

  // Fetch single produk by id
  if (searchParams.get("id")) {
    const res = await fetch(
      `${env.SUPABASE_URL}/rest/v1/produk?id=eq.${parseInt(searchParams.get("id"))}&select=*`,
      { headers }
    );
    return json({ data: await res.json(), success: true });
  }

  const page     = searchParams.get("page")     ? Math.max(1, parseInt(searchParams.get("page"))) : 1;
  const limit    = searchParams.get("limit")    ? parseInt(searchParams.get("limit")) : 20;
  const search   = searchParams.get("search")   ? searchParams.get("search").trim() : "";
  const kategori = searchParams.get("kategori") || "";
  const featured = searchParams.get("featured") || "";
  const from     = (page - 1) * limit;

  let qs = `select=*&order=is_featured.desc,nama.asc&offset=${from}&limit=${limit}`;
  if (search)                            qs += `&nama=ilike.*${encodeURIComponent(search)}*`;
  if (kategori && kategori !== "all")    qs += `&kategori_id=eq.${parseInt(kategori)}`;
  if (featured === "true")               qs += `&is_featured=eq.true`;

  const res = await fetch(`${env.SUPABASE_URL}/rest/v1/produk?${qs}`, {
    headers: { ...headers, Prefer: "count=exact" },
  });

  const data         = await res.json();
  const contentRange = res.headers.get("content-range") || "";
  const total        = parseInt(contentRange.split("/")[1]) || 0;
  const totalPages   = Math.ceil(total / limit);

  return json({
    data, success: true,
    pagination: { page, limit, total, totalPages, hasNext: page < totalPages, hasPrev: page > 1 },
  });
}

// ── POST ───────────────────────────────────────────────────────────────
export async function onRequestPost(context) {
  const { request, env } = context;
  const headers = makeDbHeaders(env.SUPABASE_ANON_KEY);
  const product = await request.json();

  const res = await fetch(`${env.SUPABASE_URL}/rest/v1/produk`, {
    method: "POST",
    headers: { ...headers, Prefer: "return=representation" },
    body: JSON.stringify(product),
  });
  return json({ data: await res.json(), success: true });
}

// ── PUT ────────────────────────────────────────────────────────────────
export async function onRequestPut(context) {
  const { request, env } = context;
  const headers = makeDbHeaders(env.SUPABASE_ANON_KEY);
  const { id, ...updates } = await request.json();

  // Ambil gambar lama
  const current = await fetch(
    `${env.SUPABASE_URL}/rest/v1/produk?id=eq.${id}&select=gambar_url`,
    { headers }
  );
  const [currentProduct] = await current.json();
  const oldUrl = currentProduct?.gambar_url || null;

  // Update row
  await fetch(`${env.SUPABASE_URL}/rest/v1/produk?id=eq.${id}`, {
    method: "PATCH",
    headers,
    body: JSON.stringify(updates),
  });

  // Hapus gambar lama jika diganti
  const newUrl = updates.gambar_url || null;
  if (oldUrl && newUrl && oldUrl !== newUrl) {
    await deleteStorageFile(env.SUPABASE_URL, env.SUPABASE_ANON_KEY, oldUrl);
  }

  return json({ success: true });
}

// ── DELETE ─────────────────────────────────────────────────────────────
export async function onRequestDelete(context) {
  const { request, env } = context;
  const headers = makeDbHeaders(env.SUPABASE_ANON_KEY);
  const { id } = await request.json();

  // Ambil gambar sebelum hapus
  const current = await fetch(
    `${env.SUPABASE_URL}/rest/v1/produk?id=eq.${id}&select=gambar_url`,
    { headers }
  );
  const [currentProduct] = await current.json();
  const gambarUrl = currentProduct?.gambar_url || null;

  // Hapus row
  await fetch(`${env.SUPABASE_URL}/rest/v1/produk?id=eq.${id}`, {
    method: "DELETE",
    headers,
  });

  if (gambarUrl) {
    await deleteStorageFile(env.SUPABASE_URL, env.SUPABASE_ANON_KEY, gambarUrl);
  }

  return json({ success: true });
}
