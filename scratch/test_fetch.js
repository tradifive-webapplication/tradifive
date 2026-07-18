const url = "https://rylwyxhupwpwsdbvuoej.supabase.co/rest/v1/profiles?select=*";
const key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ5bHd5eGh1cHdwd3NkYnZ1b2VqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY0MzI1NTcsImV4cCI6MjA5MjAwODU1N30.xuRj9PZgZys2b64pNnjhXOVyDjtGVFlBno2o9hiisHA";

async function test() {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 6000); // 6 second timeout
  
  try {
    console.log("Fetching profiles via raw HTTP...");
    const res = await fetch(url, {
      method: 'GET',
      headers: {
        'apikey': key,
        'Authorization': `Bearer ${key}`
      },
      signal: controller.signal
    });
    console.log("Response status:", res.status);
    const text = await res.text();
    console.log("Response body:", text);
  } catch (err) {
    console.error("Fetch error:", err.message || err);
  } finally {
    clearTimeout(timeoutId);
    process.exit(0);
  }
}

test();
