export interface Product {
  id: number
  name: string
  price: number
  originalPrice?: number
  image: string
  images?: string[]
  category: string
  badge?: 'new' | 'sale' | 'hot'
  rating: number
  reviews: number
  brand: string
  inStock: boolean
  description?: string
  features?: string[]
  specifications?: Record<string, string>
}

export interface User {
  id: number
  username: string
  email: string
  role_name: string
  is_superuser: boolean
  is_active: boolean
  date_joined?: string
  password?: string // Used for forms
}

export interface Category {
  id: number
  name: string
  icon: string
  count: number
  slug: string
}

export interface Banner {
  id: number
  title: string
  subtitle: string
  description: string
  image: string
  ctaText: string
  bgColor: string
  product_id?: number | null
}

export interface Brand {
  id: number
  name: string
  slug: string
  logo_url: string
}

export interface Promo {
  id: number
  title: string
  subtitle: string
  badge: string
  image: string
  link: string
  bgGradient: string
}

export interface NavItem {
  label: string
  href: string
  children?: NavItem[]
}

export interface ProductReview {
  id: number
  productId: number
  userId: number
  userName: string
  userAvatar?: string
  rating: number
  title: string
  content: string
  createdAt: string
  helpful: number
  images?: string[]
}

export interface CartItem {
  id: string // product.id + some unique key if needed, or just product.id
  product: Product
  quantity: number
}

export interface Order {
  id: number
  customer_name: string
  customer_phone: string
  total_amount: number
  paid_amount: number
  remaining_amount: number
  created_at: string
}

// ---------------------------------------------------------------------------
// PhotoStudio (Reels) types
// ---------------------------------------------------------------------------

export interface PhotoReelTag {
  id: number
  name: string
}

export interface PhotoReel {
  id: number
  category: number | null
  category_name?: string
  collection?: number | null
  author: number | null
  author_name?: string
  author_avatar?: string | null
  collection_id?: number | null
  collection_title?: string
  title?: string
  description?: string
  kind: 'video' | 'image'
  media_url: string
  thumbnail_url?: string
  stream_url?: string
  duration?: number
  music_title?: string
  views?: number
  is_published?: boolean
  tags?: PhotoReelTag[]
  likes_count?: number
  comments_count?: number
  shares_count?: number
  liked_by_me?: boolean
  created_at?: string
}

export interface PhotoReelComment {
  id: number
  reel: number
  user: number | null
  user_name: string
  user_avatar?: string | null
  text: string
  parent: number | null
  replies?: PhotoReelComment[]
  created_at: string
}

export interface PhotoCollection {
  id: number
  category: number | null
  category_name?: string
  title: string
  description?: string
  kind: 'video' | 'image'
  cover_url?: string
  is_published?: boolean
  sort_order?: number
  items_count: number
  items: PhotoReel[]
  created_at?: string
}

// ---------------------------------------------------------------------------
// Gifts / Campaigns types
// ---------------------------------------------------------------------------

export type CampaignType = 'giveaway' | 'promotion' | 'gift'
export type CampaignStatus = 'draft' | 'active' | 'finished' | 'cancelled'

export interface CampaignRule {
  id: number
  text: string
  order: number
}

export interface CampaignWinner {
  id: number
  campaign: number
  participant: number
  participant_name: string
  prize_title: string
  announced_at: string
}

export interface Campaign {
  id: number
  type: CampaignType
  title: string
  subtitle?: string
  description?: string
  image_url?: string
  banner_url?: string
  bg_gradient?: string
  prize_title?: string
  prize_value?: number | string
  prize_image?: string
  starts_at: string
  ends_at?: string | null
  rules?: string
  min_order_amount?: number | string
  discount_percent?: number
  promo_code?: string
  winners_count?: number
  is_featured?: boolean
  status: CampaignStatus
  rules_list?: CampaignRule[]
  winners?: CampaignWinner[]
  participants_count: number
  is_active: boolean
  joined_by_me?: boolean
  time_left_seconds?: number | null
  created_at?: string
}
