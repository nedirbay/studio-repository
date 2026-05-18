import { createRouter, createWebHistory } from 'vue-router'
import { ElMessage } from 'element-plus'
import type { User } from '../types'
import EntryPage from '../views/EntryPage/EntryPage.vue'
import HomePage from '../views/HomePage/HomePage.vue'
import ProductsPage from '../views/ProductsPage/ProductsPage.vue'
import ProductDetailPage from '../views/ProductDetailPage/ProductDetailPage.vue'
import DealsPage from '../views/DealsPage/DealsPage.vue'
import NewArrivalsPage from '../views/NewArrivalsPage/NewArrivalsPage.vue'
import SupportPage from '../views/SupportPage/SupportPage.vue'
import ProfilePage from '../views/ProfilePage/ProfilePage.vue'

const routes = [
  {
    path: '/',
    name: 'Entry',
    component: EntryPage,
    meta: { hideLayout: true }
  },
  {
    path: '/home',
    name: 'Home',
    component: HomePage
  },
  {
    path: '/studio',
    name: 'PhotoStudio',
    component: () => import('../views/PhotoStudioPage/PhotoStudioPage.vue')
  },
  {
    path: '/gifts',
    name: 'Gifts',
    component: () => import('../views/GiftsPage/GiftsPage.vue')
  },
  {
    path: '/profile',
    name: 'Profile',
    component: ProfilePage,
    meta: { requiresAuth: true }
  },
  {
    path: '/products',
    name: 'Products',
    component: ProductsPage
  },
  {
    path: '/products/:category',
    name: 'ProductsByCategory',
    component: ProductsPage
  },
  {
    path: '/product/:id',
    name: 'ProductDetail',
    component: ProductDetailPage
  },
  {
    path: '/deals',
    name: 'Deals',
    component: DealsPage
  },
  {
    path: '/new-arrivals',
    name: 'NewArrivals',
    component: NewArrivalsPage
  },
  {
    path: '/support',
    name: 'Support',
    component: SupportPage
  },
  {
    path: '/about',
    name: 'About',
    component: () => import('../views/AboutPage/AboutPage.vue')
  },
  {
    path: '/blog',
    name: 'BlogList',
    component: () => import('../views/BlogListPage/BlogListPage.vue')
  },
  {
    path: '/blog/:slug',
    name: 'BlogDetail',
    component: () => import('../views/BlogDetailPage/BlogDetailPage.vue')
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/LoginPage/LoginPage.vue'),
    meta: { hideLayout: true }
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('../views/RegisterPage/RegisterPage.vue'),
    meta: { hideLayout: true }
  },
  {
    path: '/forgot-password',
    name: 'ForgotPassword',
    component: () => import('../views/ForgotPasswordPage/ForgotPasswordPage.vue'),
    meta: { hideLayout: true }
  },
  {
    path: '/admin',
    component: () => import('../components/layout/AdminLayout.vue'),
    meta: { requiresAuth: true },
    redirect: '/admin/dashboard',
    children: [
      {
        path: 'dashboard',
        name: 'AdminDashboard',
        component: () => import('../views/admin/AdminDashboard/AdminDashboard.vue')
      },
      {
        path: 'categories',
        name: 'AdminCategories',
        component: () => import('../views/admin/AdminCategories/AdminCategories.vue')
      },
      {
        path: 'products',
        name: 'AdminProducts',
        component: () => import('../views/admin/AdminProducts/AdminProducts.vue')
      },
      {
        path: 'users',
        name: 'AdminUsers',
        component: () => import('../views/admin/AdminUsers/AdminUsers.vue')
      },
      {
        path: 'reviews',
        name: 'AdminReviews',
        component: () => import('../views/admin/AdminReviews/AdminReviews.vue'),
        meta: { title: 'Teswirler' }
      },
      {
        path: 'messages',
        name: 'AdminMessages',
        component: () => import('../views/admin/AdminMessages/AdminMessages.vue'),
        meta: { title: 'Müşderi Hatlary' }
      },
      {
        path: 'orders',
        name: 'AdminOrders',
        component: () => import('../views/admin/AdminOrders/AdminOrders.vue')
      },
      {
        path: 'banners',
        name: 'AdminBanners',
        component: () => import('../views/admin/AdminBanners/AdminBanners.vue')
      },
      {
        path: 'blogs',
        name: 'AdminBlogs',
        component: () => import('../views/admin/AdminBlogs/AdminBlogs.vue')
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, _from, next) => {
  const token = localStorage.getItem('token')
  let user = {}
  try {
    const rawUser = localStorage.getItem('user')
    user = rawUser ? JSON.parse(rawUser) : {}
  } catch (err) {
    console.error('Failed to parse user from localStorage', err)
    user = {}
  }

  const requiresAuth = to.matched.some(record => record.meta.requiresAuth)
  const isAdminRoute = to.path.startsWith('/admin')

  if (requiresAuth && !token) {
    next({ path: '/login', query: { redirect: to.fullPath } })
  } else if (isAdminRoute) {
    const u = user as User
    if (u.role_name === 'Admin' || u.is_superuser) {
      next()
    } else {
      ElMessage.warning('Bu sahypa diňe administratorlar üçin')
      next('/')
    }
  } else if (to.path === '/login' && token) {
    const redirectPath = to.query.redirect as string || '/'
    next(redirectPath)
  } else {
    next()
  }
})

export default router
