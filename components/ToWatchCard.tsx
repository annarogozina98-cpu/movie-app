"use client";

import { useState } from "react";
import { ToWatchMovie } from "@/types";
import MovieMeta from "./MovieMeta";

export default function ToWatchCard({
  movie,
  onMarkWatched,
  onDelete,
  onEnrich,
}: {
  movie: ToWatchMovie;
  onMarkWatched: (id: string, data: { our_rating: number | null; our_comment: string; watched_date: string }) => Promise<void>;
  onDelete: (id: string) => void;
  onEnrich: (id: string, title: string) => void;
}) {
  const [showForm, setShowForm] = useState(false);
  const [rating, setRating] = useState("");
  const [comment, setComment] = useState("");
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [saving, setSaving] = useState(false);

  async function submit() {
    setSaving(true);
    try {
      await onMarkWatched(movie.id, {
        our_rating: rating ? Number(rating) : null,
        our_comment: comment,
        watched_date: date,
      });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="rounded-card bg-surface p-4">
      <div className="flex items-start justify-between gap-3">
        <h3 className="font-display text-lg font-semibold leading-snug text-ink">
          {movie.title}
        </h3>
        <button
          onClick={() => onDelete(movie.id)}
          aria-label="Удалить"
          className="shrink-0 text-muted hover:text-velvet"
        >
          ✕
        </button>
      </div>

      <MovieMeta movie={movie} />

      {!movie.enriched && (
        <button
          onClick={() => onEnrich(movie.id, movie.title)}
          className="mt-2 text-xs font-medium text-marquee underline underline-offset-2"
        >
          Заполнить данные
        </button>
      )}

      <div className="mt-4 border-t border-line pt-3">
        {!showForm ? (
          <button
            onClick={() => setShowForm(true)}
            className="rounded-card bg-surface2 px-3.5 py-2 text-sm font-medium text-ink hover:bg-line"
          >
            Отметить как просмотренный
          </button>
        ) : (
          <div className="flex flex-col gap-2">
            <div className="flex gap-2">
              <input
                type="number"
                min={0}
                max={10}
                step={0.5}
                value={rating}
                onChange={(e) => setRating(e.target.value)}
                placeholder="Оценка /10"
                className="w-28 rounded-card border border-line bg-bg px-3 py-2 text-sm text-ink placeholder:text-muted focus:border-marquee"
              />
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="rounded-card border border-line bg-bg px-3 py-2 text-sm text-ink focus:border-marquee"
              />
            </div>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Комментарий..."
              rows={2}
              className="rounded-card border border-line bg-bg px-3 py-2 text-sm text-ink placeholder:text-muted focus:border-marquee"
            />
            <div className="flex gap-2">
              <button
                onClick={submit}
                disabled={saving}
                className="rounded-card bg-marquee px-3.5 py-2 text-sm font-medium text-bg disabled:opacity-50"
              >
                {saving ? "Сохраняю…" : "Сохранить"}
              </button>
              <button
                onClick={() => setShowForm(false)}
                className="rounded-card px-3.5 py-2 text-sm text-muted hover:text-ink"
              >
                Отмена
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
