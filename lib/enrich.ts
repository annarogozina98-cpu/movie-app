import { EnrichedFields } from "@/types";

const CLAUDE_MODEL = "claude-haiku-4-5-20251001";

interface Identified {
  title_en: string;
  year: string | null;
}

async function identifyMovie(rawTitle: string): Promise<Identified | null> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return null;

  const prompt = `You are helping identify a real movie from a short, possibly messy title written by a Russian-speaking user (it may include notes in parentheses, actor names, misspellings, or be a franchise name). Figure out which real movie is meant.

Title as written: "${rawTitle}"

Reply with ONLY a JSON object, no markdown fences, no other text:
{"title_en": "<the movie's official English title as listed on IMDb>", "year": "<4-digit release year, or null if unsure>"}`;

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: CLAUDE_MODEL,
      max_tokens: 300,
      messages: [{ role: "user", content: prompt }],
    }),
  });

  if (!res.ok) return null;
  const data = await res.json();
  const text = (data.content || [])
    .map((b: any) => b.text || "")
    .join("")
    .trim();

  try {
    const cleaned = text.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(cleaned);
    if (!parsed.title_en) return null;
    return { title_en: parsed.title_en, year: parsed.year || null };
  } catch {
    return null;
  }
}

async function fetchOmdb(title: string, year: string | null) {
  const apiKey = process.env.OMDB_API_KEY;
  if (!apiKey) return null;

  const params = new URLSearchParams({ t: title, apikey: apiKey });
  if (year) params.set("y", year);

  const res = await fetch(`https://www.omdbapi.com/?${params.toString()}`);
  if (!res.ok) return null;
  const data = await res.json();
  if (data.Response === "False") return null;
  return data as Record<string, string>;
}

// Falls back to asking Claude directly when OMDb has no match, so the fields
// are still filled in as best-effort rather than left blank.
async function askClaudeDirectly(rawTitle: string): Promise<Partial<EnrichedFields>> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  const empty: Partial<EnrichedFields> = {};
  if (!apiKey) return empty;

  const prompt = `A user wants information about this movie (title may be in Russian, possibly with notes in parentheses): "${rawTitle}"

Reply with ONLY a JSON object, no markdown fences:
{"year": "<4-digit year or '-'>", "genre": "<comma separated genres or '-'>", "duration": "<runtime like '132 min' or '-'>", "imdb_rating": "<e.g. '8.1' or '-'>", "description": "<one sentence plot summary in Russian, or '-'>"}

If you are not confident this is a real movie, put "-" in every field.`;

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: CLAUDE_MODEL,
      max_tokens: 400,
      messages: [{ role: "user", content: prompt }],
    }),
  });

  if (!res.ok) return empty;
  const data = await res.json();
  const text = (data.content || []).map((b: any) => b.text || "").join("").trim();
  try {
    const cleaned = text.replace(/```json|```/g, "").trim();
    return JSON.parse(cleaned);
  } catch {
    return empty;
  }
}

function kinopoiskSearchLink(rawTitle: string): string {
  // Kinopoisk has no free public API, so we build a search link from the
  // original (Russian) title rather than trying to resolve an exact match.
  const cleaned = rawTitle.replace(/\([^)]*\)/g, "").trim();
  return `https://www.kinopoisk.ru/index.php?kp_query=${encodeURIComponent(cleaned)}`;
}

export async function enrichMovie(rawTitle: string): Promise<EnrichedFields> {
  const identified = await identifyMovie(rawTitle);
  const omdb = identified
    ? await fetchOmdb(identified.title_en, identified.year)
    : null;

  if (omdb) {
    return {
      year: omdb.Year || "-",
      genre: omdb.Genre || "-",
      duration: omdb.Runtime || "-",
      imdb_rating: omdb.imdbRating || "-",
      description: omdb.Plot || "-",
      imdb_link: omdb.imdbID ? `https://www.imdb.com/title/${omdb.imdbID}/` : "-",
      kinopoisk_link: kinopoiskSearchLink(rawTitle),
    };
  }

  // OMDb had no match (often true for Russian/Soviet films) - fall back to Claude.
  const fallback = await askClaudeDirectly(rawTitle);
  return {
    year: fallback.year || "-",
    genre: fallback.genre || "-",
    duration: fallback.duration || "-",
    imdb_rating: fallback.imdb_rating || "-",
    description: fallback.description || "-",
    imdb_link: "-",
    kinopoisk_link: kinopoiskSearchLink(rawTitle),
  };
}
