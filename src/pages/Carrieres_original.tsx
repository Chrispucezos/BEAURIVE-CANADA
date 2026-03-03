import { useState } from "react";
import { Link } from "react-router-dom";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Briefcase, MapPin, Clock, DollarSign, Send, ChevronDown, ChevronUp, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

const TYPE_LABELS: Record<string, string> = {
  "temps-plein": "Temps plein",
  "temps-partiel": "Temps partiel",
  "contrat": "Contrat",
  "stage": "Stage",
};

const TYPE_COLORS: Record<string, string> = {
  "temps-plein": "bg-blue-100 text-blue-800",
  "temps-partiel": "bg-purple-100 text-purple-800",
  "contrat": "bg-amber-100 text-amber-800",
  "stage": "bg-green-100 text-green-800",
};

export default function Carrieres() {
  const [expandedJob, setExpandedJob] = useState<number | null>(null);
  const [showSpontForm, setShowSpontForm] = useState(false);
  const [applyingTo, setApplyingTo] = useState<{ id: number; title: string } | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    positionDesired: "",
    coverLetter: "",
  });

  const { data: jobPostings = [], isLoading } = trpc.careers.getJobPostings.useQuery();

  const submitMutation = trpc.careers.submitApplication.useMutation({
    onSuccess: () => {
      setSubmitted(true);
      setForm({ firstName: "", lastName: "", email: "", phone: "", positionDesired: "", coverLetter: "" });
      setShowSpontForm(false);
      setApplyingTo(null);
    },
    onError: (err) => {
      toast.error(err.message || "Une erreur est survenue");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitMutation.mutate({
      ...(applyingTo ? { jobPostingId: applyingTo.id } : {}),
      firstName: form.firstName,
      lastName: form.lastName,
      email: form.email,
      phone: form.phone || undefined,
      positionDesired: applyingTo ? applyingTo.title : (form.positionDesired || undefined),
      coverLetter: form.coverLetter || undefined,
    });
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-gradient-to-r from-[#003d7a] to-[#00a896] text-white py-16">
        <div className="container mx-auto px-4">
          <Link to="/" className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-6 text-sm transition">
            <ArrowLeft className="w-4 h-4" />
            Retour à l'accueil
          </Link>
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-white/20 rounded-full px-4 py-1 text-sm font-medium mb-4">
              <Briefcase className="w-4 h-4" />
              Carrières chez BeauRive
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Rejoignez Notre Équipe</h1>
            <p className="text-white/85 text-lg leading-relaxed">
              BeauRive Solutions Multi-Service est une entreprise en pleine croissance. Nous cherchons des personnes passionnées, rigoureuses et engagées pour nous aider à offrir l'excellence à nos clients.
            </p>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12 max-w-5xl">

        {/* Confirmation de soumission */}
        {submitted && (
          <div className="mb-8 bg-green-50 border border-green-200 rounded-xl p-6 text-center">
            <div className="text-4xl mb-3">✅</div>
            <h3 className="text-xl font-bold text-green-800 mb-2">Candidature reçue !</h3>
            <p className="text-green-700">Merci pour votre intérêt. Nous examinerons votre candidature et vous contacterons si votre profil correspond à nos besoins.</p>
            <Button className="mt-4 bg-[#003d7a] hover:bg-[#002d5a]" onClick={() => setSubmitted(false)}>
              Soumettre une autre candidature
            </Button>
          </div>
        )}

        {/* Section Offres d'emploi */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-[#003d7a] mb-2">Offres d'emploi</h2>
          <p className="text-gray-500 mb-6">Postes actuellement disponibles chez BeauRive Solutions</p>

          {isLoading ? (
            <div className="space-y-4">
              {[1, 2].map(i => (
                <div key={i} className="h-24 bg-gray-100 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : jobPostings.length === 0 ? (
            <div className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl p-12 text-center">
              <Briefcase className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">Aucune offre d'emploi pour le moment</h3>
              <p className="text-gray-500 max-w-md mx-auto">
                Nous n'avons pas de postes ouverts actuellement, mais nous sommes toujours à la recherche de talents. Envoyez-nous une candidature spontanée ci-dessous !
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {jobPostings.map((job) => (
                <Card key={job.id} className="border border-gray-200 hover:border-[#00a896] transition-colors">
                  <CardHeader
                    className="cursor-pointer"
                    onClick={() => setExpandedJob(expandedJob === job.id ? null : job.id)}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          <Badge className={TYPE_COLORS[job.type] || "bg-gray-100 text-gray-700"}>
                            {TYPE_LABELS[job.type] || job.type}
                          </Badge>
                          <span className="text-sm text-gray-500">{job.department}</span>
                        </div>
                        <CardTitle className="text-lg text-[#003d7a]">{job.title}</CardTitle>
                        <div className="flex flex-wrap gap-4 mt-2 text-sm text-gray-500">
                          <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{job.location}</span>
                          {job.salary && <span className="flex items-center gap-1"><DollarSign className="w-3 h-3" />{job.salary}</span>}
                          <span className="flex items-center gap-1"><Clock className="w-3 h-3" />Publié le {new Date(job.createdAt).toLocaleDateString("fr-CA")}</span>
                        </div>
                      </div>
                      {expandedJob === job.id ? <ChevronUp className="w-5 h-5 text-gray-400 flex-shrink-0 mt-1" /> : <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0 mt-1" />}
                    </div>
                  </CardHeader>
                  {expandedJob === job.id && (
                    <CardContent className="pt-0">
                      <div className="border-t border-gray-100 pt-4 space-y-4">
                        <div>
                          <h4 className="font-semibold text-gray-800 mb-2">Description du poste</h4>
                          <p className="text-gray-600 whitespace-pre-line">{job.description}</p>
                        </div>
                        {job.requirements && (
                          <div>
                            <h4 className="font-semibold text-gray-800 mb-2">Exigences</h4>
                            <p className="text-gray-600 whitespace-pre-line">{job.requirements}</p>
                          </div>
                        )}
                        <Button
                          className="bg-[#003d7a] hover:bg-[#002d5a] text-white"
                          onClick={() => {
                            setApplyingTo({ id: job.id, title: job.title });
                            setShowSpontForm(true);
                            setTimeout(() => document.getElementById("application-form")?.scrollIntoView({ behavior: "smooth" }), 100);
                          }}
                        >
                          <Send className="w-4 h-4 mr-2" />
                          Postuler pour ce poste
                        </Button>
                      </div>
                    </CardContent>
                  )}
                </Card>
              ))}
            </div>
          )}
        </section>

        {/* Section Candidature spontanée */}
        <section id="application-form" className="bg-gradient-to-br from-[#f0f7ff] to-[#e8faf8] rounded-2xl p-8 border border-[#c8e6f5]">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-[#003d7a] mb-1">
                {applyingTo ? `Postuler : ${applyingTo.title}` : "Candidature Spontanée"}
              </h2>
              <p className="text-gray-600">
                {applyingTo
                  ? "Remplissez le formulaire ci-dessous pour postuler à ce poste."
                  : "Aucun poste ne correspond à votre profil ? Envoyez-nous votre candidature — nous gardons les profils intéressants en dossier."}
              </p>
            </div>
            {applyingTo && (
              <Button variant="outline" size="sm" onClick={() => setApplyingTo(null)}>
                Candidature spontanée
              </Button>
            )}
          </div>

          {!showSpontForm && !applyingTo ? (
            <Button
              className="bg-[#003d7a] hover:bg-[#002d5a] text-white px-8"
              onClick={() => setShowSpontForm(true)}
            >
              <Send className="w-4 h-4 mr-2" />
              Envoyer ma candidature spontanée
            </Button>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="font-semibold">Prénom *</Label>
                  <Input
                    className="mt-1"
                    value={form.firstName}
                    onChange={e => setForm(f => ({ ...f, firstName: e.target.value }))}
                    placeholder="Jean"
                    required
                  />
                </div>
                <div>
                  <Label className="font-semibold">Nom *</Label>
                  <Input
                    className="mt-1"
                    value={form.lastName}
                    onChange={e => setForm(f => ({ ...f, lastName: e.target.value }))}
                    placeholder="Tremblay"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="font-semibold">Courriel *</Label>
                  <Input
                    className="mt-1"
                    type="email"
                    value={form.email}
                    onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                    placeholder="jean.tremblay@exemple.com"
                    required
                  />
                </div>
                <div>
                  <Label className="font-semibold">Téléphone</Label>
                  <Input
                    className="mt-1"
                    type="tel"
                    value={form.phone}
                    onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                    placeholder="418-555-0000"
                  />
                </div>
              </div>

              {!applyingTo && (
                <div>
                  <Label className="font-semibold">Poste visé</Label>
                  <Input
                    className="mt-1"
                    value={form.positionDesired}
                    onChange={e => setForm(f => ({ ...f, positionDesired: e.target.value }))}
                    placeholder="Ex. : Agent de conciergerie, Coordonnateur, etc."
                  />
                </div>
              )}

              <div>
                <Label className="font-semibold">Lettre de motivation</Label>
                <Textarea
                  className="mt-1 min-h-[140px]"
                  value={form.coverLetter}
                  onChange={e => setForm(f => ({ ...f, coverLetter: e.target.value }))}
                  placeholder="Présentez-vous brièvement : votre expérience, vos compétences, pourquoi vous souhaitez rejoindre BeauRive..."
                  maxLength={5000}
                />
                <p className="text-xs text-gray-400 mt-1">{form.coverLetter.length}/5000 caractères</p>
              </div>

              <div className="flex gap-3 pt-2">
                <Button
                  type="submit"
                  className="bg-[#003d7a] hover:bg-[#002d5a] text-white px-8"
                  disabled={submitMutation.isPending}
                >
                  {submitMutation.isPending ? (
                    <span className="flex items-center gap-2"><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Envoi en cours...</span>
                  ) : (
                    <span className="flex items-center gap-2"><Send className="w-4 h-4" />Envoyer ma candidature</span>
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => { setShowSpontForm(false); setApplyingTo(null); }}
                >
                  Annuler
                </Button>
              </div>
            </form>
          )}
        </section>

        {/* Valeurs de l'entreprise */}
        <section className="mt-12 grid md:grid-cols-3 gap-6">
          {[
            { emoji: "🤝", titre: "Équipe Soudée", desc: "Nous valorisons la collaboration, le respect et l'entraide au quotidien." },
            { emoji: "📈", titre: "Croissance Rapide", desc: "Opportunités d'avancement réelles dans une entreprise en expansion." },
            { emoji: "⭐", titre: "Excellence du Service", desc: "Nous sommes fiers de livrer un service de qualité supérieure à chaque client." },
          ].map((v, i) => (
            <div key={i} className="bg-white border border-gray-100 rounded-xl p-6 text-center shadow-sm hover:shadow-md transition-shadow">
              <div className="text-4xl mb-3">{v.emoji}</div>
              <h3 className="font-bold text-[#003d7a] mb-2">{v.titre}</h3>
              <p className="text-gray-600 text-sm">{v.desc}</p>
            </div>
          ))}
        </section>
      </main>

      {/* Footer simple */}
      <footer className="bg-[#003d7a] text-white py-6 mt-12">
        <div className="container mx-auto px-4 text-center text-gray-300 text-sm">
          <p>&copy; 2026 BeauRive Solutions Multi-Services. Tous droits réservés.</p>
          <p className="mt-1">
            <Link to="/" className="hover:text-white underline transition">Retour à l'accueil</Link>
          </p>
        </div>
      </footer>
    </div>
  );
}
