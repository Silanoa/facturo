"use client";
import { createContext, useContext, useEffect, useState } from "react";
const D = {
  fr: { dash:"Tableau de bord", docs:"Documents", clients:"Clients", settings:"Mon entreprise", logout:"Déconnexion", newInv:"Nouvelle facture", newQuote:"Nouveau devis", newRec:"Nouveau reçu", paid:"Payée", sent:"Envoyée", draft:"Brouillon", overdue:"En retard", accepted:"Accepté", save:"Enregistrer", print:"Télécharger le PDF", wa:"Envoyer sur WhatsApp", collected:"Encaissé", pending:"En attente", thisMonth:"ce mois-ci" },
  en: { dash:"Dashboard", docs:"Documents", clients:"Clients", settings:"My business", logout:"Sign out", newInv:"New invoice", newQuote:"New quote", newRec:"New receipt", paid:"Paid", sent:"Sent", draft:"Draft", overdue:"Overdue", accepted:"Accepted", save:"Save", print:"Download PDF", wa:"Send via WhatsApp", collected:"Collected", pending:"Outstanding", thisMonth:"this month" },
};
const Ctx = createContext({ lang: "fr", t: (k) => D.fr[k] || k, setLang: () => {} });
export function LangProvider({ children }) {
  const [lang, setLang] = useState("fr");
  useEffect(() => { const l = localStorage.getItem("lang"); if (l) setLang(l); }, []);
  const set = (l) => { setLang(l); localStorage.setItem("lang", l); };
  return <Ctx.Provider value={{ lang, setLang: set, t: (k) => D[lang][k] || k }}>{children}</Ctx.Provider>;
}
export const useT = () => useContext(Ctx);
