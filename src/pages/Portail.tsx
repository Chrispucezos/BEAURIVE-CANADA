import { useState } from "react"
import { Link, useLocation } from "wouter"
import { useAuth } from "@/contexts/AuthContext"
import { supabase } from "@/lib/supabase"
import { toast } from "sonner"
import { Loader2, CheckCircle2, Phone, Mail, ArrowRight, Lock, Star, FileText, Calendar, CreditCard, Send } from "lucide-react"

export default function Portail() {
  const { user } = useAuth()
  const [, navigate] = useLocation()

  // Si connecté, rediriger vers mon-espace
  if (user) {
    navigate("/mon-espace")
    return null
  }

  return <PortailAccueil />
}

function PortailAccueil() {
  const [form, setForm] = useState({ name: "", email: "", phone: "", service_type: "" })
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name || !form.email) { toast.error("Veuillez remplir votre nom et courriel."); return }
    setLoading(true)
    const { error } = await supabase.from('contact_submissions').insert({
      name: form.name,
      email: form.email,
      phone: form.phone,
      service_type: form.service_type,
      message: `Demande d'accès au portail client. Service souhaité: ${form.service_type || 'Non précisé'}`,
      status: 'nouveau'
    })
    setLoading(false)
    if (error) { toast.error("Erreur lors de l'envoi. Veuillez réessayer."); return }
    setSent(true)
    toast.success("Demande envoyée ! Nous vous contacterons sous 24h.")
  }

  const avantages = [
    { icon: <FileText className="w-5 h-5" />, title: "Suivi de vos projets", desc: "Consultez l'avancement de vos travaux en temps réel." },
    { icon: <CreditCard className="w-5 h-5" />, title: "Gestion des factures", desc: "Accédez et payez vos factures en ligne en toute sécurité." },
    { icon: <FileText className="w-5 h-5" />, title: "Signature de contrats", desc: "Signez vos contrats électroniquement depuis chez vous." },
    { icon: <Calendar className="w-5 h-5" />, title: "Rendez-vous", desc: "Consultez vos rendez-vous et interventions planifiées." },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Navbar simple */}
      <nav className="bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-9 h-9 bg-[#003d7a] rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-lg">B</span>
            </div>
            <div>
              <div className="font-bold text-[#003d7a] text-sm leading-tight">BeauRive Solutions</div>
              <div className="text-[10px] text-gray-500 uppercase tracking-wide">Portail Client</div>
            </div>
          </Link>
          <Link href="/login">
            <button className="flex items-center gap-2 bg-[#003d7a] hover:bg-[#002d5a] text-white text-sm font-semibold px-4 py-2 rounded-lg transition">
              <Lock className="w-4 h-4" /> Se connecter
            </button>
          </Link>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-16">
        {/* Bannière non-membre */}
        <div className="bg-gradient-to-r from-[#003d7a] to-[#00a896] rounded-2xl p-8 text-white text-center mb-12 shadow-xl">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold mb-3">Bienvenue sur le Portail BeauRive</h1>
          <p className="text-white/90 text-lg max-w-2xl mx-auto mb-2">
            Vous n'êtes pas encore membre. L'accès au portail est <strong>réservé aux clients BeauRive Solutions</strong>.
          </p>
          <p className="text-white/75 max-w-xl mx-auto">
            Pour obtenir votre accès, remplissez le formulaire ci-dessous. Un membre de notre équipe vous contactera et vous enverra votre invitation personnalisée.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-12 items-start">
          {/* Avantages du portail */}
          <div>
            <h2 className="text-2xl font-bold text-[#003d7a] mb-6">Ce que vous obtenez avec votre accès</h2>
            <div className="space-y-4 mb-8">
              {avantages.map((a, i) => (
                <div key={i} className="flex gap-4 bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                  <div className="w-10 h-10 bg-[#003d7a]/10 rounded-xl flex items-center justify-center text-[#003d7a] shrink-0">{a.icon}</div>
                  <div>
                    <h3 className="font-semibold text-gray-800">{a.title}</h3>
                    <p className="text-gray-500 text-sm">{a.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Comment obtenir l'accès */}
            <div className="bg-[#003d7a]/5 rounded-2xl p-6 border border-[#003d7a]/10">
              <h3 className="font-bold text-[#003d7a] mb-4">Comment obtenir votre accès ?</h3>
              <div className="space-y-3">
                {[
                  { num: "1", text: "Remplissez le formulaire de demande ci-contre" },
                  { num: "2", text: "Notre équipe vous contacte sous 24h pour discuter de vos besoins" },
                  { num: "3", text: "Vous recevez votre invitation par courriel avec vos accès personnalisés" },
                ].map((s, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="w-7 h-7 bg-[#003d7a] text-white rounded-full flex items-center justify-center text-sm font-bold shrink-0">{s.num}</div>
                    <p className="text-gray-700 text-sm pt-1">{s.text}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Contact direct */}
            <div className="mt-6 space-y-3">
              <p className="text-sm font-medium text-gray-600">Vous préférez nous contacter directement ?</p>
              <a href="tel:5813492323" className="flex items-center gap-3 text-[#003d7a] hover:text-[#00a896] transition font-medium">
                <Phone className="w-4 h-4" /> 581-349-2323
              </a>
              <a href="mailto:info@beaurive.ca" className="flex items-center gap-3 text-[#003d7a] hover:text-[#00a896] transition font-medium">
                <Mail className="w-4 h-4" /> info@beaurive.ca
              </a>
            </div>
          </div>

          {/* Formulaire de demande */}
          <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
            <h2 className="text-xl font-bold text-[#003d7a] mb-2">Demander mon accès</h2>
            <p className="text-gray-500 text-sm mb-6">Remplissez ce formulaire et nous vous contacterons rapidement.</p>

            {sent ? (
              <div className="text-center py-8">
                <CheckCircle2 className="w-14 h-14 text-green-500 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-[#003d7a] mb-2">Demande envoyée !</h3>
                <p className="text-gray-500 text-sm mb-4">Un membre de notre équipe vous contactera dans les 24 heures pour vous donner accès au portail.</p>
                <Link href="/">
                  <button className="bg-[#003d7a] text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-[#002d5a] transition">
                    Retour à l'accueil
                  </button>
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nom complet *</label>
                  <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} required placeholder="Jean Tremblay" className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#00a896]" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Adresse courriel *</label>
                  <input type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} required placeholder="jean@exemple.com" className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#00a896]" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
                  <input value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} placeholder="581-000-0000" className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#00a896]" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Service souhaité</label>
                  <select value={form.service_type} onChange={e => setForm(p => ({ ...p, service_type: e.target.value }))} className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#00a896]">
                    <option value="">Choisir un service</option>
                    <option>Conciergerie résidentielle</option>
                    <option>Conciergerie commerciale</option>
                    <option>Stratégie numérique</option>
                    <option>Stratégie d'Affaires</option>
                    <option>Intelligence Artificielle</option>
                  </select>
                </div>
                <button type="submit" disabled={loading} className="w-full bg-[#003d7a] hover:bg-[#002d5a] text-white font-semibold py-3 rounded-xl flex items-center justify-center gap-2 transition disabled:opacity-60">
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  Envoyer ma demande
                </button>
              </form>
            )}

            <div className="mt-6 pt-4 border-t border-gray-100 text-center">
              <p className="text-sm text-gray-500 mb-2">Vous avez déjà reçu une invitation ?</p>
              <Link href="/login">
                <button className="text-[#003d7a] font-semibold text-sm hover:text-[#00a896] flex items-center gap-1 mx-auto transition">
                  Se connecter <ArrowRight className="w-3 h-3" />
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
