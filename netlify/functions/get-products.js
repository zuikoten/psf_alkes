const { createClient } = require('@supabase/supabase-js');

exports.handler = async (event, context) => {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
        return {
            statusCode: 500,
            headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
            body: JSON.stringify({
                error: 'Konfigurasi Supabase tidak ditemukan. Pastikan environment variables sudah diatur di Netlify.'
            })
        };
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    try {
        const params = event.queryStringParameters || {};

        const mode       = params.mode   || 'default';   // 'default' | 'terbaru' | 'unggulan' | 'katalog'
        const limitParam = params.limit  ? parseInt(params.limit) : null;
        const page       = params.page   ? Math.max(1, parseInt(params.page)) : 1;
        const search     = params.search ? params.search.trim() : '';
        const kategoriId = params.kategori || null;

        // ── MODE: terbaru (index — 6 produk terbaru) ───────────────────────
        if (mode === 'terbaru') {
            const limit = limitParam || 6;
            const { data, error } = await supabase
                .from('produk')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(limit);

            if (error) throw error;
            return respond({ data, success: true });
        }

        // ── MODE: unggulan (index — produk dengan is_featured = true) ────────
        if (mode === 'unggulan') {
            const limit = limitParam || 4;
            const { data, error } = await supabase
                .from('produk')
                .select('*')
                .eq('is_featured', true)
                .order('created_at', { ascending: false })
                .limit(limit);

            if (error) throw error;
            return respond({ data, success: true });
        }

        // ── MODE: katalog (server-side filter + paginasi) ──────────────────
        if (mode === 'katalog') {
            const limit = limitParam || 12;
            const from  = (page - 1) * limit;
            const to    = from + limit - 1;

            // Query dengan count untuk hitung total halaman
            let query = supabase
                .from('produk')
                .select('*', { count: 'exact' })
                .order('created_at', { ascending: false })
                .range(from, to);

            if (search) {
                // ilike = case-insensitive LIKE di Supabase
                query = query.ilike('nama', `%${search}%`);
            }

            if (kategoriId && kategoriId !== 'all') {
                query = query.eq('kategori_id', parseInt(kategoriId));
            }

            const { data, error, count } = await query;

            if (error) throw error;

            const totalPages = Math.ceil((count || 0) / limit);

            return respond({
                data,
                success:     true,
                pagination: {
                    page,
                    limit,
                    total:      count || 0,
                    totalPages,
                    hasNext:    page < totalPages,
                    hasPrev:    page > 1
                }
            });
        }

        // ── MODE: default / legacy (kompatibel dengan kode lama) ───────────
        const limit = limitParam || null;
        let query = supabase
            .from('produk')
            .select('*')
            .order('created_at', { ascending: false });

        if (limit && !isNaN(limit)) {
            query = query.limit(limit);
        }

        const { data, error } = await query;
        if (error) throw error;
        return respond({ data, success: true });

    } catch (error) {
        console.error('Error:', error);
        return {
            statusCode: 500,
            headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
            body: JSON.stringify({ error: error.message, success: false })
        };
    }
};

function respond(body) {
    return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify(body)
    };
}