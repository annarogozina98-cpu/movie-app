"use client";

import { useEffect, useState } from "react";
import { ToWatchMovie } from "@/types";
import AddMovieForm from "@/components/AddMovieForm";
import ToWatchCard from "@/components/ToWatchCard";

export default function ToWatchPage() {
  const [movies, setMovies] = useState<ToWatchMovie[]>([]);
  const [loading, setLoading] = useState(true);

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

  return (
    <div className="flex flex-col gap-5">
      <AddMovieForm onAdd={handleAdd} />

      {loading && <p className="text-sm text-muted">Загружаю…</p>}

      {!loading && movies.length === 0 && (
        <p className="text-sm text-muted">
          Список пуст. Впишите название фильма выше — данные подтянутся автоматически.
        </p>
      )}

      <div className="flex flex-col gap-3">
        {movies.map((m) => (
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
