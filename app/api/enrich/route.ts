import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";
import { enrichMovie } from "@/lib/enrich";

const TABLES = ["to_watch", "watched", "recommendations"] as const;
type Table = (typeof TABLES)[number];

export async function POST(req: Request) {
  const { id, table, title } = await req.json();

  if (!id || !title || !TABLES.includes(table)) {
    return NextResponse.json({ error: "id, title and a valid table are required" }, { status: 400 });
  }

  const fields = await enrichMovie(title);

  const { data, error } = await supabase
    .from(table as Table)
    .update({ ...fields, enriched: true })
    .eq("id", id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
