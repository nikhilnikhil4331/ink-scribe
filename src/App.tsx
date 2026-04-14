import { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { PremiumProvider } from "@/contexts/PremiumContext";
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
import { AISolverPage } from "@/components/ai/AISolverPage";
import History from "./pages/History";
import Account from "./pages/Account";
import Achievements from "./pages/Achievements";
import MyNotebooks from "./pages/MyNotebooks";
import PremiumLanding from "./pages/PremiumLanding";
import Onboarding from "./pages/Onboarding";

const queryClient = new QueryClient();

const App = () => {
  useEffect(() => {
    document.documentElement.classList.remove("dark");
    localStorage.setItem("theme", "light");
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <PremiumProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
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
                <Route path="/history" element={<History />} />
                <Route path="/account" element={<Account />} />
                <Route path="/achievements" element={<Achievements />} />
                <Route path="/notebooks" element={<MyNotebooks />} />
                <Route path="/landing" element={<PremiumLanding />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </PremiumProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
