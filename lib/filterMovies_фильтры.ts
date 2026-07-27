import { MovieCore } from "@/types";

// Genre fields look like "Action, Adventure, Sci-Fi" (OMDb) or "драма, комедия"
// (Claude fallback) or "-" when missing. This splits them into a clean list.
function splitGenres(genre: string | null): string[] {
  if (!genre || genre === "-") return [];
  return genre
    .split(",")
    .map((g) => g.trim())
    .filter(Boolean);
}

export function extractGenreOptions(movies: MovieCore[]): string[] {
  const seen = new Map<string, string>(); // lowercase -> original casing
  for (const m of movies) {
    for (const g of splitGenres(m.genre)) {
      const key = g.toLowerCase();
      if (!seen.has(key)) seen.set(key, g);
    }
  }
  return Array.from(seen.values()).sort((a, b) => a.localeCompare(b, "ru"));
}

export function matchesSearchAndGenre<T extends MovieCore>(
  movie: T,
  search: string,
  genre: string
): boolean {
  const searchOk =
    !search.trim() || movie.title.toLowerCase().includes(search.trim().toLowerCase());

  const genreOk =
    !genre ||
    splitGenres(movie.genre).some((g) => g.toLowerCase() === genre.toLowerCase());

  return searchOk && genreOk;
}

// Parses values like "8.1", "-", "132 min", "2019" into a comparable number.
// Missing/unparseable values sort last regardless of direction.
export function toNumber(value: string | number | null | undefined): number | null {
  if (value === null || value === undefined) return null;
  if (typeof value === "number") return value;
  const match = value.match(/[\d.]+/);
  if (!match) return null;
  const n = parseFloat(match[0]);
  return Number.isNaN(n) ? null : n;
}

export function sortMovies<T extends MovieCore>(
  movies: T[],
  sortBy: string,
  getters: Record<string, (m: T) => number | string | null>
): T[] {
  const [field, dir] = sortBy.split(":");
  const getter = getters[field];
  if (!getter) return movies;

  const sorted = [...movies].sort((a, b) => {
    const av = getter(a);
    const bv = getter(b);

    // Nulls/empty always sort to the end, regardless of asc/desc.
    if (av === null && bv === null) return 0;
    if (av === null) return 1;
    if (bv === null) return -1;

    let cmp: number;
    if (typeof av === "number" && typeof bv === "number") {
      cmp = av - bv;
    } else {
      cmp = String(av).localeCompare(String(bv), "ru");
    }
    return dir === "desc" ? -cmp : cmp;
  });

  return sorted;
}
