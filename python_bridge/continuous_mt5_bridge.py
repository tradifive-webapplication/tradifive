import time
import os
import sys
from datetime import datetime, timedelta
import requests
import MetaTrader5 as mt5

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')

WEBHOOK_URL = "https://rylwyxhupwpwsdbvuoej.supabase.co/functions/v1/mt5-webhook"
ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ5bHd5eGh1cHdwd3NkYnZ1b2VqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY0MzI1NTcsImV4cCI6MjA5MjAwODU1N30.xuRj9PZgZys2b64pNnjhXOVyDjtGVFlBno2o9hiisHA"
ACTIVATION_KEY = "TF-18B42A6D-2710-30307601B9"

headers = {
    "Content-Type": "application/json",
    "Authorization": f"Bearer {ANON_KEY}",
    "apikey": ANON_KEY
}

def sync_once():
    if not mt5.initialize():
        print(f"[{datetime.now().strftime('%H:%M:%S')}] MT5 initialization failed: {mt5.last_error()}")
        return False

    acc = mt5.account_info()
    if not acc:
        print(f"[{datetime.now().strftime('%H:%M:%S')}] Failed to get MT5 account info")
        return False

    # 1. Open Positions
    pos_list = []
    positions = mt5.positions_get()
    if positions:
        for p in positions:
            d = p._asdict()
            pos_list.append({
                "ticket": d["ticket"],
                "symbol": d["symbol"],
                "type": "BUY" if d["type"] == 0 else "SELL",
                "lot": d["volume"],
                "open_price": d["price_open"],
                "current_price": d["price_current"],
                "profit": d["profit"],
                "sl": d["sl"],
                "tp": d["tp"],
                "opened_at": datetime.fromtimestamp(d["time"]).isoformat()
            })

    # 2. Closed Deals (last 30 days)
    deals_list = []
    deals = mt5.history_deals_get(datetime.now() - timedelta(days=30), datetime.now())
    if deals:
        for d in deals:
            dict_d = d._asdict()
            # Only record closed trades / exits (entry == 1) or non-zero profit deals
            if dict_d.get("entry") == 1 or dict_d.get("profit") != 0:
                deals_list.append({
                    "ticket": dict_d["ticket"],
                    "symbol": dict_d["symbol"],
                    "type": "BUY" if dict_d["type"] == 0 else "SELL",
                    "lot": dict_d["volume"],
                    "price": dict_d["price"],
                    "profit": dict_d["profit"],
                    "commission": dict_d.get("commission", 0.0),
                    "swap": dict_d.get("swap", 0.0),
                    "time": dict_d["time"],
                    "closed_at": datetime.fromtimestamp(dict_d["time"]).isoformat()
                })

    payload = {
        "action": "metrics_sync",
        "activation_key": ACTIVATION_KEY,
        "account_number": str(acc.login),
        "broker": acc.company,
        "server": acc.server,
        "balance": acc.balance,
        "equity": acc.equity,
        "currency": acc.currency,
        "open_positions": pos_list,
        "recent_deals": deals_list
    }

    try:
        res = requests.post(WEBHOOK_URL, json=payload, headers=headers, timeout=8)
        if res.status_code == 200:
            sym = "₹" if acc.currency == "INR" else ("$" if acc.currency == "USD" else acc.currency)
            print(f"[{datetime.now().strftime('%H:%M:%S')}] SYNC OK -> MT5 #{acc.login} ({acc.company}) | Bal: {sym}{acc.balance:,.2f} ({acc.currency}) | Eq: {sym}{acc.equity:,.2f} | Open: {len(pos_list)} | Deals: {len(deals_list)}")
            return True
        else:
            print(f"[{datetime.now().strftime('%H:%M:%S')}] Webhook returned {res.status_code}: {res.text}")
            return False
    except Exception as e:
        print(f"[{datetime.now().strftime('%H:%M:%S')}] Sync exception: {e}")
        return False

def run_loop():
    print(f"Starting FiAlgo Real-Time MT5 Bridge (1-Second Heartbeat)...", flush=True)
    while True:
        try:
            sync_once()
        except Exception as err:
            print(f"Error in sync cycle: {err}")
        time.sleep(1)

if __name__ == "__main__":
    run_loop()
