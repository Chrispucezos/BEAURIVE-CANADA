import { useState, useEffect } from "react"
import { Link, useLocation } from "wouter"
import { useAuth } from "@/contexts/AuthContext"
import { supabase } from "@/lib/supabase"
import { toast } from "sonner"
import {
  Loader2, LogOut, User, FileText, CreditCard, Calendar, FolderOpen,
  CheckCircle2, Clock, AlertCircle, ChevronRight, Download, Pen
} from "lucide-react"

export default function MonEspace() {
  const { user, loading, signOut, userRole } = useAuth()
  const [, navigate] = useLocation()

  useEffect(() => {
    if (!loading && !user) navigate("/portail")
    if (!loading && user && userRole === "admin") navigate("/admin")
  }, [user, loading, userRole])

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 className="w-8 h-8 animate-spin text-[#003d7a]" />
    </div>
  )

  if (!user) return null

  return <ClientPortal user={user} signOut={signOut} />
}

function ClientPortal({ user, signOut }: { user: any, signOut: () => void }) {
  const [activeTab, setActiveTab] = useState("projets")
  const [profile, setProfile] = useState<any>(null)
  const [, navigate] = useLocation()

  useEffect(() => {
    supabase.from('user_profiles').select('*').eq('id', user.id).single()
      .then(({ data }) => setProfile(data))
  }, [user.id])

  const handleLogout = async () => {
    await signOut()
    navigate("/")
    toast.success("Déconnexion réussie.")
  }

  const tabs = [
    { id: "projets", label: "Mes Projets", icon: <FolderOpen className="w-4 h-4" /> },
    { id: "contrats", label: "Contrats", icon: <FileText className="w-4 h-4" /> },
    { id: "factures", label: "Factures", icon: <CreditCard className="w-4 h-4" /> },
    { id: "agenda", label: "Agenda", icon: <Calendar className="w-4 h-4" /> },
    { id: "profil", label: "Mon Profil", icon: <User className="w-4 h-4" /> },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-[#003d7a] text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
              <span className="font-bold text-sm">B</span>
            </div>
            <span className="font-bold text-sm hidden sm:block">BeauRive Solutions</span>
          </Link>
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium">{profile?.name || user.email}</p>
              <p className="text-xs text-white/60">Client</p>
            </div>
            <button onClick={handleLogout} className="flex items-center gap-2 bg-white/10 hover:bg-white/20 px-3 py-2 rounded-lg text-sm transition">
              <LogOut className="w-4 h-4" /> Déconnexion
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Bienvenue */}
        <div className="bg-gradient-to-r from-[#003d7a] to-[#00a896] rounded-2xl p-6 text-white mb-8 shadow-lg">
          <h1 className="text-2xl font-bold mb-1">Bonjour, {profile?.name || "Client"} 👋</h1>
          <p className="text-white/80">Bienvenue dans votre espace personnel BeauRive Solutions.</p>
        </div>

        {/* Navigation par onglets */}
        <div className="flex gap-2 overflow-x-auto mb-6 pb-2">
          {tabs.map(t => (
            <button key={t.id} onClick={() => setActiveTab(t.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition ${activeTab === t.id ? 'bg-[#003d7a] text-white shadow-md' : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'}`}>
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        {/* Contenu */}
        {activeTab === "projets" && <ProjectsTab userId={user.id} />}
        {activeTab === "contrats" && <ContractsTab userId={user.id} />}
        {activeTab === "factures" && <FacturesTab userId={user.id} />}
        {activeTab === "agenda" && <AgendaTab userId={user.id} />}
        {activeTab === "profil" && <ProfilTab user={user} profile={profile} setProfile={setProfile} />}
      </div>
    </div>
  )
}

// ─── PROJETS ─────────────────────────────────────────────────────────────────
function ProjectsTab({ userId }: { userId: string }) {
  const [projects, setProjects] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.from('projects').select('*').eq('client_id', userId).order('created_at', { ascending: false })
      .then(({ data }) => { setProjects(data || []); setLoading(false) })
  }, [userId])

  const statusColor: Record<string, string> = {
    'non-commence': 'bg-gray-100 text-gray-600',
    'en-cours': 'bg-blue-100 text-blue-700',
    'complete': 'bg-green-100 text-green-700',
    'en-attente': 'bg-yellow-100 text-yellow-700',
    'annule': 'bg-red-100 text-red-700',
  }

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-[#003d7a]" /></div>

  if (projects.length === 0) return (
    <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-gray-100">
      <FolderOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
      <h3 className="font-semibold text-gray-600 mb-1">Aucun projet pour l'instant</h3>
      <p className="text-gray-400 text-sm">Vos projets apparaîtront ici une fois créés par notre équipe.</p>
    </div>
  )

  return (
    <div className="space-y-4">
      {projects.map(p => (
        <div key={p.id} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="font-bold text-gray-800 text-lg">{p.title}</h3>
              {p.description && <p className="text-gray-500 text-sm mt-1">{p.description}</p>}
            </div>
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColor[p.status] || 'bg-gray-100 text-gray-600'}`}>
              {p.status.replace('-', ' ')}
            </span>
          </div>
          <div className="mb-3">
            <div className="flex justify-between text-sm text-gray-500 mb-1">
              <span>Progression</span>
              <span className="font-medium text-[#003d7a]">{p.progress_percent}%</span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-[#003d7a] to-[#00a896] rounded-full transition-all" style={{ width: `${p.progress_percent}%` }} />
            </div>
          </div>
          {(p.start_date || p.end_date) && (
            <div className="flex gap-4 text-xs text-gray-400">
              {p.start_date && <span>Début : {new Date(p.start_date).toLocaleDateString('fr-CA')}</span>}
              {p.end_date && <span>Fin prévue : {new Date(p.end_date).toLocaleDateString('fr-CA')}</span>}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

// ─── CONTRATS ─────────────────────────────────────────────────────────────────
function ContractsTab({ userId }: { userId: string }) {
  const [contracts, setContracts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [signing, setSigning] = useState<number | null>(null)

  useEffect(() => {
    supabase.from('contracts').select('*').eq('client_id', userId).order('created_at', { ascending: false })
      .then(({ data }) => { setContracts(data || []); setLoading(false) })
  }, [userId])

  const handleSign = async (contractId: number) => {
    setSigning(contractId)
    const signature = `Signé électroniquement par le client le ${new Date().toLocaleDateString('fr-CA')}`
    const { error } = await supabase.from('contracts').update({
      client_signature: signature,
      status: 'signe-client',
      signed_at: new Date().toISOString()
    }).eq('id', contractId)
    if (error) { toast.error("Erreur lors de la signature."); setSigning(null); return }
    setContracts(prev => prev.map(c => c.id === contractId ? { ...c, client_signature: signature, status: 'signe-client' } : c))
    toast.success("Contrat signé avec succès !")
    setSigning(null)
  }

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-[#003d7a]" /></div>

  if (contracts.length === 0) return (
    <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-gray-100">
      <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
      <h3 className="font-semibold text-gray-600 mb-1">Aucun contrat pour l'instant</h3>
      <p className="text-gray-400 text-sm">Vos contrats apparaîtront ici une fois préparés par notre équipe.</p>
    </div>
  )

  return (
    <div className="space-y-4">
      {contracts.map(c => (
        <div key={c.id} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-start justify-between mb-3">
            <h3 className="font-bold text-gray-800">{c.title}</h3>
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${c.status === 'complet' ? 'bg-green-100 text-green-700' : c.status === 'signe-client' ? 'bg-blue-100 text-blue-700' : 'bg-yellow-100 text-yellow-700'}`}>
              {c.status === 'envoye' ? 'À signer' : c.status === 'signe-client' ? 'Signé' : c.status === 'complet' ? 'Complété' : c.status}
            </span>
          </div>
          {c.content && <p className="text-gray-500 text-sm mb-4 line-clamp-3">{c.content}</p>}
          {c.amount && <p className="text-[#003d7a] font-semibold mb-4">Montant : {Number(c.amount).toFixed(2)} $</p>}
          {c.status === 'envoye' && !c.client_signature && (
            <button onClick={() => handleSign(c.id)} disabled={signing === c.id}
              className="flex items-center gap-2 bg-[#003d7a] hover:bg-[#002d5a] text-white text-sm font-semibold px-4 py-2 rounded-lg transition disabled:opacity-60">
              {signing === c.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Pen className="w-4 h-4" />}
              Signer ce contrat
            </button>
          )}
          {c.client_signature && (
            <div className="flex items-center gap-2 text-green-600 text-sm">
              <CheckCircle2 className="w-4 h-4" /> {c.client_signature}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

// ─── FACTURES ─────────────────────────────────────────────────────────────────
function FacturesTab({ userId }: { userId: string }) {
  const [invoices, setInvoices] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.from('invoices').select('*').eq('client_id', userId).order('created_at', { ascending: false })
      .then(({ data }) => { setInvoices(data || []); setLoading(false) })
  }, [userId])

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-[#003d7a]" /></div>

  if (invoices.length === 0) return (
    <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-gray-100">
      <CreditCard className="w-12 h-12 text-gray-300 mx-auto mb-3" />
      <h3 className="font-semibold text-gray-600 mb-1">Aucune facture pour l'instant</h3>
      <p className="text-gray-400 text-sm">Vos factures apparaîtront ici une fois émises par notre équipe.</p>
    </div>
  )

  const total = invoices.reduce((s, i) => s + Number(i.amount) + Number(i.tax), 0)
  const nonPaye = invoices.filter(i => i.status === 'non-paye').reduce((s, i) => s + Number(i.amount) + Number(i.tax), 0)

  return (
    <div>
      {/* Résumé */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 text-center">
          <p className="text-2xl font-bold text-[#003d7a]">{total.toFixed(2)} $</p>
          <p className="text-sm text-gray-500">Total facturé</p>
        </div>
        <div className={`rounded-xl p-4 shadow-sm border text-center ${nonPaye > 0 ? 'bg-red-50 border-red-100' : 'bg-green-50 border-green-100'}`}>
          <p className={`text-2xl font-bold ${nonPaye > 0 ? 'text-red-600' : 'text-green-600'}`}>{nonPaye.toFixed(2)} $</p>
          <p className="text-sm text-gray-500">Non payé</p>
        </div>
      </div>
      <div className="space-y-4">
        {invoices.map(inv => (
          <div key={inv.id} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-start justify-between mb-2">
              <div>
                <p className="font-bold text-gray-800">Facture #{inv.invoice_number}</p>
                {inv.description && <p className="text-gray-500 text-sm">{inv.description}</p>}
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${inv.status === 'paye' ? 'bg-green-100 text-green-700' : inv.status === 'en-retard' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>
                {inv.status === 'non-paye' ? 'Non payé' : inv.status === 'paye' ? 'Payé' : inv.status === 'en-retard' ? 'En retard' : inv.status}
              </span>
            </div>
            <p className="text-xl font-bold text-[#003d7a]">{(Number(inv.amount) + Number(inv.tax)).toFixed(2)} $</p>
            <p className="text-xs text-gray-400 mt-1">
              Sous-total : {Number(inv.amount).toFixed(2)} $ | TPS/TVQ : {Number(inv.tax).toFixed(2)} $
            </p>
            {inv.due_date && (
              <p className={`text-xs mt-2 ${inv.status === 'non-paye' ? 'text-red-500' : 'text-gray-400'}`}>
                Échéance : {new Date(inv.due_date).toLocaleDateString('fr-CA')}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── AGENDA ──────────────────────────────────────────────────────────────────
function AgendaTab({ userId }: { userId: string }) {
  const [schedules, setSchedules] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.from('schedules').select('*').eq('client_id', userId).order('scheduled_at', { ascending: true })
      .then(({ data }) => { setSchedules(data || []); setLoading(false) })
  }, [userId])

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-[#003d7a]" /></div>

  if (schedules.length === 0) return (
    <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-gray-100">
      <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
      <h3 className="font-semibold text-gray-600 mb-1">Aucun rendez-vous planifié</h3>
      <p className="text-gray-400 text-sm">Vos rendez-vous apparaîtront ici une fois planifiés par notre équipe.</p>
    </div>
  )

  return (
    <div className="space-y-4">
      {schedules.map(s => (
        <div key={s.id} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex gap-4">
          <div className="w-14 h-14 bg-[#003d7a]/10 rounded-xl flex flex-col items-center justify-center shrink-0">
            <span className="text-lg font-bold text-[#003d7a]">{new Date(s.scheduled_at).getDate()}</span>
            <span className="text-xs text-gray-500">{new Date(s.scheduled_at).toLocaleDateString('fr-CA', { month: 'short' })}</span>
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-gray-800">{s.title}</h3>
            {s.description && <p className="text-gray-500 text-sm">{s.description}</p>}
            <p className="text-sm text-[#003d7a] mt-1">
              {new Date(s.scheduled_at).toLocaleTimeString('fr-CA', { hour: '2-digit', minute: '2-digit' })} — {s.duration_minutes} min
            </p>
          </div>
          <span className={`self-start px-3 py-1 rounded-full text-xs font-semibold ${s.status === 'confirme' ? 'bg-green-100 text-green-700' : s.status === 'annule' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>
            {s.status}
          </span>
        </div>
      ))}
    </div>
  )
}

// ─── PROFIL ──────────────────────────────────────────────────────────────────
function ProfilTab({ user, profile, setProfile }: { user: any, profile: any, setProfile: any }) {
  const [form, setForm] = useState({ name: "", phone: "", company_name: "", address: "", city: "", postal_code: "" })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (profile) setForm({
      name: profile.name || "",
      phone: profile.phone || "",
      company_name: profile.company_name || "",
      address: profile.address || "",
      city: profile.city || "",
      postal_code: profile.postal_code || "",
    })
  }, [profile])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const { error } = await supabase.from('user_profiles').update(form).eq('id', user.id)
    setLoading(false)
    if (error) { toast.error("Erreur lors de la sauvegarde."); return }
    setProfile((p: any) => ({ ...p, ...form }))
    toast.success("Profil mis à jour !")
  }

  return (
    <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 max-w-2xl">
      <h2 className="text-xl font-bold text-[#003d7a] mb-6">Mon Profil</h2>
      <form onSubmit={handleSave} className="space-y-4">
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nom complet</label>
            <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#00a896]" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
            <input value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#00a896]" />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Entreprise (optionnel)</label>
          <input value={form.company_name} onChange={e => setForm(p => ({ ...p, company_name: e.target.value }))} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#00a896]" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Adresse</label>
          <input value={form.address} onChange={e => setForm(p => ({ ...p, address: e.target.value }))} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#00a896]" />
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Ville</label>
            <input value={form.city} onChange={e => setForm(p => ({ ...p, city: e.target.value }))} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#00a896]" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Code postal</label>
            <input value={form.postal_code} onChange={e => setForm(p => ({ ...p, postal_code: e.target.value }))} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#00a896]" />
          </div>
        </div>
        <div className="pt-2">
          <p className="text-sm text-gray-400 mb-3">Courriel : {user.email} (non modifiable)</p>
          <button type="submit" disabled={loading} className="bg-[#003d7a] hover:bg-[#002d5a] text-white font-semibold px-6 py-2.5 rounded-xl flex items-center gap-2 transition disabled:opacity-60">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            Sauvegarder
          </button>
        </div>
      </form>
    </div>
  )
}
