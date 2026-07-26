import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";
import { enrichMovie } from "@/lib/enrich";

export async function GET() {
  const { data, error } = await supabase
    .from("to_watch")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(req: Request) {
  const body = await req.json();
  const title = (body.title || "").trim();
  if (!title) {
    return NextResponse.json({ error: "title is required" }, { status: 400 });
  }

  // Insert immediately so the UI feels instant, then enrich in the background.
  const { data: inserted, error } = await supabase
    .from("to_watch")
    .insert({ title })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  try {
    const fields = await enrichMovie(title);
    const { data: updated } = await supabase
      .from("to_watch")
      .update({ ...fields, enriched: true })
      .eq("id", inserted.id)
      .select()
      .single();
    return NextResponse.json(updated || inserted);
  } catch {
    return NextResponse.json(inserted);
  }
}
