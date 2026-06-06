const { createClient } = require('@supabase/supabase-js');

exports.handler = async (event, context) => {
    const supabaseUrl     = process.env.SUPABASE_URL;
    const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
        return {
            statusCode: 500,
            headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
            body: JSON.stringify({ error: 'Konfigurasi Supabase tidak ditemukan' })
        };
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    try {
        // Baca dari tabel `kategori` (bukan kolom kategori di tabel produk)
        const { data, error } = await supabase
            .from('kategori')
            .select('id, nama_kategori')
            .order('nama_kategori', { ascending: true });

        if (error) throw error;

        return {
            statusCode: 200,
            headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
            body: JSON.stringify({
                categories: data || [],   // array of { id, nama_kategori }
                success: true
            })
        };

    } catch (error) {
        console.error('Error:', error);
        return {
            statusCode: 500,
            headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
            body: JSON.stringify({ error: error.message, success: false })
        };
    }
};