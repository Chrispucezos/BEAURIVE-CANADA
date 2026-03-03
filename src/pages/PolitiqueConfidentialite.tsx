import { Link, useLocation } from "wouter";
import { useEffect } from "react";

export default function PolitiqueConfidentialite() {
  const [location] = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [location]);

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-[#003d7a] text-white py-8">
        <div className="container mx-auto px-4">
          <Link href="/" className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-4 text-sm transition">
            ← Retour à l'accueil
          </Link>
          <h1 className="text-3xl md:text-4xl font-bold">Politique de confidentialité</h1>
          <p className="text-white/70 mt-2">Conforme à la Loi 25 du Québec — En vigueur depuis le 18 octobre 2023</p>
        </div>
      </header>

      {/* Content */}
      <main className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="bg-[#e8f4f8] border-l-4 border-[#00a896] rounded-lg p-6 mb-10">
          <h2 className="text-lg font-bold text-[#003d7a] mb-2">Conformité à la Loi 25 (Québec)</h2>
          <p className="text-gray-700 text-sm leading-relaxed">
            BeauRive Solutions Multi-Service respecte pleinement la <strong>Loi modernisant des dispositions législatives en matière de protection des renseignements personnels (Loi 25)</strong>, adoptée par l'Assemblée nationale du Québec. Cette loi renforce les droits des individus sur leurs données personnelles et impose des obligations strictes aux entreprises qui collectent, utilisent ou communiquent des renseignements personnels. Notre politique est alignée sur les exigences de la <strong>Loi sur la protection des renseignements personnels dans le secteur privé (LPRPSP)</strong> ainsi que sur les lignes directrices de la <strong>Commission d'accès à l'information (CAI)</strong>.
          </p>
        </div>

        <section className="mb-10">
          <h2 className="text-2xl font-bold text-[#003d7a] mb-4 border-b border-gray-200 pb-2">1. Introduction</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            À mesure que de nouveaux moyens de communication se développent, la protection de la vie privée devient cruciale. BeauRive Solutions Multi-Service s'engage à respecter la confidentialité des informations personnelles qu'elle collecte dans le cadre de ses activités de conciergerie résidentielle, commerciale et de stratégie d'affaires.
          </p>
          <p className="text-gray-700 leading-relaxed">
            Cette politique décrit comment nous traitons et protégeons les renseignements personnels que nous recueillons par un moyen technologique (par exemple, par courriel ou en ligne). Nous suivons ces règles pour protéger votre vie privée et respecter nos obligations légales, notamment en vertu de la Loi 25.
          </p>
        </section>

        <section className="mb-10">
          <h2 className="text-2xl font-bold text-[#003d7a] mb-4 border-b border-gray-200 pb-2">2. À qui s'adresse cette politique ?</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            Les règles décrites dans cette politique vous concernent si nous recueillons vos renseignements personnels par un moyen technologique dans le cadre de nos activités. Cette politique s'applique notamment dans les situations suivantes :
          </p>
          <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
            <li>Si vous nous contactez par courriel à info@beaurive.ca</li>
            <li>Si vous remplissez l'un de nos formulaires de contact en ligne</li>
            <li>Si vous naviguez sur notre site web beaurive.ca</li>
          </ul>
          <p className="text-gray-700 leading-relaxed mt-4">
            En utilisant ce site, vous acceptez la présente politique de confidentialité.
          </p>
        </section>

        <section className="mb-10">
          <h2 className="text-2xl font-bold text-[#003d7a] mb-4 border-b border-gray-200 pb-2">3. Collecte d'informations personnelles</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            Avec votre consentement (données fournies volontairement par le biais de formulaires), nous recueillons les types d'informations suivants :
          </p>
          <div className="bg-gray-50 rounded-lg p-4 mb-4">
            <ul className="list-disc list-inside text-gray-700 space-y-1 ml-2">
              <li>Votre nom complet</li>
              <li>Votre adresse courriel</li>
              <li>Votre numéro de téléphone</li>
              <li>Le nom de votre entreprise (le cas échéant)</li>
              <li>Le type de service souhaité</li>
            </ul>
          </div>
          <p className="text-gray-700 leading-relaxed">
            Ces données personnelles sont obtenues via des formulaires et des interactions entre vous et notre site web. Conformément à la Loi 25, nous ne collectons que les renseignements nécessaires aux fins déterminées et avec votre consentement explicite.
          </p>
        </section>

        <section className="mb-10">
          <h2 className="text-2xl font-bold text-[#003d7a] mb-4 border-b border-gray-200 pb-2">4. Responsable de la protection des données personnelles</h2>
          <div className="bg-[#003d7a] text-white rounded-lg p-6">
            <p className="mb-2"><strong>Responsable :</strong> Beaudelaire Hounsa</p>
            <p className="mb-2"><strong>Courriel :</strong> info@beaurive.ca</p>
            <p className="mb-2"><strong>Téléphone :</strong> 581-349-2323</p>
            <p><strong>Adresse :</strong> 2317 boulevard père Lelièvre, Capitale-Nationale G1P 2X2, Québec, Canada</p>
          </div>
          <p className="text-gray-600 text-sm mt-3">
            Conformément à la Loi 25, toute entreprise doit désigner une personne responsable de la protection des renseignements personnels. Cette personne veille au respect des obligations légales et traite les demandes d'accès, de rectification ou de retrait.
          </p>
        </section>

        <section className="mb-10">
          <h2 className="text-2xl font-bold text-[#003d7a] mb-4 border-b border-gray-200 pb-2">5. Méthodes de collecte et traitement de vos données</h2>

          <h3 className="text-lg font-semibold text-[#003d7a] mb-3">5.1 Les formulaires</h3>
          <p className="text-gray-700 leading-relaxed mb-6">
            Vos informations personnelles sont collectées via les formulaires suivants : formulaire de demande d'informations et de soumission, formulaire de contact général.
          </p>

          <h3 className="text-lg font-semibold text-[#003d7a] mb-3">5.2 Utilisation de vos données</h3>
          <p className="text-gray-700 leading-relaxed mb-3">Nous utilisons ces informations dans le but de :</p>
          <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4 mb-6">
            <li>Vous contacter (pour répondre à vos demandes, commentaires ou questions)</li>
            <li>Gérer le site web (améliorer l'expérience de nos visiteurs)</li>
            <li>Avec votre consentement, vous transmettre des offres et annonces par courriel</li>
            <li>Assurer le suivi client</li>
            <li>À des fins de statistiques anonymes</li>
          </ul>

          <h3 className="text-lg font-semibold text-[#003d7a] mb-3">5.3 Divulgation et conservation de vos données</h3>
          <p className="text-gray-700 leading-relaxed mb-4">
            Nous ne disposerons pas de vos renseignements personnels à d'autres fins que celles précisées lors de la collecte, sauf si vous y consentez expressément ou si la loi l'exige. Nous ne louerons pas, ne vendrons pas et ne partagerons pas vos données personnelles à des tiers sans votre accord.
          </p>
          <p className="text-gray-700 leading-relaxed">
            Conformément à la Loi 25, vos données personnelles sont conservées uniquement pour la durée nécessaire aux fins pour lesquelles elles ont été collectées. Les données qui ne sont plus nécessaires seront détruites, effacées ou rendues anonymes de façon sécuritaire.
          </p>
        </section>

        <section className="mb-10">
          <h2 className="text-2xl font-bold text-[#003d7a] mb-4 border-b border-gray-200 pb-2">6. Témoins (Cookies) et fichiers journaux</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            Notre site internet utilise des témoins de connexion (cookies) pour améliorer votre expérience de navigation. Ces témoins recueillent des informations telles que votre adresse IP, le système d'exploitation de votre appareil et les pages consultées. Vous pouvez configurer votre navigateur pour bloquer les témoins.
          </p>
          <p className="text-gray-700 leading-relaxed">
            Nous collectons principalement des données analytiques anonymes (provenance, navigateur utilisé, nombre de pages vues) pour améliorer notre site web. Conformément à la Loi 25, vous serez informé de tout outil de collecte automatisé et pouvez vous y opposer.
          </p>
        </section>

        <section className="mb-10">
          <h2 className="text-2xl font-bold text-[#003d7a] mb-4 border-b border-gray-200 pb-2">7. Vos droits (Loi 25)</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            La Loi 25 vous confère les droits suivants concernant vos renseignements personnels :
          </p>
          <div className="grid md:grid-cols-2 gap-4 mb-6">
            {[
              { titre: "Droit d'accès", desc: "Vous pouvez demander à consulter les renseignements personnels que nous détenons à votre sujet." },
              { titre: "Droit de rectification", desc: "Vous pouvez demander la correction de renseignements inexacts ou incomplets." },
              { titre: "Droit de retrait", desc: "Vous pouvez retirer votre consentement à l'utilisation de vos données à tout moment." },
              { titre: "Droit à la portabilité", desc: "Vous pouvez demander que vos données vous soient remises dans un format technologique structuré." },
            ].map((d, i) => (
              <div key={i} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <h4 className="font-semibold text-[#003d7a] mb-1">{d.titre}</h4>
                <p className="text-gray-600 text-sm">{d.desc}</p>
              </div>
            ))}
          </div>

          <h3 className="text-lg font-semibold text-[#003d7a] mb-3">Procédure pour exercer vos droits</h3>
          <ol className="list-decimal list-inside text-gray-700 space-y-2 ml-4">
            <li>Envoyez une demande écrite au Responsable de la protection des renseignements personnels (coordonnées à la section 4).</li>
            <li>Nous traiterons votre demande dans les <strong>30 jours</strong> suivant sa réception.</li>
            <li>Vous recevrez notre réponse par courriel ou appel téléphonique.</li>
          </ol>
        </section>

        <section className="mb-10">
          <h2 className="text-2xl font-bold text-[#003d7a] mb-4 border-b border-gray-200 pb-2">8. Sécurité</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            Les informations personnelles que nous collectons sont conservées de manière sécurisée. Les personnes travaillant avec nous sont tenues de respecter la confidentialité de vos données. Pour assurer la sécurité de vos informations personnelles, nous utilisons des mesures telles que le protocole SSL, la sauvegarde informatique, les identifiants/mots de passe et les pare-feu.
          </p>
          <p className="text-gray-700 leading-relaxed">
            Conformément à la Loi 25, en cas d'incident de confidentialité (accès, utilisation, communication ou perte non autorisée), nous avons l'obligation de vous en aviser et d'en informer la Commission d'accès à l'information (CAI) si l'incident présente un risque sérieux de préjudice.
          </p>
        </section>

        <section className="mb-10">
          <h2 className="text-2xl font-bold text-[#003d7a] mb-4 border-b border-gray-200 pb-2">9. Sites externes</h2>
          <p className="text-gray-700 leading-relaxed">
            Notre site peut contenir des liens vers des sites externes. Nous ne sommes pas responsables du contenu ou des pratiques en matière de confidentialité de ces sites. Nous vous encourageons à consulter leurs politiques de confidentialité.
          </p>
        </section>

        <section className="mb-10">
          <h2 className="text-2xl font-bold text-[#003d7a] mb-4 border-b border-gray-200 pb-2">10. Mises à jour de la présente politique</h2>
          <p className="text-gray-700 leading-relaxed">
            La présente politique entre en vigueur à partir du <strong>18 octobre 2023</strong> et remplace toutes les versions antérieures. Elle pourra être modifiée lorsque cela s'avère nécessaire et sans préavis, notamment pour se conformer aux évolutions de la Loi 25 et aux directives de la Commission d'accès à l'information du Québec.
          </p>
        </section>

        <div className="bg-gray-100 rounded-lg p-6 text-center">
          <p className="text-gray-600 text-sm mb-3">Pour toute question relative à cette politique ou à vos droits :</p>
          <div className="flex flex-wrap justify-center gap-4">
            <a href="mailto:info@beaurive.ca" className="text-[#003d7a] font-semibold hover:underline">info@beaurive.ca</a>
            <span className="text-gray-400">|</span>
            <a href="tel:5813492323" className="text-[#003d7a] font-semibold hover:underline">581-349-2323</a>
            <span className="text-gray-400">|</span>
            <span className="text-gray-600">Québec, Canada</span>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-[#003d7a] text-white py-6 mt-8">
        <div className="container mx-auto px-4 text-center text-gray-300 text-sm">
          <p>&copy; 2026 BeauRive Solutions Multi-Services. Tous droits réservés.</p>
          <p className="mt-1">
            <Link href="/" className="hover:text-white underline transition">Retour à l'accueil</Link>
          </p>
        </div>
      </footer>
    </div>
  );
}
