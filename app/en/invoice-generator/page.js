import Link from "next/link";
import TryPage from "../../../components/TryPage";
export const metadata = { title: "Free Invoice Generator — No Sign-up, Any Currency", description: "Create an invoice, quote or receipt in seconds. Any currency, VAT/sales tax, amount in words, PDF download, send by WhatsApp or email. Free, no account.", alternates: { canonical: "/en/invoice-generator", languages: { fr: "/essai", en: "/en/invoice-generator" } } };
export default function Page() { return (<TryPage lang="en" heading={true} />); }
