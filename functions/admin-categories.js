function dbHeaders(key) {
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

// ── FUNGSI HELPER: VALIDASI TOKEN KOBEI ────────────────────────────────
function checkAuth(request, env) {
  const tokenDariAdmin = request.headers.get("Authorization");
  if (!tokenDariAdmin || tokenDariAdmin !== env.ADMIN_PASSWORD) {
    return json({ error: "Akses Ditolak! Sesi tidak valid." }, 401);
  }
  return null; // Lolos validasi
}

export async function onRequestOptions() {
  return new Response(null, { status: 204 });
}

// ── GET ────────────────────────────────────────────────────────────────
export async function onRequestGet(context) {
  const { request, env } = context;

  // 1. Jalankan proteksi token
  const authError = checkAuth(request, env);
  if (authError) return authError;

  const res = await fetch(
    `${env.SUPABASE_URL}/rest/v1/kategori?select=*&order=id.asc`,
    { headers: dbHeaders(env.SUPABASE_ANON_KEY) }
  );
  const data = await res.json();
  return json({ data, success: true });
}

// ── POST ───────────────────────────────────────────────────────────────
export async function onRequestPost(context) {
  const { request, env } = context;

  // 2. Jalankan proteksi token
  const authError = checkAuth(request, env);
  if (authError) return authError;

  const { nama_kategori, deskripsi } = await request.json();

  const res = await fetch(`${env.SUPABASE_URL}/rest/v1/kategori`, {
    method: "POST",
    headers: { ...dbHeaders(env.SUPABASE_ANON_KEY), Prefer: "return=representation" },
    body: JSON.stringify({ nama_kategori, deskripsi }),
  });

  if (!res.ok) return json({ error: await res.text() }, res.status);
  return json({ data: await res.json(), success: true });
}

// ── PUT ────────────────────────────────────────────────────────────────
export async function onRequestPut(context) {
  const { request, env } = context;

  // 3. Jalankan proteksi token
  const authError = checkAuth(request, env);
  if (authError) return authError;

  const { id, nama_kategori, deskripsi } = await request.json();

  const res = await fetch(
    `${env.SUPABASE_URL}/rest/v1/kategori?id=eq.${id}`,
    {
      method: "PATCH",
      headers: dbHeaders(env.SUPABASE_ANON_KEY),
      body: JSON.stringify({ nama_kategori, deskripsi }),
    }
  );

  if (!res.ok) return json({ error: await res.text() }, res.status);
  return json({ success: true });
}

// ── DELETE ─────────────────────────────────────────────────────────────
export async function onRequestDelete(context) {
  const { request, env } = context;

  // 4. Jalankan proteksi token
  const authError = checkAuth(request, env);
  if (authError) return authError;

  const { id } = await request.json();

  const res = await fetch(
    `${env.SUPABASE_URL}/rest/v1/kategori?id=eq.${id}`,
    { method: "DELETE", headers: dbHeaders(env.SUPABASE_ANON_KEY) }
  );

  if (!res.ok) return json({ error: await res.text() }, res.status);
  return json({ success: true });
}