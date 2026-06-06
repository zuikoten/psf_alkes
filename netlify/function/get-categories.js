const { createClient } = require('@supabase/supabase-js');

exports.handler = async (event, context) => {
    // Ambil environment variables dari Netlify
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseAnonKey) {
        return {
            statusCode: 500,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({ 
                error: 'Konfigurasi Supabase tidak ditemukan' 
            })
        };
    }
    
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    
    try {
        // Ambil semua kategori unik dari tabel produk
        const { data, error } = await supabase
            .from('produk')
            .select('kategori')
            .not('kategori', 'is', null)
            .neq('kategori', '');
            
        if (error) throw error;
        
        // Filter kategori unik
        const uniqueCategories = [...new Set(data.map(item => item.kategori))];
        
        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({ 
                categories: uniqueCategories.sort(),
                success: true 
            })
        };
        
    } catch (error) {
        console.error('Error:', error);
        return {
            statusCode: 500,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({ 
                error: error.message,
                success: false 
            })
        };
    }
};