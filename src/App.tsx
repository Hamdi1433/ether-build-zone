
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from '../components/auth-provider'
import { Toaster } from './components/ui/toaster'

// Import des pages principales
import DashboardPage from './pages/Dashboard'
import ProjectsPage from './pages/Projects'
import SegmentsPage from './pages/Segments'
import AnalyticsPage from './pages/Analytics'
import EmailTemplatesPage from './pages/EmailTemplates'
import AppointmentsPage from './pages/Appointments'
import SettingsPage from './pages/Settings'
import LoginPage from './pages/Login'
import SignupPage from './pages/Signup'
import BookAppointmentPage from './pages/BookAppointment'
import ProjectDetailsPage from './pages/ProjectDetails'
import LeadGenerationPage from './pages/LeadGeneration'

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/projects" element={<ProjectsPage />} />
          <Route path="/projects/:id" element={<ProjectDetailsPage />} />
          <Route path="/segments" element={<SegmentsPage />} />
          <Route path="/analytics" element={<AnalyticsPage />} />
          <Route path="/lead-generation" element={<LeadGenerationPage />} />
          <Route path="/email-templates" element={<EmailTemplatesPage />} />
          <Route path="/appointments" element={<AppointmentsPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/book-appointment" element={<BookAppointmentPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <Toaster />
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
