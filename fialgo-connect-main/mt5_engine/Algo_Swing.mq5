//+------------------------------------------------------------------+
//|                                                    Tradifive.mq5 |
//|                                                                  |
//+------------------------------------------------------------------+
#property copyright "Tradifive EA"
#property link      ""
#property version   "1.00"
#property strict

//--- TradiFive Cloud Integration
input group "==[ TradiFive Authentication ]==";
sinput string InpActivationKey = "PASTE_YOUR_KEY_HERE"; 
const string InpWebhookURL = "https://rylwyxhupwpwsdbvuoej.supabase.co/functions/v1/mt5-webhook";

//--- Input parameters
input group "==[ Trade Settings ]==";
input string TradeComment = "Tradifive EA";
input bool DisplayChartInfo = true;

input group "==[ SL-TP Settings ]==";
input double StartLots = 0.01;
input double MartingaleMultiplicator = 10.0;
input int Distance = 700;
input int LegacyProfitFactor =100;

input group "==[ Stochastic Indicator Settings ]==";
input int KPeriod = 3;
input int DPeriod = 6;
input int Slowing = 9;
input ENUM_MA_METHOD Smoothing = MODE_SMA;
input ENUM_STO_PRICE PriceField = STO_LOWHIGH;
input double BUYLevel = 20.0;
input double SELLLevel = 55.0;

input group "==[ Grid/Basket Controls ]==";
input int MaxMartingaleSteps = 9;
input bool CloseBasketAtAverage = false;
input int BasketTP = 50;

input group "==[ Hedge Controls ]==";
input int WhenTotalOpenTrades = 8;
input double HedgeVolume = 1.0;

input group "==[ Compounding Controls ]==";
input bool Enable10PercentEquityTarget = false;
input double PercentEquityGrowth = 10.0;
input bool AfterTargetSetNew = false;
input bool CalculateLotFromBalance = false;
input double LotsPer1000 = 0.01;

input int MagicNumber = 55369;

input group "==[ Grid Entry Settings ]==";
input int GridEntryDistance = 700;
input int GridTakeProfit = 100;

input group "==[ News Filter Settings ]==";
input bool EnableNewsFilter = true;
input int NewsMinutesBefore = 30;
input int NewsMinutesAfter = 30;
input bool CloseTradesBeforeNews = true;
input bool EnableDailyTimeFilter = true;
input int DailyFilterHour = 18;
input int DailyFilterMinute = 0;

input group "==[ Dashboard Settings ]==";
input string DashboardLogoText = "tradifive";
input color DashboardFiColor = C'138,43,226';
input color DashboardAlgoColor = clrWhite;
input int DashboardCornerPosition = 1;
input int DashboardXOffset = 20;
input int DashboardYOffset = 30;

//--- Global variables
int stochHandle;
double stochMain[];
double stochSignal[];
double pointValue;
int digits;
double pipValue;

double lotSizes[6] = {0.01, 0.1, 1.0, 10.0, 100.0, 200.0};

struct NewsEvent {
   datetime eventTime;
   string description;
};

NewsEvent newsEvents[];

#define CLR_PANEL_BG        C'20,20,30'
#define CLR_PANEL_BORDER    C'40,40,50'
#define CLR_CONTENT_BG      C'30,32,38'
#define CLR_TEXT_WHITE      clrWhite
#define CLR_TEXT_GRAY       C'150,150,150'
#define CLR_TEXT_GREEN      C'0,255,127'
#define CLR_TEXT_YELLOW     C'255,215,0'
#define CLR_TEXT_RED        C'255,69,69'
#define CLR_SEPARATOR       C'50,50,60'
#define CLR_STATUS_ACTIVE   C'50,205,50'

//+------------------------------------------------------------------+
int OnInit()
{
   Print("TradiFive Engine Initializing Cloud Connection...");
   EventSetTimer(5); // TradiFive Webhook 5-Second Pulse
   
   digits = (int)SymbolInfoInteger(_Symbol, SYMBOL_DIGITS);
   pointValue = SymbolInfoDouble(_Symbol, SYMBOL_POINT);
   
   if(digits == 5 || digits == 3)
      pipValue = 10 * pointValue;
   else
      pipValue = pointValue;
   
   stochHandle = iStochastic(_Symbol, PERIOD_CURRENT, KPeriod, DPeriod, Slowing, Smoothing, PriceField);
   
   if(stochHandle == INVALID_HANDLE)
   {
      Print("Error creating Stochastic indicator");
      return(INIT_FAILED);
   }
   
   ArraySetAsSeries(stochMain, true);
   ArraySetAsSeries(stochSignal, true);
   
   InitializeNewsEvents();
   CreateDashboard();
   
   Print("Tradifive EA initialized successfully");
   Print("Magic Number: ", MagicNumber);
   Print("Start Lots: ", StartLots);
   Print("News Filter: ", EnableNewsFilter ? "ENABLED" : "DISABLED");
   Print("Daily 6:00 PM Filter: ", EnableDailyTimeFilter ? "ENABLED" : "DISABLED");
   
   return(INIT_SUCCEEDED);
}

//+------------------------------------------------------------------+
void OnDeinit(const int reason)
{
   EventKillTimer();
   
   if(stochHandle != INVALID_HANDLE)
      IndicatorRelease(stochHandle);
   
   DeleteDashboard();
   Comment("");
}

//+------------------------------------------------------------------+
//| TradiFive Cloud Heartbeat - Runs every 5 seconds                    |
//+------------------------------------------------------------------+
void OnTimer()
  {
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
   
   WebRequest("POST", InpWebhookURL, headers, 3000, cleanPostData, result, resultHeaders);
   
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
            GlobalVariableSet("TRADIFIVE_MASTER_SWITCH", 1);
        }
      else if(StringFind(responseStr, "\"algo_status\":false") >= 0 || StringFind(responseStr, "\"algo_status\": false") >= 0)
        {
         if(!GlobalVariableCheck("TRADIFIVE_MASTER_SWITCH") || GlobalVariableGet("TRADIFIVE_MASTER_SWITCH") == 1)
           {
            GlobalVariableSet("TRADIFIVE_MASTER_SWITCH", 0);
            Alert("TradiFive Remote Master Switch flipped to OFF!");
           }
        }
     }
  }

//+------------------------------------------------------------------+
void OnTick()
{
   // TRADIFIVE MASTER KILL SWITCH CHECK
   if(GlobalVariableCheck("TRADIFIVE_MASTER_SWITCH") && GlobalVariableGet("TRADIFIVE_MASTER_SWITCH") == 0) {
      UpdateDashboard(0, 0, 0, false, 0); // Visually update UI to say Paused
      return; 
   }

   if(CopyBuffer(stochHandle, 0, 0, 3, stochMain) < 3 || 
      CopyBuffer(stochHandle, 1, 0, 3, stochSignal) < 3)
      return;
   
   bool tradingAllowed = true;
   int minutesToNews = 0;
   string blockReason = "";
   
   if(EnableNewsFilter || EnableDailyTimeFilter)
   {
      if(EnableNewsFilter && IsNewsTime(minutesToNews))
      {
         tradingAllowed = false;
         blockReason = "Specific News Event";
      }
      
      if(EnableDailyTimeFilter && IsDailyFilterTime(minutesToNews))
      {
         tradingAllowed = false;
         blockReason = "Daily 6:00 PM Filter";
      }
      
      if(!tradingAllowed && CloseTradesBeforeNews)
      {
         int totalTrades = PositionsTotal();
         if(totalTrades > 0)
         {
            Print("TRADING BLOCKED: ", blockReason, " - Closing all positions (", minutesToNews, " minutes to event)");
            CloseAllPositions();
         }
      }
   }
   
   int buyCount = 0, sellCount = 0;
   double buyVolume = 0, sellVolume = 0;
   CountPositions(buyCount, sellCount, buyVolume, sellVolume);
   
   int totalTrades = buyCount + sellCount;
   
   if(totalTrades > 0)
   {
      if(CheckAnyPositionProfit())
      {
         CloseAllPositions();
         UpdateDashboard(buyCount, sellCount, stochMain[0], tradingAllowed, minutesToNews);
         return;
      }
   }
   
   UpdateDashboard(buyCount, sellCount, stochMain[0], tradingAllowed, minutesToNews);
   
   if(totalTrades >= WhenTotalOpenTrades)
      CheckHedge(buyVolume, sellVolume);
   
   if(CloseBasketAtAverage && totalTrades > 0)
      CheckBasketClose(buyCount, sellCount);
   
   if(!tradingAllowed)
      return;
   
   if(totalTrades == 0)
   {
      if(stochMain[0] < BUYLevel && stochMain[1] >= BUYLevel)
      {
         OpenPosition(ORDER_TYPE_BUY, StartLots, 0);
      }
      else if(stochMain[0] > SELLLevel && stochMain[1] <= SELLLevel)
      {
         OpenPosition(ORDER_TYPE_SELL, StartLots, 0);
      }
   }
   else
   {
      CheckGridEntry(ORDER_TYPE_BUY, buyCount);
      CheckGridEntry(ORDER_TYPE_SELL, sellCount);
   }
}

//+------------------------------------------------------------------+
void InitializeNewsEvents()
{
   ArrayResize(newsEvents, 2);
   
   newsEvents[0].eventTime = StringToTime("2025.08.01 12:30");
   newsEvents[0].description = "Scheduled Event - Aug 1 (12:30 PM)";
   
   newsEvents[1].eventTime = StringToTime("2025.08.22 13:30");
   newsEvents[1].description = "Scheduled Event - Aug 22 (1:30 PM)";
   
   Print("News events initialized: ", ArraySize(newsEvents), " events loaded");
}

//+------------------------------------------------------------------+
void CheckHedge(double buyVol, double sellVol)
{
   double netExposure = MathAbs(buyVol - sellVol);
   
   if(netExposure > 0)
   {
      double hedgeSize = netExposure * HedgeVolume;
      ENUM_ORDER_TYPE hedgeType = (buyVol > sellVol) ? ORDER_TYPE_SELL : ORDER_TYPE_BUY;
      
      bool hedgeExists = false;
      for(int i = PositionsTotal() - 1; i >= 0; i--)
      {
         ulong ticket = PositionGetTicket(i);
         if(PositionSelectByTicket(ticket))
         {
            if(PositionGetString(POSITION_SYMBOL) == _Symbol && 
               PositionGetInteger(POSITION_MAGIC) == MagicNumber)
            {
               string comment = PositionGetString(POSITION_COMMENT);
               if(StringFind(comment, "Hedge") >= 0)
               {
                  hedgeExists = true;
                  break;
               }
            }
         }
      }
      
      if(!hedgeExists)
      {
         MqlTradeRequest request = {};
         MqlTradeResult result = {};
         
         double price = (hedgeType == ORDER_TYPE_BUY) ? 
                        SymbolInfoDouble(_Symbol, SYMBOL_ASK) : 
                        SymbolInfoDouble(_Symbol, SYMBOL_BID);
         
         request.action = TRADE_ACTION_DEAL;
         request.symbol = _Symbol;
         request.volume = hedgeSize;
         request.type = hedgeType;
         request.price = price;
         request.deviation = 10;
         request.magic = MagicNumber;
         request.comment = "Hedge";
         
         if(!OrderSend(request, result))
            Print("Hedge OrderSend failed, error: ", GetLastError());
      }
   }
}

//+------------------------------------------------------------------+
void CheckBasketClose(int buyCount, int sellCount)
{
   double weightedPrice = 0;
   double totalVolume = 0;
   double totalProfit = 0;
   
   for(int i = PositionsTotal() - 1; i >= 0; i--)
   {
      ulong ticket = PositionGetTicket(i);
      if(PositionSelectByTicket(ticket))
      {
         if(PositionGetString(POSITION_SYMBOL) == _Symbol && 
            PositionGetInteger(POSITION_MAGIC) == MagicNumber)
         {
            double vol = PositionGetDouble(POSITION_VOLUME);
            double openPrice = PositionGetDouble(POSITION_PRICE_OPEN);
            totalVolume += vol;
            weightedPrice += openPrice * vol;
            totalProfit += PositionGetDouble(POSITION_PROFIT);
         }
      }
   }
   
   if(totalVolume > 0)
   {
      double avgPrice = weightedPrice / totalVolume;
      double currentPrice = SymbolInfoDouble(_Symbol, SYMBOL_BID);
      double pipDistance = MathAbs(currentPrice - avgPrice) / pipValue;
      
      if(pipDistance >= BasketTP)
      {
         CloseAllPositions();
      }
   }
}

//+------------------------------------------------------------------+
void CloseAllPositions()
{
   Print("Closing all positions...");
   
   for(int i = PositionsTotal() - 1; i >= 0; i--)
   {
      ulong ticket = PositionGetTicket(i);
      if(PositionSelectByTicket(ticket))
      {
         if(PositionGetString(POSITION_SYMBOL) == _Symbol && 
            PositionGetInteger(POSITION_MAGIC) == MagicNumber)
         {
            MqlTradeRequest request = {};
            MqlTradeResult result = {};
            
            request.action = TRADE_ACTION_DEAL;
            request.position = ticket;
            request.symbol = _Symbol;
            request.volume = PositionGetDouble(POSITION_VOLUME);
            request.type = (PositionGetInteger(POSITION_TYPE) == POSITION_TYPE_BUY) ? 
                          ORDER_TYPE_SELL : ORDER_TYPE_BUY;
            request.price = (request.type == ORDER_TYPE_SELL) ? 
                           SymbolInfoDouble(_Symbol, SYMBOL_BID) : 
                           SymbolInfoDouble(_Symbol, SYMBOL_ASK);
            request.deviation = 10;
            request.magic = MagicNumber;
            
            if(!OrderSend(request, result))
               Print("CloseAllPositions OrderSend failed, error: ", GetLastError());
         }
      }
   }
   
   Print("All positions closed!");
}

//+------------------------------------------------------------------+
bool IsNewsTime(int &minutesToNews)
{
   if(!EnableNewsFilter)
      return false;
   
   datetime currentTime = TimeCurrent();
   minutesToNews = 9999;
   
   for(int i = 0; i < ArraySize(newsEvents); i++)
   {
      datetime newsTime = newsEvents[i].eventTime;
      datetime startBlock = newsTime - NewsMinutesBefore * 60;
      datetime endBlock = newsTime + NewsMinutesAfter * 60;
      
      if(currentTime >= startBlock && currentTime <= endBlock)
      {
         minutesToNews = (int)((newsTime - currentTime) / 60);
         if(minutesToNews < 0) minutesToNews = 0;
         return true;
      }
      
      if(currentTime < startBlock)
      {
         int minsToStart = (int)((startBlock - currentTime) / 60);
         if(minsToStart < minutesToNews)
            minutesToNews = minsToStart;
      }
   }
   
   return false;
}

//+------------------------------------------------------------------+
bool IsDailyFilterTime(int &minutesToEvent)
{
   if(!EnableDailyTimeFilter)
      return false;
   
   MqlDateTime currentTime;
   TimeToStruct(TimeCurrent(), currentTime);
   
   MqlDateTime filterTime = currentTime;
   filterTime.hour = DailyFilterHour;
   filterTime.min = DailyFilterMinute;
   filterTime.sec = 0;
   
   datetime filterDateTime = StructToTime(filterTime);
   datetime startBlock = filterDateTime - NewsMinutesBefore * 60;
   datetime endBlock = filterDateTime + NewsMinutesAfter * 60;
   datetime now = TimeCurrent();
   
   if(now >= startBlock && now <= endBlock)
   {
      minutesToEvent = (int)((filterDateTime - now) / 60);
      if(minutesToEvent < 0) 
         minutesToEvent = (int)((endBlock - now) / 60);
      return true;
   }
   
   if(now < startBlock)
      minutesToEvent = (int)((startBlock - now) / 60);
   else
   {
      filterTime.day += 1;
      datetime tomorrowFilter = StructToTime(filterTime);
      datetime tomorrowStart = tomorrowFilter - NewsMinutesBefore * 60;
      minutesToEvent = (int)((tomorrowStart - now) / 60);
   }
   
   return false;
}

//+------------------------------------------------------------------+
void CreateDashboard()
{
   // Force top-left corner positioning
   ENUM_BASE_CORNER corner = CORNER_LEFT_UPPER;
   int x = 15;
   int y = 15;
   int width = 320;
   int height = 340;
   
   // Main panel background - solid, non-transparent
   CreateRectLabel("PanelBG", x, y, width, height, C'15,15,20', corner);
   CreateRectLabel("PanelBorder", x+3, y+3, width-6, height-6, C'25,27,35', corner);
   
   // Logo section - "fi" and "algo" in bold, larger text
   int logoY = y + 20;
   CreateText("LogoFi", x + 70, logoY, "fi", DashboardFiColor, 42, true, corner);
   CreateText("LogoAlgo", x + 125, logoY, "algo", DashboardAlgoColor, 42, true, corner);
   
   // Info section starts with gap after logo (no separator line)
   int infoStartY = logoY + 70;
   int labelX = x + 25;
   int valueX = x + width - 115;
   int rowGap = 30;
   
   // EA Status
   CreateText("StatusLabel", labelX, infoStartY, "EA Status", C'140,140,160', 10, false, corner);
   CreateText("StatusValue", valueX, infoStartY, "ACTIVE", CLR_STATUS_ACTIVE, 10, true, corner);
   
   // Account Number
   CreateText("AccLabel", labelX, infoStartY + rowGap, "Account", C'140,140,160', 10, false, corner);
   CreateText("AccValue", valueX, infoStartY + rowGap, "", CLR_TEXT_WHITE, 10, true, corner);
   
   // Balance
   CreateText("BalLabel", labelX, infoStartY + rowGap*2, "Balance", C'140,140,160', 10, false, corner);
   CreateText("BalValue", valueX, infoStartY + rowGap*2, "", CLR_TEXT_WHITE, 10, true, corner);
   
   // Equity
   CreateText("EqLabel", labelX, infoStartY + rowGap*3, "Equity", C'140,140,160', 10, false, corner);
   CreateText("EqValue", valueX, infoStartY + rowGap*3, "", CLR_TEXT_WHITE, 10, true, corner);
   
   // Equity Used (Margin)
   CreateText("MarginLabel", labelX, infoStartY + rowGap*4, "Equity Used", C'140,140,160', 10, false, corner);
   CreateText("MarginValue", valueX, infoStartY + rowGap*4, "", CLR_TEXT_WHITE, 10, true, corner);
   
   // Running P/L
   CreateText("PlLabel", labelX, infoStartY + rowGap*5, "Running P/L", C'140,140,160', 10, false, corner);
   CreateText("PlValue", valueX, infoStartY + rowGap*5, "", CLR_TEXT_GREEN, 10, true, corner);
   
   // Open Trades
   CreateText("TradesLabel", labelX, infoStartY + rowGap*6, "Open Trades", C'140,140,160', 10, false, corner);
   CreateText("TradesValue", valueX, infoStartY + rowGap*6, "", CLR_TEXT_WHITE, 10, true, corner);
   
   // Buy/Sell Count
   CreateText("BuySellLabel", labelX, infoStartY + rowGap*7, "Buy / Sell", C'140,140,160', 10, false, corner);
   CreateText("BuySellValue", valueX, infoStartY + rowGap*7, "", CLR_TEXT_WHITE, 10, true, corner);
}

//+------------------------------------------------------------------+
void UpdateDashboard(int buyCount, int sellCount, double stochValue, bool tradingAllowed, int minsToNews)
{
   // EA Status
   string eaStatus = tradingAllowed ? "ACTIVE" : "PAUSED";
   color statusColor = tradingAllowed ? CLR_STATUS_ACTIVE : C'255,140,0';
   ObjectSetString(0, "StatusValue", OBJPROP_TEXT, eaStatus);
   ObjectSetInteger(0, "StatusValue", OBJPROP_COLOR, statusColor);
   
   // Account Number
   long accountNumber = AccountInfoInteger(ACCOUNT_LOGIN);
   ObjectSetString(0, "AccValue", OBJPROP_TEXT, IntegerToString(accountNumber));
   
   // Balance
   double balance = AccountInfoDouble(ACCOUNT_BALANCE);
   string currency = AccountInfoString(ACCOUNT_CURRENCY);
   ObjectSetString(0, "BalValue", OBJPROP_TEXT, DoubleToString(balance, 2) + " " + currency);
   
   // Equity
   double equity = AccountInfoDouble(ACCOUNT_EQUITY);
   ObjectSetString(0, "EqValue", OBJPROP_TEXT, DoubleToString(equity, 2) + " " + currency);
   
   // Equity Used (Margin)
   double margin = AccountInfoDouble(ACCOUNT_MARGIN);
   double marginPercent = (balance > 0) ? (margin / balance) * 100 : 0;
   ObjectSetString(0, "MarginValue", OBJPROP_TEXT, DoubleToString(marginPercent, 2) + "%");
   
   // Running P/L with color coding
   double profit = equity - balance;
   ObjectSetString(0, "PlValue", OBJPROP_TEXT, DoubleToString(profit, 2) + " " + currency);
   
   // Color: Yellow for profit, Red for loss, White for zero
   color plColor = CLR_TEXT_WHITE;
   if(profit > 0)
      plColor = CLR_TEXT_YELLOW;
   else if(profit < 0)
      plColor = CLR_TEXT_RED;
   
   ObjectSetInteger(0, "PlValue", OBJPROP_COLOR, plColor);
   
   // Open Trades
   int totalTrades = buyCount + sellCount;
   ObjectSetString(0, "TradesValue", OBJPROP_TEXT, IntegerToString(totalTrades));
   
   // Buy/Sell Count
   string buySellText = IntegerToString(buyCount) + " / " + IntegerToString(sellCount);
   ObjectSetString(0, "BuySellValue", OBJPROP_TEXT, buySellText);
   
   ChartRedraw();
}

//+------------------------------------------------------------------+
void CreateRectLabel(string name, int x, int y, int width, int height, color clr, ENUM_BASE_CORNER corner)
{
   ObjectCreate(0, name, OBJ_RECTANGLE_LABEL, 0, 0, 0);
   ObjectSetInteger(0, name, OBJPROP_XDISTANCE, x);
   ObjectSetInteger(0, name, OBJPROP_YDISTANCE, y);
   ObjectSetInteger(0, name, OBJPROP_XSIZE, width);
   ObjectSetInteger(0, name, OBJPROP_YSIZE, height);
   ObjectSetInteger(0, name, OBJPROP_BGCOLOR, clr);
   ObjectSetInteger(0, name, OBJPROP_BORDER_TYPE, BORDER_FLAT);
   ObjectSetInteger(0, name, OBJPROP_CORNER, corner);
   ObjectSetInteger(0, name, OBJPROP_BACK, false);
   ObjectSetInteger(0, name, OBJPROP_SELECTABLE, false);
   ObjectSetInteger(0, name, OBJPROP_HIDDEN, true);
}

//+------------------------------------------------------------------+
void CreateText(string name, int x, int y, string text, color clr, int fontSize, bool bold, ENUM_BASE_CORNER corner)
{
   ObjectCreate(0, name, OBJ_LABEL, 0, 0, 0);
   ObjectSetInteger(0, name, OBJPROP_XDISTANCE, x);
   ObjectSetInteger(0, name, OBJPROP_YDISTANCE, y);
   ObjectSetString(0, name, OBJPROP_TEXT, text);
   ObjectSetInteger(0, name, OBJPROP_COLOR, clr);
   ObjectSetInteger(0, name, OBJPROP_FONTSIZE, fontSize);
   ObjectSetString(0, name, OBJPROP_FONT, bold ? "Arial Bold" : "Arial");
   ObjectSetInteger(0, name, OBJPROP_CORNER, corner);
   ObjectSetInteger(0, name, OBJPROP_SELECTABLE, false);
}

//+------------------------------------------------------------------+
void DeleteDashboard()
{
   ObjectDelete(0, "PanelBG");
   ObjectDelete(0, "PanelBorder");
   ObjectDelete(0, "LogoFi");
   ObjectDelete(0, "LogoAlgo");
   ObjectDelete(0, "StatusLabel");
   ObjectDelete(0, "StatusValue");
   ObjectDelete(0, "AccLabel");
   ObjectDelete(0, "AccValue");
   ObjectDelete(0, "BalLabel");
   ObjectDelete(0, "BalValue");
   ObjectDelete(0, "EqLabel");
   ObjectDelete(0, "EqValue");
   ObjectDelete(0, "MarginLabel");
   ObjectDelete(0, "MarginValue");
   ObjectDelete(0, "PlLabel");
   ObjectDelete(0, "PlValue");
   ObjectDelete(0, "TradesLabel");
   ObjectDelete(0, "TradesValue");
   ObjectDelete(0, "BuySellLabel");
   ObjectDelete(0, "BuySellValue");
}

//+------------------------------------------------------------------+
bool CheckAnyPositionProfit()
{
   for(int i = PositionsTotal() - 1; i >= 0; i--)
   {
      ulong ticket = PositionGetTicket(i);
      if(PositionSelectByTicket(ticket))
      {
         if(PositionGetString(POSITION_SYMBOL) == _Symbol && 
            PositionGetInteger(POSITION_MAGIC) == MagicNumber)
         {
            double openPrice = PositionGetDouble(POSITION_PRICE_OPEN);
            double volume = PositionGetDouble(POSITION_VOLUME);
            ENUM_POSITION_TYPE posType = (ENUM_POSITION_TYPE)PositionGetInteger(POSITION_TYPE);
            
            // Determine level based on lot size
            int posLevel = -1;
            for(int j = 0; j < 6; j++)
            {
               if(MathAbs(volume - lotSizes[j]) < 0.001)
               {
                  posLevel = j;
                  break;
               }
            }
            
            // Set profit factor based on level
            int currentProfitFactor;
            if(posLevel >= 0 && posLevel <= 2)
               currentProfitFactor = 300; // Level 0, 1, 2 (0.01, 0.1, 1.0)
            else
               currentProfitFactor = 100; // Level 3+ (10, 100, 200)
            
            double currentPrice = (posType == POSITION_TYPE_BUY) ? 
                                  SymbolInfoDouble(_Symbol, SYMBOL_BID) : 
                                  SymbolInfoDouble(_Symbol, SYMBOL_ASK);
            
            double pipProfit = 0;
            
            if(posType == POSITION_TYPE_BUY)
               pipProfit = (currentPrice - openPrice) / pipValue;
            else
               pipProfit = (openPrice - currentPrice) / pipValue;
            
            if(pipProfit >= currentProfitFactor)
            {
               Print("Position Level ", posLevel, " (Lot: ", volume, ") reached ", 
                     DoubleToString(pipProfit, 1), " pips profit (Target: ", 
                     currentProfitFactor, " pips) - Closing ALL");
               return true;
            }
         }
      }
   }
   
   return false;
}
//+------------------------------------------------------------------+

//+------------------------------------------------------------------+
//| TradiFive Cloud Engine - Maps closed trades dynamically to Webhook  |
//+------------------------------------------------------------------+
void SendTradeToDatabase(ulong ticket, string symbol, string type, double lot, double profit, long timeClosed = 0)
  {
   string jsonPayload = StringFormat("{\"activation_key\":\"%s\",\"ticket\":\"%llu\",\"symbol\":\"%s\",\"trade_type\":\"%s\",\"lot_size\":%f,\"profit\":%f,\"closed_at_sec\":%I64d}",
                                     InpActivationKey, ticket, symbol, type, lot, profit, timeClosed);

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
   
   int res = WebRequest("POST", InpWebhookURL, headers, 5000, cleanPostData, result, resultHeaders);
   if(res == 200 || res == 201) Print("TradiFive successfully synchronized trade ", ticket);
  }

//+------------------------------------------------------------------+
//| Transaction Event Handler                                        |
//+------------------------------------------------------------------+
void OnTradeTransaction(const MqlTradeTransaction &trans,
                        const MqlTradeRequest &request,
                        const MqlTradeResult &result)
  {
   if(trans.type == TRADE_TRANSACTION_DEAL_ADD)
     {
      if(HistoryDealSelect(trans.deal))
        {
         long entry = HistoryDealGetInteger(trans.deal, DEAL_ENTRY);
         if(entry == DEAL_ENTRY_OUT || entry == DEAL_ENTRY_INOUT)
           {
            ulong dealTicket = trans.deal;
            string symbol = HistoryDealGetString(dealTicket, DEAL_SYMBOL);
            double volume = HistoryDealGetDouble(dealTicket, DEAL_VOLUME);
            double pureProfit = HistoryDealGetDouble(dealTicket, DEAL_PROFIT);
            double swap = HistoryDealGetDouble(dealTicket, DEAL_SWAP);
            double commission = HistoryDealGetDouble(dealTicket, DEAL_COMMISSION);
            double netProfit = pureProfit + swap + commission;
            long dealType = HistoryDealGetInteger(dealTicket, DEAL_TYPE);
            string sType = (dealType == DEAL_TYPE_BUY) ? "BUY" : "SELL";
            long timeClosed = HistoryDealGetInteger(dealTicket, DEAL_TIME);
            
            SendTradeToDatabase(dealTicket, symbol, sType, volume, netProfit, timeClosed);
           }
        }
     }
  }

//+------------------------------------------------------------------+
void CheckGridEntry(ENUM_ORDER_TYPE direction, int currentCount)
{
   if(currentCount >= MaxMartingaleSteps)
      return;
   
   double mostRecentOpenPrice = 0;
   datetime mostRecentOpenTime = 0;
   ulong mostRecentTicket = 0;
   int mostRecentLevel = -1;
   
   for(int i = PositionsTotal() - 1; i >= 0; i--)
   {
      ulong ticket = PositionGetTicket(i);
      if(PositionSelectByTicket(ticket))
      {
         if(PositionGetString(POSITION_SYMBOL) == _Symbol && 
            PositionGetInteger(POSITION_MAGIC) == MagicNumber)
         {
            ENUM_POSITION_TYPE posType = (ENUM_POSITION_TYPE)PositionGetInteger(POSITION_TYPE);
            
            if((direction == ORDER_TYPE_BUY && posType == POSITION_TYPE_BUY) ||
               (direction == ORDER_TYPE_SELL && posType == POSITION_TYPE_SELL))
            {
               datetime openTime = (datetime)PositionGetInteger(POSITION_TIME);
               
               if(openTime > mostRecentOpenTime)
               {
                  mostRecentOpenTime = openTime;
                  mostRecentOpenPrice = PositionGetDouble(POSITION_PRICE_OPEN);
                  mostRecentTicket = ticket;
                  
                  double volume = PositionGetDouble(POSITION_VOLUME);
                  for(int j = 0; j < 6; j++)
                  {
                     if(MathAbs(volume - lotSizes[j]) < 0.001)
                     {
                        mostRecentLevel = j;
                        break;
                     }
                  }
               }
            }
         }
      }
   }
   
   if(mostRecentTicket == 0 || mostRecentLevel == -1 || mostRecentLevel >= 5)
      return;
   
   double currentPrice = (direction == ORDER_TYPE_BUY) ? 
                         SymbolInfoDouble(_Symbol, SYMBOL_BID) : 
                         SymbolInfoDouble(_Symbol, SYMBOL_ASK);
   
   double pipDistance = 0;
   
   if(direction == ORDER_TYPE_BUY)
      pipDistance = (mostRecentOpenPrice - currentPrice) / pipValue;
   else
      pipDistance = (currentPrice - mostRecentOpenPrice) / pipValue;
   
   if(pipDistance >= GridEntryDistance)
   {
      int nextLevel = mostRecentLevel + 1;
      double nextLotSize = lotSizes[nextLevel];
      
      bool nextLevelExists = false;
      
      for(int i = PositionsTotal() - 1; i >= 0; i--)
      {
         ulong ticket = PositionGetTicket(i);
         if(PositionSelectByTicket(ticket))
         {
            if(PositionGetString(POSITION_SYMBOL) == _Symbol && 
               PositionGetInteger(POSITION_MAGIC) == MagicNumber)
            {
               ENUM_POSITION_TYPE posType = (ENUM_POSITION_TYPE)PositionGetInteger(POSITION_TYPE);
               
               if((direction == ORDER_TYPE_BUY && posType == POSITION_TYPE_BUY) ||
                  (direction == ORDER_TYPE_SELL && posType == POSITION_TYPE_SELL))
               {
                  double volume = PositionGetDouble(POSITION_VOLUME);
                  if(MathAbs(volume - nextLotSize) < 0.001)
                  {
                     nextLevelExists = true;
                     break;
                  }
               }
            }
         }
      }
      
      if(!nextLevelExists)
      {
         Print("Opening level ", nextLevel, " with lot ", nextLotSize);
         OpenPosition(direction, nextLotSize, nextLevel);
      }
   }
}

//+------------------------------------------------------------------+
void OpenPosition(ENUM_ORDER_TYPE orderType, double lotSize, int level)
{
   MqlTradeRequest request = {};
   MqlTradeResult result = {};
   
   double price = (orderType == ORDER_TYPE_BUY) ? 
                  SymbolInfoDouble(_Symbol, SYMBOL_ASK) : 
                  SymbolInfoDouble(_Symbol, SYMBOL_BID);
   
   request.action = TRADE_ACTION_DEAL;
   request.symbol = _Symbol;
   request.volume = lotSize;
   request.type = orderType;
   request.price = price;
   request.sl = 0;
   request.tp = 0;
   request.deviation = 10;
   request.magic = MagicNumber;
   request.comment = TradeComment + " L" + IntegerToString(level);
   
   if(OrderSend(request, result))
   {
      Print("Position opened: ", orderType == ORDER_TYPE_BUY ? "BUY" : "SELL", 
            " Level: ", level, " Lot: ", lotSize);
   }
   else
   {
      Print("OrderSend error: ", GetLastError());
   }
}

//+------------------------------------------------------------------+
void CountPositions(int &buyCount, int &sellCount, double &buyVol, double &sellVol)
{
   buyCount = 0;
   sellCount = 0;
   buyVol = 0;
   sellVol = 0;
   
   for(int i = PositionsTotal() - 1; i >= 0; i--)
   {
      ulong ticket = PositionGetTicket(i);
      if(PositionSelectByTicket(ticket))
      {
         if(PositionGetString(POSITION_SYMBOL) == _Symbol && 
            PositionGetInteger(POSITION_MAGIC) == MagicNumber)
         {
            double vol = PositionGetDouble(POSITION_VOLUME);
            if(PositionGetInteger(POSITION_TYPE) == POSITION_TYPE_BUY)
            {
               buyCount++;
               buyVol += vol;
            }
            else
            {
               sellCount++;
               sellVol += vol;
            }
         }
      }
   }
}
//+------------------------------------------------------------------+