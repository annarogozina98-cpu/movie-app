import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";
import { enrichMovie } from "@/lib/enrich";

const CLAUDE_MODEL = "claude-sonnet-5";

export async function POST() {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "ANTHROPIC_API_KEY is not configured" },
      { status: 500 }
    );
  }

  const [{ data: watched }, { data: toWatch }, { data: allRecs }] = await Promise.all([
    supabase.from("watched").select("title, genre, our_rating, our_comment"),
    supabase.from("to_watch").select("title, genre"),
    supabase.from("recommendations").select("title"),
  ]);

  const watchedList = (watched || [])
    .map(
      (m) =>
        `- "${m.title}"${m.genre ? ` (${m.genre})` : ""}${
          m.our_rating ? `, наша оценка: ${m.our_rating}/10` : ""
        }${m.our_comment ? `, комментарий: ${m.our_comment}` : ""}`
    )
    .join("\n");

  const toWatchList = (toWatch || []).map((m) => `- "${m.title}"`).join("\n");
  const excludeList = [...(toWatch || []), ...(watched || []), ...(allRecs || [])]
    .map((m: any) => m.title)
    .join(", ");

  const prompt = `Ты помогаешь двум людям подобрать фильмы. Вот фильмы, которые они уже посмотрели, с их личными оценками и комментариями (это лучший сигнал об их вкусе):
${watchedList || "(пока пусто)"}

Вот фильмы, которые они уже хотят посмотреть (не предлагай их снова):
${toWatchList || "(пока пусто)"}

На основе их вкуса предложи 5 РЕАЛЬНО СУЩЕСТВУЮЩИХ фильмов, которых нет ни в одном из списков выше и вот в этом перечне уже предложенных ранее: ${excludeList || "(нет)"}.

Отвечай ТОЛЬКО JSON-массивом, без markdown, без пояснений:
[{"title": "<официальное английское название фильма>", "reason": "<1-2 предложения на русском, почему именно этот фильм подойдёт им, со ссылкой на конкретный фильм/жанр из их списка>"}]`;

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: CLAUDE_MODEL,
      max_tokens: 1200,
      messages: [{ role: "user", content: prompt }],
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    return NextResponse.json({ error: `Claude API error: ${text}` }, { status: 500 });
  }

  const data = await res.json();
  const text = (data.content || []).map((b: any) => b.text || "").join("").trim();

  let suggestions: { title: string; reason: string }[] = [];
  try {
    suggestions = JSON.parse(text.replace(/```json|```/g, "").trim());
  } catch {
    return NextResponse.json({ error: "Could not parse recommendations" }, { status: 500 });
  }

  const inserted = [];
  for (const s of suggestions) {
    try {
      const fields = await enrichMovie(s.title);
      const { data: row } = await supabase
        .from("recommendations")
        .insert({ title: s.title, reason: s.reason, ...fields, enriched: true })
        .select()
        .single();
      if (row) inserted.push(row);
    } catch {
      // Skip a suggestion if enrichment fails; the rest still get added.
    }
  }

  return NextResponse.json(inserted);
}
