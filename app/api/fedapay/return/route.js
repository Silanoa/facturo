import { NextResponse } from "next/server";
import { confirmTx } from "../../../../lib/fedapay";
// FedaPay redirige ici avec ?id=... — on revérifie TOUJOURS côté serveur. Le webhook fait la même chose (idempotent).
export async function GET(req) {
  const u = new URL(req.url); const id = u.searchParams.get("id"); const back = (ok) => NextResponse.redirect(`${u.origin}/app/parametres?t=offre&paid=${ok ? 1 : 0}`);
  if (!id || !/^\d+$/.test(id) || !process.env.FEDAPAY_SECRET_KEY) return back(false);
  try { return back((await confirmTx(id)).ok); } catch { return back(false); }
}
