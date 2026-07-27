"use client";

export interface SortOption {
  value: string;
  label: string;
}

export default function FilterBar({
  search,
  onSearchChange,
  genre,
  onGenreChange,
  genreOptions,
  sortBy,
  onSortChange,
  sortOptions,
  resultCount,
}: {
  search: string;
  onSearchChange: (v: string) => void;
  genre: string;
  onGenreChange: (v: string) => void;
  genreOptions: string[];
  sortBy: string;
  onSortChange: (v: string) => void;
  sortOptions: SortOption[];
  resultCount: number;
}) {
  const hasActiveFilters = search.trim() !== "" || genre !== "";

  return (
    <div className="rounded-card bg-surface p-3">
      <div className="flex flex-col gap-2 sm:flex-row">
        <input
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Поиск по названию..."
          className="flex-1 rounded-card border border-line bg-bg px-3.5 py-2 text-sm text-ink placeholder:text-muted focus:border-marquee"
        />
        <select
          value={genre}
          onChange={(e) => onGenreChange(e.target.value)}
          className="rounded-card border border-line bg-bg px-3 py-2 text-sm text-ink focus:border-marquee sm:w-44"
        >
          <option value="">Все жанры</option>
          {genreOptions.map((g) => (
            <option key={g} value={g}>
              {g}
            </option>
          ))}
        </select>
        <select
          value={sortBy}
          onChange={(e) => onSortChange(e.target.value)}
          className="rounded-card border border-line bg-bg px-3 py-2 text-sm text-ink focus:border-marquee sm:w-48"
        >
          {sortOptions.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>

      {hasActiveFilters && (
        <div className="mt-2 flex items-center justify-between">
          <span className="text-xs text-muted">Найдено: {resultCount}</span>
          <button
            onClick={() => {
              onSearchChange("");
              onGenreChange("");
            }}
            className="text-xs font-medium text-marquee underline underline-offset-2"
          >
            Сбросить фильтры
          </button>
        </div>
      )}
    </div>
  );
}
