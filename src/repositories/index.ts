export * from './base'
export * from './authRepository'
export * from './userRepository'
export * from './categoryRepository'
export * from './brandRepository'
export * from './bannerRepository'
export * from './promoRepository'
export * from './productRepository'
export * from './reviewRepository'
export * from './messageRepository'
export * from './uploadRepository'
export * from './orderRepository'
export * from './notificationRepository'
export * from './blogRepository'
export * from './photoStudioRepository'
export * from './giftsRepository'

import { AuthRepository } from './authRepository'
import { UserRepository } from './userRepository'
import { CategoryRepository } from './categoryRepository'
import { BrandRepository } from './brandRepository'
import { BannerRepository } from './bannerRepository'
import { PromoRepository } from './promoRepository'
import { ProductRepository } from './productRepository'
import { ReviewRepository } from './reviewRepository'
import { MessageRepository } from './messageRepository'
import { UploadRepository } from './uploadRepository'
import { OrderRepository } from './orderRepository'
import { NotificationRepository } from './notificationRepository'
import { BlogRepository } from './blogRepository'
import { PhotoStudioRepository } from './photoStudioRepository'
import { GiftsRepository } from './giftsRepository'

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
}
