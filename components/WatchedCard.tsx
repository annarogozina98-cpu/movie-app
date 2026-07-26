"use client";

import { useState } from "react";
import { WatchedMovie } from "@/types";

function Stat({ label, value }: { label: string; value: string | null }) {
  return (
    <div className="flex flex-col">
      <span className="text-[11px] uppercase tracking-wide text-muted">{label}</span>
      <span className="font-mono text-sm text-ink">{value || "-"}</span>
    </div>
  );
}

export default function WatchedCard({
  movie,
  onSave,
  onDelete,
  onEnrich,
}: {
  movie: WatchedMovie;
  onSave: (id: string, data: Partial<WatchedMovie>) => Promise<void>;
  onDelete: (id: string) => void;
  onEnrich: (id: string, title: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [rating, setRating] = useState(movie.our_rating?.toString() ?? "");
  const [comment, setComment] = useState(movie.our_comment ?? "");
  const [date, setDate] = useState(movie.watched_date ?? "");
  const [saving, setSaving] = useState(false);

  async function submit() {
    setSaving(true);
    try {
      await onSave(movie.id, {
        our_rating: rating ? Number(rating) : null,
        our_comment: comment,
        watched_date: date || null,
      });
      setEditing(false);
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

      <div className="grid grid-cols-3 gap-3 border-t border-line pt-3">
        <Stat label="Год" value={movie.year} />
        <Stat label="Рейтинг" value={movie.imdb_rating} />
        <Stat label="Дата просмотра" value={movie.watched_date} />
      </div>

      {!movie.enriched && (
        <button
          onClick={() => onEnrich(movie.id, movie.title)}
          className="mt-2 text-xs font-medium text-marquee underline underline-offset-2"
        >
          Заполнить данные
        </button>
      )}

      <div className="mt-4 border-t border-line pt-3">
        {!editing ? (
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="font-mono text-sm text-marquee">
                Наша оценка: {movie.our_rating ?? "-"}
                {movie.our_rating ? "/10" : ""}
              </p>
              {movie.our_comment && (
                <p className="mt-1 text-sm leading-relaxed text-muted">{movie.our_comment}</p>
              )}
            </div>
            <button
              onClick={() => setEditing(true)}
              className="shrink-0 text-sm font-medium text-marquee underline underline-offset-2"
            >
              Изменить
            </button>
          </div>
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
                onClick={() => setEditing(false)}
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
