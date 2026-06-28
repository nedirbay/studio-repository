export * from './base'
export * from '../views/LoginPage/authRepository'
export * from '../views/admin/AdminUsers/userRepository'
export * from '../views/ProductsPage/categoryRepository'
export * from '../views/ProductsPage/brandRepository'
export * from '../views/HomePage/bannerRepository'
export * from '../views/HomePage/promoRepository'
export * from '../views/ProductsPage/productRepository'
export * from '../views/ProductDetailPage/reviewRepository'
export * from '../views/SupportPage/messageRepository'
export * from '../views/admin/AdminProducts/uploadRepository'
export * from '../views/admin/AdminOrders/orderRepository'
export * from '../views/ProfilePage/notificationRepository'
export * from '../views/BlogListPage/blogRepository'
export * from '../views/PhotoStudioPage/photoStudioRepository'
export * from '../views/GiftsPage/giftsRepository'
export * from './mobileAppRepository'

import { AuthRepository } from '../views/LoginPage/authRepository'
import { UserRepository } from '../views/admin/AdminUsers/userRepository'
import { CategoryRepository } from '../views/ProductsPage/categoryRepository'
import { BrandRepository } from '../views/ProductsPage/brandRepository'
import { BannerRepository } from '../views/HomePage/bannerRepository'
import { PromoRepository } from '../views/HomePage/promoRepository'
import { ProductRepository } from '../views/ProductsPage/productRepository'
import { ReviewRepository } from '../views/ProductDetailPage/reviewRepository'
import { MessageRepository } from '../views/SupportPage/messageRepository'
import { UploadRepository } from '../views/admin/AdminProducts/uploadRepository'
import { OrderRepository } from '../views/admin/AdminOrders/orderRepository'
import { NotificationRepository } from '../views/ProfilePage/notificationRepository'
import { BlogRepository } from '../views/BlogListPage/blogRepository'
import { PhotoStudioRepository } from '../views/PhotoStudioPage/photoStudioRepository'
import { GiftsRepository } from '../views/GiftsPage/giftsRepository'
import { MobileAppRepository } from './mobileAppRepository'

function memo<T>(factory: () => T): () => T {
  let value: T | undefined
  return () => (value ?? (value = factory()))
}

const _auth = memo(() => new AuthRepository())
const _users = memo(() => new UserRepository())
const _categories = memo(() => new CategoryRepository())
const _brands = memo(() => new BrandRepository())
const _banners = memo(() => new BannerRepository())
const _promos = memo(() => new PromoRepository())
const _products = memo(() => new ProductRepository())
const _reviews = memo(() => new ReviewRepository())
const _messages = memo(() => new MessageRepository())
const _uploads = memo(() => new UploadRepository())
const _orders = memo(() => new OrderRepository())
const _notifications = memo(() => new NotificationRepository())
const _blogs = memo(() => new BlogRepository())
const _photoStudio = memo(() => new PhotoStudioRepository())
const _gifts = memo(() => new GiftsRepository())
const _mobileApp = memo(() => new MobileAppRepository())

/**
 * Lazy singletons backed by the app's shared axios instance. Pages and
 * services use these; tests build their own instances with mocked
 * AxiosInstance, never touching this object.
 */
export const repositories = {
  get auth() { return _auth() },
  get users() { return _users() },
  get categories() { return _categories() },
  get brands() { return _brands() },
  get banners() { return _banners() },
  get promos() { return _promos() },
  get products() { return _products() },
  get reviews() { return _reviews() },
  get messages() { return _messages() },
  get uploads() { return _uploads() },
  get orders() { return _orders() },
  get notifications() { return _notifications() },
  get blogs() { return _blogs() },
  get photoStudio() { return _photoStudio() },
  get gifts() { return _gifts() },
  get mobileApp() { return _mobileApp() },
}
