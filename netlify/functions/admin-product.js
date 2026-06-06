exports.handler = async (event, context) => {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseAnonKey) {
        return {
            statusCode: 500,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ error: 'Missing Supabase configuration' })
        };
    }
    
    // Parse method dan body
    const method = event.httpMethod;
    const path = event.path;
    
    try {
        // Untuk GET - ambil semua produk
        if (method === 'GET') {
            const response = await fetch(`${supabaseUrl}/rest/v1/produk?select=*&order=created_at.desc`, {
                headers: {
                    'apikey': supabaseAnonKey,
                    'Authorization': `Bearer ${supabaseAnonKey}`
                }
            });
            const data = await response.json();
            return {
                statusCode: 200,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ data: data, success: true })
            };
        }
        
        // Untuk POST - tambah produk
        if (method === 'POST') {
            const product = JSON.parse(event.body);
            const response = await fetch(`${supabaseUrl}/rest/v1/produk`, {
                method: 'POST',
                headers: {
                    'apikey': supabaseAnonKey,
                    'Authorization': `Bearer ${supabaseAnonKey}`,
                    'Content-Type': 'application/json',
                    'Prefer': 'return=representation'
                },
                body: JSON.stringify(product)
            });
            const data = await response.json();
            return {
                statusCode: 200,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ data: data, success: true })
            };
        }
        
        // Untuk PUT - update produk
        if (method === 'PUT') {
            const { id, ...updates } = JSON.parse(event.body);
            const response = await fetch(`${supabaseUrl}/rest/v1/produk?id=eq.${id}`, {
                method: 'PATCH',
                headers: {
                    'apikey': supabaseAnonKey,
                    'Authorization': `Bearer ${supabaseAnonKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(updates)
            });
            return {
                statusCode: 200,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ success: true })
            };
        }
        
        // Untuk DELETE - hapus produk
        if (method === 'DELETE') {
            const { id } = JSON.parse(event.body);
            const response = await fetch(`${supabaseUrl}/rest/v1/produk?id=eq.${id}`, {
                method: 'DELETE',
                headers: {
                    'apikey': supabaseAnonKey,
                    'Authorization': `Bearer ${supabaseAnonKey}`
                }
            });
            return {
                statusCode: 200,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ success: true })
            };
        }
        
        return {
            statusCode: 405,
            body: JSON.stringify({ error: 'Method not allowed' })
        };
        
    } catch (error) {
        console.error('Error:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: error.message })
        };
    }
};