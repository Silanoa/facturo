"use client";
import "./globals.css";
import ErrorScreen from "../components/ErrorScreen";
export default function GlobalError({ error, reset }) { return (<html lang="fr"><body><ErrorScreen error={error} reset={reset} /></body></html>); }
