import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { Loader2, CheckCircle2, MapPin, Briefcase, Sparkles, Award, ArrowRight, Zap, ChevronLeft, ChevronRight, Star, Send, Brain, User, LogIn } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";

function ApprovedReviews() {
  const { data: approvedReviews, isLoading } = trpc.reviews.getApprovedReviews.useQuery();

  if (isLoading || !approvedReviews || approvedReviews.length === 0) return null;

  return (
    <div className="mb-12">
      <h3 className="text-xl font-bold text-[#003d7a] mb-6 text-center">Avis vérifiés par notre équipe</h3>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {approvedReviews.map((review: { id: number; name: string; service: string; rating: number; comment: string }) => (
          <div key={review.id} className="bg-white rounded-xl p-6 shadow-md border-2 border-[#00a896]/30 hover:shadow-lg transition relative">
            <span className="absolute top-3 right-3 bg-green-100 text-green-700 text-xs font-semibold px-2 py-0.5 rounded-full">✔ Vérifié</span>
            <div className="flex items-center gap-1 mb-3">
              {Array.from({ length: 5 }).map((_, j) => (
                <Star key={j} className={`w-4 h-4 ${j < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
              ))}
            </div>
            <p className="text-gray-700 mb-4 italic">"{review.comment}"</p>
            <div className="border-t pt-3">
              <p className="font-semibold text-[#003d7a]">{review.name}</p>
              <p className="text-sm text-gray-500">{review.service}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function AvisForm() {
  const [form, setForm] = useState({ nom: "", service: "", note: 5, message: "" });
  const [sent, setSent] = useState(false);
  const submitReview = trpc.reviews.submitReview.useMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nom || !form.service || !form.message) {
      toast.error("Veuillez remplir tous les champs obligatoires.");
      return;
    }
    if (form.message.trim().length < 10) {
      toast.error("Votre commentaire doit contenir au moins 10 caractères.");
      return;
    }
    try {
      await submitReview.mutateAsync({
        name: form.nom,
        service: form.service,
        rating: form.note,
        comment: form.message,
      });
      setSent(true);
    } catch {
      toast.error("Une erreur est survenue. Veuillez réessayer.");
    }
  };

  if (sent) {
    return (
      <div className="text-center py-8">
        <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-3" />
        <h4 className="text-xl font-bold text-[#003d7a] mb-2">Merci !</h4>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Votre nom *</label>
          <input value={form.nom} onChange={e => setForm(p => ({...p, nom: e.target.value}))} required placeholder="Marie Tremblay" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#00a896]" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Service utilisé *</label>
          <select value={form.service} onChange={e => setForm(p => ({...p, service: e.target.value}))} required className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#00a896]">
            <option value="">Choisir un service</option>
            <option value="Conciergerie résidentielle">Conciergerie résidentielle</option>
            <option value="Conciergerie commerciale">Conciergerie commerciale</option>
            <option value="Stratégie numérique">Stratégie numérique</option>
            <option value="Stratégie d'Affaires">Stratégie d'Affaires</option>
            <option value="Intelligence Artificielle">Intelligence Artificielle</option>
          </select>
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Note *</label>
        <div className="flex gap-2 mt-1">
          {[1,2,3,4,5].map(n => (
            <button key={n} type="button" onClick={() => setForm(p => ({...p, note: n}))} className="focus:outline-none">
              <Star className={`w-7 h-7 transition ${form.note >= n ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
            </button>
          ))}
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Votre commentaire *</label>
        <textarea value={form.message} onChange={e => setForm(p => ({...p, message: e.target.value}))} required rows={4} placeholder="Décrivez votre expérience avec BeauRive Solutions..." className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#00a896] resize-none" />
      </div>
      <button type="submit" disabled={submitReview.isPending} className="w-full bg-gradient-to-r from-[#003d7a] to-[#00a896] text-white py-3 rounded-lg font-semibold flex items-center justify-center gap-2 hover:opacity-90 transition disabled:opacity-60">
        {submitReview.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
        {submitReview.isPending ? "Envoi en cours..." : "Envoyer mon avis"}
      </button>
      <p className="text-xs text-gray-400 text-center">Votre avis sera publié après validation par notre équipe.</p>
    </form>
  );
}

function StrategieCard() {
  // const [, navigate] = useLocation();
  const navigate = useNavigate();
  return (
    <div
      className="cursor-pointer h-full"
      onClick={() => navigate("/strategie")}
    >
      <Card className="h-full hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
        <CardHeader className="bg-gradient-to-br from-[#00a896] to-[#00a896]/80 text-white rounded-t-lg">
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-2xl">Stratégie d'Affaires</CardTitle>
              <CardDescription className="text-gray-100 mt-2">Croissance et développement d'entreprises</CardDescription>
            </div>
            <Briefcase className="w-8 h-8" />
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-4 mb-6">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-[#003d7a] flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-gray-900">Création de Logo</p>
                <p className="text-sm text-gray-600">Identité visuelle unique et mémorable</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-[#003d7a] flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-gray-900">Conception de sites web</p>
                <p className="text-sm text-gray-600">Sites modernes et optimisés</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-[#003d7a] flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-gray-900">Marketing numérique & plans d'affaires</p>
                <p className="text-sm text-gray-600">Stratégies complètes de croissance</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Brain className="w-5 h-5 text-[#00a896] flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-gray-900">Intelligence Artificielle</p>
                <p className="text-sm text-gray-600">Chatbots, automatisation et analyse prédictive</p>
              </div>
            </div>
          </div>
          <div className="bg-teal-50 rounded-lg p-4 mb-6">
            <p className="text-sm text-gray-700">
              <strong>Expertise :</strong> Analyse d'affaires, IA et stratégies personnalisées
            </p>
          </div>
          <div className="flex gap-2">
            <Button className="flex-1 bg-[#00a896] hover:bg-[#008a7f] text-white gap-2">
              Découvrir <ArrowRight className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              className="border-[#003d7a] text-[#003d7a] hover:bg-[#003d7a] hover:text-white gap-1 text-xs px-3"
              onClick={(e) => { e.stopPropagation(); navigate("/strategie"); setTimeout(() => { document.getElementById('intelligence-artificielle')?.scrollIntoView({ behavior: 'smooth' }); }, 300); }}
            >
              <Brain className="w-3.5 h-3.5" />
              IA
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function NavLinks() {
  const { user, loading } = useAuth();
  return (
    <div className="hidden md:flex items-center gap-2">
      <button
        onClick={() => scrollToSection("departments")}
        className="px-4 py-2 rounded-lg border border-gray-200 text-sm font-semibold text-gray-700 hover:border-[#003d7a] hover:text-[#003d7a] hover:bg-[#003d7a]/5 transition-all cursor-pointer"
      >
        Services
      </button>
      <button
        onClick={() => scrollToSection("zones")}
        className="px-4 py-2 rounded-lg border border-gray-200 text-sm font-semibold text-gray-700 hover:border-[#003d7a] hover:text-[#003d7a] hover:bg-[#003d7a]/5 transition-all cursor-pointer"
      >
        Zones
      </button>
      <button
        onClick={() => scrollToSection("contact")}
        className="px-4 py-2 rounded-lg border border-[#00a896] text-sm font-bold text-[#00a896] hover:bg-[#00a896] hover:text-white transition-all cursor-pointer"
      >
        Contact
      </button>
      {!loading && (
        user ? (
          <Link
            to="/mon-espace"
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#003d7a] text-white text-sm font-bold hover:bg-[#002d5a] transition-all cursor-pointer shadow-sm no-underline"
          >
            <User className="w-4 h-4" />
            Mon Espace
          </Link>
        ) : (
          <a
            href={getLoginUrl()}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#003d7a] text-white text-sm font-bold hover:bg-[#002d5a] transition-all cursor-pointer shadow-sm no-underline"
          >
            <LogIn className="w-4 h-4" />
            Se connecter
          </a>
        )
      )}
    </div>
  );
}

const scrollToSection = (id: string) => {
  const el = document.getElementById(id);
  if (!el) return;
  const navHeight = 72; // hauteur de la navbar sticky
  const top = el.getBoundingClientRect().top + window.scrollY - navHeight;
  window.scrollTo({ top, behavior: "smooth" });
};

const HERO_SLIDES = [
  {
    id: 1,
    label: "Stratégie d’affaires",
    title: "L’excellence rencontre la stratégie",
    subtitle: "Marketing numérique, création de sites web, logos et business plans pour faire croître votre PME.",
    cta: "Découvrir la stratégie",
    href: "/strategie",
    image: "https://d2xsxph8kpxj0f.cloudfront.net/310519663298215435/ggLFTKMKWZBzX3DCHCVZvz/hero-strategie-realiste-ZF3mnq8jAZ97eujwsmHzCf.webp",
    accent: "from-[#00a896] to-[#003d7a]",
    badge: "bg-[#00a896]",
  },
  {
    id: 2,
    label: "Conciergerie résidentielle",
    title: "Des espaces impeccables, chaque semaine",
    subtitle: "Entretien ménager résidentiel haut de gamme par des professionnels en uniforme. 200 heures par semaine dans la région de Québec.",
    cta: "Obtenir une soumission",
    href: "/conciergerie",
    image: "https://d2xsxph8kpxj0f.cloudfront.net/310519663298215435/ggLFTKMKWZBzX3DCHCVZvz/hero-residential-no-machine-TKHMKuJvPuWKj68bZoC4nh.webp",
    accent: "from-[#003d7a] to-[#00a896]",
    badge: "bg-[#003d7a]",
  },
  {
    id: 3,
    label: "Conciergerie commerciale",
    title: "Propreté industrielle, résultats garantis",
    subtitle: "Entretien commercial avec autolaveuses Kärcher professionnelles pour bureaux, centres commerciaux et immeubles. Équipes spécialisées disponibles 5 à 7 jours par semaine.",
    cta: "Demander une soumission",
    href: "/conciergerie",
    image: "https://d2xsxph8kpxj0f.cloudfront.net/310519663298215435/ggLFTKMKWZBzX3DCHCVZvz/hero-commercial-karcher-compact-RCdbEYFsZCbwHR9mLRinrS.webp",
    accent: "from-[#003d7a] to-[#003d7a]/80",
    badge: "bg-[#003d7a]",
  },
];

export default function Home() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      goToNext();
    }, 5000);
    return () => clearInterval(timer);
  }, [currentSlide]);

  const goToSlide = (idx: number) => {
    if (isAnimating || idx === currentSlide) return;
    setIsAnimating(true);
    setTimeout(() => {
      setCurrentSlide(idx);
      setIsAnimating(false);
    }, 400);
  };

  const goToNext = () => goToSlide((currentSlide + 1) % HERO_SLIDES.length);
  const goToPrev = () => goToSlide((currentSlide - 1 + HERO_SLIDES.length) % HERO_SLIDES.length);

  const slide = HERO_SLIDES[currentSlide];

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    serviceType: "concierge",
    message: "",
  });

  const submitMutation = trpc.contact.submit.useMutation({
    onSuccess: () => {
      toast.success("Merci ! Votre demande a été reçue. Nous vous contacterons bientôt.");
      setFormData({
        name: "",
        email: "",
        phone: "",
        company: "",
        serviceType: "concierge",
        message: "",
      });
    },
    onError: (error) => {
      toast.error("Une erreur s'est produite. Veuillez réessayer.");
      console.error(error);
    },
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleServiceTypeChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      serviceType: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      toast.error("Veuillez remplir tous les champs obligatoires.");
      return;
    }
    submitMutation.mutate(formData);
  };

  return (
    <div className="w-full">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-md">
        <div className="container mx-auto px-6 py-3 flex justify-between items-center">
          {/* Logo + Brand */}
          <div
            className="flex items-center gap-3 border border-gray-200 rounded-xl px-3 py-2 shadow-sm bg-white hover:border-[#003d7a]/30 transition-colors cursor-pointer"
            onClick={() => { window.scrollTo({ top: 0, behavior: 'smooth' }); }}
          >
            <img
              src="https://d2xsxph8kpxj0f.cloudfront.net/310519663298215435/ggLFTKMKWZBzX3DCHCVZvz/beaurive-icon_655a13a4.png"
              alt="BeauRive"
              className="w-9 h-9 object-contain"
            />
            <div>
              <h1 className="text-base font-extrabold text-[#003d7a] leading-tight">BeauRive Solutions</h1>
              <p className="text-[10px] text-[#00a896] font-semibold uppercase tracking-wider leading-none">Multi-Service</p>
            </div>
          </div>

          {/* Nav Links */}
          <NavLinks />
        </div>
      </nav>

      {/* Hero Slideshow */}
      <section className={`relative bg-gradient-to-br ${slide.accent} text-white overflow-hidden transition-all duration-700`} style={{minHeight: '600px'}}>
        {/* Background image with overlay */}
        <div
          className="absolute inset-0 bg-cover bg-center transition-opacity duration-700"
          style={{
            backgroundImage: `url('${slide.image}')`,
            opacity: isAnimating ? 0 : 0.22,
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-[#003d7a]/85 to-[#00a896]/75" />

        {/* Content */}
        <div className="relative z-10 container mx-auto px-4 py-24 md:py-36">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Text */}
            <div
              className="transition-all duration-500"
              style={{ opacity: isAnimating ? 0 : 1, transform: isAnimating ? 'translateY(20px)' : 'translateY(0)' }}
            >
              <span className={`inline-block ${slide.badge} text-white text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full mb-5`}>
                {slide.label}
              </span>
              <h2 className="text-4xl md:text-5xl font-extrabold mb-6 leading-tight">{slide.title}</h2>
              <p className="text-lg mb-10 opacity-95 max-w-lg">{slide.subtitle}</p>
              <div className="flex flex-wrap gap-4">
                <Link to={slide.href}>
                  <Button size="lg" className="bg-white text-[#003d7a] hover:bg-gray-100 font-bold shadow-lg">
                    {slide.cta} <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </Link>
                <a href="#departments">
                  <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                    Tous nos services
                  </Button>
                </a>
              </div>
            </div>

            {/* Image */}
            <div
              className="hidden md:block transition-all duration-500"
              style={{ opacity: isAnimating ? 0 : 1, transform: isAnimating ? 'scale(0.97)' : 'scale(1)' }}
            >
              <img
                src={slide.image}
                alt={slide.title}
                className="rounded-2xl shadow-2xl w-full object-cover border-4 border-white/20"
                style={{ maxHeight: '560px', objectFit: 'cover' }}
              />
            </div>
          </div>

          {/* Slide Controls */}
          <div className="flex items-center justify-center gap-6 mt-12">
            <button
              onClick={goToPrev}
              className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/40 flex items-center justify-center transition"
              aria-label="Précédent"
            >
              <ChevronLeft className="w-5 h-5 text-white" />
            </button>
            {HERO_SLIDES.map((s, idx) => (
              <button
                key={s.id}
                onClick={() => goToSlide(idx)}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  idx === currentSlide ? 'bg-white scale-125' : 'bg-white/40 hover:bg-white/70'
                }`}
                aria-label={`Diapositive ${idx + 1}`}
              />
            ))}
            <button
              onClick={goToNext}
              className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/40 flex items-center justify-center transition"
              aria-label="Suivant"
            >
              <ChevronRight className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>
      </section>

      {/* Departments Section */}
      <section id="departments" className="py-20 md:py-32 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-[#003d7a] mb-4 text-center">Nos deux départements</h2>
          <p className="text-center text-gray-600 mb-16 max-w-2xl mx-auto">
            Choisissez le département qui correspond à vos besoins et découvrez nos services spécialisés.
          </p>

          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* Conciergerie Department */}
            <Link to="/conciergerie">
              <Card className="cursor-pointer h-full hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
                <CardHeader className="bg-gradient-to-br from-[#003d7a] to-[#003d7a]/80 text-white rounded-t-lg">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-2xl">Département conciergerie</CardTitle>
                      <CardDescription className="text-gray-100 mt-2">Services de nettoyage professionnel</CardDescription>
                    </div>
                    <Zap className="w-8 h-8" />
                  </div>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="space-y-4 mb-6">
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-[#00a896] flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold text-gray-900">Ménage Commercial & Résidentiel</p>
                        <p className="text-sm text-gray-600">Nettoyage professionnel adapté à vos besoins</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-[#00a896] flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold text-gray-900">Ménage Après Construction</p>
                        <p className="text-sm text-gray-600">Nettoyage post-chantier complet</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-[#00a896] flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold text-gray-900">Ménage Après Rénovation</p>
                        <p className="text-sm text-gray-600">Nettoyage post-rénovation professionnel</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-blue-50 rounded-lg p-4 mb-6">
                    <p className="text-sm text-gray-700">
                      <strong>Bonus :</strong> Calculateur de coût interactif pour estimer vos frais de nettoyage
                    </p>
                  </div>

                  <Button className="w-full bg-[#003d7a] hover:bg-[#002d5a] text-white gap-2">
                    Découvrir <ArrowRight className="w-4 h-4" />
                  </Button>
                </CardContent>
              </Card>
            </Link>

            {/* Stratégie d'Affaires Department */}
            <StrategieCard />
          </div>
        </div>
      </section>


      {/* Service Areas */}
      <section id="zones" className="py-16 md:py-24 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-[#003d7a] mb-12 text-center">Zones de service</h2>
          
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-gray-700 mb-6">
                Nous desservons les principales régions du Québec et de la Beauce avec nos services professionnels de conciergerie et de stratégie d'affaires.
              </p>
              <div className="grid grid-cols-2 gap-4">
                {[
                  "Ville de Québec",
                  "Sainte-Marie",
                  "Beauceville",
                  "Tring-Jonction",
                  "Lévis",
                  "Saint-Nicolas",
                  "Charny",
                  "Donnacona",
                  "Sainte-Augustin",
                  "Beauport",
                ].map((zone) => (
                  <div key={zone} className="flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-[#00a896]" />
                    <span className="text-gray-700">{zone}</span>
                  </div>
                ))}
              </div>
              <p className="text-gray-600 mt-6 text-sm">Et bien d'autres villes et municipalités dans la région de Québec et de la Beauce.</p>
            </div>
            <div className="bg-gradient-to-br from-[#003d7a] to-[#00a896] rounded-lg p-8 text-white">
              <h3 className="text-2xl font-bold mb-4">Couverture régionale</h3>
              <p className="mb-4">Nos équipes sont stratégiquement positionnées pour offrir des services rapides et efficaces dans toute la région.</p>
              <p className="text-sm opacity-90">Avec 200 heures d'entretien ménager par semaine, nous garantissons une disponibilité et une qualité constantes.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Portfolio Section */}
      <section className="py-16 md:py-24 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-[#003d7a] mb-12 text-center">Réalisations</h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: "Nettoyage résidentiel",
                description: "Entretien ménager résidentiel haut de gamme par des professionnels en uniforme",
                image: "https://d2xsxph8kpxj0f.cloudfront.net/310519663298215435/ggLFTKMKWZBzX3DCHCVZvz/beaurive-residential-25PyUhv3CiSg3QRZFgHKbU.webp",
              },
              {
                title: "Stratégie numérique",
                description: "Gestion Facebook, Instagram, Google Business et SEO pour faire croître votre PME",
                image: "https://d2xsxph8kpxj0f.cloudfront.net/310519663298215435/ggLFTKMKWZBzX3DCHCVZvz/card-strategie-numerique-86SnQP9EHVmz2XigtZefwe.webp",
              },
              {
                title: "Excellence opérationnelle",
                description: "Services commerciaux avec autolaveuses Kärcher professionnelles et équipes spécialisées",
                image: "https://d2xsxph8kpxj0f.cloudfront.net/310519663298215435/ggLFTKMKWZBzX3DCHCVZvz/card-excellence-operationnelle-hWBhUwCps2uJTq7pqMMyXo.webp",
              },
            ].map((project, idx) => (
              <Card key={idx} className="overflow-hidden hover:shadow-lg transition">
                <img src={project.image} alt={project.title} className="w-full h-48 object-cover" />
                <CardHeader>
                  <CardTitle>{project.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">{project.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-16 md:py-24 bg-gradient-to-br from-[#003d7a] to-[#00a896] text-white">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-center">Nous joindre</h2>
            <p className="text-center mb-12 text-lg opacity-95">
              Contactez-nous dès aujourd'hui pour une soumission gratuite et bénéficiez de nos services professionnels et personnalisés.
            </p>

            <form onSubmit={handleSubmit} className="bg-white text-gray-900 rounded-lg p-8 shadow-xl">
              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div>
                  <Label htmlFor="name" className="text-gray-700">Nom *</Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Votre nom"
                    required
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label htmlFor="email" className="text-gray-700">Email *</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="votre@email.com"
                    required
                    className="mt-2"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div>
                  <Label htmlFor="phone" className="text-gray-700">Téléphone</Label>
                  <Input
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="(418) 555-0123"
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label htmlFor="company" className="text-gray-700">Entreprise</Label>
                  <Input
                    id="company"
                    name="company"
                    value={formData.company}
                    onChange={handleInputChange}
                    placeholder="Nom de votre entreprise"
                    className="mt-2"
                  />
                </div>
              </div>

              <div className="mb-6">
                <Label htmlFor="serviceType" className="text-gray-700">Type de Service *</Label>
                <Select value={formData.serviceType} onValueChange={handleServiceTypeChange}>
                  <SelectTrigger id="serviceType" className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="concierge">Services de Conciergerie</SelectItem>
                    <SelectItem value="business">Services de Développement & Stratégie</SelectItem>
                    <SelectItem value="both">Les deux services</SelectItem>
                    <SelectItem value="other">Autre</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="mb-6">
                <Label htmlFor="message" className="text-gray-700">Message *</Label>
                <Textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  placeholder="Décrivez votre demande ou projet..."
                  rows={5}
                  required
                  className="mt-2"
                />
              </div>

              <Button
                type="submit"
                disabled={submitMutation.isPending}
                className="w-full bg-[#003d7a] hover:bg-[#002d5a] text-white py-3 rounded-lg font-semibold transition"
              >
                {submitMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Envoi en cours...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    Envoyer ma demande
                  </>
                )}
              </Button>
            </form>
          </div>
        </div>
      </section>

      {/* Témoignages Section */}
      <section className="py-16 md:py-24 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-[#003d7a] mb-4">Ce que disent nos clients</h2>
            <p className="text-gray-600 text-lg">La satisfaction de nos clients est notre plus grande fierté.</p>
          </div>
          {/* Avis dynamiques approuvés */}
          <ApprovedReviews />
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
            {[
              { name: "Marie-Claude Tremblay", city: "Québec", service: "Conciergerie résidentielle", rating: 5, text: "Service impeccable ! L'équipe BeauRive est ponctuelle, professionnelle et mon appartement n'a jamais été aussi propre. Je recommande sans hésitation." },
              { name: "Isabelle Roy", city: "Charlesbourg", service: "Conciergerie résidentielle", rating: 5, text: "J'utilise le service depuis 8 mois et je n'ai jamais été déçue. L'équipe est fiable, souriante et le résultat est toujours parfait. Mon condo brille à chaque visite." },
              { name: "Jean-François Lavoie", city: "Lévis", service: "Conciergerie Commerciale", rating: 5, text: "Nos bureaux sont entretenus à la perfection chaque semaine. L'équipe est discrète, efficace et toujours en uniforme. Très professionnel." },
              { name: "André Simard", city: "Sainte-Marie", service: "Conciergerie Commerciale", rating: 5, text: "Notre restaurant est impeccable grâce à BeauRive. Nos clients remarquent la propreté et ça se reflète dans nos avis Google. Merci à toute l'équipe !" },
              { name: "Sophie Gagné", city: "Sainte-Foy", service: "Stratégie Numérique", rating: 5, text: "BeauRive a transformé notre présence en ligne. Notre site web est magnifique et nos ventes ont augmenté de 40% en 3 mois. Un investissement qui en valait vraiment la peine !" },
              { name: "Lucie Bergeron", city: "Québec", service: "Stratégie Numérique", rating: 5, text: "BeauRive a créé notre identité visuelle et notre site web en un temps record. Le résultat est professionnel, moderne et nos clients le remarquent immédiatement." },
              { name: "Michel Côté", city: "Saint-Georges", service: "Stratégie d'Affaires", rating: 4, text: "BeauRive nous a aidé à structurer notre plan d'affaires pour l'expansion. Leur expertise et leur professionnalisme nous ont vraiment impressionnés." },
              { name: "Patrick Bouchard", city: "Beauce", service: "Stratégie d'Affaires", rating: 5, text: "Grâce au plan stratégique de BeauRive, nous avons ouvert un deuxième point de vente en moins de 6 mois. Leur accompagnement est concret, efficace et personnalisé." },
            ].map((t, i) => (
              <div key={i} className="bg-white rounded-xl p-6 shadow-md border border-gray-100 hover:shadow-lg transition">
                <div className="flex items-center gap-1 mb-3">
                  {Array.from({ length: 5 }).map((_, j) => (
                    <Star key={j} className={`w-4 h-4 ${j < t.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
                  ))}
                </div>
                <p className="text-gray-700 mb-4 italic">"{t.text}"</p>
                <div className="border-t pt-3">
                  <p className="font-semibold text-[#003d7a]">{t.name}</p>
                  <p className="text-sm text-gray-500">{t.city} · {t.service}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Formulaire d'avis privé */}
          <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
            <h3 className="text-2xl font-bold text-[#003d7a] mb-2 text-center">Partagez votre expérience</h3>
            <p className="text-gray-500 text-center mb-6 text-sm">Votre avis nous aide à nous améliorer. Il sera transmis à notre équipe et ne sera pas publié publiquement.</p>
            <AvisForm />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#003d7a] text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            <div>
              <h3 className="font-bold text-lg mb-4">BeauRive Solutions</h3>
              <p className="text-gray-300">Excellence opérationnelle et stratégie d'affaires pour votre succès.</p>
            </div>
            <div>
              <h4 className="font-bold mb-4">Services</h4>
              <ul className="space-y-2 text-gray-300">
                <li><Link to="/conciergerie" className="hover:text-white transition">Conciergerie</Link></li>
                <li><Link to="/strategie" className="hover:text-white transition">Stratégie d'Affaires</Link></li>
                <li><Link to="/intelligence-artificielle" className="hover:text-white transition">Intelligence Artificielle</Link></li>
                <li><a href="#contact" className="hover:text-white transition">Contact</a></li>
                <li><Link to="/qui-sommes-nous" className="hover:text-white transition">Qui sommes-nous</Link></li>
                <li><Link to="/carrieres" className="hover:text-white transition">Carrières</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Contact</h4>
              <a href="tel:5813492323" className="block text-gray-300 hover:text-white transition mb-1">581-349-2323</a>
              <a href="mailto:info@beaurive.ca" className="block text-gray-300 hover:text-white transition mb-2">info@beaurive.ca</a>
              <p className="text-gray-400 text-sm">Québec, Canada</p>
            </div>
          </div>
          <div className="border-t border-gray-700 pt-8 text-center text-gray-300">
            <p>&copy; 2026 BeauRive Solutions Multi-Services. Tous droits réservés.</p>
            <p className="mt-2 text-sm">
              <Link to="/politique-de-confidentialite" className="hover:text-white underline transition">Politique de confidentialité</Link>
              {" · "}
              <Link to="/qui-sommes-nous" className="hover:text-white underline transition">Qui sommes-nous</Link>
              {" · "}
              <Link to="/carrieres" className="hover:text-white underline transition">Carrières</Link>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
