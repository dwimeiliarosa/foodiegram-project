export interface Recipe {
  id: number;
  user_id: number;
  category_id: number;
  title: string;
  post_type: string;
  image_url: string | null; // Tambahkan ini (gunakan underscore sesuai database)
  video_url: string | null;
  ingredients: string[] | string;
  steps: string;
  cooking_time: number;
  protein: number;
  carbs: number;
  fat: number;
  views_count: number;
  status: string;
  username?: string; // Dari JOIN di backend
  category_name?: string; // Dari JOIN di backend
  is_liked?: boolean;
  is_saved?: boolean;
  created_at: string;
}