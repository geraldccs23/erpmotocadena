const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://supabase.motocadena.com';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.ewogICJyb2xlIjogInNlcnZpY2Vfcm9sZSIsCiAgImlzcyI6ICJzdXBhYmFzZSIsCiAgImlhdCI6IDE3MTUwNTA4MDAsCiAgImV4cCI6IDE4NzI4MTcyMDAKfQ.qsWIBzlqP7AT6w39r4QMlPstb6Vj8hWLssCoqbfybMk';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function check() {
    const payload = {
        "workshop_id": "6319bebb-72e6-4f12-b104-3a1216c8731d",
        "customer_id": "3da31dfd-36be-47b9-9811-90750f616be1",
        "vehicle_id": "f7a720ee-1151-422b-b815-669450469c99",
        "manual_customer_name": null,
        "manual_vehicle_name": null,
        "valid_until": "2026-03-10",
        "notes": "TEST NOTES CONTENT",
        "status": "DRAFT",
        "total_amount": 51.5
    };

    console.log("🔍 Checking Workshop...");
    const { data: ws } = await supabase.from('workshops').select('id').eq('id', payload.workshop_id).single();
    if (!ws) console.error("❌ Workshop NOT FOUND!"); else console.log("✅ Workshop exists.");

    console.log("🔍 Checking Customer...");
    const { data: cust } = await supabase.from('customers').select('id').eq('id', payload.customer_id).single();
    if (!cust) console.error("❌ Customer NOT FOUND!"); else console.log("✅ Customer exists.");

    console.log("🚀 Attempting INSERT with small notes...");
    const { data, error } = await supabase.from('budgets').insert([payload]).select();
    if (error) console.error("❌ Small Insert Error:", error);
    else console.log("✅ Small Insert Success! ID:", data[0].id);

    console.log("🚀 Attempting INSERT with LARGE notes...");
    payload.notes = "A".repeat(5000); // 5KB
    const { data: data2, error: error2 } = await supabase.from('budgets').insert([payload]).select();
    if (error2) console.error("❌ Large Insert Error:", error2);
    else console.log("✅ Large Insert Success! ID:", data2[0].id);
}

check();
