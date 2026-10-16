// ============================================================
// NikNote 4.0 — App Entry (SAFE — reverted to working base)
// ============================================================

import { useEffect, lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { PremiumProvider } from "@/contexts/PremiumContext";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { InstallBanner } from "@/components/InstallBanner";
import { ShareButtons } from "@/components/promotion/ShareButtons";
import { HandwritingDNAProvider } from "@/contexts/HandwritingDNAContext";
// Home (editor + landing) stays eager so "/" has no lazy-load waterfall;
// every other route is code-split (Frontend Developer agent: lazy loading)
import Index from "./pages/Index";
const Welcome = lazy(() => import("./pages/Welcome"));
const NotFound = lazy(() => import("./pages/NotFound"));
const AuthPage = lazy(() => import("@/components/auth/AuthPage").then(m => ({ default: m.AuthPage })));
const Login = lazy(() => import("./pages/Login"));
const Signup = lazy(() => import("./pages/Signup"));
const Upgrade = lazy(() => import("./pages/Upgrade"));
const Payment = lazy(() => import("./pages/Payment"));
const Admin = lazy(() => import("./pages/Admin"));
const AdminPanelNikhil = lazy(() => import("./pages/AdminPanelNikhil"));
const AdminLogin = lazy(() => import("./pages/AdminLogin"));
const History = lazy(() => import("./pages/History"));
const Account = lazy(() => import("./pages/Account"));
const Achievements = lazy(() => import("./pages/Achievements"));
const MyNotebooks = lazy(() => import("./pages/MyNotebooks"));
const PremiumLanding = lazy(() => import("./pages/PremiumLanding"));
const Onboarding = lazy(() => import("./pages/Onboarding"));

// Lazy load heavy/new pages — if they crash, main app stays alive
const AISolverPage = lazy(() =>
  import("@/components/ai/AISolverPage").then(m => ({ default: m.AISolverPage }))
);
const AI4Page = lazy(() =>
  import("@/components/ai4/AI4Page").then(m => ({ default: m.AI4Page }))
);
const DocumentIntelligence = lazy(() =>
  import("@/components/document-intelligence/DocumentIntelligence").then(m => ({ default: m.default }))
);
const QAPage = lazy(() =>
  import("@/pages/QA").then(m => ({ default: m.default }))
);
const BlogPage = lazy(() =>
  import("@/pages/Blog").then(m => ({ default: m.default }))
);
const B2BPage = lazy(() =>
  import("@/pages/B2BLanding").then(m => ({ default: m.default }))
);
const FeedbackPage = lazy(() =>
  import("@/pages/Feedback").then(m => ({ default: m.default }))
);

// Simple page loader
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen bg-white">
    <div className="text-center">
      <div className="text-2xl mb-3">✍️</div>
      <div className="text-sm text-gray-400">Loading...</div>
    </div>
  </div>
);

import { registerServiceWorker } from "@/hooks/useServiceWorkerRegistration";
import { checkReferral } from "@/utils/referral";
import { trackPageView } from "@/utils/analytics";

const queryClient = new QueryClient();

const App = () => {
  useEffect(() => {
    document.documentElement.classList.remove("dark");
    localStorage.setItem("theme", "light");
    
    // CRITICAL: Clear ALL stale caches from old SW versions before registering new
    // This prevents "Zap is not defined" crash from stale HTML+JS mismatch
    if (import.meta.env.PROD) {
      // First clear caches, then register new SW
      try {
        if ('caches' in window) {
          caches.keys().then(names => {
            names.forEach(name => {
              // Delete ALL old caches - only keep current version
              if (!name.includes('v5.0.2')) {
                console.log('[App] Purging stale cache:', name);
                caches.delete(name);
              }
            });
          });
        }
      } catch {}
      
      registerServiceWorker();
    }
    
    // Track referral on first visit
    try { checkReferral(); } catch {}
  }, []);

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <PremiumProvider>
            <HandwritingDNAProvider>
              <TooltipProvider>
                <Toaster />
                <Sonner />
                <BrowserRouter>
                  <Suspense fallback={<PageLoader />}>
                    <Routes>
                      <Route path="/" element={<Index />} />
                    <Route path="/app" element={<Navigate to="/" replace />} />
                    <Route path="/welcome" element={<Welcome />} />
                    <Route path="/onboarding" element={<Onboarding />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/signup" element={<Signup />} />
                    <Route path="/auth" element={<AuthPage />} />
                    <Route path="/upgrade" element={<Upgrade />} />
                    <Route path="/payment" element={<Payment />} />
                    <Route path="/admin" element={<Admin />} />
                    <Route path="/admin-login" element={<AdminLogin />} />
                    <Route path="/admin-panel-nikhil" element={<AdminPanelNikhil />} />
                    <Route path="/ai-solver" element={<AISolverPage />} />
                    <Route path="/ai" element={<AI4Page />} />
                    <Route path="/documents" element={<DocumentIntelligence />} />
                    <Route path="/qa" element={<QAPage />} />
                    <Route path="/blog" element={<BlogPage />} />
                    <Route path="/blog/:slug" element={<BlogPage />} />
                    <Route path="/history" element={<History />} />
                    <Route path="/account" element={<Account />} />
                    <Route path="/achievements" element={<Achievements />} />
                    <Route path="/notebooks" element={<MyNotebooks />} />
                    <Route path="/landing" element={<PremiumLanding />} />
                    <Route path="/schools" element={<Suspense fallback={<PageLoader />}><B2BPage /></Suspense>} />
                    <Route path="/institutions" element={<Suspense fallback={<PageLoader />}><B2BPage /></Suspense>} />
                    <Route path="/feedback" element={<Suspense fallback={<PageLoader />}><FeedbackPage /></Suspense>} />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </Suspense>
              </BrowserRouter>
              <InstallBanner />
              <ShareButtons variant="floating" />
            </TooltipProvider>
          </HandwritingDNAProvider>
        </PremiumProvider>
      </AuthProvider>
    </QueryClientProvider>
  </ErrorBoundary>
  );
};

export default App;
