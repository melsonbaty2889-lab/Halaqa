export type CurriculumCategory = 
  | 'quran' 
  | 'tajweed' 
  | 'aqeedah' 
  | 'fiqh' 
  | 'hadith' 
  | 'seerah' 
  | 'arabic' 
  | 'other';

export interface Curriculum {
  id: string;
  academy_id: string;
  description?: Record<string, any> | null;
  is_active: boolean;
  created_at?: string | null;
  category?: CurriculumCategory | string | null;
  code?: string | null;
  title: Record<string, any>; // JSONB للعنوان متعدد اللغات
}

export interface CurriculumFilters {
  searchTerm: string;
  category?: string;
  is_active?: boolean | 'all';
}
