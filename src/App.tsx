import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./hooks/useAuth";
import Index from "./pages/Index";
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
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/today" element={<TodayPage />} />
            <Route path="/money" element={<MoneyPage />} />
            <Route path="/health" element={<HealthPage />} />
            <Route path="/fitness" element={<FitnessPage />} />
            <Route path="/tasks" element={<TasksPage />} />
            <Route path="/calendar" element={<CalendarPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/notifications" element={<NotificationsPage />} />
            <Route path="/business" element={<BusinessPage />} />
            <Route path="/professional" element={<ProfessionalPage />} />
            {/* Placeholder routes for remaining categories */}
            <Route path="/social" element={<SocialPage />} />
            <Route path="/love" element={<LovePage />} />
            <Route path="/settings" element={<SettingsPage />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
