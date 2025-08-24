
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "../components/auth-provider";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import Projects from "./pages/Projects";
import Analytics from "./pages/Analytics";
import Segments from "./pages/Segments";
import EmailTemplates from "./pages/EmailTemplates";
import Settings from "./pages/Settings";
import Appointments from "./pages/Appointments";
import BookAppointment from "./pages/BookAppointment";
import ProjectDetails from "./pages/ProjectDetails";
import LeadGeneration from "./pages/LeadGeneration";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/projects" element={<Projects />} />
            <Route path="/projects/:id" element={<ProjectDetails />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/segments" element={<Segments />} />
            <Route path="/templates" element={<EmailTemplates />} />
            <Route path="/appointments" element={<Appointments />} />
            <Route path="/book/:projectId" element={<BookAppointment />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/lead-generation" element={<LeadGeneration />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
