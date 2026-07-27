"use client";

import { useEffect, useMemo, useState } from "react";
import { ToWatchMovie } from "@/types";
import AddMovieForm from "@/components/AddMovieForm";
import ToWatchCard from "@/components/ToWatchCard";
import FilterBar from "@/components/FilterBar";
import { extractGenreOptions, matchesSearchAndGenre, sortMovies, toNumber } from "@/lib/filterMovies";

const SORT_OPTIONS = [
  { value: "created:desc", label: "Сначала новые" },
  { value: "rating:desc", label: "Рейтинг: высокий → низкий" },
  { value: "year:desc", label: "Год: новые → старые" },
  { value: "title:asc", label: "Название А-Я" },
];

export default function ToWatchPage() {
  const [movies, setMovies] = useState<ToWatchMovie[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [genre, setGenre] = useState("");
  const [sortBy, setSortBy] = useState(SORT_OPTIONS[0].value);

  async function load() {
    const res = await fetch("/api/to-watch");
    if (res.ok) setMovies(await res.json());
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function handleAdd(title: string) {
    const res = await fetch("/api/to-watch", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ title }),
    });
    if (res.ok) {
      const movie = await res.json();
      setMovies((prev) => [movie, ...prev]);
    }
  }

  async function handleMarkWatched(
    id: string,
    data: { our_rating: number | null; our_comment: string; watched_date: string }
  ) {
    const res = await fetch(`/api/move-to-watched/${id}`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(data),
    });
    if (res.ok) {
      setMovies((prev) => prev.filter((m) => m.id !== id));
    }
  }

  async function handleDelete(id: string) {
    setMovies((prev) => prev.filter((m) => m.id !== id));
    await fetch(`/api/to-watch/${id}`, { method: "DELETE" });
  }

  async function handleEnrich(id: string, title: string) {
    const res = await fetch("/api/enrich", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ id, title, table: "to_watch" }),
    });
    if (res.ok) {
      const updated = await res.json();
      setMovies((prev) => prev.map((m) => (m.id === id ? updated : m)));
    }
  }

  const genreOptions = useMemo(() => extractGenreOptions(movies), [movies]);

  const visibleMovies = useMemo(() => {
    const filtered = movies.filter((m) => matchesSearchAndGenre(m, search, genre));
    return sortMovies(filtered, sortBy, {
      created: (m) => m.created_at,
      rating: (m) => toNumber(m.imdb_rating),
      year: (m) => toNumber(m.year),
      title: (m) => m.title,
    });
  }, [movies, search, genre, sortBy]);

  return (
    <div className="flex flex-col gap-5">
      <AddMovieForm onAdd={handleAdd} />

      {movies.length > 0 && (
        <FilterBar
          search={search}
          onSearchChange={setSearch}
          genre={genre}
          onGenreChange={setGenre}
          genreOptions={genreOptions}
          sortBy={sortBy}
          onSortChange={setSortBy}
          sortOptions={SORT_OPTIONS}
          resultCount={visibleMovies.length}
        />
      )}

      {loading && <p className="text-sm text-muted">Загружаю…</p>}

      {!loading && movies.length === 0 && (
        <p className="text-sm text-muted">
          Список пуст. Впишите название фильма выше — данные подтянутся автоматически.
        </p>
      )}

      {!loading && movies.length > 0 && visibleMovies.length === 0 && (
        <p className="text-sm text-muted">Ничего не найдено по этим фильтрам.</p>
      )}

      <div className="flex flex-col gap-3">
        {visibleMovies.map((m) => (
          <ToWatchCard
            key={m.id}
            movie={m}
            onMarkWatched={handleMarkWatched}
            onDelete={handleDelete}
            onEnrich={handleEnrich}
          />
        ))}
      </div>
    </div>
  );
}
