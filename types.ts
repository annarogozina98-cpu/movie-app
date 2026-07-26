export interface MovieCore {
  id: string;
  title: string;
  year: string | null;
  genre: string | null;
  duration: string | null;
  imdb_rating: string | null;
  description: string | null;
  imdb_link: string | null;
  kinopoisk_link: string | null;
  enriched: boolean;
  created_at: string;
}

export interface ToWatchMovie extends MovieCore {}

export interface WatchedMovie extends MovieCore {
  our_rating: number | null;
  our_comment: string | null;
  watched_date: string | null;
}

export interface Recommendation extends MovieCore {
  status: "pending" | "rejected";
  reason: string | null;
}

export interface EnrichedFields {
  year: string;
  genre: string;
  duration: string;
  imdb_rating: string;
  description: string;
  imdb_link: string;
  kinopoisk_link: string;
}
