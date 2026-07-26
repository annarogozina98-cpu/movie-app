"use client";

import { useState } from "react";

export default function AddMovieForm({
  onAdd,
}: {
  onAdd: (title: string) => Promise<void>;
}) {
  const [title, setTitle] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = title.trim();
    if (!trimmed || submitting) return;
    setSubmitting(true);
    setTitle("");
    try {
      await onAdd(trimmed);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Название фильма..."
        className="flex-1 rounded-card border border-line bg-surface px-3.5 py-2.5 text-sm text-ink placeholder:text-muted focus:border-marquee"
      />
      <button
        type="submit"
        disabled={submitting || !title.trim()}
        className="rounded-card bg-marquee px-4 py-2.5 text-sm font-medium text-bg disabled:opacity-50"
      >
        {submitting ? "Добавляю…" : "Добавить"}
      </button>
    </form>
  );
}
