export default {
  async fetch(request, env) {
    const supabaseUrl = env.SUPABASE_URL;
    const supabaseAnonKey = env.SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      return json({ error: "Missing Supabase configuration" }, 500);
    }

    if (request.method !== "POST") {
      return json({ error: "Method not allowed" }, 405);
    }

    try {
      const { file, fileName } = await request.json();

      // Cloudflare Workers tidak punya Buffer — decode base64 dengan atob + Uint8Array
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
  },
};

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}
