import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const body = await req.json();
  const { data, error } = await supabase
    .from("to_watch")
    .update(body)
    .eq("id", params.id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const { error } = await supabase.from("to_watch").delete().eq("id", params.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
