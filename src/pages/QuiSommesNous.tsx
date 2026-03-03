import { Link } from "wouter";
import { useEffect } from "react";
import { Award, Briefcase, Sparkles, Leaf, GraduationCap, Target, Users, ArrowLeft } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function QuiSommesNous() {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, []);

  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-gray-200 shadow-sm">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/">
            <div className="flex items-center gap-2 cursor-pointer">
              <div className="w-8 h-8 bg-[#003d7a] rounded-lg flex items-center justify-center text-white font-bold text-sm">B</div>
              <div>
                <div className="font-bold text-[#003d7a] text-sm leading-tight">BeauRive Solutions</div>
                <div className="text-xs text-gray-500 leading-tight">MULTI-SERVICE</div>
              </div>
            </div>
          </Link>
          <Link href="/">
            <Button variant="ghost" size="sm" className="flex items-center gap-2 text-[#003d7a]">
              <ArrowLeft className="w-4 h-4" />
              Retour à l'accueil
            </Button>
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="bg-gradient-to-br from-[#003d7a] to-[#00a896] text-white py-20">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="flex items-center gap-3 mb-4">
            <Users className="w-8 h-8 opacity-80" />
            <span className="text-sm font-semibold uppercase tracking-widest opacity-80">À propos de nous</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-6">Qui Sommes-Nous ?</h1>
          <p className="text-xl opacity-90 leading-relaxed max-w-3xl">
            Une startup québécoise fondée sur une conviction simple : les petites et moyennes entreprises méritent un partenaire de confiance qui comprend à la fois leurs opérations quotidiennes et leur stratégie de croissance.
          </p>
        </div>
      </section>

      {/* Notre histoire */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 max-w-4xl">
          <h2 className="text-3xl font-bold text-[#003d7a] mb-8">Notre histoire</h2>
          <div className="space-y-6 text-gray-700 text-lg leading-relaxed">
            <p>
              <strong>BeauRive Solutions Multi-Services</strong> est une startup québécoise née de la rencontre entre deux univers complémentaires : l'excellence opérationnelle des services de conciergerie et la puissance stratégique de l’analyse d’affaires. Nous croyons que chaque PME, quelle que soit sa taille, mérite un partenaire qui comprend autant ses défis quotidiens que ses ambitions de croissance.
            </p>
            <p>
              Notre équipe est composée de <strong>professionnels diplômés au Canada en technologies de l'information</strong>, combinés à une expertise terrain de plus de 5 ans en entretien ménager résidentiel et commercial. Cette double compétence — TI et opérations — nous permet de comprendre les réalités concrètes de nos clients et de leur offrir des solutions à la hauteur de leurs exigences.
            </p>
          </div>
        </div>
      </section>

      {/* Équipe TI */}
      <section className="py-16 bg-[#f0f7ff]">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-[#003d7a] rounded-full flex items-center justify-center">
              <Briefcase className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-[#003d7a]">Notre équipe TI</h2>
          </div>
          <p className="text-gray-700 text-lg leading-relaxed mb-8">
            Nous disposons d'une <strong>équipe TI qualifiée qui travaille pour un meilleur rendu</strong>. Notre équipe est composée de spécialistes passionnés en développement web, conception graphique et marketing numérique, tous animés par un même objectif : vous livrer des solutions technologiques à la hauteur de vos ambitions.
          </p>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-blue-100 hover:shadow-md transition">
              <div className="w-12 h-12 bg-[#e8f4f8] rounded-full flex items-center justify-center mb-4">
                <Sparkles className="w-6 h-6 text-[#003d7a]" />
              </div>
              <h3 className="font-bold text-[#003d7a] mb-2">Développement Web</h3>
              <p className="text-gray-600 text-sm">
                Conception et développement de sites web modernes, performants et adaptés à vos besoins spécifiques.
              </p>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-sm border border-blue-100 hover:shadow-md transition">
              <div className="w-12 h-12 bg-[#e8f4f8] rounded-full flex items-center justify-center mb-4">
                <Target className="w-6 h-6 text-[#003d7a]" />
              </div>
              <h3 className="font-bold text-[#003d7a] mb-2">Conception graphique</h3>
              <p className="text-gray-600 text-sm">
                Création de logos, identité visuelle et supports graphiques qui reflètent l'image professionnelle de votre entreprise.
              </p>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-sm border border-blue-100 hover:shadow-md transition">
              <div className="w-12 h-12 bg-[#e8f4f8] rounded-full flex items-center justify-center mb-4">
                <Award className="w-6 h-6 text-[#003d7a]" />
              </div>
              <h3 className="font-bold text-[#003d7a] mb-2">Marketing numérique</h3>
              <p className="text-gray-600 text-sm">
                Stratégies de marketing en ligne, gestion des réseaux sociaux et optimisation pour maximiser votre visibilité.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Engagement écologique */}
      <section className="py-16 bg-green-50">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <Leaf className="w-6 h-6 text-green-700" />
            </div>
            <h2 className="text-3xl font-bold text-green-800">Notre Engagement Écologique</h2>
          </div>
          <p className="text-green-800 text-lg leading-relaxed">
            Chez BeauRive Solutions, nous croyons que la performance et la responsabilité environnementale vont de pair. C'est pourquoi nous privilégions des <strong>produits de nettoyage biodégradables et sans substances toxiques</strong>, réduisons les emballages à usage unique, et optimisons nos déplacements pour limiter notre empreinte carbone. À chaque intervention, nous faisons le choix de pratiques durables qui respectent la santé de vos occupants et de notre environnement commun. Prendre soin de vos espaces, c'est aussi prendre soin de la planète.
          </p>
        </div>
      </section>

      {/* Nos valeurs */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4 max-w-5xl">
          <h2 className="text-3xl font-bold text-[#003d7a] mb-10 text-center">Nos Valeurs</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="border-0 shadow-md">
              <CardHeader>
                <div className="w-12 h-12 bg-[#e8f4f8] rounded-full flex items-center justify-center mb-2">
                  <Leaf className="w-6 h-6 text-[#00a896]" />
                </div>
                <CardTitle className="text-[#003d7a]">Engagement Écologique</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Produits biodégradables, pratiques durables et réduction de l'empreinte carbone à chaque intervention. Nous prenons soin de vos espaces et de notre environnement.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-md">
              <CardHeader>
                <div className="w-12 h-12 bg-[#e8f4f8] rounded-full flex items-center justify-center mb-2">
                  <GraduationCap className="w-6 h-6 text-[#00a896]" />
                </div>
                <CardTitle className="text-[#003d7a]">Expertise Certifiée</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Équipe diplômée au Canada en technologies de l'information, avec plus de 5 ans d'expérience terrain. Des standards élevés et des résultats mesurables à chaque intervention.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-md">
              <CardHeader>
                <div className="w-12 h-12 bg-[#e8f4f8] rounded-full flex items-center justify-center mb-2">
                  <Target className="w-6 h-6 text-[#00a896]" />
                </div>
                <CardTitle className="text-[#003d7a]">Double Compétence</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Opérations terrain et stratégie analytique sous un même toit. Une approche sur mesure, adaptée à chaque client et à chaque réalité d'affaires.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Pourquoi nous choisir */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 max-w-4xl">
          <h2 className="text-3xl font-bold text-[#003d7a] mb-8">Pourquoi Choisir BeauRive Solutions ?</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {[
              { icon: Award, title: "Expertise certifiée", desc: "Équipe diplômée au Canada en TI, avec plus de 5 ans d'expérience terrain. Des standards élevés et des résultats mesurables." },
              { icon: Briefcase, title: "Double compétence", desc: "Opérations terrain et stratégie analytique sous un même toit." },
              { icon: Sparkles, title: "Approche sur mesure", desc: "Chaque client est unique, chaque solution est personnalisée selon vos besoins réels." },
              { icon: Target, title: "Résultats mesurables", desc: "Des livrables concrets avec des indicateurs de performance clairs et suivis." },
              { icon: Leaf, title: "Engagement écologique", desc: "Produits biodégradables et pratiques durables à chaque intervention." },
              { icon: Users, title: "Partenaire de confiance", desc: "Une startup agile, réactive et pleinement engagée envers votre succès." },
            ].map((item) => (
              <div key={item.title} className="flex items-start gap-4 p-4 rounded-xl bg-gray-50 hover:bg-[#e8f4f8] transition">
                <div className="w-10 h-10 bg-[#003d7a] rounded-full flex items-center justify-center flex-shrink-0">
                  <item.icon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-[#003d7a] mb-1">{item.title}</h3>
                  <p className="text-gray-600 text-sm">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-gradient-to-br from-[#003d7a] to-[#00a896] text-white">
        <div className="container mx-auto px-4 max-w-3xl text-center">
          <h2 className="text-3xl font-bold mb-4">Prêt à travailler avec nous ?</h2>
          <p className="text-lg opacity-90 mb-8">
            Contactez-nous dès aujourd'hui pour une consultation gratuite et découvrez comment BeauRive Solutions peut transformer votre quotidien.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/#contact">
              <Button size="lg" className="bg-white text-[#003d7a] hover:bg-gray-100 font-semibold px-8">
                Nous contacter
              </Button>
            </Link>
            <Link href="/">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10 font-semibold px-8">
                Voir nos services
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer minimal */}
      <footer className="py-6 bg-[#002a5c] text-white text-center text-sm">
        <p className="opacity-70">© {new Date().getFullYear()} BeauRive Solutions Multi-Services. Tous droits réservés.</p>
      </footer>
    </div>
  );
}
