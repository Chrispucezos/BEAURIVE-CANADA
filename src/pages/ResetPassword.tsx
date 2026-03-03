import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { supabase } from "@/lib/supabase"
import { toast } from "sonner"
import { Loader2, Lock, Eye, EyeOff, CheckCircle2 } from "lucide-react"

export default function ResetPassword() {
  const [password, setPassword] = useState("")
  const [confirm, setConfirm] = useState("")
  const [showPwd, setShowPwd] = useState(false)
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password.length < 8) { toast.error("Le mot de passe doit contenir au moins 8 caractères."); return }
    if (password !== confirm) { toast.error("Les mots de passe ne correspondent pas."); return }
    setLoading(true)
    const { error } = await supabase.auth.updateUser({ password })
    setLoading(false)
    if (error) { toast.error("Erreur : " + error.message); return }
    setDone(true)
    toast.success("Mot de passe mis à jour !")
    setTimeout(() => navigate("/login"), 3000)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#003d7a] to-[#00a896] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl">
            <span className="text-[#003d7a] font-bold text-2xl">B</span>
          </div>
          <h1 className="text-white text-2xl font-bold">BeauRive Solutions</h1>
        </div>

        <div className="bg-white rounded-2xl p-8 shadow-2xl">
          {done ? (
            <div className="text-center">
              <CheckCircle2 className="w-14 h-14 text-green-500 mx-auto mb-4" />
              <h2 className="text-xl font-bold text-[#003d7a] mb-2">Mot de passe mis à jour !</h2>
              <p className="text-gray-500 text-sm">Redirection vers la connexion dans quelques secondes...</p>
            </div>
          ) : (
            <>
              <h2 className="text-xl font-bold text-[#003d7a] mb-6 text-center">Nouveau mot de passe</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nouveau mot de passe</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input type={showPwd ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)} required placeholder="Minimum 8 caractères"
                      className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#00a896]" />
                    <button type="button" onClick={() => setShowPwd(!showPwd)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                      {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Confirmer le mot de passe</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input type="password" value={confirm} onChange={e => setConfirm(e.target.value)} required placeholder="Répétez le mot de passe"
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#00a896]" />
                  </div>
                </div>
                <button type="submit" disabled={loading}
                  className="w-full bg-[#003d7a] hover:bg-[#002d5a] text-white font-semibold py-3 rounded-xl flex items-center justify-center gap-2 transition disabled:opacity-60">
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  Mettre à jour le mot de passe
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
