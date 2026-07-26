import { MovieCore } from "@/types";

function Stat({ label, value }: { label: string; value: string | null }) {
  return (
    <div className="flex flex-col">
      <span className="text-[11px] uppercase tracking-wide text-muted">{label}</span>
      <span className="font-mono text-sm text-ink">{value || "-"}</span>
    </div>
  );
}

export default function MovieMeta({ movie }: { movie: MovieCore }) {
  return (
    <div>
      <div className="grid grid-cols-4 gap-3 border-t border-line pt-3">
        <Stat label="Год" value={movie.year} />
        <Stat label="Рейтинг" value={movie.imdb_rating} />
        <Stat label="Длительность" value={movie.duration} />
        <Stat label="Жанр" value={movie.genre} />
      </div>

      {movie.description && movie.description !== "-" && (
        <p className="mt-3 text-sm leading-relaxed text-muted">{movie.description}</p>
      )}

      <div className="mt-3 flex flex-wrap gap-3 text-sm">
        {movie.imdb_link && movie.imdb_link !== "-" && (
          <a
            href={movie.imdb_link}
            target="_blank"
            rel="noreferrer"
            className="text-marquee underline decoration-marquee/40 underline-offset-2 hover:decoration-marquee"
          >
            IMDb →
          </a>
        )}
        {movie.kinopoisk_link && movie.kinopoisk_link !== "-" && (
          <a
            href={movie.kinopoisk_link}
            target="_blank"
            rel="noreferrer"
            className="text-marquee underline decoration-marquee/40 underline-offset-2 hover:decoration-marquee"
          >
            Кинопоиск →
          </a>
        )}
      </div>

      {!movie.enriched && (
        <p className="mt-2 text-xs italic text-muted">Данные ещё не загружены</p>
      )}
    </div>
  );
}
