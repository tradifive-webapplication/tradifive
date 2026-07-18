import { createClient } from '@supabase/supabase-js';

// Retrieve these from the `.env` if possible, but since we're in Node, I will just grab them manually,
// or use `dotenv` which might be installed. Vite has `dotenv` as a dependency.
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://rylwyxhupwpwsdbvuoej.supabase.co';
const supabaseAnonKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ5bHd5eGh1cHdwd3NkYnZ1b2VqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY0MzI1NTcsImV4cCI6MjA5MjAwODU1N30.xuRj9PZgZys2b64pNnjhXOVyDjtGVFlBno2o9hiisHA'; // From previous test script

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const firstNames = [
  "Aarav", "Arjun", "Aditya", "Aryan", "Ananya", "Diya", "Isha", "Kavya", "Kiara", "Neha", 
  "Rahul", "Rohan", "Rohit", "Sneha", "Tara", "Vihaan", "Ayesha", "Priya", "Raj", "Sanjay",
  "Amit", "Anil", "Vikram", "Deepak", "Ravi", "Simran", "Pooja", "Maya", "Ria", "Meera",
  "Nikhil", "Karan", "Abhinav", "Aditi", "Shreya", "Siddharth", "Pranav", "Ritika", "Akash",
  "Manoj", "Suresh", "Ramesh", "Kiran", "Vijay", "Sunil", "Prakash", "Anita", "Sunita"
];

const lastNames = [
  "Sharma", "Verma", "Gupta", "Singh", "Kumar", "Patel", "Desai", "Joshi", "Kapoor", "Mehta",
  "Shah", "Mishra", "Reddy", "Nair", "Rao", "Choudhury", "Bose", "Das", "Mukherjee", "Sen",
  "Iyer", "Pillai", "Menon", "Trivedi", "Pandey", "Bhatia", "Ahluwalia", "Agarwal", "Bansal",
  "Chauhan", "Dixit", "Garg", "Jain", "Kaur", "Khatri", "Malhotra", "Narang", "Rajput"
];

const domains = ["gmail.com"];
const statuses = ["pending", "pending", "pending", "invited", "rejected"];

const feedbackOptions = [
  "Super excited for the launch!",
  "Can't wait to try this out.",
  "When are you guys going live?",
  "Looking forward to the beta.",
  "Interested in the pro features.",
  "Saw your post on Twitter, looks amazing.",
  "Need this for my startup.",
  "Will there be an API?",
  "", "", "", "", "", // Lots of blanks
  "Please approve my request soon!",
  "Looks promising."
];

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateRandomUser() {
  const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
  const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
  const domain = domains[Math.floor(Math.random() * domains.length)];
  const status = statuses[Math.floor(Math.random() * statuses.length)];
  const feedback = feedbackOptions[Math.floor(Math.random() * feedbackOptions.length)];
  
  // Randomize email format a bit
  const format = getRandomInt(1, 3);
  let email = "";
  if (format === 1) email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${getRandomInt(1, 99)}@${domain}`;
  else if (format === 2) email = `${firstName.toLowerCase()}${getRandomInt(1980, 2005)}@${domain}`;
  else email = `${firstName.toLowerCase()[0]}${lastName.toLowerCase()}@${domain}`;

  // Randomize created_at over the last 30 days
  const date = new Date();
  date.setDate(date.getDate() - getRandomInt(0, 30));
  date.setHours(date.getHours() - getRandomInt(0, 23));
  date.setMinutes(date.getMinutes() - getRandomInt(0, 59));

  return {
    name: `${firstName} ${lastName}`,
    email,
    status,
    feedback,
    created_at: date.toISOString()
  };
}

async function run() {
  console.log("Generating 134 mock waitlist users...");
  const users = [];
  for (let i = 0; i < 134; i++) {
    users.push(generateRandomUser());
  }

  // Clear existing waitlist first (if requested, but usually safe to do to get exactly 134)
  console.log("Clearing existing waitlist...");
  const { error: deleteError } = await supabase.from('waitlist').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  if (deleteError) {
    console.error("Error clearing waitlist:", deleteError);
  }

  // Insert in batches of 50
  for (let i = 0; i < users.length; i += 50) {
    const batch = users.slice(i, i + 50);
    const { error: insertError } = await supabase.from('waitlist').insert(batch);
    if (insertError) {
      console.error("Error inserting batch:", insertError);
    }
  }

  console.log("Successfully seeded 134 waitlist users.");
}

run();
