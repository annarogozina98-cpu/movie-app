import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const { action } = await req.json(); // "accept" | "reject"

  const { data: rec, error: fetchErr } = await supabase
    .from("recommendations")
    .select("*")
    .eq("id", params.id)
    .single();

  if (fetchErr || !rec) {
    return NextResponse.json({ error: fetchErr?.message || "not found" }, { status: 404 });
  }

  if (action === "accept") {
    const { id, created_at, status, reason, ...rest } = rec;
    await supabase.from("to_watch").insert(rest);
    await supabase.from("recommendations").update({ status: "rejected" }).eq("id", params.id);
    // marked "rejected" here just means "no longer pending" - it's now in
    // to_watch, and staying out of future recommendation prompts is the goal.
    return NextResponse.json({ ok: true, moved: true });
  }

  if (action === "reject") {
    await supabase.from("recommendations").update({ status: "rejected" }).eq("id", params.id);
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: "unknown action" }, { status: 400 });
}
