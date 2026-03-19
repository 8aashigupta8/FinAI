import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useState, createContext, useContext } from "react";
import Auth from "./pages/Auth";
import ResetPassword from "./pages/ResetPassword";
import VerifyEmail from "./pages/VerifyEmail";
import Dashboard from "./pages/Dashboard";
// import DashboardLayout from "./components/DashboardLayout";
// import Dashboard from "./pages/Dashboard";
// import Companies from "./pages/Companies";
// import Invoices from "./pages/Invoices";
// import Compliance from "./pages/Compliance";
// import Chat from "./pages/Chat";
// import Settings from "./pages/Settings";
// import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// Auth context for Django integration
interface User {
  id: string;
  email: string;
  full_name?: string;
  phone_number?: string;
  role?: string;
}

interface AuthContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  isAuthenticated: boolean;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  setUser: () => { },
  isAuthenticated: false,
});

export const useAuth = () => useContext(AuthContext);

const App = () => {
  // TODO: Replace with Django authentication state
  const [user, setUser] = useState<User | null>(null);
  const isAuthenticated = user !== null;

  return (
    <AuthContext.Provider value={{ user, setUser, isAuthenticated }}>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/auth" element={isAuthenticated ? <Navigate to="/dashboard" /> : <Auth />} />
              <Route path="/verify-email" element={<VerifyEmail />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/" element={isAuthenticated ? <Navigate to="/dashboard" /> : <Navigate to="/auth" />} />
              <Route path="/dashboard" element={<Dashboard />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </AuthContext.Provider>
  );
};

export default App;
