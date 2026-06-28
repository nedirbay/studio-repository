import { reactive, watch, computed } from 'vue'
import ServiceGenerate from '../utils/request'
import type { Product, Category, Banner, Brand, Promo, CartItem, Order, ProductReview, User, PhotoReel, PhotoReelComment, PhotoCollection, Campaign } from '../types'

const service = ServiceGenerate()
const STORAGE_KEY = 'doganlar_store_data'

interface StoreState {
  products: Product[]
  categories: Category[]
  promos: Promo[]
  banners: Banner[]
  brands: Brand[]
  cart: CartItem[]
  orders: Order[]
  reviews: ProductReview[]
  adminReviews: any[]
  users: User[]
  adminMessages: any[]
  notifications: any[]
  blogs: any[]
  blogTotalCount: number
  selectedBlog: any | null
  cartDrawerOpen: boolean
  initialized: boolean
  isAuthenticated: boolean
  user: User | null
  loading: boolean
  reels: PhotoReel[]
  studioCollections: PhotoCollection[]
  studioComments: PhotoReelComment[]
  campaigns: Campaign[]
}

// Load initial state from localStorage if exists
const savedData = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}')

export const store = reactive<StoreState>({
  products: [],
  categories: [],
  promos: [],
  banners: [],
  brands: [],
  cart: savedData.cart || [],
  orders: [],
  reviews: [],
  adminReviews: [],
  users: [],
  adminMessages: [],
  notifications: [],
  blogs: [],
  blogTotalCount: 0,
  selectedBlog: null,
  cartDrawerOpen: false,
  initialized: false,
  isAuthenticated: !!localStorage.getItem('token'),
  user: localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')!) : null,
  loading: false,
  reels: [],
  studioCollections: [],
  studioComments: [],
  campaigns: []
})

// Persistence
watch(
  () => ({
    products: store.products,
    categories: store.categories,
    cart: store.cart,
  }),
  (state) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  },
  { deep: true }
)

// Listen for unauthorized events to clear store state without circular imports
if (typeof window !== 'undefined') {
  window.addEventListener('unauthorized', () => {
    store.isAuthenticated = false
    store.user = null
  })
}


// Computed helpers
export const cartCount = computed(() => store.cart.reduce((total: number, item: CartItem) => total + item.quantity, 0))
export const cartTotal = computed(() => store.cart.reduce((total: number, item: CartItem) => total + (item.product.price * item.quantity), 0))

// Actions
export const actions = {
  async initialize() {
    if (store.initialized) return
    store.loading = true
    try {
      await Promise.all([
        this.fetchCategories(),
        this.fetchProducts(),
        this.fetchBanners(),
        this.fetchPromos(),
        this.fetchBrands(),
        this.fetchBlogs()
      ])
      store.initialized = true
      connectAdminWebsocket()
    } catch (error) {
      console.error('Failed to initialize store:', error)
    } finally {
      store.loading = false
    }
  },

  async fetchCategories() {
    try {
      const res = await service.get('commerce/categories')
      store.categories = res.data
    } catch (error) {
      console.error('Failed to fetch categories:', error)
    }
  },

  async fetchBrands() {
    try {
      const res = await service.get('commerce/brands')
      store.brands = res.data
    } catch (error) {
      console.error('Failed to fetch brands:', error)
    }
  },

  async fetchBanners() {
    try {
      const res = await service.get('banners')
      store.banners = res.data.map((b: any) => ({
        id: b.id,
        title: b.title,
        subtitle: b.subtitle,
        description: b.description,
        image: b.image,
        ctaText: b.ctaText,
        bgColor: b.bgColor,
        product_id: b.product_id ?? b.productId ?? null
      }))
    } catch (error) {
      console.error('Failed to fetch banners:', error)
    }
  },

  async fetchPromos() {
    try {
      const res = await service.get('promos')
      store.promos = res.data
    } catch (error) {
      console.error('Failed to fetch promos:', error)
    }
  },

  async addBanner(bannerData: any) {
    try {
      await service.post('banners', bannerData)
      this.fetchBanners()
    } catch (error) {
      console.error('Failed to add banner:', error)
      throw error
    }
  },

  async updateBanner(bannerData: any) {
    try {
      await service.put('banners', bannerData)
      this.fetchBanners()
    } catch (error) {
      console.error('Failed to update banner:', error)
      throw error
    }
  },

  async deleteBanner(id: number) {
    try {
      await service.delete('banners', { data: { id } })
      this.fetchBanners()
    } catch (error) {
      console.error('Failed to delete banner:', error)
      throw error
    }
  },

  async fetchProducts() {
    try {
      const res = await service.get('commerce/products')
      // Map backend fields to frontend types
      store.products = res.data.map((p: any) => ({
        ...p,
        category: p.category_name,
        brand: p.marka,
        image: p.media.length > 0 ? p.media[0].url : '',
        images: p.media.map((m: any) => m.url),
        inStock: p.instock,
        originalPrice: p.original_price
      }))
    } catch (error) {
      console.error('Failed to fetch products:', error)
    }
  },

  async fetchOrders() {
    try {
      const res = await service.get('orders')
      store.orders = res.data
    } catch (error) {
      console.error('Failed to fetch orders:', error)
    }
  },

  async fetchUsers() {
    try {
      const res = await service.get('users/')
      store.users = res.data
    } catch (error) {
      console.error('Failed to fetch users:', error)
      throw error 
    }
  },

  async addUser(userData: any) {
    try {
      const res = await service.post('users/', userData)
      await this.fetchUsers() // Refresh list
      return res.data
    } catch (error) {
      console.error('Failed to add user', error)
      throw error
    }
  },

  async updateUser(userId: number, userData: any) {
    try {
      const res = await service.put(`users/${userId}/`, userData)
      await this.fetchUsers()
      return res.data
    } catch (error) {
      console.error('Failed to update user', error)
      throw error
    }
  },

  async deleteUser(userId: number) {
    try {
      const res = await service.delete(`users/${userId}/`)
      await this.fetchUsers()
      return res.data
    } catch (error) {
      console.error('Failed to delete user', error)
      throw error
    }
  },

  async fetchAdminReviews() {
    try {
      const res = await service.get('commerce/reviews')
      store.adminReviews = res.data
    } catch (error) {
      console.error('Failed to fetch admin reviews:', error)
      throw error 
    }
  },

  async deleteReview(reviewId: number) {
    try {
      const res = await service.delete(`commerce/reviews/${reviewId}`)
      await this.fetchAdminReviews()
      return res.data
    } catch (error) {
      console.error('Failed to delete review', error)
      throw error
    }
  },

  async sendMessage(payload: { subject: string, message: string, product?: number }) {
    try {
      const res = await service.post('commerce/messages', payload)
      return res.data
    } catch (error) {
      console.error('Failed to send message:', error)
      throw error
    }
  },

  // Notifications
  async fetchNotifications() {
    try {
      const res = await service.get('notifications')
      store.notifications = res.data
    } catch (e) {
      console.error('Failed to fetch notifications', e)
    }
  },
  
  async markNotificationsRead() {
    try {
      await service.put('notifications/read')
      store.notifications.forEach(n => n.is_read = true)
    } catch (e) {
      console.error('Failed to mark internal notifs read', e)
    }
  },

  async deleteNotification(id: number) {
    try {
      await service.delete(`notifications/${id}`)
      store.notifications = store.notifications.filter(n => n.id !== id)
    } catch (e) {
      console.error('Failed to delete notification', e)
    }
  },

  // Admin Messages
  async fetchAdminMessages() {
    try {
      const res = await service.get('commerce/messages')
      store.adminMessages = res.data
    } catch (e) {
      console.error('Failed to fetch admin messages', e)
    }
  },
  
  async replyToMessage(id: number, replyText: string) {
    try {
      const res = await service.put(`commerce/messages/${id}`, { reply: replyText })
      await this.fetchAdminMessages()
      return res.data
    } catch (e) {
      console.error('Failed to reply to msg', e)
      throw e
    }
  },
  
  async deleteMessage(id: number) {
    try {
      await service.delete(`commerce/messages/${id}`)
      await this.fetchAdminMessages()
    } catch (e) {
      console.error('Failed to delete msg', e)
      throw e
    }
  },

  async uploadImage(file: File) {
    const formData = new FormData()
    formData.append('file', file)
    try {
      const res = await service.post('commerce/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      return res.data.url // Returns the full URL
    } catch (e) {
      console.error('Upload failed', e)
      throw e
    }
  },

  // CRUD Actions
  async addProduct(product: any) {
    try {
      await service.post('commerce/products', product)
      await this.fetchProducts()
    } catch (error) {
      console.error('Failed to add product:', error)
    }
  },
  async updateProduct(product: any) {
    try {
      await service.put(`commerce/products/${product.id}`, product)
      await this.fetchProducts()
    } catch (error) {
      console.error('Failed to update product:', error)
    }
  },
  async deleteProduct(id: number) {
    try {
      await service.delete(`commerce/products/${id}`)
      await this.fetchProducts()
    } catch (error) {
      console.error('Failed to delete product:', error)
    }
  },

  async addCategory(category: any) {
    try {
      await service.post('commerce/categories', category)
      await this.fetchCategories()
    } catch (error) {
      console.error('Failed to add category:', error)
    }
  },
  async updateCategory(category: any) {
    try {
      await service.put(`commerce/categories/${category.id}`, category)
      await this.fetchCategories()
    } catch (error) {
      console.error('Failed to update category:', error)
    }
  },
  async deleteCategory(id: number) {
    try {
      await service.delete(`commerce/categories/${id}`)
      await this.fetchCategories()
    } catch (error) {
      console.error('Failed to delete category:', error)
    }
  },
  async addBrand(brand: any) {
    try {
      await service.post('commerce/brands', brand)
      await this.fetchBrands()
    } catch (error) {
      console.error('Failed to add brand:', error)
    }
  },
  async updateBrand(brand: any) {
    try {
      await service.put(`commerce/brands/${brand.id}`, brand)
      await this.fetchBrands()
    } catch (error) {
      console.error('Failed to update brand:', error)
    }
  },
  async deleteBrand(id: number) {
    try {
      await service.delete(`commerce/brands/${id}`)
      await this.fetchBrands()
    } catch (error) {
      console.error('Failed to delete brand:', error)
    }
  },

  // Cart Actions
  addToCart(product: Product, qty: number = 1) {
    const existing = store.cart.find((item: CartItem) => item.product.id === product.id)
    if (existing) {
      existing.quantity += qty
    } else {
      store.cart.push({
        id: product.id.toString(),
        product,
        quantity: qty
      })
    }
    // Automatically open drawer to show feedback
    store.cartDrawerOpen = true
  },

  removeFromCart(productId: number) {
    store.cart = store.cart.filter((item: CartItem) => item.product.id !== productId)
  },

  updateQuantity(productId: number, qty: number) {
    const item = store.cart.find((i: CartItem) => i.product.id === productId)
    if (item) {
      item.quantity = Math.max(1, qty)
    }
  },

  clearCart() {
    store.cart = []
  },

  toggleCartDrawer(open?: boolean) {
    store.cartDrawerOpen = open !== undefined ? open : !store.cartDrawerOpen
  },

  async submitOrder(orderData: any) {
    try {
      const res = await service.post('orders', {
        ...orderData,
        total_amount: cartTotal.value,
        paid_amount: 0 // New order, not yet paid
      })
      this.clearCart()
      return res.data
    } catch (error) {
      console.error('Failed to submit order:', error)
      throw error
    }
  },

  // Auth & OTP Actions
  async login(loginData: any) {
    try {
      const res = await service.post('auth/login', loginData)
      if (res.data.jwt) {
        localStorage.setItem('token', res.data.jwt)
        localStorage.setItem('user', JSON.stringify(res.data.user))
        store.isAuthenticated = true
        store.user = res.data.user
        connectAdminWebsocket()
      }
      return res.data
    } catch (error) {
      console.error('Login failed:', error)
      throw error
    }
  },

  async googleLogin(credential: string) {
    try {
      const res = await service.post('auth/google', { credential })
      if (res.data.jwt) {
        localStorage.setItem('token', res.data.jwt)
        localStorage.setItem('user', JSON.stringify(res.data.user))
        store.isAuthenticated = true
        store.user = res.data.user
        connectAdminWebsocket()
      }
      return res.data
    } catch (error) {
      console.error('Google login failed:', error)
      throw error
    }
  },

  async register(userData: any) {
    try {
      const res = await service.post('auth/register', userData)
      return res.data
    } catch (error) {
      console.error('Registration failed:', error)
      throw error
    }
  },

  async verifyOtp(otpData: { email: string; code: string }) {
    try {
      const res = await service.post('auth/verify-otp', otpData)
      if (res.data.jwt) {
        localStorage.setItem('token', res.data.jwt)
        localStorage.setItem('user', JSON.stringify(res.data.user))
        store.isAuthenticated = true
        store.user = res.data.user
        connectAdminWebsocket()
      }
      return res.data
    } catch (error) {
      console.error('OTP verification failed:', error)
      throw error
    }
  },

  logout() {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    store.isAuthenticated = false
    store.user = null
    disconnectAdminWebsocket()
  },

  async resendOtp(email: string) {
    try {
      const res = await service.post('auth/resend-otp', { email })
      return res.data
    } catch (error) {
      console.error('Resend OTP failed:', error)
      throw error
    }
  },

  async forgotPassword(email: string) {
    try {
      const res = await service.post('auth/forgot-password', { email })
      return res.data
    } catch (error) {
      console.error('Forgot password failed:', error)
      throw error
    }
  },

  async resetPassword(payload: any) {
    try {
      const res = await service.post('auth/reset-password', payload)
      return res.data
    } catch (error) {
      console.error('Reset password failed:', error)
      throw error
    }
  },

  // Review Actions
  async fetchReviews(productId: number) {
    try {
      const res = await service.get(`commerce/products/${productId}/reviews`)
      store.reviews = res.data
      return res.data
    } catch (error) {
      console.error('Failed to fetch reviews:', error)
    }
  },

  async submitReview(productId: number, reviewData: any) {
    try {
      const res = await service.post(`commerce/products/${productId}/reviews`, reviewData)
      // Add new review to top of list
      store.reviews.unshift(res.data)
      
      // Update the local product's rating/review count if it's currently in product list
      const product = store.products.find(p => p.id === productId)
      if (product) {
        product.reviews++
        // Approximate new rating
        const totalRating = (product.rating * (product.reviews - 1)) + reviewData.rating
        product.rating = totalRating / product.reviews
      }
      
      return res.data
    } catch (error) {
      console.error('Failed to submit review:', error)
      throw error
    }
  },

  // Blog Actions
  async fetchBlogs(page: number = 1, pageSize: number = 3) {
    try {
      const res = await service.get(`blogs?page=${page}&page_size=${pageSize}`)
      store.blogs = res.data.results
      store.blogTotalCount = res.data.count
    } catch (error) {
      console.error('Failed to fetch blogs:', error)
    }
  },

  async fetchBlogBySlug(slug: string) {
    try {
      const res = await service.get(`blogs/${slug}`)
      store.selectedBlog = res.data
      return res.data
    } catch (error) {
      console.error(`Failed to fetch blog ${slug}:`, error)
      throw error
    }
  },

  async createBlogPost(data: any) {
    try {
      const res = await service.post('blogs', data)
      await this.fetchBlogs()
      return res.data
    } catch (error) {
      console.error('Failed to create blog post:', error)
      throw error
    }
  },

  async updateBlogPost(slug: string, data: any) {
    try {
      const res = await service.put(`blogs/${slug}`, data)
      await this.fetchBlogs()
      return res.data
    } catch (error) {
      console.error(`Failed to update blog post ${slug}:`, error)
      throw error
    }
  },

  async deleteBlogPost(slug: string) {
    try {
      await service.delete(`blogs/${slug}`)
      await this.fetchBlogs()
    } catch (error) {
      console.error(`Failed to delete blog post ${slug}:`, error)
      throw error
    }
  }
}

// ---------------------------------------------------------------------------
// PhotoStudio (Reels) actions
// ---------------------------------------------------------------------------

export const photoStudioActions = {
  async fetchCollections(kind?: 'video' | 'image') {
    try {
      const params = kind ? { kind } : undefined
      const res = await service.get('photostudio/collections/', { params })
      const list: PhotoCollection[] = Array.isArray(res.data) ? res.data : (res.data.results || [])
      store.studioCollections = list.map(c => ({ ...c, items: c.items || [] }))
      return store.studioCollections
    } catch (error) {
      console.error('Failed to fetch studio collections:', error)
      return []
    }
  },

  resetCollectionItems(collectionId: number) {
    const collection = store.studioCollections.find(c => c.id === collectionId)
    if (collection) collection.items = []
  },

  async fetchCollectionItem(collectionId: number, offset: number = 0, limit: number = 1) {
    try {
      const res = await service.get(`photostudio/collections/${collectionId}/items/`, {
        params: { offset, limit }
      })
      const data = res.data
      const items: PhotoReel[] = Array.isArray(data)
        ? data
        : (data.results || data.items || [])
      const total: number | undefined = data?.count ?? data?.total

      const collection = store.studioCollections.find(c => c.id === collectionId)
      if (collection) {
        const existingIds = new Set(collection.items.map(i => i.id))
        const fresh = items.filter(i => !existingIds.has(i.id))
        collection.items = [...collection.items, ...fresh]
        if (typeof total === 'number') collection.items_count = total

        const reelIds = new Set(store.reels.map(r => r.id))
        const freshReels = fresh.filter(i => !reelIds.has(i.id))
        if (freshReels.length) store.reels = [...store.reels, ...freshReels]
      }
      return items
    } catch (error) {
      console.error('Failed to fetch collection item:', error)
      return []
    }
  },

  async fetchReels(opts: { append?: boolean; category?: number } = {}) {
    try {
      const params: any = {}
      if (opts.category) params.category = opts.category
      const res = await service.get('photostudio/reels/', { params })
      const list: PhotoReel[] = Array.isArray(res.data) ? res.data : (res.data.results || [])
      if (opts.append) {
        const existingIds = new Set(store.reels.map(r => r.id))
        const fresh = list.filter(r => !existingIds.has(r.id))
        store.reels = [...store.reels, ...fresh]
      } else {
        store.reels = list
      }
      return list
    } catch (error) {
      console.error('Failed to fetch reels:', error)
      return []
    }
  },

  async registerView(reelId: number) {
    try {
      await service.post(`photostudio/reels/${reelId}/view/`)
    } catch (_e) {
      /* ignore */
    }
  },

  async toggleLike(reelId: number) {
    try {
      const res = await service.post(`photostudio/reels/${reelId}/like/`)
      const apply = (reel: PhotoReel) => {
        reel.liked_by_me = res.data.liked
        reel.likes_count = res.data.likes_count
      }
      const reel = store.reels.find(r => r.id === reelId)
      if (reel) apply(reel)
      store.studioCollections.forEach(collection => {
        const item = collection.items.find(r => r.id === reelId)
        if (item) apply(item)
      })
    } catch (error) {
      console.error('Failed to toggle like:', error)
    }
  },

  async fetchComments(reelId: number) {
    try {
      const res = await service.get(`photostudio/reels/${reelId}/comments/`)
      store.studioComments = res.data
      return res.data
    } catch (error) {
      console.error('Failed to fetch comments:', error)
      return []
    }
  },

  async addComment(reelId: number, text: string, parent: number | null = null) {
    try {
      const res = await service.post(`photostudio/reels/${reelId}/comments/`, { text, parent })
      store.studioComments.unshift(res.data)
      const apply = (reel: PhotoReel) => {
        reel.comments_count = (reel.comments_count || 0) + 1
      }
      const reel = store.reels.find(r => r.id === reelId)
      if (reel) apply(reel)
      store.studioCollections.forEach(collection => {
        const item = collection.items.find(r => r.id === reelId)
        if (item) apply(item)
      })
      return res.data
    } catch (error) {
      console.error('Failed to add comment:', error)
      throw error
    }
  },

  async shareReel(reelId: number, channel: string = '') {
    try {
      const res = await service.post(`photostudio/reels/${reelId}/share/`, { channel })
      const apply = (reel: PhotoReel) => {
        reel.shares_count = res.data.shares_count
      }
      const reel = store.reels.find(r => r.id === reelId)
      if (reel) apply(reel)
      store.studioCollections.forEach(collection => {
        const item = collection.items.find(r => r.id === reelId)
        if (item) apply(item)
      })
    } catch (error) {
      console.error('Failed to share reel:', error)
    }
  },
}

// ---------------------------------------------------------------------------
// Gifts / Campaigns actions
// ---------------------------------------------------------------------------

export const giftsActions = {
  async fetchCampaigns(filters: { type?: string; status?: string } = {}) {
    try {
      const res = await service.get('gifts/campaigns/', { params: filters })
      const list: Campaign[] = Array.isArray(res.data) ? res.data : (res.data.results || [])
      store.campaigns = list
      return list
    } catch (error) {
      console.error('Failed to fetch campaigns:', error)
      return []
    }
  },

  async joinCampaign(campaignId: number, payload: { full_name: string; phone: string; email?: string; note?: string }) {
    try {
      const res = await service.post(`gifts/campaigns/${campaignId}/join/`, payload)
      const campaign = store.campaigns.find(c => c.id === campaignId)
      if (campaign) {
        campaign.joined_by_me = true
        campaign.participants_count = (campaign.participants_count || 0) + 1
      }
      return res.data
    } catch (error) {
      console.error('Failed to join campaign:', error)
      throw error
    }
  },

  async fetchFeatured() {
    try {
      const res = await service.get('gifts/campaigns/featured/')
      return res.data
    } catch (error) {
      console.error('Failed to fetch featured campaigns:', error)
      return []
    }
  },

  async createCampaign(data: any) {
    try {
      const res = await service.post('gifts/campaigns/', data)
      await this.fetchCampaigns({ status: 'all' })
      return res.data
    } catch (error) {
      console.error('Failed to create campaign:', error)
      throw error
    }
  },

  async updateCampaign(id: number, data: any) {
    try {
      const res = await service.put(`gifts/campaigns/${id}/`, data)
      await this.fetchCampaigns({ status: 'all' })
      return res.data
    } catch (error) {
      console.error('Failed to update campaign:', error)
      throw error
    }
  },

  async deleteCampaign(id: number) {
    try {
      await service.delete(`gifts/campaigns/${id}/`)
      await this.fetchCampaigns({ status: 'all' })
    } catch (error) {
      console.error('Failed to delete campaign:', error)
      throw error
    }
  },

  async fetchCampaignParticipants(campaignId: number) {
    try {
      const res = await service.get(`gifts/campaigns/${campaignId}/join/`)
      return res.data
    } catch (error) {
      console.error('Failed to fetch campaign participants:', error)
      return []
    }
  },

  async updateParticipantStatus(id: number, status: string) {
    try {
      const res = await service.patch(`gifts/participations/${id}/`, { status })
      return res.data
    } catch (error) {
      console.error('Failed to update participant status:', error)
      throw error
    }
  }
}

let socket: WebSocket | null = null

export function connectAdminWebsocket() {
  const token = localStorage.getItem('token')
  if (!token) return

  if (socket && (socket.readyState === WebSocket.OPEN || socket.readyState === WebSocket.CONNECTING)) {
    return
  }

  const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
  const wsHost = import.meta.env.PROD
    ? window.location.host
    : '127.0.0.1:8000'
  const wsUrl = `${wsProtocol}//${wsHost}/ws/orders/${token ? '?token=' + token : ''}`

  socket = new WebSocket(wsUrl)

  socket.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data)
      if (data.type === 'main_order.created') {
        const exists = store.orders.some(o => o.id === data.order.id)
        if (!exists) {
          store.orders.unshift(data.order)
        }
      } else if (data.type === 'main_order.updated') {
        const idx = store.orders.findIndex(o => o.id === data.order.id)
        if (idx !== -1) {
          store.orders[idx] = { ...store.orders[idx], ...data.order }
        }
      } else if (data.type === 'main_order.deleted') {
        store.orders = store.orders.filter(o => o.id !== data.order_id)
      } else if (data.type === 'message.created') {
        const exists = store.adminMessages.some(m => m.id === data.message.id)
        if (!exists) {
          store.adminMessages.unshift(data.message)
        }
      } else if (data.type === 'message.updated') {
        const idx = store.adminMessages.findIndex(m => m.id === data.message.id)
        if (idx !== -1) {
          store.adminMessages[idx] = { ...store.adminMessages[idx], ...data.message }
        }
      } else if (data.type === 'message.deleted') {
        store.adminMessages = store.adminMessages.filter(m => m.id !== data.message_id)
      }
    } catch (e) {
      console.error('Error parsing admin WebSocket message', e)
    }
  }

  socket.onclose = () => {
    console.log('Admin WebSocket connection closed, reconnecting in 5s...')
    setTimeout(connectAdminWebsocket, 5000)
  }

  socket.onerror = (err) => {
    console.error('Admin WebSocket error:', err)
  }
}

export function disconnectAdminWebsocket() {
  if (socket) {
    socket.close()
    socket = null
  }
}
