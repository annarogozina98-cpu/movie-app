import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";
import { enrichMovie } from "@/lib/enrich";

export async function GET() {
  const { data, error } = await supabase
    .from("watched")
    .select("*")
    .order("watched_date", { ascending: false, nullsFirst: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

// Used for manually adding a movie straight into "watched" (skipping the
// to-watch list), e.g. when backfilling something you saw a long time ago.
export async function POST(req: Request) {
  const body = await req.json();
  const title = (body.title || "").trim();
  if (!title) {
    return NextResponse.json({ error: "title is required" }, { status: 400 });
  }

  const { data: inserted, error } = await supabase
    .from("watched")
    .insert({
      title,
      our_rating: body.our_rating ?? null,
      our_comment: body.our_comment ?? null,
      watched_date: body.watched_date ?? null,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  try {
    const fields = await enrichMovie(title);
    const { data: updated } = await supabase
      .from("watched")
      .update({ ...fields, enriched: true })
      .eq("id", inserted.id)
      .select()
      .single();
    return NextResponse.json(updated || inserted);
  } catch {
    return NextResponse.json(inserted);
  }
}
