const { Client } = require('pg');

const client = new Client({
  host: 'aws-0-eu-west-1.pooler.supabase.com',
  port: 6543,
  user: 'postgres.rylwyxhupwpwsdbvuoej',
  password: 'Nikilharake5*',
  database: 'postgres',
});

async function run() {
  await client.connect();
  
  const query = `
    SELECT tgname, proname 
    FROM pg_trigger 
    JOIN pg_proc ON pg_proc.oid = pg_trigger.tgfoid 
    WHERE tgrelid = 'auth.users'::regclass;
  `;
  
  const res = await client.query(query);
  console.log("Triggers on auth.users:");
  console.log(JSON.stringify(res.rows, null, 2));
  
  await client.end();
}

run().catch(err => {
    console.error('Database Error:', err);
    client.end();
});
