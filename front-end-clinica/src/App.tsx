import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuthStore } from "@/store/auth";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { PatientLayout } from "@/components/layouts/PatientLayout";
import { DoctorLayout } from "@/components/layouts/DoctorLayout";
import { AdminLayout } from "@/components/layouts/AdminLayout";

// Public pages
import Index from "./pages/Index";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import NotFound from "./pages/NotFound";

// Patient pages
import PatientDashboard from "./pages/patient/Dashboard";
import Appointments from "./pages/patient/Appointments";
import Doctors from "./pages/patient/Doctors";
import Schedule from "./pages/patient/Schedule";
import Payment from "./pages/patient/Payment";
import Profile from "./pages/patient/Profile";

// Doctor pages
import DoctorDashboard from "./pages/doctor/Dashboard";
import DoctorAgenda from "./pages/doctor/Agenda";

// Admin pages
import AdminDashboard from "./pages/admin/Dashboard";
import AdminUsers from "./pages/admin/Users";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const App = () => {
  const { isAuthenticated } = useAuthStore();

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Index />} />
            <Route
              path="/login"
              element={
                isAuthenticated ? <Navigate to="/app/dashboard" replace /> : <Login />
              }
            />
            <Route
              path="/register"
              element={
                isAuthenticated ? <Navigate to="/app/dashboard" replace /> : <Register />
              }
            />

            {/* Patient routes */}
            <Route element={<ProtectedRoute allowedRoles={["PACIENTE"]} />}>
              <Route element={<PatientLayout />}>
                <Route path="/app/dashboard" element={<PatientDashboard />} />
                <Route path="/app/appointments" element={<Appointments />} />
                <Route path="/app/doctors" element={<Doctors />} />
                <Route path="/app/schedule/:doctorId" element={<Schedule />} />
                <Route path="/app/payment/:appointmentId" element={<Payment />} />
                <Route path="/app/profile" element={<Profile />} />
              </Route>
            </Route>

            {/* Doctor routes */}
            <Route element={<ProtectedRoute allowedRoles={["MEDICO"]} />}>
              <Route element={<DoctorLayout />}>
                <Route path="/doctor/dashboard" element={<DoctorDashboard />} />
                <Route path="/doctor/agenda" element={<DoctorAgenda />} />
              </Route>
            </Route>

            {/* Admin routes */}
            <Route element={<ProtectedRoute allowedRoles={["ADMIN"]} />}>
              <Route element={<AdminLayout />}>
                <Route path="/admin/dashboard" element={<AdminDashboard />} />
                <Route path="/admin/users" element={<AdminUsers />} />
              </Route>
            </Route>

            {/* Catch all */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
