import { reactive, watch, computed } from 'vue'
import ServiceGenerate from '../utils/request'
import type { Product, Category, Banner, Brand, Promo, CartItem, Order, ProductReview, User } from '../types'

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
  cartDrawerOpen: boolean
  initialized: boolean
  loading: boolean
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
  cartDrawerOpen: false,
  initialized: false,
  loading: false
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
        this.fetchBrands()
      ])
      store.initialized = true
    } catch (error) {
      console.error('Failed to initialize store:', error)
    } finally {
      store.loading = false
    }
  },

  async fetchCategories() {
    try {
      const res = await service.get('/commerce/categories')
      store.categories = res.data
    } catch (error) {
      console.error('Failed to fetch categories:', error)
    }
  },

  async fetchBrands() {
    try {
      const res = await service.get('/commerce/brands')
      store.brands = res.data
    } catch (error) {
      console.error('Failed to fetch brands:', error)
    }
  },

  async fetchBanners() {
    try {
      const res = await service.get('/main/banners')
      store.banners = res.data.map((b: any) => ({
        id: b.id,
        title: b.title,
        subtitle: b.subtitle,
        description: b.description,
        image: b.image,
        ctaText: b.ctaText,
        bgColor: b.bgColor
      }))
    } catch (error) {
      console.error('Failed to fetch banners:', error)
    }
  },

  async fetchPromos() {
    try {
      const res = await service.get('/main/promos')
      store.promos = res.data
    } catch (error) {
      console.error('Failed to fetch promos:', error)
    }
  },

  async fetchProducts() {
    try {
      const res = await service.get('/commerce/products')
      // Map backend fields to frontend types
      store.products = res.data.map((p: any) => ({
        ...p,
        category: p.category_name,
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
      const res = await service.get('/main/orders')
      store.orders = res.data
    } catch (error) {
      console.error('Failed to fetch orders:', error)
    }
  },

  async fetchUsers() {
    try {
      const res = await service.get('/users/')
      store.users = res.data
    } catch (error) {
      console.error('Failed to fetch users:', error)
      throw error 
    }
  },

  async addUser(userData: any) {
    try {
      const res = await service.post('/users/', userData)
      await this.fetchUsers() // Refresh list
      return res.data
    } catch (error) {
      console.error('Failed to add user', error)
      throw error
    }
  },

  async updateUser(userId: number, userData: any) {
    try {
      const res = await service.put(`/users/${userId}/`, userData)
      await this.fetchUsers()
      return res.data
    } catch (error) {
      console.error('Failed to update user', error)
      throw error
    }
  },

  async deleteUser(userId: number) {
    try {
      const res = await service.delete(`/users/${userId}/`)
      await this.fetchUsers()
      return res.data
    } catch (error) {
      console.error('Failed to delete user', error)
      throw error
    }
  },

  async fetchAdminReviews() {
    try {
      const res = await service.get('/commerce/reviews')
      store.adminReviews = res.data
    } catch (error) {
      console.error('Failed to fetch admin reviews:', error)
      throw error 
    }
  },

  async deleteReview(reviewId: number) {
    try {
      const res = await service.delete(`/commerce/reviews/${reviewId}`)
      await this.fetchAdminReviews()
      return res.data
    } catch (error) {
      console.error('Failed to delete review', error)
      throw error
    }
  },

  async sendMessage(payload: { subject: string, message: string, product?: number }) {
    try {
      const res = await service.post('/commerce/messages', payload)
      return res.data
    } catch (error) {
      console.error('Failed to send message:', error)
      throw error
    }
  },

  // Notifications
  async fetchNotifications() {
    try {
      const res = await service.get('/notifications')
      store.notifications = res.data
    } catch (e) {
      console.error('Failed to fetch notifications', e)
    }
  },
  
  async markNotificationsRead() {
    try {
      await service.put('/notifications/read')
      store.notifications.forEach(n => n.is_read = true)
    } catch (e) {
      console.error('Failed to mark internal notifs read', e)
    }
  },

  async deleteNotification(id: number) {
    try {
      await service.delete(`/notifications/${id}`)
      store.notifications = store.notifications.filter(n => n.id !== id)
    } catch (e) {
      console.error('Failed to delete notification', e)
    }
  },

  // Admin Messages
  async fetchAdminMessages() {
    try {
      const res = await service.get('/commerce/messages')
      store.adminMessages = res.data
    } catch (e) {
      console.error('Failed to fetch admin messages', e)
    }
  },
  
  async replyToMessage(id: number, replyText: string) {
    try {
      const res = await service.put(`/commerce/messages/${id}`, { reply: replyText })
      await this.fetchAdminMessages()
      return res.data
    } catch (e) {
      console.error('Failed to reply to msg', e)
      throw e
    }
  },
  
  async deleteMessage(id: number) {
    try {
      await service.delete(`/commerce/messages/${id}`)
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
      const res = await service.post('/commerce/upload', formData, {
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
      await service.post('/commerce/products', product)
      await this.fetchProducts()
    } catch (error) {
      console.error('Failed to add product:', error)
    }
  },
  async updateProduct(product: any) {
    try {
      await service.put(`/commerce/products/${product.id}`, product)
      await this.fetchProducts()
    } catch (error) {
      console.error('Failed to update product:', error)
    }
  },
  async deleteProduct(id: number) {
    try {
      await service.delete(`/commerce/products/${id}`)
      await this.fetchProducts()
    } catch (error) {
      console.error('Failed to delete product:', error)
    }
  },

  async addCategory(category: any) {
    try {
      await service.post('/commerce/categories', category)
      await this.fetchCategories()
    } catch (error) {
      console.error('Failed to add category:', error)
    }
  },
  async updateCategory(_category: any) {
    console.warn('Update category not implemented in backend')
  },
  async deleteCategory(_id: number) {
    console.warn('Delete category not implemented in backend')
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
      const res = await service.post('/main/orders', {
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
  async register(userData: any) {
    try {
      const res = await service.post('/auth/register', userData)
      return res.data
    } catch (error) {
      console.error('Registration failed:', error)
      throw error
    }
  },

  async verifyOtp(otpData: { email: string; code: string }) {
    try {
      const res = await service.post('/auth/verify-otp', otpData)
      if (res.data.jwt) {
        localStorage.setItem('token', res.data.jwt)
        localStorage.setItem('user', JSON.stringify(res.data.user))
      }
      return res.data
    } catch (error) {
      console.error('OTP verification failed:', error)
      throw error
    }
  },

  async resendOtp(email: string) {
    try {
      const res = await service.post('/auth/resend-otp', { email })
      return res.data
    } catch (error) {
      console.error('Resend OTP failed:', error)
      throw error
    }
  },

  // Review Actions
  async fetchReviews(productId: number) {
    try {
      const res = await service.get(`/commerce/products/${productId}/reviews`)
      store.reviews = res.data
      return res.data
    } catch (error) {
      console.error('Failed to fetch reviews:', error)
    }
  },

  async submitReview(productId: number, reviewData: any) {
    try {
      const res = await service.post(`/commerce/products/${productId}/reviews`, reviewData)
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
  }
}
