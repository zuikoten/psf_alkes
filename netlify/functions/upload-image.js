exports.handler = async (event, context) => {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseAnonKey) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Missing Supabase configuration' })
        };
    }
    
    try {
        // Parse form data (image file)
        const { file, fileName } = JSON.parse(event.body);
        
        // Decode base64
        const base64Data = file.split(',')[1];
        const buffer = Buffer.from(base64Data, 'base64');
        
        // Upload ke Supabase Storage
        const filePath = `produk-images/${fileName}`;
        
        const uploadResponse = await fetch(`${supabaseUrl}/storage/v1/object/${filePath}`, {
            method: 'POST',
            headers: {
                'apikey': supabaseAnonKey,
                'Authorization': `Bearer ${supabaseAnonKey}`,
                'Content-Type': 'image/jpeg'
            },
            body: buffer
        });
        
        if (!uploadResponse.ok) {
            throw new Error('Upload failed');
        }
        
        // Dapatkan public URL
        const publicUrl = `${supabaseUrl}/storage/v1/object/public/${filePath}`;
        
        return {
            statusCode: 200,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url: publicUrl, success: true })
        };
        
    } catch (error) {
        console.error('Error:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: error.message })
        };
    }
};