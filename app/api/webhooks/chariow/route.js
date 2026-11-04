import { NextResponse } from "next/server";
import { confirmSale, pulseSigOk } from "../../../../lib/chariow";
// Pulse Chariow « successful.sale » → Pro. Signature vérifiée si CHARIOW_WEBHOOK_SECRET est défini ; la vente est toujours relue via l'API.
export async function POST(req) {
  if (!process.env.CHARIOW_API_KEY || !process.env.APP_SECRET) return NextResponse.json({ ok: false }, { status: 503 });
  const raw = await req.text(); const secret = process.env.CHARIOW_WEBHOOK_SECRET;
  if (secret && !pulseSigOk(raw, req.headers.get("x-chariow-signature"), secret)) return NextResponse.json({ ok: false }, { status: 401 });
  let j; try { j = JSON.parse(raw); } catch { return NextResponse.json({ ok: false }, { status: 400 }); }
  const ev = j.event || req.headers.get("x-pulse-event"); const id = j.sale?.id;
  if (ev !== "successful.sale" || !id) return NextResponse.json({ ok: true, skipped: ev || "none" });
  try { const r = await confirmSale(id); return NextResponse.json(r, { status: r.ok ? 200 : 422 }); }
  catch (e) { console.error("chariow webhook", e.message); return NextResponse.json({ ok: false }, { status: 502 }); }
}
