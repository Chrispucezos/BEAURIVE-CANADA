import { useState } from "react"
import { Link } from "react-router-dom"
import { supabase } from "@/lib/supabase"
import { toast } from "sonner"
import { Loader2, Mail, ArrowLeft, CheckCircle2 } from "lucide-react"

export default function ForgotPassword() {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) { toast.error("Entrez votre adresse courriel."); return }
    setLoading(true)
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reinitialiser-mot-de-passe`
    })
    setLoading(false)
    if (error) { toast.error("Erreur : " + error.message); return }
    setSent(true)
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
          {sent ? (
            <div className="text-center">
              <CheckCircle2 className="w-14 h-14 text-green-500 mx-auto mb-4" />
              <h2 className="text-xl font-bold text-[#003d7a] mb-2">Courriel envoyé !</h2>
              <p className="text-gray-500 text-sm mb-6">
                Un lien de réinitialisation a été envoyé à <strong>{email}</strong>. Vérifiez votre boîte de réception.
              </p>
              <Link to="/login">
                <button className="bg-[#003d7a] text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-[#002d5a] transition">
                  Retour à la connexion
                </button>
              </Link>
            </div>
          ) : (
            <>
              <h2 className="text-xl font-bold text-[#003d7a] mb-2 text-center">Mot de passe oublié</h2>
              <p className="text-gray-500 text-sm text-center mb-6">Entrez votre courriel pour recevoir un lien de réinitialisation.</p>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Adresse courriel</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="votre@courriel.com"
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#00a896]" />
                  </div>
                </div>
                <button type="submit" disabled={loading}
                  className="w-full bg-[#003d7a] hover:bg-[#002d5a] text-white font-semibold py-3 rounded-xl flex items-center justify-center gap-2 transition disabled:opacity-60">
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  Envoyer le lien
                </button>
              </form>
            </>
          )}
        </div>

        <div className="text-center mt-6">
          <Link to="/login" className="text-white/70 hover:text-white text-sm flex items-center gap-1 justify-center transition">
            <ArrowLeft className="w-3 h-3" /> Retour à la connexion
          </Link>
        </div>
      </div>
    </div>
  )
}
