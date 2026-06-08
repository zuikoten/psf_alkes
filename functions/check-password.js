export default {
  async fetch(request, env) {
    if (request.method !== "POST") {
      return json({ ok: false }, 405);
    }

    const { password } = await request.json();

    if (password === env.ADMIN_PASSWORD) {
      return json({ ok: true }, 200);
    }
    return json({ ok: false }, 401);
  },
};

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}
