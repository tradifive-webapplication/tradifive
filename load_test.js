import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.VITE_SUPABASE_URL || "https://rylwyxhupwpwsdbvuoej.supabase.co";
const supabaseKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ5bHd5eGh1cHdwd3NkYnZ1b2VqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY0MzI1NTcsImV4cCI6MjA5MjAwODU1N30.xuRj9PZgZys2b64pNnjhXOVyDjtGVFlBno2o9hiisHA";

const supabase = createClient(supabaseUrl, supabaseKey);

// Adjust CONCURRENCY based on args or default
const CONCURRENCY = parseInt(process.argv[2]) || 100;
const BATCHES = parseInt(process.argv[3]) || 5;

async function queryModule(moduleName, queryFn) {
  const start = Date.now();
  let success = false;
  let errorMsg = null;
  try {
    const { data, error } = await queryFn();
    if (error) throw error;
    success = true;
  } catch (err) {
    errorMsg = err.message || err.toString();
  }
  const end = Date.now();
  return { moduleName, success, timeMs: end - start, errorMsg };
}

async function simulateUserSession() {
  const tasks = [
    queryModule("Social Feeds", () => supabase.from('social_posts').select('*').limit(20)),
    queryModule("Discover Profiles", () => supabase.from('profiles').select('*').limit(10)),
    queryModule("Channels", () => supabase.from('channels').select('*').limit(10)),
    queryModule("Messages", () => supabase.from('channel_messages').select('*').limit(20)),
    queryModule("Risk Guard / Journal", () => supabase.from('mt5_accounts').select('*').limit(5))
  ];
  return Promise.all(tasks);
}

async function runLoadTest() {
  console.log(`Starting load test with ${CONCURRENCY} concurrent users per batch across ${BATCHES} batches...`);
  console.log(`Total Simulated Users: ${CONCURRENCY * BATCHES}`);
  
  // Login first to bypass RLS for some queries if needed
  await supabase.auth.signInWithPassword({
    email: "marketing@fialgo.com",
    password: "Nikilharake5*"
  });

  const results = [];
  
  for (let b = 0; b < BATCHES; b++) {
    console.log(`--- Running Batch ${b + 1}/${BATCHES} ---`);
    const batchPromises = [];
    for (let i = 0; i < CONCURRENCY; i++) {
      batchPromises.push(simulateUserSession());
    }
    
    const batchStart = Date.now();
    const batchResults = await Promise.all(batchPromises);
    const batchEnd = Date.now();
    
    batchResults.forEach(userSessionResult => {
      results.push(...userSessionResult);
    });
    
    console.log(`Batch ${b + 1} completed in ${batchEnd - batchStart}ms`);
  }

  // Analytics
  let totalRequests = results.length;
  let successfulRequests = 0;
  let failedRequests = 0;
  const moduleStats = {};

  results.forEach(res => {
    if (res.success) successfulRequests++;
    else failedRequests++;

    if (!moduleStats[res.moduleName]) {
      moduleStats[res.moduleName] = { count: 0, totalTime: 0, errors: 0 };
    }
    moduleStats[res.moduleName].count++;
    moduleStats[res.moduleName].totalTime += res.timeMs;
    if (!res.success) moduleStats[res.moduleName].errors++;
  });

  console.log("\n====== LOAD TEST RESULTS ======");
  console.log(`Total Requests Sent : ${totalRequests}`);
  console.log(`Successful Requests : ${successfulRequests}`);
  console.log(`Failed Requests     : ${failedRequests}`);
  if (failedRequests > 0) {
    const errorTypes = [...new Set(results.filter(r => !r.success).map(r => r.errorMsg))];
    console.log(`Errors Encountered  : \n${errorTypes.join("\n")}`);
  }

  console.log("\n--- Module Breakdown (Average Response Time) ---");
  for (const [module, stat] of Object.entries(moduleStats)) {
    const avgTime = stat.totalTime / stat.count;
    console.log(`${module.padEnd(25)} | Avg Time: ${avgTime.toFixed(2)}ms | Errors: ${stat.errors}`);
  }
}

runLoadTest().catch(console.error);
