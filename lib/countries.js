// Pays : devise, TVA standard, libellés fiscaux, régime de mentions.
// r: ohada | eu | fr | uk | us | ca | ng | gh | ke | za | ma | other
// Taux indicatifs (2026) — toujours modifiables dans l'éditeur.
const C = (code, fr, en, cur, vat, r, tax, reg) => ({ code, fr, en, cur, vat, r, tax, reg });
export const COUNTRIES = [
  // Afrique de l'Ouest et centrale (OHADA)
  C("BJ","Bénin","Benin","XOF",18,"ohada","IFU","RCCM"), C("BF","Burkina Faso","Burkina Faso","XOF",18,"ohada","IFU","RCCM"), C("CI","Côte d'Ivoire","Côte d'Ivoire","XOF",18,"ohada","NCC","RCCM"), C("GW","Guinée-Bissau","Guinea-Bissau","XOF",19,"ohada","NIF","RCCM"), C("ML","Mali","Mali","XOF",18,"ohada","NIF","RCCM"), C("NE","Niger","Niger","XOF",19,"ohada","NIF","RCCM"), C("SN","Sénégal","Senegal","XOF",18,"ohada","NINEA","RCCM"), C("TG","Togo","Togo","XOF",18,"ohada","NIF","RCCM"), C("CM","Cameroun","Cameroon","XAF",19.25,"ohada","NIU","RCCM"), C("CF","Centrafrique","Central African Rep.","XAF",19,"ohada","NIF","RCCM"), C("CG","Congo","Congo","XAF",18,"ohada","NIU","RCCM"), C("GA","Gabon","Gabon","XAF",18,"ohada","NIF","RCCM"), C("GQ","Guinée équatoriale","Equatorial Guinea","XAF",15,"ohada","NIF","RCCM"), C("TD","Tchad","Chad","XAF",18,"ohada","NIF","RCCM"), C("CD","RD Congo","DR Congo","CDF",16,"ohada","NIF","RCCM"), C("GN","Guinée","Guinea","GNF",18,"ohada","NIF","RCCM"),
  // Afrique — autres
  C("MG","Madagascar","Madagascar","MGA",20,"other","NIF","RCS"), C("MA","Maroc","Morocco","MAD",20,"ma","ICE","RC"), C("TN","Tunisie","Tunisia","TND",19,"other","MF","RNE"), C("NG","Nigeria","Nigeria","NGN",7.5,"ng","TIN","RC"), C("GH","Ghana","Ghana","GHS",15,"gh","TIN",""), C("KE","Kenya","Kenya","KES",16,"ke","KRA PIN",""), C("ZA","Afrique du Sud","South Africa","ZAR",15,"za","VAT No.","Reg. No."), C("RW","Rwanda","Rwanda","RWF",18,"other","TIN",""), C("UG","Ouganda","Uganda","UGX",18,"other","TIN",""), C("TZ","Tanzanie","Tanzania","TZS",18,"other","TIN",""),
  // Europe et Amérique du Nord
  C("FR","France","France","EUR",20,"fr","N° TVA","SIRET"), C("BE","Belgique","Belgium","EUR",21,"eu","N° TVA","BCE"), C("LU","Luxembourg","Luxembourg","EUR",17,"eu","N° TVA","RCS"), C("CH","Suisse","Switzerland","CHF",8.1,"other","IDE/TVA","IDE"), C("GB","Royaume-Uni","United Kingdom","GBP",20,"uk","VAT Reg. No.","Company No."), C("US","États-Unis","United States","USD",0,"us","EIN",""), C("CA","Canada","Canada","CAD",5,"ca","GST/HST No.","BN"), C("ZZ","Autre pays","Other country","USD",0,"other","Tax ID",""),
];
export const country = (c) => COUNTRIES.find((x) => x.code === c) || COUNTRIES.find((x) => x.code === "ZZ");
// Mentions légales à afficher en pied de document, selon le régime et la langue du document.
export function legalLines(p = {}, doc = {}, lang = "fr") {
  const c = country(p.country); const L = [];
  const en = lang === "en"; const vat = +doc.tax_rate || 0;
  if (c.r === "fr") {
    if (!vat) L.push(en ? "VAT not applicable, art. 293 B of the French CGI." : "TVA non applicable, art. 293 B du CGI.");
    if (doc.kind === "invoice") L.push(en ? "Late payment: penalties at 3× the legal interest rate and a €40 fixed recovery fee (art. L441-10 C. com.). No discount for early payment." : "En cas de retard : pénalités au taux de 3 fois l'intérêt légal et indemnité forfaitaire de 40 € pour frais de recouvrement (art. L441-10 C. com.). Pas d'escompte pour paiement anticipé.");
  } else if (c.r === "eu") {
    if (!vat && doc.client?.tax_id) L.push(en ? "Reverse charge — Article 196, Council Directive 2006/112/EC." : "Autoliquidation — article 196 de la directive 2006/112/CE.");
  } else if (c.r === "uk") {
    if (!vat) L.push(en ? "Not VAT registered." : "Non assujetti à la TVA au Royaume-Uni.");
  } else if (c.r === "ohada") {
    if (!vat) L.push(en ? "VAT not applicable (non-VAT-registered business)." : "TVA non applicable — entreprise non assujettie.");
  } else if (c.r === "ca") {
    if (vat) L.push(en ? "GST/HST included where applicable." : "TPS/TVH incluse le cas échéant.");
  }
  return L;
}
// Moyens de paiement usuels par pays : proposés en un clic (jamais imposés).
const OPS = { BJ: ["MTN MoMo", "Moov Money", "Celtiis Cash"], SN: ["Wave", "Orange Money", "Free Money"], CI: ["Orange Money", "MTN MoMo", "Wave", "Moov Money"], TG: ["Flooz", "T-Money"], BF: ["Orange Money", "Moov Money"], ML: ["Orange Money", "Moov Money"], NE: ["Airtel Money", "Moov Money"], CM: ["MTN MoMo", "Orange Money"], GA: ["Airtel Money", "Moov Money"], CG: ["MTN MoMo", "Airtel Money"], CD: ["M-Pesa", "Airtel Money", "Orange Money"], GN: ["Orange Money", "MTN MoMo"], MG: ["Mixx by Yas", "Orange Money", "Airtel Money"], GH: ["MTN MoMo", "Vodafone Cash", "AirtelTigo Money"], KE: ["M-Pesa", "Airtel Money"], UG: ["MTN MoMo", "Airtel Money"], TZ: ["M-Pesa", "Airtel Money"], RW: ["MTN MoMo", "Airtel Money"], NG: [], ZA: [] };
export const opsFor = (code) => OPS[code] || [];
export const prefersBank = (code) => ["FR", "BE", "LU", "CH", "GB", "US", "CA", "MA", "TN", "NG", "ZA", "ZZ"].includes(code);
export const dialFor = (code) => ({ BJ: "+229", SN: "+221", CI: "+225", TG: "+228", BF: "+226", ML: "+223", NE: "+227", CM: "+237", GA: "+241", CG: "+242", CD: "+243", GN: "+224", MG: "+261", GH: "+233", KE: "+254", UG: "+256", TZ: "+255", RW: "+250", NG: "+234", ZA: "+27", MA: "+212", TN: "+216", FR: "+33", BE: "+32", LU: "+352", CH: "+41", GB: "+44", US: "+1", CA: "+1" }[code] || "+");
