import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./hooks/useAuth";
import { ErrorBoundary } from "./components/ui/error-boundary";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import Index from "./pages/Index";
import SignupPage from "./pages/SignupPage";
import AuthPage from "./pages/AuthPage";
import MoneyPage from "./pages/MoneyPage";
import HealthPage from "./pages/HealthPage";
import FitnessPage from "./pages/FitnessPage";
import TasksPage from "./pages/TasksPage";
import CalendarPage from "./pages/CalendarPage";
import DashboardPage from "./pages/DashboardPage";
import TodayPage from "./pages/TodayPage";
import SettingsPage from "./pages/SettingsPage";
import NotificationsPage from "./pages/NotificationsPage";
import BusinessPage from "./pages/BusinessPage";
import ProfessionalPage from "./pages/ProfessionalPage";
import SocialPage from "./pages/SocialPage";
import LovePage from "./pages/LovePage";
import CreatorsPage from "./pages/CreatorsPage";
import CryptoPage from "./pages/CryptoPage";
import StocksPage from "./pages/StocksPage";
import NewsPage from "./pages/NewsPage";
import LandingPage from "./pages/LandingPage";
import OnboardingPage from "./pages/OnboardingPage";
import CloudPage from "./pages/CloudPage";
import FeedPage from "./pages/FeedPage";
import MembersPage from "./pages/MembersPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/dashboard" element={<ProtectedRoute><Index /></ProtectedRoute>} />
            <Route path="/onboarding" element={<ProtectedRoute><OnboardingPage /></ProtectedRoute>} />
            <Route path="/today" element={<ProtectedRoute><TodayPage /></ProtectedRoute>} />
            <Route path="/money" element={<ProtectedRoute><MoneyPage /></ProtectedRoute>} />
            <Route path="/health" element={<ProtectedRoute><HealthPage /></ProtectedRoute>} />
            <Route path="/fitness" element={<ProtectedRoute><FitnessPage /></ProtectedRoute>} />
            <Route path="/tasks" element={<ProtectedRoute><TasksPage /></ProtectedRoute>} />
            <Route path="/calendar" element={<ProtectedRoute><CalendarPage /></ProtectedRoute>} />
            <Route path="/notifications" element={<ProtectedRoute><NotificationsPage /></ProtectedRoute>} />
            <Route path="/business" element={<ProtectedRoute><BusinessPage /></ProtectedRoute>} />
            <Route path="/professional" element={<ProtectedRoute><ProfessionalPage /></ProtectedRoute>} />
            <Route path="/social" element={<ProtectedRoute><SocialPage /></ProtectedRoute>} />
            <Route path="/feed" element={<ProtectedRoute><FeedPage /></ProtectedRoute>} />
            <Route path="/members" element={<ProtectedRoute><MembersPage /></ProtectedRoute>} />
            <Route path="/love" element={<ProtectedRoute><LovePage /></ProtectedRoute>} />
            <Route path="/creators" element={<ProtectedRoute><CreatorsPage /></ProtectedRoute>} />
            <Route path="/crypto" element={<ProtectedRoute><CryptoPage /></ProtectedRoute>} />
            <Route path="/stocks" element={<ProtectedRoute><StocksPage /></ProtectedRoute>} />
            <Route path="/news" element={<ProtectedRoute><NewsPage /></ProtectedRoute>} />
            <Route path="/cloud" element={<ProtectedRoute><CloudPage /></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
