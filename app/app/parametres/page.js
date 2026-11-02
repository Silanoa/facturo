"use client";
import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { supabase } from "../../../lib/supabase";
import { useSession } from "../../../lib/session";
import { CURRENCIES, OPERATORS } from "../../../lib/money";
const ACCENTS = ["#1F3A2E", "#D9663B", "#2D4C8C", "#7A2E4F", "#1B1B1B", "#8A6D1F"];
function Settings() {
  const s = useSession(); const sp = useSearchParams();
  const [p, setP] = useState({ ...s.profile, momo: s.profile.momo?.length ? s.profile.momo : [{ op: "MTN MoMo", number: "", name: "" }] });
  const [ok, setOk] = useState(null); const [pay, setPay] = useState(null);
  const set = (k, v) => setP({ ...p, [k]: v });
  const pro = p.plan === "pro" && (!p.pro_until || new Date(p.pro_until) > new Date());
  async function save(e) { e.preventDefault();
    const { business_name, ifu, rccm, address, phone, currency, momo, accent } = p;
    const { error } = await supabase.from("profiles").update({ business_name, ifu, rccm, address, phone, currency, momo, accent }).eq("id", s.user.id);
    setOk(error ? { bad: 1, t: error.message } : { t: "Informations enregistrées." }); if (!error) s.reload(); }
  async function upgrade(plan) { setPay("…");
    const { data } = await supabase.auth.getSession();
    const r = await fetch("/api/checkout", { method: "POST", headers: { "content-type": "application/json", authorization: `Bearer ${data.session.access_token}` }, body: JSON.stringify({ plan }) });
    const j = await r.json(); if (j.url) location.href = j.url; else setPay(j.error || "Paiement indisponible."); }
  return (<>
    <div className="head"><div><span className="eyebrow">Paramètres</span><h1>Mon entreprise</h1></div></div>
    {sp.get("paid") === "1" && <div className="ok">Paiement confirmé — bienvenue dans le plan Pro !</div>}
    {sp.get("paid") === "0" && <div className="alert">Le paiement n'a pas abouti. Aucun montant n'a été débité.</div>}
    <div className="editor" style={{gridTemplateColumns:"1.5fr 1fr"}}>
      <form className="card" onSubmit={save}>
        {ok && <div className={ok.bad ? "alert" : "ok"}>{ok.t}</div>}
        <div className="grid2">
          <div className="field"><label>Nom commercial</label><input value={p.business_name || ""} onChange={e => set("business_name", e.target.value)} placeholder="Atelier Sèmè Design"/></div>
          <div className="field"><label>Téléphone</label><input value={p.phone || ""} onChange={e => set("phone", e.target.value)}/></div>
          <div className="field"><label>IFU / NINEA / N° contribuable</label><input value={p.ifu || ""} onChange={e => set("ifu", e.target.value)}/></div>
          <div className="field"><label>RCCM</label><input value={p.rccm || ""} onChange={e => set("rccm", e.target.value)} placeholder="RB/COT/24 A 12345"/></div>
        </div>
        <div className="field"><label>Adresse</label><input value={p.address || ""} onChange={e => set("address", e.target.value)}/></div>
        <div className="grid2">
          <div className="field"><label>Devise par défaut</label><select value={p.currency || "XOF"} onChange={e => set("currency", e.target.value)}>{CURRENCIES.map(c => <option key={c.code} value={c.code}>{c.label}</option>)}</select></div>
          <div className="field"><label>Couleur des documents {!pro && "(Pro)"}</label><div style={{display:"flex",gap:8}}>{ACCENTS.map(a => <button type="button" key={a} disabled={!pro && a !== "#1F3A2E"} onClick={() => set("accent", a)} style={{width:30,height:30,borderRadius:8,background:a,border:p.accent === a ? "3px solid #fff" : "0",outline:p.accent === a ? `2px solid ${a}` : "none",cursor:"pointer",opacity:!pro && a !== "#1F3A2E" ? .35 : 1}}/>)}</div></div>
        </div>
        <b>Numéros Mobile Money affichés sur vos factures</b>
        {p.momo.map((m, i) => <div key={i} className="grid3" style={{gridTemplateColumns:"1fr 1.2fr 1.2fr auto",marginTop:10}}>
          <select value={m.op} onChange={e => set("momo", p.momo.map((x, n) => n === i ? { ...x, op: e.target.value } : x))}>{OPERATORS.map(o => <option key={o}>{o}</option>)}<option>Virement bancaire</option></select>
          <input placeholder="Numéro ou IBAN" value={m.number} onChange={e => set("momo", p.momo.map((x, n) => n === i ? { ...x, number: e.target.value } : x))}/>
          <input placeholder="Nom du titulaire" value={m.name} onChange={e => set("momo", p.momo.map((x, n) => n === i ? { ...x, name: e.target.value } : x))}/>
          <button type="button" className="btn ghost sm" onClick={() => set("momo", p.momo.filter((_, n) => n !== i))}>×</button></div>)}
        <button type="button" className="btn ghost sm" style={{marginTop:10}} onClick={() => set("momo", [...p.momo, { op: "Wave", number: "", name: "" }])}>+ Ajouter un moyen de paiement</button>
        <div style={{marginTop:20}}><button className="btn">Enregistrer</button></div>
      </form>
      <div className="card" style={pro ? {} : {background:"var(--forest)",color:"var(--sand)"}}>
        {pro ? <><span className="tag paid">Pro actif</span><h2 style={{fontSize:24}}>Merci de soutenir Facturo</h2><p className="muted">Documents illimités{p.pro_until ? ` jusqu'au ${new Date(p.pro_until).toLocaleDateString("fr-FR")}` : ""}.</p></> :
        <><span className="eyebrow" style={{color:"#E9B99F"}}>Plan Découverte</span><h2 style={{fontSize:26,margin:"8px 0"}}>Passez Pro pour 2 500 FCFA/mois</h2>
          <p style={{color:"#CFD8CF"}}>Documents illimités, votre couleur, plus de mention Facturo. Paiement par MTN, Moov, Wave, Orange Money ou carte via FedaPay.</p>
          <div style={{display:"flex",gap:8,flexWrap:"wrap"}}><button className="btn clay" onClick={() => upgrade("month")}>1 mois — 2 500 FCFA</button><button className="btn ghost" style={{color:"var(--sand)",borderColor:"var(--sand)"}} onClick={() => upgrade("year")}>1 an — 25 000 FCFA</button></div>
          {pay && <p style={{color:"#F4C9B0",fontSize:14}}>{pay}</p>}</>}
      </div></div></>);
}
export default function Page() { return <Suspense><Settings/></Suspense>; }
