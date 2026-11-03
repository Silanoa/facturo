"use client";
import { useEffect } from "react";
import { useT } from "../lib/i18n";
export default function LangSet({ l }) { const { setLang, lang } = useT(); useEffect(() => { if (l && l !== lang) setLang(l); }, [l]); return null; }
