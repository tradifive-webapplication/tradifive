import React, { useState, useEffect } from 'react';
import { Joyride, CallBackProps, STATUS, Step } from 'react-joyride';

export default function TradiFiveTour() {
  const [run, setRun] = useState(false);

  useEffect(() => {
    // Check if the user has already completed the tour
    const hasCompletedTour = localStorage.getItem('fialgo_tour_completed');
    if (!hasCompletedTour) {
      // Small delay to ensure the DOM is fully mounted
      const timer = setTimeout(() => {
        setRun(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleJoyrideCallback = (data: CallBackProps) => {
    const { status } = data;
    const finishedStatuses: string[] = [STATUS.FINISHED, STATUS.SKIPPED];
    
    if (finishedStatuses.includes(status as any)) {
      setRun(false);
      localStorage.setItem('fialgo_tour_completed', 'true');
    }
  };

  const steps: Step[] = [
    {
      target: 'body',
      content: (
        <div>
          <h2 className="text-xl font-bold mb-2">Welcome to TradiFive! 🎉</h2>
          <p className="text-sm text-slate-300">Let's take a quick 1-minute tour to help you get the most out of your new trading hub.</p>
        </div>
      ),
      placement: 'center',
      disableBeacon: true,
    },
    {
      target: '#tour-nav-dashboard',
      content: (
        <div>
          <h3 className="font-bold mb-1">Your Command Center</h3>
          <p className="text-xs text-slate-300">Access your Dashboard, Discover feeds, and your Trading Journal from this main navigation menu.</p>
        </div>
      ),
      placement: 'right',
    },
    {
      target: '#tour-nav-ai-coach',
      content: (
        <div>
          <h3 className="font-bold mb-1 text-[#00E5FF]">Meet your AI Coach</h3>
          <p className="text-xs text-slate-300">Chat with our powerful AI for instant market insights, strategy analysis, and personalized performance reviews.</p>
        </div>
      ),
      placement: 'right',
    },
    {
      target: '#tour-nav-risk-guard',
      content: (
        <div>
          <h3 className="font-bold mb-1 text-rose-400">Risk Guard</h3>
          <p className="text-xs text-slate-300">Discipline is key. Protect your capital by setting daily loss limits that automatically lock you out if you start to tilt.</p>
        </div>
      ),
      placement: 'right',
    },
    {
      target: '#tour-nav-competitions',
      content: (
        <div>
          <h3 className="font-bold mb-1 text-yellow-400">Competitions & Rewards</h3>
          <p className="text-xs text-slate-300">Join trading competitions, climb the leaderboard, and earn rewards for your consistency and discipline.</p>
        </div>
      ),
      placement: 'right',
    },
    {
      target: '#tour-collapse-btn',
      content: (
        <div>
          <h3 className="font-bold mb-1">Deep Focus Mode</h3>
          <p className="text-xs text-slate-300">Need to focus? Collapse the sidebar to remove distractions and get a sleek, immersive edge-to-edge view.</p>
        </div>
      ),
      placement: 'right',
    },
    {
      target: '#tour-pro-card',
      content: (
        <div>
          <h3 className="font-bold mb-1 text-violet-400">Ready for more?</h3>
          <p className="text-xs text-slate-300">Unlock advanced metrics, elite copy-trading, and deeper AI insights by upgrading your account.</p>
        </div>
      ),
      placement: 'right',
    }
  ];

  return (
    <Joyride
      steps={steps}
      run={run}
      continuous={true}
      scrollToFirstStep={true}
      showProgress={true}
      showSkipButton={true}
      callback={handleJoyrideCallback}
      styles={{
        options: {
          arrowColor: '#1E1E1E',
          backgroundColor: '#1E1E1E',
          overlayColor: 'rgba(0, 0, 0, 0.7)',
          primaryColor: '#3B82F6',
          textColor: '#FFFFFF',
          zIndex: 10000,
        },
        tooltipContainer: {
          textAlign: 'left',
          fontFamily: '"Inter", sans-serif',
          borderRadius: '16px',
        },
        buttonNext: {
          backgroundColor: '#3B82F6',
          borderRadius: '8px',
          fontWeight: 600,
          padding: '8px 16px',
        },
        buttonBack: {
          color: '#94A3B8',
          marginRight: '8px',
        },
        buttonSkip: {
          color: '#94A3B8',
          fontWeight: 500,
        }
      }}
    />
  );
}
