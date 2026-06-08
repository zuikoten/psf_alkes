exports.handler = async (event) => {
    const { password } = JSON.parse(event.body);

    if (password === process.env.ADMIN_PASSWORD) {
        return { statusCode: 200, body: JSON.stringify({ ok: true }) };
    }
    return { statusCode: 401, body: JSON.stringify({ ok: false }) };
};