/**
 * Theme Transition Utility
 * Provides a smooth full-screen black transition overlay when toggling themes.
 */
export const applyThemeWithTransition = (newTheme: 'light' | 'dark', onComplete?: () => void) => {
  // 1. Inject custom transition styles if not already present
  const styleId = 'theme-transition-styles';
  if (!document.getElementById(styleId)) {
    const style = document.createElement('style');
    style.id = styleId;
    style.innerHTML = `
      @keyframes theme-spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
      .theme-transition-spinner {
        width: 36px;
        height: 36px;
        border: 3px solid rgba(255, 255, 255, 0.1);
        border-top: 3px solid #6366f1; /* Beautiful Indigo */
        border-radius: 50%;
        animation: theme-spin 0.8s linear infinite;
        box-shadow: 0 0 15px rgba(99, 102, 241, 0.3);
      }
    `;
    document.head.appendChild(style);
  }

  // 2. Create the full-screen overlay
  const overlay = document.createElement('div');
  overlay.id = 'theme-transition-overlay';
  
  // Set inline styles for absolute black full-screen coverage
  Object.assign(overlay.style, {
    position: 'fixed',
    top: '0',
    left: '0',
    width: '100vw',
    height: '100vh',
    backgroundColor: '#000000',
    zIndex: '999999',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    opacity: '0',
    transition: 'opacity 0.2s ease-in-out',
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    pointerEvents: 'all',
  });

  // 3. Add spinner element
  const spinner = document.createElement('div');
  spinner.className = 'theme-transition-spinner';
  spinner.style.marginBottom = '20px';

  // 4. Add loading text element
  const text = document.createElement('div');
  text.innerText = newTheme === 'dark' ? 'Loading Dark Theme...' : 'Loading Light Theme...';
  Object.assign(text.style, {
    color: '#ffffff',
    fontSize: '15px',
    fontWeight: '550',
    letterSpacing: '0.05em',
  });

  overlay.appendChild(spinner);
  overlay.appendChild(text);
  document.body.appendChild(overlay);

  // 5. Fade in the overlay
  requestAnimationFrame(() => {
    overlay.style.opacity = '1';
  });

  // 6. Wait for 500ms (0.5s) then apply the theme changes
  setTimeout(() => {
    // Write new theme to localStorage
    localStorage.setItem('theme', newTheme);
    
    // Toggle DOM class
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    
    // Dispatch event to sync state across other parts of the application
    window.dispatchEvent(new Event('storage'));

    // Trigger state callbacks inside React
    if (onComplete) {
      onComplete();
    }

    // 7. Fade out the overlay
    overlay.style.opacity = '0';
    
    // 8. Clean up overlay from DOM after fade out completes (200ms)
    setTimeout(() => {
      if (document.body.contains(overlay)) {
        document.body.removeChild(overlay);
      }
    }, 200);
  }, 500);
};
