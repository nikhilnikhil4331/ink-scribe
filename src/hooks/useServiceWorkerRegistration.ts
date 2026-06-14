// ============================================================
// Service Worker Registration — Call this in main.tsx
// ============================================================

export function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', async () => {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js', {
          scope: '/',
        });

        // Check for updates every 30 minutes
        setInterval(() => {
          registration.update();
        }, 30 * 60 * 1000);

        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'activated') {
                // New version available — optionally notify user
                console.log('🆕 NikNote updated! Refresh for latest version.');
              }
            });
          }
        });

        console.log('✅ NikNote Service Worker registered');
      } catch (error) {
        console.error('❌ SW registration failed:', error);
      }
    });
  }
}

// Unregister service worker (for development)
export function unregisterServiceWorker() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistrations().then((registrations) => {
      registrations.forEach((reg) => reg.unregister());
    });
  }
}
