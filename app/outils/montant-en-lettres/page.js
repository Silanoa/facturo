import Link from "next/link";
import ToolSeo from "../../../components/ToolSeo";
import { LangProvider } from "../../../lib/i18n";
import { SiteNav, SiteFooter } from "../../../components/Brand";
import { Words } from "../../../components/Tools";
import { eurToXof, fmt, cfaWords } from "../../../lib/money";
export const metadata = { title: "Montant en lettres et euros en francs CFA : convertisseur gratuit", description: "Écrivez un montant en lettres sans faute (francs CFA, euros, dollars) et convertissez des euros en francs CFA, en chiffres et en lettres, à la parité fixe de 655,957. Exemple : 2 000 € = 1 311 914 FCFA.", alternates: { canonical: "/outils/montant-en-lettres", languages: { fr: "/outils/montant-en-lettres", en: "/en/tools/amount-in-words", "x-default": "/outils/montant-en-lettres" } } };
const EUR = [1000, 2000, 5000, 10000, 50000, 100000, 500000, 1000000, 140000000];
const CFA = [50000, 100000, 250000, 500000, 700000, 1000000, 2500000];
const eur = (v) => new Intl.NumberFormat("fr-FR").format(v).replace(/\u202f|\u00a0/g, " ") + " €";
const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);
export default function P() { return (<><SiteNav /><main className="wrap" style={{ paddingTop: 30, paddingBottom: 60 }}>
  <p className="u"><Link href="/outils" style={{ textDecoration: "none" }}>Outils</Link> / Montant en lettres</p><h1 style={{ fontSize: "clamp(36px,5vw,60px)", margin: "10px 0 14px" }}>Montant en lettres, en francs CFA ou en euros.</h1>
  <p className="mute" style={{ fontSize: 18, maxWidth: 680, marginBottom: 26 }}>Pour les factures, chèques et contrats. Saisissez un montant pour l'obtenir en lettres, ou convertissez un montant en euros en francs CFA, en chiffres et en lettres. Les règles d'accord sont appliquées.</p>
  <div style={{ maxWidth: 860 }}><LangProvider initial="fr"><Words /></LangProvider></div>
  <div className="prose" style={{ marginTop: 50 }}>
    <h2>Convertir des euros en francs CFA</h2>
    <p>Le franc CFA est lié à l'euro par une parité fixe : <b>1 € = 655,957 FCFA</b>, aussi bien pour le franc CFA d'Afrique de l'Ouest (XOF, UEMOA) que pour celui d'Afrique centrale (XAF, CEMAC). Pour convertir, on multiplie le montant en euros par 655,957, puis on arrondit au franc. Le taux ne varie pas d'un jour à l'autre : seuls les frais de change de votre banque ou de votre service de transfert peuvent modifier la somme reçue.</p>
    <div style={{ overflowX: "auto" }}><table><thead><tr><th>Euros</th><th>Francs CFA</th><th>En lettres</th></tr></thead>
      <tbody>{EUR.map((v) => { const x = eurToXof(v); return <tr key={v}><td className="mono" style={{ whiteSpace: "nowrap" }}>{eur(v)}</td><td className="mono" style={{ whiteSpace: "nowrap" }}>{fmt(x, "XOF")}</td><td>{cap(cfaWords(x))}</td></tr>; })}</tbody></table></div>
    <p>Sur une facture, on écrira par exemple : « Arrêtée la présente facture à la somme de {cfaWords(eurToXof(2000))} (1 311 914 FCFA) ».</p>
    <h2>Montants courants en francs CFA</h2>
    <div style={{ overflowX: "auto" }}><table><thead><tr><th>En chiffres</th><th>En lettres</th></tr></thead>
      <tbody>{CFA.map((v) => <tr key={v}><td className="mono" style={{ whiteSpace: "nowrap" }}>{fmt(v, "XOF")}</td><td>{cap(cfaWords(v))}</td></tr>)}</tbody></table></div>
    <h2>Trois règles d'accord à connaître</h2>
    <ul><li><b>Cent</b> et <b>vingt</b> prennent un « s » quand ils sont multipliés et terminent le nombre : deux cents, quatre-vingts. Mais : deux cent mille, quatre-vingt-trois.</li><li><b>Mille</b> est invariable : trois mille, jamais « trois milles ».</li><li><b>Million</b> et <b>milliard</b> sont des noms : deux millions <i>de</i> francs CFA.</li></ul>
    <p>Depuis la réforme de 1990, on peut aussi relier tous les mots par des traits d'union (deux-cent-mille). Les deux graphies sont acceptées ; Bonova utilise la graphie traditionnelle, la plus courante sur les documents commerciaux.</p>
    <p>Le montant en lettres est ajouté automatiquement à chaque <Link href="/essai">facture créée avec Bonova</Link>. Pour calculer la taxe avant de l'écrire, utilisez le <Link href="/outils/calcul-tva">calcul de TVA</Link>.</p></div>
  <ToolSeo path="/outils/montant-en-lettres" name="Montant en lettres" description="Convertisseur de montant en lettres pour les factures et les chèques, avec conversion des euros en francs CFA." crumbs={[["Outils", "/outils"]]} faq={[
    ["Comment convertir des euros en francs CFA ?", "On multiplie le montant en euros par 655,957, la parité fixe entre l'euro et le franc CFA, puis on arrondit au franc. Par exemple, 2 000 € × 655,957 = 1 311 914 FCFA."],
    ["Comment écrire 2 000 euros en francs CFA en lettres ?", "2 000 € correspondent à 1 311 914 FCFA, soit « un million trois cent onze mille neuf cent quatorze francs CFA »."],
    ["Comment écrire 500 000 francs CFA en lettres ?", "On écrit « cinq cent mille francs CFA ». « Cent » reste sans s parce qu'il est suivi de « mille ». De même : « sept cent mille francs CFA »."],
    ["Le taux est-il le même pour le franc CFA d'Afrique centrale ?", "Oui. Le franc CFA de l'UEMOA (XOF) et celui de la CEMAC (XAF) ont la même parité avec l'euro : 1 € = 655,957 FCFA. Les deux monnaies ne sont toutefois pas interchangeables."],
    ["Comment écrire un montant en lettres sur une facture ?", "On utilise en général la formule « Arrêtée la présente facture à la somme de », suivie du montant en lettres et de la devise, par exemple : deux cent cinquante mille francs CFA."],
    ["Faut-il écrire « cent » ou « cents » ?", "« Cents » prend un s quand il est multiplié et termine le nombre (trois cents). Il reste invariable s'il est suivi d'un autre nombre (trois cent deux) ou de « mille » (trois cent mille)."],
    ["Le montant en lettres est-il obligatoire ?", "Il n'est pas exigé partout, mais il est d'usage en Afrique de l'Ouest et du Centre et sur les chèques. En cas d'écart, c'est souvent le montant en lettres qui fait foi."],
  ]} />
</main><SiteFooter /></>); }
