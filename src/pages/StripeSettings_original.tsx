import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  CreditCard, CheckCircle2, AlertTriangle, ExternalLink,
  Settings, Zap, Shield, RefreshCw,
} from "lucide-react";

function cad(cents: number) {
  return (cents / 100).toLocaleString("fr-CA", { style: "currency", currency: "CAD" });
}

export default function StripeSettings() {
  const { data: config, isLoading: configLoading, refetch } = trpc.stripe.isConfigured.useQuery();
  const { data: stats, isLoading: statsLoading } = trpc.stripe.getStripeStats.useQuery();

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-[#003d7a] flex items-center gap-2">
            <CreditCard className="w-5 h-5" /> Configuration Stripe
          </h2>
          <p className="text-sm text-gray-500 mt-0.5">
            Gérez les clés API Stripe pour activer le paiement par carte de crédit sur les factures.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => refetch()} className="gap-2">
          <RefreshCw className="w-4 h-4" /> Actualiser
        </Button>
      </div>

      {/* Statut de la connexion */}
      <Card className={`border-2 ${config?.configured ? "border-green-200 bg-green-50/30" : "border-yellow-200 bg-yellow-50/30"}`}>
        <CardContent className="p-5">
          <div className="flex items-start gap-4">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${config?.configured ? "bg-green-100" : "bg-yellow-100"}`}>
              {configLoading ? (
                <RefreshCw className="w-6 h-6 animate-spin text-gray-400" />
              ) : config?.configured ? (
                <CheckCircle2 className="w-6 h-6 text-green-600" />
              ) : (
                <AlertTriangle className="w-6 h-6 text-yellow-600" />
              )}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-1">
                <h3 className="font-semibold text-gray-900">
                  {config?.configured ? "Stripe est connecté" : "Stripe n'est pas encore configuré"}
                </h3>
                {config?.configured && (
                  <Badge className={config.isLiveMode ? "bg-green-100 text-green-700" : "bg-blue-100 text-blue-700"}>
                    {config.isLiveMode ? "Mode production" : "Mode test"}
                  </Badge>
                )}
              </div>
              <p className="text-sm text-gray-600">
                {config?.configured
                  ? config.isLiveMode
                    ? "Votre compte Stripe est en mode production. Les paiements réels sont activés."
                    : "Votre compte Stripe est en mode test. Utilisez la carte 4242 4242 4242 4242 pour tester."
                  : "Les clés API Stripe ne sont pas encore configurées. Suivez les étapes ci-dessous pour activer le paiement en ligne."}
              </p>
              {config?.configured && config.publishableKey && (
                <p className="text-xs text-gray-400 mt-1 font-mono">
                  Clé publique : {config.publishableKey.substring(0, 20)}…
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Solde Stripe (si configuré) */}
      {config?.configured && stats && !("error" in stats) && (
        <div className="grid grid-cols-2 gap-4">
          <Card>
            <CardContent className="p-5">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Solde disponible</p>
              <p className="text-2xl font-bold text-green-700">{cad(stats.available ?? 0)}</p>
              <p className="text-xs text-gray-400 mt-1">Prêt pour virement</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">En transit</p>
              <p className="text-2xl font-bold text-blue-700">{cad(stats.pending ?? 0)}</p>
              <p className="text-xs text-gray-400 mt-1">En cours de traitement</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Instructions de configuration */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold text-[#003d7a] flex items-center gap-2">
            <Settings className="w-4 h-4" /> Comment configurer vos clés Stripe
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            {[
              {
                step: "1",
                title: "Créer ou accéder à votre compte Stripe",
                desc: "Rendez-vous sur stripe.com et connectez-vous ou créez un compte. Pour les tests, réclamez d'abord votre sandbox Stripe.",
                link: "https://dashboard.stripe.com",
                linkLabel: "Ouvrir Stripe Dashboard",
              },
              {
                step: "2",
                title: "Récupérer vos clés API",
                desc: "Dans le tableau de bord Stripe, allez dans Développeurs → Clés API. Copiez la clé secrète (sk_test_… ou sk_live_…) et la clé publiable (pk_test_… ou pk_live_…).",
                link: "https://dashboard.stripe.com/apikeys",
                linkLabel: "Voir les clés API",
              },
              {
                step: "3",
                title: "Entrer les clés dans les paramètres du site",
                desc: "Dans le panneau de gestion du site (icône en haut à droite → Paramètres → Secrets), entrez vos clés dans les champs STRIPE_SECRET_KEY et VITE_STRIPE_PUBLISHABLE_KEY.",
              },
              {
                step: "4",
                title: "Configurer le webhook Stripe",
                desc: "Dans Stripe Dashboard → Développeurs → Webhooks, ajoutez un endpoint pointant vers votre domaine avec l'URL ci-dessous. Copiez le secret de signature dans STRIPE_WEBHOOK_SECRET.",
                code: `${window.location.origin}/api/stripe/webhook`,
              },
              {
                step: "5",
                title: "Tester avec la carte de test",
                desc: "Une fois configuré en mode test, utilisez le numéro 4242 4242 4242 4242, n'importe quelle date future et n'importe quel CVC pour simuler un paiement réussi.",
              },
            ].map(item => (
              <div key={item.step} className="flex gap-4 p-4 rounded-lg bg-gray-50">
                <div className="w-7 h-7 rounded-full bg-[#003d7a] text-white text-xs font-bold flex items-center justify-center flex-shrink-0">
                  {item.step}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 text-sm">{item.title}</p>
                  <p className="text-xs text-gray-600 mt-0.5">{item.desc}</p>
                  {item.code && (
                    <code className="block mt-2 text-xs bg-white border border-gray-200 rounded px-3 py-2 font-mono text-[#003d7a] break-all">
                      {item.code}
                    </code>
                  )}
                  {item.link && (
                    <a
                      href={item.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-[#003d7a] hover:underline mt-2 font-medium"
                    >
                      {item.linkLabel} <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg border border-blue-100">
            <Shield className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-blue-800">Sécurité</p>
              <p className="text-xs text-blue-700 mt-0.5">
                Ne partagez jamais votre clé secrète Stripe. Elle est stockée de façon chiffrée dans les secrets du projet et n'est jamais exposée côté client.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-4 bg-amber-50 rounded-lg border border-amber-100">
            <Zap className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-amber-800">Sandbox Stripe disponible</p>
              <p className="text-xs text-amber-700 mt-0.5">
                Un sandbox Stripe de test a été créé pour ce projet. Réclamez-le avant le 1er mai 2026 pour l'activer.
              </p>
              <a
                href="https://dashboard.stripe.com/claim_sandbox/YWNjdF8xVDVxZFdBSjdCYW1IdFQ0LDE3NzMwMzgwNzcv100rrmNBxqk"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs text-amber-800 hover:underline mt-2 font-medium"
              >
                Réclamer le sandbox Stripe <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bouton vers les paramètres */}
      <div className="flex justify-center">
        <Button
          className="bg-[#003d7a] hover:bg-[#002d5a] gap-2"
          onClick={() => window.open("https://beaurive-gglftkmk.manus.space", "_blank")}
        >
          <Settings className="w-4 h-4" />
          Gérer les clés dans les paramètres du site
        </Button>
      </div>
    </div>
  );
}
