import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { ThemeProvider } from "./contexts/ThemeContext";
import { SpaceProvider } from "./contexts/SpaceContext";
import { CoupleProvider } from "./contexts/CoupleContext";
import { AudioProvider } from "./contexts/AudioContext";
import ErrorBoundary from "./components/ErrorBoundary";
import { VibeEngine } from "./components/ui/VibeEngine";
import { TimeGradientOverlay } from "./components/ui/TimeGradientOverlay";
import { AnimatePresence, motion } from "framer-motion";
import "./App.css";

import Login from "./pages/Login";
import CookieDashboard from "./pages/CookieDashboard";
import SenoritaDashboard from "./pages/SenoritaDashboard";
import NotFound from "./pages/NotFound";
import Letters from "./pages/Letters";
import Gallery from "./pages/Gallery";
import Questions from "./pages/Questions";
import MoodEnhanced from "./pages/MoodEnhanced";
import Settings from "./pages/Settings";
import Chat from "./pages/Chat";
import Milestones from "./pages/Milestones";
import ValentinesSpecial from "./pages/ValentinesSpecial";
import ValentinesViewer from "./pages/ValentinesViewer";
import ValentineFuturePage from "./pages/ValentineFuturePage";
import SecretVaultPage from "./pages/SecretVaultPage";
import Calendar from "./pages/Calendar";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 5 * 60 * 1000, // 5 minutes
      refetchOnWindowFocus: false,
    },
  },
});

const pageTransition = {
  initial: { opacity: 0, scale: 0.98 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 1.02 },
  transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] }
};

const PageWrapper = ({ children }: { children: React.ReactNode }) => (
  <motion.div {...pageTransition} className="min-h-screen w-full">
    {children}
  </motion.div>
);

const AnimatedRoutes = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<PageWrapper><Login /></PageWrapper>} />
        <Route path="/cookie" element={<PageWrapper><CookieDashboard /></PageWrapper>} />
        <Route path="/senorita" element={<PageWrapper><SenoritaDashboard /></PageWrapper>} />
        <Route path="/letters" element={<PageWrapper><Letters /></PageWrapper>} />
        <Route path="/gallery" element={<PageWrapper><Gallery /></PageWrapper>} />
        <Route path="/questions" element={<PageWrapper><Questions /></PageWrapper>} />
        <Route path="/mood" element={<PageWrapper><MoodEnhanced /></PageWrapper>} />
        <Route path="/chat" element={<PageWrapper><Chat /></PageWrapper>} />
        <Route path="/milestones" element={<PageWrapper><Milestones /></PageWrapper>} />
        <Route path="/valentines-special" element={<PageWrapper><ValentinesSpecial /></PageWrapper>} />
        <Route path="/valentines-viewer" element={<PageWrapper><ValentinesViewer /></PageWrapper>} />
        <Route path="/valentine/future" element={<PageWrapper><ValentineFuturePage /></PageWrapper>} />
        <Route path="/secret-vault" element={<PageWrapper><SecretVaultPage /></PageWrapper>} />
        <Route path="/calendar" element={<PageWrapper><Calendar /></PageWrapper>} />
        <Route path="/settings" element={<PageWrapper><Settings /></PageWrapper>} />
        {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
        <Route path="*" element={<PageWrapper><NotFound /></PageWrapper>} />
      </Routes>
    </AnimatePresence>
  );
};

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AudioProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <SpaceProvider>
                <CoupleProvider>
                  <VibeEngine />
                  <TimeGradientOverlay />
                  <AnimatedRoutes />
                </CoupleProvider>
              </SpaceProvider>
            </BrowserRouter>
          </TooltipProvider>
        </AudioProvider>
      </ThemeProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;