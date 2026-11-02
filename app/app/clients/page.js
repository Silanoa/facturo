"use client";
import { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabase";
const empty = { name: "", phone: "", email: "", address: "", tax_id: "" };
export default function Clients() {
  const [list, setList] = useState(null); const [f, setF] = useState(empty); const [edit, setEdit] = useState(null);
  const load = () => supabase.from("clients").select("*").order("name").then(({ data }) => setList(data || []));
  useEffect(() => { load(); }, []);
  async function save(e) { e.preventDefault(); if (!f.name) return;
    const { id, user_id, created_at, ...p } = f;
    edit ? await supabase.from("clients").update(p).eq("id", edit) : await supabase.from("clients").insert(p);
    setF(empty); setEdit(null); load(); }
  return (<>
    <div className="head"><div><span className="eyebrow">Fichier clients</span><h1>Clients</h1></div></div>
    <div className="editor" style={{gridTemplateColumns:"1.5fr 1fr"}}>
      <div className="card">{!list ? <p className="muted">Chargement…</p> : list.length === 0 ? <p className="muted">Aucun client enregistré. Ajoutez-en un à droite, ou cochez « Ajouter à mon fichier » en créant une facture.</p> :
        <table className="list"><thead><tr><th>Nom</th><th>Contact</th><th>IFU</th><th></th></tr></thead><tbody>{list.map(c => <tr key={c.id}>
          <td><b>{c.name}</b><div className="muted" style={{fontSize:13}}>{c.address}</div></td><td>{c.phone}<div className="muted" style={{fontSize:13}}>{c.email}</div></td><td>{c.tax_id}</td>
          <td style={{textAlign:"right",whiteSpace:"nowrap"}}>{c.phone && <a className="btn ghost sm" target="_blank" href={`https://wa.me/${c.phone.replace(/[^\d]/g, "")}`}>WhatsApp</a>} <button className="btn ghost sm" onClick={() => { setF(c); setEdit(c.id); }}>Modifier</button> <button className="btn ghost sm" onClick={async () => { if (confirm("Supprimer ce client ?")) { await supabase.from("clients").delete().eq("id", c.id); load(); } }}>×</button></td></tr>)}</tbody></table>}</div>
      <form className="card" onSubmit={save}><b>{edit ? "Modifier le client" : "Nouveau client"}</b><div style={{height:12}}/>
        {[["name","Nom / raison sociale"],["phone","Téléphone (WhatsApp)"],["email","Email"],["tax_id","IFU / NINEA / N° fiscal"],["address","Adresse"]].map(([k,l]) => <div className="field" key={k}><label>{l}</label><input value={f[k] || ""} onChange={e => setF({ ...f, [k]: e.target.value })} required={k === "name"}/></div>)}
        <div style={{display:"flex",gap:8}}><button className="btn">{edit ? "Mettre à jour" : "Ajouter"}</button>{edit && <button type="button" className="btn ghost" onClick={() => { setF(empty); setEdit(null); }}>Annuler</button>}</div>
      </form></div></>);
}
