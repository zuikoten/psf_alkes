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

export async function onRequestPost(context) {
  const { request, env } = context;

  // 1. JALANKAN PROTEKSI TOKEN DI BARIS PERTAMA
  const authError = checkAuth(request, env);
  if (authError) return authError;

  const supabaseUrl = env.SUPABASE_URL;
  const supabaseAnonKey = env.SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return json({ error: "Missing Supabase configuration" }, 500);
  }

  try {
    const { file, fileName } = await request.json();

    // Cloudflare tidak punya Buffer — decode base64 pakai atob + Uint8Array
    const base64Data = file.split(",")[1];
    const binaryString = atob(base64Data);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    const filePath = `produk-images/${fileName}`;

    const uploadResponse = await fetch(
      `${supabaseUrl}/storage/v1/object/${filePath}`,
      {
        method: "POST",
        headers: {
          apikey: supabaseAnonKey,
          Authorization: `Bearer ${supabaseAnonKey}`,
          "Content-Type": "image/jpeg",
        },
        body: bytes,
      }
    );

    if (!uploadResponse.ok) {
      const errText = await uploadResponse.text();
      throw new Error(`Upload failed: ${errText}`);
    }

    const publicUrl = `${supabaseUrl}/storage/v1/object/public/${filePath}`;
    return json({ url: publicUrl, success: true });

  } catch (error) {
    console.error("Error:", error);
    return json({ error: error.message }, 500);
  }
}