// ============================================================
// Service Worker Registration — Call this in main.tsx
// ============================================================

export function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    // CRITICAL: First, force-unregister any old service worker
    // This prevents stale cached HTML/JS from crashing the app
    navigator.serviceWorker.getRegistrations().then((registrations) => {
      registrations.forEach((reg) => {
        // Check if it's an old NikNote SW (v4 or earlier)
        // Force update: unregister old, register new
        const oldScope = reg.scope;
        console.log('[App] Found existing SW:', oldScope, 'updating...');
        // Unregister to force fresh start
        reg.unregister().then(() => {
          console.log('[App] Old SW unregistered, will register new one');
          registerNewSW();
        });
      });
      // If no existing SW, register new one directly
      if (registrations.length === 0) {
        registerNewSW();
      }
    }).catch(() => {
      // If getRegistrations fails, just try registering anyway
      registerNewSW();
    });

    // Also clear ALL caches from previous versions
    if ('caches' in window) {
      caches.keys().then((names) => {
        names.forEach((name) => {
          if (!name.includes('v5.0.2')) {
            console.log('[App] Deleting old cache:', name);
            caches.delete(name);
          }
        });
      }).catch(() => {});
    }
  }
}

function registerNewSW() {
  navigator.serviceWorker.register('/sw.js', {
    scope: '/',
  }).then((registration) => {
    console.log('✅ NikNote SW v5.0.2 registered');

    // Force update check immediately
    registration.update();

    // Check for updates every 30 minutes
    setInterval(() => {
      registration.update();
    }, 30 * 60 * 1000);

    registration.addEventListener('updatefound', () => {
      const newWorker = registration.installing;
      if (newWorker) {
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'activated') {
            console.log('🆕 NikNote updated! Fresh version active.');
          }
        });
      }
    });
  }).catch((error) => {
    console.warn('⚠️ SW registration failed (non-critical):', error);
    // App works fine without SW, just no offline support
  });
}

// Unregister service worker (for development)
export function unregisterServiceWorker() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistrations().then((registrations) => {
      registrations.forEach((reg) => reg.unregister());
    });
  }
}
