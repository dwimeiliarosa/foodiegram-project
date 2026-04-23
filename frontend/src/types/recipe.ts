export interface Recipe {
  id: number;
  title: string;
  image?: string;         
  views_count: number;    
  protein: number;        
  carbs?: number;
  fat?: number;
  username?: string;
}