import Link from "next/link";
import ToolSeo from "../../../components/ToolSeo";
import { LangProvider } from "../../../lib/i18n";
import { SiteNav, SiteFooter } from "../../../components/Brand";
import { Words } from "../../../components/Tools";
import { eurToXof, fmt, cfaWords, amountWords, inWords } from "../../../lib/money";
export const metadata = { title: "Montant en lettres : écrire un nombre en toutes lettres (FCFA, euros, dollars)", description: "Écrivez un montant en lettres sans faute pour vos factures, chèques et contrats : francs CFA, euros, dollars, dirhams, francs guinéens ou congolais. Règles d'accord appliquées, formule prête à copier, conversion euros → FCFA incluse.", alternates: { canonical: "/outils/montant-en-lettres", languages: { fr: "/outils/montant-en-lettres", en: "/en/tools/amount-in-words", "x-default": "/outils/montant-en-lettres" } } };
// Montants courants, toutes devises : [montant, devise].
const COMMON = [[50000, "XOF"], [250000, "XOF"], [500000, "XOF"], [1000000, "XOF"], [2500000, "XOF"], [1500, "EUR"], [12000, "EUR"], [750, "USD"], [3200.5, "USD"], [15000, "MAD"], [5000000, "GNF"], [250000, "CDF"]];
const EUR = [500, 1000, 2000, 5000, 10000];
const eur = (v) => new Intl.NumberFormat("fr-FR").format(v).replace(/\u202f|\u00a0/g, " ") + " €";
const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);
const words = (v, c) => { const i = Math.floor(v); const ct = Math.round((v - i) * 100); return cap(amountWords(i, c, "fr") + (ct ? ` et ${inWords(ct)} centime${ct > 1 ? "s" : ""}` : "")); };
export default function P() { return (<><SiteNav /><main className="wrap" style={{ paddingTop: 30, paddingBottom: 60 }}>
  <p className="u"><Link href="/outils" style={{ textDecoration: "none" }}>Outils</Link> / Montant en lettres</p><h1 style={{ fontSize: "clamp(36px,5vw,60px)", margin: "10px 0 14px" }}>Montant en lettres, sans faute.</h1>
  <p className="mute" style={{ fontSize: 18, maxWidth: 680, marginBottom: 26 }}>Pour les factures, chèques et contrats, dans toutes les devises : francs CFA, euros, dollars, dirhams, francs guinéens ou congolais. Saisissez un montant : il s'écrit en toutes lettres, avec les règles d'accord. Un second onglet convertit les euros en francs CFA.</p>
  <div style={{ maxWidth: 860 }}><LangProvider initial="fr"><Words /></LangProvider></div>
  <div className="prose" style={{ marginTop: 50 }}>
    <h2>Montants courants en lettres</h2>
    <div style={{ overflowX: "auto" }}><table><thead><tr><th>En chiffres</th><th>En lettres</th></tr></thead>
      <tbody>{COMMON.map(([v, c]) => <tr key={c + v}><td className="mono" style={{ whiteSpace: "nowrap" }}>{fmt(v, c)}</td><td>{words(v, c)}</td></tr>)}</tbody></table></div>
    <h2>Sur une facture, un chèque ou un contrat</h2>
    <ul><li><b>Facture</b> : « Arrêtée la présente facture à la somme de deux cent cinquante mille francs CFA (250 000 FCFA). »</li><li><b>Chèque</b> : le montant en lettres s'écrit sur la ligne prévue, le montant en chiffres dans la case. En cas de différence entre les deux, c'est le montant en lettres qui prévaut.</li><li><b>Contrat ou reconnaissance de dette</b> : le montant en lettres, suivi des chiffres entre parenthèses, par exemple « la somme de mille cinq cents euros (1 500 €) ».</li></ul>
    <h2>Trois règles d'accord à connaître</h2>
    <ul><li><b>Cent</b> et <b>vingt</b> prennent un « s » quand ils sont multipliés et terminent le nombre : deux cents, quatre-vingts. Mais : deux cent mille, quatre-vingt-trois.</li><li><b>Mille</b> est invariable : trois mille, jamais « trois milles ».</li><li><b>Million</b> et <b>milliard</b> sont des noms : deux millions <i>de</i> francs CFA.</li></ul>
    <p>Depuis la réforme de 1990, on peut aussi relier tous les mots par des traits d'union (deux-cent-mille). Les deux graphies sont acceptées ; Bonova utilise la graphie traditionnelle, la plus courante sur les documents commerciaux.</p>
    <h2>Convertir des euros en francs CFA</h2>
    <p>Le franc CFA est lié à l'euro par une parité fixe : <b>1 € = 655,957 FCFA</b>, pour le franc CFA d'Afrique de l'Ouest (XOF) comme pour celui d'Afrique centrale (XAF). On multiplie le montant en euros par 655,957, puis on arrondit au franc. L'onglet « Euros → francs CFA » de l'outil fait le calcul et donne le résultat en lettres.</p>
    <div style={{ overflowX: "auto" }}><table><thead><tr><th>Euros</th><th>Francs CFA</th><th>En lettres</th></tr></thead>
      <tbody>{EUR.map((v) => { const x = eurToXof(v); return <tr key={v}><td className="mono" style={{ whiteSpace: "nowrap" }}>{eur(v)}</td><td className="mono" style={{ whiteSpace: "nowrap" }}>{fmt(x, "XOF")}</td><td>{cap(cfaWords(x))}</td></tr>; })}</tbody></table></div>
    <p>Le montant en lettres est ajouté automatiquement à chaque <Link href="/essai">facture créée avec Bonova</Link>. Pour calculer la taxe avant de l'écrire, utilisez le <Link href="/outils/calcul-tva">calcul de TVA</Link>.</p></div>
  <ToolSeo path="/outils/montant-en-lettres" name="Montant en lettres" description="Convertisseur de montant en lettres pour les factures, chèques et contrats, dans toutes les devises." crumbs={[["Outils", "/outils"]]} faq={[
    ["Comment écrire un montant en lettres sur une facture ?", "On utilise en général la formule « Arrêtée la présente facture à la somme de », suivie du montant en lettres et de la devise, puis du montant en chiffres entre parenthèses : « deux cent cinquante mille francs CFA (250 000 FCFA) »."],
    ["Comment écrire le montant d'un chèque en lettres ?", "Écrivez le montant en toutes lettres sur la ligne prévue, avec la devise, puis les chiffres dans la case. Par exemple : « mille deux cent cinquante euros et cinquante centimes ». En cas de différence, le montant en lettres prévaut."],
    ["Faut-il écrire « cent » ou « cents » ?", "« Cent » prend un s quand il est multiplié et termine le nombre (trois cents). Il reste invariable s'il est suivi d'un autre nombre (trois cent deux) ou de « mille » (trois cent mille)."],
    ["Comment écrire 500 000 francs CFA en lettres ?", "On écrit « cinq cent mille francs CFA ». « Cent » reste sans s parce qu'il est suivi de « mille ». De même : « sept cent mille francs CFA »."],
    ["Comment écrire les centimes ?", "Après la partie entière et la devise, ajoutez « et », puis les centimes en lettres : « trois mille deux cents dollars US et cinquante centimes ». Le franc CFA, le franc guinéen ou le franc congolais s'écrivent sans centimes."],
    ["Quelles devises sont prises en charge ?", "Le franc CFA (XOF et XAF), l'euro, le dollar US et canadien, la livre sterling, le franc suisse, le dirham, le dinar tunisien, le franc guinéen, le franc congolais, le naira, le cedi, le shilling kényan et d'autres devises."],
    ["Comment convertir des euros en francs CFA ?", "On multiplie le montant en euros par 655,957, la parité fixe entre l'euro et le franc CFA (XOF et XAF), puis on arrondit au franc. Par exemple, 2 000 € = 1 311 914 FCFA, soit « un million trois cent onze mille neuf cent quatorze francs CFA »."],
    ["Le montant en lettres est-il obligatoire ?", "Il est exigé sur les chèques. Sur les factures, il n'est pas imposé partout, mais il est d'usage en Afrique de l'Ouest et du Centre et souvent demandé par les administrations. En cas d'écart, c'est généralement le montant en lettres qui fait foi."],
  ]} />
</main><SiteFooter /></>); }
