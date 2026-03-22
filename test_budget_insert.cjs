const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://supabase.motocadena.com';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.ewogICJyb2xlIjogImFub24iLAogICJpc3MiOiAic3VwYWJhc2UiLAogICJpYXQiOiAxNzE1MDUwODAwLAogICJleHAiOiAxODcyODE3MjAwCn0.yB_Jg-uxHi2JeYTEHDavqSVVvASIEFEpf6xiVwDxs38';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testInsert() {
    console.log("🚀 Starting test insert...");
    const timeout = setTimeout(() => {
        console.error("⏱️ CONNECTION HANG: The request has been pending for 10s.");
        process.exit(1);
    }, 10000);

    try {
        const { data, error } = await supabase
            .from('budgets')
            .insert([{
                manual_customer_name: 'TEST FROM NODE',
                total_amount: 123.45,
                status: 'DRAFT',
                notes: 'Scripted test insert'
            }])
            .select();

        clearTimeout(timeout);

        if (error) {
            console.error("❌ Supabase Error:", error);
        } else {
            console.log("✅ Success:", JSON.stringify(data, null, 2));
        }
    } catch (e) {
        clearTimeout(timeout);
        console.error("🚨 Exception:", e);
    }
}

testInsert();
