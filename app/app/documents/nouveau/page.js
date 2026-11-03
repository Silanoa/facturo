"use client";
import { Suspense, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { supabase } from "../../../../lib/supabase";
import { useSession } from "../../../../lib/session";
import { totals } from "../../../../lib/money";
import { nextNumber } from "../../../../lib/data";
import { useT } from "../../../../lib/i18n";
import Editor, { blankDoc, plus, today } from "../../../../components/Editor";
function Inner() {
  const q = useSearchParams(); const r = useRouter(); const { profile, user, reload, toast } = useSession();
  const [doc, setDoc] = useState(null); const [clients, setClients] = useState([]); const [busy, setBusy] = useState(false); const [err, setErr] = useState(null); const [resumed, setResumed] = useState(false); const [as, setAs] = useState(null); const ready = useRef(false); const KEY = `bnv_app_draft_${user.id}`;
  const { tr } = useT(); const dl = profile.doc_lang || "fr"; const st = profile.settings || {};
  useEffect(() => { (async () => {
    supabase.from("clients").select("*").order("name").then(({ data }) => setClients(data || []));
    const id = q.get("id"), from = q.get("from"), kind = q.get("kind") || "invoice";
    if (id) { const { data } = await supabase.from("documents").select("*").eq("id", id).single(); if (data) return setDoc({ ...data, items: data.items?.length ? data.items : [{ label: "", qty: 1, price: "" }] }); }
    if (from) { const { data } = await supabase.from("documents").select("*").eq("id", from).single();
      if (data) { const k = q.get("kind") || "invoice"; const { id: _, public_token, number, status, viewed_at, declared_paid_at, declared_note, paid_at, created_at, updated_at, sent_at, accepted_at, declined_at, paid_amount, payments, source_id, ...rest } = data;
        const en = (rest.lang || dl) === "en"; const conv = data.kind !== k;
        const opts = k === "receipt" ? { method: (data.payments || []).slice(-1)[0]?.method || "", paid_on: today(), for: data.kind === "invoice" ? `${en ? "invoice" : "facture"} ${data.number}` : "" } : { ...blankDoc(k, rest.currency, st).opts, ...(k === data.kind ? data.opts || {} : {}) };
        const items = k === "receipt" && data.kind === "invoice" && +paid_amount > 0 && +paid_amount < +data.total ? [{ label: en ? `Part payment — invoice ${data.number}` : `Acompte — facture ${data.number}`, qty: 1, price: +paid_amount }] : rest.items;
        return setDoc({ ...rest, items, tax_rate: items === rest.items ? rest.tax_rate : 0, opts, kind: k, status: k === "receipt" ? "paid" : "draft", issue_date: today(), due_date: k === "receipt" ? null : plus(k === "quote" ? (+st.quote_days || 30) : (+st.due_days || 15)), notes: conv ? ((st.notes || {})[k] || "") : rest.notes, source_id: conv ? from : null, number: await nextNumber(k, rest.lang || dl, st) }); } }
    let d = blankDoc(kind, profile.currency || "XOF", st);
    if (!q.get("import") && !q.get("client") && !q.get("kind")) { try { const x = JSON.parse(localStorage.getItem(KEY) || "null"); if (x && Date.now() - x.at < 864e5 && (x.doc.items || []).some((i) => i.label || +i.price)) { setResumed(true); return setDoc(x.doc); } } catch {} }
    if (q.get("import")) { try { const x = JSON.parse(localStorage.getItem("bnv_draft") || localStorage.getItem("kola_draft") || "null"); if (x) { const { number, ...rest } = x; d = { ...d, ...rest }; } } catch {} }
    const c = q.get("client"); if (c) { const { data } = await supabase.from("clients").select("*").eq("id", c).single(); if (data) d.client = { name: data.name, email: data.email, phone: data.phone, address: data.address, tax_id: data.tax_id }; }
    setDoc({ ...d, lang: d.lang || dl, number: await nextNumber(d.kind, d.lang || dl, st) });
  })(); }, []);
  // Enregistrement automatique : brouillon local pour un nouveau document, base de données pour un brouillon existant.
  useEffect(() => { if (!doc) return; if (!ready.current) { ready.current = true; return; } setAs("…"); const t = setTimeout(async () => {
    if (!doc.id) { try { localStorage.setItem(KEY, JSON.stringify({ at: Date.now(), doc })); } catch {} return setAs("local"); }
    if (doc.status !== "draft") return setAs(null);
    const tt = totals(doc); const { id, created_at, updated_at, ...rest } = doc; const { error } = await supabase.from("documents").update({ ...rest, total: tt.total }).eq("id", id); setAs(error ? "err" : "ok"); }, 1200); return () => clearTimeout(t); }, [doc]);
  const restart = () => { localStorage.removeItem(KEY); location.href = "/app/documents/nouveau"; };
  async function save(status) {
    setBusy(true); setErr(null); const t = totals(doc);
    const { id, created_at, updated_at, ...rest } = doc;
    const row = { ...rest, status: status || doc.status, total: t.total, tax_rate: +doc.tax_rate || 0, discount: +doc.discount || 0, opts: doc.opts || {}, items: doc.items.filter(i => i.label || +i.price).map(i => ({ label: i.label, qty: +i.qty || 0, price: +i.price || 0, ...(i.tax !== undefined && i.tax !== "" ? { tax: +i.tax } : {}) })) };
    if (!row.items.length) { setBusy(false); return setErr(tr("Ajoutez au moins une ligne avec un prix.", "Add at least one line with a price.")); }
    const res = id ? await supabase.from("documents").update(row).eq("id", id).select().single() : await supabase.from("documents").insert({ ...row, user_id: user.id }).select().single();
    setBusy(false);
    if (res.error) return setErr(/QUOTA/.test(res.error.message) ? "quota" : /duplicate|unique/.test(res.error.message) ? tr("Ce numéro existe déjà. Changez-le.", "This number already exists. Change it.") : res.error.message);
    if (q.get("import")) { localStorage.removeItem("bnv_draft"); localStorage.removeItem("kola_draft"); } localStorage.removeItem(KEY);
    if (doc.client?.name && !clients.some(c => c.name.toLowerCase() === doc.client.name.toLowerCase())) await supabase.from("clients").insert({ name: doc.client.name, phone: doc.client.phone || null, email: doc.client.email || null, address: doc.client.address || null, tax_id: doc.client.tax_id || null });
    if (!id && doc.source_id && doc.kind === "invoice") await supabase.from("documents").update({ status: "invoiced" }).eq("id", doc.source_id).eq("kind", "quote");
    toast(id ? tr("Modifications enregistrées", "Changes saved") : tr("Document créé", "Document created")); r.push(`/app/documents/${res.data.id}${id ? "" : "?new=1"}`);
  }
  if (!doc) return <div className="u">…</div>;
  return (<div>
    <div className="ph np"><div><Link href="/app/documents" className="lnk" style={{ fontSize: 14, color: "var(--mute)" }}>← Documents</Link><h1 style={{ marginTop: 6 }}>{doc.id ? `${tr("Modifier", "Edit")} ${doc.number}` : (doc.kind === "quote" ? tr("Nouveau devis", "New quote") : doc.kind === "receipt" ? tr("Nouveau reçu", "New receipt") : tr("Nouvelle facture", "New invoice"))}</h1></div>
      <div className="row">{as && <span className={`autosave ${as === "err" ? "err" : as === "…" ? "" : "ok"}`} role="status">{as === "…" ? tr("Enregistrement…", "Saving…") : as === "err" ? tr("Échec de l'enregistrement", "Save failed") : as === "local" ? tr("Brouillon gardé sur cet appareil", "Draft kept on this device") : tr("Enregistré", "Saved")}</span>}<button className="b o" disabled={busy} onClick={() => save(doc.id ? undefined : "draft")}>{doc.id ? tr("Enregistrer", "Save") : tr("Enregistrer en brouillon", "Save as draft")}</button>{(!doc.id || doc.status === "draft") && <button className="b k" disabled={busy} onClick={() => save(doc.kind === "receipt" ? "paid" : "sent")}>{busy ? "…" : doc.kind === "receipt" ? tr("Émettre le reçu →", "Issue receipt →") : tr("Finaliser →", "Finalise →")}</button>}</div></div>
    {resumed && !doc.id && <div className="note resumed np" style={{ marginBottom: 14 }}>{tr("Votre brouillon a été repris.", "Your draft was restored.")} <button className="lnk" onClick={restart}>{tr("Repartir de zéro", "Start over")}</button></div>}
    {err && <div className="note bad np" style={{ marginBottom: 14 }}>{err}</div>}
    {doc.source_id && <div className="note np" style={{ marginBottom: 14 }}>{doc.kind === "invoice" ? tr("Facture créée à partir du devis accepté. Le devis passera en « Facturé ».", "Invoice created from the accepted quote. The quote will be marked “Invoiced”.") : doc.kind === "receipt" ? tr("Reçu prérempli à partir de la facture.", "Receipt prefilled from the invoice.") : ""}</div>}
    <Editor account doc={doc} setDoc={setDoc} profile={profile} clients={clients} onNumber={async (k) => { if (!doc.id) { const n = await nextNumber(k, doc.lang || dl, st); setDoc(d => ({ ...d, number: n })); } }} />
  </div>);
}
export default function Page() { return <Suspense fallback={null}><Inner /></Suspense>; }
