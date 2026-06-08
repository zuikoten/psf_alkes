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
    
    const method = event.httpMethod;
    
    try {
        // GET - ambil semua kategori
        if (method === 'GET') {
            const response = await fetch(`${supabaseUrl}/rest/v1/kategori?select=*&order=id.asc`, {
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
        
        // POST - tambah kategori
        if (method === 'POST') {
            const { nama_kategori, deskripsi } = JSON.parse(event.body);
            
            const response = await fetch(`${supabaseUrl}/rest/v1/kategori`, {
                method: 'POST',
                headers: {
                    'apikey': supabaseAnonKey,
                    'Authorization': `Bearer ${supabaseAnonKey}`,
                    'Content-Type': 'application/json',
                    'Prefer': 'return=representation'
                },
                body: JSON.stringify({ nama_kategori, deskripsi })
            });
            
            if (!response.ok) {
                const errorText = await response.text();
                return {
                    statusCode: response.status,
                    body: JSON.stringify({ error: `Supabase error: ${errorText}` })
                };
            }
            
            const data = await response.json();
            return {
                statusCode: 200,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ data: data, success: true })
            };
        }
        
        // PUT - update kategori
        if (method === 'PUT') {
            const { id, nama_kategori, deskripsi } = JSON.parse(event.body);
            
            const response = await fetch(`${supabaseUrl}/rest/v1/kategori?id=eq.${id}`, {
                method: 'PATCH',
                headers: {
                    'apikey': supabaseAnonKey,
                    'Authorization': `Bearer ${supabaseAnonKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ nama_kategori, deskripsi })
            });
            
            if (!response.ok) {
                const errorText = await response.text();
                return {
                    statusCode: response.status,
                    body: JSON.stringify({ error: `Supabase error: ${errorText}` })
                };
            }
            
            return {
                statusCode: 200,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ success: true })
            };
        }
        
        // DELETE - hapus kategori
        if (method === 'DELETE') {
            const { id } = JSON.parse(event.body);
            
            const response = await fetch(`${supabaseUrl}/rest/v1/kategori?id=eq.${id}`, {
                method: 'DELETE',
                headers: {
                    'apikey': supabaseAnonKey,
                    'Authorization': `Bearer ${supabaseAnonKey}`
                }
            });
            
            if (!response.ok) {
                const errorText = await response.text();
                return {
                    statusCode: response.status,
                    body: JSON.stringify({ error: `Supabase error: ${errorText}` })
                };
            }
            
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
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ error: error.message })
        };
    }
};