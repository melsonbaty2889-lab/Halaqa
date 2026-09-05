export interface Parent {
  id: string;
  academy_id: string;
  name: string;
  phone: string;
  profile_id?: string | null;
  created_at: string;
  updated_at?: string | null;
  email?: string | null;
  country_code?: string | null;
  preferred_language?: string | null;
  metadata?: Record<string, any> | null;

  // العلاقات المجلوبة
  profiles?: {
    id: string;
    full_name?: string;
    avatar_url?: string;
  } | null;
}

export interface ParentFilters {
  searchTerm: string;
  preferred_language?: string;
}
