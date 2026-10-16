//+------------------------------------------------------------------+
//|                                             TradiFive_Connector.mq5 |
//|                                  Copyright 2026, TradiFive Connect  |
//|                                            https://www.tradifive.co |
//+------------------------------------------------------------------+
#property copyright "Copyright 2026, TradiFive Connect"
#property link      "https://www.tradifive.co"
#property version   "1.00"

//--- Input parameters (Visible to User)
sinput string InpActivationKey = "PASTE_YOUR_KEY_HERE"; // TradiFive Activation Key

//--- Hardcoded Pipeline Settings (Hidden from User)
const string InpWebhookURL = "https://rylwyxhupwpwsdbvuoej.supabase.co/functions/v1/mt5-webhook"; // Connects dynamically to TradiFive Cloud

//+------------------------------------------------------------------+
//| Expert initialization function                                   |
//+------------------------------------------------------------------+
int OnInit()
  {
   Print("TradiFive Connector initializing. Target Webhook: ", InpWebhookURL);

   // Sync past 50 closed trades on startup for the dashboard
   Print("Synchronizing historical trades to Supabase...");
   HistorySelect(0, TimeCurrent());
   int totalDeals = HistoryDealsTotal();
   int dealsToSync = MathMin(totalDeals, 50); // limit to last 50 to avoid freezing MT5 during init
   
   for(int i = totalDeals - dealsToSync; i < totalDeals; i++)
     {
      ulong ticket = HistoryDealGetTicket(i);
      if(ticket > 0)
        {
         long entry = HistoryDealGetInteger(ticket, DEAL_ENTRY);
         if(entry == DEAL_ENTRY_OUT || entry == DEAL_ENTRY_INOUT)
           {
            string symbol = HistoryDealGetString(ticket, DEAL_SYMBOL);
            double volume = HistoryDealGetDouble(ticket, DEAL_VOLUME);
            double pureProfit = HistoryDealGetDouble(ticket, DEAL_PROFIT);
            double swap = HistoryDealGetDouble(ticket, DEAL_SWAP);
            double comm = HistoryDealGetDouble(ticket, DEAL_COMMISSION);
            long dealType = HistoryDealGetInteger(ticket, DEAL_TYPE);
            string sType = (dealType == DEAL_TYPE_BUY) ? "BUY" : "SELL";
            long timeClosed = HistoryDealGetInteger(ticket, DEAL_TIME);
            
            SendTradeToDatabase(ticket, symbol, sType, volume, pureProfit + swap + comm, timeClosed);
           }
        }
     }
     
   EventSetTimer(5); // Sync Live Balance/Equity every 5 seconds
   Print("Initialization and sync complete.");
   return(INIT_SUCCEEDED);
  }

//+------------------------------------------------------------------+
//| Expert deinitialization function                                 |
//+------------------------------------------------------------------+
void OnDeinit(const int reason)
  {
   EventKillTimer();
   Print("TradiFive Connector deinitialized.");
  }

//+------------------------------------------------------------------+
//| Timer Event Handler - Pushes Live Metrics & Polls Master Switch  |
//+------------------------------------------------------------------+
void OnTimer()
  {
   // --- 1. Push LIVE Metrics Heartbeat ---
   long login = AccountInfoInteger(ACCOUNT_LOGIN);
   string broker = AccountInfoString(ACCOUNT_COMPANY);
   double bal = AccountInfoDouble(ACCOUNT_BALANCE);
   double eq = AccountInfoDouble(ACCOUNT_EQUITY);
   
   string jsonPayload = StringFormat("{\"action\":\"metrics_sync\",\"activation_key\":\"%s\",\"account_number\":\"%I64d\",\"broker\":\"%s\",\"balance\":%f,\"equity\":%f}",
                                     InpActivationKey, login, broker, bal, eq);
                                     
   char postData[];
   StringToCharArray(jsonPayload, postData, 0, WHOLE_ARRAY, CP_UTF8);
   int dataSize = ArraySize(postData) - 1; 
   if(dataSize < 0) dataSize = 0;
   
   char cleanPostData[];
   ArrayResize(cleanPostData, dataSize);
   ArrayCopy(cleanPostData, postData, 0, 0, dataSize);

   char result[];
   string resultHeaders;
   string headers = "Content-Type: application/json\r\n";
   
   // Silent Fire-and-Forget metrics heartbeat so we don't spam terminal
   WebRequest("POST", InpWebhookURL, headers, 3000, cleanPostData, result, resultHeaders);
   
   // --- 2. Pull Master Kill-Switch Status ---
   string statusPayload = StringFormat("{\"action\":\"get_status\",\"activation_key\":\"%s\"}", InpActivationKey);
   char statusPostData[];
   StringToCharArray(statusPayload, statusPostData, 0, WHOLE_ARRAY, CP_UTF8);
   int statusSize = ArraySize(statusPostData) - 1;
   if(statusSize < 0) statusSize = 0;
   
   char cleanStatus[];
   ArrayResize(cleanStatus, statusSize);
   ArrayCopy(cleanStatus, statusPostData, 0, 0, statusSize);
   
   char statusResult[];
   string statusHeaders;
   
   int res = WebRequest("POST", InpWebhookURL, headers, 3000, cleanStatus, statusResult, statusHeaders);
   if(res == 200 || res == 201)
     {
      string responseStr = CharArrayToString(statusResult);
      if(StringFind(responseStr, "\"algo_status\":true") >= 0 || StringFind(responseStr, "\"algo_status\": true") >= 0)
        {
         if(!GlobalVariableCheck("TRADIFIVE_MASTER_SWITCH") || GlobalVariableGet("TRADIFIVE_MASTER_SWITCH") == 0)
           {
            GlobalVariableSet("TRADIFIVE_MASTER_SWITCH", 1);
            Print("TRADIFIVE MASTER SWITCH: [ON] -> Algorithms are allowed to trade.");
           }
        }
      else if(StringFind(responseStr, "\"algo_status\":false") >= 0 || StringFind(responseStr, "\"algo_status\": false") >= 0)
        {
         if(!GlobalVariableCheck("TRADIFIVE_MASTER_SWITCH") || GlobalVariableGet("TRADIFIVE_MASTER_SWITCH") == 1)
           {
            GlobalVariableSet("TRADIFIVE_MASTER_SWITCH", 0);
            Print("TRADIFIVE KILL-SWITCH ENGAGED: [OFF] -> Stop your algos!");
            Alert("TradiFive Remote Master Switch flipped to OFF!");
           }
        }
     }
  }

//+------------------------------------------------------------------+
//| Send trade data to the backend webhook                           |
//+------------------------------------------------------------------+
void SendTradeToDatabase(ulong ticket, string symbol, string type, double lot, double profit, long timeClosed = 0)
  {
   // Prepare JSON payload string
   string jsonPayload = StringFormat("{\"activation_key\":\"%s\",\"ticket\":\"%llu\",\"symbol\":\"%s\",\"trade_type\":\"%s\",\"lot_size\":%f,\"profit\":%f,\"closed_at_sec\":%I64d}",
                                     InpActivationKey, ticket, symbol, type, lot, profit, timeClosed);

   // Convert string to Char Array for WebRequest
   char postData[];
   StringToCharArray(jsonPayload, postData, 0, WHOLE_ARRAY, CP_UTF8);
   
   // Trim the null terminator from the char array to prevent JSON parsing issues
   int dataSize = ArraySize(postData) - 1; 
   if(dataSize < 0) dataSize = 0;
   
   char cleanPostData[];
   ArrayResize(cleanPostData, dataSize);
   ArrayCopy(cleanPostData, postData, 0, 0, dataSize);

   // Configure HTTP Request
   char result[];
   string resultHeaders;
   string headers = "Content-Type: application/json\r\n";
   
   // Make the POST request
   int res = WebRequest("POST",
                        InpWebhookURL,
                        headers,
                        5000,           // 5 second timeout
                        cleanPostData,  // Our JSON Payload
                        result,         // Response data array
                        resultHeaders); // Response headers

   // Check response status
   if(res == 200 || res == 201)
     {
      Print("Successfully synchronized trade ", ticket, " to TradiFive Dashboard.");
     }
   else
     {
      string responseStr = CharArrayToString(result);
      Print("Failed to push trade. HTTP Status: ", res, ". MT5 Error Code: ", GetLastError());
      Print("Supabase Response: ", responseStr);
     }
  }

//+------------------------------------------------------------------+
//| Global Trade Transaction Event Handler                           |
//+------------------------------------------------------------------+
void OnTradeTransaction(const MqlTradeTransaction &trans,
                        const MqlTradeRequest &request,
                        const MqlTradeResult &result)
  {
   // We only care about deals that are being added to the history (i.e., executed in the market)
   if(trans.type == TRADE_TRANSACTION_DEAL_ADD)
     {
      // Select the deal by its ticket to read its properties
      if(HistoryDealSelect(trans.deal))
        {
         long entry = HistoryDealGetInteger(trans.deal, DEAL_ENTRY);
         
         // We filter for DEALS that CLOSE a position, which means profit/loss was realized
         if(entry == DEAL_ENTRY_OUT || entry == DEAL_ENTRY_INOUT)
           {
            ulong dealTicket = trans.deal;
            string symbol = HistoryDealGetString(dealTicket, DEAL_SYMBOL);
            double volume = HistoryDealGetDouble(dealTicket, DEAL_VOLUME);
            
            // Calculate total net profit including swap and commission
            double pureProfit = HistoryDealGetDouble(dealTicket, DEAL_PROFIT);
            double swap = HistoryDealGetDouble(dealTicket, DEAL_SWAP);
            double commission = HistoryDealGetDouble(dealTicket, DEAL_COMMISSION);
            
            double netProfit = pureProfit + swap + commission;
            
            // Determine type of deal
            long dealType = HistoryDealGetInteger(dealTicket, DEAL_TYPE);
            string sType = "UNKNOWN";
            
            // Note: Closing a BUY position generates a SELL deal, and vice versa.
            // We pass the type of the closing deal to the platform, but this can be adjusted.
            if(dealType == DEAL_TYPE_BUY)
              {
               sType = "BUY";
              }
            else if(dealType == DEAL_TYPE_SELL)
              {
               sType = "SELL";
              }
              
            // Fire the external request function
            long timeClosed = HistoryDealGetInteger(dealTicket, DEAL_TIME);
            SendTradeToDatabase(dealTicket, symbol, sType, volume, netProfit, timeClosed);
           }
        }
     }
  }
//+------------------------------------------------------------------+
