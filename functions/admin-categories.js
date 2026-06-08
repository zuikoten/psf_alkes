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

export async function onRequestOptions() {
  return new Response(null, { status: 204 });
}

export async function onRequestGet(context) {
  const { env } = context;
  const res = await fetch(
    `${env.SUPABASE_URL}/rest/v1/kategori?select=*&order=id.asc`,
    { headers: dbHeaders(env.SUPABASE_ANON_KEY) }
  );
  const data = await res.json();
  return json({ data, success: true });
}

export async function onRequestPost(context) {
  const { request, env } = context;
  const { nama_kategori, deskripsi } = await request.json();

  const res = await fetch(`${env.SUPABASE_URL}/rest/v1/kategori`, {
    method: "POST",
    headers: { ...dbHeaders(env.SUPABASE_ANON_KEY), Prefer: "return=representation" },
    body: JSON.stringify({ nama_kategori, deskripsi }),
  });

  if (!res.ok) return json({ error: await res.text() }, res.status);
  return json({ data: await res.json(), success: true });
}

export async function onRequestPut(context) {
  const { request, env } = context;
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

export async function onRequestDelete(context) {
  const { request, env } = context;
  const { id } = await request.json();

  const res = await fetch(
    `${env.SUPABASE_URL}/rest/v1/kategori?id=eq.${id}`,
    { method: "DELETE", headers: dbHeaders(env.SUPABASE_ANON_KEY) }
  );

  if (!res.ok) return json({ error: await res.text() }, res.status);
  return json({ success: true });
}
