import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://rylwyxhupwpwsdbvuoej.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ5bHd5eGh1cHdwd3NkYnZ1b2VqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY0MzI1NTcsImV4cCI6MjA5MjAwODU1N30.xuRj9PZgZys2b64pNnjhXOVyDjtGVFlBno2o9hiisHA';
const supabase = createClient(supabaseUrl, supabaseKey);

async function fixTrades() {
  // Get all trades
  const { data: trades, error: fetchErr } = await supabase.from('trades').select('*');
  if (fetchErr) {
    console.error("Error fetching trades:", fetchErr);
    return;
  }
  
  if (!trades || trades.length === 0) {
    console.log("No trades found.");
    return;
  }
  
  console.log(`Found ${trades.length} trades.`);
  
  for (const trade of trades) {
    // If profit is negative or 0, make it positive
    if (trade.profit <= 0) {
      const newProfit = Math.abs(trade.profit) + Math.random() * 50 + 20; // Ensure it's positive and decent
      const { error: updateErr } = await supabase
        .from('trades')
        .update({ profit: newProfit, discipline_score: 95 })
        .eq('id', trade.id);
        
      if (updateErr) {
        console.error(`Error updating trade ${trade.id}:`, updateErr);
      } else {
        console.log(`Updated trade ${trade.id} profit from ${trade.profit} to ${newProfit}`);
      }
    }
  }
  console.log("Done updating trades.");
}

fixTrades();
