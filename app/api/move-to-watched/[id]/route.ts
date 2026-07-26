import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const body = await req.json().catch(() => ({}));
  const { our_rating = null, our_comment = null, watched_date = null } = body;

  const { data: movie, error: fetchErr } = await supabase
    .from("to_watch")
    .select("*")
    .eq("id", params.id)
    .single();

  if (fetchErr || !movie) {
    return NextResponse.json({ error: fetchErr?.message || "not found" }, { status: 404 });
  }

  const { id, created_at, ...rest } = movie;

  const { data: inserted, error: insertErr } = await supabase
    .from("watched")
    .insert({ ...rest, our_rating, our_comment, watched_date })
    .select()
    .single();

  if (insertErr) return NextResponse.json({ error: insertErr.message }, { status: 500 });

  await supabase.from("to_watch").delete().eq("id", params.id);

  return NextResponse.json(inserted);
}
