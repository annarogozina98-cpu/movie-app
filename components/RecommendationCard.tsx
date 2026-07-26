"use client";

import { Recommendation } from "@/types";
import MovieMeta from "./MovieMeta";

export default function RecommendationCard({
  rec,
  onAccept,
  onReject,
}: {
  rec: Recommendation;
  onAccept: (id: string) => void;
  onReject: (id: string) => void;
}) {
  return (
    <div className="rounded-card bg-surface p-4">
      <h3 className="font-display text-lg font-semibold leading-snug text-ink">{rec.title}</h3>

      {rec.reason && (
        <p className="mt-1 text-sm italic leading-relaxed text-marquee/90">« {rec.reason} »</p>
      )}

      <MovieMeta movie={rec} />

      <div className="mt-4 flex gap-2 border-t border-line pt-3">
        <button
          onClick={() => onAccept(rec.id)}
          className="rounded-card bg-marquee px-3.5 py-2 text-sm font-medium text-bg"
        >
          Добавить в «хотим посмотреть»
        </button>
        <button
          onClick={() => onReject(rec.id)}
          className="rounded-card bg-surface2 px-3.5 py-2 text-sm font-medium text-muted hover:text-velvet"
        >
          Отклонить
        </button>
      </div>
    </div>
  );
}
