"use client";

import { useEffect, useState } from "react";
import { Recommendation } from "@/types";
import RecommendationCard from "@/components/RecommendationCard";

export default function RecommendationsPage() {
  const [recs, setRecs] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

      {loading && <p className="text-sm text-muted">Загружаю…</p>}

      {!loading && recs.length === 0 && !generating && (
        <p className="text-sm text-muted">
          Пока нет рекомендаций. Нажмите «Подобрать рекомендации» выше.
        </p>
      )}

      <div className="flex flex-col gap-3">
        {recs.map((r) => (
          <RecommendationCard key={r.id} rec={r} onAccept={handleAccept} onReject={handleReject} />
        ))}
      </div>
    </div>
  );
}
