export type Language = 'en' | 'ru';

export type ScreenName = 'home' | 'detail' | 'register' | 'profile' | 'sell';

export type UniversityFilter = 'ALL' | 'KNU' | 'AUCA' | 'Manas University' | 'KRSU';

export type ProductCategory = 'All' | 'Textbooks' | 'Electronics' | 'Dorm Goods' | 'Other';

export type SortMode = 'recent' | 'price_asc' | 'price_desc';

export interface Profile {
  id: string;
  email: string;
  nickname: string;
  university: string;
  major: string;
  manner_temp: number;
  student_id_url?: string | null;
  is_verified: boolean;
  avatar_url?: string | null;
  avg_reply_mins?: number;
  handoffs_count?: number;
  earned_som?: number;
  created_at?: string;
}

export interface Product {
  id: string;
  seller_id: string | null;
  seller_name: string;
  seller_university: string;
  seller_major: string;
  seller_manner_temp: number;
  seller_avatar?: string | null;
  title: string;
  title_ru?: string | null;
  description: string;
  description_ru?: string | null;
  price: number;
  original_price?: number | null;
  category: Exclude<ProductCategory, 'All'>;
  university: string;
  meetup_spot: string;
  campus_quad?: string | null;
  course_tag?: string | null;
  condition_label?: string | null;
  language_label?: string | null;
  markings_label?: string | null;
  badge_text?: string | null;
  badge_type?: 'urgent' | 'dorm' | 'fast' | 'verified' | null;
  images: string[];
  status: 'active' | 'sold';
  likes_count: number;
  views_count: number;
  active_chats_count?: number;
  eyeing_count?: number;
  is_verified_seller: boolean;
  created_at: string;
}

export interface MeetupRequest {
  id?: string;
  product_id: string;
  buyer_id: string;
  seller_id: string | null;
  buyer_name: string;
  meetup_spot: string;
  proposed_time: string;
  message: string;
  status?: 'pending' | 'accepted' | 'completed';
  created_at?: string;
}
