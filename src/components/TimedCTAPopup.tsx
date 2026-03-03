import { useState, useEffect } from "react";
import { X, Clock, Sparkles, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";

const POPUP_DELAY_MS = 3 * 60 * 1000; // 3 minutes
const STORAGE_KEY = "beaurive_popup_dismissed";

export default function TimedCTAPopup() {
  const [isVisible, setIsVisible] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    serviceType: "concierge",
  });

  useEffect(() => {
    // Ne pas afficher si déjà fermé/soumis dans cette session
    const dismissed = localStorage.getItem(STORAGE_KEY);
    if (dismissed) return;

    const timer = setTimeout(() => {
      setIsVisible(true);
    }, POPUP_DELAY_MS);

    return () => clearTimeout(timer);
  }, []);

  const submitMutation = trpc.contact.submit.useMutation({
    onSuccess: () => {
      setSubmitted(true);
      localStorage.setItem(STORAGE_KEY, "submitted");
      setTimeout(() => {
        setIsVisible(false);
      }, 3000);
    },
    onError: () => {
      toast.error("Une erreur s'est produite. Veuillez réessayer.");
    },
  });

  const handleClose = () => {
    setIsVisible(false);
    localStorage.setItem(STORAGE_KEY, "dismissed");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.phone) {
      toast.error("Veuillez remplir les champs obligatoires (nom, email, téléphone).");
      return;
    }
    submitMutation.mutate({
      ...formData,
      message: `[Popup 3 min] Intéressé par : ${
        formData.serviceType === "concierge" ? "Conciergerie" :
        formData.serviceType === "strategie" ? "Stratégie d'Affaires" : "Les deux services"
      }${formData.company ? ` — Entreprise: ${formData.company}` : ""}`,
    });
  };

  if (!isVisible) return null;

  const serviceLabels: Record<string, string> = {
    concierge: "Conciergerie (résidentiel/commercial)",
    strategie: "Stratégie d'Affaires & Marketing",
    both: "Les deux services",
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 animate-in fade-in duration-300"
        onClick={handleClose}
      />

      {/* Popup */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div
          className="bg-white rounded-2xl shadow-2xl w-full max-w-md pointer-events-auto animate-in zoom-in-95 slide-in-from-bottom-4 duration-300 overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header gradient */}
          <div className="bg-gradient-to-br from-[#003d7a] to-[#00a896] p-6 text-white text-center relative">
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition"
              aria-label="Fermer"
            >
              <X className="w-4 h-4 text-white" />
            </button>

            <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
              <Sparkles className="w-7 h-7 text-white" />
            </div>

            <h2 className="text-xl font-extrabold leading-tight">
              3 minutes sur le site&nbsp;= Vous êtes sérieux&nbsp;!
            </h2>
            <p className="text-sm mt-2 opacity-90">
              Obtenez une soumission gratuite de nos experts BeauRive dès maintenant.
            </p>
          </div>

          {/* Body */}
          <div className="p-6">
            {submitted ? (
              <div className="text-center py-4">
                <CheckCircle2 className="w-14 h-14 text-[#00a896] mx-auto mb-3" />
                <h3 className="text-lg font-bold text-[#003d7a] mb-2">Merci !</h3>
                <p className="text-gray-600 text-sm">
                  Nous vous contacterons dans les plus brefs délais.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <Input
                    placeholder="Votre nom *"
                    value={formData.name}
                    onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
                    className="border-gray-200 focus:border-[#00a896] focus:ring-[#00a896]"
                    required
                  />
                  <Input
                    type="email"
                    placeholder="Email *"
                    value={formData.email}
                    onChange={(e) => setFormData((p) => ({ ...p, email: e.target.value }))}
                    className="border-gray-200 focus:border-[#00a896] focus:ring-[#00a896]"
                    required
                  />
                </div>

                <Input
                  type="tel"
                  placeholder="Téléphone *"
                  value={formData.phone}
                  onChange={(e) => setFormData((p) => ({ ...p, phone: e.target.value }))}
                  className="border-gray-200 focus:border-[#00a896] focus:ring-[#00a896]"
                  required
                />

                <Input
                  placeholder="Nom de votre entreprise (optionnel)"
                  value={formData.company}
                  onChange={(e) => setFormData((p) => ({ ...p, company: e.target.value }))}
                  className="border-gray-200 focus:border-[#00a896] focus:ring-[#00a896]"
                />

                <Select
                  value={formData.serviceType}
                  onValueChange={(v) => setFormData((p) => ({ ...p, serviceType: v }))}
                >
                  <SelectTrigger className="border-gray-200 focus:border-[#00a896]">
                    <SelectValue placeholder="Quel service vous intéresse ?" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="concierge">Conciergerie (résidentiel / commercial)</SelectItem>
                    <SelectItem value="strategie">Stratégie d'Affaires & Marketing</SelectItem>
                    <SelectItem value="both">Les deux services</SelectItem>
                  </SelectContent>
                </Select>

                <Button
                  type="submit"
                  disabled={submitMutation.isPending}
                  className="w-full bg-gradient-to-r from-[#003d7a] to-[#00a896] hover:from-[#002d5a] hover:to-[#008a7a] text-white font-bold py-3 text-base rounded-xl shadow-lg transition-all duration-200"
                >
                  {submitMutation.isPending ? "Envoi en cours..." : "Obtenir ma soumission gratuite →"}
                </Button>

                <div className="flex items-center justify-center gap-2 text-[#00a896] text-xs font-medium">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Réponse sous 24h en heures ouvrables</span>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
