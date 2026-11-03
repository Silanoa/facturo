import { LangProvider } from "../../lib/i18n";
export default function L({ children }) { return <LangProvider initial="en">{children}</LangProvider>; }
