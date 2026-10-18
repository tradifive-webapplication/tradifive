@echo off
title FiAlgo MT5 Continuous Real-Time Bridge (1-Second Heartbeat)
cd /d "%~dp0"
echo ==========================================================
echo Starting FiAlgo MT5 Real-Time Sync Bridge...
echo Webhook: https://rylwyxhupwpwsdbvuoej.supabase.co/functions/v1/mt5-webhook
echo Target: MT5 Exness Terminal #414460525
echo ==========================================================
python python_bridge\continuous_mt5_bridge.py
pause
