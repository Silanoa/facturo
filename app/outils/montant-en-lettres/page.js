import Link from "next/link";
import { LangProvider } from "../../../lib/i18n";
import { SiteNav, SiteFooter } from "../../../components/Brand";
import { Words } from "../../../components/Tools";
export const metadata = { title: "Montant en lettres : convertir un chiffre en lettres (FCFA, euro)", description: "Écrivez n'importe quel montant en lettres, sans faute d'accord : « cinq cent dix-neuf mille deux cents francs CFA ». Formule « Arrêtée la présente facture à la somme de » prête à copier.", alternates: { canonical: "/outils/montant-en-lettres" } };
export default function P() { return (<><SiteNav /><main className="wrap" style={{ paddingTop: 30, paddingBottom: 60 }}>
  <p className="u"><Link href="/outils" style={{ textDecoration: "none" }}>Outils</Link> / Montant en lettres</p><h1 style={{ fontSize: "clamp(36px,5vw,60px)", margin: "10px 0 14px" }}>Votre montant, en toutes lettres.</h1>
  <p className="mute" style={{ fontSize: 18, maxWidth: 640, marginBottom: 26 }}>Indispensable sur les factures, chèques et contrats en zone OHADA. Les règles d'accord de « cent », « vingt » et « mille » sont appliquées.</p>
  <div style={{ maxWidth: 860 }}><LangProvider initial="fr"><Words /></LangProvider></div>
  <div className="prose" style={{ marginTop: 50 }}><h2>Les trois règles qui piègent tout le monde</h2>
    <ul><li><b>Cent</b> et <b>vingt</b> prennent un « s » quand ils sont multipliés et terminent le nombre : deux cents, quatre-vingts. Mais : deux cent mille, quatre-vingt-trois.</li><li><b>Mille</b> est invariable : trois mille, jamais « trois milles ».</li><li><b>Million</b> et <b>milliard</b> sont des noms : deux millions <i>de</i> francs CFA.</li></ul>
    <p>Depuis la réforme de 1990, on peut aussi relier tous les mots par des traits d'union (deux-cent-mille). Les deux graphies sont acceptées ; Bonova utilise la graphie traditionnelle, la plus courante sur les documents commerciaux.</p>
    <p>Le montant en lettres est ajouté automatiquement à chaque <Link href="/essai">facture créée avec Bonova</Link>.</p></div>
</main><SiteFooter /></>); }
