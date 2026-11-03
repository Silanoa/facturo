"use client";
import { useEffect } from "react";
// Apparition douce des blocs au défilement (désactivée si l'utilisateur préfère moins d'animations).
export default function Reveal() {
  useEffect(() => {
    const els = [...document.querySelectorAll(".rv")];
    if (!("IntersectionObserver" in window) || matchMedia("(prefers-reduced-motion: reduce)").matches) { els.forEach((e) => e.classList.add("on")); return; }
    document.documentElement.classList.add("rv-ready");
    const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("on"); io.unobserve(e.target); } }), { rootMargin: "0px 0px -8% 0px" });
    els.forEach((e) => io.observe(e));
    const past = () => els.forEach((e) => { if (e.getBoundingClientRect().top < innerHeight) e.classList.add("on"); });
    addEventListener("scroll", past, { passive: true }); return () => { io.disconnect(); removeEventListener("scroll", past); };
  }, []);
  return null;
}
