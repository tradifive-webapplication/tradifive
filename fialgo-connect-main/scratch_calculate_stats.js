import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.VITE_SUPABASE_URL || "https://rylwyxhupwpwsdbvuoej.supabase.co";
const supabaseKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ5bHd5eGh1cHdwd3NkYnZ1b2VqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY0MzI1NTcsImV4cCI6MjA5MjAwODU1N30.xuRj9PZgZys2b64pNnjhXOVyDjtGVFlBno2o9hiisHA";

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const { data: authData } = await supabase.auth.signInWithPassword({
    email: "marketing@fialgo.com",
    password: "Nikilharake5*"
  });

  const { data: trades, error } = await supabase.from("trades").select("*");
  if (error) {
    console.error("Error:", error);
    return;
  }

  const wins = trades.filter(t => t.profit > 0).length;
  const losses = trades.filter(t => t.profit < 0).length;
  const evens = trades.filter(t => t.profit === 0).length;
  const winRate = trades.length > 0 ? (wins / trades.length) * 100 : 0;

  console.log("Trades Count:", trades.length);
  console.log("Wins:", wins);
  console.log("Losses:", losses);
  console.log("Evens:", evens);
  console.log("Win Rate:", winRate.toFixed(2) + "%");
  
  const winningTrades = trades.filter(t => t.profit > 0);
  const losingTrades = trades.filter(t => t.profit < 0);
  const avgWin = winningTrades.reduce((acc, t) => acc + t.profit, 0) / winningTrades.length;
  const avgLoss = Math.abs(losingTrades.reduce((acc, t) => acc + t.profit, 0) / losingTrades.length);
  console.log("Avg Win:", avgWin);
  console.log("Avg Loss:", avgLoss);
  console.log("Avg Win/Loss Ratio:", avgWin / avgLoss);
  
  const grossProfit = winningTrades.reduce((acc, t) => acc + t.profit, 0);
  const grossLoss = Math.abs(losingTrades.reduce((acc, t) => acc + t.profit, 0));
  console.log("Gross Profit:", grossProfit);
  console.log("Gross Loss:", grossLoss);
  console.log("Profit Factor:", grossProfit / grossLoss);
}

run();
