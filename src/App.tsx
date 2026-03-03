import { BrowserRouter, Routes, Route } from "react-router-dom"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { ThemeProvider } from "@/contexts/ThemeContext"
import { TooltipProvider } from "@/components/ui/tooltip"
import { Toaster } from "@/components/ui/sonner"

// Pages avec authentification Supabase
import Login from "@/pages/Login"
import ForgotPassword from "@/pages/ForgotPassword"
import ResetPassword from "@/pages/ResetPassword"

// Pages originales (design identique)
import Home from "@/pages/Home_original"
import ConciergerieDept from "@/pages/ConciergerieDept_original"
import StrategyDept from "@/pages/StrategyDept_original"
import CostCalculator from "@/pages/CostCalculator_original"
import PolitiqueConfidentialite from "@/pages/PolitiqueConfidentialite_original"
import AdminDashboard from "@/pages/AdminDashboard_original"
import ClientDashboard from "@/pages/ClientDashboard_original"
import IntelligenceArtificielle from "@/pages/IntelligenceArtificielle_original"
import Carrieres from "@/pages/Carrieres_original"
import QuiSommesNous from "@/pages/QuiSommesNous_original"
import AcceptInvitation from "@/pages/AcceptInvitation_original"
import AdminClientDetail from "@/pages/AdminClientDetail_original"
import PortailAccueil from "@/pages/PortailAccueil"
import NotFound from "@/pages/NotFound_original"

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false, refetchOnWindowFocus: false } },
})

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <ThemeProvider defaultTheme="light">
          <TooltipProvider>
            <Toaster />
            <Routes>
              {/* Auth */}
              <Route path="/login" element={<Login />} />
              <Route path="/mot-de-passe-oublie" element={<ForgotPassword />} />
              <Route path="/reinitialiser-mot-de-passe" element={<ResetPassword />} />

              {/* Pages publiques */}
              <Route path="/" element={<Home />} />
              <Route path="/conciergerie" element={<ConciergerieDept />} />
              <Route path="/strategie" element={<StrategyDept />} />
              <Route path="/calculateur-cout" element={<CostCalculator />} />
              <Route path="/politique-de-confidentialite" element={<PolitiqueConfidentialite />} />
              <Route path="/intelligence-artificielle" element={<IntelligenceArtificielle />} />
              <Route path="/carrieres" element={<Carrieres />} />
              <Route path="/qui-sommes-nous" element={<QuiSommesNous />} />

              {/* Portail */}
              <Route path="/portail" element={<PortailAccueil />} />
              <Route path="/mon-espace" element={<ClientDashboard />} />
              <Route path="/invitation/:token" element={<AcceptInvitation />} />

              {/* Admin */}
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/client/:id" element={<AdminClientDetail />} />

              {/* 404 */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </TooltipProvider>
        </ThemeProvider>
      </BrowserRouter>
    </QueryClientProvider>
  )
}
