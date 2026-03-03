import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import {
  ArrowLeft, CheckCircle2, Loader2, Briefcase, TrendingUp, Code, PieChart,
  Facebook, Instagram, Globe, Search, Star, Phone, Mail, Calendar, Zap,
  BarChart3, MessageSquare, Target, Award, Brain, Bot, Sparkles, Cpu,
  FileText, LineChart, Clock, ShieldCheck, Lightbulb, Rocket, User, LogIn
} from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";

function MonEspaceStratBtn() {
  const { user, loading } = useAuth();
  if (loading) return null;
  return user ? (
    <Link
      href="/mon-espace"
      className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#003d7a] text-white text-sm font-bold hover:bg-[#002d5a] transition-all shadow-sm no-underline"
    >
      <User className="w-4 h-4" />
      Mon Espace
    </Link>
  ) : (
    <a
      href={getLoginUrl()}
      className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#003d7a] text-white text-sm font-bold hover:bg-[#002d5a] transition-all shadow-sm no-underline"
    >
      <LogIn className="w-4 h-4" />
      Se connecter
    </a>
  );
}

export default function StrategyDept() {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, []);

  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [showConsultForm, setShowConsultForm] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    message: "",
  });

  const submitMutation = trpc.contact.submit.useMutation({
    onSuccess: () => {
      toast.success("✅ Votre demande de consultation gratuite a été reçue ! Nous vous contacterons sous 24h.");
      setFormData({ name: "", email: "", phone: "", company: "", message: "" });
      setShowConsultForm(false);
    },
    onError: () => {
      toast.error("Une erreur s'est produite. Veuillez réessayer.");
    },
  });

  const services = [
    {
      id: "logo-design",
      title: "Création de logo",
      description: "Identité visuelle unique et mémorable",
      icon: <Award className="w-8 h-8 text-[#00a896]" />,
      color: "from-purple-50 to-purple-100",
      details: "Nous créons des logos professionnels et distinctifs qui représentent votre entreprise et vos valeurs. Processus créatif collaboratif avec plusieurs concepts et révisions illimitées jusqu'à votre satisfaction complète.",
      deliverables: [
        "3 concepts originaux au départ",
        "Révisions illimitées",
        "Fichiers vectoriels (SVG, AI, EPS)",
        "Formats web (PNG, JPG, WebP)",
        "Variantes couleur (pleine couleur, noir/blanc)",
        "Guide d'utilisation de la marque",
      ],
    },
    {
      id: "web-design",
      title: "Conception de sites web",
      description: "Sites modernes, responsifs et optimisés pour convertir",
      icon: <Globe className="w-8 h-8 text-[#00a896]" />,
      color: "from-blue-50 to-blue-100",
      details: "Sites web professionnels conçus pour convertir les visiteurs en clients. Responsive, rapides, sécurisés et optimisés pour les moteurs de recherche. Chaque forfait inclut un nom de domaine (.ca ou .com) et 1 boîte courriel professionnelle.",
      deliverables: [
        "Design responsive (mobile, tablette, bureau)",
        "Nom de domaine .ca ou .com inclus (1 an)",
        "Boîtes courriel professionnelles incluses",
        "Optimisation SEO de base intégrée",
        "Formulaires de contact et de soumission",
        "Intégration Google Analytics",
        "Hébergement sécurisé (1 an inclus)",
        "Formation à la gestion du contenu",
      ],
      highlight: true,
    },
    {
      id: "digital-marketing",
      title: "Marketing numérique",
      description: "Gestion complète de votre présence en ligne",
      icon: <TrendingUp className="w-8 h-8 text-[#00a896]" />,
      color: "from-teal-50 to-teal-100",
      details: "Stratégies marketing complètes pour augmenter votre visibilité en ligne et attirer de nouveaux clients. Nous gérons vos plateformes numériques de A à Z avec des rapports mensuels clairs.",
      deliverables: [
        "Gestion page Facebook (publications, réponses, publicités)",
        "Gestion compte Instagram (stories, reels, publications)",
        "Optimisation Google Business Profile",
        "Stratégie SEO locale (Québec, Beauce, Chaudière-Appalaches)",
        "Rapports de performance mensuels",
        "Publicités ciblées (budget client)",
      ],
    },
    {
      id: "business-plan",
      title: "Élaboration de Business Plans",
      description: "Plans d'affaires structurés pour guider votre croissance",
      icon: <PieChart className="w-8 h-8 text-[#00a896]" />,
      color: "from-orange-50 to-orange-100",
      details: "Plans d'affaires complets et professionnels pour guider la croissance et le développement de votre entreprise. Incluent analyses de marché, projections financières et stratégies de croissance adaptées à votre réalité.",
      deliverables: [
        "Analyse de marché et de la concurrence",
        "Projections financières sur 3 ans",
        "Stratégie de croissance et de mise en marché",
        "Plan d'action avec jalons clairs",
        "Présentation pour investisseurs ou banques",
        "Révision après 6 mois incluse",
      ],
    },
  ];

  const handleServiceClick = (serviceId: string) => {
    setSelectedService(selectedService === serviceId ? null : serviceId);
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email) {
      toast.error("Veuillez remplir les champs obligatoires.");
      return;
    }
    submitMutation.mutate({
      ...formData,
      serviceType: "strategie-affaires",
      company: formData.company || "",
      phone: formData.phone || "",
    });
  };

  return (
    <div className="w-full">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
        <div className="container mx-auto px-4 py-3 flex flex-wrap justify-between items-center gap-2">
          <Link to="/">
            <Button variant="ghost" className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              Retour
            </Button>
          </Link>
          <h1 className="text-lg font-bold text-[#003d7a] hidden md:block">Stratégie d’affaires</h1>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="border-[#003d7a] text-[#003d7a] hover:bg-[#003d7a] hover:text-white gap-2 text-sm hidden md:flex"
              onClick={() => document.getElementById('intelligence-artificielle')?.scrollIntoView({ behavior: 'smooth' })}
            >
              <Brain className="w-4 h-4" />
              Intelligence Artificielle
            </Button>
            <Button
              onClick={() => setShowConsultForm(true)}
              size="sm"
              className="bg-[#00a896] hover:bg-[#008f80] text-white text-sm hidden md:flex"
            >
              <Calendar className="w-4 h-4 mr-2" />
              Consultation gratuite
            </Button>
            <MonEspaceStratBtn />
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-[#003d7a] to-[#00a896] text-white py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl">
            <Badge className="bg-white/20 text-white border-white/30 mb-4 text-sm px-4 py-1">
              <Star className="w-3 h-3 mr-1" />
              Consultation initiale 100 % gratuite
            </Badge>
            <h2 className="text-3xl md:text-5xl font-bold mb-6 leading-tight">
              Développez votre entreprise avec une stratégie numérique gagnante
            </h2>
            <p className="text-lg opacity-90 mb-8 leading-relaxed">
              Nous aidons les PME de la région de Québec et de la Beauce à structurer leur croissance grâce au marketing numérique, à la création de leur identité visuelle et à l'élaboration de plans d'affaires solides.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button
                onClick={() => setShowConsultForm(true)}
                size="lg"
                className="bg-white text-[#003d7a] hover:bg-gray-100 font-bold px-8"
              >
                <Phone className="w-5 h-5 mr-2" />
                Consultation gratuite
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="border-white/50 text-white hover:bg-white/10 bg-transparent"
                onClick={() => document.getElementById("services")?.scrollIntoView({ behavior: "smooth" })}
              >
                Voir nos services
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="border-[#00a896] text-[#00a896] hover:bg-[#00a896] hover:text-white bg-transparent gap-2"
                onClick={() => document.getElementById("intelligence-artificielle")?.scrollIntoView({ behavior: "smooth" })}
              >
                <Brain className="w-5 h-5" />
                Intelligence Artificielle
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Bannière Consultation Gratuite */}
      <section className="bg-[#00a896] py-6">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3 text-white">
              <Zap className="w-6 h-6 flex-shrink-0" />
              <p className="font-semibold text-lg">
                Première consultation stratégique <span className="underline">entièrement gratuite</span> — Sans engagement, sans pression
              </p>
            </div>
            <Button
              onClick={() => setShowConsultForm(true)}
              className="bg-white text-[#00a896] hover:bg-gray-100 font-bold px-6 flex-shrink-0"
            >
              Réserver maintenant
            </Button>
          </div>
        </div>
      </section>

      {/* Marketing Numérique — Section Détaillée */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <Badge className="bg-teal-100 text-teal-700 border-teal-200 mb-3">Marketing Numérique</Badge>
            <h3 className="text-3xl font-bold text-[#003d7a] mb-4">Votre Présence en Ligne, Gérée Professionnellement</h3>
            <p className="text-gray-600 max-w-2xl mx-auto text-lg">
              Nous prenons en charge toutes vos plateformes numériques pour que vous puissiez vous concentrer sur votre cœur de métier.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {/* Facebook */}
            <Card className="border-2 border-blue-100 hover:border-blue-300 transition-all hover:shadow-lg">
              <CardHeader className="pb-3">
                <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center mb-3">
                  <Facebook className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="text-lg text-blue-700">Page Facebook</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 text-sm mb-4">Gestion complète de votre page Facebook pour engager votre communauté locale.</p>
                <ul className="space-y-2">
                  {[
                    "Publications régulières (3-5/sem.)",
                    "Réponse aux commentaires et messages",
                    "Création de publicités ciblées",
                    "Gestion des avis clients",
                    "Rapports d'engagement mensuels",
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                      <CheckCircle2 className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
                      {item}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Instagram */}
            <Card className="border-2 border-pink-100 hover:border-pink-300 transition-all hover:shadow-lg">
              <CardHeader className="pb-3">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 rounded-xl flex items-center justify-center mb-3">
                  <Instagram className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="text-lg text-pink-700">Compte Instagram</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 text-sm mb-4">Présence visuelle forte sur Instagram pour attirer une clientèle plus jeune et dynamique.</p>
                <ul className="space-y-2">
                  {[
                    "Publications et stories quotidiennes",
                    "Création de Reels engageants",
                    "Gestion des hashtags locaux",
                    "Interaction avec la communauté",
                    "Analyse des performances",
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                      <CheckCircle2 className="w-4 h-4 text-pink-500 flex-shrink-0 mt-0.5" />
                      {item}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Google Business */}
            <Card className="border-2 border-green-100 hover:border-green-300 transition-all hover:shadow-lg">
              <CardHeader className="pb-3">
                <div className="w-12 h-12 bg-green-600 rounded-xl flex items-center justify-center mb-3">
                  <Globe className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="text-lg text-green-700">Google Business</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 text-sm mb-4">Optimisation de votre fiche Google pour apparaître en tête des recherches locales.</p>
                <ul className="space-y-2">
                  {[
                    "Optimisation complète de la fiche",
                    "Gestion et réponse aux avis",
                    "Publications Google Posts",
                    "Photos professionnelles",
                    "Suivi du classement local",
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                      <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                      {item}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* SEO */}
            <Card className="border-2 border-orange-100 hover:border-orange-300 transition-all hover:shadow-lg">
              <CardHeader className="pb-3">
                <div className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center mb-3">
                  <Search className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="text-lg text-orange-700">SEO Local</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 text-sm mb-4">Référencement naturel ciblé pour la région de Québec, Beauce et Chaudière-Appalaches.</p>
                <ul className="space-y-2">
                  {[
                    "Audit SEO initial gratuit",
                    "Optimisation mots-clés locaux",
                    "Création de contenu optimisé",
                    "Backlinks de qualité",
                    "Rapport de positionnement mensuel",
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                      <CheckCircle2 className="w-4 h-4 text-orange-500 flex-shrink-0 mt-0.5" />
                      {item}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Stats marketing */}
          <div className="bg-gradient-to-r from-[#003d7a] to-[#005a9e] rounded-2xl p-8 text-white">
            <h4 className="text-xl font-bold text-center mb-8">Pourquoi le Marketing Numérique est Essentiel pour Votre PME</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              {[
                { stat: "97%", label: "des consommateurs recherchent une entreprise locale en ligne avant de la visiter" },
                { stat: "3.5×", label: "plus de prospects générés par une fiche Google Business bien optimisée" },
                { stat: "78%", label: "des PME qui investissent en marketing numérique voient leur chiffre d'affaires augmenter" },
                { stat: "24/7", label: "votre présence en ligne travaille pour vous, même quand vous dormez" },
              ].map((item, i) => (
                <div key={i}>
                  <p className="text-4xl font-bold text-[#00a896] mb-2">{item.stat}</p>
                  <p className="text-white/80 text-sm leading-snug">{item.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-16 bg-gray-50" id="services">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10">
            <h3 className="text-3xl font-bold text-[#003d7a] mb-3">Tous nos services</h3>
            <p className="text-gray-600">Cliquez sur un service pour voir les détails et livrables</p>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {services.map((service) => (
              <Card
                key={service.id}
                className={`cursor-pointer transition-all hover:shadow-xl ${
                  selectedService === service.id ? "ring-2 ring-[#00a896] shadow-lg" : ""
                } ${service.highlight ? "border-[#00a896] border-2" : ""}`}
                onClick={() => handleServiceClick(service.id)}
              >
                <CardHeader>
                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-xl bg-gradient-to-br ${service.color}`}>
                      {service.icon}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <CardTitle className="text-lg">{service.title}</CardTitle>
                        {service.highlight && (
                          <Badge className="bg-[#00a896] text-white text-xs">Populaire</Badge>
                        )}
                      </div>
                      <CardDescription className="text-sm">{service.description}</CardDescription>
                    </div>
                    <div className="text-gray-400 text-sm">
                      {selectedService === service.id ? "▲" : "▼"}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 text-sm">{service.details}</p>
                  {selectedService === service.id && (
                    <div className="mt-5 pt-5 border-t border-gray-100">
                      <p className="font-semibold text-sm text-[#003d7a] mb-3 uppercase tracking-wide">Ce qui est inclus :</p>
                      <div className="grid grid-cols-1 gap-2">
                        {service.deliverables.map((item, idx) => (
                          <div key={idx} className="flex items-center gap-2 text-sm text-gray-700 bg-gray-50 rounded-lg px-3 py-2">
                            <CheckCircle2 className="w-4 h-4 text-[#00a896] flex-shrink-0" />
                            {item}
                          </div>
                        ))}
                      </div>
                      <Button
                        onClick={(e) => { e.stopPropagation(); setShowConsultForm(true); }}
                        className="w-full mt-4 bg-[#003d7a] hover:bg-[#002d5a] text-white"
                      >
                        <Calendar className="w-4 h-4 mr-2" />
                        Consultation gratuite pour ce service
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Grille Tarifaire Sites Web */}
      <section className="py-20 bg-gradient-to-b from-gray-50 to-white" id="tarifs-web">
        <div className="container mx-auto px-4">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-semibold mb-4">
              <Globe className="w-4 h-4" />
              Service le plus populaire
            </div>
            <h3 className="text-3xl md:text-4xl font-bold text-[#003d7a] mb-4">Forfaits de Conception de Sites Web</h3>
            <p className="text-gray-600 max-w-2xl mx-auto text-lg">
              Chaque forfait inclut un <strong>nom de domaine .ca ou .com</strong> et des <strong>boîtes courriel professionnelles</strong> (ex. : info@votreentreprise.ca). Aucun frais caché.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Forfait Démarrage */}
            <div className="bg-white rounded-2xl border-2 border-gray-200 p-8 flex flex-col hover:border-[#003d7a] hover:shadow-xl transition-all">
              <div className="mb-6">
                <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">Démarrage</p>
                <div className="flex items-end gap-1 mb-1">
                  <span className="text-5xl font-bold text-[#003d7a]">499</span>
                  <span className="text-gray-500 mb-2">$</span>
                </div>
                <p className="text-gray-500 text-sm">+ 19 $/mois après la 1ère année</p>
                <p className="text-[#00a896] font-semibold text-sm mt-2">Idéal pour : Artisans, thérapeutes, consultants, petits commerces</p>
              </div>
              <div className="border-t pt-6 flex-1">
                <p className="font-semibold text-gray-800 mb-4 text-sm uppercase tracking-wide">Ce qui est inclus :</p>
                <ul className="space-y-3">
                  {[
                    { label: "Site vitrine jusqu'à 5 pages", included: true },
                    { label: "Nom de domaine .ca ou .com (1 an)", included: true },
                    { label: "1 boîte courriel professionnelle", included: true },
                    { label: "Hébergement sécurisé (1 an)", included: true },
                    { label: "Design responsive mobile/tablette", included: true },
                    { label: "Formulaire de contact", included: true },
                    { label: "Intégration Google Maps", included: true },
                    { label: "Optimisation SEO de base", included: true },
                    { label: "Formation de 1h incluse", included: true },
                    { label: "Boutique en ligne", included: false },
                    { label: "Blog intégré", included: false },
                    { label: "Système de réservation", included: false },
                  ].map((item, i) => (
                    <li key={i} className={`flex items-center gap-3 text-sm ${item.included ? "text-gray-700" : "text-gray-300"}`}>
                      {item.included
                        ? <CheckCircle2 className="w-4 h-4 text-[#00a896] flex-shrink-0" />
                        : <span className="w-4 h-4 flex-shrink-0 text-center text-gray-300">—</span>
                      }
                      {item.label}
                    </li>
                  ))}
                </ul>
              </div>
              <Button
                onClick={() => setShowConsultForm(true)}
                variant="outline"
                className="mt-8 w-full border-[#003d7a] text-[#003d7a] hover:bg-[#003d7a] hover:text-white font-semibold py-3"
              >
                Choisir Démarrage
              </Button>
            </div>

            {/* Forfait Professionnel — Populaire */}
            <div className="bg-[#003d7a] rounded-2xl border-2 border-[#003d7a] p-8 flex flex-col shadow-2xl relative mt-6 md:mt-0">
              <div className="absolute -top-5 left-0 right-0 flex justify-center">
                <span className="bg-[#00a896] text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-lg uppercase tracking-wide whitespace-nowrap">
                  ⭐ Le Plus Populaire
                </span>
              </div>
              <div className="mb-6 mt-4">
                <p className="text-sm font-semibold text-white/60 uppercase tracking-wide mb-2">Professionnel</p>
                <div className="flex items-end gap-1 mb-1">
                  <span className="text-5xl font-bold text-white">999</span>
                  <span className="text-white/60 mb-2">$</span>
                </div>
                <p className="text-white/60 text-sm">+ 34 $/mois après la 1ère année</p>
                <p className="text-[#00a896] font-semibold text-sm mt-2">Idéal pour : PME, restaurants, cliniques, entreprises de services</p>
              </div>
              <div className="border-t border-white/20 pt-6 flex-1">
                <p className="font-semibold text-white/80 mb-4 text-sm uppercase tracking-wide">Ce qui est inclus :</p>
                <ul className="space-y-3">
                  {[
                    { label: "Site jusqu'à 10 pages", included: true },
                    { label: "Nom de domaine .ca ou .com (1 an)", included: true },
                    { label: "5 boîtes courriel professionnelles", included: true },
                    { label: "Hébergement sécurisé (1 an)", included: true },
                    { label: "Design responsive + animations", included: true },
                    { label: "Formulaires de contact et soumission", included: true },
                    { label: "Blog intégré (actualités)", included: true },
                    { label: "Optimisation SEO avancée", included: true },
                    { label: "Intégration Google Analytics", included: true },
                    { label: "Formation de 2h incluse", included: true },
                    { label: "Boutique en ligne (jusqu'à 20 produits)", included: true },
                    { label: "Système de réservation", included: false },
                  ].map((item, i) => (
                    <li key={i} className={`flex items-center gap-3 text-sm ${item.included ? "text-white" : "text-white/30"}`}>
                      {item.included
                        ? <CheckCircle2 className="w-4 h-4 text-[#00a896] flex-shrink-0" />
                        : <span className="w-4 h-4 flex-shrink-0 text-center">—</span>
                      }
                      {item.label}
                    </li>
                  ))}
                </ul>
              </div>
              <Button
                onClick={() => setShowConsultForm(true)}
                className="mt-8 w-full bg-white hover:bg-gray-100 text-[#003d7a] font-bold py-3 text-base rounded-xl border-0"
              >
                Choisir Professionnel
              </Button>
            </div>

            {/* Forfait Affaires */}
            <div className="bg-white rounded-2xl border-2 border-gray-200 p-8 flex flex-col hover:border-[#003d7a] hover:shadow-xl transition-all">
              <div className="mb-6">
                <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">Affaires</p>
                <div className="flex items-end gap-1 mb-1">
                  <span className="text-5xl font-bold text-[#003d7a]">1 799</span>
                  <span className="text-gray-500 mb-2">$</span>
                </div>
                <p className="text-gray-500 text-sm">+ 49 $/mois après la 1ère année</p>
                <p className="text-[#00a896] font-semibold text-sm mt-2">Idéal pour : Entreprises en croissance, e-commerce, multi-services</p>
              </div>
              <div className="border-t pt-6 flex-1">
                <p className="font-semibold text-gray-800 mb-4 text-sm uppercase tracking-wide">Ce qui est inclus :</p>
                <ul className="space-y-3">
                  {[
                    { label: "Site illimité en pages", included: true },
                    { label: "Nom de domaine .ca ou .com (1 an)", included: true },
                    { label: "5 boîtes courriel professionnelles", included: true },
                    { label: "Hébergement premium (1 an)", included: true },
                    { label: "Design sur mesure + animations avancées", included: true },
                    { label: "Boutique en ligne illimitée", included: true },
                    { label: "Système de réservation en ligne", included: true },
                    { label: "Blog + espace membres", included: true },
                    { label: "SEO avancé + rapport mensuel", included: true },
                    { label: "Intégration paiement en ligne", included: true },
                    { label: "Formation de 3h + support 3 mois", included: true },
                    { label: "Maintenance mensuelle incluse", included: true },
                  ].map((item, i) => (
                    <li key={i} className={`flex items-center gap-3 text-sm ${item.included ? "text-gray-700" : "text-gray-300"}`}>
                      {item.included
                        ? <CheckCircle2 className="w-4 h-4 text-[#00a896] flex-shrink-0" />
                        : <span className="w-4 h-4 flex-shrink-0 text-center text-gray-300">—</span>
                      }
                      {item.label}
                    </li>
                  ))}
                </ul>
              </div>
              <Button
                onClick={() => setShowConsultForm(true)}
                variant="outline"
                className="mt-8 w-full border-[#003d7a] text-[#003d7a] hover:bg-[#003d7a] hover:text-white font-semibold py-3"
              >
                Choisir Affaires
              </Button>
            </div>
          </div>

          {/* Note de bas de grille */}
          <div className="mt-12 bg-blue-50 border border-blue-100 rounded-2xl p-6 max-w-4xl mx-auto">
            <div className="grid md:grid-cols-3 gap-6 text-center">
              <div>
                <Globe className="w-8 h-8 text-[#003d7a] mx-auto mb-2" />
                <p className="font-semibold text-[#003d7a] mb-1">Domaine inclus</p>
                <p className="text-gray-600 text-sm">Votre adresse web .ca ou .com est incluse dans tous les forfaits pour la première année.</p>
              </div>
              <div>
                <Mail className="w-8 h-8 text-[#003d7a] mx-auto mb-2" />
                <p className="font-semibold text-[#003d7a] mb-1">Courriels professionnels</p>
                <p className="text-gray-600 text-sm">1 boîte courriel avec le forfait Démarrage, jusqu'à 5 boîtes avec les forfaits Professionnel et Affaires.</p>
              </div>
              <div>
                <MessageSquare className="w-8 h-8 text-[#003d7a] mx-auto mb-2" />
                <p className="font-semibold text-[#003d7a] mb-1">Support inclus</p>
                <p className="text-gray-600 text-sm">Accompagnement personnalisé et formation pour que vous soyez autonome avec votre site.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pourquoi nous choisir */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h3 className="text-2xl font-bold text-[#003d7a] mb-12 text-center">Pourquoi Nous Choisir ?</h3>
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-14 h-14 bg-[#003d7a]/10 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Briefcase className="w-7 h-7 text-[#003d7a]" />
                </div>
                <CardTitle>Expertise Hybride</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Nous combinons services opérationnels et stratégie d'affaires pour une croissance complète et structurée de votre PME.
                </p>
              </CardContent>
            </Card>
            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-14 h-14 bg-[#00a896]/10 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Target className="w-7 h-7 text-[#00a896]" />
                </div>
                <CardTitle>Orientation résultats</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Chaque projet est exécuté avec rigueur et une orientation claire vers des résultats mesurables et durables.
                </p>
              </CardContent>
            </Card>
            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-14 h-14 bg-[#003d7a]/10 rounded-full flex items-center justify-center mx-auto mb-2">
                  <BarChart3 className="w-7 h-7 text-[#003d7a]" />
                </div>
                <CardTitle>Analytique d'Affaires</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Nous utilisons des données et des analyses pour guider les décisions stratégiques et optimiser vos résultats en continu.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Processus */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h3 className="text-2xl font-bold text-[#003d7a] mb-12 text-center">Notre processus</h3>
          <div className="grid md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            {[
              { step: 1, title: "Consultation gratuite", desc: "Nous écoutons vos besoins, objectifs et défis — sans engagement", icon: <MessageSquare className="w-5 h-5" /> },
              { step: 2, title: "Analyse", desc: "Étude approfondie de votre marché, concurrence et opportunités", icon: <Search className="w-5 h-5" /> },
              { step: 3, title: "Stratégie", desc: "Développement d'une stratégie personnalisée et d'un plan d'action", icon: <Target className="w-5 h-5" /> },
              { step: 4, title: "Exécution", desc: "Mise en œuvre, suivi des résultats et ajustements continus", icon: <TrendingUp className="w-5 h-5" /> },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="bg-[#003d7a] text-white rounded-full w-14 h-14 flex items-center justify-center mx-auto mb-4 shadow-lg">
                  {item.icon}
                </div>
                <div className="text-xs font-bold text-[#00a896] mb-1">ÉTAPE {item.step}</div>
                <h4 className="font-bold text-gray-900 mb-2">{item.title}</h4>
                <p className="text-sm text-gray-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Section Intelligence Artificielle */}
      <section className="py-20 bg-gradient-to-br from-gray-900 via-[#001a3a] to-[#003d7a]" id="intelligence-artificielle">
        <div className="container mx-auto px-4">

          {/* Bandeau En cours de développement */}
          <div className="flex items-center justify-center gap-3 bg-amber-500/15 border border-amber-400/40 rounded-2xl px-6 py-4 mb-12 max-w-2xl mx-auto">
            <div className="flex items-center justify-center w-9 h-9 bg-amber-400/20 rounded-full flex-shrink-0">
              <Cpu className="w-5 h-5 text-amber-400" />
            </div>
            <div className="text-left">
              <p className="text-amber-300 font-bold text-sm">Nos outils IA sont en cours de développement</p>
              <p className="text-amber-200/70 text-xs mt-0.5">Nous travaillons activement à vous offrir des solutions IA adaptées aux PME québécoises. Restez à l'affût — le lancement est imminent.</p>
            </div>
          </div>

          {/* En-tête */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-[#00a896]/20 border border-[#00a896]/40 text-[#00a896] px-5 py-2 rounded-full text-sm font-semibold mb-5">
              <Sparkles className="w-4 h-4" />
              Nouveau — Intelligence Artificielle
            </div>
            <h3 className="text-3xl md:text-5xl font-bold text-white mb-5 leading-tight">
              L’IA au service de votre <span className="text-[#00a896]">Croissance</span>
            </h3>
            <p className="text-white/70 max-w-3xl mx-auto text-lg leading-relaxed">
              En 2025, le numérique sans intelligence artificielle, c'est comme conduire sans GPS. L'IA n'est plus réservée aux grandes entreprises — elle est désormais accessible aux PME québécoises qui veulent travailler plus intelligemment, automatiser les tâches répétitives et prendre de meilleures décisions.
            </p>
          </div>

          {/* Chiffres clés IA */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16">
            {[
              { stat: "40%", label: "de gain de productivité moyen pour les PME qui adoptent l'IA", icon: <TrendingUp className="w-5 h-5" /> },
              { stat: "3×", label: "plus de leads qualifiés avec un chatbot IA bien configuré", icon: <Bot className="w-5 h-5" /> },
              { stat: "60%", label: "des tâches administratives répétitives peuvent être automatisées", icon: <Clock className="w-5 h-5" /> },
              { stat: "2026", label: "les entreprises sans IA risquent de perdre leur avantage concurrentiel", icon: <Rocket className="w-5 h-5" /> },
            ].map((item, i) => (
              <div key={i} className="bg-white/5 border border-white/10 rounded-2xl p-5 text-center hover:bg-white/10 transition-all">
                <div className="w-10 h-10 bg-[#00a896]/20 rounded-full flex items-center justify-center mx-auto mb-3 text-[#00a896]">
                  {item.icon}
                </div>
                <p className="text-3xl font-bold text-[#00a896] mb-2">{item.stat}</p>
                <p className="text-white/60 text-xs leading-snug">{item.label}</p>
              </div>
            ))}
          </div>

          {/* Services IA — 6 cartes */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
            {[
              {
                icon: <Bot className="w-7 h-7" />,
                color: "from-blue-500 to-blue-700",
                title: "Chatbots & Assistants Virtuels",
                desc: "Répondez à vos clients 24h/24, 7j/7 sans effort humain. Un chatbot IA bien entraîné peut qualifier vos prospects, prendre des rendez-vous et répondre aux questions fréquentes — pendant que vous dormez.",
                tags: ["Service client automatisé", "Prise de rendez-vous", "Qualification de leads"],
              },
              {
                icon: <FileText className="w-7 h-7" />,
                color: "from-purple-500 to-purple-700",
                title: "Génération de Contenu IA",
                desc: "Publications de blogue, textes pour réseaux sociaux, descriptions de produits, infolettres — l'IA génère du contenu de qualité en quelques secondes, adapté à votre ton et à votre marché québécois.",
                tags: ["Blogue & SEO", "Réseaux sociaux", "Infolettres"],
              },
              {
                icon: <LineChart className="w-7 h-7" />,
                color: "from-teal-500 to-teal-700",
                title: "Analyse prédictive",
                desc: "Anticipez les tendances de votre marché, identifiez vos meilleurs clients et prévoyez vos ventes grâce à des modèles d'analyse de données. Prenez des décisions basées sur des faits, pas des intuitions.",
                tags: ["Prévision des ventes", "Segmentation clients", "Tendances marché"],
              },
              {
                icon: <Cpu className="w-7 h-7" />,
                color: "from-orange-500 to-orange-700",
                title: "Automatisation des Processus",
                desc: "Éliminez les tâches manuelles et répétitives : facturation automatique, suivi de commandes, relances clients, gestion des courriels. Vos employés se concentrent sur ce qui crée vraiment de la valeur.",
                tags: ["Facturation auto", "Relances clients", "Gestion courriels"],
              },
              {
                icon: <Brain className="w-7 h-7" />,
                color: "from-pink-500 to-pink-700",
                title: "IA pour le Marketing Numérique",
                desc: "Optimisation automatique de vos publicités Facebook et Google, personnalisation des messages selon le profil de chaque client, A/B testing intelligent. Votre budget publicitaire travaille mieux.",
                tags: ["Publicités optimisées", "Personnalisation", "A/B testing IA"],
              },
              {
                icon: <Lightbulb className="w-7 h-7" />,
                color: "from-yellow-500 to-yellow-700",
                title: "Formation & Intégration IA",
                desc: "Nous formons votre équipe à utiliser les outils IA les plus efficaces (ChatGPT, Copilot, Gemini, outils sectoriels) et intégrons ces solutions dans vos processus existants sans tout bouleverser.",
                tags: ["Formation équipe", "Outils IA", "Intégration progressive"],
              },
            ].map((service, i) => (
              <div key={i} className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 hover:border-[#00a896]/50 transition-all group">
                <div className={`w-14 h-14 bg-gradient-to-br ${service.color} rounded-2xl flex items-center justify-center mb-5 text-white shadow-lg group-hover:scale-110 transition-transform`}>
                  {service.icon}
                </div>
                <h4 className="text-lg font-bold text-white mb-3">{service.title}</h4>
                <p className="text-white/60 text-sm leading-relaxed mb-4">{service.desc}</p>
                <div className="flex flex-wrap gap-2">
                  {service.tags.map((tag, j) => (
                    <span key={j} className="bg-white/10 text-white/70 text-xs px-3 py-1 rounded-full border border-white/10">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Approche BeauRive IA */}
          <div className="bg-white/5 border border-[#00a896]/30 rounded-3xl p-8 md:p-12 mb-12">
            <div className="grid md:grid-cols-2 gap-10 items-center">
              <div>
                <div className="inline-flex items-center gap-2 bg-[#00a896]/20 text-[#00a896] px-4 py-1.5 rounded-full text-sm font-semibold mb-5">
                  <ShieldCheck className="w-4 h-4" />
                  Notre approche
                </div>
                <h4 className="text-2xl md:text-3xl font-bold text-white mb-4">
                  L'IA Responsable pour les PME du Québec
                </h4>
                <p className="text-white/70 leading-relaxed mb-5">
                  Nous ne vendons pas de l'IA pour vendre de l'IA. Notre démarche est pragmatique : nous identifions d'abord les vrais problèmes de votre entreprise, puis nous sélectionnons les outils IA qui apportent un retour sur investissement mesurable et rapide.
                </p>
                <p className="text-white/70 leading-relaxed">
                  Toutes nos solutions respectent la <strong className="text-white">Loi 25 du Québec</strong> sur la protection des renseignements personnels. Vos données et celles de vos clients restent sécurisées et sous votre contrôle.
                </p>
              </div>
              <div className="space-y-4">
                {[
                  { step: "01", title: "Diagnostic IA gratuit", desc: "Analyse de vos processus pour identifier les opportunités d'automatisation les plus rentables" },
                  { step: "02", title: "Sélection des outils", desc: "Choix des solutions IA adaptées à votre secteur, votre budget et votre niveau de maturité numérique" },
                  { step: "03", title: "Intégration progressive", desc: "Déploiement par étapes pour ne pas perturber vos opérations et former votre équipe en douceur" },
                  { step: "04", title: "Mesure des résultats", desc: "Suivi des indicateurs clés et ajustements continus pour maximiser votre retour sur investissement" },
                ].map((item, i) => (
                  <div key={i} className="flex gap-4 items-start">
                    <div className="w-10 h-10 bg-[#00a896] rounded-xl flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                      {item.step}
                    </div>
                    <div>
                      <p className="font-semibold text-white text-sm mb-1">{item.title}</p>
                      <p className="text-white/55 text-xs leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* CTA IA */}
          <div className="text-center">
            <p className="text-white/60 text-sm mb-5">Diagnostic IA offert — Sans engagement — Résultats concrets en 30 jours</p>
            <Button
              onClick={() => setShowConsultForm(true)}
              size="lg"
              className="bg-[#00a896] hover:bg-[#008f80] text-white font-bold px-10 py-4 text-lg shadow-xl shadow-[#00a896]/30"
            >
              <Brain className="w-5 h-5 mr-2" />
              Obtenir mon diagnostic IA gratuit
            </Button>
          </div>
        </div>
      </section>

      {/* CTA Consultation Gratuite */}
      <section className="py-16 bg-gradient-to-br from-[#003d7a] to-[#005a9e]">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-white/20 text-white px-4 py-2 rounded-full text-sm font-medium mb-6">
              <Star className="w-4 h-4 text-yellow-300" />
              Offre de bienvenue — Consultation gratuite
            </div>
            <h3 className="text-3xl font-bold text-white mb-4">Prêt à Faire Croître Votre Entreprise ?</h3>
            <p className="text-white/80 text-lg mb-8">
              Réservez votre consultation stratégique gratuite dès aujourd'hui. En 30 minutes, nous identifierons les opportunités de croissance les plus importantes pour votre entreprise.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                onClick={() => setShowConsultForm(true)}
                size="lg"
                className="bg-[#00a896] hover:bg-[#008f80] text-white font-bold px-10 py-4 text-lg"
              >
                <Calendar className="w-5 h-5 mr-2" />
                Réserver ma consultation gratuite
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="border-white/50 text-white hover:bg-white/10 bg-transparent"
                onClick={() => window.location.href = "mailto:info@beaurive.ca"}
              >
                <Mail className="w-5 h-5 mr-2" />
                info@beaurive.ca
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="border-white/50 text-white hover:bg-white/10 bg-transparent"
                onClick={() => window.location.href = "tel:5813492323"}
              >
                <Phone className="w-5 h-5 mr-2" />
                581-349-2323
              </Button>
            </div>
            <p className="text-white/50 text-sm mt-4">Aucun engagement • Réponse sous 24h • 100% gratuit</p>
          </div>
        </div>
      </section>

      {/* Modal Formulaire Consultation Gratuite */}
      {showConsultForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <Card className="w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader className="bg-gradient-to-r from-[#003d7a] to-[#005a9e] text-white rounded-t-lg">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-white text-xl flex items-center gap-2">
                    <Calendar className="w-5 h-5" />
                    Consultation Stratégique Gratuite
                  </CardTitle>
                  <CardDescription className="text-white/80 mt-1">
                    30 minutes • Sans engagement • Réponse sous 24h
                  </CardDescription>
                </div>
                <button
                  onClick={() => setShowConsultForm(false)}
                  className="text-white/70 hover:text-white text-2xl font-bold leading-none"
                >
                  ×
                </button>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="font-semibold text-gray-700">Nom complet *</Label>
                    <Input
                      name="name"
                      value={formData.name}
                      onChange={handleFormChange}
                      placeholder="Jean Tremblay"
                      required
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label className="font-semibold text-gray-700">Courriel *</Label>
                    <Input
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleFormChange}
                      placeholder="jean@entreprise.com"
                      required
                      className="mt-1"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="font-semibold text-gray-700">Téléphone</Label>
                    <Input
                      name="phone"
                      value={formData.phone}
                      onChange={handleFormChange}
                      placeholder="418-555-0000"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label className="font-semibold text-gray-700">Entreprise</Label>
                    <Input
                      name="company"
                      value={formData.company}
                      onChange={handleFormChange}
                      placeholder="Nom de votre entreprise"
                      className="mt-1"
                    />
                  </div>
                </div>
                <div>
                  <Label className="font-semibold text-gray-700">Décrivez votre projet ou vos besoins</Label>
                  <Textarea
                    name="message"
                    value={formData.message}
                    onChange={handleFormChange}
                    placeholder="Ex. : Je veux améliorer ma présence sur Facebook et Instagram, ou j'ai besoin d'un site web et d'un logo pour mon entreprise..."
                    rows={4}
                    className="mt-1 resize-none"
                  />
                </div>
                <div className="flex gap-3 pt-2">
                  <Button
                    type="submit"
                    disabled={submitMutation.isPending}
                    className="flex-1 bg-[#003d7a] hover:bg-[#002d5a] text-white py-3 font-semibold"
                  >
                    {submitMutation.isPending ? (
                      <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Envoi en cours...</>
                    ) : (
                      <><Calendar className="w-4 h-4 mr-2" /> Réserver ma consultation gratuite</>
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowConsultForm(false)}
                    className="px-5"
                  >
                    Annuler
                  </Button>
                </div>
                <p className="text-xs text-gray-500 text-center">
                  Vos informations sont confidentielles et ne seront jamais partagées.
                </p>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
