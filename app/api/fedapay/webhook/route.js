import { NextResponse } from "next/server";
import { confirmTx, fedaSigOk } from "../../../../lib/fedapay";
// Webhook FedaPay : active Pro même si le client ferme la page avant la redirection.
export async function POST(req) {
  const secret = process.env.FEDAPAY_WEBHOOK_SECRET; if (!secret || !process.env.FEDAPAY_SECRET_KEY) return NextResponse.json({ ok: false }, { status: 503 });
  const raw = await req.text(); if (!fedaSigOk(raw, req.headers.get("x-fedapay-signature"), secret)) return NextResponse.json({ ok: false }, { status: 401 });
  let j; try { j = JSON.parse(raw); } catch { return NextResponse.json({ ok: false }, { status: 400 }); }
  const name = j.name || j.event || ""; const id = j.entity?.id || j.object_id || j.data?.id;
  if (name !== "transaction.approved" || !id) return NextResponse.json({ ok: true, skipped: true });
  try { const r = await confirmTx(id); return NextResponse.json(r, { status: r.ok ? 200 : 422 }); } catch (e) { return NextResponse.json({ ok: false }, { status: 502 }); }
}
