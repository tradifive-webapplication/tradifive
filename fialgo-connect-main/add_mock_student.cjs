const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function addMockStudent() {
    // Get the first two users
    const { data: users, error } = await supabase.from('profiles').select('id, email, account_type').limit(2);
    if (error || !users || users.length < 2) {
        console.error("Need at least 2 users in the profiles table to create a mentor-student relationship.");
        return;
    }
    
    let mentor = users.find(u => u.account_type === 'creator') || users[0];
    let student = users.find(u => u.id !== mentor.id);

    console.log("Linking Mentor:", mentor.id, "to Student:", student.id);

    const { error: insertError } = await supabase.from('mentor_students').insert({
        mentor_id: mentor.id,
        student_id: student.id,
        tier: 'Advanced'
    });

    if (insertError) {
        console.error("Failed to insert:", insertError);
    } else {
        console.log("Successfully linked student to mentor!");
    }
}

addMockStudent();
