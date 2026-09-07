export interface Favorito {
  id?: string;
  user_id?: string;
  book_id: string;
  book_title: string;
  cover_url: string;
  nota: string;
  created_at?: string;
}
