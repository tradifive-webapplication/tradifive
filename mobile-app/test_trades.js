const SUPABASE_URL = "https://rylwyxhupwpwsdbvuoej.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ5bHd5eGh1cHdwd3NkYnZ1b2VqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY0MzI1NTcsImV4cCI6MjA5MjAwODU1N30.xuRj9PZgZys2b64pNnjhXOVyDjtGVFlBno2o9hiisHA";

async function main() {
  console.log('Fetching PostgREST OpenAPI spec using Accept header...');
  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/`, {
      method: 'GET',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Accept': 'application/openapi+json'
      }
    });
    
    console.log('Status code:', response.status);
    const text = await response.text();
    if (response.status === 200) {
      const schema = JSON.parse(text);
      if (schema && schema.definitions && schema.definitions.trades) {
        console.log('Found trades definition!');
        console.log('Columns:', Object.keys(schema.definitions.trades.properties));
      } else {
        console.log('Available definitions:', Object.keys(schema.definitions || {}));
      }
    } else {
      console.log('Error Body:', text);
    }
  } catch (err) {
    console.error('Error:', err.message);
  }
}

main();
