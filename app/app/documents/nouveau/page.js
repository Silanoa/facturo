"use client";
import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { supabase } from "../../../../lib/supabase";
import { useSession } from "../../../../lib/session";
import { totals } from "../../../../lib/money";
import { nextNumber } from "../../../../lib/data";
import Editor, { blankDoc, plus, today } from "../../../../components/Editor";
function Inner() {
  const q = useSearchParams(); const r = useRouter(); const { profile, user, reload, toast } = useSession();
  const [doc, setDoc] = useState(null); const [clients, setClients] = useState([]); const [busy, setBusy] = useState(false); const [err, setErr] = useState(null);
  const [prof, setProf] = useState(profile);
  useEffect(() => { (async () => {
    supabase.from("clients").select("*").order("name").then(({ data }) => setClients(data || []));
    const id = q.get("id"), from = q.get("from"), kind = q.get("kind") || "invoice";
    if (id) { const { data } = await supabase.from("documents").select("*").eq("id", id).single(); if (data) return setDoc({ ...data, items: data.items?.length ? data.items : [{ label: "", qty: 1, price: "" }] }); }
    if (from) { const { data } = await supabase.from("documents").select("*").eq("id", from).single();
      if (data) { const k = q.get("kind") || "invoice"; const { id: _, public_token, number, status, viewed_at, declared_paid_at, declared_note, paid_at, created_at, ...rest } = data;
        return setDoc({ ...rest, kind: k, status: k === "receipt" ? "paid" : "draft", issue_date: today(), due_date: k === "receipt" ? null : plus(15), number: await nextNumber(k) }); } }
    let d = blankDoc(kind, profile.currency || "XOF");
    if (q.get("import")) { try { const x = JSON.parse(localStorage.getItem("kola_draft") || "null"); if (x) { const { number, ...rest } = x; d = { ...d, ...rest }; } } catch {} }
    const c = q.get("client"); if (c) { const { data } = await supabase.from("clients").select("*").eq("id", c).single(); if (data) d.client = { name: data.name, email: data.email, phone: data.phone, address: data.address, tax_id: data.tax_id }; }
    setDoc({ ...d, number: await nextNumber(d.kind) });
  })(); }, []);
  async function save(status) {
    setBusy(true); setErr(null); const t = totals(doc);
    const { id, created_at, ...rest } = doc; const row = { ...rest, status: status || doc.status, total: t.total, tax_rate: +doc.tax_rate || 0, discount: +doc.discount || 0, items: doc.items.filter(i => i.label || +i.price).map(i => ({ label: i.label, qty: +i.qty || 0, price: +i.price || 0 })) };
    if (!row.items.length) { setBusy(false); return setErr("Ajoutez au moins une ligne avec un prix."); }
    const res = id ? await supabase.from("documents").update(row).eq("id", id).select().single() : await supabase.from("documents").insert({ ...row, user_id: user.id }).select().single();
    setBusy(false);
    if (res.error) return setErr(/QUOTA/.test(res.error.message) ? "quota" : /duplicate|unique/.test(res.error.message) ? "Ce numéro existe déjà. Changez-le." : res.error.message);
    if (q.get("import")) localStorage.removeItem("kola_draft");
    if (doc.client?.name && !clients.some(c => c.name.toLowerCase() === doc.client.name.toLowerCase())) await supabase.from("clients").insert({ name: doc.client.name, phone: doc.client.phone || null, email: doc.client.email || null, address: doc.client.address || null, tax_id: doc.client.tax_id || null });
    if (prof.template !== profile.template) { await supabase.from("profiles").update({ template: prof.template }).eq("id", user.id); reload(); }
    toast(id ? "Modifications enregistrées" : "Document créé"); r.push(`/app/documents/${res.data.id}${id ? "" : "?new=1"}`);
  }
  if (!doc) return <div className="u">Chargement</div>;
  return (<div>
    <div className="ph np"><div><Link href="/app/documents" className="lnk" style={{ fontSize: 14, color: "var(--mute)" }}>← Documents</Link><h1 style={{ marginTop: 6 }}>{doc.id ? `Modifier ${doc.number}` : "Nouveau document"}</h1></div>
      <div className="row"><button className="b o" disabled={busy} onClick={() => save(doc.id ? undefined : "draft")}>{doc.id ? "Enregistrer" : "Brouillon"}</button>{(!doc.id || doc.status === "draft") && <button className="b k" disabled={busy} onClick={() => save(doc.kind === "receipt" ? "paid" : "sent")}>{busy ? "…" : "Valider et partager"}</button>}</div></div>
    {err && <div className="note bad np" style={{ marginBottom: 14 }}>{err === "quota" ? <>Vous avez atteint les 10 documents gratuits du mois. <Link href="/app/parametres?t=offre"><b>Passez à Pro</b></Link> pour continuer (2 500 FCFA/mois).</> : err}</div>}
    <Editor doc={doc} setDoc={setDoc} profile={prof} setProfile={setProf} clients={clients} onNumber={async (k) => { if (!doc.id) { const n = await nextNumber(k); setDoc(d => ({ ...d, number: n })); } }} />
  </div>);
}
export default function Page() { return <Suspense fallback={null}><Inner /></Suspense>; }
