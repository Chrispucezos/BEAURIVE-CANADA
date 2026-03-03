import { useState, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { CheckCircle2, XCircle, Loader2, LogIn, User } from "lucide-react";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";

export default function AcceptInvitation() {
  const params = useParams<{ token: string }>();
  const token = params.token || "";
  const [, navigate] = useLocation();
  const { user, loading: authLoading } = useAuth();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, []);

  // Valider le token d'invitation
  const { data: validation, isLoading: validating } = trpc.admin.validateInvitation.useQuery(
    { token },
    { enabled: !!token, retry: false }
  );

  // Mutation pour accepter l'invitation (marquer comme acceptée)
  const acceptMutation = trpc.admin.acceptInvitation.useMutation({
    onSuccess: () => {
      setTimeout(() => navigate("/mon-espace"), 2000);
    },
  });

  // Si l'utilisateur est connecté et que le token est valide, accepter automatiquement
  useEffect(() => {
    if (user && validation?.valid && !acceptMutation.isSuccess && !acceptMutation.isPending) {
      acceptMutation.mutate({ token });
    }
  }, [user, validation]);

  // Construire l'URL de login avec redirection vers cette page
  const loginUrl = getLoginUrl() + (getLoginUrl().includes("?") ? "&" : "?") + `redirect=${encodeURIComponent(`/invitation/${token}`)}`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#003d7a] to-[#00a896] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <a href="/" className="inline-flex items-center gap-3 text-white no-underline">
            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-[#003d7a] font-bold text-lg">B</span>
            </div>
            <div className="text-left">
              <div className="font-bold text-xl">BeauRive Solutions</div>
              <div className="text-xs text-white/70 uppercase tracking-widest">Multi-Service</div>
            </div>
          </a>
        </div>

        <Card className="shadow-2xl border-0">
          <CardHeader className="text-center pb-2">
            <CardTitle className="text-2xl text-[#003d7a]">Invitation Client</CardTitle>
            <CardDescription>Accédez à votre espace personnel BeauRive</CardDescription>
          </CardHeader>
          <CardContent className="pt-4">

            {/* Chargement validation */}
            {(validating || authLoading) && (
              <div className="flex flex-col items-center gap-4 py-8">
                <Loader2 className="w-10 h-10 text-[#00a896] animate-spin" />
                <p className="text-gray-500 text-sm">Vérification de votre invitation…</p>
              </div>
            )}

            {/* Token invalide ou expiré */}
            {!validating && !authLoading && validation && !validation.valid && (
              <div className="flex flex-col items-center gap-4 py-6 text-center">
                <XCircle className="w-14 h-14 text-red-500" />
                <div>
                  <p className="font-semibold text-gray-800 text-lg">Invitation invalide</p>
                  <p className="text-gray-500 text-sm mt-1">{validation.reason}</p>
                </div>
                <p className="text-xs text-gray-400">
                  Contactez-nous au <a href="tel:5813492323" className="text-[#003d7a] font-semibold">581-349-2323</a> ou à{" "}
                  <a href="mailto:info@beaurive.ca" className="text-[#003d7a] font-semibold">info@beaurive.ca</a>
                </p>
                <Button variant="outline" onClick={() => navigate("/")}>Retour à l'accueil</Button>
              </div>
            )}

            {/* Token valide — pas encore connecté */}
            {!validating && !authLoading && validation?.valid && !user && (
              <div className="flex flex-col items-center gap-5 py-4 text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                  <User className="w-8 h-8 text-green-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-800 text-lg">
                    Bonjour, {validation.invitation?.clientName} !
                  </p>
                  <p className="text-gray-500 text-sm mt-1">
                    Votre invitation est valide. Connectez-vous pour accéder à votre espace client.
                  </p>
                </div>
                <a href={loginUrl} className="w-full">
                  <Button className="w-full bg-[#003d7a] hover:bg-[#002d5a] text-white gap-2">
                    <LogIn className="w-4 h-4" />
                    Se connecter / Créer un compte
                  </Button>
                </a>
                <p className="text-xs text-gray-400">
                  Vous serez redirigé vers votre espace client après la connexion.
                </p>
              </div>
            )}

            {/* Connecté — acceptation en cours */}
            {!validating && !authLoading && validation?.valid && user && acceptMutation.isPending && (
              <div className="flex flex-col items-center gap-4 py-8">
                <Loader2 className="w-10 h-10 text-[#00a896] animate-spin" />
                <p className="text-gray-500 text-sm">Activation de votre espace client…</p>
              </div>
            )}

            {/* Succès */}
            {!validating && !authLoading && acceptMutation.isSuccess && (
              <div className="flex flex-col items-center gap-4 py-6 text-center">
                <CheckCircle2 className="w-14 h-14 text-green-500" />
                <div>
                  <p className="font-semibold text-gray-800 text-lg">Bienvenue !</p>
                  <p className="text-gray-500 text-sm mt-1">
                    Votre espace client est activé. Redirection en cours…
                  </p>
                </div>
              </div>
            )}

            {/* Erreur acceptation */}
            {!validating && !authLoading && acceptMutation.isError && (
              <div className="flex flex-col items-center gap-4 py-6 text-center">
                <XCircle className="w-14 h-14 text-red-500" />
                <p className="text-gray-500 text-sm">Une erreur s'est produite. Veuillez réessayer ou nous contacter.</p>
                <Button variant="outline" onClick={() => acceptMutation.mutate({ token })}>
                  Réessayer
                </Button>
              </div>
            )}

          </CardContent>
        </Card>

        <p className="text-center text-white/50 text-xs mt-6">
          © {new Date().getFullYear()} BeauRive Solutions Multi-Service
        </p>
      </div>
    </div>
  );
}
