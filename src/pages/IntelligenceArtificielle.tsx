import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Brain, BarChart3, Database, Cpu, TrendingUp, Layers,
  CheckCircle, ArrowRight, Zap, Shield, Users, Target,
  PieChart, LineChart, Network, MessageSquare, Bot, Sparkles,
  ChevronRight, Globe, Lock, Award
} from "lucide-react";

// ─── HERO ─────────────────────────────────────────────────────────────────────
function Hero() {
  return (
    <section className="relative bg-[#0a2540] text-white overflow-hidden">
      {/* Fond animé */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-500/5 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-6xl mx-auto px-6 py-24">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <Badge className="bg-teal-500/20 text-teal-300 border-teal-500/30 mb-6">
              <Sparkles className="w-3 h-3 mr-1" /> Intelligence artificielle & Solutions d’affaires
            </Badge>
            <h1 className="text-4xl lg:text-5xl font-bold mb-6 leading-tight">
              Transformez vos données en{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-blue-400">
                avantage concurrentiel
              </span>
            </h1>
            <p className="text-blue-200 text-lg mb-8 leading-relaxed">
              BeauRive Solutions intègre l'intelligence artificielle, la modélisation de données et les tableaux de bord décisionnels pour propulser la croissance des PME québécoises. Parce que le numérique sans l'IA, c'est naviguer sans boussole.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href="/calculateur-cout">
                <Button className="bg-teal-500 hover:bg-teal-600 text-white px-6 py-3 text-base">
                  Obtenir un diagnostic gratuit <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
              <Link href="/strategie">
                <Button variant="outline" className="border-white/30 text-white hover:bg-white/10 bg-transparent px-6 py-3 text-base">
                  Nos services stratégiques
                </Button>
              </Link>
            </div>
          </div>

          {/* Visualisation IA */}
          <div className="hidden lg:flex justify-center">
            <div className="relative w-80 h-80">
              {/* Cercle central */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-teal-400 to-blue-500 flex items-center justify-center shadow-2xl">
                  <Brain className="w-12 h-12 text-white" />
                </div>
              </div>
              {/* Orbites */}
              {[
                { icon: BarChart3, label: "Power BI", angle: 0, color: "bg-yellow-500" },
                { icon: Database, label: "Données", angle: 60, color: "bg-blue-500" },
                { icon: Bot, label: "Chatbot IA", angle: 120, color: "bg-purple-500" },
                { icon: TrendingUp, label: "Prédictif", angle: 180, color: "bg-green-500" },
                { icon: Network, label: "Automatisation", angle: 240, color: "bg-orange-500" },
                { icon: Target, label: "Décision", angle: 300, color: "bg-red-500" },
              ].map(({ icon: Icon, label, angle, color }) => {
                const rad = (angle * Math.PI) / 180;
                const x = 50 + 42 * Math.cos(rad);
                const y = 50 + 42 * Math.sin(rad);
                return (
                  <div key={label} className="absolute" style={{ left: `${x}%`, top: `${y}%`, transform: "translate(-50%, -50%)" }}>
                    <div className={`w-14 h-14 rounded-full ${color} flex flex-col items-center justify-center shadow-lg`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <p className="text-xs text-center text-blue-200 mt-1 whitespace-nowrap">{label}</p>
                  </div>
                );
              })}
              {/* Lignes de connexion */}
              <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100">
                {[0, 60, 120, 180, 240, 300].map(angle => {
                  const rad = (angle * Math.PI) / 180;
                  const x = 50 + 42 * Math.cos(rad);
                  const y = 50 + 42 * Math.sin(rad);
                  return <line key={angle} x1="50" y1="50" x2={x} y2={y} stroke="rgba(94,234,212,0.3)" strokeWidth="0.5" />;
                })}
              </svg>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mt-16 pt-16 border-t border-white/10">
          {[
            { value: "40%", label: "Gain de productivité moyen", icon: TrendingUp },
            { value: "3×", label: "Plus de prospects qualifiés", icon: Target },
            { value: "60%", label: "Tâches automatisables", icon: Zap },
            { value: "2026", label: "L'IA est incontournable", icon: Sparkles },
          ].map(s => (
            <div key={s.label} className="text-center">
              <s.icon className="w-6 h-6 text-teal-400 mx-auto mb-2" />
              <p className="text-3xl font-bold text-teal-400">{s.value}</p>
              <p className="text-sm text-blue-200">{s.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── SERVICES IA ──────────────────────────────────────────────────────────────
const services = [
  {
    icon: BarChart3,
    title: "Tableaux de bord Power BI",
    description: "Visualisez vos données d'affaires en temps réel. Ventes, opérations, RH, finances — tout dans un seul tableau de bord interactif et personnalisé.",
    features: ["Connexion à vos sources de données existantes", "Rapports automatisés hebdomadaires/mensuels", "Alertes intelligentes sur les indicateurs clés", "Partage sécurisé avec votre équipe"],
    color: "from-yellow-500 to-orange-500",
    badge: "Power BI",
  },
  {
    icon: Database,
    title: "Modélisation de données",
    description: "Structurez et optimisez votre patrimoine de données pour en extraire toute la valeur. De la collecte à l'analyse, nous construisons votre infrastructure data.",
    features: ["Audit et cartographie de vos données", "Modélisation relationnelle et dimensionnelle", "Entrepôt de données (Data Warehouse)", "Gouvernance et qualité des données"],
    color: "from-blue-500 to-cyan-500",
    badge: "Data Engineering",
  },
  {
    icon: Brain,
    title: "Système d’aide à la décision",
    description: "Transformez l'incertitude en stratégie. Nos modèles d'analyse prédictive et prescriptive vous donnent une longueur d'avance sur vos concurrents.",
    features: ["Analyse prédictive des tendances", "Simulation de scénarios business", "Optimisation des ressources et des coûts", "Recommandations basées sur les données"],
    color: "from-purple-500 to-pink-500",
    badge: "IA Décisionnelle",
  },
  {
    icon: Bot,
    title: "Chatbots & Assistants IA",
    description: "Automatisez le service client, la prise de rendez-vous et la qualification des leads avec des agents conversationnels intelligents disponibles 24/7.",
    features: ["Chatbot sur votre site web", "Intégration WhatsApp / Messenger", "Qualification automatique des prospects", "Escalade intelligente vers un humain"],
    color: "from-teal-500 to-green-500",
    badge: "Automatisation",
  },
  {
    icon: Cpu,
    title: "Automatisation des processus",
    description: "Éliminez les tâches répétitives à faible valeur ajoutée. Nos solutions RPA et IA libèrent votre équipe pour se concentrer sur ce qui compte vraiment.",
    features: ["Automatisation des rapports et factures", "Synchronisation entre systèmes (CRM, ERP, etc.)", "Workflows intelligents avec conditions", "Monitoring et alertes en temps réel"],
    color: "from-orange-500 to-red-500",
    badge: "RPA & IA",
  },
  {
    icon: LineChart,
    title: "Analyse prédictive marketing",
    description: "Anticipez les comportements de vos clients, optimisez vos campagnes et maximisez votre ROI grâce aux modèles d'apprentissage automatique.",
    features: ["Segmentation client par IA", "Prédiction du churn (départ client)", "Optimisation des prix dynamique", "Attribution multi-canal"],
    color: "from-indigo-500 to-purple-500",
    badge: "Marketing IA",
  },
];

function ServicesSection() {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-16">
          <Badge className="bg-teal-100 text-teal-700 mb-4">Nos Services IA</Badge>
          <h2 className="text-3xl lg:text-4xl font-bold text-[#0a2540] mb-4">Solutions d'Intelligence Artificielle</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">Des solutions concrètes, adaptées aux PME québécoises, déployées rapidement et avec un retour sur investissement mesurable.</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map(s => (
            <Card key={s.title} className="group hover:shadow-xl transition-all duration-300 border-0 shadow-md overflow-hidden">
              <div className={`h-2 bg-gradient-to-r ${s.color}`} />
              <CardContent className="pt-6">
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center`}>
                    <s.icon className="w-6 h-6 text-white" />
                  </div>
                  <Badge variant="outline" className="text-xs">{s.badge}</Badge>
                </div>
                <h3 className="font-bold text-lg text-[#0a2540] mb-2">{s.title}</h3>
                <p className="text-gray-600 text-sm mb-4 leading-relaxed">{s.description}</p>
                <ul className="space-y-1.5">
                  {s.features.map(f => (
                    <li key={f} className="flex items-start gap-2 text-sm text-gray-700">
                      <CheckCircle className="w-4 h-4 text-teal-500 shrink-0 mt-0.5" />
                      {f}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── POWER BI FOCUS ───────────────────────────────────────────────────────────
function PowerBISection() {
  return (
    <section className="py-20 bg-gradient-to-br from-[#0a2540] to-[#1a3a5c] text-white">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <Badge className="bg-yellow-500/20 text-yellow-300 border-yellow-500/30 mb-6">
              <BarChart3 className="w-3 h-3 mr-1" /> Microsoft Power BI
            </Badge>
            <h2 className="text-3xl lg:text-4xl font-bold mb-6">
              Vos données parlent. <br />
              <span className="text-yellow-400">Apprenez à les écouter.</span>
            </h2>
            <p className="text-blue-200 mb-8 leading-relaxed">
              Power BI est l'outil de visualisation le plus puissant du marché. BeauRive Solutions vous accompagne de la connexion de vos sources de données jusqu'à la formation de votre équipe, en passant par la conception de tableaux de bord sur mesure.
            </p>
            <div className="space-y-4">
              {[
                { icon: Database, title: "Connexion multi-sources", desc: "Excel, SQL, Salesforce, QuickBooks, Google Analytics, et 200+ connecteurs" },
                { icon: PieChart, title: "Visualisations interactives", desc: "Graphiques dynamiques, cartes géographiques, matrices et KPIs en temps réel" },
                { icon: Shield, title: "Sécurité entreprise", desc: "Contrôle d'accès par rôle, chiffrement des données, conformité à la Loi 25" },
                { icon: Users, title: "Collaboration d'équipe", desc: "Partage de rapports, commentaires, alertes et abonnements automatiques" },
              ].map(item => (
                <div key={item.title} className="flex gap-4">
                  <div className="w-10 h-10 rounded-lg bg-yellow-500/20 flex items-center justify-center shrink-0">
                    <item.icon className="w-5 h-5 text-yellow-400" />
                  </div>
                  <div>
                    <h4 className="font-semibold">{item.title}</h4>
                    <p className="text-blue-200 text-sm">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Mockup dashboard */}
          <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-3 h-3 rounded-full bg-red-400" />
              <div className="w-3 h-3 rounded-full bg-yellow-400" />
              <div className="w-3 h-3 rounded-full bg-green-400" />
              <span className="text-xs text-blue-300 ml-2">Tableau de bord BeauRive — Exemple</span>
            </div>
            {/* KPIs */}
            <div className="grid grid-cols-3 gap-3 mb-4">
              {[
                { label: "Revenus MTD", value: "48 250 $", trend: "+12%", color: "text-green-400" },
                { label: "Clients actifs", value: "127", trend: "+8%", color: "text-teal-400" },
                { label: "Taux satisfaction", value: "96%", trend: "+2%", color: "text-yellow-400" },
              ].map(kpi => (
                <div key={kpi.label} className="bg-white/5 rounded-lg p-3">
                  <p className="text-xs text-blue-300">{kpi.label}</p>
                  <p className="text-lg font-bold">{kpi.value}</p>
                  <p className={`text-xs ${kpi.color}`}>{kpi.trend} vs mois dernier</p>
                </div>
              ))}
            </div>
            {/* Barres simulées */}
            <div className="bg-white/5 rounded-lg p-3 mb-3">
              <p className="text-xs text-blue-300 mb-2">Revenus par service (6 derniers mois)</p>
              <div className="space-y-2">
                {[
                  { label: "Ménage résidentiel", pct: 65, color: "bg-teal-500" },
                  { label: "Ménage commercial", pct: 45, color: "bg-blue-500" },
                  { label: "Stratégie d'affaires", pct: 30, color: "bg-purple-500" },
                  { label: "Solutions IA", pct: 20, color: "bg-yellow-500" },
                ].map(bar => (
                  <div key={bar.label} className="flex items-center gap-2">
                    <span className="text-xs text-blue-300 w-36 shrink-0">{bar.label}</span>
                    <div className="flex-1 bg-white/10 rounded-full h-2">
                      <div className={`${bar.color} h-2 rounded-full`} style={{ width: `${bar.pct}%` }} />
                    </div>
                    <span className="text-xs text-white w-8 text-right">{bar.pct}%</span>
                  </div>
                ))}
              </div>
            </div>
            <p className="text-xs text-center text-blue-400 italic">Exemple illustratif — Données fictives</p>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── PROCESSUS ────────────────────────────────────────────────────────────────
function ProcessSection() {
  const steps = [
    { num: "01", title: "Diagnostic IA", desc: "Audit de vos processus, identification des opportunités d'automatisation et des données disponibles. Livrable : rapport de maturité numérique.", icon: Target },
    { num: "02", title: "Architecture Data", desc: "Conception de votre infrastructure de données : sources, entrepôt, pipelines ETL et gouvernance. Fondation solide pour toutes les analyses futures.", icon: Database },
    { num: "03", title: "Développement & Intégration", desc: "Développement des tableaux de bord, modèles d’IA et automatisations. Intégration avec vos outils existants (CRM, ERP, comptabilité).", icon: Cpu },
    { num: "04", title: "Formation & Adoption", desc: "Formation de votre équipe, documentation et support continu. Nous nous assurons que vos outils sont réellement utilisés et génèrent de la valeur.", icon: Users },
  ];

  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-16">
          <Badge className="bg-purple-100 text-purple-700 mb-4">Notre Approche</Badge>
          <h2 className="text-3xl lg:text-4xl font-bold text-[#0a2540] mb-4">Un processus éprouvé en 4 étapes</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">De l'idée à l'impact mesurable, nous vous accompagnons à chaque étape de votre transformation numérique.</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, i) => (
            <div key={step.num} className="relative">
              {i < steps.length - 1 && (
                <div className="hidden lg:block absolute top-8 left-full w-full h-0.5 bg-gradient-to-r from-teal-300 to-transparent z-0" style={{ width: "calc(100% - 2rem)" }} />
              )}
              <div className="relative z-10">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-teal-500 to-blue-600 flex items-center justify-center mb-4 shadow-lg">
                  <step.icon className="w-8 h-8 text-white" />
                </div>
                <span className="text-4xl font-black text-gray-100 absolute -top-2 -left-2 z-0">{step.num}</span>
                <h3 className="font-bold text-lg text-[#0a2540] mb-2 relative z-10">{step.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── LOI 25 & ÉTHIQUE ─────────────────────────────────────────────────────────
function EthicsSection() {
  return (
    <section className="py-16 bg-white">
      <div className="max-w-4xl mx-auto px-6">
        <Card className="border-2 border-teal-200 bg-gradient-to-br from-teal-50 to-blue-50">
          <CardContent className="pt-8 pb-8">
            <div className="flex items-start gap-6">
              <div className="w-16 h-16 rounded-2xl bg-teal-600 flex items-center justify-center shrink-0">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <h3 className="text-xl font-bold text-[#0a2540]">IA responsable & Conformité à la Loi 25</h3>
                  <Badge className="bg-teal-600 text-white">Québec</Badge>
                </div>
                <p className="text-gray-700 mb-4 leading-relaxed">
                  Chez BeauRive Solutions, nous développons des solutions d'IA éthiques et conformes à la Loi 25 sur la protection des renseignements personnels. Toutes nos solutions respectent les principes de transparence, d'équité et de minimisation des données.
                </p>
                <div className="grid sm:grid-cols-3 gap-4">
                  {[
                    { icon: Lock, title: "Confidentialité by Design", desc: "Protection des données intégrée dès la conception" },
                    { icon: Globe, title: "Hébergement Québec/Canada", desc: "Vos données restent sur le territoire canadien" },
                    { icon: Award, title: "Conformité Loi 25", desc: "Évaluation des facteurs relatifs à la vie privée (EFVP)" },
                  ].map(item => (
                    <div key={item.title} className="bg-white rounded-xl p-4 shadow-sm">
                      <item.icon className="w-6 h-6 text-teal-600 mb-2" />
                      <h4 className="font-semibold text-sm text-[#0a2540]">{item.title}</h4>
                      <p className="text-xs text-gray-600">{item.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}

// ─── CTA ──────────────────────────────────────────────────────────────────────
function CTASection() {
  return (
    <section className="py-20 bg-gradient-to-r from-teal-600 to-blue-700 text-white">
      <div className="max-w-4xl mx-auto px-6 text-center">
        <Sparkles className="w-12 h-12 mx-auto mb-6 text-teal-200" />
        <h2 className="text-3xl lg:text-4xl font-bold mb-4">Prêt à passer à l'ère de l'IA ?</h2>
        <p className="text-teal-100 text-lg mb-8 max-w-2xl mx-auto">
          Obtenez votre diagnostic IA gratuit. En 30 minutes, nous identifions les 3 opportunités les plus rentables pour votre entreprise.
        </p>
        <div className="flex flex-wrap gap-4 justify-center">
          <Link href="/calculateur-cout">
            <Button className="bg-white text-teal-700 hover:bg-teal-50 px-8 py-3 text-base font-semibold">
              Diagnostic IA gratuit <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </Link>
          <Link href="/strategie">
            <Button variant="outline" className="border-white/40 text-white hover:bg-white/10 bg-transparent px-8 py-3 text-base">
              En savoir plus
            </Button>
          </Link>
        </div>
        <p className="text-teal-200 text-sm mt-6">Aucun engagement · Réponse sous 24 h · Consultation en français</p>
      </div>
    </section>
  );
}

// ─── COMPOSANT PRINCIPAL ──────────────────────────────────────────────────────
export default function IntelligenceArtificielle() {
  return (
    <div className="min-h-screen">
      <Hero />
      <ServicesSection />
      <PowerBISection />
      <ProcessSection />
      <EthicsSection />
      <CTASection />
    </div>
  );
}
