// Pays : devise, TVA standard, libellés fiscaux, régime de mentions.
// r: ohada | eu | fr | uk | us | ca | ng | gh | ke | za | ma | other
// Taux indicatifs (2026) — toujours modifiables dans l'éditeur.
const C = (code, fr, en, cur, vat, r, tax, reg) => ({ code, fr, en, cur, vat, r, tax, reg });
export const COUNTRIES = [
  // UEMOA (XOF, OHADA)
  C("BJ","Bénin","Benin","XOF",18,"ohada","IFU","RCCM"), C("BF","Burkina Faso","Burkina Faso","XOF",18,"ohada","IFU","RCCM"),
  C("CI","Côte d'Ivoire","Côte d'Ivoire","XOF",18,"ohada","NCC","RCCM"), C("GW","Guinée-Bissau","Guinea-Bissau","XOF",19,"ohada","NIF","RCCM"),
  C("ML","Mali","Mali","XOF",18,"ohada","NIF","RCCM"), C("NE","Niger","Niger","XOF",19,"ohada","NIF","RCCM"),
  C("SN","Sénégal","Senegal","XOF",18,"ohada","NINEA","RCCM"), C("TG","Togo","Togo","XOF",18,"ohada","NIF","RCCM"),
  // CEMAC (XAF, OHADA)
  C("CM","Cameroun","Cameroon","XAF",19.25,"ohada","NIU","RCCM"), C("CF","Centrafrique","Central African Rep.","XAF",19,"ohada","NIF","RCCM"),
  C("CG","Congo","Congo","XAF",18,"ohada","NIU","RCCM"), C("GA","Gabon","Gabon","XAF",18,"ohada","NIF","RCCM"),
  C("GQ","Guinée équatoriale","Equatorial Guinea","XAF",15,"ohada","NIF","RCCM"), C("TD","Tchad","Chad","XAF",18,"ohada","NIF","RCCM"),
  // Autres OHADA
  C("CD","RD Congo","DR Congo","CDF",16,"ohada","NIF","RCCM"), C("GN","Guinée","Guinea","GNF",18,"ohada","NIF","RCCM"),
  C("KM","Comores","Comoros","KMF",10,"ohada","NIF","RCCM"),
  // Afrique — autres
  C("DZ","Algérie","Algeria","DZD",19,"other","NIF","RC"), C("AO","Angola","Angola","AOA",14,"other","NIF",""),
  C("BW","Botswana","Botswana","BWP",14,"other","TIN",""), C("BI","Burundi","Burundi","BIF",18,"other","NIF","RC"),
  C("CV","Cap-Vert","Cabo Verde","CVE",15,"other","NIF",""), C("DJ","Djibouti","Djibouti","DJF",10,"other","NIF","RCS"),
  C("EG","Égypte","Egypt","EGP",14,"other","Tax ID","CR"), C("ER","Érythrée","Eritrea","ERN",0,"other","TIN",""),
  C("SZ","Eswatini","Eswatini","SZL",15,"other","TIN",""), C("ET","Éthiopie","Ethiopia","ETB",15,"other","TIN",""),
  C("GM","Gambie","Gambia","GMD",15,"other","TIN",""), C("GH","Ghana","Ghana","GHS",15,"gh","TIN",""),
  C("KE","Kenya","Kenya","KES",16,"ke","KRA PIN",""), C("LS","Lesotho","Lesotho","LSL",15,"other","TIN",""),
  C("LR","Liberia","Liberia","LRD",10,"other","TIN",""), C("LY","Libye","Libya","LYD",0,"other","TIN",""),
  C("MG","Madagascar","Madagascar","MGA",20,"other","NIF","RCS"), C("MW","Malawi","Malawi","MWK",16.5,"other","TPIN",""),
  C("MR","Mauritanie","Mauritania","MRU",16,"other","NIF","RC"), C("MU","Maurice","Mauritius","MUR",15,"other","VAT No.","BRN"),
  C("MA","Maroc","Morocco","MAD",20,"ma","ICE","RC"), C("MZ","Mozambique","Mozambique","MZN",16,"other","NUIT",""),
  C("NA","Namibie","Namibia","NAD",15,"other","TIN",""), C("NG","Nigeria","Nigeria","NGN",7.5,"ng","TIN","RC"),
  C("RW","Rwanda","Rwanda","RWF",18,"other","TIN",""), C("ST","Sao Tomé-et-Principe","São Tomé and Príncipe","STN",15,"other","NIF",""),
  C("SC","Seychelles","Seychelles","SCR",15,"other","TIN",""), C("SL","Sierra Leone","Sierra Leone","SLE",15,"other","TIN",""),
  C("SO","Somalie","Somalia","SOS",0,"other","TIN",""), C("ZA","Afrique du Sud","South Africa","ZAR",15,"za","VAT No.","Reg. No."),
  C("SS","Soudan du Sud","South Sudan","SSP",18,"other","TIN",""), C("SD","Soudan","Sudan","SDG",17,"other","TIN",""),
  C("TZ","Tanzanie","Tanzania","TZS",18,"other","TIN",""), C("TN","Tunisie","Tunisia","TND",19,"other","MF","RNE"),
  C("UG","Ouganda","Uganda","UGX",18,"other","TIN",""), C("ZM","Zambie","Zambia","ZMW",16,"other","TPIN",""),
  C("ZW","Zimbabwe","Zimbabwe","ZWG",15,"other","BP No.",""),
  // Europe & monde
  C("FR","France","France","EUR",20,"fr","N° TVA","SIRET"), C("BE","Belgique","Belgium","EUR",21,"eu","N° TVA","BCE"),
  C("LU","Luxembourg","Luxembourg","EUR",17,"eu","N° TVA","RCS"), C("CH","Suisse","Switzerland","CHF",8.1,"other","IDE/TVA","IDE"),
  C("DE","Allemagne","Germany","EUR",19,"eu","USt-IdNr.","HRB"), C("ES","Espagne","Spain","EUR",21,"eu","NIF/IVA",""),
  C("IT","Italie","Italy","EUR",22,"eu","P. IVA",""), C("PT","Portugal","Portugal","EUR",23,"eu","NIF",""),
  C("NL","Pays-Bas","Netherlands","EUR",21,"eu","BTW-id","KvK"), C("IE","Irlande","Ireland","EUR",23,"eu","VAT No.","CRO"),
  C("GB","Royaume-Uni","United Kingdom","GBP",20,"uk","VAT Reg. No.","Company No."),
  C("US","États-Unis","United States","USD",0,"us","EIN",""), C("CA","Canada","Canada","CAD",5,"ca","GST/HST No.","BN"),
  C("AE","Émirats arabes unis","United Arab Emirates","AED",5,"other","TRN",""), C("SA","Arabie saoudite","Saudi Arabia","SAR",15,"other","VAT No.","CR"),
  C("TR","Turquie","Türkiye","TRY",20,"other","VKN",""), C("IN","Inde","India","INR",18,"other","GSTIN",""),
  C("CN","Chine","China","CNY",13,"other","USCC",""), C("JP","Japon","Japan","JPY",10,"other","T-No.",""),
  C("AU","Australie","Australia","AUD",10,"other","ABN",""), C("BR","Brésil","Brazil","BRL",0,"other","CNPJ",""),
  C("MX","Mexique","Mexico","MXN",16,"other","RFC",""), C("HT","Haïti","Haiti","HTG",10,"other","NIF",""),
  C("ZZ","Autre pays","Other country","USD",0,"other","Tax ID",""),
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
