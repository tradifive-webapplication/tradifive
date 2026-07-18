import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Cpu, ShieldAlert, BookOpen, Trophy, Check, RefreshCw } from 'lucide-react';

import { useTrading } from '@/contexts/TradingContext';
import { TerminalState } from '@/hooks/useMockTrading';
import { triggerCustomNotification } from './CustomNotification';

export const TerminalModeController = () => {
  const { terminalState, updateTerminalMode } = useTrading();
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'updated'>('idle');

  const modes = [
    { id: 'algoEngine', label: 'Algo Engine', icon: Cpu, color: 'text-slate-200', bg: 'bg-blue-50' },
  ] as const;

  const handleToggle = (mode: keyof TerminalState) => {
    updateTerminalMode(mode);
    setSyncStatus('syncing');

    const modeObj = modes.find(m => m.id === mode);
    const willBeActive = !terminalState[mode];

    if (willBeActive) {
      triggerCustomNotification({
        title: `${modeObj?.label} Active`,
        message: `Terminal assignment synchronized. ${modeObj?.label} is now running in the background.`,
        type: 'success',
        duration: 7
      });
    } else {
      triggerCustomNotification({
        title: `${modeObj?.label} Paused`,
        message: `Terminal assignment has been paused successfully.`,
        type: 'error',
        duration: 12,
        onAction: () => updateTerminalMode(mode),
        actionLabel: 'Accept'
      });
    }
  };

  // Sync Simulation Effect
  useEffect(() => {
    if (syncStatus === 'syncing') {
      const timer = setTimeout(() => {
        setSyncStatus('updated');

        // Mock EA Payload Logging
        const activeModes = Object.entries(terminalState)
          .filter(([_, val]) => val)
          .map(([key, _]) => key);

        console.log('>>> [MT5 EA SYNC PAYLOAD]', {
          timestamp: new Date().toISOString(),
          active_modes: activeModes,
          payload: {
            algo_enabled: terminalState.algoEngine,
            risk_shield_active: terminalState.riskGuard,
            journal_sync: terminalState.journal,
            comp_mode: terminalState.competitions
          }
        });
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [syncStatus, terminalState]);

  return (
    <div className="bg-white dark:bg-[#1E1E1E] rounded-2xl w-full border border-slate-100 dark:border-[#333333] p-5 shadow-[0_10px_30px_rgba(0,0,0,0.03)]">
      <div className="mb-6">
        <h2 className="text-[18px] font-bold text-slate-900 dark:text-slate-200 tracking-tight leading-none mb-1">Terminal Assignment</h2>
        <p className="text-[12px] text-slate-500 font-medium">Select the active mode for your MT5 Master EA.</p>
      </div>

      <div className="space-y-3">
        {modes.map((mode) => {
          const isActive = terminalState[mode.id];
          return (
            <div
              key={mode.id}
              className={`w-full group relative flex items-center justify-between px-6 py-4 rounded-xl transition-all duration-300 border ${isActive
                ? 'bg-white dark:bg-[#1E1E1E] border-blue-500/20 shadow-[0_5px_15px_rgba(59,130,246,0.05)]'
                : 'bg-slate-50/50 border-slate-100 dark:border-[#333333] hover:bg-white dark:bg-[#1E1E1E] hover:border-slate-200 dark:border-[#333333]'
                }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-300 ${isActive ? mode.bg + ' ' + mode.color : 'bg-slate-100 dark:bg-[#1E1E1E] text-slate-400'}`}>
                  <mode.icon size={18} />
                </div>
                <span className={`text-[12px] font-bold uppercase tracking-tight transition-all duration-300 ${isActive ? 'text-slate-700' : 'text-slate-400'}`}>
                  {mode.label}
                </span>
              </div>

              {/* Dual Indicator Mechanical Switch */}
              <div className="dual-switch-container" onClick={(e) => e.stopPropagation()}>
                <input
                  type="checkbox"
                  className="togglesw"
                  id={`switch-${mode.id}`}
                  checked={isActive}
                  onChange={() => handleToggle(mode.id)}
                />
                <label className="dual-switch" htmlFor={`switch-${mode.id}`}>
                  <div className="indicator left"></div>
                  <div className="indicator right"></div>
                  <div className="dual-button"></div>
                </label>
              </div>
            </div>
          );
        })}
      </div>



    </div>
  );
};

export default TerminalModeController;



