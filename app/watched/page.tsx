"use client";

import { useEffect, useMemo, useState } from "react";
import { WatchedMovie } from "@/types";
import WatchedCard from "@/components/WatchedCard";
import AddMovieForm from "@/components/AddMovieForm";
import FilterBar from "@/components/FilterBar";
import { extractGenreOptions, matchesSearchAndGenre, sortMovies, toNumber } from "@/lib/filterMovies";

const SORT_OPTIONS = [
  { value: "watched_date:desc", label: "Дата просмотра: недавние" },
  { value: "our_rating:desc", label: "Наша оценка: высокая → низкая" },
  { value: "rating:desc", label: "Рейтинг IMDb: высокий → низкий" },
  { value: "title:asc", label: "Название А-Я" },
];

export default function WatchedPage() {
  const [movies, setMovies] = useState<WatchedMovie[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [genre, setGenre] = useState("");
  const [sortBy, setSortBy] = useState(SORT_OPTIONS[0].value);

  async function load() {
    const res = await fetch("/api/watched");
    if (res.ok) setMovies(await res.json());
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function handleAdd(title: string) {
    const res = await fetch("/api/watched", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ title }),
    });
    if (res.ok) {
      const movie = await res.json();
      setMovies((prev) => [movie, ...prev]);
    }
  }

  async function handleSave(id: string, data: Partial<WatchedMovie>) {
    const res = await fetch(`/api/watched/${id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(data),
    });
    if (res.ok) {
      const updated = await res.json();
      setMovies((prev) => prev.map((m) => (m.id === id ? updated : m)));
    }
  }

  async function handleDelete(id: string) {
    setMovies((prev) => prev.filter((m) => m.id !== id));
    await fetch(`/api/watched/${id}`, { method: "DELETE" });
  }

  async function handleEnrich(id: string, title: string) {
    const res = await fetch("/api/enrich", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ id, title, table: "watched" }),
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
      watched_date: (m) => m.watched_date,
      our_rating: (m) => toNumber(m.our_rating),
      rating: (m) => toNumber(m.imdb_rating),
      title: (m) => m.title,
    });
  }, [movies, search, genre, sortBy]);

  return (
    <div className="flex flex-col gap-5">
      <details className="rounded-card bg-surface p-4 text-sm text-muted">
        <summary className="cursor-pointer font-medium text-ink">
          Добавить фильм сразу в «посмотрели»
        </summary>
        <div className="mt-3">
          <AddMovieForm onAdd={handleAdd} />
        </div>
      </details>

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
        <p className="text-sm text-muted">Список пуст.</p>
      )}

      {!loading && movies.length > 0 && visibleMovies.length === 0 && (
        <p className="text-sm text-muted">Ничего не найдено по этим фильтрам.</p>
      )}

      <div className="flex flex-col gap-3">
        {visibleMovies.map((m) => (
          <WatchedCard
            key={m.id}
            movie={m}
            onSave={handleSave}
            onDelete={handleDelete}
            onEnrich={handleEnrich}
          />
        ))}
      </div>
    </div>
  );
}
