export async function onRequestPost(context) {
  const { request, env } = context;

  try {
    const { password } = await request.json();

    if (password === env.ADMIN_PASSWORD) {
      return json({ ok: true }, 200);
    }
    return json({ ok: false }, 401);
  } catch {
    return json({ ok: false }, 400);
  }
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}
