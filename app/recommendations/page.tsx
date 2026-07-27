"use client";

import { useEffect, useMemo, useState } from "react";
import { Recommendation } from "@/types";
import RecommendationCard from "@/components/RecommendationCard";
import FilterBar from "@/components/FilterBar";
import { extractGenreOptions, matchesSearchAndGenre, sortMovies, toNumber } from "@/lib/filterMovies";

const SORT_OPTIONS = [
  { value: "created:desc", label: "Сначала новые" },
  { value: "rating:desc", label: "Рейтинг: высокий → низкий" },
  { value: "title:asc", label: "Название А-Я" },
];

export default function RecommendationsPage() {
  const [recs, setRecs] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [genre, setGenre] = useState("");
  const [sortBy, setSortBy] = useState(SORT_OPTIONS[0].value);

  async function load() {
    const res = await fetch("/api/recommendations");
    if (res.ok) setRecs(await res.json());
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function handleGenerate() {
    setGenerating(true);
    setError(null);
    try {
      const res = await fetch("/api/recommend", { method: "POST" });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setError(body.error || "Не получилось получить рекомендации");
        return;
      }
      const newRecs = await res.json();
      setRecs((prev) => [...newRecs, ...prev]);
    } finally {
      setGenerating(false);
    }
  }

  async function handleAccept(id: string) {
    setRecs((prev) => prev.filter((r) => r.id !== id));
    await fetch(`/api/recommendations/${id}`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ action: "accept" }),
    });
  }

  async function handleReject(id: string) {
    setRecs((prev) => prev.filter((r) => r.id !== id));
    await fetch(`/api/recommendations/${id}`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ action: "reject" }),
    });
  }

  const genreOptions = useMemo(() => extractGenreOptions(recs), [recs]);

  const visibleRecs = useMemo(() => {
    const filtered = recs.filter((r) => matchesSearchAndGenre(r, search, genre));
    return sortMovies(filtered, sortBy, {
      created: (r) => r.created_at,
      rating: (r) => toNumber(r.imdb_rating),
      title: (r) => r.title,
    });
  }, [recs, search, genre, sortBy]);

  return (
    <div className="flex flex-col gap-5">
      <div className="rounded-card bg-surface p-4">
        <p className="text-sm text-muted">
          ИИ посмотрит на фильмы из вкладки «Посмотрели» (особенно на ваши оценки и
          комментарии) и предложит новые.
        </p>
        <button
          onClick={handleGenerate}
          disabled={generating}
          className="mt-3 rounded-card bg-marquee px-4 py-2.5 text-sm font-medium text-bg disabled:opacity-50"
        >
          {generating ? "Подбираю фильмы…" : "Подобрать рекомендации"}
        </button>
        {error && <p className="mt-2 text-sm text-velvet">{error}</p>}
      </div>

      {recs.length > 0 && (
        <FilterBar
          search={search}
          onSearchChange={setSearch}
          genre={genre}
          onGenreChange={setGenre}
          genreOptions={genreOptions}
          sortBy={sortBy}
          onSortChange={setSortBy}
          sortOptions={SORT_OPTIONS}
          resultCount={visibleRecs.length}
        />
      )}

      {loading && <p className="text-sm text-muted">Загружаю…</p>}

      {!loading && recs.length === 0 && !generating && (
        <p className="text-sm text-muted">
          Пока нет рекомендаций. Нажмите «Подобрать рекомендации» выше.
        </p>
      )}

      {!loading && recs.length > 0 && visibleRecs.length === 0 && (
        <p className="text-sm text-muted">Ничего не найдено по этим фильтрам.</p>
      )}

      <div className="flex flex-col gap-3">
        {visibleRecs.map((r) => (
          <RecommendationCard key={r.id} rec={r} onAccept={handleAccept} onReject={handleReject} />
        ))}
      </div>
    </div>
  );
}
