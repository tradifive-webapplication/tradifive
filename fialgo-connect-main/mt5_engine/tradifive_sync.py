"""
Tradifive MT5 Python Connector & Real-Time Sync Service
======================================================
Connects directly to your running MetaTrader 5 terminal, extracts live account
balances, margins, closed deals, and open positions, and synchronizes them
with the Tradifive cloud dashboard in real-time.

Requirements:
    pip install MetaTrader5 requests
"""

import time
import datetime
import requests
import MetaTrader5 as mt5

# ── Configuration ──
ACTIVATION_KEY = "TF-00000000-056D-906D0DB6CA"  # Your Tradifive Activation / License Key
SUPABASE_URL = "https://rylwyxhupwpwsdbvuoej.supabase.co"
SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ5bHd5eGh1cHdwd3NkYnZ1b2VqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY0MzI1NTcsImV4cCI6MjA5MjAwODU1N30.xuRj9PZgZys2b64pNnjhXOVyDjtGVFlBno2o9hiisHA"

WEBHOOK_URL = f"{SUPABASE_URL}/functions/v1/mt5-webhook"
DIRECT_SETTINGS_URL = f"{SUPABASE_URL}/rest/v1/system_settings?id=eq.mt5_telemetry_live"

HEADERS = {
    "Content-Type": "application/json",
    "Authorization": f"Bearer {SUPABASE_ANON_KEY}",
    "apikey": SUPABASE_ANON_KEY,
    "Prefer": "return=minimal"
}

def connect_mt5():
    """Initializes connection to MT5 terminal."""
    if not mt5.initialize():
        print(f"[!] MT5 initialization failed. Error code: {mt5.last_error()}")
        return False
    
    account_info = mt5.account_info()
    if account_info is None:
        print("[!] No active MT5 account found. Please log in to MT5.")
        return False
        
    print(f"[✓] Connected to MT5: Login {account_info.login} ({account_info.company})")
    print(f"    Balance: {account_info.balance} {account_info.currency} | Equity: {account_info.equity}")
    return True

def get_accounting_metrics():
    """Calculates real deposits, withdrawals, and profits from MT5 deal history."""
    now = datetime.datetime.now()
    start_of_today = datetime.datetime(now.year, now.month, now.day, 0, 0, 0)
    
    # Retrieve all history deals from account inception
    deals = mt5.history_deals_get(datetime.datetime(2020, 1, 1), now)
    
    total_deposits = 0.0
    total_withdrawals = 0.0
    today_profit = 0.0
    net_profit = 0.0
    
    if deals:
        for d in deals:
            # DEAL_TYPE_BALANCE = 2
            if d.type == 2:
                if d.profit > 0:
                    total_deposits += d.profit
                elif d.profit < 0:
                    total_withdrawals += abs(d.profit)
            else:
                # Closed trade deal
                deal_pnl = d.profit + d.swap + d.commission
                net_profit += deal_pnl
                
                deal_time = datetime.datetime.fromtimestamp(d.time)
                if deal_time >= start_of_today:
                    today_profit += deal_pnl
                    
    # Add floating profit of currently open positions
    open_positions = mt5.positions_get()
    floating_profit = 0.0
    if open_positions:
        floating_profit = sum(p.profit for p in open_positions)
        
    today_profit += floating_profit
    net_profit += floating_profit
    
    account = mt5.account_info()
    if total_deposits <= 0.0 and account.balance > 0:
        total_deposits = account.balance
        
    return {
        "total_deposits": round(total_deposits, 2),
        "total_withdrawals": round(total_withdrawals, 2),
        "today_profit": round(today_profit, 2),
        "net_profit": round(net_profit, 2)
    }

def get_open_positions():
    """Extracts all active positions into JSON-ready dicts."""
    positions = mt5.positions_get()
    result = []
    if not positions:
        return result
        
    for p in positions:
        pos_type = "BUY" if p.type == 0 else "SELL"
        result.append({
            "ticket": p.ticket,
            "symbol": p.symbol,
            "type": pos_type,
            "lot": round(p.volume, 2),
            "open_price": round(p.price_open, 5),
            "current_price": round(p.price_current, 5),
            "sl": round(p.sl, 5),
            "tp": round(p.tp, 5),
            "profit": round(p.profit, 2),
            "time": p.time
        })
    return result

def sync_telemetry_loop(interval_sec=2):
    """Continuous synchronization loop."""
    print(f"[*] Starting Tradifive Cloud sync loop (every {interval_sec}s)...")
    while True:
        try:
            account = mt5.account_info()
            if account is None:
                print("[!] Lost connection to MT5. Reconnecting...")
                connect_mt5()
                time.sleep(3)
                continue
                
            accounting = get_accounting_metrics()
            open_pos = get_open_positions()
            
            payload = {
                "action": "metrics_sync",
                "activation_key": ACTIVATION_KEY,
                "account_number": str(account.login),
                "broker": account.company,
                "balance": round(account.balance, 2),
                "equity": round(account.equity, 2),
                "margin": round(account.margin, 2),
                "margin_free": round(account.margin_free, 2),
                "margin_level": round(account.margin_level, 2),
                "leverage": account.leverage,
                "total_deposits": accounting["total_deposits"],
                "total_withdrawals": accounting["total_withdrawals"],
                "today_profit": accounting["today_profit"],
                "net_profit": accounting["net_profit"],
                "currency": account.currency,
                "open_positions": open_pos
            }
            
            # 1. Edge function webhook
            try:
                requests.post(WEBHOOK_URL, json=payload, headers=HEADERS, timeout=4)
            except Exception as e:
                pass
                
            # 2. Instant direct REST PATCH to system_settings
            try:
                patch_payload = {
                    "value": {
                        "account_number": str(account.login),
                        "broker": account.company,
                        "broker_server": account.server,
                        "balance": round(account.balance, 2),
                        "equity": round(account.equity, 2),
                        "margin": round(account.margin, 2),
                        "margin_free": round(account.margin_free, 2),
                        "margin_level": round(account.margin_level, 2),
                        "leverage": account.leverage,
                        "total_deposits": accounting["total_deposits"],
                        "total_withdrawals": accounting["total_withdrawals"],
                        "today_profit": accounting["today_profit"],
                        "net_profit": accounting["net_profit"],
                        "currency": account.currency,
                        "is_connected": True,
                        "algo_status": True,
                        "open_positions": open_pos,
                        "last_pulse": datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
                    }
                }
                requests.patch(DIRECT_SETTINGS_URL, json=patch_payload, headers=HEADERS, timeout=4)
            except Exception as e:
                pass
                
            print(f"[✓] Synced | Balance: {account.balance} {account.currency} | Today PnL: {accounting['today_profit']} | Open Trades: {len(open_pos)}")
            
        except Exception as err:
            print(f"[!] Error in sync loop: {err}")
            
        time.sleep(interval_sec)

if __name__ == "__main__":
    if connect_mt5():
        sync_telemetry_loop()
    else:
        print("[!] Could not connect to MetaTrader 5.")
