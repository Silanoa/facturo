import Link from "next/link";
export default function Home() {
  return (<div className="pattern" style={{minHeight:"100vh"}}>
    <div className="wrap">
      <nav className="top">
        <Link href="/" className="logo"><i>F</i>Facturo</Link>
        <div style={{display:"flex",gap:10}}>
          <a href="#tarifs" className="btn ghost sm">Tarifs</a>
          <Link href="/connexion" className="btn ghost sm">Se connecter</Link>
          <Link href="/connexion?mode=signup" className="btn sm">Créer un compte</Link>
        </div>
      </nav>
      <section className="hero">
        <div>
          <span className="eyebrow">Cotonou · Dakar · Abidjan · Lagos · Paris</span>
          <h1>Vos factures en <em>FCFA</em>, payées par Mobile Money.</h1>
          <p className="lead">Facturo crée des factures, devis et reçus conformes aux usages OHADA — IFU, NINEA, RCCM, montant en lettres — et les envoie à vos clients sur WhatsApp avec les instructions MTN, Moov, Orange ou Wave.</p>
          <div style={{display:"flex",gap:12,marginTop:26,flexWrap:"wrap"}}>
            <Link href="/connexion?mode=signup" className="btn clay">Faire ma première facture — gratuit</Link>
            <a href="#comment" className="btn ghost">Voir comment ça marche</a>
          </div>
          <p className="muted" style={{fontSize:13,marginTop:14}}>10 documents par mois offerts. Sans carte bancaire.</p>
        </div>
        <div className="paperdemo">
          <div className="stamp">PAYÉE</div>
          <div style={{display:"flex",justifyContent:"space-between"}}><div><b style={{fontSize:15}}>Atelier Sèmè Design</b><div className="muted">IFU 3201910456782 · RCCM RB/COT/21 B 4410</div><div className="muted">Haie Vive, Cotonou</div></div><div style={{textAlign:"right"}}><div className="serif" style={{fontSize:22,color:"#1F3A2E"}}>Facture</div><div className="muted">FAC-2026-0042</div></div></div>
          <table style={{width:"100%",marginTop:22,borderCollapse:"collapse"}}><tbody>
            <tr style={{background:"#F4EFE6"}}><td style={{padding:6}}><b>Désignation</b></td><td style={{textAlign:"right",padding:6}}><b>Montant</b></td></tr>
            <tr><td style={{padding:6}}>Identité visuelle complète</td><td style={{textAlign:"right",padding:6}}>350 000 FCFA</td></tr>
            <tr><td style={{padding:6}}>Supports imprimés (x200)</td><td style={{textAlign:"right",padding:6}}>90 000 FCFA</td></tr>
            <tr><td style={{padding:6}}>TVA 18 %</td><td style={{textAlign:"right",padding:6}}>79 200 FCFA</td></tr>
            <tr><td style={{padding:6,borderTop:"2px solid #222"}}><b>Total TTC</b></td><td style={{textAlign:"right",padding:6,borderTop:"2px solid #222"}}><b>519 200 FCFA</b></td></tr>
          </tbody></table>
          <div className="muted" style={{fontStyle:"italic"}}>Arrêtée à la somme de cinq cent dix-neuf mille deux cents francs CFA.</div>
          <div style={{background:"#F7F3EA",borderRadius:8,padding:10,marginTop:12}}><b>Payer par Mobile Money</b><br/>MTN MoMo : +229 01 97 00 00 00 · Wave : +221 77 000 00 00</div>
        </div>
      </section>
    </div>
    <section className="section" id="comment" style={{background:"var(--paper)"}}><div className="wrap">
      <span className="eyebrow">Pourquoi Facturo</span>
      <h2>Les outils de facturation sont pensés pour Stripe et l'euro.<br/>Vos clients, eux, paient sur WhatsApp et MoMo.</h2>
      <div className="feat">
        {[["01","Mentions OHADA intégrées","IFU, NINEA, RCCM, TVA à 18 % par défaut, montant en toutes lettres : vos documents passent en comptabilité sans retouche."],
          ["02","Mobile Money sur la facture","Vos numéros MTN, Moov, Orange Money, Wave, Celtiis apparaissent en bas de chaque document. Le client sait exactement où payer."],
          ["03","Envoi WhatsApp en un geste","Un message prêt à partir, avec le montant, l'échéance et vos numéros de paiement. Fini les captures d'écran floues."],
          ["04","8 devises, zéro conversion","XOF, XAF, NGN, GHS, MAD, KES, EUR, USD. Facturez un client parisien et un client de Lomé depuis le même compte."],
          ["05","Devis → facture → reçu","Un devis accepté devient une facture en un clic, puis un reçu une fois payé. La numérotation suit toute seule."],
          ["06","PDF propre, format A4","Une mise en page sobre, imprimable, à votre couleur. Le genre de document qui inspire confiance à un grand compte."]
        ].map(([n,t,d])=>(<div className="card" key={n}><span className="num">{n}</span><h3>{t}</h3><p className="muted" style={{margin:0}}>{d}</p></div>))}
      </div>
    </div></section>
    <section className="section"><div className="wrap">
      <span className="eyebrow">Comparatif honnête</span>
      <h2>Ce qui change par rapport aux générateurs classiques</h2>
      <table className="compare"><thead><tr><th></th><th>Générateurs génériques</th><th>Facturo</th></tr></thead><tbody>
        <tr><td>Franc CFA sans centimes, montant en lettres</td><td className="muted">Rarement</td><td>Oui</td></tr>
        <tr><td>Champs IFU / NINEA / RCCM</td><td className="muted">Non</td><td>Oui</td></tr>
        <tr><td>Instructions Mobile Money</td><td className="muted">Non</td><td>Oui, multi-opérateurs</td></tr>
        <tr><td>Partage WhatsApp</td><td className="muted">Non</td><td>Oui</td></tr>
        <tr><td>Fichier clients, historique, tableau de bord</td><td className="muted">Souvent payant</td><td>Inclus</td></tr>
        <tr><td>Payer l'abonnement en Mobile Money</td><td className="muted">Carte uniquement</td><td>Oui (FedaPay)</td></tr>
      </tbody></table>
    </div></section>
    <section className="section" id="tarifs" style={{background:"var(--paper)"}}><div className="wrap">
      <span className="eyebrow">Tarifs</span>
      <h2>Un prix qui a du sens à Cotonou comme à Paris</h2>
      <div className="price">
        <div className="card"><b>Découverte</b><div className="amt">0 FCFA</div><span className="muted">Pour démarrer</span>
          <ul><li>10 documents / mois</li><li>Factures, devis, reçus</li><li>PDF + WhatsApp</li><li>Clients illimités</li></ul>
          <a href="/connexion?mode=signup" className="btn ghost">Commencer</a></div>
        <div className="card hl"><b>Pro</b><div className="amt">2 500 FCFA<span style={{fontSize:16}}> /mois</span></div><span className="muted">≈ 3,80 € — payable en Mobile Money</span>
          <ul><li>Documents illimités</li><li>Votre logo et votre couleur</li><li>Sans mention « Facturo »</li><li>Export comptable CSV</li></ul>
          <a href="/connexion?mode=signup" className="btn clay">Passer Pro</a></div>
        <div className="card"><b>Annuel</b><div className="amt">25 000 FCFA<span style={{fontSize:16}}> /an</span></div><span className="muted">2 mois offerts</span>
          <ul><li>Tout le plan Pro</li><li>Support WhatsApp prioritaire</li><li>Accès anticipé aux relances automatiques</li></ul>
          <a href="/connexion?mode=signup" className="btn ghost">Choisir l'annuel</a></div>
      </div>
    </div></section>
    <footer><div className="wrap" style={{display:"flex",justifyContent:"space-between",flexWrap:"wrap",gap:12}}>
      <span><b className="serif" style={{color:"var(--ink)"}}>Facturo</b> — fait au Bénin, pour l'Afrique et sa diaspora.</span>
      <span>© 2026 · <a href="mailto:contact@facturo.app">contact</a></span></div></footer>
  </div>);
}
