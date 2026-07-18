import os
import sys
import time
from datetime import datetime, timedelta
import requests
import MetaTrader5 as mt5
from dotenv import load_dotenv
from colorama import init, Fore, Style

# Safe Windows stdout reconfiguration for UTF-8 encoding support
if sys.platform.startswith('win'):
    try:
        sys.stdout.reconfigure(encoding='utf-8')
        sys.stderr.reconfigure(encoding='utf-8')
    except Exception:
        pass

# Initialize colorama for colored console output
init(autoreset=True)

# Define premium color templates
INFO = f"{Fore.CYAN}[INFO]{Style.RESET_ALL} "
SUCCESS = f"{Fore.GREEN}[SUCCESS]{Style.RESET_ALL} "
ERROR = f"{Fore.RED}[ERROR]{Style.RESET_ALL} "
WARNING = f"{Fore.YELLOW}[WARNING]{Style.RESET_ALL} "
SYNC = f"{Fore.MAGENTA}[SYNC]{Style.RESET_ALL} "

class AuthException(Exception):
    """Exception raised when Supabase Auth fails or token expires"""
    pass

def print_banner():
    banner = f"""
{Fore.BLUE}====================================================================
            [+] FIALGO CONNECT - MT5 PYTHON BRIDGE [+]
        Premium Local Account & Trade Synchronization Engine
===================================================================={Style.RESET_ALL}
"""
    print(banner)

def load_config():
    """Load configuration from config.env"""
    env_path = os.path.join(os.path.dirname(__file__), 'config.env')
    if not os.path.exists(env_path):
        print(f"{ERROR}config.env file not found at: {env_path}")
        print(f"{INFO}Please copy config.env from the project template and try again.")
        sys.exit(1)

    load_dotenv(env_path)
    
    email = os.getenv("FIALGO_EMAIL")
    password = os.getenv("FIALGO_PASSWORD")
    activation_key = os.getenv("ACTIVATION_KEY")
    webhook_url = os.getenv("WEBHOOK_URL")
    
    # Validation: Must set either Premium Auth or Activation Key
    has_premium_auth = email and email != "PASTE_YOUR_FIALGO_LOGIN_EMAIL_HERE" and password and password != "PASTE_YOUR_FIALGO_LOGIN_PASSWORD_HERE"
    has_activation_key = activation_key and activation_key.strip() != ""
    
    if not has_premium_auth and not has_activation_key:
        print(f"{ERROR}No Authentication configured in config.env!")
        print(f"{INFO}Please open config.env and set either:")
        print(f"       1. Premium Auth: FIALGO_EMAIL and FIALGO_PASSWORD (Recommended)")
        print(f"       2. Fallback Key: ACTIVATION_KEY")
        sys.exit(1)
        
    if not webhook_url:
        print(f"{ERROR}WEBHOOK_URL is not configured in config.env!")
        sys.exit(1)

    return {
        "email": email if has_premium_auth else None,
        "password": password if has_premium_auth else None,
        "activation_key": activation_key if has_activation_key else None,
        "webhook_url": webhook_url,
        "account": os.getenv("MT5_ACCOUNT"),
        "password_mt5": os.getenv("MT5_PASSWORD"),
        "server_mt5": os.getenv("MT5_SERVER"),
        "sync_interval": int(os.getenv("SYNC_INTERVAL", 5))
    }

def get_supabase_jwt(config):
    """Authenticate with Supabase Auth API using Fialgo Connect credentials and retrieve JWT"""
    if not config["email"] or not config["password"]:
        return None
        
    print(f"{INFO}Authenticating securely with Fialgo Connect Cloud ({config['email']})...")
    
    # Public anonymous key for your Supabase project (needed for client login)
    anon_key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ5bHd5eGh1cHdwd3NkYnZ1b2VqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY0MzI1NTcsImV4cCI6MjA5MjAwODU1N30.xuRj9PZgZys2b64pNnjhXOVyDjtGVFlBno2o9hiisHA"
    auth_url = "https://rylwyxhupwpwsdbvuoej.supabase.co/auth/v1/token?grant_type=password"
    
    headers = {
        "apikey": anon_key,
        "Content-Type": "application/json"
    }
    payload = {
        "email": config["email"],
        "password": config["password"]
    }
    
    try:
        res = requests.post(auth_url, json=payload, headers=headers, timeout=10)
        if res.status_code == 200:
            data = res.json()
            print(f"{SUCCESS}Fialgo Connect Authentication Successful!")
            return data["access_token"]
        else:
            print(f"{ERROR}Authentication Rejected! Status Code: {res.status_code}")
            print(f"       Details: {res.text}")
            raise AuthException("Invalid login credentials")
    except Exception as e:
        print(f"{ERROR}Network failure during Fialgo Cloud login: {e}")
        raise AuthException(str(e))

def connect_to_mt5(config):
    """Initialize connection with MetaTrader 5"""
    print(f"{INFO}Initializing MetaTrader 5 terminal link...")
    
    # Initialize MT5
    if not mt5.initialize():
        print(f"{ERROR}MetaTrader5 initialization failed! error code: {mt5.last_error()}")
        print(f"{WARNING}Please ensure the MetaTrader 5 client is installed and running on your computer.")
        sys.exit(1)
        
    print(f"{SUCCESS}MetaTrader 5 library linked successfully.")

    # Attempt logging in if credentials are provided
    if config["account"]:
        print(f"{INFO}Attempting to log into MT5 account {config['account']}...")
        account = int(config["account"])
        password = config["password_mt5"]
        server = config["server_mt5"]
        
        login_success = mt5.login(account, password=password, server=server)
        if not login_success:
            print(f"{ERROR}Failed to log into MT5 account {account}. error code: {mt5.last_error()}")
            mt5.shutdown()
            sys.exit(1)
        print(f"{SUCCESS}Successfully logged in.")
    else:
        # Otherwise, hook into the already active terminal session
        print(f"{INFO}No credentials provided. Hooking into the active MT5 terminal session...")

    # Fetch active account info
    acc_info = mt5.account_info()
    if acc_info is None:
        print(f"{ERROR}Could not retrieve MT5 active account information. error code: {mt5.last_error()}")
        mt5.shutdown()
        sys.exit(1)
        
    print(f"\n{Fore.GREEN}================== CONNECTED TRADING STATUS ==================")
    print(f" * Account Number : {acc_info.login}")
    print(f" * Broker Server   : {acc_info.server}")
    print(f" * Broker Company  : {acc_info.company}")
    print(f" * Account Currency: {acc_info.currency}")
    print(f" * Current Balance : {acc_info.balance:.2f} {acc_info.currency}")
    print(f" * Current Equity  : {acc_info.equity:.2f} {acc_info.currency}")
    print(f"{Fore.GREEN}==============================================================")
    
    return acc_info

def sync_live_metrics(config, acc_info, jwt_token=None):
    """Sync live account balance and equity to the Supabase Webhook"""
    # Fetch currently active positions from MT5
    positions = mt5.positions_get()
    pos_tickets = []
    if positions:
        pos_tickets = [str(pos.ticket) for pos in positions]

    # Fetch currently active pending orders from MT5
    orders = mt5.orders_get()
    pending_tickets = []
    if orders:
        pending_tickets = [str(order.ticket) for order in orders]

    payload = {
        "action": "metrics_sync",
        "account_number": str(acc_info.login),
        "broker": acc_info.company,
        "balance": acc_info.balance,
        "equity": acc_info.equity,
        "active_position_tickets": pos_tickets,
        "active_pending_tickets": pending_tickets
    }
    
    # Add activation key as fallback if not authenticated via JWT
    if not jwt_token and config["activation_key"]:
        payload["activation_key"] = config["activation_key"]
        
    headers = {}
    if jwt_token:
        headers["Authorization"] = f"Bearer {jwt_token}"
        
    try:
        response = requests.post(config["webhook_url"], json=payload, headers=headers, timeout=10)
        if response.status_code == 200:
            print(f"{SYNC}Live Metrics Streamed | Balance: {Fore.GREEN}${acc_info.balance:,.2f}{Style.RESET_ALL} | Equity: {Fore.GREEN}${acc_info.equity:,.2f}{Style.RESET_ALL} (Handshake OK)")
            return True
        elif response.status_code == 401:
            print(f"{WARNING}Session token expired or unauthorized.")
            raise AuthException("Session expired")
        else:
            print(f"{ERROR}Metrics Sync rejected by Webhook! Status Code: {response.status_code}. Response: {response.text}")
            return False
    except AuthException:
        raise
    except Exception as e:
        print(f"{ERROR}Failed to stream metrics to Fialgo Cloud: {e}")
        return False

def sync_trades(config, acc_info, synced_tickets, jwt_token=None):
    """Sync closed trades (deals) from the inception of the account to Supabase"""
    # Define time boundary for syncing - from year 2015 to fetch full account history!
    from_date = datetime(2015, 1, 1)
    to_date = datetime.now() + timedelta(days=1)
    
    # Query history deals
    deals = mt5.history_deals_get(from_date, to_date)
    
    if deals is None:
        print(f"{ERROR}Could not retrieve historical deals from MT5: {mt5.last_error()}")
        return 0

    new_trades_count = 0
    
    for deal in deals:
        ticket = str(deal.position_id) if getattr(deal, 'position_id', 0) > 0 else str(deal.ticket)
        
        # Skip if already synced in this session
        if ticket in synced_tickets:
            continue
            
        # We only care about DEAL_ENTRY_OUT (1) and DEAL_ENTRY_INOUT (2)
        # Because DEAL_ENTRY_IN (0) is a position opening (no profit/loss realized yet)
        if deal.entry not in [mt5.DEAL_ENTRY_OUT, mt5.DEAL_ENTRY_INOUT]:
            continue
            
        # We will calculate total realized net profit accurately using all position deals
        
        # Translate deal type: 0 = Buy, 1 = Sell
        trade_type_str = "BUY" if deal.type == mt5.DEAL_TYPE_BUY else "SELL"
        
        # Get entry time, prices, and sum up all commissions/fees from all deals for this position
        entry_time = 0
        entry_price = 0.0
        sl = 0.0
        tp = 0.0
        
        total_commission = deal.commission
        total_swap = deal.swap
        total_fee = getattr(deal, 'fee', 0.0)
        
        if getattr(deal, 'position_id', 0) > 0:
            pos_deals = mt5.history_deals_get(position=deal.position_id)
            if pos_deals:
                total_commission = sum(d.commission for d in pos_deals)
                total_swap = sum(d.swap for d in pos_deals)
                total_fee = sum(getattr(d, 'fee', 0.0) for d in pos_deals)
                
                entry_deals = [d for d in pos_deals if d.entry == mt5.DEAL_ENTRY_IN]
                if entry_deals:
                    entry_time = entry_deals[0].time
                    entry_price = entry_deals[0].price
            
            # Calculate total net profit including all summed costs
            net_profit = deal.profit + total_swap + total_commission + total_fee
            
            # Fetch Stop Loss (sl) and Take Profit (tp) from orders associated with this position
            pos_orders = mt5.history_orders_get(position=deal.position_id)
            if pos_orders:
                for order in pos_orders:
                    if order.sl > 0:
                        sl = order.sl
                    if order.tp > 0:
                        tp = order.tp

        # Fetch real M1 candles for this trade
        candles_json = None
        if entry_time > 0 and deal.time > entry_time:
            start_sync_time = max(entry_time, deal.time - 100 * 60)
            rates = mt5.copy_rates_range(deal.symbol, mt5.TIMEFRAME_M1, datetime.fromtimestamp(start_sync_time), datetime.fromtimestamp(deal.time))
            if rates is not None and len(rates) > 0:
                rates_list = []
                for r in rates:
                    rates_list.append({
                        "time": int(r['time']),
                        "open": float(r['open']),
                        "high": float(r['high']),
                        "low": float(r['low']),
                        "close": float(r['close'])
                    })
                import json
                candles_json = json.dumps(rates_list)

        # Prepare trade sync payload
        payload = {
            "ticket": ticket,
            "symbol": deal.symbol,
            "trade_type": trade_type_str,
            "lot_size": deal.volume,
            "profit": net_profit,
            "opened_at_sec": entry_time,
            "closed_at_sec": deal.time,
            "open_price": entry_price,
            "close_price": deal.price,
            "stop_loss": sl,
            "take_profit": tp,
            "commission": total_commission,
            "swap": total_swap,
            "fee": total_fee,
            "entry_reason": candles_json
        }
        
        # Add activation key as fallback if not authenticated via JWT
        if not jwt_token and config["activation_key"]:
            payload["activation_key"] = config["activation_key"]
            
        headers = {}
        if jwt_token:
            headers["Authorization"] = f"Bearer {jwt_token}"
            
        try:
            response = requests.post(config["webhook_url"], json=payload, headers=headers, timeout=10)
            if response.status_code == 200:
                print(f"{SUCCESS}Successfully Synced Trade Ticket {Fore.YELLOW}#{ticket}{Style.RESET_ALL} | Symbol: {deal.symbol} | Profit: {Fore.GREEN if net_profit >= 0 else Fore.RED}${net_profit:,.2f}{Style.RESET_ALL}")
                synced_tickets.add(ticket)
                new_trades_count += 1
            elif response.status_code == 401:
                print(f"{WARNING}Session token expired or unauthorized.")
                raise AuthException("Session expired")
            else:
                # If duplicate already synced, just add it to synced list and ignore
                if "already synced" in response.text.lower() or response.status_code == 409:
                    synced_tickets.add(ticket)
                else:
                    print(f"{ERROR}Trade {ticket} rejected by Webhook! Code: {response.status_code}. Response: {response.text}")
        except AuthException:
            raise
        except Exception as e:
            print(f"{ERROR}Network failure syncing trade {ticket}: {e}")
            
    return new_trades_count

def sync_open_positions(config, acc_info, synced_tickets, jwt_token=None):
    """Sync current open positions to Supabase"""
    positions = mt5.positions_get()
    if positions is None:
        return 0

    new_pos_count = 0
    for pos in positions:
        ticket = str(pos.ticket)
        
        trade_type_str = "BUY" if pos.type == mt5.POSITION_TYPE_BUY else "SELL"
        
        # Fetch sum of commissions and fees from the IN deal for this open position
        total_commission = getattr(pos, 'commission', 0.0)
        total_fee = getattr(pos, 'fee', 0.0)
        pos_deals = mt5.history_deals_get(position=pos.ticket)
        if pos_deals:
            total_commission = sum(d.commission for d in pos_deals)
            total_fee = sum(getattr(d, 'fee', 0.0) for d in pos_deals)

        # Calculate current floating net profit
        net_profit = pos.profit + pos.swap + total_commission + total_fee
        
        # Fetch real M1 candles for open position
        candles_json = None
        if pos.time > 0:
            now_ts = int(datetime.now().timestamp())
            start_sync_time = max(pos.time, now_ts - 100 * 60)
            rates = mt5.copy_rates_range(pos.symbol, mt5.TIMEFRAME_M1, datetime.fromtimestamp(start_sync_time), datetime.now())
            if rates is not None and len(rates) > 0:
                rates_list = []
                for r in rates:
                    rates_list.append({
                        "time": int(r['time']),
                        "open": float(r['open']),
                        "high": float(r['high']),
                        "low": float(r['low']),
                        "close": float(r['close'])
                    })
                import json
                candles_json = json.dumps(rates_list)

        payload = {
            "ticket": ticket,
            "symbol": pos.symbol,
            "trade_type": trade_type_str,
            "lot_size": pos.volume,
            "profit": net_profit,
            "opened_at_sec": pos.time,
            "closed_at_sec": 0,
            "open_price": pos.price_open,
            "close_price": pos.price_current,
            "stop_loss": pos.sl,
            "take_profit": pos.tp,
            "commission": total_commission,
            "swap": pos.swap,
            "fee": total_fee,
            "entry_reason": candles_json
        }
        
        if not jwt_token and config["activation_key"]:
            payload["activation_key"] = config["activation_key"]
            
        headers = {}
        if jwt_token:
            headers["Authorization"] = f"Bearer {jwt_token}"
            
        try:
            response = requests.post(config["webhook_url"], json=payload, headers=headers, timeout=10)
            if response.status_code == 200:
                print(f"{SUCCESS}Successfully Synced Open Position {Fore.YELLOW}#{ticket}{Style.RESET_ALL} | Symbol: {pos.symbol} | Floating: {Fore.GREEN if net_profit >= 0 else Fore.RED}${net_profit:,.2f}{Style.RESET_ALL}")
                new_pos_count += 1
            elif response.status_code == 401:
                raise AuthException("Session expired")
            else:
                print(f"{ERROR}Open Position {ticket} rejected by Webhook! Code: {response.status_code}. Response: {response.text}")
        except AuthException:
            raise
        except Exception as e:
            print(f"{ERROR}Network failure syncing open position {ticket}: {e}")
            
def sync_pending_orders(config, acc_info, synced_tickets, jwt_token=None):
    """Sync current pending orders to Supabase"""
    orders = mt5.orders_get()
    if orders is None:
        return 0

    new_order_count = 0
    for order in orders:
        ticket = str(order.ticket)
        
        # Determine BUY or SELL type for pending orders
        # 2 = Buy Limit, 3 = Sell Limit, 4 = Buy Stop, 5 = Sell Stop, etc.
        trade_type_str = "BUY" if order.type in [2, 4, 6] else "SELL"
        
        payload = {
            "ticket": ticket,
            "symbol": order.symbol,
            "trade_type": trade_type_str,
            "lot_size": order.volume_current,
            "profit": 0, # Pending orders have no realized/floating profit
            "opened_at_sec": order.time_setup,
            "closed_at_sec": 0,
            "is_pending": True
        }
        
        if not jwt_token and config["activation_key"]:
            payload["activation_key"] = config["activation_key"]
            
        headers = {}
        if jwt_token:
            headers["Authorization"] = f"Bearer {jwt_token}"
            
        try:
            response = requests.post(config["webhook_url"], json=payload, headers=headers, timeout=10)
            if response.status_code == 200:
                print(f"{SUCCESS}Successfully Synced Pending Order {Fore.YELLOW}#{ticket}{Style.RESET_ALL} | Symbol: {order.symbol} | Lots: {order.volume_current:.2f}")
                new_order_count += 1
            elif response.status_code == 401:
                raise AuthException("Session expired")
            else:
                print(f"{ERROR}Pending Order {ticket} rejected by Webhook! Code: {response.status_code}. Response: {response.text}")
        except AuthException:
            raise
        except Exception as e:
            print(f"{ERROR}Network failure syncing pending order {ticket}: {e}")
            
    return new_order_count

def main():
    print_banner()
    config = load_config()
    
    # Establish connection with MT5 client
    acc_info = connect_to_mt5(config)
    
    # Store set of already synced ticket numbers to avoid redundant API calls
    synced_tickets = set()
    
    # Authenticate to get JWT token if using Premium Auth
    jwt_token = None
    if config["email"]:
        try:
            jwt_token = get_supabase_jwt(config)
        except Exception as e:
            print(f"{ERROR}Failed initial authentication: {e}")
            mt5.shutdown()
            sys.exit(1)
            
    # 1. Perform initial trade history backfill
    print(f"\n{INFO}Initializing historical trade sync (full account history)...")
    try:
        initial_sync_count = sync_trades(config, acc_info, synced_tickets, jwt_token)
        print(f"{SUCCESS}Initial backfill done. Synced {initial_sync_count} past trades.")
    except AuthException:
        # Retry authentication once
        print(f"{WARNING}Handshake expired during backfill. Attempting session refresh...")
        jwt_token = get_supabase_jwt(config)
        initial_sync_count = sync_trades(config, acc_info, synced_tickets, jwt_token)
        print(f"{SUCCESS}Initial backfill done. Synced {initial_sync_count} past trades.")
    
    # 2. Main background loop for live updates
    print(f"\n{INFO}Starting background sync service (syncing every {config['sync_interval']} seconds)...")
    print(f"       Press {Fore.RED}Ctrl + C{Style.RESET_ALL} to gracefully terminate the bridge.\n")
    
    try:
        while True:
            # Refresh account info
            acc_info = mt5.account_info()
            if acc_info is None:
                print(f"{ERROR}Lost link with MT5 terminal! Attempting to reconnect...")
                time.sleep(3)
                if mt5.initialize():
                    acc_info = mt5.account_info()
                continue
                
            try:
                # Stream live metrics (balance/equity)
                sync_live_metrics(config, acc_info, jwt_token)
                
                # Sync open positions
                sync_open_positions(config, acc_info, synced_tickets, jwt_token)
                
                # Sync pending orders
                sync_pending_orders(config, acc_info, synced_tickets, jwt_token)
                
                # Sync any newly executed closed trades
                sync_trades(config, acc_info, synced_tickets, jwt_token)
                
            except AuthException:
                # Self-healing token refresh block!
                print(f"\n{WARNING}Session token expired. Re-authenticating automatically...")
                try:
                    jwt_token = get_supabase_jwt(config)
                    print(f"{SUCCESS}Re-authentication successful. Resuming sync loop.\n")
                except Exception as e:
                    print(f"{ERROR}Self-healing authentication failed: {e}. Will retry in 10s...")
                    time.sleep(10)
            
            time.sleep(config["sync_interval"])
            
    except KeyboardInterrupt:
        print(f"\n{WARNING}Service termination signal received.")
    finally:
        # Graceful shutdown
        print(f"{INFO}Disconnecting MetaTrader 5 terminal link...")
        mt5.shutdown()
        print(f"{SUCCESS}Sync service stopped gracefully. See you next session!")

if __name__ == "__main__":
    main()
