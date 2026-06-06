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
                error: 'Konfigurasi Supabase tidak ditemukan. Pastikan environment variables sudah diatur di Netlify.' 
            })
        };
    }
    
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    
    try {
        // Ambil parameter limit dari query string
        const limit = event.queryStringParameters?.limit ? parseInt(event.queryStringParameters.limit) : null;
        
        let query = supabase
            .from('produk')
            .select('*')
            .order('created_at', { ascending: false });
            
        if (limit && !isNaN(limit)) {
            query = query.limit(limit);
        }
        
        const { data, error } = await query;
        
        if (error) throw error;
        
        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({ 
                data: data,
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