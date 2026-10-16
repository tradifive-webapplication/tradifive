# ⚡ Fialgo Connect MT5 Python Bridge

A premium local synchronization bridge that connects your MetaTrader 5 terminal directly to your Fialgo Connect Web App dashboard and journal. 

This bridge runs locally on your Windows machine, reads active balance/equity in real-time, and synchronizes your trade execution history so that all analytics, win rates, and daily profits populate automatically for you and your users.

---

## 🚀 Setup Instructions

### 1. Prerequisites
- **Operating System:** Windows (MetaTrader 5 Python integration is only supported natively on Windows).
- **Python:** Python 3.8 or newer installed on your computer. You can download it from [python.org](https://www.python.org/downloads/).
- **MetaTrader 5 Client:** The MT5 desktop application installed and logged into your trading account.

### 2. Installation
Open your terminal (PowerShell or Command Prompt) and navigate to the `python_bridge` folder:

```powershell
cd c:\Users\nikil\Downloads\fialgo-connect-main\fialgo-connect-main\python_bridge
```

Install the required Python dependencies:
```powershell
pip install -r requirements.txt
```

### 3. Configuration
1. Open the `config.env` file in a text editor.
2. Retrieve your **Activation Key** from the Fialgo Connect web app (go to the **AI Engines / Strategy** page or your **Profile** page and copy your key).
3. Paste the key into the `ACTIVATION_KEY` variable:
   ```env
   ACTIVATION_KEY=TRADIFIVE-YOURKEY-HERE
   ```
4. *Optional:* If your MT5 terminal is already open and logged in, you can leave the `MT5_ACCOUNT`, `MT5_PASSWORD`, and `MT5_SERVER` blank. The script will automatically detect and hook into the active trading session! Otherwise, fill in your credentials to auto-login.

### 4. Running the Sync Engine
Start your MetaTrader 5 desktop application, then run the bridge script:

```powershell
python mt5_sync.py
```

The bridge will establish a secure handshake, sync your historical trades to your Fialgo Journal, and stream your balance and equity every 5 seconds!

---

## 🎨 Features
- **Zero Configuration Hooking:** Automatically detects and connects to your active, running MT5 terminal instance.
- **Historical Backfill:** Syncs your past 100 closed deals automatically upon startup to immediately populate your journal.
- **Live Stream Heartbeats:** Streams active balance, equity, and account details on a 5-second interval.
- **Robust Sync Engine:** Automatically skips duplicate trades (leveraging unique ticket constraints) and gracefully recovers from network/API drops.
- **Console Dashboard:** A premium, colored command-line interface summarizing real-time synchronization status.
