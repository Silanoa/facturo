import Link from "next/link";
import { Logo } from "./Brand";
import Trial from "./Trial";
import Support from "./Support";
import { LangProvider } from "../lib/i18n";
export default function TryPage({ lang = "fr", children, heading = true }) {
  const en = lang === "en";
  return (<><header className="nav np"><div className="wrap nav-in"><Logo href={en ? "/en" : "/"} /><nav className="links"><Support lang={lang} hdr /><Link href={en ? "/essai" : "/en/invoice-generator"} className="lng">{en ? "FR" : "EN"}</Link><Link href="/connexion">{en ? "Log in" : "Connexion"}</Link></nav></div></header>
    <main className="wrap" style={{ paddingTop: 26, paddingBottom: 140 }}>{children}<LangProvider initial={lang}><Trial heading={heading} /></LangProvider></main></>);
}
