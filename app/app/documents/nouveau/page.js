"use client";
import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "../../../../lib/supabase";
import { useSession } from "../../../../lib/session";
import { CURRENCIES, KINDS, totals, fmt } from "../../../../lib/money";
import DocPaper from "../../../../components/DocPaper";
const today = () => new Date().toISOString().slice(0, 10);
const plus = (d) => { const x = new Date(); x.setDate(x.getDate() + d); return x.toISOString().slice(0, 10); };
function Editor() {
  const s = useSession(); const r = useRouter(); const sp = useSearchParams();
  const editId = sp.get("id"); const from = sp.get("from"); const kindQ = sp.get("kind") || "invoice";
  const [clients, setClients] = useState([]); const [err, setErr] = useState(null); const [busy, setBusy] = useState(false);
  const [doc, setDoc] = useState(null);
  async function nextNumber(kind) {
    const y = new Date().getFullYear();
    const { count } = await supabase.from("documents").select("id", { count: "exact", head: true }).eq("kind", kind).gte("issue_date", `${y}-01-01`);
    return `${KINDS[kind].prefix}-${y}-${String((count || 0) + 1).padStart(4, "0")}`;
  }
  useEffect(() => { (async () => {
    supabase.from("clients").select("*").order("name").then(({ data }) => setClients(data || []));
    if (editId) { const { data } = await supabase.from("documents").select("*").eq("id", editId).single(); return setDoc(data); }
    let base = { kind: kindQ, status: "draft", client: {}, items: [{ label: "", qty: 1, price: 0 }], currency: s.profile.currency || "XOF", tax_rate: 18, discount: 0, issue_date: today(), due_date: plus(kindQ === "quote" ? 30 : 15), notes: "" };
    if (from) { const { data } = await supabase.from("documents").select("*").eq("id", from).single();
      if (data) base = { ...base, client: data.client, items: data.items, currency: data.currency, tax_rate: data.tax_rate, discount: data.discount, notes: data.kind === "invoice" && kindQ === "receipt" ? `Règlement de la facture ${data.number}.` : data.kind === "quote" ? `Suite au devis ${data.number}.` : data.notes,
        status: kindQ === "receipt" ? "paid" : "draft" }; }
    if (kindQ === "receipt") base.status = "paid";
    base.number = await nextNumber(kindQ); setDoc(base);
  })(); }, [editId, from, kindQ]);
  if (!doc) return <p className="muted">Chargement…</p>;
  const set = (k, v) => setDoc({ ...doc, [k]: v });
  const setItem = (i, k, v) => set("items", doc.items.map((it, n) => n === i ? { ...it, [k]: v } : it));
  const setClient = (k, v) => set("client", { ...doc.client, [k]: v });
  async function save() {
    if (!doc.client?.name) return setErr("Indiquez au moins le nom du client.");
    setBusy(true); setErr(null);
    const payload = { kind: doc.kind, number: doc.number, status: doc.status, client: doc.client, items: doc.items.filter(i => i.label || +i.price), currency: doc.currency, tax_rate: +doc.tax_rate || 0, discount: +doc.discount || 0, total: totals(doc).total, issue_date: doc.issue_date, due_date: doc.due_date || null, notes: doc.notes };
    if (doc.saveClient && !clients.find(c => c.name === doc.client.name)) { const { name, email, phone, address, tax_id } = doc.client; await supabase.from("clients").insert({ name, email, phone, address, tax_id }); }
    const q = editId ? supabase.from("documents").update(payload).eq("id", editId).select().single() : supabase.from("documents").insert(payload).select().single();
    const { data, error } = await q; setBusy(false);
    if (error) return setErr(error.message.includes("QUOTA") ? "Vous avez atteint les 10 documents gratuits de ce mois. Passez au plan Pro (2 500 FCFA/mois) depuis « Mon entreprise » pour continuer." : error.message);
    r.push(`/app/documents/${data.id}`);
  }
  const t = totals(doc);
  return (<>
    <div className="head noprint"><div><span className="eyebrow">{editId ? "Modifier" : "Nouveau document"}</span><h1>{KINDS[doc.kind].fr} {doc.number}</h1></div>
      <div style={{display:"flex",gap:8}}><button className="btn ghost" onClick={() => r.back()}>Annuler</button><button className="btn clay" onClick={save} disabled={busy}>{busy ? "Enregistrement…" : "Enregistrer"}</button></div></div>
    {err && <div className="alert">{err}</div>}
    <div className="editor">
      <div>
        <div className="card" style={{marginBottom:16}}>
          <div className="grid3">
            <div className="field"><label>Type</label><select value={doc.kind} onChange={async e => { const k = e.target.value; setDoc({ ...doc, kind: k, number: editId ? doc.number : await nextNumber(k), status: k === "receipt" ? "paid" : doc.status }); }}>{Object.entries(KINDS).map(([k, v]) => <option key={k} value={k}>{v.fr}</option>)}</select></div>
            <div className="field"><label>Numéro</label><input value={doc.number} onChange={e => set("number", e.target.value)}/></div>
            <div className="field"><label>Devise</label><select value={doc.currency} onChange={e => set("currency", e.target.value)}>{CURRENCIES.map(c => <option key={c.code} value={c.code}>{c.label}</option>)}</select></div>
            <div className="field"><label>Date</label><input type="date" value={doc.issue_date} onChange={e => set("issue_date", e.target.value)}/></div>
            {doc.kind !== "receipt" && <div className="field"><label>{doc.kind === "quote" ? "Validité" : "Échéance"}</label><input type="date" value={doc.due_date || ""} onChange={e => set("due_date", e.target.value)}/></div>}
            <div className="field"><label>Statut</label><select value={doc.status} onChange={e => set("status", e.target.value)}><option value="draft">Brouillon</option><option value="sent">Envoyé</option>{doc.kind === "quote" ? <option value="accepted">Accepté</option> : <option value="paid">Payé</option>}</select></div>
          </div>
        </div>
        <div className="card" style={{marginBottom:16}}>
          <b>Client</b>
          {clients.length > 0 && <select style={{margin:"10px 0"}} value="" onChange={e => { const c = clients.find(x => x.id === e.target.value); if (c) set("client", { name: c.name, email: c.email, phone: c.phone, address: c.address, tax_id: c.tax_id }); }}><option value="">Choisir dans mon fichier clients…</option>{clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select>}
          <div className="grid2" style={{marginTop:10}}>
            <div className="field"><label>Nom / raison sociale</label><input value={doc.client.name || ""} onChange={e => setClient("name", e.target.value)}/></div>
            <div className="field"><label>Téléphone (WhatsApp)</label><input value={doc.client.phone || ""} onChange={e => setClient("phone", e.target.value)} placeholder="+229 01 …"/></div>
            <div className="field"><label>Email</label><input value={doc.client.email || ""} onChange={e => setClient("email", e.target.value)}/></div>
            <div className="field"><label>IFU / N° fiscal</label><input value={doc.client.tax_id || ""} onChange={e => setClient("tax_id", e.target.value)}/></div>
          </div>
          <div className="field"><label>Adresse</label><input value={doc.client.address || ""} onChange={e => setClient("address", e.target.value)}/></div>
          {!editId && <label style={{textTransform:"none",letterSpacing:0,display:"flex",gap:8,alignItems:"center"}}><input type="checkbox" style={{width:"auto"}} checked={!!doc.saveClient} onChange={e => set("saveClient", e.target.checked)}/> Ajouter à mon fichier clients</label>}
        </div>
        <div className="card">
          <b>Lignes</b>
          <table className="items" style={{width:"100%",marginTop:8}}><tbody>
            {doc.items.map((it, i) => <tr key={i}>
              <td style={{width:"52%"}}><input placeholder="Désignation" value={it.label} onChange={e => setItem(i, "label", e.target.value)}/></td>
              <td style={{width:"14%"}}><input type="number" min="0" step="any" value={it.qty} onChange={e => setItem(i, "qty", e.target.value)}/></td>
              <td style={{width:"28%"}}><input type="number" min="0" step="any" value={it.price} onChange={e => setItem(i, "price", e.target.value)}/></td>
              <td><button className="btn ghost sm" title="Supprimer" onClick={() => set("items", doc.items.filter((_, n) => n !== i))}>×</button></td></tr>)}
          </tbody></table>
          <button className="btn ghost sm" onClick={() => set("items", [...doc.items, { label: "", qty: 1, price: 0 }])}>+ Ajouter une ligne</button>
          <div className="grid2" style={{marginTop:16}}>
            <div className="field"><label>TVA (%)</label><select value={doc.tax_rate} onChange={e => set("tax_rate", e.target.value)}><option value="0">0 % — non assujetti</option><option value="18">18 % (UEMOA standard)</option><option value="19.25">19,25 % (Cameroun)</option><option value="7.5">7,5 % (Nigeria)</option><option value="15">15 % (Ghana)</option><option value="20">20 % (France, Maroc)</option></select></div>
            <div className="field"><label>Remise ({doc.currency})</label><input type="number" min="0" value={doc.discount} onChange={e => set("discount", e.target.value)}/></div>
          </div>
          <div className="field"><label>Notes / conditions</label><textarea rows={3} value={doc.notes || ""} onChange={e => set("notes", e.target.value)} placeholder="Ex. : Paiement à 15 jours. Acompte de 50 % à la commande."/></div>
          <div style={{textAlign:"right",fontSize:18}}><span className="muted">Total : </span><b className="serif">{fmt(t.total, doc.currency)}</b></div>
        </div>
      </div>
      <div style={{position:"sticky",top:20}}><div style={{transform:"scale(.82)",transformOrigin:"top center"}}><DocPaper doc={doc} profile={s.profile}/></div></div>
    </div></>);
}
export default function Page() { return <Suspense><Editor/></Suspense>; }
