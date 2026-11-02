import Link from "next/link";
import { SiteNav, SiteFooter, Mark } from "../components/Brand";
import DocPaper from "../components/DocPaper";
import { SAMPLE } from "../lib/sample";
import { FAQ_FR } from "../lib/faq";
import { SITE } from "../lib/site";
export const metadata = { title: { absolute: "Kola — Factures, devis et reçus avec paiement Mobile Money" }, description: "Créez une facture en FCFA en moins d'une minute, envoyez-la sur WhatsApp avec un lien de paiement MTN MoMo, Wave, Orange Money. Conforme aux mentions OHADA. Gratuit.", alternates: { canonical: "/", languages: { fr: "/", en: "/en", "x-default": "/" } } };
const P = { business_name: "Atelier Sèmè Design", address: "Akpakpa, Cotonou", phone: "+229 01 97 11 22 33", ifu: "0202412345678", rccm: "RB/COT/24 A 12345", momo: [{ op: "MTN MoMo", number: "+229 01 97 11 22 33", name: "A. Houngbo" }, { op: "Moov Money", number: "+229 01 95 44 55 66" }] };
const TICK = ["Cotonou", "Dakar", "Abidjan", "Lomé", "Ouagadougou", "Douala", "Lagos", "Accra", "Bamako", "Niamey", "Paris", "Bruxelles"];
export default function Home() {
  const ld = [{ "@context": "https://schema.org", "@type": "SoftwareApplication", name: "Kola", applicationCategory: "BusinessApplication", operatingSystem: "Web, Android, iOS", url: SITE.url, description: metadata.description, inLanguage: ["fr", "en"],
    offers: [{ "@type": "Offer", price: "0", priceCurrency: "XOF", name: "Gratuit" }, { "@type": "Offer", price: "2500", priceCurrency: "XOF", name: "Pro mensuel" }, { "@type": "Offer", price: "25000", priceCurrency: "XOF", name: "Pro annuel" }] },
    { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: FAQ_FR.map(([q, a]) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a } })) }];
  return (<>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
    <SiteNav />
    <main>
      <section className="wrap hero">
        <div className="in">
          <p className="u" style={{ margin: "0 0 22px" }}>Factures · devis · reçus — FCFA, naira, euro</p>
          <h1>La facture qui se fait <span className="sq">payer</span><span className="k">.</span></h1>
          <p className="lead">Décrivez la vente en une phrase. Kola prépare une facture propre, aux mentions OHADA, et l'envoie sur WhatsApp avec vos numéros Mobile Money. Votre client paie, vous êtes prévenu.</p>
          <div className="row" style={{ flexWrap: "wrap" }}><Link href="/essai" className="b k" style={{ minHeight: 54, padding: "0 26px", fontSize: 16 }}>Faire une facture maintenant</Link><Link href="/connexion" className="b o" style={{ minHeight: 54 }}>Voir la démo</Link></div>
          <p className="mute" style={{ fontSize: 14, marginTop: 16 }}>Sans compte, sans carte. 10 documents offerts chaque mois.</p>
        </div>
        <div className="hero-photo in" style={{ animationDelay: ".1s" }}>
          <img src="/img/tailor.webp" alt="Une couturière dans son atelier à Cotonou, téléphone à la main" fetchPriority="high" />
          <div className="chip"><span className="op" style={{ background: "#FFCB05", color: "#1a1a1a" }}>MTN</span><div style={{ flex: 1 }}><b style={{ fontSize: 14.5 }}>Hôtel Les Cocotiers a payé</b><div className="mute" style={{ fontSize: 13 }}>FAC-2026-0042 · il y a 2 min</div></div><b className="mono">346 060 F</b></div>
        </div>
      </section>
      <div className="ticker" aria-hidden="true"><div>{[...TICK, ...TICK].map((t, i) => <span key={i}>{t} <i>✳</i></span>)}</div></div>
      <section className="wrap sec">
        <p className="u">Comment ça marche</p>
        <h2 style={{ maxWidth: 820 }}>Trois gestes, du message du client à l'argent sur votre compte.</h2>
        <div className="steps">
          <div><span className="n">01</span><h3>Dites-le.</h3><p className="mute">Tapez ou dictez : « 12 uniformes à 18 500 et livraison 5 000 pour l'Hôtel Les Cocotiers ». Les lignes, la TVA et le total se remplissent.</p></div>
          <div><span className="n">02</span><h3>Envoyez-le.</h3><p className="mute">Un bouton, et WhatsApp s'ouvre avec le message prêt. Votre client reçoit un lien, pas un PDF perdu dans la conversation.</p></div>
          <div><span className="n">03</span><h3>Encaissez.</h3><p className="mute">Il copie votre numéro MoMo, paie, appuie sur « J'ai payé ». Vous voyez qui a ouvert, qui a payé, qui doit encore.</p></div>
        </div>
      </section>
      <section className="pattern" style={{ color: "#fff" }}><div className="wrap sec split">
        <div><p className="u" style={{ color: "var(--ochre)" }}>Le lien de paiement</p><h2>Vos clients sont sur WhatsApp. Votre facture aussi.</h2>
          <p style={{ fontSize: 18, color: "#D5DAEA", maxWidth: 480, margin: "20px 0 26px" }}>La page de paiement s'ouvre en une seconde, même en 3G. Montant en gros, numéros à copier, et un bouton pour vous prévenir. Fini les « tu peux me renvoyer ton numéro ? ».</p>
          <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "grid", gap: 10, fontSize: 16 }}>{["Vous savez quand la facture est ouverte", "Relances WhatsApp prêtes : cordiale, ferme, dernier rappel", "L'argent arrive sur votre compte, sans commission Kola"].map(x => <li key={x} style={{ display: "flex", gap: 10 }}><span style={{ color: "var(--ochre)" }}>—</span>{x}</li>)}</ul></div>
        <div className="phone"><div className="scr">
          <div className="wa-top"><i>H</i><div><b>Hôtel Les Cocotiers</b><div style={{ fontSize: 12, opacity: .8 }}>en ligne</div></div></div>
          <div className="bub">Bonjour, vous pouvez m'envoyer la facture pour les uniformes ?<div className="mute" style={{ fontSize: 11, textAlign: "right" }}>09:12</div></div>
          <div className="bub me"><div className="att"><Mark size={22} /><div><b style={{ fontSize: 13 }}>Facture FAC-2026-0042</b><div style={{ fontSize: 12, color: "#555" }}>346 060 FCFA · à régler avant le 17 nov.</div></div></div>Voici votre facture. Paiement MTN MoMo : +229 01 97 11 22 33<div className="mute" style={{ fontSize: 11, textAlign: "right" }}>09:14 ✓✓</div></div>
          <div className="bub">C'est payé 👍<div className="mute" style={{ fontSize: 11, textAlign: "right" }}>11:40</div></div>
          <div style={{ margin: "auto 12px 14px", background: "#fff", borderRadius: 14, padding: 12, fontSize: 13, display: "flex", gap: 10, alignItems: "center" }}><span className="pill paid">Payée</span>Kola a mis la facture à jour.</div>
        </div></div>
      </div></section>
      <section className="wrap sec">
        <div className="split" style={{ alignItems: "start" }}>
          <div><p className="u">Des factures dont vous êtes fier</p><h2>Quatre modèles. Votre logo, vos couleurs.</h2>
            <p className="mute" style={{ fontSize: 18, maxWidth: 460, margin: "20px 0" }}>Atelier, Marché, Registre, Sahel : du classique au plus graphique. IFU, RCCM, TVA 18 %, montant en lettres et bloc Mobile Money sont déjà à leur place.</p>
            <Link href="/essai" className="lnk" style={{ fontSize: 17 }}>Essayer les modèles →</Link></div>
          <div className="tshow"><div className="tsc a"><DocPaper doc={SAMPLE} profile={{ ...P, template: "marche", accent: "#B8321A" }} /></div><div className="tsc b"><DocPaper doc={SAMPLE} profile={{ ...P, template: "atelier", accent: "#1D2B55" }} /></div></div>
        </div>
      </section>
      <section style={{ background: "var(--ink)", color: "var(--paper)" }}><div className="wrap sec split">
        <div style={{ borderRadius: 22, overflow: "hidden", aspectRatio: "4/3.4" }}><img src="/img/dakar.webp" alt="Réparateur de téléphones dans son échoppe à Dakar" loading="lazy" style={{ width: "100%", height: "100%", objectFit: "cover" }} /></div>
        <div><p className="u" style={{ color: "var(--ochre)" }}>Qui vous doit</p><h2>Ouvrez l'application, sachez tout de suite combien on vous doit.</h2>
          <p style={{ color: "#B3ACA2", fontSize: 18, margin: "20px 0" }}>Les retards en rouge, la relance à un doigt. Kola calcule aussi combien de jours chaque client met à payer, pour savoir à qui demander un acompte.</p>
          <div style={{ border: "1px solid #ffffff22", borderRadius: 16, overflow: "hidden" }}>{[["Hôtel Les Cocotiers", "12 j de retard", "346 060 F", 1], ["Awa Diop", "échéance 9 nov.", "50 000 F", 0], ["Sèmè Agro SARL", "paiement signalé", "601 800 F", 2]].map(([n, s, a, l]) => <div key={n} style={{ display: "flex", justifyContent: "space-between", padding: "14px 16px", borderTop: "1px solid #ffffff1a" }}><div><b>{n}</b><div style={{ fontSize: 13.5, color: l === 1 ? "#F08A6E" : l === 2 ? "#9BD3AE" : "#B3ACA2" }}>{s}</div></div><b className="mono">{a}</b></div>)}</div></div>
      </div></section>
      <section className="wrap sec" id="tarifs">
        <p className="u">Tarifs</p><h2>Gratuit pour commencer. Moins cher qu'un carnet à souches pour continuer.</h2>
        <div className="price">
          <div><div className="u">Gratuit</div><div className="amt">0 F</div><div className="mute">pour toujours</div><ul><li>10 documents par mois</li><li>4 modèles, logo, couleurs</li><li>Lien de paiement et WhatsApp</li><li>Saisie par phrase ou à la voix</li></ul><Link href="/essai" className="b o full">Commencer</Link></div>
          <div className="hl"><div className="u" style={{ color: "var(--ochre)" }}>Pro</div><div className="amt">2 500 F</div><div className="mute">par mois, sans engagement</div><ul><li>Documents illimités</li><li>Sans mention « Créé avec Kola »</li><li>Pied de page personnalisé</li><li>Paiement MoMo, Wave ou carte</li></ul><Link href="/connexion?mode=signup" className="b k full">Passer à Pro</Link></div>
          <div><div className="u">Pro annuel</div><div className="amt">25 000 F</div><div className="mute">soit 2 083 F par mois</div><ul><li>Tout Pro</li><li>2 mois offerts</li><li>Support WhatsApp prioritaire</li><li>Un seul paiement par an</li></ul><Link href="/connexion?mode=signup" className="b o full">Choisir l'annuel</Link></div>
        </div>
      </section>
      <section className="wrap sec faq" style={{ paddingTop: 0 }}><p className="u">Questions</p><h2 style={{ marginBottom: 24 }}>Ce qu'on nous demande.</h2>
        {FAQ_FR.map(([q, a]) => <details key={q}><summary>{q}</summary><p>{a}</p></details>)}</section>
      <section className="wrap" style={{ paddingBottom: 40 }}><div style={{ background: "var(--kola)", color: "#fff", borderRadius: 26, padding: "clamp(28px,6vw,64px)", display: "flex", justifyContent: "space-between", alignItems: "end", gap: 24, flexWrap: "wrap" }}>
        <h2 style={{ fontSize: "clamp(36px,5vw,64px)", maxWidth: 640 }}>Votre prochaine facture prend 40 secondes.</h2>
        <Link href="/essai" className="b" style={{ background: "#fff", color: "var(--ink)", borderColor: "#fff", minHeight: 54, padding: "0 26px" }}>Essayer sans compte</Link></div></section>
    </main>
    <SiteFooter />
  </>);
}
