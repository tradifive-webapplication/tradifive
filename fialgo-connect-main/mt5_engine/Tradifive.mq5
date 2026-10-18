//+------------------------------------------------------------------+
//|                                                    Tradifive.mq5 |
//|                         Grid / averaging basket EA for MT5       |
//|        v3.00 - landscape dashboard + live settings + day control  |
//+------------------------------------------------------------------+
#property copyright "Tradifive"
#property link      ""
#property version   "2.00"
#property description "Tradifive - grid / averaging basket Expert Advisor."
#property description "REQUIRES a MetaTrader 5 HEDGING account."
#property description "HIGH RISK: test in Strategy Tester, then Demo, before any live use."

//+------------------------------------------------------------------+
//| !!!                        RISK WARNING                       !!! |
//| Grid / averaging: every time price moves against the basket      |
//| another, LARGER position is added. Drawdown and margin usage can |
//| grow very quickly and can lead to a margin call / stop-out.      |
//| Test in Strategy Tester, then Demo, before any live use.         |
//| Do NOT remove the safety controls.                               |
//+------------------------------------------------------------------+

#include <Trade/Trade.mqh>
//====================== DASHBOARD + SETTINGS MODULE ======================
//+------------------------------------------------------------------+
//|                                         TradifiveDashboard.mqh   |
//|  Smooth canvas dashboard (anti-aliased gauges, animated needles, |
//|  live trades table) + click-to-edit settings page for Tradifive. |
//|  Put this file in the SAME folder as Tradifive.mq5               |
//+------------------------------------------------------------------+

#include <Canvas/Canvas.mqh>

enum ENUM_TF_THEME
{
   TF_THEME_CYAN   = 0,   // Blue
   TF_THEME_GOLD   = 1,   // Amber
   TF_THEME_VIOLET = 2    // Violet
};

//+------------------------------------------------------------------+
//| INPUTS (initial values - everything marked "live" can be changed |
//| from the dashboard SET page while the EA is running)             |
//+------------------------------------------------------------------+
input group "=== Identification ==="
input ulong  MagicNumber               = 20261007;   // Magic number (only trades with this magic are managed)

input group "=== Strategy (live: SET page) ==="
input double InpStartLot               = 0.01;       // Lot of level 0
input double InpLotIncrement           = 0.01;       // Lot added per level (Lot = StartLot + LotIncrement x level)
input double InpGridDistance           = 4.00;       // Grid distance (PRICE units)
input double InpTPDistance             = 2.00;       // Basket TP distance from weighted average (PRICE units)
input bool   InpPlaceTPOnPositions     = true;       // Put basket TP on every position (SL is NEVER set)
input int    InpStartDirection         = 0;          // 0 = BUY, 1 = SELL (used only when pending start is OFF)
input bool   InpStartWithPendingOrders = true;       // Start with BUY + SELL pending orders
input double InpStartPendingDistance   = 1.50;       // Start order distance (price units)
input int    InpStartPendingMode       = 1;          // 0 = LIMIT, 1 = STOP

input group "=== Safety limits (live: SET page) ==="
input int    InpMaximumOrdersPerBasket = 50;         // Max open positions in one basket
input double InpMaximumLot             = 10.00;      // Max lot of a single grid position
input double InpMaximumTotalLots       = 50.00;      // Max total lots of all Tradifive positions
input bool   InpUseSpreadFilter        = true;       // Block NEW trades when spread too high
input int    InpMaximumSpreadPoints    = 500;        // Max spread in POINTS
input bool   InpUseDrawdownProtection  = false;      // Emergency protection (close everything and halt)
input double InpMaximumDrawdownPercent = 30.0;       // Floating loss as % of balance that triggers protection
input bool   ClearHaltOnInit           = false;      // true = clear a previous drawdown halt when EA starts

input group "=== Daily / session control (live: SET page) ==="
input bool   InpDailyTargetOn          = true;       // Stop for the day when the daily profit target is reached
input double InpDailyTargetPct         = 3.0;        // Daily profit target % (2 - 5) of day-start balance
input bool   InpDailyLossOn            = false;      // Stop for the day when daily loss limit is reached
input double InpDailyLossPct           = 10.0;       // Daily loss limit (% of day-start balance)
input bool   InpSessionOn              = true;       // Only START new cycles inside the session window
input string InpSessionStartTime       = "09:30";    // Session start (HH:MM)
input string InpSessionEndTime         = "12:00";    // Session end (HH:MM)
input bool   InpSessionLocalClock      = true;       // true = use PC (local) clock, false = broker server clock
input bool   InpSessionRunPast         = true;       // After session end keep running until the daily target is reached
input bool   InpCloseAtSessionEnd      = false;      // Close all positions when the session ends (ignored if run-past)

input group "=== Execution / display ==="
input int    DeviationPoints           = 50;         // Max slippage (points) for market orders
input bool   ShowGridLevels            = true;       // Show next grid price line on chart

input group "=== License ==="
input string LicenseKey                = "";         // License key (or enter it in the dashboard: SET > License key)
input bool   RequireLicense            = true;       // true = no NEW trades without a valid license (after the trial)
input int    TrialDays                 = 0;          // Free trial length in days (0 = no trial, requires account license)          // Free trial length in days (0 = no trial)
input string SupportContact            = "support@tradifive.com";   // Shown to the user when the license is not valid

input group "=== Dashboard ==="
input bool          ShowDashboard      = true;       // Show the dashboard
input bool          ApplyChartTheme    = true;       // Light-blue candles + dark chart while the EA runs (restored on removal)
input int           DashX              = 10;         // Dashboard X offset
input int           DashY              = 20;         // Dashboard Y offset
input ENUM_TF_THEME DashTheme          = TF_THEME_CYAN; // Colour theme
input bool          UseSavedSettings   = true;       // Remember settings changed in the SET page (per symbol+magic)

//+------------------------------------------------------------------+
//| Live settings store. The EA code keeps using the old names       |
//| (StartLot, GridDistance ...) through the macros below.           |
//+------------------------------------------------------------------+
enum
{
   S_START_LOT=0, S_LOT_INC, S_GRID, S_TP, S_TP_POS, S_START_DIR, S_PEND_ON, S_PEND_DIST, S_PEND_MODE,
   S_MAX_ORD, S_MAX_LOT, S_MAX_TOT, S_SPR_ON, S_SPR_MAX, S_DD_ON, S_DD_PCT,
   S_DT_ON, S_DT_PCT, S_DL_ON, S_DL_PCT, S_SES_ON, S_SES_START, S_SES_END, S_SES_CLOSE, S_SES_CLOCK, S_SES_RUNPAST,
   S_COUNT
};

double g_s[S_COUNT];
bool   g_settingsChanged=false;

#define StartLot                 (g_s[S_START_LOT])
#define LotIncrement             (g_s[S_LOT_INC])
#define GridDistance             (g_s[S_GRID])
#define TPDistance               (g_s[S_TP])
#define PlaceTPOnPositions       (g_s[S_TP_POS]>0.5)
#define StartDirection           ((int)MathRound(g_s[S_START_DIR]))
#define StartWithPendingOrders   (g_s[S_PEND_ON]>0.5)
#define StartBuyPendingDistance  (g_s[S_PEND_DIST])
#define StartSellPendingDistance (g_s[S_PEND_DIST])
#define StartPendingMode         ((int)MathRound(g_s[S_PEND_MODE]))
#define MaximumOrdersPerBasket   ((int)MathRound(g_s[S_MAX_ORD]))
#define MaximumLot               (g_s[S_MAX_LOT])
#define MaximumTotalLots         (g_s[S_MAX_TOT])
#define UseSpreadFilter          (g_s[S_SPR_ON]>0.5)
#define MaximumSpreadPoints      ((int)MathRound(g_s[S_SPR_MAX]))
#define UseDrawdownProtection    (g_s[S_DD_ON]>0.5)
#define MaximumDrawdownPercent   (g_s[S_DD_PCT])
#define DailyTargetOn            (g_s[S_DT_ON]>0.5)
#define DailyTargetPct           (g_s[S_DT_PCT])
#define DailyLossOn              (g_s[S_DL_ON]>0.5)
#define DailyLossPct             (g_s[S_DL_PCT])
#define SessionOn                (g_s[S_SES_ON]>0.5)
#define SessionStart             ((int)MathRound(g_s[S_SES_START]))
#define SessionEnd               ((int)MathRound(g_s[S_SES_END]))
#define CloseAtSessionEnd        (g_s[S_SES_CLOSE]>0.5)
#define SessionLocal             (g_s[S_SES_CLOCK]>0.5)
#define SessionRunPast           (g_s[S_SES_RUNPAST]>0.5)

#define TF_NF 26

//--- settings field table (drives the SET page)
struct TFField
{
   string label;
   int    kind;     // 0 number, 1 ON/OFF, 2 choice (two options)
   int    idx;
   double mn;
   double mx;
   int    dec;
   int    dep;      // index of a bool setting this one depends on (-1 none)
   bool   depInv;   // true = dimmed when the dependency is ON
};
TFField g_f[TF_NF];

void TFF(const int n,const string label,const int kind,const int idx,const double mn,const double mx,const int dec,const int dep=-1,const bool inv=false)
{
   g_f[n].label=label; g_f[n].kind=kind; g_f[n].idx=idx; g_f[n].mn=mn; g_f[n].mx=mx;
   g_f[n].dec=dec; g_f[n].dep=dep; g_f[n].depInv=inv;
}

string TFHM(const int m)
{
   return StringFormat("%02d:%02d",m/60,m%60);
}

// "9:30", "09.30", "930", "9" -> minutes since midnight, -1 if invalid
int TFParseTime(string s)
{
   StringReplace(s,".",":");
   StringReplace(s," ","");
   const int p=StringFind(s,":");
   int h=0,m=0;
   if(p>=0)
   {
      h=(int)StringToInteger(StringSubstr(s,0,p));
      m=(int)StringToInteger(StringSubstr(s,p+1));
   }
   else
   {
      const long v=StringToInteger(s);
      if(StringLen(s)>=3) { h=(int)(v/100); m=(int)(v%100); }
      else                { h=(int)v; m=0; }
   }
   if(h<0 || h>23 || m<0 || m>59)
      return -1;
   return h*60+m;
}

void TFS_BuildFields()
{
   TFF(0, "Start lot",            0,S_START_LOT,0.01,100.0,2);
   TFF(1, "Lot increment",        0,S_LOT_INC,  0.0, 10.0, 2);
   TFF(2, "Grid gap (price)",     0,S_GRID,     0.01,1000.0,2);
   TFF(3, "TP distance (price)",  0,S_TP,       0.01,1000.0,2);
   TFF(4, "First trade",          2,S_START_DIR,0,1,0,S_PEND_ON,true);
   TFF(5, "Start with pending",   1,S_PEND_ON,  0,1,0);
   TFF(6, "Start order type",     2,S_PEND_MODE,0,1,0,S_PEND_ON);
   TFF(7, "Start distance",       0,S_PEND_DIST,0.01,1000.0,2,S_PEND_ON);
   TFF(8, "TP on positions",      1,S_TP_POS,   0,1,0);
   TFF(9, "Max orders / basket",  0,S_MAX_ORD,  1,1000,0);
   TFF(10,"Max lot",              0,S_MAX_LOT,  0.01,1000.0,2);
   TFF(11,"Max total lots",       0,S_MAX_TOT,  0.01,10000.0,2);
   TFF(12,"Spread filter",        1,S_SPR_ON,   0,1,0);
   TFF(13,"Max spread (points)",  0,S_SPR_MAX,  0,100000,0,S_SPR_ON);
   TFF(14,"Drawdown protect",     1,S_DD_ON,    0,1,0);
   TFF(15,"Max drawdown %",       0,S_DD_PCT,   0.5,100.0,1,S_DD_ON);
   TFF(16,"Daily profit target",  1,S_DT_ON,    0,1,0);
   TFF(17,"Daily target % (2-5)", 0,S_DT_PCT,   2.0,5.0,1,S_DT_ON);
   TFF(18,"Daily loss limit",     1,S_DL_ON,    0,1,0);
   TFF(19,"Daily loss %",         0,S_DL_PCT,   0.1,100.0,1,S_DL_ON);
   TFF(20,"Session window",       1,S_SES_ON,   0,1,0);
   TFF(21,"Start time (HH:MM)",   3,S_SES_START,0,1439,0,S_SES_ON);
   TFF(22,"End time (HH:MM)",     3,S_SES_END,  0,1439,0,S_SES_ON);
   TFF(23,"Clock: server / PC",   2,S_SES_CLOCK,0,1,0,S_SES_ON);
   TFF(24,"Run past end to target",1,S_SES_RUNPAST,0,1,0,S_SES_ON);
   TFF(25,"Close at session end", 1,S_SES_CLOSE,0,1,0,S_SES_ON);
}

string TFSetKey(const int i)
{
   return "TFS3_"+IntegerToString((long)MagicNumber)+"_"+_Symbol+"_"+IntegerToString(i);
}

double TFClamp(const double v,const double lo,const double hi);

void TFS_LoadInputs()
{
   g_s[S_START_LOT]=InpStartLot;           g_s[S_LOT_INC]=InpLotIncrement;
   g_s[S_GRID]=InpGridDistance;            g_s[S_TP]=InpTPDistance;
   g_s[S_TP_POS]=InpPlaceTPOnPositions?1.0:0.0;
   g_s[S_START_DIR]=(double)InpStartDirection;
   g_s[S_PEND_ON]=InpStartWithPendingOrders?1.0:0.0;
   g_s[S_PEND_DIST]=InpStartPendingDistance;
   g_s[S_PEND_MODE]=(double)InpStartPendingMode;
   g_s[S_MAX_ORD]=(double)InpMaximumOrdersPerBasket;
   g_s[S_MAX_LOT]=InpMaximumLot;           g_s[S_MAX_TOT]=InpMaximumTotalLots;
   g_s[S_SPR_ON]=InpUseSpreadFilter?1.0:0.0;
   g_s[S_SPR_MAX]=(double)InpMaximumSpreadPoints;
   g_s[S_DD_ON]=InpUseDrawdownProtection?1.0:0.0;
   g_s[S_DD_PCT]=InpMaximumDrawdownPercent;
   g_s[S_DT_ON]=InpDailyTargetOn?1.0:0.0;  g_s[S_DT_PCT]=InpDailyTargetPct;
   g_s[S_DL_ON]=InpDailyLossOn?1.0:0.0;    g_s[S_DL_PCT]=InpDailyLossPct;
   g_s[S_SES_ON]=InpSessionOn?1.0:0.0;
   int s0=TFParseTime(InpSessionStartTime);
   int e0=TFParseTime(InpSessionEndTime);
   if(s0<0) s0=570;
   if(e0<0) e0=720;
   g_s[S_SES_START]=(double)s0;
   g_s[S_SES_END]=(double)e0;
   g_s[S_SES_CLOSE]=InpCloseAtSessionEnd?1.0:0.0;
   g_s[S_SES_CLOCK]=InpSessionLocalClock?1.0:0.0;
   g_s[S_SES_RUNPAST]=InpSessionRunPast?1.0:0.0;
   g_s[S_DT_PCT]=TFClamp(InpDailyTargetPct,2.0,5.0);
}

void TFS_Load()
{
   TFS_BuildFields();
   TFS_LoadInputs();
   if(UseSavedSettings && !MQLInfoInteger(MQL_TESTER))
   {
      for(int i=0;i<S_COUNT;i++)
      {
         const string k=TFSetKey(i);
         if(GlobalVariableCheck(k))
            g_s[i]=GlobalVariableGet(k);
      }
   }
}

void TFS_Save()
{
   if(MQLInfoInteger(MQL_TESTER))
      return;
   for(int i=0;i<S_COUNT;i++)
      GlobalVariableSet(TFSetKey(i),g_s[i]);
}

double TFClamp(const double v,const double lo,const double hi)
{
   return v<lo?lo:(v>hi?hi:v);
}

void TFS_Set(const int fi,double v)
{
   if(g_f[fi].kind==0)
   {
      v=TFClamp(v,g_f[fi].mn,g_f[fi].mx);
      if(g_f[fi].dec==0)
         v=MathRound(v);
   }
   else
      v=(v>0.5)?1.0:0.0;
   g_s[g_f[fi].idx]=v;
   g_settingsChanged=true;
   TFS_Save();
}

void TFS_Reset()
{
   TFS_LoadInputs();
   g_settingsChanged=true;
   TFS_Save();
}

string TFChoice(const int idx,const double v)
{
   if(idx==S_START_DIR)
      return (v>0.5)?"SELL":"BUY";
   if(idx==S_SES_CLOCK)
      return (v>0.5)?"PC":"SRV";
   return (v>0.5)?"STOP":"LIMIT";
}

string TFFmt(const int fi)
{
   const double v=g_s[g_f[fi].idx];
   if(g_f[fi].kind==1)
      return (v>0.5)?"ON":"OFF";
   if(g_f[fi].kind==2)
      return TFChoice(g_f[fi].idx,v);
   if(g_f[fi].kind==3)
      return TFHM((int)MathRound(v));
   string s=DoubleToString(v,g_f[fi].dec);
   const int ix=g_f[fi].idx;
   if(ix==S_DD_PCT || ix==S_DT_PCT || ix==S_DL_PCT)
      s+="%";
   return s;
}

//+------------------------------------------------------------------+
//| Session / history helpers (shared with the EA)                   |
//+------------------------------------------------------------------+
int TFNowMin()
{
   MqlDateTime d;
   TimeToStruct(SessionLocal?TimeLocal():TimeCurrent(),d);
   return d.hour*60+d.min;
}

// inside the configured window
bool TFInWindow()
{
   if(!SessionOn)
      return true;
   const int m=TFNowMin();
   const int s0=SessionStart;
   const int e0=SessionEnd;
   if(s0==e0)
      return true;
   if(s0<e0)
      return (m>=s0 && m<e0);
   return (m>=s0 || m<e0);
}

// new cycles allowed: inside the window, or after its end while the daily target is still pending
bool TFSessionOpen()
{
   if(TFInWindow())
      return true;
   if(SessionOn && SessionRunPast && DailyTargetOn && SessionStart<SessionEnd && TFNowMin()>=SessionEnd)
      return true;
   return false;
}

double   g_hWd=0.0;
double   g_hDep=0.0;
double   g_hToday=0.0;
double   g_hTotal=0.0;
int      g_hWins=0;
int      g_hLoss=0;
datetime g_hAt=0;

// Realized result of this EA (symbol + magic): today / all time, win counts
void TFHist(const bool force=false)
{
   const datetime t=TimeLocal();
   if(!force && g_hAt!=0 && t>=g_hAt && (t-g_hAt)<2)
      return;
   const datetime now=TimeCurrent();
   if(!HistorySelect(0,now+86400))
      return;
   g_hAt=t;
   const datetime ds=now-(now%86400);
   double today=0.0,total=0.0,wd=0.0,dp=0.0;
   int w=0,l=0;
   const int n=HistoryDealsTotal();
   for(int i=0;i<n;i++)
   {
      const ulong d=HistoryDealGetTicket(i);
      if(d==0)
         continue;
      const ENUM_DEAL_TYPE dt0=(ENUM_DEAL_TYPE)HistoryDealGetInteger(d,DEAL_TYPE);
      if(dt0==DEAL_TYPE_BALANCE)
      {
         const double bp=HistoryDealGetDouble(d,DEAL_PROFIT);
         if(bp<0.0)      wd+=-bp;
         else if(bp>0.0) dp+=bp;
         continue;
      }
      if(HistoryDealGetString(d,DEAL_SYMBOL)!=_Symbol)
         continue;
      if((ulong)HistoryDealGetInteger(d,DEAL_MAGIC)!=MagicNumber)
         continue;
      const ENUM_DEAL_TYPE dt=(ENUM_DEAL_TYPE)HistoryDealGetInteger(d,DEAL_TYPE);
      if(dt!=DEAL_TYPE_BUY && dt!=DEAL_TYPE_SELL)
         continue;
      const double pl=HistoryDealGetDouble(d,DEAL_PROFIT)+HistoryDealGetDouble(d,DEAL_SWAP)
                     +HistoryDealGetDouble(d,DEAL_COMMISSION)+HistoryDealGetDouble(d,DEAL_FEE);
      total+=pl;
      if((datetime)HistoryDealGetInteger(d,DEAL_TIME)>=ds)
         today+=pl;
      const ENUM_DEAL_ENTRY en=(ENUM_DEAL_ENTRY)HistoryDealGetInteger(d,DEAL_ENTRY);
      if(en==DEAL_ENTRY_OUT || en==DEAL_ENTRY_OUT_BY || en==DEAL_ENTRY_INOUT)
      {
         if(pl>0.0)      w++;
         else if(pl<0.0) l++;
      }
   }
   g_hWd=wd;
   g_hDep=dp;
   g_hToday=today;
   g_hTotal=total;
   g_hWins=w;
   g_hLoss=l;
}

double TFTodayRealized()
{
   TFHist(false);
   return g_hToday;
}

//+------------------------------------------------------------------+
//| Colours / small helpers                                          |
//+------------------------------------------------------------------+
#define TFC_TXT   ((uint)0xFFE6E7EA)
#define TFC_DIM   ((uint)0xFF8C8F98)
#define TFC_POS   ((uint)0xFF3DD68C)
#define TFC_NEG   ((uint)0xFFF0616D)
#define TFC_GOLD  ((uint)0xFFF0B90B)
#define TFC_VIO   ((uint)0xFF8B6CFF)
#define TFC_CARD1 ((uint)0xFF1D1D20)
#define TFC_CARD2 ((uint)0xFF161618)
#define TFC_BG1   ((uint)0xFF18181B)
#define TFC_BG2   ((uint)0xFF0F0F11)
#define TFC_LINE  ((uint)0xFF2C2C32)
#define TFC_TRACK ((uint)0xFF2C2C33)
#define TFC_BOX   ((uint)0xFF111113)
#define TFC_WHITE ((uint)0xFFFFFFFF)

#define TF_PAD      14
#define TF_PW       980
#define TF_PH_FULL  396
#define TF_PH_SET   452   // settings page height
#define TF_PH_MAIN  556   // main page height
#define TF_PH_MIN   44

const double TF_A0=2.35619449019;   // 135 deg
const double TF_SW=4.71238898038;   // 270 deg sweep
const double TF_G0=2.61799387799;   // 150 deg (speedometer start)
const double TF_GS=4.18879020479;   // 240 deg (speedometer sweep)

enum { H_NONE=0, H_SET=1, H_MIN=2, H_BACK=3, H_RESET=4, H_OVER=5, H_STATUS=6, H_LICKEY=7, H_LICACT=8, H_FIELD=100 };

double TFSat(const double v)
{
   return v<0.0?0.0:(v>1.0?1.0:v);
}

uint TFRGBA(const int r,const int g,const int b,const int a=255)
{
   return ((uint)a<<24)|((uint)r<<16)|((uint)g<<8)|(uint)b;
}

uint TFA(const uint c,const int a)
{
   return (c&0x00FFFFFF)|((uint)a<<24);
}

uint TFMix(const uint c0,const uint c1,const double t0)
{
   const double t=TFSat(t0);
   const int a=(int)(((c0>>24)&0xFF)*(1.0-t)+((c1>>24)&0xFF)*t+0.5);
   const int r=(int)(((c0>>16)&0xFF)*(1.0-t)+((c1>>16)&0xFF)*t+0.5);
   const int g=(int)(((c0>>8)&0xFF)*(1.0-t)+((c1>>8)&0xFF)*t+0.5);
   const int b=(int)((c0&0xFF)*(1.0-t)+(c1&0xFF)*t+0.5);
   return TFRGBA(r,g,b,a);
}

double TFAtan2(const double y,const double x)
{
   if(x>0.0)
      return MathArctan(y/x);
   if(x<0.0)
      return (y>=0.0)?MathArctan(y/x)+M_PI:MathArctan(y/x)-M_PI;
   if(y>0.0) return M_PI_2;
   if(y<0.0) return -M_PI_2;
   return 0.0;
}

string TFCcy()
{
   const string c=AccountInfoString(ACCOUNT_CURRENCY);
   return (c=="USD")?"$":c+" ";
}

string TFMoney(const double v,const bool sign=true)
{
   const bool neg=(v<-0.004);
   const string s=DoubleToString(MathAbs(v),2);
   const int dot=StringFind(s,".");
   const string ip=StringSubstr(s,0,dot);
   const string fp=StringSubstr(s,dot);
   string out="";
   const int n=StringLen(ip);
   for(int i=0;i<n;i++)
   {
      out+=StringSubstr(ip,i,1);
      const int rem=n-1-i;
      if(rem>0 && rem%3==0)
         out+=",";
   }
   return (neg?"-":((sign && v>0.004)?"+":""))+TFCcy()+out+fp;
}

uint TFSignClr(const double v)
{
   if(v>0.004)  return TFC_POS;
   if(v<-0.004) return TFC_NEG;
   return TFC_TXT;
}

string TFSymTf()
{
   string p=EnumToString((ENUM_TIMEFRAMES)Period());
   StringReplace(p,"PERIOD_","");
   return _Symbol+"  |  "+p;
}

//+------------------------------------------------------------------+
//| Canvas with anti-aliased primitives                              |
//+------------------------------------------------------------------+
class CCv : public CCanvas
{
public:
   int ox,oy,cw,ch;
   CCv():ox(0),oy(0),cw(0),ch(0){}

   // alpha-composite one pixel (canvas coordinates)
   void Put(const int x,const int y,const uint c,const double cov)
   {
      if(x<0 || y<0 || x>=cw || y>=ch)
         return;
      const double sa=(double)((c>>24)&0xFF)/255.0*(cov>1.0?1.0:cov);
      if(sa<=0.004)
         return;
      const uint d=PixelGet(x,y);
      const double da=(double)((d>>24)&0xFF)/255.0;
      const double oa=sa+da*(1.0-sa);
      const double k=da*(1.0-sa);
      const int r=(int)((((c>>16)&0xFF)*sa+((d>>16)&0xFF)*k)/oa+0.5);
      const int g=(int)((((c>>8)&0xFF)*sa+((d>>8)&0xFF)*k)/oa+0.5);
      const int b=(int)(((c&0xFF)*sa+(d&0xFF)*k)/oa+0.5);
      PixelSet(x,y,TFRGBA(r,g,b,(int)(oa*255.0+0.5)));
   }

   // rounded rectangle: vertical gradient fill, optional border and outer glow
   void RRect(double x,double y,const double w,const double h,double rad,
              const uint ctop,const uint cbot,const uint cb=0,const double bw=0.0,
              const uint cg=0,const double gr=0.0)
   {
      x+=ox; y+=oy;
      const double pad=gr+2.0;
      const int x0=(int)MathFloor(x-pad),x1=(int)MathCeil(x+w+pad);
      const int y0=(int)MathFloor(y-pad),y1=(int)MathCeil(y+h+pad);
      const double hw=w*0.5,hh=h*0.5,cx=x+hw,cy=y+hh;
      if(rad>hh) rad=hh;
      if(rad>hw) rad=hw;
      for(int py=y0;py<=y1;py++)
      {
         if(py<0 || py>=ch)
            continue;
         const double fy=py+0.5;
         const uint fc=(ctop==cbot)?ctop:TFMix(ctop,cbot,(fy-y)/h);
         for(int px=x0;px<=x1;px++)
         {
            if(px<0 || px>=cw)
               continue;
            const double fx=px+0.5;
            const double qx=MathAbs(fx-cx)-hw+rad;
            const double qy=MathAbs(fy-cy)-hh+rad;
            const double mx=(qx>0.0)?qx:0.0;
            const double my=(qy>0.0)?qy:0.0;
            const double d=MathSqrt(mx*mx+my*my)+MathMin(MathMax(qx,qy),0.0)-rad;
            if(d>gr+1.0)
               continue;
            if(gr>0.0 && d>0.0 && d<gr)
            {
               const double t=1.0-d/gr;
               Put(px,py,cg,t*t);
            }
            const double cov=TFSat(0.5-d);
            if(cov>0.0)
               Put(px,py,fc,cov);
            if(bw>0.0)
            {
               const double bc=cov-TFSat(0.5-(d+bw));
               if(bc>0.0)
                  Put(px,py,cb,bc);
            }
         }
      }
   }

   void Disc(const double cx,const double cy,const double r,const uint ctop,const uint cbot,
             const uint cb=0,const double bw=0.0,const uint cg=0,const double gr=0.0)
   {
      RRect(cx-r,cy-r,2.0*r,2.0*r,r,ctop,cbot,cb,bw,cg,gr);
   }

   // ring segment, angles in radians (screen space, clockwise), colour gradient c0->c1 along the arc
   void ArcBand(double cx,double cy,const double r0,const double r1,const double a0,const double a1,
            const uint c0,const uint c1,const uint cg=0,const double gr=0.0)
   {
      const double span=a1-a0;
      if(span<=0.0)
         return;
      cx+=ox; cy+=oy;
      const double TWO=2.0*M_PI;
      const double pad=gr+2.0;
      const double hi=r1+pad;
      const double lo=r0-pad;
      const bool full=(span>=TWO-1e-6);
      const int x0=(int)MathFloor(cx-hi),x1=(int)MathCeil(cx+hi);
      const int y0=(int)MathFloor(cy-hi),y1=(int)MathCeil(cy+hi);
      for(int py=y0;py<=y1;py++)
      {
         if(py<0 || py>=ch)
            continue;
         const double dy=py+0.5-cy;
         for(int px=x0;px<=x1;px++)
         {
            if(px<0 || px>=cw)
               continue;
            const double dx=px+0.5-cx;
            const double d2=dx*dx+dy*dy;
            if(d2>hi*hi)
               continue;
            if(lo>0.0 && d2<lo*lo)
               continue;
            const double d=MathSqrt(d2);
            double rel=TFAtan2(dy,dx)-a0;
            rel=MathMod(rel,TWO);
            if(rel<0.0) rel+=TWO;
            if(!full && rel>(span+TWO)*0.5) rel-=TWO;
            const double cr=TFSat(MathMin(d-r0,r1-d)+0.5);
            double ca=1.0;
            if(!full)
               ca=TFSat(MathMin(rel*d,(span-rel)*d)+0.5);
            const double cov=cr*ca;
            const uint col=TFMix(c0,c1,rel/span);
            if(cov>0.0)
               Put(px,py,col,cov);
            else if(gr>0.0)
            {
               const double dr=(d<r0)?(r0-d):((d>r1)?(d-r1):0.0);
               double da=0.0;
               if(!full)
                  da=(rel<0.0)?(-rel*d):((rel>span)?((rel-span)*d):0.0);
               const double dist=MathSqrt(dr*dr+da*da);
               if(dist<gr)
               {
                  const double t=1.0-dist/gr;
                  Put(px,py,col,t*t*0.55);
               }
            }
         }
      }
   }

   // tapered capsule line (w0,w1 = half widths) with optional glow
   void LineT(double xa,double ya,double xb,double yb,const double w0,const double w1,
              const uint c,const uint cg=0,const double gr=0.0)
   {
      xa+=ox; ya+=oy; xb+=ox; yb+=oy;
      const double pad=MathMax(w0,w1)+gr+2.0;
      const int x0=(int)MathFloor(MathMin(xa,xb)-pad),x1=(int)MathCeil(MathMax(xa,xb)+pad);
      const int y0=(int)MathFloor(MathMin(ya,yb)-pad),y1=(int)MathCeil(MathMax(ya,yb)+pad);
      const double vx=xb-xa,vy=yb-ya;
      double l2=vx*vx+vy*vy;
      if(l2<1e-9) l2=1e-9;
      for(int py=y0;py<=y1;py++)
      {
         if(py<0 || py>=ch)
            continue;
         const double fy=py+0.5;
         for(int px=x0;px<=x1;px++)
         {
            if(px<0 || px>=cw)
               continue;
            const double fx=px+0.5;
            const double t=TFSat(((fx-xa)*vx+(fy-ya)*vy)/l2);
            const double qx=xa+t*vx-fx;
            const double qy=ya+t*vy-fy;
            const double d=MathSqrt(qx*qx+qy*qy)-(w0+(w1-w0)*t);
            if(d>gr+1.0)
               continue;
            if(gr>0.0 && d>0.0 && d<gr)
            {
               const double g=1.0-d/gr;
               Put(px,py,cg,g*g);
            }
            const double cov=TFSat(0.5-d);
            if(cov>0.0)
               Put(px,py,c,cov);
         }
      }
   }

   // anti-aliased filled triangle
   void Tri(double xa,double ya,double xb,double yb,double xc,double yc,const uint c)
   {
      xa+=ox; ya+=oy; xb+=ox; yb+=oy; xc+=ox; yc+=oy;
      if((xb-xa)*(yc-ya)-(yb-ya)*(xc-xa)<0.0)
      {
         double tx=xb,ty=yb;
         xb=xc; yb=yc; xc=tx; yc=ty;
      }
      const double l01=MathSqrt((xb-xa)*(xb-xa)+(yb-ya)*(yb-ya));
      const double l12=MathSqrt((xc-xb)*(xc-xb)+(yc-yb)*(yc-yb));
      const double l20=MathSqrt((xa-xc)*(xa-xc)+(ya-yc)*(ya-yc));
      if(l01<1e-6 || l12<1e-6 || l20<1e-6)
         return;
      const int x0=(int)MathFloor(MathMin(xa,MathMin(xb,xc))-1.0),x1=(int)MathCeil(MathMax(xa,MathMax(xb,xc))+1.0);
      const int y0=(int)MathFloor(MathMin(ya,MathMin(yb,yc))-1.0),y1=(int)MathCeil(MathMax(ya,MathMax(yb,yc))+1.0);
      for(int py=y0;py<=y1;py++)
      {
         const double fy=py+0.5;
         for(int px=x0;px<=x1;px++)
         {
            const double fx=px+0.5;
            const double e0=((xb-xa)*(fy-ya)-(yb-ya)*(fx-xa))/l01;
            const double e1=((xc-xb)*(fy-yb)-(yc-yb)*(fx-xb))/l12;
            const double e2=((xa-xc)*(fy-yc)-(ya-yc)*(fx-xc))/l20;
            const double cov=TFSat(0.5+MathMin(e0,MathMin(e1,e2)));
            if(cov>0.0)
               Put(px,py,c,cov);
         }
      }
   }

   void DrawPx(const uint &px[],const int w,const int h,const double x,const double y)
   {
      if(ArraySize(px)<w*h)
         return;
      const int x0=(int)MathRound(x)+ox;
      const int y0=(int)MathRound(y)+oy;
      for(int j=0;j<h;j++)
      {
         for(int i=0;i<w;i++)
         {
            const uint c=px[j*w+i];
            if((c>>24)==0)
               continue;
            Put(x0+i,y0+j,c,1.0);
         }
      }
   }

   // letter-spaced text, returns the x where it ends
   double TxtSp(const double x,const double y,const string s,const uint c,const int px,const bool bold,
                const double sp,const string font="Bahnschrift")
   {
      FontSet(font,-(int)MathRound(px*7.5),bold?FW_BOLD:FW_NORMAL);
      double cx=x;
      for(int i=0;i<StringLen(s);i++)
      {
         const string chr=StringSubstr(s,i,1);
         if(chr==" ")
         {
            cx+=px*0.4+sp;
            continue;
         }
         TextOut((int)MathRound(cx)+ox,(int)MathRound(y)+oy,chr,c,TA_LEFT|TA_VCENTER);
         cx+=TextWidth(chr)+sp;
      }
      return cx;
   }

   double TxtSpW(const string s,const int px,const bool bold,const double sp,const string font="Bahnschrift")
   {
      FontSet(font,-(int)MathRound(px*7.5),bold?FW_BOLD:FW_NORMAL);
      double w=0.0;
      for(int i=0;i<StringLen(s);i++)
      {
         const string chr=StringSubstr(s,i,1);
         if(chr==" ")
            w+=px*0.4+sp;
         else
            w+=TextWidth(chr)+sp;
      }
      return w-sp;
   }

   double TxtSpC(const double cx,const double y,const string s,const uint c,const int px,const bool bold,
                 const double sp,const string font="Bahnschrift")
   {
      const double w=TxtSpW(s,px,bold,sp,font);
      return TxtSp(cx-w*0.5,y,s,c,px,bold,sp,font);
   }

   int TW(const string s,const int px,const bool bold=false)
   {
      FontSet("Segoe UI",-(int)MathRound(px*7.5),bold?FW_BOLD:FW_NORMAL);
      return TextWidth(s);
   }

   void Txt(const double x,const double y,const string s,const uint c,const int px,
            const bool bold=false,const uint al=TA_LEFT|TA_VCENTER)
   {
      FontSet("Segoe UI",-(int)MathRound(px*7.5),bold?FW_BOLD:FW_NORMAL);
      TextOut((int)MathRound(x)+ox,(int)MathRound(y)+oy,s,c,al);
   }
};

//+------------------------------------------------------------------+
//| Data passed from the EA to the dashboard                         |
//+------------------------------------------------------------------+
struct TFSnap
{
   int    buyCnt;
   int    sellCnt;
   int    level;
   double lots;
   double avg;
   double tp;
   double nextGrid;
   double nextLot;
   double basketPL;
   int    statusKind;   // 0 running, 1 waiting, 2 stop
   string status;
   string note;
   bool   hasBasket;
   int    dayKind;   // 0 none, 1 daily target reached, 2 daily loss limit reached
};

struct TFTrade
{
   ulong  ticket;
   int    type;   // 0 buy, 1 sell
   double vol;
   double open;
   double cur;
   double profit;
};

struct THit
{
   int x;
   int y;
   int w;
   int h;
   int id;
};

//+------------------------------------------------------------------+
//| Embedded logo images (ARGB hex, decoded at start)                |
//+------------------------------------------------------------------+
#define TF_ICON_W 30
#define TF_ICON_H 25
#define TF_WORD_W 111
#define TF_WORD_H 22

string g_hexIcon[]=
{
   "AB9C9995DCCDCDC9D9C3C4C1DCC6C6C3DCC6C7C7DCC7C8C8DCC8C9CADCC9CACCDCCACCCDDCCCCDCFDCCCCFD0DBCED1D3DACDD1D2DCD1D5D9C6BEC2C2140C0C0CC22C6DBADF53A3E4DD60AADEDE7ABCE4DF91C6E5E089C3E4DF7BBAE3DF6DB3E2DF64ADE0DF5DA8DEDE55A4DEDB4F9FDFDD4DA2E5AE3768A8437D7972FFE2DDD5FFFDF7EDFFF7F2EAFFF9F5EEFFFAF7EFFFFBF8F1FFFDF9F2FFFEFBF3FFFFFCF5FFFFFDF7FFFFFFFBFFFFFFFAFFFFFFFFEAD8D8D421000000F0236DCEFF3099FFFF3399FDFF3AA0FFFF43A8FEFF42A7FFFF3EA4FFFF3FA7FFFF42ABFFFF48AFFFFF4CB2FFFF54BEFFFF4598E14D133166000000009DA29F9BFFFEF7ECF9F1EAE1FCF2ECE5FCF3EEE6FCF5F1E8FCF6F2EAFCF8F4ECFCF9F5EDFCF9F6EFFEF2EFEAFDF0EDE8FEFDFCF7E6C5C8C71E000000E52067C9FE237FEAFD237CE3FC2686F1FC288BF5FC298DF7FC2C90F8FC3195F9FC389CFDFD3FA5FFF949AFFFFF50B4FFA7244F8700000000027F7F7F1F62625AF7A8A6A4FFABABADFFA6A7A9FFA7A8ACFFA7A9ADFFA8A9AEFFA8AAAFFFAAACAFFFAFAFB0FFE1DDD8FEECEAE5FFFDF9F1EAB2BBC11A000000DF1E64C8FF1B72DCFC1D74DEFF1A5DB9FF1854ABFF1959B0FF1A5AB0FF1D5DB0FF2061B0FF2564AFFF2C6FB7F9275B9825060D290100FFFF0300000000000000650F141BE210151DE30C111A",
   "E60C111BE70B111BE70B111BE60B121BE60B1119E415181DFCC6C2BEFEE9E7E3FFF4F0E9EAABB3BC19000000DE1D5FC0FD196BDAFF1452ACE1030D2CE401031FE0000422E2000421E4000520E400051EE300041CD80001195000000F00000000020000000000000001FFFFFF00000000080000000B0000000B0000000C0000000C0000000D1313000B0000001A1D1313EECBC7C3FFE4E1DEFFEEE8E4E9A7AFB71B000000DB1D5FC4FF155CC6980A215503000000160000001D111A2B1D00112B20000F272000072722000F251B67717A0001010001000000000000000000000000000000027F7F7F00010101000101010001010100010101000101010002020200010101104F3F3FEDC8C3C0FFDEDBD8FFE8E2DDEAA0A8B214000000E81A5ABAD90E3274072400001D2B4672D6C3C5CCEAE0E0E1E9D9DADBEADBDBDDE6DBDBDDEDDDDDDF928D8F920200007F03AAAAAA000000000000000000000000000000000100000001000000010000000100000001000000027F7F7F0100000013352828EEC4BFBDFFD8D6D3FFE2DCD8EA9FA5AC14000033D11845913617213D01000000C8A4A9B3FFFFFEF4FFF9F2E6FFFCF5EAFFFAF2E7FFFFFFF4F6C5BDB4212E2E2600010101027F7F7F00000000000000000000000000000000000000000000000000000000000000000000000001FFFFFF00000000",
   "12383838EDC1BDBBFFD5D2D0FFDCD7D6E7ADAAA715000024312943820000000092868F9EFFF2EEE7F9F0E9DFFAF7EFE6FAF5EDE4F7FBF2E8FFEAE0D576635F5C0000000003AAAAAA0000000000000000000000000000000000000000000000000000000000000000000000000000000001FFFFFF0000000012383838EDBEBAB9FFCFCDCBFFD6D3D2E6AEA9A60E120000000000005A636E85FFD6D5D5FAEEE6DCFFDCD5CEFF676466FF5D5B5CFF676463CB5B59570800000003555555010000000000000000000000000000000000000000000000000000000000000000000000000000000000000001FFFFFF00000000114B3C3CEDBBB7B5FFC8C7C5FFCFCECCE9A9A6A4053300002A485573F3B6B9BDFBE5DFD7FFE6DFD9D6817E7A660000006B00000068000000140000000001010101000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001FFFFFF0000000012464638EDB9B4B3FFC3C2C2FFCAC8C8E7A7A4A203000000BA8E9FAFFFE1DCD7FBD9D4CDF2A39E992E1B161B000202020003020200020101000201010100000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001FFFFFF0000000012554646EDB7B4B2FFBEBDBEFFC4C2C4E6A5A09D",
   "09000000D091A6BBFED3CEC9FFD8D2CDB185807B00000000076D6D6D0400000004000000010000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001FFFFFF0000000012634646EDB6B2B1FFBBB9BAFFBFBDBEE7A19C9A09000000CD8AA0B8FFCDC7C3FFD0CBC7AB928C86027F007F03FFFFFF0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001FFFFFF0000000012635546EDB6B2B1FFB8B7B9FFBAB9BBE69C979609000000CE849FB9FFC6C1BDFFCAC4C0AC89837F0000000003FFFFFF0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001FFFFFF0000000012635546EEB6B1B0FFB7B6B9FFB6B6B9E699949208000000CE839DB8FFBFBAB6FFC2BDB9AB867E7B0000000003FFAAAA0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001FFFFFF00000000135D5050EDB5B1B0FFB4B5B7FFB3B3B5E693908F09000000CD809CB6FFB8B2AEFFBAB5B0A9807A77",
   "0000000003FFAAAA0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001FFFFFF00000000136B5D50F2B6B2AFFFAFAFB1FFAFAFB1E68C8A8A09000000CE7E9AB5FFB3ACA7FEB6AEA9AF7D76710000000003AAAAAA000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000002FFFFFF047F7F3FC4BBB7B4FFB7B5B6FFABA9ABE688868608000000CD7C99B4FFB0A8A2FFA49C97735F5A5600000000047F7F7F000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000003AAAAAA0000000037B4B0A6FDBBB8B6FEA8A6A7E78281820A000000CA7A9AB5FEB6ABA4D26E69660600000001FFFFFF0100000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000003FFAAAA000000009BB6B3AEFFBCB9B8E47477780A000000CA83A1BCFF978F893E313131000101010355555500000000000000000000000000000000",
   "000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000027F7F7F027F7F7F16A2A296F1BCB7B4EC72757604000000DE7694AEAF635D570000000003AAAAAA00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000004BFBFBF0000000074C1BDB8FB8283820C000000C4486F9024382A2A01FFFFFF0200000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001000000027F7F7F07FFFFFFBB8482812B232F3B3725537D000000000100FFFF0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000027F7F7F00000000396B6B6B1C5B5B510000000002000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000"
};

string g_hexWord[]=
{
   "00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000003FFFFAA60F9F9F771FAFAFA6DFCFCFA72FCFCFC3AFAFAFA0000000002FFFFFF0000000000000000000000000000000000000000000000000000000000000000010000FF000000000B2E458B721A5BBBB8175CBCC6155BBA9F165DBE52155ABA0A194C7F00000000000000000000000000000000010000FF00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000072FFFFFF7DFFFFFF7DFCFCFC7DFFFFFF7DFFFFFF7DFFFFFF7DFFFFFF7DFFFFFF7DFFFFFF7DFFFFFF7DFFFFFF7DFFFFFF7CFFFFFF7DFFFFFF",
   "28F8F8F80000000001FFFFFF000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001FFFFFF0000000009C6C6C6EBF9F9F8FFFFFFFFFFFFFFFFFFFFFFFF8DFBFBFB0000000004BFBFBF05FFFFFF6FFCFCFCA8FBFBFB71FCFCFC06FFFFFF0000000001FFFFFF02007F7F010000FF182A559FCA195DBEFF1664CCFF1461CCFF1362C8FF1462C8FF1565D5801759B12F2051A896165BC38A145EBE2225529D00000000010000FF0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000FDFDFDFDFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF5AF6F6F60000000003FFFFFF0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000",
   "00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001FFFFFF0000000009C6C6C6DFF9F9F9FCFFFFFFF7FFFFFFFCFFFFFF86FBFBFB0000000002FFFFFFA0FAFAF8FFFFFFFFFFFFFFFFFFFFFFFFA5FAFAFA02FFFFFF02FFFFFF02007FFF00000000B31B58BDFF1567D2F9135EC2FC145CC4FD125DC4FB145EC7F5165DC97A1959B3F1145EC2FF1666D2FF1766D4E5145EC01D2357AF010000FF02007F7F00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000E3FDFDFDF6FFFFFFF5FFFFFFF6FFFFFFF7FFFFFFFBFFFFFFFBFFFFFFFBFDFDFDFBFFFFFFF9FFFFFFF6FFFFFFF6FFFFFFF3FFFFFFF6FFFFFF53F2F2EF0000000003FFFFFF00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000",
   "0000000000000000000000000000000000000000000000000000000001FFFFFF0000000009C6C6C6E1F9F9F9FFFFFFFFF9FFFFFFFFFFFFFF89FBFBFB0000000020F7F7F7FAFCFCFAFBFFFFFFFAFFFFFFFBFFFFFFFEFBFBFA21EFEFEF0000000000000000342253A6FF1361C3FC145DC7FF155CC2FF1161C4FE145EBCFF1763D0A6135CBC911359BCFF1366D4F7155CC1F7125DC3FF1564D6721859B50000000004003FBF00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000FCFDFDFDFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF5BF3F3F30000000003FFFFFF000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001FFFFFF0000000009C6C6C6E1F9F9F9FFFFFFFFF9FFFFFFFFFFFFFF",
   "89FBFBFB000000001BF5F5F5F7FBFBF9FDFFFFFFF8FFFFFFFDFFFFFFFAFBFAFA1CECECEC0000000000000000791D58B7FE1664CCFA135DC0FF145FC9E9185BBE391F55AE33235AB919285BA38B165BB9FF1666D4F7135CC6F8165CC2FF1865D0671859B40000000004003FBF0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000075FCFCFC80FFFFFF80FFFFFF7FFFFFFF95FFFFFDFFFEFEFEFFFFFFFFFDFFFFFFFFFFFFFFC8FCFCFB80FDFDFD81FFFFFF7EFFFFFF80FFFFFF29F8F8F80000000002FFFFFF000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001FFFFFF0000000009C6C6C6E1F9F9F9FFFFFFFFF9FFFFFFFFFFFFFF88FBFBF9000000000000000085F9F9F7FFFFFFFFFFFFFFFFFFFFFFFF88FBFBF7000000000599CCFF000000009D1959BAFF1762D4F8115FBD",
   "FF1663D0AC175ABC000000000000000000000000241C55B1E3145EC1FF1466D1FF1964D2CD125DC0101F5FBF010000FF010000FF00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001DF6F6F6FFFDFDFDFFFFFFFFFBFFFFFFFFFFFFFF89F5F5F1000000000000000000000000000000000000000001FFFFFF01FFFFFF01FFFFFF01FFFFFF0000000001FFFFFF03FFFFFF03FFFFFF03FFFFFF01FFFFFF0000000000000000000000000000000002FFFFFF03FFFFFF03FFFFFF03FFFFFF01FFFFFF0000000001FFFFFF01FFFFFF01FFFFFF01FFFFFF01FFFFFF00000000000000000000000000000000000000000100000002FFFFFF03FFFFFF03FFFFFF04FFFFFF01FFFFFF09C6C6C6E1F9F9F9FFFFFFFFF9FFFFFFFFFFFFFF88FBFBF90000000004FFFFFF000000004EFBFBF880FFFFFD4EFBFBFB0000000001FFFFFF043F7FBF010000FFA9185DB6FF1364CEF8155CC2FF1663D19F115BC2030055AA060055D4030055AA000000001A2758A673165FBE6A135BC00E3648A30000000002007F7F010000FF010000FF",
   "010000FF010000FF000000000000000000000000000000000000000000000000010000FF010000FF010000FF010000FF010000FF000000000000000000000000000000000000000002007FFF030055AA030055AA030055AA010000FF0000000000000000000000000000000004FFFFFF04FFFFFF06FFFFFF04FFFFFF31F4F4F4FFFEFEFEFFFFFFFFFBFFFFFFFFFFFFFF93F8F8F404FFFFFF08FFFFFF04FFFFFF04FFFFFF000000000000000000000000000000000000000002FFFFFF0000000000000000000000000000000000000000000000000000000001FFFFFF03FFFFFF000000000000000000000000000000000000000003FFFFFF00000000000000000000000000000000000000000000000000000000000000000000000003FFFFFF0000000000000000000000000000000000000000000000000CE9E9D4E1F9F9F9FFFFFFFFF9FFFFFFFFFFFFFF88FBFBF90000000004FFFFFF000000000000000000000000000000000000000000000000010000FF00000000A91B5CB2FF1563CFF8145DC0FF1464D19C115DBF00000000000000000000000001000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000010000FF000000000000000000000000000000000000000000000000",
   "0000000000000000030055AA000000000000000000000000000000000000000000000000030055FF010000FF0000000000000000000000000000000002FFFFFF000000002DF3F3F3FFFEFEFEFFFFFFFFFBFFFFFFFFFFFFFF91F6F6F40000000004FFFFFF00000000000000000BFFFFFF11F0F0F00FFFFFEE11FFFFF00DFFFFEB0000000001FFFFFF39FAFAFA54FFFFFB3DFFFFFA0AE5E5E50000000002FFFFFF00000000000000001DFFFFF647FBFBFB57FCFCF943FFFFFB17FFFFFF0000000003FFFFFF11FFFFFF0EFFFFFF10FFFFEF0DFFFFEB00000000000000000000000002FFFFFF000000000000000030F9F9F94FFFFFFB53FBFBFB36FAFAFA02FFFFFF00000000E1FAFAF9FFFFFFFFF9FFFFFFFFFFFFFF88FBFBF90000000004FFFFFF0CE9E9E914F2F2F213FFFFFF14F2F2F20BE7E7FF000000000A336699102F4F8FB0125CBDFF1661D2F8155DC2FF1564CAA6105CBC0D3A4EB0131A5DAE072448B6035555AA131A50A113285DAE142659A50F2255BB05336699121C55AA0F1155990E245BB60E245BB60D134E9C0000000000000000000000000000000000000000000000000A334C990F2255AA0E365B6D0E36487F131A50AE072448910000000002007FFF00000000000000002A185BB644165DB7451960B1371B5CAB0B2E5C8B000000000000000002007F7F0000000000000000",
   "0000000002FFFFFF000000002DF3F3F3FFFEFEFEFFFFFFFFFBFFFFFFFFFFFFFF91F6F6F40000000004FFFFFF02FFFFFF00000000B0F9F9F9EEFFFFFFE6FDFDFDEEFFFFFF99FAFAFA2EF9F9F9CCFDFDFDFFFFFFFFFFFFFFFFFFFFFFFFE0FCFCFB23F7F7F00000000018F4F4F49DFFFFFFF2FDFDFDFFFFFFFFFFFFFFFFFFFFFFFFEEFDFDFD83FDFDFD8FF6F6F6EEFFFFFFE7FFFFFFEDFFFFFFCDFBFBFB07DADADA0000000003FFFFFF0000000046F7F7F7C8FFFFFDFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFD2FFFFFD60F7F7F7DCFAFAF9FFFFFFFFF9FFFFFFFFFFFFFF89F9F9F90000000000000000B1FCFCFCEEFFFFFFE6FFFFFFEEFFFFFFA5EFF4F20000000071215CB4ED1762C3F5135CC6FF155EC1FE145EC1FF155EC5F7135CC3E4185BC4EC1763CE6A185BB9351C56BBEE1561C5E7165DBEEB165DC3DC165BBF13285086B2185AB7EA1562CBE7165BC1E7135DC4E91560C0421755B5010000FF030055AA0200007F010000001E225DAADF195CBBEA165BC4E71A5CB6E8185FBFD6165ABE14264C8C0100FFFF0000000057205AB5CA175FC2FA145EC3FF1461C8FF175FC8FF1360C1E2195DC48D1C5CBA13354386000000000200007F000000000000000002FFFFFF000000002DF3F3F3FFFEFEFEFFFFFFFFFBFFFFFFFFFFFFFF92F4F4F20000000004FFFFFF02FFFFFF00000000C3F9F9F9",
   "FFFFFFFFFFFFFFFFFFFFFFFFDEF8F8F8EBF9F9F9FFFFFFFFF9FFFFFFF6FFFFFFFCFFFFFFCEFBFBFA08FFFFFF1DF6F6F6D7FCFCFCFFFFFFFFFFFFFFFFFCFFFFFFF9FFFFFFF9FFFFFFFFFFFFFFFFFFFFFFFFFCFCFCFFFFFFFFFFFFFFFFFFFFFFFFE4FAFAFA08DFDFDF01FFFFFF0000000060F7F7F7FFFEFEFEFFFFFFFFFFFEFEFEFBFFFFFFF8FFFFFFFAFFFFFFFFFFFFFFFFFFFFFFFBFCFCFCFFFFFFFFFBFFFFFFFFFFFFFF89F9F9F90000000000000000C5FCFCFCFFFFFFFFFEFFFFFFFFFFFFFFB9EBEFF1000000007E205DB4FF1963D2FB155CC3FF125FC4FF145DC2FF165CC3FF145FBFFE115FC2FF1567D373185AC93E1C56ACFF1863D1FF135FC4FF1262CDF5165BBE0533666646195BB2FF1663CFFF155FBFFF145EC4FF1466D4B4135ABB0000000002007FFF04003FBF00000000841B5CB3FF1667D2FF155DC6FF135EC5FF1566D57B1859BA000000000001000090135DBBFF1764CCFF1660CBFF155EC7FF1563CEFF1863CCFF1362CCFF145EC7FF1665D2DA165CC8231D509900000000000000000000000002FFFFFF000000002DF3F3F3FFFEFEFEFFFFFFFFFBFFFFFFFFFFFFFF92F4F4F20000000004FFFFFF02FFFFFF00000000BEF9F9F9FEFFFFFFFBFFFFFFFEFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF48F4F4F400000000C2FBFBFBFFFFFFFFF9FFFFFF",
   "FEFFFFFFFEFDFDFDFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEFCFCFCFEFFFFFFFCFFFFFFFEFFFFFFDEFBFBFA0BE7E7E70000000030EFEFF4FBFCFCFCFEFFFFFFFCFDFDFDFEFDFDFDFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFDFCFCFCFFFFFFFFFFFFFFFFFBFFFFFFFFFFFFFF89F9F9F90000000000000000C0FBFBFBFEFFFFFFF8FFFFFFFEFFFFFFB5EEEEF500000000831F5BB3FF1868DBFF1060BFFF165CC0FF165CC7FF125EC3FF155EC9FF165FC9FF196AD6791758BF3C1159AAFE1761D1FA165CC1FE125FC5ED165CBB172C589000000000BB175ABAFE1264CDFA145CC3FD175BC6FB155DC32E1653B100000000010000FF0F334488E6155EBFFD1161CAFA155CC0FD1361C8DE155BC00D274E9C00000000801759B7FF1A65D0F9115FC5FF145FC6F2145EBF951B5CB783175FB5CE155CBAFF1660CBF8145DBFFF1167CFC7175AB707242491000000000000000002FFFFFF000000002DF3F3F3FFFEFEFEFFFFFFFFFBFFFFFFFFFFFFFF91F6F6F40000000004FFFFFF02FFFFFF00000000BFF9F9F9FFFFFFFFFCFFFFFFFEFFFFFFFEFFFFFFEFFCFCFC91FDFDFD7CFCFCFCB3FDFDFDBEF9F9F9000000004DF8F8F5FFFFFFFFFBFFFFFFFEFFFFFFFEFFFFFFFFFFFFFFABFCFCFC6EFCFCFC85FBFBFBE8FCFCFCFFFFFFFFFEFDFDFDFDFFFFFFFFFFFFFFDFFBFBFB0BE7E7E700000000ADF9F9F9",
   "FFFFFFFFFBFFFFFFFEFFFFFFFFFFFFFFEDFDFDFD88FDFDFD6EFCFCFCA5FDFDFDFFFFFFFFFEFDFDFDFEFFFFFFFBFFFFFFFFFFFFFF89F9F9F70000000000000000C1FBFBFBFFFFFFFFF9FFFFFFFFFFFFFFB4EFF0F0000000002C3462A8591955BFC81359C3FF1461CCFB155DBDFF1064CAC11358BC521B57AE5C215BB6262150A1471159B7FF1463CCFB155CC5FF145FC6EF145DBD191E5199010000FF391F55A1FD165EC5FD115FC4FB165CC1FF1465CF9D115AB900000000000000006A185BAFFF1863CFFC135DC3FC145DC3FF1564CD631C5AB1000000002B1D58ABFC145FBFFB165EC1FD125FC5F3165EC02522529E000000000000000000000000B9145DC2FF1761CAF9145CC5FF1760CB561458AB000000000000000002FFFFFF000000002DF3F3F3FFFEFEFEFFFFFFFFFBFFFFFFFFFFFFFF91F6F6F40000000004FFFFFF02FFFFFF00000000BFF9F9F9FFFFFFFFFCFDFDFDFDFFFFFFFBFCFCFC3EF6F6F20000000000000000000000000BFFFFFF01FFFFFFA2F8F8F8FEFFFFFFFBFFFFFFFCFFFFFFFFFFFFFF7EFAFAF800000000000000000000000024F0F0F0E8FCFCFAFEFFFFFFFCFFFFFFFFFFFFFFE1FAFAFA03AAAAAA11F0F0F0F0FCFCFBFEFFFFFFFDFDFDFDFEFFFFFFEEFCFCFC2EF9F9F900000000000000000000000072F8F8F8FFFFFFFFFDFFFFFFFBFFFFFFFFFFFFFF89F9F9F9",
   "0000000000000000C1FBFBFBFFFFFFFFF9FFFFFFFFFFFFFFB2F2F2F3000000000002020000000000A41A5AB4FF1465D2F8135CC1FF1764CE991758BC0000000000000000000000004C1457B8FF1562C8FC145DC4FF145FC6EF105EC117164DB10000000000000000A9185AB5FF1465CCFB135DC4FE1360C4F3165CC01B125EAA00000000D7155CB9FE1660CAFA125DC2FE1760CDD3135BBC07244891010000FF841C5AB5FF1565D1FA135DC2FF1560C4EA145ABF7B145DBA82155CC084155EBF7B165DBEB8145BBFFD1461C7F8135DC1FC1363CCA5155BB4000000000000000002FFFFFF000000002DF3F3F3FFFEFEFEFFFFFFFFFBFFFFFFFFFFFFFF91F6F6F40000000004FFFFFF02FFFFFF00000000BFF9F9F9FFFFFFFFF9FFFFFFFFFFFFFFC4FBFBF90000000005FFFFFF04FFFFFF02FFFFFF0000000000000000C8F9F9F9FFFFFFFFFBFFFFFFFFFFFFFFEAFAFAFA0CE9E9E902FFFFFF05FFFFFF07FFFFFF000000008EF7F7F6FFFFFFFFF9FFFFFFFFFFFFFFE2FBFBFA0000000031F4F4F4FFFEFEFEFEFFFFFFFBFFFFFFFFFFFFFF99FAFAF80000000007FFFFFF05FFFFFF03FFFFFF05CCCCCCE2FBFBFBFFFFFFFFFAFDFDFDFFFFFFFF89F9F9F90000000000000000C0FCFCFCFFFFFFFFF9FFFFFFFFFFFFFFB2F3F3F300000000076DB6DA04003FBFAB1A5AB8FF1664CEF8135CC5FF1564CE",
   "A1115ABC030055AA0A194CCC02007F7F4B145BBBFF1561CAFC145DC3FF155EC7EF135DBE161751AD00000000010000FF281F59ACF7175DC1FD135EC3FB145CC6FF1665D371185AB2401757AFFF1663CFFC145DC4FC125FBFFF1662C9501C56B20000000000000000B5195AB7FE1562D2FC145DC2FF145DC3FF1460C7FF1569D9FF1568D8FF1568D7FF1668D7FF1565D0FF165FCAFF155FC7FF1764CDD21358BF000000000000000002FFFFFF000000002DF3F3F3FFFEFEFEFFFFFFFFFBFFFFFFFFFFFFFF90F7F7F60000000004FFFFFF02FFFFFF00000000C0F8F8F8FFFFFFFFF9FFFFFFFFFFFFFFAEFCFCFA01FFFFFF03FFFFFF000000000000000001FFFFFF00000000CFFAFAFAFFFFFFFFFBFFFFFFFFFFFFFFDCF9F9F905CCCCCC02FFFFFF01FFFFFF05FFFFFF04FFFFFF75F4F4F1FFFFFFFFF9FFFFFFFFFFFFFFE2FBFBFA000000003BF6F6F6FFFFFFFFFEFFFFFFFBFFFFFFFFFFFFFF7EFAFAF804FFFFFF05FFFFFF0000000002FFFFFF00000000CBFCFCFCFFFFFFFFF9FFFFFFFFFFFFFF88FBFBF90000000000000000C0FCFCFCFFFFFFFFF9FFFFFFFFFFFFFFB2F3F3F3000000000599CCFF00000000AB195AB7FF1563CEF8135CC4FF1664CEA11358BA00000000062A55D4000000004A1459BDFF1561CAFC145DC3FF145EC8EF175BBB1622518B0000000004007FBF0000000094185BBA",
   "FF1464CFFA115DC4FF175FC9DD135CBFCE135BBCFE1362CDFA135CC3FF1662CEC21759BD01FF000004003FBF00000000BE115CBAFF1364CAFC155CC3FF145FC6F4135DBEDB145ABDDA135BBFDA125BBEDB125BBCDF1459C1E1125BBDE1125ABEE0125EC4BC1158B0000000000000000002FFFFFF000000002DF3F3F3FFFEFEFEFFFFFFFFFBFFFFFFFFFFFFFF91F6F6F40000000004FFFFFF02FFFFFF00000000C0F8F8F8FFFFFFFFF9FFFFFFFFFFFFFFB2FCFCFA0000000003FFFFFF000000000000000002FFFFFF00000000BCF9F9F9FEFFFFFFFBFFFFFFFEFFFFFFF7FCFCFC24E9E9E90000000003FFFFFF0000000000000000B0FAFAF7FFFFFFFFFAFFFFFFFFFFFFFFE1FBFBFB0000000024F7F7F7FDFCFCFCFFFFFFFFFBFFFFFFFFFFFFFFBAFAFAF9000000000000000002FFFFFF000000001CECECECF2FDFDFCFEFFFFFFFAFFFFFFFFFFFFFF88FBFBF90000000000000000C0FCFCFCFFFFFFFFF9FFFFFFFFFFFFFFB2F3F3F3000000000599CCFF00000000AA195BB7FF1563CEF8135CC4FF1664CEA01359BC00000000072448B6000000004B1458BBFF1561CAFC145DC3FF1260C6EF185BBC162E518B00000000030055AA010000FF1B2555A0F0165DBEFE1360C4FE145CC1FF155EC6FF145FC7FF145DC0FD135CC6FF1660C53C2255AE00000000060055D400000000A6155DB5FE1563CD",
   "F9155BC7FF1364CBC81856BD000000000A194CB20C003F940C153F9401000000020000000000000006002AAA0700486D000000000000000002FFFFFF000000002DF3F3F3FFFEFEFEFFFFFFFFFBFFFFFFFFFFFFFF91F6F6F20000000004FFFFFF02FFFFFF00000000C0F8F8F8FFFFFFFFF9FFFFFFFFFFFFFFB1FCFCFA0000000003FFFFFF000000000000000004FFFFFF0000000083F7F7F5FFFFFFFFFBFFFFFFFDFDFDFDFFFFFFFFC3FCFCFC26F8F8F803AAAAAA0CFFFFFF75FCFCFCFEFDFDFDFDFFFFFFFDFFFFFFFFFFFFFFE0FAFAFA07DADADA06D4D4D4DCFBFBFBFDFFFFFFFDFDFDFDFDFFFFFFFFFFFFFE7CFAFAF80EFFFFFF02FFFFFF23F7F7F7BDFDFDFCFFFFFFFFFDFFFFFFFBFFFFFFFFFFFFFF88FBFBFB0000000000000000C0FCFCFCFFFFFFFFF9FFFFFFFFFFFFFFB2F3F3F300000000067FAAD400000000AA195BB7FF1563CEF8135CC4FF1564CEA01359BC00000000072448B6000000004B1458BBFF1561CAFB145DC4FF135FC5EF175BBC162E517F00000000010000FF030055FF00000000821958B6FF1664CDFC125EC1FE155CC4FE145DC0FC145DC2FF1364CFB11859B400000000030055AA04003F7F000000005D1B5AB2FF1464D1FB155BC4FE1360BFF9175EC7511958B00000000000000000000000002B175EABB71A5DC16D195BBB062A557F000000000000000000000000",
   "02FFFFFF000000002DF3F3F3FFFEFEFEFFFFFFFFFBFFFFFFFFFFFFFF90F6F6F40000000004FFFFFF02FFFFFF00000000BFF9F9F9FFFFFFFFF9FFFFFFFFFFFFFFB1FCFCFA0000000003FFFFFF000000000000000002FFFFFF0000000024E9E9E9F9FCFCFCFCFFFFFFFEFDFDFDFEFFFFFFFFFFFFFFF8FBFBFBD0FCFCFCE3FCFCFCFFFFFFFFFDFCFCFCFFFEFEFEFDFFFFFFFFFFFFFFDFFBFBFB0CE9E9E9000000007AF8F8F8FFFFFFFFF9FFFFFFFFFFFFFFFEFDFDFDFFFFFFFFE5FDFDFDD0FFFFFFF6FCFCFCFFFFFFFFFDFFFFFFFFFFFFFFFBFFFFFFFFFFFFFF88FBFBFB0000000000000000C0FCFCFCFFFFFFFFF9FFFFFFFFFFFFFFB2F2F2F200000000067FAAD400000000AA1B5BB7FF1563CEF8135CC4FF1564CEA01359BC00000000070048B6000000004B1458BBFF1561CAFB145DC4FF135FC7EF175BBB162E518B00000000010000FF010000FF0100FFFF111E4B96E7185AC0FE175FC4FD175CBFFE135DC5FD145DC5FA165EC22D1C5AA4010000FF030055AA01000000010000FF0A334C99D6175BBDFF1264CBFA155BC1FF1560C0FF175EC5B6155BBB85135DBBAB145ABBF5165CC0FF1463D3FF1264C9DF1A5CC1461D53B2000000000000000002FFFFFF000000002CF9F9F9FCFCFCFCFCFFFFFFF8FFFFFFFCFFFFFF8DF7F7F50000000004FFFFFF02FFFFFF00000000BDF9F9F8FCFFFFFF",
   "F6FFFFFFFCFFFFFFAFFCFCFA0000000003FFFFFF00000000000000000000000003FFFFFF0000000075F8F8F8FFFFFFFFFEFFFFFFFCFFFFFFFCFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFCFDFDFDFAFFFFFFFCFFFFFFDDFAFAFA09E2E2E201FFFFFF0AE5E5E5CCFBFBFBFFFFFFFFFBFCFCFCFDFDFDFDFCFDFDFDFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFCFFFFFFF8FFFFFFFCFFFFFF86FBFBF90000000000000000BEFCFCFCFCFFFFFFF6FFFFFFFCFFFFFFB0F1F1F100000000067FAAD400000000A71B5BB8FC1563CDF5125CC4FC1564CE9E135ABE00000000072448B6000000004B1458BBFC1561CAF8135DC4FC1260C8EC155CBD1622519600000000010000FF00000000030055FF000000006F1959B7FF1464D4F9135EC0F8145BC5FF1764CC9E1658BC00000000030055AA000000000000000002007FFF00000000341D5DB0F1185FC5FF1364D1FB145DC0FD135DC3FF1662CCFF1664CDFF1562CDFF125EC4FA165BC1FF1465D0DB165BBB221E52AC000000000000000002FFFFFF000000002FF9F9F9FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF96F9F9F80000000004FFFFFF02FFFFFF00000000CAF9F9F9FFFFFFFFFFFFFFFFFFFFFFFFBBFCFCFA0000000003FFFFFF0000000000000000000000000000000003FFFFFF000000007FF8F8F8FCFCFCFCFFFFFFFF",
   "FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFDAFDFDFDC3F4F4F4FFFFFFFFFFFFFFFFFFFFFFFFEDFAFAFA09E2E2C6000000000000000018F4F4F4BFFCFCFCFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFB4F9F9F9E7FBFBFBFFFFFFFFFFFFFFFFFFFFFFFF8FFBFBFB0000000000000000CBFDFDFDFFFFFFFFFFFFFFFFFFFFFFFFBBF4F4F400000000067FAAD400000000B31B5BB7FF1669DAFF155FC8FF1969D7AA135ABA00000000072448B600000000501659B8FF1667D5FF1661CAFF1864CEFC135EBD171658BC00000000010000FF00000000010000FF02007FFF09385571DB1A59BCFF1467D4FF1763CEF8165DBF201757A7010000FF02007F7F00000000000000000000000002007FFF00000000331E55AFCD155FC4FF1662CDFF1561CAFF135FC6FF155EC4FF155FC6FF1562CAFF185FC9B1185FBB160B5C9600000000000000000000000001FFFFFF0000000017FFFFFF88FDFDFD88FFFFFF86FFFFFD88FFFFFF4BFBFBFB0000000002FFFFFF01FFFFFF0000000065FCFCFC88FFFFFF85FFFFFD88FFFFFF5EFCFCFC0000000002FFFFFF000000000000000000000000000000000000000002FFFFFF0000000040F7F7F7A9FBFBFBDCFDFDFDEEFCFCFBD6FDFDFD93FDFDFB17FFFFFF38FAFAF588FFFFFF85FFFFFD88FFFFFF77FAFAFA05CCCCCC0000000002FFFFFF00000000",
   "04BFBFBF69FCFCFCC0FDFDFDE7FDFDFCE9FDFDFCC1FFFFFD66FFFFFC010000006AFFFFFF88FFFFFF85FFFFFD88FFFFFF48FBFBFB000000000000000067FCFCFA88FFFFFF85FFFFFD88FFFFFF5CF9F9F90000000003AAAAFF000000005D1B5AB28A1263CD85205AAE88275FB4572055A100000000030055AA000000002A1855AA8A1461C5871E5AB188255BA87F205CA80C2A559400000000010000FF000000000000000002007FFF00000000422655AA8A1663C5891F60BD5B2456A5000000000200007F0000000000000000000000000000000000000000030055AA00000000083F3F5F671360C1B9165DC7D7165EC1DC175CBCCD185CBA9F1E59B64A1F59B3000000000000000002007F7F"
};

uint g_pxIcon[];
uint g_pxWord[];

int TFHexVal(const int c)
{
   if(c>='0' && c<='9') return c-'0';
   if(c>='a' && c<='f') return c-'a'+10;
   if(c>='A' && c<='F') return c-'A'+10;
   return 0;
}

void TFDecode(const string &chunk[],uint &out[],const int n)
{
   ArrayResize(out,n);
   ArrayInitialize(out,0);
   int pi=0,nib=0;
   uint v=0;
   for(int k=0;k<ArraySize(chunk);k++)
   {
      const string s=chunk[k];
      const int L=StringLen(s);
      for(int i=0;i<L;i++)
      {
         v=(v<<4)|(uint)TFHexVal((int)StringGetCharacter(s,i));
         nib++;
         if(nib==8)
         {
            if(pi<n) { out[pi]=v; pi++; }
            v=0;
            nib=0;
         }
      }
   }
}

void TFLoadLogos()
{
   TFDecode(g_hexIcon,g_pxIcon,TF_ICON_W*TF_ICON_H);
   TFDecode(g_hexWord,g_pxWord,TF_WORD_W*TF_WORD_H);
}

//+------------------------------------------------------------------+
//| License system (offline key bound to the MT5 account number)     |
//| Key format:  TF-<account hex8>-<expiry hex4>-<check hex10>       |
//| CHANGE TF_SALT (and the same value in tradifive_keygen.py)       |
//| before you sell the EA, then distribute the compiled .ex5 only.  |
//+------------------------------------------------------------------+
#define TF_SALT "TFv1-Zk39xQ-7mLpA2"

int      g_licStatus=3;       // 1 active, 2 expired / invalid, 3 trial
datetime g_licTill=0;
string   g_licKey="";
string   g_licKeyMsg="";
datetime g_licLast=0;

string TFHexStr(const ulong v,const int digits)
{
   const string hx="0123456789ABCDEF";
   string s="";
   for(int i=digits-1;i>=0;i--)
      s+=StringSubstr(hx,(int)((v>>(4*i))&0xF),1);
   return s;
}

bool TFIsHex(const int c)
{
   return ((c>='0' && c<='9') || (c>='A' && c<='F') || (c>='a' && c<='f'));
}

string TFNormKey(string k)
{
   StringToUpper(k);
   StringReplace(k," ","");
   StringReplace(k,"\t","");
   StringReplace(k,"\r","");
   StringReplace(k,"\n","");
   return k;
}

ulong TFHash64(const string s)
{
   ulong h=0xCBF29CE484222325;
   const ulong prime=0x100000001B3;
   const int n=StringLen(s);
   for(int i=0;i<n;i++)
   {
      h^=(ulong)(StringGetCharacter(s,i)&0xFF);
      h*=prime;
   }
   return h;
}

ulong TFLicHash(const ulong login,const int expDays)
{
   ulong h=TFHash64(TF_SALT+":"+IntegerToString((long)login)+":"+IntegerToString(expDays));
   h^=(h>>32);
   return (h&0xFFFFFFFFFF);
}

bool TFParseKey(const string k,ulong &login,int &expDays,ulong &chk)
{
   if(StringLen(k)!=27)
      return false;
   if(StringSubstr(k,0,3)!="TF-" || StringGetCharacter(k,11)!='-' || StringGetCharacter(k,16)!='-')
      return false;
   for(int i=3;i<27;i++)
   {
      if(i==11 || i==16)
         continue;
      if(!TFIsHex((int)StringGetCharacter(k,i)))
         return false;
   }
   login=0; chk=0;
   int e=0;
   for(int i=3;i<11;i++)  login=(login<<4)|(ulong)TFHexVal((int)StringGetCharacter(k,i));
   for(int i=12;i<16;i++) e=(e<<4)|TFHexVal((int)StringGetCharacter(k,i));
   for(int i=17;i<27;i++) chk=(chk<<4)|(ulong)TFHexVal((int)StringGetCharacter(k,i));
   expDays=e;
   return true;
}

string TFLicGV(const string part)
{
   return "TFLIC3_"+IntegerToString((long)AccountInfoInteger(ACCOUNT_LOGIN))+"_"+part;
}

void TFLicEval()
{
   g_licLast=TimeLocal();
   g_licKeyMsg="";
   if(MQLInfoInteger(MQL_TESTER))
   {
      g_licStatus=1;
      g_licTill=(datetime)4102444799;
      return;
   }
   const datetime now=TimeCurrent();
   bool keyOK=false;
   datetime kt=0;
   if(g_licKey!="")
   {
      ulong lg=0,ck=0;
      int ed=0;
      if(!TFParseKey(g_licKey,lg,ed,ck) || ck!=TFLicHash(lg,ed))
         g_licKeyMsg="Invalid license key";
      else if(lg!=0 && lg!=(ulong)AccountInfoInteger(ACCOUNT_LOGIN))
         g_licKeyMsg="Account number didn't match";
      else
      {
         keyOK=true;
         kt=(datetime)(1704067200+(long)ed*86400+86399);
      }
   }
   if(keyOK)
   {
      g_licTill=kt;
      g_licStatus=(now<=kt)?1:2;
      if(g_licStatus==2)
         g_licKeyMsg="License expired on "+TimeToString(kt,TIME_DATE);
      return;
   }
   const string tk=TFLicGV("TRIAL");
   if(!GlobalVariableCheck(tk))
      GlobalVariableSet(tk,(double)now);
   const datetime t0=(datetime)(long)GlobalVariableGet(tk);
   g_licTill=(datetime)((long)t0+(long)TrialDays*86400);
   g_licStatus=(TrialDays>0 && now<=g_licTill)?3:2;
}

void TFLicSetKey(const string raw)
{
   g_licKey=TFNormKey(raw);
   if(g_licKey=="")
   {
      GlobalVariableDel(TFLicGV("KEY_L"));
      GlobalVariableDel(TFLicGV("KEY_E"));
      GlobalVariableDel(TFLicGV("KEY_C"));
   }
   else
   {
      ulong lg=0,ck=0;
      int ed=0;
      if(TFParseKey(g_licKey,lg,ed,ck))
      {
         GlobalVariableSet(TFLicGV("KEY_L"),(double)lg);
         GlobalVariableSet(TFLicGV("KEY_E"),(double)ed);
         GlobalVariableSet(TFLicGV("KEY_C"),(double)ck);
      }
   }
   TFLicEval();
}

void TFLicLoad()
{
   g_licKey="";
   if(GlobalVariableCheck(TFLicGV("KEY_L")) && GlobalVariableCheck(TFLicGV("KEY_E")) && GlobalVariableCheck(TFLicGV("KEY_C")))
   {
      g_licKey="TF-"+TFHexStr((ulong)GlobalVariableGet(TFLicGV("KEY_L")),8)
               +"-"+TFHexStr((ulong)GlobalVariableGet(TFLicGV("KEY_E")),4)
               +"-"+TFHexStr((ulong)GlobalVariableGet(TFLicGV("KEY_C")),10);
   }
   else
      g_licKey=TFNormKey(LicenseKey);
   TFLicEval();
}

void TFLicTick()
{
   if(g_licLast==0 || (TimeLocal()-g_licLast)>=30)
      TFLicEval();
}

bool TFLicBlocked()
{
   return (RequireLicense && g_licStatus==2 && !MQLInfoInteger(MQL_TESTER));
}

bool TFLicenseOK()
{
   return !TFLicBlocked();
}

int TFLicDays()
{
   return (int)MathCeil((double)(g_licTill-TimeCurrent())/86400.0);
}

//+------------------------------------------------------------------+
//| Dashboard (landscape, flat terminal style)                       |
//+------------------------------------------------------------------+
class CTFDash
{
private:
   CCv     m_s,m_d;           // static layer, dynamic layer
   bool    m_ok;
   string  m_nS,m_nD,m_nE;
   int     m_x,m_y,m_ph;
   bool    m_min;
   int     m_page;            // 0 main, 1 settings
   bool    m_stDirty,m_dirty;
   color   m_accC;
   uint    m_acc,m_acc2;
   TFSnap  m_snap;
   string  m_snapSig;
   TFTrade m_tr[];
   int     m_trN;
   double  m_bal,m_eq,m_float,m_netUsd,m_ddUsd,m_netPct,m_ddPct,m_winRate,m_ddScale;
   double  m_vNet,m_tNet,m_vDD,m_tDD,m_vLvl,m_tLvl,m_vWin,m_tWin;
   double  m_hA[128];         // hover animation per hit id
   double  m_swA[TF_NF];         // switch / segment animation per field
   ulong   m_posSig;
   THit    m_hit[];
   int     m_hitN,m_hover,m_edit;
   bool    m_prevDown,m_inside;
   string  m_msg;
   uint    m_msgTick,m_lastGather;
   string  m_sig;
   double  m_gT,m_dayBase;
   uint    m_licToast;
   long    m_cpOld[11];
   int     m_cpId[11];
   bool    m_themed;
   bool    m_ovOn,m_ovHide;

   //--- helpers -------------------------------------------------------
   void AddHit(const int id,const int x,const int y,const int w,const int h)
   {
      ArrayResize(m_hit,m_hitN+1);
      m_hit[m_hitN].id=id; m_hit[m_hitN].x=x; m_hit[m_hitN].y=y; m_hit[m_hitN].w=w; m_hit[m_hitN].h=h;
      m_hitN++;
   }

   int HitTest(const int x,const int y)
   {
      for(int i=m_hitN-1;i>=0;i--)
      {
         if(x>=m_hit[i].x && x<=m_hit[i].x+m_hit[i].w && y>=m_hit[i].y && y<=m_hit[i].y+m_hit[i].h)
            return m_hit[i].id;
      }
      return H_NONE;
   }

   void Ease(double &v,const double t,const double k,const double eps,bool &moving)
   {
      const double d=t-v;
      if(MathAbs(d)<=eps)
      {
         if(v!=t) { v=t; moving=true; }
         return;
      }
      v+=d*k;
      moving=true;
   }

   uint ZoneClr(const double f)
   {
      if(f<0.5)  return TFMix(TFC_POS,TFC_GOLD,f/0.5);
      if(f<0.85) return TFMix(TFC_GOLD,(uint)0xFFF08A3C,(f-0.5)/0.35);
      return TFC_NEG;
   }

   uint StatusClr()
   {
      if(m_snap.statusKind==2) return TFC_NEG;
      if(m_snap.statusKind==1) return TFC_GOLD;
      return TFC_POS;
   }

   void ThemeChart()
   {
      if(!ApplyChartTheme || m_themed)
         return;
      const int ids[11]={CHART_COLOR_BACKGROUND,CHART_COLOR_FOREGROUND,CHART_COLOR_GRID,CHART_COLOR_CHART_UP,
                         CHART_COLOR_CHART_DOWN,CHART_COLOR_CHART_LINE,CHART_COLOR_CANDLE_BULL,CHART_COLOR_CANDLE_BEAR,
                         CHART_COLOR_VOLUME,CHART_SHOW_GRID,CHART_MODE};
      const long vals[11]={(long)C'10,10,12',(long)C'130,136,150',(long)C'24,24,28',(long)C'124,196,255',
                           (long)C'70,128,205',(long)C'124,196,255',(long)C'124,196,255',(long)C'70,128,205',
                           (long)C'60,84,120',0,(long)CHART_CANDLES};
      for(int i=0;i<11;i++)
      {
         m_cpId[i]=ids[i];
         m_cpOld[i]=ChartGetInteger(0,(ENUM_CHART_PROPERTY_INTEGER)ids[i]);
         ChartSetInteger(0,(ENUM_CHART_PROPERTY_INTEGER)ids[i],vals[i]);
      }
      m_themed=true;
      ChartRedraw(0);
   }

   void RestoreChart()
   {
      if(!m_themed)
         return;
      for(int i=0;i<11;i++)
         ChartSetInteger(0,(ENUM_CHART_PROPERTY_INTEGER)m_cpId[i],m_cpOld[i]);
      m_themed=false;
   }

   void FieldPos(const int fi,int &bx,int &by)
   {
      const int col=(fi<8)?0:((fi<16)?1:2);
      const int row=fi-col*8;
      bx=16+col*324+188;
      by=94+row*26;
   }

   void Frame(const int h)
   {
      m_s.RRect(0,0,TF_PW,h,16,TFC_BG1,TFC_BG2,TFC_LINE,1.0,(uint)0x90000000,12.0);
   }

   // raised card: soft shadow, top highlight, bottom shade
   void Card(const double x,const double y,const double w,const double h)
   {
      m_s.RRect(x,y+4,w,h,16,0,0,0,0.0,(uint)0x90000000,12.0);
      m_s.RRect(x,y,w,h,16,(uint)0xFF1F1F23,(uint)0xFF151518,TFC_LINE,1.0);
      m_s.LineT(x+16,y+1.3,x+w-16,y+1.3,0.5,0.5,TFA(TFC_WHITE,30));
      m_s.LineT(x+16,y+h-1.3,x+w-16,y+h-1.3,0.5,0.5,(uint)0x6E000000);
   }

   // recessed box inside a card
   void Inset(const double x,const double y,const double w,const double h,const double r)
   {
      m_s.RRect(x,y,w,h,r,(uint)0xFF111113,(uint)0xFF18181B,(uint)0xFF2A2A2F,1.0);
      m_s.LineT(x+r,y+1.3,x+w-r,y+1.3,0.5,0.5,(uint)0x80000000);
   }

   // small pill badge, returns its width. kind 0 grey, 1 blue, 2 green
   int Chip(CCv &cv,const double x,const double y,const string s,const int kind)
   {
      const int w=cv.TW(s,8,true)+22;
      uint f=(uint)0xFF26262B,b=(uint)0xFF26262B,tc=TFC_DIM;
      if(kind==1)      { f=(uint)0xFF16243C; b=(uint)0xFF2C4A7E; tc=(uint)0xFF6FA8FF; }
      else if(kind==2) { f=TFA(TFC_POS,30);  b=TFA(TFC_POS,110); tc=TFC_POS; }
      cv.RRect(x,y,w,18,9,f,f,b,1.0);
      cv.Txt(x+w*0.5,y+9,s,tc,8,true,TA_CENTER|TA_VCENTER);
      return w;
   }

   // pill button (arrow: 1 = arrow right, -1 = arrow left)
   void Btn(const int x,const int y,const int w,const int h,const string t,const int id,const int kind,const int arrow=0)
   {
      const double a=m_hA[id];
      uint t0,b0,brd,tc;
      if(kind==1)
      {
         t0=TFMix((uint)0xFF1C2E4E,(uint)0xFF27426E,a);
         b0=TFMix((uint)0xFF111C32,(uint)0xFF182B4A,a);
         brd=TFMix((uint)0xFF2F4F86,(uint)0xFF5B8AD6,a);
         tc=TFMix((uint)0xFF6FA8FF,(uint)0xFFA6CBFF,a);
      }
      else if(kind==2)
      {
         t0=TFMix((uint)0xFF2B1B1E,(uint)0xFF3B2226,a);
         b0=TFMix((uint)0xFF1B1113,(uint)0xFF2A181B,a);
         brd=TFMix((uint)0xFF5A2A31,(uint)0xFF8E3C47,a);
         tc=TFC_NEG;
      }
      else
      {
         t0=TFMix((uint)0xFF27272B,(uint)0xFF34343A,a);
         b0=TFMix((uint)0xFF151517,(uint)0xFF1E1E21,a);
         brd=TFMix((uint)0xFF35353B,(uint)0xFF55555F,a);
         tc=TFC_TXT;
      }
      m_d.RRect(x,y,w,h,h*0.5,t0,b0,brd,1.0);
      m_d.LineT(x+h*0.5,y+1.6,x+w-h*0.5,y+1.6,0.5,0.5,TFA(TFC_WHITE,28));
      const double cy=y+h*0.5;
      const int tw=m_d.TW(t,10,true);
      const double total=tw+(arrow!=0?16.0:0.0);
      const double x0=x+(w-total)*0.5;
      if(arrow<0)
      {
         m_d.LineT(x0,cy,x0+9,cy,0.8,0.8,tc);
         m_d.LineT(x0,cy,x0+4,cy-3.5,0.8,0.8,tc);
         m_d.LineT(x0,cy,x0+4,cy+3.5,0.8,0.8,tc);
         m_d.Txt(x0+16,cy,t,tc,10,true,TA_LEFT|TA_VCENTER);
      }
      else
      {
         m_d.Txt(x0,cy,t,tc,10,true,TA_LEFT|TA_VCENTER);
         if(arrow>0)
         {
            const double ax=x0+tw+7;
            m_d.LineT(ax,cy,ax+9,cy,0.8,0.8,tc);
            m_d.LineT(ax+9,cy,ax+5,cy-3.5,0.8,0.8,tc);
            m_d.LineT(ax+9,cy,ax+5,cy+3.5,0.8,0.8,tc);
         }
      }
   }

   void KpiIcon(CCv &cv,const double x,const double y,const int kind,const uint c,const bool neg)
   {
      cv.Disc(x,y,13,TFA(c,34),TFA(c,34),TFA(c,120),1.0);
      if(kind==0)
      {
         const double s=neg?-1.0:1.0;
         cv.LineT(x,y+5*s,x,y-5*s,1.1,1.1,c);
         cv.LineT(x,y-5*s,x-4,y-1*s,1.1,1.1,c);
         cv.LineT(x,y-5*s,x+4,y-1*s,1.1,1.1,c);
      }
      else if(kind==1)
      {
         cv.RRect(x-6,y+1,3,5,1,c,c);
         cv.RRect(x-1.5,y-3,3,9,1,c,c);
         cv.RRect(x+3,y-6,3,12,1,c,c);
      }
      else if(kind==2)
      {
         cv.LineT(x-4,y+4,x+4,y-4,1.1,1.1,c);
         cv.LineT(x+4,y-4,x-1,y-4,1.1,1.1,c);
         cv.LineT(x+4,y-4,x+4,y+1,1.1,1.1,c);
      }
      else
      {
         cv.RRect(x-6,y-4,12,3,1.5,c,c);
         cv.RRect(x-6,y+1,12,3,1.5,c,c);
      }
   }

   // arc with rounded caps (angles in radians), c0 at a0 side, c1 at a1 side
   void Donut(const double cx,const double cy,const double a0,const double a1,const uint c0,const uint c1)
   {
      if(MathAbs(a1-a0)<0.03)
         return;
      if(a1>a0) m_d.ArcBand(cx,cy,44,52,a0,a1,c0,c1);
      else      m_d.ArcBand(cx,cy,44,52,a1,a0,c1,c0);
      m_d.Disc(cx+MathCos(a0)*48.0,cy+MathSin(a0)*48.0,4.0,c0,c0);
      m_d.Disc(cx+MathCos(a1)*48.0,cy+MathSin(a1)*48.0,4.0,c1,c1);
   }

   //--- STATIC layer --------------------------------------------------
   void HeaderStatic(const bool settings,const bool minimal)
   {
      if(ArraySize(g_pxIcon)>=TF_ICON_W*TF_ICON_H && ArraySize(g_pxWord)>=TF_WORD_W*TF_WORD_H)
      {
         m_s.DrawPx(g_pxIcon,TF_ICON_W,TF_ICON_H,16,10);
         m_s.DrawPx(g_pxWord,TF_WORD_W,TF_WORD_H,54,11);
         m_s.Txt(182,23,settings?"Settings":TFSymTf(),TFC_DIM,11);
      }
      else
      {
         m_s.RRect(16,12,20,20,5,m_acc,m_acc);
         m_s.RRect(21,17,10,3,1,TFC_WHITE,TFC_WHITE);
         m_s.RRect(24.5,17,3,10,1,TFC_WHITE,TFC_WHITE);
         m_s.Txt(46,22,"TRADIFIVE",TFC_TXT,15,true);
         m_s.Txt(150,23,settings?"Settings":TFSymTf(),TFC_DIM,11);
      }
      if(!minimal)
         m_s.LineT(1,44,TF_PW-1,44,0.5,0.5,TFC_LINE);
      if(settings)
         return;
      const int sx[4]={296,440,580,700};
      for(int i=0;i<4;i++)
         m_s.LineT(sx[i],10,sx[i],34,0.5,0.5,TFC_LINE);
      m_s.Txt(312,14,"STATUS",TFC_DIM,8,true);
      if(minimal)
      {
         m_s.Txt(454,14,"TODAY P/L",TFC_DIM,8,true);
         m_s.Txt(594,14,"EQUITY",TFC_DIM,8,true);
         m_s.Txt(714,14,"FLOATING",TFC_DIM,8,true);
      }
      else
      {
         m_s.Txt(454,14,"POSITIONS",TFC_DIM,8,true);
         m_s.Txt(714,14,"SPREAD / MAX",TFC_DIM,8,true);
      }
   }

   void StaticMain()
   {
      Frame(TF_PH_MAIN);
      HeaderStatic(false,false);
      AddHit(H_SET,816,8,64,28);
      AddHit(H_MIN,888,8,56,28);
      AddHit(H_STATUS,300,6,150,32);

      // ---- hero card: speedometer
      Card(16,56,380,302);
      const double cx=206,cy=170,T=m_gT;
      m_s.Disc(cx,cy,104,(uint)0xFF232327,(uint)0xFF111113,(uint)0xFF35353B,1.5);
      m_s.Disc(cx,cy,100,(uint)0xFF17171B,(uint)0xFF0C0C0F);
      const double az=TF_G0+TF_GS/3.0,ae=TF_G0+TF_GS;
      m_s.ArcBand(cx,cy,88,96,TF_G0,az-0.012,TFA(TFC_NEG,85),TFA(TFC_NEG,85));
      m_s.ArcBand(cx,cy,88,96,az+0.012,ae,TFA(m_acc,85),TFA(TFC_POS,85));
      for(int i=0;i<4;i++)
      {
         const double fr=(double)i/3.0;
         const double a=TF_G0+TF_GS*fr;
         const double v=-T*0.5+T*1.5*fr;
         const string s=(i==1)?"0":DoubleToString(v,1)+"%";
         m_s.Txt(cx+MathCos(a)*62.0,cy+MathSin(a)*62.0,s,(i==3)?TFC_GOLD:TFC_DIM,9,true,TA_CENTER|TA_VCENTER);
      }
      m_s.Txt(cx,203,"TODAY",TFC_DIM,8,true,TA_CENTER|TA_VCENTER);
      // side rings: level (left) and win rate (right)
      for(int k=0;k<2;k++)
      {
         const double rx=(k==0)?64.0:348.0;
         m_s.Disc(rx,112,35,(uint)0xFF232327,(uint)0xFF111113,(uint)0xFF35353B,1.5);
         m_s.Disc(rx,112,32,(uint)0xFF17171B,(uint)0xFF0C0C0F);
         m_s.ArcBand(rx,112,24,31,0.0,2.0*M_PI,TFC_TRACK,TFC_TRACK);
         m_s.Txt(rx,160,(k==0)?"LEVEL":"WIN RATE",TFC_DIM,8,true,TA_CENTER|TA_VCENTER);
      }
      Inset(28,284,348,62,12);
      m_s.Txt(40,298,"DAILY TARGET",TFC_DIM,9,true);
      m_s.RRect(40,310,324,6,3,TFC_TRACK,TFC_TRACK);

      // ---- six KPI cards (3 x 2) + license strip
      string kc[6]={"BALANCE","EQUITY","FLOATING P/L","TODAY P/L","TOTAL PROFIT","WITHDRAWAL"};
      for(int i=0;i<6;i++)
      {
         const int kx=408+(i%3)*189;
         const int ky=(i<3)?56:174;
         Card(kx,ky,178,108);
         Chip(m_s,kx+14,ky+12,kc[i],0);
      }
      Card(408,292,556,66);
      m_s.Txt(424,304,"LICENSE STATUS",TFC_DIM,8,true);
      m_s.Txt(600,304,"VALID TILL",TFC_DIM,8,true);
      m_s.Txt(800,304,"DAYS LEFT",TFC_DIM,8,true);

      // ---- bottom strip: live trades + basket
      Card(16,368,948,152);
      Chip(m_s,32,376,"LIVE TRADES",0);
      Inset(28,400,684,110,12);
      m_s.Txt(44,412,"TYPE",TFC_DIM,8,true);
      m_s.Txt(110,412,"TICKET",TFC_DIM,8,true);
      m_s.Txt(290,412,"LOTS",TFC_DIM,8,true,TA_RIGHT|TA_VCENTER);
      m_s.Txt(410,412,"OPEN PRICE",TFC_DIM,8,true,TA_RIGHT|TA_VCENTER);
      m_s.Txt(530,412,"CURRENT",TFC_DIM,8,true,TA_RIGHT|TA_VCENTER);
      m_s.Txt(696,412,"PROFIT",TFC_DIM,8,true,TA_RIGHT|TA_VCENTER);
      m_s.LineT(44,422,696,422,0.5,0.5,TFC_LINE);
      Chip(m_s,728,376,"BASKET",0);
      Inset(724,400,228,110,12);
      m_s.Txt(738,418,"AVG",TFC_DIM,9,true);
      m_s.Txt(738,440,"TP",TFC_DIM,9,true);
      m_s.Txt(738,462,"NEXT",TFC_DIM,9,true);
      m_s.Txt(738,484,"P/L",TFC_DIM,9,true);

      m_s.Txt(TF_PW-16,538,"ACCOUNT "+IntegerToString((long)AccountInfoInteger(ACCOUNT_LOGIN))+"   |   MAGIC "+IntegerToString((long)MagicNumber),
              TFC_DIM,9,false,TA_RIGHT|TA_VCENTER);
   }

   // word-wrap a string to a pixel width (uses the static canvas font metrics)
   int Wrap(const string s,const int px,const double maxw,string &out[])
   {
      ArrayResize(out,0);
      string words[];
      const int n=StringSplit(s,' ',words);
      string cur="";
      for(int i=0;i<n;i++)
      {
         const string trial=(cur=="")?words[i]:cur+" "+words[i];
         if(cur!="" && m_s.TW(trial,px,false)>maxw)
         {
            const int k=ArraySize(out);
            ArrayResize(out,k+1);
            out[k]=cur;
            cur=words[i];
         }
         else
            cur=trial;
      }
      if(cur!="")
      {
         const int k=ArraySize(out);
         ArrayResize(out,k+1);
         out[k]=cur;
      }
      return ArraySize(out);
   }

   int OvKind()
   {
      if(TFLicBlocked())
         return 3;
      return m_snap.dayKind;
   }

   // full-panel modal: daily target (1), daily loss limit (2) or license required (3)
   void StaticOverlay()
   {
      const int ok=OvKind();
      const uint kc=(ok==2)?(uint)0xFFF08A3C:((ok==3)?TFC_NEG:TFC_POS);
      const int y0=52+((m_ph-64)-424)/2;
      m_s.RRect(12,52,956,m_ph-64,16,(uint)0xF8121215,(uint)0xF80A0A0C,TFA(kc,120),1.5,TFA(kc,40),10.0);
      m_s.oy=TF_PAD+y0;

      // status chip + title
      const string ct=(ok==1)?"DAILY TARGET REACHED":((ok==2)?"DAILY LOSS LIMIT REACHED":"ACTION NEEDED");
      const double cw=m_s.TxtSpW(ct,9,true,1.6)+36.0;
      m_s.RRect(490-cw*0.5,92,cw,24,12,TFA(kc,26),TFA(kc,26),TFA(kc,130),1.0);
      m_s.TxtSpC(490,104,ct,kc,9,true,1.6);
      m_s.TxtSpC(490,152,(ok==3)?"LICENSE REQUIRED":"ENGINE OFF",TFC_WHITE,38,true,4.0);

      // stat tiles (values are drawn live)
      string lb[3];
      if(ok==3)
      {
         lb[0]="YOUR ACCOUNT"; lb[1]="STATUS"; lb[2]="CONTACT SUPPORT";
      }
      else
      {
         lb[0]=(ok==1)?"TODAY'S PROFIT":"TODAY'S RESULT"; lb[1]="RETURN TODAY"; lb[2]="NEXT SESSION";
      }
      for(int i=0;i<3;i++)
      {
         const int x=191+i*204;
         Inset(x,186,190,58,10);
         m_s.TxtSp(x+16,201,lb[i],TFC_DIM,8,true,1.4);
      }

      // message box
      string m1,m2,q;
      MqlDateTime d;
      TimeToStruct(TimeCurrent(),d);
      const int qi=d.day_of_year%6;
      if(ok==1)
      {
         string qs[6]={"Discipline is the bridge between goals and profit.",
                       "Small profits, taken every day, build big accounts.",
                       "The market will be here tomorrow. Make sure your capital is too.",
                       "Greed empties accounts. Patience fills them.",
                       "A day closed in profit is a day won.",
                       "Consistency beats intensity - every single time."};
         m1="You worked hard today. Come back tomorrow - I will make the profit again and hand it to you.";
         m2="Do not take any stress now. I am here every single day. Just do not be greedy - keep 2%, it is already nice.";
         q=qs[qi];
      }
      else if(ok==2)
      {
         string qs[6]={"Protecting capital is the first profit.",
                       "A small loss taken on time saves a big one.",
                       "Tomorrow is a new chance. Discipline will take us there.",
                       "Professionals survive first, profit second.",
                       "Never chase the market. It always returns to the patient.",
                       "One bad day never defines a good trader."};
         m1="Today was not our day, and that is completely okay. Your capital is protected.";
         m2="Rest now and do not chase it back. Tomorrow I will be back at work for you.";
         q=qs[qi];
      }
      else
      {
         m1="Your license is not active, so Tradifive cannot open new trades.";
         m2="Send your account number to support to get a key, then open SET and paste it into the License key box.";
         q="Tradifive support  -  "+SupportContact;
      }
      Inset(110,260,760,84,12);
      string l1[],l2[];
      const int n1=Wrap(m1,14,704.0,l1);
      const int n2=Wrap(m2,13,704.0,l2);
      double ly=302.0-(n1+n2-1)*11.0;
      for(int i=0;i<n1;i++)
      {
         m_s.Txt(490,ly,l1[i],TFC_TXT,14,false,TA_CENTER|TA_VCENTER);
         ly+=22.0;
      }
      for(int i=0;i<n2;i++)
      {
         m_s.Txt(490,ly,l2[i],TFC_DIM,13,false,TA_CENTER|TA_VCENTER);
         ly+=22.0;
      }

      // quote line with accent rules
      const double qw=m_s.TxtSpW(q,12,true,0.5);
      m_s.LineT(490-qw*0.5-48,372,490-qw*0.5-16,372,0.6,0.6,TFA(kc,160));
      m_s.LineT(490+qw*0.5+16,372,490+qw*0.5+48,372,0.6,0.6,TFA(kc,160));
      m_s.TxtSpC(490,372,q,(ok==3)?m_acc:kc,12,true,0.5);

      m_s.oy=TF_PAD;
      AddHit(H_OVER,400,y0+398,180,26);
   }

   void StaticMin()
   {
      Frame(TF_PH_MIN);
      HeaderStatic(false,true);
      AddHit(H_MIN,888,8,56,28);
   }

   void StaticSettings()
   {
      Frame(TF_PH_SET);
      HeaderStatic(true,false);
      AddHit(H_RESET,812,8,64,28);
      AddHit(H_BACK,884,8,60,28);
      string ct[3]={"STRATEGY","EXECUTION & RISK","DAILY CONTROL & SESSION"};
      for(int c=0;c<3;c++)
      {
         const int cx=16+c*324;
         Card(cx,56,300,302);
         Chip(m_s,cx+16,64,ct[c],0);
      }
      for(int fi=0;fi<TF_NF;fi++)
      {
         int bx,by;
         FieldPos(fi,bx,by);
         m_s.Txt(bx-172,by+12,g_f[fi].label,TFC_TXT,11);
         m_s.RRect(bx,by,96,24,6,TFC_BOX,TFC_BOX,TFC_LINE,1.0);
         AddHit(H_FIELD+fi,bx,by,96,24);
      }
      Card(16,368,948,64);
      Chip(m_s,32,378,"LICENSE KEY",0);
      m_s.RRect(128,376,520,26,7,TFC_BOX,TFC_BOX,TFC_LINE,1.0);
      AddHit(H_LICKEY,128,376,520,26);
      AddHit(H_LICACT,660,376,100,26);
      m_s.Txt(TF_PW-16,444,"Click a value, type, press ENTER  |  switches apply instantly  |  saved per symbol + magic",
              TFC_DIM,9,false,TA_RIGHT|TA_VCENTER);
   }

   void DrawStatic()
   {
      m_stDirty=false;
      ArrayResize(m_hit,0);
      m_hitN=0;
      m_s.Erase(0);
      if(m_min)           StaticMin();
      else if(m_page==1)  StaticSettings();
      else
      {
         StaticMain();
         if(m_ovOn)
            StaticOverlay();
      }
      m_s.Update(false);
   }

   //--- DYNAMIC layer -------------------------------------------------
   void DynHeader()
   {
      const uint sc=StatusClr();
      m_d.Disc(317,31,3.5,sc,sc);
      m_d.Txt(327,31,m_snap.status,sc,11,true);
      if(m_min)
      {
         m_d.Txt(454,31,TFMoney(m_netUsd),TFSignClr(m_netUsd),12,true);
         m_d.Txt(594,31,TFMoney(m_eq,false),TFC_TXT,12,true);
         m_d.Txt(714,31,TFMoney(m_float),TFSignClr(m_float),12,true);
         Btn(888,8,56,28,"MAX",H_MIN,1,0);
         return;
      }
      m_d.Txt(454,31,"BUY "+IntegerToString(m_snap.buyCnt),m_snap.buyCnt>0?TFC_POS:TFC_DIM,11,true);
      m_d.Txt(522,31,"SELL "+IntegerToString(m_snap.sellCnt),m_snap.sellCnt>0?TFC_NEG:TFC_DIM,11,true);
      string st="All day";
      uint stc=TFC_TXT;
      if(SessionOn)
      {
         st=TFHM(SessionStart)+" - "+TFHM(SessionEnd);
         stc=TFSessionOpen()?TFC_POS:TFC_GOLD;
      }
      m_d.Txt(594,14,SessionLocal?"SESSION (PC)":"SESSION (BROKER)",TFC_DIM,8,true);
      m_d.Txt(594,31,st,stc,11,true);
      const int sp=(int)SymbolInfoInteger(_Symbol,SYMBOL_SPREAD);
      const bool bad=(UseSpreadFilter && sp>MaximumSpreadPoints);
      m_d.Txt(714,31,IntegerToString(sp)+" / "+IntegerToString(MaximumSpreadPoints),bad?TFC_NEG:TFC_TXT,11,true);
      Btn(816,8,64,28,"SET",H_SET,1,1);
      Btn(888,8,56,28,"MIN",H_MIN,0,0);
   }

   void DynMain()
   {
      DynHeader();
      const double cx=206,cy=170,T=m_gT;
      const double v=TFClamp(m_vNet,-T*0.5,T);
      const double f=(v+T*0.5)/(T*1.5);
      const double third=1.0/3.0;

      // ticks: lit up to the current value
      for(int i=0;i<=40;i++)
      {
         const double fi=i/40.0;
         const double a=TF_G0+TF_GS*fi;
         const bool major=(i%5==0);
         const double r0=major?74.0:79.0;
         bool lit=false;
         if(f>=third) lit=(fi>=third-1e-9 && fi<=f+1e-9);
         else         lit=(fi<=third+1e-9 && fi>=f-1e-9);
         const uint c=(fi<third-1e-9)?TFC_NEG:TFMix(m_acc,TFC_POS,(fi-third)/(2.0*third));
         if(lit)
            m_d.LineT(cx+MathCos(a)*r0,cy+MathSin(a)*r0,cx+MathCos(a)*86.0,cy+MathSin(a)*86.0,major?1.6:1.1,major?1.6:1.1,c,TFA(c,110),4.0);
         else
            m_d.LineT(cx+MathCos(a)*r0,cy+MathSin(a)*r0,cx+MathCos(a)*86.0,cy+MathSin(a)*86.0,0.8,0.8,(uint)0xFF3A3A42);
      }
      // needle
      {
         const double a=TF_G0+TF_GS*f;
         const uint nc=(f>=third)?TFMix(m_acc,TFC_POS,(f-third)/(2.0*third)):TFC_NEG;
         m_d.LineT(cx-MathCos(a)*10.0,cy-MathSin(a)*10.0,cx+MathCos(a)*68.0,cy+MathSin(a)*68.0,3.0,0.8,nc,TFA(nc,120),6.0);
         m_d.Disc(cx,cy,10,(uint)0xFF1C1C20,(uint)0xFF111113,nc,2.0,TFA(nc,100),5.0);
         m_d.Disc(cx,cy,4,nc,nc);
      }
      m_d.Txt(cx,224,(m_netPct>0.004?"+":"")+DoubleToString(m_netPct,2)+"%",TFSignClr(m_netPct),22,true,TA_CENTER|TA_VCENTER);
      m_d.Txt(cx,248,TFMoney(m_netUsd),TFC_DIM,11,false,TA_CENTER|TA_VCENTER);

      // side rings (dynamic)
      {
         const double mxl=(double)MaximumOrdersPerBasket;
         double fl=TFClamp(m_vLvl/mxl,0.0,1.0);
         if(m_vLvl>0.05 && fl<0.04) fl=0.04;
         if(fl>0.001)
         {
            const double a1=-M_PI_2+2.0*M_PI*fl;
            const uint cA=TFC_GOLD,cB=(uint)0xFFFF8A3C;
            m_d.ArcBand(64,112,24,31,-M_PI_2,a1,cA,cB);
            m_d.Disc(64+MathCos(-M_PI_2)*27.5,112+MathSin(-M_PI_2)*27.5,3.5,cA,cA);
            m_d.Disc(64+MathCos(a1)*27.5,112+MathSin(a1)*27.5,3.5,cB,cB);
         }
         m_d.Txt(64,112,IntegerToString(m_snap.level)+"/"+IntegerToString(MaximumOrdersPerBasket),TFC_TXT,10,true,TA_CENTER|TA_VCENTER);
         const double fw=TFClamp(m_vWin/100.0,0.0,1.0);
         if(fw>0.002)
         {
            const double a2=-M_PI_2+2.0*M_PI*fw;
            m_d.ArcBand(348,112,24,31,-M_PI_2,a2,TFC_POS,m_acc);
            m_d.Disc(348+MathCos(-M_PI_2)*27.5,112+MathSin(-M_PI_2)*27.5,3.5,TFC_POS,TFC_POS);
            m_d.Disc(348+MathCos(a2)*27.5,112+MathSin(a2)*27.5,3.5,m_acc,m_acc);
         }
         m_d.Txt(348,112,DoubleToString(m_vWin,0)+"%",TFC_TXT,14,true,TA_CENTER|TA_VCENTER);
      }

      // target strip
      {
         const double prog=DailyTargetOn?TFClamp(v/T,0.0,1.0):0.0;
         if(DailyTargetOn)
            m_d.Txt(202,298,"= "+TFMoney(m_dayBase*T/100.0,false),TFC_GOLD,10,true,TA_CENTER|TA_VCENTER);
         m_d.Txt(364,298,DailyTargetOn?DoubleToString(prog*100.0,0)+"%  of  +"+DoubleToString(T,1)+"%":"OFF",DailyTargetOn?TFC_TXT:TFC_DIM,10,true,TA_RIGHT|TA_VCENTER);
         if(prog>0.003)
            m_d.RRect(40,310,MathMax(6.0,324.0*prog),6,3,TFMix(m_acc,TFC_POS,prog),TFMix(m_acc,TFC_POS,prog));
         m_d.Txt(40,332,IntegerToString(g_hWins)+"W / "+IntegerToString(g_hLoss)+"L closed",TFC_TXT,10,true);
         m_d.Txt(202,332,"DD "+DoubleToString(m_ddPct,2)+"%",m_ddPct>0.004?TFC_NEG:TFC_DIM,10,true,TA_CENTER|TA_VCENTER);
         m_d.Txt(364,332,"LOTS "+DoubleToString(m_snap.lots,2),TFC_TXT,10,true,TA_RIGHT|TA_VCENTER);
      }

      // KPI cards
      {
         const double totalNow=g_hTotal+m_float;
         string vv[6];
         uint   vc[6];
         vv[0]=TFMoney(m_bal,false);  vc[0]=TFC_TXT;
         vv[1]=TFMoney(m_eq,false);   vc[1]=TFC_TXT;
         vv[2]=TFMoney(m_float);      vc[2]=TFSignClr(m_float);
         vv[3]=TFMoney(m_netUsd);     vc[3]=TFSignClr(m_netUsd);
         vv[4]=TFMoney(totalNow);     vc[4]=TFSignClr(totalNow);
         vv[5]=TFMoney(g_hWd,false);  vc[5]=TFC_TXT;
         for(int i=0;i<6;i++)
         {
            const int kx=408+(i%3)*189;
            const int ky=(i<3)?56:174;
            int fs=(int)MathMin(22.0,150.0/(StringLen(vv[i])*0.6));
            if(fs<11) fs=11;
            m_d.Txt(kx+14,ky+(i==3?58:68),vv[i],vc[i],fs,true);
            uint ic=m_acc;
            int  kind=1;
            bool neg=false;
            if(i==0)      { kind=3; }
            else if(i==2) { kind=0; ic=TFSignClr(m_float);  neg=(m_float<-0.004); }
            else if(i==3) { kind=0; ic=TFSignClr(m_netUsd); neg=(m_netUsd<-0.004); }
            else if(i==4) { kind=1; ic=TFSignClr(totalNow); }
            else if(i==5) { kind=2; ic=TFC_GOLD; }
            if(ic==TFC_TXT)
               ic=TFC_DIM;
            KpiIcon(m_d,kx+178-26,ky+25,kind,ic,neg);
         }
         m_d.Txt(408+3*189-189+14,174+86,(m_netPct>0.004?"+":"")+DoubleToString(m_netPct,2)+"% of day balance",TFSignClr(m_netPct),10,true);
      }
      // license
      {
         const int ls=g_licStatus;
         const uint lc=(ls==1)?TFC_POS:((ls==3)?TFC_GOLD:TFC_NEG);
         const int dl=TFLicDays();
         m_d.Disc(430,326,4.5,lc,lc,0,0,TFA(lc,150),5.0);
         m_d.Txt(442,326,(ls==1)?"ACTIVE":((ls==3)?"TRIAL":"EXPIRED"),lc,15,true);
         m_d.Txt(600,326,(g_licTill>0)?TimeToString(g_licTill,TIME_DATE):"-",TFC_TXT,15,true);
         m_d.Txt(800,326,(ls==2)?"0 days":IntegerToString(dl)+((dl==1)?" day":" days"),lc,15,true);
         string sub;
         if(ls==1)      sub="License verified successfully";
         else if(ls==3) sub=(g_licKeyMsg!="")?g_licKeyMsg+" - enter a valid key in SET":"Trial mode - enter your license key in SET";
         else           sub=((g_licKeyMsg!="")?g_licKeyMsg+".  ":"")+"Contact support: "+SupportContact;
         m_d.Txt(424,346,sub,(ls==1)?TFC_DIM:lc,9);
      }

      // live trades (bottom strip)
      {
         const int maxRows=4;
         const string cs=IntegerToString(m_trN)+" OPEN";
         const int cw2=m_d.TW(cs,8,true)+22;
         Chip(m_d,712-cw2,376,cs,1);
         if(m_trN>maxRows)
            m_d.Txt(126,385,"+ "+IntegerToString(m_trN-maxRows)+" older",TFC_DIM,9);
         if(m_trN==0)
            m_d.Txt(370,466,"No open trades - waiting for entry",TFC_DIM,11,false,TA_CENTER|TA_VCENTER);
         for(int r=0;r<maxRows && r<m_trN;r++)
         {
            const int idx=m_trN-1-r;
            const double y=436+r*20;
            if(r%2==0)
               m_d.RRect(34,y-9,672,18,5,TFA(TFC_WHITE,9),TFA(TFC_WHITE,9));
            const bool buy=(m_tr[idx].type==0);
            const uint tc=buy?TFC_POS:TFC_NEG;
            m_d.RRect(44,y-7,40,14,4,TFA(tc,36),TFA(tc,36));
            m_d.Txt(64,y,buy?"BUY":"SELL",tc,8,true,TA_CENTER|TA_VCENTER);
            m_d.Txt(110,y,IntegerToString((long)m_tr[idx].ticket),TFC_TXT,10);
            m_d.Txt(290,y,DoubleToString(m_tr[idx].vol,2),TFC_TXT,10,false,TA_RIGHT|TA_VCENTER);
            m_d.Txt(410,y,DoubleToString(m_tr[idx].open,_Digits),TFC_TXT,10,false,TA_RIGHT|TA_VCENTER);
            m_d.Txt(530,y,DoubleToString(m_tr[idx].cur,_Digits),TFC_TXT,10,false,TA_RIGHT|TA_VCENTER);
            m_d.Txt(696,y,TFMoney(m_tr[idx].profit),TFSignClr(m_tr[idx].profit),10,true,TA_RIGHT|TA_VCENTER);
         }
      }
      // basket
      {
         const bool hb=m_snap.hasBasket;
         if(hb)
         {
            const string nl="NEXT LOT "+DoubleToString(m_snap.nextLot,2);
            const int w2=m_d.TW(nl,8,true)+22;
            Chip(m_d,952-w2,376,nl,1);
         }
         m_d.Txt(940,418,hb?DoubleToString(m_snap.avg,_Digits):"-",TFC_TXT,11,true,TA_RIGHT|TA_VCENTER);
         m_d.Txt(940,440,hb?DoubleToString(m_snap.tp,_Digits):"-",hb?TFC_POS:TFC_DIM,11,true,TA_RIGHT|TA_VCENTER);
         m_d.Txt(940,462,hb?DoubleToString(m_snap.nextGrid,_Digits):"-",hb?TFC_GOLD:TFC_DIM,11,true,TA_RIGHT|TA_VCENTER);
         m_d.Txt(940,484,hb?TFMoney(m_snap.basketPL):"-",hb?TFSignClr(m_snap.basketPL):TFC_DIM,11,true,TA_RIGHT|TA_VCENTER);
      }
      if(m_snap.note!="")
         m_d.Txt(16,538,m_snap.note,TFC_GOLD,10);
      else
      {
         double bx=m_d.TxtSp(16,538,"FiAlgo V1",TFC_TXT,11,true,0.8)+12.0;
         bx=m_d.TxtSp(bx,539,"POWERED BY",TFC_DIM,8,true,1.6)+8.0;
         bx=m_d.TxtSp(bx,538,"Tradi",TFC_WHITE,11,true,0.5);
         m_d.TxtSp(bx,538,"five",(uint)0xFF1C64D8,11,true,0.5);
      }
   }

   // animated parts of the modal
   void DynOverlay()
   {
      const int ok=OvKind();
      const uint kc=(ok==2)?(uint)0xFFF08A3C:((ok==3)?TFC_NEG:TFC_POS);
      const double ms=(double)GetTickCount();
      const int y0=52+((m_ph-64)-424)/2;
      m_d.oy=TF_PAD+y0;

      // soft floating particles (celebration only)
      if(ok==1)
      {
         uint pal[3];
         pal[0]=kc; pal[1]=m_acc; pal[2]=TFC_WHITE;
         for(int i=0;i<16;i++)
         {
            const double sp=10.0+(double)((i*7)%14);
            const double yy=424.0-MathMod(ms*sp/1000.0+i*53.0,424.0);
            const double bx=(i%2==0)?(30.0+(double)((i*47)%130)):(820.0+(double)((i*47)%130));
            const double xx=bx+MathSin(ms/900.0+i)*8.0;
            const double rr=2.0+(double)(i%4);
            const uint col=TFA(pal[i%3],40+(i%3)*25);
            m_d.Disc(xx,yy,rr,col,col);
         }
      }

      // pulsing rings + power icon
      const double t=MathMod(ms,2400.0)/2400.0;
      for(int k=0;k<2;k++)
      {
         const double p=MathMod(t+k*0.5,1.0);
         const double r=34.0+p*16.0;
         const uint c=TFA(kc,(int)((1.0-p)*100.0));
         m_d.ArcBand(490,40,r,r+1.5,0.0,2.0*M_PI,c,c);
      }
      m_d.Disc(490,40,32,TFA(kc,16),TFA(kc,16),TFA(kc,70),1.0);
      m_d.ArcBand(490,40,16,20,-M_PI_2+0.62,-M_PI_2+2.0*M_PI-0.62,kc,kc,TFA(kc,110),7.0);
      m_d.LineT(490,18,490,38,2.2,2.2,kc,TFA(kc,110),5.0);

      // tile values
      string v[3];
      uint   c3[3];
      if(ok==3)
      {
         v[0]=IntegerToString((long)AccountInfoInteger(ACCOUNT_LOGIN)); c3[0]=TFC_TXT;
         v[1]=(g_licKeyMsg!="")?g_licKeyMsg:((TrialDays>0)?"Trial ended":"No license"); c3[1]=TFC_NEG;
         v[2]=SupportContact; c3[2]=m_acc;
      }
      else
      {
         v[0]=TFMoney(g_hToday);
         c3[0]=TFSignClr(g_hToday);
         v[1]=(m_netPct>0.004?"+":"")+DoubleToString(m_netPct,2)+"%";
         c3[1]=TFSignClr(m_netPct);
         v[2]=SessionOn?"Tomorrow "+TFHM(SessionStart):"Tomorrow";
         c3[2]=TFC_TXT;
      }
      for(int i=0;i<3;i++)
      {
         int fs=(int)MathMin(18.0,166.0/(StringLen(v[i])*0.6));
         if(fs<10) fs=10;
         m_d.Txt(191+i*204+16,226,v[i],c3[i],fs,true);
      }
      Btn(400,398,180,26,"VIEW DASHBOARD",H_OVER,1,1);
      m_d.oy=TF_PAD;
   }

   void DynMin()
   {
      DynHeader();
   }

   void DynSettings()
   {
      Btn(812,8,64,28,"RESET",H_RESET,2,0);
      Btn(884,8,60,28,"BACK",H_BACK,1,-1);
      for(int fi=0;fi<TF_NF;fi++)
      {
         int bx,by;
         FieldPos(fi,bx,by);
         bool dim=false;
         if(g_f[fi].dep>=0)
         {
            const bool on=(g_s[g_f[fi].dep]>0.5);
            dim=g_f[fi].depInv?on:!on;
         }
         const int al=dim?90:255;
         const double h=m_hA[H_FIELD+fi];
         const bool ed=(m_edit==fi);
         const double ba=(ed?255.0:(30.0+h*225.0))*(dim?0.5:1.0);
         m_d.RRect(bx,by,96,24,6,0,0,TFA(m_acc,(int)ba),1.5);
         const double v=g_s[g_f[fi].idx];
         const double a=m_swA[fi];
         if(g_f[fi].kind==1)
         {
            const uint tr=TFA(TFMix((uint)0xFF3A4252,TFC_POS,a),al);
            m_d.RRect(bx+50,by+3,40,18,9,tr,tr);
            m_d.Disc(bx+50+9+a*22.0,by+12,7.0,TFA(TFC_WHITE,al),TFA(TFC_WHITE,al));
            m_d.Txt(bx+10,by+12,(v>0.5)?"ON":"OFF",TFA(TFMix(TFC_DIM,TFC_POS,a),al),10,true);
         }
         else if(g_f[fi].kind==2)
         {
            m_d.RRect(bx+2+a*46.0,by+2,46,20,5,TFA(m_acc,60),TFA(m_acc,60),TFA(m_acc,(int)(al*0.8)),1.0);
            uint c0=(v<=0.5)?TFC_TXT:TFC_DIM;
            uint c1=(v>0.5)?TFC_TXT:TFC_DIM;
            if(g_f[fi].idx==S_START_DIR)
            {
               c0=(v<=0.5)?TFC_POS:TFC_DIM;
               c1=(v>0.5)?TFC_NEG:TFC_DIM;
            }
            m_d.Txt(bx+25,by+12,TFChoice(g_f[fi].idx,0.0),TFA(c0,al),10,true,TA_CENTER|TA_VCENTER);
            m_d.Txt(bx+73,by+12,TFChoice(g_f[fi].idx,1.0),TFA(c1,al),10,true,TA_CENTER|TA_VCENTER);
         }
         else
            m_d.Txt(bx+48,by+12,TFFmt(fi),TFA(TFC_TXT,al),12,true,TA_CENTER|TA_VCENTER);
      }
      // license row
      {
         const double ha=m_hA[H_LICKEY];
         const bool edk=(m_edit==100);
         m_d.RRect(128,376,520,26,7,0,0,TFA(m_acc,(int)(edk?255.0:(30.0+ha*225.0))),1.5);
         m_d.Txt(142,389,(g_licKey!="")?g_licKey:"Click here and paste your license key",(g_licKey!="")?TFC_TXT:TFC_DIM,11,(g_licKey!=""));
         Btn(660,376,100,26,"ACTIVATE",H_LICACT,1,0);
         const int dl=TFLicDays();
         string lm;
         uint   lcl;
         if(g_licStatus==1)
         {
            lcl=TFC_POS;
            if(m_licToast!=0 && GetTickCount()-m_licToast<6000)
               lm="License activated successfully!   Valid till "+TimeToString(g_licTill,TIME_DATE)+"  ("+IntegerToString(dl)+" days left)";
            else
               lm="License active  -  valid till "+TimeToString(g_licTill,TIME_DATE)+"  ("+IntegerToString(dl)+" days left)";
         }
         else if(g_licStatus==3)
         {
            lcl=TFC_GOLD;
            lm="Trial mode - "+IntegerToString(dl)+" days left.  "+((g_licKeyMsg!="")?g_licKeyMsg+".  ":"")+"Paste your license key above and press ACTIVATE.";
         }
         else
         {
            lcl=TFC_NEG;
            lm=((g_licKeyMsg!="")?g_licKeyMsg+".  ":"License not valid.  ")+"Contact support: "+SupportContact;
         }
         m_d.Txt(32,416,lm,lcl,11,true);
         m_d.Txt(948,389,"Account "+IntegerToString((long)AccountInfoInteger(ACCOUNT_LOGIN)),TFC_DIM,10,false,TA_RIGHT|TA_VCENTER);
      }
      if(m_msg!="")
         m_d.Txt(16,444,m_msg,m_acc,10,true);
   }

   void DrawDynamic()
   {
      m_d.Erase(0);
      if(m_min)           DynMin();
      else if(m_page==1)  DynSettings();
      else if(m_ovOn)
      {
         DynHeader();
         DynOverlay();
      }
      else                DynMain();
      m_d.Update(true);
   }

   //--- data ----------------------------------------------------------
   void Gather()
   {
      m_bal=AccountInfoDouble(ACCOUNT_BALANCE);
      m_eq=AccountInfoDouble(ACCOUNT_EQUITY);
      m_trN=0;
      ArrayResize(m_tr,0);
      double fl=0.0;
      ulong sum=0;
      const int total=PositionsTotal();
      for(int i=0;i<total;i++)
      {
         const ulong tk=PositionGetTicket(i);
         if(tk==0)
            continue;
         if(PositionGetString(POSITION_SYMBOL)!=_Symbol)
            continue;
         if((ulong)PositionGetInteger(POSITION_MAGIC)!=MagicNumber)
            continue;
         ArrayResize(m_tr,m_trN+1);
         m_tr[m_trN].ticket=tk;
         m_tr[m_trN].type=((ENUM_POSITION_TYPE)PositionGetInteger(POSITION_TYPE)==POSITION_TYPE_BUY)?0:1;
         m_tr[m_trN].vol=PositionGetDouble(POSITION_VOLUME);
         m_tr[m_trN].open=PositionGetDouble(POSITION_PRICE_OPEN);
         m_tr[m_trN].cur=PositionGetDouble(POSITION_PRICE_CURRENT);
         m_tr[m_trN].profit=PositionGetDouble(POSITION_PROFIT)+PositionGetDouble(POSITION_SWAP);
         fl+=m_tr[m_trN].profit;
         sum+=tk;
         m_trN++;
      }
      m_float=fl;
      const ulong sg=(ulong)m_trN*1000003+sum;
      TFHist(sg!=m_posSig);
      m_posSig=sg;

      double base=m_bal-g_hToday;
      if(base<=0.0)
         base=m_bal;
      m_dayBase=base;
      m_netUsd=g_hToday+m_float;
      m_netPct=(base>0.0)?m_netUsd/base*100.0:0.0;
      m_ddUsd=(m_netUsd<0.0)?-m_netUsd:0.0;
      m_ddPct=(base>0.0)?m_ddUsd/base*100.0:0.0;

      double sc=20.0;
      if(DailyLossOn)                sc=DailyLossPct;
      else if(UseDrawdownProtection) sc=MaximumDrawdownPercent;
      if(sc<1.0) sc=1.0;
      if(MathAbs(sc-m_ddScale)>1e-9)
      {
         m_ddScale=sc;
         m_stDirty=true;
      }

      const int n=g_hWins+g_hLoss;
      m_winRate=(n>0)?(100.0*g_hWins/n):0.0;

      const double gt=TFClamp(DailyTargetOn?DailyTargetPct:3.0,0.5,10.0);
      if(MathAbs(gt-m_gT)>1e-9)
      {
         m_gT=gt;
         m_stDirty=true;
      }
      m_tNet=TFClamp(m_netPct,-m_gT*0.5,m_gT);
      m_tDD=TFClamp(m_ddPct,0.0,m_ddScale);
      m_tWin=m_winRate;

      const string sg2=StringFormat("%.2f|%.2f|%.2f|%.2f|%.2f|%d|%.5f|%d|%d",m_bal,m_eq,m_float,g_hToday,g_hTotal,m_trN,
                                    SymbolInfoDouble(_Symbol,SYMBOL_BID),(int)SymbolInfoInteger(_Symbol,SYMBOL_SPREAD),(int)TFSessionOpen());
      if(sg2!=m_sig)
      {
         m_sig=sg2;
         m_dirty=true;
      }
   }

   bool Build()
   {
      if(m_ok)
      {
         m_d.Destroy();
         m_s.Destroy();
         m_ok=false;
      }
      const int w=TF_PW+2*TF_PAD;
      const int h=m_ph+2*TF_PAD;
      if(!m_s.CreateBitmapLabel(m_nS,m_x,m_y,w,h,COLOR_FORMAT_ARGB_NORMALIZE))
         return false;
      if(!m_d.CreateBitmapLabel(m_nD,m_x,m_y,w,h,COLOR_FORMAT_ARGB_NORMALIZE))
      {
         m_s.Destroy();
         return false;
      }
      m_s.ox=TF_PAD; m_s.oy=TF_PAD; m_s.cw=w; m_s.ch=h;
      m_d.ox=TF_PAD; m_d.oy=TF_PAD; m_d.cw=w; m_d.ch=h;
      ObjectSetInteger(0,m_nS,OBJPROP_SELECTABLE,false);
      ObjectSetInteger(0,m_nS,OBJPROP_HIDDEN,true);
      ObjectSetInteger(0,m_nD,OBJPROP_SELECTABLE,false);
      ObjectSetInteger(0,m_nD,OBJPROP_HIDDEN,true);
      m_s.Erase(0);
      m_d.Erase(0);
      m_hover=H_NONE;
      m_stDirty=true;
      m_dirty=true;
      m_ok=true;
      ChartSetInteger(0,CHART_EVENT_MOUSE_MOVE,true);
      return true;
   }

   //--- editing -------------------------------------------------------
   void OpenEdit(const int fi)
   {
      if(ObjectFind(0,m_nE)>=0)
         ObjectDelete(0,m_nE);
      if(fi==100)
      {
         if(!ObjectCreate(0,m_nE,OBJ_EDIT,0,0,0))
            return;
         ObjectSetInteger(0,m_nE,OBJPROP_CORNER,CORNER_LEFT_UPPER);
         ObjectSetInteger(0,m_nE,OBJPROP_XDISTANCE,m_x+TF_PAD+128);
         ObjectSetInteger(0,m_nE,OBJPROP_YDISTANCE,m_y+TF_PAD+376);
         ObjectSetInteger(0,m_nE,OBJPROP_XSIZE,520);
         ObjectSetInteger(0,m_nE,OBJPROP_YSIZE,26);
         ObjectSetInteger(0,m_nE,OBJPROP_ALIGN,ALIGN_LEFT);
         ObjectSetInteger(0,m_nE,OBJPROP_FONTSIZE,10);
         ObjectSetString(0,m_nE,OBJPROP_FONT,"Consolas");
         ObjectSetInteger(0,m_nE,OBJPROP_BGCOLOR,C'18,23,33');
         ObjectSetInteger(0,m_nE,OBJPROP_COLOR,clrWhite);
         ObjectSetInteger(0,m_nE,OBJPROP_BORDER_COLOR,m_accC);
         ObjectSetInteger(0,m_nE,OBJPROP_HIDDEN,true);
         ObjectSetInteger(0,m_nE,OBJPROP_ZORDER,100);
         ObjectSetString(0,m_nE,OBJPROP_TEXT,g_licKey);
         m_edit=100;
         m_dirty=true;
         ChartRedraw(0);
         return;
      }
      int bx,by;
      FieldPos(fi,bx,by);
      if(!ObjectCreate(0,m_nE,OBJ_EDIT,0,0,0))
         return;
      ObjectSetInteger(0,m_nE,OBJPROP_CORNER,CORNER_LEFT_UPPER);
      ObjectSetInteger(0,m_nE,OBJPROP_XDISTANCE,m_x+TF_PAD+bx);
      ObjectSetInteger(0,m_nE,OBJPROP_YDISTANCE,m_y+TF_PAD+by);
      ObjectSetInteger(0,m_nE,OBJPROP_XSIZE,96);
      ObjectSetInteger(0,m_nE,OBJPROP_YSIZE,24);
      ObjectSetInteger(0,m_nE,OBJPROP_ALIGN,ALIGN_CENTER);
      ObjectSetInteger(0,m_nE,OBJPROP_FONTSIZE,10);
      ObjectSetString(0,m_nE,OBJPROP_FONT,"Segoe UI");
      ObjectSetInteger(0,m_nE,OBJPROP_BGCOLOR,C'18,23,33');
      ObjectSetInteger(0,m_nE,OBJPROP_COLOR,clrWhite);
      ObjectSetInteger(0,m_nE,OBJPROP_BORDER_COLOR,m_accC);
      ObjectSetInteger(0,m_nE,OBJPROP_HIDDEN,true);
      ObjectSetInteger(0,m_nE,OBJPROP_ZORDER,100);
      ObjectSetString(0,m_nE,OBJPROP_TEXT,(g_f[fi].kind==3)?TFHM((int)MathRound(g_s[g_f[fi].idx])):DoubleToString(g_s[g_f[fi].idx],g_f[fi].dec));
      m_edit=fi;
      m_dirty=true;
      ChartRedraw(0);
   }

   void CommitEdit()
   {
      if(m_edit<0)
         return;
      const int fi=m_edit;
      m_edit=-1;
      string t="";
      if(ObjectFind(0,m_nE)>=0)
      {
         t=ObjectGetString(0,m_nE,OBJPROP_TEXT);
         ObjectDelete(0,m_nE);
      }
      if(fi==100)
      {
         TFLicSetKey(t);
         m_licToast=GetTickCount();
         m_dirty=true;
         ChartRedraw(0);
         return;
      }
      StringReplace(t,",",".");
      StringReplace(t,"%","");
      StringTrimLeft(t);
      StringTrimRight(t);
      bool hasDigit=false;
      for(int i=0;i<StringLen(t);i++)
      {
         const ushort chr=StringGetCharacter(t,i);
         if(chr>='0' && chr<='9') { hasDigit=true; break; }
      }
      if(hasDigit)
      {
         if(g_f[fi].kind==3)
         {
            const int mm=TFParseTime(t);
            if(mm<0)
            {
               m_msg="Invalid time - use HH:MM (example 09:30)";
               m_msgTick=GetTickCount();
               m_dirty=true;
               ChartRedraw(0);
               return;
            }
            TFS_Set(fi,(double)mm);
         }
         else
            TFS_Set(fi,StringToDouble(t));
         m_msg="Saved:  "+g_f[fi].label+" = "+TFFmt(fi);
         m_msgTick=GetTickCount();
      }
      m_dirty=true;
      ChartRedraw(0);
   }

   void Click(const int id)
   {
      if(m_edit>=0)
      {
         if(id==H_FIELD+m_edit)
            return;
         if(m_edit==100 && id==H_LICKEY)
            return;
         CommitEdit();
      }
      if(id==H_SET)
      {
         m_page=1;
         m_msg="";
         m_ph=TF_PH_SET;
         Build();
      }
      else if(id==H_BACK)
      {
         m_page=0;
         m_ph=m_min?TF_PH_MIN:TF_PH_MAIN;
         Build();
      }
      else if(id==H_MIN)
      {
         m_min=!m_min;
         m_page=0;
         m_ph=m_min?TF_PH_MIN:TF_PH_MAIN;
         Build();
      }
      else if(id==H_RESET)
      {
         TFS_Reset();
         m_msg="Settings reset to EA inputs";
         m_msgTick=GetTickCount();
         m_dirty=true;
      }
      else if(id==H_LICKEY)
      {
         OpenEdit(100);
      }
      else if(id==H_LICACT)
      {
         TFLicEval();
         m_licToast=GetTickCount();
         m_dirty=true;
      }
      else if(id==H_OVER)
      {
         m_ovHide=true;
         m_stDirty=true;
      }
      else if(id==H_STATUS)
      {
         if(OvKind()>0)
         {
            m_ovHide=!m_ovHide;
            m_stDirty=true;
         }
      }
      else if(id>=H_FIELD && id<H_FIELD+TF_NF && m_page==1)
      {
         const int fi=id-H_FIELD;
         if(g_f[fi].kind==0 || g_f[fi].kind==3)
            OpenEdit(fi);
         else
         {
            TFS_Set(fi,(g_s[g_f[fi].idx]>0.5)?0.0:1.0);
            m_msg="Saved:  "+g_f[fi].label+" = "+TFFmt(fi);
            m_msgTick=GetTickCount();
            m_dirty=true;
         }
      }
   }

   void OnMouse(const int mx,const int my,const uint flags)
   {
      const int lx=mx-m_x-TF_PAD;
      const int ly=my-m_y-TF_PAD;
      const bool inside=(lx>=0 && lx<=TF_PW && ly>=0 && ly<=m_ph);
      if(inside!=m_inside)
      {
         m_inside=inside;
         ChartSetInteger(0,CHART_MOUSE_SCROLL,!inside);
      }
      const int id=inside?HitTest(lx,ly):H_NONE;
      if(id!=m_hover)
         m_hover=id;
      const bool down=((flags&1)!=0);
      if(down && !m_prevDown && inside)
         Click(id);
      m_prevDown=down;
   }

public:
   CTFDash()
   {
      m_ok=false; m_x=0; m_y=0; m_ph=TF_PH_MAIN; m_min=false; m_page=0;
      m_stDirty=true; m_dirty=true; m_accC=clrAqua; m_acc=0; m_acc2=0;
      m_snapSig=""; m_trN=0; m_bal=0; m_eq=0; m_float=0; m_netUsd=0; m_ddUsd=0; m_netPct=0; m_ddPct=0;
      m_winRate=0; m_ddScale=20.0;
      m_vNet=0; m_tNet=0; m_vDD=0; m_tDD=0; m_vLvl=0; m_tLvl=0; m_vWin=0; m_tWin=0;
      m_posSig=0; m_hitN=0; m_hover=H_NONE; m_edit=-1; m_prevDown=false; m_inside=false;
      m_msg=""; m_msgTick=0; m_lastGather=0; m_sig=""; m_gT=3.0; m_dayBase=0.0; m_licToast=0; m_themed=false; m_ovOn=false; m_ovHide=false;
      ArrayInitialize(m_hA,0.0);
      ArrayInitialize(m_swA,0.0);
      m_snap.buyCnt=0; m_snap.sellCnt=0; m_snap.level=0; m_snap.lots=0; m_snap.avg=0; m_snap.tp=0;
      m_snap.nextGrid=0; m_snap.nextLot=0; m_snap.basketPL=0; m_snap.statusKind=1;
      m_snap.status="STARTING"; m_snap.note=""; m_snap.hasBasket=false; m_snap.dayKind=0;
   }

   bool Ready() { return m_ok; }

   bool Create()
   {
      TFLoadLogos();
      const string mg=IntegerToString((long)MagicNumber);
      m_nS="TFDASH_S_"+mg;
      m_nD="TFDASH_D_"+mg;
      m_nE="TFDASH_E_"+mg;
      m_x=DashX;
      m_y=DashY;
      if(DashTheme==TF_THEME_GOLD)        { m_accC=C'245,165,36';  m_acc2=(uint)0xFFF5A524; }
      else if(DashTheme==TF_THEME_VIOLET) { m_accC=C'139,108,255'; m_acc2=(uint)0xFF8B6CFF; }
      else                                { m_accC=C'91,155,255';  m_acc2=(uint)0xFF5B9BFF; }
      m_acc=ColorToARGB(m_accC,255);
      m_min=false;
      m_page=0;
      m_ph=TF_PH_MAIN;
      m_edit=-1;
      for(int i=0;i<TF_NF;i++)
         m_swA[i]=(g_s[g_f[i].idx]>0.5)?1.0:0.0;
      const bool built=Build();
      if(built)
         ThemeChart();
      return built;
   }

   void Destroy()
   {
      if(ObjectFind(0,m_nE)>=0)
         ObjectDelete(0,m_nE);
      if(m_ok)
      {
         m_d.Destroy();
         m_s.Destroy();
      }
      m_ok=false;
      RestoreChart();
      ChartSetInteger(0,CHART_MOUSE_SCROLL,true);
      ChartRedraw(0);
   }

   void SetSnap(const TFSnap &s)
   {
      m_snap=s;
      const string sg=IntegerToString(s.buyCnt)+"|"+IntegerToString(s.sellCnt)+"|"+IntegerToString(s.level)+"|"
                      +DoubleToString(s.avg,5)+"|"+DoubleToString(s.tp,5)+"|"+DoubleToString(s.nextGrid,5)+"|"
                      +DoubleToString(s.nextLot,2)+"|"+DoubleToString(s.basketPL,2)+"|"+s.status+"|"+s.note;
      if(sg!=m_snapSig)
      {
         m_snapSig=sg;
         m_dirty=true;
      }
      m_tLvl=(double)s.level;
   }

   // called by OnTimer (~30 ms)
   void Timer()
   {
      if(!m_ok)
         return;
      const uint now=GetTickCount();
      if(now-m_lastGather>=250)
      {
         m_lastGather=now;
         Gather();
      }
      bool moving=false;
      Ease(m_vNet,m_tNet,0.16,0.003,moving);
      Ease(m_vDD, m_tDD, 0.16,0.003,moving);
      Ease(m_vLvl,m_tLvl,0.18,0.01,moving);
      Ease(m_vWin,m_tWin,0.14,0.05,moving);
      for(int i=0;i<m_hitN;i++)
      {
         const int id=m_hit[i].id;
         if(id<0 || id>=128)
            continue;
         Ease(m_hA[id],(m_hover==id)?1.0:0.0,0.28,0.01,moving);
      }
      if(m_page==1 && !m_min)
      {
         for(int fi=0;fi<TF_NF;fi++)
         {
            if(g_f[fi].kind==0 || g_f[fi].kind==3)
               continue;
            Ease(m_swA[fi],(g_s[g_f[fi].idx]>0.5)?1.0:0.0,0.30,0.01,moving);
         }
      }
      if(m_licToast!=0 && now-m_licToast>6000)
      {
         m_licToast=0;
         m_dirty=true;
      }
      if(m_msg!="" && now-m_msgTick>3500)
      {
         m_msg="";
         m_dirty=true;
      }
      const bool ovNow=(OvKind()>0 && !m_ovHide && !m_min && m_page==0);
      if(OvKind()==0 && m_ovHide)
         m_ovHide=false;
      if(ovNow!=m_ovOn)
      {
         m_ovOn=ovNow;
         m_stDirty=true;
      }
      if(m_ovOn)
         moving=true;
      if(m_stDirty)
      {
         DrawStatic();
         m_dirty=true;
      }
      if(moving || m_dirty)
      {
         m_dirty=false;
         DrawDynamic();
      }
   }

   void Event(const int id,const long &lp,const double &dp,const string &sp)
   {
      if(!m_ok)
         return;
      if(id==CHARTEVENT_MOUSE_MOVE)
         OnMouse((int)lp,(int)dp,(uint)StringToInteger(sp));
      else if(id==CHARTEVENT_OBJECT_ENDEDIT && sp==m_nE)
         CommitEdit();
   }
};

CTFDash g_dash;



//====================== END DASHBOARD MODULE ==============================


//+------------------------------------------------------------------+
//| Types / globals                                                  |
//+------------------------------------------------------------------+
struct BasketInfo
{
   int    count;
   double lots;
   double wavg;
   double lowest;
   double highest;
   double profit;
};

CTrade   trade;

string   g_gvPrefix      = "";
bool     g_closeBuy      = false;
bool     g_closeSell     = false;
int      g_reversalDir   = -1;
bool     g_halted        = false;
int      g_prevBuyCount  = 0;
int      g_prevSellCount = 0;
double   g_currentDD     = 0.0;
double   g_maxDD         = 0.0;
bool     g_limitHit      = false;
bool     g_spreadBlock   = false;
string   g_note          = "";
datetime g_thrTime[16];
int      g_gridCnt[2]    = {-1,-1};
datetime g_gridTime[2]   = {0,0};
datetime g_lastTPSync[2] = {0,0};
bool     g_dayHalt       = false;   // daily target / daily loss pause
int      g_dayKey        = 0;
string   g_dayReason     = "";
int      g_dayKind       = 0;       // 1 = daily target, 2 = daily loss limit

//+------------------------------------------------------------------+
//| Logging helpers                                                  |
//+------------------------------------------------------------------+
void Log(const string msg)
{
   Print("TRADIFIVE: ",msg);
}

void ThrottledLog(const int slot,const string msg,const int seconds=30)
{
   const datetime now=TimeCurrent();
   if(g_thrTime[slot]!=0 && (now-g_thrTime[slot])<seconds)
      return;
   g_thrTime[slot]=now;
   Log(msg);
}

int LotDigits()
{
   const double step=SymbolInfoDouble(_Symbol,SYMBOL_VOLUME_STEP);
   if(step<=0.0)
      return 2;
   int d=0;
   while(d<8 && MathAbs(step*MathPow(10.0,d)-MathRound(step*MathPow(10.0,d)))>1e-9)
      d++;
   return d;
}

string LotStr(const double lot)
{
   return DoubleToString(lot,LotDigits());
}

string PriceStr(const double price)
{
   return DoubleToString(price,_Digits);
}

bool TradeOK()
{
   const uint rc=trade.ResultRetcode();
   return (rc==TRADE_RETCODE_DONE || rc==TRADE_RETCODE_PLACED || rc==TRADE_RETCODE_DONE_PARTIAL);
}

void LogTradeFail(const string operation,const double price,const double lot)
{
   Print("TRADIFIVE: ",operation," FAILED | symbol=",_Symbol,
         " | price=",PriceStr(price),
         " | lot=",LotStr(lot),
         " | retcode=",trade.ResultRetcode(),
         " | description=",trade.ResultRetcodeDescription(),
         " | lastError=",GetLastError());
   ResetLastError();
   g_note="Order FAILED: "+StringSubstr(trade.ResultRetcodeDescription(),0,36);
}

//+------------------------------------------------------------------+
//| Persistent state (terminal global variables)                     |
//+------------------------------------------------------------------+
string GVName(const string key)
{
   return g_gvPrefix+key;
}

double GVGet(const string key,const double def)
{
   const string n=GVName(key);
   if(GlobalVariableCheck(n))
      return GlobalVariableGet(n);
   return def;
}

void GVSet(const string key,const double value)
{
   GlobalVariableSet(GVName(key),value);
}

void GVDel(const string key)
{
   const string n=GVName(key);
   if(GlobalVariableCheck(n))
      GlobalVariableDel(n);
}

void SetCloseFlag(const bool buy,const bool value)
{
   if(buy)
      g_closeBuy=value;
   else
      g_closeSell=value;
   const string key=buy?"CLOSE_BUY":"CLOSE_SELL";
   if(value)
      GVSet(key,1.0);
   else
      GVDel(key);
}

void SetReversalDir(const int dir)
{
   g_reversalDir=dir;
   if(dir<0)
      GVDel("REVERSAL");
   else
      GVSet("REVERSAL",(double)dir);
}

//+------------------------------------------------------------------+
//| Broker / price helpers                                           |
//+------------------------------------------------------------------+
double StopsLevelPrice()
{
   return (double)SymbolInfoInteger(_Symbol,SYMBOL_TRADE_STOPS_LEVEL)*_Point;
}

double CurrentSpreadPoints()
{
   const double ask=SymbolInfoDouble(_Symbol,SYMBOL_ASK);
   const double bid=SymbolInfoDouble(_Symbol,SYMBOL_BID);
   if(_Point<=0.0)
      return 0.0;
   return (ask-bid)/_Point;
}

bool IsSpreadOK()
{
   if(!UseSpreadFilter)
      return true;
   return (CurrentSpreadPoints()<=(double)MaximumSpreadPoints+0.5);
}

//+------------------------------------------------------------------+
//| Lot helpers                                                      |
//+------------------------------------------------------------------+
double CalculateLot(const int level)
{
   return StartLot+LotIncrement*(double)level;
}

double NormalizeLot(const double lot)
{
   const double minL=SymbolInfoDouble(_Symbol,SYMBOL_VOLUME_MIN);
   const double maxL=SymbolInfoDouble(_Symbol,SYMBOL_VOLUME_MAX);
   double step=SymbolInfoDouble(_Symbol,SYMBOL_VOLUME_STEP);
   if(step<=0.0)
      step=0.01;
   double v=MathRound(lot/step)*step;
   if(v<minL) v=minL;
   if(v>maxL) v=maxL;
   return NormalizeDouble(v,LotDigits());
}

bool HasEnoughMargin(const ENUM_ORDER_TYPE type,const double lot,const double price)
{
   double margin=0.0;
   if(!OrderCalcMargin(type,_Symbol,lot,price,margin))
      return true;
   return (margin<=AccountInfoDouble(ACCOUNT_MARGIN_FREE));
}

//+------------------------------------------------------------------+
//| Position helpers (ALWAYS filtered by symbol + magic)             |
//+------------------------------------------------------------------+
bool IsOurSelectedPosition(const ENUM_POSITION_TYPE type)
{
   if(PositionGetString(POSITION_SYMBOL)!=_Symbol)
      return false;
   if((ulong)PositionGetInteger(POSITION_MAGIC)!=MagicNumber)
      return false;
   return ((ENUM_POSITION_TYPE)PositionGetInteger(POSITION_TYPE)==type);
}

void GetBasket(const ENUM_POSITION_TYPE type,BasketInfo &b)
{
   b.count=0;
   b.lots=0.0;
   b.wavg=0.0;
   b.lowest=0.0;
   b.highest=0.0;
   b.profit=0.0;
   double sumPV=0.0;
   const int total=PositionsTotal();
   for(int i=0;i<total;i++)
   {
      const ulong ticket=PositionGetTicket(i);
      if(ticket==0)
         continue;
      if(!IsOurSelectedPosition(type))
         continue;
      const double vol=PositionGetDouble(POSITION_VOLUME);
      const double price=PositionGetDouble(POSITION_PRICE_OPEN);
      if(b.count==0)
      {
         b.lowest=price;
         b.highest=price;
      }
      else
      {
         if(price<b.lowest)  b.lowest=price;
         if(price>b.highest) b.highest=price;
      }
      b.count++;
      b.lots+=vol;
      sumPV+=price*vol;
      b.profit+=PositionGetDouble(POSITION_PROFIT)+PositionGetDouble(POSITION_SWAP);
   }
   if(b.lots>0.0)
      b.wavg=sumPV/b.lots;
}

int CountPositions(const ENUM_POSITION_TYPE type)
{
   BasketInfo b;
   GetBasket(type,b);
   return b.count;
}

int CountBuyPositions()  { return CountPositions(POSITION_TYPE_BUY); }
int CountSellPositions() { return CountPositions(POSITION_TYPE_SELL); }
int CountTradifivePositions() { return CountBuyPositions()+CountSellPositions(); }

double TotalTradifiveLots()
{
   BasketInfo bb,sb;
   GetBasket(POSITION_TYPE_BUY,bb);
   GetBasket(POSITION_TYPE_SELL,sb);
   return bb.lots+sb.lots;
}

double TotalFloatingProfit()
{
   BasketInfo bb,sb;
   GetBasket(POSITION_TYPE_BUY,bb);
   GetBasket(POSITION_TYPE_SELL,sb);
   return bb.profit+sb.profit;
}

int CollectTickets(const ENUM_POSITION_TYPE type,ulong &tickets[])
{
   ArrayResize(tickets,0);
   const int total=PositionsTotal();
   for(int i=0;i<total;i++)
   {
      const ulong ticket=PositionGetTicket(i);
      if(ticket==0)
         continue;
      if(!IsOurSelectedPosition(type))
         continue;
      const int n=ArraySize(tickets);
      ArrayResize(tickets,n+1);
      tickets[n]=ticket;
   }
   return ArraySize(tickets);
}

//+------------------------------------------------------------------+
//| Pending order helpers (ALWAYS filtered by symbol + magic)        |
//+------------------------------------------------------------------+
bool IsOurSelectedPendingSide(const bool buy)
{
   if(OrderGetString(ORDER_SYMBOL)!=_Symbol)
      return false;
   if((ulong)OrderGetInteger(ORDER_MAGIC)!=MagicNumber)
      return false;
   const ENUM_ORDER_TYPE t=(ENUM_ORDER_TYPE)OrderGetInteger(ORDER_TYPE);
   if(buy)
      return (t==ORDER_TYPE_BUY_LIMIT || t==ORDER_TYPE_BUY_STOP);
   return (t==ORDER_TYPE_SELL_LIMIT || t==ORDER_TYPE_SELL_STOP);
}

int CountPendings(const bool buy)
{
   int n=0;
   const int total=OrdersTotal();
   for(int i=0;i<total;i++)
   {
      const ulong ticket=OrderGetTicket(i);
      if(ticket==0)
         continue;
      if(IsOurSelectedPendingSide(buy))
         n++;
   }
   return n;
}

bool DeletePendingSide(const bool buy)
{
   ulong tickets[];
   ArrayResize(tickets,0);
   const int total=OrdersTotal();
   for(int i=0;i<total;i++)
   {
      const ulong ticket=OrderGetTicket(i);
      if(ticket==0)
         continue;
      if(!IsOurSelectedPendingSide(buy))
         continue;
      const int n=ArraySize(tickets);
      ArrayResize(tickets,n+1);
      tickets[n]=ticket;
   }
   for(int k=0;k<ArraySize(tickets);k++)
   {
      if(!OrderSelect(tickets[k]))
         continue;
      const double price=OrderGetDouble(ORDER_PRICE_OPEN);
      const double vol=OrderGetDouble(ORDER_VOLUME_CURRENT);
      if(!trade.OrderDelete(tickets[k]) || !TradeOK())
         LogTradeFail(buy?"Delete BUY pending":"Delete SELL pending",price,vol);
   }
   return (CountPendings(buy)==0);
}

bool DeleteBuyPending()  { return DeletePendingSide(true); }
bool DeleteSellPending() { return DeletePendingSide(false); }

bool DeleteAllTradifivePendingOrders()
{
   const bool a=DeleteBuyPending();
   const bool b=DeleteSellPending();
   return (a && b);
}

//+------------------------------------------------------------------+
//| Chart objects (TP / grid lines)                                  |
//+------------------------------------------------------------------+
bool ChartObjectsEnabled()
{
   if(MQLInfoInteger(MQL_TESTER) && !MQLInfoInteger(MQL_VISUAL_MODE))
      return false;
   return true;
}

string TPLineName()   { return "TRADIFIVE_TP_"+IntegerToString((long)MagicNumber); }
string GridLineName() { return "TRADIFIVE_GRID_"+IntegerToString((long)MagicNumber); }

void SetHLine(const string name,const double price,const color clr,const ENUM_LINE_STYLE style,const int width,const string tip)
{
   if(ObjectFind(0,name)<0)
   {
      if(!ObjectCreate(0,name,OBJ_HLINE,0,0,price))
         return;
      ObjectSetInteger(0,name,OBJPROP_COLOR,clr);
      ObjectSetInteger(0,name,OBJPROP_STYLE,style);
      ObjectSetInteger(0,name,OBJPROP_WIDTH,width);
      ObjectSetInteger(0,name,OBJPROP_SELECTABLE,false);
      ObjectSetInteger(0,name,OBJPROP_HIDDEN,true);
      ObjectSetInteger(0,name,OBJPROP_BACK,true);   // draw behind candles and the dashboard
      ObjectSetString(0,name,OBJPROP_TOOLTIP,tip);
   }
   else
      ObjectSetDouble(0,name,OBJPROP_PRICE,price);
}

void UpdateTPLine(const bool buy,const double tpPrice)
{
   if(!ChartObjectsEnabled())
      return;
   SetHLine(TPLineName(),tpPrice,clrLime,STYLE_SOLID,2,
            buy?"Tradifive BUY basket TP":"Tradifive SELL basket TP");
}

void UpdateGridLine(const double price)
{
   if(!ChartObjectsEnabled() || !ShowGridLevels)
      return;
   SetHLine(GridLineName(),price,clrOrange,STYLE_DOT,1,"Tradifive next grid level");
}

void RemoveTPLine()
{
   if(ObjectFind(0,TPLineName())>=0)
      ObjectDelete(0,TPLineName());
}

void RemoveGridLine()
{
   if(ObjectFind(0,GridLineName())>=0)
      ObjectDelete(0,GridLineName());
}

void RemoveAllChartObjects()
{
   RemoveTPLine();
   RemoveGridLine();
}

//+------------------------------------------------------------------+
//| Dashboard feed                                                   |
//+------------------------------------------------------------------+
void UpdateChartPanel()
{
   if(!g_dash.Ready())
      return;

   BasketInfo bb,sb,b;
   GetBasket(POSITION_TYPE_BUY,bb);
   GetBasket(POSITION_TYPE_SELL,sb);

   bool isBuy=true;
   if(bb.count>0 && bb.count>=sb.count)
   {
      b=bb;
      isBuy=true;
   }
   else if(sb.count>0)
   {
      b=sb;
      isBuy=false;
   }
   else
      ZeroMemory(b);

   TFSnap s;
   s.buyCnt=bb.count;
   s.sellCnt=sb.count;
   s.level=b.count;
   s.lots=b.lots;
   s.avg=b.wavg;
   s.tp=0.0;
   s.nextGrid=0.0;
   s.nextLot=0.0;
   s.basketPL=b.profit;
   s.hasBasket=(b.count>0);
   if(b.count>0)
   {
      s.tp=isBuy?b.wavg+TPDistance:b.wavg-TPDistance;
      s.nextGrid=isBuy?b.lowest-GridDistance:b.highest+GridDistance;
      s.nextLot=NormalizeLot(CalculateLot(b.count));
   }

   if(!TFLicenseOK())
   {
      s.statusKind=2;
      s.status="LICENSE EXPIRED";
   }
   else if(g_halted || g_limitHit)
   {
      s.statusKind=2;
      s.status="SAFETY STOP";
   }
   else if(g_dayHalt)
   {
      s.statusKind=(g_dayKind==2)?1:0;
      s.status=(g_dayKind==2)?"LOSS LIMIT":"TARGET HIT";
   }
   else if(!TFSessionOpen() && b.count==0)
   {
      s.statusKind=1;
      s.status="OFF SESSION";
   }
   else if(b.count==0 || g_closeBuy || g_closeSell || g_spreadBlock)
   {
      s.statusKind=1;
      s.status="WAITING";
   }
   else
   {
      s.statusKind=0;
      s.status="RUNNING";
   }
   s.note=g_note;
   s.dayKind=g_dayHalt?g_dayKind:0;
   g_dash.SetSnap(s);
}

//+------------------------------------------------------------------+
//| Basket change logging                                            |
//+------------------------------------------------------------------+
void LogBasketChange(const bool buy,const BasketInfo &b)
{
   const int prev=buy?g_prevBuyCount:g_prevSellCount;
   const string side=buy?"BUY":"SELL";
   if(b.count>prev)
   {
      if(prev==0 && b.count==1)
         Log("New "+side+" basket started.");
      else
         Log(side+" level "+IntegerToString(b.count-1)+" triggered.");
      Log(side+" lot = "+LotStr(NormalizeLot(CalculateLot(b.count-1)))+".");
      Log("Weighted average = "+PriceStr(b.wavg)+".");
      Log("Basket TP = "+PriceStr(buy?b.wavg+TPDistance:b.wavg-TPDistance)+".");
      Log("Next "+side+" grid = "+PriceStr(buy?b.lowest-GridDistance:b.highest+GridDistance)
          +" (market order, lot "+LotStr(NormalizeLot(CalculateLot(b.count)))+").");
   }
   if(buy)
      g_prevBuyCount=b.count;
   else
      g_prevSellCount=b.count;
}

//+------------------------------------------------------------------+
//| Safety checks                                                    |
//+------------------------------------------------------------------+
bool GridAllowed(const BasketInfo &b,const double rawLot,const double lot,string &reason)
{
   reason="";
   if(g_halted)
   {
      reason="drawdown protection halt active";
      return false;
   }
   if(b.count>=MaximumOrdersPerBasket)
   {
      reason="MaximumOrdersPerBasket reached ("+IntegerToString(MaximumOrdersPerBasket)+")";
      return false;
   }
   if(lot>MaximumLot+1e-8)
   {
      reason="next lot "+LotStr(lot)+" exceeds MaximumLot "+DoubleToString(MaximumLot,2);
      return false;
   }
   if(rawLot>SymbolInfoDouble(_Symbol,SYMBOL_VOLUME_MAX)+1e-8)
   {
      reason="next lot exceeds broker SYMBOL_VOLUME_MAX";
      return false;
   }
   if(TotalTradifiveLots()+lot>MaximumTotalLots+1e-8)
   {
      reason="MaximumTotalLots would be exceeded ("+DoubleToString(MaximumTotalLots,2)+")";
      return false;
   }
   return true;
}

bool CloseAllOurPositions()
{
   bool ok=true;
   for(int t=0;t<2;t++)
   {
      const ENUM_POSITION_TYPE type=(t==0)?POSITION_TYPE_BUY:POSITION_TYPE_SELL;
      ulong tickets[];
      CollectTickets(type,tickets);
      for(int i=0;i<ArraySize(tickets);i++)
      {
         if(!PositionSelectByTicket(tickets[i]))
            continue;
         const double vol=PositionGetDouble(POSITION_VOLUME);
         const double price=(type==POSITION_TYPE_BUY)?SymbolInfoDouble(_Symbol,SYMBOL_BID):SymbolInfoDouble(_Symbol,SYMBOL_ASK);
         if(!trade.PositionClose(tickets[i],(ulong)DeviationPoints) || !TradeOK())
         {
            LogTradeFail("Emergency close position #"+IntegerToString((long)tickets[i]),price,vol);
            ok=false;
         }
      }
   }
   return (ok && CountTradifivePositions()==0);
}

bool CheckDrawdownProtection()
{
   const double floating=TotalFloatingProfit();
   const double balance=AccountInfoDouble(ACCOUNT_BALANCE);
   double dd=0.0;
   if(floating<0.0 && balance>0.0)
      dd=(-floating)/balance*100.0;
   g_currentDD=dd;
   if(dd>g_maxDD)
      g_maxDD=dd;

   if(!UseDrawdownProtection)
      return false;
   if(g_halted)
      return true;
   if(dd>=MaximumDrawdownPercent)
   {
      Log("DRAWDOWN PROTECTION triggered. Drawdown = "+DoubleToString(dd,2)+"% >= "+DoubleToString(MaximumDrawdownPercent,2)+"%.");
      Log("Closing all Tradifive positions, deleting pending orders and halting new trades.");
      g_halted=true;
      GVSet("HALT",1.0);
      g_note="HALTED by drawdown protection";
      DeleteAllTradifivePendingOrders();
      CloseAllOurPositions();
      return true;
   }
   return false;
}

void HandleHalt()
{
   g_note="HALTED by drawdown protection (set ClearHaltOnInit to resume)";
   if(CountBuyPositions()+CountSellPositions()>0)
      CloseAllOurPositions();
   if(CountPendings(true)+CountPendings(false)>0)
      DeleteAllTradifivePendingOrders();
   RemoveTPLine();
   RemoveGridLine();
}

//+------------------------------------------------------------------+
//| Daily target / daily loss / session control                      |
//+------------------------------------------------------------------+
int TodayKey()
{
   MqlDateTime d;
   TimeToStruct(TimeCurrent(),d);
   return d.year*1000+d.day_of_year;
}

void ResetBasketState()
{
   SetCloseFlag(true,false);
   SetCloseFlag(false,false);
   g_prevBuyCount=0;
   g_prevSellCount=0;
   SetReversalDir(-1);
}

void TriggerDayHalt(const string why,const int kind)
{
   Log("DAILY CONTROL: "+why+". Closing all Tradifive positions and pausing until the next server day.");
   g_dayHalt=true;
   g_dayReason=why;
   g_dayKind=kind;
   GVSet("DAYHALT",(double)g_dayKey);
   GVSet("DAYKIND",(double)kind);
   DeleteAllTradifivePendingOrders();
   CloseAllOurPositions();
   ResetBasketState();
}

// Returns true when trading is paused for the rest of the day
bool DayControl()
{
   const int key=TodayKey();
   if(key!=g_dayKey)
   {
      g_dayKey=key;
      if(g_dayHalt)
         Log("New trading day - daily pause cleared.");
      g_dayHalt=false;
      g_dayReason="";
      g_dayKind=0;
      GVDel("DAYHALT");
      GVDel("DAYKIND");
   }

   if(!g_dayHalt && (DailyTargetOn || DailyLossOn))
   {
      const double real=TFTodayRealized();
      const double fl=TotalFloatingProfit();
      const double bal=AccountInfoDouble(ACCOUNT_BALANCE);
      double base=bal-real;
      if(base<=0.0)
         base=bal;
      if(base>0.0)
      {
         const double pct=(real+fl)/base*100.0;
         if(DailyTargetOn && pct>=DailyTargetPct)
            TriggerDayHalt("Daily profit target reached ("+DoubleToString(pct,2)+"%)",1);
         else if(DailyLossOn && pct<=-DailyLossPct)
            TriggerDayHalt("Daily loss limit reached ("+DoubleToString(pct,2)+"%)",2);
      }
   }

   if(!g_dayHalt)
      return false;

   g_note="Paused today: "+g_dayReason;
   if(CountTradifivePositions()>0)
      CloseAllOurPositions();
   if(CountPendings(true)+CountPendings(false)>0)
      DeleteAllTradifivePendingOrders();
   RemoveTPLine();
   RemoveGridLine();
   return true;
}

// Returns true when positions are being closed because the session ended
bool SessionControl()
{
   if(!SessionOn || TFSessionOpen())
      return false;
   if(CloseAtSessionEnd && CountTradifivePositions()>0)
   {
      ThrottledLog(11,"Session ended. Closing all Tradifive positions.",30);
      DeleteAllTradifivePendingOrders();
      CloseAllOurPositions();
      ResetBasketState();
      g_note="Session ended - positions closed";
      return true;
   }
   return false;
}

//+------------------------------------------------------------------+
//| Opening trades                                                   |
//+------------------------------------------------------------------+
bool OpenInitialBuy()
{
   if(!IsSpreadOK())
   {
      g_spreadBlock=true;
      ThrottledLog(3,"Spread too high ("+DoubleToString(CurrentSpreadPoints(),0)+" pts). Waiting to start BUY basket.");
      return false;
   }
   const double lot=NormalizeLot(CalculateLot(0));
   if(lot>MaximumLot+1e-8)
   {
      g_limitHit=true;
      g_note="Start lot exceeds MaximumLot";
      ThrottledLog(4,"Start lot "+LotStr(lot)+" exceeds MaximumLot. Cannot start BUY basket.");
      return false;
   }
   const double ask=SymbolInfoDouble(_Symbol,SYMBOL_ASK);
   if(!HasEnoughMargin(ORDER_TYPE_BUY,lot,ask))
   {
      ThrottledLog(5,"Not enough free margin to start BUY basket.");
      return false;
   }
   if(trade.Buy(lot,_Symbol,0.0,0.0,0.0,"Tradifive B L0") && TradeOK())
   {
      Log("BUY initial market order executed. Lot = "+LotStr(lot)+".");
      SetReversalDir(-1);
      return true;
   }
   LogTradeFail("Open initial BUY",ask,lot);
   return false;
}

bool OpenInitialSell()
{
   if(!IsSpreadOK())
   {
      g_spreadBlock=true;
      ThrottledLog(3,"Spread too high ("+DoubleToString(CurrentSpreadPoints(),0)+" pts). Waiting to start SELL basket.");
      return false;
   }
   const double lot=NormalizeLot(CalculateLot(0));
   if(lot>MaximumLot+1e-8)
   {
      g_limitHit=true;
      g_note="Start lot exceeds MaximumLot";
      ThrottledLog(4,"Start lot "+LotStr(lot)+" exceeds MaximumLot. Cannot start SELL basket.");
      return false;
   }
   const double bid=SymbolInfoDouble(_Symbol,SYMBOL_BID);
   if(!HasEnoughMargin(ORDER_TYPE_SELL,lot,bid))
   {
      ThrottledLog(5,"Not enough free margin to start SELL basket.");
      return false;
   }
   if(trade.Sell(lot,_Symbol,0.0,0.0,0.0,"Tradifive S L0") && TradeOK())
   {
      Log("SELL initial market order executed. Lot = "+LotStr(lot)+".");
      SetReversalDir(-1);
      return true;
   }
   LogTradeFail("Open initial SELL",bid,lot);
   return false;
}

bool PlacePendingOrder(const ENUM_ORDER_TYPE type,const double lot,const double price,const string comment)
{
   ENUM_ORDER_TYPE_FILLING modes[3];
   modes[0]=ORDER_FILLING_RETURN;
   modes[1]=ORDER_FILLING_IOC;
   modes[2]=ORDER_FILLING_FOK;
   bool done=false;
   for(int i=0;i<3 && !done;i++)
   {
      trade.SetTypeFilling(modes[i]);
      bool sent=false;
      switch(type)
      {
         case ORDER_TYPE_BUY_LIMIT:
            sent=trade.BuyLimit(lot,price,_Symbol,0.0,0.0,ORDER_TIME_GTC,0,comment);
            break;
         case ORDER_TYPE_SELL_LIMIT:
            sent=trade.SellLimit(lot,price,_Symbol,0.0,0.0,ORDER_TIME_GTC,0,comment);
            break;
         case ORDER_TYPE_BUY_STOP:
            sent=trade.BuyStop(lot,price,_Symbol,0.0,0.0,ORDER_TIME_GTC,0,comment);
            break;
         case ORDER_TYPE_SELL_STOP:
            sent=trade.SellStop(lot,price,_Symbol,0.0,0.0,ORDER_TIME_GTC,0,comment);
            break;
         default:
            break;
      }
      if(sent && TradeOK())
      {
         done=true;
         break;
      }
      if(trade.ResultRetcode()!=TRADE_RETCODE_INVALID_FILL)
         break;
   }
   trade.SetTypeFillingBySymbol(_Symbol);
   return done;
}

bool PlaceStartPending(const bool buy)
{
   const string side=buy?"BUY":"SELL";
   if(!IsSpreadOK())
   {
      g_spreadBlock=true;
      g_note="Spread "+DoubleToString(CurrentSpreadPoints(),0)+" pts > max "+IntegerToString(MaximumSpreadPoints);
      ThrottledLog(3,"Spread too high ("+DoubleToString(CurrentSpreadPoints(),0)+" pts, max "+IntegerToString(MaximumSpreadPoints)+"). Start "+side+" order postponed.");
      return false;
   }
   const double lot=NormalizeLot(CalculateLot(0));
   if(lot>MaximumLot+1e-8)
   {
      g_limitHit=true;
      g_note="Start lot exceeds MaximumLot";
      ThrottledLog(4,"Start lot "+LotStr(lot)+" exceeds MaximumLot. Cannot place start "+side+" order.");
      return false;
   }

   const double ask=SymbolInfoDouble(_Symbol,SYMBOL_ASK);
   const double bid=SymbolInfoDouble(_Symbol,SYMBOL_BID);
   const double minDist=StopsLevelPrice();
   double dist=buy?StartBuyPendingDistance:StartSellPendingDistance;
   if(dist<minDist+2.0*_Point)
   {
      dist=minDist+2.0*_Point;
      ThrottledLog(buy?15:2,string(buy?"StartBuyPendingDistance":"StartSellPendingDistance")
                   +" is smaller than broker stops level. Using distance "+PriceStr(dist)+" instead.",300);
   }

   const bool useStop=(StartPendingMode==1);
   const string kind=useStop?"STOP":"LIMIT";
   double price;
   ENUM_ORDER_TYPE otype;
   if(useStop)
   {
      price=buy?NormalizeDouble(ask+dist,_Digits):NormalizeDouble(bid-dist,_Digits);
      otype=buy?ORDER_TYPE_BUY_STOP:ORDER_TYPE_SELL_STOP;
   }
   else
   {
      price=buy?NormalizeDouble(ask-dist,_Digits):NormalizeDouble(bid+dist,_Digits);
      otype=buy?ORDER_TYPE_BUY_LIMIT:ORDER_TYPE_SELL_LIMIT;
   }

   if(!HasEnoughMargin(buy?ORDER_TYPE_BUY:ORDER_TYPE_SELL,lot,price))
   {
      g_note="Not enough free margin";
      ThrottledLog(5,"Not enough free margin for start "+side+" "+kind+".");
      return false;
   }

   const string comment="Tradifive "+string(buy?"B":"S")+" L0";
   if(PlacePendingOrder(otype,lot,price,comment))
   {
      Log("Start "+side+" "+kind+" placed: lot "+LotStr(lot)+" @ "+PriceStr(price)+".");
      return true;
   }
   LogTradeFail("Place start "+side+" "+kind,price,lot);
   return false;
}

void ManageStartPendings()
{
   if(CountPendings(true)>1)
      DeleteBuyPending();
   if(CountPendings(false)>1)
      DeleteSellPending();
   if(CountPendings(true)==0)
      PlaceStartPending(true);
   if(CountPendings(false)==0)
      PlaceStartPending(false);

   const bool hasBuy=(CountPendings(true)>0);
   const bool hasSell=(CountPendings(false)>0);
   if(hasBuy && hasSell)
      g_note="Start BUY+SELL orders placed. Waiting.";
   else if(g_note=="")
      g_note=string("Start orders missing (BUY:")+(hasBuy?"ok":"NO")+" SELL:"+(hasSell?"ok":"NO")+") - see Experts log";
}

void StartNewCycle()
{
   int dir=StartDirection;
   if(g_reversalDir>=0)
   {
      dir=g_reversalDir;
      ThrottledLog(6,string("Starting ")+(dir==0?"BUY":"SELL")+" reversal.",5);
   }
   if(dir==0)
      OpenInitialBuy();
   else
      OpenInitialSell();
}

//+------------------------------------------------------------------+
//| Grid placement (market orders when the level is reached)         |
//+------------------------------------------------------------------+
void PlaceNextGrid(const bool buy,const BasketInfo &b)
{
   const string side=buy?"BUY":"SELL";
   const int    idx=buy?0:1;
   const double nextPrice=buy?NormalizeDouble(b.lowest-GridDistance,_Digits)
                             :NormalizeDouble(b.highest+GridDistance,_Digits);
   const double rawLot=CalculateLot(b.count);
   const double lot=NormalizeLot(rawLot);

   const int oppositeCount=buy?CountSellPositions():CountBuyPositions();
   if(oppositeCount>0)
      return;

   if(CountPendings(buy)>0)
   {
      Log("Removing leftover "+side+" pending order(s). Grid levels are opened at market when price reaches the level.");
      if(!DeletePendingSide(buy))
         return;
   }

   string reason="";
   if(!GridAllowed(b,rawLot,lot,reason))
   {
      g_limitHit=true;
      g_note="Limit: "+reason;
      ThrottledLog(buy?7:8,"Safety limit: "+reason+". No new "+side+" grid trades.");
      RemoveGridLine();
      return;
   }

   UpdateGridLine(nextPrice);

   const double ask=SymbolInfoDouble(_Symbol,SYMBOL_ASK);
   const double bid=SymbolInfoDouble(_Symbol,SYMBOL_BID);
   const bool reached=buy?(ask<=nextPrice):(bid>=nextPrice);
   if(!reached)
      return;

   if(b.count==g_gridCnt[idx] && (TimeCurrent()-g_gridTime[idx])<3)
      return;

   if(!IsSpreadOK())
   {
      g_spreadBlock=true;
      g_note="Spread "+DoubleToString(CurrentSpreadPoints(),0)+" pts > max "+IntegerToString(MaximumSpreadPoints);
      ThrottledLog(9,"Spread too high ("+DoubleToString(CurrentSpreadPoints(),0)+" pts). "+side+" grid level "+PriceStr(nextPrice)+" reached but trade postponed.");
      return;
   }

   if(!HasEnoughMargin(buy?ORDER_TYPE_BUY:ORDER_TYPE_SELL,lot,buy?ask:bid))
   {
      g_note="Not enough free margin";
      ThrottledLog(10,"Not enough free margin for "+side+" grid level "+PriceStr(nextPrice)+".");
      return;
   }

   const string comment="Tradifive "+string(buy?"B":"S")+" L"+IntegerToString(b.count);
   Log(side+" grid level "+PriceStr(nextPrice)+" reached. Opening market "+side+" lot "+LotStr(lot)+".");

   bool ok=false;
   if(buy)
      ok=(trade.Buy(lot,_Symbol,0.0,0.0,0.0,comment) && TradeOK());
   else
      ok=(trade.Sell(lot,_Symbol,0.0,0.0,0.0,comment) && TradeOK());

   if(ok)
   {
      g_gridCnt[idx]=b.count;
      g_gridTime[idx]=TimeCurrent();
   }
   else
      LogTradeFail("Market "+side+" grid level",buy?ask:bid,lot);
}

void PlaceNextBuyGrid(const BasketInfo &b)  { PlaceNextGrid(true,b); }
void PlaceNextSellGrid(const BasketInfo &b) { PlaceNextGrid(false,b); }

//+------------------------------------------------------------------+
//| Basket closing                                                   |
//+------------------------------------------------------------------+
bool CloseBasketByType(const ENUM_POSITION_TYPE type)
{
   const bool buy=(type==POSITION_TYPE_BUY);

   if(CountPendings(buy)>0)
      DeletePendingSide(buy);

   ulong tickets[];
   CollectTickets(type,tickets);
   bool allOk=true;
   for(int i=0;i<ArraySize(tickets);i++)
   {
      if(!PositionSelectByTicket(tickets[i]))
         continue;
      const double vol=PositionGetDouble(POSITION_VOLUME);
      const double price=buy?SymbolInfoDouble(_Symbol,SYMBOL_BID):SymbolInfoDouble(_Symbol,SYMBOL_ASK);
      if(!trade.PositionClose(tickets[i],(ulong)DeviationPoints) || !TradeOK())
      {
         LogTradeFail("Close "+string(buy?"BUY":"SELL")+" position #"+IntegerToString((long)tickets[i]),price,vol);
         allOk=false;
      }
   }
   return (allOk && CountPositions(type)==0);
}

bool CloseBuyBasket()
{
   ThrottledLog(13,"Closing BUY basket.",5);
   return CloseBasketByType(POSITION_TYPE_BUY);
}

bool CloseSellBasket()
{
   ThrottledLog(14,"Closing SELL basket.",5);
   return CloseBasketByType(POSITION_TYPE_SELL);
}

void FinalizeClosing()
{
   if(g_closeBuy && CountBuyPositions()==0)
   {
      DeleteBuyPending();
      SetCloseFlag(true,false);
      g_prevBuyCount=0;
      Log("BUY basket completely closed.");
   }
   if(g_closeSell && CountSellPositions()==0)
   {
      DeleteSellPending();
      SetCloseFlag(false,false);
      g_prevSellCount=0;
      Log("SELL basket completely closed.");
   }
}

//+------------------------------------------------------------------+
//| Basket management                                                |
//+------------------------------------------------------------------+
bool LastCloseWasTP(const bool buyBasket)
{
   const datetime now=TimeCurrent();
   if(!HistorySelect(now-3*24*3600,now+3600))
      return false;
   const int total=HistoryDealsTotal();
   for(int i=total-1;i>=0;i--)
   {
      const ulong deal=HistoryDealGetTicket(i);
      if(deal==0)
         continue;
      if(HistoryDealGetString(deal,DEAL_SYMBOL)!=_Symbol)
         continue;
      if((ulong)HistoryDealGetInteger(deal,DEAL_MAGIC)!=MagicNumber)
         continue;
      const ENUM_DEAL_ENTRY entry=(ENUM_DEAL_ENTRY)HistoryDealGetInteger(deal,DEAL_ENTRY);
      if(entry!=DEAL_ENTRY_OUT && entry!=DEAL_ENTRY_OUT_BY && entry!=DEAL_ENTRY_INOUT)
         continue;
      const ENUM_DEAL_TYPE dtype=(ENUM_DEAL_TYPE)HistoryDealGetInteger(deal,DEAL_TYPE);
      const ENUM_DEAL_TYPE expect=buyBasket?DEAL_TYPE_SELL:DEAL_TYPE_BUY;
      if(dtype!=expect)
         return false;
      return ((ENUM_DEAL_REASON)HistoryDealGetInteger(deal,DEAL_REASON)==DEAL_REASON_TP);
   }
   return false;
}

void SyncBasketTP(const bool buy,const double tp)
{
   if(!PlaceTPOnPositions)
      return;
   const int idx=buy?0:1;
   const ENUM_POSITION_TYPE type=buy?POSITION_TYPE_BUY:POSITION_TYPE_SELL;

   ulong tickets[];
   CollectTickets(type,tickets);

   bool need=false;
   for(int i=0;i<ArraySize(tickets);i++)
   {
      if(!PositionSelectByTicket(tickets[i]))
         continue;
      if(MathAbs(PositionGetDouble(POSITION_TP)-tp)>_Point/2.0 || PositionGetDouble(POSITION_SL)!=0.0)
      {
         need=true;
         break;
      }
   }
   if(!need)
      return;

   if(TimeCurrent()-g_lastTPSync[idx]<1)
      return;
   g_lastTPSync[idx]=TimeCurrent();

   const double minDist=StopsLevelPrice();
   const double bid=SymbolInfoDouble(_Symbol,SYMBOL_BID);
   const double ask=SymbolInfoDouble(_Symbol,SYMBOL_ASK);
   if(buy ? (tp-bid<minDist) : (ask-tp<minDist))
   {
      ThrottledLog(idx,"Basket TP "+PriceStr(tp)+" is too close to market for broker stops level. TP not set on positions now; EA closes the basket itself when TP price is reached.",60);
      return;
   }

   for(int i=0;i<ArraySize(tickets);i++)
   {
      if(!PositionSelectByTicket(tickets[i]))
         continue;
      if(MathAbs(PositionGetDouble(POSITION_TP)-tp)<=_Point/2.0 && PositionGetDouble(POSITION_SL)==0.0)
         continue;
      if(!trade.PositionModify(tickets[i],0.0,tp) || !TradeOK())
      {
         ThrottledLog(idx,"Set TP FAILED | position #"+IntegerToString((long)tickets[i])+" | symbol="+_Symbol
                      +" | TP="+PriceStr(tp)+" | retcode="+IntegerToString((int)trade.ResultRetcode())
                      +" | "+trade.ResultRetcodeDescription(),30);
      }
   }
}

void DetectServerTPClose()
{
   if(g_prevBuyCount>0 && !g_closeBuy && CountBuyPositions()==0)
   {
      if(LastCloseWasTP(true))
      {
         Log("BUY basket TP reached (closed by TP on the server).");
         Log("BUY basket completely closed.");
         if(CountSellPositions()==0)
            SetReversalDir(1);
      }
      else
         Log("BUY positions disappeared without TP (manual close or stop-out). No reversal.");
      DeleteBuyPending();
      g_prevBuyCount=0;
   }
   if(g_prevSellCount>0 && !g_closeSell && CountSellPositions()==0)
   {
      if(LastCloseWasTP(false))
      {
         Log("SELL basket TP reached (closed by TP on the server).");
         Log("SELL basket completely closed.");
         if(CountBuyPositions()==0)
            SetReversalDir(0);
      }
      else
         Log("SELL positions disappeared without TP (manual close or stop-out). No reversal.");
      DeleteSellPending();
      g_prevSellCount=0;
   }
}

void ManageBuyBasket()
{
   BasketInfo b;
   GetBasket(POSITION_TYPE_BUY,b);
   if(b.count==0)
      return;

   const int prevCount=g_prevBuyCount;
   LogBasketChange(true,b);

   const double tp=NormalizeDouble(b.wavg+TPDistance,_Digits);
   UpdateTPLine(true,tp);

   if(!g_closeBuy && prevCount>0 && b.count<prevCount && LastCloseWasTP(true))
   {
      Log("BUY positions closed by server TP. Closing remaining BUY positions.");
      SetCloseFlag(true,true);
      if(CountSellPositions()==0)
         SetReversalDir(1);
   }

   if(!g_closeBuy && b.count>=prevCount)
      SyncBasketTP(true,tp);

   const double bid=SymbolInfoDouble(_Symbol,SYMBOL_BID);
   if(!g_closeBuy && bid>=tp)
   {
      Log("BUY basket TP reached. Weighted average = "+PriceStr(b.wavg)+", TP = "+PriceStr(tp)+", Bid = "+PriceStr(bid)+".");
      SetCloseFlag(true,true);
      if(CountSellPositions()==0)
         SetReversalDir(1);
   }

   if(g_closeBuy)
   {
      CloseBuyBasket();
      return;
   }

   PlaceNextBuyGrid(b);
}

void ManageSellBasket()
{
   BasketInfo b;
   GetBasket(POSITION_TYPE_SELL,b);
   if(b.count==0)
      return;

   const int prevCount=g_prevSellCount;
   LogBasketChange(false,b);

   const double tp=NormalizeDouble(b.wavg-TPDistance,_Digits);
   UpdateTPLine(false,tp);

   if(!g_closeSell && prevCount>0 && b.count<prevCount && LastCloseWasTP(false))
   {
      Log("SELL positions closed by server TP. Closing remaining SELL positions.");
      SetCloseFlag(false,true);
      if(CountBuyPositions()==0)
         SetReversalDir(0);
   }

   if(!g_closeSell && b.count>=prevCount)
      SyncBasketTP(false,tp);

   const double ask=SymbolInfoDouble(_Symbol,SYMBOL_ASK);
   if(!g_closeSell && ask<=tp)
   {
      Log("SELL basket TP reached. Weighted average = "+PriceStr(b.wavg)+", TP = "+PriceStr(tp)+", Ask = "+PriceStr(ask)+".");
      SetCloseFlag(false,true);
      if(CountBuyPositions()==0)
         SetReversalDir(0);
   }

   if(g_closeSell)
   {
      CloseSellBasket();
      return;
   }

   PlaceNextSellGrid(b);
}

//+------------------------------------------------------------------+
//| Restart / reconnect recovery                                     |
//+------------------------------------------------------------------+
void RecoverState()
{
   g_closeBuy   =(GVGet("CLOSE_BUY",0.0)>0.5);
   g_closeSell  =(GVGet("CLOSE_SELL",0.0)>0.5);
   g_reversalDir=(int)GVGet("REVERSAL",-1.0);

   if(ClearHaltOnInit)
   {
      GVDel("HALT");
      g_halted=false;
   }
   else
      g_halted=(GVGet("HALT",0.0)>0.5);

   g_dayKey=TodayKey();
   g_dayHalt=((int)GVGet("DAYHALT",0.0)==g_dayKey);
   if(g_dayHalt)
   {
      g_dayReason="restored from previous session";
      g_dayKind=(int)GVGet("DAYKIND",1.0);
   }

   BasketInfo bb,sb;
   GetBasket(POSITION_TYPE_BUY,bb);
   GetBasket(POSITION_TYPE_SELL,sb);

   if(g_closeBuy && bb.count==0)
      SetCloseFlag(true,false);
   if(g_closeSell && sb.count==0)
      SetCloseFlag(false,false);
   if(g_reversalDir>=0 && (bb.count+sb.count)>0 && !g_closeBuy && !g_closeSell)
      SetReversalDir(-1);
   if(g_reversalDir<0)
      GVDel("REVERSAL");

   g_prevBuyCount=bb.count;
   g_prevSellCount=sb.count;

   Log("RecoverState: symbol="+_Symbol+", magic="+IntegerToString((long)MagicNumber)+".");
   if(bb.count==0 && sb.count==0)
   {
      const int pend=CountPendings(true)+CountPendings(false);
      Log("No existing Tradifive positions. Pending orders found: "+IntegerToString(pend)+".");
      if(g_reversalDir>=0)
         Log(string("Pending reversal to ")+(g_reversalDir==0?"BUY":"SELL")+" restored.");
   }
   if(bb.count>0)
   {
      Log("Recovered BUY basket: positions="+IntegerToString(bb.count)+", lots="+LotStr(bb.lots)
          +", lowest entry="+PriceStr(bb.lowest)+", weighted average="+PriceStr(bb.wavg)
          +", basket TP="+PriceStr(bb.wavg+TPDistance)
          +", next grid="+PriceStr(bb.lowest-GridDistance)
          +", next lot="+LotStr(NormalizeLot(CalculateLot(bb.count)))+".");
   }
   if(sb.count>0)
   {
      Log("Recovered SELL basket: positions="+IntegerToString(sb.count)+", lots="+LotStr(sb.lots)
          +", highest entry="+PriceStr(sb.highest)+", weighted average="+PriceStr(sb.wavg)
          +", basket TP="+PriceStr(sb.wavg-TPDistance)
          +", next grid="+PriceStr(sb.highest+GridDistance)
          +", next lot="+LotStr(NormalizeLot(CalculateLot(sb.count)))+".");
   }
   if(bb.count>0 && sb.count>0)
      Log("WARNING: both BUY and SELL Tradifive positions exist. Each basket is managed on its own; no new cycle will start until both are closed.");
   if(g_closeBuy)
      Log("Resuming closing of BUY basket (TP had already been reached).");
   if(g_closeSell)
      Log("Resuming closing of SELL basket (TP had already been reached).");
   if(g_halted)
      Log("Drawdown protection HALT is active from a previous session.");
   if(g_dayHalt)
      Log("Daily pause is still active for today.");
}

//+------------------------------------------------------------------+
//| Expert initialization                                            |
//+------------------------------------------------------------------+
int OnInit()
{
   TFS_Load();   // live settings: EA inputs, overridden by saved dashboard settings
   TFLicLoad();  // license key / trial state

   //--- HARD ACCOUNT LOCK & SECURITY ENFORCEMENT
   // Ensures this algorithm attaches ONLY to the approved MT5 Account.
   // Prevents unauthorized sharing, forwarding, or running on other accounts.
   if(!MQLInfoInteger(MQL_TESTER) && RequireLicense)
   {
      const ulong currentAccount = (ulong)AccountInfoInteger(ACCOUNT_LOGIN);
      if(g_licKey != "")
      {
         ulong licAccount = 0, chk = 0;
         int expDays = 0;
         if(!TFParseKey(g_licKey, licAccount, expDays, chk) || chk != TFLicHash(licAccount, expDays))
         {
            Alert("TRADIFIVE SECURITY ERROR: Invalid or corrupted license key! Algorithm cannot start.");
            Print("TRADIFIVE: Invalid license key verification failed.");
            ExpertRemove();
            return INIT_FAILED;
         }
         else if(licAccount != 0 && licAccount != currentAccount)
         {
            Alert("Account number didn't match! Your license is for MT5 Account #", licAccount,
                  ", but your MT5 is currently logged into Account #", currentAccount,
                  ". Connection blocked.");
            Print("TRADIFIVE: Account mismatch! Bound account: ", licAccount, " vs Current account: ", currentAccount);
            ExpertRemove();
            return INIT_FAILED;
         }
      }
      else
      {
         if(TrialDays <= 0)
         {
            Alert("Account number didn't match or License Key missing! Please enter your license key for MT5 Account #", currentAccount,
                  " in EA Settings (press F7).");
            Print("TRADIFIVE: No license key provided for Account #", currentAccount);
            ExpertRemove();
            return INIT_FAILED;
         }
      }
   }

   const ENUM_ACCOUNT_MARGIN_MODE mm=(ENUM_ACCOUNT_MARGIN_MODE)AccountInfoInteger(ACCOUNT_MARGIN_MODE);
   if(mm!=ACCOUNT_MARGIN_MODE_RETAIL_HEDGING)
   {
      Print("TRADIFIVE: This EA requires a HEDGING account. Current margin mode does not allow multiple positions per symbol. EA stopped.");
      Alert("Cannot connect: MetaTrader 5 HEDGING account required! Your current account is Netting. Please switch to or open a Hedging account with your broker.");
      return INIT_FAILED;
   }

   if(StartLot<=0.0 || LotIncrement<0.0 || GridDistance<=0.0 || TPDistance<=0.0)
   {
      Print("TRADIFIVE: Invalid inputs. StartLot, GridDistance and TPDistance must be > 0 and LotIncrement >= 0.");
      return INIT_PARAMETERS_INCORRECT;
   }
   if(StartWithPendingOrders && StartBuyPendingDistance<=0.0)
   {
      Print("TRADIFIVE: Start order distance must be > 0 when pending start is enabled.");
      return INIT_PARAMETERS_INCORRECT;
   }
   if(StartPendingMode!=0 && StartPendingMode!=1)
   {
      Print("TRADIFIVE: Start order type must be 0 (LIMIT) or 1 (STOP).");
      return INIT_PARAMETERS_INCORRECT;
   }
   if(StartDirection!=0 && StartDirection!=1)
   {
      Print("TRADIFIVE: StartDirection must be 0 (BUY) or 1 (SELL).");
      return INIT_PARAMETERS_INCORRECT;
   }
   if(MaximumOrdersPerBasket<1 || MaximumLot<=0.0 || MaximumTotalLots<=0.0 || MaximumSpreadPoints<0)
   {
      Print("TRADIFIVE: Invalid safety limit inputs.");
      return INIT_PARAMETERS_INCORRECT;
   }
   if(UseDrawdownProtection && MaximumDrawdownPercent<=0.0)
   {
      Print("TRADIFIVE: MaximumDrawdownPercent must be > 0 when drawdown protection is enabled.");
      return INIT_PARAMETERS_INCORRECT;
   }

   if(!SymbolSelect(_Symbol,true))
      Print("TRADIFIVE: Warning - could not select symbol ",_Symbol," in Market Watch.");

   if(!TerminalInfoInteger(TERMINAL_TRADE_ALLOWED) || !MQLInfoInteger(MQL_TRADE_ALLOWED))
      Print("TRADIFIVE: Warning - automated trading appears disabled. Enable Algo Trading and 'Allow Algo Trading' in EA settings.");

   trade.SetExpertMagicNumber(MagicNumber);
   trade.SetDeviationInPoints((ulong)DeviationPoints);
   trade.SetTypeFillingBySymbol(_Symbol);
   trade.SetAsyncMode(false);

   g_gvPrefix="TRADIFIVE_"+IntegerToString((long)MagicNumber)+"_"+_Symbol+"_";
   if(MQLInfoInteger(MQL_TESTER))
   {
      GVDel("CLOSE_BUY");
      GVDel("CLOSE_SELL");
      GVDel("REVERSAL");
      GVDel("HALT");
      GVDel("DAYHALT");
      GVDel("DAYKIND");
   }
   for(int i=0;i<ArraySize(g_thrTime);i++)
      g_thrTime[i]=0;
   g_gridCnt[0]=-1; g_gridCnt[1]=-1;
   g_gridTime[0]=0; g_gridTime[1]=0;
   g_lastTPSync[0]=0; g_lastTPSync[1]=0;

   g_closeBuy=false;
   g_closeSell=false;
   g_reversalDir=-1;
   g_halted=false;
   g_dayHalt=false;
   g_dayKind=0;
   g_currentDD=0.0;
   g_maxDD=0.0;
   g_note="";

   Log("Initialising. Symbol="+_Symbol+", digits="+IntegerToString(_Digits)+", point="+DoubleToString(_Point,_Digits)
       +", stops level="+IntegerToString((int)SymbolInfoInteger(_Symbol,SYMBOL_TRADE_STOPS_LEVEL))+" pts"
       +", lot min/step/max="+LotStr(SymbolInfoDouble(_Symbol,SYMBOL_VOLUME_MIN))+"/"
       +LotStr(SymbolInfoDouble(_Symbol,SYMBOL_VOLUME_STEP))+"/"+LotStr(SymbolInfoDouble(_Symbol,SYMBOL_VOLUME_MAX))+".");
   Log("GridDistance="+DoubleToString(GridDistance,2)+" price units, TPDistance="+DoubleToString(TPDistance,2)+" price units.");
   Log("Current spread = "+DoubleToString(CurrentSpreadPoints(),0)+" points, MaximumSpreadPoints = "+IntegerToString(MaximumSpreadPoints)
       +(UseSpreadFilter?" (filter ON).":" (filter OFF)."));
   Log("RISK WARNING: grid/averaging strategy. Test in Strategy Tester and on Demo before any live use.");

   RecoverState();

   if(ShowDashboard && ChartObjectsEnabled())
   {
      if(g_dash.Create())
         EventSetMillisecondTimer(33);
      else
         Print("TRADIFIVE: Warning - dashboard could not be created.");
   }
   UpdateChartPanel();
   return INIT_SUCCEEDED;
}

//+------------------------------------------------------------------+
//| Expert deinitialization                                          |
//+------------------------------------------------------------------+
void OnDeinit(const int reason)
{
   EventKillTimer();
   g_dash.Destroy();
   RemoveAllChartObjects();
   if(MQLInfoInteger(MQL_TESTER))
   {
      GVDel("CLOSE_BUY");
      GVDel("CLOSE_SELL");
      GVDel("REVERSAL");
      GVDel("HALT");
      GVDel("DAYHALT");
      GVDel("DAYKIND");
   }
   Log("Stopped. Reason code = "+IntegerToString(reason)+". Open positions/orders are left untouched.");
}

//+------------------------------------------------------------------+
//| Timer / chart events (dashboard animation + clicks)              |
//+------------------------------------------------------------------+
void OnTimer()
{
   g_dash.Timer();
}

void OnChartEvent(const int id,const long &lparam,const double &dparam,const string &sparam)
{
   g_dash.Event(id,lparam,dparam,sparam);
}

//+------------------------------------------------------------------+
//| Expert tick function                                             |
//+------------------------------------------------------------------+
void OnTick()
{
   g_limitHit=false;
   g_spreadBlock=false;
   g_note="";
   TFLicTick();

   // 0) Settings changed from the dashboard: rebuild start orders when flat
   if(g_settingsChanged)
   {
      g_settingsChanged=false;
      if(CountTradifivePositions()==0 && CountPendings(true)+CountPendings(false)>0)
         DeleteAllTradifivePendingOrders();
   }

   // 1) Emergency protection / halt (does not depend on spread)
   if(g_halted || CheckDrawdownProtection())
   {
      HandleHalt();
      UpdateChartPanel();
      return;
   }

   // 1b) Daily target / loss pause and session-end closing
   if(DayControl() || SessionControl())
   {
      UpdateChartPanel();
      return;
   }

   if(SessionOn && TFSessionOpen() && !TFInWindow())
      g_note="After session end - running until daily target is reached";

   // 2) Detect baskets closed by server TP, then confirm closing
   DetectServerTPClose();
   FinalizeClosing();

   // 3) Manage existing baskets
   if(CountBuyPositions()>0)
      ManageBuyBasket();
   if(CountSellPositions()>0)
      ManageSellBasket();

   // 4) Re-check after possible closing
   FinalizeClosing();

   const int nBuy=CountBuyPositions();
   const int nSell=CountSellPositions();
   if(nBuy==0)
      g_prevBuyCount=0;
   if(nSell==0)
      g_prevSellCount=0;

   if(nBuy+nSell==0)
   {
      RemoveTPLine();
      RemoveGridLine();

      if(!TFLicenseOK())
      {
         if(CountPendings(true)+CountPendings(false)>0)
            DeleteAllTradifivePendingOrders();
         g_note="License not valid - contact support";
      }
      else if(!TFSessionOpen())
      {
         if(CountPendings(true)+CountPendings(false)>0)
            DeleteAllTradifivePendingOrders();
         g_note="Outside trading session - waiting";
      }
      else if(StartWithPendingOrders && g_reversalDir<0)
      {
         ManageStartPendings();
      }
      else
      {
         if(CountPendings(true)+CountPendings(false)>0)
         {
            Log("Pending orders found without any open position. Deleting them before starting a new cycle.");
            if(!DeleteAllTradifivePendingOrders())
            {
               UpdateChartPanel();
               return;
            }
         }
         StartNewCycle();
      }
   }
   else if(nBuy>0 && nSell==0)
      { if(!g_closeBuy && CountPendings(false)>0) DeleteSellPending(); }
   else if(nSell>0 && nBuy==0)
      { if(!g_closeSell && CountPendings(true)>0) DeleteBuyPending(); }

   UpdateChartPanel();
}
//+------------------------------------------------------------------+