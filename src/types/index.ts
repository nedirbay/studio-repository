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
}

export interface Brand {
  id: number
  name: string
  logo: string
}

export interface NavItem {
  label: string
  href: string
  children?: NavItem[]
}

export interface Comment {
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
