
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://vbrsfluickxiokpuhgza.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZicnNmbHVpY2t4aW9rcHVoZ3phIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ5ODU1MzIsImV4cCI6MjA4MDU2MTUzMn0.a1S4D76kmLLMsp4EfFH8C8RZOuIn2l08I4L6LNR34cY';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testAuth() {
    console.log("Testing Supabase Connectivity...");

    // 1. Check Health (Basic query)
    try {
        const { data, error } = await supabase.from('profiles').select('count').limit(1);
        if (error) {
            console.log("Database Query Error:", error.message);
        } else {
            console.log("Database Connection: OK");
        }
    } catch (e) {
        console.log("Database Connection Failed:", e);
    }

    // 2. Try Signup with random email
    const randomEmail = `test_${Date.now()}@example.com`;
    console.log(`Attempting Signup with ${randomEmail}...`);

    const { data, error } = await supabase.auth.signUp({
        email: randomEmail,
        password: 'TestPassword123!',
    });

    if (error) {
        console.error("Signup Error:", error);
    } else {
        console.log("Signup Success:", data);
    }
}

testAuth();
