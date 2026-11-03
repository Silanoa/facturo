"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { supabase } from "../../../lib/supabase";
import { fmt } from "../../../lib/money";
import { clientStats } from "../../../lib/insights";
import { initials, avColor, waNumber } from "../../../lib/share";
import { useT } from "../../../lib/i18n";
import { useSession } from "../../../lib/session";
const empty = { name: "", phone: "", email: "", address: "", tax_id: "" };
export default function Clients() {
  const { toast } = useSession(); const { tr } = useT(); const [list, setList] = useState(null); const [docs, setDocs] = useState([]); const [f, setF] = useState(null); const [q, setQ] = useState("");
  const load = () => supabase.from("clients").select("*").order("name").then(({ data }) => setList(data || []));
  useEffect(() => { load(); supabase.from("documents").select("kind,status,client,total,currency,issue_date,due_date,paid_at,declared_paid_at").then(({ data }) => setDocs(data || [])); }, []);
  const stats = useMemo(() => Object.fromEntries(clientStats(docs).map(c => [c.name.toLowerCase(), c])), [docs]);
  async function save(e) { e.preventDefault(); const { id, user_id, created_at, ...p } = f; const res = id ? await supabase.from("clients").update(p).eq("id", id) : await supabase.from("clients").insert(p);
    if (res.error) return toast(res.error.message, "err"); toast(id ? tr("Client mis à jour", "Client updated") : tr("Client ajouté", "Client added")); setF(null); load(); }
  const shown = (list || []).filter(c => !q || `${c.name} ${c.phone || ""}`.toLowerCase().includes(q.toLowerCase()));
  return (<div className="in">
    <div className="ph"><h1>Clients</h1><div className="row"><input placeholder={tr("Rechercher", "Search")} value={q} onChange={(e) => setQ(e.target.value)} style={{ maxWidth: 220 }} /><button className="b k s" onClick={() => setF(empty)}>+ Client</button></div></div>
    {f && <form className="panel" onSubmit={save} style={{ marginBottom: 18, maxWidth: 680 }}><b style={{ display: "block", marginBottom: 14 }}>{f.id ? tr("Modifier le client", "Edit client") : tr("Nouveau client", "New client")}</b>
      <div className="g2">{[["name", tr("Nom ou raison sociale", "Name or company")], ["phone", "WhatsApp"], ["email", "Email"], ["tax_id", tr("N° fiscal / TVA", "Tax / VAT ID")]].map(([k, l]) => <label className="f" key={k}><span>{l}</span><input value={f[k] || ""} onChange={(e) => setF({ ...f, [k]: e.target.value })} required={k === "name"} type={k === "email" ? "email" : k === "phone" ? "tel" : "text"} /></label>)}</div>
      <label className="f"><span>{tr("Adresse", "Address")}</span><input value={f.address || ""} onChange={(e) => setF({ ...f, address: e.target.value })} /></label>
      <div className="row"><button className="b">{f.id ? tr("Enregistrer", "Save") : tr("Ajouter", "Add")}</button><button type="button" className="b o" onClick={() => setF(null)}>{tr("Annuler", "Cancel")}</button>
        {f.id && <button type="button" className="lnk" style={{ marginLeft: "auto", color: "var(--late)" }} onClick={async () => { if (confirm(tr("Supprimer ce client ? Ses factures restent.", "Delete this client? Invoices stay."))) { await supabase.from("clients").delete().eq("id", f.id); setF(null); load(); } }}>{tr("Supprimer", "Delete")}</button>}</div></form>}
    {!list ? <div className="u">…</div> : list.length === 0 ? <div className="list" style={{ padding: 28 }}><b>{tr("Aucun client pour l'instant.", "No clients yet.")}</b> <span className="mute">{tr("Ils s'ajoutent automatiquement à chaque facture.", "They are added automatically with each invoice.")}</span></div> :
      <div className="list">{shown.map(c => { const s = stats[c.name.toLowerCase()]; return (<div className="li" key={c.id}>
        <span className="av" style={{ background: avColor(c.name) }}>{initials(c.name)}</span>
        <button className="grow" onClick={() => setF(c)} style={{ background: "none", border: 0, textAlign: "left", padding: 0, cursor: "pointer", font: "inherit", color: "inherit" }}>
          <div className="t">{c.name}</div>
          <div className="s">{s ? <>{fmt(s.billed, s.currency)} {tr("facturés", "billed")}{s.avgDays !== null && <> · {tr("paie en", "pays in")} ~{s.avgDays} {tr("j", "d")}</>}{s.open > 0 && <> · <span style={{ color: s.late ? "var(--late)" : "var(--ink-2)", fontWeight: 600 }}>{tr("doit", "owes")} {fmt(s.open, s.currency)}</span></>}</> : (c.phone || c.email || "—")}</div></button>
        {c.phone && <a className="b s o" target="_blank" rel="noreferrer" href={`https://wa.me/${waNumber(c.phone)}`}>WhatsApp</a>}
        <Link className="b s o" href={`/app/documents/nouveau?client=${c.id}`}>{tr("Facturer", "Invoice")}</Link></div>); })}</div>}
    <style>{`@media(max-width:600px){.li .b.o{display:none}}`}</style>
  </div>);
}
