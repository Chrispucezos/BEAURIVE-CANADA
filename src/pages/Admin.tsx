import { useState, useEffect } from "react"
import { Link, useLocation } from "wouter"
import { useAuth } from "@/contexts/AuthContext"
import { supabase } from "@/lib/supabase"
import { toast } from "sonner"
import {
  Loader2, LogOut, Users, FileText, CreditCard, Calendar, FolderOpen,
  MessageSquare, BarChart2, Plus, Trash2, Edit2, CheckCircle2, X, Send,
  Eye, UserPlus, Settings, ChevronDown, ChevronUp
} from "lucide-react"

export default function Admin() {
  const { user, loading, signOut, userRole } = useAuth()
  const [, navigate] = useLocation()

  useEffect(() => {
    if (!loading && !user) navigate("/login")
    if (!loading && user && userRole === "client") navigate("/mon-espace")
  }, [user, loading, userRole])

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 className="w-8 h-8 animate-spin text-[#003d7a]" />
    </div>
  )

  if (!user || userRole !== "admin") return null

  return <AdminDashboard user={user} signOut={signOut} />
}

function AdminDashboard({ user, signOut }: { user: any, signOut: () => void }) {
  const [activeTab, setActiveTab] = useState("demandes")
  const [, navigate] = useLocation()

  const handleLogout = async () => {
    await signOut()
    navigate("/")
    toast.success("Déconnexion réussie.")
  }

  const tabs = [
    { id: "demandes", label: "Demandes", icon: <MessageSquare className="w-4 h-4" /> },
    { id: "clients", label: "Clients", icon: <Users className="w-4 h-4" /> },
    { id: "projets", label: "Projets", icon: <FolderOpen className="w-4 h-4" /> },
    { id: "contrats", label: "Contrats", icon: <FileText className="w-4 h-4" /> },
    { id: "factures", label: "Factures", icon: <CreditCard className="w-4 h-4" /> },
    { id: "agenda", label: "Agenda", icon: <Calendar className="w-4 h-4" /> },
    { id: "avis", label: "Avis", icon: <BarChart2 className="w-4 h-4" /> },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-[#003d7a] text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center"><span className="font-bold text-sm">B</span></div>
            <span className="font-bold text-sm hidden sm:block">BeauRive — Admin</span>
          </Link>
          <button onClick={handleLogout} className="flex items-center gap-2 bg-white/10 hover:bg-white/20 px-3 py-2 rounded-lg text-sm transition">
            <LogOut className="w-4 h-4" /> Déconnexion
          </button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-gradient-to-r from-[#003d7a] to-[#00a896] rounded-2xl p-6 text-white mb-8 shadow-lg">
          <h1 className="text-2xl font-bold">Tableau de bord administrateur</h1>
          <p className="text-white/70 text-sm mt-1">Gestion complète de BeauRive Solutions</p>
        </div>

        <div className="flex gap-2 overflow-x-auto mb-6 pb-2">
          {tabs.map(t => (
            <button key={t.id} onClick={() => setActiveTab(t.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition ${activeTab === t.id ? 'bg-[#003d7a] text-white shadow-md' : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'}`}>
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        {activeTab === "demandes" && <DemandesTab />}
        {activeTab === "clients" && <ClientsTab />}
        {activeTab === "projets" && <AdminProjectsTab />}
        {activeTab === "contrats" && <AdminContractsTab />}
        {activeTab === "factures" && <AdminFacturesTab />}
        {activeTab === "agenda" && <AdminAgendaTab />}
        {activeTab === "avis" && <AvisTab />}
      </div>
    </div>
  )
}

// ─── DEMANDES ─────────────────────────────────────────────────────────────────
function DemandesTab() {
  const [contacts, setContacts] = useState<any[]>([])
  const [quotes, setQuotes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [subTab, setSubTab] = useState<"contact" | "soumissions">("contact")

  useEffect(() => {
    Promise.all([
      supabase.from('contact_submissions').select('*').order('created_at', { ascending: false }),
      supabase.from('quote_submissions').select('*').order('created_at', { ascending: false })
    ]).then(([c, q]) => {
      setContacts(c.data || [])
      setQuotes(q.data || [])
      setLoading(false)
    })
  }, [])

  const deleteContact = async (id: number) => {
    await supabase.from('contact_submissions').delete().eq('id', id)
    setContacts(prev => prev.filter(c => c.id !== id))
    toast.success("Demande supprimée.")
  }

  const deleteQuote = async (id: number) => {
    await supabase.from('quote_submissions').delete().eq('id', id)
    setQuotes(prev => prev.filter(q => q.id !== id))
    toast.success("Soumission supprimée.")
  }

  const updateContactStatus = async (id: number, status: string) => {
    await supabase.from('contact_submissions').update({ status }).eq('id', id)
    setContacts(prev => prev.map(c => c.id === id ? { ...c, status } : c))
  }

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-[#003d7a]" /></div>

  return (
    <div>
      <div className="flex gap-2 mb-6">
        <button onClick={() => setSubTab("contact")} className={`px-4 py-2 rounded-lg text-sm font-medium transition ${subTab === "contact" ? "bg-[#003d7a] text-white" : "bg-white border border-gray-200 text-gray-600"}`}>
          Formulaires de contact ({contacts.length})
        </button>
        <button onClick={() => setSubTab("soumissions")} className={`px-4 py-2 rounded-lg text-sm font-medium transition ${subTab === "soumissions" ? "bg-[#003d7a] text-white" : "bg-white border border-gray-200 text-gray-600"}`}>
          Soumissions ({quotes.length})
        </button>
      </div>

      {subTab === "contact" && (
        <div className="space-y-4">
          {contacts.length === 0 ? <EmptyState icon={<MessageSquare />} text="Aucune demande de contact" /> : contacts.map(c => (
            <div key={c.id} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="font-bold text-gray-800">{c.name}</p>
                  <p className="text-sm text-gray-500">{c.email} {c.phone && `· ${c.phone}`}</p>
                </div>
                <div className="flex items-center gap-2">
                  <select value={c.status} onChange={e => updateContactStatus(c.id, e.target.value)} className="text-xs border border-gray-200 rounded-lg px-2 py-1">
                    <option value="nouveau">Nouveau</option>
                    <option value="en-cours">En cours</option>
                    <option value="traite">Traité</option>
                    <option value="archive">Archivé</option>
                  </select>
                  <button onClick={() => deleteContact(c.id)} className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
              {c.service_type && <p className="text-xs text-[#00a896] font-medium mb-2">{c.service_type}</p>}
              <p className="text-gray-600 text-sm">{c.message}</p>
              <p className="text-xs text-gray-400 mt-2">{new Date(c.created_at).toLocaleDateString('fr-CA', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
            </div>
          ))}
        </div>
      )}

      {subTab === "soumissions" && (
        <div className="space-y-4">
          {quotes.length === 0 ? <EmptyState icon={<FileText />} text="Aucune soumission reçue" /> : quotes.map(q => (
            <div key={q.id} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="font-bold text-gray-800">{q.name}</p>
                  <p className="text-sm text-gray-500">{q.email} {q.phone && `· ${q.phone}`}</p>
                </div>
                <button onClick={() => deleteQuote(q.id)} className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"><Trash2 className="w-4 h-4" /></button>
              </div>
              <p className="text-xs text-[#00a896] font-medium mb-2">{q.service_type}</p>
              {q.details && <p className="text-gray-600 text-sm mb-2">{q.details}</p>}
              {q.estimated_price && <p className="font-semibold text-[#003d7a]">Estimation : {Number(q.estimated_price).toFixed(2)} $</p>}
              <p className="text-xs text-gray-400 mt-2">{new Date(q.created_at).toLocaleDateString('fr-CA', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── CLIENTS ─────────────────────────────────────────────────────────────────
function ClientsTab() {
  const [clients, setClients] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showInvite, setShowInvite] = useState(false)
  const [inviteEmail, setInviteEmail] = useState("")
  const [inviteName, setInviteName] = useState("")
  const [inviteLoading, setInviteLoading] = useState(false)

  useEffect(() => {
    supabase.from('user_profiles').select('*').eq('role', 'client').order('created_at', { ascending: false })
      .then(({ data }) => { setClients(data || []); setLoading(false) })
  }, [])

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inviteEmail) { toast.error("Entrez un courriel."); return }
    setInviteLoading(true)
    // Créer le compte via Supabase Auth avec un mot de passe temporaire
    const tempPassword = Math.random().toString(36).slice(-10) + "A1!"
    const { data, error } = await supabase.auth.admin?.createUser?.({
      email: inviteEmail,
      password: tempPassword,
      user_metadata: { name: inviteName, role: 'client' },
      email_confirm: true
    }) as any

    if (error) {
      // Fallback: utiliser signUp avec confirmation email
      const { error: signUpError } = await supabase.auth.signUp({
        email: inviteEmail,
        password: tempPassword,
        options: { data: { name: inviteName, role: 'client' } }
      })
      if (signUpError) { toast.error("Erreur: " + signUpError.message); setInviteLoading(false); return }
      toast.success(`Invitation envoyée à ${inviteEmail}. Mot de passe temporaire: ${tempPassword}`)
    } else {
      toast.success(`Client créé: ${inviteEmail}. Mot de passe temporaire: ${tempPassword}`)
    }

    setInviteLoading(false)
    setShowInvite(false)
    setInviteEmail("")
    setInviteName("")
    // Recharger la liste
    supabase.from('user_profiles').select('*').eq('role', 'client').order('created_at', { ascending: false })
      .then(({ data }) => setClients(data || []))
  }

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-[#003d7a]" /></div>

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-bold text-gray-800">{clients.length} client(s)</h2>
        <button onClick={() => setShowInvite(!showInvite)} className="flex items-center gap-2 bg-[#003d7a] hover:bg-[#002d5a] text-white text-sm font-semibold px-4 py-2 rounded-lg transition">
          <UserPlus className="w-4 h-4" /> Ajouter un client
        </button>
      </div>

      {showInvite && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-6">
          <h3 className="font-bold text-[#003d7a] mb-4">Créer un accès client</h3>
          <form onSubmit={handleInvite} className="space-y-3">
            <div className="grid md:grid-cols-2 gap-3">
              <input value={inviteName} onChange={e => setInviteName(e.target.value)} placeholder="Nom du client" className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#00a896]" />
              <input type="email" value={inviteEmail} onChange={e => setInviteEmail(e.target.value)} required placeholder="courriel@exemple.com" className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#00a896]" />
            </div>
            <p className="text-xs text-gray-500">Un mot de passe temporaire sera généré. Communiquez-le au client pour sa première connexion.</p>
            <div className="flex gap-2">
              <button type="submit" disabled={inviteLoading} className="flex items-center gap-2 bg-[#003d7a] text-white text-sm font-semibold px-4 py-2 rounded-lg transition disabled:opacity-60">
                {inviteLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />} Créer l'accès
              </button>
              <button type="button" onClick={() => setShowInvite(false)} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition">Annuler</button>
            </div>
          </form>
        </div>
      )}

      <div className="space-y-3">
        {clients.length === 0 ? <EmptyState icon={<Users />} text="Aucun client enregistré" /> : clients.map(c => (
          <div key={c.id} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 flex items-center justify-between">
            <div>
              <p className="font-semibold text-gray-800">{c.name || "Sans nom"}</p>
              <p className="text-sm text-gray-500">{c.email}</p>
              {c.phone && <p className="text-xs text-gray-400">{c.phone}</p>}
            </div>
            <p className="text-xs text-gray-400">{new Date(c.created_at).toLocaleDateString('fr-CA')}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── PROJETS ADMIN ────────────────────────────────────────────────────────────
function AdminProjectsTab() {
  const [projects, setProjects] = useState<any[]>([])
  const [clients, setClients] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ client_id: "", title: "", description: "", type: "entretien", status: "non-commence", progress_percent: 0, start_date: "", end_date: "" })

  useEffect(() => {
    Promise.all([
      supabase.from('projects').select('*, user_profiles(name, email)').order('created_at', { ascending: false }),
      supabase.from('user_profiles').select('id, name, email').eq('role', 'client')
    ]).then(([p, c]) => { setProjects(p.data || []); setClients(c.data || []); setLoading(false) })
  }, [])

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.client_id || !form.title) { toast.error("Remplissez les champs obligatoires."); return }
    const { data, error } = await supabase.from('projects').insert({ ...form, progress_percent: Number(form.progress_percent) }).select('*, user_profiles(name, email)').single()
    if (error) { toast.error("Erreur lors de la création."); return }
    setProjects(prev => [data, ...prev])
    setShowForm(false)
    setForm({ client_id: "", title: "", description: "", type: "entretien", status: "non-commence", progress_percent: 0, start_date: "", end_date: "" })
    toast.success("Projet créé !")
  }

  const updateProgress = async (id: number, progress: number) => {
    await supabase.from('projects').update({ progress_percent: progress }).eq('id', id)
    setProjects(prev => prev.map(p => p.id === id ? { ...p, progress_percent: progress } : p))
  }

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-[#003d7a]" /></div>

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-bold text-gray-800">{projects.length} projet(s)</h2>
        <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-2 bg-[#003d7a] hover:bg-[#002d5a] text-white text-sm font-semibold px-4 py-2 rounded-lg transition">
          <Plus className="w-4 h-4" /> Nouveau projet
        </button>
      </div>

      {showForm && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-6">
          <h3 className="font-bold text-[#003d7a] mb-4">Créer un projet</h3>
          <form onSubmit={handleCreate} className="space-y-3">
            <div className="grid md:grid-cols-2 gap-3">
              <select value={form.client_id} onChange={e => setForm(p => ({ ...p, client_id: e.target.value }))} required className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#00a896]">
                <option value="">Choisir un client *</option>
                {clients.map(c => <option key={c.id} value={c.id}>{c.name || c.email}</option>)}
              </select>
              <input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} required placeholder="Titre du projet *" className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#00a896]" />
            </div>
            <textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} placeholder="Description" rows={2} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#00a896] resize-none" />
            <div className="grid md:grid-cols-3 gap-3">
              <select value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value }))} className="border border-gray-300 rounded-lg px-3 py-2 text-sm">
                <option value="non-commence">Non commencé</option>
                <option value="en-cours">En cours</option>
                <option value="en-attente">En attente</option>
                <option value="complete">Complété</option>
              </select>
              <input type="date" value={form.start_date} onChange={e => setForm(p => ({ ...p, start_date: e.target.value }))} className="border border-gray-300 rounded-lg px-3 py-2 text-sm" />
              <input type="date" value={form.end_date} onChange={e => setForm(p => ({ ...p, end_date: e.target.value }))} className="border border-gray-300 rounded-lg px-3 py-2 text-sm" />
            </div>
            <div className="flex gap-2">
              <button type="submit" className="flex items-center gap-2 bg-[#003d7a] text-white text-sm font-semibold px-4 py-2 rounded-lg transition"><Plus className="w-4 h-4" /> Créer</button>
              <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition">Annuler</button>
            </div>
          </form>
        </div>
      )}

      <div className="space-y-4">
        {projects.length === 0 ? <EmptyState icon={<FolderOpen />} text="Aucun projet" /> : projects.map(p => (
          <div key={p.id} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <div className="flex items-start justify-between mb-2">
              <div>
                <p className="font-bold text-gray-800">{p.title}</p>
                <p className="text-sm text-gray-500">{p.user_profiles?.name || p.user_profiles?.email}</p>
              </div>
              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">{p.status}</span>
            </div>
            <div className="flex items-center gap-3 mt-3">
              <input type="range" min={0} max={100} value={p.progress_percent} onChange={e => updateProgress(p.id, Number(e.target.value))} className="flex-1 accent-[#003d7a]" />
              <span className="text-sm font-bold text-[#003d7a] w-10 text-right">{p.progress_percent}%</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── CONTRATS ADMIN ───────────────────────────────────────────────────────────
function AdminContractsTab() {
  const [contracts, setContracts] = useState<any[]>([])
  const [clients, setClients] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ client_id: "", title: "", content: "", amount: "" })

  useEffect(() => {
    Promise.all([
      supabase.from('contracts').select('*, user_profiles(name, email)').order('created_at', { ascending: false }),
      supabase.from('user_profiles').select('id, name, email').eq('role', 'client')
    ]).then(([c, cl]) => { setContracts(c.data || []); setClients(cl.data || []); setLoading(false) })
  }, [])

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.client_id || !form.title) { toast.error("Remplissez les champs obligatoires."); return }
    const { data, error } = await supabase.from('contracts').insert({ ...form, amount: form.amount ? Number(form.amount) : null, status: 'envoye' }).select('*, user_profiles(name, email)').single()
    if (error) { toast.error("Erreur lors de la création."); return }
    setContracts(prev => [data, ...prev])
    setShowForm(false)
    setForm({ client_id: "", title: "", content: "", amount: "" })
    toast.success("Contrat créé et envoyé au client !")
  }

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-[#003d7a]" /></div>

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-bold text-gray-800">{contracts.length} contrat(s)</h2>
        <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-2 bg-[#003d7a] hover:bg-[#002d5a] text-white text-sm font-semibold px-4 py-2 rounded-lg transition">
          <Plus className="w-4 h-4" /> Nouveau contrat
        </button>
      </div>

      {showForm && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-6">
          <h3 className="font-bold text-[#003d7a] mb-4">Créer un contrat</h3>
          <form onSubmit={handleCreate} className="space-y-3">
            <div className="grid md:grid-cols-2 gap-3">
              <select value={form.client_id} onChange={e => setForm(p => ({ ...p, client_id: e.target.value }))} required className="border border-gray-300 rounded-lg px-3 py-2 text-sm">
                <option value="">Choisir un client *</option>
                {clients.map(c => <option key={c.id} value={c.id}>{c.name || c.email}</option>)}
              </select>
              <input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} required placeholder="Titre du contrat *" className="border border-gray-300 rounded-lg px-3 py-2 text-sm" />
            </div>
            <textarea value={form.content} onChange={e => setForm(p => ({ ...p, content: e.target.value }))} placeholder="Contenu du contrat..." rows={4} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm resize-none" />
            <input type="number" step="0.01" value={form.amount} onChange={e => setForm(p => ({ ...p, amount: e.target.value }))} placeholder="Montant ($)" className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-48" />
            <div className="flex gap-2">
              <button type="submit" className="flex items-center gap-2 bg-[#003d7a] text-white text-sm font-semibold px-4 py-2 rounded-lg"><Plus className="w-4 h-4" /> Créer</button>
              <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">Annuler</button>
            </div>
          </form>
        </div>
      )}

      <div className="space-y-4">
        {contracts.length === 0 ? <EmptyState icon={<FileText />} text="Aucun contrat" /> : contracts.map(c => (
          <div key={c.id} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <div className="flex items-start justify-between">
              <div>
                <p className="font-bold text-gray-800">{c.title}</p>
                <p className="text-sm text-gray-500">{c.user_profiles?.name || c.user_profiles?.email}</p>
                {c.amount && <p className="text-[#003d7a] font-semibold mt-1">{Number(c.amount).toFixed(2)} $</p>}
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${c.status === 'complet' ? 'bg-green-100 text-green-700' : c.status === 'signe-client' ? 'bg-blue-100 text-blue-700' : 'bg-yellow-100 text-yellow-700'}`}>
                {c.status}
              </span>
            </div>
            {c.client_signature && <p className="text-xs text-green-600 mt-2 flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> {c.client_signature}</p>}
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── FACTURES ADMIN ───────────────────────────────────────────────────────────
function AdminFacturesTab() {
  const [invoices, setInvoices] = useState<any[]>([])
  const [clients, setClients] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ client_id: "", invoice_number: "", amount: "", tax: "", description: "", due_date: "" })

  useEffect(() => {
    Promise.all([
      supabase.from('invoices').select('*, user_profiles(name, email)').order('created_at', { ascending: false }),
      supabase.from('user_profiles').select('id, name, email').eq('role', 'client')
    ]).then(([inv, cl]) => { setInvoices(inv.data || []); setClients(cl.data || []); setLoading(false) })
  }, [])

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.client_id || !form.invoice_number || !form.amount) { toast.error("Remplissez les champs obligatoires."); return }
    const { data, error } = await supabase.from('invoices').insert({
      ...form, amount: Number(form.amount), tax: Number(form.tax || 0), status: 'non-paye'
    }).select('*, user_profiles(name, email)').single()
    if (error) { toast.error("Erreur: " + error.message); return }
    setInvoices(prev => [data, ...prev])
    setShowForm(false)
    setForm({ client_id: "", invoice_number: "", amount: "", tax: "", description: "", due_date: "" })
    toast.success("Facture créée !")
  }

  const markAsPaid = async (id: number) => {
    await supabase.from('invoices').update({ status: 'paye', paid_at: new Date().toISOString() }).eq('id', id)
    setInvoices(prev => prev.map(i => i.id === id ? { ...i, status: 'paye' } : i))
    toast.success("Facture marquée comme payée.")
  }

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-[#003d7a]" /></div>

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-bold text-gray-800">{invoices.length} facture(s)</h2>
        <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-2 bg-[#003d7a] hover:bg-[#002d5a] text-white text-sm font-semibold px-4 py-2 rounded-lg transition">
          <Plus className="w-4 h-4" /> Nouvelle facture
        </button>
      </div>

      {showForm && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-6">
          <h3 className="font-bold text-[#003d7a] mb-4">Créer une facture</h3>
          <form onSubmit={handleCreate} className="space-y-3">
            <div className="grid md:grid-cols-2 gap-3">
              <select value={form.client_id} onChange={e => setForm(p => ({ ...p, client_id: e.target.value }))} required className="border border-gray-300 rounded-lg px-3 py-2 text-sm">
                <option value="">Choisir un client *</option>
                {clients.map(c => <option key={c.id} value={c.id}>{c.name || c.email}</option>)}
              </select>
              <input value={form.invoice_number} onChange={e => setForm(p => ({ ...p, invoice_number: e.target.value }))} required placeholder="N° facture (ex: INV-2024-001) *" className="border border-gray-300 rounded-lg px-3 py-2 text-sm" />
            </div>
            <div className="grid md:grid-cols-3 gap-3">
              <input type="number" step="0.01" value={form.amount} onChange={e => setForm(p => ({ ...p, amount: e.target.value }))} required placeholder="Montant ($) *" className="border border-gray-300 rounded-lg px-3 py-2 text-sm" />
              <input type="number" step="0.01" value={form.tax} onChange={e => setForm(p => ({ ...p, tax: e.target.value }))} placeholder="TPS/TVQ ($)" className="border border-gray-300 rounded-lg px-3 py-2 text-sm" />
              <input type="date" value={form.due_date} onChange={e => setForm(p => ({ ...p, due_date: e.target.value }))} className="border border-gray-300 rounded-lg px-3 py-2 text-sm" />
            </div>
            <input value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} placeholder="Description" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
            <div className="flex gap-2">
              <button type="submit" className="flex items-center gap-2 bg-[#003d7a] text-white text-sm font-semibold px-4 py-2 rounded-lg"><Plus className="w-4 h-4" /> Créer</button>
              <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">Annuler</button>
            </div>
          </form>
        </div>
      )}

      <div className="space-y-4">
        {invoices.length === 0 ? <EmptyState icon={<CreditCard />} text="Aucune facture" /> : invoices.map(inv => (
          <div key={inv.id} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <div className="flex items-start justify-between">
              <div>
                <p className="font-bold text-gray-800">Facture #{inv.invoice_number}</p>
                <p className="text-sm text-gray-500">{inv.user_profiles?.name || inv.user_profiles?.email}</p>
                {inv.description && <p className="text-sm text-gray-400">{inv.description}</p>}
                <p className="text-xl font-bold text-[#003d7a] mt-1">{(Number(inv.amount) + Number(inv.tax)).toFixed(2)} $</p>
              </div>
              <div className="flex flex-col items-end gap-2">
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${inv.status === 'paye' ? 'bg-green-100 text-green-700' : inv.status === 'en-retard' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>
                  {inv.status === 'non-paye' ? 'Non payé' : inv.status === 'paye' ? 'Payé' : inv.status}
                </span>
                {inv.status === 'non-paye' && (
                  <button onClick={() => markAsPaid(inv.id)} className="text-xs bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-lg transition">
                    Marquer payé
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── AGENDA ADMIN ─────────────────────────────────────────────────────────────
function AdminAgendaTab() {
  const [schedules, setSchedules] = useState<any[]>([])
  const [clients, setClients] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ client_id: "", title: "", description: "", scheduled_at: "", duration_minutes: "60" })

  useEffect(() => {
    Promise.all([
      supabase.from('schedules').select('*, user_profiles(name, email)').order('scheduled_at', { ascending: true }),
      supabase.from('user_profiles').select('id, name, email').eq('role', 'client')
    ]).then(([s, c]) => { setSchedules(s.data || []); setClients(c.data || []); setLoading(false) })
  }, [])

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.client_id || !form.title || !form.scheduled_at) { toast.error("Remplissez les champs obligatoires."); return }
    const { data, error } = await supabase.from('schedules').insert({ ...form, duration_minutes: Number(form.duration_minutes), status: 'planifie' }).select('*, user_profiles(name, email)').single()
    if (error) { toast.error("Erreur lors de la création."); return }
    setSchedules(prev => [...prev, data].sort((a, b) => new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime()))
    setShowForm(false)
    setForm({ client_id: "", title: "", description: "", scheduled_at: "", duration_minutes: "60" })
    toast.success("Rendez-vous créé !")
  }

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-[#003d7a]" /></div>

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-bold text-gray-800">{schedules.length} rendez-vous</h2>
        <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-2 bg-[#003d7a] hover:bg-[#002d5a] text-white text-sm font-semibold px-4 py-2 rounded-lg transition">
          <Plus className="w-4 h-4" /> Nouveau rendez-vous
        </button>
      </div>

      {showForm && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-6">
          <h3 className="font-bold text-[#003d7a] mb-4">Créer un rendez-vous</h3>
          <form onSubmit={handleCreate} className="space-y-3">
            <div className="grid md:grid-cols-2 gap-3">
              <select value={form.client_id} onChange={e => setForm(p => ({ ...p, client_id: e.target.value }))} required className="border border-gray-300 rounded-lg px-3 py-2 text-sm">
                <option value="">Choisir un client *</option>
                {clients.map(c => <option key={c.id} value={c.id}>{c.name || c.email}</option>)}
              </select>
              <input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} required placeholder="Titre *" className="border border-gray-300 rounded-lg px-3 py-2 text-sm" />
            </div>
            <div className="grid md:grid-cols-2 gap-3">
              <input type="datetime-local" value={form.scheduled_at} onChange={e => setForm(p => ({ ...p, scheduled_at: e.target.value }))} required className="border border-gray-300 rounded-lg px-3 py-2 text-sm" />
              <input type="number" value={form.duration_minutes} onChange={e => setForm(p => ({ ...p, duration_minutes: e.target.value }))} placeholder="Durée (min)" className="border border-gray-300 rounded-lg px-3 py-2 text-sm" />
            </div>
            <input value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} placeholder="Description" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
            <div className="flex gap-2">
              <button type="submit" className="flex items-center gap-2 bg-[#003d7a] text-white text-sm font-semibold px-4 py-2 rounded-lg"><Plus className="w-4 h-4" /> Créer</button>
              <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">Annuler</button>
            </div>
          </form>
        </div>
      )}

      <div className="space-y-4">
        {schedules.length === 0 ? <EmptyState icon={<Calendar />} text="Aucun rendez-vous" /> : schedules.map(s => (
          <div key={s.id} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 flex gap-4">
            <div className="w-14 h-14 bg-[#003d7a]/10 rounded-xl flex flex-col items-center justify-center shrink-0">
              <span className="text-lg font-bold text-[#003d7a]">{new Date(s.scheduled_at).getDate()}</span>
              <span className="text-xs text-gray-500">{new Date(s.scheduled_at).toLocaleDateString('fr-CA', { month: 'short' })}</span>
            </div>
            <div className="flex-1">
              <p className="font-bold text-gray-800">{s.title}</p>
              <p className="text-sm text-gray-500">{s.user_profiles?.name || s.user_profiles?.email}</p>
              <p className="text-sm text-[#003d7a]">{new Date(s.scheduled_at).toLocaleTimeString('fr-CA', { hour: '2-digit', minute: '2-digit' })} — {s.duration_minutes} min</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── AVIS ADMIN ───────────────────────────────────────────────────────────────
function AvisTab() {
  const [reviews, setReviews] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.from('reviews').select('*').order('created_at', { ascending: false })
      .then(({ data }) => { setReviews(data || []); setLoading(false) })
  }, [])

  const approve = async (id: number) => {
    await supabase.from('reviews').update({ approved: true }).eq('id', id)
    setReviews(prev => prev.map(r => r.id === id ? { ...r, approved: true } : r))
    toast.success("Avis approuvé !")
  }

  const deleteReview = async (id: number) => {
    await supabase.from('reviews').delete().eq('id', id)
    setReviews(prev => prev.filter(r => r.id !== id))
    toast.success("Avis supprimé.")
  }

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-[#003d7a]" /></div>

  return (
    <div className="space-y-4">
      {reviews.length === 0 ? <EmptyState icon={<BarChart2 />} text="Aucun avis reçu" /> : reviews.map(r => (
        <div key={r.id} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-start justify-between mb-2">
            <div>
              <p className="font-bold text-gray-800">{r.name}</p>
              <p className="text-sm text-gray-500">{r.service}</p>
              <div className="flex gap-1 mt-1">{Array.from({ length: 5 }).map((_, j) => <span key={j} className={`text-sm ${j < r.rating ? 'text-yellow-400' : 'text-gray-200'}`}>★</span>)}</div>
            </div>
            <div className="flex items-center gap-2">
              {!r.approved && (
                <button onClick={() => approve(r.id)} className="text-xs bg-green-600 text-white px-3 py-1 rounded-lg hover:bg-green-700 transition">Approuver</button>
              )}
              {r.approved && <span className="text-xs text-green-600 font-medium">✓ Approuvé</span>}
              <button onClick={() => deleteReview(r.id)} className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"><Trash2 className="w-4 h-4" /></button>
            </div>
          </div>
          <p className="text-gray-600 text-sm italic">"{r.comment}"</p>
          <p className="text-xs text-gray-400 mt-2">{new Date(r.created_at).toLocaleDateString('fr-CA')}</p>
        </div>
      ))}
    </div>
  )
}

// ─── COMPOSANT VIDE ───────────────────────────────────────────────────────────
function EmptyState({ icon, text }: { icon: React.ReactNode, text: string }) {
  return (
    <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-gray-100">
      <div className="w-12 h-12 text-gray-300 mx-auto mb-3 flex items-center justify-center">{icon}</div>
      <p className="text-gray-500">{text}</p>
    </div>
  )
}
