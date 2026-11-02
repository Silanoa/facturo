import { supabase } from "./supabase";
import { KINDS } from "./money";
export async function nextNumber(kind) {
  const y = new Date().getFullYear(); const pre = `${KINDS[kind].prefix}-${y}-`;
  const { data } = await supabase.from("documents").select("number").eq("kind", kind).like("number", `${pre}%`).order("number", { ascending: false }).limit(1);
  const last = data?.[0]?.number ? parseInt(data[0].number.slice(pre.length)) || 0 : 0;
  return pre + String(last + 1).padStart(4, "0");
}
