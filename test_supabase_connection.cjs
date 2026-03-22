const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://supabase.motocadena.com';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.ewogICJyb2xlIjogImFub24iLAogICJpc3MiOiAic3VwYWJhc2UiLAogICJpYXQiOiAxNzE1MDUwODAwLAogICJleHAiOiAxODcyODE3MjAwCn0.yB_Jg-uxHi2JeYTEHDavqSVVvASIEFEpf6xiVwDxs38';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testConnection() {
    console.log("📡 Testing connection to 'customers' table...");
    const timeout = setTimeout(() => {
        console.error("⏱️ CONNECTION TIMEOUT (10s)");
        process.exit(1);
    }, 10000);

    try {
        const { data, error } = await supabase
            .from('customers')
            .select('id, first_name')
            .limit(5);

        clearTimeout(timeout);

        if (error) {
            console.error("❌ Supabase Error:", JSON.stringify(error, null, 2));
        } else {
            console.log("✅ Success! Found", data.length, "customers.");
            if (data.length > 0) {
                console.log("Sample:", data[0]);
            }
        }
    } catch (e) {
        clearTimeout(timeout);
        console.error("🚨 Exception:", e.message);
    }
}

testConnection();
