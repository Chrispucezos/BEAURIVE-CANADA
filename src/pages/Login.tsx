import { useState, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import { supabase } from "@/lib/supabase"
import { toast } from "sonner"
import { Loader2, Mail, Lock, Eye, EyeOff, ArrowLeft } from "lucide-react"

export default function Login() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPwd, setShowPwd] = useState(false)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session?.user) return
      const { data: profile } = await supabase.from("user_profiles").select("role").eq("id", session.user.id).single()
      navigate(profile?.role === "admin" ? "/admin" : "/mon-espace", { replace: true })
    })
  }, [navigate])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) { toast.error("Veuillez remplir tous les champs."); return }
    setLoading(true)
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setLoading(false)
      if (error.message.includes("Invalid login") || error.message.includes("invalid_credentials")) {
        toast.error("Courriel ou mot de passe incorrect.")
      } else {
        toast.error("Erreur de connexion : " + error.message)
      }
      return
    }
    const { data: profile } = await supabase.from("user_profiles").select("role").eq("id", data.user.id).single()
    setLoading(false)
    toast.success("Connexion réussie !")
    navigate(profile?.role === "admin" ? "/admin" : "/mon-espace", { replace: true })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#003d7a] to-[#00a896] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl">
            <span className="text-[#003d7a] font-bold text-2xl">B</span>
          </div>
          <h1 className="text-white text-2xl font-bold">BeauRive Solutions</h1>
          <p className="text-white/70 text-sm mt-1">Portail sécurisé</p>
        </div>

        {/* Formulaire */}
        <div className="bg-white rounded-2xl p-8 shadow-2xl">
          <h2 className="text-xl font-bold text-[#003d7a] mb-6 text-center">Connexion</h2>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Adresse courriel</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="votre@courriel.com"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#00a896] focus:border-transparent" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mot de passe</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input type={showPwd ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)} required placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#00a896] focus:border-transparent" />
                <button type="button" onClick={() => setShowPwd(!showPwd)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div className="flex justify-end">
              <Link to="/mot-de-passe-oublie" className="text-sm text-[#003d7a] hover:text-[#00a896] transition">
                Mot de passe oublié ?
              </Link>
            </div>
            <button type="submit" disabled={loading}
              className="w-full bg-[#003d7a] hover:bg-[#002d5a] text-white font-semibold py-3 rounded-xl flex items-center justify-center gap-2 transition disabled:opacity-60">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              Se connecter
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-gray-100 text-center">
            <p className="text-sm text-gray-500 mb-3">Vous n'avez pas encore de compte ?</p>
            <Link to="/portail" className="text-[#003d7a] font-semibold text-sm hover:text-[#00a896] transition">
              Demander mon accès au portail →
            </Link>
          </div>
        </div>

        <div className="text-center mt-6">
          <Link to="/" className="text-white/70 hover:text-white text-sm flex items-center gap-1 justify-center transition">
            <ArrowLeft className="w-3 h-3" /> Retour à l'accueil
          </Link>
        </div>
      </div>
    </div>
  )
}
