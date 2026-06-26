import { useEffect, lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { PremiumProvider } from "@/contexts/PremiumContext";
import { HandwritingDNAProvider } from "@/contexts/HandwritingDNAContext";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { InstallBanner } from "@/components/InstallBanner";
import { Skeleton } from "@/components/SkeletonLoader";
import Index from "./pages/Index";
import Welcome from "./pages/Welcome";
import NotFound from "./pages/NotFound";
import { AuthPage } from "@/components/auth/AuthPage";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Upgrade from "./pages/Upgrade";
import Payment from "./pages/Payment";
import Admin from "./pages/Admin";
import AdminPanelNikhil from "./pages/AdminPanelNikhil";
import AdminLogin from "./pages/AdminLogin";
import History from "./pages/History";
import Account from "./pages/Account";
import Achievements from "./pages/Achievements";
import MyNotebooks from "./pages/MyNotebooks";
import PremiumLanding from "./pages/PremiumLanding";
import Onboarding from "./pages/Onboarding";
import QA from "./pages/QA";

// Lazy load heavy pages for better performance
const AISolverPage = lazy(() => import("@/components/ai/AISolverPage").then(m => ({ default: m.AISolverPage })));
const AI4Page = lazy(() => import("@/components/ai4/AI4Page").then(m => ({ default: m.AI4Page })));
const DocumentIntelligence = lazy(() => import("@/components/document-intelligence/DocumentIntelligence").then(m => ({ default: m.default })));

// Page loading fallback
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen bg-background">
    <div className="text-center">
      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-3">
        <span className="text-xl">✍️</span>
      </div>
      <Skeleton className="h-4 w-24 mx-auto" />
    </div>
  </div>
);

// Register Service Worker in production
import { registerServiceWorker } from "@/hooks/useServiceWorkerRegistration";

const queryClient = new QueryClient();

const App = () => {
  useEffect(() => {
    document.documentElement.classList.remove("dark");
    localStorage.setItem("theme", "light");

    // Register PWA service worker
    if (import.meta.env.PROD) {
      registerServiceWorker();
    }
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
                    <Route path="/qa" element={<QA />} />
                    <Route path="/history" element={<History />} />
                    <Route path="/account" element={<Account />} />
                    <Route path="/achievements" element={<Achievements />} />
                    <Route path="/notebooks" element={<MyNotebooks />} />
                    <Route path="/landing" element={<PremiumLanding />} />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </Suspense>
              </BrowserRouter>
              <InstallBanner />
            </TooltipProvider>
            </HandwritingDNAProvider>
          </PremiumProvider>
        </AuthProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

export default App;
